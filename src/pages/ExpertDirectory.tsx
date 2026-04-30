import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Users, Star, MessageCircle, Calendar, ChevronDown, Award, Globe, Clock, Send, X, Lock, Unlock, Mail, UserPlus, Bell, CheckCircle, XCircle, AlertCircle, Video, Loader } from 'lucide-react';
import { expertsAPI, questionsAPI, expertConnectionsAPI, expertWebinarsAPI, expertMeetingsAPI, usersAPI } from '../services/api';
import { useSimpleAuth } from '../contexts/SimpleAuthContext';

interface Expert {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  avatar: string;
  location: string;
  country: string;
  expertise: string[];
  industries: string[];
  languages: string[];
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  experience: string;
  pastClients: string[];
  bio: string;
}

interface Question {
  id: string;
  title: string;
  content: string;
  author: string;
  authorAvatar: string;
  tags: string[];
  timestamp: string;
  responseCount: number;
  isAnswered: boolean;
}

interface Webinar {
  id: string;
  title: string;
  expert: string;
  expertAvatar: string;
  date: string;
  time: string;
  topic: string;
  region: string;
  attendees: number;
  maxAttendees: number;
  teamsLink?: string;
  description?: string;
  registeredUsers?: string[];
  isPrivate?: boolean;
  invitedEmails?: string[];
  accessRequests?: AccessRequest[];
}

interface AccessRequest {
  id: string;
  name: string;
  email: string;
  organization: string;
  message: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface ConnectionRequest {
  id: string;
  expertId: string;
  expertName: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  userOrganization: string;
  message: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
  type: 'connection' | 'meeting';
}

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  organization: string;
}

interface ScheduledMeeting {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  startDateTime: string;
  endDateTime: string;
  topic: string;
  region: string;
  expert: string;
  attendees: string[];
  lobbyBypass: string;
  teamsLink: string;
  createdAt: string;
  createdBy: string;
}

interface ExpertApplication {
  expertise: string[];
  industries: string[];
  experience: string;
  motivation: string;
  achievements: string;
}

