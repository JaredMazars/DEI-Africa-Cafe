import React, { useState } from 'react';
import { Camera, MapPin, Briefcase, Mail, Phone, Calendar, Star, Award, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Hardcoded user data
  const user = {
    name: 'Jason Nessat',
    avatar: '',
    email: 'Jason.Nessat@Mazars.co.za',
    phone: '+27 (123) 456-7890',
    location: 'Cape Town, South Africa',
    role: 'Mentee',
    bio: 'Passionate about learning and professional development.',
    expertise: ['Leadership', 'Project Management', 'Communication']
  };

  const achievements = [
    { icon: Star, title: 'Top Rated Mentee', description: '4.9/5 average rating from mentors' },
    { icon: Award, title: 'Quick Learner', description: 'Completed 15 courses this year' },
    { icon: TrendingUp, title: 'Growth Focused', description: '50+ hours of mentoring sessions' }
  ];

  // Mock mentors data
  const myMentors = [
    {
      id: 'mentor-1',
      name: 'Sarah Johnson',
      role: 'Senior Strategy Consultant',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      expertise: ['Leadership', 'Strategy'],
      sessionsCompleted: 8,
      relationshipStatus: 'active'
    },
    {
      id: 'mentor-2',
      name: 'Dr. Kwame Mensah',
      role: 'Technology Director',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      expertise: ['Tech Leadership', 'AI/ML'],
      sessionsCompleted: 12,
      relationshipStatus: 'active'
    }
  ];

  // Mock mentees data
  const myMentees = [
    {
      id: 'mentee-1',
      name: 'James Okafor',
      role: 'Junior Consultant',
      image: 'https://randomuser.me/api/portraits/men/22.jpg',
      focusAreas: ['Leadership', 'Communication'],
      sessionsCompleted: 8,
      progressScore: 75
    },
    {
      id: 'mentee-2',
      name: 'Aisha Mohammed',
      role: 'Analyst',
      image: 'https://randomuser.me/api/portraits/women/32.jpg',
      focusAreas: ['Data Analysis', 'Career Growth'],
      sessionsCompleted: 12,
      progressScore: 88
    }
  ];

  const completedSessions = [
    {
      mentor: 'Dr. Emily Rodriguez',
      topic: 'Leadership Development',
      date: '2024-01-10',
      rating: 5,
      feedback: 'Excellent session with great insights on team management.'
    },
    {
      mentor: 'James Wilson',
      topic: 'Technical Skills Review',
      date: '2024-01-08',
      rating: 5,
      feedback: 'Very helpful guidance on system architecture patterns.'
    },
    {
      mentor: 'Sarah Johnson',
      topic: 'Career Planning',
      date: '2024-01-05',
      rating: 4,
      feedback: 'Great advice on career progression and goal setting.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header with Forvis Mazars Branding */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="max-w-[1920px] mx-auto px-12 sm:px-16 lg:px-20 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-3 text-white">My Profile</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Manage your professional profile and track your development
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        {/* Cover Photo */}
        <div className="h-32 bg-gradient-to-r from-blue-900 to-blue-800 relative">
          <button className="absolute bottom-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors">
            <Camera className="w-4 h-4 inline mr-1" />
            Edit Cover
          </button>
        </div>
        
        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex items-end space-x-4 -mt-16 mb-4">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-32 h-40 rounded-lg object-cover object-top border-4 border-white shadow-lg"
                style={{ aspectRatio: '4/5' }}
              />
              <button className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow-lg transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 pt-16">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">Audit Manager</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>Cape Town, South Africa</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined January 2024</span>
                </div>
              </div>
            </div>
            
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex space-x-8 px-6">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'connections', label: 'Connections' },
            { key: 'sessions', label: 'Sessions' },
            { key: 'achievements', label: 'Achievements' },
            { key: 'settings', label: 'Settings' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* About */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                I'm a passionate professional focused on continuous learning and growth. Currently seeking mentorship 
                in leadership development, technical skills, and career advancement. I believe in the power of 
                meaningful connections and knowledge sharing.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Leadership', 'Product Management', 'Analytics', 'Team Building'].map(skill => (
                  <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">Completed session with Dr. Emily Rodriguez</p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Award className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">Earned "Quick Learner" achievement</p>
                    <p className="text-xs text-gray-500">1 week ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">Joined DEI Africa Cafe community</p>
                    <p className="text-xs text-gray-500">2 weeks ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Mentorship Activities CTA - ENHANCED */}
            <div className="bg-blue-600 rounded-2xl shadow-2xl p-8 text-white transform hover:scale-105 transition-all duration-300 border-4 border-blue-400">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                  <Award className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl text-white font-bold mb-3 text-center">Mentorship Activities</h3>
              <p className="text-blue-50 text-base mb-6 text-center leading-relaxed">
                Explore interactive tools to strengthen your mentorship journey
              </p>
              <button
                onClick={() => navigate('/mentorship-activities')}
                className="w-full bg-white text-blue-600 hover:bg-blue-50 px-6 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <span>Explore Activities</span>
                <TrendingUp className="w-5 h-5" />
              </button>
       
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{user.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">+1 (555) 123-4567</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Sessions Completed</span>
                  <span className="text-sm font-semibold text-gray-900">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Mentors Connected</span>
                  <span className="text-sm font-semibold text-gray-900">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Resources Accessed</span>
                  <span className="text-sm font-semibold text-gray-900">45</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Rating</span>
                  <span className="text-sm font-semibold text-gray-900">4.9/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'connections' && (
        <div className="space-y-8">
          {/* My Mentors Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-600" />
                  My Mentors
                </h2>
                <p className="text-gray-600 mt-1">People who guide and support my growth</p>
              </div>
              <button
                onClick={() => navigate('/mentorship-activities')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {myMentors.map((mentor) => (
                <div
                  key={mentor.id}
                  onClick={() => navigate(`/mentorship-activities/${mentor.id}`)}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-lg hover:border-blue-300 cursor-pointer transition-all"
                >
                  <img
                    src={mentor.image}
                    alt={mentor.name}
                    className="w-16 h-16 rounded-full border-2 border-blue-200"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{mentor.name}</h3>
                    <p className="text-sm text-gray-600">{mentor.role}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {mentor.sessionsCompleted} sessions
                      </span>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        {mentor.relationshipStatus}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              ))}
            </div>

            {myMentors.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No mentors yet. Find mentors to guide your journey!</p>
                <button
                  onClick={() => navigate('/mentors')}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Discover Mentors
                </button>
              </div>
            )}
          </div>

          {/* My Mentees Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-600" />
                  My Mentees
                </h2>
                <p className="text-gray-600 mt-1">People I'm guiding and supporting</p>
              </div>
              <button
                onClick={() => navigate('/my-mentees')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {myMentees.map((mentee) => (
                <div
                  key={mentee.id}
                  onClick={() => navigate(`/mentor-view/mentee/${mentee.id}`)}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-lg hover:border-blue-300 cursor-pointer transition-all"
                >
                  <img
                    src={mentee.image}
                    alt={mentee.name}
                    className="w-16 h-16 rounded-full border-2 border-blue-200"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{mentee.name}</h3>
                    <p className="text-sm text-gray-600">{mentee.role}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {mentee.sessionsCompleted} sessions
                      </span>
                      <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                        {mentee.progressScore}% progress
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              ))}
            </div>

            {myMentees.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No mentees yet. Start mentoring to make an impact!</p>
              </div>
            )}
          </div>

          {/* Connection Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-blue-900">Total Mentors</h3>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-900">{myMentors.length}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-blue-900">Total Mentees</h3>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-900">{myMentees.length}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-green-900">Total Connections</h3>
                <Award className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-900">{myMentors.length + myMentees.length}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Completed Sessions</h2>
          <div className="space-y-6">
            {completedSessions.map((session, index) => (
              <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{session.topic}</h3>
                    <p className="text-sm text-gray-600">with {session.mentor}</p>
                    <p className="text-xs text-gray-500">{session.date}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < session.rating ? 'text-blue-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{session.feedback}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Achievements</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center p-6 border border-gray-200 rounded-lg">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <achievement.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{achievement.title}</h3>
                <p className="text-sm text-gray-600">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                defaultValue={user.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                defaultValue={user.email}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell us about yourself..."
              />
            </div>
            <div className="flex space-x-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Save Changes
              </button>
              <button className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-lg font-medium transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Profile;