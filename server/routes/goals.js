/**
 * /api/goals  &  /api/progress-reports
 *
 * Every mentor-mentee pair owns one connection_id.
 * All goals and reports are scoped to that connection_id,
 * so each relationship has its own independent dataset.
 */

import express from 'express';
import auth from '../middleware/auth.js';
import { executeQuery } from '../config/database.js';

const router = express.Router();

// ── helpers ──────────────────────────────────────────────────────────────────

/** Verify the calling user actually belongs to the connection */
async function ownConnection(connectionId, userId) {
    const r = await executeQuery(`
        SELECT c.id, e.user_id as mentor_user_id
        FROM   connections c
        INNER JOIN experts e ON e.id = c.expert_id
        WHERE  c.id = '${connectionId}'
    `);
    if (!r.recordset.length) return false;
    const row = r.recordset[0];
    return String(row.requester_id) === String(userId) ||
           String(row.mentor_user_id) === String(userId);
}

function esc(v) { return String(v || '').replace(/'/g, "''"); }

// ── GOALS ─────────────────────────────────────────────────────────────────────

// GET /api/goals?connection_id=xxx
router.get('/', auth, async (req, res) => {
    const { connection_id } = req.query;
    if (!connection_id) return res.status(400).json({ success: false, message: 'connection_id required' });

    try {
        // Fetch goals
        const goalsResult = await executeQuery(`
            SELECT g.*, u.name as created_by_name
            FROM   mentorship_goals g
            INNER JOIN users u ON u.id = g.created_by
            WHERE  g.connection_id = '${esc(connection_id)}'
            ORDER BY g.created_at ASC
        `);

        // Fetch all milestones for those goals in one query
        const goalIds = goalsResult.recordset.map(g => `'${g.id}'`).join(',');
        let milestones = [];
        let tasks = [];
        if (goalIds.length > 0) {
            const mResult = await executeQuery(`
                SELECT * FROM goal_milestones
                WHERE  goal_id IN (${goalIds})
                ORDER BY sort_order, created_at
            `);
            milestones = mResult.recordset;

            const milestoneIds = milestones.map(m => `'${m.id}'`).join(',');
            if (milestoneIds.length > 0) {
                const tResult = await executeQuery(`
                    SELECT * FROM goal_tasks
                    WHERE  milestone_id IN (${milestoneIds})
                    ORDER BY sort_order, created_at
                `);
                tasks = tResult.recordset;
            }
        }

        // Assemble nested structure
        const goals = goalsResult.recordset.map(g => ({
            ...g,
            milestones: milestones
                .filter(m => String(m.goal_id) === String(g.id))
                .map(m => ({
                    ...m,
                    tasks: tasks.filter(t => String(t.milestone_id) === String(m.id))
                }))
        }));

        res.json({ success: true, data: { goals } });
    } catch (err) {
        console.error('GET /api/goals error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch goals' });
    }
});

// POST /api/goals
router.post('/', auth, async (req, res) => {
    const {
        connection_id, title, description, specific, measurable, achievable,
        relevant, time_bound, category, priority, start_date, target_date,
        milestones = []
    } = req.body;

    if (!connection_id || !title) {
        return res.status(400).json({ success: false, message: 'connection_id and title required' });
    }

    try {
        // Insert goal
        const gResult = await executeQuery(`
            INSERT INTO mentorship_goals
                (connection_id, title, description, specific, measurable, achievable,
                 relevant, time_bound, category, priority, status, progress,
                 start_date, target_date, created_by, created_at, updated_at)
            OUTPUT INSERTED.*
            VALUES (
                '${esc(connection_id)}', '${esc(title)}',
                ${description ? `'${esc(description)}'` : 'NULL'},
                ${specific    ? `'${esc(specific)}'`    : 'NULL'},
                ${measurable  ? `'${esc(measurable)}'`  : 'NULL'},
                ${achievable  ? `'${esc(achievable)}'`  : 'NULL'},
                ${relevant    ? `'${esc(relevant)}'`    : 'NULL'},
                ${time_bound  ? `'${esc(time_bound)}'`  : 'NULL'},
                '${esc(category || 'technical')}',
                '${esc(priority || 'medium')}',
                'not-started', 0,
                ${start_date  ? `'${esc(start_date)}'`  : 'NULL'},
                ${target_date ? `'${esc(target_date)}'` : 'NULL'},
                '${esc(req.user.id)}', GETDATE(), GETDATE()
            )
        `);
        const goal = gResult.recordset[0];

        // Insert milestones if provided
        for (let i = 0; i < milestones.length; i++) {
            const m = milestones[i];
            await executeQuery(`
                INSERT INTO goal_milestones (goal_id, title, description, due_date, sort_order)
                VALUES ('${goal.id}', '${esc(m.title)}', ${m.description ? `'${esc(m.description)}'` : 'NULL'},
                        ${m.due_date ? `'${esc(m.due_date)}'` : 'NULL'}, ${i})
            `);
        }

        res.status(201).json({ success: true, data: { goal } });
    } catch (err) {
        console.error('POST /api/goals error:', err);
        res.status(500).json({ success: false, message: 'Failed to create goal' });
    }
});

// PUT /api/goals/:id  — update goal fields or progress
router.put('/:id', auth, async (req, res) => {
    const { id } = req.params;
    const fields = req.body;

    const allowed = ['title','description','specific','measurable','achievable','relevant',
                     'time_bound','category','priority','status','progress','target_date','completed_date'];
    const sets = allowed
        .filter(k => fields[k] !== undefined)
        .map(k => {
            const v = fields[k];
            if (v === null) return `${k} = NULL`;
            if (typeof v === 'number') return `${k} = ${v}`;
            return `${k} = '${esc(v)}'`;
        });

    if (!sets.length) return res.status(400).json({ success: false, message: 'Nothing to update' });

    try {
        await executeQuery(`
            UPDATE mentorship_goals
            SET    ${sets.join(', ')}, updated_at = GETDATE()
            WHERE  id = '${esc(id)}' AND created_by = '${esc(req.user.id)}'
                OR id = '${esc(id)}' AND connection_id IN (
                    SELECT c.id FROM connections c
                    INNER JOIN experts e ON e.id = c.expert_id
                    WHERE c.requester_id = '${esc(req.user.id)}'
                       OR e.user_id     = '${esc(req.user.id)}'
                )
        `);
        res.json({ success: true });
    } catch (err) {
        console.error('PUT /api/goals/:id error:', err);
        res.status(500).json({ success: false, message: 'Failed to update goal' });
    }
});

// DELETE /api/goals/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        await executeQuery(`DELETE FROM mentorship_goals WHERE id = '${esc(req.params.id)}'`);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete goal' });
    }
});

