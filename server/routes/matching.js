/**
 * /api/matching
 * 
 * Smart matching endpoints:
 *  GET /api/matching/mentors   — ranked mentor list for the current user
 *  GET /api/matching/mentees   — ranked mentee list for the current user (mentors looking for mentees)
 */
import express from 'express';
import auth from '../middleware/auth.js';
import UserProfile from '../models/UserProfile.js';
import UserDesiredExpertise from '../models/UserDesiredExpertise.js';
import UserExpertise from '../models/UserExpertise.js';
import Connection from '../models/Connection.js';

const router = express.Router();

// ── GET /api/matching/mentors ────────────────────────────────────────────────
// Returns mentors ranked by how well they match the current user's desired_expertise.
// Mentors at capacity (3 active mentees) are excluded from results.
router.get('/mentors', auth, async (req, res) => {
    try {
        const userId = req.user.user_id;

        const mentors = await UserProfile.getMatchedMentorsForUser(userId);

        const result = mentors.map(m => ({
            id:               m.user_id,
            name:             m.name,
            location:         m.location,
            experience:       m.experience,
            availability:     m.availability,
            bio:              m.bio,
            profileImage:     m.profile_image_url,
            role:             m.role,
            can_mentor:       m.can_mentor,
            can_be_mentored:  m.can_be_mentored,
            expertise:        m.expertise_list   ? m.expertise_list.split(', ')   : [],
            interests:        m.interests_list   ? m.interests_list.split(', ')   : [],
            languages:        m.languages_list   ? m.languages_list.split(', ')   : [],
            activeMenteeCount: parseInt(m.active_mentee_count) || 0,
            atCapacity:        m.at_capacity === 1 || m.at_capacity === true,
            matchScore:        parseInt(m.match_score) || 0,
        }));

        res.json({
            success: true,
            data: { mentors: result }
        });
    } catch (error) {
        console.error('Error fetching matched mentors:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch matched mentors' });
    }
});

// ── GET /api/matching/mentees ────────────────────────────────────────────────
// Returns mentees for a mentor, ranked by expertise overlap.
router.get('/mentees', auth, async (req, res) => {
    try {
        const userId = req.user.user_id;

        // Get this mentor's expertise (what they offer)
        const myExpertise = await UserExpertise.findByUserId(userId);
        const myTopics    = myExpertise.map(e => e.expertise);

        // Get all mentees, then compute match score in JS
        // (simple approach — for larger scale, move to DB query like getMentors does)
        const allMentees = await UserProfile.getAllMentees();

        const scored = await Promise.all(
            allMentees.map(async (mentee) => {
                const desired = await UserDesiredExpertise.findByUserId(mentee.user_id);
                const desiredTopics = desired.map(d => d.expertise);
                const overlap = desiredTopics.filter(t => myTopics.includes(t)).length;
                return {
                    id:             mentee.user_id,
                    name:           mentee.name,
                    location:       mentee.location,
                    experience:     mentee.experience,
                    bio:            mentee.bio,
                    profileImage:   mentee.profile_image_url,
                    role:           mentee.role,
                    interests:      mentee.interests_list ? mentee.interests_list.split(', ') : [],
                    languages:      mentee.languages_list ? mentee.languages_list.split(', ') : [],
                    desiredExpertise: desiredTopics,
                    matchScore:     overlap,
                };
            })
        );

        const sorted = scored.sort((a, b) => b.matchScore - a.matchScore);

        res.json({
            success: true,
            data: { mentees: sorted }
        });
    } catch (error) {
        console.error('Error fetching matched mentees:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch matched mentees' });
    }
});

export default router;
