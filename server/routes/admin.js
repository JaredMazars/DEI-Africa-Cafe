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
        const { executeQuery } = await import('../config/database.js');
        const [userRes, connRes, expertRes] = await Promise.allSettled([
            User.getUserStats(),
            Connection.getConnectionStats(),
            executeQuery(`SELECT COUNT(*) as total FROM experts WHERE is_verified=1`)
        ]);

        const userStats = userRes.status === 'fulfilled' ? userRes.value : {};
        const connectionStats = connRes.status === 'fulfilled' ? connRes.value : {};
        const verifiedExperts = expertRes.status === 'fulfilled' ? expertRes.value.recordset[0]?.total || 0 : 0;

        const stats = {
            totalUsers: userStats.total_users || 0,
            totalMentors: userStats.total_mentors || 0,
            totalMentees: userStats.total_mentees || 0,
            newUsersThisMonth: userStats.new_users_this_month || 0,
            totalConnections: connectionStats.total_connections || 0,
            activeConnections: connectionStats.active_connections || 0,
            pendingConnections: connectionStats.pending_connections || 0,
            newConnectionsThisMonth: connectionStats.new_connections_this_month || 0,
            totalSessions: 0,
            completedSessions: 0,
            upcomingSessions: 0,
            avgSessionDuration: 0,
            verifiedExperts,
            premiumUsers: 0,
            totalRevenue: 0,
            monthlyGrowth: userStats.monthly_growth || 0,
            usersByCountry: userStats.users_by_country || [],
        };

        res.json({ success: true, data: { stats } });

    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard statistics' });
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
// ── Expert Approval ──────────────────────────────────────────────────────────

// GET /api/admin/experts — all experts with verification status
router.get('/experts', auth, requireAdmin, async (req, res) => {
    try {
        const { executeQuery } = await import('../config/database.js');
        const result = await executeQuery(`
            SELECT e.id, e.user_id, e.name, e.bio, e.location, e.avatar_url,
                   e.is_verified, e.is_rejected, e.rejection_note, e.is_available, e.experience_years,
                   e.created_at, e.updated_at,
                   u.email, u.name AS user_name,
                   (SELECT STRING_AGG(ee2.expertise, ',') FROM expert_expertise ee2
                    WHERE ee2.expert_id = e.id) AS expertise_list
            FROM experts e
            LEFT JOIN users u ON e.user_id = u.id
            ORDER BY e.is_verified ASC, e.created_at DESC
        `);
        res.json({ success: true, data: { experts: result.recordset } });
    } catch (error) {
        console.error('Error fetching experts:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch experts' });
    }
});

// GET /api/admin/experts/pending — unverified expert applications
router.get('/experts/pending', auth, requireAdmin, async (req, res) => {
    try {
        const { executeQuery } = await import('../config/database.js');
        const result = await executeQuery(`
            SELECT e.id, e.user_id, e.name, e.bio, e.location, e.avatar_url,
                   e.is_verified, e.is_rejected, e.rejection_note, e.experience_years, e.created_at,
                   u.email, u.name AS user_name,
                   (SELECT STRING_AGG(ee2.expertise, ',') FROM expert_expertise ee2
                    WHERE ee2.expert_id = e.id) AS expertise_list
            FROM experts e
            LEFT JOIN users u ON e.user_id = u.id
            WHERE e.is_verified = 0
            ORDER BY e.created_at DESC
        `);
        res.json({ success: true, data: { experts: result.recordset } });
    } catch (error) {
        console.error('Error fetching pending experts:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch pending experts' });
    }
});

