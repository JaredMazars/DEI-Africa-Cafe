import { mockAPI } from './mockData';

// Use relative URLs so the app works both locally (via vite proxy) and in production
// where the Express server serves both the API and the frontend.
const API_BASE_URL = '/api';
const USE_MOCK_DATA = false;

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create headers with auth token
const createHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Generic API request function
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  // If mock mode is enabled, intercept the call
  if (USE_MOCK_DATA) {
    return handleMockRequest(endpoint, options);
  }
  
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    headers: createHeaders(),
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Handle mock requests
const handleMockRequest = async (endpoint: string, options: RequestInit = {}) => {
  console.log('🎭 MOCK MODE:', endpoint);
  
  // Route to appropriate mock handler based on endpoint
  if (endpoint.includes('/experts')) {
    if (endpoint.includes('/experts/') && !endpoint.includes('?')) {
      const id = endpoint.split('/experts/')[1].split('/')[0];
      return mockAPI.getMentorById(id);
    }
    return mockAPI.getMentors();
  }
  
  if (endpoint.includes('/sessions')) {
    if (options.method === 'POST') {
      return mockAPI.bookSession(JSON.parse(options.body as string));
    }
    return mockAPI.getSessions();
  }
  
  if (endpoint.includes('/messages')) {
    if (options.method === 'POST') {
      return mockAPI.sendMessage(JSON.parse(options.body as string));
    }
    return mockAPI.getMessages();
  }
  
  if (endpoint.includes('/opportunities')) {
    return mockAPI.getOpportunities();
  }
  
  if (endpoint.includes('/dashboard')) {
    return mockAPI.getDashboardStats();
  }
  
  // Default mock response
  return { data: {}, success: true };
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  demoLogin: async (email?: string) => {
    return apiRequest('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ email: email || 'demo@example.com' }),
    });
  },

  register: async (email: string, password: string) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getProfile: async () => {
    return apiRequest('/auth/me');
  },

  completeProfile: async (profileData: any) => {
    return apiRequest('/auth/complete-profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },
};

// Preferences API
export const preferencesAPI = {
  getUserPreferences: async () => {
    return apiRequest('/preferences');
  },

  updateUserPreferences: async (preferences: any) => {
    return apiRequest('/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  },

  getMentorRecommendations: async () => {
    return apiRequest('/preferences/mentor-recommendations');
  },
};

// Dashboard API
export const dashboardAPI = {
  getDashboardData: async () => {
    return apiRequest('/dashboard');
  },

  getActivity: async (limit = 10) => {
    return apiRequest(`/dashboard/activity?limit=${limit}`);
  },
};

// Connections API
export const connectionsAPI = {
  getConnections: async () => {
    return apiRequest('/connections');
  },

  getConnectionStats: async () => {
    return apiRequest('/connections/stats');
  },

  createConnection: async (mentorId: string, menteeId: string) => {
    return apiRequest('/connections', {
      method: 'POST',
      body: JSON.stringify({ mentor_id: mentorId, mentee_id: menteeId }),
    });
  },

  updateConnectionStatus: async (connectionId: string, status: string) => {
    return apiRequest(`/connections/${connectionId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  getPotentialMentors: async (expertise?: string, location?: string) => {
    const params = new URLSearchParams();
    if (expertise) params.append('expertise', expertise);
    if (location) params.append('location', location);
    
    return apiRequest(`/connections/potential-mentors?${params.toString()}`);
  },

  getPotentialMentees: async (interest?: string, location?: string) => {
    const params = new URLSearchParams();
    if (interest) params.append('interest', interest);
    if (location) params.append('location', location);
    
    return apiRequest(`/connections/potential-mentees?${params.toString()}`);
  },
};

// Sessions API
export const sessionsAPI = {
  getSessions: async () => {
    return apiRequest('/sessions');
  },

  getUpcomingSessions: async () => {
    return apiRequest('/sessions/upcoming');
  },

  createSession: async (sessionData: any) => {
    return apiRequest('/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  },

  updateSessionStatus: async (sessionId: string, status: string, notes?: string) => {
    return apiRequest(`/sessions/${sessionId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  },

  getSessionStats: async () => {
    return apiRequest('/sessions/stats');
  },
};

// Messages API
export const messagesAPI = {
  getConnectionMessages: async (connectionId: string) => {
    return apiRequest(`/messages/connection/${connectionId}`);
  },

  sendMessage: async (connectionId: string, messageText: string) => {
    return apiRequest('/messages', {
      method: 'POST',
      body: JSON.stringify({ connection_id: connectionId, message_text: messageText }),
    });
  },

  markAsRead: async (messageId: string) => {
    return apiRequest(`/messages/${messageId}/read`, {
      method: 'PUT',
    });
  },

  getUnreadCount: async () => {
    return apiRequest('/messages/unread-count');
  },

  getRecentMessages: async (limit = 5) => {
    return apiRequest(`/messages/recent?limit=${limit}`);
  },
};

// Experts API
export const expertsAPI = {
  getExperts: async (filters?: any) => {
    const params = new URLSearchParams();
    if (filters?.expertise) params.append('expertise', filters.expertise);
    if (filters?.industry) params.append('industry', filters.industry);
    if (filters?.location) params.append('location', filters.location);
    if (filters?.availability) params.append('availability', filters.availability);
    
    return apiRequest(`/experts?${params.toString()}`);
  },

  getExpertById: async (expertId: string) => {
    return apiRequest(`/experts/${expertId}`);
  },

  createExpertProfile: async (expertData: any) => {
    return apiRequest('/experts', {
      method: 'POST',
      body: JSON.stringify(expertData),
    });
  },

  updateAvailability: async (expertId: string, isAvailable: boolean) => {
    return apiRequest(`/experts/${expertId}/availability`, {
      method: 'PUT',
      body: JSON.stringify({ is_available: isAvailable }),
    });
  },
};

// Questions API
export const questionsAPI = {
  getQuestions: async () => {
    return apiRequest('/questions');
  },

  createQuestion: async (questionData: any) => {
    return apiRequest('/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  },

  getQuestionById: async (questionId: string) => {
    return apiRequest(`/questions/${questionId}`);
  },

  markAsAnswered: async (questionId: string) => {
    return apiRequest(`/questions/${questionId}/answered`, {
      method: 'PUT',
    });
  },
};

// Opportunities API
export const opportunitiesAPI = {
  getOpportunities: async (filters?: any) => {
    const params = new URLSearchParams();
    if (filters?.industry) params.append('industry', filters.industry);
    if (filters?.region) params.append('region', filters.region);
    if (filters?.status) params.append('status', filters.status);
    
    return apiRequest(`/opportunities?${params.toString()}`);
  },

  createOpportunity: async (opportunityData: any) => {
    return apiRequest('/opportunities', {
      method: 'POST',
      body: JSON.stringify(opportunityData),
    });
  },

  getOpportunityById: async (opportunityId: string) => {
    return apiRequest(`/opportunities/${opportunityId}`);
  },

  updateOpportunityStatus: async (opportunityId: string, status: string) => {
    return apiRequest(`/opportunities/${opportunityId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

// Admin API
export const adminAPI = {
  getStats: async () => {
    return apiRequest('/admin/stats');
  },

  getUsers: async () => {
    return apiRequest('/admin/users');
  },

  getConnections: async () => {
    return apiRequest('/admin/connections');
  },

  getMentors: async (expertise?: string) => {
    const params = expertise ? `?expertise=${expertise}` : '';
    return apiRequest(`/admin/mentors${params}`);
  },

  getMentees: async (interest?: string) => {
    const params = interest ? `?interest=${interest}` : '';
    return apiRequest(`/admin/mentees${params}`);
  },

  updateUserStatus: async (userId: string, isActive: boolean) => {
    return apiRequest(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ is_active: isActive }),
    });
  },

  createMentor: async (mentorData: any) => {
    return apiRequest('/admin/mentors', { method: 'POST', body: JSON.stringify(mentorData) });
  },

  updateMentor: async (id: string, mentorData: any) => {
    return apiRequest(`/admin/mentors/${id}`, { method: 'PUT', body: JSON.stringify(mentorData) });
  },

  deleteMentor: async (id: string) => {
    return apiRequest(`/admin/mentors/${id}`, { method: 'DELETE' });
  },
};

// Resources API
export const resourcesAPI = {
  getResources: async (filters?: { category?: string; type?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.search) params.append('search', filters.search);
    return apiRequest(`/resources?${params.toString()}`);
  },

  createResource: async (resourceData: any) => {
    return apiRequest('/resources', { method: 'POST', body: JSON.stringify(resourceData) });
  },

  recordDownload: async (id: string) => {
    return apiRequest(`/resources/${id}/download`, { method: 'PUT' });
  },

  deleteResource: async (id: string) => {
    return apiRequest(`/resources/${id}`, { method: 'DELETE' });
  },
};

// Reflections API
export const reflectionsAPI = {
  getReflections: async (filters?: { category?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    return apiRequest(`/reflections?${params.toString()}`);
  },

  createReflection: async (reflectionData: any) => {
    return apiRequest('/reflections', { method: 'POST', body: JSON.stringify(reflectionData) });
  },

  getComments: async (reflectionId: string) => {
    return apiRequest(`/reflections/${reflectionId}/comments`);
  },

  addComment: async (reflectionId: string, content: string, isAnonymous: boolean) => {
    return apiRequest(`/reflections/${reflectionId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, isAnonymous }),
    });
  },

  react: async (reflectionId: string, emoji: string) => {
    return apiRequest(`/reflections/${reflectionId}/react`, {
      method: 'PUT',
      body: JSON.stringify({ emoji }),
    });
  },
};