import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Edit, Trash2, Save, X, Search, Users as UsersIcon } from 'lucide-react';
import { getData, setData } from '../../services/dataStore';
import { logAuditAction } from '../../services/auditLogger';

interface CollabOpportunity {
  id: string;
  title: string;
  industry: string;
  sector: string;
  status: 'open' | 'in progress' | 'closed';
  priority: 'high priority' | 'medium priority' | 'low priority';
  budgetRange: string;
  description: string;
  contactPerson: string;
  contactImage: string;
  deadline: string;
  interested: number;
  regions: string[];
}

interface CollabGroup {
  id: string;
  name: string;
  description: string;
  members: number;
  type: 'project' | 'knowledge' | 'regional';
  status: 'active' | 'inactive';
}

const AdminCollaboration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'opportunities' | 'groups'>('opportunities');
  const [opportunities, setOpportunities] = useState<CollabOpportunity[]>([]);
  const [groups, setGroups] = useState<CollabGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [oppForm, setOppForm] = useState({
    title: '',
    industry: '',
    sector: '',
    status: 'open' as 'open' | 'in progress' | 'closed',
    priority: 'medium priority' as 'high priority' | 'medium priority' | 'low priority',
    budgetRange: '',
    description: '',
    contactPerson: '',
    contactImage: '',
    deadline: '',
    regions: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedOpps = getData('app_collab_opportunities', [
      {
        id: '1',
        title: 'Regional Banking Expansion - West Africa',
        industry: 'Financial Services',
        sector: 'Banking',
        status: 'open' as const,
        priority: 'high priority' as const,
        budgetRange: '$500K - $1M',
        description: 'Leading Nigerian bank seeking expertise for multi-country expansion into Ghana, Côte d\'Ivoire, and Senegal.',
        contactPerson: 'Amara Okafor',
        contactImage: 'https://randomuser.me/api/portraits/women/32.jpg',
        deadline: '2024-03-15',
        interested: 8,
        regions: ['Nigeria', 'Ghana', 'Côte d\'Ivoire', 'Senegal']
      },
      {
        id: '2',
        title: 'ESG Compliance for Mining Operations',
        industry: 'Mining',
        sector: 'Natural Resources',
        status: 'open' as const,
        priority: 'high priority' as const,
        budgetRange: '$750K - $1.5M',
        description: 'Large mining conglomerate needs comprehensive ESG audit and sustainability roadmap.',
        contactPerson: 'Thabo Mthembu',
        contactImage: 'https://randomuser.me/api/portraits/men/45.jpg',
        deadline: '2024-04-01',
        interested: 12,
        regions: ['South Africa', 'Botswana', 'Zambia', 'Zimbabwe']
      }
    ]) as CollabOpportunity[];
    
    const storedGroups = getData('app_collab_groups', []) as CollabGroup[];
    
    setOpportunities(storedOpps);
    setGroups(storedGroups);
  };

  const handleOppSubmit = () => {
    if (!oppForm.title || !oppForm.industry) {
      alert('Please fill in title and industry');
      return;
    }

    if (editingId) {
      const updated = opportunities.map(o =>
        o.id === editingId ? {
          ...o,
          title: oppForm.title,
          industry: oppForm.industry,
          sector: oppForm.sector,
          status: oppForm.status,
          priority: oppForm.priority,
          budgetRange: oppForm.budgetRange,
          description: oppForm.description,
          contactPerson: oppForm.contactPerson,
          contactImage: oppForm.contactImage,
          deadline: oppForm.deadline,
          regions: oppForm.regions.split(',').map(r => r.trim())
        } : o
      );
      setOpportunities(updated);
      setData('app_collab_opportunities', updated);
      logAuditAction('UPDATED', 'Collaboration Opportunity', oppForm.title);
    } else {
      const newOpp: CollabOpportunity = {
        id: `collab-opp-${Date.now()}`,
        title: oppForm.title,
        industry: oppForm.industry,
        sector: oppForm.sector,
        status: oppForm.status,
        priority: oppForm.priority,
        budgetRange: oppForm.budgetRange,
        description: oppForm.description,
        contactPerson: oppForm.contactPerson,
        contactImage: oppForm.contactImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(oppForm.contactPerson)}`,
        deadline: oppForm.deadline,
        interested: 0,
        regions: oppForm.regions.split(',').map(r => r.trim())
      };
      const updated = [...opportunities, newOpp];
      setOpportunities(updated);
      setData('app_collab_opportunities', updated);
      logAuditAction('CREATED', 'Collaboration Opportunity', oppForm.title);
    }
    resetModal();
  };

  const handleDeleteOpp = (id: string) => {
    if (confirm('Delete this collaboration opportunity?')) {
      const opp = opportunities.find(o => o.id === id);
      const updated = opportunities.filter(o => o.id !== id);
      setOpportunities(updated);
      setData('app_collab_opportunities', updated);
      logAuditAction('DELETED', 'Collaboration Opportunity', opp?.title || id);
    }
  };

  const toggleStatus = (id: string) => {
    const updated = opportunities.map(o =>
      o.id === id ? { ...o, status: o.status === 'open' ? 'closed' as const : 'open' as const } : o
    );
    setOpportunities(updated);
    setData('app_collab_opportunities', updated);
  };

  const resetModal = () => {
    setShowModal(false);
    setEditingId(null);
    setOppForm({ 
      title: '', industry: '', sector: '', status: 'open', priority: 'medium priority', 
      budgetRange: '', description: '', contactPerson: '', contactImage: '', deadline: '', regions: '' 
    });
  };

  const filteredOpps = opportunities.filter(o =>
    o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Collaboration Hub</h1>
          <p className="text-gray-600 mt-1">Manage collaboration opportunities and groups</p>
        </div>
        {activeTab === 'opportunities' && (
          <button
            onClick={() => { resetModal(); setShowModal(true); }}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Opportunity
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="inline-flex p-3 rounded-lg bg-blue-100 mb-3">
            <Briefcase className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-gray-600 text-sm">Open Opportunities</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {opportunities.filter(o => o.status === 'open').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="inline-flex p-3 rounded-lg bg-green-100 mb-3">
            <UsersIcon className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-gray-600 text-sm">Total Interest</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {opportunities.reduce((sum, o) => sum + o.interested, 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="inline-flex p-3 rounded-lg bg-blue-100 mb-3">
            <UsersIcon className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-gray-600 text-sm">Active Groups</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{groups.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="inline-flex p-3 rounded-lg bg-orange-100 mb-3">
            <Briefcase className="w-6 h-6 text-orange-600" />
          </div>
          <p className="text-gray-600 text-sm">In Progress</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {opportunities.filter(o => o.status === 'in progress').length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b border-gray-200 p-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('opportunities')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'opportunities' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Briefcase className="w-5 h-5" />
              Opportunities
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'groups' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <UsersIcon className="w-5 h-5" />
              Groups
            </button>
          </div>
        </div>

        <div className="p-4">
          {/* Search */}
          <div className="mb-4">
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

          {activeTab === 'opportunities' && (
            <div className="space-y-4">
              {filteredOpps.map(opp => (
                <div key={opp.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900 text-lg">{opp.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          opp.status === 'open' ? 'bg-green-100 text-green-700' :
                          opp.status === 'in progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {opp.status.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          opp.priority === 'high priority' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {opp.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{opp.industry} • {opp.sector}</p>
                      <p className="text-sm text-gray-600 mb-2"><strong>Budget:</strong> {opp.budgetRange}</p>
                      <p className="text-gray-700 mb-3">{opp.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span><strong>Contact:</strong> {opp.contactPerson}</span>
                        <span><strong>Deadline:</strong> {opp.deadline}</span>
                        <span><strong>{opp.interested}</strong> interested</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {opp.regions.map((region, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            {region}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleStatus(opp.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Toggle status"
                      >
                        {opp.status === 'open' ? '✓' : '○'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(opp.id);
                          setOppForm({
                            title: opp.title,
                            industry: opp.industry,
                            sector: opp.sector,
                            status: opp.status,
                            priority: opp.priority,
                            budgetRange: opp.budgetRange,
                            description: opp.description,
                            contactPerson: opp.contactPerson,
                            contactImage: opp.contactImage,
                            deadline: opp.deadline,
                            regions: opp.regions.join(', ')
                          });
                          setShowModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteOpp(opp.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredOpps.length === 0 && (
                <div className="text-center py-12 text-gray-500">No opportunities found</div>
              )}
            </div>
          )}

          {activeTab === 'groups' && (
            <div className="text-center py-12 text-gray-500">
              Group management coming soon
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">{editingId ? 'Edit' : 'Add'} Collaboration Opportunity</h3>
              <button onClick={resetModal}><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
                <input type="text" value={oppForm.title} onChange={(e) => setOppForm({ ...oppForm, title: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Industry *</label>
                  <input type="text" value={oppForm.industry} onChange={(e) => setOppForm({ ...oppForm, industry: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Sector</label>
                  <input type="text" value={oppForm.sector} onChange={(e) => setOppForm({ ...oppForm, sector: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                  <select value={oppForm.status} onChange={(e) => setOppForm({ ...oppForm, status: e.target.value as any })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="open">Open</option>
                    <option value="in progress">In Progress</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Priority</label>
                  <select value={oppForm.priority} onChange={(e) => setOppForm({ ...oppForm, priority: e.target.value as any })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="high priority">High Priority</option>
                    <option value="medium priority">Medium Priority</option>
                    <option value="low priority">Low Priority</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Deadline</label>
                  <input type="date" value={oppForm.deadline} onChange={(e) => setOppForm({ ...oppForm, deadline: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Budget Range</label>
                <input type="text" value={oppForm.budgetRange} onChange={(e) => setOppForm({ ...oppForm, budgetRange: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="$500K - $1M" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea value={oppForm.description} onChange={(e) => setOppForm({ ...oppForm, description: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Contact Person</label>
                  <input type="text" value={oppForm.contactPerson} onChange={(e) => setOppForm({ ...oppForm, contactPerson: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Contact Image URL</label>
                  <input type="url" value={oppForm.contactImage} onChange={(e) => setOppForm({ ...oppForm, contactImage: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Regions (comma-separated)</label>
                <input type="text" value={oppForm.regions} onChange={(e) => setOppForm({ ...oppForm, regions: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Nigeria, Ghana, Kenya" />
              </div>
              <div className="flex gap-4 mt-6">
                <button onClick={resetModal} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-bold">Cancel</button>
                <button onClick={handleOppSubmit} className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-bold"><Save className="w-5 h-5 inline mr-2" />{editingId ? 'Update' : 'Add'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCollaboration;


