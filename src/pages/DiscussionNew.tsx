import React, { useState } from 'react';
import { MessageSquare, Video, Users, ChevronRight, CheckCircle, Lightbulb, BookOpen, HelpCircle, Flame, Heart, Globe, Star, ArrowRight } from 'lucide-react';

const tabs = ['Overview', 'Discussion Topics', 'Conversation Starters', 'Community Guidelines', 'FAQ'];

const topicGroups = [
  {
    category: 'DEI & Inclusion',
    color: 'border-t-[#E83E2D]',
    icon: <Heart className="w-5 h-5 text-[#E83E2D]" />,
    topics: [
      'Navigating microaggressions in the workplace',
      'Building psychological safety within teams',
      'Allyship — what it means and how to practise it',
      'Intersectionality in professional settings',
      "Sponsorship vs. mentorship — what's the difference?",
    ],
  },
  {
    category: 'Leadership & Career Growth',
    color: 'border-t-[#1A1F5E]',
    icon: <Star className="w-5 h-5 text-[#1A1F5E]" />,
    topics: [
      'How to advocate for yourself in performance reviews',
      'Building executive presence as a woman or minority professional',
      'Transitioning from individual contributor to manager',
      'Managing up — communicating with senior stakeholders',
      'Setting boundaries while remaining ambitious',
    ],
  },
  {
    category: 'Global & Cross-Cultural Work',
    color: 'border-t-[#0072CE]',
    icon: <Globe className="w-5 h-5 text-[#0072CE]" />,
    topics: [
      'Working across time zones and cultures',
      'Code-switching — when it helps and when it harms',
      'Cultural intelligence (CQ) and why it matters',
      'Building trust in remote and hybrid teams',
      'Navigating language barriers in global organisations',
    ],
  },
  {
    category: 'Well-being & Sustainability',
    color: 'border-t-green-600',
    icon: <Flame className="w-5 h-5 text-green-600" />,
    topics: [
      'Preventing burnout while pushing for advancement',
      'Mental health stigma in professional environments',
      'Building a support network outside your organisation',
      'Sustainable ambition — pacing your career journey',
      'Work-life integration (not just balance)',
    ],
  },
];

const conversationStarters = [
  {
    for: 'Mentees → Mentors',
    starters: [
      "\"What's the most important career lesson you wish someone had told you earlier?\"",
      '"How did you handle moments where you felt like an outsider in the room?"',
      '"What does your personal definition of success look like today, and how has it evolved?"',
      '"When you were at my stage, what did you do to get noticed for the right reasons?"',
      '"Is there a mistake you made early on that turned out to be the best learning experience?"',
    ],
  },
  {
    for: 'Mentors → Mentees',
    starters: [
      '"Where do you feel most energised at work, and where do you feel most drained?"',
      '"What does your ideal role look like in three years, and what\'s standing between you and that?"',
      '"Tell me about a recent challenge — what did you try, and what happened?"',
      '"Who in the organisation do you admire, and what specifically draws you to their approach?"',
      '"What feedback have you received that you\'re still processing?"',
    ],
  },
  {
    for: 'Group / Community Discussions',
    starters: [
      '"What\'s one thing the organisation could do tomorrow to become more inclusive?"',
      '"Share a moment when you felt truly seen and valued at work — what made that happen?"',
      '"What\'s a word or phrase often used in corporate environments that you think deserves more scrutiny?"',
      '"Who is someone whose career you find inspiring, and what stands out about their journey?"',
      '"What advice would you give your 22-year-old self about navigating a career in this industry?"',
    ],
  },
];

const guidelines = [
  {
    icon: <Heart className="w-5 h-5 text-[#E83E2D]" />,
    title: 'Assume positive intent',
    body: "Enter every conversation with the assumption that fellow members are here to grow and connect, not to offend. If something lands badly, address it directly and generously.",
  },
  {
    icon: <Users className="w-5 h-5 text-[#1A1F5E]" />,
    title: 'Make space, take space',
    body: "Be mindful of how much air time you're taking. Actively invite others into the conversation, especially those who haven't spoken yet.",
  },
  {
    icon: <BookOpen className="w-5 h-5 text-[#0072CE]" />,
    title: 'Share your experience, not universal truths',
    body: 'Speak from your own perspective using "I" statements. Avoid generalising your experience to all people who share your background.',
  },
  {
    icon: <CheckCircle className="w-5 h-5 text-green-600" />,
    title: 'Confidentiality by default',
    body: "What's shared in mentoring conversations stays there unless explicitly agreed otherwise. Respect the trust that comes with vulnerability.",
  },
  {
    icon: <Lightbulb className="w-5 h-5 text-yellow-600" />,
    title: 'Challenge ideas, not people',
    body: 'Robust disagreement is healthy. Direct critique at the argument, approach, or framing — never at the person making it.',
  },
  {
    icon: <Globe className="w-5 h-5 text-[#E83E2D]" />,
    title: 'Honour different communication styles',
    body: 'People express themselves differently across cultures, personalities, and contexts. Directness is not always clarity; silence is not always agreement.',
  },
];

