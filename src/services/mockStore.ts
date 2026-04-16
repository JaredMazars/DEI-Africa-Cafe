// Mock Store - localStorage-backed persistence helper for admin features

/**
 * Get data from localStorage with a fallback to initial value
 */
export const getStore = <T>(key: string, initialValue: T): T => {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : initialValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return initialValue;
  }
};

/**
 * Save data to localStorage
 */
export const setStore = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing localStorage key "${key}":`, error);
  }
};

/**
 * Remove data from localStorage
 */
export const clearStore = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error clearing localStorage key "${key}":`, error);
  }
};

/**
 * Clear all admin-related data from localStorage
 */
export const clearAllAdminData = (): void => {
  const adminKeys = [
    'admin_users',
    'admin_mentors',
    'admin_videos',
    'admin_articles',
    'admin_resources',
    'admin_opportunities',
    'admin_announcements',
    'admin_audit_log'
  ];
  
  adminKeys.forEach(key => clearStore(key));
};




