import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Plus, Edit, Trash2, Save, X, Search, RefreshCw, Send } from 'lucide-react';
import { adminAPI } from '../../services/api';

const EMPTY = { title:'', message:'', type:'info', target_audience:'all', status:'draft' };
const TYPES = ['info','warning','success','error'];
const AUDIENCES = ['all','mentors','mentees','experts'];

const AdminNotifications: React.FC = () => {
  const [items, setItems]       = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [search, setSearch]     = useState('');
  const [showModal, setModal]   = useState(false);
  const [editId, setEditId]     = useState<string|null>(null);
  const [form, setForm]         = useState({ ...EMPTY });
  const [toast, setToast]       = useState<{msg:string;ok:boolean}|null>(null);

  const showT = (msg: string, ok = true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),4000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getNotifications();
      if (res?.success) setItems(res.data.notifications || []);
    } catch { showT('Failed to load notifications', false); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditId(null); setForm({...EMPTY}); setModal(true); };
  const openEdit   = (n: any) => { setEditId(n.id); setForm({ title:n.title, message:n.message, type:n.type, target_audience:n.target_audience, status:n.status }); setModal(true); };

  const handleSave = async () => {
    if (!form.title || !form.message) { showT('Title and message required', false); return; }
    setSaving(true);
    try {
      if (editId) { await adminAPI.updateNotification(editId, form); await adminAPI.logAudit('UPDATE', 'Notification', form.title); showT('Notification updated'); }
      else        { await adminAPI.createNotification(form); await adminAPI.logAudit('CREATE', 'Notification', form.title); showT('Notification created'); }
      setModal(false); load();
    } catch { showT('Save failed', false); }
    finally { setSaving(false); }
  };

  const publish = async (n: any) => {
    try {
      await adminAPI.updateNotification(n.id, { status: 'published' });
      await adminAPI.logAudit('PUBLISH', 'Notification', n.title);
      setItems(prev => prev.map(x => x.id === n.id ? {...x, status:'published'} : x));
      showT('Notification published');
    } catch { showT('Failed to publish', false); }
  };

  const handleDelete = async (n: any) => {
    if (!confirm(`Delete "${n.title}"?`)) return;
    try {
      await adminAPI.deleteNotification(n.id);
      await adminAPI.logAudit('DELETE', 'Notification', n.title);
      setItems(prev => prev.filter(x => x.id !== n.id));
      showT('Notification deleted');
    } catch { showT('Failed to delete', false); }
  };

  const filtered = items.filter(n => {
    const q = search.toLowerCase();
    return !q || (n.title||'').toLowerCase().includes(q);
  });

  const typeCls = (t: string) => ({ info:'bg-[#0072CE]/10 text-[#0072CE]', warning:'bg-yellow-100 text-yellow-700', success:'bg-green-100 text-green-700', error:'bg-[#E83E2D]/10 text-[#E83E2D]' })[t] || 'bg-[#F4F4F4] text-[#8C8C8C]';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {toast && <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-semibold ${toast.ok ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-[#E83E2D]/10 border border-[#E83E2D]/30 text-[#E83E2D]'}`}>{toast.msg}</div>}

      <div className="flex items-center justify-between">
        <div>
          <div className="h-1 w-10 bg-[#E83E2D] rounded-full mb-3" />
          <h1 className="text-3xl font-bold text-[#1A1F5E]">Announcements</h1>
          <p className="text-[#8C8C8C] mt-1">{items.filter(n=>n.status==='published').length} published · {items.filter(n=>n.status==='draft').length} drafts</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 border-2 border-[#1A1F5E] text-[#1A1F5E] font-semibold rounded-xl hover:bg-[#1A1F5E] hover:text-white transition-all duration-200"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin':''}`} />Refresh</button>
          <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1F5E] text-white font-semibold rounded-xl hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-lg"><Plus className="w-4 h-4" />New</button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search announcements…" className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-sm focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all" />
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-[#E5E7EB] overflow-hidden">
        {loading ? <div className="p-12 text-center text-[#8C8C8C]"><RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-[#1A1F5E]" />Loading…</div> :
        filtered.length === 0 ? <div className="p-12 text-center text-[#8C8C8C]"><Bell className="w-12 h-12 mx-auto mb-3 text-[#E5E7EB]" /><p>No announcements yet.</p></div> :
        <div className="divide-y divide-[#E5E7EB]">
          {filtered.map(n => (
            <div key={n.id} className="p-5 hover:bg-[#F4F4F4]/50 transition-colors flex gap-4 items-start">
              <div className={`inline-flex p-2.5 rounded-xl shrink-0 ${typeCls(n.type)}`}><Bell className="w-4 h-4" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-semibold text-[#333333]">{n.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${typeCls(n.type)}`}>{n.type}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${n.status==='published' ? 'bg-green-100 text-green-700' : 'bg-[#F4F4F4] text-[#8C8C8C]'}`}>{n.status}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#1A1F5E]/10 text-[#1A1F5E]">→ {n.target_audience}</span>
                </div>
                <p className="text-sm text-[#333333] line-clamp-2">{n.message}</p>
                <p className="text-xs text-[#8C8C8C] mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {n.status === 'draft' && <button onClick={()=>publish(n)} title="Publish" className="p-2 rounded-xl text-green-600 hover:bg-green-50 transition-colors"><Send className="w-4 h-4" /></button>}
                <button onClick={()=>openEdit(n)} className="p-2 rounded-xl text-[#0072CE] hover:bg-[#0072CE]/10 transition-colors"><Edit className="w-4 h-4" /></button>
                <button onClick={()=>handleDelete(n)} className="p-2 rounded-xl text-[#E83E2D] hover:bg-[#E83E2D]/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#1A1F5E]">{editId ? 'Edit' : 'New'} Announcement</h3>
              <button onClick={()=>setModal(false)} className="p-2 rounded-xl hover:bg-[#F4F4F4]"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-1.5">Title *</label>
                <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} className="w-full px-4 py-3 rounded-2xl border-2 border-[#E5E7EB] text-[#333333] focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-1.5">Message *</label>
                <textarea rows={4} value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))} className="w-full px-4 py-3 rounded-2xl border-2 border-[#E5E7EB] text-[#333333] focus:outline-none focus:border-[#1A1F5E] transition-all resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[{label:'Type',key:'type',opts:TYPES},{label:'Audience',key:'target_audience',opts:AUDIENCES},{label:'Status',key:'status',opts:['draft','published']}].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-semibold text-[#333333] mb-1.5">{f.label}</label>
                    <select value={(form as any)[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} className="w-full px-3 py-2.5 rounded-2xl border-2 border-[#E5E7EB] text-sm focus:outline-none focus:border-[#1A1F5E] bg-white">
                      {f.opts.map(o=><option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
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

export default AdminNotifications;
