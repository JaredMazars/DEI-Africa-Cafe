import express from 'express';
import User from '../models/User.js';
import UserProfile from '../models/UserProfile.js';
import Connection from '../models/Connection.js';
import Session from '../models/Session.js';
import Message from '../models/Message.js';
import Review from '../models/Review.js';
import Opportunity from '../models/Opportunity.js';
import Expert from '../models/Expert.js';
import auth from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
    // In production, you would check user role from database
    // For now, we'll allow all authenticated users to access admin routes
    // if (req.user.role !== 'admin') {
    //     return res.status(403).json({ 
    //         success: false, 
    //         message: 'Admin access required' 
    //     });
    // }
    next();
};

// Get dashboard statistics
router.get('/stats', auth, requireAdmin, async (req, res) => {
    try {
        const [userStats, connectionStats, sessionStats] = await Promise.all([
            User.getUserStats(),
            Connection.getConnectionStats(),
            Session.getSessionStats()
        ]);

        const stats = {
            totalUsers: userStats.total_users,
            totalMentors: userStats.total_mentors,
            totalMentees: userStats.total_mentees,
            newUsersThisMonth: userStats.new_users_this_month,
            totalConnections: connectionStats.total_connections,
            activeConnections: connectionStats.active_connections,
            pendingConnections: connectionStats.pending_connections,
            newConnectionsThisMonth: connectionStats.new_connections_this_month,
            totalSessions: sessionStats.total_sessions,
            completedSessions: sessionStats.completed_sessions,
            upcomingSessions: sessionStats.upcoming_sessions,
            avgSessionDuration: sessionStats.avg_duration,
            verifiedExperts: userStats.total_mentors || 0,
            premiumUsers: 0,
            totalRevenue: 0,
            monthlyGrowth: userStats.monthly_growth || 0,
            usersByCountry: userStats.users_by_country || [],
        };

        res.json({
            success: true,
            data: { stats }
        });

    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics'
        });
    }
});

// Get all users with profiles
router.get('/users', auth, requireAdmin, async (req, res) => {
    try {
        const users = await User.getAll();

        res.json({
            success: true,
            data: { users }
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
});

// Get all connections for admin
router.get('/connections', auth, requireAdmin, async (req, res) => {
    try {
        const connections = await Connection.getConnectionStats();

        res.json({
            success: true,
            data: { connections }
        });

    } catch (error) {
        console.error('Error fetching connections:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch connections'
        });
    }
});

// Get mentors by expertise
router.get('/mentors', auth, async (req, res) => {
    try {
        const { expertise } = req.query;
        
        let mentors;
        if (expertise) {
            mentors = await UserProfile.getMentorsByExpertise(expertise);
        } else {
            mentors = await UserProfile.getAllMentors();
        }

        res.json({
            success: true,
            data: { mentors }
        });

    } catch (error) {
        console.error('Error fetching mentors:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch mentors'
        });
    }
});

// Get mentees by interests
router.get('/mentees', auth, async (req, res) => {
    try {
        const { interest } = req.query;
        
        let mentees;
        if (interest) {
            mentees = await UserProfile.getMenteesByInterests(interest);
        } else {
            mentees = await UserProfile.getAllMentees();
        }

        res.json({
            success: true,
            data: { mentees }
        });

    } catch (error) {
        console.error('Error fetching mentees:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch mentees'
        });
    }
});

// Update user status
router.put('/users/:userId/status', auth, requireAdmin, [
    body('is_active').isBoolean().withMessage('Status must be true or false')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { userId } = req.params;
        const { is_active } = req.body;

        await User.updateStatus(userId, is_active);

        res.json({
            success: true,
            message: 'User status updated successfully'
        });

    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user status'
        });
    }
});

// ── Mentor CRUD ──────────────────────────────────────────────────────────────
// GET /api/admin/mentors — list all experts with stats
router.get('/mentors', auth, requireAdmin, async (req, res) => {
    try {
        const { expertise } = req.query;
        let mentors = expertise
            ? await UserProfile.getMentorsByExpertise(expertise)
            : await UserProfile.getAllMentors();
        res.json({ success: true, data: { mentors } });
    } catch (error) {
        console.error('Error fetching mentors:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch mentors' });
    }
});

