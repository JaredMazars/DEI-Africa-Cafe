import React, { useState, useEffect } from 'react';
import { Heart, Users, MapPin, MessageCircle, Calendar, ChevronRight, Filter, Search, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSimpleAuth } from '../contexts/SimpleAuthContext';
import { connectionsAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

interface MatchedPerson {
  id: string;
  name: string;
  title: string;
  location: string;
  avatar: string;
  expertise: string[];
  experience: string;
  bio: string;
  languages: string[];
  availability: string;
  matchScore: number;
  atCapacity: boolean;
  activeMenteeCount: number;
}

const containerVariants = {
  animate: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
} as const;

const MentorMatching: React.FC = () => {
  const { currentUser } = useSimpleAuth();
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [selected, setSelected] = useState<MatchedPerson | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allPeople, setAllPeople] = useState<MatchedPerson[]>([]);
  const [error, setError] = useState('');
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [connectSuccess, setConnectSuccess] = useState<string | null>(null);

  const isMentee = currentUser?.role === 'mentee' || currentUser?.role === 'both';
  const viewLabel = isMentee ? 'mentor' : 'mentee';

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        const endpoint = isMentee ? '/api/matching/mentors' : '/api/matching/mentees';
        const res = await fetch(endpoint, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();

        const raw = data.data?.mentors || data.data?.mentees || [];
        const list: MatchedPerson[] = raw.map((m: any) => ({
          id: m.user_id || m.id,
          name: m.name,
          title: m.experience || 'Professional',
          location: m.location || '',
          avatar:
            m.profile_image_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=1A1F5E&color=fff&size=128`,
          expertise: Array.isArray(m.expertise)
            ? m.expertise
            : m.expertise_list
            ? m.expertise_list.split(', ')
            : [],
          experience: m.experience || '',
          bio: m.bio || 'Experienced professional ready to connect.',
          languages: Array.isArray(m.languages)
            ? m.languages
            : m.languages_list
            ? m.languages_list.split(', ')
            : ['English'],
          availability: m.availability || 'available',
          matchScore: m.matchScore ?? m.match_score ?? 0,
          atCapacity: m.atCapacity ?? m.at_capacity ?? false,
          activeMenteeCount: m.activeMenteeCount ?? m.active_mentee_count ?? 0,
        }));

        setAllPeople(list);
      } catch {
        setError('Could not load matches. Please refresh.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isMentee]);

  const filtered = allPeople
    .filter(p => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.expertise.some(e => e.toLowerCase().includes(q)) ||
        p.location.toLowerCase().includes(q);
      const matchExp =
        selectedExpertise.length === 0 || p.expertise.some(e => selectedExpertise.includes(e));
      const matchLoc =
        !selectedLocation || p.location.toLowerCase().includes(selectedLocation.toLowerCase());
      return matchSearch && matchExp && matchLoc;
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  const allExpertise = Array.from(new Set(allPeople.flatMap(p => p.expertise))).sort();
  const allLocations = Array.from(
    new Set(allPeople.map(p => p.location.split(',')[0]?.trim()).filter(Boolean))
  ).sort();

  const spotsLeft = (p: MatchedPerson) => 3 - p.activeMenteeCount;

  const handleLike = (id: string) =>
    setLikedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));

  const handleConnect = async (person: MatchedPerson) => {
    if (person.atCapacity) return;
    try {
      setConnectingId(person.id);
      const mentorId = isMentee ? person.id : currentUser?.id || '';
      const menteeId = isMentee ? currentUser?.id || '' : person.id;
      await connectionsAPI.createConnection(mentorId, menteeId);
      setConnectSuccess(person.id);
      setTimeout(() => setConnectSuccess(null), 3000);
    } catch {
      alert('Failed to send connection request. Please try again.');
    } finally {
      setConnectingId(null);
    }
  };

  const desiredExpertise: string[] = (currentUser as any)?.desired_expertise || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F4F4] via-white to-[#F4F4F4]">

      {/* ── Header ── */}
      <div className="bg-[#1A1F5E] text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-1 w-10 bg-[#E83E2D] rounded-full mb-3" />
              <h1 className="text-3xl font-bold">
                {isMentee ? 'Find Your Mentor' : 'Connect with Mentees'}
              </h1>
              <p className="text-white/70 mt-1 text-base leading-relaxed">
                {isMentee
                  ? 'Professionals matched to your desired expertise areas'
                  : 'Mentees seeking your expertise'}
              </p>
              {desiredExpertise.length > 0 && isMentee && (
                <p className="text-[#E83E2D] text-sm mt-2 font-medium">
                  Matching on: {desiredExpertise.join(', ')}
                </p>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(v => !v)}
              className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white font-semibold transition-all duration-200"
            >
              <Filter className="w-4 h-4" />
              Filters
            </motion.button>
          </div>

          {/* Search bar */}
          <div className="mt-6 relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-[#8C8C8C]" />
            <input
              type="text"
              placeholder={`Search ${viewLabel}s by name, expertise or location…`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-transparent bg-white text-[#333333] placeholder-[#8C8C8C] focus:outline-none focus:border-[#0072CE] focus:ring-2 focus:ring-[#0072CE]/20 transition-all duration-200"
            />
          </div>

          {/* Filters panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 bg-white/10 border border-white/20 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-5 overflow-hidden"
              >
                <div>
                  <p className="text-sm font-semibold text-white mb-2">Expertise area</p>
                  <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                    {allExpertise.map(e => (
                      <button
                        key={e}
                        onClick={() =>
                          setSelectedExpertise(prev =>
                            prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]
                          )
                        }
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                          selectedExpertise.includes(e)
                            ? 'bg-[#E83E2D] text-white'
                            : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-2">Location</p>
                  <select
                    value={selectedLocation}
                    onChange={e => setSelectedLocation(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-transparent bg-white text-[#333333] focus:outline-none focus:border-[#0072CE] transition-all duration-200"
                  >
                    <option value="">All Locations</option>
                    {allLocations.map(l => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Stats row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xl font-bold text-[#1A1F5E]">{filtered.length}</span>
            <span className="text-[#8C8C8C] ml-1">
              {viewLabel}{filtered.length !== 1 ? 's' : ''} found
            </span>
            {selectedExpertise.length > 0 && (
              <button
                onClick={() => setSelectedExpertise([])}
                className="ml-3 text-xs text-[#E83E2D] underline"
              >
                Clear filters
              </button>
            )}
          </div>
          <Link
            to="/preferences"
            className="text-[#0072CE] text-sm font-semibold underline hover:text-[#E83E2D] transition-colors"
          >
            Update preferences →
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-[#1A1F5E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#8C8C8C]">Finding your best matches…</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex items-center gap-3 bg-[#E83E2D]/10 border border-[#E83E2D]/30 text-[#E83E2D] px-5 py-4 rounded-2xl mb-6">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Cards grid */}
        {!loading && !error && (
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filtered.map(person => (
              <motion.div
                key={person.id}
                variants={cardVariants}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`bg-white rounded-3xl shadow-xl border border-[#E5E7EB] overflow-hidden hover:shadow-2xl transition-shadow duration-300 ${
                  person.atCapacity ? 'opacity-70' : ''
                }`}
              >
                <div className="h-1 w-full bg-gradient-to-r from-[#1A1F5E] to-[#0072CE]" />
                <div className="p-6">

                  {/* Badges */}
                  <div className="flex items-center justify-between mb-3">
                    {person.matchScore > 0 ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#1A1F5E]/10 text-[#1A1F5E]">
                        {person.matchScore} area{person.matchScore !== 1 ? 's' : ''} matched
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#8C8C8C]/10 text-[#8C8C8C]">
                        Explore profile
                      </span>
                    )}

                    {isMentee &&
                      (person.atCapacity ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E83E2D]/10 text-[#E83E2D]">
                          Full (3/3)
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          {spotsLeft(person)} spot{spotsLeft(person) !== 1 ? 's' : ''} left
                        </span>
                      ))}
                  </div>

                  {/* Avatar + name */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={person.avatar}
                        alt={person.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#E5E7EB]"
                      />
                      <div>
                        <h3 className="text-xl font-semibold text-[#333333]">{person.name}</h3>
                        <p className="text-[#0072CE] text-sm font-medium">{person.title}</p>
                        {person.location && (
                          <div className="flex items-center gap-1 text-[#8C8C8C] text-xs mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {person.location}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleLike(person.id)}
                      className="p-2 rounded-full hover:bg-[#E83E2D]/10 transition-colors duration-200"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          likedIds.includes(person.id)
                            ? 'fill-[#E83E2D] text-[#E83E2D]'
                            : 'text-[#8C8C8C]'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Expertise chips */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {person.expertise.slice(0, 3).map((e, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-[#F4F4F4] text-[#333333] text-xs font-medium rounded-full border border-[#E5E7EB]"
                      >
                        {e}
                      </span>
                    ))}
                    {person.expertise.length > 3 && (
                      <span className="px-3 py-1 bg-[#F4F4F4] text-[#8C8C8C] text-xs rounded-full">
                        +{person.expertise.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setSelected(person);
                        setShowModal(true);
                      }}
                      className="w-full bg-gradient-to-r from-[#0072CE] to-[#1A1F5E] text-white font-semibold py-3 rounded-full hover:opacity-90 transition-all duration-200 shadow-lg"
                    >
                      View Profile
                    </motion.button>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="flex items-center justify-center gap-1.5 border-2 border-[#1A1F5E] text-[#1A1F5E] font-semibold py-2.5 rounded-full hover:bg-[#1A1F5E] hover:text-white transition-all duration-200 text-sm">
                        <MessageCircle className="w-4 h-4" />
                        Message
                      </button>
                      <button
                        onClick={() => handleConnect(person)}
                        disabled={person.atCapacity || connectingId === person.id}
                        className={`flex items-center justify-center gap-1.5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 ${
                          person.atCapacity
                            ? 'bg-[#F4F4F4] text-[#8C8C8C] cursor-not-allowed border-2 border-[#E5E7EB]'
                            : connectSuccess === person.id
                            ? 'bg-green-100 text-green-700 border-2 border-green-300'
                            : 'border-2 border-[#E83E2D] text-[#E83E2D] hover:bg-[#E83E2D] hover:text-white'
                        }`}
                      >
                        {connectSuccess === person.id ? (
                          <>
                            <CheckCircle className="w-4 h-4" /> Sent
                          </>
                        ) : connectingId === person.id ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Calendar className="w-4 h-4" /> Connect
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-[#1A1F5E]/10 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Users className="w-10 h-10 text-[#1A1F5E]" />
            </div>
            <h3 className="text-xl font-semibold text-[#1A1F5E] mb-2">No matches found</h3>
            <p className="text-[#8C8C8C] mb-4">
              Try adjusting your search or updating your preferences.
            </p>
            <Link
              to="/preferences"
              className="inline-block bg-gradient-to-r from-[#0072CE] to-[#1A1F5E] text-white font-semibold px-8 py-3 rounded-full hover:opacity-90 shadow-lg transition-all"
            >
              Update Preferences
            </Link>
          </div>
        )}
      </div>

      {/* ── Liked bar ── */}
      <AnimatePresence>
        {likedIds.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-[#1A1F5E] text-white px-6 py-4 shadow-2xl"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#E83E2D] fill-current" />
                <span className="font-semibold">
                  {likedIds.length} saved
                </span>
              </div>
              <button className="flex items-center gap-1 bg-[#E83E2D] hover:opacity-90 text-white font-semibold px-5 py-2 rounded-full transition-all">
                View saved <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Profile modal ── */}
      <AnimatePresence>
        {showModal && selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="h-2 bg-gradient-to-r from-[#1A1F5E] to-[#0072CE] rounded-t-3xl" />
              <div className="p-8">

                {/* Modal header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-5">
                    <img
                      src={selected.avatar}
                      alt={selected.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-[#1A1F5E]/10"
                    />
                    <div>
                      <h2 className="text-2xl font-bold text-[#1A1F5E]">{selected.name}</h2>
                      <p className="text-[#0072CE] font-medium">{selected.title}</p>
                      {selected.location && (
                        <div className="flex items-center gap-1 text-[#8C8C8C] text-sm mt-1">
                          <MapPin className="w-4 h-4" />
                          {selected.location}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 rounded-full hover:bg-[#1A1F5E]/10 text-[#8C8C8C] text-2xl leading-none transition-colors"
                  >
                    ×
                  </button>
                </div>

                {/* Match score */}
                {selected.matchScore > 0 && (
                  <div className="mb-5 p-4 bg-[#1A1F5E]/5 rounded-2xl border border-[#1A1F5E]/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#1A1F5E] font-semibold text-sm">Expertise overlap</span>
                      <span className="text-[#1A1F5E] font-bold text-xl">
                        {selected.matchScore} area{selected.matchScore !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="w-full bg-[#1A1F5E]/20 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#0072CE] to-[#1A1F5E] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, selected.matchScore * 15)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Capacity alert */}
                {isMentee && (
                  <div className="mb-5">
                    {selected.atCapacity ? (
                      <div className="flex items-center gap-2 bg-[#E83E2D]/10 border border-[#E83E2D]/20 text-[#E83E2D] px-4 py-3 rounded-2xl text-sm font-semibold">
                        <XCircle className="w-4 h-4" />
                        This mentor is at capacity (3/3 mentees)
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl text-sm font-semibold">
                        <CheckCircle className="w-4 h-4" />
                        {spotsLeft(selected)} mentee spot{spotsLeft(selected) !== 1 ? 's' : ''} available
                      </div>
                    )}
                  </div>
                )}

                {/* Bio */}
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-[#333333] mb-2 uppercase tracking-wide">
                    About
                  </h3>
                  <p className="text-[#333333] leading-relaxed">{selected.bio}</p>
                </div>

                {/* Expertise */}
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-[#333333] mb-2 uppercase tracking-wide">
                    Expertise
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selected.expertise.map((e, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-[#1A1F5E]/10 text-[#1A1F5E] text-sm font-medium rounded-full"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                {selected.languages.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-[#333333] mb-2 uppercase tracking-wide">
                      Languages
                    </h3>
                    <p className="text-[#8C8C8C]">{selected.languages.join(', ')}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 border-2 border-[#1A1F5E] text-[#1A1F5E] font-semibold py-3 rounded-full hover:bg-[#1A1F5E] hover:text-white transition-all duration-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleConnect(selected);
                      setShowModal(false);
                    }}
                    disabled={selected.atCapacity}
                    className={`flex-1 font-semibold py-3 rounded-full shadow-lg transition-all duration-200 ${
                      selected.atCapacity
                        ? 'bg-[#F4F4F4] text-[#8C8C8C] cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#E83E2D] to-[#c0321f] text-white hover:opacity-90 hover:scale-105 active:scale-95'
                    }`}
                  >
                    {selected.atCapacity ? 'At Capacity' : 'Send Request'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MentorMatching;
