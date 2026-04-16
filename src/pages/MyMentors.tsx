import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, Target, Star, Clock, 
  Award, Search, MapPin,
  ArrowRight
} from 'lucide-react';

interface Mentor {
  id: string;
  name: string;
  role: string;
  company: string;
  location: string;
  expertise: string[];
  image: string;
  rating: number;
  totalMentees: number;
  verified: boolean;
  relationshipStatus: 'active' | 'pending' | 'completed';
  startDate: string;
  sessionsCompleted: number;
  nextSession?: string; 
  goalsActive: number;
  lastActivity: string;
}

const MyMentors: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'completed'>('all');

  // Mock data - in real app, fetch from API
  const mentors: Mentor[] = [
    {
      id: 'mentor-1',
      name: 'Sarah Johnson',
      role: 'Senior Strategy Consultant',
      company: 'Forvis Mazars',
      location: 'Lagos, Nigeria',
      expertise: ['Business Strategy', 'Leadership', 'Digital Transformation'],
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      rating: 4.9,
      totalMentees: 24,
      verified: true,
      relationshipStatus: 'active',
      startDate: '2025-01-15',
      sessionsCompleted: 8,
      nextSession: '2026-01-20',
      goalsActive: 3,
      lastActivity: '2 days ago'
    },
    {
      id: 'mentor-2',
      name: 'Dr. Kwame Mensah',
      role: 'Technology Director',
      company: 'Forvis Mazars',
      location: 'Accra, Ghana',
      expertise: ['Software Engineering', 'AI/ML', 'Tech Leadership'],
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      rating: 4.8,
      totalMentees: 31,
      verified: true,
      relationshipStatus: 'active',
      startDate: '2024-11-20',
      sessionsCompleted: 12,
      nextSession: '2026-01-18',
      goalsActive: 2,
      lastActivity: '5 days ago'
    },
    {
      id: 'mentor-3',
      name: 'Amina Hassan',
      role: 'Finance Partner',
      company: 'Forvis Mazars',
      location: 'Nairobi, Kenya',
      expertise: ['Financial Planning', 'Risk Management', 'Investment Strategy'],
      image: 'https://randomuser.me/api/portraits/women/68.jpg',
      rating: 5.0,
      totalMentees: 18,
      verified: true,
      relationshipStatus: 'pending',
      startDate: '2026-01-10',
      sessionsCompleted: 1,
      goalsActive: 1,
      lastActivity: '1 week ago'
    },
    {
      id: 'mentor-4',
      name: 'Michael Okonkwo',
      role: 'Marketing Director',
      company: 'Forvis Mazars',
      location: 'Johannesburg, South Africa',
      expertise: ['Brand Strategy', 'Digital Marketing', 'Growth Hacking'],
      image: 'https://randomuser.me/api/portraits/men/52.jpg',
      rating: 4.7,
      totalMentees: 28,
      verified: true,
      relationshipStatus: 'completed',
      startDate: '2024-06-15',
      sessionsCompleted: 24,
      goalsActive: 0,
      lastActivity: '3 months ago'
    }
  ];

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.expertise.some(exp => exp.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || mentor.relationshipStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const activeMentors = mentors.filter(m => m.relationshipStatus === 'active').length;
  const totalSessions = mentors.reduce((sum, m) => sum + m.sessionsCompleted, 0);
  const totalGoals = mentors.reduce((sum, m) => sum + m.goalsActive, 0);

  const handleMentorClick = (mentorId: string) => {
    // Navigate to activities page with mentor ID
    navigate(`/mentorship-activities/${mentorId}`);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50 pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent mb-2">
                My Mentors
              </h1>
              <p className="text-gray-600">
                Manage your mentorship relationships and track your progress
              </p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Active Mentors</p>
                  <p className="text-3xl font-bold text-blue-600">{activeMentors}</p>
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
                  <p className="text-gray-600 text-sm mb-1">Avg Rating</p>
                  <p className="text-3xl font-bold text-orange-600">4.8</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-orange-600" />
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
                placeholder="Search mentors by name or expertise..."
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

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMentors.map((mentor) => (
            <div
              key={mentor.id}
              onClick={() => handleMentorClick(mentor.id)}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] overflow-hidden"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-600 p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={mentor.image}
                      alt={mentor.name}
                      className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold">{mentor.name}</h3>
                        {mentor.verified && (
                          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                            <Award className="w-3 h-3 text-blue-600" />
                          </div>
                        )}
                      </div>
                      <p className="text-blue-100 text-sm">{mentor.role}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(mentor.relationshipStatus)}`}>
                    {mentor.relationshipStatus.charAt(0).toUpperCase() + mentor.relationshipStatus.slice(1)}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-blue-100">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{mentor.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                    <span className="text-white font-semibold">{mentor.rating}</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                {/* Expertise Tags */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2 font-medium">Expertise:</p>
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-t border-b border-gray-200">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{mentor.sessionsCompleted}</p>
                    <p className="text-xs text-gray-600">Sessions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{mentor.goalsActive}</p>
                    <p className="text-xs text-gray-600">Active Goals</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {Math.floor((Date.now() - new Date(mentor.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30))}
                    </p>
                    <p className="text-xs text-gray-600">Months</p>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="space-y-2 mb-4">
                  {mentor.nextSession && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Next Session:</span>
                      <span>{new Date(mentor.nextSession).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span className="font-medium">Last Activity:</span>
                    <span>{mentor.lastActivity}</span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleMentorClick(mentor.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  View Activities & Progress
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredMentors.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No mentors found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start your mentorship journey by connecting with mentors'}
            </p>
            <button
              onClick={() => navigate('/mentors')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200"
            >
              Discover Mentors
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMentors;
