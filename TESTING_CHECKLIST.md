# Live Webinar Testing Checklist ✅

## Pre-Test Setup

- [ ] Project is running (`npm run dev`)
- [ ] Browser console is open (F12)
- [ ] Navigated to Expert Directory
- [ ] Live Webinars tab is visible

---

## Test Case 1: Single Attendee Addition

### Step 1: Open Schedule Webinar Modal
- [ ] Click "Schedule Webinar" button
- [ ] Modal appears with form fields

### Step 2: Fill Basic Information
- [ ] **Title:** Enter "Test Single Attendee"
- [ ] **Description:** Enter "Testing with one attendee"
- [ ] **Date:** Select 2026-02-15
- [ ] **Time:** Select 14:30
- [ ] **Topic:** Select "Digital Transformation"
- [ ] **Region:** Select "West Africa"
- [ ] **Expert:** Select "Amara Okafor"

### Step 3: Add Test Gmail User
- [ ] Type "test" in email field
- [ ] Dropdown appears with "Test User Gmail"
- [ ] [ ] Click on "Test User Gmail"
- [ ] Email disappears from input field
- [ ] "Invited (1)" section appears
- [ ] "testuser.demo@gmail.com" shown with [X] button
- [ ] Console shows: `✅ Adding email. Updated emails: ['testuser.demo@gmail.com']`

### Step 4: Schedule the Webinar
- [ ] Click "Schedule Webinar" button
- [ ] Alert appears showing:
  - [ ] Title: "Test Single Attendee"
  - [ ] Date: "2026-02-15 at 14:30"
  - [ ] Expert: "Amara Okafor"
  - [ ] **Attendees: 1 people** ✅
  - [ ] Shows email: "testuser.demo@gmail.com"

### Step 5: Verify Console Output
- [ ] `=== SCHEDULE WEBINAR INITIATED ===` appears
- [ ] `Number of invitees: 1` shown
- [ ] `Adding people param with: testuser.demo@gmail.com` shown
- [ ] `Number of attendees: 1` in debug section
- [ ] URL contains `&people=testuser.demo%40gmail.com`

### Step 6: Verify Teams Integration
- [ ] Teams tab opens automatically
- [ ] Meeting form visible
- [ ] Invited field shows: testuser.demo@gmail.com
- [ ] Meeting title matches: "Test Single Attendee"

### Step 7: Check My Meetings
- [ ] Close Teams tab
- [ ] Go back to app
- [ ] Click "My Meetings (1)" button
- [ ] Meeting card appears showing:
  - [ ] Title: "Test Single Attendee"
  - [ ] Date/Time: "2026-02-15 at 14:30"
  - [ ] Attendees section with "testuser.demo@gmail.com"

---

## Test Case 2: Multiple Attendees

### Step 1: Open Schedule Webinar Modal
- [ ] Click "Schedule Webinar" button
- [ ] Form is empty and ready

### Step 2: Fill Basic Information
- [ ] **Title:** "Test Multiple Attendees"
- [ ] **Description:** "Testing with multiple attendees"
- [ ] **Date:** 2026-02-20
- [ ] **Time:** 15:00
- [ ] **Topic:** "ESG & Sustainability"
- [ ] **Region:** "East Africa"
- [ ] **Expert:** "Thabo Mthembu"

### Step 3: Add First Attendee (Dropdown Selection)
- [ ] Type "test" in email field
- [ ] Click "Test User Gmail"
- [ ] Verify: "Invited (1)" appears
- [ ] Verify: testuser.demo@gmail.com shown

### Step 4: Add Second Attendee
- [ ] Type "sarah" in email field
- [ ] Dropdown shows "Sarah Johnson"
- [ ] Click on it
- [ ] Verify: "Invited (2)" appears
- [ ] Verify: Both emails shown

### Step 5: Add Third Attendee
- [ ] Type "michael" in email field
- [ ] Click "Michael Chen"
- [ ] Verify: "Invited (3)" appears
- [ ] Verify: All 3 emails visible

### Step 6: Test Remove Function
- [ ] Click [X] button on middle email
- [ ] Verify: "Invited (2)" now shows
- [ ] Verify: Only 2 emails remain
- [ ] Console shows: `Updated emails after removal: Array(2)`

### Step 7: Add Back the Removed Email
- [ ] Type "michael" again
- [ ] Click "Michael Chen"
- [ ] Verify: "Invited (3)" appears again

### Step 8: Schedule Meeting
- [ ] Click "Schedule Webinar"
- [ ] Alert shows "Attendees: 3 people"
- [ ] Shows all 3 emails
- [ ] Console shows semicolon-separated emails

### Step 9: Verify Console
- [ ] `Number of invitees: 3` shown
- [ ] `Adding people param with: testuser.demo@gmail.com;sarah.johnson@forvismazars.com;michael.chen@forvismazars.com`
- [ ] URL has: `&people=testuser.demo%40gmail.com%3Bsarah.johnson%40forvismazars.com%3Bmichael.chen%40forvismazars.com`