const faqs = [
  {
    q: 'Do I message my mentor here or on Teams?',
    a: 'All real-time conversation happens in Microsoft Teams. This platform handles your matching, session tracking, goals, and progress — while Teams handles the actual communication.',
  },
  {
    q: 'What should I talk about in my first session?',
    a: 'Start with introductions — share your background, current role, and what you hope to gain from the relationship. Ask your mentor the same. Then agree on how often you\'ll meet and what a successful mentorship looks like for both of you.',
  },
  {
    q: 'What if I run out of things to talk about?',
    a: 'Use the Discussion Topics and Conversation Starters tabs on this page. Also consider sharing a recent challenge, a resource you found interesting, or a goal update each session to keep momentum.',
  },
  {
    q: 'How long should each mentoring session be?',
    a: 'Most effective sessions run 45–60 minutes. Shorter sessions (30 min) work well for quick check-ins; longer ones (90 min) suit deep-dive sessions or goal setting.',
  },
  {
    q: "What if I feel the relationship isn't working?",
    a: "It's okay and normal for some pairings not to click. Raise it honestly with your mentor first — sometimes a conversation is all it takes. If it remains a poor fit, contact the DEI Café admin team to facilitate a rematch.",
  },
  {
    q: 'Can I have more than one mentor?',
    a: 'Yes. Many members benefit from multiple mentors with complementary expertise. You can request additional connections from the Mentor Discovery page.',
  },
];

