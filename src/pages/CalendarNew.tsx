import React, { useState } from 'react';
import { Calendar, Video, Users, Clock, ChevronRight, CheckCircle, Plus, BookOpen, Lightbulb, AlertCircle, ArrowRight, Target } from 'lucide-react';

const tabs = ['Overview', 'How to Schedule', 'Session Templates', 'Meeting Tips', 'FAQ'];

const sessionTemplates = [
  {
    name: 'First Meeting',
    duration: '60 min',
    color: 'border-t-[#1A1F5E]',
    agenda: [
      { time: '0–5 min', item: 'Greetings & informal check-in' },
      { time: '5–15 min', item: 'Introductions — background, current role, journey so far' },
      { time: '15–25 min', item: 'Expectations — what each person hopes to get from the relationship' },
      { time: '25–45 min', item: 'Initial goals discussion — what does success look like in 6 months?' },
      { time: '45–55 min', item: 'Logistics — meeting frequency, preferred communication, boundaries' },
      { time: '55–60 min', item: 'Close — confirm next meeting date & one action each will take' },
    ],
  },
  {
    name: 'Regular Check-in',
    duration: '45 min',
    color: 'border-t-[#0072CE]',
    agenda: [
      { time: '0–5 min', item: 'Personal check-in — how are you doing this week?' },
      { time: '5–15 min', item: 'Progress update — what happened since last session?' },
      { time: '15–30 min', item: 'Deep dive — one specific challenge or opportunity to explore' },
      { time: '30–40 min', item: 'Action planning — what will you do before the next session?' },
      { time: '40–45 min', item: 'Reflection & close — one key takeaway each' },
    ],
  },
  {
    name: 'Goal Review Session',
    duration: '60 min',
    color: 'border-t-[#E83E2D]',
    agenda: [
      { time: '0–5 min', item: 'Opening — energy level and mindset check-in' },
      { time: '5–20 min', item: 'Review goals set last quarter — what was achieved, what wasn\'t?' },
      { time: '20–35 min', item: 'Reflect on blockers — what got in the way and why?' },
      { time: '35–50 min', item: 'Set new goals — SMART framework, prioritisation' },
      { time: '50–60 min', item: 'Commitment & accountability — specific next steps and timelines' },
    ],
  },
  {
    name: 'Career Strategy Session',
    duration: '90 min',
    color: 'border-t-green-600',
    agenda: [
      { time: '0–10 min', item: 'Context setting — where are you right now vs. where do you want to be?' },
      { time: '10–30 min', item: 'Skills audit — strengths, gaps, and development priorities' },
      { time: '30–50 min', item: 'Network mapping — who do you need to know, and how to get there?' },
      { time: '50–70 min', item: 'Visibility strategy — how to get noticed for the right reasons' },
      { time: '70–85 min', item: 'Action plan — 3 moves to make in the next 30 days' },
      { time: '85–90 min', item: 'Close — accountability check-in booked for follow-up' },
    ],
  },
];

const schedulingSteps = [
  {
    step: '1',
    title: 'Open Microsoft Teams',
    body: 'Log in with your Forvis Mazars work account and navigate to the Calendar tab on the left sidebar.',
  },
  {
    step: '2',
    title: 'Click "New Meeting"',
    body: 'Select "+ New Meeting" in the top right corner of the Calendar view to open the meeting creation form.',
  },
  {
    step: '3',
    title: 'Add your mentor or mentee',
    body: 'In the "Add required attendees" field, type your mentor\'s or mentee\'s name or email address. Teams will search your organisation directory.',
  },
  {
    step: '4',
    title: 'Set date, time & duration',
    body: 'Pick a date and time. Check the "Scheduling Assistant" tab to see your attendees\' availability and avoid conflicts.',
  },
  {
    step: '5',
    title: 'Add a title and agenda',
    body: 'Give the meeting a clear name (e.g. "DEI Café Mentoring — Monthly Check-in") and paste your agenda into the notes field so both parties arrive prepared.',
  },
  {
    step: '6',
    title: 'Send the invite',
    body: 'Click "Send". Your attendee will receive a calendar invite with a Teams meeting link. You can edit or cancel at any time.',
  },
];

