# Live Webinar Attendee Feature - Flow Diagrams

## User Flow: Scheduling a Webinar with Attendees

```
┌─────────────────────────────────────────────────────────────────┐
│                  LIVE WEBINARS TAB                              │
└─────────────────────────────────────────────────────────────────┘
                              ▼
                    Click "Schedule Webinar"
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 SCHEDULE WEBINAR MODAL                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Title:        [_____________________________________]    │   │
│  │ Description:  [_____________________________________]    │   │
│  │ Date:         [_____________________]                    │   │
│  │ Time:         [_____________________]                    │   │
│  │ Topic:        [_____________________]                    │   │
│  │ Region:       [_____________________]                    │   │
│  │ Expert:       [_____________________]                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ▼                                   │
│              Add Participants Section                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Email: [__________________] [Add]                        │   │
│  │                                                           │   │
│  │ 🟦 Invited (0)              ← Shows attendee count      │   │
│  │                                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Attendee Addition Flow

```
User Types Email
      ▼
┌─────────────────────────────────┐
│ handleEmailInputChange()        │
│ - Filter suggestions            │
│ - Show dropdown                 │
└─────────────────────────────────┘
      ▼
┌─────────────────────────────────────────────────────────────────────┐
│ User Selects from Dropdown (or types & clicks Add)                  │
│                                                                     │
│         Option A: Click on suggestion in dropdown                   │
│              ▼                                                       │
│         addInvitedEmail(user.email)                                │
│              │                                                       │
│         Option B: Type full email & click Add                       │
│              ▼                                                       │
│         addInvitedEmail(emailInput)                                │
└─────────────────────────────────────────────────────────────────────┘
      ▼
┌──────────────────────────────────────────────────────┐
│ addInvitedEmail(email)                              │
│ ✅ FIXED: Uses callback pattern                      │
│                                                      │
│ setNewWebinar((prevWebinar) => {                    │
│   if (prevWebinar.invitedEmails.includes(email))   │
│     return prevWebinar;  // Duplicate              │
│                                                     │
│   return {                                          │
│     ...prevWebinar,                                │
│     invitedEmails: [..., email]  // Add new        │
│   };                                               │
│ });                                                │
└──────────────────────────────────────────────────────┘
      ▼
┌──────────────────────────────────────────────────┐
│ State Updated                                    │
│ newWebinar.invitedEmails = [email1, email2, ...]│
│                                                  │
│ UI Re-renders with "Invited (3)" section        │
└──────────────────────────────────────────────────┘
      ▼
Display Updated List:
  ┌─────────────────────────────────┐
  │ Invited (3)                     │
  │ ┌────────────────────────────┐   │
  │ │ email1@domain.com  [X]     │   │
  │ │ email2@domain.com  [X]     │   │
  │ │ email3@domain.com  [X]     │   │
  │ └────────────────────────────┘   │
  └─────────────────────────────────┘
```

## Schedule Meeting Flow

```
User Fills Form and Clicks "Schedule Webinar"
                   ▼
┌──────────────────────────────────────────────────────────────┐
│ handleScheduleWebinar()                                      │
│                                                              │
│ Validation:                                                 │
│ ✓ Title                ✓ Date        ✓ Topic              │
│ ✓ Time                 ✓ Region      ✓ Expert             │
└──────────────────────────────────────────────────────────────┘
                   ▼
         ❌ MISSING? Show Alert
                   ▼
         ✅ ALL PRESENT? Continue
                   ▼
┌──────────────────────────────────────────────────────────────┐
│ Generate Teams URL                                           │
│                                                              │
│ const teamsParams = new URLSearchParams();                 │
│ teamsParams.append('subject', title);                       │
│ teamsParams.append('content', description);                 │
│ teamsParams.append('startTime', startTime);                 │
│ teamsParams.append('endTime', endTime);                     │
│                                                              │
│ ✅ FIXED: Correct parameter name & separator                │
│ if (invitedEmails.length > 0) {                            │
│   teamsParams.append('people',                             │
│     invitedEmails.join(';')  // Semicolon separator!       │
│   );                                                        │
│ }                                                           │
└──────────────────────────────────────────────────────────────┘
                   ▼
┌──────────────────────────────────────────────────────────────┐
│ Build Final Teams URL                                        │
│                                                              │
│ https://teams.microsoft.com/l/meeting/new?                 │
│   subject=Meeting+Title                                    │
│   &content=Description                                     │
│   &startTime=2026-02-15T14:30:00Z                          │
│   &endTime=2026-02-15T15:30:00Z                            │
│   &people=email1%40domain.com%3Bemail2%40domain.com       │
│           ^^^^^^                                ^^         │
│    @ encoded as %40               ; encoded as %3B        │
└──────────────────────────────────────────────────────────────┘
                   ▼
