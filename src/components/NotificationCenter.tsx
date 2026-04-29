import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Trash2, 
  Settings, 
  MessageCircle, 
  Calendar, 
  UserPlus, 
  Briefcase, 
  Award,
  Video,
  Bell,
  AlertCircle
} from 'lucide-react';
import { useNotifications, NotificationType } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAll,
    browserNotificationsEnabled,
    requestBrowserNotifications,
    notificationPreferences,
    updatePreferences
  } = useNotifications();
  
  const navigate = useNavigate();
  const [showPreferences, setShowPreferences] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!isOpen) return null;

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="w-5 h-5 text-[#0072CE]" />;
      case 'session':
        return <Calendar className="w-5 h-5 text-green-600" />;
      case 'connection':
        return <UserPlus className="w-5 h-5 text-[#0072CE]" />;
      case 'opportunity':
        return <Briefcase className="w-5 h-5 text-blue-600" />;
      case 'expert':
        return <Award className="w-5 h-5 text-yellow-600" />;
      case 'webinar':
        return <Video className="w-5 h-5 text-red-600" />;
      case 'request':
        return <Bell className="w-5 h-5 text-[#0072CE]" />;
      case 'system':
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      onClose();
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const handleRequestBrowserNotifications = async () => {
    const granted = await requestBrowserNotifications();
    if (granted) {
      updatePreferences({ enableBrowserNotifications: true });
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-20 z-40"
        onClick={onClose}
      />

      {/* Notification Panel */}
      <div className="fixed top-16 right-4 w-96 max-h-[600px] bg-white -xl shadow-2xl z-50 flex flex-col border border-gray-200">
        {!showPreferences ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-600">{unreadCount} unread</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowPreferences(true)}
                  className="p-2 hover:bg-gray-100 -lg transition-colors"
                  title="Settings"
                >
                  <Settings className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 -lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'text-[#0072CE] border-b-2 border-[#0072CE]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  filter === 'unread'
                    ? 'text-[#0072CE] border-b-2 border-[#0072CE]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {/* Actions Bar */}
            {notifications.length > 0 && (
              <div className="px-4 py-2 bg-gray-50 flex items-center justify-between">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-[#0072CE] hover:text-[#1A1F5E] font-medium flex items-center space-x-1"
                  >
                    <Check className="w-4 h-4" />
                    <span>Mark all as read</span>
                  </button>
                )}
                <button
                  onClick={clearAll}
                  className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center space-x-1 ml-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear all</span>
                </button>
              </div>
            )}

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <Bell className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-600 font-medium">
                    {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                  </p>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    {filter === 'unread' 
                      ? 'You\'re all caught up!' 
                      : 'We\'ll notify you when something important happens'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-[#F4F4F4]' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Icon or Avatar */}
                        <div className="flex-shrink-0 mt-1">
                          {notification.avatar ? (
                            <img
                              src={notification.avatar}
                              alt=""
                              className="w-10 h-10 -full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 -full bg-gray-100 flex items-center justify-center">
                              {getNotificationIcon(notification.type)}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {formatTimestamp(notification.timestamp)}
                              </p>
                            </div>
                            
                            {/* Unread indicator */}
                            {!notification.read && (
                              <div className="w-2 h-2 bg-[#0072CE] -full ml-2 mt-1" />
                            )}
                          </div>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-1 hover:bg-gray-200  transition-colors flex-shrink-0"
                          title="Delete"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Preferences Panel */
          <>
            {/* Preferences Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Notification Settings</h3>
              <button
                onClick={() => setShowPreferences(false)}
                className="p-2 hover:bg-gray-100 -lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Preferences Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Browser Notifications */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Browser Notifications</h4>
                {!browserNotificationsEnabled ? (
                  <div className="bg-yellow-50 border border-yellow-200 -lg p-3">
                    <p className="text-sm text-yellow-800 mb-2">
                      Enable browser notifications to receive alerts even when you're not on this page.
                    </p>
                    <button
                      onClick={handleRequestBrowserNotifications}
                      className="text-sm bg-yellow-600 text-white px-4 py-2 -lg hover:bg-yellow-700 transition-colors"
                    >
                      Enable Browser Notifications
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Browser notifications enabled</span>
                    <input
                      type="checkbox"
                      checked={notificationPreferences.enableBrowserNotifications}
                      onChange={(e) => updatePreferences({ enableBrowserNotifications: e.target.checked })}
                      className="w-4 h-4 text-[#0072CE]  focus:ring-[#1A1F5E]/20"
                    />
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <h4 className="font-semibold text-gray-900">Notification Types</h4>
                
                {[
                  { key: 'enableMessage', label: 'Messages', icon: MessageCircle },
                  { key: 'enableSession', label: 'Sessions', icon: Calendar },
                  { key: 'enableConnection', label: 'Connections', icon: UserPlus },
                  { key: 'enableOpportunity', label: 'Opportunities', icon: Briefcase },
                  { key: 'enableExpert', label: 'Expert Updates', icon: Award },
                  { key: 'enableWebinar', label: 'Webinars', icon: Video },
                  { key: 'enableRequest', label: 'Requests', icon: Bell },
                  { key: 'enableSystem', label: 'System Updates', icon: AlertCircle },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{label}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationPreferences[key as keyof typeof notificationPreferences] as boolean}
                      onChange={(e) => updatePreferences({ [key]: e.target.checked })}
                      className="w-4 h-4 text-[#0072CE]  focus:ring-[#1A1F5E]/20"
                    />
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <h4 className="font-semibold text-gray-900">Session Reminders</h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Remind me before sessions</span>
                  <select
                    value={notificationPreferences.sessionReminderMinutes}
                    onChange={(e) => updatePreferences({ sessionReminderMinutes: parseInt(e.target.value) })}
                    className="text-sm border border-gray-300 -lg px-3 py-1.5 focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                  >
                    <option value={5}>5 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <h4 className="font-semibold text-gray-900">Email Notifications</h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Send email notifications</span>
                  <input
                    type="checkbox"
                    checked={notificationPreferences.enableEmailNotifications}
                    onChange={(e) => updatePreferences({ enableEmailNotifications: e.target.checked })}
                    className="w-4 h-4 text-[#0072CE]  focus:ring-[#1A1F5E]/20"
                  />
                </div>
              </div>
            </div>

            {/* Preferences Footer */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowPreferences(false)}
                className="w-full bg-[#0072CE] text-white px-4 py-2 -lg hover:bg-[#1A1F5E] transition-colors font-medium"
              >
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default NotificationCenter;
