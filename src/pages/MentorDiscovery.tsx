import { useState, useEffect, useRef } from 'react';
import { Search, Star, MapPin, Clock, CheckCircle, TrendingUp, Heart, ChevronLeft, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { useSimpleAuth } from '../contexts/SimpleAuthContext';
import { useLocation } from 'react-router-dom';

interface Mentor {
  id: string;
  name: string;
  role: string;       // seniority level e.g. "Senior (6–10 years)"
  company: string;
  location: string;
  expertise: string[];
  bio: string;
  availability: string;
  languages: string[];
  rating: number;
  totalMentees: number;
  image: string;
  verified: boolean;
  matchScore?: number;
}

export default function MentorDiscovery() {
  const { currentUser } = useSimpleAuth();
  const location = useLocation();
  // Role detection — mentors see prospective mentees; mentees see available mentors
  const isMentor = currentUser?.role === 'mentor' || currentUser?.role === 'both';
  // Stable keys — changing these triggers a rematch fetch
  const expertiseKey = (currentUser?.profile?.expertise || []).join(',');
  const desiredKey   = (currentUser?.profile?.desired_expertise || []).join(',');
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [loading, setLoading] = useState(true);
  const [savedMentors, setSavedMentors] = useState<Set<string>>(new Set());
  const [connectedMentors, setConnectedMentors] = useState<Set<string>>(new Set());
  const [connectingMentors, setConnectingMentors] = useState<Set<string>>(new Set());
  const [connectError, setConnectError] = useState<string | null>(null);
  const [animatingMentor, setAnimatingMentor] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<string>('for-you');
  const tabScrollRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 6;

  // Build dynamic category tabs from loaded mentors/mentees
  const categoryTabs = [
    { id: 'for-you', label: '✨ For You' },
    { id: 'all', label: 'All' },
    ...Array.from(new Set(mentors.flatMap(m => m.expertise)))
      .sort()
      .map(exp => ({ id: exp, label: exp })),
  ];

  useEffect(() => {
    loadMentors();
    loadExistingConnections();
  // Re-fetch whenever role or either expertise list changes (e.g. after updating profile)
  }, [isMentor, expertiseKey, desiredKey, location.search]);

  useEffect(() => {
    filterMentors();
  }, [searchQuery, selectedLocation, mentors, activeTab]);

  const loadExistingConnections = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/connections', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      const connections: any[] = data.data?.connections || data.connections || [];
      const alreadyConnected = new Set<string>(
        connections
          .filter(c => c.status === 'pending' || c.status === 'active' || c.status === 'accepted')
          .map(c => c.expert_id || c.mentor_id)
          .filter(Boolean)
      );
      setConnectedMentors(alreadyConnected);
    } catch {
      // silently ignore
    }
  };

  const loadMentors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // Mentors see prospective mentees; mentees see available mentors
      const endpoint = isMentor ? '/api/matching/mentees' : '/api/matching/mentors';
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      // Both endpoints return differently keyed arrays
      const raw: any[] = data.data?.mentors || data.data?.mentees || [];
      const list: Mentor[] = raw.map((m: any) => ({
        id: m.id || m.user_id,
        name: m.name,
        role: m.title || m.experience || 'Professional',
        company: 'Forvis Mazars',
        location: m.location || '',
        // For mentees, show their desired_expertise as expertise chips
        expertise: Array.isArray(m.expertise) ? m.expertise
          : Array.isArray(m.desired_expertise) ? m.desired_expertise
          : [],
        bio: m.bio || '',
        availability: m.availability || 'Flexible',
        languages: Array.isArray(m.languages) ? m.languages : [],
        rating: m.averageRating || 0,
        totalMentees: m.activeMenteeCount || 0,
        image: m.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=1A1F5E&color=fff&size=200`,
        verified: true,
        matchScore: m.matchScore ?? m.match_score ?? 0,
      }));
      setMentors(list);
      setFilteredMentors(list);
    } catch (error) {
      console.error('Failed to load matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMentors = () => {
    let filtered = mentors;

    if (searchQuery) {
      filtered = filtered.filter(mentor =>
        mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.expertise.some(exp => exp.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Tab filtering
    if (activeTab === 'for-you') {
      // Only show mentors with ≥1 matching expertise tag — exclude completely unrelated ones
      filtered = filtered
        .filter(m => (m.matchScore ?? 0) > 0)
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    } else if (activeTab !== 'all') {
      filtered = filtered.filter(mentor =>
        mentor.expertise.some(exp => exp.toLowerCase() === activeTab.toLowerCase())
      );
    }

    // Keep legacy location filter working
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(mentor => mentor.location.includes(selectedLocation));
    }

    setFilteredMentors(filtered);
    setCurrentPage(1);
  };

  const toggleSaveMentor = (mentorId: string) => {
    setSavedMentors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mentorId)) {
        newSet.delete(mentorId);
      } else {
        newSet.add(mentorId);
      }
      return newSet;
    });
  };

  const handleConnect = async (personId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    if (!currentUser?.id) {
      setConnectError('You must be logged in to send a connection request.');
      return;
    }
    setConnectError(null);

    // Mark button as loading
    setConnectingMentors(prev => new Set(prev).add(personId));

    try {
      const token = localStorage.getItem('token');
      if (!token) { setConnectError('Session expired — please log in again.'); return; }

      // When mentor views mentees: currentUser IS the mentor, personId is the mentee's user_id
      // When mentee views mentors:  personId is the mentor's expert_id, currentUser is the mentee
      const body = isMentor
        ? { mentor_id: (currentUser as any).expert_id || currentUser.id, mentee_id: personId }
        : { mentor_id: personId, mentee_id: currentUser.id };

      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      let data: any = {};
      try { data = await res.json(); } catch { /* non-JSON body */ }

      if (!res.ok) {
        setConnectError(data.message || `Request failed (${res.status})`);
        return;
      }

      // Success — run flying-avatar animation
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const profileIcon = document.querySelector('[data-profile-icon]');
      const mentor = mentors.find(m => m.id === personId);
      if (profileIcon && mentor) {
        const profileRect = profileIcon.getBoundingClientRect();
        const flyingAvatar = document.createElement('div');
        flyingAvatar.innerHTML = `<img src="${mentor.image}" alt="${mentor.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
        flyingAvatar.style.cssText = `position:fixed;width:60px;height:60px;border-radius:50%;left:${rect.left + rect.width / 2 - 30}px;top:${rect.top + rect.height / 2 - 30}px;z-index:9999;pointer-events:none;box-shadow:0 10px 40px rgba(0,0,0,0.3);border:3px solid white;transition:left 0.8s cubic-bezier(0.2,0.7,0.2,1),top 0.8s cubic-bezier(0.2,0.7,0.2,1),transform 0.8s,opacity 0.8s;`;
        document.body.appendChild(flyingAvatar);
        setTimeout(() => {
          flyingAvatar.style.left = `${profileRect.left + profileRect.width / 2 - 30}px`;
          flyingAvatar.style.top = `${profileRect.top + profileRect.height / 2 - 30}px`;
          flyingAvatar.style.transform = 'scale(0.3)';
          flyingAvatar.style.opacity = '0';
        }, 50);
        setTimeout(() => document.body.removeChild(flyingAvatar), 900);
      }

      setConnectedMentors(prev => new Set(prev).add(personId));
      setAnimatingMentor(personId);
      setTimeout(() => setAnimatingMentor(null), 1000);
    } catch (err: any) {
      setConnectError(err?.message || 'Could not reach the server — is it running?');
    } finally {
      setConnectingMentors(prev => { const s = new Set(prev); s.delete(personId); return s; });
    }
  };

  const handleDisconnect = (personId: string) => {
    setConnectedMentors(prev => {
      const newSet = new Set(prev);
      newSet.delete(personId);
      return newSet;
    });
  };

  const calculateMatchScore = (mentor: Mentor): number => {
    // Backend now returns a proper 0–97 percentage already computed server-side
    // (exact field = 95%, related field = 65%, weighted average across desired topics)
    return mentor.matchScore ?? 0;
  };

  const locationOptions = ['all', 'South Africa', 'Nigeria', 'Kenya', 'Ghana', 'Egypt', 'Morocco', 'Ethiopia', 'Uganda', 'Tanzania', 'Algeria', 'Diaspora'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1A1F5E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading mentors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F4F4] via-white to-[#F4F4F4]">
      {/* Professional Header with Forvis Mazars Branding */}
      <div className="bg-[#1A1F5E] text-white">
        <div className="max-w-[1920px] mx-auto px-12 sm:px-16 lg:px-20 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-3 text-white">Professional Mentorship Network</h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              {isMentor
                ? 'See professionals seeking your expertise. Matched and ranked by how well their desired areas align with your skills.'
                : 'Connect with experienced professionals from Forvis Mazars. Find mentors who align with your career goals and professional development needs.'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-12 sm:px-16 lg:px-20 py-8">
        {/* Search bar */}
        <div className="bg-white -2xl shadow-sm border border-[#E5E7EB] p-4 mb-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8C8C] w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, role, or expertise…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-[#E5E7EB] -2xl text-[#333333] placeholder-[#8C8C8C] focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8C8C] w-4 h-4" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="pl-10 pr-8 py-3 border-2 border-[#E5E7EB] -2xl text-[#333333] bg-white focus:outline-none focus:border-[#1A1F5E] transition-all appearance-none text-sm"
              >
                {locationOptions.map(opt => (
                  <option key={opt} value={opt}>{opt === 'all' ? 'All locations' : opt}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Category tab bar */}
        <div className="relative mb-6">
          <button
            onClick={() => tabScrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-[#E5E7EB] -full p-1 shadow-sm hover:shadow-md transition-shadow"
          >
            <ChevronLeft className="w-4 h-4 text-[#333333]" />
          </button>
          <div
            ref={tabScrollRef}
            className="flex items-center gap-2 overflow-x-auto scroll-smooth px-8 pb-1 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categoryTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                className={`flex-shrink-0 px-5 py-2.5 -full text-sm font-semibold transition-all duration-200 border-2 ${
                  activeTab === tab.id
                    ? 'bg-[#1A1F5E] text-white border-[#1A1F5E] shadow-lg'
                    : 'bg-white text-[#333333] border-[#E5E7EB] hover:border-[#1A1F5E] hover:text-[#1A1F5E]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => tabScrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-[#E5E7EB] -full p-1 shadow-sm hover:shadow-md transition-shadow"
          >
            <ChevronRight className="w-4 h-4 text-[#333333]" />
          </button>
        </div>

        {/* Active filter chips */}
        {(searchQuery || selectedLocation !== 'all') && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {searchQuery && (
              <span className="px-3 py-1 bg-[#1A1F5E]/10 text-[#1A1F5E] -full text-sm font-medium">
                Search: "{searchQuery}"
              </span>
            )}
            {selectedLocation !== 'all' && (
              <span className="px-3 py-1 bg-[#1A1F5E]/10 text-[#1A1F5E] -full text-sm font-medium">
                📍 {selectedLocation}
              </span>
            )}
            <button
              onClick={() => { setSearchQuery(''); setSelectedLocation('all'); }}
              className="text-sm text-[#E83E2D] font-medium hover:underline"
            >
              Clear
            </button>
          </div>
        )}

        {/* For You banner */}
        {activeTab === 'for-you' && (
          <div className="bg-white border border-[#1A1F5E]/20 -2xl p-5 mb-5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✨</span>
              <div>
                <p className="text-sm font-semibold text-[#1A1F5E]">Personalised for you</p>
                <p className="text-xs text-[#8C8C8C]">
                  {isMentor
                    ? 'Mentees are ranked by how well their learning goals align with your expertise.'
                    : 'Mentors are ranked by how well their expertise matches what you want to learn.'}
                </p>
              </div>
            </div>
            {/* Show user's own expertise context */}
            <div className="grid sm:grid-cols-2 gap-3 pt-1 border-t border-[#E5E7EB]">
              {(currentUser?.profile?.expertise || []).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[#8C8C8C] uppercase tracking-wide mb-2">My Expertise</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(currentUser?.profile?.expertise || []).map(s => (
                      <span key={s} className="px-2.5 py-1 bg-[#1A1F5E]/10 text-[#1A1F5E] rounded-full text-xs font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {(currentUser?.profile?.desired_expertise || []).length > 0 ? (
                <div>
                  <p className="text-xs font-semibold text-[#8C8C8C] uppercase tracking-wide mb-2">
                    {isMentor ? 'My Mentoring Focus' : 'Looking to Learn'}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(currentUser?.profile?.desired_expertise || []).map(s => (
                      <span key={s} className="px-2.5 py-1 bg-[#0072CE]/10 text-[#0072CE] rounded-full text-xs font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-[#E83E2D] bg-[#E83E2D]/5 border border-[#E83E2D]/20 rounded-xl px-3 py-2">
                  <span>⚠</span>
                  <span>
                    {isMentor
                      ? <>No mentoring focus set — <a href="/profile" className="underline font-semibold">add topics in your profile</a> to filter your matches.</>  
                      : <>No learning goals set — <a href="/profile" className="underline font-semibold">add them in your profile</a> to improve your matches.</> }
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {connectError && (
          <div className="flex items-center gap-3 bg-[#E83E2D]/10 border border-[#E83E2D]/30 text-[#E83E2D] px-5 py-3 -2xl mb-4 text-sm font-medium">
            {connectError}
            <button onClick={() => setConnectError(null)} className="ml-auto font-bold">✕</button>
          </div>
        )}
        <p className="text-sm text-[#8C8C8C] mb-5 flex items-center gap-3">
          Showing <span className="font-semibold text-[#1A1F5E]">{filteredMentors.length}</span> mentor{filteredMentors.length !== 1 ? 's' : ''}
          {activeTab !== 'for-you' && activeTab !== 'all' ? <> in <span className="font-semibold text-[#1A1F5E]">{activeTab}</span></> : ''}
          <button
            onClick={() => loadMentors()}
            className="ml-auto flex items-center gap-1.5 text-xs text-[#0072CE] font-semibold hover:text-[#1A1F5E] transition-colors"
            title="Reload matches from server"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((mentor) => {
            const matchScore = calculateMatchScore(mentor);
            const isSaved = savedMentors.has(mentor.id);
            const isConnected = connectedMentors.has(mentor.id);
            const isAnimating = animatingMentor === mentor.id;

            return (
              <div
                key={mentor.id}
                className={`bg-white -2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 group hover:scale-[1.02] ${
                  isAnimating ? 'ring-4 ring-green-400 ring-opacity-50' : ''
                }`}
              >
                <div className="relative h-48 bg-gradient-to-br from-[#1A1F5E] to-[#0072CE]">
                  <img
                    src={mentor.image}
                    alt={mentor.name}
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
                  />
                  <div className="absolute top-4 left-4 backdrop-blur-sm -full px-3 py-1 flex items-center space-x-1"
                    style={{ background: matchScore >= 70 ? 'rgba(26,31,94,0.95)' : matchScore >= 40 ? 'rgba(0,114,206,0.95)' : 'rgba(140,140,140,0.90)' }}
                  >
                    <TrendingUp className="w-4 h-4 text-white" />
                    <span className="text-sm font-bold text-white">{matchScore}% Match</span>
                  </div>
                  <button
                    onClick={() => toggleSaveMentor(mentor.id)}
                    className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm -full p-2 hover:bg-white transition-all"
                  >
                    <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                  </button>
                  {mentor.verified && (
                    <div className="absolute bottom-4 left-4 bg-[#1A1F5E] text-white -full px-3 py-1 flex items-center space-x-1 text-xs font-medium">
                      <CheckCircle className="w-4 h-4" />
                      <span>Verified</span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-[#1A1F5E] transition-colors">
                      {mentor.name}
                    </h3>
                    {/* Seniority level badge */}
                    <span className="inline-block px-3 py-1 -full text-xs font-semibold bg-[#1A1F5E]/8 text-[#1A1F5E] border border-[#1A1F5E]/20 mb-1">
                      {mentor.role}
                    </span>
                    <p className="text-sm font-medium text-[#1A1F5E]">{mentor.company}</p>
                  </div>

                  <div className="flex items-center space-x-1 text-sm text-gray-500 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{mentor.location}</span>
                  </div>

                  <div className="flex items-center space-x-4 mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold text-gray-900">{mentor.rating}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {mentor.totalMentees} mentees
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Expertise</p>
                    <div className="flex flex-wrap gap-2">
                      {mentor.expertise.slice(0, 3).map((exp, idx) => (
                        <button
                          key={idx}
                          onClick={() => { setActiveTab(exp); setCurrentPage(1); }}
                          className="px-3 py-1 bg-[#F4F4F4] text-[#1A1F5E] -lg text-xs font-medium border border-[#0072CE]/30 hover:bg-[#1A1F5E] hover:text-white transition-colors"
                        >
                          {exp}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm mb-4">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="text-gray-600">Available: <span className="font-medium text-green-600">{mentor.availability}</span></span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {mentor.bio}
                  </p>

                  <div className="flex space-x-2">
                    {isConnected ? (
                      <button 
                        onClick={() => handleDisconnect(mentor.id)}
                        className="flex-1 bg-[#1A1F5E] hover:opacity-90 text-white py-2.5 -lg font-semibold transition-all shadow-sm flex items-center justify-center space-x-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>Connected</span>
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => handleConnect(mentor.id, e)}
                        disabled={connectingMentors.has(mentor.id)}
                        className="flex-1 bg-[#1A1F5E] hover:opacity-90 text-white py-2.5 -lg font-semibold transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {connectingMentors.has(mentor.id) ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                        ) : 'Connect'}
                      </button>
                    )}
                    <button className="px-4 py-2.5 border-2 border-[#1A1F5E] text-[#1A1F5E] hover:bg-[#1A1F5E]/5 -lg font-semibold transition-all">
                      View
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredMentors.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-[#1A1F5E]/10 -3xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-[#1A1F5E]/40" />
            </div>
            <h3 className="text-xl font-semibold text-[#1A1F5E] mb-2">No mentors found</h3>
            <p className="text-[#8C8C8C] mb-6">Try a different category or clear your search</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedLocation('all'); setActiveTab('all'); }}
              className="px-6 py-3 bg-[#1A1F5E] text-white -full font-semibold hover:opacity-90 transition-all shadow-lg"
            >
              Show all mentors
            </button>
          </div>
        )}

        {/* Pagination */}
        {filteredMentors.length > itemsPerPage && (
          <div className="mt-8 flex justify-center items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 -lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: Math.ceil(filteredMentors.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 -lg transition-colors ${
                  currentPage === page
                    ? 'bg-[#0072CE] text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredMentors.length / itemsPerPage)))}
              disabled={currentPage === Math.ceil(filteredMentors.length / itemsPerPage)}
              className="px-4 py-2 border border-gray-300 -lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}