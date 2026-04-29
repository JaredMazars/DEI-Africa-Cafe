/**
 * /api/matching
 *
 * Real schema:
 *   connections.expert_id → experts.id
 *   connections.requester_id → users.id
 *   So the 'id' returned for each mentor must be experts.id (for connection creation)
 */
import express from 'express';
import auth from '../middleware/auth.js';
import UserProfile from '../models/UserProfile.js';
import UserDesiredExpertise from '../models/UserDesiredExpertise.js';
import UserExpertise from '../models/UserExpertise.js';
import { executeQuery } from '../config/database.js';

const router = express.Router();

// ── Similar-field clusters (bidirectional) ───────────────────────────────────
// If an exact match isn't found, a field in the same cluster scores ~65%
const SIMILAR_FIELDS = {
    // Forvis Mazars professional categories
    'Data Analytics':              ['Technology & Digital', 'Strategy & Transformation', 'Software Development'],
    'Technology & Digital':        ['Data Analytics', 'Strategy & Transformation', 'Software Development', 'Technology', 'Software Engineering'],
    'Tax Advisory':                ['Audit & Assurance', 'Accounting & Reporting', 'Corporate Finance', 'Cross-border Taxation', 'Transfer Pricing'],
    'Audit & Assurance':           ['Tax Advisory', 'Accounting & Reporting', 'Risk Advisory', 'Financial Auditing'],
    'Corporate Finance':           ['Deals & Transactions', 'Accounting & Reporting', 'Tax Advisory', 'Project Finance'],
    'Accounting & Reporting':      ['Audit & Assurance', 'Tax Advisory', 'Corporate Finance'],
    'Risk Advisory':               ['Legal & Compliance', 'Audit & Assurance', 'Risk Management', 'Regulatory Compliance'],
    'Legal & Compliance':          ['Risk Advisory', 'Regulatory Compliance', 'Risk Management'],
    'ESG & Sustainability':        ['Strategy & Transformation', 'HR & Talent Management', 'ESG Advisory'],
    'ESG Advisory':                ['ESG & Sustainability', 'Strategy & Transformation'],
    'Strategy & Transformation':   ['Technology & Digital', 'Data Analytics', 'ESG & Sustainability', 'Deals & Transactions', 'Leadership', 'Leadership & Management'],
    'Deals & Transactions':        ['Corporate Finance', 'Strategy & Transformation', 'Project Finance'],
    'HR & Talent Management':      ['DEI & Inclusion', 'Strategy & Transformation', 'Leadership', 'Leadership & Management', 'Career Development'],
    'DEI & Inclusion':             ['HR & Talent Management'],
    // General / user-set categories
    'Leadership':                  ['Leadership & Management', 'HR & Talent Management', 'Strategy & Transformation', 'DEI & Inclusion'],
    'Leadership & Management':     ['Leadership', 'HR & Talent Management', 'Strategy & Transformation'],
    'Career Development':          ['HR & Talent Management', 'Education & Training', 'Strategy & Transformation', 'Leadership', 'Leadership & Management'],
    'Education & Training':        ['Career Development', 'HR & Talent Management'],
    'Software Development':        ['Technology & Digital', 'Data Analytics', 'Software Engineering', 'Technology'],
    'Software Engineering':        ['Software Development', 'Technology & Digital', 'Data Analytics', 'Technology'],
    'Technology':                  ['Technology & Digital', 'Software Development', 'Data Analytics'],
    'Marketing & Communications':  ['Strategy & Transformation', 'DEI & Inclusion'],
    'Entrepreneurship':            ['Strategy & Transformation', 'Career Development', 'Deals & Transactions'],
    'Healthcare Management':       ['HR & Talent Management', 'Strategy & Transformation'],
    'Infrastructure Development':  ['Project Finance', 'Deals & Transactions'],
    'Project Finance':             ['Corporate Finance', 'Infrastructure Development', 'Deals & Transactions'],
    'Fintech Strategy':            ['Technology & Digital', 'Data Analytics', 'Strategy & Transformation'],
    'Digital Payments':            ['Technology & Digital', 'Fintech Strategy'],
    'Risk Management':             ['Risk Advisory', 'Legal & Compliance', 'Regulatory Compliance'],
    'Regulatory Compliance':       ['Risk Advisory', 'Legal & Compliance', 'Risk Management'],
    'Cross-border Taxation':       ['Tax Advisory', 'Transfer Pricing'],
    'Transfer Pricing':            ['Tax Advisory', 'Cross-border Taxation'],
    'Financial Auditing':          ['Audit & Assurance', 'Accounting & Reporting'],
    'Agriculture & Food Security': ['ESG & Sustainability', 'Infrastructure Development'],
    'Public-Private Partnerships': ['Infrastructure Development', 'Project Finance', 'Deals & Transactions'],
};

/**
 * Compute a 0–97 match percentage.
 *
 * Score per desired slot:
 *   - Exact match (case-insensitive)                          → 95 pts
 *   - Substring match (one label contains the other)          → 90 pts
 *   - Related-field match via SIMILAR_FIELDS cluster          → 65 pts
 *   - No match                                                → 0 pts
 *
 * Final score = average across all desired slots, capped at 97.
 */