const tips = [
  {
    icon: <Target className="w-5 h-5 text-[#E83E2D]" />,
    title: 'Prepare an agenda beforehand',
    body: 'Send a 2–3 point agenda to your mentor/mentee at least 24 hours before the session. This ensures you both arrive focused and use the time well.',
  },
  {
    icon: <Clock className="w-5 h-5 text-[#1A1F5E]" />,
    title: 'Start and end on time',
    body: 'Respecting your mentor/mentee\'s schedule is a form of respect. If you need more time, agree beforehand — don\'t let sessions bleed over.',
  },
  {
    icon: <BookOpen className="w-5 h-5 text-[#0072CE]" />,
    title: 'Take notes during the session',
    body: 'Use the Teams meeting notes feature or a shared document to capture key insights, commitments, and action items in real time.',
  },
  {
    icon: <CheckCircle className="w-5 h-5 text-green-600" />,
    title: 'End with clear actions',
    body: 'Every session should close with at least one specific, time-bound action per person. This keeps the relationship progressive rather than just conversational.',
  },
  {
    icon: <Users className="w-5 h-5 text-[#1A1F5E]" />,
    title: 'Meet regularly and consistently',
    body: 'Monthly is the minimum for productive mentoring relationships. Bi-weekly is ideal. Set up a recurring meeting in Teams so it never falls off the radar.',
  },
  {
    icon: <Lightbulb className="w-5 h-5 text-yellow-600" />,
    title: 'Follow up after each session',
    body: 'Send a brief message in Teams within 24 hours summarising what was discussed and confirming your committed actions. This builds accountability on both sides.',
  },
  {
    icon: <Video className="w-5 h-5 text-[#E83E2D]" />,
    title: 'Use video when possible',
    body: 'Video calls build trust and rapport significantly faster than audio-only. Even if you\'re in a noisy location, switching on camera for the first few minutes helps.',
  },
  {
    icon: <AlertCircle className="w-5 h-5 text-[#8C8C8C]" />,
    title: 'Reschedule, don\'t cancel',
    body: 'Life happens. If you need to move a session, do it as early as possible and suggest an alternative time in the same message — it signals commitment to the relationship.',
  },
];

const calFaqs = [
  {
    q: 'Do I schedule sessions here or in Teams?',
    a: 'Scheduling happens in Microsoft Teams Calendar. This page gives you templates, tips, and guidance — then you take that into Teams to set up the actual meeting with a video link.',
  },
  {
    q: 'How do I find out when my mentor is available?',
    a: "Use the Scheduling Assistant inside Teams when creating a meeting. It shows you attendees' free/busy status from their Outlook calendar so you can pick a time that works for everyone.",
  },
  {
    q: 'Can I set up a recurring mentoring session?',
    a: 'Yes. When creating a meeting in Teams, change the recurrence setting from "Does not repeat" to Weekly, Bi-weekly, or Monthly. This auto-creates all future sessions.',
  },
  {
    q: 'What if my mentor cancels frequently?',
    a: 'Raise it directly and kindly — it may be a diary management issue rather than a lack of commitment. If it continues, contact the DEI Café admin team for support.',
  },
  {
    q: 'Should I record my mentoring sessions?',
    a: "Only with explicit consent from both parties. If you do record, use the Teams built-in recording and store it in a shared private channel — never publish or share externally.",
  },
  {
    q: 'What time zone should I use when scheduling?',
    a: 'Teams Calendar automatically displays times in each attendee\'s local time zone. Always double-check the final invite to ensure there\'s no confusion, especially for global pairings.',
  },
];