### Step 10: Verify Teams
- [ ] Teams opens
- [ ] All 3 emails in Invited field
- [ ] Meeting details correct

### Step 11: Check My Meetings
- [ ] Click "My Meetings (2)" (2 meetings now)
- [ ] Both webinars show correct attendee counts
- [ ] New meeting shows 3 attendees

---

## Test Case 3: Manual Email Entry

### Step 1: Open Schedule Webinar Modal
- [ ] Click "Schedule Webinar"
- [ ] Form ready

### Step 2: Fill Basic Information
- [ ] **Title:** "Test Manual Email Entry"
- [ ] **Description:** "Testing manual email input"
- [ ] Other fields filled as needed

### Step 3: Manual Email Entry
- [ ] Type full email: "testuser.demo@gmail.com"
- [ ] **DON'T** click dropdown
- [ ] Click "Add" button instead
- [ ] Verify: Email appears in "Invited (1)"
- [ ] Input field cleared

### Step 4: Add Another Manual Email
- [ ] Type: "sarah.johnson@forvismazars.com"
- [ ] Click "Add"
- [ ] Verify: "Invited (2)" shows both emails

### Step 5: Schedule and Verify
- [ ] Click "Schedule Webinar"
- [ ] Verify: Both emails in alert
- [ ] Verify: Teams URL has both emails separated by semicolon
- [ ] Verify: Teams opens with both attendees

---

## Test Case 4: Error Handling

### Test 4A: Duplicate Email
- [ ] Add "testuser.demo@gmail.com"
- [ ] Verify: "Invited (1)" appears
- [ ] Try to add same email again
- [ ] Verify: Not added twice
- [ ] Console shows: `⚠️ Email already exists in invitedEmails`
- [ ] Still shows "Invited (1)"

### Test 4B: Invalid Email Format
- [ ] Type "invalid-email" (no @ symbol)
- [ ] Click "Add"
- [ ] Alert shows: "Please enter a valid email address"
- [ ] Console shows: `⚠️ Email does not contain @ symbol`
- [ ] Email not added

### Test 4C: Empty Email
- [ ] Leave email field empty
- [ ] Click "Add"
- [ ] Alert shows: "Please enter an email address"
- [ ] Console shows: `⚠️ Email input is empty`

### Test 4D: No Attendees
- [ ] Fill all required fields
- [ ] Don't add any attendees
- [ ] Click "Schedule Webinar"
- [ ] Alert shows: "Attendees: 0 people"
- [ ] Console shows: `⚠️ No invited emails found!`
- [ ] Teams URL still opens but without people parameter

---

## Console Verification Points

### ✅ Success Signs
- [ ] 🔵 "addInvitedEmail called with:" - Shows function was called
- [ ] ✅ "Adding email. Updated emails:" - Shows array updated
- [ ] "Number of invitees: X" - Correct count
- [ ] "Adding people param with:" - Shows email list
- [ ] "Attendees joined with semicolon:" - Shows correct separator
- [ ] `&people=email1%40domain%3Bemail2%40domain` - Correct URL encoding

### ⚠️ Warning Signs
- [ ] ⚠️ "Email already exists" - Duplicate attempt
- [ ] ⚠️ "Email is empty" - Validation failed
- [ ] ⚠️ "No invited emails found!" - No attendees added
- [ ] "Number of attendees: 0" - Attendees weren't passed

---

## Final Verification Checklist

### ✅ All Tests Pass When:
- [ ] Single attendee test: Email appears in Teams and alert
- [ ] Multiple attendee test: All 3 emails in Teams, semicolon-separated
- [ ] Manual entry test: Manual emails work same as dropdown
- [ ] Error handling: Invalid emails rejected, duplicates prevented
- [ ] Console logs: All debug messages appear correctly
- [ ] Teams integration: Teams URL has correct format
- [ ] My Meetings: Shows attendee count and list
- [ ] localStorage: Data persists when refreshing page

---

## Sign-Off

**Tester Name:** ___________________

**Date:** ___________________

**All Tests Passed:** [ ] YES  [ ] NO

**Issues Found:**
```
(Describe any issues here)




```

**Notes:**
```
(Additional comments)




```

---

## Quick Reference: Expected Values

| Test | Attendees | URL Contains | Alert Shows |
|------|-----------|--------------|-------------|
| Test 1 | 1 | `&people=testuser.demo%40gmail.com` | "Attendees: 1 people" |
| Test 2 | 3 | 3 emails separated by `%3B` | "Attendees: 3 people" |
| Test 3 | 2 | manual emails with `;` separator | "Attendees: 2 people" |
| Test 4A | 1 | (no duplicate) | "Attendees: 1 people" |
| Test 4B | 0 | (no invalid email) | Alert rejection |
| Test 4C | 0 | (no empty email) | Alert rejection |
| Test 4D | 0 | (no people param) | "Attendees: 0 people" |

---

**✅ USE THIS CHECKLIST TO VERIFY ALL FUNCTIONALITY IS WORKING!**
