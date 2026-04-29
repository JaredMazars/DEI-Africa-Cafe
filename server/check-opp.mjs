import { executeQuery } from './config/database.js';
const r = await executeQuery("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%opportunit%' OR TABLE_NAME LIKE '%resource%' ORDER BY TABLE_NAME");
console.log('tables:', r.recordset.map(x=>x.TABLE_NAME).join(', '));
const r2 = await executeQuery("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='resources' ORDER BY ORDINAL_POSITION");
console.log('resources cols:', r2.recordset.map(x=>x.COLUMN_NAME).join(', ')||'(no cols)');
process.exit(0);