// POST /api/admin/mentors — create a new expert record
router.post('/mentors', auth, requireAdmin, async (req, res) => {
    try {
        const { executeQuery } = await import('../config/database.js');
        const { name, email, phone, expertise, bio, photo } = req.body;
        if (!name || !email || !bio) {
            return res.status(400).json({ success: false, message: 'name, email and bio are required' });
        }
        // Find or create user by email
        let user = await User.findByEmail(email);
        if (!user) {
            // Create a stub user (no password — admin-created)
            const tmp = await executeQuery(`
                INSERT INTO users (email, password_hash, name, role, is_mentor, is_mentee, is_active, created_at, updated_at)
                OUTPUT INSERTED.id
                VALUES ('${email.replace(/'/g,"''")}', '', '${name.replace(/'/g,"''")}', 'mentor', 1, 0, 1, GETDATE(), GETDATE())
            `);
            const userId = tmp.recordset[0].id;
            user = { id: userId };
        }
        // Upsert expert row
        const existing = await executeQuery(`SELECT id FROM experts WHERE user_id = '${user.id}'`);
        let expertId;
        if (existing.recordset.length > 0) {
            expertId = existing.recordset[0].id;
            await executeQuery(`
                UPDATE experts SET name='${name.replace(/'/g,"''")}', bio='${bio.replace(/'/g,"''")}',
                    avatar_url=${photo ? `'${photo}'` : 'NULL'}, is_available=1, updated_at=GETDATE()
                WHERE id='${expertId}'
            `);
        } else {
            const ins = await executeQuery(`
                INSERT INTO experts (user_id, name, bio, location, avatar_url, is_available, experience_years, created_at, updated_at)
                OUTPUT INSERTED.id
                VALUES ('${user.id}', '${name.replace(/'/g,"''")}', '${bio.replace(/'/g,"''")}', '', ${photo ? `'${photo}'` : 'NULL'}, 1, 0, GETDATE(), GETDATE())
            `);
            expertId = ins.recordset[0].id;
        }
        // Replace expertise tags
        if (Array.isArray(expertise) && expertise.length > 0) {
            await executeQuery(`DELETE FROM expert_expertise WHERE expert_id='${expertId}'`);
            for (const exp of expertise) {
                await executeQuery(`INSERT INTO expert_expertise (expert_id, expertise) VALUES ('${expertId}', '${exp.replace(/'/g,"''")}') `);
            }
        }
        res.json({ success: true, message: 'Mentor created', data: { expertId } });
    } catch (error) {
        console.error('Error creating mentor:', error);
        res.status(500).json({ success: false, message: 'Failed to create mentor' });
    }
});

// PUT /api/admin/mentors/:id — update expert
router.put('/mentors/:id', auth, requireAdmin, async (req, res) => {
    try {
        const { executeQuery } = await import('../config/database.js');
        const { id } = req.params;
        const { name, bio, photo, expertise } = req.body;
        await executeQuery(`
            UPDATE experts SET
                name=${name ? `'${name.replace(/'/g,"''")}'` : 'name'},
                bio=${bio ? `'${bio.replace(/'/g,"''")}'` : 'bio'},
                avatar_url=${photo ? `'${photo}'` : 'avatar_url'},
                updated_at=GETDATE()
            WHERE id='${id}'
        `);
        if (Array.isArray(expertise)) {
            await executeQuery(`DELETE FROM expert_expertise WHERE expert_id='${id}'`);
            for (const exp of expertise) {
                await executeQuery(`INSERT INTO expert_expertise (expert_id, expertise) VALUES ('${id}', '${exp.replace(/'/g,"''")}') `);
            }
        }
        res.json({ success: true, message: 'Mentor updated' });
    } catch (error) {
        console.error('Error updating mentor:', error);
        res.status(500).json({ success: false, message: 'Failed to update mentor' });
    }
});

// DELETE /api/admin/mentors/:id — deactivate expert (soft delete)
router.delete('/mentors/:id', auth, requireAdmin, async (req, res) => {
    try {
        const { executeQuery } = await import('../config/database.js');
        const { id } = req.params;
        await executeQuery(`UPDATE experts SET is_available=0, updated_at=GETDATE() WHERE id='${id}'`);
        res.json({ success: true, message: 'Mentor deactivated' });
    } catch (error) {
        console.error('Error deleting mentor:', error);
        res.status(500).json({ success: false, message: 'Failed to delete mentor' });
    }
});

export default router;