// PUT /api/admin/experts/:id/verify — approve or reject an expert
router.put('/experts/:id/verify', auth, requireAdmin, async (req, res) => {
    try {
        const { executeQuery } = await import('../config/database.js');
        const { id } = req.params;
        const { is_verified, rejection_note } = req.body; // true = approve, false = reject
        if (typeof is_verified !== 'boolean') {
            return res.status(400).json({ success: false, message: 'is_verified must be true or false' });
        }
        if (is_verified) {
            await executeQuery(`
                UPDATE experts SET is_verified = 1, is_rejected = 0, rejection_note = NULL, updated_at = GETDATE()
                WHERE id = '${id.replace(/'/g, "''")}'`);
        } else {
            const note = rejection_note ? rejection_note.replace(/'/g, "''") : null;
            await executeQuery(`
                UPDATE experts SET is_verified = 0, is_rejected = 1,
                    rejection_note = ${note ? `'${note}'` : 'NULL'}, updated_at = GETDATE()
                WHERE id = '${id.replace(/'/g, "''")}'`);
        }
        res.json({ success: true, message: is_verified ? 'Expert approved' : 'Expert rejected' });
    } catch (error) {
        console.error('Error verifying expert:', error);
        res.status(500).json({ success: false, message: 'Failed to update expert verification' });
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

// DELETE /api/admin/users/:id — hard-delete a user
router.delete('/users/:id', auth, requireAdmin, async (req, res) => {
    try {
        const { executeQuery } = await import('../config/database.js');
        const { id } = req.params;
        // Soft-delete: mark inactive
        await executeQuery(`UPDATE users SET is_active = 0, updated_at = GETDATE() WHERE id = '${id.replace(/'/g, "''")}'`);
        res.json({ success: true, message: 'User deactivated' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
});

// ── Audit Log ────────────────────────────────────────────────────────────────

// GET /api/admin/audit
router.get('/audit', auth, requireAdmin, async (req, res) => {
    try {
        const { executeQuery } = await import('../config/database.js');
        const { action, search, limit = 200 } = req.query;
        let where = 'WHERE 1=1';
        if (action && action !== 'all') where += ` AND action = '${action.replace(/'/g, "''")}'`;
        if (search) where += ` AND (entity_name LIKE '%${search.replace(/'/g, "''")}%' OR admin_email LIKE '%${search.replace(/'/g, "''")}%' OR details LIKE '%${search.replace(/'/g, "''")}%')`;
        const result = await executeQuery(`SELECT TOP ${parseInt(limit)} * FROM admin_audit_log ${where} ORDER BY created_at DESC`);
        res.json({ success: true, data: { audits: result.recordset } });
    } catch (error) {
        console.error('Error fetching audit log:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch audit log' });
    }
});

// POST /api/admin/audit — log an admin action
router.post('/audit', auth, requireAdmin, async (req, res) => {
    try {
        const { executeQuery } = await import('../config/database.js');
        const { action, entity_type, entity_name, details, admin_email } = req.body;
        const email = admin_email || req.user.email || 'admin';
        await executeQuery(`
            INSERT INTO admin_audit_log (admin_email, action, entity_type, entity_name, details, created_at)
            VALUES ('${email.replace(/'/g, "''")}', '${(action||'').replace(/'/g, "''")}',
                    '${(entity_type||'').replace(/'/g, "''")}', '${(entity_name||'').replace(/'/g, "''")}',
                    ${details ? `'${details.replace(/'/g, "''")}'` : 'NULL'}, GETDATE())
        `);
        res.json({ success: true, message: 'Audit logged' });
    } catch (error) {
        console.error('Error logging audit:', error);
        res.status(500).json({ success: false, message: 'Failed to log audit' });
    }
});

// ── Notifications ────────────────────────────────────────────────────────────

router.get('/notifications', auth, requireAdmin, async (req, res) => {
    try {
        const { executeQuery } = await import('../config/database.js');
        const result = await executeQuery(`SELECT * FROM admin_notifications ORDER BY created_at DESC`);
        res.json({ success: true, data: { notifications: result.recordset } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
});

router.post('/notifications', auth, requireAdmin, async (req, res) => {
    try {
        const { executeQuery } = await import('../config/database.js');
        const { title, message, type = 'info', target_audience = 'all', status = 'draft' } = req.body;
        if (!title || !message) return res.status(400).json({ success: false, message: 'title and message required' });
        const adminEmail = req.user.email || 'admin';
        const result = await executeQuery(`
            INSERT INTO admin_notifications (title, message, type, target_audience, status, created_by, created_at, updated_at)
            OUTPUT INSERTED.*
            VALUES ('${title.replace(/'/g,"''")}', '${message.replace(/'/g,"''")}',
                    '${type}', '${target_audience}', '${status}', '${adminEmail}', GETDATE(), GETDATE())
        `);
        res.json({ success: true, message: 'Notification created', data: { notification: result.recordset[0] } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create notification' });
    }
});

router.put('/notifications/:id', auth, requireAdmin, async (req, res) => {
    try {
        const { executeQuery } = await import('../config/database.js');
        const { id } = req.params;
        const { title, message, type, target_audience, status } = req.body;
        const sets = [];
        if (title)           sets.push(`title='${title.replace(/'/g,"''")} '`);
        if (message)         sets.push(`message='${message.replace(/'/g,"''")}'`);
        if (type)            sets.push(`type='${type}'`);
        if (target_audience) sets.push(`target_audience='${target_audience}'`);
        if (status)          sets.push(`status='${status}'`);
        sets.push(`updated_at=GETDATE()`);
        await executeQuery(`UPDATE admin_notifications SET ${sets.join(',')} WHERE id='${id.replace(/'/g,"''")}'`);
        res.json({ success: true, message: 'Notification updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update notification' });
    }
});

router.delete('/notifications/:id', auth, requireAdmin, async (req, res) => {
    try {
        const { executeQuery } = await import('../config/database.js');
        await executeQuery(`DELETE FROM admin_notifications WHERE id='${req.params.id.replace(/'/g,"''")}'`);
        res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete notification' });
    }
});

// ── Content Management ────────────────────────────────────────────────────────

router.get('/content', auth, requireAdmin, async (req, res) => {
    try {
        const { executeQuery } = await import('../config/database.js');
        const result = await executeQuery(`SELECT * FROM admin_content ORDER BY created_at DESC`);
        res.json({ success: true, data: { content: result.recordset } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch content' });
    }
});

router.post('/content', auth, requireAdmin, async (req, res) => {
    try {
        const { executeQuery } = await import('../config/database.js');
        const { type = 'article', title, description, url, category = 'General', status = 'published' } = req.body;
        if (!title || !url) return res.status(400).json({ success: false, message: 'title and url required' });
        const adminEmail = req.user.email || 'admin';
        const result = await executeQuery(`
            INSERT INTO admin_content (type, title, description, url, category, status, created_by, created_at, updated_at)
            OUTPUT INSERTED.*
            VALUES ('${type}', '${title.replace(/'/g,"''")}',
                    ${description ? `'${description.replace(/'/g,"''")}'` : 'NULL'},
                    '${url.replace(/'/g,"''")}', '${category.replace(/'/g,"''")}',
                    '${status}', '${adminEmail}', GETDATE(), GETDATE())
        `);
        res.json({ success: true, data: { content: result.recordset[0] } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create content' });
    }
});

router.put('/content/:id', auth, requireAdmin, async (req, res) => {
    try {
        const { executeQuery } = await import('../config/database.js');
        const { id } = req.params;
        const { type, title, description, url, category, status } = req.body;
        const sets = [];
        if (type)        sets.push(`type='${type}'`);
        if (title)       sets.push(`title='${title.replace(/'/g,"''")} '`);
        if (description !== undefined) sets.push(`description=${description ? `'${description.replace(/'/g,"''")}'` : 'NULL'}`);
        if (url)         sets.push(`url='${url.replace(/'/g,"''")} '`);
        if (category)    sets.push(`category='${category.replace(/'/g,"''")} '`);
        if (status)      sets.push(`status='${status}'`);
        sets.push(`updated_at=GETDATE()`);
        await executeQuery(`UPDATE admin_content SET ${sets.join(',')} WHERE id='${id.replace(/'/g,"''")}'`);
        res.json({ success: true, message: 'Content updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update content' });
    }
});

