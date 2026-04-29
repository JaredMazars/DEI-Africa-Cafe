import { executeQuery } from './config/database.js';
try {
  const r1 = await executeQuery('SELECT TOP 1 * FROM experts');
  console.log('experts cols:', Object.keys(r1.recordset[0] || {}).join(', '));
} catch(e) { console.log('experts error:', e.message); }
try {
  const r2 = await executeQuery('SELECT TOP 1 * FROM expert_expertise');
  console.log('expert_expertise cols:', Object.keys(r2.recordset[0] || {}).join(', '));
} catch(e) { console.log('expert_expertise error:', e.message); }
try {
  // try the actual query
  const r3 = await executeQuery(`
    SELECT e.id, e.user_id, e.name, e.bio, e.location, e.avatar_url,
           e.is_verified, e.is_available, e.experience_years,
           e.created_at, e.updated_at,
           u.email, u.name AS user_name,
           STUFF((SELECT ',' + ee2.expertise FROM expert_expertise ee2
                  WHERE ee2.expert_id = e.id FOR XML PATH('')),1,1,'') AS expertise_list
    FROM experts e
    LEFT JOIN users u ON e.user_id = u.id
    ORDER BY e.is_verified ASC, e.created_at DESC
  `);
  console.log('query OK, rows:', r3.recordset.length);
} catch(e) { console.log('query error:', e.message); }
process.exit(0);
