import http from 'http';

function req(path, method, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const opts = { hostname: 'localhost', port: 5000, path, method, headers: { ...headers, 'Content-Type': 'application/json' } };
    const r = http.request(opts, resp => {
      let d = '';
      resp.on('data', c => d += c);
      resp.on('end', () => resolve({ status: resp.statusCode, body: JSON.parse(d) }));
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

// 1. Login
const login = await req('/api/auth/login', 'POST', {}, { email: 'admin@deiafrica.com', password: 'DEICafe@Admin2024!' });
console.log(`[1] Login: ${login.status} | role=${login.body?.data?.user?.role}`);
const token = login.body?.data?.token;
const H = { Authorization: 'Bearer ' + token };

// 2. Stats
const stats = await req('/api/admin/stats', 'GET', H);
console.log(`[2] Stats: ${stats.status} | users=${stats.body?.data?.stats?.totalUsers} mentors=${stats.body?.data?.stats?.totalMentors}`);

// 3. Experts list
const experts = await req('/api/admin/experts', 'GET', H);
console.log(`[3] Experts: ${experts.status} | count=${experts.body?.data?.experts?.length} | msg=${experts.body?.message||'ok'}`);

// 4. Users list
const users = await req('/api/admin/users', 'GET', H);
console.log(`[4] Users: ${users.status} | count=${users.body?.data?.users?.length}`);

// 5. Mentors / experts as mentors
const mentors = await req('/api/admin/mentors', 'GET', H);
console.log(`[5] Mentors: ${mentors.status} | count=${mentors.body?.data?.mentors?.length}`);

// 6. Content
const content = await req('/api/admin/content', 'GET', H);
console.log(`[6] Content: ${content.status} | count=${content.body?.data?.content?.length}`);

// 7. Resources
const resources = await req('/api/admin/resources', 'GET', H);
console.log(`[7] Resources: ${resources.status} | count=${resources.body?.data?.resources?.length}`);

// 8. Opportunities
const opps = await req('/api/admin/opportunities', 'GET', H);
console.log(`[8] Opportunities: ${opps.status} | count=${opps.body?.data?.opportunities?.length}`);

// 9. Notifications
const notifs = await req('/api/admin/notifications', 'GET', H);
console.log(`[9] Notifications: ${notifs.status} | count=${notifs.body?.data?.notifications?.length}`);

// 10. Audit
const audit = await req('/api/admin/audit', 'GET', H);
console.log(`[10] Audit: ${audit.status} | count=${audit.body?.data?.audits?.length}`);

// 11. CREATE test: expert verify (approve first expert)
if (experts.body?.data?.experts?.length > 0) {
  const eid = experts.body.data.experts[0].id;
  const verify = await req(`/api/admin/experts/${eid}/verify`, 'PUT', H, { is_verified: true });
  console.log(`[11] Verify expert ${eid.slice(0,8)}…: ${verify.status} | ${verify.body?.message}`);
  // Re-check it's now verified
  const recheck = await req('/api/admin/experts', 'GET', H);
  const verifiedCount = recheck.body?.data?.experts?.filter(e => e.is_verified).length;
  console.log(`     Verified experts now: ${verifiedCount}`);
  // Undo: reject it
  await req(`/api/admin/experts/${eid}/verify`, 'PUT', H, { is_verified: false });
}

// 12. CREATE opportunity
const newOpp = await req('/api/admin/opportunities', 'POST', H, { title: 'TEST Opp', description: 'Automated test opportunity', priority: 'low', status: 'open' });
console.log(`[12] Create opportunity: ${newOpp.status} | ${newOpp.body?.message||JSON.stringify(newOpp.body?.data)}`);
if (newOpp.status === 200) {
  const oppId = newOpp.body?.data?.opportunity?.opportunity_id;
  if (oppId) {
    const del = await req(`/api/admin/opportunities/${oppId}`, 'DELETE', H);
    console.log(`     Delete opportunity: ${del.status} | ${del.body?.message}`);
  }
}

// 13. CREATE resource
const newRes = await req('/api/admin/resources', 'POST', H, { title: 'TEST Resource', url: 'https://example.com/test', type: 'article', category: 'General' });
console.log(`[13] Create resource: ${newRes.status} | ${newRes.body?.message||JSON.stringify(newRes.body?.data)}`);
if (newRes.status === 200) {
  const rid = newRes.body?.data?.id;
  if (rid) {
    const del = await req(`/api/admin/resources/${rid}`, 'DELETE', H);
    console.log(`     Delete resource: ${del.status} | ${del.body?.message}`);
  }
}

// 14. CREATE notification
const newNotif = await req('/api/admin/notifications', 'POST', H, { title: 'TEST Notif', message: 'Test message', type: 'info', target_audience: 'all', status: 'draft' });
console.log(`[14] Create notification: ${newNotif.status} | ${newNotif.body?.message}`);
if (newNotif.status === 200) {
  const nid = newNotif.body?.data?.id;
  if (nid) {
    const del = await req(`/api/admin/notifications/${nid}`, 'DELETE', H);
    console.log(`     Delete notification: ${del.status} | ${del.body?.message}`);
  }
}

// 15. Audit — log entry
const logAudit = await req('/api/admin/audit', 'POST', H, { action: 'TEST', entity_type: 'System', entity_name: 'API Test', details: 'Automated test run' });
console.log(`[15] Log audit: ${logAudit.status} | ${logAudit.body?.message}`);

console.log('\n✅ All tests complete');
process.exit(0);
