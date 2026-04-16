# 🎯 Admin Dashboard Quick Reference Guide

## 🔐 Access Information

**URL**: http://localhost:5173/admin/login

**Credentials**:
- Email: `admin@deiafrica.com`
- Password: `admin123`

---

## 📋 Dashboard Tabs Overview

### 1. **Overview Tab** 📊
**Purpose**: System-wide analytics and quick actions

**Features**:
- 8 real-time statistics cards
- Recent activity feed
- Quick action buttons for common tasks
- Growth indicators (% changes)

**Metrics Displayed**:
- Total Users
- Active Mentors
- Upcoming Sessions
- Open Opportunities
- Active Questions
- Published Content
- Total Sessions
- Engagement Rate

---

### 2. **Users Tab** 👥
**Purpose**: Manage all platform users

**CRUD Operations**:
- ✅ **CREATE**: Click "Add New" → Fill form → Save
- ✅ **READ**: View all users in cards
- ✅ **UPDATE**: Click edit icon → Modify → Save
- ✅ **DELETE**: Click trash icon → Confirm

**Fields**:
- Full Name *
- Email *
- Phone
- Role * (mentee/mentor/admin)
- Status * (active/inactive/suspended)
- Photo URL

**Display Info**:
- Profile photo
- Contact details
- Role badge
- Status badge
- Sessions attended
- Join date

---

### 3. **Mentors Tab** 🎓
**Purpose**: Manage mentor profiles

**CRUD Operations**:
- ✅ Full create, read, update, delete

**Fields**:
- Full Name *
- Email *
- Phone
- Expertise (comma-separated)
- Bio *
- Photo URL
- Status (active/inactive)

**Display Info**:
- Profile photo
- Contact information
- Bio description
- Expertise tags
- Rating (out of 5)
- Total mentees
- Sessions completed
- Status badge

**Special Features**:
- Auto-converts comma-separated expertise to tags
- Auto-generates avatar if no photo provided
- Shows performance metrics

---

### 4. **Sessions Tab** 📅
**Purpose**: Manage mentoring sessions

**CRUD Operations**:
- ✅ Schedule, view, update, cancel sessions

**Fields**:
- Session Title *
- Mentor ID *
- Mentor Name *
- Mentee ID *
- Mentee Name *
- Scheduled Date/Time *
- Duration (minutes) *
- Meeting Link
- Status (scheduled/completed/cancelled)
- Notes

**Display Info**:
- Session title
- Mentor and mentee names
- Scheduled date/time (formatted)
- Duration
- Meeting link (clickable)
- Notes
- Status badge with color coding

**Tips**:
- Use datetime-local format for scheduling
- Meeting links are clickable
- Status updates automatically

---

### 5. **Opportunities Tab** 💼
**Purpose**: Manage job opportunities

**CRUD Operations**:
- ✅ Post, view, edit, remove opportunities

**Fields**:
- Job Title *
- Description *
- Industry *
- Client Sector
- Regions
- Budget Range
- Deadline *
- Priority (low/medium/high)
- Status (open/closed/filled)
- Contact Person

**Display Info**:
- Job title and description
- Industry and sector
- Geographic regions
- Budget range
- Deadline date
- Applicant count
- Priority badge (color-coded)
- Status badge

**Color Coding**:
- 🔴 High Priority = Red
- 🟡 Medium Priority = Yellow
- 🟢 Low Priority = Green

---

### 6. **Questions Tab** ❓
**Purpose**: Manage forum questions

**CRUD Operations**:
- ✅ Add, view, edit, remove questions

**Fields**:
- Question Title *
- Question Content *
- Author Name
- Author ID
- Category *
- Status (open/answered/closed)

**Display Info**:
- Question title and content
- Author name
- Category badge
- Answer count
- View count
- Status badge

**Auto-Features**:
- Auto-sets views to 0
- Auto-sets answers to 0
- Auto-timestamps creation date

---

### 7. **Content Tab** 📹
**Purpose**: Manage videos and articles

**CRUD Operations**:
- ✅ Add, view, edit, remove content

**Fields**:
- Content Type * (video/article)
- Title *
- Description *
- URL *
- Category *
- Author
- Cover Image URL
- Status (draft/published/archived)

**Display Info**:
- Cover image thumbnail
- Type badge (video/article)
- Title and description
- Category tag
- Author name
- View count
- Like count
- Status badge

**Types**:
- 🎥 Video = Red badge
- 📰 Article = Blue badge

---

### 8. **Settings Tab** ⚙️
**Purpose**: System configuration

**Settings Available**:
- Platform Name
- Admin Email
- Default Session Duration

---

## 🔍 Search & Filter Features

### Search Bar
- Real-time search across ALL fields
- Works on all tabs
- Case-insensitive
- Instant results

