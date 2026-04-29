import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Mail, Star, Award, TrendingUp, Users, ArrowRight, CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSimpleAuth } from '../contexts/SimpleAuthContext';

// All expertise options available for selection
const ALL_EXPERTISE_OPTIONS = [
  // Forvis Mazars professional fields
  'Audit & Assurance', 'Tax Advisory', 'Corporate Finance', 'Accounting & Reporting',
  'Risk Advisory', 'Legal & Compliance', 'Strategy & Transformation', 'Technology & Digital',
  'Data Analytics', 'ESG & Sustainability', 'HR & Talent Management', 'DEI & Inclusion',
  'Deals & Transactions', 'Cross-border Taxation', 'Transfer Pricing', 'Financial Auditing',
  'Regulatory Compliance', 'Risk Management', 'Fintech Strategy', 'Digital Payments',
  'Marketing & Communications', 'Infrastructure Development', 'Project Finance',
  'Public-Private Partnerships', 'Agriculture & Food Security',
  // General professional skills
  'Leadership', 'Career Development', 'Software Development', 'Entrepreneurship',
  'Education & Training', 'Healthcare Management',
];

interface Connection {
  id: string;
  expert_id: string;
  requester_id: string;
  status: string;
  expert_name?: string;
  expert_title?: string;
  requester_name?: string;
  requester_email?: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, updateUserProfile } = useSimpleAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(true);

  // Editable expertise state (Settings tab)
  const [editExpertise, setEditExpertise] = useState<string[]>(currentUser?.profile?.expertise || []);
  const [editDesired, setEditDesired] = useState<string[]>(currentUser?.profile?.desired_expertise || []);
  const [savingExpertise, setSavingExpertise] = useState(false);
  const [expertiseSaved, setExpertiseSaved] = useState(false);
  const [expertiseError, setExpertiseError] = useState<string | null>(null);

  // Sync when profile loads/changes
  useEffect(() => {
    setEditExpertise(currentUser?.profile?.expertise || []);
    setEditDesired(currentUser?.profile?.desired_expertise || []);
  }, [currentUser?.profile?.expertise?.join(), currentUser?.profile?.desired_expertise?.join()]);

  const toggleTag = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);
  };

  const saveExpertise = async () => {
    setSavingExpertise(true);
    setExpertiseError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/expertise', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ expertise: editExpertise, desired_expertise: editDesired }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to save');
      updateUserProfile({ expertise: data.data.expertise, desired_expertise: data.data.desired_expertise });
      setExpertiseSaved(true);
      setTimeout(() => setExpertiseSaved(false), 3000);
    } catch (err: any) {
      setExpertiseError(err.message || 'Save failed');
    } finally {
      setSavingExpertise(false);
    }
  };

  // Real user from auth context
  const user = {
    name: currentUser?.profile?.name || currentUser?.email?.split('@')[0] || 'User',
    avatar: '',
    email: currentUser?.email || '',
    location: currentUser?.profile?.location || '',
    role: currentUser?.role || 'mentee',
    bio: currentUser?.profile?.bio || 'Passionate about professional development and meaningful connections.',
    expertise: currentUser?.profile?.expertise || [],
    desired_expertise: currentUser?.profile?.desired_expertise || [],
    experience: currentUser?.profile?.experience || '',
    availability: currentUser?.profile?.availability || '',
  };

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/connections', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setConnections(data.data?.connections || []);
        }
      } catch { /* silent */ } finally {
        setLoadingConnections(false);
      }
    };
    fetchConnections();
  }, []);

  const userId = currentUser?.id;
  // Connections where I am the mentee (requester)
  const myMentors = connections.filter(
    c => c.requester_id === userId && c.status === 'accepted'
  );
  // Connections where I am the expert/mentor — matched via mentor_user_id returned by getConnectionsWithDetails
  const myMentees = connections.filter(
    c => (c as any).mentor_user_id === userId && c.status === 'accepted'
  );
  const pendingConnections = connections.filter(c => c.status === 'pending');

  const achievements = [
    { icon: Star, title: 'Community Member', description: 'Active participant in DEI Cafe' },
    { icon: Award, title: 'Profile Complete', description: 'Set up your full professional profile' },
    { icon: TrendingUp, title: 'Connected', description: `${connections.filter(c=>c.status==='accepted').length} active connections` }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1A1F5E] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="h-1 w-12 bg-[#E83E2D] -full mb-4" />
          <h1 className="text-4xl font-bold mb-2">My Profile</h1>
          <p className="text-white/70 text-base">
            Manage your professional profile and track your development
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white -xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        {/* Cover Photo */}
        <div className="h-32 bg-[#1A1F5E] relative">
          <button className="absolute bottom-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 px-3 py-1 -lg text-sm font-medium transition-colors">
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
                className="w-32 h-40 -lg object-cover object-top border-4 border-white shadow-lg"
                style={{ aspectRatio: '4/5' }}
              />
              <button className="absolute bottom-2 right-2 bg-[#0072CE] hover:bg-[#1A1F5E] text-white p-2 -lg shadow-lg transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 pt-16">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              {user.role && (
                <p className="text-[#8C8C8C] capitalize">
                  {user.role === 'both' ? 'Mentor & Mentee' : user.role}
                </p>
              )}
              {user.location && (
                <div className="flex items-center space-x-1 mt-2 text-sm text-[#8C8C8C]">
                  <MapPin className="w-4 h-4" />
                  <span>{user.location}</span>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setActiveTab('settings')}
              className="bg-[#1A1F5E] hover:opacity-90 text-white px-6 py-2 -full font-medium transition-all shadow-lg"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white -xl shadow-sm border border-gray-100 mb-8">
        <div className="flex space-x-8 px-6">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'connections', label: 'Connections' },
            { key: 'achievements', label: 'Achievements' },
            { key: 'settings', label: 'Settings' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-4 px-2 border-b-2 transition-colors font-medium ${
                activeTab === tab.key
                  ? 'border-[#E83E2D] text-[#1A1F5E]'
                  : 'border-transparent text-[#8C8C8C] hover:text-[#333333]'
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
            <div className="bg-white -xl shadow-sm border border-[#E5E7EB] p-6">
              <h2 className="text-xl font-semibold text-[#333333] mb-4">About</h2>
              <p className="text-[#8C8C8C] leading-relaxed mb-4">
                {user.bio || 'No bio added yet. Add one in Settings.'}
              </p>
              {user.expertise.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-[#333333] mb-2">My Expertise</p>
                  <div className="flex flex-wrap gap-2">
                    {user.expertise.map(skill => (
                      <span key={skill} className="px-3 py-1 bg-[#1A1F5E]/10 text-[#1A1F5E] -full text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {user.desired_expertise.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-[#333333] mb-2">
                    {user.role === 'mentor' ? 'Mentoring Focus Areas' : 'Looking to Learn'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {user.desired_expertise.map(skill => (
                      <span key={skill} className="px-3 py-1 bg-[#0072CE]/10 text-[#0072CE] -full text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Connection Summary */}
            <div className="bg-white -xl shadow-sm border border-[#E5E7EB] p-6">
              <h2 className="text-xl font-semibold text-[#333333] mb-4">Connection Summary</h2>
              {loadingConnections ? (
                <p className="text-[#8C8C8C] text-sm">Loading connections…</p>
              ) : connections.length === 0 ? (
                <div className="text-center py-6">
                  <Users className="w-10 h-10 text-[#8C8C8C] mx-auto mb-2" />
                  <p className="text-[#8C8C8C] text-sm">No connections yet. Explore mentors to get started.</p>
                  <button onClick={() => navigate('/mentors')} className="mt-3 text-[#0072CE] text-sm font-medium hover:text-[#E83E2D] transition-colors">
                    Find Mentors →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {connections.slice(0, 4).map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-[#F4F4F4] -2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 -full bg-[#1A1F5E] flex items-center justify-center text-white text-sm font-bold">
                          {((c as any).mentor_name || (c as any).mentee_name || '?')[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#333333]">{(c as any).mentor_name || (c as any).mentee_name}</p>
                          <p className="text-xs text-[#8C8C8C]">{(c as any).mentor_title || ''}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 -full font-semibold ${
                        c.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        c.status === 'pending'  ? 'bg-yellow-100 text-yellow-700' :
                        'bg-[#8C8C8C]/10 text-[#8C8C8C]'
                      }`}>{c.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Mentorship Activities CTA */}
            <div className="bg-gradient-to-br from-[#1A1F5E] to-[#0072CE] -3xl shadow-2xl p-8 text-white hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-white/20 backdrop-blur-sm -full p-4">
                  <Award className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl text-white font-bold mb-3 text-center">Mentorship Activities</h3>
              <p className="text-white/90 text-base mb-6 text-center leading-relaxed">
                Explore interactive tools to strengthen your mentorship journey
              </p>
              <button
                onClick={() => navigate('/mentorship-activities')}
                className="w-full bg-white text-[#1A1F5E] hover:bg-[#F4F4F4] px-6 py-4 -2xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Explore Activities</span>
                <TrendingUp className="w-5 h-5" />
              </button>
       
            </div>

            {/* Contact Info */}
            <div className="bg-white -xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-[#8C8C8C]" />
                <span className="text-sm text-[#333333]">{user.email}</span>
              </div>
              {user.location && (
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-[#8C8C8C]" />
                  <span className="text-sm text-[#333333]">{user.location}</span>
                </div>
              )}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white -xl shadow-sm border border-[#E5E7EB] p-6">
              <h3 className="text-lg font-semibold text-[#333333] mb-4">Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#8C8C8C]">My Mentors</span>
                  <span className="text-sm font-semibold text-[#1A1F5E]">{myMentors.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#8C8C8C]">My Mentees</span>
                  <span className="text-sm font-semibold text-[#1A1F5E]">{myMentees.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#8C8C8C]">Pending Requests</span>
                  <span className="text-sm font-semibold text-[#1A1F5E]">{pendingConnections.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#8C8C8C]">Total Connections</span>
                  <span className="text-sm font-semibold text-[#1A1F5E]">{connections.filter(c=>c.status==='accepted').length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'connections' && (
        <div className="space-y-8">
          {/* My Mentors Section */}
          <div className="bg-white -xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-6 h-6 text-[#0072CE]" />
                  My Mentors
                </h2>
                <p className="text-gray-600 mt-1">People who guide and support my growth</p>
              </div>
              <button
                onClick={() => navigate('/mentorship-activities')}
                className="flex items-center gap-2 px-4 py-2 bg-[#0072CE] hover:bg-[#1A1F5E] text-white -lg font-medium transition-all"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {myMentors.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-4 p-4 border border-[#E5E7EB] -2xl hover:shadow-lg hover:border-[#1A1F5E]/30 cursor-pointer transition-all"
                >
                  <div className="w-14 h-14 -full bg-[#1A1F5E] flex items-center justify-center text-white text-xl font-bold">
                    {((c as any).mentor_name || '?')[0]}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#333333]">{(c as any).mentor_name || 'Mentor'}</h3>
                    <p className="text-sm text-[#8C8C8C]">{(c as any).mentor_title || ''}</p>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 -full mt-1 inline-block">accepted</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#8C8C8C]" />
                </div>
              ))}
            </div>

            {myMentors.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No mentors yet. Find mentors to guide your journey!</p>
                <button
                  onClick={() => navigate('/mentors')}
                  className="mt-4 px-4 py-2 bg-[#0072CE] hover:bg-[#1A1F5E] text-white -lg font-medium"
                >
                  Discover Mentors
                </button>
              </div>
            )}
          </div>

          {/* My Mentees Section */}
          <div className="bg-white -xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-6 h-6 text-[#0072CE]" />
                  My Mentees
                </h2>
                <p className="text-gray-600 mt-1">People I'm guiding and supporting</p>
              </div>
              <button
                onClick={() => navigate('/my-mentees')}
                className="flex items-center gap-2 px-4 py-2 bg-[#0072CE] hover:bg-[#1A1F5E] text-white -lg font-medium transition-all"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {myMentees.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-4 p-4 border border-[#E5E7EB] -2xl hover:shadow-lg hover:border-[#1A1F5E]/30 cursor-pointer transition-all"
                >
                  <div className="w-14 h-14 -full bg-gradient-to-br from-[#0072CE] to-[#1A1F5E] flex items-center justify-center text-white text-xl font-bold">
                    {((c as any).mentee_name || '?')[0]}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#333333]">{(c as any).mentee_name || 'Mentee'}</h3>
                    <p className="text-sm text-[#8C8C8C]">{(c as any).mentee_location || ''}</p>
                    <span className="text-xs px-2 py-1 bg-[#0072CE]/10 text-[#0072CE] -full mt-1 inline-block">active</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#8C8C8C]" />
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
            <div className="bg-gradient-to-br from-[#1A1F5E] to-[#0072CE] -3xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white/80">My Mentors</h3>
                <Users className="w-5 h-5 text-white/60" />
              </div>
              <p className="text-3xl font-bold">{myMentors.length}</p>
            </div>
            <div className="bg-gradient-to-br from-[#1A1F5E] to-[#0072CE] -3xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white/80">My Mentees</h3>
                <Users className="w-5 h-5 text-white/60" />
              </div>
              <p className="text-3xl font-bold">{myMentees.length}</p>
            </div>
            <div className="bg-gradient-to-br from-[#1A1F5E] to-[#0072CE] -3xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white/80">Pending</h3>
                <Award className="w-5 h-5 text-white/60" />
              </div>
              <p className="text-3xl font-bold">{pendingConnections.length}</p>
            </div>
          </div>
        </div>
      )}



      {activeTab === 'achievements' && (
        <div className="bg-white -3xl shadow-xl border border-[#E5E7EB] p-6">
          <h2 className="text-xl font-semibold text-[#333333] mb-6">Achievements</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center p-6 border border-[#E5E7EB] -3xl">
                <div className="w-16 h-16 bg-[#1A1F5E]/10 -full flex items-center justify-center mx-auto mb-4">
                  <achievement.icon className="w-8 h-8 text-[#1A1F5E]" />
                </div>
                <h3 className="font-semibold text-[#333333] mb-2">{achievement.title}</h3>
                <p className="text-sm text-[#8C8C8C]">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white -3xl shadow-xl border border-[#E5E7EB] p-6">
          <h2 className="text-xl font-semibold text-[#333333] mb-6">Account Settings</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#333333] mb-2">Full Name</label>
              <input
                type="text"
                defaultValue={user.name}
                className="w-full px-4 py-3 -2xl border-2 border-[#E5E7EB] text-[#333333] focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#333333] mb-2">Email</label>
              <input
                type="email"
                defaultValue={user.email}
                className="w-full px-4 py-3 -2xl border-2 border-[#E5E7EB] text-[#333333] focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#333333] mb-2">Bio</label>
              <textarea
                rows={4}
                defaultValue={user.bio}
                className="w-full px-4 py-3 -2xl border-2 border-[#E5E7EB] text-[#333333] placeholder-[#8C8C8C] focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all"
                placeholder="Tell us about yourself…"
              />
            </div>
            {/* My Expertise editor */}
            <div>
              <label className="block text-sm font-semibold text-[#333333] mb-1">My Expertise</label>
              <p className="text-xs text-[#8C8C8C] mb-3">What skills and knowledge do you bring?</p>
              <div className="flex flex-wrap gap-2">
                {ALL_EXPERTISE_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleTag(editExpertise, setEditExpertise, opt)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all duration-150 ${
                      editExpertise.includes(opt)
                        ? 'bg-[#1A1F5E] text-white border-[#1A1F5E]'
                        : 'bg-white text-[#333333] border-[#E5E7EB] hover:border-[#1A1F5E] hover:text-[#1A1F5E]'
                    }`}
                  >{opt}</button>
                ))}
              </div>
            </div>

            {/* Looking to Learn / Mentoring Focus editor */}
            <div>
              <label className="block text-sm font-semibold text-[#333333] mb-1">
                {user.role === 'mentor' ? 'Mentoring Focus Areas' : 'Looking to Learn'}
              </label>
              <p className="text-xs text-[#8C8C8C] mb-3">
                {user.role === 'mentor'
                  ? 'What topics do you want to mentor people in? This drives which mentees are matched to you.'
                  : 'What do you want to be mentored in? This drives your mentor matches.'}
              </p>
              <div className="flex flex-wrap gap-2">
                {ALL_EXPERTISE_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleTag(editDesired, setEditDesired, opt)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all duration-150 ${
                      editDesired.includes(opt)
                        ? 'bg-[#0072CE] text-white border-[#0072CE]'
                        : 'bg-white text-[#333333] border-[#E5E7EB] hover:border-[#0072CE] hover:text-[#0072CE]'
                    }`}
                  >{opt}</button>
                ))}
              </div>
            </div>

            {expertiseSaved && (
              <div className="flex items-center justify-between gap-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Expertise saved! Your matches have been updated.</span>
                </div>
                <a
                  href="/mentors?refresh=1"
                  className="flex-shrink-0 bg-[#1A1F5E] text-white px-4 py-1.5 rounded-full text-xs font-semibold hover:opacity-90 transition-all whitespace-nowrap"
                >
                  View my matches →
                </a>
              </div>
            )}
            {expertiseError && (
              <div className="flex items-center gap-2 bg-[#E83E2D]/10 border border-[#E83E2D]/30 text-[#E83E2D] px-4 py-2 rounded-xl text-sm">
                <X className="w-4 h-4" />
                {expertiseError}
              </div>
            )}
            <div className="flex space-x-4">
              <button
                onClick={saveExpertise}
                disabled={savingExpertise}
                className="bg-[#1A1F5E] text-white px-8 py-3 -full font-semibold shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
              >
                {savingExpertise ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => { setEditExpertise(currentUser?.profile?.expertise || []); setEditDesired(currentUser?.profile?.desired_expertise || []); setExpertiseSaved(false); setExpertiseError(null); }}
                className="border-2 border-[#1A1F5E] text-[#1A1F5E] px-8 py-3 -full font-semibold hover:bg-[#1A1F5E] hover:text-white transition-all"
              >
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