┌──────────────────────────────────────────────────────────────┐
│ Save Meeting to localStorage                                 │
│                                                              │
│ const meetingRecord: ScheduledMeeting = {                  │
│   id, title, description, date, time,                      │
│   startDateTime, endDateTime,                              │
│   topic, region, expert,                                   │
│   attendees: invitedEmails,  // ← SAVED!                  │
│   lobbyBypass, teamsLink, createdAt, createdBy            │
│ };                                                         │
│                                                              │
│ localStorage.setItem('scheduledMeetings', JSON.stringify());│
└──────────────────────────────────────────────────────────────┘
                   ▼
┌──────────────────────────────────────────────────────────────┐
│ Open Teams in New Tab                                        │
│                                                              │
│ window.open(teamsLink, '_blank');                          │
│                                                              │
│ ↓↓↓ TEAMS BROWSER OPENS ↓↓↓                                │
│ [New Meeting Form]                                         │
│ Subject: Meeting Title                                     │
│ Description: Description text                             │
│ Start: 2026-02-15 14:30                                   │
│ End: 2026-02-15 15:30                                     │
│ Invited: [email1@domain.com]                              │
│          [email2@domain.com]                              │
│          [email3@domain.com]                              │
│ ✅ ALL ATTENDEES PRE-POPULATED!                            │
└──────────────────────────────────────────────────────────────┘
                   ▼
         Show Confirmation Alert
                   ▼
      Teams Meeting Created! ✅
      
      Title: Meeting Title
      Date: 2026-02-15 at 14:30
      Expert: Expert Name
      Attendees: 3 people ← SHOWS COUNT!
      ✓ Attendees: email1@domain.com, email2@domain.com, email3@domain.com
                   ▼
      Reset Form & Close Modal
                   ▼
      User Sees "My Meetings (1)" Updated
```

## State Management Flow

### ✅ Fixed: Callback Pattern

```
User Action (Add Email)
         ▼
setNewWebinar((prevWebinar) => {
  // prevWebinar has FRESH state ✅
  // Not the stale closure state ❌
  
  return {
    ...prevWebinar,
    invitedEmails: [
      ...prevWebinar.invitedEmails,  // Fresh copy
      newEmail
    ]
  };
});
         ▼
React Updates State
         ▼
Component Re-renders
         ▼
UI Shows Updated Invite List
```

### ❌ Was Broken: Direct State Reading

```
User Action (Add Email)
         ▼
if (newWebinar.invitedEmails.includes(email)) {  // ← STALE!
  // Reading old state from closure
}

setNewWebinar({
  ...newWebinar,  // ← STALE!
  invitedEmails: [
    ...newWebinar.invitedEmails,  // ← STALE!
    email
  ]
});
         ▼
React Updates State
         ▼
Multiple Updates Race
         ▼
Emails Missing or Duplicated ❌
```

## Teams URL Parameter Changes

### ❌ Before (Broken)
```
teamsParams.append('attendees', emails.join(','));

Result:
https://teams.microsoft.com/l/meeting/new?attendees=email1,email2,email3
                                          ^^^^^^^^^            ^
                            Teams doesn't recognize this    Wrong separator
```

### ✅ After (Fixed)
```
teamsParams.append('people', emails.join(';'));

Result:
https://teams.microsoft.com/l/meeting/new?people=email1;email2;email3
                                          ^^^^^^          ^
                            Correct Teams parameter    Right separator
```

## Console Debug Output

```
🟢 User adds attendee

🔵 addInvitedEmail called with: testuser.demo@gmail.com
Previous invitedEmails: []
✅ Adding email. Updated emails: ['testuser.demo@gmail.com']

🟢 User clicks Schedule Webinar

=== SCHEDULE WEBINAR INITIATED ===
Current newWebinar state: {...invitedEmails: Array(1)}
Invited emails: ['testuser.demo@gmail.com']
Number of invitees: 1

Before adding people param - Invited emails: Array(1)
Adding people param with: testuser.demo@gmail.com

=== TEAMS MEETING DEBUG ===
Teams Link: https://teams.microsoft.com/l/meeting/new?...&people=testuser.demo%40gmail.com
Number of attendees: 1
Attendees array: ['testuser.demo@gmail.com']
Attendees joined with semicolon: testuser.demo@gmail.com

✅ SUCCESS!
```

---

## Visual: My Meetings Display

```
┌─────────────────────────────────────────────────────────────────┐
│ My Meetings (1)                                                 │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Testing Attendee Feature - AI Integration...               │ │
│ │                                                             │ │
│ │ This is a test webinar to verify that attendees are        │ │
│ │ properly added to the Teams meeting form...                │ │
│ │                                                             │ │
│ │ 📅 2026-02-15 at 14:30    👥 3 attendees                 │ │
│ │ 🏢 Expert: Amara Okafor    🌍 West Africa                │ │
│ │ 🎓 Topic: Digital Transformation                           │ │
│ │                                                             │ │
│ │ Invited:                                                   │ │
│ │ 🔵 testuser.demo@gmail.com                                │ │
│ │ 🔵 sarah.johnson@forvismazars.com                         │ │
│ │ 🔵 michael.chen@forvismazars.com                          │ │
│ │                                                             │ │
│ │ [Delete]                    [Join Meeting] [Edit in Teams] │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

**All diagrams show the fixed implementation!**