router.delete('/content/:id', auth, requireAdmin, async (req, res) => {
    try {
        const { executeQuery } = await import('../config/database.js');
        await executeQuery(`UPDATE admin_content SET status='archived', updated_at=GETDATE() WHERE id='${req.params.id.replace(/'/g,"''")}'`);
        res.json({ success: true, message: 'Content archived' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete content' });
    }
});

// ── Opportunities (admin CRUD) ────────────────────────────────────────────────

router.get('/opportunities', auth, requireAdmin, async (req, res) => {
    try {
        const { executeQuery } = await import('../config/database.js');
        const result = await executeQuery(`
            SELECT o.*,
                   (SELECT COUNT(*) FROM OpportunityInterests oi WHERE oi.opportunity_id = o.opportunity_id) as applicant_count
            FROM Opportunities o
            ORDER BY o.created_at DESC
        `);
        res.json({ success: true, data: { opportunities: result.recordset } });
    } catch (error) {
        console.error('Error fetching opportunities:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch opportunities' });
    }
});

router.post('/opportunities', auth, requireAdmin, async (req, res) => {
    try {
        const { executeQuery } = await import('../config/database.js');
        const { title, description, industry = '', client_sector = '', regions_needed = '', budget_range = '', deadline, priority = 'medium', status = 'open' } = req.body;
        if (!title || !description) return res.status(400).json({ success: false, message: 'title and description required' });
        const dl = deadline || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0];
        const result = await executeQuery(`
            INSERT INTO Opportunities (title, description, industry, client_sector, regions_needed, budget_range, deadline, priority, status, created_at, updated_at)
            OUTPUT INSERTED.*
            VALUES ('${title.replace(/'/g,"''")}', '${description.replace(/'/g,"''")}',
                    '${industry.replace(/'/g,"''")}', '${client_sector.replace(/'/g,"''")}',
                    '${regions_needed.replace(/'/g,"''")}', '${budget_range.replace(/'/g,"''")}',
                    '${dl}', '${priority}', '${status}', GETDATE(), GETDATE())
        `);
        res.json({ success: true, data: { opportunity: result.recordset[0] } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create opportunity' });
    }
});

router.put('/opportunities/:id', auth, requireAdmin, async (req, res) => {
    try {
        const { executeQuery } = await import('../config/database.js');
        const { id } = req.params;
        const { title, description, industry, client_sector, regions_needed, budget_range, deadline, priority, status } = req.body;
        const sets = [];
        if (title)           sets.push(`title='${title.replace(/'/g,"''")} '`);
        if (description)     sets.push(`description='${description.replace(/'/g,"''")} '`);
        if (industry)        sets.push(`industry='${industry.replace(/'/g,"''")} '`);
        if (client_sector)   sets.push(`client_sector='${client_sector.replace(/'/g,"''")} '`);
        if (regions_needed)  sets.push(`regions_needed='${regions_needed.replace(/'/g,"''")} '`);
        if (budget_range)    sets.push(`budget_range='${budget_range.replace(/'/g,"''")} '`);
        if (deadline)        sets.push(`deadline='${deadline}'`);
        if (priority)        sets.push(`priority='${priority}'`);
        if (status)          sets.push(`status='${status}'`);
        sets.push(`updated_at=GETDATE()`);
        await executeQuery(`UPDATE Opportunities SET ${sets.join(',')} WHERE opportunity_id='${id.replace(/'/g,"''")}'`);
        res.json({ success: true, message: 'Opportunity updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update opportunity' });
    }
});

router.delete('/opportunities/:id', auth, requireAdmin, async (req, res) => {
    try {
        const { executeQuery } = await import('../config/database.js');
        await executeQuery(`UPDATE Opportunities SET status='closed', updated_at=GETDATE() WHERE opportunity_id='${req.params.id.replace(/'/g,"''")}'`);
        res.json({ success: true, message: 'Opportunity closed' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete opportunity' });
    }
});

// ── Resources (admin CRUD) ────────────────────────────────────────────────────

router.get('/resources', auth, requireAdmin, async (req, res) => {
    try {
        const { executeQuery } = await import('../config/database.js');
        const result = await executeQuery(`SELECT * FROM resources ORDER BY created_at DESC`);
        res.json({ success: true, data: { resources: result.recordset } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch resources' });
    }
});

router.post('/resources', auth, requireAdmin, async (req, res) => {
    try {
        const { executeQuery } = await import('../config/database.js');
        const { title, type = 'article', category = 'General', url, description } = req.body;
        if (!title || !url) return res.status(400).json({ success: false, message: 'title and url required' });
        const adminEmail = req.user.email || 'admin';
        const result = await executeQuery(`
            INSERT INTO resources (title, type, category, url, description, uploader_name, is_active, created_at, updated_at)
            OUTPUT INSERTED.id
            VALUES ('${title.replace(/'/g,"''")}', '${type}', '${category.replace(/'/g,"''")}',
                    '${url.replace(/'/g,"''")}', ${description ? `'${description.replace(/'/g,"''")}'` : 'NULL'},
                    '${adminEmail}', 1, GETDATE(), GETDATE())
        `);
        res.json({ success: true, message: 'Resource created', data: { id: result.recordset[0].id } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create resource' });
    }
});

router.put('/resources/:id', auth, requireAdmin, async (req, res) => {
    try {
        const { executeQuery } = await import('../config/database.js');
        const { id } = req.params;
        const { title, type, category, url, description } = req.body;
        const sets = [];
        if (title)       sets.push(`title='${title.replace(/'/g,"''")} '`);
        if (type)        sets.push(`type='${type}'`);
        if (category)    sets.push(`category='${category.replace(/'/g,"''")} '`);
        if (url)         sets.push(`url='${url.replace(/'/g,"''")} '`);
        if (description !== undefined) sets.push(`description=${description ? `'${description.replace(/'/g,"''")}'` : 'NULL'}`);
        sets.push(`updated_at=GETDATE()`);
        await executeQuery(`UPDATE resources SET ${sets.join(',')} WHERE id='${id.replace(/'/g,"''")}'`);
        res.json({ success: true, message: 'Resource updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update resource' });
    }
});

router.delete('/resources/:id', auth, requireAdmin, async (req, res) => {
    try {
        const { executeQuery } = await import('../config/database.js');
        await executeQuery(`UPDATE resources SET is_active=0, updated_at=GETDATE() WHERE id='${req.params.id.replace(/'/g,"''")}'`);
        res.json({ success: true, message: 'Resource deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete resource' });
    }
});

export default router;