import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type NotificationType = 
  | 'message' 
  | 'session' 
  | 'connection' 
  | 'opportunity' 
  | 'expert' 
  | 'webinar'
  | 'request'
  | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  avatar?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAll: () => void;
  browserNotificationsEnabled: boolean;
  requestBrowserNotifications: () => Promise<boolean>;
  notificationPreferences: NotificationPreferences;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
}

interface NotificationPreferences {
  enableMessage: boolean;
  enableSession: boolean;
  enableConnection: boolean;
  enableOpportunity: boolean;
  enableExpert: boolean;
  enableWebinar: boolean;
  enableRequest: boolean;
  enableSystem: boolean;
  enableBrowserNotifications: boolean;
  enableEmailNotifications: boolean;
  sessionReminderMinutes: number;
}

const defaultPreferences: NotificationPreferences = {
  enableMessage: true,
  enableSession: true,
  enableConnection: true,
  enableOpportunity: true,
  enableExpert: true,
  enableWebinar: true,
  enableRequest: true,
  enableSystem: true,
  enableBrowserNotifications: true,
  enableEmailNotifications: true,
  sessionReminderMinutes: 15,
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(defaultPreferences);

  // Load preferences and notifications from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('notificationPreferences');
    if (savedPreferences) {
      setNotificationPreferences(JSON.parse(savedPreferences));
    }

    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications);
      // Convert timestamp strings back to Date objects
      const notificationsWithDates = parsed.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
      setNotifications(notificationsWithDates);
    }

    // Check browser notification permission
    if ('Notification' in window) {
      setBrowserNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notificationPreferences', JSON.stringify(notificationPreferences));
  }, [notificationPreferences]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    // Check if this type is enabled in preferences
    const typeEnabled = notificationPreferences[`enable${notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}` as keyof NotificationPreferences];
    
    if (!typeEnabled) {
      return; // Don't add if disabled
    }

    setNotifications(prev => [newNotification, ...prev]);

    // Show browser notification if enabled
    if (
      browserNotificationsEnabled && 
      notificationPreferences.enableBrowserNotifications &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      try {
        new Notification(notification.title, {
          body: notification.message,
          icon: notification.avatar || '/logo.png',
          badge: '/logo.png',
          tag: newNotification.id,
        });
      } catch (error) {
        console.error('Failed to show browser notification:', error);
      }
    }

    // Auto-remove notification after 30 days
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 30 * 24 * 60 * 60 * 1000);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const requestBrowserNotifications = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setBrowserNotificationsEnabled(granted);
      return granted;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  };

  const updatePreferences = (preferences: Partial<NotificationPreferences>) => {
    setNotificationPreferences(prev => ({ ...prev, ...preferences }));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        browserNotificationsEnabled,
        requestBrowserNotifications,
        notificationPreferences,
        updatePreferences,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
