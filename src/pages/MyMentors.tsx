import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Target, Search, MapPin, ArrowRight, Loader, Clock } from 'lucide-react';
import { useSimpleAuth } from '../contexts/SimpleAuthContext';

interface ConnectionWithDetails {
  id: string;
  requester_id: string;
  expert_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  created_at: string;
  updated_at: string;
  mentor_name?: string;
  mentor_avatar?: string;
  mentor_location?: string;
  mentor_bio?: string;
  mentor_title?: string;
  mentor_user_id?: string;
}

const MyMentors: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useSimpleAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [connections, setConnections] = useState<ConnectionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        setConnections(all.filter(c => c.requester_id === currentUser?.id));
      } catch {
        setError('Could not load your mentors. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    if (currentUser?.id) fetchConnections();
  }, [currentUser?.id]);

  const filtered = connections.filter(c => {
    const name = (c.mentor_name || '').toLowerCase();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F4F4] via-white to-[#F4F4F4] pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <div className="h-1 w-12 bg-[#E83E2D] rounded-full mb-4" />
          <h1 className="text-4xl font-bold text-[#1A1F5E]">My Mentors</h1>
          <p className="text-[#8C8C8C] mt-2 text-base leading-relaxed">
            Manage your mentorship relationships and track your progress
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Active Mentors', value: accepted, icon: Users },
            { label: 'Pending Requests', value: pending, icon: Clock },
            { label: 'Total Connections', value: connections.length, icon: Target },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-gradient-to-br from-[#1A1F5E] to-[#0072CE] text-white rounded-3xl shadow-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm mb-1">{label}</p>
                  <p className="text-3xl font-bold">{value}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
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
              placeholder="Search mentors by name…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-[#E5E7EB] rounded-2xl text-[#333333] placeholder-[#8C8C8C] focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'accepted', 'pending', 'rejected'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-full font-semibold text-sm transition-all border-2 ${
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
            <span className="text-[#8C8C8C]">Loading your mentors…</span>
          </div>
        )}
        {error && (
          <div className="bg-[#E83E2D]/10 border border-[#E83E2D]/30 text-[#E83E2D] px-5 py-4 rounded-2xl mb-6">{error}</div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map(c => (
              <div key={c.id} className="bg-white rounded-3xl shadow-xl border border-[#E5E7EB] hover:shadow-2xl transition-all duration-300 overflow-hidden hover:scale-[1.01]">
                <div className="bg-gradient-to-r from-[#1A1F5E] to-[#0072CE] p-6 text-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-white/20 border-4 border-white/40 flex items-center justify-center text-2xl font-bold">
                        {(c.mentor_name || '?')[0]}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{c.mentor_name || 'Mentor'}</h3>
                        <p className="text-white/70 text-sm">{c.mentor_title || ''}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[c.status] || statusColors.rejected}`}>
                      {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                    </span>
                  </div>
                  {c.mentor_location && (
                    <div className="flex items-center gap-1 text-sm text-white/70">
                      <MapPin className="w-4 h-4" />
                      <span>{c.mentor_location}</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  {c.mentor_bio && (
                    <p className="text-sm text-[#8C8C8C] leading-relaxed mb-4 line-clamp-2">{c.mentor_bio}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-[#8C8C8C] mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>Connected {new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  {c.message && (
                    <div className="bg-[#F4F4F4] rounded-2xl p-3 mb-4">
                      <p className="text-xs text-[#8C8C8C] italic">"{c.message}"</p>
                    </div>
                  )}
                  <button
                    onClick={() => navigate('/mentors')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#0072CE] to-[#1A1F5E] text-white rounded-full font-semibold transition-all hover:opacity-90 hover:scale-[1.02] shadow-lg"
                  >
                    View on Mentor Discovery <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-[#1A1F5E]/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-[#1A1F5E]" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1F5E] mb-2">
              {searchQuery || filterStatus !== 'all' ? 'No mentors match your search' : 'No mentors yet'}
            </h3>
            <p className="text-[#8C8C8C] mb-6">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'Connect with a mentor to start your mentorship journey.'}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <button
                onClick={() => navigate('/mentors')}
                className="bg-gradient-to-r from-[#0072CE] to-[#1A1F5E] text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:opacity-90 hover:scale-105 transition-all"
              >
                Discover Mentors
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMentors;
