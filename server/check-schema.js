import './config/database.js';
import { executeQuery } from './config/database.js';

const r = await executeQuery(`SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_DEFAULT 
  FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='experts' ORDER BY ORDINAL_POSITION`);
r.recordset.forEach(c => console.log(c.IS_NULLABLE === 'NO' ? 'REQUIRED' : 'optional', c.COLUMN_NAME, c.COLUMN_DEFAULT || ''));
process.exit(0);