function computeMatchPct(mentorTopics, menteeDesired) {
    if (!mentorTopics.length || !menteeDesired.length) return 0;

    const normalize = s => s.toLowerCase().trim();

    let totalPoints = 0;
    for (const desired of menteeDesired) {
        const desiredNorm = normalize(desired);
        let pts = 0;

        for (const topic of mentorTopics) {
            const topicNorm = normalize(topic);
            // Exact match
            if (topicNorm === desiredNorm) { pts = 95; break; }
            // Substring: one label contains the other (e.g. "Leadership" ⊂ "Leadership & Management")
            if (topicNorm.includes(desiredNorm) || desiredNorm.includes(topicNorm)) {
                pts = Math.max(pts, 90);
            }
        }

        // Similar-field cluster match (only if no direct/substring match)
        if (pts === 0) {
            const similar = SIMILAR_FIELDS[desired] || [];
            if (mentorTopics.some(t => {
                const tNorm = normalize(t);
                return similar.some(s => {
                    const sNorm = normalize(s);
                    return tNorm === sNorm || tNorm.includes(sNorm) || sNorm.includes(tNorm);
                });
            })) {
                pts = 65;
            }
        }

        totalPoints += pts;
    }

    const raw = totalPoints / menteeDesired.length;
    return Math.min(97, Math.round(raw));
}


// ── GET /api/matching/mentors ────────────────────────────────────────────────
// Called by mentees: fetch mentors ranked by how well they cover the mentee's desired topics.
router.get('/mentors', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user.user_id;

        // Get the requesting user's desired expertise so we can compute proper percentages
        let desiredTopics = [];
        try {
            const desiredRows = await executeQuery(
                `SELECT expertise FROM user_desired_expertise WHERE user_id = '${userId}'`
            );
            desiredTopics = desiredRows.recordset.map(r => r.expertise);
        } catch (_) { /* table may not exist for older accounts */ }

        const mentors = await UserProfile.getMatchedMentorsForUser(userId);

        const result = mentors
            .map(m => {
                const mentorExpertise = m.expertise_list
                    ? m.expertise_list.split(', ').filter(Boolean)
                    : [];
                // Compute proper percentage score (similar-field aware)
                const matchPct = computeMatchPct(mentorExpertise, desiredTopics);

                return {
                    // Frontend uses id for connection creation — must be experts.id
                    id:               m.expert_id,
                    user_id:          m.user_id,
                    name:             m.name,
                    title:            m.title || 'Expert',
                    location:         m.location || '',
                    experience:       m.experience_years ? `${m.experience_years} years` : '',
                    bio:              m.bio || '',
                    profile_image_url: m.profile_image_url || '',
                    expertise:        mentorExpertise,
                    languages:        m.languages_list ? m.languages_list.split(', ').filter(Boolean) : [],
                    activeMenteeCount: parseInt(m.active_mentee_count) || 0,
                    atCapacity:       false,
                    // Use the proper percentage; fall back to the SQL count * 15 only if desiredTopics unknown
                    matchScore: desiredTopics.length > 0 ? matchPct : Math.min(97, parseInt(m.match_score) * 20 || 0),
                };
            })
            .sort((a, b) => b.matchScore - a.matchScore);

        res.json({ success: true, data: { mentors: result } });
    } catch (error) {
        console.error('Error fetching matched mentors:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch matched mentors' });
    }
});

// ── GET /api/matching/mentees ────────────────────────────────────────────────
// Called by mentors: fetch mentees ranked by how well the mentor covers their desired topics.
// Matching signal priority:
//   1. mentor's user_desired_expertise  ("mentoring focus areas" set in Profile)
//   2. mentor's user_expertise          (their own skills, if #1 is empty)
//   3. expert_expertise table fallback  (seeded expert data)
router.get('/mentees', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user.user_id;

        // ── Step 1: preferred mentoring topics (set via Profile "Mentoring Focus") ──
        const myDesiredRows = await UserDesiredExpertise.findByUserId(userId);
        let myTopics = myDesiredRows.map(e => e.expertise);

        // ── Step 2: fall back to general expertise if focus areas not set ──────
        if (myTopics.length === 0) {
            const myExpertiseRows = await UserExpertise.findByUserId(userId);
            myTopics = myExpertiseRows.map(e => e.expertise);
        }

        // ── Step 3: last resort — expert_expertise table (seeded experts) ──────
        if (myTopics.length === 0) {
            try {
                const expertRow = await executeQuery(
                    `SELECT id FROM experts WHERE user_id = '${userId}'`
                );
                if (expertRow.recordset.length > 0) {
                    const expertId = expertRow.recordset[0].id;
                    const expRows = await executeQuery(
                        `SELECT expertise FROM expert_expertise WHERE expert_id = '${expertId}'`
                    );
                    myTopics = expRows.recordset.map(r => r.expertise);
                }
            } catch (_) { /* ignore if table missing */ }
        }

        const allMentees = await UserProfile.getAllMentees();

        const scored = allMentees
            .filter(m => m.user_id !== userId)
            .map(m => {
                const desired = m.desired_expertise_list
                    ? m.desired_expertise_list.split(', ').filter(Boolean)
                    : [];
                // Compute proper percentage — mentor's topics vs mentee's desires
                const matchScore = computeMatchPct(myTopics, desired);
                return {
                    id:              m.user_id,
                    user_id:         m.user_id,
                    name:            m.name,
                    location:        m.location || '',
                    experience:      m.experience || '',
                    bio:             m.bio || '',
                    profile_image_url: m.profile_image_url || '',
                    role:            m.role,
                    languages:       m.languages_list ? m.languages_list.split(', ').filter(Boolean) : [],
                    expertise:       desired,   // show mentee's desired topics as their "expertise" chips
                    desired_expertise: desired,
                    matchScore,
                    atCapacity:      false,
                    activeMenteeCount: 0,
                };
            })
            .sort((a, b) => b.matchScore - a.matchScore);

        res.json({ success: true, data: { mentees: scored } });
    } catch (error) {
        console.error('Error fetching matched mentees:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch matched mentees' });
    }
});

export default router;

