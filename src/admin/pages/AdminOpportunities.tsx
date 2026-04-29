import React, { useState, useEffect, useCallback } from 'react';
import { Briefcase, Plus, Edit, Trash2, Save, X, Search, RefreshCw, Calendar } from 'lucide-react';
import { adminAPI } from '../../services/api';

const EMPTY = { title:'', description:'', industry:'', client_sector:'', regions_needed:'', budget_range:'', deadline:'', priority:'medium', status:'open' };
const PRIORITIES = ['high','medium','low'];
const STATUSES   = ['open','in-progress','closed'];

const AdminOpportunities: React.FC = () => {
  const [opps, setOpps]         = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusF] = useState('all');
  const [showModal, setModal]   = useState(false);
  const [editId, setEditId]     = useState<string|null>(null);
  const [form, setForm]         = useState({ ...EMPTY });
  const [toast, setToast]       = useState<{msg:string;ok:boolean}|null>(null);

  const showT = (msg: string, ok = true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),4000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getOpportunities();
      if (res?.success) setOpps(res.data.opportunities || []);
    } catch { showT('Failed to load opportunities', false); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditId(null); setForm({...EMPTY}); setModal(true); };
  const openEdit   = (o: any) => {
    setEditId(o.opportunity_id||o.id);
    setForm({ title:o.title||'', description:o.description||'', industry:o.industry||'', client_sector:o.client_sector||'', regions_needed:o.regions_needed||'', budget_range:o.budget_range||'', deadline:o.deadline ? o.deadline.split('T')[0] : '', priority:o.priority||'medium', status:o.status||'open' });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.description) { showT('Title and description required', false); return; }
    setSaving(true);
    try {
      const id = editId;
      if (id) { await adminAPI.updateOpportunity(id, form); await adminAPI.logAudit('UPDATE', 'Opportunity', form.title); showT('Opportunity updated'); }
      else    { await adminAPI.createOpportunity(form); await adminAPI.logAudit('CREATE', 'Opportunity', form.title); showT('Opportunity created'); }
      setModal(false); load();
    } catch { showT('Save failed', false); }
    finally { setSaving(false); }
  };

  const handleDelete = async (o: any) => {
    if (!confirm(`Close "${o.title}"?`)) return;
    try {
      await adminAPI.deleteOpportunity(o.opportunity_id||o.id);
      await adminAPI.logAudit('DELETE', 'Opportunity', o.title);
      setOpps(prev => prev.filter(x => (x.opportunity_id||x.id) !== (o.opportunity_id||o.id)));
      showT('Opportunity closed');
    } catch { showT('Failed', false); }
  };

  const filtered = opps.filter(o => {
    const q = search.toLowerCase();
    const mQ = !q || (o.title||'').toLowerCase().includes(q) || (o.industry||'').toLowerCase().includes(q);
    const mS = statusFilter === 'all' || o.status === statusFilter;
    return mQ && mS;
  });

  const priorityCls = (p: string) => ({ high:'bg-[#E83E2D]/10 text-[#E83E2D]', medium:'bg-yellow-100 text-yellow-700', low:'bg-green-100 text-green-700' })[p] || 'bg-[#F4F4F4] text-[#8C8C8C]';
  const statusCls   = (s: string) => ({ open:'bg-green-100 text-green-700', 'in-progress':'bg-[#0072CE]/10 text-[#0072CE]', closed:'bg-[#8C8C8C]/10 text-[#8C8C8C]' })[s] || 'bg-[#F4F4F4] text-[#8C8C8C]';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {toast && <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-semibold ${toast.ok ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-[#E83E2D]/10 border border-[#E83E2D]/30 text-[#E83E2D]'}`}>{toast.msg}</div>}

      <div className="flex items-center justify-between">
        <div>
          <div className="h-1 w-10 bg-[#E83E2D] rounded-full mb-3" />
          <h1 className="text-3xl font-bold text-[#1A1F5E]">Opportunities</h1>
          <p className="text-[#8C8C8C] mt-1">{opps.length} total opportunities</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 border-2 border-[#1A1F5E] text-[#1A1F5E] font-semibold rounded-xl hover:bg-[#1A1F5E] hover:text-white transition-all duration-200"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin':''}`} />Refresh</button>
          <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1F5E] text-white font-semibold rounded-xl hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-lg"><Plus className="w-4 h-4" />Add</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search opportunities…" className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-sm focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all" />
        </div>
        <select value={statusFilter} onChange={e=>setStatusF(e.target.value)} className="px-4 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-sm focus:outline-none focus:border-[#1A1F5E] bg-white">
          <option value="all">All statuses</option>
          {STATUSES.map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-[#E5E7EB] overflow-hidden">
        {loading ? <div className="p-12 text-center text-[#8C8C8C]"><RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-[#1A1F5E]" />Loading…</div> :
        filtered.length === 0 ? <div className="p-12 text-center text-[#8C8C8C]"><Briefcase className="w-12 h-12 mx-auto mb-3 text-[#E5E7EB]" /><p>No opportunities found.</p></div> :
        <div className="divide-y divide-[#E5E7EB]">
          {filtered.map(o => (
            <div key={o.opportunity_id||o.id} className="p-5 hover:bg-[#F4F4F4]/50 transition-colors flex gap-4 items-start">
              <div className="inline-flex p-2.5 rounded-xl bg-[#1A1F5E]/10 shrink-0"><Briefcase className="w-4 h-4 text-[#1A1F5E]" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <h3 className="font-semibold text-[#333333]">{o.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${priorityCls(o.priority)}`}>{o.priority}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusCls(o.status)}`}>{o.status}</span>
                </div>
                {o.industry && <p className="text-xs text-[#8C8C8C] mb-1">{o.industry} · {o.regions_needed}</p>}
                <p className="text-sm text-[#333333] line-clamp-2">{o.description}</p>
                {o.deadline && <p className="text-xs text-[#8C8C8C] flex items-center gap-1 mt-1"><Calendar className="w-3 h-3" />Deadline: {new Date(o.deadline).toLocaleDateString()}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={()=>openEdit(o)} className="p-2 rounded-xl text-[#0072CE] hover:bg-[#0072CE]/10 transition-colors"><Edit className="w-4 h-4" /></button>
                <button onClick={()=>handleDelete(o)} className="p-2 rounded-xl text-[#E83E2D] hover:bg-[#E83E2D]/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#1A1F5E]">{editId ? 'Edit' : 'Add'} Opportunity</h3>
              <button onClick={()=>setModal(false)} className="p-2 rounded-xl hover:bg-[#F4F4F4]"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              {[{label:'Title *',key:'title'},{label:'Industry',key:'industry'},{label:'Client Sector',key:'client_sector'},{label:'Regions Needed',key:'regions_needed'},{label:'Budget Range',key:'budget_range'}].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-semibold text-[#333333] mb-1.5">{f.label}</label>
                  <input value={(form as any)[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} className="w-full px-4 py-3 rounded-2xl border-2 border-[#E5E7EB] text-[#333333] focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-1.5">Description *</label>
                <textarea rows={3} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} className="w-full px-4 py-3 rounded-2xl border-2 border-[#E5E7EB] text-[#333333] focus:outline-none focus:border-[#1A1F5E] transition-all resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-[#333333] mb-1.5">Deadline</label>
                  <input type="date" value={form.deadline} onChange={e=>setForm(p=>({...p,deadline:e.target.value}))} className="w-full px-3 py-2.5 rounded-2xl border-2 border-[#E5E7EB] text-sm focus:outline-none focus:border-[#1A1F5E] bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#333333] mb-1.5">Priority</label>
                  <select value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value}))} className="w-full px-3 py-2.5 rounded-2xl border-2 border-[#E5E7EB] text-sm focus:outline-none focus:border-[#1A1F5E] bg-white">
                    {PRIORITIES.map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#333333] mb-1.5">Status</label>
                  <select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} className="w-full px-3 py-2.5 rounded-2xl border-2 border-[#E5E7EB] text-sm focus:outline-none focus:border-[#1A1F5E] bg-white">
                    {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={()=>setModal(false)} className="flex-1 py-3 rounded-2xl border-2 border-[#E5E7EB] font-semibold hover:bg-[#F4F4F4] transition-all">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-2xl bg-[#1A1F5E] text-white font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOpportunities;
