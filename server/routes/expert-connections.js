/**
 * /api/expert-connections
 *
 * Handles connection requests between users and experts.
 * Experts are short-term advisors; once approved the requester can open a Teams
 * chat with them directly from the platform.
 *
 * Table: expert_connections
 *   id, requester_id (users.id), expert_id (Experts.expert_id),
 *   message, status ('pending'|'approved'|'declined'), created_at, updated_at
 */
import express from 'express';
import auth from '../middleware/auth.js';
import { executeQuery } from '../config/database.js';

const router = express.Router();

// ─── helpers ─────────────────────────────────────────────────────────────────
const userId = req => req.user.id || req.user.user_id;

// ─── POST /  — user sends a connection request ───────────────────────────────
router.post('/', auth, async (req, res) => {
    try {
        const requesterId = userId(req);
        const { expert_id, message } = req.body;

        if (!expert_id) {
            return res.status(400).json({ success: false, message: 'expert_id is required' });
        }

        // Verify expert exists
        const expertCheck = await executeQuery(
            `SELECT expert_id, user_id FROM Experts WHERE expert_id = '${expert_id}'`
        );
        if (!expertCheck.recordset.length) {
            return res.status(404).json({ success: false, message: 'Expert not found' });
        }

        // Prevent duplicate pending/approved requests
        const existing = await executeQuery(`
            SELECT id, status FROM expert_connections
            WHERE requester_id = '${requesterId}' AND expert_id = '${expert_id}'
              AND status IN ('pending', 'approved')
        `);
        if (existing.recordset.length) {
            const st = existing.recordset[0].status;
            return res.status(409).json({
                success: false,
                message: st === 'approved'
                    ? 'You are already connected to this expert'
                    : 'You already have a pending request to this expert'
            });
        }

        const safeMsg = (message || 'I would like to connect with you.').replace(/'/g, "''");
        const result = await executeQuery(`
            INSERT INTO expert_connections (requester_id, expert_id, message, status, created_at, updated_at)
            OUTPUT INSERTED.*
            VALUES ('${requesterId}', '${expert_id}', '${safeMsg}', 'pending', GETDATE(), GETDATE())
        `);

        res.status(201).json({
            success: true,
            message: 'Connection request sent',
            data: { connection: result.recordset[0] }
        });
    } catch (error) {
        console.error('POST /expert-connections error:', error);
        res.status(500).json({ success: false, message: 'Failed to send connection request' });
    }
});

// ─── GET /mine  — requester sees all their requests + status ─────────────────
router.get('/mine', auth, async (req, res) => {
    try {
        const requesterId = userId(req);

        const result = await executeQuery(`
            SELECT
                ec.id,
                ec.expert_id,
                ec.message,
                ec.status,
                ec.created_at,
                ec.updated_at,
                -- Expert profile details
                u.name          AS expert_name,
                u.email         AS expert_email,
                up.profile_image_url AS expert_avatar,
                up.location     AS expert_location,
                up.bio          AS expert_bio,
                e.specializations AS expert_specializations,
                e.industries    AS expert_industries,
                e.is_available  AS expert_is_available,
                (SELECT AVG(CAST(r.rating AS FLOAT))
                   FROM Reviews r WHERE r.reviewee_id = e.user_id) AS expert_rating,
                (SELECT COUNT(*) FROM Reviews r WHERE r.reviewee_id = e.user_id) AS expert_review_count
            FROM expert_connections ec
            INNER JOIN Experts e   ON ec.expert_id   = e.expert_id
            INNER JOIN users u     ON e.user_id       = u.id
            LEFT  JOIN users up    ON e.user_id       = up.id
            WHERE ec.requester_id = '${requesterId}'
            ORDER BY ec.updated_at DESC
        `);

        res.json({ success: true, data: { connections: result.recordset } });
    } catch (error) {
        console.error('GET /expert-connections/mine error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch your connections' });
    }
});

// ─── GET /incoming  — expert sees requests directed at them ──────────────────
router.get('/incoming', auth, async (req, res) => {
    try {
        const expertUserId = userId(req);

        // Resolve the experts.expert_id for the logged-in user
        const expertRow = await executeQuery(
            `SELECT expert_id FROM Experts WHERE user_id = '${expertUserId}'`
        );
        if (!expertRow.recordset.length) {
            return res.json({ success: true, data: { connections: [] } });
        }
        const expertId = expertRow.recordset[0].expert_id;

        const result = await executeQuery(`
            SELECT
                ec.id,
                ec.requester_id,
                ec.message,
                ec.status,
                ec.created_at,
                ec.updated_at,
                u.name          AS requester_name,
                u.email         AS requester_email,
                up.profile_image_url AS requester_avatar,
                up.location     AS requester_location,
                up.bio          AS requester_bio
            FROM expert_connections ec
            INNER JOIN users u   ON ec.requester_id = u.id
            LEFT  JOIN users up  ON ec.requester_id = up.id
            WHERE ec.expert_id = '${expertId}'
            ORDER BY ec.created_at DESC
        `);

        res.json({ success: true, data: { connections: result.recordset } });
    } catch (error) {
        console.error('GET /expert-connections/incoming error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch incoming requests' });
    }
});

// ─── PUT /:id/status  — expert approves or declines ──────────────────────────
router.put('/:id/status', auth, async (req, res) => {
    try {
        const expertUserId = userId(req);
        const { id } = req.params;
        const { status } = req.body;

        if (!['approved', 'declined'].includes(status)) {
            return res.status(400).json({ success: false, message: "status must be 'approved' or 'declined'" });
        }

        // Verify the caller is the expert for this connection
        const expertRow = await executeQuery(
            `SELECT expert_id FROM Experts WHERE user_id = '${expertUserId}'`
        );
        if (!expertRow.recordset.length) {
            return res.status(403).json({ success: false, message: 'Only experts can update connection status' });
        }
        const expertId = expertRow.recordset[0].expert_id;

        const updated = await executeQuery(`
            UPDATE expert_connections
            SET status = '${status}', updated_at = GETDATE()
            OUTPUT INSERTED.*
            WHERE id = '${id}' AND expert_id = '${expertId}'
        `);

        if (!updated.recordset.length) {
            return res.status(404).json({ success: false, message: 'Connection request not found or not yours to update' });
        }

        res.json({
            success: true,
            message: `Connection ${status}`,
            data: { connection: updated.recordset[0] }
        });
    } catch (error) {
        console.error('PUT /expert-connections/:id/status error:', error);
        res.status(500).json({ success: false, message: 'Failed to update connection status' });
    }
});

// ─── GET /stats  — summary counts for the requests dashboard ─────────────────
router.get('/stats', auth, async (req, res) => {
    try {
        const expertUserId = userId(req);
        const expertRow = await executeQuery(
            `SELECT expert_id FROM Experts WHERE user_id = '${expertUserId}'`
        );
        if (!expertRow.recordset.length) {
            return res.json({ success: true, data: { pending: 0, approved: 0, declined: 0 } });
        }
        const expertId = expertRow.recordset[0].expert_id;

        const result = await executeQuery(`
            SELECT
                SUM(CASE WHEN status = 'pending'  THEN 1 ELSE 0 END) AS pending,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
                SUM(CASE WHEN status = 'declined' THEN 1 ELSE 0 END) AS declined
            FROM expert_connections
            WHERE expert_id = '${expertId}'
        `);

        res.json({ success: true, data: result.recordset[0] });
    } catch (error) {
        console.error('GET /expert-connections/stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
});

export default router;
