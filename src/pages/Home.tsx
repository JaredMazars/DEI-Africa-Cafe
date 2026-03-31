import React, { useState } from 'react';
import { useEffect } from 'react';
import { dashboardAPI, connectionsAPI, sessionsAPI, messagesAPI } from '../services/api';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  Video, 
  Star, 
  Clock, 
  MapPin, 
  Award, 
  TrendingUp, 
  BookOpen, 
  Target,
  Plus,
  Search,
  Filter,
  ChevronRight,
  Bell,
  CheckCircle,
  AlertCircle,
  User,
  Heart,
  Briefcase,
  Globe,
  ArrowRight,
  Activity,
  Zap,
  Coffee,
  ExternalLink,
  RefreshCw,
  ChevronDown
} from 'lucide-react';

interface Connection {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar: string;
  role: 'mentor' | 'mentee';
  status: 'active' | 'pending' | 'completed';
  expertise: string[];
  location: string;
  rating: number;
  totalSessions: number;
  upcomingSessions: number;
  lastActivity: string;
  connectionDate: string;
  matchScore: number;
}

interface RegisteredWebinar {
  id: string;
  title: string;
  expert: string;
  expertAvatar?: string;
  date: string;
  time: string;
  topic: string;
  region: string;
  attendees: number;
  maxAttendees: number;
  teamsLink?: string;
  description?: string;
}

interface Session {
  id: string;
  mentorName: string;
  menteeName: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  type: 'video' | 'in-person' | 'phone';
}

