import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserCog, Activity, Clock, RefreshCw, Link2, ShieldCheck } from 'lucide-react';
import { adminAPI } from '../../services/api';

const AdminOverview: React.FC = () => {
  const [stats, setStats] = React.useState<any>(null);
  const [audits, setAudits] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, a] = await Promise.allSettled([adminAPI.getStats(), adminAPI.getAuditLog({ limit: 10 })]);
      if (s.status === 'fulfilled' && s.value?.success) setStats(s.value.data.stats);
      if (a.status === 'fulfilled' && a.value?.success) setAudits(a.value.data.audits || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const cards = stats ? [
    { label: 'Total Users',      value: stats.totalUsers,       sub: `+${stats.newUsersThisMonth} this month`, icon: Users },
    { label: 'Mentors',          value: stats.totalMentors,     sub: 'Registered',                             icon: UserCog },
    { label: 'Connections',      value: stats.totalConnections, sub: `${stats.activeConnections} active`,    icon: Link2 },
    { label: 'Sessions',         value: stats.totalSessions,    sub: `${stats.completedSessions} done`,     icon: Activity },
    { label: 'Verified Experts', value: stats.verifiedExperts,  sub: 'In directory',                          icon: ShieldCheck },
  ] : [];

  const badge: Record<string,string> = {
    CREATE:'text-green-700 bg-green-100',CREATED:'text-green-700 bg-green-100',
    UPDATE:'text-[#0072CE] bg-blue-100', UPDATED:'text-[#0072CE] bg-blue-100',
    DELETE:'text-[#E83E2D] bg-red-100',  DELETED:'text-[#E83E2D] bg-red-100',
    APPROVE:'text-green-700 bg-green-100',REJECT:'text-[#E83E2D] bg-red-100',
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-1 w-10 bg-[#E83E2D] rounded-full mb-3" />
          <h1 className="text-3xl font-bold text-[#1A1F5E]">Admin Overview</h1>
          <p className="text-[#8C8C8C] mt-1">Live platform statistics and recent activity</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 border-2 border-[#1A1F5E] text-[#1A1F5E] font-semibold rounded-xl hover:bg-[#1A1F5E] hover:text-white transition-all duration-200">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />Refresh
        </button>
      </div>

      <div className="bg-[#1A1F5E] rounded-3xl p-6 text-white shadow-xl">
        <h2 className="text-xl text-white font-bold mb-1">Welcome back, Admin</h2>
        <p className="text-white/80 text-sm">Full access to the DEI Cafe management console. Use the sidebar to navigate.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {loading ? [...Array(5)].map((_,i) => <div key={i} className="bg-white rounded-3xl shadow-xl p-6 border border-[#E5E7EB] animate-pulse h-28" />) :
          cards.map((c,i) => { const Icon = c.icon; return (
            <div key={i} className="bg-white rounded-3xl shadow-xl p-5 border border-[#E5E7EB] hover:shadow-2xl transition-shadow">
              <div className="inline-flex p-2.5 rounded-xl bg-[#F4F4F4] mb-3"><Icon className="w-5 h-5 text-[#1A1F5E]" /></div>
              <p className="text-xs text-[#8C8C8C] font-medium">{c.label}</p>
              <p className="text-2xl font-bold text-[#1A1F5E] mt-0.5">{c.value ?? 0}</p>
              <p className="text-xs text-[#8C8C8C] mt-0.5">{c.sub}</p>
            </div>
          );})}
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-[#E5E7EB] overflow-hidden">
        <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1A1F5E]">Recent Activity</h2>
            <p className="text-sm text-[#8C8C8C] mt-0.5">Latest admin actions</p>
          </div>
          <Clock className="w-5 h-5 text-[#8C8C8C]" />
        </div>
        <div className="divide-y divide-[#E5E7EB]">
          {audits.length === 0 ? (
            <div className="px-6 py-12 text-center text-[#8C8C8C]">No activity yet. Actions will appear here.</div>
          ) : audits.map(a => {
            const cls = badge[a.action?.toUpperCase()] || 'text-[#8C8C8C] bg-[#F4F4F4]';
            return (
              <div key={a.id} className="px-6 py-4 hover:bg-[#F4F4F4]/50 flex items-start gap-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 mt-0.5 ${cls}`}>{a.action}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#333333]">{a.entity_type}{a.entity_name ? ` — ${a.entity_name}` : ''}{a.details ? `: ${a.details}` : ''}</p>
                  <p className="text-xs text-[#8C8C8C] mt-0.5">{a.admin_email} · {new Date(a.created_at).toLocaleString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
