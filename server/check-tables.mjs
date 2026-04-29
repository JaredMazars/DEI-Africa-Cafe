import { executeQuery } from './config/database.js';
const tables = ['users','resources','Opportunities','admin_audit_log','admin_notifications','admin_content'];
for (const t of tables) {
  try {
    const r = await executeQuery(`SELECT TOP 1 * FROM ${t}`);
    console.log(`${t}: ${Object.keys(r.recordset[0]||{}).join(', ')||'(empty)'}`);
  } catch(e) { console.log(`${t}: ERROR - ${e.message.split('\n')[0]}`); }
}
process.exit(0);
