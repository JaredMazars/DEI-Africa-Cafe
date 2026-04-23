/**
 * Comprehensive API endpoint test
 * Tests every route for basic HTTP-level errors (auth included)
 * Run: node test-all-routes.js
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const BASE = 'http://localhost:5000';
let token = null;
let adminToken = null;

const results = [];

async function req(method, url, body, authToken, label) {
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  try {
    const res = await fetch(`${BASE}${url}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = { raw: text }; }
    const ok = res.status < 500;
    results.push({ ok, status: res.status, label: label || `${method} ${url}`, detail: ok ? '' : JSON.stringify(json).slice(0, 120) });
    return { status: res.status, json };
  } catch (e) {
    results.push({ ok: false, status: 'ERR', label: label || `${method} ${url}`, detail: e.message });
    return { status: 0, json: null };
  }
}

// ── Run tests ────────────────────────────────────────────────────────────────
console.log('🧪 Testing all API endpoints...\n');

// Health
await req('GET', '/health', null, null, 'Health check');

// Auth - register a test user
const regRes = await req('POST', '/api/auth/register', {
  name: 'Test User',
  email: `test_${Date.now()}@deicafe-test.com`,
  password: 'TestPass123!',
  role: 'mentee'
}, null, 'POST /api/auth/register');
token = regRes.json?.token || null;

// Auth - login
const loginRes = await req('POST', '/api/auth/login', {
  email: 'admin@deicafe.com', password: 'Admin123!'
}, null, 'POST /api/auth/login (admin attempt)');
adminToken = loginRes.json?.token || token;

// Auth - me
await req('GET', '/api/auth/me', null, token, 'GET /api/auth/me');

// Dashboard
await req('GET', '/api/dashboard', null, token, 'GET /api/dashboard');
await req('GET', '/api/dashboard/stats', null, adminToken, 'GET /api/dashboard/stats');

// Experts
await req('GET', '/api/experts', null, token, 'GET /api/experts');
await req('GET', '/api/experts?page=1&limit=10', null, token, 'GET /api/experts (paginated)');

// Matching
await req('GET', '/api/matching/mentors', null, token, 'GET /api/matching/mentors');

// Connections
await req('GET', '/api/connections', null, token, 'GET /api/connections');

// Sessions
await req('GET', '/api/sessions', null, token, 'GET /api/sessions');

// Messages
await req('GET', '/api/messages', null, token, 'GET /api/messages');

// Questions
await req('GET', '/api/questions', null, token, 'GET /api/questions');

// Opportunities
await req('GET', '/api/opportunities', null, token, 'GET /api/opportunities');

// Preferences
await req('GET', '/api/preferences', null, token, 'GET /api/preferences');

// Resources
await req('GET', '/api/resources', null, token, 'GET /api/resources');

// Reflections
await req('GET', '/api/reflections', null, token, 'GET /api/reflections');

// Admin endpoints
await req('GET', '/api/admin/stats', null, adminToken, 'GET /api/admin/stats');
await req('GET', '/api/admin/users', null, adminToken, 'GET /api/admin/users');
await req('GET', '/api/admin/mentors', null, adminToken, 'GET /api/admin/mentors');

// ── Print results ────────────────────────────────────────────────────────────
console.log('\n' + '─'.repeat(70));
let passed = 0, failed = 0;
for (const r of results) {
  const icon = r.ok ? '✅' : '❌';
  const detail = r.detail ? ` → ${r.detail}` : '';
  console.log(`${icon} [${r.status}] ${r.label}${detail}`);
  r.ok ? passed++ : failed++;
}
console.log('─'.repeat(70));
console.log(`\n${passed} passed | ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
