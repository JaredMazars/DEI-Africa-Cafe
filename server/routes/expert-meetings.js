/**
 * /api/expert-meetings
 * Stores meetings (1-on-1 or group) created by experts after scheduling via Teams.
 */
import express from 'express';
import auth from '../middleware/auth.js';
import { executeQuery } from '../config/database.js';

const router = express.Router();
const uid = req => req.user.id || req.user.user_id;

// ─── GET /mine  — meetings scheduled by the logged-in user ──────────────────
router.get('/mine', auth, async (req, res) => {
    try {
        const me = uid(req);
        const result = await executeQuery(`
            SELECT
                id, created_by, expert_name, title, description,
                FORMAT(scheduled_at, 'yyyy-MM-dd') AS date,
                FORMAT(scheduled_at, 'HH:mm') AS time,
                scheduled_at, duration_minutes,
                topic, region, meeting_type,
                teams_link, attendee_emails, lobby_bypass, status,
                created_at
            FROM expert_meetings
            WHERE created_by = '${me}'
            ORDER BY scheduled_at DESC
        `);
        res.json({ success: true, data: { meetings: result.recordset } });
    } catch (err) {
        console.error('GET /expert-meetings/mine error:', err);
        res.status(500).json({ success: false, message: 'Failed to load meetings' });
    }
});

// ─── POST /  — create a meeting record after opening Teams ──────────────────
router.post('/', auth, async (req, res) => {
    try {
        const me = uid(req);
        const {
            expert_name, title, description, date, time,
            topic, region, meeting_type, teams_link,
            attendee_emails, lobby_bypass
        } = req.body;

        if (!title || !date || !time) {
            return res.status(400).json({ success: false, message: 'title, date and time are required' });
        }

        const scheduledAt = new Date(`${date}T${time}`).toISOString();
        const safeTitle = (title || '').replace(/'/g, "''");
        const safeDesc = (description || '').replace(/'/g, "''");
        const safeName = (expert_name || '').replace(/'/g, "''");
        const safeTopic = (topic || '').replace(/'/g, "''");
        const safeRegion = (region || '').replace(/'/g, "''");
        const safeType = (meeting_type || 'webinar').replace(/'/g, "''");
        const safeLink = (teams_link || '').replace(/'/g, "''");
        const safeEmails = (Array.isArray(attendee_emails)
            ? attendee_emails.join(',')
            : (attendee_emails || '')).replace(/'/g, "''");
        const safeBypass = (lobby_bypass || 'organization').replace(/'/g, "''");

        const result = await executeQuery(`
            INSERT INTO expert_meetings
                (created_by, expert_name, title, description, scheduled_at, duration_minutes,
                 topic, region, meeting_type, teams_link, attendee_emails, lobby_bypass,
                 status, created_at, updated_at)
            OUTPUT INSERTED.*
            VALUES
                ('${me}', '${safeName}', '${safeTitle}', '${safeDesc}', '${scheduledAt}', 60,
                 '${safeTopic}', '${safeRegion}', '${safeType}', '${safeLink}', '${safeEmails}',
                 '${safeBypass}', 'scheduled', GETDATE(), GETDATE())
        `);

        res.status(201).json({ success: true, data: { meeting: result.recordset[0] } });
    } catch (err) {
        console.error('POST /expert-meetings error:', err);
        res.status(500).json({ success: false, message: 'Failed to save meeting' });
    }
});

// ─── DELETE /:id  — remove a meeting record ──────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
    try {
        const me = uid(req);
        const { id } = req.params;
        const check = await executeQuery(
            `SELECT id FROM expert_meetings WHERE id = '${id}' AND created_by = '${me}'`
        );
        if (!check.recordset.length) {
            return res.status(404).json({ success: false, message: 'Meeting not found or not yours' });
        }
        await executeQuery(`DELETE FROM expert_meetings WHERE id = '${id}'`);
        res.json({ success: true, message: 'Meeting deleted' });
    } catch (err) {
        console.error('DELETE /expert-meetings/:id error:', err);
        res.status(500).json({ success: false, message: 'Failed to delete meeting' });
    }
});

export default router;