export default function CalendarPage() {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F4F4] via-white to-[#F4F4F4]">
      {/* Header */}
      <div className="bg-[#1A1F5E] text-white">
        <div className="max-w-[1920px] mx-auto px-12 sm:px-16 lg:px-20 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-3">Calendar & Scheduling</h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Templates, tips, and guidance to help you schedule and run great mentoring sessions
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
            {/* Teams CTA */}
            <div className="bg-white rounded-3xl shadow-xl p-10 border border-[#E5E7EB] border-t-4 border-t-[#1A1F5E]">
              <div className="text-center mb-8">
                <div className="h-1 w-12 bg-[#E83E2D] rounded-full mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-[#1A1F5E] mb-3">Schedule via Microsoft Teams</h2>
                <p className="text-[#8C8C8C] text-base leading-relaxed max-w-2xl mx-auto">
                  All mentoring sessions are booked through Microsoft Teams Calendar — giving you integrated video links, reminders, and availability checks in one place.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {[
                  { icon: <Calendar className="w-5 h-5 text-[#0072CE]" />, label: 'Check availability before booking' },
                  { icon: <Video className="w-5 h-5 text-[#0072CE]" />, label: 'Auto-generated video meeting link' },
                  { icon: <Users className="w-5 h-5 text-[#1A1F5E]" />, label: 'Invite multiple attendees easily' },
                  { icon: <Clock className="w-5 h-5 text-[#1A1F5E]" />, label: 'Automatic time zone conversion' },
                  { icon: <CheckCircle className="w-5 h-5 text-green-600" />, label: 'Set up recurring sessions in one click' },
                  { icon: <BookOpen className="w-5 h-5 text-[#E83E2D]" />, label: 'Add agenda notes to the invite' },
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
                  href="https://teams.microsoft.com/l/meeting/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-[#1A1F5E] text-white font-semibold px-10 py-4 rounded-2xl shadow-lg hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  <Plus className="w-5 h-5" />
                  <span>Schedule New Meeting</span>
                  <ChevronRight className="w-5 h-5" />
                </a>
                <div className="flex items-center justify-center gap-4 pt-1">
                  <a href="https://teams.microsoft.com/l/calendar" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border-2 border-[#0072CE] text-[#0072CE] font-semibold px-5 py-2.5 rounded-xl hover:bg-[#0072CE]/5 transition-colors text-sm">
                    <Calendar className="w-4 h-4" /> View Calendar
                  </a>
                  <a href="https://teams.microsoft.com/l/meeting/join" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border-2 border-green-600 text-green-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-green-50 transition-colors text-sm">
                    <Video className="w-4 h-4" /> Join Meeting
                  </a>
                </div>
                <p className="text-xs text-[#8C8C8C]">Sign in with your Forvis Mazars work account</p>
              </div>
            </div>

            {/* Quick nav cards */}
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { tab: 'How to Schedule', icon: <Calendar className="w-5 h-5 text-[#0072CE]" />, desc: 'Step-by-step guide to booking in Teams' },
                { tab: 'Session Templates', icon: <BookOpen className="w-5 h-5 text-[#E83E2D]" />, desc: 'Ready-made agendas for every session type' },
                { tab: 'Meeting Tips', icon: <Lightbulb className="w-5 h-5 text-yellow-500" />, desc: 'Make every session count' },
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

        {/* ── HOW TO SCHEDULE ── */}
        {activeTab === 'How to Schedule' && (
          <div className="space-y-6">
            <div className="mb-2">
              <div className="h-1 w-10 bg-[#E83E2D] rounded-full mb-3" />
              <h2 className="text-2xl font-bold text-[#1A1F5E]">How to Schedule a Session</h2>
              <p className="text-[#8C8C8C] mt-1">Follow these six steps to book a mentoring session in Microsoft Teams.</p>
            </div>

            <div className="space-y-4">
              {schedulingSteps.map((s, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-md p-6 border border-[#E5E7EB] flex items-start gap-5">
                  <div className="w-10 h-10 bg-[#1A1F5E] rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">{s.step}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1A1F5E] mb-1">{s.title}</h4>
                    <p className="text-[#8C8C8C] text-sm leading-relaxed">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#1A1F5E] rounded-3xl p-8 text-white text-center">
              <h4 className="text-lg font-bold mb-2">Ready to book?</h4>
              <p className="text-white/70 text-sm mb-5">Open Teams Calendar and schedule your next session now.</p>
              <a href="https://teams.microsoft.com/l/meeting/new" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#E83E2D] text-white font-semibold px-8 py-3 rounded-2xl hover:opacity-90 transition-all">
                <Plus className="w-4 h-4" /> Schedule in Teams <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-sm">
              <h4 className="font-bold text-[#1A1F5E] mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-[#0072CE]" /> Need help with Teams?</h4>
              <p className="text-[#8C8C8C] text-sm mb-3">If you can't access Teams Calendar or need to set up your account, contact your IT administrator.</p>
              <a href="https://support.microsoft.com/en-us/office/schedule-a-meeting-in-microsoft-teams-943507a9-8583-4c58-b5d2-8ec8265e04e5"
                target="_blank" rel="noopener noreferrer"
                className="text-[#0072CE] hover:text-[#E83E2D] text-sm font-semibold inline-flex items-center gap-1 transition-colors">
                Microsoft Teams scheduling guide <ChevronRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* ── SESSION TEMPLATES ── */}
        {activeTab === 'Session Templates' && (
          <div className="space-y-6">
            <div className="mb-2">
              <div className="h-1 w-10 bg-[#E83E2D] rounded-full mb-3" />
              <h2 className="text-2xl font-bold text-[#1A1F5E]">Session Templates</h2>
              <p className="text-[#8C8C8C] mt-1">Ready-made agendas for each stage of your mentoring relationship. Copy the agenda into your Teams meeting notes.</p>
            </div>
            {sessionTemplates.map((tmpl, i) => (
              <div key={i} className={`bg-white rounded-3xl shadow-xl p-8 border border-[#E5E7EB] border-t-4 ${tmpl.color}`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-[#1A1F5E]">{tmpl.name}</h3>
                  <span className="flex items-center gap-1 px-3 py-1 bg-[#F4F4F4] rounded-full text-sm font-semibold text-[#333333]">
                    <Clock className="w-4 h-4 text-[#8C8C8C]" /> {tmpl.duration}
                  </span>
                </div>
                <div className="space-y-2">
                  {tmpl.agenda.map((item, j) => (
                    <div key={j} className="flex items-start gap-4 p-3 rounded-xl hover:bg-[#F4F4F4] transition-colors">
                      <span className="text-xs font-bold text-[#8C8C8C] w-20 flex-shrink-0 mt-0.5">{item.time}</span>
                      <span className="text-[#333333] text-sm leading-relaxed">{item.item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── MEETING TIPS ── */}
        {activeTab === 'Meeting Tips' && (
          <div className="space-y-6">
            <div className="mb-2">
              <div className="h-1 w-10 bg-[#E83E2D] rounded-full mb-3" />
              <h2 className="text-2xl font-bold text-[#1A1F5E]">Meeting Tips</h2>
              <p className="text-[#8C8C8C] mt-1">Practical habits that turn good mentoring sessions into great ones.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {tips.map((tip, i) => (
                <div key={i} className="bg-white rounded-3xl shadow-xl p-7 border border-[#E5E7EB] hover:shadow-2xl transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-[#F4F4F4] rounded-xl flex items-center justify-center flex-shrink-0">{tip.icon}</div>
                    <h4 className="font-bold text-[#1A1F5E] leading-tight">{tip.title}</h4>
                  </div>
                  <p className="text-[#8C8C8C] text-sm leading-relaxed">{tip.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FAQ ── */}
        {activeTab === 'FAQ' && (
          <div className="space-y-6">
            <div className="mb-2">
              <div className="h-1 w-10 bg-[#E83E2D] rounded-full mb-3" />
              <h2 className="text-2xl font-bold text-[#1A1F5E]">Frequently Asked Questions</h2>
              <p className="text-[#8C8C8C] mt-1">Common questions about scheduling and running mentoring sessions.</p>
            </div>
            <div className="space-y-4">
              {calFaqs.map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-md p-7 border border-[#E5E7EB]">
                  <div className="flex items-start gap-3 mb-3">
                    <AlertCircle className="w-5 h-5 text-[#0072CE] flex-shrink-0 mt-0.5" />
                    <h4 className="font-bold text-[#1A1F5E]">{faq.q}</h4>
                  </div>
                  <p className="text-[#8C8C8C] text-sm leading-relaxed pl-8">{faq.a}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-[#E5E7EB] text-center">
              <h4 className="font-bold text-[#1A1F5E] mb-2">Still need help?</h4>
              <p className="text-[#8C8C8C] text-sm mb-5">Visit the official Microsoft Teams help centre for detailed guidance on all Calendar features.</p>
              <a href="https://support.microsoft.com/en-us/office/schedule-a-meeting-in-microsoft-teams-943507a9-8583-4c58-b5d2-8ec8265e04e5"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#0072CE] font-semibold text-sm hover:text-[#E83E2D] transition-colors">
                Microsoft Teams Scheduling Guide <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
        {/* Info Card */}
        <div className="bg-white -2xl shadow-xl p-12 mb-12 border border-gray-200">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Schedule via Microsoft Teams</h2>
            <p className="text-lg text-gray-600">
              Microsoft Teams Calendar provides seamless scheduling, reminders, and video conferencing integration all in one place.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-[#F4F4F4] border-2 border-[#0072CE]/30 -xl p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#0072CE] -lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Scheduling</h3>
                  <p className="text-gray-600">Check availability, send invites, and get automatic reminders for all your sessions</p>
                </div>
              </div>
            </div>

            <div className="bg-[#F4F4F4] border-2 border-[#0072CE]/30 -xl p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#0072CE] -lg flex items-center justify-center flex-shrink-0">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">One-Click Meetings</h3>
                  <p className="text-gray-600">Join video calls directly from calendar invites with a single click</p>
                </div>
              </div>
            </div>

            <div className="bg-[#F4F4F4] border-2 border-[#E5E7EB] -xl p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#F4F4F4] -lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-[#1A1F5E]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Group Coordination</h3>
                  <p className="text-gray-600">Schedule group mentorship sessions and see everyone's availability</p>
                </div>
              </div>
            </div>

            <div className="bg-[#F4F4F4] border-2 border-[#E5E7EB] -xl p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#F4F4F4] -lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-[#1A1F5E]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Time Zone Support</h3>
                  <p className="text-gray-600">Automatic time zone detection for global team coordination</p>
                </div>
              </div>
            </div>
          </div>

          {/* What You Can Do Section */}
          <div className="bg-gradient-to-br from-[#F4F4F4] to-[#F4F4F4] border-2 border-[#0072CE]/30 -xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">What You Can Do in Teams Calendar</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Schedule one-on-one mentorship sessions',
                'Create recurring meeting series',
                'Set up group mentoring events',
                'View mentor availability in real-time',
                'Get meeting reminders and notifications',
                'Reschedule with automatic updates',
                'Add meeting agendas and notes',
                'Sync with Outlook Calendar'
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-[#0072CE] flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}\n            </div>
          </div>

          {/* CTA Buttons */}
          <div className="text-center space-y-4">
            <a
              href="https://teams.microsoft.com/l/meeting/new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-3 bg-[#1A1F5E] hover:opacity-90 text-white px-10 py-5 -xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
            >
              <Plus className="w-8 h-8" />
              <span>Schedule New Meeting</span>
              <ChevronRight className="w-6 h-6" />
            </a>
            
            <div className="flex items-center justify-center space-x-4">
              <a
                href="https://teams.microsoft.com/l/calendar"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-white border-2 border-[#0072CE] text-[#0072CE] hover:bg-[#1A1F5E]/5 px-6 py-3 -lg font-semibold transition-colors"
              >
                <Calendar className="w-5 h-5" />
                <span>View Calendar</span>
              </a>
              
              <a
                href="https://teams.microsoft.com/l/meeting/join"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-white border-2 border-green-600 text-green-600 hover:bg-green-50 px-6 py-3 -lg font-semibold transition-colors"
              >
                <Video className="w-5 h-5" />
                <span>Join Meeting</span>
              </a>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              You'll be redirected to Microsoft Teams. Make sure you're signed in with your work account.
            </p>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-gray-50 border border-gray-200 -xl p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            If you're having trouble accessing Teams Calendar or need assistance scheduling meetings, please contact your IT administrator or visit the Microsoft Teams help center.
          </p>
          <a
            href="https://support.microsoft.com/en-us/office/schedule-a-meeting-in-microsoft-teams-943507a9-8583-4c58-b5d2-8ec8265e04e5"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0072CE] hover:text-[#1A1F5E] font-medium inline-flex items-center space-x-1"
          >
            <span>Learn How to Schedule in Teams</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
