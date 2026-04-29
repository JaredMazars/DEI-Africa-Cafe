import React, { useState } from 'react';
import { useEffect } from 'react';
import { dashboardAPI, connectionsAPI, sessionsAPI, expertWebinarsAPI } from '../services/api';
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

  const loadRegisteredSessions = async (keepId?: string) => {
    try {
      const res = await expertWebinarsAPI.getRegisteredWebinars();
      const sessions: RegisteredWebinar[] = (res.data?.registeredWebinars || []).map((w: any) => ({
        id: w.id,
        title: w.title,
        expert: w.expert,
        expertAvatar: w.expertAvatar || undefined,
        date: w.date,
        time: w.time,
        topic: w.topic,
        region: w.region,
        attendees: w.attendees || 0,
        maxAttendees: w.maxAttendees || 50,
        teamsLink: w.teamsLink || undefined,
        description: w.description || undefined
      }));
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
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') loadRegisteredSessions();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [connRes, sessRes, actRes] = await Promise.allSettled([
          connectionsAPI.getConnections(),
          sessionsAPI.getUpcomingSessions(),
          dashboardAPI.getActivity(5)
        ]);
        const rawConns: any[] = connRes.status === 'fulfilled' ? (connRes.value.data?.connections || []) : [];
        const rawSess: any[] = sessRes.status === 'fulfilled' ? (sessRes.value.data?.sessions || []) : [];
        const rawAct: any[] = actRes.status === 'fulfilled' ? (actRes.value.data?.activities || []) : [];
        const mappedConns: Connection[] = rawConns.map((c: any) => ({
          id: c.id,
          name: c.mentor_name || c.mentee_name || c.name || 'Unknown',
          title: c.mentor_title || c.mentee_title || c.title || '',
          company: c.mentor_company || c.mentee_company || '',
          avatar: c.mentor_avatar || c.mentee_avatar || c.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name || 'U')}&background=1A1F5E&color=fff`,
          role: c.role || (c.mentor_user_id ? 'mentor' : 'mentee'),
          status: c.status || 'active',
          expertise: c.expertise ? c.expertise.split(',') : [],
          location: c.location || '',
          rating: c.rating || 0,
          totalSessions: c.total_sessions || 0,
          upcomingSessions: c.upcoming_sessions || 0,
          lastActivity: c.last_activity || '',
          connectionDate: c.created_at ? new Date(c.created_at).toLocaleDateString() : '',
          matchScore: c.match_score || 0
        }));
        const mappedSess: Session[] = rawSess.map((s: any) => ({
          id: s.session_id || s.id,
          mentorName: s.mentor_name || '',
          menteeName: s.mentee_name || '',
          title: s.title || s.session_type || 'Session',
          date: s.scheduled_at ? new Date(s.scheduled_at).toLocaleDateString() : '',
          time: s.scheduled_at ? new Date(s.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          duration: s.duration ? `${s.duration} min` : '60 min',
          status: s.status || 'upcoming',
          type: s.meeting_type || 'video'
        }));
        const mappedAct: Activity[] = rawAct.map((a: any) => ({
          id: a.id,
          type: a.type || 'message',
          title: a.title || '',
          description: a.description || '',
          time: a.created_at ? new Date(a.created_at).toLocaleDateString() : '',
          user: a.user_name || '',
          avatar: a.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.user_name || 'U')}&background=1A1F5E&color=fff`
        }));
        setConnections(mappedConns);
        setUpcomingSessions(mappedSess);
        setRecentActivity(mappedAct);
        const active = mappedConns.filter(c => c.status === 'active');
        setStats({
          totalConnections: mappedConns.length,
          activeConnections: active.length,
          totalSessions: mappedConns.reduce((s, c) => s + c.totalSessions, 0),
          upcomingSessions: mappedSess.length,
          averageRating: 0,
          responseRate: 0
        });
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
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
      case 'completed': return 'bg-[#1A1F5E]/10 text-[#1A1F5E]';
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
          <div className="w-8 h-8 border-2 border-[#0072CE] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      )}
      
      {/* Welcome Section */}
      <div className="bg-[#1A1F5E] -xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl text-white font-bold mb-2">
              Welcome back, User! 👋
            </h1>
            <p className="text-white/80 text-lg">
              Continue your learning journey with your mentors
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 -full flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white -2xl shadow-lg p-6 border border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Connections</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalConnections}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +2 this month
              </p>
            </div>
            <div className="w-12 h-12 bg-[#1A1F5E]/10 -xl flex items-center justify-center">
              <Users className="w-6 h-6 text-[#0072CE]" />
            </div>
          </div>
        </div>

        <div className="bg-white -2xl shadow-lg p-6 border border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming Sessions</p>
              <p className="text-3xl font-bold text-gray-900">{stats.upcomingSessions}</p>
              <p className="text-sm text-[#0072CE] flex items-center mt-1">
                <Calendar className="w-4 h-4 mr-1" />
                Next 7 days
              </p>
            </div>
            <div className="w-12 h-12 bg-[#1A1F5E]/10 -xl flex items-center justify-center">
              <Video className="w-6 h-6 text-[#1A1F5E]" />
            </div>
          </div>
        </div>

        <div className="bg-white -2xl shadow-lg p-6 border border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Peer Rating</p>
              <p className="text-3xl font-bold text-gray-900">4.8</p>
              <p className="text-sm text-yellow-600 flex items-center mt-1">
                <Star className="w-4 h-4 mr-1 fill-current" />
                Highly rated
              </p>
            </div>
            <div className="w-12 h-12 bg-[#1A1F5E]/10 -xl flex items-center justify-center">
              <Award className="w-6 h-6 text-[#1A1F5E]" />
            </div>
          </div>
        </div>

        <div className="bg-white -2xl shadow-lg p-6 border border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Connections</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeConnections}</p>
              <p className="text-sm text-[#0072CE] flex items-center mt-1">
                <Users className="w-4 h-4 mr-1" />
                Engaged network
              </p>
            </div>
            <div className="w-12 h-12 bg-[#1A1F5E]/10 -xl flex items-center justify-center">
              <Users className="w-6 h-6 text-[#0072CE]" />
            </div>
          </div>
        </div>
      </div>

      {/* ---- Your Meeting ---- */}
      <div className="bg-white -2xl shadow-lg border border-[#E5E7EB] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#1A1F5E] to-[#1A1F5E]">
          <div className="flex items-center space-x-3">
            <Video className="w-5 h-5 text-white" />
            <h3 className="text-lg font-semibold text-white">Your Meeting</h3>
          </div>
          <button
            onClick={() => { loadRegisteredSessions(selectedSessionId); }}
            className="flex items-center space-x-1.5 text-white/70 hover:text-white text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {registeredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-14 h-14 bg-[#F4F4F4] -full flex items-center justify-center mb-4">
              <Calendar className="w-7 h-7 text-[#0072CE]" />
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
                  className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm -lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E] cursor-pointer"
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
              <div className="-xl border border-gray-100 bg-gray-50 p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-gray-900 text-base leading-snug">{selectedSession.title}</h4>
                    <span className="inline-block mt-1 px-2.5 py-0.5 bg-[#1A1F5E]/10 text-[#1A1F5E] text-xs font-medium -full">{selectedSession.topic}</span>
                  </div>
                  {selectedSession.expertAvatar && (
                    <img
                      src={selectedSession.expertAvatar}
                      alt={selectedSession.expert}
                      className="w-12 h-12 -full object-cover flex-shrink-0 border-2 border-white shadow"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <User className="w-4 h-4 text-white/900 flex-shrink-0" />
                    <span className="truncate">{selectedSession.expert}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-white/900 flex-shrink-0" />
                    <span>{selectedSession.date}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="w-4 h-4 text-white/900 flex-shrink-0" />
                    <span>{selectedSession.time}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-white/900 flex-shrink-0" />
                    <span>{selectedSession.region}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Users className="w-4 h-4 text-white/900 flex-shrink-0" />
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
                  className="w-full flex items-center justify-center space-x-2 bg-[#0072CE] hover:bg-[#1A1F5E] text-white font-semibold py-3 px-6 -xl transition-colors"
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
        <button className="bg-white -2xl shadow-lg p-6 border border-[#E5E7EB] hover:shadow-xl transition-shadow text-left group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#1A1F5E]/10 -xl flex items-center justify-center group-hover:bg-[#0072CE]/20 transition-colors">
              <Plus className="w-6 h-6 text-[#0072CE]" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#0072CE] transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Find New Mentors</h3>
          <p className="text-gray-600 text-sm">Discover experienced professionals in your field</p>
        </button>

        <button className="bg-white -2xl shadow-lg p-6 border border-[#E5E7EB] hover:shadow-xl transition-shadow text-left group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#1A1F5E]/10 -xl flex items-center justify-center group-hover:bg-[#1A1F5E]/20 transition-colors">
              <Calendar className="w-6 h-6 text-[#1A1F5E]" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Schedule Session</h3>
          <p className="text-gray-600 text-sm">Book a mentoring session with your connections</p>
        </button>

        <button className="bg-white -2xl shadow-lg p-6 border border-[#E5E7EB] hover:shadow-xl transition-shadow text-left group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#1A1F5E]/10 -lg flex items-center justify-center group-hover:bg-[#0072CE]/20 transition-colors">
              <BookOpen className="w-6 h-6 text-[#1A1F5E]" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#1A1F5E] transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Resources</h3>
          <p className="text-gray-600 text-sm">Access learning materials and industry insights</p>
        </button>
      </div>

      {/* Upcoming Sessions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Sessions */}
        <div className="bg-white -2xl shadow-lg p-6 border border-[#E5E7EB]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-[#0072CE]" />
              Upcoming Sessions
            </h3>
            <button className="text-[#0072CE] hover:text-[#1A1F5E] text-sm font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {upcomingSessions.slice(0, 3).map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 -xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-[#1A1F5E]/10 -full flex items-center justify-center">
                    {session.type === 'video' && <Video className="w-5 h-5 text-[#0072CE]" />}
                    {session.type === 'in-person' && <Users className="w-5 h-5 text-[#0072CE]" />}
                    {session.type === 'phone' && <Coffee className="w-5 h-5 text-[#0072CE]" />}
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
        <div className="bg-white -2xl shadow-lg p-6 border border-[#E5E7EB]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-[#0072CE]" />
              Recent Activity
            </h3>
            <button className="text-[#0072CE] hover:text-[#1A1F5E] text-sm font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start space-x-4 p-3 hover:bg-gray-50 -xl transition-colors">
                  <img
                    src={activity.avatar}
                    alt={activity.user}
                    className="w-10 h-12 -md object-cover object-top"
                    style={{ aspectRatio: '4/5' }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Icon className="w-4 h-4 text-[#0072CE]" />
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
        <div className="bg-white -xl shadow-sm border border-gray-200 p-1 inline-flex">
          <button
            onClick={() => setConnectionTab('all')}
            className={`px-6 py-2.5 -lg font-medium text-sm transition-all ${
              connectionTab === 'all'
                ? 'bg-[#0072CE] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({connections.length + expertConnections.length})
          </button>
          <button
            onClick={() => setConnectionTab('mentors')}
            className={`px-6 py-2.5 -lg font-medium text-sm transition-all ${
              connectionTab === 'mentors'
                ? 'bg-[#0072CE] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mentors ({connections.filter(c => c.role === 'mentor').length})
          </button>
          <button
            onClick={() => setConnectionTab('mentees')}
            className={`px-6 py-2.5 -lg font-medium text-sm transition-all ${
              connectionTab === 'mentees'
                ? 'bg-[#0072CE] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mentees ({connections.filter(c => c.role === 'mentee').length})
          </button>
          <button
            onClick={() => setConnectionTab('experts')}
            className={`px-6 py-2.5 -lg font-medium text-sm transition-all ${
              connectionTab === 'experts'
                ? 'bg-[#0072CE] text-white shadow-sm'
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20"
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
          <div key={connection.id} className="bg-white -2xl shadow-lg p-6 border border-[#E5E7EB] hover:shadow-xl transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <img
                  src={connection.avatar}
                  alt={connection.name}
                  className="w-20 h-24 -lg object-cover object-top"
                  style={{ aspectRatio: '4/5' }}
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{connection.name}</h3>
                  <p className="text-[#0072CE] font-medium text-sm">{connection.title}</p>
                  <p className="text-gray-600 text-xs">{connection.company}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-medium -full ${getStatusColor(connection.status)}`}>
                {connection.status}
              </span>
            </div>

            {/* Role Badge */}
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 text-xs font-medium -full ${
                connection.role === 'mentor' ? 'bg-[#1A1F5E]/10 text-[#1A1F5E]' : 'bg-teal-100 text-teal-800'
              }`}>
                {connection.role === 'mentor' ? '👨‍🏫 Mentor' : '🎓 Mentee'}
              </span>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{connection.location.split(',')[0]}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 -xl">
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
                    className="px-2 py-1 bg-[#1A1F5E]/10 text-[#1A1F5E] text-xs font-medium -full"
                  >
                    {skill}
                  </span>
                ))}
                {connection.expertise.length > 2 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs -full">
                    +{connection.expertise.length - 2}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center space-x-1 py-2 px-3 bg-[#0072CE] text-white -lg hover:bg-[#1A1F5E] transition-colors text-sm">
                <MessageSquare className="w-4 h-4" />
                <span>Message</span>
              </button>
              <button className="flex items-center justify-center space-x-1 py-2 px-3 border border-gray-300 text-gray-700 -lg hover:bg-gray-50 transition-colors text-sm">
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
          <div className="w-16 h-16 bg-gray-100 -full mx-auto mb-4 flex items-center justify-center">
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
                    ? 'border-[#0072CE] text-[#0072CE]'
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
                    ? 'border-[#0072CE] text-[#0072CE]'
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