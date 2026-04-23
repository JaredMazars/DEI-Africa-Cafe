import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Video, LogOut, Shield, Plus, Edit, Trash2, 
  Search, X, Save, Mail, Phone, Award, BookOpen
} from 'lucide-react';

interface Mentor {
  id: string;
  name: string;
  email: string;
  phone: string;
  expertise: string[];
  bio: string;
  photo: string;
  rating: number;
  totalMentees: number;
  sessionsCompleted: number;
  joinedDate: string;
  status: 'active' | 'inactive';
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'mentors' | 'content'>('mentors');

  // Mentor Management State
  const [mentors, setMentors] = useState<Mentor[]>([
    {
      id: '1',
      name: 'Dr. Emily Rodriguez',
      email: 'emily.rodriguez@deiafrica.com',
      phone: '+27 11 555 0101',
      expertise: ['Leadership', 'Strategy', 'Career Development'],
      bio: 'Seasoned executive with 15+ years of leadership experience in technology and consulting sectors.',
      photo: 'https://randomuser.me/api/portraits/women/1.jpg',
      rating: 4.9,
      totalMentees: 12,
      sessionsCompleted: 48,
      joinedDate: '2024-01-15',
      status: 'active'
    },
    {
      id: '2',
      name: 'Marcus Thompson',
      email: 'marcus.thompson@deiafrica.com',
      phone: '+27 11 555 0102',
      expertise: ['Product Management', 'Analytics', 'Team Building'],
      bio: 'Product leader passionate about building inclusive teams and mentoring emerging talent.',
      photo: 'https://randomuser.me/api/portraits/men/2.jpg',
      rating: 4.8,
      totalMentees: 8,
      sessionsCompleted: 32,
      joinedDate: '2024-02-20',
      status: 'active'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddMentor, setShowAddMentor] = useState(false);
  const [editingMentor, setEditingMentor] = useState<string | null>(null);
  const [newMentor, setNewMentor] = useState({
    name: '',
    email: '',
    phone: '',
    expertise: '',
    bio: '',
    photo: ''
  });

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdmin');
    navigate('/admin/login');
  };

  const handleAddMentor = () => {
    if (!newMentor.name || !newMentor.email || !newMentor.bio) {
      alert('Please fill in all required fields (Name, Email, and Bio)');
      return;
    }

    const mentor: Mentor = {
      id: Date.now().toString(),
      name: newMentor.name,
      email: newMentor.email,
      phone: newMentor.phone,
      expertise: newMentor.expertise.split(',').map(e => e.trim()).filter(e => e),
      bio: newMentor.bio,
      photo: newMentor.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(newMentor.name)}&size=200`,
      rating: 0,
      totalMentees: 0,
      sessionsCompleted: 0,
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    setMentors([...mentors, mentor]);
    setShowAddMentor(false);
    setNewMentor({ name: '', email: '', phone: '', expertise: '', bio: '', photo: '' });
  };

  const handleUpdateMentor = (id: string) => {
    if (!newMentor.name || !newMentor.email || !newMentor.bio) {
      alert('Please fill in all required fields (Name, Email, and Bio)');
      return;
    }

    setMentors(mentors.map(m => 
      m.id === id ? {
        ...m,
        name: newMentor.name,
        email: newMentor.email,
        phone: newMentor.phone,
        expertise: newMentor.expertise.split(',').map(e => e.trim()).filter(e => e),
        bio: newMentor.bio,
        photo: newMentor.photo || m.photo
      } : m
    ));
    setEditingMentor(null);
    setNewMentor({ name: '', email: '', phone: '', expertise: '', bio: '', photo: '' });
  };

  const handleDeleteMentor = (id: string) => {
    if (confirm('Are you sure you want to delete this mentor? This action cannot be undone.')) {
      setMentors(mentors.filter(m => m.id !== id));
    }
  };

  const handleEditClick = (mentor: Mentor) => {
    setEditingMentor(mentor.id);
    setNewMentor({
      name: mentor.name,
      email: mentor.email,
      phone: mentor.phone,
      expertise: mentor.expertise.join(', '),
      bio: mentor.bio,
      photo: mentor.photo
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredMentors = mentors.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.expertise.some(e => e.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F4F4] via-white to-[#F4F4F4]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1A1F5E] to-[#1A1F5E] text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-2 sm:p-3">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-white/70 text-xs sm:text-sm">DEI Africa Café Management</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {[
              { id: 'mentors', label: 'Mentor Management', icon: Users },
              { id: 'content', label: 'Content Library', icon: Video }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 ${
                    activeTab === tab.id
                      ? 'border-[#0072CE] text-[#0072CE]'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'mentors' && (
          <div className="space-y-6">
            {/* Header & Add Button */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Mentor Management</h2>
                <p className="text-gray-600 mt-1">Add, edit, and manage mentors in the system</p>
              </div>
              <button
                onClick={() => {
                  setShowAddMentor(true);
                  setEditingMentor(null);
                  setNewMentor({ name: '', email: '', phone: '', expertise: '', bio: '', photo: '' });
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-[#0072CE] to-[#1A1F5E] hover:opacity-90 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <Plus className="w-5 h-5" />
                Add New Mentor
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Mentors', value: mentors.length, icon: Users, color: 'blue' },
                { label: 'Active Mentors', value: mentors.filter(m => m.status === 'active').length, icon: Award, color: 'green' },
                { label: 'Total Sessions', value: mentors.reduce((acc, m) => acc + m.sessionsCompleted, 0), icon: BookOpen, color: 'blue' },
                { label: 'Total Mentees', value: mentors.reduce((acc, m) => acc + m.totalMentees, 0), icon: Users, color: 'orange' }
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                    <div className={`inline-flex p-3 rounded-lg bg-${stat.color}-100 mb-3`}>
                      <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                    </div>
                    <p className="text-gray-600 text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                );
              })}
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search mentors by name, email, or expertise..."
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                />
              </div>
            </div>

            {/* Add/Edit Mentor Form */}
            {(showAddMentor || editingMentor) && (
              <div className="bg-gradient-to-br from-[#F4F4F4] to-[#F4F4F4] rounded-2xl p-8 border-2 border-[#0072CE]/30 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {editingMentor ? 'Edit Mentor' : 'Add New Mentor'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddMentor(false);
                      setEditingMentor(null);
                      setNewMentor({ name: '', email: '', phone: '', expertise: '', bio: '', photo: '' });
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={newMentor.name}
                      onChange={(e) => setNewMentor({ ...newMentor, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                      placeholder="Dr. Emily Rodriguez"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={newMentor.email}
                      onChange={(e) => setNewMentor({ ...newMentor, email: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                      placeholder="email@deiafrica.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={newMentor.phone}
                      onChange={(e) => setNewMentor({ ...newMentor, phone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                      placeholder="+27 11 555 0101"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Photo URL</label>
                    <input
                      type="url"
                      value={newMentor.photo}
                      onChange={(e) => setNewMentor({ ...newMentor, photo: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                      placeholder="https://example.com/photo.jpg (optional)"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Expertise (comma-separated)</label>
                    <input
                      type="text"
                      value={newMentor.expertise}
                      onChange={(e) => setNewMentor({ ...newMentor, expertise: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                      placeholder="Leadership, Strategy, Career Development"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Bio *</label>
                    <textarea
                      value={newMentor.bio}
                      onChange={(e) => setNewMentor({ ...newMentor, bio: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                      rows={4}
                      placeholder="Brief professional background and expertise..."
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => {
                      setShowAddMentor(false);
                      setEditingMentor(null);
                      setNewMentor({ name: '', email: '', phone: '', expertise: '', bio: '', photo: '' });
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => editingMentor ? handleUpdateMentor(editingMentor) : handleAddMentor()}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#0072CE] to-[#1A1F5E] hover:opacity-90 text-white py-3 rounded-lg font-bold shadow-lg transition-all"
                  >
                    <Save className="w-5 h-5" />
                    {editingMentor ? 'Update Mentor' : 'Add Mentor'}
                  </button>
                </div>
              </div>
            )}

            {/* Mentors List */}
            <div className="grid grid-cols-1 gap-6">
              {filteredMentors.map(mentor => (
                <div key={mentor.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex gap-6">
                    <img
                      src={mentor.photo}
                      alt={mentor.name}
                      className="w-24 h-24 rounded-xl object-cover border-4 border-[#E5E7EB]"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{mentor.name}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {mentor.email}
                            </span>
                            {mentor.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {mentor.phone}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditClick(mentor)}
                            className="p-2 text-[#0072CE] hover:bg-[#1A1F5E]/5 rounded-lg transition-colors"
                            title="Edit mentor"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMentor(mentor.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete mentor"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-3">{mentor.bio}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {mentor.expertise.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-[#1A1F5E]/10 text-[#1A1F5E] rounded-full text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <span className="flex items-center gap-1 text-gray-600">
                          <Users className="w-4 h-4" />
                          <strong>{mentor.totalMentees}</strong> mentees
                        </span>
                        <span className="flex items-center gap-1 text-gray-600">
                          <BookOpen className="w-4 h-4" />
                          <strong>{mentor.sessionsCompleted}</strong> sessions
                        </span>
                        <span className="flex items-center gap-1 text-gray-600">
                          <Award className="w-4 h-4 text-yellow-500" />
                          <strong>{mentor.rating}</strong> rating
                        </span>
                        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${
                          mentor.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {mentor.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredMentors.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">
                  {searchTerm ? 'No mentors found matching your search' : 'No mentors yet. Click "Add New Mentor" to get started!'}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'content' && (
          <div className="text-center py-16">
            <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Content Library</h3>
            <p className="text-gray-600 mb-6">Upload videos and create articles for mentees</p>
            <button
              onClick={() => navigate('/admin/content')}
              className="bg-gradient-to-r from-[#0072CE] to-[#1A1F5E] hover:opacity-90 text-white px-6 py-3 rounded-lg font-bold shadow-lg"
            >
              Go to Content Manager
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
