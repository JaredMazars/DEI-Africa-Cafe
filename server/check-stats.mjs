import { executeQuery } from './config/database.js';
// Test stats queries
try {
  const r = await executeQuery("SELECT COUNT(*) as c FROM users WHERE is_active=1");
  console.log('users OK:', r.recordset[0].c);
} catch(e) { console.log('users FAIL:', e.message.split('\n')[0]); }

// Test connection stats
try {
  const r = await executeQuery("SELECT COUNT(*) as c FROM connections");
  console.log('connections OK:', r.recordset[0].c);
} catch(e) { console.log('connections FAIL:', e.message.split('\n')[0]); }

// Test session stats
try {
  const r = await executeQuery("SELECT COUNT(*) as c FROM sessions");
  console.log('sessions OK:', r.recordset[0].c);
} catch(e) { console.log('sessions FAIL:', e.message.split('\n')[0]); }

// Test experts with is_verified (before migration)
try {
  const r = await executeQuery("SELECT COUNT(*) as c FROM experts WHERE is_verified=1");
  console.log('experts.is_verified OK:', r.recordset[0].c);
} catch(e) { console.log('experts.is_verified FAIL:', e.message.split('\n')[0]); }

process.exit(0);
