import express from 'express';
import https from 'https';
import http from 'http';
import auth from '../middleware/auth.js';
import { executeQuery } from '../config/database.js';
import { cache } from '../utils/cache.js';

const router = express.Router();

// ── GET /api/resources — list all active resources ───────────────────────────
router.get('/', auth, async (req, res) => {
    try {
        const { category, type, search } = req.query;
        // Cache key encodes all filter params (5-minute TTL)
        const cacheKey = `resources:${category || ''}:${type || ''}:${search || ''}`;
        const cached = cache.get(cacheKey);
        if (cached) return res.json(cached);
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
        const responseData = { success: true, data: { resources: result.recordset } };
        cache.set(cacheKey, responseData, 300); // 5-minute cache
        res.json(responseData);
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
        cache.invalidatePattern('resources:'); // bust list cache
        res.status(201).json({ success: true, data: { id: ins.recordset[0].id } });
    } catch (error) {
        console.error('Error creating resource:', error);
        res.status(500).json({ success: false, message: 'Failed to create resource' });
    }
});

// ── GET /api/resources/proxy-pdf — server-side proxy for external PDFs ────────
router.get('/proxy-pdf', auth, async (req, res) => {
    try {
        const { url, filename } = req.query;
        if (!url) return res.status(400).json({ success: false, message: 'url required' });

        // Only allow http/https URLs
        let parsedUrl;
        try { parsedUrl = new URL(url); } catch { return res.status(400).json({ success: false, message: 'Invalid URL' }); }
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) return res.status(400).json({ success: false, message: 'Invalid protocol' });

        const proto = parsedUrl.protocol === 'https:' ? https : http;
        const safeFilename = (filename || 'document').replace(/[^a-z0-9_\-\.]/gi, '_');

        const request = proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (upstream) => {
            // Follow redirects (up to 3 hops)
            if ([301,302,303,307,308].includes(upstream.statusCode) && upstream.headers.location) {
                const loc = upstream.headers.location;
                const redirProto = loc.startsWith('https') ? https : http;
                redirProto.get(loc, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (redir) => {
                    res.setHeader('Content-Type', redir.headers['content-type'] || 'application/pdf');
                    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}.pdf"`);
                    redir.pipe(res);
                }).on('error', () => res.status(502).json({ success: false, message: 'Redirect fetch failed' }));
                return;
            }
            if (upstream.statusCode !== 200) {
                return res.status(502).json({ success: false, message: `Upstream returned ${upstream.statusCode}` });
            }
            res.setHeader('Content-Type', upstream.headers['content-type'] || 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}.pdf"`);
            if (upstream.headers['content-length']) res.setHeader('Content-Length', upstream.headers['content-length']);
            upstream.pipe(res);
        });
        request.on('error', (err) => {
            console.error('Proxy PDF error:', err.message);
            if (!res.headersSent) res.status(502).json({ success: false, message: 'Failed to fetch PDF' });
        });
    } catch (error) {
        console.error('Proxy PDF error:', error);
        if (!res.headersSent) res.status(500).json({ success: false, message: 'Proxy error' });
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
