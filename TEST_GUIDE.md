# DEI Cafe — Full System Test Guide

**Base URLs**
- Frontend: `http://localhost:5173`
- API: `http://localhost:5000`

**Start both servers before testing**
```powershell
# Terminal 1 — backend
cd server; node server.js

# Terminal 2 — frontend
npm run dev
```

---

## 0. Health Check

```powershell
Invoke-WebRequest -Uri http://localhost:5000/health -UseBasicParsing | Select-Object -ExpandProperty Content
```
**Expect:** `{"success":true,"message":"DEI Cafe API is running",...}`

---

## 1. Authentication

### 1.1 Register
```powershell
$body = '{"email":"testuser@example.com","password":"Test1234!"}'
Invoke-WebRequest -Uri http://localhost:5000/api/auth/register `
  -Method POST -ContentType "application/json" -Body $body `
  -UseBasicParsing | Select-Object -ExpandProperty Content
```
**Expect:** `success: true`, `token` in response, `refreshToken` httpOnly cookie set.

### 1.2 Duplicate email rejected
Repeat the same request.
**Expect:** HTTP 409, `"An account with this email already exists."`

### 1.3 Weak password rejected
```powershell
$body = '{"email":"x@x.com","password":"abc"}'
```
**Expect:** HTTP 400, validation error about password length.

### 1.4 Login
```powershell
$body = '{"email":"testuser@example.com","password":"Test1234!"}'
$resp = Invoke-WebRequest -Uri http://localhost:5000/api/auth/login `
  -Method POST -ContentType "application/json" -Body $body `
  -SessionVariable session -UseBasicParsing
$data = $resp.Content | ConvertFrom-Json
$TOKEN = $data.data.token
```
**Expect:** short-lived access token (15 min JWT), `refreshToken` cookie, user object.

### 1.5 Wrong password rejected
```powershell
$body = '{"email":"testuser@example.com","password":"wrongpass"}'
```
**Expect:** HTTP 401, `"Invalid email or password."`

### 1.6 Token refresh
```powershell
# Uses the refreshToken cookie set by the session variable above
Invoke-WebRequest -Uri http://localhost:5000/api/auth/refresh `
  -Method POST -ContentType "application/json" -Body '{}' `
  -WebSession $session -UseBasicParsing | Select-Object -ExpandProperty Content
```
**Expect:** new `token` in response (fresh 15-min access token).

### 1.7 Logout
```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/auth/logout `
  -Method POST -ContentType "application/json" -Body '{}' `
  -WebSession $session -UseBasicParsing
```
**Expect:** `success: true`, `refreshToken` cookie cleared.

### 1.8 Refresh after logout fails
Repeat the refresh request after logout.
**Expect:** HTTP 401, `"Invalid or expired refresh token."`

### 1.9 Forgot password
```powershell
$body = '{"email":"testuser@example.com"}'
Invoke-WebRequest -Uri http://localhost:5000/api/auth/forgot-password `
  -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
```
**Expect:** `success: true` (email attempt, non-fatal if SMTP not configured).

### 1.10 Auth rate limiting
Send 21+ rapid login requests.
**Expect:** HTTP 429, `"Too many authentication attempts."` on the 21st.

### 1.11 Get current user
```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/auth/me `
  -Headers @{Authorization="Bearer $TOKEN"} -UseBasicParsing
```
**Expect:** user profile data.

---

## 2. Admin Login

### 2.1 Valid admin credentials
```powershell
$body = '{"email":"admin@deiafrica.com","password":"DEICafe@Admin2024!"}'
$resp = Invoke-WebRequest -Uri http://localhost:5000/api/auth/admin-login `
  -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
$ADMIN_TOKEN = ($resp.Content | ConvertFrom-Json).data.token
```
**Expect:** token with `role: "admin"`.

### 2.2 Wrong admin password
**Expect:** HTTP 401.

### 2.3 Regular token rejected for admin routes
```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/admin/users `
  -Headers @{Authorization="Bearer $TOKEN"} -UseBasicParsing
```
**Expect:** HTTP 403 (non-admin token).

---

## 3. Onboarding / Profile

### 3.1 Complete profile via UI
1. Register a new account at `http://localhost:5173/register`
2. You are redirected to `/onboarding`
3. Fill name, role (Mentee), location, expertise, goals, languages
4. Submit — **Expect:** redirect to `/home`, sidebar shows your name

### 3.2 Profile GET
```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/auth/me `
  -Headers @{Authorization="Bearer $TOKEN"} -UseBasicParsing
