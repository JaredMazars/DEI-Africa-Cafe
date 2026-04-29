import { executeQuery } from './config/database.js';
// Check resources table structure
const r = await executeQuery("SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='resources' ORDER BY ORDINAL_POSITION");
r.recordset.forEach(c => console.log(c.COLUMN_NAME, c.DATA_TYPE, c.IS_NULLABLE, c.COLUMN_DEFAULT));

// Try minimal insert
try {
  const ins = await executeQuery(`
    INSERT INTO resources (title, type, category, url, description, uploaded_by, uploader_name, is_active, created_at, updated_at)
    OUTPUT INSERTED.id
    VALUES ('Test Resource', 'article', 'General', 'https://example.com', NULL, 'admin', 'Admin', 1, GETDATE(), GETDATE())
  `);
  console.log('INSERT OK, id:', ins.recordset[0]?.id);
  // cleanup
  await executeQuery(`DELETE FROM resources WHERE title='Test Resource'`);
} catch(e) { console.log('INSERT FAIL:', e.message.split('\n')[0]); }

process.exit(0);