const ExpertDirectory: React.FC = () => {
  const { currentUser: authUser } = useSimpleAuth();
  // Expert role: user has an expert/mentor role � experts can see extra tabs
  const isExpert = ['expert', 'mentor', 'both'].includes(authUser?.role || '');
  const [showBecomeExpertModal, setShowBecomeExpertModal] = useState(false);
  const [expertApplication, setExpertApplication] = useState<ExpertApplication>({
    expertise: [],
    industries: [],
    experience: '',
    motivation: '',
    achievements: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    expertise: '',
    industry: '',
    location: '',
    availability: 'all'
  });
  const [activeTab, setActiveTab] = useState<'directory' | 'myExperts' | 'myMentees' | 'forum' | 'webinars' | 'requests'>('directory');
  const [connectedExperts, setConnectedExperts] = useState<Expert[]>([]);
  // IDs of experts the current user has a pending request to
  const [pendingExpertIds, setPendingExpertIds] = useState<Set<string>>(new Set());
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [showAskModal, setShowAskModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '', tags: '', expertId: '', category: '', isPrivate: false });
  const [showExpertModal, setShowExpertModal] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectMessage, setConnectMessage] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [showWebinarModal, setShowWebinarModal] = useState(false);
  const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registrationData, setRegistrationData] = useState({ name: '', email: '', phone: '', organization: '' });
  const [registeredWebinars, setRegisteredWebinars] = useState<string[]>([]);
  const [, setLoading] = useState(true);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [, setQuestions] = useState<Question[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newWebinar, setNewWebinar] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    topic: '',
    region: '',
    maxAttendees: '50',
    expert: '',
    isPrivate: false,
    invitedEmails: [] as string[],
    lobbyBypass: 'organization' as 'everyone' | 'organization' | 'organizationAndFederated' | 'invited'
  });
  const [emailInput, setEmailInput] = useState('');
  const [emailSuggestions, setEmailSuggestions] = useState<PlatformUser[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [showRequestsPanel, setShowRequestsPanel] = useState(false);
  const [webinarAttendees, setWebinarAttendees] = useState<{[key: string]: number}>({});
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
  const [requestSubTab, setRequestSubTab] = useState<'connections' | 'meetings'>('connections');
  
  // Scheduled meetings state � loaded from DB
  const [scheduledMeetings, setScheduledMeetings] = useState<ScheduledMeeting[]>([]);
  const [meetingsLoading, setMeetingsLoading] = useState(false);
  const [showMeetingsList, setShowMeetingsList] = useState(false);

  // Platform users for email invitations � searched live from DB
  const [platformUsers] = useState<PlatformUser[]>([
    // kept empty: real users come from DB search in handleEmailInputChange
  ]);
  // Handle email input changes with predictive typing
  // Approved mentees always shown as suggestions
  const approvedMenteeUsers = useMemo(() =>
    connectionRequests
      .filter(r => r.status === 'approved')
      .map(r => ({
        id: `mentee-${r.id}`,
        name: r.userName,
        email: r.userEmail,
        avatar: r.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.userName)}&background=1A1F5E&color=fff`,
        role: 'Mentee',
        organization: r.userOrganization || ''
      }))
  , [connectionRequests]);

  const handleEmailInputChange = async (value: string) => {
    setEmailInput(value);
    if (value.trim().length < 2) {
      setShowSuggestions(approvedMenteeUsers.length > 0);
      setEmailSuggestions(approvedMenteeUsers.slice(0, 8));
      return;
    }
    try {
      const res = await usersAPI.search(value);
      const dbUsers: PlatformUser[] = (res.data?.users || []).map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=1A1F5E&color=fff`,
        role: u.role || '',
        organization: u.organization || ''
      }));
      const merged = [...approvedMenteeUsers, ...dbUsers];
      const seen = new Set<string>();
      const unique = merged.filter(u => { if (seen.has(u.email)) return false; seen.add(u.email); return true; });
      const q = value.toLowerCase();
      const filtered = unique.filter(u =>
        u.email.toLowerCase().includes(q) || u.name.toLowerCase().includes(q)
      ).slice(0, 8);
      setEmailSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } catch {
      // fallback: filter approved mentees only
      const q = value.toLowerCase();
      const filtered = approvedMenteeUsers.filter(u =>
        u.email.toLowerCase().includes(q) || u.name.toLowerCase().includes(q)
      );
      setEmailSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    }
  };

  // Open Teams chat with expert
  const openTeamsChat = (expert: any) => {
    try {
      // Method 1: Direct Teams deeplink (if email is available)
      if (expert.email) {
        const teamsDeepLink = `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(expert.email)}&topicName=${encodeURIComponent(`Chat with ${expert.name}`)}`;
        window.open(teamsDeepLink, '_blank');
      } else if (expert.name) {
        // Fallback: Search for expert by name in Teams
        const teamsSearchUrl = `https://teams.microsoft.com/l/search?q=${encodeURIComponent(expert.name)}`;
        window.open(teamsSearchUrl, '_blank');
      }
    } catch (error) {
      console.error('Error opening Teams chat:', error);
      // Fallback: Direct user to Teams web
      window.open('https://teams.microsoft.com', '_blank');
    }
  };

  // Add email to invited list
  const addInvitedEmail = (email: string) => {
    console.log('?? addInvitedEmail called with:', email);
    
    if (!email || email.trim() === '') {
      console.warn('?? Email is empty!');
      return;
    }

    // Use callback form of setState to get fresh state
    setNewWebinar((prevWebinar) => {
      console.log('Previous invitedEmails:', prevWebinar.invitedEmails);
      
      if (prevWebinar.invitedEmails.includes(email)) {
        console.warn('?? Email already exists in invitedEmails:', email);
        return prevWebinar;
      }
      
      const updatedEmails = [...prevWebinar.invitedEmails, email];
      console.log('? Adding email. Updated emails:', updatedEmails);
      
      return {
        ...prevWebinar,
        invitedEmails: updatedEmails
      };
    });
    
    setEmailInput('');
    setShowSuggestions(false);
  };

  // Remove email from invited list
  const removeInvitedEmail = (email: string) => {
    console.log('?? removeInvitedEmail called for:', email);
    
    setNewWebinar((prevWebinar) => {
      console.log('Current invitedEmails before removal:', prevWebinar.invitedEmails);
      
      const updatedEmails = prevWebinar.invitedEmails.filter(e => e !== email);
      console.log('Updated emails after removal:', updatedEmails);
      
      return {
        ...prevWebinar,
        invitedEmails: updatedEmails
      };
    });
  };

  // Handle access request approval/rejection
  const handleAccessRequest = (requestId: string, action: 'approve' | 'reject', webinarId?: string) => {
    const request = sampleAccessRequests.find(r => r.id === requestId);
    
    if (action === 'approve' && webinarId) {
      // Check if webinar is full before approving
      const webinar = webinars.find(w => w.id === webinarId);
      if (webinar) {
        const currentAttendees = webinarAttendees[webinarId] || webinar.attendees;
        if (currentAttendees >= webinar.maxAttendees) {
          alert(`Cannot approve request - webinar is full!\n\nWebinar: "${webinar.title}"\nMax Attendees: ${webinar.maxAttendees}\nCurrent Attendees: ${currentAttendees}\n\nPlease reject this request or increase the max attendees limit.`);
          return;
        }
        
        // Update attendee count
        setWebinarAttendees({
          ...webinarAttendees,
          [webinarId]: currentAttendees + 1
        });
        
        const spotsLeft = webinar.maxAttendees - (currentAttendees + 1);
        alert(`Access request approved!\n\n${request?.name} can now attend "${webinar.title}"\n\nSpots remaining: ${spotsLeft}/${webinar.maxAttendees}`);
      }
    } else if (action === 'reject') {
      alert(`Access request rejected for ${request?.name}`);
    }
    
    setAccessRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: action === 'approve' ? 'approved' : 'rejected' }
          : req
      )
    );
  };

  // Handle connection request approval/rejection
  const handleConnectionRequest = async (requestId: string, action: 'approve' | 'reject') => {
    const request = connectionRequests.find(r => r.id === requestId);
    if (!request) return;

    const newStatus = action === 'approve' ? 'approved' : 'declined';
    try {
      await expertConnectionsAPI.updateStatus(requestId, newStatus);
      setConnectionRequests(prev =>
        prev.map(req => req.id === requestId ? { ...req, status: action === 'approve' ? 'approved' : 'rejected' } : req)
      );
      if (action === 'approve') {
        alert(`Connection approved! ${request.userName} can now open a Teams chat with you.`);
      } else {
        alert(`Request from ${request.userName} has been declined.`);
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to update connection request');
    }
  };

  // Handle expert application submission
  const handleSubmitExpertApplication = async () => {
    if (!expertApplication.motivation || !expertApplication.experience) {
      alert('Please fill in all required fields');
      return;
    }
    if (expertApplication.expertise.length === 0) {
      alert('Please select at least one area of expertise');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/experts/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(expertApplication),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setShowBecomeExpertModal(false);
        setExpertApplication({ expertise: [], industries: [], experience: '', motivation: '', achievements: '' });
      } else {
        alert(data.message || 'Submission failed. Please try again.');
      }
    } catch {
      alert('Network error. Please check your connection and try again.');
    }
  };

  // Load my expert connections from DB (approved ? My Experts tab, pending ? button state)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [expertsResult, questionsResult] = await Promise.allSettled([
          expertsAPI.getExperts(),
          questionsAPI.getQuestions()
        ]);

        if (expertsResult.status === 'fulfilled') {
          const expertsData = expertsResult.value?.data?.experts || expertsResult.value?.experts || [];
          const transformedExperts = expertsData.map((expert: any) => ({
            id: expert.expert_id || expert.user_id,
            name: expert.name,
            title: expert.title || expert.specializations?.split(',')[0] || 'Expert',
            company: expert.company || 'Forvis Mazars',
            email: expert.email || '',
            avatar: expert.avatar_url || expert.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name||'E')}&background=1A1F5E&color=fff`,
            location: expert.location || expert.country || '',
            country: expert.country || expert.location?.split(',')[1]?.trim() || expert.location,
            expertise: expert.specializations ? expert.specializations.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
            industries: expert.industries ? expert.industries.split(',').map((i: string) => i.trim()) : [],
            languages: ['English'],
            rating: expert.average_rating || 4.5,
            reviewCount: expert.review_count || 0,
            isAvailable: expert.is_available,
            experience: expert.experience ? `${expert.experience}+ years` : '5+ years',
            pastClients: expert.past_clients ? expert.past_clients.split(',').map((c: string) => c.trim()) : [],
            bio: expert.bio || 'Experienced professional ready to help.'
          }));
          setExperts(transformedExperts);
        } else {
          console.error('Error loading experts:', expertsResult.reason);
          setExperts([]);
        }

        if (questionsResult.status === 'fulfilled') {
          const questionsData = questionsResult.value?.data?.questions || questionsResult.value?.questions || [];
          const transformedQuestions = questionsData.map((question: any) => ({
            id: question.question_id,
            title: question.title,
            content: question.content,
            author: question.author_name,
            authorAvatar: question.author_avatar || 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
            tags: question.tags ? question.tags.split(',').map((t: string) => t.trim()) : [],
            timestamp: new Date(question.created_at).toLocaleDateString(),
            responseCount: question.response_count || 0,
            isAnswered: question.is_answered
          }));
          setQuestions(transformedQuestions);
        } else {
          console.warn('Could not load questions:', questionsResult.reason);
        }
      } catch (error) {
        console.error('Error loading expert directory data:', error);
        setExperts([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadConnections = async () => {
      setConnectionsLoading(true);
      try {
        const res = await expertConnectionsAPI.getMyConnections();
        const conns: any[] = res.data?.connections || [];
        const approved: Expert[] = [];
        const pendingIds = new Set<string>();
        conns.forEach((c: any) => {
          const expertObj: Expert = {
            id: c.expert_id,
            name: c.expert_name || 'Expert',
            title: c.expert_specializations?.split(',')[0]?.trim() || 'Expert',
            company: 'Forvis Mazars',
            email: c.expert_email || '',
            avatar: c.expert_avatar || 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
            location: c.expert_location || '',
            country: c.expert_location?.split(',')[1]?.trim() || '',
            expertise: c.expert_specializations ? c.expert_specializations.split(',').map((s: string) => s.trim()) : [],
            industries: c.expert_industries ? c.expert_industries.split(',').map((i: string) => i.trim()) : [],
            languages: ['English'],
            rating: c.expert_rating || 4.5,
            reviewCount: c.expert_review_count || 0,
            isAvailable: c.expert_is_available,
            experience: '5+ years',
            pastClients: [],
            bio: c.expert_bio || '',
          };
          if (c.status === 'approved') approved.push(expertObj);
          else if (c.status === 'pending') pendingIds.add(c.expert_id);
        });
        setConnectedExperts(approved);
        setPendingExpertIds(pendingIds);
      } catch (err) {
        console.error('Failed to load expert connections:', err);
      } finally {
        setConnectionsLoading(false);
      }
    };
    loadConnections();
  }, []);

  // If the logged-in user is an expert, load incoming connection requests
  useEffect(() => {
    if (!isExpert) return;
    const loadIncoming = async () => {
      try {
        const res = await expertConnectionsAPI.getIncomingRequests();
        const raw: any[] = res.data?.connections || [];
        const mapped: ConnectionRequest[] = raw.map((c: any) => ({
          id: c.id,
          expertId: c.expert_id || '',
          expertName: '',
          userName: c.requester_name || 'Unknown',
          userEmail: c.requester_email || '',
          userAvatar: c.requester_avatar || 'https://i.pravatar.cc/150?img=20',
          userOrganization: '',
          message: c.message || '',
          timestamp: new Date(c.created_at).toLocaleDateString(),
          status: c.status as 'pending' | 'approved' | 'rejected',
          type: 'connection',
        }));
        setConnectionRequests(mapped);
      } catch (err) {
        console.error('Failed to load incoming requests:', err);
      }
    };
    loadIncoming();
  }, [isExpert]);

  // Load webinars from DB
  useEffect(() => {
    const loadWebinars = async () => {
      try {
        const res = await expertWebinarsAPI.getWebinars();
        const raw: any[] = res.data?.webinars || [];
        const mapped: Webinar[] = raw.map((w: any) => ({
          id: w.id,
          title: w.title,
          expert: w.expert_name,
          expertAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(w.expert_name || 'E')}&background=1A1F5E&color=fff`,
          date: w.date,
          time: w.time,
          topic: w.topic || '',
          region: w.region || '',
          attendees: w.attendee_count || 0,
          maxAttendees: w.max_attendees || 50,
          teamsLink: w.teams_link || '',
          description: w.description || '',
          isPrivate: !!w.is_private,
          registeredUsers: []
        }));
        setWebinars(mapped);
      } catch (err) {
        console.warn('Could not load webinars from DB:', err);
      }
    };
    loadWebinars();
  }, []);

  // Load my scheduled meetings from DB
  useEffect(() => {
    const loadMeetings = async () => {
      setMeetingsLoading(true);
      try {
        const res = await expertMeetingsAPI.getMyMeetings();
        const raw: any[] = res.data?.meetings || [];
        const mapped: ScheduledMeeting[] = raw.map((m: any) => ({
          id: m.id,
          title: m.title,
          description: m.description || '',
          date: m.date,
          time: m.time,
          startDateTime: m.scheduled_at,
          endDateTime: m.scheduled_at,
          topic: m.topic || '',
          region: m.region || '',
          expert: m.expert_name,
          attendees: m.attendee_emails ? m.attendee_emails.split(',').filter(Boolean) : [],
          lobbyBypass: m.lobby_bypass || 'organization',
          teamsLink: m.teams_link || '',
          createdAt: m.created_at,
          createdBy: m.expert_name
        }));
        setScheduledMeetings(mapped);
      } catch (err) {
        console.warn('Could not load meetings from DB:', err);
      } finally {
        setMeetingsLoading(false);
      }
    };
    loadMeetings();
  }, []);

  // Sample access requests for private webinars (empty � DB-backed)
  // Webinars loaded from DB
  const [webinars, setWebinars] = useState<Webinar[]>([]);

  // Static webinars removed � all data loaded from DB
  const sampleAccessRequests: AccessRequest[] = []; // empty stub � access requests are DB-backed

  // Derive unique filter options dynamically from loaded experts
  const allExpertiseOptions = Array.from(new Set(experts.flatMap(e => e.expertise))).filter(Boolean).sort();
  const allIndustryOptions = Array.from(new Set(experts.flatMap(e => e.industries))).filter(Boolean).sort();
  const allCountryOptions = Array.from(new Set(experts.map(e => e.country).filter(Boolean))).sort();
  const uniqueCountries = allCountryOptions.length || new Set(experts.map(e => e.country).filter(Boolean)).size;

  const filteredExperts = experts.filter(expert => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = !search ||
      expert.name.toLowerCase().includes(search) ||
      expert.expertise.some(skill => skill.toLowerCase().includes(search)) ||
      expert.industries.some(industry => industry.toLowerCase().includes(search)) ||
      (expert.company || '').toLowerCase().includes(search) ||
      (expert.location || '').toLowerCase().includes(search);

    const matchesExpertise = !selectedFilters.expertise ||
      expert.expertise.some(e => e.toLowerCase() === selectedFilters.expertise.toLowerCase());
    const matchesIndustry = !selectedFilters.industry ||
      expert.industries.some(i => i.toLowerCase() === selectedFilters.industry.toLowerCase());
    const matchesLocation = !selectedFilters.location ||
      (expert.country || '').toLowerCase() === selectedFilters.location.toLowerCase() ||
      (expert.location || '').toLowerCase().includes(selectedFilters.location.toLowerCase());
    const matchesAvailability = selectedFilters.availability === 'all' ||
      (selectedFilters.availability === 'available' && expert.isAvailable);

    return matchesSearch && matchesExpertise && matchesIndustry && matchesLocation && matchesAvailability;
  });

  const handleAskQuestion = () => {
    const submitQuestion = async () => {
      if (newQuestion.title.trim() && newQuestion.content.trim()) {
        try {
          await questionsAPI.createQuestion({
            title: newQuestion.title,
            content: newQuestion.content,
            tags: newQuestion.tags
          });
          
          setShowAskModal(false);
          setNewQuestion({ title: '', content: '', tags: '', expertId: '', category: '', isPrivate: false });
          
          // Reload questions
          const questionsResponse = await questionsAPI.getQuestions();
          const transformedQuestions = questionsResponse.data.questions.map((question: any) => ({
            id: question.question_id,
            title: question.title,
            content: question.content,
            author: question.author_name,
            authorAvatar: question.author_avatar || 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
            tags: question.tags ? question.tags.split(',').map((t: string) => t.trim()) : [],
            timestamp: new Date(question.created_at).toLocaleDateString(),
            responseCount: question.response_count || 0,
            isAnswered: question.is_answered
          }));
          setQuestions(transformedQuestions);
          
        } catch (error) {
          console.error('Error posting question:', error);
          alert('Failed to post question. Please try again.');
        }
      }
    };
    
    submitQuestion();
  };

  const handleViewProfile = (expert: Expert) => {
    setSelectedExpert(expert);
    setShowExpertModal(true);
  };

  const handleConnect = (expertId: string) => {
    const expert = experts.find(e => e.id === expertId);
    if (expert) {
      setSelectedExpert(expert);
      setShowConnectModal(true);
    }
  };

  const handleRegisterWebinar = (webinar: Webinar) => {
    setSelectedWebinar(webinar);
    setShowRegisterModal(true);
  };

  const handleViewWebinar = (webinar: Webinar) => {
    setSelectedWebinar(webinar);
    setShowWebinarModal(true);
  };

  const handleSubmitRegistration = async () => {
    if (registrationData.name && registrationData.email && selectedWebinar) {
      const currentAttendees = webinarAttendees[selectedWebinar.id] || selectedWebinar.attendees;
      if (currentAttendees >= selectedWebinar.maxAttendees) {
        alert(`Sorry, this webinar is full!\n\nMax Attendees: ${selectedWebinar.maxAttendees}\nCurrent Attendees: ${currentAttendees}\n\nPlease check other available webinars.`);
        return;
      }
      try {
        await expertWebinarsAPI.registerForWebinar(selectedWebinar.id);
      } catch {
        // proceed with local state update even if API call fails
      }
      setRegisteredWebinars([...registeredWebinars, selectedWebinar.id]);
      setWebinarAttendees({ ...webinarAttendees, [selectedWebinar.id]: currentAttendees + 1 });
      const spotsLeft = selectedWebinar.maxAttendees - (currentAttendees + 1);
      alert(`Success! You've been registered for "${selectedWebinar.title}".\n\nConfirmation sent to ${registrationData.email}.\n\nJoin via Teams on ${selectedWebinar.date} at ${selectedWebinar.time}.\n\nSpots remaining: ${spotsLeft}/${selectedWebinar.maxAttendees}`);
      setRegistrationData({ name: '', email: '', phone: '', organization: '' });
      setShowRegisterModal(false);
      setSelectedWebinar(null);
    }
  };
  const handleJoinWebinar = (teamsLink?: string) => {
    if (teamsLink) {
      // Open Teams link in new tab
      window.open(teamsLink, '_blank');
    } else {
      alert('Teams link will be available 15 minutes before the webinar starts.');
    }
  };

  const isWebinarRegistered = (webinarId: string) => {
    return registeredWebinars.includes(webinarId);
  };

  const handleScheduleWebinar = async () => {
    console.log('=== SCHEDULE WEBINAR INITIATED ===');
    console.log('Current newWebinar state:', newWebinar);
    console.log('Invited emails:', newWebinar.invitedEmails);
    console.log('Number of invitees:', newWebinar.invitedEmails.length);
    
    if (newWebinar.title && newWebinar.date && newWebinar.time && newWebinar.topic && newWebinar.region && newWebinar.expert) {
      // Generate Microsoft Teams meeting link with parameters
      // Combine date and time into ISO format
      const dateTime = new Date(`${newWebinar.date}T${newWebinar.time}`);
      const startTime = dateTime.toISOString();
      const endTime = new Date(dateTime.getTime() + 60 * 60 * 1000).toISOString(); // 1 hour duration
      
      // Build Teams URL with all parameters including attendees
      // Use direct Teams meeting compose URL format
      const teamsParams = new URLSearchParams();
      teamsParams.append('subject', newWebinar.title);
      teamsParams.append('content', newWebinar.description || `Join us for: ${newWebinar.title}`);
      teamsParams.append('startTime', startTime);
      teamsParams.append('endTime', endTime);
      
      console.log('Before adding people param - Invited emails:', newWebinar.invitedEmails);
      
      if (newWebinar.invitedEmails && newWebinar.invitedEmails.length > 0) {
        // Use comma-separated list for attendees parameter in Teams compose URL
        const attendeesString = newWebinar.invitedEmails.join(',');
        console.log('Adding attendees param with:', attendeesString);
        teamsParams.append('attendees', attendeesString);
      } else {
        console.warn('?? No invited emails found!');
      }
      
      // Use the Teams compose meeting URL format which better supports pre-filling attendees
      const teamsLink = `https://teams.microsoft.com/l/meeting/new?${teamsParams.toString()}`;
      
      // Create meeting record to store
      const meetingRecord: ScheduledMeeting = {
        id: `meeting-${Date.now()}`,
        title: newWebinar.title,
        description: newWebinar.description || `Join us for: ${newWebinar.title}. Expert: ${newWebinar.expert}. Topic: ${newWebinar.topic}.`,
        date: newWebinar.date,
        time: newWebinar.time,
        startDateTime: startTime,
        endDateTime: endTime,
        topic: newWebinar.topic,
        region: newWebinar.region,
        expert: newWebinar.expert,
        attendees: newWebinar.invitedEmails,
        lobbyBypass: newWebinar.lobbyBypass,
        teamsLink: teamsLink,
        createdAt: new Date().toISOString(),
        createdBy: authUser?.profile?.name || authUser?.email || 'Unknown'
      };
      
      // Save to DB and also add to expert_webinars for the webinars tab
      try {
        const meetingRes = await expertMeetingsAPI.createMeeting({
          expert_name: newWebinar.expert,
          title: newWebinar.title,
          description: newWebinar.description,
          date: newWebinar.date,
          time: newWebinar.time,
          topic: newWebinar.topic,
          region: newWebinar.region,
          meeting_type: 'webinar',
          teams_link: teamsLink,
          attendee_emails: newWebinar.invitedEmails,
          lobby_bypass: newWebinar.lobbyBypass
        });
        const savedMeeting = meetingRes.data?.meeting;
        if (savedMeeting) {
          meetingRecord.id = savedMeeting.id;
        }
        // Also save to expert_webinars so it shows in the webinars tab
        const webinarRes = await expertWebinarsAPI.createWebinar({
          expert_name: newWebinar.expert,
          title: newWebinar.title,
          description: newWebinar.description,
          date: newWebinar.date,
          time: newWebinar.time,
          topic: newWebinar.topic,
          region: newWebinar.region,
          max_attendees: newWebinar.maxAttendees,
          teams_link: teamsLink,
          invited_emails: newWebinar.invitedEmails,
          is_private: newWebinar.isPrivate
        });
        if (webinarRes.data?.webinar) {
          const w = webinarRes.data.webinar;
          setWebinars(prev => [{
            id: w.id,
            title: w.title,
            expert: w.expert_name,
            expertAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(w.expert_name||'E')}&background=1A1F5E&color=fff`,
            date: w.date,
            time: w.time,
            topic: w.topic || '',
            region: w.region || '',
            attendees: 0,
            maxAttendees: w.max_attendees || 50,
            teamsLink: w.teams_link || '',
            description: w.description || '',
            isPrivate: !!w.is_private,
            registeredUsers: []
          }, ...prev]);
        }
      } catch (err) {
        console.error('Failed to save meeting to DB:', err);
      }
      const updatedMeetings = [...scheduledMeetings, meetingRecord];
      setScheduledMeetings(updatedMeetings);
      
      // Log for debugging - IMPORTANT: Check console for actual URL
      console.log('=== TEAMS MEETING DEBUG ===');
      console.log('Teams Link:', teamsLink);
      console.log('Number of attendees:', newWebinar.invitedEmails.length);
      console.log('Attendees array:', newWebinar.invitedEmails);
      console.log('Attendees joined with comma:', newWebinar.invitedEmails.join(','));
      console.log('Full params:', teamsParams.toString());
      console.log('Meeting Record:', meetingRecord);
      console.log('');
      console.log('?? COPY THIS URL TO TEST:');
      console.log(teamsLink);
      console.log('========================');
      
      // Open Teams in new tab to create the meeting
      window.open(teamsLink, '_blank');
      
      alert(`Teams Meeting Created! ??\n\n"${newWebinar.title}"\n\nDate: ${newWebinar.date} at ${newWebinar.time}\nExpert: ${newWebinar.expert}\nAttendees: ${newWebinar.invitedEmails.length} people\n\n? Teams opening with details\n${newWebinar.invitedEmails.length > 0 ? '? Attendees: ' + newWebinar.invitedEmails.join(', ') : '?? No attendees added'}\n\n?? Check browser console to see the full URL!`);
      
      // Reset form
      setNewWebinar({
        title: '',
        description: '',
        date: '',
        time: '',
        topic: '',
        region: '',
        maxAttendees: '50',
        expert: '',
        isPrivate: false,
        invitedEmails: [],
        lobbyBypass: 'organization'
      });
      setEmailInput('');
      setShowSuggestions(false);
      setShowRequestsPanel(false);
      setShowScheduleModal(false);
    } else {
      alert('Please fill in all required fields (Title, Date, Time, Topic, Region, and Expert)');
    }
  };

  const handleSendConnect = async () => {
    if (!selectedExpert) return;
    try {
      await expertConnectionsAPI.requestConnection(selectedExpert.id, connectMessage);
      // Mark as pending in UI immediately
      setPendingExpertIds(prev => new Set(prev).add(selectedExpert.id));
      alert(`Connection request sent to ${selectedExpert.name}. They will review it and you will be notified once approved.`);
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('already')) {
        alert(msg);
      } else {
        alert('Failed to send connection request. Please try again.');
      }
    }
    setShowConnectModal(false);
    setConnectMessage('');
    setSelectedExpert(null);
  };

  const handleSendDirectMessage = () => {
    // Handle sending direct message
    setShowMessageModal(false);
    setMessageContent('');
    setSelectedExpert(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header with Forvis Mazars Branding */}
      <div className="bg-[#1A1F5E] text-white">
        <div className="max-w-[1920px] mx-auto px-12 sm:px-16 lg:px-20 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-3 text-white">Expert Directory & Knowledge Exchange</h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Connect with regional experts and share knowledge across our global network
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-12 sm:px-16 lg:px-20 py-8">
        <div className="bg-white -xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Tabs Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div></div>
              {/* Become an Expert button */}
              {!isExpert && (
                <button
                  onClick={() => setShowBecomeExpertModal(true)}
                  className="bg-[#1A1F5E] hover:bg-[#1A1F5E] text-white px-4 py-2 -lg text-sm font-medium transition-colors flex items-center space-x-2 ml-auto"
                >
                  <Award className="w-4 h-4" />
                  <span>Become an Expert</span>
                </button>
              )}
            </div>

          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-gray-200">
            <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('directory')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'directory'
                  ? 'border-[#0072CE] text-[#0072CE]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Expert Directory
            </button>
            <button
              onClick={() => setActiveTab('myExperts')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                activeTab === 'myExperts'
                  ? 'border-[#0072CE] text-[#0072CE]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>My Experts</span>
                {connectedExperts.length > 0 && (
                  <span className="bg-[#F4F4F4]0 text-white text-xs -full w-5 h-5 flex items-center justify-center font-bold">
                    {connectedExperts.length}
                  </span>
                )}
              </span>
            </button>
            {/* <button
              onClick={() => setActiveTab('forum')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'forum'
                  ? 'border-[#0072CE] text-[#0072CE]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Ask the Expert
            </button> */}
            
            {/* Expert-only tabs */}
            {isExpert && (
              <>
            <button
              onClick={() => setActiveTab('myMentees')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                activeTab === 'myMentees'
                  ? 'border-[#0072CE] text-[#0072CE]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>My Mentees</span>
                {connectionRequests.filter(r => r.status === 'approved').length > 0 && (
                  <span className="bg-[#0072CE] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {connectionRequests.filter(r => r.status === 'approved').length}
                  </span>
                )}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('webinars')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'webinars'
                  ? 'border-[#0072CE] text-[#0072CE]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Live Webinars
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                activeTab === 'requests'
                  ? 'border-[#0072CE] text-[#0072CE]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <span>Connection Requests</span>
                {connectionRequests.filter(r => r.status === 'pending').length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {connectionRequests.filter(r => r.status === 'pending').length}
                  </span>
                )}
              </span>
            </button>
              </>
            )}
            </div>
          </div>
        </div>

        {/* Expert Directory Tab */}
        {activeTab === 'directory' && (
          <div className="flex h-full">
            {/* Search and Filters Sidebar */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
              <div className="p-6">
                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search experts by name, skill, or industry..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E] text-sm"
                  />
                </div>

                {/* Filters */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expertise Area</label>
                    <select
                      value={selectedFilters.expertise}
                      onChange={(e) => { setSelectedFilters({...selectedFilters, expertise: e.target.value}); setCurrentPage(1); }}
                      className="w-full px-3 py-2 border border-gray-300 -md text-sm focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                    >
                      <option value="">All Expertise</option>
                      {allExpertiseOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                    <select
                      value={selectedFilters.industry}
                      onChange={(e) => { setSelectedFilters({...selectedFilters, industry: e.target.value}); setCurrentPage(1); }}
                      className="w-full px-3 py-2 border border-gray-300 -md text-sm focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                    >
                      <option value="">All Industries</option>
                      {allIndustryOptions.length > 0 ? allIndustryOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      )) : (
                        <>
                          <option value="Financial Services">Financial Services</option>
                          <option value="Technology">Technology</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Energy">Energy</option>
                          <option value="Education">Education</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                    <select
                      value={selectedFilters.location}
                      onChange={(e) => { setSelectedFilters({...selectedFilters, location: e.target.value}); setCurrentPage(1); }}
                      className="w-full px-3 py-2 border border-gray-300 -md text-sm focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                    >
                      <option value="">All Regions</option>
                      {allCountryOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                    <select
                      value={selectedFilters.availability}
                      onChange={(e) => { setSelectedFilters({...selectedFilters, availability: e.target.value}); setCurrentPage(1); }}
                      className="w-full px-3 py-2 border border-gray-300 -md text-sm focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                    >
                      <option value="all">All Experts</option>
                      <option value="available">Available for Collaboration</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-[#F4F4F4] -lg">
                  <h4 className="font-medium text-[#1A1F5E] mb-2">Quick Stats</h4>
                  <div className="space-y-2 text-sm text-[#1A1F5E]">
                    <div className="flex justify-between">
                      <span>Total Experts:</span>
                      <span className="font-medium">{experts.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Available Now:</span>
                      <span className="font-medium">{experts.filter(e => e.isAvailable).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Countries:</span>
                      <span className="font-medium">{uniqueCountries}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expert Cards */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid gap-6">
                {filteredExperts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((expert) => (
                  <div key={expert.id} className="bg-white border border-gray-200 -xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <img
                        src={expert.avatar}
                        alt={expert.name}
                        className="w-16 h-16 -full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{expert.name}</h3>
                            <p className="text-[#0072CE] font-medium">{expert.title}</p>
                            <p className="text-gray-600 text-sm">{expert.company}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {expert.isAvailable ? (
                              <span className="bg-[#1A1F5E]/10 text-[#1A1F5E] text-xs px-2 py-1 -full">Available</span>
                            ) : (
                              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 -full">Busy</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{expert.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Award className="w-4 h-4" />
                            <span>{expert.experience}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>{expert.rating} ({expert.reviewCount} reviews)</span>
                          </div>
                        </div>

                        <p className="text-gray-700 mt-3 text-sm">{expert.bio}</p>

                        {/* Expertise Tags */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          {expert.expertise.map((skill) => (
                            <span key={skill} className="bg-[#1A1F5E]/10 text-[#1A1F5E] text-xs px-2 py-1 -full">
                              {skill}
                            </span>
                          ))}
                        </div>

                        {/* Industries */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {expert.industries.map((industry) => (
                            <span key={industry} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 -full">
                              {industry}
                            </span>
                          ))}
                        </div>

                        {/* Languages */}
                        <div className="flex items-center space-x-2 mt-3 text-sm text-gray-600">
                          <Globe className="w-4 h-4" />
                          <span>Languages: {expert.languages.join(', ')}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3 mt-4">
                          {connectedExperts.find(e => e.id === expert.id) ? (
                            <button
                              className="bg-[#1A1F5E] text-white px-4 py-2 -lg text-sm font-medium flex items-center space-x-2 hover:opacity-90 transition-opacity"
                              onClick={() => openTeamsChat(expert)}
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span>Chat on Teams</span>
                            </button>
                          ) : pendingExpertIds.has(expert.id) ? (
                            <button
                              disabled
                              className="bg-gray-100 text-gray-500 px-4 py-2 -lg text-sm font-medium flex items-center space-x-2 cursor-not-allowed"
                            >
                              <Clock className="w-4 h-4" />
                              <span>Request Pending</span>
                            </button>
                          ) : (
                            <button
                              className="bg-[#0072CE] hover:bg-[#1A1F5E] text-white px-4 py-2 -lg text-sm font-medium transition-colors flex items-center space-x-2"
                              onClick={() => handleConnect(expert.id)}
                            >
                              <UserPlus className="w-4 h-4" />
                              <span>Request Connection</span>
                            </button>
                          )}
                          <button 
                            className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 -lg text-sm font-medium transition-colors"
                            onClick={() => handleViewProfile(expert)}
                          >
                            View Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {filteredExperts.length > itemsPerPage && (
                <div className="mt-6 flex justify-center items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 -lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.ceil(filteredExperts.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
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
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredExperts.length / itemsPerPage)))}
                    disabled={currentPage === Math.ceil(filteredExperts.length / itemsPerPage)}
                    className="px-4 py-2 border border-gray-300 -lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* My Experts Tab */}
        {activeTab === 'myExperts' && (
          <div className="p-8 overflow-y-auto h-full">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Experts - Microsoft Teams</h2>
                <p className="text-gray-600 mt-1">Click on an expert to open a chat with them in Microsoft Teams</p>
              </div>
            </div>

            {connectionsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader className="w-8 h-8 text-[#0072CE] animate-spin" />
                <span className="ml-3 text-gray-600">Loading your expert connections...</span>
              </div>
            ) : connectedExperts.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-gray-300 -xl p-12 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Approved Connections Yet</h3>
                <p className="text-gray-600 mb-2">Send a connection request to an expert and wait for their approval.</p>
                <p className="text-sm text-gray-500 mb-6">Once approved, the expert will appear here with a direct Teams chat button.</p>
                <button
                  onClick={() => setActiveTab('directory')}
                  className="bg-[#0072CE] hover:bg-[#1A1F5E] text-white px-6 py-3 -lg font-medium transition-colors"
                >
                  Browse Expert Directory
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {connectedExperts.map((expert) => (
                  <div
                    key={expert.id}
                    className="bg-white border border-gray-200 -xl overflow-hidden hover:shadow-lg transition-all"
                  >
                    {/* Expert Card Header */}
                    <div className="relative h-32">
                      <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="20" cy="20" r="15" stroke="white" stroke-width="2"/%3E%3C/svg%3E")',
                        backgroundRepeat: 'repeat'
                      }}></div>
                    </div>

                    {/* Expert Avatar & Info */}
                    <div className="px-6 pb-6">
                      <div className="flex flex-col items-center -mt-16 mb-4">
                        <img
                          src={expert.avatar}
                          alt={expert.name}
                          className="w-24 h-32 -lg object-cover object-top border-4 border-white shadow-lg"
                          style={{ aspectRatio: '3/4' }}
                        />
                        <div className="mt-4 text-center flex-1">
                          <h3 className="text-lg font-bold text-gray-900">{expert.name}</h3>
                          <p className="text-sm text-gray-600">{expert.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{expert.company}</p>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center justify-center space-x-2 mb-4 pb-4 border-b border-gray-200">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-semibold text-gray-900">{expert.rating}</span>
                        <span className="text-sm text-gray-500">({expert.reviewCount} reviews)</span>
                      </div>

                      {/* Expertise Tags */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {expert.expertise.slice(0, 2).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-[#1A1F5E]/10 text-[#1A1F5E] text-xs font-medium -full"
                            >
                              {skill}
                            </span>
                          ))}
                          {expert.expertise.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium -full">
                              +{expert.expertise.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Microsoft Teams Chat Button */}
                      <button
                        onClick={() => openTeamsChat(expert)}
                        className="w-full bg-[#1A1F5E] hover:opacity-90 text-white py-3 -lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>Chat on Teams</span>
                      </button>

                      {/* Info Text */}
                      <p className="text-xs text-gray-500 text-center mt-3">
                        Clicking this button will search for <strong>{expert.name}</strong> on Microsoft Teams
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Ask the Expert Forum Tab */}
        

        {/* My Mentees Tab � approved short-term advice seekers */}
        {activeTab === 'myMentees' && (
          <div className="p-8">
            <div className="mb-8">
              <div className="h-1 w-12 bg-[#E83E2D] rounded-full mb-4" />
              <h2 className="text-2xl font-bold text-[#1A1F5E] mb-2">My Mentees</h2>
              <p className="text-[#8C8C8C]">People you are providing short-term advice to. Message them directly on Teams.</p>
            </div>

            {connectionRequests.filter(r => r.status === 'approved').length === 0 ? (
              <div className="text-center py-20 bg-[#F4F4F4] rounded-3xl border-2 border-dashed border-[#E5E7EB]">
                <Users className="w-16 h-16 text-[#8C8C8C] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#1A1F5E] mb-2">No approved mentees yet</h3>
                <p className="text-[#8C8C8C]">Once you approve connection requests, your mentees will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {connectionRequests.filter(r => r.status === 'approved').map((mentee) => (
                  <div key={mentee.id} className="bg-white rounded-3xl shadow-xl border border-[#E5E7EB] border-t-4 border-t-[#0072CE] p-6 flex flex-col hover:shadow-2xl transition-shadow duration-300">
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={mentee.userAvatar}
                        alt={mentee.userName}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-[#0072CE]/20"
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(mentee.userName)}&background=1A1F5E&color=fff`; }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#333333] text-base truncate">{mentee.userName}</h3>
                        <p className="text-sm text-[#8C8C8C] truncate">{mentee.userEmail}</p>
                        {mentee.userOrganization && (
                          <p className="text-xs text-[#8C8C8C] truncate">{mentee.userOrganization}</p>
                        )}
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 shrink-0">Active</span>
                    </div>

                    {mentee.message && (
                      <div className="bg-[#F4F4F4] rounded-xl p-3 mb-4 border border-[#E5E7EB]">
                        <p className="text-sm text-[#333333] italic line-clamp-3">"{mentee.message}"</p>
                      </div>
                    )}

                    <div className="text-xs text-[#8C8C8C] mb-4">
                      Connected {mentee.timestamp}
                    </div>

                    <div className="mt-auto flex space-x-2">
                      <button
                        onClick={() => openTeamsChat({ email: mentee.userEmail, name: mentee.userName })}
                        className="flex-1 bg-[#1A1F5E] text-white font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center space-x-2 text-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Message on Teams</span>
                      </button>
                      <button
                        onClick={() => openTeamsChat({ email: mentee.userEmail, name: mentee.userName })}
                        className="p-2.5 rounded-xl border-2 border-[#1A1F5E] text-[#1A1F5E] hover:bg-[#1A1F5E]/10 transition-colors duration-200"
                        title="Video call on Teams"
                      >
                        <Video className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Connection Requests Tab */}
        {activeTab === 'requests' && (
          <div className="p-8">
            <div className="mb-8">
              <div className="h-1 w-12 bg-[#E83E2D] rounded-full mb-4" />
              <h2 className="text-2xl font-bold text-[#1A1F5E] mb-2">Connection Requests</h2>
              <p className="text-[#8C8C8C]">Review and respond to people who want to connect with you for short-term advice</p>
            </div>

            {/* Sub-tabs for Connections and Meetings */}
            <div className="flex space-x-2 mb-6 bg-gray-100 p-1 -lg w-fit">
              <button
                onClick={() => setRequestSubTab('connections')}
                className={`px-6 py-2.5 -md font-medium text-sm transition-colors ${
                  requestSubTab === 'connections'
                    ? 'bg-white text-[#0072CE] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <UserPlus className="w-4 h-4" />
                  <span>Connection Requests ({connectionRequests.filter(r => r.status === 'pending').length})</span>
                </div>
              </button>

            </div>

            {/* Connection Requests Content */}
            {requestSubTab === 'connections' && (
              <div>
                {/* Connection Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 -xl p-6">
                    <div className="flex items-center justify-between mb-2">
                      <AlertCircle className="w-8 h-8 text-yellow-600" />
                      <span className="text-3xl font-bold text-yellow-900">
                        {connectionRequests.filter(r => r.status === 'pending').length}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-yellow-900">Pending</div>
                    <div className="text-xs text-yellow-700 mt-1">Awaiting your response</div>
                  </div>

                  <div className="bg-[#F4F4F4] border border-[#E5E7EB] -xl p-6">
                    <div className="flex items-center justify-between mb-2">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <span className="text-3xl font-bold text-green-900">
                        {connectionRequests.filter(r => r.status === 'approved').length}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-green-900">Approved</div>
                    <div className="text-xs text-green-700 mt-1">Total approved connections</div>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 -xl p-6">
                    <div className="flex items-center justify-between mb-2">
                      <XCircle className="w-8 h-8 text-red-600" />
                      <span className="text-3xl font-bold text-red-900">
                        {connectionRequests.filter(r => r.status === 'rejected').length}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-red-900">Rejected</div>
                    <div className="text-xs text-red-700 mt-1">Declined requests</div>
                  </div>
                </div>

                {/* Pending Connection Requests */}
                {connectionRequests.filter(r => r.status === 'pending').length > 0 ? (
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <span>Pending Connection Requests</span>
                    </h3>
                    <div className="space-y-4">
                      {connectionRequests.filter(r => r.status === 'pending').map((request) => (
                        <div key={request.id} className="bg-white border border-gray-200 -xl p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              <img
                                src={request.userAvatar}
                                alt={request.userName}
                                className="w-12 h-14 -lg object-cover object-top ring-2 ring-gray-200"
                                style={{ aspectRatio: '4/5' }}
                              />
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className="font-bold text-gray-900 text-lg">{request.userName}</h4>
                                    <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                                      <span className="flex items-center space-x-1">
                                        <Mail className="w-4 h-4" />
                                        <span>{request.userEmail}</span>
                                      </span>
                                      <span>�</span>
                                      <span>{request.userOrganization}</span>
                                    </div>
                                  </div>
                                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 -full">
                                    {request.timestamp}
                                  </span>
                                </div>
                                
                                <div className="bg-gray-50 -lg p-4 border border-gray-200 mb-4">
                                  <div className="text-sm font-semibold text-gray-700 mb-1">Connection Request Message:</div>
                                  <p className="text-gray-700 italic text-sm">"{request.message}"</p>
                                </div>

                                <div className="flex space-x-3">
                                  <button
                                    onClick={() => handleConnectionRequest(request.id, 'approve')}
                                    className="flex-1 bg-[#1A1F5E] hover:opacity-90 text-white px-6 py-3 -lg font-semibold transition-colors flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                                  >
                                    <CheckCircle className="w-5 h-5" />
                                    <span>Approve Connection</span>
                                  </button>
                                  <button
                                    onClick={() => handleConnectionRequest(request.id, 'reject')}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 -lg font-semibold transition-colors flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                                  >
                                    <XCircle className="w-5 h-5" />
                                    <span>Reject Request</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 bg-gray-50 -xl border-2 border-dashed border-gray-300">
                    <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Pending Connection Requests</h3>
                    <p className="text-gray-600">When users request to connect with you, they will appear here</p>
                  </div>
                )}
              </div>
            )}

            {/* Meeting Access Requests Content � removed (no DB table) */}
            {false && (
              <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 -xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <AlertCircle className="w-8 h-8 text-yellow-600" />
                  <span className="text-3xl font-bold text-yellow-900">
                    {sampleAccessRequests.filter(r => r.status === 'pending').length}
                  </span>
                </div>
                <div className="text-sm font-semibold text-yellow-900">Pending Requests</div>
                <div className="text-xs text-yellow-700 mt-1">Awaiting your review</div>
              </div>

              <div className="bg-[#F4F4F4] border border-[#E5E7EB] -xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <span className="text-3xl font-bold text-green-900">
                    {sampleAccessRequests.filter(r => r.status === 'approved').length}
                  </span>
                </div>
                <div className="text-sm font-semibold text-green-900">Approved</div>
                <div className="text-xs text-green-700 mt-1">Total approved access</div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 -xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <XCircle className="w-8 h-8 text-red-600" />
                  <span className="text-3xl font-bold text-red-900">
                    {sampleAccessRequests.filter(r => r.status === 'rejected').length}
                  </span>
                </div>
                <div className="text-sm font-semibold text-red-900">Rejected</div>
                <div className="text-xs text-red-700 mt-1">Declined requests</div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-2 mb-6 bg-gray-100 p-1 -lg w-fit">
              <button className="px-4 py-2 bg-white text-gray-900 -md shadow-sm font-medium text-sm">
                All Requests ({sampleAccessRequests.length})
              </button>
              <button className="px-4 py-2 text-gray-600 hover:text-gray-900 -md font-medium text-sm">
                Pending ({sampleAccessRequests.filter(r => r.status === 'pending').length})
              </button>
              <button className="px-4 py-2 text-gray-600 hover:text-gray-900 -md font-medium text-sm">
                Approved ({sampleAccessRequests.filter(r => r.status === 'approved').length})
              </button>
              <button className="px-4 py-2 text-gray-600 hover:text-gray-900 -md font-medium text-sm">
                Rejected ({sampleAccessRequests.filter(r => r.status === 'rejected').length})
              </button>
            </div>

            {/* Pending Requests */}
            {sampleAccessRequests.filter(r => r.status === 'pending').length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span>Pending Requests</span>
                </h3>
                <div className="space-y-4">
                  {sampleAccessRequests.filter(r => r.status === 'pending').map((request) => (
                    <div key={request.id} className="bg-white border border-gray-200 -xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-12 h-12 bg-[#1A1F5E] -full flex items-center justify-center text-white font-bold text-lg">
                            {request.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-bold text-gray-900 text-lg">{request.name}</h4>
                                <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                                  <span className="flex items-center space-x-1">
                                    <Mail className="w-4 h-4" />
                                    <span>{request.email}</span>
                                  </span>
                                  <span>�</span>
                                  <span>{request.organization}</span>
                                </div>
                              </div>
                              <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 -full">
                                {request.timestamp}
                              </span>
                            </div>
                            
                            <div className="bg-gray-50 -lg p-4 border border-gray-200 mb-4">
                              <div className="text-sm font-semibold text-gray-700 mb-1">Request Message:</div>
                              <p className="text-gray-700 italic text-sm">"{request.message}"</p>
                            </div>

                            <div className="bg-[#F4F4F4] border border-[#0072CE]/30 -lg p-3 mb-4">
                              <div className="text-xs font-semibold text-[#1A1F5E] mb-1">Webinar Details:</div>
                              <div className="text-sm text-[#1A1F5E]">
                                "Cross-Border M&A Strategies" - Dec 18, 2025 @ 3:00 PM CAT
                              </div>
                            </div>

                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleAccessRequest(request.id, 'approve', '4')}
                                className="flex-1 bg-[#1A1F5E] hover:opacity-90 text-white px-6 py-3 -lg font-semibold transition-colors flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                              >
                                <CheckCircle className="w-5 h-5" />
                                <span>Approve Request</span>
                              </button>
                              <button
                                onClick={() => handleAccessRequest(request.id, 'reject')}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 -lg font-semibold transition-colors flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                              >
                                <XCircle className="w-5 h-5" />
                                <span>Reject Request</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approved Requests */}
            {sampleAccessRequests.filter(r => r.status === 'approved').length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Approved Requests</span>
                </h3>
                <div className="space-y-3">
                  {sampleAccessRequests.filter(r => r.status === 'approved').map((request) => (
                    <div key={request.id} className="bg-green-50 border border-green-200 -xl p-5 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-[#1A1F5E] -full flex items-center justify-center text-white font-bold">
                          {request.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{request.name}</div>
                          <div className="text-sm text-gray-600">{request.email} � {request.organization}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-xs text-gray-500">{request.timestamp}</span>
                        <span className="bg-green-100 text-green-700 px-3 py-1 -full text-xs font-semibold flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Approved</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rejected Requests */}
            {sampleAccessRequests.filter(r => r.status === 'rejected').length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span>Rejected Requests</span>
                </h3>
                <div className="space-y-3">
                  {sampleAccessRequests.filter(r => r.status === 'rejected').map((request) => (
                    <div key={request.id} className="bg-red-50 border border-red-200 -xl p-5 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 -full flex items-center justify-center text-white font-bold">
                          {request.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{request.name}</div>
                          <div className="text-sm text-gray-600">{request.email} � {request.organization}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-xs text-gray-500">{request.timestamp}</span>
                        <span className="bg-red-600 text-white px-3 py-1 -full text-xs font-semibold flex items-center space-x-1">
                          <XCircle className="w-3 h-3" />
                          <span>Rejected</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {sampleAccessRequests.length === 0 && (
              <div className="text-center py-16">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Access Requests Yet</h3>
                <p className="text-gray-600">When users request access to private webinars, they will appear here.</p>
              </div>
            )}
              </div>
            )}
          </div>
        )}

        {/* Live Webinars Tab */}
        {activeTab === 'webinars' && (
          <div className="p-6 overflow-y-auto h-full">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Live Knowledge-Sharing Webinars</h2>
                <p className="text-gray-600">Monthly expert-led discussions on regional trends</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowMeetingsList(!showMeetingsList)}
                  className="bg-[#1A1F5E] hover:opacity-90 text-white px-4 py-2 -lg text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <Video className="w-4 h-4" />
                  <span>My Meetings ({scheduledMeetings.length})</span>
                </button>
                <button 
                  onClick={() => {
                    setShowScheduleModal(true);
                    // Auto-fill expert name from logged-in expert's profile
                    if (isExpert) {
                      const myExpert = experts.find(e => e.email === authUser?.email);
                      const myName = myExpert?.name || authUser?.profile?.name || authUser?.name || '';
                      if (myName) setNewWebinar(prev => ({ ...prev, expert: myName }));
                    }
                  }}
                  className="bg-[#0072CE] hover:bg-[#1A1F5E] text-white px-4 py-2 -lg text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule Webinar</span>
                </button>
              </div>
            </div>

            {/* Scheduled Meetings List */}
            {showMeetingsList && scheduledMeetings.length > 0 && (
              <div className="mb-6 bg-[#F4F4F4] border-2 border-[#E5E7EB] -xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                    <Video className="w-5 h-5 text-green-600" />
                    <span>Your Scheduled Meetings</span>
                  </h3>
                  <button
                    onClick={() => setShowMeetingsList(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  {scheduledMeetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="bg-white border border-gray-200 -lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-1">{meeting.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">{meeting.description}</p>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="flex items-center space-x-2 text-gray-700">
                              <Calendar className="w-4 h-4 text-[#0072CE]" />
                              <span>{meeting.date} at {meeting.time}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-700">
                              <Users className="w-4 h-4 text-green-600" />
                              <span>{meeting.attendees.length} attendees</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-700">
                              <Award className="w-4 h-4 text-[#0072CE]" />
                              <span>Expert: {meeting.expert}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-700">
                              <Globe className="w-4 h-4 text-blue-600" />
                              <span>{meeting.region}</span>
                            </div>
                          </div>
                          {meeting.attendees.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-xs font-semibold text-gray-700 mb-2">Invited:</p>
                              <div className="flex flex-wrap gap-2">
                                {meeting.attendees.map((email, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-[#1A1F5E]/10 text-[#1A1F5E] px-2 py-1 -full"
                                  >
                                    {email}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex flex-col space-y-2">
                          {/* <button
                            onClick={() => window.open(meeting.teamsLink, '_blank')}
                            className="bg-[#0072CE] hover:bg-[#1A1F5E] text-white px-4 py-2 -lg text-sm font-semibold transition-colors flex items-center space-x-2 whitespace-nowrap"
                          >
                            <Video className="w-4 h-4" />
                            <span>Join Meeting</span>
                          </button>
                          <button
                            onClick={() => window.open(meeting.teamsLink, '_blank')}
                            className="bg-[#1A1F5E] hover:opacity-90 text-white px-4 py-2 -lg text-sm font-semibold transition-colors flex items-center space-x-2 whitespace-nowrap"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20.625 8.25h-5.25a.375.375 0 0 0-.375.375v7.5c0 .207.168.375.375.375h5.25c.207 0 .375-.168.375-.375v-7.5a.375.375 0 0 0-.375-.375zM19.5 15h-3v-5.25h3V15zM9.75 8.25c-1.654 0-3 1.346-3 3v4.5H3v-4.5c0-3.722 3.028-6.75 6.75-6.75V8.25zM13.5 11.25v4.5h-3.75v-4.5c0-1.654 1.346-3 3-3v3.75c0 .207-.168.375-.375.375h-.375z"/>
                            </svg>
                            <span>Edit in Teams</span>
                          </button> */}
                          <button
                            onClick={async () => {
                              if (confirm(`Delete meeting "${meeting.title}"?`)) {
                                try {
                                  await expertMeetingsAPI.deleteMeeting(meeting.id);
                                } catch (err) {
                                  console.error('Failed to delete from DB:', err);
                                }
                                setScheduledMeetings(prev => prev.filter(m => m.id !== meeting.id));
                              }
                            }}
                            className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 -lg text-sm font-semibold transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-6">
              {webinars.map((webinar) => {
                const isRegistered = isWebinarRegistered(webinar.id);
                const currentAttendees = webinarAttendees[webinar.id] || webinar.attendees;
                const isFull = currentAttendees >= webinar.maxAttendees;
                
                return (
                  <div key={webinar.id} className="bg-white border border-gray-200 -xl p-6 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">{webinar.title}</h3>
                          {isRegistered && (
                            <span className="bg-green-100 text-green-800 px-3 py-1 -full text-xs font-medium">
                              ? Registered
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{webinar.description}</p>
                        
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center space-x-2">
                            <img
                              src={webinar.expertAvatar}
                              alt={webinar.expert}
                              className="w-8 h-10 -md object-cover object-top"
                              style={{ aspectRatio: '4/5' }}
                            />
                            <span className="text-sm font-medium text-gray-700">{webinar.expert}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4 text-[#0072CE]" />
                            <span className="font-medium">{webinar.date}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-[#0072CE]" />
                            <span>{webinar.time}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4 text-[#0072CE]" />
                            <span>{webinar.region}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4 text-[#0072CE]" />
                            <span className={isFull ? 'text-red-600 font-medium' : ''}>
                              {webinarAttendees[webinar.id] || webinar.attendees}/{webinar.maxAttendees} registered
                            </span>
                            {isFull && (
                              <span className="ml-2 bg-red-100 text-red-700 px-2 py-0.5 -full text-xs font-semibold">FULL</span>
                            )}
                          </div>
                          <span className="bg-[#1A1F5E]/10 text-[#1A1F5E] px-3 py-1 -full text-xs font-medium">
                            {webinar.topic}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-6">
                        {isRegistered ? (
                          <>
                            <button 
                              onClick={() => handleJoinWebinar(webinar.teamsLink)}
                              className="bg-[#1A1F5E] hover:opacity-90 text-white px-5 py-2.5 -lg text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center space-x-2"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M9.5 1.5v3h3v-3h-3zm-4 0v3h3v-3h-3zm-4 3v3h3v-3h-3zm4 0v3h3v-3h-3zm4 0v3h3v-3h-3zm4 0v3h3v-3h-3zm-8 3v3h3v-3h-3zm4 0v3h3v-3h-3zm4 0v3h3v-3h-3zm-4 3v3h3v-3h-3z"/>
                              </svg>
                              <span>Join on Teams</span>
                            </button>
                            <button 
                              onClick={() => handleViewWebinar(webinar)}
                              className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-2.5 -lg text-sm font-medium transition-colors"
                            >
                              View Details
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleRegisterWebinar(webinar)}
                              disabled={isFull}
                              className={`${
                                isFull 
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                  : 'bg-[#0072CE] hover:bg-[#1A1F5E] text-white shadow-md hover:shadow-lg'
                              } px-5 py-2.5 -lg text-sm font-semibold transition-all`}
                            >
                              {isFull ? 'Full' : 'Register Now'}
                            </button>
                            <button 
                              onClick={() => handleViewWebinar(webinar)}
                              className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-2.5 -lg text-sm font-medium transition-colors"
                            >
                              Learn More
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Ask Question Modal */}
      {showAskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white -2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Ask an Expert</h3>
                  <p className="text-sm text-gray-600 mt-1">Get personalized advice from regional experts</p>
                </div>
                <button
                  onClick={() => {
                    setShowAskModal(false);
                    setNewQuestion({ title: '', content: '', tags: '', expertId: '', category: '', isPrivate: false });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Select Expert */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Expert (Optional)
                </label>
                <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                  <button
                    onClick={() => setNewQuestion({...newQuestion, expertId: ''})}
                    className={`p-4 border-2 -xl text-left transition-all ${
                      !newQuestion.expertId
                        ? 'border-[#0072CE] bg-[#F4F4F4]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#1A1F5E] -full flex items-center justify-center text-white font-bold">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">All Experts</div>
                        <div className="text-xs text-gray-600">Community answer</div>
                      </div>
                    </div>
                  </button>
                  {experts.map((expert) => (
                    <button
                      key={expert.id}
                      onClick={() => setNewQuestion({...newQuestion, expertId: expert.id})}
                      className={`p-4 border-2 -xl text-left transition-all ${
                        newQuestion.expertId === expert.id
                          ? 'border-[#0072CE] bg-[#F4F4F4]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={expert.avatar}
                          alt={expert.name}
                          className="w-10 h-12 -md object-cover object-top"
                          style={{ aspectRatio: '4/5' }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-sm truncate">{expert.name}</div>
                          <div className="text-xs text-gray-600 truncate">{expert.title}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Question Category *
                </label>
                <select
                  value={newQuestion.category}
                  onChange={(e) => setNewQuestion({...newQuestion, category: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                >
                  <option value="">Select a category</option>
                  <option value="Tax & Regulatory">Tax & Regulatory</option>
                  <option value="ESG & Sustainability">ESG & Sustainability</option>
                  <option value="Fintech Innovation">Fintech Innovation</option>
                  <option value="Mergers & Acquisitions">Mergers & Acquisitions</option>
                  <option value="Audit & Compliance">Audit & Compliance</option>
                  <option value="Digital Transformation">Digital Transformation</option>
                  <option value="Risk Management">Risk Management</option>
                  <option value="Corporate Governance">Corporate Governance</option>
                  <option value="HR & Talent Development">HR & Talent Development</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Question Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Question Title *
                </label>
                <input
                  type="text"
                  value={newQuestion.title}
                  onChange={(e) => setNewQuestion({...newQuestion, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                  placeholder="What would you like to ask?"
                />
              </div>
              
              {/* Question Details */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Question Details *
                </label>
                <textarea
                  rows={6}
                  value={newQuestion.content}
                  onChange={(e) => setNewQuestion({...newQuestion, content: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                  placeholder="Provide detailed context about your question or business scenario...\n\nFor example:\n- What specific challenge are you facing?\n- What have you tried so far?\n- What is your timeline or urgency?"
                />
              </div>
              
              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tags (Optional)
                </label>
                <input
                  type="text"
                  value={newQuestion.tags}
                  onChange={(e) => setNewQuestion({...newQuestion, tags: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                  placeholder="e.g., tax, Nigeria, cross-border (comma separated)"
                />
              </div>

              {/* Privacy Option */}
              <div className="bg-gray-50 border border-gray-200 -lg p-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newQuestion.isPrivate}
                    onChange={(e) => setNewQuestion({...newQuestion, isPrivate: e.target.checked})}
                    className="mt-1 w-4 h-4 text-[#0072CE] border-gray-300  focus:ring-[#1A1F5E]/20"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">Private Question</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Only you and the selected expert(s) will see this question and its responses
                    </div>
                  </div>
                </label>
              </div>

              {/* Expected Response Time Info */}
              <div className="bg-[#F4F4F4] border border-[#0072CE]/30 -lg p-4 flex items-start space-x-3">
                <Clock className="w-5 h-5 text-[#0072CE] flex-shrink-0 mt-0.5" />
                <div className="text-sm text-[#1A1F5E]">
                  <span className="font-semibold">Expected Response Time:</span> Our experts typically respond within 24-48 hours. Urgent questions may be prioritized.
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex space-x-3">
              <button
                onClick={() => {
                  setShowAskModal(false);
                  setNewQuestion({ title: '', content: '', tags: '', expertId: '', category: '', isPrivate: false });
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 -lg hover:bg-gray-50 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAskQuestion}
                className="flex-1 px-6 py-3 bg-[#1A1F5E] hover:opacity-90 text-white -lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>Submit Question</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expert Profile Modal */}
      {showExpertModal && selectedExpert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white -xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-6">
                  <img
                    src={selectedExpert.avatar}
                    alt={selectedExpert.name}
                    className="w-24 h-24 -full object-cover"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedExpert.name}</h2>
                    <p className="text-xl text-[#0072CE] font-medium">{selectedExpert.title}</p>
                    <p className="text-gray-600">{selectedExpert.company}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedExpert.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Award className="w-4 h-4" />
                        <span>{selectedExpert.experience}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowExpertModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  �
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 -lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{selectedExpert.rating}</div>
                  <div className="text-sm text-gray-600">Rating ({selectedExpert.reviewCount} reviews)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{selectedExpert.experience}</div>
                  <div className="text-sm text-gray-600">Experience</div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                <p className="text-gray-700 leading-relaxed">{selectedExpert.bio}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedExpert.expertise.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[#1A1F5E]/10 text-[#1A1F5E] text-sm font-medium -full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Industries</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedExpert.industries.map((industry, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[#1A1F5E]/10 text-[#1A1F5E] text-sm font-medium -full"
                    >
                      {industry}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Languages</h3>
                <div className="text-gray-700">
                  {selectedExpert.languages.join(', ')}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Past Clients</h3>
                <div className="text-gray-700">
                  {selectedExpert.pastClients.join(' � ')}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowExpertModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 -lg text-sm font-medium transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    setShowExpertModal(false);
                    handleConnect(selectedExpert.id);
                  }}
                  className="flex-1 bg-[#0072CE] hover:bg-[#1A1F5E] text-white py-3 px-4 -lg text-sm font-medium transition-colors"
                >
                  Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connect Modal */}
      {showConnectModal && selectedExpert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white -xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Connect with {selectedExpert.name}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Connection Message
                </label>
                <textarea
                  rows={4}
                  value={connectMessage}
                  onChange={(e) => setConnectMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 -md focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                  placeholder="Introduce yourself and explain why you'd like to connect..."
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowConnectModal(false);
                    setConnectMessage('');
                    setSelectedExpert(null);
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 -lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendConnect}
                  className="flex-1 bg-[#0072CE] hover:bg-[#1A1F5E] text-white py-2 px-4 -lg text-sm font-medium transition-colors"
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && selectedExpert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white -xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Message {selectedExpert.name}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message
                </label>
                <textarea
                  rows={4}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 -md focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                  placeholder="Type your message here..."
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowMessageModal(false);
                    setMessageContent('');
                    setSelectedExpert(null);
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 -lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendDirectMessage}
                  className="flex-1 bg-[#0072CE] hover:bg-[#1A1F5E] text-white py-2 px-4 -lg text-sm font-medium transition-colors"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Webinar Registration Modal */}
      {showRegisterModal && selectedWebinar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white -xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Register for Webinar
              </h3>
              <p className="text-gray-600 text-sm mb-6">{selectedWebinar.title}</p>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={registrationData.name}
                    onChange={(e) => setRegistrationData({...registrationData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 -md focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={registrationData.email}
                    onChange={(e) => setRegistrationData({...registrationData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 -md focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                    placeholder="your.email@company.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={registrationData.phone}
                    onChange={(e) => setRegistrationData({...registrationData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 -md focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                    placeholder="+234 xxx xxx xxxx"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization
                  </label>
                  <input
                    type="text"
                    value={registrationData.organization}
                    onChange={(e) => setRegistrationData({...registrationData, organization: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 -md focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                    placeholder="Your company name"
                  />
                </div>
              </div>

              <div className="bg-[#F4F4F4] border border-[#0072CE]/30 -lg p-4 mb-6">
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-[#0072CE] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-[#1A1F5E]">
                    <p className="font-medium mb-1">What happens next?</p>
                    <ul className="list-disc list-inside space-y-1 text-[#1A1F5E]">
                      <li>You'll receive a confirmation email with the Teams link</li>
                      <li>Calendar invite will be sent to your email</li>
                      <li>Join 15 minutes early for networking</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowRegisterModal(false);
                    setRegistrationData({ name: '', email: '', phone: '', organization: '' });
                    setSelectedWebinar(null);
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 -lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRegistration}
                  disabled={!registrationData.name || !registrationData.email}
                  className={`flex-1 py-2 px-4 -lg text-sm font-medium transition-colors ${
                    registrationData.name && registrationData.email
                      ? 'bg-[#0072CE] hover:bg-[#1A1F5E] text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Complete Registration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Webinar Details Modal */}
      {showWebinarModal && selectedWebinar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white -xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedWebinar.title}
                  </h3>
                  <span className="bg-[#1A1F5E]/10 text-[#1A1F5E] px-3 py-1 -full text-sm font-medium">
                    {selectedWebinar.topic}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowWebinarModal(false);
                    setSelectedWebinar(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center space-x-4 mb-6 pb-6 border-b">
                <img
                  src={selectedWebinar.expertAvatar}
                  alt={selectedWebinar.expert}
                  className="w-16 h-16 -full object-cover"
                />
                <div>
                  <p className="text-sm text-gray-600">Expert Speaker</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedWebinar.expert}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 -lg p-4">
                  <div className="flex items-center space-x-2 text-gray-600 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">Date</span>
                  </div>
                  <p className="text-gray-900 font-semibold">{selectedWebinar.date}</p>
                </div>
                <div className="bg-gray-50 -lg p-4">
                  <div className="flex items-center space-x-2 text-gray-600 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Time</span>
                  </div>
                  <p className="text-gray-900 font-semibold">{selectedWebinar.time}</p>
                </div>
                <div className="bg-gray-50 -lg p-4">
                  <div className="flex items-center space-x-2 text-gray-600 mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">Region</span>
                  </div>
                  <p className="text-gray-900 font-semibold">{selectedWebinar.region}</p>
                </div>
                <div className="bg-gray-50 -lg p-4">
                  <div className="flex items-center space-x-2 text-gray-600 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">Attendees</span>
                  </div>
                  <p className="text-gray-900 font-semibold">
                    {selectedWebinar.attendees}/{selectedWebinar.maxAttendees}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">About This Webinar</h4>
                <p className="text-gray-700 leading-relaxed">{selectedWebinar.description}</p>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">What You'll Learn</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-[#0072CE] mr-2">?</span>
                    <span>Latest regulatory developments and compliance requirements</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#0072CE] mr-2">?</span>
                    <span>Practical strategies and real-world case studies</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#0072CE] mr-2">?</span>
                    <span>Q&A session with industry expert</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#0072CE] mr-2">?</span>
                    <span>Networking opportunities with peers across Africa</span>
                  </li>
                </ul>
              </div>

              {selectedWebinar.teamsLink && (
                <div className="bg-[#F4F4F4] border border-[#0072CE]/30 -lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 text-[#0072CE] flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M9.5 1.5v3h3v-3h-3zm-4 0v3h3v-3h-3zm-4 3v3h3v-3h-3zm4 0v3h3v-3h-3zm4 0v3h3v-3h-3zm4 0v3h3v-3h-3zm-8 3v3h3v-3h-3zm4 0v3h3v-3h-3zm4 0v3h3v-3h-3zm-4 3v3h3v-3h-3z"/>
                    </svg>
                    <div className="flex-1">
                      <p className="font-semibold text-[#1A1F5E] mb-1">Join via Microsoft Teams</p>
                      <p className="text-sm text-[#1A1F5E] mb-3">
                        This webinar will be hosted on Microsoft Teams. Make sure you have the Teams app installed or use the web version.
                      </p>
                      {isWebinarRegistered(selectedWebinar.id) && (
                        <button
                          onClick={() => handleJoinWebinar(selectedWebinar.teamsLink)}
                          className="text-sm text-[#1A1F5E] hover:text-[#1A1F5E] font-medium underline"
                        >
                          Click here to copy Teams link
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowWebinarModal(false);
                    setSelectedWebinar(null);
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 -lg text-sm font-medium transition-colors"
                >
                  Close
                </button>
                {isWebinarRegistered(selectedWebinar.id) ? (
                  <button
                    onClick={() => handleJoinWebinar(selectedWebinar.teamsLink)}
                    className="flex-1 bg-[#1A1F5E] hover:opacity-90 text-white py-3 px-4 -lg text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M9.5 1.5v3h3v-3h-3zm-4 0v3h3v-3h-3zm-4 3v3h3v-3h-3zm4 0v3h3v-3h-3zm4 0v3h3v-3h-3zm4 0v3h3v-3h-3zm-8 3v3h3v-3h-3zm4 0v3h3v-3h-3zm4 0v3h3v-3h-3zm-4 3v3h3v-3h-3z"/>
                    </svg>
                    <span>Join on Teams</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowWebinarModal(false);
                      handleRegisterWebinar(selectedWebinar);
                    }}
                    disabled={selectedWebinar.attendees >= selectedWebinar.maxAttendees}
                    className={`flex-1 py-3 px-4 -lg text-sm font-semibold transition-all ${
                      selectedWebinar.attendees >= selectedWebinar.maxAttendees
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[#0072CE] hover:bg-[#1A1F5E] text-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    {selectedWebinar.attendees >= selectedWebinar.maxAttendees ? 'Webinar Full' : 'Register Now'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Webinar Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white -xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Schedule New Webinar</h3>
                  <p className="text-gray-600 text-sm mt-1">Create a knowledge-sharing session with Teams integration</p>
                </div>
                <button
                  onClick={() => {
                    setShowScheduleModal(false);
                    setNewWebinar({
                      title: '',
                      description: '',
                      date: '',
                      time: '',
                      topic: '',
                      region: '',
                      maxAttendees: '50',
                      expert: '',
                      isPrivate: false,
                      invitedEmails: [],
                      lobbyBypass: 'organization'
                    });
                    setEmailInput('');
                    setShowSuggestions(false);
                    setShowRequestsPanel(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Webinar Title *
                  </label>
                  <input
                    type="text"
                    value={newWebinar.title}
                    onChange={(e) => setNewWebinar({...newWebinar, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                    placeholder="e.g., Cross-Border M&A Strategies for West Africa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    rows={4}
                    value={newWebinar.description}
                    onChange={(e) => setNewWebinar({...newWebinar, description: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                    placeholder="Provide a detailed description of what participants will learn..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={newWebinar.date}
                      onChange={(e) => setNewWebinar({...newWebinar, date: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Time *
                    </label>
                    <input
                      type="time"
                      value={newWebinar.time}
                      onChange={(e) => setNewWebinar({...newWebinar, time: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Topic/Category *
                    </label>
                    <select
                      value={newWebinar.topic}
                      onChange={(e) => setNewWebinar({...newWebinar, topic: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                    >
                      <option value="">Select topic</option>
                      <option value="Tax & Regulatory">Tax & Regulatory</option>
                      <option value="ESG & Sustainability">ESG & Sustainability</option>
                      <option value="Fintech Innovation">Fintech Innovation</option>
                      <option value="Mergers & Acquisitions">Mergers & Acquisitions</option>
                      <option value="Audit & Compliance">Audit & Compliance</option>
                      <option value="Digital Transformation">Digital Transformation</option>
                      <option value="Risk Management">Risk Management</option>
                      <option value="Corporate Governance">Corporate Governance</option>
                      <option value="Climate Finance">Climate Finance</option>
                      <option value="HR & Talent Development">HR & Talent Development</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Region *
                    </label>
                    <select
                      value={newWebinar.region}
                      onChange={(e) => setNewWebinar({...newWebinar, region: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                    >
                      <option value="">Select region</option>
                      <option value="West Africa">West Africa</option>
                      <option value="East Africa">East Africa</option>
                      <option value="Southern Africa">Southern Africa</option>
                      <option value="North Africa">North Africa</option>
                      <option value="Central Africa">Central Africa</option>
                      <option value="Pan-African">Pan-African</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Expert Speaker *
                    </label>
                    <select
                      value={newWebinar.expert}
                      onChange={(e) => setNewWebinar({...newWebinar, expert: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                    >
                      <option value="">Select expert</option>
                      {experts.map((expert) => (
                        <option key={expert.id} value={expert.name}>
                          {expert.name} - {expert.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Max Attendees *
                    </label>
                    <select
                      value={newWebinar.maxAttendees}
                      onChange={(e) => setNewWebinar({...newWebinar, maxAttendees: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                    >
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="75">75</option>
                      <option value="100">100</option>
                      <option value="150">150</option>
                      <option value="200">200</option>
                    </select>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Privacy Settings
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setNewWebinar({...newWebinar, isPrivate: false, invitedEmails: []})}
                      className={`p-4 border-2 -lg transition-all ${
                        !newWebinar.isPrivate
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-2">
                        <Unlock className={`w-6 h-6 ${
                          !newWebinar.isPrivate ? 'text-green-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="font-semibold text-gray-900 mb-1">Public Webinar</div>
                      <div className="text-xs text-gray-600">Anyone can register and join</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewWebinar({...newWebinar, isPrivate: true})}
                      className={`p-4 border-2 -lg transition-all ${
                        newWebinar.isPrivate
                          ? 'border-[#0072CE] bg-[#F4F4F4]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-2">
                        <Lock className={`w-6 h-6 ${
                          newWebinar.isPrivate ? 'text-[#0072CE]' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="font-semibold text-gray-900 mb-1">Private Webinar</div>
                      <div className="text-xs text-gray-600">Invite-only or request access</div>
                    </button>
                  </div>
                </div>

                {/* Email Invitations (for all webinars) */}
                <div className="bg-[#F4F4F4] border border-[#0072CE]/30 -lg p-5">
                  <div className="flex items-center space-x-2 mb-4">
                    <Mail className="w-5 h-5 text-[#0072CE]" />
                    <label className="text-sm font-semibold text-[#1A1F5E]">
                      Invite Participants via Email (Optional)
                    </label>
                  </div>
                  <p className="text-xs text-[#1A1F5E] mb-3">
                    Add email addresses to automatically invite people to this Teams meeting.
                  </p>
                    
                    {/* Email Input with Predictive Typing */}
                    <div className="relative mb-3">
                      <div className="flex space-x-2">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={emailInput}
                            onChange={(e) => handleEmailInputChange(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && emailInput.includes('@')) {
                                e.preventDefault();
                                addInvitedEmail(emailInput);
                              }
                            }}
                            className="w-full px-4 py-2 border border-[#0072CE]/40 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E] text-sm"
                            placeholder="Type name or email to search..."
                          />
                          
                          {/* Predictive Suggestions Dropdown */}
                          {showSuggestions && emailSuggestions.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 -lg shadow-lg max-h-60 overflow-y-auto">
                              {emailSuggestions.map((user) => (
                                <button
                                  key={user.id}
                                  type="button"
                                  onClick={() => addInvitedEmail(user.email)}
                                  className="w-full px-4 py-3 hover:bg-[#1A1F5E]/5 flex items-center space-x-3 text-left border-b border-gray-100 last:border-b-0"
                                >
                                  <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-10 h-10 -full object-cover"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-gray-900 text-sm truncate">
                                      {user.name}
                                    </div>
                                    <div className="text-xs text-[#0072CE] truncate">
                                      {user.email}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">
                                      {user.role} � {user.organization}
                                    </div>
                                  </div>
                                  <UserPlus className="w-4 h-4 text-[#0072CE] flex-shrink-0" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            console.log('?? Add button clicked. emailInput:', emailInput);
                            if (emailInput && emailInput.trim().length > 0) {
                              if (emailInput.includes('@')) {
                                addInvitedEmail(emailInput);
                              } else {
                                console.warn('?? Email does not contain @ symbol');
                                alert('Please enter a valid email address');
                              }
                            } else {
                              console.warn('?? Email input is empty');
                              alert('Please enter an email address');
                            }
                          }}
                          className="px-4 py-2 bg-[#0072CE] hover:bg-[#1A1F5E] text-white -lg text-sm font-semibold transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Invited Emails List */}
                    {newWebinar.invitedEmails.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-[#1A1F5E] mb-2">
                          Invited ({newWebinar.invitedEmails.length})
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {newWebinar.invitedEmails.map((email, index) => (
                            <div
                              key={index}
                              className="bg-white border border-[#0072CE]/40 -full px-3 py-1 flex items-center space-x-2 text-sm"
                            >
                              <span className="text-gray-700">{email}</span>
                              <button
                                type="button"
                                onClick={() => removeInvitedEmail(email)}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lobby Bypass Settings */}
                    <div className="mt-5 pt-5 border-t border-[#0072CE]/30">
                      <label className="block text-sm font-semibold text-[#1A1F5E] mb-3">
                        Microsoft Teams Lobby Settings
                      </label>
                      <p className="text-xs text-[#1A1F5E] mb-3">
                        Choose who can bypass the meeting lobby and join directly
                      </p>
                      <select
                        value={newWebinar.lobbyBypass}
                        onChange={(e) => setNewWebinar({
                          ...newWebinar, 
                          lobbyBypass: e.target.value as 'everyone' | 'organization' | 'organizationAndFederated' | 'invited'
                        })}
                        className="w-full px-4 py-2 border border-[#0072CE]/40 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E] text-sm bg-white"
                      >
                        <option value="invited">Invited People Only</option>
                        <option value="organization">My Organization</option>
                        <option value="organizationAndFederated">My Organization and Trusted Partners</option>
                        <option value="everyone">Everyone (No Lobby)</option>
                      </select>
                      <p className="text-xs text-[#0072CE] mt-2">
                        {newWebinar.lobbyBypass === 'invited' && '?? Most secure - Only invited participants bypass lobby'}
                        {newWebinar.lobbyBypass === 'organization' && '?? Organization members bypass lobby'}
                        {newWebinar.lobbyBypass === 'organizationAndFederated' && '?? Your org and trusted partners bypass lobby'}
                        {newWebinar.lobbyBypass === 'everyone' && '?? No lobby - Anyone with link joins directly'}
                      </p>
                    </div>

                    {/* Access Requests Panel Toggle */}
                    {accessRequests.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowRequestsPanel(!showRequestsPanel)}
                        className="mt-4 w-full px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-900 -lg text-sm font-semibold transition-colors flex items-center justify-between"
                      >
                        <span>Access Requests ({accessRequests.filter(r => r.status === 'pending').length} pending)</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${
                          showRequestsPanel ? 'rotate-180' : ''
                        }`} />
                      </button>
                    )}

                    {/* Access Requests List */}
                    {showRequestsPanel && accessRequests.length > 0 && (
                      <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                        {accessRequests.map((request) => (
                          <div
                            key={request.id}
                            className={`p-3 -lg border ${
                              request.status === 'pending'
                                ? 'bg-white border-gray-200'
                                : request.status === 'approved'
                                ? 'bg-green-50 border-green-200'
                                : 'bg-red-50 border-red-200'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900 text-sm">
                                  {request.name}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {request.email} � {request.organization}
                                </div>
                              </div>
                              {request.status === 'pending' && (
                                <div className="flex space-x-1">
                                  <button
                                    type="button"
                                    onClick={() => handleAccessRequest(request.id, 'approve')}
                                    className="px-2 py-1 bg-[#1A1F5E] hover:opacity-90 text-white  text-xs font-semibold"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAccessRequest(request.id, 'reject')}
                                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white  text-xs font-semibold"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            </div>
                            {request.message && (
                              <p className="text-xs text-gray-600 italic mt-1">
                                "{request.message}"
                              </p>
                            )}
                            {request.status !== 'pending' && (
                              <div className={`text-xs font-semibold mt-2 ${
                                request.status === 'approved' ? 'text-green-700' : 'text-red-700'
                              }`}>
                                {request.status === 'approved' ? '? Approved' : '? Rejected'}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                <div className="bg-[#F4F4F4] border border-[#0072CE]/30 -lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 text-[#0072CE] flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M9.5 1.5v3h3v-3h-3zm-4 0v3h3v-3h-3zm-4 3v3h3v-3h-3zm4 0v3h3v-3h-3zm4 0v3h3v-3h-3zm4 0v3h3v-3h-3zm-8 3v3h3v-3h-3zm4 0v3h3v-3h-3zm4 0v3h3v-3h-3zm-4 3v3h3v-3h-3z"/>
                    </svg>
                    <div className="flex-1">
                      <p className="font-semibold text-[#1A1F5E] mb-1">Microsoft Teams Integration</p>
                      <p className="text-sm text-[#1A1F5E]">
                        A Teams meeting link will be automatically generated for this webinar. 
                        {newWebinar.isPrivate 
                          ? ' Only invited participants and approved access requests will receive the link.'
                          : ' All registered participants will receive the link via email.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-8">
                <button
                  onClick={() => {
                    setShowScheduleModal(false);
                    setNewWebinar({
                      title: '',
                      description: '',
                      date: '',
                      time: '',
                      topic: '',
                      region: '',
                      maxAttendees: '50',
                      expert: '',
                      isPrivate: false,
                      invitedEmails: [],
                      lobbyBypass: 'organization'
                    });
                    setEmailInput('');
                    setShowSuggestions(false);
                    setShowRequestsPanel(false);
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 -lg text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleWebinar}
                  className="flex-1 bg-[#1A1F5E] hover:opacity-90 text-white py-3 px-4 -lg text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Schedule Webinar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Become an Expert Modal */}
      {showBecomeExpertModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white -2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[#F4F4F4] -xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-[#1A1F5E]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Become an Expert</h2>
                    <p className="text-sm text-gray-600">Share your knowledge and expertise with our community</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBecomeExpertModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Experience */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Years of Experience *
                  </label>
                  <select
                    value={expertApplication.experience}
                    onChange={(e) => setExpertApplication({...expertApplication, experience: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                  >
                    <option value="">Select experience level</option>
                    <option value="5-10 years">5-10 years</option>
                    <option value="10-15 years">10-15 years</option>
                    <option value="15-20 years">15-20 years</option>
                    <option value="20+ years">20+ years</option>
                  </select>
                </div>

                {/* Expertise Areas */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Primary Area of Expertise *
                  </label>
                  <select
                    value={expertApplication.expertise[0] || ''}
                    onChange={(e) => setExpertApplication({
                      ...expertApplication,
                      expertise: e.target.value ? [e.target.value, ...expertApplication.expertise.slice(1)] : expertApplication.expertise.slice(1)
                    })}
                    className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E] mb-3"
                  >
                    <option value="">Select primary expertise</option>
                    <option value="Transfer Pricing">Transfer Pricing</option>
                    <option value="International Tax">International Tax</option>
                    <option value="ESG & Sustainability">ESG & Sustainability</option>
                    <option value="M&A Advisory">M&A Advisory</option>
                    <option value="Tax Advisory">Tax Advisory</option>
                    <option value="Regulatory Compliance">Regulatory Compliance</option>
                    <option value="Financial Reporting">Financial Reporting</option>
                    <option value="Risk Management">Risk Management</option>
                    <option value="Corporate Finance">Corporate Finance</option>
                    <option value="Audit & Assurance">Audit & Assurance</option>
                  </select>
                  
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Additional Expertise (Optional)
                  </label>
                  <textarea
                    value={expertApplication.expertise.slice(1).join(', ')}
                    onChange={(e) => setExpertApplication({
                      ...expertApplication,
                      expertise: [
                        expertApplication.expertise[0] || '',
                        ...e.target.value.split(',').map(s => s.trim()).filter(s => s)
                      ].filter(s => s)
                    })}
                    placeholder="BEPS Compliance, IFRS, Climate Finance"
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                  />
                </div>

                {/* Industries */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Primary Industry Focus *
                  </label>
                  <select
                    value={expertApplication.industries[0] || ''}
                    onChange={(e) => setExpertApplication({
                      ...expertApplication,
                      industries: e.target.value ? [e.target.value, ...expertApplication.industries.slice(1)] : expertApplication.industries.slice(1)
                    })}
                    className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E] mb-3"
                  >
                    <option value="">Select primary industry</option>
                    <option value="Financial Services">Financial Services</option>
                    <option value="Energy & Mining">Energy & Mining</option>
                    <option value="Technology & Telecommunications">Technology & Telecommunications</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Healthcare & Pharmaceuticals">Healthcare & Pharmaceuticals</option>
                    <option value="Real Estate & Construction">Real Estate & Construction</option>
                    <option value="Agriculture & Agribusiness">Agriculture & Agribusiness</option>
                    <option value="Retail & Consumer Goods">Retail & Consumer Goods</option>
                    <option value="Transportation & Logistics">Transportation & Logistics</option>
                    <option value="Government & Public Sector">Government & Public Sector</option>
                  </select>
                  
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Additional Industries (Optional)
                  </label>
                  <textarea
                    value={expertApplication.industries.slice(1).join(', ')}
                    onChange={(e) => setExpertApplication({
                      ...expertApplication,
                      industries: [
                        expertApplication.industries[0] || '',
                        ...e.target.value.split(',').map(s => s.trim()).filter(s => s)
                      ].filter(s => s)
                    })}
                    placeholder="Insurance, Private Equity"
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                  />
                </div>

                {/* Motivation */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Why do you want to become an expert? *
                  </label>
                  <textarea
                    value={expertApplication.motivation}
                    onChange={(e) => setExpertApplication({...expertApplication, motivation: e.target.value})}
                    placeholder="I am passionate about sharing my knowledge and helping others navigate complex tax regulations in Africa. I believe..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                  />
                </div>

                {/* Achievements */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notable Achievements & Credentials
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Share your qualifications, certifications, publications, or notable projects</p>
                  <textarea
                    value={expertApplication.achievements}
                    onChange={(e) => setExpertApplication({...expertApplication, achievements: e.target.value})}
                    placeholder="CPA, ACCA certified. Published articles on African tax frameworks. Led transfer pricing projects for Fortune 500 companies..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                  />
                </div>

                {/* Info Box */}
                <div className="bg-[#F4F4F4] border border-[#0072CE]/30 -lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-[#0072CE] mt-0.5" />
                    <div className="text-sm text-[#1A1F5E]">
                      <p className="font-semibold mb-1">What happens next?</p>
                      <ul className="space-y-1 text-[#1A1F5E]">
                        <li>� Our team will review your application within 2-3 business days</li>
                        <li>� We may contact you for additional information or an interview</li>
                        <li>� Once approved, you'll get access to expert features and be listed in the directory</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-4 mt-8">
                <button
                  onClick={() => setShowBecomeExpertModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 -lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitExpertApplication}
                  className="flex-1 bg-[#1A1F5E] hover:opacity-90 text-white py-3 px-4 -lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <Award className="w-5 h-5" />
                  <span>Submit Application</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ExpertDirectory;