```
**Expect:** `profile` object with the fields saved in onboarding.

---

## 4. SQL Injection — Parameterization Check

These inputs should be saved safely, not cause errors or data leakage:

```powershell
# Attempt injection in email field during register
$body = '{"email":"x'\''@test.com","password":"Test1234!"}'
Invoke-WebRequest -Uri http://localhost:5000/api/auth/register `
  -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
```
**Expect:** HTTP 400 (email validation) or 500 — **NOT** a DB syntax error exposing query structure.

```powershell
# Classic ' OR '1'='1 in login
$body = '{"email":"x'\'' OR '\''1'\''='\''1","password":"any"}'
Invoke-WebRequest -Uri http://localhost:5000/api/auth/login `
  -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
```
**Expect:** HTTP 401 `"Invalid email or password."` — NOT a successful login.

---

## 5. Experts & Mentor Discovery

### 5.1 List experts (public-ish)
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/experts" `
  -Headers @{Authorization="Bearer $TOKEN"} -UseBasicParsing
```
**Expect:** array of expert profiles.

### 5.2 UI — browse mentors
Navigate to `http://localhost:5173/mentors`
**Expect:** mentor cards with name, expertise, location, Connect button.

### 5.3 Apply to become expert
```powershell
$body = '{"title":"Senior Dev","bio":"10 years experience","expertise":["Technology"]}'
Invoke-WebRequest -Uri http://localhost:5000/api/experts/apply `
  -Method POST -ContentType "application/json" `
  -Headers @{Authorization="Bearer $TOKEN"} -Body $body -UseBasicParsing
```
**Expect:** `success: true`, application recorded.

### 5.4 Mentor matching
Navigate to `http://localhost:5173/mentor-matching`
**Expect:** scored mentor recommendations based on profile interests.

---

## 6. Connections

### 6.1 Create connection request
```powershell
# Replace EXPERT_ID with a real experts.id from step 5.1
$body = '{"expert_id":"EXPERT_ID","message":"I would like to connect!"}'
$resp = Invoke-WebRequest -Uri http://localhost:5000/api/connections `
  -Method POST -ContentType "application/json" `
  -Headers @{Authorization="Bearer $TOKEN"} -Body $body -UseBasicParsing
$CONN_ID = ($resp.Content | ConvertFrom-Json).data.connection.id
```
**Expect:** connection with `status: "pending"`.

### 6.2 List connections
```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/connections `
  -Headers @{Authorization="Bearer $TOKEN"} -UseBasicParsing
```
**Expect:** array including the new pending connection.

### 6.3 Duplicate connection blocked
Repeat 6.1 with same expert ID.
**Expect:** HTTP 409 or error about existing connection.

### 6.4 Accept connection (as mentor — use mentor token)
```powershell
$body = '{"status":"accepted"}'
Invoke-WebRequest -Uri "http://localhost:5000/api/connections/$CONN_ID/status" `
  -Method PUT -ContentType "application/json" `
  -Headers @{Authorization="Bearer $MENTOR_TOKEN"} -Body $body -UseBasicParsing
```
**Expect:** `status: "accepted"`.

### 6.5 Capacity check
Create 3 accepted connections for one mentor, then attempt a 4th.
**Expect:** HTTP 400, capacity error.

---

## 7. Messages & WebSocket

### 7.1 Send message (REST)
```powershell
$body = "{`"connection_id`":`"$CONN_ID`",`"message_text`":`"Hello mentor!`"}"
Invoke-WebRequest -Uri http://localhost:5000/api/messages `
  -Method POST -ContentType "application/json" `
  -Headers @{Authorization="Bearer $TOKEN"} -Body $body -UseBasicParsing
```
**Expect:** new message object, `success: true`.

### 7.2 Retrieve messages
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/messages/connection/$CONN_ID" `
  -Headers @{Authorization="Bearer $TOKEN"} -UseBasicParsing
```
**Expect:** array of messages in chronological order.

### 7.3 WebSocket real-time (UI test)
1. Open `http://localhost:5173/messages` in two browser tabs (logged in as mentor + mentee)
2. Select the same connection in both tabs
3. Type and send a message as the mentee
**Expect:** message appears instantly in the mentor tab **without page refresh** (no polling — socket.io `new_message` event).

### 7.4 Unread count
```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/messages/unread-count `
  -Headers @{Authorization="Bearer $TOKEN"} -UseBasicParsing
