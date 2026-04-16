// Mock data for the entire platform
// This replaces all backend API calls with local data

export const mockMentors = [
  {
    id: 'mentor-1',
    name: 'Sarah Johnson',
    role: 'Senior Strategy Consultant',
    company: 'Forvis Mazars',
    location: 'Lagos, Nigeria',
    expertise: ['Business Strategy', 'Leadership', 'Digital Transformation'],
    bio: '15+ years of experience in strategy consulting across Africa. Passionate about developing the next generation of African business leaders.',
    availability: 'Weekends',
    languages: ['English', 'Yoruba'],
    rating: 4.9,
    totalMentees: 24,
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    verified: true
  },
  {
    id: 'mentor-2',
    name: 'Dr. Kwame Mensah',
    role: 'Technology Director',
    company: 'Forvis Mazars',
    location: 'Accra, Ghana',
    expertise: ['Software Engineering', 'AI/ML', 'Tech Leadership'],
    bio: 'PhD in Computer Science. Building innovative tech solutions across Africa for the past 12 years.',
    availability: 'Flexible',
    languages: ['English', 'Twi'],
    rating: 4.8,
    totalMentees: 31,
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    verified: true
  },
  {
    id: 'mentor-3',
    name: 'Amina Hassan',
    role: 'Finance Partner',
    company: 'Forvis Mazars',
    location: 'Nairobi, Kenya',
    expertise: ['Financial Planning', 'Risk Management', 'Investment Strategy'],
    bio: 'Chartered accountant with expertise in helping businesses and professionals achieve financial success.',
    availability: 'Evenings',
    languages: ['English', 'Swahili', 'Arabic'],
    rating: 5.0,
    totalMentees: 18,
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
    verified: true
  },
  {
    id: 'mentor-4',
    name: 'Michael Okonkwo',
    role: 'Marketing Director',
    company: 'Forvis Mazars',
    location: 'Johannesburg, South Africa',
    expertise: ['Brand Strategy', 'Digital Marketing', 'Growth Hacking'],
    bio: 'Award-winning marketer who has helped scale multiple African startups to international markets.',
    availability: 'Weekdays',
    languages: ['English', 'Zulu'],
    rating: 4.7,
    totalMentees: 28,
    image: 'https://randomuser.me/api/portraits/men/52.jpg',
    verified: true
  },
  {
    id: 'mentor-5',
    name: 'Fatima Diop',
    role: 'HR & People Development Lead',
    company: 'Forvis Mazars',
    location: 'Dakar, Senegal',
    expertise: ['Talent Development', 'Career Coaching', 'Organizational Culture'],
    bio: 'Passionate about unlocking human potential and building high-performing teams across Africa.',
    availability: 'Flexible',
    languages: ['French', 'English', 'Wolof'],
    rating: 4.9,
    totalMentees: 22,
    image: 'https://randomuser.me/api/portraits/women/85.jpg',
    verified: true
  },
  {
    id: 'mentor-6',
    name: 'David Ochieng',
    role: 'Data Analytics Lead',
    company: 'Forvis Mazars',
    location: 'Nairobi, Kenya',
    expertise: ['Data Science', 'Business Intelligence', 'Analytics'],
    bio: 'Transforming data into actionable insights. Specialized in building data-driven organizations.',
    availability: 'Weekends',
    languages: ['English', 'Swahili'],
    rating: 4.8,
    totalMentees: 19,
    image: 'https://randomuser.me/api/portraits/men/75.jpg',
    verified: true
  }
];

export const mockSessions = [
  {
    id: 'session-1',
    mentorId: 'mentor-1',
    mentorName: 'Sarah Johnson',
    title: 'Career Strategy Planning',
    date: '2025-12-15',
    time: '14:00',
    duration: 60,
    status: 'scheduled',
    meetingLink: 'https://meet.google.com/demo-link',
    notes: 'Discuss career goals and create a 5-year plan'
  },
  {
    id: 'session-2',
    mentorId: 'mentor-2',
    mentorName: 'Dr. Kwame Mensah',
    title: 'Technical Interview Prep',
    date: '2025-12-18',
    time: '16:30',
    duration: 90,
    status: 'scheduled',
    meetingLink: 'https://zoom.us/j/demo-meeting',
    notes: 'Practice coding problems and system design'
  },
  {
    id: 'session-3',
    mentorId: 'mentor-3',
    mentorName: 'Amina Hassan',
    title: 'Financial Planning Workshop',
    date: '2025-12-10',
    time: '10:00',
    duration: 60,
    status: 'completed',
    meetingLink: 'https://meet.google.com/past-session',
    notes: 'Reviewed budget and investment strategy'
  }
];

