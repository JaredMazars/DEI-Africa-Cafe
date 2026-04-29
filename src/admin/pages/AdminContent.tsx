import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, Edit, Trash2, Save, X, Search, RefreshCw, Video, BookOpen } from 'lucide-react';
import { adminAPI } from '../../services/api';

const EMPTY = { type:'article', title:'', description:'', url:'', category:'General', status:'published' };
const TYPES = ['article','video','podcast','guide'];
const CATEGORIES = ['General','Leadership','DEI','Finance','Technology','Career','Wellness'];

const AdminContent: React.FC = () => {
  const [items, setItems]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [search, setSearch]   = useState('');
  const [typeFilter, setType] = useState('all');
  const [showModal, setModal] = useState(false);
  const [editId, setEditId]   = useState<string|null>(null);
  const [form, setForm]       = useState({ ...EMPTY });
  const [toast, setToast]     = useState<{msg:string;ok:boolean}|null>(null);

  const showT = (msg: string, ok = true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),4000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getContent();
      if (res?.success) setItems(res.data.content || []);
    } catch { showT('Failed to load content', false); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditId(null); setForm({...EMPTY}); setModal(true); };
  const openEdit   = (c: any) => { setEditId(c.id); setForm({ type:c.type||'article', title:c.title||'', description:c.description||'', url:c.url||'', category:c.category||'General', status:c.status||'published' }); setModal(true); };

  const handleSave = async () => {
    if (!form.title || !form.url) { showT('Title and URL are required', false); return; }
    setSaving(true);
    try {
      if (editId) { await adminAPI.updateContent(editId, form); await adminAPI.logAudit('UPDATE', 'Content', form.title); showT('Content updated'); }
      else        { await adminAPI.createContent(form); await adminAPI.logAudit('CREATE', 'Content', form.title); showT('Content created'); }
      setModal(false); load();
    } catch { showT('Save failed', false); }
    finally { setSaving(false); }
  };

  const handleDelete = async (c: any) => {
    if (!confirm(`Archive "${c.title}"?`)) return;
    try {
      await adminAPI.deleteContent(c.id);
      await adminAPI.logAudit('DELETE', 'Content', c.title);
      setItems(prev => prev.filter(x => x.id !== c.id));
      showT('Content archived');
    } catch { showT('Failed to archive', false); }
  };

  const filtered = items.filter(c => {
    const q = search.toLowerCase();
    const match = !q || (c.title||'').toLowerCase().includes(q);
    const matchT = typeFilter === 'all' || c.type === typeFilter;
    return match && matchT;
  });

  const typeIcon = (t: string) => ({ video: <Video className="w-4 h-4" />, article: <FileText className="w-4 h-4" />, guide: <BookOpen className="w-4 h-4" /> })[t] || <FileText className="w-4 h-4" />;
  const typeBadge = (t: string) => ({ video:'bg-purple-100 text-purple-700', article:'bg-[#1A1F5E]/10 text-[#1A1F5E]', podcast:'bg-orange-100 text-orange-700', guide:'bg-[#0072CE]/10 text-[#0072CE]' })[t] || 'bg-[#F4F4F4] text-[#8C8C8C]';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {toast && <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-semibold ${toast.ok ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-[#E83E2D]/10 border border-[#E83E2D]/30 text-[#E83E2D]'}`}>{toast.msg}</div>}

      <div className="flex items-center justify-between">
        <div>
          <div className="h-1 w-10 bg-[#E83E2D] rounded-full mb-3" />
          <h1 className="text-3xl font-bold text-[#1A1F5E]">Content Management</h1>
          <p className="text-[#8C8C8C] mt-1">{items.length} content items</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 border-2 border-[#1A1F5E] text-[#1A1F5E] font-semibold rounded-xl hover:bg-[#1A1F5E] hover:text-white transition-all duration-200"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin':''}`} />Refresh</button>
          <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1F5E] text-white font-semibold rounded-xl hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-lg"><Plus className="w-4 h-4" />Add Content</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search content…" className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-sm focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all" />
        </div>
        <select value={typeFilter} onChange={e=>setType(e.target.value)} className="px-4 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-sm focus:outline-none focus:border-[#1A1F5E] bg-white">
          <option value="all">All types</option>
          {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-[#E5E7EB] overflow-hidden">
        {loading ? <div className="p-12 text-center text-[#8C8C8C]"><RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-[#1A1F5E]" />Loading…</div> :
        filtered.length === 0 ? <div className="p-12 text-center text-[#8C8C8C]"><FileText className="w-12 h-12 mx-auto mb-3 text-[#E5E7EB]" /><p>{search ? 'No content matches search' : 'No content yet. Add some above.'}</p></div> :
        <div className="divide-y divide-[#E5E7EB]">
          {filtered.map(c => (
            <div key={c.id} className="p-5 hover:bg-[#F4F4F4]/50 transition-colors flex gap-4 items-start">
              <div className={`inline-flex p-2.5 rounded-xl shrink-0 ${typeBadge(c.type)}`}>{typeIcon(c.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold text-[#333333]">{c.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${typeBadge(c.type)}`}>{c.type}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.status==='published' ? 'bg-green-100 text-green-700' : 'bg-[#F4F4F4] text-[#8C8C8C]'}`}>{c.status}</span>
                </div>
                {c.description && <p className="text-sm text-[#8C8C8C] line-clamp-1 mb-1">{c.description}</p>}
                <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#0072CE] underline hover:text-[#E83E2D] truncate block max-w-xs">{c.url}</a>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={()=>openEdit(c)} className="p-2 rounded-xl text-[#0072CE] hover:bg-[#0072CE]/10 transition-colors"><Edit className="w-4 h-4" /></button>
                <button onClick={()=>handleDelete(c)} className="p-2 rounded-xl text-[#E83E2D] hover:bg-[#E83E2D]/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#1A1F5E]">{editId ? 'Edit' : 'Add'} Content</h3>
              <button onClick={()=>setModal(false)} className="p-2 rounded-xl hover:bg-[#F4F4F4]"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#333333] mb-1.5">Type</label>
                  <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} className="w-full px-4 py-3 rounded-2xl border-2 border-[#E5E7EB] text-sm focus:outline-none focus:border-[#1A1F5E] bg-white">
                    {TYPES.map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#333333] mb-1.5">Category</label>
                  <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} className="w-full px-4 py-3 rounded-2xl border-2 border-[#E5E7EB] text-sm focus:outline-none focus:border-[#1A1F5E] bg-white">
                    {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-1.5">Title *</label>
                <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} className="w-full px-4 py-3 rounded-2xl border-2 border-[#E5E7EB] text-[#333333] focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-1.5">URL *</label>
                <input type="url" value={form.url} onChange={e=>setForm(p=>({...p,url:e.target.value}))} placeholder="https://…" className="w-full px-4 py-3 rounded-2xl border-2 border-[#E5E7EB] text-[#333333] focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-1.5">Description</label>
                <textarea rows={3} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} className="w-full px-4 py-3 rounded-2xl border-2 border-[#E5E7EB] text-[#333333] focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-1.5">Status</label>
                <select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} className="w-full px-4 py-3 rounded-2xl border-2 border-[#E5E7EB] text-sm focus:outline-none focus:border-[#1A1F5E] bg-white">
                  <option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={()=>setModal(false)} className="flex-1 py-3 rounded-2xl border-2 border-[#E5E7EB] text-[#333333] font-semibold hover:bg-[#F4F4F4] transition-all">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-2xl bg-[#1A1F5E] text-white font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
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

export default AdminContent;
