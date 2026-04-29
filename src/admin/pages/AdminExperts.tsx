import React, { useState, useEffect, useCallback } from 'react';
import { Users, CheckCircle, XCircle, Clock, Search, RefreshCw, ShieldCheck, ShieldOff, MessageCircle } from 'lucide-react';
import { adminAPI } from '../../services/api';

interface DBExpert {
  id: string;
  user_id: string;
  name: string;
  bio: string;
  location: string;
  avatar_url: string | null;
  is_verified: boolean | number;
  is_rejected: boolean | number;
  rejection_note: string | null;
  is_available: boolean | number;
  experience_years: number;
  created_at: string;
  updated_at: string;
  email: string;
  user_name: string;
  expertise_list: string | null;
}

const AdminExperts: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'approved' | 'pending' | 'rejected' | 'all'>('pending');
  const [experts, setExperts] = useState<DBExpert[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const loadExperts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminAPI.getExperts();
      if (res?.success) {
        setExperts(res.data.experts || []);
      } else {
        setError('Failed to load experts');
      }
    } catch (e) {
      setError('Failed to load experts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadExperts(); }, [loadExperts]);

  const handleVerify = async (id: string, approve: boolean, note?: string) => {
    setActionLoading(id);
    try {
      const body: Record<string, unknown> = { is_verified: approve };
      if (!approve && note) body.rejection_note = note;
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const res = await fetch(`/api/admin/experts/${id}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      }).then(r => r.json());
      if (res?.success) {
        setSuccessMsg(approve ? 'Expert approved — they will now appear in the directory.' : 'Expert rejected.');
        setTimeout(() => setSuccessMsg(null), 4000);
        setExperts(prev => prev.map(e => e.id === id
          ? { ...e, is_verified: approve ? 1 : 0, is_rejected: approve ? 0 : 1, rejection_note: note || null }
          : e));
      }
    } catch {
      setError('Action failed. Please try again.');
      setTimeout(() => setError(null), 4000);
    } finally {
      setActionLoading(null);
      setRejectTarget(null);
      setRejectNote('');
    }
  };

  const approved = experts.filter(e => Number(e.is_verified) === 1);
  const rejected = experts.filter(e => Number(e.is_rejected) === 1 && Number(e.is_verified) === 0);
  const pending  = experts.filter(e => Number(e.is_verified) === 0 && Number(e.is_rejected) === 0);

  const displayList = (activeTab === 'pending' ? pending : activeTab === 'approved' ? approved : activeTab === 'rejected' ? rejected : experts)
    .filter(e =>
      !searchTerm ||
      (e.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.expertise_list || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-1 w-10 bg-[#E83E2D] rounded-full mb-3" />
          <h1 className="text-3xl font-bold text-[#1A1F5E]">Expert Approvals</h1>
          <p className="text-[#8C8C8C] mt-1 text-base leading-relaxed">
            Review and approve expert applications. Only approved experts appear in the directory.
          </p>
        </div>
        <button
          onClick={loadExperts}
          className="flex items-center gap-2 px-5 py-2.5 border-2 border-[#1A1F5E] text-[#1A1F5E] font-semibold rounded-xl hover:bg-[#1A1F5E] hover:text-white transition-all duration-200"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 px-5 py-4 rounded-2xl">
          <CheckCircle className="w-5 h-5 shrink-0" />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-[#E83E2D]/10 border border-[#E83E2D]/30 text-[#E83E2D] px-5 py-4 rounded-2xl">
          <XCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-[#E5E7EB]">
          <div className="inline-flex p-3 rounded-xl bg-[#1A1F5E]/10 mb-3">
            <Users className="w-6 h-6 text-[#1A1F5E]" />
          </div>
          <p className="text-sm text-[#8C8C8C]">Total Experts</p>
          <p className="text-3xl font-bold text-[#1A1F5E] mt-1">{experts.length}</p>
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-[#E5E7EB]">
          <div className="inline-flex p-3 rounded-xl bg-green-100 mb-3">
            <ShieldCheck className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-sm text-[#8C8C8C]">Approved</p>
          <p className="text-3xl font-bold text-[#1A1F5E] mt-1">{approved.length}</p>
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-6 border-t-4 border-t-[#E83E2D] border border-[#E5E7EB]">
          <div className="inline-flex p-3 rounded-xl bg-yellow-100 mb-3">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <p className="text-sm text-[#8C8C8C]">Pending Approval</p>
          <p className="text-3xl font-bold text-[#E83E2D] mt-1">{pending.length}</p>
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-[#E5E7EB]">
          <div className="inline-flex p-3 rounded-xl bg-[#E83E2D]/10 mb-3">
            <ShieldOff className="w-6 h-6 text-[#E83E2D]" />
          </div>
          <p className="text-sm text-[#8C8C8C]">Rejected</p>
          <p className="text-3xl font-bold text-[#E83E2D] mt-1">{rejected.length}</p>
        </div>
      </div>

      {/* Tabs + Table */}
      <div className="bg-white rounded-3xl shadow-xl border border-[#E5E7EB] overflow-hidden">
        {/* Tab bar */}
        <div className="border-b border-[#E5E7EB] px-6 pt-4 flex gap-3">
          {[
            { id: 'pending', label: 'Pending Approvals', count: pending.length, icon: Clock },
            { id: 'approved', label: 'Approved', count: approved.length, icon: ShieldCheck },
            { id: 'rejected', label: 'Rejected', count: rejected.length, icon: ShieldOff },
            { id: 'all', label: 'All Experts', count: experts.length, icon: Users },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-semibold text-sm transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'bg-[#1A1F5E]/5 text-[#1A1F5E] border-[#1A1F5E]'
                    : 'text-[#8C8C8C] border-transparent hover:text-[#1A1F5E] hover:bg-[#F4F4F4]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === tab.id ? 'bg-[#1A1F5E] text-white' : 'bg-[#F4F4F4] text-[#8C8C8C]'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8C8C8C]" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name, email or expertise..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-[#E5E7EB] text-[#333333] placeholder-[#8C8C8C] bg-white focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all duration-200"
            />
          </div>

          {/* List */}
          {loading ? (
            <div className="text-center py-16 text-[#8C8C8C]">
              <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-[#1A1F5E]" />
              Loading experts...
            </div>
          ) : displayList.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex p-4 rounded-2xl bg-[#F4F4F4] mb-4">
                {activeTab === 'pending'
                  ? <CheckCircle className="w-10 h-10 text-green-500" />
                  : <Users className="w-10 h-10 text-[#8C8C8C]" />}
              </div>
              <p className="text-[#333333] font-semibold text-lg">
                {activeTab === 'pending' ? 'No pending applications' : 'No experts found'}
              </p>
              <p className="text-[#8C8C8C] text-sm mt-1">
                {activeTab === 'pending' ? 'All applications have been reviewed.' : 'Try adjusting your search.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayList.map(expert => {
                const expertiseTags = expert.expertise_list
                  ? expert.expertise_list.split(',').map(s => s.trim()).filter(Boolean)
                  : [];
                const isApproved = Number(expert.is_verified) === 1;
                const isActioning = actionLoading === expert.id;

                return (
                  <div
                    key={expert.id}
                    className={`border rounded-2xl p-5 transition-shadow hover:shadow-md ${
                      isApproved
                        ? 'border-[#E5E7EB] bg-white'
                        : 'border-yellow-200 bg-yellow-50/40'
                    }`}
                  >
                    <div className="flex gap-4 items-start">
                      {/* Avatar */}
                      <img
                        src={expert.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name || 'E')}&background=1A1F5E&color=fff`}
                        alt={expert.name}
                        className="w-14 h-14 rounded-2xl object-cover shrink-0"
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-[#333333]">{expert.name || expert.user_name}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isApproved
                              ? 'bg-green-100 text-green-700'
                              : Number(expert.is_rejected) === 1
                              ? 'bg-[#E83E2D]/10 text-[#E83E2D]'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {isApproved ? 'Approved' : Number(expert.is_rejected) === 1 ? 'Rejected' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-sm text-[#8C8C8C] mb-1">{expert.email}</p>
                        {expert.bio && (
                          <p className="text-sm text-[#333333] leading-relaxed line-clamp-2 mb-2">{expert.bio}</p>
                        )}
                        {expertiseTags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {expertiseTags.map((tag, i) => (
                              <span key={i} className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#1A1F5E]/10 text-[#1A1F5E]">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-[#8C8C8C] mt-2">
                          Applied {new Date(expert.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col gap-2 shrink-0">
                        {!isApproved && (
                          <button
                            onClick={() => handleVerify(expert.id, true)}
                            disabled={isActioning}
                            className="flex items-center gap-1.5 px-4 py-2 bg-[#1A1F5E] text-white text-sm font-semibold rounded-xl hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            {isActioning ? 'Approving…' : 'Approve'}
                          </button>
                        )}
                        {!isApproved && Number(expert.is_rejected) !== 1 && (
                          <button
                            onClick={() => { setRejectTarget(expert.id); setRejectNote(''); }}
                            disabled={isActioning}
                            className="flex items-center gap-1.5 px-4 py-2 bg-transparent border-2 border-[#E83E2D] text-[#E83E2D] text-sm font-semibold rounded-xl hover:bg-[#E83E2D] hover:text-white active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ShieldOff className="w-4 h-4" />
                            Reject
                          </button>
                        )}
                        {Number(expert.is_rejected) === 1 && (
                          <button
                            onClick={() => handleVerify(expert.id, true)}
                            disabled={isActioning}
                            className="flex items-center gap-1.5 px-4 py-2 bg-[#1A1F5E] text-white text-sm font-semibold rounded-xl hover:opacity-90 active:scale-95 transition-all duration-200 disabled:opacity-50"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            Re-approve
                          </button>
                        )}
                        {isApproved && (
                          <button
                            onClick={() => handleVerify(expert.id, false)}
                            disabled={isActioning}
                            className="flex items-center gap-1.5 px-4 py-2 bg-transparent border-2 border-[#8C8C8C] text-[#8C8C8C] text-sm font-semibold rounded-xl hover:border-[#E83E2D] hover:text-[#E83E2D] active:scale-95 transition-all duration-200 disabled:opacity-50"
                          >
                            <ShieldOff className="w-4 h-4" />
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Rejection note modal */}
      {rejectTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-[#1A1F5E] mb-2">Reject Expert</h3>
            <p className="text-sm text-[#8C8C8C] mb-5">Optionally provide a reason that will be stored with the rejection.</p>
            <textarea
              rows={3}
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
              placeholder="Rejection reason (optional)…"
              className="w-full px-4 py-3 rounded-2xl border-2 border-[#E5E7EB] text-[#333333] placeholder-[#8C8C8C] focus:outline-none focus:border-[#E83E2D] focus:ring-2 focus:ring-[#E83E2D]/20 transition-all resize-none mb-5"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setRejectTarget(null); setRejectNote(''); }}
                className="flex-1 py-3 rounded-2xl border-2 border-[#E5E7EB] text-[#333333] font-semibold hover:bg-[#F4F4F4] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerify(rejectTarget, false, rejectNote || undefined)}
                disabled={!!actionLoading}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#E83E2D] to-[#c0321f] text-white font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <ShieldOff className="w-4 h-4" />
                {actionLoading ? 'Rejecting…' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminExperts;
