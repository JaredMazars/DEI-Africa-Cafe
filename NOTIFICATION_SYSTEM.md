# Notification System Documentation

## Overview
A complete notification system has been implemented for the DEI Cafe mentorship platform. This includes in-app notifications, browser notifications, notification preferences, and a centralized notification center.

## ✅ Completed Features

### 1. **NotificationContext** (`src/contexts/NotificationContext.tsx`)
- Centralized state management for all notifications
- Persistent storage using localStorage
- Auto-cleanup (notifications expire after 30 days)
- 8 notification types: message, session, connection, opportunity, expert, webinar, request, system

### 2. **NotificationCenter Component** (`src/components/NotificationCenter.tsx`)
- Beautiful dropdown panel accessible from navigation bar
- Two tabs: "All" and "Unread"
- Mark as read/Mark all as read functionality
- Individual notification deletion
- Clear all notifications
- Notification preferences panel
- Browser notification permission request
- Empty states for better UX

### 3. **Navigation Integration** (`src/components/Navigation.tsx`)
- Notification bell icon with live badge count
- Shows "9+" for 10 or more unread notifications
- Click to toggle notification center
- Hover effects and animations

### 4. **Browser Notifications**
- Native browser notification support
- Permission request prompt in settings
- Auto-shows notifications when permission granted
- Respects user preferences

### 5. **Notification Preferences**
- Enable/disable notifications by type
- Session reminder timing (5, 15, 30, 60 minutes)
- Email notification toggle
- Browser notification toggle
- All preferences persist in localStorage

---

## 🚀 How to Use

### Adding Notifications in Your Components

```typescript
import { useNotifications } from '../contexts/NotificationContext';

function YourComponent() {
  const { addNotification } = useNotifications();

  const handleSomeAction = () => {
    // Add a notification
    addNotification({
      type: 'message',  // or 'session', 'connection', 'opportunity', 'expert', 'webinar', 'request', 'system'
      title: 'New Message',
      message: 'John Doe sent you a message',
      avatar: 'https://example.com/avatar.jpg', // Optional
      actionUrl: '/discussion', // Optional - where to navigate when clicked
      priority: 'high' // Optional - 'low', 'medium', 'high'
    });
  };

  return <button onClick={handleSomeAction}>Send Notification</button>;
}
```

### Notification Types

| Type | Icon | Color | Use Case |
|------|------|-------|----------|
| `message` | MessageCircle | Blue | New chat messages |
| `session` | Calendar | Green | Session reminders, scheduling |
| `connection` | UserPlus | blue | New connections, friend requests |
| `opportunity` | Briefcase | Orange | New opportunities, job postings |
| `expert` | Award | Yellow | Expert approvals, updates |
| `webinar` | Video | Red | Webinar registrations, reminders |
| `request` | Bell | blue | Interest requests, approvals |
| `system` | AlertCircle | Gray | System updates, maintenance |

---

## 📋 Example Use Cases

### 1. **New Message Received** (Discussion/Chat)
```typescript
addNotification({
  type: 'message',
  title: 'New Message from Sarah',
  message: 'Hey! Are you available for our meeting?',
  avatar: sender.avatar,
  actionUrl: '/discussion',
  priority: 'medium'
});
```

### 2. **Session Reminder** (Calendar)
```typescript
// 15 minutes before session
addNotification({
  type: 'session',
  title: 'Session Starting Soon',
  message: 'Your mentorship session with John starts in 15 minutes',
  actionUrl: '/calendar',
  priority: 'high'
});
```

### 3. **Connection Request** (MentorDiscovery)
```typescript
addNotification({
  type: 'connection',
  title: 'New Connection Request',
  message: 'David Osei wants to connect with you',
  avatar: user.avatar,
  actionUrl: '/mentors',
  priority: 'medium'
});
```

### 4. **Opportunity Accepted** (CollaborationHub) ✅ Already Implemented
```typescript
addNotification({
  type: 'opportunity',
  title: 'Request Accepted!',
  message: `Your interest in "${opportunityTitle}" has been accepted`,
  actionUrl: '/collaboration',
  priority: 'high'
});
```

### 5. **Expert Application Status** (ExpertDirectory)
```typescript
addNotification({
  type: 'expert',
  title: 'Expert Application Approved',
  message: 'Congratulations! Your expert application has been approved',
  actionUrl: '/experts',
  priority: 'high'
});
```

### 6. **Webinar Reminder** (Calendar)
```typescript
addNotification({
  type: 'webinar',
  title: 'Webinar Starting in 1 Hour',
  message: 'Leadership in Africa webinar by Dr. Amara Okafor',
  actionUrl: '/calendar',
  priority: 'high'
});
```

---

## 🎯 Recommended Notification Points

### CollaborationHub ✅ (Already Implemented)
- [x] New interest request received
- [x] Interest request accepted
- [x] Interest request rejected
- [ ] New document uploaded to group
- [ ] New member added to group
- [ ] Group deadline approaching

### MentorDiscovery
- [ ] New mentor match found
- [ ] Connection request received
- [ ] Connection request accepted
- [ ] Mentor becomes available
- [ ] Mentor profile viewed your profile

