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
  Users
} from 'lucide-react';
import { getData, setData, STORAGE_KEYS } from '../../services/dataStore';
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

const AdminMentors: React.FC = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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

  const loadMentors = () => {
    const storedMentors = getData(STORAGE_KEYS.MENTORS, []) as Mentor[];
    // Convert app mentor format to admin format if needed
    const formattedMentors = storedMentors.map((m: any) => ({
      id: m.id,
      name: m.name,
      email: m.email || '',
      phone: m.phone || '',
      expertise: m.expertise || [],
      bio: m.bio || '',
      photo: m.image || m.photo || '',
      rating: m.rating || 0,
      totalMentees: m.totalMentees || 0,
      sessionsCompleted: m.sessionsCompleted || 0,
      joinedDate: m.joinedDate || new Date().toISOString().split('T')[0],
      status: m.status || 'active'
    }));
    setMentors(formattedMentors);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.bio) {
      alert('Please fill in all required fields (Name, Email, and Bio)');
      return;
    }

    if (editingId) {
      // Update
      const updatedMentors = mentors.map(m =>
        m.id === editingId
          ? {
              ...m,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              expertise: formData.expertise.split(',').map(e => e.trim()).filter(e => e),
              bio: formData.bio,
              photo: formData.photo || m.photo,
              image: formData.photo || m.photo // Keep both for compatibility
            }
          : m
      );
      setMentors(updatedMentors);
      setData(STORAGE_KEYS.MENTORS, updatedMentors);
      logAuditAction('UPDATED', 'Mentor', `${formData.name} (${formData.email})`);
    } else {
      // Create
      const photoUrl = formData.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&size=200`;
      const newMentor: any = {
        id: `mentor-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        expertise: formData.expertise.split(',').map(e => e.trim()).filter(e => e),
        bio: formData.bio,
        photo: photoUrl,
        image: photoUrl, // Keep both for compatibility
        rating: 0,
        totalMentees: 0,
        sessionsCompleted: 0,
        joinedDate: new Date().toISOString().split('T')[0],
        status: 'active',
        verified: true,
        role: 'Mentor',
        company: 'DEI Africa',
        location: 'Africa',
        availability: 'Flexible',
        languages: ['English']
      };
      const updatedMentors = [...mentors, newMentor];
      setMentors(updatedMentors);
      setData(STORAGE_KEYS.MENTORS, updatedMentors);
      logAuditAction('CREATED', 'Mentor', `${formData.name} (${formData.email})`);
    }

    resetForm();
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

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this mentor? This action cannot be undone.')) {
      const mentor = mentors.find(m => m.id === id);
      const updatedMentors = mentors.filter(m => m.id !== id);
      setMentors(updatedMentors);
      setData(STORAGE_KEYS.MENTORS, updatedMentors);
      logAuditAction('DELETED', 'Mentor', `${mentor?.name} (${mentor?.email})`);
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
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          Add New Mentor
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Mentors', value: mentors.length, icon: UserCog, color: 'blue' },
          { label: 'Active Mentors', value: mentors.filter(m => m.status === 'active').length, icon: Award, color: 'green' },
          { label: 'Total Sessions', value: mentors.reduce((acc, m) => acc + m.sessionsCompleted, 0), icon: UserCog, color: 'blue' },
          { label: 'Total Mentees', value: mentors.reduce((acc, m) => acc + m.totalMentees, 0), icon: Users, color: 'orange' }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
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
            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-24 h-24 rounded-xl object-cover border-4 border-blue-100"
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
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
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
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Dr. Emily Rodriguez"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@deiafrica.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+27 11 555 0101"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Photo URL</label>
                <input
                  type="url"
                  value={formData.photo}
                  onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/photo.jpg (optional)"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Expertise (comma-separated)</label>
                <input
                  type="text"
                  value={formData.expertise}
                  onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Leadership, Strategy, Career Development"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Bio *</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-700 text-white py-3 rounded-lg font-bold shadow-lg transition-all"
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

