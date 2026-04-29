import { executeQuery } from './config/database.js';
// Find sessions-related table
const r = await executeQuery("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%session%' OR TABLE_NAME LIKE '%meeting%' ORDER BY TABLE_NAME");
console.log('session tables:', r.recordset.map(x=>x.TABLE_NAME).join(', ')||'(none)');
// Verify experts query now works post-migration
try {
  const r2 = await executeQuery(`
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
  console.log('experts query OK, rows:', r2.recordset.length);
  if (r2.recordset.length > 0) console.log('first expert:', JSON.stringify(r2.recordset[0]));
} catch(e) { console.log('experts query FAIL:', e.message.split('\n')[0]); }

// Test Opportunities table
try {
  const r3 = await executeQuery("SELECT COUNT(*) as c FROM Opportunities");
  console.log('Opportunities OK:', r3.recordset[0].c);
} catch(e) { console.log('Opportunities FAIL:', e.message.split('\n')[0]); }

process.exit(0);