```
**Expect:** numeric `unread_count`.

### 7.5 Mark as read
```powershell
# Replace MSG_ID with a real message_id from 7.2
Invoke-WebRequest -Uri "http://localhost:5000/api/messages/MSG_ID/read" `
  -Method PUT -ContentType "application/json" -Body '{}' `
  -Headers @{Authorization="Bearer $TOKEN"} -UseBasicParsing
```

---

## 8. Sessions / Calendar

### 8.1 Schedule session
```powershell
$body = "{`"connection_id`":`"$CONN_ID`",`"title`":`"Intro call`",`"scheduled_at`":`"2026-05-15T14:00:00Z`",`"duration_minutes`":60}"
$resp = Invoke-WebRequest -Uri http://localhost:5000/api/sessions `
  -Method POST -ContentType "application/json" `
  -Headers @{Authorization="Bearer $TOKEN"} -Body $body -UseBasicParsing
$SESSION_ID = ($resp.Content | ConvertFrom-Json).data.session.session_id
```
**Expect:** session with `status: "scheduled"`.

### 8.2 Get sessions
```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/sessions `
  -Headers @{Authorization="Bearer $TOKEN"} -UseBasicParsing
```

### 8.3 Upcoming sessions
```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/sessions/upcoming `
  -Headers @{Authorization="Bearer $TOKEN"} -UseBasicParsing
```

### 8.4 UI Calendar
Navigate to `http://localhost:5173/calendar`
**Expect:** scheduled sessions appear on correct dates.

### 8.5 Update session status
```powershell
$body = '{"status":"completed"}'
Invoke-WebRequest -Uri "http://localhost:5000/api/sessions/$SESSION_ID/status" `
  -Method PUT -ContentType "application/json" `
  -Headers @{Authorization="Bearer $TOKEN"} -Body $body -UseBasicParsing
```

---

## 9. Resources

### 9.1 List resources
```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/resources `
  -Headers @{Authorization="Bearer $TOKEN"} -UseBasicParsing
```
**Expect:** paginated array of resources with `cache-control` header.

### 9.2 UI Resources
Navigate to `http://localhost:5173/resources`
**Expect:** library loads with category filter tabs, search bar, resource cards.

### 9.3 PDF upload (admin)
In admin panel → Resources → upload a PDF file.
**Expect:** file saved to `server/uploads/`, URL stored in DB.

### 9.4 PDF open
Click a PDF resource card.
**Expect:** opens in-browser viewer or downloads.

---

## 10. Discussion / Questions

### 10.1 Post question
```powershell
$body = '{"title":"How do I get started?","content":"Looking for advice on DEI in tech."}'
Invoke-WebRequest -Uri http://localhost:5000/api/questions `
  -Method POST -ContentType "application/json" `
  -Headers @{Authorization="Bearer $TOKEN"} -Body $body -UseBasicParsing
```

### 10.2 List questions
```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/questions `
  -Headers @{Authorization="Bearer $TOKEN"} -UseBasicParsing
```

### 10.3 UI Discussion
Navigate to `http://localhost:5173/discussion`
**Expect:** 5-tab layout (Feed, Ask, Experts, Events, Announcements).

---

## 11. Dashboard

```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/dashboard `
  -Headers @{Authorization="Bearer $TOKEN"} -UseBasicParsing
```
**Expect:** stat cards (connections, sessions, messages, resources), recent activity.

Navigate to `http://localhost:5173/dashboard`
**Expect:** all 4 stat cards show real numbers (not zeros), no broken icons.

---

## 12. Goals & Reflections

### 12.1 Save goals
```powershell
$body = '{"goals":["Improve leadership","Expand network"]}'
Invoke-WebRequest -Uri http://localhost:5000/api/goals `
  -Method POST -ContentType "application/json" `
  -Headers @{Authorization="Bearer $TOKEN"} -Body $body -UseBasicParsing
```

### 12.2 Post reflection
Navigate to `http://localhost:5173/reflection`
Fill in the reflection form and submit.
**Expect:** reflection saved, appears in the board.

---

## 13. Opportunities

```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/opportunities `
  -Headers @{Authorization="Bearer $TOKEN"} -UseBasicParsing
```
Navigate to `http://localhost:5173/opportunities`
**Expect:** job/opportunity cards with filter options.

---

## 14. Collaboration Hub

Navigate to `http://localhost:5173/collaboration`
```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/collaboration `
  -Headers @{Authorization="Bearer $TOKEN"} -UseBasicParsing
```
**Expect:** projects/team spaces load without errors.

---

## 15. Admin Console

### 15.1 Login
Navigate to `http://localhost:5173/admin/login`
Enter: `admin@deiafrica.com` / `DEICafe@Admin2024!`
**Expect:** redirected to `/admin/overview`

