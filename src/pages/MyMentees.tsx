import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Target, Search, MapPin, Loader, Clock, MessageSquare, CheckCircle, XCircle, Activity } from 'lucide-react';
import { useSimpleAuth } from '../contexts/SimpleAuthContext';

interface ConnectionWithDetails {
  id: string;
  requester_id: string;
  expert_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  created_at: string;
  updated_at: string;
  mentee_name?: string;
  mentee_location?: string;
  mentee_bio?: string;
  mentor_user_id?: string;
}

const MyMentees: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useSimpleAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [connections, setConnections] = useState<ConnectionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/connections', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load connections');
        const data = await res.json();
        const all: ConnectionWithDetails[] = data.data?.connections || [];
        setConnections(all.filter(c => (c as any).mentor_user_id === currentUser?.id));
      } catch {
        setError('Could not load your mentees. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    if (currentUser?.id) fetchConnections();
  }, [currentUser?.id]);

  const updateConnectionStatus = async (connectionId: string, status: 'accepted' | 'rejected') => {
    setActionLoading(prev => ({ ...prev, [connectionId]: true }));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/connections/${connectionId}/status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      let data: any = {};
      try { data = await res.json(); } catch {}
      if (!res.ok) {
        showToast(data.message || `Failed to ${status === 'accepted' ? 'accept' : 'decline'} request (${res.status})`, 'error');
        return;
      }
      // Optimistic update confirmed by server
      setConnections(prev => prev.map(c => c.id === connectionId ? { ...c, status } : c));
      showToast(
        status === 'accepted' ? '✅ Mentee accepted! They can now message you.' : '❌ Request declined.',
        status === 'accepted' ? 'success' : 'error'
      );
    } catch (err: any) {
      showToast(err?.message || 'Network error — is the server running?', 'error');
    } finally {
      setActionLoading(prev => { const s = { ...prev }; delete s[connectionId]; return s; });
    }
  };

  const handleAccept = (id: string) => updateConnectionStatus(id, 'accepted');
  const handleReject = (id: string) => updateConnectionStatus(id, 'rejected');

  const filtered = connections.filter(c => {
    const name = (c.mentee_name || '').toLowerCase();
    const matchesSearch = name.includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const accepted = connections.filter(c => c.status === 'accepted').length;
  const pending  = connections.filter(c => c.status === 'pending').length;

  const statusColors: Record<string, string> = {
    accepted: 'bg-green-100 text-green-700',
    pending:  'bg-yellow-100 text-yellow-700',
    rejected: 'bg-[#8C8C8C]/10 text-[#8C8C8C]',
  };

  const ActionButtons = ({ connectionId }: { connectionId: string }) => {
    const busy = !!actionLoading[connectionId];
    return (
      <div className="grid grid-cols-2 gap-3">
        <button
          disabled={busy}
          onClick={() => handleReject(connectionId)}
          className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#E83E2D] text-[#E83E2D] -full font-semibold hover:bg-[#E83E2D] hover:text-white transition-all disabled:opacity-50"
        >
          {busy ? <Loader className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
          Decline
        </button>
        <button
          disabled={busy}
          onClick={() => handleAccept(connectionId)}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1A1F5E] text-white -full font-semibold hover:opacity-90 transition-all shadow-lg disabled:opacity-50"
        >
          {busy ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          Accept
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F4F4] via-white to-[#F4F4F4] pt-20 pb-12 px-4">

      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 -2xl shadow-2xl text-sm font-semibold transition-all ${
          toast.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-[#E83E2D]/10 border border-[#E83E2D]/30 text-[#E83E2D]'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {toast.msg}
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <div className="h-1 w-12 bg-[#E83E2D] -full mb-4" />
          <h1 className="text-4xl font-bold text-[#1A1F5E]">My Mentees</h1>
          <p className="text-[#8C8C8C] mt-2 text-base leading-relaxed">
            Guide and support your mentees on their professional journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Active Mentees', value: accepted, icon: Users },
            { label: 'Pending Requests', value: pending, icon: Clock },
            { label: 'Total Mentees', value: connections.length, icon: Target },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-[#1A1F5E] text-white -3xl shadow-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm mb-1">{label}</p>
                  <p className="text-3xl font-bold">{value}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 -2xl flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8C8C] w-5 h-5" />
            <input
              type="text"
              placeholder="Search mentees by name…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-[#E5E7EB] -2xl text-[#333333] placeholder-[#8C8C8C] focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'accepted', 'pending', 'rejected'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 -full font-semibold text-sm transition-all border-2 ${
                  filterStatus === status
                    ? 'bg-[#1A1F5E] text-white border-[#1A1F5E] shadow-lg'
                    : 'bg-white text-[#333333] border-[#E5E7EB] hover:border-[#1A1F5E]'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 text-[#1A1F5E] animate-spin mr-3" />
            <span className="text-[#8C8C8C]">Loading your mentees…</span>
          </div>
        )}
        {error && (
          <div className="bg-[#E83E2D]/10 border border-[#E83E2D]/30 text-[#E83E2D] px-5 py-4 -2xl mb-6">{error}</div>
        )}

        {/* Pending Requests — prominent section */}
        {!loading && !error && connections.filter(c => c.status === 'pending').length > 0 && filterStatus === 'all' && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-1 w-10 bg-[#E83E2D] -full" />
              <h2 className="text-2xl font-bold text-[#1A1F5E]">Pending Requests</h2>
              <span className="px-3 py-1 -full text-sm font-bold bg-[#E83E2D] text-white">
                {connections.filter(c => c.status === 'pending').length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {connections.filter(c => c.status === 'pending').map(c => (
                <div key={c.id} className="bg-white -3xl shadow-xl border-t-4 border-t-[#E83E2D] border border-[#E5E7EB] hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className="bg-[#1A1F5E] p-6 text-white">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 -full bg-white/20 border-4 border-white/40 flex items-center justify-center text-2xl font-bold">
                          {(c.mentee_name || '?')[0]}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{c.mentee_name || 'Mentee'}</h3>
                          {c.mentee_location && <p className="text-white/70 text-sm">{c.mentee_location}</p>}
                        </div>
                      </div>
                      <span className="px-3 py-1 -full text-xs font-semibold bg-yellow-100 text-yellow-700">Pending</span>
                    </div>
                  </div>
                  <div className="p-6">
                    {c.message && (
                      <div className="bg-[#F4F4F4] -2xl p-3 mb-4">
                        <p className="text-xs font-semibold text-[#8C8C8C] mb-1">Message from mentee:</p>
                        <p className="text-sm text-[#333333] italic">"{c.message}"</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-[#8C8C8C] mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>Requested {new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <ActionButtons connectionId={c.id} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && !error && filtered.filter(c => filterStatus !== 'all' || c.status !== 'pending').length > 0 && (
          <div>
            {filterStatus === 'all' && connections.some(c => c.status !== 'pending') && (
              <div className="flex items-center gap-3 mb-5">
                <div className="h-1 w-10 bg-[#1A1F5E] -full" />
                <h2 className="text-2xl font-bold text-[#1A1F5E]">Active Mentees</h2>
              </div>
            )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.filter(c => filterStatus !== 'all' || c.status !== 'pending').map(c => (
              <div key={c.id} className="bg-white -3xl shadow-xl border border-[#E5E7EB] hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="bg-[#1A1F5E] p-6 text-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 -full bg-white/20 border-4 border-white/40 flex items-center justify-center text-2xl font-bold">
                        {(c.mentee_name || '?')[0]}
                      </div>
                      <div>
                        <h3 className="text-xl text-white font-bold">{c.mentee_name || 'Mentee'}</h3>
                        {c.mentee_location && <p className="text-white/70 text-sm">{c.mentee_location}</p>}
                      </div>
                    </div>
                    <span className={`px-3 py-1 -full text-xs font-semibold ${statusColors[c.status] || statusColors.rejected}`}>
                      {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                    </span>
                  </div>
                  {c.mentee_location && (
                    <div className="flex items-center gap-1 text-sm text-white/70">
                      <MapPin className="w-4 h-4" />
                      <span>{c.mentee_location}</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  {c.mentee_bio && (
                    <p className="text-sm text-[#8C8C8C] leading-relaxed mb-4 line-clamp-2">{c.mentee_bio}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-[#8C8C8C] mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>Requested {new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  {c.message && (
                    <div className="bg-[#F4F4F4] -2xl p-3 mb-4">
                      <p className="text-xs text-[#8C8C8C] italic">"{c.message}"</p>
                    </div>
                  )}
                  {c.status === 'pending' ? (
                    <ActionButtons connectionId={c.id} />
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => navigate(`/messages?connectionId=${c.id}`)}
                        className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#1A1F5E] text-[#1A1F5E] -full font-semibold transition-all hover:bg-[#1A1F5E] hover:text-white"
                      >
                        <MessageSquare className="w-4 h-4" /> Message
                      </button>
                      <button
                        onClick={() => navigate(`/mentorship-session/${c.id}`)}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1A1F5E] text-white -full font-semibold transition-all hover:opacity-90 hover:scale-[1.02] shadow-lg"
                      >
                        <Activity className="w-4 h-4" /> Activities
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-[#1A1F5E]/10 -3xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-[#1A1F5E]" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1F5E] mb-2">
              {searchQuery || filterStatus !== 'all' ? 'No mentees match your search' : 'No mentees yet'}
            </h3>
            <p className="text-[#8C8C8C] mb-6">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'Mentees will appear here once they send you a connection request.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMentees;