interface Activity {
  id: string;
  type: 'message' | 'session' | 'connection' | 'review';
  title: string;
  description: string;
  time: string;
  user: string;
  avatar: string;
}

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [connectionTab, setConnectionTab] = useState<'all' | 'mentors' | 'mentees' | 'experts'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [expertConnections, setExpertConnections] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [stats, setStats] = useState({
    totalConnections: 0,
    activeConnections: 0,
    totalSessions: 0,
    upcomingSessions: 0,
    averageRating: 0,
    responseRate: 0
  });

  // ---- Your Meeting state ----
  const [registeredSessions, setRegisteredSessions] = useState<RegisteredWebinar[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<RegisteredWebinar | null>(null);

  const loadRegisteredSessions = (keepId?: string) => {
    try {
      const data = localStorage.getItem('registeredWebinarData');
      const sessions: RegisteredWebinar[] = data ? JSON.parse(data) : [];
      setRegisteredSessions(sessions);
      if (sessions.length > 0) {
        const activeId = keepId || sessions[0].id;
        setSelectedSessionId(activeId);
        setSelectedSession(sessions.find(s => s.id === activeId) ?? sessions[0]);
      } else {
        setSelectedSessionId('');
        setSelectedSession(null);
      }
    } catch {
      setRegisteredSessions([]);
    }
  };

  useEffect(() => {
    loadRegisteredSessions();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'registeredWebinarData') loadRegisteredSessions();
    };
    // Re-load when user returns to this tab (e.g. after registering in Expert Directory)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') loadRegisteredSessions();
    };
    window.addEventListener('storage', handleStorage);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Dummy connections data
  const dummyConnections: Connection[] = [
    {
      id: '1',
      name: 'Amara Okafor',
      title: 'Senior Tax Partner',
      company: 'Forvis Mazars Nigeria',
      avatar: 'https://images.pexels.com/photos/3778966/pexels-photo-3778966.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      role: 'mentor',
      status: 'active',
      expertise: ['Corporate Tax', 'Transfer Pricing', 'International Tax'],
      location: 'Lagos, Nigeria',
      rating: 4.9,
      totalSessions: 12,
      upcomingSessions: 2,
      lastActivity: '2 hours ago',
      connectionDate: 'Jan 15, 2024',
      matchScore: 95
    },
    {
      id: '2',
      name: 'Thabo Mthembu',
      title: 'ESG & Sustainability Advisor',
      company: 'Forvis Mazars South Africa',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      role: 'mentor',
      status: 'active',
      expertise: ['ESG Strategy', 'Climate Risk', 'Sustainability Reporting'],
      location: 'Johannesburg, South Africa',
      rating: 4.8,
      totalSessions: 8,
      upcomingSessions: 1,
      lastActivity: '1 day ago',
      connectionDate: 'Feb 20, 2024',
      matchScore: 92
    },
    {
      id: '3',
      name: 'Sarah Mwangi',
      title: 'Junior Financial Analyst',
      company: 'Equity Bank Kenya',
      avatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      role: 'mentee',
      status: 'active',
      expertise: ['Financial Analysis', 'Climate Finance', 'ESG Reporting'],
      location: 'Nairobi, Kenya',
      rating: 4.7,
      totalSessions: 6,
      upcomingSessions: 1,
      lastActivity: '3 hours ago',
      connectionDate: 'Mar 10, 2024',
      matchScore: 88
    },
    {
      id: '4',
      name: 'David Okonkwo',
      title: 'Tax Manager',
      company: 'First Bank Nigeria',
      avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      role: 'mentee',
      status: 'active',
      expertise: ['Corporate Tax', 'Tax Compliance', 'VAT'],
      location: 'Lagos, Nigeria',
      rating: 4.6,
      totalSessions: 5,
      upcomingSessions: 1,
      lastActivity: '5 hours ago',
      connectionDate: 'Apr 5, 2024',
      matchScore: 90
    },
    {
      id: '5',
      name: 'Fatima El-Sayed',
      title: 'Audit Partner',
      company: 'Forvis Mazars Egypt',
      avatar: 'https://images.pexels.com/photos/3776164/pexels-photo-3776164.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      role: 'mentor',
      status: 'active',
      expertise: ['Financial Audit', 'IFRS', 'Internal Controls'],
      location: 'Cairo, Egypt',
      rating: 4.9,
      totalSessions: 15,
      upcomingSessions: 2,
      lastActivity: '1 hour ago',
      connectionDate: 'Jan 28, 2024',
      matchScore: 93
    },
    {
      id: '6',
      name: 'Michael Banda',
      title: 'Accounting Graduate',
      company: 'University of Zambia',
      avatar: 'https://images.pexels.com/photos/2380794/pexels-photo-2380794.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      role: 'mentee',
      status: 'pending',
      expertise: ['Financial Accounting', 'Audit Basics', 'IFRS'],
      location: 'Lusaka, Zambia',
      rating: 4.5,
      totalSessions: 2,
      upcomingSessions: 0,
      lastActivity: '2 days ago',
      connectionDate: 'Nov 15, 2024',
      matchScore: 85
    }
  ];

  // Dummy sessions data
  const dummySessions: Session[] = [
    {
      id: '1',
      mentorName: 'Amara Okafor',
      menteeName: 'You',
      title: 'Transfer Pricing Strategy Review',
      date: 'Dec 15, 2025',
      time: '14:00',
      duration: '60 min',
      status: 'upcoming',
      type: 'video'
    },
    {
      id: '2',
      mentorName: 'You',
      menteeName: 'Sarah Mwangi',
      title: 'Climate Finance Career Guidance',
      date: 'Dec 16, 2025',
      time: '10:00',
      duration: '45 min',
      status: 'upcoming',
      type: 'video'
    },
    {
      id: '3',
      mentorName: 'Fatima El-Sayed',
      menteeName: 'You',
      title: 'IFRS Implementation Discussion',
      date: 'Dec 18, 2025',
      time: '15:30',
      duration: '90 min',
      status: 'upcoming',
      type: 'video'
    }
  ];

  // Dummy expert connections data
  const dummyExpertConnections = [
    {
      id: 'e1',
      name: 'Dr. Kwame Mensah',
      title: 'Tax Policy Expert',
      company: 'Ghana Revenue Authority',
      avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      role: 'expert',
      status: 'active',
      expertise: ['Corporate Tax', 'Tax Policy', 'International Taxation'],
      location: 'Accra, Ghana',
      rating: 4.9,
      totalSessions: 0,
      upcomingSessions: 0,
      lastActivity: '1 hour ago',
      connectionDate: 'Dec 1, 2024',
      matchScore: 96
    },
    {
      id: 'e2',
      name: 'Zainab Hassan',
      title: 'ESG Specialist',
      company: 'African Development Bank',
      avatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      role: 'expert',
      status: 'active',
      expertise: ['Sustainability Reporting', 'Climate Finance', 'Green Bonds'],
      location: 'Abidjan, Côte d\'Ivoire',
      rating: 4.8,
      totalSessions: 0,
      upcomingSessions: 0,
      lastActivity: '3 hours ago',
      connectionDate: 'Nov 28, 2024',
      matchScore: 94
    }
  ];

  // Dummy activity data
  const dummyActivity: Activity[] = [
    {
      id: '1',
      type: 'message',
      title: 'New message from Amara Okafor',
      description: 'Shared resources on West African tax regulations',
      time: '2 hours ago',
      user: 'Amara Okafor',
      avatar: 'https://images.pexels.com/photos/3778966/pexels-photo-3778966.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      id: '2',
      type: 'session',
      title: 'Session completed',
      description: 'Mentoring session with David Okonkwo',
      time: '5 hours ago',
      user: 'David Okonkwo',
      avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      id: '3',
      type: 'review',
      title: 'New review received',
      description: 'Sarah Mwangi left a 5-star review',
      time: '1 day ago',
      user: 'Sarah Mwangi',
      avatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      id: '4',
      type: 'connection',
      title: 'New connection request',
      description: 'Michael Banda wants to connect',
      time: '2 days ago',
      user: 'Michael Banda',
      avatar: 'https://images.pexels.com/photos/2380794/pexels-photo-2380794.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    }
  ];

  // Load data from API
  // Load dummy data on mount
  useEffect(() => {
    // Always use dummy data - no authentication needed
    setConnections(dummyConnections);
    setExpertConnections(dummyExpertConnections);
    setUpcomingSessions(dummySessions);
    setRecentActivity(dummyActivity);
    setStats({
      totalConnections: dummyConnections.length,
      activeConnections: dummyConnections.filter(c => c.status === 'active').length,
      totalSessions: dummyConnections.reduce((sum, c) => sum + c.totalSessions, 0),
      upcomingSessions: dummySessions.length,
      averageRating: 4.8,
      responseRate: 95
    });
    setLoading(false);
  }, []);

  const filteredConnections = connections.filter(connection => {
    const matchesSearch = connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         connection.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         connection.expertise.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' || connection.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'message': return MessageSquare;
      case 'session': return Video;
      case 'connection': return Users;
      case 'review': return Star;
      default: return Bell;
    }
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {loading && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      )}
      
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl text-white font-bold mb-2">
              Welcome back, User! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Continue your learning journey with your mentors
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Connections</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalConnections}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +2 this month
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming Sessions</p>
              <p className="text-3xl font-bold text-gray-900">{stats.upcomingSessions}</p>
              <p className="text-sm text-blue-600 flex items-center mt-1">
                <Calendar className="w-4 h-4 mr-1" />
                Next 7 days
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Video className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Peer Rating</p>
              <p className="text-3xl font-bold text-gray-900">4.8</p>
              <p className="text-sm text-yellow-600 flex items-center mt-1">
                <Star className="w-4 h-4 mr-1 fill-current" />
                Highly rated
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Connections</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeConnections}</p>
              <p className="text-sm text-blue-600 flex items-center mt-1">
                <Users className="w-4 h-4 mr-1" />
                Engaged network
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ---- Your Meeting ---- */}
      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-900 to-blue-700">
          <div className="flex items-center space-x-3">
            <Video className="w-5 h-5 text-white" />
            <h3 className="text-lg font-semibold text-white">Your Meeting</h3>
          </div>
          <button
            onClick={() => { loadRegisteredSessions(selectedSessionId); }}
            className="flex items-center space-x-1.5 text-blue-200 hover:text-white text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {registeredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-7 h-7 text-blue-400" />
            </div>
            <p className="text-gray-700 font-medium mb-1">No sessions registered yet</p>
            <p className="text-gray-500 text-sm">Register for a session in the <strong>Expert Directory → Webinars</strong> tab and it will appear here.</p>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Session Dropdown Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Switch Session
              </label>
              <div className="relative">
                <select
                  value={selectedSessionId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedSessionId(id);
                    setSelectedSession(registeredSessions.find(s => s.id === id) ?? null);
                  }}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                >
                  {registeredSessions.map(session => (
                    <option key={session.id} value={session.id}>
                      {session.title} — {session.date} at {session.time}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Selected Session Details */}
            {selectedSession && (
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-gray-900 text-base leading-snug">{selectedSession.title}</h4>
                    <span className="inline-block mt-1 px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">{selectedSession.topic}</span>
                  </div>
                  {selectedSession.expertAvatar && (
                    <img
                      src={selectedSession.expertAvatar}
                      alt={selectedSession.expert}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-white shadow"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <User className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="truncate">{selectedSession.expert}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span>{selectedSession.date}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span>{selectedSession.time}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span>{selectedSession.region}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Users className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span>{selectedSession.attendees}/{selectedSession.maxAttendees} attendees</span>
                  </div>
                </div>

                {selectedSession.description && (
                  <p className="text-gray-600 text-sm leading-relaxed">{selectedSession.description}</p>
                )}

                <button
                  onClick={() => {
                    if (selectedSession.teamsLink) {
                      window.open(selectedSession.teamsLink, '_blank');
                    } else {
                      alert('Teams link will be available 15 minutes before the session starts.');
                    }
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  <Video className="w-5 h-5" />
                  <span>Join Meeting</span>
                  <ExternalLink className="w-4 h-4 opacity-80" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-shadow text-left group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Plus className="w-6 h-6 text-blue-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Find New Mentors</h3>
          <p className="text-gray-600 text-sm">Discover experienced professionals in your field</p>
        </button>

        <button className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-shadow text-left group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Schedule Session</h3>
          <p className="text-gray-600 text-sm">Book a mentoring session with your connections</p>
        </button>

        <button className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-shadow text-left group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <BookOpen className="w-6 h-6 text-blue-900" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-900 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Resources</h3>
          <p className="text-gray-600 text-sm">Access learning materials and industry insights</p>
        </button>
      </div>

      {/* Upcoming Sessions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Sessions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Upcoming Sessions
            </h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {upcomingSessions.slice(0, 3).map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    {session.type === 'video' && <Video className="w-5 h-5 text-blue-600" />}
                    {session.type === 'in-person' && <Users className="w-5 h-5 text-blue-600" />}
                    {session.type === 'phone' && <Coffee className="w-5 h-5 text-blue-600" />}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{session.title}</h4>
                    <p className="text-sm text-gray-600">
                      with {session.mentorName === 'You' ? session.menteeName : session.mentorName}
                    </p>
                    <p className="text-xs text-gray-500">{session.date} at {session.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">{session.duration}</span>
                  <p className="text-xs text-gray-500 capitalize">{session.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-600" />
              Recent Activity
            </h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <img
                    src={activity.avatar}
                    alt={activity.user}
                    className="w-10 h-12 rounded-md object-cover object-top"
                    style={{ aspectRatio: '4/5' }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Icon className="w-4 h-4 text-blue-600" />
                      <h4 className="font-medium text-gray-900 text-sm">{activity.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderConnections = () => {
    // Filter connections based on selected tab
    const filteredByTab = connections.filter(conn => {
      if (connectionTab === 'all') return true;
      if (connectionTab === 'mentors') return conn.role === 'mentor';
      if (connectionTab === 'mentees') return conn.role === 'mentee';
      return true;
    });

    const displayConnections = connectionTab === 'experts' ? expertConnections : filteredByTab;

    return (
      <div className="space-y-6">
        {/* Connection Type Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 inline-flex">
          <button
            onClick={() => setConnectionTab('all')}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
              connectionTab === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({connections.length + expertConnections.length})
          </button>
          <button
            onClick={() => setConnectionTab('mentors')}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
              connectionTab === 'mentors'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mentors ({connections.filter(c => c.role === 'mentor').length})
          </button>
          <button
            onClick={() => setConnectionTab('mentees')}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
              connectionTab === 'mentees'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mentees ({connections.filter(c => c.role === 'mentee').length})
          </button>
          <button
            onClick={() => setConnectionTab('experts')}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
              connectionTab === 'experts'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Experts ({expertConnections.length})
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${connectionTab === 'all' ? 'connections' : connectionTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Connections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayConnections.filter(connection => {
            const matchesSearch = connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 connection.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'all' || connection.status === filterStatus;
            return matchesSearch && matchesStatus;
          }).map((connection) => (
          <div key={connection.id} className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <img
                  src={connection.avatar}
                  alt={connection.name}
                  className="w-20 h-24 rounded-lg object-cover object-top"
                  style={{ aspectRatio: '4/5' }}
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{connection.name}</h3>
                  <p className="text-blue-600 font-medium text-sm">{connection.title}</p>
                  <p className="text-gray-600 text-xs">{connection.company}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(connection.status)}`}>
                {connection.status}
              </span>
            </div>

            {/* Role Badge */}
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                connection.role === 'mentor' ? 'bg-blue-100 text-blue-900' : 'bg-teal-100 text-teal-800'
              }`}>
                {connection.role === 'mentor' ? '👨‍🏫 Mentor' : '🎓 Mentee'}
              </span>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{connection.location.split(',')[0]}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-xl">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{connection.totalSessions}</div>
                <div className="text-xs text-gray-600">Sessions</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                  <span className="text-lg font-bold text-gray-900">{connection.rating}</span>
                </div>
                <div className="text-xs text-gray-600">Rating</div>
              </div>
            </div>

            {/* Expertise */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {connection.expertise.slice(0, 2).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                {connection.expertise.length > 2 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{connection.expertise.length - 2}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center space-x-1 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                <MessageSquare className="w-4 h-4" />
                <span>Message</span>
              </button>
              <button className="flex items-center justify-center space-x-1 py-2 px-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                <Calendar className="w-4 h-4" />
                <span>Schedule</span>
              </button>
            </div>

            {/* Last Activity */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">Last activity: {connection.lastActivity}</p>
            </div>
          </div>
        ))}
      </div>

      {displayConnections.filter(connection => {
        const matchesSearch = connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             connection.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || connection.status === filterStatus;
        return matchesSearch && matchesStatus;
      }).length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No {connectionTab === 'all' ? 'connections' : connectionTab} found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1920px] mx-auto px-12 sm:px-16 lg:px-20 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Overview</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('connections')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'connections'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>My Connections ({stats.totalConnections})</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'connections' && renderConnections()}
      </div>
    </div>
  );
};

export default Home;