import { mockAPI } from './mockData';

// Use relative URLs so the app works both locally (via vite proxy) and in production
// where the Express server serves both the API and the frontend.
const API_BASE_URL = '/api';
const USE_MOCK_DATA = false;

// Get auth token from localStorage
// Admin token takes priority (admin sessions use adminToken key)
const getAuthToken = () => {
  return localStorage.getItem('adminToken') || localStorage.getItem('token');
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

    // Only attempt JSON parse if there is a body and it's JSON content
    const contentType = response.headers.get('content-type') || '';
    const hasJsonBody = contentType.includes('application/json');
    const data = hasJsonBody ? await response.json() : (response.status === 204 ? {} : await response.text().then(t => ({ message: t || 'No content' })));

    if (!response.ok) {
      const msg = typeof data === 'object' && data !== null && 'message' in data ? (data as any).message : 'API request failed';
      throw new Error(msg);
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

// Expert Connections API
export const expertConnectionsAPI = {
  requestConnection: async (expertId: string, message: string) => {
    return apiRequest('/expert-connections', {
      method: 'POST',
      body: JSON.stringify({ expert_id: expertId, message }),
    });
  },

  getMyConnections: async () => {
    return apiRequest('/expert-connections/mine');
  },

  getIncomingRequests: async () => {
    return apiRequest('/expert-connections/incoming');
  },

  updateStatus: async (connectionId: string, status: 'approved' | 'declined') => {
    return apiRequest(`/expert-connections/${connectionId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  getStats: async () => {
    return apiRequest('/expert-connections/stats');
  },
};

// Expert Webinars API
export const expertWebinarsAPI = {
  getWebinars: async () => apiRequest('/expert-webinars'),
  getMyWebinars: async () => apiRequest('/expert-webinars/mine'),
  getRegisteredWebinars: async () => apiRequest('/expert-webinars/registered'),
  registerForWebinar: async (id: string) => apiRequest(`/expert-webinars/${id}/register`, { method: 'POST', body: '{}' }),
  unregisterFromWebinar: async (id: string) => apiRequest(`/expert-webinars/${id}/register`, { method: 'DELETE' }),
  createWebinar: async (data: any) => apiRequest('/expert-webinars', { method: 'POST', body: JSON.stringify(data) }),
  deleteWebinar: async (id: string) => apiRequest(`/expert-webinars/${id}`, { method: 'DELETE' }),
};

// Collaboration Hub API
export const collaborationAPI = {
  getGroups: async () => apiRequest('/collaboration/groups'),
  createGroup: async (data: any) => apiRequest('/collaboration/groups', { method: 'POST', body: JSON.stringify(data) }),
  getApplications: async () => apiRequest('/collaboration/applications'),
  submitApplication: async (data: any) => apiRequest('/collaboration/applications', { method: 'POST', body: JSON.stringify(data) }),
  updateApplication: async (id: string, status: string) => apiRequest(`/collaboration/applications/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getCaseStudies: async () => apiRequest('/collaboration/case-studies'),
  getDeals: async () => apiRequest('/collaboration/deals'),
  deleteGroup: async (id: string) => apiRequest(`/collaboration/groups/${id}`, { method: 'DELETE' }),
  addMember: async (groupId: string, userId: string, role?: string) => apiRequest(`/collaboration/groups/${groupId}/members`, { method: 'POST', body: JSON.stringify({ userId, role }) }),
  removeMember: async (groupId: string, userId: string) => apiRequest(`/collaboration/groups/${groupId}/members/${userId}`, { method: 'DELETE' }),
};

// Expert Meetings API
export const expertMeetingsAPI = {
  getMyMeetings: async () => apiRequest('/expert-meetings/mine'),
  createMeeting: async (data: any) => apiRequest('/expert-meetings', { method: 'POST', body: JSON.stringify(data) }),
  deleteMeeting: async (id: string) => apiRequest(`/expert-meetings/${id}`, { method: 'DELETE' }),
};

// Users Search API
export const usersAPI = {
  search: async (q: string) => apiRequest(`/auth/users/search?q=${encodeURIComponent(q)}`),
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

  getExperts: async () => {
    return apiRequest('/admin/experts');
  },

  getPendingExperts: async () => {
    return apiRequest('/admin/experts/pending');
  },

  verifyExpert: async (id: string, isVerified: boolean) => {
    return apiRequest(`/admin/experts/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ is_verified: isVerified }),
    });
  },

  // ── Users ──────────────────────────────────────────────────────
  deleteUser: async (userId: string) => {
    return apiRequest(`/admin/users/${userId}`, { method: 'DELETE' });
  },

  // ── Audit log ─────────────────────────────────────────────────
  getAuditLog: async (filters?: { action?: string; search?: string; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters?.action) params.append('action', filters.action);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.limit) params.append('limit', String(filters.limit));
    return apiRequest(`/admin/audit?${params.toString()}`);
  },

  logAudit: async (action: string, entityType: string, entityName: string, details?: string) => {
    const adminEmail = localStorage.getItem('adminUser') || 'admin';
    return apiRequest('/admin/audit', {
      method: 'POST',
      body: JSON.stringify({ action, entity_type: entityType, entity_name: entityName, details, admin_email: adminEmail }),
    });
  },

  // ── Notifications / Announcements ─────────────────────────────
  getNotifications: async () => {
    return apiRequest('/admin/notifications');
  },

  createNotification: async (data: any) => {
    return apiRequest('/admin/notifications', { method: 'POST', body: JSON.stringify(data) });
  },

  updateNotification: async (id: string, data: any) => {
    return apiRequest(`/admin/notifications/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  deleteNotification: async (id: string) => {
    return apiRequest(`/admin/notifications/${id}`, { method: 'DELETE' });
  },

  // ── Content ───────────────────────────────────────────────────
  getContent: async () => {
    return apiRequest('/admin/content');
  },

  createContent: async (data: any) => {
    return apiRequest('/admin/content', { method: 'POST', body: JSON.stringify(data) });
  },

  updateContent: async (id: string, data: any) => {
    return apiRequest(`/admin/content/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  deleteContent: async (id: string) => {
    return apiRequest(`/admin/content/${id}`, { method: 'DELETE' });
  },

  // ── Opportunities ─────────────────────────────────────────────
  getOpportunities: async () => {
    return apiRequest('/admin/opportunities');
  },

  createOpportunity: async (data: any) => {
    return apiRequest('/admin/opportunities', { method: 'POST', body: JSON.stringify(data) });
  },

  updateOpportunity: async (id: string, data: any) => {
    return apiRequest(`/admin/opportunities/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  deleteOpportunity: async (id: string) => {
    return apiRequest(`/admin/opportunities/${id}`, { method: 'DELETE' });
  },

  // ── Resources (admin) ─────────────────────────────────────────
  adminGetResources: async () => {
    return apiRequest('/admin/resources');
  },

  adminCreateResource: async (data: any) => {
    return apiRequest('/admin/resources', { method: 'POST', body: JSON.stringify(data) });
  },

  adminUpdateResource: async (id: string, data: any) => {
    return apiRequest(`/admin/resources/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  adminDeleteResource: async (id: string) => {
    return apiRequest(`/admin/resources/${id}`, { method: 'DELETE' });
  },

  adminUploadPdf: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('token');
    const response = await fetch('/api/admin/resources/upload-pdf', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    return response.json();
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