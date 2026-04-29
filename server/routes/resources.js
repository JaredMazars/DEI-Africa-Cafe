import express from 'express';
import auth from '../middleware/auth.js';
import { executeQuery } from '../config/database.js';

const router = express.Router();

// ── GET /api/resources — list all active resources ───────────────────────────
router.get('/', auth, async (req, res) => {
    try {
        const { category, type, search } = req.query;
        let where = "WHERE r.is_active = 1";
        if (category) where += ` AND r.category = '${category.replace(/'/g, "''")}'`;
        if (type)     where += ` AND r.type = '${type.replace(/'/g, "''")}'`;
        if (search)   where += ` AND (r.title LIKE '%${search.replace(/'/g, "''")}%' OR r.description LIKE '%${search.replace(/'/g, "''")}%')`;

        const result = await executeQuery(`
            SELECT
                r.id, r.title, r.type, r.category, r.url, r.description,
                r.uploader_name as uploadedBy, r.downloads, r.rating,
                FORMAT(r.created_at, 'yyyy-MM-dd') as uploadDate
            FROM resources r
            ${where}
            ORDER BY r.created_at DESC
        `);
        res.json({ success: true, data: { resources: result.recordset } });
    } catch (error) {
        console.error('Error fetching resources:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch resources' });
    }
});

// ── POST /api/resources — create resource ────────────────────────────────────
router.post('/', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user.user_id;
        const { title, type, category, url, description } = req.body;
        if (!title || !url) return res.status(400).json({ success: false, message: 'title and url required' });

        // Get uploader name
        const userRes = await executeQuery(`SELECT name FROM users WHERE id='${userId}'`);
        const uploaderName = userRes.recordset[0]?.name || 'Unknown';

        const ins = await executeQuery(`
            INSERT INTO resources (title, type, category, url, description, uploaded_by, uploader_name, is_active, created_at, updated_at)
            OUTPUT INSERTED.id
            VALUES (
                '${title.replace(/'/g, "''")}',
                '${(type || 'article').replace(/'/g, "''")}',
                '${(category || 'General').replace(/'/g, "''")}',
                '${url.replace(/'/g, "''")}',
                ${description ? `'${description.replace(/'/g, "''")}'` : 'NULL'},
                '${userId}', '${uploaderName}', 1,
                GETDATE(), GETDATE()
            )
        `);
        res.status(201).json({ success: true, data: { id: ins.recordset[0].id } });
    } catch (error) {
        console.error('Error creating resource:', error);
        res.status(500).json({ success: false, message: 'Failed to create resource' });
    }
});

// ── PUT /api/resources/:id/download — increment download count ───────────────
router.put('/:id/download', auth, async (req, res) => {
    try {
        await executeQuery(`UPDATE resources SET downloads = downloads + 1 WHERE id = '${req.params.id}'`);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to record download' });
    }
});

// ── DELETE /api/resources/:id — soft delete ──────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
    try {
        await executeQuery(`UPDATE resources SET is_active=0, updated_at=GETDATE() WHERE id='${req.params.id}'`);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete resource' });
    }
});

export default router;