export const mockMessages = [
  {
    id: 'msg-1',
    senderId: 'mentor-1',
    senderName: 'Sarah Johnson',
    content: 'Hi! Looking forward to our session next week. Is there anything specific you\'d like to focus on?',
    timestamp: '2025-12-11T10:30:00Z',
    read: false
  },
  {
    id: 'msg-2',
    senderId: 'mentor-2',
    senderName: 'Dr. Kwame Mensah',
    content: 'Great progress on the coding challenge! Keep up the good work.',
    timestamp: '2025-12-10T15:45:00Z',
    read: true
  },
  {
    id: 'msg-3',
    senderId: 'mentor-3',
    senderName: 'Amina Hassan',
    content: 'I\'ve shared some resources on financial planning. Check them out before our next session.',
    timestamp: '2025-12-09T12:20:00Z',
    read: true
  }
];

export const mockOpportunities = [
  {
    id: 'opp-1',
    title: 'Forvis Mazars Graduate Programme 2026',
    company: 'Forvis Mazars',
    location: 'Multiple African Cities',
    type: 'Full-time',
    description: 'Join our prestigious graduate programme and kickstart your career in consulting.',
    deadline: '2026-01-31',
    category: 'Job'
  },
  {
    id: 'opp-2',
    title: 'Tech Leaders Fellowship',
    company: 'African Tech Foundation',
    location: 'Remote',
    type: 'Fellowship',
    description: 'A 6-month leadership development program for emerging tech leaders across Africa.',
    deadline: '2025-12-20',
    category: 'Fellowship'
  },
  {
    id: 'opp-3',
    title: 'Pan-African Business Conference',
    company: 'AfDB',
    location: 'Abidjan, Côte d\'Ivoire',
    type: 'Event',
    description: 'Network with business leaders and learn about emerging opportunities across the continent.',
    deadline: '2026-02-15',
    category: 'Event'
  }
];

export const mockResources = [
  {
    id: 'res-1',
    title: 'Leadership in Africa: A Practical Guide',
    type: 'PDF',
    category: 'Leadership',
    url: '#',
    description: 'Comprehensive guide on effective leadership strategies for the African context',
    uploadedBy: 'Sarah Johnson',
    uploadDate: '2025-11-15'
  },
  {
    id: 'res-2',
    title: 'Technical Interview Preparation Toolkit',
    type: 'Video',
    category: 'Career Development',
    url: '#',
    description: 'Step-by-step guide to acing technical interviews at top companies',
    uploadedBy: 'Dr. Kwame Mensah',
    uploadDate: '2025-11-20'
  },
  {
    id: 'res-3',
    title: 'Financial Planning Workbook',
    type: 'Excel',
    category: 'Finance',
    url: '#',
    description: 'Interactive workbook for personal and business financial planning',
    uploadedBy: 'Amina Hassan',
    uploadDate: '2025-11-25'
  }
];

export const mockDiscussions = [
  {
    id: 'disc-1',
    title: 'Best practices for remote work in Africa',
    author: 'Michael Okonkwo',
    category: 'Work Culture',
    replies: 23,
    views: 145,
    lastActivity: '2 hours ago',
    content: 'What are your experiences with remote work? Share your tips and challenges.'
  },
  {
    id: 'disc-2',
    title: 'Breaking into tech without a CS degree',
    author: 'Dr. Kwame Mensah',
    category: 'Career',
    replies: 45,
    views: 312,
    lastActivity: '1 day ago',
    content: 'Is it possible? Absolutely! Here\'s how...'
  },
  {
    id: 'disc-3',
    title: 'Networking strategies for introverts',
    author: 'Fatima Diop',
    category: 'Professional Development',
    replies: 18,
    views: 98,
    lastActivity: '3 days ago',
    content: 'Networking doesn\'t have to be overwhelming. Let\'s discuss approaches that work for everyone.'
  }
];

export const mockDashboardStats = {
  totalMentors: 150,
  activeSessions: 3,
  unreadMessages: 2,
  upcomingEvents: 5,
  completedSessions: 12,
  connectionStrength: 85
};

