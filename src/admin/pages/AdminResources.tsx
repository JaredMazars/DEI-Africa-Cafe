import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit, Trash2, Save, X, Search, Link as LinkIcon } from 'lucide-react';
import { getData, setData, STORAGE_KEYS } from '../../services/dataStore';
import { logAuditAction } from '../../services/auditLogger';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  url: string;
  addedDate: string;
}

const AdminResources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Document',
    category: '',
    url: ''
  });

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = () => {
    const stored = getData(STORAGE_KEYS.RESOURCES, [
      {
        id: '1',
        title: 'DEI Best Practices Guide',
        description: 'Comprehensive guide on diversity and inclusion practices',
        type: 'Document',
        category: 'DEI',
        url: 'https://example.com/dei-guide.pdf',
        addedDate: '2024-01-15'
      }
    ]);
    setResources(stored);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.url) {
      alert('Please fill in title and URL');
      return;
    }

    if (editingId) {
      const updated = resources.map(r =>
        r.id === editingId ? { ...r, ...formData } : r
      );
      setResources(updated);
      setStore('admin_resources', updated);
      logAuditAction('UPDATED', 'Resource', formData.title);
    } else {
      const newResource: Resource = {
        id: Date.now().toString(),
        ...formData,
        addedDate: new Date().toISOString().split('T')[0]
      };
      const updated = [...resources, newResource];
      setResources(updated);
      setStore('admin_resources', updated);
      logAuditAction('CREATED', 'Resource', formData.title);
    }
    resetModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this resource?')) {
      const resource = resources.find(r => r.id === id);
      const updated = resources.filter(r => r.id !== id);
      setResources(updated);
      setStore('admin_resources', updated);
      logAuditAction('DELETED', 'Resource', resource?.title || id);
    }
  };

  const resetModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ title: '', description: '', type: 'Document', category: '', url: '' });
  };

  const filtered = resources.filter(r =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resource Library</h1>
          <p className="text-gray-600 mt-1">Manage learning resources</p>
        </div>
        <button
          onClick={() => { resetModal(); setShowModal(true); }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Resource
        </button>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="inline-flex p-3 rounded-lg bg-green-100 mb-3">
          <BookOpen className="w-6 h-6 text-green-600" />
        </div>
        <p className="text-gray-600 text-sm">Total Resources</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{resources.length}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search resources..."
            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map(resource => (
          <div key={resource.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2">{resource.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">{resource.type}</span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">{resource.category}</span>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                    <LinkIcon className="w-3 h-3" />
                    View Resource
                  </a>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingId(resource.id);
                    setFormData({ title: resource.title, description: resource.description, type: resource.type, category: resource.category, url: resource.url });
                    setShowModal(true);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(resource.id)}
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
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No resources found</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">{editingId ? 'Edit' : 'Add'} Resource</h3>
              <button onClick={resetModal}><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                  <input type="text" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                  <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">URL *</label>
                <input type="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
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

export default AdminResources;

