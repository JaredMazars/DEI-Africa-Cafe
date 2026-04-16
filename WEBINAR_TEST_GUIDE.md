# Live Webinar Test Guide

## Quick Test Instructions

### Test Scenario: Creating a Live Webinar with Multiple Attendees

**Webinar Details:**
- **Title:** Testing Attendee Feature - AI Integration in African Finance
- **Description:** This is a test webinar to verify that attendees are properly added to the Teams meeting form. We will discuss the role of AI and automation in financial services across Africa.
- **Date:** 2026-02-15
- **Time:** 14:30 (2:30 PM)
- **Topic:** Digital Transformation
- **Region:** West Africa
- **Expert:** Amara Okafor
- **Attendees to Add:**
  1. testuser.demo@gmail.com (Test Gmail User)
  2. sarah.johnson@forvismazars.com (Sarah Johnson)
  3. michael.chen@forvismazars.com (Michael Chen)

### Step-by-Step Instructions

#### Step 1: Navigate to Live Webinars
1. Open the app
2. Go to the **Expert Directory**
3. Click on the **"Live Webinars"** tab (or "Webinars" tab)

#### Step 2: Schedule a New Webinar
1. Click the blue **"Schedule Webinar"** button in the top right
2. The schedule modal should open

#### Step 3: Fill in Webinar Details
Fill in the following fields:

| Field | Value |
|-------|-------|
| Webinar Title | Testing Attendee Feature - AI Integration in African Finance |
| Description | This is a test webinar to verify that attendees are properly added to the Teams meeting form. We will discuss the role of AI and automation in financial services across Africa. |
| Date | 2026-02-15 |
| Time | 14:30 |
| Topic | Digital Transformation |
| Region | West Africa |
| Expert | Amara Okafor |
| Max Attendees | 50 (default) |

#### Step 4: Add Attendees (The Test)
1. In the **"Add Participants"** section, type "test" in the email input field
2. You should see a dropdown with "Test User Gmail" - click on it
3. You should see "testuser.demo@gmail.com" added in the "Invited (1)" section below

**Repeat for other attendees:**
4. Type "sarah" in the email input field
5. Click on "Sarah Johnson" from the dropdown
6. Verify it appears in the "Invited (2)" section

7. Type "michael" in the email input field
8. Click on "Michael Chen" from the dropdown
9. Verify it appears in the "Invited (3)" section

**Alternative: Manual Entry**
Instead of selecting from dropdown, you can:
- Type the full email directly (e.g., `testuser.demo@gmail.com`)
- Click the **"Add"** button
- Verify it appears in the Invited list

#### Step 5: Set Lobby Settings
- Keep the **Teams Lobby Settings** as default: "Invited People Only" (most secure)

#### Step 6: Schedule the Webinar
1. Click the green **"Schedule Webinar"** button
2. You should see an alert showing:
   - Title
   - Date and time
   - Expert name
   - **Attendees: 3 people** ← THIS IS THE KEY TEST
   - List of attendees

#### Step 7: Verify Teams Integration
1. **Check the browser console** (F12 → Console tab)
2. Look for logs starting with `=== SCHEDULE WEBINAR INITIATED ===`
3. You should see:
   ```
   Current newWebinar state: {...}
   Invited emails: ['testuser.demo@gmail.com', 'sarah.johnson@forvismazars.com', 'michael.chen@forvismazars.com']
   Number of invitees: 3
   ```
4. Further down in the console, look for:
   ```
   Before adding people param - Invited emails: [3 emails]
   Adding people param with: testuser.demo@gmail.com;sarah.johnson@forvismazars.com;michael.chen@forvismazars.com
   ```
5. You should see the full Teams URL with `&people=...` parameter

#### Step 8: Verify Meeting Was Saved
1. A new Teams tab should open with the meeting form
2. **Check the "Invited" field in Teams** - it should show the 3 attendees
3. Back in the app, click **"My Meetings (1)"** button to see your scheduled meeting
4. The meeting card should show:
   - Title
   - Date and time
   - 3 attendees listed below
   - Expert name and region

### Success Criteria

✅ **Test PASSES if ALL of these are true:**
1. Attendees can be added to the invite list
2. Added attendees appear in the "Invited (3)" section with email badges
3. The alert shows "Attendees: 3 people"
4. The console shows the 3 emails in the Teams URL parameters
5. Teams meeting opens with attendees pre-populated in the Invite field
6. "My Meetings" list shows the 3 attendees

### Troubleshooting

**If attendees don't appear in the dropdown:**
- Make sure you're typing at least 2 characters
- Try searching by: email, name, or organization
- Try the test user: type "test" or "gmail"

**If attendees don't appear after clicking Add:**
- Check the browser console for error messages
- Look for logs showing "🔵 addInvitedEmail called"
- Verify the email contains "@" symbol

**If attendees aren't in Teams URL:**
- Open browser console
- Look for "Adding people param with:" message
- Check that emails are separated by semicolons (;)
- Verify the Teams URL has `&people=email1;email2;email3`

**If Teams meeting doesn't open:**
- Check if Teams is installed
- Try opening Teams manually and creating a meeting to test
- Check browser popup settings

### Expected Console Output

When you click "Schedule Webinar", you should see in the console:

```javascript
🎯 SCHEDULE WEBINAR INITIATED ===
Current newWebinar state: {title: "Testing...", invitedEmails: Array(3), ...}
Invited emails: ['testuser.demo@gmail.com', 'sarah.johnson@forvismazars.com', 'michael.chen@forvismazars.com']
Number of invitees: 3

Before adding people param - Invited emails: Array(3)
Adding people param with: testuser.demo@gmail.com;sarah.johnson@forvismazars.com;michael.chen@forvismazars.com

=== TEAMS MEETING DEBUG ===
Teams Link: https://teams.microsoft.com/l/meeting/new?subject=Testing%20Attendee%20Feature...&people=testuser.demo%40gmail.com%3Bsarah.johnson%40forvismazars.com%3Bmichael.chen%40forvismazars.com
Number of attendees: 3
Attendees array: (3) ['testuser.demo@gmail.com', 'sarah.johnson@forvismazars.com', 'michael.chen@forvismazars.com']
Attendees joined with semicolon: testuser.demo@gmail.com;sarah.johnson@forvismazars.com;michael.chen@forvismazars.com
```

This confirms the fix is working correctly!

---

**Questions?** Check the console logs first - they will tell you exactly what's happening at each step!
