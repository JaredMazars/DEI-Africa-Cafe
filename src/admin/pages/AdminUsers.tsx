import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, CheckCircle, XCircle, Trash2, RefreshCw, Mail, Calendar } from 'lucide-react';
import { adminAPI } from '../../services/api';

interface User { id: string; email: string; name: string; role: string; is_active: number | boolean; is_mentor: number | boolean; is_mentee: number | boolean; created_at: string; }

const AdminUsers: React.FC = () => {
  const [users, setUsers]       = useState<User[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [toast, setToast]       = useState<{msg:string;ok:boolean}|null>(null);
  const [roleFilter, setRole]   = useState('all');

  const showToast = (msg: string, ok = true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),4000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers();
      if (res?.success) setUsers(res.data.users);
    } catch { showToast('Failed to load users', false); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleStatus = async (u: User) => {
    const newStatus = !u.is_active;
    try {
      await adminAPI.updateUserStatus(u.id, newStatus);
      await adminAPI.logAudit(newStatus ? 'ACTIVATE' : 'DEACTIVATE', 'User', u.email);
      setUsers(prev => prev.map(x => x.id === u.id ? {...x, is_active: newStatus ? 1 : 0} : x));
      showToast(`User ${newStatus ? 'activated' : 'deactivated'}`);
    } catch { showToast('Failed to update user', false); }
  };

  const deleteUser = async (u: User) => {
    if (!confirm(`Deactivate ${u.email}? This will prevent them from logging in.`)) return;
    try {
      await adminAPI.deleteUser(u.id);
      await adminAPI.logAudit('DELETE', 'User', u.email);
      setUsers(prev => prev.filter(x => x.id !== u.id));
      showToast('User removed');
    } catch { showToast('Failed to remove user', false); }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchQ = !q || (u.email||'').toLowerCase().includes(q) || (u.name||'').toLowerCase().includes(q);
    const matchR = roleFilter === 'all' || u.role === roleFilter;
    return matchQ && matchR;
  });

  const roleBadge = (r: string) => {
    const m: Record<string,string> = { mentor:'bg-[#1A1F5E]/10 text-[#1A1F5E]', mentee:'bg-[#0072CE]/10 text-[#0072CE]', both:'bg-purple-100 text-purple-700', admin:'bg-[#E83E2D]/10 text-[#E83E2D]' };
    return m[r] || 'bg-[#F4F4F4] text-[#8C8C8C]';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {toast && <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-semibold ${toast.ok ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-[#E83E2D]/10 border border-[#E83E2D]/30 text-[#E83E2D]'}`}>{toast.msg}</div>}

      <div className="flex items-center justify-between">
        <div>
          <div className="h-1 w-10 bg-[#E83E2D] rounded-full mb-3" />
          <h1 className="text-3xl font-bold text-[#1A1F5E]">User Management</h1>
          <p className="text-[#8C8C8C] mt-1">{users.length} total users</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 border-2 border-[#1A1F5E] text-[#1A1F5E] font-semibold rounded-xl hover:bg-[#1A1F5E] hover:text-white transition-all duration-200">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or email…" className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-[#333333] text-sm focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all" />
        </div>
        <select value={roleFilter} onChange={e=>setRole(e.target.value)} className="px-4 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-[#333333] text-sm focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 bg-white">
          <option value="all">All roles</option>
          <option value="mentor">Mentors</option>
          <option value="mentee">Mentees</option>
          <option value="both">Both</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-[#E5E7EB] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#8C8C8C]"><RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-[#1A1F5E]" />Loading users…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-[#8C8C8C]"><Users className="w-12 h-12 mx-auto mb-3 text-[#E5E7EB]" /><p>No users found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F4F4F4] border-b border-[#E5E7EB]">
                <tr>{['User','Role','Status','Joined','Actions'].map(h => <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-[#8C8C8C] uppercase tracking-wide">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-[#F4F4F4]/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#1A1F5E] flex items-center justify-center text-white font-bold text-sm shrink-0">{(u.name||u.email||'?')[0].toUpperCase()}</div>
                        <div><p className="font-semibold text-[#333333]">{u.name || '—'}</p><p className="text-xs text-[#8C8C8C] flex items-center gap-1"><Mail className="w-3 h-3" />{u.email}</p></div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleBadge(u.role)}`}>{u.role}</span></td>
                    <td className="px-5 py-4"><span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-[#8C8C8C]/10 text-[#8C8C8C]'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td className="px-5 py-4 text-[#8C8C8C]"><span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(u.created_at).toLocaleDateString()}</span></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={()=>toggleStatus(u)} title={u.is_active ? 'Deactivate' : 'Activate'} className={`p-2 rounded-xl transition-colors ${u.is_active ? 'text-[#8C8C8C] hover:bg-[#8C8C8C]/10' : 'text-green-600 hover:bg-green-50'}`}>
                          {u.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button onClick={()=>deleteUser(u)} title="Remove" className="p-2 rounded-xl text-[#E83E2D] hover:bg-[#E83E2D]/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