// PUT /api/goals/:goalId/tasks/:taskId  — toggle task complete
router.put('/:goalId/tasks/:taskId', auth, async (req, res) => {
    const { completed } = req.body;
    try {
        await executeQuery(`
            UPDATE goal_tasks
            SET    completed = ${completed ? 1 : 0},
                   completed_date = ${completed ? 'CAST(GETDATE() AS DATE)' : 'NULL'}
            WHERE  id = '${esc(req.params.taskId)}'
        `);

        // Recalculate milestone + goal progress
        const tRes = await executeQuery(`
            SELECT t.*, m.goal_id
            FROM   goal_tasks t
            INNER JOIN goal_milestones m ON m.id = t.milestone_id
            WHERE  t.id = '${esc(req.params.taskId)}'
        `);
        if (tRes.recordset.length) {
            const { milestone_id, goal_id } = tRes.recordset[0];

            // Update milestone completed flag
            const mTasks = await executeQuery(`SELECT completed FROM goal_tasks WHERE milestone_id = '${esc(milestone_id)}'`);
            const allDone = mTasks.recordset.every(t => t.completed);
            await executeQuery(`
                UPDATE goal_milestones
                SET completed = ${allDone ? 1 : 0},
                    completed_date = ${allDone ? 'CAST(GETDATE() AS DATE)' : 'NULL'}
                WHERE id = '${esc(milestone_id)}'
            `);

            // Update goal progress
            const allMilestones = await executeQuery(`SELECT completed FROM goal_milestones WHERE goal_id = '${esc(goal_id)}'`);
            const doneMilestones = allMilestones.recordset.filter(m => m.completed).length;
            const totalMilestones = allMilestones.recordset.length;
            const progress = totalMilestones > 0 ? Math.round((doneMilestones / totalMilestones) * 100) : 0;
            const status = progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'not-started';
            await executeQuery(`
                UPDATE mentorship_goals
                SET    progress = ${progress}, status = '${status}', updated_at = GETDATE()
                ${progress === 100 ? ", completed_date = CAST(GETDATE() AS DATE)" : ''}
                WHERE  id = '${esc(goal_id)}'
            `);
        }

        res.json({ success: true });
    } catch (err) {
        console.error('PUT /api/goals task error:', err);
        res.status(500).json({ success: false, message: 'Failed to update task' });
    }
});

