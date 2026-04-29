/**
 * Fix demo mentor: ensure expert_expertise entries exist so they appear in matching.
 * Run: node fix-mentor-expertise.js
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

import { executeQuery } from './config/database.js';

const MENTOR_EMAIL = 'demo.mentor@deicafe.com';
const EXPERTISE = ['Software Development', 'Leadership', 'Career Development'];
const LANGUAGES = ['English', 'Afrikaans'];

async function main() {
  console.log('🔧 Fixing demo mentor expertise...\n');

  // 1. Get users.id for the mentor
  const userResult = await executeQuery(
    `SELECT id, name, role FROM users WHERE email = '${MENTOR_EMAIL}'`
  );
  if (!userResult.recordset.length) {
    console.error('❌ Mentor user not found. Run seed-demo-users.js first.');
    process.exit(1);
  }
  const user = userResult.recordset[0];
  console.log(`✅ Found user: ${user.name} (${user.id}), role=${user.role}`);

  // 2. Ensure experts row exists with all required fields
  const expertResult = await executeQuery(
    `SELECT id FROM experts WHERE user_id = '${user.id}'`
  );
  let expertId;
  if (expertResult.recordset.length === 0) {
    const ins = await executeQuery(`
      INSERT INTO experts (user_id, name, title, company, bio, location, country, is_available, created_at, updated_at)
      OUTPUT INSERTED.id
      VALUES ('${user.id}', 'Alex Mentor', 'Senior Software Engineer', 'Forvis Mazars',
              'Senior software engineer passionate about helping others grow.',
              'Johannesburg, South Africa', 'South Africa', 1, GETDATE(), GETDATE())
    `);
    expertId = ins.recordset[0].id;
    console.log(`✅ Created experts row: ${expertId}`);
  } else {
    expertId = expertResult.recordset[0].id;
    // Make sure is_available = 1
    await executeQuery(`UPDATE experts SET is_available = 1 WHERE id = '${expertId}'`);
    console.log(`✅ Found experts row: ${expertId} (set is_available=1)`);
  }

  // 3. Upsert expert_expertise
  await executeQuery(`DELETE FROM expert_expertise WHERE expert_id = '${expertId}'`);
  const expValues = EXPERTISE.map(e => `('${expertId}', '${e}')`).join(', ');
  await executeQuery(`INSERT INTO expert_expertise (expert_id, expertise) VALUES ${expValues}`);
  console.log(`✅ Inserted ${EXPERTISE.length} expertise entries: ${EXPERTISE.join(', ')}`);

  // 4. Upsert expert_languages (if table exists)
  try {
    await executeQuery(`DELETE FROM expert_languages WHERE expert_id = '${expertId}'`);
    const langValues = LANGUAGES.map(l => `('${expertId}', '${l}')`).join(', ');
    await executeQuery(`INSERT INTO expert_languages (expert_id, language) VALUES ${langValues}`);
    console.log(`✅ Inserted ${LANGUAGES.length} languages: ${LANGUAGES.join(', ')}`);
  } catch { console.log('ℹ️  expert_languages skipped'); }

  // 5. Update users row role = mentor
  await executeQuery(`UPDATE users SET role='mentor', is_mentor=1, is_mentee=0, updated_at=GETDATE() WHERE id='${user.id}'`);
  console.log(`✅ users role updated to mentor`);

  // 6. Verify
  const check = await executeQuery(`
    SELECT e.id, e.name, e.is_available,
      (SELECT STRING_AGG(ee.expertise,', ') FROM expert_expertise ee WHERE ee.expert_id=e.id) as expertise
    FROM experts e WHERE e.id = '${expertId}'
  `);
  console.log('\n📋 Expert record:', check.recordset[0]);
  console.log('\n✅ Done! Alex Mentor will now appear in mentor matching.\n');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
