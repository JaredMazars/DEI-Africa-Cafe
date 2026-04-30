# DEI Cafe — Walkthrough Test Guide

---

## Before you start

Open two terminals:

```powershell
# Terminal 1 — backend
cd server; node server.js

# Terminal 2 — frontend
npm run dev
```

Then open **http://localhost:5173** in your browser.

---

## Step 1 — Register & Onboard

1. Go to `/register`
2. Enter an email + password (min 6 chars) → click **Register**
3. You land on `/onboarding` — fill in every field:
   - Name, Role = **Mentee**, Location, Experience level
   - Pick 2–3 expertise tags, desired expertise, interests, goals, languages
4. Submit → you should land on `/home`
5. Check your name appears in the sidebar/nav

**Verify:** no blank screen, no console errors, nav shows your name.

---

## Step 2 — Home & Dashboard

1. Click **Home** → welcome banner and quick-access cards load
2. Click **Dashboard** (`/dashboard`) → 4 stat cards visible (Connections, Sessions, Messages, Resources)
   - All should show numbers, not broken icons or zeros

---

## Step 3 — Browse Mentors & Request a Connection

1. Go to `/mentors` → mentor cards load with name, expertise, location
2. Go to `/mentor-matching` → scored recommendation list based on your profile
3. On any mentor card, click **Connect** → fill in a message → submit
4. Go to `/mentorship-activities` → your pending request should appear

> **Tip:** If you want to find a specific mentor by name, type their name in the search box — search works across all mentors regardless of the active category tab.

---

## Step 4 — Accept the Connection (as Mentor)

Either:
- Open a second browser (incognito) and log in as the mentor account
- Or use the admin panel (Step 10) to manually accept

Once accepted, both users should see status change to **Accepted**.

---

## Step 5 — Real-Time Messaging

1. Open **two browser tabs** — one as mentee, one as mentor (incognito)
2. Both go to `/messages`
3. Both select the **same connection** from the left sidebar
4. Mentee types a message and hits Send
5. **Message should appear in the mentor tab instantly** — no page refresh needed
   - If it only shows after refresh → socket.io isn't connecting (check browser console)
6. Reply from the mentor tab → should appear instantly in the mentee tab
7. Check the bell icon — unread count should appear

---

## Step 6 — Schedule a Session

1. Go to `/mentorship-activities` → open the accepted connection
2. Click **Schedule Session** (or go to `/calendar`)
3. Fill in: title, date (future), duration → Save
4. Go to `/calendar` → session appears on the correct date
5. Mark the session as **Completed**

---

## Step 7 — Write a Reflection

1. Go to `/reflection`
2. Fill the reflection form (what went well, what to improve, rating)
3. Submit → entry appears on the board below

---

## Step 8 — Resource Library

1. Go to `/resources`
2. Use the search bar — type a topic keyword
3. Filter by a category tab
4. Click a resource card → article opens or PDF downloads/previews
5. Click the bookmark/save button on a card

---

## Step 9 — Discussion Board

1. Go to `/discussion`
2. Click the **Ask** tab → post a question with a title and description
3. Click the **Feed** tab → your question appears
4. Click the **Experts** tab → expert-answered posts listed
5. Click **Events** and **Announcements** tabs → both render without errors

---

## Step 10 — Expert Directory & Apply

1. Go to `/experts` → expert profiles load with tags and bios
2. Click on an expert card → detail view opens
3. If your account is eligible, click **Apply to be a Mentor** → fill the form → submit

---

## Step 11 — Opportunities

1. Go to `/opportunities`
2. Browse job/program listings
3. Use the filter/search — results update
4. Click **Apply** on a listing

---

## Step 12 — Collaboration Hub

1. Go to `/collaboration`
2. Explore tabs — projects, team spaces, or shared resources
3. Create or join a group if the feature is available

---

## Step 13 — Profile & Preferences

1. Go to `/profile` → edit your name, bio, location → save
2. Go to `/preferences` → toggle notification settings → save
3. Refresh and confirm settings persisted

---

## Step 14 — Admin Console

1. Open a new tab, go to `/admin/login`
2. Email: `admin@deiafrica.com`, Password: `DEICafe@Admin2024!`
3. Work through each sidebar item:

| Section | What to check |
|---------|--------------|
| **Overview** | Stat cards show real user/connection counts |
| **Users** | User list loads; toggle active/inactive on a user |
| **Mentors** | Mentor list with capacity shown |
| **Experts** | Pending applications visible; click Approve on one |
| **Content** | Articles listed; create/edit/delete one |
| **Resources** | Upload a PDF → confirm it appears at `/resources` |
| **Opportunities** | Create a new opportunity → confirm at `/opportunities` |
| **Notifications** | Send a broadcast → check bell in regular user tab |
| **Audit** | Recent actions logged with timestamp + actor |

---

## Step 15 — Security Checks

**SQL injection — try this in the login form:**
- Email field: type `'` OR `'1'='1`
- Password: anything
- Should get "Invalid email or password" — **not** a successful login

**No token:**
- Log out and try visiting `/dashboard` directly
- Should redirect to `/login`

**Wrong password — rate limiting:**
- Attempt login 20+ times with wrong password
- Should get "Too many authentication attempts" after ~20 and be blocked

**Refresh token:**
- After login, open DevTools → Application → Cookies
- Confirm `refreshToken` is present and marked **HttpOnly** (not readable by JS)
- Log out → confirm the cookie disappears

---

## Step 16 — Logout & Re-entry

1. Click logout from the nav menu
2. Confirm you are redirected to `/login`
3. Confirm `token` is gone from localStorage (DevTools → Application → Local Storage)
4. Confirm `refreshToken` cookie is cleared (DevTools → Application → Cookies)
5. Try navigating to `/dashboard` directly → should redirect to `/login`
6. Log back in → everything resumes normally

---

## Quick sanity checklist

| Done | Check |
|------|-------|
| | Registration + onboarding flow completes |
| | Dashboard stat cards show real data |
| | Mentor cards load at `/mentors` |
| | Searching by name finds mentors regardless of category tab |
| | Connection request sends and gets accepted |
| | Messages appear in real-time (no page refresh) |
| | Session appears on Calendar after creation |
| | Reflection saves and displays |
| | Resources search/filter works, PDFs open |
| | Discussion: post a question, see it in Feed |
| | Admin can approve expert, upload resource, send notification |
| | Logout clears both token + cookie |
| | SQL injection attempt fails cleanly |

---

## Page load smoke test

Visit each route — confirm it loads without a blank screen or console error:

| Route | Expected content |
|-------|-----------------|
| `/login` | Login form with "Forgot password?" link |
| `/register` | Registration form with validation |
| `/forgot-password` | Email input form |
| `/home` | Welcome banner, quick-access cards |
| `/dashboard` | 4 stat cards, activity feed |
| `/mentors` | Mentor cards grid with search + category tabs |
| `/mentor-matching` | Scored match list |
| `/messages` | Split-pane: connection list + chat (real-time, no polling) |
| `/resources` | Resource library with search/filter |
| `/calendar` | Month/week calendar view |
| `/discussion` | 5-tab discussion board |
| `/experts` | Expert directory |
| `/collaboration` | Collaboration hub |
| `/opportunities` | Opportunity listings |
| `/profile` | User profile editor |
| `/preferences` | Notification + account preferences |
| `/admin/overview` | Admin stat overview (admin login required) |