// POST /api/goals/:goalId/milestones
router.post('/:goalId/milestones', auth, async (req, res) => {
    const { title, description, due_date, tasks = [] } = req.body;
    try {
        const mRes = await executeQuery(`
            INSERT INTO goal_milestones (goal_id, title, description, due_date)
            OUTPUT INSERTED.*
            VALUES ('${esc(req.params.goalId)}', '${esc(title)}',
                    ${description ? `'${esc(description)}'` : 'NULL'},
                    ${due_date ? `'${esc(due_date)}'` : 'NULL'})
        `);
        const milestone = mRes.recordset[0];
        for (const t of tasks) {
            await executeQuery(`
                INSERT INTO goal_tasks (milestone_id, title, assigned_to)
                VALUES ('${milestone.id}', '${esc(t.title)}', '${esc(t.assigned_to || 'mentee')}')
            `);
        }
        res.status(201).json({ success: true, data: { milestone } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to add milestone' });
    }
});

// ── PROGRESS REPORTS ──────────────────────────────────────────────────────────

// GET /api/progress-reports?connection_id=xxx
router.get('/progress-reports', auth, async (req, res) => {
    const { connection_id } = req.query;
    if (!connection_id) return res.status(400).json({ success: false, message: 'connection_id required' });

    try {
        const result = await executeQuery(`
            SELECT pr.*, g.title as goal_title, u.name as created_by_name
            FROM   progress_reports pr
            LEFT   JOIN mentorship_goals g ON g.id = pr.goal_id
            INNER  JOIN users u ON u.id = pr.created_by
            WHERE  pr.connection_id = '${esc(connection_id)}'
            ORDER  BY pr.created_at DESC
        `);

        const reports = result.recordset.map(r => ({
            ...r,
            achievements: r.achievements ? JSON.parse(r.achievements) : [],
            challenges:   r.challenges   ? JSON.parse(r.challenges)   : [],
            next_steps:   r.next_steps   ? JSON.parse(r.next_steps)   : [],
        }));

        res.json({ success: true, data: { reports } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch progress reports' });
    }
});

// POST /api/progress-reports
router.post('/progress-reports', auth, async (req, res) => {
    const {
        connection_id, goal_id, period, start_date, end_date,
        achievements = [], challenges = [], next_steps = [],
        mentee_feedback, mentor_feedback
    } = req.body;

    if (!connection_id || !start_date || !end_date) {
        return res.status(400).json({ success: false, message: 'connection_id, start_date, end_date required' });
    }

    try {
        const result = await executeQuery(`
            INSERT INTO progress_reports
                (connection_id, goal_id, period, start_date, end_date,
                 achievements, challenges, next_steps,
                 mentee_feedback, mentor_feedback, created_by, created_at, updated_at)
            OUTPUT INSERTED.*
            VALUES (
                '${esc(connection_id)}',
                ${goal_id ? `'${esc(goal_id)}'` : 'NULL'},
                '${esc(period || 'weekly')}',
                '${esc(start_date)}', '${esc(end_date)}',
                '${esc(JSON.stringify(achievements))}',
                '${esc(JSON.stringify(challenges))}',
                '${esc(JSON.stringify(next_steps))}',
                ${mentee_feedback  ? `'${esc(mentee_feedback)}'`  : 'NULL'},
                ${mentor_feedback  ? `'${esc(mentor_feedback)}'`  : 'NULL'},
                '${esc(req.user.id)}', GETDATE(), GETDATE()
            )
        `);
        res.status(201).json({ success: true, data: { report: result.recordset[0] } });
    } catch (err) {
        console.error('POST /api/progress-reports error:', err);
        res.status(500).json({ success: false, message: 'Failed to create progress report' });
    }
});

// PUT /api/progress-reports/:id  — add mentor feedback
router.put('/progress-reports/:id', auth, async (req, res) => {
    const { mentor_feedback, mentee_feedback } = req.body;
    const sets = [];
    if (mentor_feedback !== undefined) sets.push(`mentor_feedback = '${esc(mentor_feedback)}'`);
    if (mentee_feedback !== undefined) sets.push(`mentee_feedback = '${esc(mentee_feedback)}'`);
    if (!sets.length) return res.status(400).json({ success: false, message: 'Nothing to update' });

    try {
        await executeQuery(`
            UPDATE progress_reports
            SET ${sets.join(', ')}, updated_at = GETDATE()
            WHERE id = '${esc(req.params.id)}'
        `);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update report' });
    }
});

export default router;
