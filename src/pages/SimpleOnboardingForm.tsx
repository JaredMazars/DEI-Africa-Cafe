import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Briefcase, Target, User, Clock,
  ArrowLeft, ArrowRight, Building2, Loader, CheckCircle, Globe
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────

type Role = 'mentor' | 'mentee' | 'both' | '';

/** Professional categories aligned with Forvis Mazars service lines */
const EXPERTISE_OPTIONS = [
  'Tax Advisory', 'Audit & Assurance', 'Corporate Finance', 'Accounting & Reporting',
  'Risk Advisory', 'ESG & Sustainability', 'Strategy & Transformation', 'Technology & Digital',
  'Legal & Compliance', 'Data Analytics', 'Deals & Transactions', 'HR & Talent Management',
  'Leadership & Management', 'Entrepreneurship', 'Marketing & Communications',
  'Healthcare Management', 'Education & Training', 'Agriculture & Food Security',
];

const LOCATION_OPTIONS = [
  'Nigeria', 'South Africa', 'Kenya', 'Ghana', 'Egypt', 'Morocco',
  'Ethiopia', 'Uganda', 'Tanzania', 'Algeria', 'Senegal', 'Rwanda',
  "Côte d'Ivoire", 'Cameroon', 'Zimbabwe', 'Zambia', 'Mozambique',
  'Other African Country', 'Diaspora',
];

const LANGUAGE_OPTIONS = [
  'English', 'French', 'Arabic', 'Swahili', 'Portuguese',
  'Hausa', 'Yoruba', 'Igbo', 'Zulu', 'Amharic', 'Wolof', 'Other',
];

const GOAL_OPTIONS = [
  'Career Growth', 'Skill Development', 'Networking', 'Leadership Development',
  'Knowledge Sharing', 'Industry Insights', 'Confidence Building', 'Work–Life Balance',
];

const EXPERIENCE_LEVELS = [
  'Junior (0–2 years)', 'Mid-level (3–5 years)', 'Senior (6–10 years)', 'Expert (10+ years)',
];

function toggle(arr: string[], v: string) {
  return arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`px-4 py-3 rounded-2xl border-2 text-sm font-medium transition-all flex items-center gap-2 ${
        selected
          ? 'border-[#1A1F5E] bg-[#1A1F5E] text-white shadow-md'
          : 'border-[#E5E7EB] bg-white text-[#333333] hover:border-[#1A1F5E]/40'
      }`}
    >
      {selected && <CheckCircle className="w-4 h-4 shrink-0" />}{label}
    </button>
  );
}

