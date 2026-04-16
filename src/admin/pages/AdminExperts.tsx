import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Save, X, Search, Video, MessageCircle } from 'lucide-react';
import { getData, setData, STORAGE_KEYS } from '../../services/dataStore';
import { logAuditAction } from '../../services/auditLogger';

interface Expert {
  id: string;
  name: string;
  title: string;
  company: string;
  expertise: string[];
  bio: string;
  image: string;
  availability: string;
  languages: string[];
  verified: boolean;
}

interface Webinar {
  id: string;
  title: string;
  expertId: string;
  expertName: string;
  date: string;
  time: string;
  duration: number;
  description: string;
  registrationLink: string;
  maxParticipants: number;
  registered: number;
}

interface Question {
  id: string;
  userId: string;
  userName: string;
  question: string;
  category: string;
  date: string;
  status: 'pending' | 'answered' | 'archived';
  answer?: string;
  answeredBy?: string;
  answeredDate?: string;
}

const AdminExperts: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'experts' | 'webinars' | 'questions'>('experts');
  const [experts, setExperts] = useState<Expert[]>([]);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expertForm, setExpertForm] = useState({
    name: '',
    title: '',
    company: '',
    expertise: '',
    bio: '',
    image: '',
    availability: 'Flexible',
    languages: 'English'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedExperts = getData('app_experts', []) as Expert[];
    const storedWebinars = getData('app_webinars', []) as Webinar[];
    const storedQuestions = getData('app_expert_questions', []) as Question[];
    setExperts(storedExperts);
    setWebinars(storedWebinars);
    setQuestions(storedQuestions);
  };

  const handleExpertSubmit = () => {
    if (!expertForm.name || !expertForm.title) {
      alert('Please fill in name and title');
      return;
    }

    if (editingId) {
      const updated = experts.map(e =>
        e.id === editingId ? {
          ...e,
          name: expertForm.name,
          title: expertForm.title,
          company: expertForm.company,
          expertise: expertForm.expertise.split(',').map(x => x.trim()),
          bio: expertForm.bio,
          image: expertForm.image || e.image,
          availability: expertForm.availability,
          languages: expertForm.languages.split(',').map(x => x.trim())
        } : e
      );
      setExperts(updated);
      setData('app_experts', updated);
      logAuditAction('UPDATED', 'Expert', expertForm.name);
    } else {
      const newExpert: Expert = {
        id: `expert-${Date.now()}`,
        name: expertForm.name,
        title: expertForm.title,
        company: expertForm.company,
        expertise: expertForm.expertise.split(',').map(x => x.trim()),
        bio: expertForm.bio,
        image: expertForm.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(expertForm.name)}`,
        availability: expertForm.availability,
        languages: expertForm.languages.split(',').map(x => x.trim()),
        verified: true
      };
      const updated = [...experts, newExpert];
      setExperts(updated);
      setData('app_experts', updated);
      logAuditAction('CREATED', 'Expert', expertForm.name);
    }
    resetModal();
  };

  const handleDeleteExpert = (id: string) => {
    if (confirm('Delete this expert?')) {
      const expert = experts.find(e => e.id === id);
      const updated = experts.filter(e => e.id !== id);
      setExperts(updated);
      setData('app_experts', updated);
      logAuditAction('DELETED', 'Expert', expert?.name || id);
    }
  };

  const handleAnswerQuestion = (id: string, answer: string) => {
    const updated = questions.map(q =>
      q.id === id ? {
        ...q,
        status: 'answered' as const,
        answer,
        answeredBy: localStorage.getItem('adminUser') || 'Admin',
        answeredDate: new Date().toISOString()
      } : q
    );
    setQuestions(updated);
    setData('app_expert_questions', updated);
    logAuditAction('ANSWERED', 'Expert Question', questions.find(q => q.id === id)?.question || id);
  };

  const resetModal = () => {
    setShowModal(false);
    setEditingId(null);
    setExpertForm({ name: '', title: '', company: '', expertise: '', bio: '', image: '', availability: 'Flexible', languages: 'English' });
  };

  const filteredExperts = experts.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expert Directory</h1>
          <p className="text-gray-600 mt-1">Manage experts, webinars, and Q&A</p>
        </div>
        {activeTab === 'experts' && (
          <button
            onClick={() => { resetModal(); setShowModal(true); }}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Expert
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="inline-flex p-3 rounded-lg bg-blue-100 mb-3">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-gray-600 text-sm">Total Experts</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{experts.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="inline-flex p-3 rounded-lg bg-green-100 mb-3">
            <Video className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-gray-600 text-sm">Webinars</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{webinars.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="inline-flex p-3 rounded-lg bg-blue-100 mb-3">
            <MessageCircle className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-gray-600 text-sm">Questions</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{questions.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="inline-flex p-3 rounded-lg bg-yellow-100 mb-3">
            <MessageCircle className="w-6 h-6 text-yellow-600" />
          </div>
          <p className="text-gray-600 text-sm">Pending</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {questions.filter(q => q.status === 'pending').length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b border-gray-200 p-4">
          <div className="flex gap-4">
            {[
              { id: 'experts', label: 'Experts', icon: Users },
              { id: 'webinars', label: 'Webinars', icon: Video },
              { id: 'questions', label: 'Q&A', icon: MessageCircle }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
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
                placeholder={`Search ${activeTab}...`}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {activeTab === 'experts' && (
            <div className="space-y-4">
              {filteredExperts.map(expert => (
                <div key={expert.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    <img src={expert.image} alt={expert.name} className="w-20 h-20 rounded-full object-cover" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900">{expert.name}</h3>
                          <p className="text-sm text-gray-600">{expert.title} • {expert.company}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {expert.expertise.map((skill, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingId(expert.id);
                              setExpertForm({
                                name: expert.name,
                                title: expert.title,
                                company: expert.company,
                                expertise: expert.expertise.join(', '),
                                bio: expert.bio,
                                image: expert.image,
                                availability: expert.availability,
                                languages: expert.languages.join(', ')
                              });
                              setShowModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteExpert(expert.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredExperts.length === 0 && (
                <div className="text-center py-12 text-gray-500">No experts found</div>
              )}
            </div>
          )}

          {activeTab === 'webinars' && (
            <div className="text-center py-12 text-gray-500">
              Webinar management coming soon
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="space-y-4">
              {questions.map(q => (
                <div key={q.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{q.userName}</p>
                      <p className="text-sm text-gray-600">{new Date(q.date).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      q.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      q.status === 'answered' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {q.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{q.question}</p>
                  {q.answer && (
                    <div className="bg-green-50 border border-green-200 rounded p-3 mt-2">
                      <p className="text-sm font-semibold text-green-900">Answer:</p>
                      <p className="text-sm text-gray-700">{q.answer}</p>
                    </div>
                  )}
                  {q.status === 'pending' && (
                    <button
                      onClick={() => {
                        const answer = prompt('Enter your answer:');
                        if (answer) handleAnswerQuestion(q.id, answer);
                      }}
                      className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                    >
                      Answer Question
                    </button>
                  )}
                </div>
              ))}
              {questions.length === 0 && (
                <div className="text-center py-12 text-gray-500">No questions yet</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">{editingId ? 'Edit' : 'Add'} Expert</h3>
              <button onClick={resetModal}><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Name *</label>
                  <input type="text" value={expertForm.name} onChange={(e) => setExpertForm({ ...expertForm, name: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
                  <input type="text" value={expertForm.title} onChange={(e) => setExpertForm({ ...expertForm, title: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Company</label>
                <input type="text" value={expertForm.company} onChange={(e) => setExpertForm({ ...expertForm, company: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Expertise (comma-separated)</label>
                <input type="text" value={expertForm.expertise} onChange={(e) => setExpertForm({ ...expertForm, expertise: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="AI, Machine Learning, Data Science" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Bio</label>
                <textarea value={expertForm.bio} onChange={(e) => setExpertForm({ ...expertForm, bio: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Availability</label>
                  <input type="text" value={expertForm.availability} onChange={(e) => setExpertForm({ ...expertForm, availability: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Flexible, Weekends, etc." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Languages</label>
                  <input type="text" value={expertForm.languages} onChange={(e) => setExpertForm({ ...expertForm, languages: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="English, French" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Image URL</label>
                <input type="url" value={expertForm.image} onChange={(e) => setExpertForm({ ...expertForm, image: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-4 mt-6">
                <button onClick={resetModal} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-bold">Cancel</button>
                <button onClick={handleExpertSubmit} className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-bold"><Save className="w-5 h-5 inline mr-2" />{editingId ? 'Update' : 'Add'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminExperts;


