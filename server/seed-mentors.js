/**
 * Seed demo mentor candidates for the DEI Cafe platform.
 * - Updates demo.mentor's expertise to match onboarding tags
 * - Adds user_desired_expertise for demo.mentee (so For You algo works)
 * - Seeds 8 more diverse mentor profiles across African countries
 * Run: node seed-mentors.js
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

import { executeQuery } from './config/database.js';

// Must match EXPERTISE_OPTIONS in SimpleOnboardingForm.tsx exactly
const EXPERTISE_OPTIONS = [
  'Tax Advisory', 'Audit & Assurance', 'Corporate Finance', 'Accounting & Reporting',
  'Risk Advisory', 'ESG & Sustainability', 'Strategy & Transformation', 'Technology & Digital',
  'Legal & Compliance', 'Data Analytics', 'Deals & Transactions', 'HR & Talent Management',
  'Leadership & Management', 'Entrepreneurship', 'Marketing & Communications',
  'Healthcare Management', 'Education & Training', 'Agriculture & Food Security',
];

const MENTORS = [
  {
    email: 'demo.mentor@deicafe.com',
    update: true,
    name: 'Alex Mentor',
    title: 'Senior (6-10 years)',
    company: 'Forvis Mazars',
    bio: 'Senior software engineer with 10+ years in fintech and enterprise systems. Passionate about helping early-career professionals navigate the tech industry and build digital skills.',
    location: 'Johannesburg, South Africa',
    country: 'South Africa',
    expertise: ['Technology & Digital', 'Leadership & Management', 'Strategy & Transformation'],
    languages: ['English', 'Afrikaans'],
  },
  {
    name: 'Amara Osei',
    title: 'Expert (10+ years)',
    company: 'Forvis Mazars',
    bio: 'Chartered accountant with deep expertise in corporate finance, auditing and financial modelling. Based in Accra, eager to mentor the next generation of African finance professionals.',
    location: 'Accra, Ghana',
    country: 'Ghana',
    expertise: ['Corporate Finance', 'Accounting & Reporting', 'Tax Advisory'],
    languages: ['English', 'Yoruba'],
  },
  {
    name: 'Naledi Dlamini',
    title: 'Senior (6-10 years)',
    company: 'Forvis Mazars',
    bio: 'Brand strategist and digital marketing expert with 12 years growing African consumer brands. Specialist in youth marketing and pan-African campaigns.',
    location: 'Cape Town, South Africa',
    country: 'South Africa',
    expertise: ['Marketing & Communications', 'Entrepreneurship', 'Strategy & Transformation'],
    languages: ['English', 'Zulu'],
  },
  {
    name: 'Chidi Okeke',
    title: 'Expert (10+ years)',
    company: 'Forvis Mazars',
    bio: 'Corporate lawyer specialising in mergers, acquisitions and regulatory compliance across West Africa. Passionate about legal education and access to justice.',
    location: 'Lagos, Nigeria',
    country: 'Nigeria',
    expertise: ['Legal & Compliance', 'Deals & Transactions', 'Risk Advisory'],
    languages: ['English', 'Igbo', 'Yoruba'],
  },
  {
    name: 'Fatima El-Amin',
    title: 'Mid-level (3-5 years)',
    company: 'Forvis Mazars',
    bio: 'UX/UI designer and creative director with a background in product design for African startups. Advocate for human-centred design and accessible technology.',
    location: 'Cairo, Egypt',
    country: 'Egypt',
    expertise: ['Technology & Digital', 'Data Analytics', 'Marketing & Communications'],
    languages: ['Arabic', 'English', 'French'],
  },
  {
    name: 'Kwame Mensah',
    title: 'Senior (6-10 years)',
    company: 'Forvis Mazars',
    bio: 'Agricultural economist working at the intersection of food security and sustainable business. Mentors professionals looking to enter agritech and rural development.',
    location: 'Nairobi, Kenya',
    country: 'Kenya',
    expertise: ['Agriculture & Food Security', 'ESG & Sustainability', 'Corporate Finance'],
    languages: ['English', 'Swahili'],
  },
  {
    name: 'Priya Naidoo',
    title: 'Senior (6-10 years)',
    company: 'Forvis Mazars',
    bio: 'Public health specialist with experience in healthcare systems transformation across Southern Africa. Strong advocate for diversity in the health sector.',
    location: 'Durban, South Africa',
    country: 'South Africa',
    expertise: ['Healthcare Management', 'ESG & Sustainability', 'HR & Talent Management'],
    languages: ['English', 'Zulu', 'Hindi'],
  },
  {
    name: 'Yusuf Abdi',
    title: 'Mid-level (3-5 years)',
    company: 'Forvis Mazars',
    bio: 'EdTech specialist helping schools and corporates leverage digital learning. Former teacher turned product leader, passionate about skills development across Africa.',
    location: 'Pretoria, South Africa',
    country: 'South Africa',
    expertise: ['Education & Training', 'Technology & Digital', 'HR & Talent Management'],
    languages: ['English', 'Amharic', 'Swahili'],
  },
];

async function upsertMentor(m) {
  let userId = null;

  if (m.update && m.email) {
    // Find existing user
    const r = await executeQuery(`SELECT id FROM users WHERE email = '${m.email}'`);
    if (!r.recordset.length) { console.log(`⚠️  ${m.email} not found, skipping`); return; }
    userId = r.recordset[0].id;
    await executeQuery(`UPDATE users SET role='mentor', is_mentor=1, is_mentee=0, updated_at=GETDATE() WHERE id='${userId}'`);
    console.log(`✏️  Updating existing user: ${m.name} (${userId})`);
  } else {
    // Create new synthetic user
    const fakeEmail = m.name.toLowerCase().replace(/[^a-z]/g,'') + '@deicafe-demo.com';
    const existingUser = await executeQuery(`SELECT id FROM users WHERE email = '${fakeEmail}'`);
    if (existingUser.recordset.length) {
      userId = existingUser.recordset[0].id;
      console.log(`♻️  Reusing existing user: ${m.name}`);
    } else {
      const hash = await bcrypt.hash('Demo1234!', 10);
      const ins = await executeQuery(`
        INSERT INTO users (name, email, password_hash, role, is_mentor, is_mentee, is_active, created_at, updated_at)
        OUTPUT INSERTED.id
        VALUES ('${m.name.replace(/'/g,"''")}', '${fakeEmail}', '${hash}', 'mentor', 1, 0, 1, GETDATE(), GETDATE())
      `);
      userId = ins.recordset[0].id;
      console.log(`➕ Created user: ${m.name} (${userId})`);
    }
  }

  // Upsert expert row
  const safe = s => s?.replace(/'/g, "''") || '';
  const expertExisting = await executeQuery(`SELECT id FROM experts WHERE user_id = '${userId}'`);
  let expertId;
  if (expertExisting.recordset.length) {
    expertId = expertExisting.recordset[0].id;
    await executeQuery(`
      UPDATE experts SET
        name='${safe(m.name)}', title='${safe(m.title)}', company='${safe(m.company)}',
        bio='${safe(m.bio)}', location='${safe(m.location)}', country='${safe(m.country)}',
        is_available=1, updated_at=GETDATE()
      WHERE id='${expertId}'
    `);
  } else {
    const ins = await executeQuery(`
      INSERT INTO experts (user_id, name, title, company, bio, location, country, is_available, created_at, updated_at)
      OUTPUT INSERTED.id
      VALUES ('${userId}','${safe(m.name)}','${safe(m.title)}','${safe(m.company)}',
              '${safe(m.bio)}','${safe(m.location)}','${safe(m.country)}',1,GETDATE(),GETDATE())
    `);
    expertId = ins.recordset[0].id;
  }

  // Replace expertise
  await executeQuery(`DELETE FROM expert_expertise WHERE expert_id = '${expertId}'`);
  const expVals = m.expertise.map(e => `('${expertId}','${safe(e)}')`).join(', ');
  await executeQuery(`INSERT INTO expert_expertise (expert_id, expertise) VALUES ${expVals}`);

  // Replace languages
  try {
    await executeQuery(`DELETE FROM expert_languages WHERE expert_id = '${expertId}'`);
    const langVals = m.languages.map(l => `('${expertId}','${safe(l)}')`).join(', ');
    await executeQuery(`INSERT INTO expert_languages (expert_id, language) VALUES ${langVals}`);
  } catch { console.log(`  ℹ️  expert_languages skipped for ${m.name}`); }

  console.log(`  ✅ ${m.name} — expertise: [${m.expertise.join(', ')}] — location: ${m.location}`);
}

async function seedMenteeDesiredExpertise() {
  // Give demo.mentee some desired expertise so "For You" scoring works
  const r = await executeQuery(`SELECT id FROM users WHERE email = 'demo.mentee@deicafe.com'`);
  if (!r.recordset.length) { console.log('ℹ️  demo.mentee not found, skipping desired expertise'); return; }
  const userId = r.recordset[0].id;
  
  const desired = ['Technology & Digital', 'Corporate Finance', 'Strategy & Transformation'];
  try {
    await executeQuery(`DELETE FROM user_desired_expertise WHERE user_id = '${userId}'`);
    const vals = desired.map(e => `('${userId}','${e}')`).join(', ');
    await executeQuery(`INSERT INTO user_desired_expertise (user_id, expertise) VALUES ${vals}`);
    console.log(`\n✅ demo.mentee desired expertise set: [${desired.join(', ')}]`);
  } catch (e) { console.log('⚠️  Could not set mentee desired expertise:', e.message); }
}

async function main() {
  console.log('🌱 Seeding mentor candidates...\n');
  for (const m of MENTORS) {
    try { await upsertMentor(m); } catch(e) { console.error(`❌ Failed ${m.name}:`, e.message); }
  }
  await seedMenteeDesiredExpertise();
  console.log('\n🎉 Done! Refresh the mentor discovery page.\n');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
