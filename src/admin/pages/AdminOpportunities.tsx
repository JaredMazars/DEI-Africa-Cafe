import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Edit, Trash2, Save, X, Search } from 'lucide-react';
import { getData, setData, STORAGE_KEYS } from '../../services/dataStore';
import { logAuditAction } from '../../services/auditLogger';

interface Opportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Job' | 'Fellowship' | 'Event';
  description: string;
  requirements: string;
  deadline: string;
  postedDate: string;
  status: 'active' | 'closed';
}

const AdminOpportunities: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Job' as 'Job' | 'Fellowship' | 'Event',
    description: '',
    requirements: '',
    deadline: '',
    status: 'active' as 'active' | 'closed'
  });

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = () => {
    const stored = getData(STORAGE_KEYS.OPPORTUNITIES, [
      {
        id: '1',
        title: 'Senior Software Engineer',
        company: 'Forvis Mazars',
        location: 'Lagos, Nigeria',
        type: 'Job' as 'Job',
        description: 'We are seeking a talented software engineer...',
        requirements: 'Bachelor degree in Computer Science, 5+ years experience',
        deadline: '2024-04-30',
        postedDate: '2024-01-15',
        status: 'active' as 'active'
      }
    ]) as Opportunity[];
    setOpportunities(stored);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.company) {
      alert('Please fill in title and company');
      return;
    }

    if (editingId) {
      const updated = opportunities.map(o =>
        o.id === editingId ? { ...o, ...formData } : o
      );
      setOpportunities(updated);
      setData(STORAGE_KEYS.OPPORTUNITIES, updated);
      logAuditAction('UPDATED', 'Opportunity', formData.title);
    } else {
      const newOpp: Opportunity = {
        id: Date.now().toString(),
        ...formData,
        postedDate: new Date().toISOString().split('T')[0]
      };
      const updated = [...opportunities, newOpp];
      setOpportunities(updated);
      setData(STORAGE_KEYS.OPPORTUNITIES, updated);
      logAuditAction('CREATED', 'Opportunity', formData.title);
    }
    resetModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this opportunity?')) {
      const opp = opportunities.find(o => o.id === id);
      const updated = opportunities.filter(o => o.id !== id);
      setOpportunities(updated);
      setData(STORAGE_KEYS.OPPORTUNITIES, updated);
      logAuditAction('DELETED', 'Opportunity', opp?.title || id);
    }
  };

  const toggleStatus = (id: string) => {
    const updated = opportunities.map(o =>
      o.id === id ? { ...o, status: o.status === 'active' ? 'closed' as const : 'active' as const } : o
    );
    setOpportunities(updated);
    setData(STORAGE_KEYS.OPPORTUNITIES, updated);
    const opp = opportunities.find(o => o.id === id);
    logAuditAction('STATUS_CHANGED', 'Opportunity', `${opp?.title} - ${updated.find(o => o.id === id)?.status}`);
  };

  const resetModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ title: '', company: '', location: '', type: 'Job', description: '', requirements: '', deadline: '', status: 'active' });
  };

  const filtered = opportunities.filter(o =>
    o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Opportunities</h1>
          <p className="text-gray-600 mt-1">Manage jobs, fellowships, and events</p>
        </div>
        <button
          onClick={() => { resetModal(); setShowModal(true); }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Opportunity
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['Job', 'Fellowship', 'Event'].map(type => (
          <div key={type} className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="inline-flex p-3 rounded-lg bg-orange-100 mb-3">
              <Briefcase className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-gray-600 text-sm">{type}s</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {opportunities.filter(o => o.type === type).length}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search opportunities..."
            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map(opp => (
          <div key={opp.id} className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-2">
                  <h3 className="font-bold text-gray-900 text-lg">{opp.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${opp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {opp.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{opp.company} • {opp.location}</p>
                <p className="text-sm text-gray-700 mb-3">{opp.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">{opp.type}</span>
                  <span>Deadline: {opp.deadline}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleStatus(opp.id)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                  title="Toggle status"
                >
                  {opp.status === 'active' ? '✓' : '○'}
                </button>
                <button
                  onClick={() => {
                    setEditingId(opp.id);
                    setFormData(opp);
                    setShowModal(true);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(opp.id)}
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
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No opportunities found</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">{editingId ? 'Edit' : 'Add'} Opportunity</h3>
              <button onClick={resetModal}><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Company *</label>
                  <input type="text" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                  <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="Job">Job</option>
                    <option value="Fellowship">Fellowship</option>
                    <option value="Event">Event</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Deadline</label>
                  <input type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Requirements</label>
                <textarea value={formData.requirements} onChange={(e) => setFormData({ ...formData, requirements: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={3} />
              </div>
              <div className="flex gap-4 mt-6">
                <button onClick={resetModal} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-bold">Cancel</button>
                <button onClick={handleSubmit} className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-bold"><Save className="w-5 h-5 inline mr-2" />{editingId ? 'Update' : 'Add'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOpportunities;

