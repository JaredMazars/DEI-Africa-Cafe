# Quick Reference: Live Webinar Attendee Feature

## What Was Fixed

| Issue | Before | After | Result |
|-------|--------|-------|--------|
| Teams Parameter | `attendees` ❌ | `people` ✅ | Attendees recognized |
| Email Separator | `,` ❌ | `;` ✅ | Correct Teams URL |
| State Management | Stale state ❌ | Callback pattern ✅ | Reliable additions |
| Test Data | None ❌ | Gmail user ✅ | Easy testing |

---

## Test User

**Gmail Test User:**
- Name: Test User Gmail
- Email: `testuser.demo@gmail.com`
- Search by: "test" or "gmail"

---

## Step-by-Step Test Flow

```
1. Live Webinars Tab
   ↓
2. Schedule Webinar Button
   ↓
3. Fill Form (Title, Date, Time, Topic, Region, Expert)
   ↓
4. Type "test" in Email Field
   ↓
5. Click "Test User Gmail"
   ↓
6. See "Invited (1)" with testuser.demo@gmail.com
   ↓
7. Click "Schedule Webinar"
   ↓
8. Alert shows "Attendees: 1 people ✓"
   ↓
9. Teams Opens with Attendee in Invite Field ✓
```

---

## Console Verification

### ✅ Success Indicators in Console

```javascript
🔵 addInvitedEmail called with: testuser.demo@gmail.com
✅ Adding email. Updated emails: ['testuser.demo@gmail.com']
=== SCHEDULE WEBINAR INITIATED ===
Number of invitees: 1
Before adding people param - Invited emails: Array(1)
Adding people param with: testuser.demo@gmail.com
Number of attendees: 1
```

### ❌ Failure Indicators

```javascript
⚠️ Email already exists  // Duplicate attempt
⚠️ Email is empty!       // Validation failed
Number of attendees: 0   // None were added
```

---

## Key Changes Summary

### 1. addInvitedEmail()
```javascript
// Used callback to avoid stale state
setNewWebinar((prevWebinar) => {
  // Now has fresh state!
  return { ...prevWebinar, invitedEmails: updated };
});
```

### 2. removeInvitedEmail()
```javascript
// Same callback pattern for consistency
setNewWebinar((prevWebinar) => {
  // Remove from fresh state
  return { ...prevWebinar, invitedEmails: filtered };
});
```

### 3. handleScheduleWebinar()
```javascript
// Fixed Teams URL
teamsParams.append('people', newWebinar.invitedEmails.join(';'));
//                  ^^^^^^                                    ^
//                Changed from 'attendees'          Semicolon not comma
```

---

## Files to Reference

| File | Purpose |
|------|---------|
| `ExpertDirectory.tsx` | Main component (fixes applied here) |
| `WEBINAR_TEST_GUIDE.md` | Full testing instructions |
| `TEAMS_URL_FORMAT.md` | Teams URL documentation |
| `FIXES_SUMMARY.md` | Detailed technical summary |
| `test-webinar.js` | Test script (run in console) |

---

## Debugging Command

Run in browser console to see test data:
```javascript
// Copy-paste from test-webinar.js
```

---

## Success Checklist

- [ ] Test user "testuser.demo@gmail.com" appears in dropdown
- [ ] Attendee can be added to invite list
- [ ] "Invited (1)" shows with email
- [ ] Can add multiple attendees
- [ ] Each attendee has remove button (X)
- [ ] Alert shows correct count
- [ ] Console shows semicolon-separated emails
- [ ] Teams opens with attendees in Invite field
- [ ] "My Meetings" shows attendee count

---

## Need Help?

1. **Check Console First** (F12 → Console)
2. **Look for 🔵 and ✅ indicators** - show success
3. **Look for ⚠️ indicators** - show problems
4. **Read WEBINAR_TEST_GUIDE.md** - detailed steps
5. **Reference TEAMS_URL_FORMAT.md** - URL structure

**All console output is logged for debugging!**
