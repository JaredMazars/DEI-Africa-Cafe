import express from 'express';
import auth from '../middleware/auth.js';
import { executeQuery } from '../config/database.js';

const router = express.Router();

// ── GET /api/learning-paths?connection_id=xxx ─────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const { connection_id } = req.query;
    if (!connection_id) return res.status(400).json({ success: false, message: 'connection_id required' });

    const paths = await executeQuery(`
      SELECT lp.id, lp.title, lp.description, lp.level, lp.duration,
             lp.progress, lp.enrolled, lp.created_at
      FROM learning_paths lp
      WHERE lp.connection_id = '${connection_id}'
      ORDER BY lp.created_at ASC
    `);

    const result = [];
    for (const path of paths.recordset) {
      const mods = await executeQuery(`
        SELECT id, title, description, duration, sort_order,
               completed, completed_date, resources_json
        FROM learning_modules
        WHERE path_id = '${path.id}'
        ORDER BY sort_order ASC
      `);
      result.push({
        ...path,
        modules: mods.recordset.map(m => ({
          ...m,
          resources: m.resources_json ? JSON.parse(m.resources_json) : [],
        })),
      });
    }

    res.json({ success: true, data: { paths: result } });
  } catch (err) {
    console.error('Error fetching learning paths:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch learning paths' });
  }
});

// ── POST /api/learning-paths ──────────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user.user_id;
    const { connection_id, title, description, level = 'beginner', duration = '' } = req.body;
    if (!connection_id || !title) return res.status(400).json({ success: false, message: 'connection_id and title required' });

    const r = await executeQuery(`
      INSERT INTO learning_paths (connection_id, title, description, level, duration, created_by)
      OUTPUT INSERTED.id
      VALUES (
        '${connection_id}',
        '${title.replace(/'/g, "''")}',
        ${description ? `'${description.replace(/'/g, "''")}'` : 'NULL'},
        '${level}',
        '${duration.replace(/'/g, "''")}',
        '${userId}'
      )
    `);
    res.status(201).json({ success: true, data: { id: r.recordset[0].id } });
  } catch (err) {
    console.error('Error creating learning path:', err);
    res.status(500).json({ success: false, message: 'Failed to create learning path' });
  }
});

// ── POST /api/learning-paths/:pathId/modules ─────────────────────────────────
router.post('/:pathId/modules', auth, async (req, res) => {
  try {
    const { pathId } = req.params;
    const { title, description, duration = '', sort_order = 0, resources_json = '[]' } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'title required' });

    const r = await executeQuery(`
      INSERT INTO learning_modules (path_id, title, description, duration, sort_order, resources_json)
      OUTPUT INSERTED.id
      VALUES (
        '${pathId}',
        '${title.replace(/'/g, "''")}',
        ${description ? `'${description.replace(/'/g, "''")}'` : 'NULL'},
        '${duration.replace(/'/g, "''")}',
        ${sort_order},
        '${JSON.stringify(typeof resources_json === 'string' ? JSON.parse(resources_json) : resources_json).replace(/'/g, "''")}'
      )
    `);
    res.status(201).json({ success: true, data: { id: r.recordset[0].id } });
  } catch (err) {
    console.error('Error creating module:', err);
    res.status(500).json({ success: false, message: 'Failed to create module' });
  }
});

// ── PUT /api/learning-paths/:pathId/modules/:moduleId/complete ───────────────
router.put('/:pathId/modules/:moduleId/complete', auth, async (req, res) => {
  try {
    const { pathId, moduleId } = req.params;
    const { completed } = req.body;

    await executeQuery(`
      UPDATE learning_modules
      SET completed = ${completed ? 1 : 0},
          completed_date = ${completed ? 'GETDATE()' : 'NULL'},
          updated_at = GETDATE()
      WHERE id = '${moduleId}' AND path_id = '${pathId}'
    `);

    // Recalculate path progress
    const stats = await executeQuery(`
      SELECT COUNT(*) as total, SUM(CAST(completed AS INT)) as done
      FROM learning_modules WHERE path_id = '${pathId}'
    `);
    const { total, done } = stats.recordset[0];
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    await executeQuery(`
      UPDATE learning_paths SET progress = ${progress}, enrolled = 1, updated_at = GETDATE()
      WHERE id = '${pathId}'
    `);

    res.json({ success: true, data: { progress } });
  } catch (err) {
    console.error('Error completing module:', err);
    res.status(500).json({ success: false, message: 'Failed to update module' });
  }
});

// ── POST /api/learning-paths/:pathId/enroll ───────────────────────────────────
router.post('/:pathId/enroll', auth, async (req, res) => {
  try {
    const { pathId } = req.params;
    await executeQuery(`UPDATE learning_paths SET enrolled = 1, updated_at = GETDATE() WHERE id = '${pathId}'`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to enroll' });
  }
});

// ── DELETE /api/learning-paths/:pathId ───────────────────────────────────────
router.delete('/:pathId', auth, async (req, res) => {
  try {
    await executeQuery(`DELETE FROM learning_paths WHERE id = '${req.params.pathId}'`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete path' });
  }
});

export default router;