### 15.2 Overview dashboard
**Expect:** total users, mentors, mentees, connections stat cards with real numbers.

### 15.3 User management (`/admin/users`)
**Expect:** paginated user table, enable/disable toggle works.

### 15.4 Mentor management (`/admin/mentors`)
**Expect:** mentor list, capacity info visible.

### 15.5 Expert management (`/admin/experts`)  
**Expect:** pending applications visible, approve/reject buttons work.

### 15.6 Content / Resources management (`/admin/resources`)
**Expect:** upload form works, existing resources listed, delete works.

### 15.7 Notifications (`/admin/notifications`)
**Expect:** send broadcast notification, appears in users' notification bell.

### 15.8 Audit log (`/admin/audit`)
**Expect:** recent admin actions logged.

### 15.9 Non-admin cannot access admin API
```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/admin/users `
  -Headers @{Authorization="Bearer $TOKEN"} -UseBasicParsing
```
**Expect:** HTTP 403.

---

## 16. Notification System

### 16.1 Bell icon in nav
Log in and trigger an event (new connection, message, etc.)
**Expect:** red badge count appears on bell icon in navigation.

### 16.2 Mark all read
Click the bell, then "Mark all read".
**Expect:** badge clears.

---

## 17. Security Checks

### 17.1 No token → 401
```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/connections -UseBasicParsing
```
**Expect:** HTTP 401.

### 17.2 Expired/invalid token → 401
```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/connections `
  -Headers @{Authorization="Bearer invalidsignature.fake.token"} -UseBasicParsing
```
**Expect:** HTTP 401.

### 17.3 Refresh token used as access token → rejected
Sign a fake `type: "refresh"` JWT, try to call a protected route.
**Expect:** HTTP 401 (auth middleware checks `type === 'access'`).

### 17.4 CSRF guard — wrong content-type
```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/connections `
  -Method POST -ContentType "text/plain" -Body 'data' -UseBasicParsing
```
**Expect:** HTTP 400, `"Invalid content type."`

### 17.5 Rate limiting on auth
Rapidly POST to `/api/auth/login` 25 times.
**Expect:** HTTP 429 after ~20 attempts.

### 17.6 SQL injection (parameterized queries)
```powershell
$body = '{"email":"test@x.com'\''--","password":"x"}'
Invoke-WebRequest -Uri http://localhost:5000/api/auth/login `
  -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
```
**Expect:** HTTP 400 or 401 — no DB error, no auth bypass.

---

## 18. Performance / Caching

```powershell
# First request
$r1 = Invoke-WebRequest -Uri http://localhost:5000/api/resources `
  -Headers @{Authorization="Bearer $TOKEN"} -UseBasicParsing
$r1.Headers["Cache-Control"]
# Should see: private, max-age=120
```

---

## 19. Frontend — Page Load Smoke Test

Visit each route and confirm it loads without a blank screen or console error:

| Route | Expected content |
|-------|-----------------|
| `/login` | Login form with "Forgot password?" link |
| `/register` | Registration form with validation |
| `/forgot-password` | Email input form |
| `/home` | Welcome banner, quick-access cards |
| `/dashboard` | 4 stat cards, activity feed |
| `/mentors` | Mentor cards grid |
| `/mentor-matching` | Scored match list |
| `/messages` | Split-pane: connection list + chat (no polling — WebSocket) |
| `/resources` | Resource library with search/filter |
| `/calendar` | Month/week calendar view |
| `/discussion` | 5-tab discussion board |
| `/experts` | Expert directory |
| `/collaboration` | Collaboration hub |
| `/opportunities` | Opportunity listings |
| `/profile` | User profile editor |
| `/preferences` | Notification + account preferences |
| `/admin/overview` | Admin stat overview (admin token required) |

---

## 20. End-to-End Happy Path

1. **Register** as a new mentee → onboard with profile
2. **Browse mentors** at `/mentors` → click Connect on one
3. **Admin approves** or mentor accepts the connection
4. **Open Messages** → send a message → verify it arrives instantly in the other browser tab (WebSocket, no reload)
5. **Schedule a session** → verify it appears on Calendar
6. **Mark session completed**
7. **Write a reflection** on the session
8. **Browse resources** → open a PDF article
9. **Admin** → check the audit log shows the connection + session events
10. **Logout** → confirm refresh token cookie is cleared, re-accessing protected routes requires new login

---

*All API examples assume both servers are running locally. Replace token values with actual JWTs obtained from login/register responses. Replace IDs with real values from your DB.*