### ExpertDirectory
- [ ] Expert connection request received
- [ ] Expert connection accepted/rejected
- [ ] New Q&A answer received
- [ ] Webinar registration confirmed
- [ ] Expert becomes available for consultation

### Discussion
- [ ] New message in channel
- [ ] @mention in message
- [ ] Reply to your message
- [ ] New channel created
- [ ] Added to channel

### Calendar
- [ ] Session reminder (15 min before)
- [ ] Session cancelled
- [ ] Session rescheduled
- [ ] New session invitation
- [ ] Webinar starting soon

### Profile/Settings
- [ ] Profile update completed
- [ ] Password changed
- [ ] Email verified
- [ ] 2FA enabled

---

## 🔔 Browser Notification Setup

### For Users:
1. Click the bell icon in navigation
2. Click the settings gear icon
3. Click "Enable Browser Notifications"
4. Allow permission in browser prompt
5. Notifications will now appear even when tab is not active

### For Developers:
Browser notifications are handled automatically when:
- User has granted permission
- Browser notifications are enabled in preferences
- Notification type is enabled
- Browser supports Notification API

---

## 📊 Notification State Management

### Available Hooks:
```typescript
const {
  notifications,              // Array of all notifications
  unreadCount,               // Number of unread notifications
  addNotification,           // Add new notification
  markAsRead,               // Mark single notification as read
  markAllAsRead,            // Mark all notifications as read
  deleteNotification,       // Delete single notification
  clearAll,                 // Clear all notifications
  browserNotificationsEnabled,  // Browser permission status
  requestBrowserNotifications,  // Request browser permission
  notificationPreferences,      // User preferences object
  updatePreferences         // Update preferences
} = useNotifications();
```

---

## 🎨 UI/UX Features

### Notification Badge
- Shows count on bell icon (1-9, or "9+" for 10+)
- Red background for visibility
- Hidden when no unread notifications

### Notification Panel
- Fixed position dropdown from navigation
- Smooth animations
- Click outside to close
- Two tabs: All / Unread
- Quick actions: Mark all as read, Clear all

### Individual Notifications
- Clickable to navigate to relevant page
- Avatar or icon based on type
- Timestamp (smart formatting: "Just now", "5m ago", "2h ago", etc.)
- Blue dot indicator for unread
- Hover effects
- Delete button (X)

### Empty States
- Friendly messages when no notifications
- Different messages for "All" vs "Unread"

---

## 🔐 Privacy & Data

### LocalStorage Keys:
- `notifications` - Array of notification objects
- `notificationPreferences` - User preference object
- `collaborationWelcomeSeen` - Demo flag

### Data Cleanup:
- Notifications auto-expire after 30 days
- User can manually delete or clear all
- No server storage (client-side only)

---

## 🚦 Next Steps (Future Enhancements)

1. **Real-time Notifications** - WebSocket integration for instant updates
2. **Push Notifications** - Service Worker for offline notifications
3. **Email Notifications** - Backend integration for email alerts
4. **Notification History** - Archive old notifications
5. **Notification Groups** - Group similar notifications
6. **Sound Alerts** - Optional sound for important notifications
7. **Do Not Disturb** - Quiet hours setting
8. **Notification Analytics** - Track which notifications users interact with

---

## 🐛 Troubleshooting

### Badge count not updating?
- Check if NotificationProvider wraps your app in App.tsx
- Verify useNotifications() is called inside NotificationProvider

### Browser notifications not working?
- Check browser supports Notification API
- Verify permission was granted (not blocked)
- Check notification preferences are enabled

### Notifications disappearing immediately?
- Check if notification type is enabled in preferences
- Verify localStorage is working

### Clicking notification doesn't navigate?
- Ensure `actionUrl` property is set
- Check route exists in router

---

## 📱 Testing the System

### Manual Test Checklist:
1. ✅ Click bell icon - notification center opens
2. ✅ Badge shows correct unread count
3. ✅ Add notification - appears in list
4. ✅ Click notification - marks as read and navigates
5. ✅ "Mark all as read" - clears all unread indicators
6. ✅ Delete notification - removes from list
7. ✅ Clear all - empties notification list
8. ✅ Open preferences - settings panel appears
9. ✅ Toggle notification types - respects settings
10. ✅ Request browser permission - shows native prompt
11. ✅ Refresh page - notifications persist

---

## 💡 Tips for Developers

1. **Be Selective** - Don't spam users with too many notifications
2. **Use Priorities** - High priority for urgent actions only
3. **Provide Context** - Include who/what/when in message
4. **Add Action URLs** - Make notifications actionable
5. **Use Avatars** - Show user avatars when relevant
6. **Test All Types** - Verify each notification type works
7. **Respect Preferences** - Always check if notification type is enabled
8. **Handle Errors** - Wrap notification calls in try-catch

---

## 📞 Support

For issues or questions about the notification system:
- Check this documentation first
- Review NotificationContext.tsx for available methods
- Look at CollaborationHub.tsx for implementation examples
- Test in browser console with localStorage inspection

---

**Version:** 1.0  
**Last Updated:** December 15, 2025  
**Status:** ✅ Production Ready
