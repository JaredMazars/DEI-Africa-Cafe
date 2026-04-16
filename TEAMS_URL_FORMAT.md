# Teams Meeting URL Format Verification

## Generated Teams URL Example

When scheduling the test webinar with 3 attendees, the generated Teams URL should look like this:

### URL Structure
```
https://teams.microsoft.com/l/meeting/new?subject=[TITLE]&content=[DESCRIPTION]&startTime=[START]&endTime=[END]&people=[EMAILS]
```

### Full Example URL (for reference)
```
https://teams.microsoft.com/l/meeting/new?
  subject=Testing+Attendee+Feature+-+AI+Integration+in+African+Finance
  &content=This+is+a+test+webinar+to+verify+that+attendees+are+properly+added+to+the+Teams+meeting+form.
  &startTime=2026-02-15T14%3A30%3A00.000Z
  &endTime=2026-02-15T15%3A30%3A00.000Z
  &people=testuser.demo%40gmail.com%3Bsarah.johnson%40forvismazars.com%3Bmichael.chen%40forvismazars.com
```

### Key Parameters
- `subject` = Webinar title (URL encoded)
- `content` = Description (URL encoded)
- `startTime` = ISO format datetime with Z (UTC)
- `endTime` = ISO format datetime with Z (UTC)
- `people` = Semicolon-separated email list (URL encoded)

### URL Encoded Values
| Original | Encoded |
|----------|---------|
| @ | %40 |
| ; | %3B |
| : | %3A |
| space | + |

### What Happens When You Click This URL
1. Teams app opens (or web version)
2. New meeting form appears pre-filled with:
   - Meeting subject (title)
   - Description
   - Start and end times
   - **Attendees list** with all 3 emails

### Verification Checklist
When the Teams link opens, verify:
- [ ] Meeting title is "Testing Attendee Feature - AI Integration in African Finance"
- [ ] Description mentions the test
- [ ] Date shows: February 15, 2026
- [ ] Time shows: 14:30 (2:30 PM)
- [ ] **Invited field shows 3 attendees:**
  - testuser.demo@gmail.com
  - sarah.johnson@forvismazars.com
  - michael.chen@forvismazars.com

### Console Log Verification
After clicking "Schedule Webinar", in the browser console you should see:

**Step 1: Function Call**
```
🔵 addInvitedEmail called with: testuser.demo@gmail.com
Previous invitedEmails: []
✅ Adding email. Updated emails: ['testuser.demo@gmail.com']
```
(Repeated 2 more times for other attendees)

**Step 2: Schedule Initiated**
```
=== SCHEDULE WEBINAR INITIATED ===
Current newWebinar state: {..., invitedEmails: Array(3)}
Invited emails: ['testuser.demo@gmail.com', 'sarah.johnson@forvismazars.com', 'michael.chen@forvismazars.com']
Number of invitees: 3
```

**Step 3: Teams URL Generated**
```
Before adding people param - Invited emails: Array(3)
Adding people param with: testuser.demo@gmail.com;sarah.johnson@forvismazars.com;michael.chen@forvismazars.com

=== TEAMS MEETING DEBUG ===
Teams Link: https://teams.microsoft.com/l/meeting/new?...&people=testuser.demo%40gmail.com%3Bsarah.johnson%40forvismazars.com%3Bmichael.chen%40forvismazars.com
Number of attendees: 3
Attendees array: Array(3) ['testuser.demo@gmail.com', 'sarah.johnson@forvismazars.com', 'michael.chen@forvismazars.com']
Attendees joined with semicolon: testuser.demo@gmail.com;sarah.johnson@forvismazars.com;michael.chen@forvismazars.com
```

### Troubleshooting Console Logs

**Problem: No attendees showing**
- Look for: `Number of attendees: 0`
- Solution: Check if emails were actually added to the list

**Problem: Attendees not in URL**
- Look for: `Adding people param with:` showing empty string
- Solution: Verify attendees array has emails

**Problem: Wrong separator used**
- Look for: Commas instead of semicolons
- Solution: Should be `email1;email2;email3` not `email1,email2,email3`

**Problem: Email encoding issues**
- Look for: @ not encoded as %40
- Solution: URLSearchParams handles encoding automatically

---

## Testing the Fix

The fix changed the attendee handling from:
```javascript
// ❌ OLD (Broken)
teamsParams.append('attendees', newWebinar.invitedEmails.join(','));
```

To:
```javascript
// ✅ NEW (Fixed)
teamsParams.append('people', newWebinar.invitedEmails.join(';'));
```

**Key Changes:**
1. Parameter name: `attendees` → `people` (Teams API expects `people`)
2. Separator: `,` → `;` (Teams expects semicolon-separated values)
3. State management: Direct read → Callback pattern (avoids stale state)

This ensures attendees are properly passed to the Teams meeting form!
