import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BookOpen, Plus, Edit, Trash2, Save, X, Search, RefreshCw, Link as LinkIcon, Upload, FileText } from 'lucide-react';
import { adminAPI } from '../../services/api';

const EMPTY = { title:'', type:'article', category:'General', url:'', description:'' };
const TYPES = ['article','video','pdf','template','tool','other'];
const CATEGORIES = ['General','Leadership','DEI','Finance','Technology','Career','Wellness','Legal'];

const AdminResources: React.FC = () => {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [search, setSearch]       = useState('');
  const [showModal, setModal]     = useState(false);
  const [editId, setEditId]       = useState<string|null>(null);
  const [form, setForm]           = useState({ ...EMPTY });
  const [toast, setToast]         = useState<{msg:string;ok:boolean}|null>(null);
  const [uploadMode, setUploadMode] = useState<'url'|'file'>('url');
  const [uploading, setUploading]   = useState(false);
  const [pdfFile, setPdfFile]       = useState<File|null>(null);
  const fileInputRef                = useRef<HTMLInputElement>(null);

  const showT = (msg: string, ok = true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),4000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.adminGetResources();
      if (res?.success) setResources(res.data.resources || []);
    } catch { showT('Failed to load resources', false); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditId(null); setForm({...EMPTY}); setPdfFile(null); setUploadMode('url'); setModal(true); };
  const openEdit   = (r: any) => { setEditId(r.id); setForm({ title:r.title||'', type:r.type||'article', category:r.category||'General', url:r.url||'', description:r.description||'' }); setPdfFile(null); setUploadMode(r.url?.startsWith('/uploads/') ? 'file' : 'url'); setModal(true); };

  const handleSave = async () => {
    if (!form.title) { showT('Title is required', false); return; }
    let finalUrl = form.url;
    if (form.type === 'pdf' && uploadMode === 'file') {
      if (!pdfFile && !form.url) { showT('Please select a PDF file', false); return; }
      if (pdfFile) {
        setUploading(true);
        try {
          const res = await adminAPI.adminUploadPdf(pdfFile);
          if (!res?.success) { showT(res?.message || 'Upload failed', false); setUploading(false); return; }
          finalUrl = res.data.url;
        } catch { showT('Upload failed', false); setUploading(false); return; }
        finally { setUploading(false); }
      }
    } else if (!finalUrl) { showT('URL is required', false); return; }
    setSaving(true);
    try {
      const payload = { ...form, url: finalUrl };
      if (editId) { await adminAPI.adminUpdateResource(editId, payload); await adminAPI.logAudit('UPDATE', 'Resource', form.title); showT('Resource updated'); }
      else        { await adminAPI.adminCreateResource(payload); await adminAPI.logAudit('CREATE', 'Resource', form.title); showT('Resource created'); }
      setModal(false); load();
    } catch { showT('Save failed', false); }
    finally { setSaving(false); }
  };

  const handleDelete = async (r: any) => {
    if (!confirm(`Delete "${r.title}"?`)) return;
    try {
      await adminAPI.adminDeleteResource(r.id);
      await adminAPI.logAudit('DELETE', 'Resource', r.title);
      setResources(prev => prev.filter(x => x.id !== r.id));
      showT('Resource deleted');
    } catch { showT('Failed to delete', false); }
  };

  const filtered = resources.filter(r => {
    const q = search.toLowerCase();
    return !q || (r.title||'').toLowerCase().includes(q) || (r.category||'').toLowerCase().includes(q);
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {toast && <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-semibold ${toast.ok ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-[#E83E2D]/10 border border-[#E83E2D]/30 text-[#E83E2D]'}`}>{toast.msg}</div>}

      <div className="flex items-center justify-between">
        <div>
          <div className="h-1 w-10 bg-[#E83E2D] rounded-full mb-3" />
          <h1 className="text-3xl font-bold text-[#1A1F5E]">Resource Library</h1>
          <p className="text-[#8C8C8C] mt-1">{resources.length} resources</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 border-2 border-[#1A1F5E] text-[#1A1F5E] font-semibold rounded-xl hover:bg-[#1A1F5E] hover:text-white transition-all duration-200"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin':''}`} />Refresh</button>
          <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1F5E] text-white font-semibold rounded-xl hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-lg"><Plus className="w-4 h-4" />Add Resource</button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search resources…" className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-sm focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all" />
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-[#E5E7EB] overflow-hidden">
        {loading ? <div className="p-12 text-center text-[#8C8C8C]"><RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-[#1A1F5E]" />Loading…</div> :
        filtered.length === 0 ? <div className="p-12 text-center text-[#8C8C8C]"><BookOpen className="w-12 h-12 mx-auto mb-3 text-[#E5E7EB]" /><p>No resources yet.</p></div> :
        <div className="divide-y divide-[#E5E7EB]">
          {filtered.map(r => (
            <div key={r.id} className="p-5 hover:bg-[#F4F4F4]/50 transition-colors flex gap-4 items-center">
              <div className="inline-flex p-2.5 rounded-xl bg-[#1A1F5E]/10 shrink-0"><BookOpen className="w-4 h-4 text-[#1A1F5E]" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold text-[#333333]">{r.title}</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#1A1F5E]/10 text-[#1A1F5E]">{r.type}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F4F4F4] text-[#8C8C8C]">{r.category}</span>
                </div>
                {r.description && <p className="text-sm text-[#8C8C8C] line-clamp-1">{r.description}</p>}
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#0072CE] underline hover:text-[#E83E2D] flex items-center gap-1 mt-0.5"><LinkIcon className="w-3 h-3" />{r.url}</a>
              </div>
              <div className="text-xs text-[#8C8C8C] shrink-0 mr-4">{r.downloads||0} downloads</div>
              <div className="flex gap-2 shrink-0">
                <button onClick={()=>openEdit(r)} className="p-2 rounded-xl text-[#0072CE] hover:bg-[#0072CE]/10 transition-colors"><Edit className="w-4 h-4" /></button>
                <button onClick={()=>handleDelete(r)} className="p-2 rounded-xl text-[#E83E2D] hover:bg-[#E83E2D]/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#1A1F5E]">{editId ? 'Edit' : 'Add'} Resource</h3>
              <button onClick={()=>setModal(false)} className="p-2 rounded-xl hover:bg-[#F4F4F4]"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-1.5">Title *</label>
                <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} className="w-full px-4 py-3 rounded-2xl border-2 border-[#E5E7EB] text-[#333333] focus:outline-none focus:border-[#1A1F5E] transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#333333] mb-1.5">Type</label>
                  <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} className="w-full px-4 py-3 rounded-2xl border-2 border-[#E5E7EB] text-sm focus:outline-none focus:border-[#1A1F5E] bg-white">
                    {TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#333333] mb-1.5">Category</label>
                  <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} className="w-full px-4 py-3 rounded-2xl border-2 border-[#E5E7EB] text-sm focus:outline-none focus:border-[#1A1F5E] bg-white">
                    {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              {form.type === 'pdf' ? (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-semibold text-[#333333]">PDF Source *</label>
                    <div className="flex rounded-xl overflow-hidden border-2 border-[#E5E7EB] text-xs font-semibold">
                      <button type="button" onClick={()=>setUploadMode('file')} className={`px-3 py-1.5 transition-colors ${uploadMode==='file' ? 'bg-[#1A1F5E] text-white' : 'bg-white text-[#8C8C8C] hover:bg-[#F4F4F4]'}`}><Upload className="w-3 h-3 inline mr-1" />Upload File</button>
                      <button type="button" onClick={()=>setUploadMode('url')} className={`px-3 py-1.5 transition-colors ${uploadMode==='url' ? 'bg-[#1A1F5E] text-white' : 'bg-white text-[#8C8C8C] hover:bg-[#F4F4F4]'}`}><LinkIcon className="w-3 h-3 inline mr-1" />Paste URL</button>
                    </div>
                  </div>
                  {uploadMode === 'file' ? (
                    <div
                      onClick={()=>fileInputRef.current?.click()}
                      className="w-full px-4 py-6 rounded-2xl border-2 border-dashed border-[#1A1F5E]/30 text-center cursor-pointer hover:border-[#1A1F5E] hover:bg-[#1A1F5E]/5 transition-all"
                    >
                      <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; if(f){ setPdfFile(f); setForm(p=>({...p,url:''})); }}} />
                      {pdfFile ? (
                        <div className="flex items-center justify-center gap-2 text-[#1A1F5E]">
                          <FileText className="w-5 h-5" />
                          <span className="font-semibold text-sm">{pdfFile.name}</span>
                          <span className="text-xs text-[#8C8C8C]">({(pdfFile.size/1024/1024).toFixed(2)} MB)</span>
                        </div>
                      ) : form.url?.startsWith('/uploads/') ? (
                        <div className="flex items-center justify-center gap-2 text-[#1A1F5E]">
                          <FileText className="w-5 h-5" />
                          <span className="text-sm text-[#8C8C8C]">Current: {form.url.split('/').pop()}</span>
                          <span className="text-xs text-[#0072CE] underline">click to replace</span>
                        </div>
                      ) : (
                        <div className="text-[#8C8C8C]">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-[#1A1F5E]/40" />
                          <p className="text-sm font-semibold text-[#1A1F5E]">Click to select a PDF</p>
                          <p className="text-xs mt-1">Max 20 MB</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <input type="url" value={form.url} onChange={e=>setForm(p=>({...p,url:e.target.value}))} placeholder="https://example.com/file.pdf" className="w-full px-4 py-3 rounded-2xl border-2 border-[#E5E7EB] text-[#333333] focus:outline-none focus:border-[#1A1F5E] transition-all" />
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-[#333333] mb-1.5">URL *</label>
                  <input type="url" value={form.url} onChange={e=>setForm(p=>({...p,url:e.target.value}))} placeholder="https://…" className="w-full px-4 py-3 rounded-2xl border-2 border-[#E5E7EB] text-[#333333] focus:outline-none focus:border-[#1A1F5E] transition-all" />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-1.5">Description</label>
                <textarea rows={2} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} className="w-full px-4 py-3 rounded-2xl border-2 border-[#E5E7EB] text-[#333333] focus:outline-none focus:border-[#1A1F5E] transition-all resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={()=>setModal(false)} className="flex-1 py-3 rounded-2xl border-2 border-[#E5E7EB] font-semibold hover:bg-[#F4F4F4] transition-all">Cancel</button>
                <button onClick={handleSave} disabled={saving||uploading} className="flex-1 py-3 rounded-2xl bg-[#1A1F5E] text-white font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
                  {(saving||uploading) ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {uploading ? 'Uploading…' : saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminResources;
