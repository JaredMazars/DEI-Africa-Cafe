/**
 * /api/expert-webinars
 * CRUD for group webinars created by experts.
 */
import express from 'express';
import auth from '../middleware/auth.js';
import { executeQuery } from '../config/database.js';

const router = express.Router();
const uid = req => req.user.id || req.user.user_id;

// ─── GET /  — list all webinars (public = any user, private = created_by only) ─
router.get('/', auth, async (req, res) => {
    try {
        const me = uid(req);
        const result = await executeQuery(`
            SELECT
                id, created_by, expert_name, title, description,
                FORMAT(scheduled_at, 'yyyy-MM-dd') AS date,
                FORMAT(scheduled_at, 'HH:mm') AS time,
                scheduled_at, duration_minutes,
                topic, region, max_attendees, attendee_count,
                teams_link, invited_emails, is_private, status,
                created_at
            FROM expert_webinars
            WHERE is_private = 0
               OR created_by = '${me}'
            ORDER BY scheduled_at DESC
        `);
        res.json({ success: true, data: { webinars: result.recordset } });
    } catch (err) {
        console.error('GET /expert-webinars error:', err);
        res.status(500).json({ success: false, message: 'Failed to load webinars' });
    }
});

// ─── GET /mine  — only webinars created by the logged-in expert ──────────────
router.get('/mine', auth, async (req, res) => {
    try {
        const me = uid(req);
        const result = await executeQuery(`
            SELECT
                id, created_by, expert_name, title, description,
                FORMAT(scheduled_at, 'yyyy-MM-dd') AS date,
                FORMAT(scheduled_at, 'HH:mm') AS time,
                scheduled_at, duration_minutes,
                topic, region, max_attendees, attendee_count,
                teams_link, invited_emails, is_private, status,
                created_at
            FROM expert_webinars
            WHERE created_by = '${me}'
            ORDER BY scheduled_at DESC
        `);
        res.json({ success: true, data: { webinars: result.recordset } });
    } catch (err) {
        console.error('GET /expert-webinars/mine error:', err);
        res.status(500).json({ success: false, message: 'Failed to load your webinars' });
    }
});

// ─── POST /  — create a new webinar ─────────────────────────────────────────
router.post('/', auth, async (req, res) => {
    try {
        const me = uid(req);
        const {
            expert_name, title, description, date, time,
            topic, region, max_attendees, teams_link,
            invited_emails, is_private, lobby_bypass
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
        const safeLink = (teams_link || '').replace(/'/g, "''");
        const safeEmails = (Array.isArray(invited_emails) ? invited_emails.join(',') : (invited_emails || '')).replace(/'/g, "''");
        const maxAtt = parseInt(max_attendees) || 50;
        const isPriv = is_private ? 1 : 0;

        const result = await executeQuery(`
            INSERT INTO expert_webinars
                (created_by, expert_name, title, description, scheduled_at, duration_minutes,
                 topic, region, max_attendees, attendee_count, teams_link,
                 invited_emails, is_private, status, created_at, updated_at)
            OUTPUT INSERTED.*
            VALUES
                ('${me}', '${safeName}', '${safeTitle}', '${safeDesc}', '${scheduledAt}', 60,
                 '${safeTopic}', '${safeRegion}', ${maxAtt}, 0, '${safeLink}',
                 '${safeEmails}', ${isPriv}, 'scheduled', GETDATE(), GETDATE())
        `);

        res.status(201).json({ success: true, data: { webinar: result.recordset[0] } });
    } catch (err) {
        console.error('POST /expert-webinars error:', err);
        res.status(500).json({ success: false, message: 'Failed to create webinar' });
    }
});

// ─── DELETE /:id  — expert deletes their own webinar ─────────────────────────
router.delete('/:id', auth, async (req, res) => {
    try {
        const me = uid(req);
        const { id } = req.params;
        const check = await executeQuery(
            `SELECT id FROM expert_webinars WHERE id = '${id}' AND created_by = '${me}'`
        );
        if (!check.recordset.length) {
            return res.status(404).json({ success: false, message: 'Webinar not found or not yours' });
        }
        await executeQuery(`DELETE FROM expert_webinars WHERE id = '${id}'`);
        res.json({ success: true, message: 'Webinar deleted' });
    } catch (err) {
        console.error('DELETE /expert-webinars/:id error:', err);
        res.status(500).json({ success: false, message: 'Failed to delete webinar' });
    }
});

// ─── POST /:id/register — user registers to attend a webinar ─────────────────
router.post('/:id/register', auth, async (req, res) => {
    try {
        const me = uid(req);
        const { id } = req.params;
        // Ensure webinar exists
        const check = await executeQuery(
            `SELECT id FROM expert_webinars WHERE id = '${id}'`
        );
        if (!check.recordset.length) {
            return res.status(404).json({ success: false, message: 'Webinar not found' });
        }
        // Insert (ignore duplicate)
        await executeQuery(`
            IF NOT EXISTS (SELECT 1 FROM webinar_registrations WHERE webinar_id = '${id}' AND user_id = '${me}')
            INSERT INTO webinar_registrations (webinar_id, user_id) VALUES ('${id}', '${me}')
        `);
        // Bump attendee count
        await executeQuery(`
            UPDATE expert_webinars SET attendee_count = (
                SELECT COUNT(*) FROM webinar_registrations WHERE webinar_id = '${id}'
            ) WHERE id = '${id}'
        `);
        res.json({ success: true, message: 'Registered for webinar' });
    } catch (err) {
        console.error('POST /expert-webinars/:id/register error:', err);
        res.status(500).json({ success: false, message: 'Failed to register' });
    }
});

// ─── DELETE /:id/register — unregister from a webinar ───────────────────────
router.delete('/:id/register', auth, async (req, res) => {
    try {
        const me = uid(req);
        const { id } = req.params;
        await executeQuery(
            `DELETE FROM webinar_registrations WHERE webinar_id = '${id}' AND user_id = '${me}'`
        );
        await executeQuery(`
            UPDATE expert_webinars SET attendee_count = (
                SELECT COUNT(*) FROM webinar_registrations WHERE webinar_id = '${id}'
            ) WHERE id = '${id}'
        `);
        res.json({ success: true, message: 'Unregistered from webinar' });
    } catch (err) {
        console.error('DELETE /expert-webinars/:id/register error:', err);
        res.status(500).json({ success: false, message: 'Failed to unregister' });
    }
});

// ─── GET /registered — webinars the current user is registered for ───────────
router.get('/registered', auth, async (req, res) => {
    try {
        const me = uid(req);
        const result = await executeQuery(`
            SELECT w.id, w.title, w.expert_name AS expert,
                   COALESCE(u.avatar_url, '') AS expertAvatar,
                   FORMAT(w.scheduled_at, 'MMM dd, yyyy') AS date,
                   FORMAT(w.scheduled_at, 'HH:mm') AS time,
                   w.topic, w.region, w.teams_link AS teamsLink,
                   w.description, w.attendee_count AS attendees, w.max_attendees AS maxAttendees,
                   r.registered_at
            FROM webinar_registrations r
            INNER JOIN expert_webinars w ON w.id = r.webinar_id
            LEFT JOIN users u ON u.id = w.created_by
            WHERE r.user_id = '${me}'
            ORDER BY w.scheduled_at ASC
        `);
        res.json({ success: true, data: { registeredWebinars: result.recordset || [] } });
    } catch (err) {
        console.error('GET /expert-webinars/registered error:', err);
        res.status(500).json({ success: false, message: 'Failed to load registered webinars' });
    }
});

export default router;
