import React, { useState, useEffect } from 'react';
import {
  UserCog,
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Mail,
  Phone,
  Award,
  Users,
  AlertCircle
} from 'lucide-react';
import { logAuditAction } from '../../services/auditLogger';

interface Mentor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  expertise: string[];
  bio: string;
  photo: string;
  rating: number;
  totalMentees: number;
  sessionsCompleted: number;
  joinedDate: string;
  status: 'active' | 'inactive';
}

const API = '/api/admin';

const AdminMentors: React.FC = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    expertise: '',
    bio: '',
    photo: ''
  });

  useEffect(() => {
    loadMentors();
  }, []);

  const getToken = () => localStorage.getItem('adminToken') || localStorage.getItem('token') || '';

  const loadMentors = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API}/mentors`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      const raw: any[] = data.data?.mentors || [];
      const list: Mentor[] = raw.map((m: any) => ({
        id: m.expert_id || m.id,
        name: m.name || '',
        email: m.email || '',
        phone: m.phone || '',
        expertise: m.expertise_list ? m.expertise_list.split(', ').filter(Boolean) : [],
        bio: m.bio || '',
        photo: m.profile_image_url || m.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=1A1F5E&color=fff&size=200`,
        rating: parseFloat(m.average_rating) || 0,
        totalMentees: parseInt(m.active_mentee_count) || 0,
        sessionsCompleted: parseInt(m.sessions_completed) || 0,
        joinedDate: m.created_at ? new Date(m.created_at).toISOString().split('T')[0] : '',
        status: m.is_available ? 'active' : 'inactive',
      }));
      setMentors(list);
    } catch (err: any) {
      setError(err.message || 'Failed to load mentors');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.bio) {
      alert('Please fill in all required fields (Name, Email, and Bio)');
      return;
    }
    try {
      const body = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        expertise: formData.expertise.split(',').map(e => e.trim()).filter(e => e),
        bio: formData.bio,
        photo: formData.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&size=200`,
      };
      if (editingId) {
        await fetch(`${API}/mentors/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
          body: JSON.stringify(body),
        });
        logAuditAction('UPDATED', 'Mentor', `${formData.name}`);
      } else {
        await fetch(`${API}/mentors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
          body: JSON.stringify(body),
        });
        logAuditAction('CREATED', 'Mentor', `${formData.name}`);
      }
      resetForm();
      await loadMentors();
    } catch (err: any) {
      alert('Failed to save mentor: ' + (err.message || 'Unknown error'));
    }
  };

  const handleEdit = (mentor: Mentor) => {
    setEditingId(mentor.id);
    setFormData({
      name: mentor.name,
      email: mentor.email,
      phone: mentor.phone || '',
      expertise: mentor.expertise.join(', '),
      bio: mentor.bio,
      photo: mentor.photo
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const mentor = mentors.find(m => m.id === id);
    if (!confirm(`Are you sure you want to delete ${mentor?.name}? This cannot be undone.`)) return;
    try {
      await fetch(`${API}/mentors/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      logAuditAction('DELETED', 'Mentor', mentor?.name || id);
      await loadMentors();
    } catch (err: any) {
      alert('Failed to delete: ' + (err.message || 'Unknown error'));
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', email: '', phone: '', expertise: '', bio: '', photo: '' });
  };

  const filteredMentors = mentors.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.expertise.some(e => e.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mentor Management</h1>
          <p className="text-gray-600 mt-1">Add, edit, and manage mentors in the system</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 bg-gradient-to-r from-[#0072CE] to-[#1A1F5E] hover:opacity-90 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          Add New Mentor
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-[#E83E2D]/10 border border-[#E83E2D]/30 text-[#E83E2D] px-5 py-4 rounded-2xl">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={loadMentors} className="ml-auto underline font-semibold">Retry</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Mentors', value: loading ? '…' : mentors.length, icon: UserCog },
          { label: 'Active Mentors', value: loading ? '…' : mentors.filter(m => m.status === 'active').length, icon: Award },
          { label: 'Total Sessions', value: loading ? '…' : mentors.reduce((acc, m) => acc + m.sessionsCompleted, 0), icon: UserCog },
          { label: 'Total Mentees', value: loading ? '…' : mentors.reduce((acc, m) => acc + m.totalMentees, 0), icon: Users },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="inline-flex p-3 rounded-lg bg-[#1A1F5E]/10 mb-3">
                <Icon className="w-6 h-6 text-[#1A1F5E]" />
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

      {/* Mentors List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredMentors.map(mentor => (
          <div key={mentor.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
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
                      onClick={() => handleEdit(mentor)}
                      className="p-2 text-[#0072CE] hover:bg-[#1A1F5E]/5 rounded-lg transition-colors"
                      title="Edit mentor"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(mentor.id)}
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
                    <UserCog className="w-4 h-4" />
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

        {filteredMentors.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <UserCog className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {searchTerm ? 'No mentors found matching your search' : 'No mentors yet. Click "Add New Mentor" to get started!'}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Edit Mentor' : 'Add New Mentor'}
              </h3>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                  placeholder="Dr. Emily Rodriguez"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                  placeholder="email@deiafrica.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                  placeholder="+27 11 555 0101"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Photo URL</label>
                <input
                  type="url"
                  value={formData.photo}
                  onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                  placeholder="https://example.com/photo.jpg (optional)"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Expertise (comma-separated)</label>
                <input
                  type="text"
                  value={formData.expertise}
                  onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                  placeholder="Leadership, Strategy, Career Development"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Bio *</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                  rows={4}
                  placeholder="Brief professional background and expertise..."
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={resetForm}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#0072CE] to-[#1A1F5E] hover:opacity-90 text-white py-3 rounded-lg font-bold shadow-lg transition-all"
              >
                <Save className="w-5 h-5" />
                {editingId ? 'Update Mentor' : 'Add Mentor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMentors;

