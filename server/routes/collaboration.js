import express from 'express';
import { executeQuery } from '../config/database.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /groups - groups where the current user is a member
router.get('/groups', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await executeQuery(`
      SELECT g.id, g.name, g.description, g.creator_id, g.opportunity_id, g.status,
             g.created_at, g.last_activity, g.teams_link,
             (SELECT COUNT(*) FROM collaboration_group_members WHERE group_id = g.id) AS member_count
      FROM collaboration_groups g
      INNER JOIN collaboration_group_members m ON m.group_id = g.id AND m.user_id = '${userId}'
      ORDER BY g.last_activity DESC
    `, {});
    const groups = [];
    for (const g of result.recordset || []) {
      const memResult = await executeQuery(`
        SELECT cgm.user_id AS id, cgm.role, u.name, COALESCE(u.avatar_url,'') AS avatar
        FROM collaboration_group_members cgm
        INNER JOIN users u ON u.id = cgm.user_id
        WHERE cgm.group_id = '${g.id}'
      `, {});
      groups.push({ ...g, members: memResult.recordset || [] });
    }
    res.json({ success: true, data: { groups } });
  } catch (err) {
    console.error('GET /collaboration/groups error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/groups', auth, async (req, res) => {
  try {
    const { name, description, opportunityId, teamsLink } = req.body;
    const userId = req.user.id;
    const safeName = (name || 'New Group').replace(/'/g, "''");
    const safeDesc = (description || '').replace(/'/g, "''");
    const safeTeams = (teamsLink || '').replace(/'/g, "''");
    const oppVal = opportunityId ? `'${String(opportunityId).replace(/'/g, "''")}'` : 'NULL';
    const result = await executeQuery(`
      INSERT INTO collaboration_groups (name, description, creator_id, opportunity_id, teams_link)
      OUTPUT INSERTED.id
      VALUES ('${safeName}', '${safeDesc}', '${userId}', ${oppVal}, '${safeTeams}')
    `, {});
    const groupId = result.recordset[0].id;
    await executeQuery(`INSERT INTO collaboration_group_members (group_id, user_id, role) VALUES ('${groupId}', '${userId}', 'Lead')`, {});
    res.json({ success: true, data: { id: groupId } });
  } catch (err) {
    console.error('POST /collaboration/groups error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/groups/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    await executeQuery(`DELETE FROM collaboration_group_members WHERE group_id = '${id}'`, {});
    await executeQuery(`DELETE FROM collaboration_groups WHERE id = '${id}' AND creator_id = '${userId}'`, {});
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /collaboration/groups error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/groups/:id/members', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;
    const safeRole = (role || 'Member').replace(/'/g, "''");
    await executeQuery(`
      IF NOT EXISTS (SELECT 1 FROM collaboration_group_members WHERE group_id = '${id}' AND user_id = '${userId}')
        INSERT INTO collaboration_group_members (group_id, user_id, role) VALUES ('${id}', '${userId}', '${safeRole}')
    `, {});
    await executeQuery(`UPDATE collaboration_groups SET last_activity = GETDATE() WHERE id = '${id}'`, {});
    res.json({ success: true });
  } catch (err) {
    console.error('POST /collaboration/groups/:id/members error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/groups/:id/members/:userId', auth, async (req, res) => {
  try {
    const { id, userId } = req.params;
    await executeQuery(`DELETE FROM collaboration_group_members WHERE group_id = '${id}' AND user_id = '${userId}'`, {});
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /collaboration/groups/:id/members error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/applications', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await executeQuery(`
      SELECT a.id, a.opportunity_id, a.message, a.status, a.submitted_at,
             u.id AS applicant_id, u.name AS applicant_name, u.email AS applicant_email,
             COALESCE(u.avatar_url, '') AS applicant_avatar,
             COALESCE(u.bio, '') AS applicant_organization,
             COALESCE(u.role, '') AS applicant_role,
             o.title AS opportunity_title
      FROM opportunity_applications a
      INNER JOIN users u ON u.id = a.applicant_id
      INNER JOIN Opportunities o ON CAST(o.opportunity_id AS NVARCHAR(255)) = a.opportunity_id
      WHERE o.contact_person_id = '${userId}'
      ORDER BY a.submitted_at DESC
    `, {});
    res.json({ success: true, data: { applications: result.recordset || [] } });
  } catch (err) {
    console.error('GET /collaboration/applications error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/applications', auth, async (req, res) => {
  try {
    const { opportunityId, message } = req.body;
    const userId = req.user.id;
    const oppId = String(opportunityId).replace(/'/g, "''");
    const safeMsg = (message || '').replace(/'/g, "''");
    const existing = await executeQuery(`SELECT id FROM opportunity_applications WHERE opportunity_id = '${oppId}' AND applicant_id = '${userId}'`, {});
    if (existing.recordset.length > 0) {
      return res.status(409).json({ success: false, message: 'You have already expressed interest in this opportunity.' });
    }
    await executeQuery(`INSERT INTO opportunity_applications (opportunity_id, applicant_id, message) VALUES ('${oppId}', '${userId}', '${safeMsg}')`, {});
    res.json({ success: true, message: 'Application submitted' });
  } catch (err) {
    console.error('POST /collaboration/applications error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/applications/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const safeStatus = (req.body.status || '').replace(/'/g, "''");
    await executeQuery(`UPDATE opportunity_applications SET status = '${safeStatus}' WHERE id = '${id}'`, {});
    res.json({ success: true });
  } catch (err) {
    console.error('PUT /collaboration/applications error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/case-studies', auth, async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT cs.id, cs.title, cs.industry, cs.region,
             COALESCE(u.name, 'Unknown') AS author, COALESCE(u.avatar_url, '') AS author_avatar,
             cs.summary, cs.download_count, cs.published_at, cs.tags
      FROM case_studies cs
      LEFT JOIN users u ON u.id = cs.author_id
      ORDER BY cs.published_at DESC
    `, {});
    res.json({ success: true, data: { caseStudies: result.recordset || [] } });
  } catch (err) {
    console.error('GET /collaboration/case-studies error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/deals', auth, async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT id, client_name, deal_value AS value, stage, regions, probability, expected_close, team_lead_name AS teamLead
      FROM deal_pipeline ORDER BY created_at DESC
    `, {});
    res.json({ success: true, data: { deals: result.recordset || [] } });
  } catch (err) {
    console.error('GET /collaboration/deals error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
