import React, { useState, useEffect, useCallback } from 'react';
import { UserCog, Plus, Edit, Trash2, Save, X, Search, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { adminAPI } from '../../services/api';

const EMPTY = { name:'', email:'', bio:'', expertise:'', photo:'' };

const AdminMentors: React.FC = () => {
  const [mentors, setMentors]     = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [search, setSearch]       = useState('');
  const [showModal, setModal]     = useState(false);
  const [editId, setEditId]       = useState<string|null>(null);
  const [form, setForm]           = useState({ ...EMPTY });
  const [toast, setToast]         = useState<{msg:string;ok:boolean}|null>(null);

  const showT = (msg: string, ok = true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),4000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getMentors();
      if (res?.success) setMentors(res.data.mentors || []);
    } catch { showT('Failed to load mentors', false); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditId(null); setForm({...EMPTY}); setModal(true); };
  const openEdit   = (m: any) => { setEditId(m.id||m.expert_id); setForm({ name: m.name||'', email: m.email||'', bio: m.bio||'', expertise: Array.isArray(m.expertise) ? m.expertise.join(', ') : (m.expertise||''), photo: m.photo||m.avatar_url||'' }); setModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.email || !form.bio) { showT('Name, email and bio are required', false); return; }
    setSaving(true);
    try {
      const payload = { ...form, expertise: form.expertise.split(',').map((s:string)=>s.trim()).filter(Boolean) };
      if (editId) {
        await adminAPI.updateMentor(editId, payload);
        await adminAPI.logAudit('UPDATE', 'Mentor', form.name);
        showT('Mentor updated');
      } else {
        await adminAPI.createMentor(payload);
        await adminAPI.logAudit('CREATE', 'Mentor', form.name);
        showT('Mentor created');
      }
      setModal(false);
      load();
    } catch (e: any) { showT(e.message || 'Save failed', false); }
    finally { setSaving(false); }
  };

  const handleDelete = async (m: any) => {
    if (!confirm(`Remove ${m.name}? They will no longer appear as a mentor.`)) return;
    try {
      await adminAPI.deleteMentor(m.id||m.expert_id);
      await adminAPI.logAudit('DELETE', 'Mentor', m.name);
      setMentors(prev => prev.filter(x => (x.id||x.expert_id) !== (m.id||m.expert_id)));
      showT('Mentor removed');
    } catch { showT('Failed to remove mentor', false); }
  };

  const filtered = mentors.filter(m => {
    const q = search.toLowerCase();
    return !q || (m.name||'').toLowerCase().includes(q) || (m.email||'').toLowerCase().includes(q);
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {toast && <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-semibold ${toast.ok ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-[#E83E2D]/10 border border-[#E83E2D]/30 text-[#E83E2D]'}`}>{toast.msg}</div>}

      <div className="flex items-center justify-between">
        <div>
          <div className="h-1 w-10 bg-[#E83E2D] rounded-full mb-3" />
          <h1 className="text-3xl font-bold text-[#1A1F5E]">Mentor Management</h1>
          <p className="text-[#8C8C8C] mt-1">{mentors.length} mentors registered</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 border-2 border-[#1A1F5E] text-[#1A1F5E] font-semibold rounded-xl hover:bg-[#1A1F5E] hover:text-white transition-all duration-200"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin':''}`} />Refresh</button>
          <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1F5E] text-white font-semibold rounded-xl hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-lg"><Plus className="w-4 h-4" />Add Mentor</button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search mentors…" className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-sm focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all" />
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-[#E5E7EB] overflow-hidden">
        {loading ? <div className="p-12 text-center text-[#8C8C8C]"><RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-[#1A1F5E]" />Loading…</div> :
        filtered.length === 0 ? <div className="p-12 text-center text-[#8C8C8C]"><UserCog className="w-12 h-12 mx-auto mb-3 text-[#E5E7EB]" /><p>{search ? 'No mentors match your search' : 'No mentors yet. Add one above.'}</p></div> :
        <div className="divide-y divide-[#E5E7EB]">
          {filtered.map(m => (
            <div key={m.id||m.expert_id} className="p-5 hover:bg-[#F4F4F4]/50 transition-colors flex gap-4 items-start">
              <img src={m.avatar_url||m.photo||`https://ui-avatars.com/api/?name=${encodeURIComponent(m.name||'M')}&background=1A1F5E&color=fff`} alt={m.name} className="w-12 h-12 rounded-2xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold text-[#333333]">{m.name}</h3>
                  {m.can_mentor ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#1A1F5E]/10 text-[#1A1F5E]">Mentor</span> : null}
                </div>
                <p className="text-sm text-[#8C8C8C] mb-1">{m.email}</p>
                {m.bio && <p className="text-sm text-[#333333] line-clamp-2 mb-2">{m.bio}</p>}
                {(m.expertise || m.expertise_tags) && (
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(m.expertise) ? m.expertise : (m.expertise||m.expertise_tags||'').split(',').map((s:string)=>s.trim()).filter(Boolean)).map((tag:string,i:number) => (
                      <span key={i} className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#1A1F5E]/10 text-[#1A1F5E]">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={()=>openEdit(m)} className="p-2 rounded-xl text-[#0072CE] hover:bg-[#0072CE]/10 transition-colors"><Edit className="w-4 h-4" /></button>
                <button onClick={()=>handleDelete(m)} className="p-2 rounded-xl text-[#E83E2D] hover:bg-[#E83E2D]/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#1A1F5E]">{editId ? 'Edit' : 'Add'} Mentor</h3>
              <button onClick={()=>setModal(false)} className="p-2 rounded-xl hover:bg-[#F4F4F4] transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              {[{label:'Full Name *',key:'name',type:'text'},{label:'Email *',key:'email',type:'email'},{label:'Photo URL',key:'photo',type:'url'}].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-semibold text-[#333333] mb-1.5">{f.label}</label>
                  <input type={f.type} value={(form as any)[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} className="w-full px-4 py-3 rounded-2xl border-2 border-[#E5E7EB] text-[#333333] focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-1.5">Bio *</label>
                <textarea rows={3} value={form.bio} onChange={e=>setForm(p=>({...p,bio:e.target.value}))} className="w-full px-4 py-3 rounded-2xl border-2 border-[#E5E7EB] text-[#333333] focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-1.5">Expertise (comma-separated)</label>
                <input type="text" value={form.expertise} onChange={e=>setForm(p=>({...p,expertise:e.target.value}))} placeholder="Leadership, Finance, DEI…" className="w-full px-4 py-3 rounded-2xl border-2 border-[#E5E7EB] text-[#333333] focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all" />
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

export default AdminMentors;
