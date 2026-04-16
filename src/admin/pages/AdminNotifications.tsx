import React, { useState, useEffect } from 'react';
import { Bell, Plus, Edit, Trash2, Save, X, Search, Send } from 'lucide-react';
import { getData, setData, STORAGE_KEYS } from '../../services/dataStore';
import { logAuditAction } from '../../services/auditLogger';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  targetAudience: 'all' | 'mentors' | 'mentees';
  createdDate: string;
  status: 'draft' | 'published';
}

const AdminNotifications: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'error',
    targetAudience: 'all' as 'all' | 'mentors' | 'mentees',
    status: 'draft' as 'draft' | 'published'
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = () => {
    const stored = getData(STORAGE_KEYS.ANNOUNCEMENTS, [
      {
        id: '1',
        title: 'Welcome to DEI Africa Café',
        message: 'We are excited to have you join our community!',
        type: 'info',
        targetAudience: 'all',
        createdDate: '2024-01-15',
        status: 'published'
      }
    ]);
    setAnnouncements(stored);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.message) {
      alert('Please fill in title and message');
      return;
    }

    if (editingId) {
      const updated = announcements.map(a =>
        a.id === editingId ? { ...a, ...formData } : a
      );
      setAnnouncements(updated);
      setStore('admin_announcements', updated);
      logAuditAction('UPDATED', 'Announcement', formData.title);
    } else {
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        ...formData,
        createdDate: new Date().toISOString().split('T')[0]
      };
      const updated = [...announcements, newAnnouncement];
      setAnnouncements(updated);
      setStore('admin_announcements', updated);
      logAuditAction('CREATED', 'Announcement', formData.title);
    }
    resetModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      const announcement = announcements.find(a => a.id === id);
      const updated = announcements.filter(a => a.id !== id);
      setAnnouncements(updated);
      setStore('admin_announcements', updated);
      logAuditAction('DELETED', 'Announcement', announcement?.title || id);
    }
  };

  const handlePublish = (id: string) => {
    const updated = announcements.map(a =>
      a.id === id ? { ...a, status: 'published' as const } : a
    );
    setAnnouncements(updated);
    setStore('admin_announcements', updated);
    const announcement = announcements.find(a => a.id === id);
    logAuditAction('PUBLISHED', 'Announcement', announcement?.title || id);
  };

  const resetModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ title: '', message: '', type: 'info', targetAudience: 'all', status: 'draft' });
  };

  const filtered = announcements.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600 mt-1">Create and manage platform announcements</p>
        </div>
        <button
          onClick={() => { resetModal(); setShowModal(true); }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          New Announcement
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="inline-flex p-3 rounded-lg bg-blue-100 mb-3">
            <Bell className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-gray-600 text-sm">Total Announcements</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{announcements.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="inline-flex p-3 rounded-lg bg-green-100 mb-3">
            <Send className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-gray-600 text-sm">Published</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {announcements.filter(a => a.status === 'published').length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search announcements..."
            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map(announcement => (
          <div key={announcement.id} className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex justify-between">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-2">
                  <h3 className="font-bold text-gray-900 text-lg">{announcement.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    announcement.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {announcement.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-3">{announcement.message}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className={`px-2 py-1 rounded ${
                    announcement.type === 'info' ? 'bg-blue-100 text-blue-700' :
                    announcement.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                    announcement.type === 'success' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {announcement.type}
                  </span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {announcement.targetAudience}
                  </span>
                  <span>Created: {announcement.createdDate}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {announcement.status === 'draft' && (
                  <button
                    onClick={() => handlePublish(announcement.id)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                    title="Publish"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditingId(announcement.id);
                    setFormData(announcement);
                    setShowModal(true);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(announcement.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No announcements found</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">{editingId ? 'Edit' : 'New'} Announcement</h3>
              <button onClick={resetModal}><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Message *</label>
                <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="success">Success</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Target Audience</label>
                  <select value={formData.targetAudience} onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="all">All Users</option>
                    <option value="mentors">Mentors Only</option>
                    <option value="mentees">Mentees Only</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button onClick={resetModal} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-bold">Cancel</button>
                <button onClick={handleSubmit} className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-bold"><Save className="w-5 h-5 inline mr-2" />{editingId ? 'Update' : 'Create'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;

