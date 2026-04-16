import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, Target, Star, Clock, 
  Search, MapPin, TrendingUp,
  MessageSquare, Plus, BarChart3
} from 'lucide-react';

interface Mentee {
  id: string;
  name: string;
  role: string;
  company: string;
  location: string;
  image: string;
  relationshipStatus: 'active' | 'pending' | 'completed';
  startDate: string;
  sessionsCompleted: number;
  nextSession?: string;
  goalsActive: number;
  goalsCompleted: number;
  lastActivity: string;
  progressScore: number; // 0-100
  focusAreas: string[];
}

const MyMentees: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'completed'>('all');

  // Mock data - in real app, fetch from API
  const mentees: Mentee[] = [
    {
      id: 'mentee-1',
      name: 'James Okafor',
      role: 'Junior Consultant',
      company: 'Forvis Mazars',
      location: 'Lagos, Nigeria',
      image: 'https://randomuser.me/api/portraits/men/22.jpg',
      relationshipStatus: 'active',
      startDate: '2025-01-15',
      sessionsCompleted: 8,
      nextSession: '2026-01-20',
      goalsActive: 3,
      goalsCompleted: 2,
      lastActivity: '1 day ago',
      progressScore: 75,
      focusAreas: ['Leadership', 'Communication', 'Project Management']
    },
    {
      id: 'mentee-2',
      name: 'Aisha Mohammed',
      role: 'Analyst',
      company: 'Forvis Mazars',
      location: 'Abuja, Nigeria',
      image: 'https://randomuser.me/api/portraits/women/32.jpg',
      relationshipStatus: 'active',
      startDate: '2024-11-20',
      sessionsCompleted: 12,
      nextSession: '2026-01-18',
      goalsActive: 2,
      goalsCompleted: 5,
      lastActivity: '3 days ago',
      progressScore: 88,
      focusAreas: ['Data Analysis', 'Technical Skills', 'Career Growth']
    },
    {
      id: 'mentee-3',
      name: 'David Mensah',
      role: 'Associate',
      company: 'Forvis Mazars',
      location: 'Accra, Ghana',
      image: 'https://randomuser.me/api/portraits/men/45.jpg',
      relationshipStatus: 'pending',
      startDate: '2026-01-10',
      sessionsCompleted: 1,
      goalsActive: 1,
      goalsCompleted: 0,
      lastActivity: '1 week ago',
      progressScore: 20,
      focusAreas: ['Software Development', 'Code Review']
    },
    {
      id: 'mentee-4',
      name: 'Grace Mwangi',
      role: 'Senior Associate',
      company: 'Forvis Mazars',
      location: 'Nairobi, Kenya',
      image: 'https://randomuser.me/api/portraits/women/55.jpg',
      relationshipStatus: 'completed',
      startDate: '2024-06-15',
      sessionsCompleted: 24,
      goalsActive: 0,
      goalsCompleted: 8,
      lastActivity: '2 months ago',
      progressScore: 100,
      focusAreas: ['Leadership', 'Strategic Planning']
    }
  ];

  const filteredMentees = mentees.filter(mentee => {
    const matchesSearch = mentee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentee.focusAreas.some(area => area.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || mentee.relationshipStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const activeMentees = mentees.filter(m => m.relationshipStatus === 'active').length;
  const totalSessions = mentees.reduce((sum, m) => sum + m.sessionsCompleted, 0);
  const totalGoals = mentees.reduce((sum, m) => sum + m.goalsActive, 0);
  const avgProgress = Math.round(mentees.reduce((sum, m) => sum + m.progressScore, 0) / mentees.length);

  const handleMenteeClick = (menteeId: string) => {
    // Navigate to mentor view of mentee's activities
    navigate(`/mentor-view/mentee/${menteeId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50 pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent mb-2">
                My Mentees
              </h1>
              <p className="text-gray-600">
                Guide and support your mentees on their professional journey
              </p>
            </div>
            <button
              onClick={() => navigate('/mentor-content')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Manage Content
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Active Mentees</p>
                  <p className="text-3xl font-bold text-blue-600">{activeMentees}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total Sessions</p>
                  <p className="text-3xl font-bold text-green-600">{totalSessions}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Active Goals</p>
                  <p className="text-3xl font-bold text-blue-600">{totalGoals}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Avg Progress</p>
                  <p className="text-3xl font-bold text-orange-600">{avgProgress}%</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search mentees by name or focus area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  filterStatus === 'all'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  filterStatus === 'active'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-green-300'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  filterStatus === 'pending'
                    ? 'bg-yellow-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-yellow-300'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterStatus('completed')}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  filterStatus === 'completed'
                    ? 'bg-gray-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-300'
                }`}
              >
                Completed
              </button>
            </div>
          </div>
        </div>

        {/* Mentees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMentees.map((mentee) => (
            <div
              key={mentee.id}
              onClick={() => handleMenteeClick(mentee.id)}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] overflow-hidden"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-600 p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={mentee.image}
                      alt={mentee.name}
                      className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold">{mentee.name}</h3>
                      </div>
                      <p className="text-blue-100 text-sm">{mentee.role}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(mentee.relationshipStatus)}`}>
                    {mentee.relationshipStatus.charAt(0).toUpperCase() + mentee.relationshipStatus.slice(1)}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-blue-100">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{mentee.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{mentee.lastActivity}</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                    <span className="text-sm font-bold text-gray-900">{mentee.progressScore}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${getProgressColor(mentee.progressScore)} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${mentee.progressScore}%` }}
                    />
                  </div>
                </div>

                {/* Focus Areas */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2 font-medium">Focus Areas:</p>
                  <div className="flex flex-wrap gap-2">
                    {mentee.focusAreas.slice(0, 3).map((area, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-t border-b border-gray-200">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{mentee.sessionsCompleted}</p>
                    <p className="text-xs text-gray-600">Sessions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{mentee.goalsActive}</p>
                    <p className="text-xs text-gray-600">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{mentee.goalsCompleted}</p>
                    <p className="text-xs text-gray-600">Completed</p>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="space-y-2 mb-4">
                  {mentee.nextSession && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Next Session:</span>
                      <span>{new Date(mentee.nextSession).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Star className="w-4 h-4 text-yellow-600" />
                    <span className="font-medium">Since:</span>
                    <span>{new Date(mentee.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/messages?mentee=${mentee.id}`);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-blue-200 hover:bg-blue-50 text-blue-700 rounded-xl font-semibold transition-all duration-200"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </button>
                  <button
                    onClick={() => handleMenteeClick(mentee.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg"
                  >
                    <BarChart3 className="w-4 h-4" />
                    View Progress
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredMentees.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No mentees found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start your mentorship journey by accepting mentee requests'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMentees;
