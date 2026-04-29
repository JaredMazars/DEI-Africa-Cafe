import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Search, RefreshCw, Download, Filter } from 'lucide-react';
import { adminAPI } from '../../services/api';

const ACTIONS = ['all','CREATE','UPDATE','DELETE','ACTIVATE','DEACTIVATE','PUBLISH','APPROVE','REJECT','LOGIN'];

const AdminAudit: React.FC = () => {
  const [audits, setAudits]       = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [actionFilter, setAction] = useState('all');
  const [toast, setToast]         = useState<string|null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAuditLog({ action: actionFilter !== 'all' ? actionFilter : undefined, search: search || undefined, limit: 500 });
      if (res?.success) setAudits(res.data.audits || []);
    } catch { setToast('Failed to load audit log'); setTimeout(()=>setToast(null),4000); }
    finally { setLoading(false); }
  }, [actionFilter, search]);

  useEffect(() => { load(); }, [load]);

  const exportCSV = () => {
    const header = 'Timestamp,Admin,Action,Entity Type,Entity Name,Details';
    const rows = audits.map(a => [`"${a.created_at}"`, `"${a.admin_email}"`, `"${a.action}"`, `"${a.entity_type}"`, `"${a.entity_name}"`, `"${(a.details||'').replace(/"/g,'""')}"`].join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const badge: Record<string,string> = {
    CREATE:'text-green-700 bg-green-100',CREATED:'text-green-700 bg-green-100',
    UPDATE:'text-[#0072CE] bg-blue-100', UPDATED:'text-[#0072CE] bg-blue-100',
    DELETE:'text-[#E83E2D] bg-red-100',  DELETED:'text-[#E83E2D] bg-red-100',
    APPROVE:'text-green-700 bg-green-100',REJECT:'text-[#E83E2D] bg-red-100',
    PUBLISH:'text-[#0072CE] bg-blue-100',ACTIVATE:'text-green-700 bg-green-100',
    DEACTIVATE:'text-[#8C8C8C] bg-[#F4F4F4]',LOGIN:'text-[#1A1F5E] bg-[#1A1F5E]/10',
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {toast && <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-semibold bg-[#E83E2D]/10 border border-[#E83E2D]/30 text-[#E83E2D]">{toast}</div>}

      <div className="flex items-center justify-between">
        <div>
          <div className="h-1 w-10 bg-[#E83E2D] rounded-full mb-3" />
          <h1 className="text-3xl font-bold text-[#1A1F5E]">Audit Log</h1>
          <p className="text-[#8C8C8C] mt-1">{audits.length} entries</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 border-2 border-[#1A1F5E] text-[#1A1F5E] font-semibold rounded-xl hover:bg-[#1A1F5E] hover:text-white transition-all duration-200"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin':''}`} />Refresh</button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 border-2 border-[#E5E7EB] text-[#333333] font-semibold rounded-xl hover:bg-[#F4F4F4] transition-all"><Download className="w-4 h-4" />Export CSV</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
          <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&load()} placeholder="Search by name, admin, detail…" className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-sm focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all" />
        </div>
        <select value={actionFilter} onChange={e=>setAction(e.target.value)} className="px-4 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-sm focus:outline-none focus:border-[#1A1F5E] bg-white">
          {ACTIONS.map(a=><option key={a} value={a}>{a==='all' ? 'All actions' : a}</option>)}
        </select>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 bg-[#1A1F5E] text-white font-semibold rounded-xl hover:opacity-90 transition-all"><Filter className="w-4 h-4" />Apply</button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-[#E5E7EB] overflow-hidden">
        {loading ? <div className="p-12 text-center text-[#8C8C8C]"><RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-[#1A1F5E]" />Loading audit log…</div> :
        audits.length === 0 ? <div className="p-12 text-center text-[#8C8C8C]"><ClipboardList className="w-12 h-12 mx-auto mb-3 text-[#E5E7EB]" /><p>No audit entries found.</p></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F4F4F4] border-b border-[#E5E7EB]">
                <tr>{['Timestamp','Admin','Action','Entity','Name/Details'].map(h=><th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-[#8C8C8C] uppercase tracking-wide">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {audits.map(a => {
                  const cls = badge[a.action?.toUpperCase()] || 'text-[#8C8C8C] bg-[#F4F4F4]';
                  return (
                    <tr key={a.id} className="hover:bg-[#F4F4F4]/50 transition-colors">
                      <td className="px-5 py-3.5 text-[#8C8C8C] whitespace-nowrap">{new Date(a.created_at).toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-[#333333] font-medium">{a.admin_email}</td>
                      <td className="px-5 py-3.5"><span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${cls}`}>{a.action}</span></td>
                      <td className="px-5 py-3.5 text-[#8C8C8C]">{a.entity_type}</td>
                      <td className="px-5 py-3.5 text-[#333333] max-w-xs truncate">{a.entity_name}{a.details ? ` — ${a.details}` : ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAudit;