const Chat: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F4F4] via-white to-[#F4F4F4]">
      {/* Header */}
      <div className="bg-[#1A1F5E] text-white">
        <div className="max-w-[1920px] mx-auto px-12 sm:px-16 lg:px-20 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-3">Discussions & Community</h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Resources, topics, and guidance to fuel meaningful mentoring conversations
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all duration-200 ${
                  activeTab === tab
                    ? 'border-[#E83E2D] text-[#1A1F5E]'
                    : 'border-transparent text-[#8C8C8C] hover:text-[#1A1F5E] hover:border-[#E5E7EB]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* ── OVERVIEW ── */}
        {activeTab === 'Overview' && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-xl p-10 border border-[#E5E7EB] border-t-4 border-t-[#1A1F5E]">
              <div className="text-center mb-8">
                <div className="h-1 w-12 bg-[#E83E2D] rounded-full mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-[#1A1F5E] mb-3">Connect via Microsoft Teams</h2>
                <p className="text-[#8C8C8C] text-base leading-relaxed max-w-2xl mx-auto">
                  All real-time conversations happen in Microsoft Teams — your one-stop hub for 1:1 chats, group channels, video calls, and file sharing with your mentor community.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {[
                  { icon: <MessageSquare className="w-5 h-5 text-[#0072CE]" />, label: 'Real-time chat & threaded conversations' },
                  { icon: <Video className="w-5 h-5 text-[#0072CE]" />, label: 'HD video calls with screen sharing' },
                  { icon: <Users className="w-5 h-5 text-[#1A1F5E]" />, label: 'Group channels for community discussions' },
                  { icon: <BookOpen className="w-5 h-5 text-[#1A1F5E]" />, label: 'File sharing and collaborative notes' },
                  { icon: <CheckCircle className="w-5 h-5 text-green-600" />, label: 'Meeting recording for later review' },
                  { icon: <Globe className="w-5 h-5 text-[#E83E2D]" />, label: 'Search full conversation history' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-[#F4F4F4] rounded-xl px-4 py-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                      {item.icon}
                    </div>
                    <span className="text-[#333333] text-sm font-medium">{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="text-center space-y-3">
                <a
                  href="https://teams.microsoft.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-[#1A1F5E] text-white font-semibold px-10 py-4 rounded-2xl shadow-lg hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Open Microsoft Teams</span>
                  <ChevronRight className="w-5 h-5" />
                </a>
                <p className="text-xs text-[#8C8C8C]">Sign in with your Forvis Mazars work account</p>
              </div>
            </div>

            {/* Suggested Channels */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-[#E5E7EB]">
              <div className="h-1 w-10 bg-[#1A1F5E] rounded-full mb-4" />
              <h3 className="text-xl font-bold text-[#1A1F5E] mb-2">Recommended Teams Channels to Join</h3>
              <p className="text-[#8C8C8C] text-sm mb-6">Ask your programme administrator to add you to these community channels in Teams.</p>
              <div className="space-y-3">
                {[
                  { name: '#general-mentoring', desc: 'Programme-wide announcements, resources, and community highlights' },
                  { name: '#dei-conversations', desc: 'Open forum for diversity, equity & inclusion discussions' },
                  { name: '#career-wins', desc: 'Share promotions, milestones, and achievements — celebrate each other' },
                  { name: '#ask-a-mentor', desc: 'Quick questions for the broader mentor community' },
                  { name: '#resources-and-reads', desc: 'Curated articles, podcasts, videos, and tools' },
                  { name: '#introductions', desc: 'New members introduce themselves to the community' },
                ].map((ch, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-[#F4F4F4] rounded-xl">
                    <span className="text-[#0072CE] font-bold text-sm mt-0.5 flex-shrink-0">{ch.name}</span>
                    <span className="text-[#8C8C8C] text-sm">{ch.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                { tab: 'Discussion Topics', icon: <Flame className="w-5 h-5 text-[#E83E2D]" />, desc: 'Browse curated topics for your next session' },
                { tab: 'Conversation Starters', icon: <Lightbulb className="w-5 h-5 text-yellow-500" />, desc: 'Never run out of things to talk about' },
                { tab: 'Community Guidelines', icon: <Heart className="w-5 h-5 text-[#1A1F5E]" />, desc: 'How we show up for each other' },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(item.tab)}
                  className="bg-white rounded-2xl shadow-md p-6 border border-[#E5E7EB] text-left hover:shadow-xl hover:scale-[1.02] transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-[#F4F4F4] rounded-xl flex items-center justify-center mb-3">{item.icon}</div>
                  <h4 className="font-semibold text-[#1A1F5E] mb-1 group-hover:text-[#E83E2D] transition-colors">{item.tab}</h4>
                  <p className="text-[#8C8C8C] text-sm">{item.desc}</p>
                  <div className="flex items-center gap-1 mt-3 text-[#0072CE] text-xs font-semibold">Explore <ArrowRight className="w-3 h-3" /></div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── DISCUSSION TOPICS ── */}
        {activeTab === 'Discussion Topics' && (
          <div className="space-y-6">
            <div className="mb-2">
              <div className="h-1 w-10 bg-[#E83E2D] rounded-full mb-3" />
              <h2 className="text-2xl font-bold text-[#1A1F5E]">Discussion Topics</h2>
              <p className="text-[#8C8C8C] mt-1">Use these themes to guide your mentoring sessions or spark group conversations.</p>
            </div>
            {topicGroups.map((group, i) => (
              <div key={i} className={`bg-white rounded-3xl shadow-xl p-8 border border-[#E5E7EB] border-t-4 ${group.color}`}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-[#F4F4F4] rounded-xl flex items-center justify-center">{group.icon}</div>
                  <h3 className="text-lg font-bold text-[#1A1F5E]">{group.category}</h3>
                </div>
                <ul className="space-y-3">
                  {group.topics.map((topic, j) => (
                    <li key={j} className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#F4F4F4] transition-colors">
                      <div className="w-2 h-2 rounded-full bg-[#E83E2D] mt-2 flex-shrink-0" />
                      <span className="text-[#333333] leading-relaxed">{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="bg-[#1A1F5E] rounded-3xl p-8 text-white text-center">
              <h4 className="text-lg font-bold mb-2">Ready to discuss?</h4>
              <p className="text-white/70 text-sm mb-5">Pick a topic, then start the conversation in Teams.</p>
              <a href="https://teams.microsoft.com" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#E83E2D] text-white font-semibold px-8 py-3 rounded-2xl hover:opacity-90 transition-all">
                Open Teams <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {/* ── CONVERSATION STARTERS ── */}
        {activeTab === 'Conversation Starters' && (
          <div className="space-y-6">
            <div className="mb-2">
              <div className="h-1 w-10 bg-[#E83E2D] rounded-full mb-3" />
              <h2 className="text-2xl font-bold text-[#1A1F5E]">Conversation Starters</h2>
              <p className="text-[#8C8C8C] mt-1">Thoughtful prompts to open up meaningful dialogue — paste them into Teams to kick things off.</p>
            </div>
            {conversationStarters.map((group, i) => (
              <div key={i} className="bg-white rounded-3xl shadow-xl p-8 border border-[#E5E7EB]">
                <div className="flex items-center gap-2 mb-5">
                  <span className="px-3 py-1 bg-[#1A1F5E]/10 text-[#1A1F5E] text-xs font-bold rounded-full">{group.for}</span>
                </div>
                <div className="space-y-3">
                  {group.starters.map((s, j) => (
                    <div key={j} className="flex items-start gap-3 p-4 bg-[#F4F4F4] rounded-2xl border border-[#E5E7EB] hover:border-[#1A1F5E]/30 transition-colors">
                      <Lightbulb className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <span className="text-[#333333] text-sm leading-relaxed italic">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-[#E5E7EB] border-t-4 border-t-[#0072CE]">
              <h3 className="text-lg font-bold text-[#1A1F5E] mb-3">How to use these starters</h3>
              <div className="space-y-3 text-sm text-[#333333] leading-relaxed">
                <p><span className="font-semibold">Before the session:</span> Pick 1–2 that feel relevant to where you are in your journey and share them with your mentor/mentee so you can both prepare.</p>
                <p><span className="font-semibold">During the session:</span> Use them as an opening, not a script — let the conversation evolve naturally from the initial prompt.</p>
                <p><span className="font-semibold">In group channels:</span> Post a starter in Teams and invite community members to respond before a scheduled group call.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── COMMUNITY GUIDELINES ── */}
        {activeTab === 'Community Guidelines' && (
          <div className="space-y-6">
            <div className="mb-2">
              <div className="h-1 w-10 bg-[#E83E2D] rounded-full mb-3" />
              <h2 className="text-2xl font-bold text-[#1A1F5E]">Community Guidelines</h2>
              <p className="text-[#8C8C8C] mt-1">The principles that make DEI Café a safe, generous, and high-trust space for everyone.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {guidelines.map((g, i) => (
                <div key={i} className="bg-white rounded-3xl shadow-xl p-7 border border-[#E5E7EB] hover:shadow-2xl transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-[#F4F4F4] rounded-xl flex items-center justify-center">{g.icon}</div>
                    <h4 className="font-bold text-[#1A1F5E]">{g.title}</h4>
                  </div>
                  <p className="text-[#8C8C8C] text-sm leading-relaxed">{g.body}</p>
                </div>
              ))}
            </div>
            <div className="bg-[#F4F4F4] rounded-3xl p-8 border border-[#E5E7EB]">
              <h3 className="font-bold text-[#1A1F5E] mb-2">Reporting a concern</h3>
              <p className="text-[#8C8C8C] text-sm leading-relaxed">
                If you experience or witness behaviour that violates these guidelines — in Teams or elsewhere in the programme — please reach out to the DEI Café admin team directly. All reports are handled confidentially and with care. We are committed to maintaining this as a safe and inclusive community.
              </p>
            </div>
          </div>
        )}

        {/* ── FAQ ── */}
        {activeTab === 'FAQ' && (
          <div className="space-y-6">
            <div className="mb-2">
              <div className="h-1 w-10 bg-[#E83E2D] rounded-full mb-3" />
              <h2 className="text-2xl font-bold text-[#1A1F5E]">Frequently Asked Questions</h2>
              <p className="text-[#8C8C8C] mt-1">Common questions about using Teams and getting the most from your mentoring conversations.</p>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-md p-7 border border-[#E5E7EB]">
                  <div className="flex items-start gap-3 mb-3">
                    <HelpCircle className="w-5 h-5 text-[#0072CE] flex-shrink-0 mt-0.5" />
                    <h4 className="font-bold text-[#1A1F5E]">{faq.q}</h4>
                  </div>
                  <p className="text-[#8C8C8C] text-sm leading-relaxed pl-8">{faq.a}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-[#E5E7EB] text-center">
              <h4 className="font-bold text-[#1A1F5E] mb-2">Still have a question?</h4>
              <p className="text-[#8C8C8C] text-sm mb-5">Post in the <span className="text-[#0072CE] font-semibold">#general-mentoring</span> Teams channel or contact your programme administrator.</p>
              <a href="https://support.microsoft.com/en-us/teams" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#0072CE] font-semibold text-sm hover:text-[#E83E2D] transition-colors">
                Visit Teams Help Centre <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Chat;