// Additional Mock Data for Premium Features

export const mockProjects = [
  {
    id: 'proj-1',
    title: 'Pan-African Digital Transformation Initiative',
    description: 'Leading a comprehensive digital transformation project across 12 African countries',
    status: 'active',
    team: [
      { id: '1', name: 'Sarah Johnson', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', role: 'Project Lead' },
      { id: '2', name: 'Dr. Kwame Mensah', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', role: 'Tech Advisor' },
      { id: '3', name: 'Amina Hassan', avatar: 'https://randomuser.me/api/portraits/women/68.jpg', role: 'Financial Analyst' }
    ],
    progress: 65,
    deadline: '2026-03-15',
    budget: '$2.5M',
    tags: ['Digital', 'Transformation', 'Multi-Country']
  },
  {
    id: 'proj-2',
    title: 'SME Growth Accelerator Program',
    description: 'Mentorship and funding program for African SMEs',
    status: 'active',
    team: [
      { id: '4', name: 'Michael Okonkwo', avatar: 'https://randomuser.me/api/portraits/men/52.jpg', role: 'Program Director' },
      { id: '5', name: 'Fatima Diop', avatar: 'https://randomuser.me/api/portraits/women/85.jpg', role: 'HR Lead' }
    ],
    progress: 40,
    deadline: '2026-06-30',
    budget: '$1.8M',
    tags: ['SME', 'Growth', 'Funding']
  },
  {
    id: 'proj-3',
    title: 'Youth Employment Initiative',
    description: 'Training and placement program for young African professionals',
    status: 'planning',
    team: [
      { id: '1', name: 'Sarah Johnson', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', role: 'Strategy Lead' }
    ],
    progress: 15,
    deadline: '2026-09-01',
    budget: '$900K',
    tags: ['Youth', 'Employment', 'Training']
  }
];

export const mockResourcesExpanded = [
  ...mockResources,
  {
    id: 'res-4',
    title: 'Digital Marketing Masterclass 2025',
    type: 'Video Course',
    category: 'Marketing',
    url: '#',
    description: 'Complete guide to digital marketing in African markets',
    uploadedBy: 'Michael Okonkwo',
    uploadDate: '2025-11-28',
    rating: 4.8,
    downloads: 342,
    duration: '4 hours'
  },
  {
    id: 'res-5',
    title: 'African Business Case Studies Collection',
    type: 'PDF Bundle',
    category: 'Business',
    url: '#',
    description: 'Comprehensive collection of success stories from African businesses',
    uploadedBy: 'Sarah Johnson',
    uploadDate: '2025-12-01',
    rating: 4.9,
    downloads: 567,
    pages: 250
  },
  {
    id: 'res-6',
    title: 'Python for Data Analytics',
    type: 'Interactive Tutorial',
    category: 'Technology',
    url: '#',
    description: 'Hands-on Python programming for business analytics',
    uploadedBy: 'David Ochieng',
    uploadDate: '2025-12-05',
    rating: 4.7,
    downloads: 423,
    duration: '6 hours'
  },
  {
    id: 'res-7',
    title: 'Building High-Performance Teams',
    type: 'Webinar Recording',
    category: 'Leadership',
    url: '#',
    description: 'Strategies for creating and managing effective teams',
    uploadedBy: 'Fatima Diop',
    uploadDate: '2025-12-08',
    rating: 4.9,
    downloads: 289,
    duration: '90 minutes'
  }
];

export const mockDiscussionsExpanded = [
  ...mockDiscussions,
  {
    id: 'disc-4',
    title: 'Sustainable Business Practices in Africa',
    author: 'Amina Hassan',
    authorAvatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    category: 'Sustainability',
    replies: 31,
    views: 198,
    lastActivity: '5 hours ago',
    content: 'How can we build more sustainable businesses that benefit both profit and planet?',
    likes: 45,
    trending: true
  },
  {
    id: 'disc-5',
    title: 'AI and ML Opportunities in African Markets',
    author: 'Dr. Kwame Mensah',
    authorAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    category: 'Technology',
    replies: 52,
    views: 445,
    lastActivity: '1 day ago',
    content: 'Exploring the potential of AI and machine learning across various African industries',
    likes: 78,
    trending: true
  },
  {
    id: 'disc-6',
    title: 'Cross-border Collaboration Tips',
    author: 'Sarah Johnson',
    authorAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    category: 'Business',
    replies: 28,
    views: 156,
    lastActivity: '2 days ago',
    content: 'Best practices for working with teams across multiple African countries',
    likes: 34,
    trending: false
  }
];

export const mockCalendarEvents = [
  {
    id: 'event-1',
    title: 'Strategy Session with Sarah Johnson',
    type: 'meeting',
    date: '2025-12-15',
    time: '14:00',
    duration: 60,
    location: 'Virtual',
    attendees: ['Sarah Johnson'],
    color: 'blue',
    meetingLink: 'https://meet.google.com/abc-defg-hij'
  },
  {
    id: 'event-2',
    title: 'Technical Interview Prep',
    type: 'meeting',
    date: '2025-12-18',
    time: '16:30',
    duration: 90,
    location: 'Virtual',
    attendees: ['Dr. Kwame Mensah'],
    color: 'green',
    meetingLink: 'https://zoom.us/j/123456789'
  },
  {
    id: 'event-3',
    title: 'Pan-African Business Summit',
    type: 'event',
    date: '2025-12-20',
    time: '09:00',
    duration: 480,
    location: 'Nairobi, Kenya',
    attendees: ['Multiple'],
    color: 'blue',
    description: 'Annual business leaders summit'
  },
  {
    id: 'event-4',
    title: 'Quarterly Team Review',
    type: 'meeting',
    date: '2025-12-22',
    time: '11:00',
    duration: 120,
    location: 'Virtual',
    attendees: ['Team Members'],
    color: 'orange'
  },
  {
    id: 'event-5',
    title: 'Financial Planning Workshop',
    type: 'workshop',
    date: '2025-12-28',
    time: '10:00',
    duration: 180,
    location: 'Virtual',
    attendees: ['Amina Hassan'],
    color: 'pink',
    meetingLink: 'https://meet.google.com/xyz-uvwx-rst'
  }
];

// Import data store for persistence
import { getData, STORAGE_KEYS } from './dataStore';

// Mock API service
export const mockAPI = {
  // Mentors/Experts
  getMentors: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const mentors = getData(STORAGE_KEYS.MENTORS, mockMentors);
    return { data: mentors, success: true };
  },

  getMentorById: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const mentors = getData(STORAGE_KEYS.MENTORS, mockMentors);
    const mentor = mentors.find((m: any) => m.id === id);
    return { data: mentor, success: true };
  },

  // Sessions
  getSessions: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const sessions = getData(STORAGE_KEYS.SESSIONS, mockSessions);
    return { data: sessions, success: true };
  },

  bookSession: async (sessionData: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newSession = {
      id: `session-${Date.now()}`,
      ...sessionData,
      status: 'scheduled'
    };
    return { data: newSession, success: true };
  },

  // Messages
  getMessages: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const messages = getData(STORAGE_KEYS.MESSAGES, mockMessages);
    return { data: messages, success: true };
  },

  sendMessage: async (messageData: any) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newMessage = {
      id: `msg-${Date.now()}`,
      ...messageData,
      timestamp: new Date().toISOString(),
      read: false
    };
    return { data: newMessage, success: true };
  },

  // Opportunities
  getOpportunities: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const opportunities = getData(STORAGE_KEYS.OPPORTUNITIES, mockOpportunities);
    return { data: opportunities, success: true };
  },

  // Resources
  getResources: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const resources = getData(STORAGE_KEYS.RESOURCES, mockResources);
    return { data: resources, success: true };
  },

  // Discussions
  getDiscussions: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const discussions = getData(STORAGE_KEYS.DISCUSSIONS, mockDiscussions);
    return { data: discussions, success: true };
  },

  // Dashboard
  getDashboardStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { data: mockDashboardStats, success: true };
  },

  // Projects
  getProjects: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const projects = getData(STORAGE_KEYS.PROJECTS, mockProjects);
    return { data: projects, success: true };
  },

  // Resources (expanded)
  getResourcesExpanded: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { data: mockResourcesExpanded, success: true };
  },

  // Discussions (expanded)
  getDiscussionsExpanded: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { data: mockDiscussionsExpanded, success: true };
  },

  // Calendar Events
  getCalendarEvents: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { data: mockCalendarEvents, success: true };
  }
};