**Search Examples**:
- Type name to find users
- Type email to find contacts
- Type expertise to find mentors
- Type category to find content

### Status Filter
- Dropdown filter beside search
- Tab-specific options
- Combines with search

**Filter Options by Tab**:
- Users: active, inactive, suspended
- Mentors: active, inactive
- Sessions: scheduled, completed, cancelled
- Opportunities: open, closed, filled
- Questions: open, answered, closed
- Content: draft, published, archived

---

## 🎨 UI Elements Guide

### Status Badges
- 🟢 **Green**: Active, Open, Published, Completed
- 🔴 **Red**: Suspended, Cancelled, High Priority
- 🟡 **Yellow**: Draft, Medium Priority
- ⚫ **Gray**: Inactive, Closed, Archived, Low Priority
- 🔵 **Blue**: Scheduled, Filled, Answered

### Action Buttons
- ✏️ **Edit Icon**: Opens form with pre-filled data
- 🗑️ **Trash Icon**: Deletes with confirmation
- ➕ **Add New**: Opens blank form
- 💾 **Save**: Submits form
- ❌ **Cancel**: Closes form without saving

### Cards
- Hover for shadow effect
- Click edit/delete for actions
- Auto-scroll to form on edit

---

## 💡 Pro Tips

### Adding Items
1. Click "Add New" button (top right)
2. Fill required fields (marked with *)
3. Optional fields can be left empty
4. Click "Add" button at bottom
5. Item appears immediately in list

### Editing Items
1. Click edit icon (✏️) on any card
2. Form auto-fills with current data
3. Modify any field
4. Click "Update" button
5. Changes save immediately

### Deleting Items
1. Click trash icon (🗑️) on any card
2. Confirmation dialog appears
3. Click "OK" to confirm
4. Item removed immediately

### Searching
1. Type in search box
2. Results filter in real-time
3. Clear search to see all items

### Filtering
1. Select status from dropdown
2. List updates automatically
3. Combine with search for precision

---

## 🚨 Important Notes

### Required Fields
**Always** marked with asterisk (*)
- Form won't submit without them
- Alert shows missing fields

### Data Persistence
- Currently uses **local state** (in-memory)
- Data resets on page refresh
- Ready for backend API integration

### Auto-Generated Data
- IDs: Auto-generated timestamps
- Dates: Current date for new items
- Photos: Auto-avatar if URL missing
- Counters: Start at 0 for new items

### Validation
- Email fields expect valid email format
- URLs expect full URLs
- Dates expect proper date format
- Numbers expect numeric input

---

## 🎯 Common Workflows

### Onboarding New Mentor
1. Go to **Mentors** tab
2. Click **Add New**
3. Fill in: Name, Email, Bio (minimum)
4. Add expertise: "Leadership, Strategy, Coaching"
5. Set status to "active"
6. Click **Add Mentor**
7. ✅ Mentor appears in list

### Scheduling Session
1. Go to **Sessions** tab
2. Click **Add New**
3. Enter session title
4. Add mentor/mentee IDs and names
5. Set date/time (future)
6. Set duration (e.g., 60 minutes)
7. Add meeting link (optional)
8. Click **Add Session**
9. ✅ Session scheduled

### Posting Job Opportunity
1. Go to **Opportunities** tab
2. Click **Add New**
3. Enter job title and description
4. Set industry, budget, deadline
5. Set priority (high/medium/low)
6. Set status to "open"
7. Click **Add Opportunity**
8. ✅ Opportunity posted

### Publishing Content
1. Go to **Content** tab
2. Click **Add New**
3. Select type (video/article)
4. Enter title, description, URL
5. Add category and author
6. Set status to "published"
7. Click **Add Content**
8. ✅ Content live

---

## 📈 Statistics Tracking

All stats on **Overview** tab update automatically:
- Calculated from actual data
- Real-time updates
- Growth indicators shown
- Color-coded by category

---

## 🔒 Security Features

1. **Protected Routes**: Must be logged in
2. **Logout Button**: Top right corner
3. **Confirmation Dialogs**: All deletions
4. **Token-Based Auth**: localStorage verification

---

## ✅ Success Indicators

**After Adding Item**:
- Modal closes automatically
- New card appears in list
- Form resets to blank

**After Editing Item**:
- Changes reflect immediately
- Modal closes
- Updated data shows

**After Deleting Item**:
- Confirmation required
- Card removed from list
- No undo (confirm carefully!)

**Search Working**:
- Results update as you type
- Matching items highlighted
- "No results" message if none

---

## 🎊 You're Ready!

The comprehensive admin dashboard gives you complete control over:
- ✅ User accounts
- ✅ Mentor profiles
- ✅ Session scheduling
- ✅ Job opportunities
- ✅ Forum questions
- ✅ Content library
- ✅ System settings

**Everything is at your fingertips!** 🚀
