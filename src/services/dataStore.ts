// Centralized Data Store - Shared between main app and admin panel
// This ensures admin changes persist throughout the application

import { 
  mockMentors, 
  mockOpportunities, 
  mockResources, 
  mockSessions,
  mockMessages,
  mockDiscussions,
  mockProjects
} from './mockData';

// Storage keys used throughout the app
export const STORAGE_KEYS = {
  MENTORS: 'app_mentors',
  OPPORTUNITIES: 'app_opportunities',
  RESOURCES: 'app_resources',
  SESSIONS: 'app_sessions',
  MESSAGES: 'app_messages',
  DISCUSSIONS: 'app_discussions',
  PROJECTS: 'app_projects',
  VIDEOS: 'app_videos',
  ARTICLES: 'app_articles',
  USERS: 'app_users',
  ANNOUNCEMENTS: 'app_announcements',
  AUDIT_LOG: 'app_audit_log'
};

/**
 * Initialize data store with mock data if not already initialized
 */
export function initializeDataStore() {
  // Only initialize if data doesn't exist
  if (!localStorage.getItem(STORAGE_KEYS.MENTORS)) {
    localStorage.setItem(STORAGE_KEYS.MENTORS, JSON.stringify(mockMentors));
  }
  if (!localStorage.getItem(STORAGE_KEYS.OPPORTUNITIES)) {
    localStorage.setItem(STORAGE_KEYS.OPPORTUNITIES, JSON.stringify(mockOpportunities));
  }
  if (!localStorage.getItem(STORAGE_KEYS.RESOURCES)) {
    localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(mockResources));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SESSIONS)) {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(mockSessions));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(mockMessages));
  }
  if (!localStorage.getItem(STORAGE_KEYS.DISCUSSIONS)) {
    localStorage.setItem(STORAGE_KEYS.DISCUSSIONS, JSON.stringify(mockDiscussions));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(mockProjects));
  }
  if (!localStorage.getItem(STORAGE_KEYS.VIDEOS)) {
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify([
      {
        id: '1',
        title: 'Introduction to Leadership',
        description: 'Learn the fundamentals of effective leadership',
        youtubeUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
        videoId: '9bZkp7q19f0',
        category: 'Leadership',
        duration: '28:17',
        uploadedDate: '2024-01-15'
      }
    ]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ARTICLES)) {
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify([
      {
        id: '1',
        title: 'The Future of Workplace Diversity',
        subtitle: 'How inclusive leadership shapes success',
        content: 'In today\'s rapidly evolving business landscape, diversity and inclusion have emerged as critical drivers of innovation and competitive advantage. Organizations that prioritize diverse perspectives are better positioned to understand complex markets, attract top talent, and drive sustainable growth...',
        author: 'Dr. Emily Rodriguez',
        category: 'DEI',
        coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
        publishedDate: '2024-01-20',
        readTime: '8 min'
      }
    ]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'Mentee',
        location: 'Lagos, Nigeria',
        joinedDate: '2024-01-15',
        status: 'active',
        lastActive: '2024-03-10'
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        role: 'Mentor',
        location: 'Nairobi, Kenya',
        joinedDate: '2024-02-20',
        status: 'active',
        lastActive: '2024-03-12'
      }
    ]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOG)) {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify([]));
  }
}

/**
 * Get data from store
 */
export function getData<T>(key: string, fallback: T[] = []): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return fallback;
  }
}

/**
 * Save data to store
 */
export function setData<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    // Trigger storage event for cross-tab synchronization
    window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify(data) }));
  } catch (error) {
    console.error(`Error writing ${key}:`, error);
  }
}

/**
 * Reset all data to initial mock data
 */
export function resetAllData() {
  localStorage.clear();
  initializeDataStore();
  window.location.reload();
}




