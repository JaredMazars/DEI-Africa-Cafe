/**
 * Seed script – creates two demo users for testing:
 *   Mentor : demo.mentor@deicafe.com  / DemoMentor123!
 *   Mentee : demo.mentee@deicafe.com  / DemoMentee123!
 *
 * Run from the server/ directory:
 *   node seed-demo-users.js
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const BASE = `http://localhost:5000/api`;

async function post(url, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  return { status: res.status, data: await res.json() };
}

async function seedUser({ email, password, profile }) {
  console.log(`\n──── ${email} ────`);

  // 1. Register
  const reg = await post(`${BASE}/auth/register`, { email, password });
  if (!reg.data.success && !reg.data.message?.includes('already exists')) {
    console.error('  ❌ Register failed:', reg.data.message);
    return null;
  }

  let token = reg.data.data?.token;

  // If already exists, log in to get a fresh token
  if (!token) {
    console.log('  ℹ️  Already exists – logging in...');
    const login = await post(`${BASE}/auth/login`, { email, password });
    if (!login.data.success) {
      console.error('  ❌ Login failed:', login.data.message);
      return null;
    }
    token = login.data.data?.token;
    console.log('  ✅ Logged in');
  } else {
    console.log('  ✅ Registered');
  }

  // 2. Complete profile
  const prof = await post(`${BASE}/auth/complete-profile`, profile, token);
  if (prof.data.success) {
    console.log('  ✅ Profile saved');
  } else {
    console.warn('  ⚠️  Profile save:', prof.data.message || JSON.stringify(prof.data));
  }

  return token;
}

async function main() {
  console.log('🌱 Seeding demo users...\n');

  await seedUser({
    email: 'demo.mentor@deicafe.com',
    password: 'DemoMentor123!',
    profile: {
      name: 'Alex Mentor',
      role: 'mentor',
      location: 'Johannesburg, South Africa',
      experience: 'Senior (8+ years)',
      availability: '2-4 hours/week',
      bio: 'Senior software engineer passionate about helping others grow.',
      expertise: ['Software Development', 'Leadership', 'Career Development'],
      desired_expertise: [],
      interests: ['Technology', 'Mentorship', 'Diversity & Inclusion'],
      goals: ['Help mentees reach their potential', 'Share industry knowledge'],
      languages: ['English', 'Afrikaans'],
    },
  });

  await seedUser({
    email: 'demo.mentee@deicafe.com',
    password: 'DemoMentee123!',
    profile: {
      name: 'Jamie Mentee',
      role: 'mentee',
      location: 'Cape Town, South Africa',
      experience: 'Junior (0-2 years)',
      availability: '1-2 hours/week',
      bio: 'Junior developer looking to grow my career in tech.',
      expertise: ['JavaScript', 'React'],
      desired_expertise: ['Software Development', 'Career Development', 'Leadership'],
      interests: ['Technology', 'AI', 'Web Development'],
      goals: ['Find a mentor in tech', 'Improve software skills', 'Build a professional network'],
      languages: ['English'],
    },
  });

  console.log('\n✅ Done!\n');
  console.log('─────────────────────────────────────────');
  console.log('  MENTOR login');
  console.log('  Email    : demo.mentor@deicafe.com');
  console.log('  Password : DemoMentor123!');
  console.log('');
  console.log('  MENTEE login');
  console.log('  Email    : demo.mentee@deicafe.com');
  console.log('  Password : DemoMentee123!');
  console.log('─────────────────────────────────────────\n');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