export default function SimpleOnboardingForm() {
  const navigate = useNavigate();
  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [data, setData] = useState({
    role: '' as Role,
    name: '', location: '',
    expertise: [] as string[],
    desired_expertise: [] as string[],
    experience: '',
    goals: [] as string[],
    availability: '',
    languages: [] as string[],
  });

  const TOTAL = 6;

  const canProceed = (): boolean => {
    switch (step) {
      case 1: return data.role !== '';
      case 2: return data.name.trim() !== '' && data.location !== '';
      case 3:
        if (data.role === 'mentor' || data.role === 'both') return data.expertise.length > 0;
        return data.desired_expertise.length > 0; // mentee: step3 = desired
      case 4:
        if (data.role === 'mentor')  return true;           // optional for mentors
        if (data.role === 'mentee')  return data.expertise.length > 0;
        if (data.role === 'both')    return data.desired_expertise.length > 0;
        return false;
      case 5: return data.experience !== '';
      case 6: return data.goals.length > 0 && data.availability !== '' && data.languages.length > 0;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true); setError('');
    try {
      const email    = sessionStorage.getItem('registrationEmail');
      const password = sessionStorage.getItem('registrationPassword');
      if (!email || !password) {
        setError('Registration data not found. Please restart registration.');
        return;
      }
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email, password,
          profile: {
            name: data.name, role: data.role, location: data.location,
            expertise: data.expertise, desired_expertise: data.desired_expertise,
            experience: data.experience, goals: data.goals,
            availability: data.availability, languages: data.languages,
          },
        }),
      });
      const result = await res.json();
      if (result.success) {
        sessionStorage.removeItem('registrationEmail');
        sessionStorage.removeItem('registrationPassword');
        navigate('/verification-pending');
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch { setError('Network error. Please check your connection.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F4F4] via-white to-[#F4F4F4] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border-t-4 border-t-[#1A1F5E] border border-[#E5E7EB] p-8">

          {/* Header */}
          <div className="mb-8">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Forvis_Mazars_logo.svg/320px-Forvis_Mazars_logo.svg.png"
              alt="Forvis Mazars" className="h-8 mb-4" />
            <div className="h-1 w-12 bg-[#E83E2D] rounded-full mb-3" />
            <h1 className="text-3xl font-bold text-[#1A1F5E] mb-1">Set up your profile</h1>
            <p className="text-[#8C8C8C]">Help us personalise your DEI Cafe experience</p>
            <div className="mt-4 flex items-center gap-2">
              {Array.from({ length: TOTAL }, (_, i) => (
                <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i + 1 <= step ? 'bg-[#1A1F5E]' : 'bg-[#E5E7EB]'} ${i + 1 === step ? 'w-16' : 'w-8'}`} />
              ))}
              <span className="ml-2 text-xs text-[#8C8C8C]">Step {step} of {TOTAL}</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-[#E83E2D]/10 border border-[#E83E2D]/30 text-[#E83E2D] px-5 py-4 rounded-2xl text-sm">{error}</div>
          )}

          {/* ── Step 1: Role ─────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#1A1F5E] flex items-center gap-2">
                  <Users className="w-6 h-6 text-[#E83E2D]" /> How do you want to participate?
                </h2>
                <p className="text-[#8C8C8C] text-sm mt-1">You can act as both a mentor and a mentee — choose what fits you best.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {([
                  { value: 'mentee', Icon: User,      label: 'Mentee',  desc: "I'm seeking guidance and mentorship to grow professionally", accent: false },
                  { value: 'mentor', Icon: Briefcase, label: 'Mentor',  desc: 'I want to share my expertise and guide others', accent: false },
                  { value: 'both',   Icon: Users,     label: 'Both',    desc: 'I mentor others and also seek mentorship myself', accent: true  },
                ] as const).map(({ value, Icon, label, desc, accent }) => (
                  <button key={value} type="button" onClick={() => setData({ ...data, role: value })}
                    className={`p-6 rounded-2xl border-2 text-left transition-all relative ${
                      data.role === value
                        ? accent ? 'border-[#E83E2D] bg-[#E83E2D]/5 shadow-md' : 'border-[#1A1F5E] bg-[#1A1F5E]/5 shadow-md'
                        : 'border-[#E5E7EB] hover:border-[#1A1F5E]/30'
                    }`}
                  >
                    {value === 'both' && <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-semibold bg-[#E83E2D]/10 text-[#E83E2D] rounded-full">Popular</span>}
                    <Icon className={`w-10 h-10 mb-3 ${data.role === value ? (accent ? 'text-[#E83E2D]' : 'text-[#1A1F5E]') : 'text-[#8C8C8C]'}`} />
                    <h3 className="text-lg font-semibold text-[#1A1F5E] mb-1">{label}</h3>
                    <p className="text-xs text-[#8C8C8C]">{desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 2: Basic Info ────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#1A1F5E] flex items-center gap-2">
                <User className="w-6 h-6 text-[#E83E2D]" /> Basic information
              </h2>
              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-2">Full name</label>
                <input type="text" value={data.name} onChange={e => setData({ ...data, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-[#E5E7EB] text-[#333333] placeholder-[#8C8C8C] focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all"
                  placeholder="Your full name" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-2">
                  <Globe className="w-4 h-4 inline mr-1 text-[#8C8C8C]" />Location
                </label>
                <select value={data.location} onChange={e => setData({ ...data, location: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-[#E5E7EB] text-[#333333] bg-white focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all">
                  <option value="">Select your country / region</option>
                  {LOCATION_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* ── Step 3 ── expertise or desired_expertise depending on role ── */}
          {step === 3 && (
            <div className="space-y-6">
              {(data.role === 'mentor' || data.role === 'both') ? (
                <>
                  <div>
                    <h2 className="text-2xl font-bold text-[#1A1F5E] flex items-center gap-2">
                      <Briefcase className="w-6 h-6 text-[#E83E2D]" /> Your areas of expertise
                    </h2>
                    <p className="text-[#8C8C8C] text-sm mt-1">Select the topics you can mentor others in. Mentees will be matched to you based on these.</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {EXPERTISE_OPTIONS.map(opt => (
                      <Chip key={opt} label={opt} selected={data.expertise.includes(opt)}
                        onClick={() => setData({ ...data, expertise: toggle(data.expertise, opt) })} />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h2 className="text-2xl font-bold text-[#1A1F5E] flex items-center gap-2">
                      <Target className="w-6 h-6 text-[#E83E2D]" /> Expertise you're seeking in a mentor
                    </h2>
                    <p className="text-[#8C8C8C] text-sm mt-1">
                      We'll only show you mentors in <strong>exactly these areas</strong> — not unrelated ones.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {EXPERTISE_OPTIONS.map(opt => (
                      <Chip key={opt} label={opt} selected={data.desired_expertise.includes(opt)}
                        onClick={() => setData({ ...data, desired_expertise: toggle(data.desired_expertise, opt) })} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Step 4 ─────────────────────────────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-6">
              {data.role === 'mentor' ? (
                <>
                  <div>
                    <h2 className="text-2xl font-bold text-[#1A1F5E] flex items-center gap-2">
                      <Users className="w-6 h-6 text-[#E83E2D]" /> Mentee backgrounds you enjoy working with
                    </h2>
                    <p className="text-[#8C8C8C] text-sm mt-1">Optional — helps us suggest well-matched mentees for you</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {EXPERTISE_OPTIONS.map(opt => (
                      <Chip key={opt} label={opt} selected={data.desired_expertise.includes(opt)}
                        onClick={() => setData({ ...data, desired_expertise: toggle(data.desired_expertise, opt) })} />
                    ))}
                  </div>
                </>
              ) : data.role === 'mentee' ? (
                <>
                  <div>
                    <h2 className="text-2xl font-bold text-[#1A1F5E] flex items-center gap-2">
                      <Briefcase className="w-6 h-6 text-[#E83E2D]" /> Your own professional background
                    </h2>
                    <p className="text-[#8C8C8C] text-sm mt-1">Helps mentors understand where you're coming from</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {EXPERTISE_OPTIONS.map(opt => (
                      <Chip key={opt} label={opt} selected={data.expertise.includes(opt)}
                        onClick={() => setData({ ...data, expertise: toggle(data.expertise, opt) })} />
                    ))}
                  </div>
                </>
              ) : (
                /* both — step 3 was their own expertise; step 4 = desired mentor expertise */
                <>
                  <div>
                    <h2 className="text-2xl font-bold text-[#1A1F5E] flex items-center gap-2">
                      <Target className="w-6 h-6 text-[#E83E2D]" /> Expertise you're seeking in a mentor
                    </h2>
                    <p className="text-[#8C8C8C] text-sm mt-1">Even as a mentor yourself, you can still seek mentorship in other areas.</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {EXPERTISE_OPTIONS.map(opt => (
                      <Chip key={opt} label={opt} selected={data.desired_expertise.includes(opt)}
                        onClick={() => setData({ ...data, desired_expertise: toggle(data.desired_expertise, opt) })} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Step 5: Experience ────────────────────────────────────────── */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#1A1F5E] flex items-center gap-2">
                <Building2 className="w-6 h-6 text-[#E83E2D]" /> Your experience level
              </h2>
              <div className="space-y-3">
                {EXPERIENCE_LEVELS.map(level => (
                  <button key={level} type="button" onClick={() => setData({ ...data, experience: level })}
                    className={`w-full px-6 py-4 rounded-2xl border-2 text-left font-medium transition-all ${
                      data.experience === level
                        ? 'border-[#1A1F5E] bg-[#1A1F5E]/5 text-[#1A1F5E]'
                        : 'border-[#E5E7EB] text-[#333333] hover:border-[#1A1F5E]/30'
                    }`}
                  >
                    {data.experience === level && <CheckCircle className="w-4 h-4 inline mr-2 text-[#1A1F5E]" />}
                    {level}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 6: Goals, Availability, Languages ────────────────────── */}
          {step === 6 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-[#1A1F5E] flex items-center gap-2">
                <Clock className="w-6 h-6 text-[#E83E2D]" /> Final details
              </h2>
              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-3">
                  Your goals <span className="font-normal text-[#8C8C8C]">(select all that apply)</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {GOAL_OPTIONS.map(goal => (
                    <Chip key={goal} label={goal} selected={data.goals.includes(goal)}
                      onClick={() => setData({ ...data, goals: toggle(data.goals, goal) })} />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-2">Availability per week</label>
                <select value={data.availability} onChange={e => setData({ ...data, availability: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-[#E5E7EB] text-[#333333] bg-white focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all">
                  <option value="">Select availability</option>
                  <option>1-2 hours/week</option>
                  <option>3-5 hours/week</option>
                  <option>5-10 hours/week</option>
                  <option>10+ hours/week</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-3">
                  Languages <span className="font-normal text-[#8C8C8C]">(select all you speak)</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {LANGUAGE_OPTIONS.map(l => (
                    <Chip key={l} label={l} selected={data.languages.includes(l)}
                      onClick={() => setData({ ...data, languages: toggle(data.languages, l) })} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Navigation ────────────────────────────────────────────────── */}
          <div className="flex justify-between items-center pt-8 border-t border-[#E5E7EB] mt-8">
            <button type="button" onClick={() => setStep(s => Math.max(s - 1, 1))} disabled={step === 1}
              className="flex items-center gap-2 px-6 py-3 text-[#1A1F5E] font-medium disabled:opacity-40 hover:text-[#E83E2D] transition-colors">
              <ArrowLeft className="w-5 h-5" /> Previous
            </button>
            {step < TOTAL ? (
              <button type="button" onClick={() => setStep(s => s + 1)} disabled={!canProceed()}
                className="flex items-center gap-2 bg-gradient-to-r from-[#0072CE] to-[#1A1F5E] text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:opacity-90 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:scale-100">
                Next <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={!canProceed() || loading}
                className="flex items-center gap-2 bg-gradient-to-r from-[#0072CE] to-[#1A1F5E] text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:opacity-90 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:scale-100">
                {loading
                  ? <><Loader className="w-5 h-5 animate-spin" /> Creating profile…</>
                  : <><CheckCircle className="w-5 h-5" /> Complete registration</>}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );}