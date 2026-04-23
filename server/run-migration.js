// run-migration.js
// Usage: node run-migration.js <path-to-sql-file>
// Runs a raw SQL migration file against the configured Azure SQL DB using the existing mssql config

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { executeQuery } from './config/database.js';

const [, , filePath] = process.argv;

if (!filePath) {
  console.error('Usage: node run-migration.js <path-to-sql-file>');
  process.exit(1);
}

const absPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);

if (!fs.existsSync(absPath)) {
  console.error('File not found:', absPath);
  process.exit(1);
}

const sqlContent = fs.readFileSync(absPath, 'utf8');

// Split on GO (case-insensitive, on its own line), OR split each IF NOT EXISTS block as its own statement
let statements = sqlContent.split(/^\s*GO\s*$/gim).map(s => s.trim()).filter(Boolean);

// If no GO separators were found and the file has multiple IF blocks, split on each IF NOT EXISTS
if (statements.length === 1 && (statements[0].match(/IF NOT EXISTS/gi) || []).length > 1) {
  statements = statements[0]
    .split(/(?=^\s*IF\s+NOT\s+EXISTS)/gim)
    .map(s => s.trim())
    .filter(Boolean);
}

(async () => {
  let failed = 0;
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (!stmt) continue;
    console.log(`\n--- Executing statement ${i + 1} of ${statements.length} ---`);
    try {
      await executeQuery(stmt);
      console.log('   ✔ OK');
    } catch (err) {
      console.warn(`   ⚠ Skipped (${err.message})`);
      failed++;
    }
  }
  if (failed === 0) {
    console.log('\n✅ Migration complete!');
  } else {
    console.log(`\n⚠ Migration finished with ${failed} skipped statement(s). Check warnings above.`);
  }
  process.exit(0);
})();
