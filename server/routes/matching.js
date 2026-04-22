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

const router = express.Router();

// ── GET /api/matching/mentors ────────────────────────────────────────────────
router.get('/mentors', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user.user_id;

        const mentors = await UserProfile.getMatchedMentorsForUser(userId);

        const result = mentors.map(m => ({
            // Frontend uses id for connection creation — must be experts.id
            id:               m.expert_id,
            user_id:          m.user_id,
            name:             m.name,
            title:            m.title || 'Expert',
            location:         m.location || '',
            experience:       m.experience_years ? `${m.experience_years} years` : '',
            bio:              m.bio || '',
            profile_image_url: m.profile_image_url || '',
            expertise:        m.expertise_list   ? m.expertise_list.split(', ').filter(Boolean)   : [],
            languages:        m.languages_list   ? m.languages_list.split(', ').filter(Boolean)   : [],
            activeMenteeCount: parseInt(m.active_mentee_count) || 0,
            atCapacity:        false,  // already filtered out at-capacity experts
            matchScore:        parseInt(m.match_score) || 0,
        }));

        res.json({ success: true, data: { mentors: result } });
    } catch (error) {
        console.error('Error fetching matched mentors:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch matched mentors' });
    }
});

// ── GET /api/matching/mentees ────────────────────────────────────────────────
router.get('/mentees', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user.user_id;

        // Get this user's expertise (what they offer as a mentor)
        const myExpertise = await UserExpertise.findByUserId(userId);
        const myTopics    = myExpertise.map(e => e.expertise);

        const allMentees = await UserProfile.getAllMentees();

        const scored = allMentees
            .filter(m => m.user_id !== userId)
            .map(m => {
                const desired = m.desired_expertise_list
                    ? m.desired_expertise_list.split(', ').filter(Boolean)
                    : [];
                const overlap = desired.filter(t => myTopics.includes(t)).length;
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
                    desired_expertise: desired,
                    matchScore:      overlap,
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
