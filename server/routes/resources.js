import express from 'express';
import https from 'https';
import http from 'http';
import multer from 'multer';
import { BlobServiceClient } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';
import auth from '../middleware/auth.js';
import { executeQuery } from '../config/database.js';
import { cache } from '../utils/cache.js';

// Multer — store file in memory (max 50 MB) for direct Azure Blob upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowed = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/webm',
            'application/zip',
        ];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Unsupported file type'));
    },
});

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

// ── POST /api/resources/upload — upload file to Azure Blob Storage ─────────────
router.post('/upload', auth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file provided' });

        const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;
        const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'resources';

        if (!connStr || connStr.includes('YOUR_ACCOUNT_NAME')) {
            return res.status(503).json({ success: false, message: 'Azure Blob Storage is not configured. Please set AZURE_STORAGE_CONNECTION_STRING in .env' });
        }

        const blobServiceClient = BlobServiceClient.fromConnectionString(connStr);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        // Ensure container exists (public blob read access)
        await containerClient.createIfNotExists({ access: 'blob' });

        const ext = req.file.originalname.split('.').pop();
        const blobName = `${uuidv4()}.${ext}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        await blockBlobClient.uploadData(req.file.buffer, {
            blobHTTPHeaders: { blobContentType: req.file.mimetype },
        });

        const blobUrl = blockBlobClient.url;

        // Optionally auto-create the resource DB record when metadata is provided
        const { title, type, category, description, connection_id } = req.body;
        let insertedId = null;
        if (title) {
            const userId = req.user.id || req.user.user_id;
            const userRes = await executeQuery(`SELECT name FROM users WHERE id='${userId}'`);
            const uploaderName = userRes.recordset[0]?.name || 'Unknown';
            const ins = await executeQuery(`
                INSERT INTO resources (title, type, category, url, description, uploaded_by, uploader_name, is_active, created_at, updated_at)
                OUTPUT INSERTED.id
                VALUES (
                    '${title.replace(/'/g, "''")}',
                    '${((type || 'article')).replace(/'/g, "''")}',
                    '${((category || 'General')).replace(/'/g, "''")}',
                    '${blobUrl.replace(/'/g, "''")}',
                    ${description ? `'${description.replace(/'/g, "''")}'` : 'NULL'},
                    '${userId}', '${uploaderName}', 1,
                    GETDATE(), GETDATE()
                )
            `);
            insertedId = ins.recordset[0]?.id;
            cache.invalidatePattern('resources:');
        }

        res.status(201).json({
            success: true,
            data: {
                url: blobUrl,
                blobName,
                id: insertedId,
                title,
                type: type || 'article',
                category: category || 'General',
                description,
                uploadedBy: req.user?.name || 'Forvis Mazars',
            },
        });
    } catch (error) {
        console.error('Blob upload error:', error);
        res.status(500).json({ success: false, message: error.message || 'Upload failed' });
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
