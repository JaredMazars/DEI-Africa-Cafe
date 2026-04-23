import express from 'express';
import auth from '../middleware/auth.js';
import { executeQuery } from '../config/database.js';

const router = express.Router();

// ── GET /api/reflections ─────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
    try {
        const { category, search } = req.query;
        let where = "WHERE r.is_active = 1";
        if (category && category !== 'all') where += ` AND r.category = '${category.replace(/'/g, "''")}'`;
        if (search) where += ` AND (r.title LIKE '%${search.replace(/'/g, "''")}%' OR r.content LIKE '%${search.replace(/'/g, "''")}%')`;

        const result = await executeQuery(`
            SELECT
                r.id, r.category, r.title, r.content, r.key_takeaways, r.tags,
                r.rating, r.is_anonymous, r.reactions, r.created_at,
                CASE WHEN r.is_anonymous = 1 THEN 'Anonymous' ELSE u.name END as userName,
                u.role as userRole,
                u.avatar_url as avatar,
                (SELECT COUNT(*) FROM reflection_comments rc WHERE rc.reflection_id = r.id) as commentCount
            FROM reflections r
            INNER JOIN users u ON u.id = r.user_id
            ${where}
            ORDER BY r.created_at DESC
        `);

        const reflections = result.recordset.map(row => ({
            ...row,
            keyTakeaways: row.key_takeaways ? JSON.parse(row.key_takeaways) : [],
            tags: row.tags ? row.tags.split(',').filter(Boolean) : [],
            reactions: row.reactions ? JSON.parse(row.reactions) : {},
        }));

        res.json({ success: true, data: { reflections } });
    } catch (error) {
        console.error('Error fetching reflections:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch reflections' });
    }
});

// ── GET /api/reflections/:id/comments ────────────────────────────────────────
router.get('/:id/comments', auth, async (req, res) => {
    try {
        const result = await executeQuery(`
            SELECT
                rc.id, rc.content, rc.is_anonymous, rc.created_at,
                CASE WHEN rc.is_anonymous = 1 THEN 'Anonymous' ELSE u.name END as userName,
                u.role as userRole
            FROM reflection_comments rc
            INNER JOIN users u ON u.id = rc.user_id
            WHERE rc.reflection_id = '${req.params.id}'
            ORDER BY rc.created_at ASC
        `);
        res.json({ success: true, data: { comments: result.recordset } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch comments' });
    }
});

// ── POST /api/reflections ────────────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user.user_id;
        const { category, title, content, keyTakeaways, tags, rating, isAnonymous } = req.body;
        if (!title || !content) return res.status(400).json({ success: false, message: 'title and content required' });

        const ins = await executeQuery(`
            INSERT INTO reflections (user_id, category, title, content, key_takeaways, tags, rating, is_anonymous, created_at, updated_at)
            OUTPUT INSERTED.id
            VALUES (
                '${userId}',
                '${(category || 'General').replace(/'/g, "''")}',
                '${title.replace(/'/g, "''")}',
                '${content.replace(/'/g, "''")}',
                '${JSON.stringify(keyTakeaways || []).replace(/'/g, "''")}',
                '${(tags || []).join(',').replace(/'/g, "''")}',
                ${rating || 'NULL'},
                ${isAnonymous ? 1 : 0},
                GETDATE(), GETDATE()
            )
        `);
        res.status(201).json({ success: true, data: { id: ins.recordset[0].id } });
    } catch (error) {
        console.error('Error creating reflection:', error);
        res.status(500).json({ success: false, message: 'Failed to create reflection' });
    }
});

// ── POST /api/reflections/:id/comments ───────────────────────────────────────
router.post('/:id/comments', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user.user_id;
        const { content, isAnonymous } = req.body;
        if (!content) return res.status(400).json({ success: false, message: 'content required' });

        const ins = await executeQuery(`
            INSERT INTO reflection_comments (reflection_id, user_id, content, is_anonymous, created_at)
            OUTPUT INSERTED.id
            VALUES ('${req.params.id}', '${userId}', '${content.replace(/'/g, "''")}', ${isAnonymous ? 1 : 0}, GETDATE())
        `);
        res.status(201).json({ success: true, data: { id: ins.recordset[0].id } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to post comment' });
    }
});

// ── PUT /api/reflections/:id/react ───────────────────────────────────────────
router.put('/:id/react', auth, async (req, res) => {
    try {
        const { emoji } = req.body;
        const current = await executeQuery(`SELECT reactions FROM reflections WHERE id='${req.params.id}'`);
        if (current.recordset.length === 0) return res.status(404).json({ success: false });
        const reactions = JSON.parse(current.recordset[0].reactions || '{}');
        reactions[emoji] = (reactions[emoji] || 0) + 1;
        await executeQuery(`UPDATE reflections SET reactions='${JSON.stringify(reactions).replace(/'/g, "''")}' WHERE id='${req.params.id}'`);
        res.json({ success: true, data: { reactions } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to react' });
    }
});

export default router;
