import React, { useState } from 'react';
import { useEffect } from 'react';
import { Search, MapPin, Users, Star, MessageCircle, Calendar, Filter, ChevronDown, Award, Globe, Clock, Send, X, Lock, Unlock, Mail, UserPlus, Bell, CheckCircle, XCircle, AlertCircle, Video, ChevronRight } from 'lucide-react';
import { expertsAPI, questionsAPI } from '../services/api';

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
  // Check if user is an expert from localStorage
  const [isExpert, setIsExpert] = useState(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      return userData.role === 'expert';
    }
    return false;
  });
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
  const [activeTab, setActiveTab] = useState<'directory' | 'myExperts' | 'forum' | 'webinars' | 'requests'>('directory');
  const [connectedExperts, setConnectedExperts] = useState<Expert[]>([]);
  const [expertConversations, setExpertConversations] = useState<{[key: string]: any[]}>({});
  const [showFilters, setShowFilters] = useState(false);
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
  const [registeredWebinars, setRegisteredWebinars] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('registeredWebinarIds');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [loading, setLoading] = useState(true);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
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
  
  // Scheduled meetings state
  const [scheduledMeetings, setScheduledMeetings] = useState<ScheduledMeeting[]>(() => {
    const saved = localStorage.getItem('scheduledMeetings');
    const meetings = saved ? JSON.parse(saved) : [];
    
    // Add test meeting with attendees if not already present
    const hasTestMeeting = meetings.some((m: ScheduledMeeting) => m.title === 'Test Meeting with Attendees - AI Integration Demo');
    
    if (!hasTestMeeting) {
      const testMeetingDate = new Date('2026-01-25T15:00:00');
      const startTime = testMeetingDate.toISOString();
      const endTime = new Date(testMeetingDate.getTime() + 60 * 60 * 1000).toISOString();
      
      const teamsParams = new URLSearchParams();
      teamsParams.append('subject', 'Test Meeting with Attendees - AI Integration Demo');
      teamsParams.append('content', 'This is a test meeting to demonstrate the attendee feature working correctly. Topics include AI integration in African financial services.');
      teamsParams.append('startTime', startTime);
      teamsParams.append('endTime', endTime);
      teamsParams.append('attendees', 'testuser.demo@gmail.com,sarah.johnson@forvismazars.com,michael.chen@forvismazars.com');
      
      const testMeeting: ScheduledMeeting = {
        id: `meeting-test-${Date.now()}`,
        title: 'Test Meeting with Attendees - AI Integration Demo',
        description: 'This is a test meeting to demonstrate the attendee feature working correctly. Topics include AI integration in African financial services, digital transformation, and cross-border payment systems.',
        date: '2026-01-25',
        time: '15:00',
        startDateTime: startTime,
        endDateTime: endTime,
        topic: 'Digital Transformation',
        region: 'Pan-African',
        expert: 'Amara Okafor',
        attendees: ['testuser.demo@gmail.com', 'sarah.johnson@forvismazars.com', 'michael.chen@forvismazars.com'],
        lobbyBypass: 'organization',
        teamsLink: `https://teams.microsoft.com/l/meeting/new?${teamsParams.toString()}`,
        createdAt: new Date().toISOString(),
        createdBy: 'System Test'
      };
      
      meetings.push(testMeeting);
      localStorage.setItem('scheduledMeetings', JSON.stringify(meetings));
    }
    
    return meetings;
  });
  const [showMeetingsList, setShowMeetingsList] = useState(false);

  // Platform users for email invitations (dummy data)
  const platformUsers: PlatformUser[] = [
    { id: 'test-gmail', name: 'Test User Gmail', email: 'testuser.demo@gmail.com', avatar: 'https://i.pravatar.cc/150?img=99', role: 'Test User', organization: 'Gmail' },
    { id: '1', name: 'Sarah Johnson', email: 'sarah.johnson@forvismazars.com', avatar: 'https://i.pravatar.cc/150?img=1', role: 'Senior Consultant', organization: 'Forvis Mazars' },
    { id: '2', name: 'Michael Chen', email: 'michael.chen@forvismazars.com', avatar: 'https://i.pravatar.cc/150?img=2', role: 'Manager', organization: 'Forvis Mazars' },
    { id: '3', name: 'Aisha Patel', email: 'aisha.patel@forvismazars.com', avatar: 'https://i.pravatar.cc/150?img=3', role: 'Director', organization: 'Forvis Mazars' },
    { id: '4', name: 'David Okonkwo', email: 'david.okonkwo@firstbank.ng', avatar: 'https://i.pravatar.cc/150?img=4', role: 'CFO', organization: 'First Bank Nigeria' },
    { id: '5', name: 'Lisa Wong', email: 'lisa.wong@standardbank.co.za', avatar: 'https://i.pravatar.cc/150?img=5', role: 'Head of Finance', organization: 'Standard Bank' },
    { id: '6', name: 'Ahmed Hassan', email: 'ahmed.hassan@orascom.com', avatar: 'https://i.pravatar.cc/150?img=6', role: 'VP Operations', organization: 'Orascom' },
    { id: '7', name: 'Grace Mutai', email: 'grace.mutai@safaricom.co.ke', avatar: 'https://i.pravatar.cc/150?img=7', role: 'Product Manager', organization: 'Safaricom' },
    { id: '8', name: 'James Ndlovu', email: 'james.ndlovu@angloamerican.com', avatar: 'https://i.pravatar.cc/150?img=8', role: 'ESG Manager', organization: 'Anglo American' },
    { id: '9', name: 'Fatima Ibrahim', email: 'fatima.ibrahim@dangote.com', avatar: 'https://i.pravatar.cc/150?img=9', role: 'Tax Specialist', organization: 'Dangote Group' },
    { id: '10', name: 'Robert Kamau', email: 'robert.kamau@equitybank.co.ke', avatar: 'https://i.pravatar.cc/150?img=10', role: 'Risk Analyst', organization: 'Equity Bank' },
    { id: '11', name: 'Maria Santos', email: 'maria.santos@mtn.com', avatar: 'https://i.pravatar.cc/150?img=11', role: 'Business Analyst', organization: 'MTN' },
    { id: '12', name: 'Thomas Mbeki', email: 'thomas.mbeki@sasol.com', avatar: 'https://i.pravatar.cc/150?img=12', role: 'Sustainability Lead', organization: 'Sasol' }
  ];

  // Handle email input changes with predictive typing
  const handleEmailInputChange = (value: string) => {
    setEmailInput(value);
    
    if (value.trim().length > 0) {
      const filtered = platformUsers.filter(user => 
        user.email.toLowerCase().includes(value.toLowerCase()) ||
        user.name.toLowerCase().includes(value.toLowerCase()) ||
        user.organization.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setEmailSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
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
    console.log('🔵 addInvitedEmail called with:', email);
    
    if (!email || email.trim() === '') {
      console.warn('⚠️ Email is empty!');
      return;
    }

    // Use callback form of setState to get fresh state
    setNewWebinar((prevWebinar) => {
      console.log('Previous invitedEmails:', prevWebinar.invitedEmails);
      
      if (prevWebinar.invitedEmails.includes(email)) {
        console.warn('⚠️ Email already exists in invitedEmails:', email);
        return prevWebinar;
      }
      
      const updatedEmails = [...prevWebinar.invitedEmails, email];
      console.log('✅ Adding email. Updated emails:', updatedEmails);
      
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
    console.log('🔴 removeInvitedEmail called for:', email);
    
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
  const handleConnectionRequest = (requestId: string, action: 'approve' | 'reject') => {
    const request = connectionRequests.find(r => r.id === requestId);
    
    if (action === 'approve' && request) {
      // Find the expert and add to connected experts
      const expert = experts.find(e => e.id === request.expertId);
      if (expert && !connectedExperts.find(e => e.id === expert.id)) {
        setConnectedExperts([...connectedExperts, expert]);
        // Initialize conversation for this expert
        setExpertConversations({
          ...expertConversations,
          [expert.id]: []
        });
      }
      alert(`Connection request approved! ${request.userName} can now message you.`);
    } else if (action === 'reject' && request) {
      alert(`Connection request from ${request.userName} has been rejected.`);
    }
    
    // Update request status
    setConnectionRequests(prev =>
      prev.map(req =>
        req.id === requestId
          ? { ...req, status: action === 'approve' ? 'approved' : 'rejected' }
          : req
      )
    );
  };

  // Handle expert application submission
  const handleSubmitExpertApplication = () => {
    if (!expertApplication.motivation || !expertApplication.experience) {
      alert('Please fill in all required fields');
      return;
    }
    // TODO: Submit application to backend
    alert('Your expert application has been submitted! We will review it and get back to you within 2-3 business days.');
    setShowBecomeExpertModal(false);
    setExpertApplication({
      expertise: [],
      industries: [],
      experience: '',
      motivation: '',
      achievements: ''
    });
  };

  // Dummy experts data as fallback
  const dummyExperts: Expert[] = [
    {
      id: '1',
      name: 'Amara Okafor',
      title: 'Tax & Regulatory Expert',
      company: 'Forvis Mazars',
      email: 'Walter.Blake@forvismazars.com',
      avatar: 'https://images.pexels.com/photos/3778966/pexels-photo-3778966.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      location: 'Lagos, Nigeria',
      country: 'Nigeria',
      expertise: ['Corporate Tax', 'Transfer Pricing', 'Tax Planning', 'Cross-Border Taxation'],
      industries: ['Financial Services', 'Oil & Gas', 'Manufacturing'],
      languages: ['English', 'Yoruba', 'Igbo'],
      rating: 4.9,
      reviewCount: 47,
      isAvailable: true,
      experience: '15+ years',
      pastClients: ['First Bank Nigeria', 'Dangote Group', 'MTN Nigeria'],
      bio: 'Leading tax expert specializing in West African tax harmonization and cross-border transactions. Extensive experience in transfer pricing and international tax structuring.'
    },
    {
      id: '2',
      name: 'Thabo Mthembu',
      title: 'ESG & Sustainability Advisor',
      company: 'Forvis Mazars',
      email: 'thabo.mthembu@forvismzars.com',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      location: 'Johannesburg, South Africa',
      country: 'South Africa',
      expertise: ['ESG Strategy', 'Sustainability Reporting', 'Climate Risk', 'Impact Assessment'],
      industries: ['Mining', 'Energy', 'Manufacturing', 'Agriculture'],
      languages: ['English', 'Zulu', 'Afrikaans'],
      rating: 4.8,
      reviewCount: 38,
      isAvailable: true,
      experience: '12+ years',
      pastClients: ['Anglo American', 'Sasol', 'Standard Bank'],
      bio: 'ESG transformation specialist with deep expertise in Southern African mining and energy sectors. Pioneer in implementing sustainable business practices across the continent.'
    },
    {
      id: '3',
      name: 'Kemi Adebayo',
      title: 'Fintech & Digital Banking Specialist',
      company: 'Forvis Mazars',
      email: 'kemi.adebayo@forvismzars.com',
      avatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      location: 'Nairobi, Kenya',
      country: 'Kenya',
      expertise: ['Digital Banking', 'Payment Systems', 'Mobile Money', 'Regulatory Compliance'],
      industries: ['Banking', 'Fintech', 'Telecommunications'],
      languages: ['English', 'Swahili'],
      rating: 4.9,
      reviewCount: 52,
      isAvailable: true,
      experience: '10+ years',
      pastClients: ['Safaricom', 'Equity Bank', 'M-Pesa'],
      bio: 'Fintech innovation leader driving digital transformation in East African financial services. Expert in mobile money ecosystems and regulatory frameworks.'
    },
    {
      id: '4',
      name: 'Fatima El-Sayed',
      title: 'Audit & Assurance Partner',
      company: 'Forvis Mazars',
      email: 'fatima.elsayed@forvismzars.com',
      avatar: 'https://images.pexels.com/photos/3776164/pexels-photo-3776164.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      location: 'Cairo, Egypt',
      country: 'Egypt',
      expertise: ['Financial Audit', 'IFRS', 'Internal Controls', 'Risk Management'],
      industries: ['Retail', 'Hospitality', 'Real Estate', 'Construction'],
      languages: ['Arabic', 'English', 'French'],
      rating: 4.7,
      reviewCount: 41,
      isAvailable: false,
      experience: '18+ years',
      pastClients: ['Orascom', 'Talaat Moustafa Group', 'Egyptian Banks'],
      bio: 'Senior audit partner with extensive experience in North African markets. Specialized in complex financial reporting and regulatory compliance across multiple jurisdictions.'
    },
    {
      id: '5',
      name: 'Kwame Asante',
      title: 'M&A Advisory Specialist',
      company: 'Forvis Mazars',
      email: 'kwame.asante@forvismzars.com',
      avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      location: 'Accra, Ghana',
      country: 'Ghana',
      expertise: ['Mergers & Acquisitions', 'Due Diligence', 'Valuations', 'Deal Structuring'],
      industries: ['Consumer Goods', 'Healthcare', 'Technology', 'Agriculture'],
      languages: ['English', 'Twi', 'French'],
      rating: 4.8,
      reviewCount: 35,
      isAvailable: true,
      experience: '14+ years',
      pastClients: ['Unilever Ghana', 'Kasapa Telecom', 'PZ Cussons'],
      bio: 'M&A expert facilitating cross-border transactions across West Africa. Proven track record in complex deal structuring and post-merger integration.'
    },
    {
      id: '6',
      name: 'Nia Banda',
      title: 'HR & Talent Development Consultant',
      company: 'Forvis Mazars',
      email: 'nia.banda@forvismzars.com',
      avatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      location: 'Lusaka, Zambia',
      country: 'Zambia',
      expertise: ['Talent Strategy', 'Leadership Development', 'Diversity & Inclusion', 'Change Management'],
      industries: ['Professional Services', 'Mining', 'Banking', 'Retail'],
      languages: ['English', 'Bemba', 'Nyanja'],
      rating: 4.9,
      reviewCount: 29,
      isAvailable: true,
      experience: '11+ years',
      pastClients: ['Zambia National Commercial Bank', 'First Quantum Minerals', 'Shoprite'],
      bio: 'HR transformation leader specializing in building high-performance teams across Africa. Expert in cross-cultural leadership development and inclusive workplace strategies.'
    }
  ];

  // Load experts and questions from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [expertsResponse, questionsResponse] = await Promise.all([
          expertsAPI.getExperts(),
          questionsAPI.getQuestions()
        ]);

        // Transform experts data
        const transformedExperts = expertsResponse.data.experts.map((expert: any) => ({
          id: expert.expert_id || expert.user_id,
          name: expert.name,
          title: expert.specializations?.split(',')[0] || 'Expert',
          company: 'Forvis Mazars',
          email: expert.email || `${expert.name.toLowerCase().replace(/\s+/g, '.')}@forvismzars.com`,
          avatar: expert.profile_image_url || 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
          location: expert.location,
          country: expert.location?.split(',')[1]?.trim() || expert.location,
          expertise: expert.specializations ? expert.specializations.split(',').map((s: string) => s.trim()) : [],
          industries: expert.industries ? expert.industries.split(',').map((i: string) => i.trim()) : [],
          languages: ['English'], // Default
          rating: expert.average_rating || 4.5,
          reviewCount: expert.review_count || 10,
          isAvailable: expert.is_available,
          experience: expert.experience || '5+ years',
          pastClients: expert.past_clients ? expert.past_clients.split(',').map((c: string) => c.trim()) : [],
          bio: expert.bio || 'Experienced professional ready to help.'
        }));

        // Transform questions data
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

        // Use dummy data if API returns empty
        setExperts(transformedExperts.length > 0 ? transformedExperts : dummyExperts);
        setQuestions(transformedQuestions);
      } catch (error) {
        console.error('Error loading expert directory data:', error);
        // Use dummy data on error
        setExperts(dummyExperts);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Initialize with some dummy connected experts for demonstration
  useEffect(() => {
    if (experts.length > 0 && connectedExperts.length === 0) {
      // Add first 2 experts as connected by default
      const initialConnected = experts.slice(0, 2);
      setConnectedExperts(initialConnected);
      
      // Initialize sample connection requests
      const sampleConnectionRequests: ConnectionRequest[] = [
        {
          id: 'conn_req_1',
          expertId: experts[0]?.id || '1',
          expertName: experts[0]?.name || 'Expert',
          userName: 'Michael Chen',
          userEmail: 'michael.chen@forvismazars.com',
          userAvatar: 'https://i.pravatar.cc/150?img=33',
          userOrganization: 'Forvis Mazars Nigeria',
          message: 'I would like to connect with you to discuss transfer pricing strategies for our African expansion. I have reviewed your expertise and believe you can provide valuable insights.',
          timestamp: '2 hours ago',
          status: 'pending',
          type: 'connection'
        },
        {
          id: 'conn_req_2',
          expertId: experts[1]?.id || '2',
          expertName: experts[1]?.name || 'Expert',
          userName: 'Aisha Patel',
          userEmail: 'aisha.patel@standardbank.co.za',
          userAvatar: 'https://i.pravatar.cc/150?img=47',
          userOrganization: 'Standard Bank',
          message: 'Hello! I am leading our ESG initiative and would love to connect with you to learn more about sustainable finance frameworks in Africa.',
          timestamp: '5 hours ago',
          status: 'pending',
          type: 'connection'
        }
      ];
      setConnectionRequests(sampleConnectionRequests);
      
      // Initialize conversations with sample messages
      const initialConversations: {[key: string]: any[]} = {};
      initialConnected.forEach((expert, index) => {
        initialConversations[expert.id] = index === 0 ? [
          {
            sender: 'user',
            content: 'Hi! I need some guidance on transfer pricing regulations in West Africa.',
            time: '2 hours ago',
            preview: 'Hi! I need some guidance on transfer pricing...'
          },
          {
            sender: 'expert',
            content: 'Hello! I\'d be happy to help. Transfer pricing in West Africa has specific considerations, especially with the ECOWAS framework. What specific aspect are you working on?',
            time: '1 hour ago',
            preview: 'Hello! I\'d be happy to help. Transfer pricing...'
          },
          {
            sender: 'user',
            content: 'I\'m looking at intercompany service agreements between Nigeria and Ghana operations.',
            time: '45 minutes ago',
            preview: 'I\'m looking at intercompany service agreements...'
          }
        ] : [
          {
            sender: 'user',
            content: 'I\'d like to discuss ESG reporting frameworks for our mining operations.',
            time: '3 hours ago',
            preview: 'I\'d like to discuss ESG reporting frameworks...'
          },
          {
            sender: 'expert',
            content: 'Excellent topic! For mining operations in Southern Africa, you\'ll want to align with both GRI Standards and SASB frameworks. Are you also looking at TCFD climate disclosures?',
            time: '2 hours ago',
            preview: 'Excellent topic! For mining operations...'
          }
        ];
      });
      setExpertConversations(initialConversations);
    }
  }, [experts]);

  // Sample access requests for private webinars
  const sampleAccessRequests: AccessRequest[] = [
    {
      id: 'req1',
      name: 'David Okonkwo',
      email: 'david.okonkwo@firstbank.ng',
      organization: 'First Bank Nigeria',
      message: 'I would like to attend this webinar to learn more about cross-border M&A strategies for our expansion plans.',
      timestamp: '2 hours ago',
      status: 'pending'
    },
    {
      id: 'req2',
      name: 'Lisa Wong',
      email: 'lisa.wong@standardbank.co.za',
      organization: 'Standard Bank',
      message: 'Our ESG team is very interested in this topic. Would appreciate access to this webinar.',
      timestamp: '5 hours ago',
      status: 'pending'
    },
    {
      id: 'req3',
      name: 'Ahmed Hassan',
      email: 'ahmed.hassan@orascom.com',
      organization: 'Orascom',
      message: 'I am leading our digital transformation initiative and this webinar aligns perfectly with our goals.',
      timestamp: '1 day ago',
      status: 'pending'
    },
    {
      id: 'req4',
      name: 'Grace Mutai',
      email: 'grace.mutai@safaricom.co.ke',
      organization: 'Safaricom',
      message: 'Interested in the fintech innovation strategies discussed in this session.',
      timestamp: '2 days ago',
      status: 'approved'
    },
    {
      id: 'req5',
      name: 'Robert Kamau',
      email: 'robert.kamau@equitybank.co.ke',
      organization: 'Equity Bank',
      message: 'Looking to understand climate finance opportunities for our institution.',
      timestamp: '3 days ago',
      status: 'approved'
    },
    {
      id: 'req6',
      name: 'Thomas Mbeki',
      email: 'thomas.mbeki@external.com',
      organization: 'External Consultant',
      message: 'Just curious to learn more.',
      timestamp: '4 days ago',
      status: 'rejected'
    }
  ];

  const webinars: Webinar[] = [
    {
      id: '1',
      title: 'West African Tax Harmonization: Opportunities and Challenges',
      expert: 'Amara Okafor',
      expertAvatar: 'https://images.pexels.com/photos/3778966/pexels-photo-3778966.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
      date: '2024-02-15',
      time: '14:00 WAT',
      topic: 'Regional Tax Policy',
      region: 'West Africa',
      attendees: 23,
      maxAttendees: 50,
      teamsLink: 'https://teams.microsoft.com/l/meetup-join/19%3ameeting_tax_harmonization_west_africa',
      description: 'Join us for an in-depth discussion on the evolving tax landscape across West Africa. We\'ll cover ECOWAS harmonization efforts, transfer pricing regulations, and practical strategies for multinational compliance. Perfect for tax professionals, CFOs, and business leaders operating in the region.',
      registeredUsers: []
    },
    {
      id: '2',
      title: 'ESG in Southern African Mining: Best Practices',
      expert: 'Thabo Mthembu',
      expertAvatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
      date: '2024-02-20',
      time: '15:00 SAST',
      topic: 'ESG & Sustainability',
      region: 'Southern Africa',
      attendees: 31,
      maxAttendees: 75,
      teamsLink: 'https://teams.microsoft.com/l/meetup-join/19%3ameeting_esg_mining_southern_africa',
      description: 'Explore cutting-edge ESG frameworks and sustainability practices in the mining sector. Learn from real-world case studies, regulatory updates, and stakeholder engagement strategies. Ideal for mining executives, ESG officers, and sustainability consultants.',
      registeredUsers: []
    },
    {
      id: '3',
      title: 'Digital Banking Transformation in East Africa',
      expert: 'Kemi Adebayo',
      expertAvatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
      date: '2024-02-25',
      time: '16:00 EAT',
      topic: 'Fintech Innovation',
      region: 'East Africa',
      attendees: 18,
      maxAttendees: 40,
      teamsLink: 'https://teams.microsoft.com/l/meetup-join/19%3ameeting_digital_banking_east_africa',
      description: 'Discover the latest trends in digital banking and fintech innovation across East Africa. Topics include mobile money integration, regulatory compliance, cybersecurity, and customer experience optimization. Essential for bank executives, fintech founders, and digital transformation leaders.',
      registeredUsers: []
    },
    {
      id: '4',
      title: 'Cross-Border M&A: Legal & Tax Considerations',
      expert: 'Kwame Asante',
      expertAvatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
      date: '2024-03-05',
      time: '13:00 GMT',
      topic: 'Mergers & Acquisitions',
      region: 'Pan-African',
      attendees: 15,
      maxAttendees: 60,
      teamsLink: 'https://teams.microsoft.com/l/meetup-join/19%3ameeting_mna_cross_border_africa',
      description: 'Navigate the complexities of cross-border M&A transactions across Africa. Expert insights on deal structuring, due diligence, valuation methodologies, and post-merger integration. Designed for M&A advisors, corporate development teams, and private equity professionals.',
      registeredUsers: []
    },
    {
      id: '5',
      title: 'Climate Risk & Sustainable Finance in Africa',
      expert: 'Sarah Mwangi',
      expertAvatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
      date: '2024-03-10',
      time: '14:30 EAT',
      topic: 'Climate Finance',
      region: 'East Africa',
      attendees: 28,
      maxAttendees: 80,
      teamsLink: 'https://teams.microsoft.com/l/meetup-join/19%3ameeting_climate_risk_sustainable_finance',
      description: 'Learn how to integrate climate risk assessment into financial decision-making and access sustainable finance opportunities. Topics include green bonds, carbon credits, climate disclosure requirements, and impact measurement. Perfect for financial institutions, project developers, and sustainability professionals.',
      registeredUsers: []
    }
  ];

  const filteredExperts = experts.filter(expert => {
    const matchesSearch = expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expert.expertise.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      expert.industries.some(industry => industry.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesExpertise = !selectedFilters.expertise || expert.expertise.includes(selectedFilters.expertise);
    const matchesIndustry = !selectedFilters.industry || expert.industries.includes(selectedFilters.industry);
    const matchesLocation = !selectedFilters.location || expert.country.includes(selectedFilters.location);
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

  const handleSubmitRegistration = () => {
    if (registrationData.name && registrationData.email && selectedWebinar) {
      // Check if webinar is full
      const currentAttendees = webinarAttendees[selectedWebinar.id] || selectedWebinar.attendees;
      if (currentAttendees >= selectedWebinar.maxAttendees) {
        alert(`Sorry, this webinar is full! \n\nMax Attendees: ${selectedWebinar.maxAttendees}\nCurrent Attendees: ${currentAttendees}\n\nPlease check other available webinars or contact the organizer to be added to the waitlist.`);
        return;
      }
      
      // Add webinar to registered list
      const updatedRegisteredIds = [...registeredWebinars, selectedWebinar.id];
      setRegisteredWebinars(updatedRegisteredIds);
      // Persist to localStorage so portal can access registered sessions
      localStorage.setItem('registeredWebinarIds', JSON.stringify(updatedRegisteredIds));
      const existingData: Webinar[] = JSON.parse(localStorage.getItem('registeredWebinarData') || '[]');
      const updatedData = [...existingData.filter(w => w.id !== selectedWebinar.id), selectedWebinar];
      localStorage.setItem('registeredWebinarData', JSON.stringify(updatedData));
      
      // Update attendee count
      setWebinarAttendees({
        ...webinarAttendees,
        [selectedWebinar.id]: currentAttendees + 1
      });
      
      // Show success message
      const spotsLeft = selectedWebinar.maxAttendees - (currentAttendees + 1);
      alert(`Success! You've been registered for "${selectedWebinar.title}". \n\nA confirmation email with the Teams link has been sent to ${registrationData.email}.\n\nYou can join the webinar using Microsoft Teams on ${selectedWebinar.date} at ${selectedWebinar.time}.\n\nSpots remaining: ${spotsLeft}/${selectedWebinar.maxAttendees}`);
      
      // Reset form
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

  const handleScheduleWebinar = () => {
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
        console.warn('⚠️ No invited emails found!');
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
        createdBy: JSON.parse(localStorage.getItem('currentUser') || '{}').name || 'Unknown'
      };
      
      // Save to localStorage
      const updatedMeetings = [...scheduledMeetings, meetingRecord];
      setScheduledMeetings(updatedMeetings);
      localStorage.setItem('scheduledMeetings', JSON.stringify(updatedMeetings));
      
      // Log for debugging - IMPORTANT: Check console for actual URL
      console.log('=== TEAMS MEETING DEBUG ===');
      console.log('Teams Link:', teamsLink);
      console.log('Number of attendees:', newWebinar.invitedEmails.length);
      console.log('Attendees array:', newWebinar.invitedEmails);
      console.log('Attendees joined with comma:', newWebinar.invitedEmails.join(','));
      console.log('Full params:', teamsParams.toString());
      console.log('Meeting Record:', meetingRecord);
      console.log('');
      console.log('📋 COPY THIS URL TO TEST:');
      console.log(teamsLink);
      console.log('========================');
      
      // Open Teams in new tab to create the meeting
      window.open(teamsLink, '_blank');
      
      const lobbyText = newWebinar.lobbyBypass === 'invited' ? 'Invited People Only' :
                        newWebinar.lobbyBypass === 'organization' ? 'My Organization' :
                        newWebinar.lobbyBypass === 'organizationAndFederated' ? 'My Organization and Trusted Partners' :
                        'Everyone (No Lobby)';
      
      alert(`Teams Meeting Created! 📅\n\n"${newWebinar.title}"\n\nDate: ${newWebinar.date} at ${newWebinar.time}\nExpert: ${newWebinar.expert}\nAttendees: ${newWebinar.invitedEmails.length} people\n\n✓ Teams opening with details\n${newWebinar.invitedEmails.length > 0 ? '✓ Attendees: ' + newWebinar.invitedEmails.join(', ') : '⚠️ No attendees added'}\n\n🔍 Check browser console to see the full URL!`);
      
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

  const handleSendMessage = (expert: Expert) => {
    setSelectedExpert(expert);
    setShowMessageModal(true);
  };

  const handleSendConnect = () => {
    // Create connection request instead of direct connection
    if (selectedExpert) {
      const newRequest: ConnectionRequest = {
        id: `conn_${Date.now()}`,
        expertId: selectedExpert.id,
        expertName: selectedExpert.name,
        userName: 'Current User', // Replace with actual user name
        userEmail: 'user@example.com', // Replace with actual user email
        userAvatar: 'https://i.pravatar.cc/150?img=20',
        userOrganization: 'Forvis Mazars', // Replace with actual organization
        message: connectMessage,
        timestamp: 'Just now',
        status: 'pending',
        type: 'connection'
      };
      setConnectionRequests([newRequest, ...connectionRequests]);
      alert('Connection request sent! The expert will review your request.');
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
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="max-w-[1920px] mx-auto px-12 sm:px-16 lg:px-20 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-3 text-white">Expert Directory & Knowledge Exchange</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Connect with regional experts and share knowledge across our global network
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-12 sm:px-16 lg:px-20 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Tabs Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div></div>
              {/* Become an Expert button */}
              {!isExpert && (
                <button
                  onClick={() => setShowBecomeExpertModal(true)}
                  className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ml-auto"
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
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Expert Directory
            </button>
            <button
              onClick={() => setActiveTab('myExperts')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                activeTab === 'myExperts'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>My Experts</span>
                {connectedExperts.length > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {connectedExperts.length}
                  </span>
                )}
              </span>
            </button>
            {/* <button
              onClick={() => setActiveTab('forum')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'forum'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Ask the Expert
            </button> */}
            
            {/* Expert-only tabs */}
            {isExpert && (
              <>
            <button
              onClick={() => setActiveTab('webinars')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'webinars'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Live Webinars
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                activeTab === 'requests'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <span>Requests</span>
                {(sampleAccessRequests.filter(r => r.status === 'pending').length + 
                  connectionRequests.filter(r => r.status === 'pending').length) > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {sampleAccessRequests.filter(r => r.status === 'pending').length + 
                     connectionRequests.filter(r => r.status === 'pending').length}
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Filters */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expertise Area</label>
                    <select
                      value={selectedFilters.expertise}
                      onChange={(e) => setSelectedFilters({...selectedFilters, expertise: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Expertise</option>
                      <option value="Tax Advisory">Tax Advisory</option>
                      <option value="Risk Management">Risk Management</option>
                      <option value="Fintech Strategy">Fintech Strategy</option>
                      <option value="Project Finance">Project Finance</option>
                      <option value="ESG Advisory">ESG Advisory</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                    <select
                      value={selectedFilters.industry}
                      onChange={(e) => setSelectedFilters({...selectedFilters, industry: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Industries</option>
                      <option value="Financial Services">Financial Services</option>
                      <option value="Energy">Energy</option>
                      <option value="Technology">Technology</option>
                      <option value="Mining">Mining</option>
                      <option value="Banking">Banking</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                    <select
                      value={selectedFilters.location}
                      onChange={(e) => setSelectedFilters({...selectedFilters, location: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Regions</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="South Africa">South Africa</option>
                      <option value="Kenya">Kenya</option>
                      <option value="Egypt">Egypt</option>
                      <option value="Ghana">Ghana</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                    <select
                      value={selectedFilters.availability}
                      onChange={(e) => setSelectedFilters({...selectedFilters, availability: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Experts</option>
                      <option value="available">Available for Collaboration</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Quick Stats</h4>
                  <div className="space-y-2 text-sm text-blue-700">
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
                      <span className="font-medium">4</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expert Cards */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid gap-6">
                {filteredExperts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((expert) => (
                  <div key={expert.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <img
                        src={expert.avatar}
                        alt={expert.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{expert.name}</h3>
                            <p className="text-blue-600 font-medium">{expert.title}</p>
                            <p className="text-gray-600 text-sm">{expert.company}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {expert.isAvailable ? (
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Available</span>
                            ) : (
                              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">Busy</span>
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
                            <span key={skill} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>

                        {/* Industries */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {expert.industries.map((industry) => (
                            <span key={industry} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
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
                          <button 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                            onClick={() => handleConnect(expert.id)}
                          >
                            <UserPlus className="w-4 h-4" />
                            <span>Request Connection</span>
                          </button>
                          <button 
                            className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.ceil(filteredExperts.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredExperts.length / itemsPerPage)))}
                    disabled={currentPage === Math.ceil(filteredExperts.length / itemsPerPage)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

            {connectedExperts.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Connected Experts Yet</h3>
                <p className="text-gray-600 mb-6">Start connecting with experts to get personalized guidance and support</p>
                <button
                  onClick={() => setActiveTab('directory')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Browse Expert Directory
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {connectedExperts.map((expert) => (
                  <div
                    key={expert.id}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all"
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
                          className="w-24 h-32 rounded-lg object-cover object-top border-4 border-white shadow-lg"
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
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {expert.expertise.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                              +{expert.expertise.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Microsoft Teams Chat Button */}
                      <button
                        onClick={() => openTeamsChat(expert)}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
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
        

        {/* Access Requests Tab */}
        {activeTab === 'requests' && (
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Requests Management</h2>
              <p className="text-gray-600">Review and manage connection requests and meeting access requests</p>
            </div>

            {/* Sub-tabs for Connections and Meetings */}
            <div className="flex space-x-2 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
              <button
                onClick={() => setRequestSubTab('connections')}
                className={`px-6 py-2.5 rounded-md font-medium text-sm transition-colors ${
                  requestSubTab === 'connections'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <UserPlus className="w-4 h-4" />
                  <span>Connection Requests ({connectionRequests.filter(r => r.status === 'pending').length})</span>
                </div>
              </button>
              <button
                onClick={() => setRequestSubTab('meetings')}
                className={`px-6 py-2.5 rounded-md font-medium text-sm transition-colors ${
                  requestSubTab === 'meetings'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Meeting Access ({sampleAccessRequests.filter(r => r.status === 'pending').length})</span>
                </div>
              </button>
            </div>

            {/* Connection Requests Content */}
            {requestSubTab === 'connections' && (
              <div>
                {/* Connection Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                      <AlertCircle className="w-8 h-8 text-yellow-600" />
                      <span className="text-3xl font-bold text-yellow-900">
                        {connectionRequests.filter(r => r.status === 'pending').length}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-yellow-900">Pending</div>
                    <div className="text-xs text-yellow-700 mt-1">Awaiting your response</div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <span className="text-3xl font-bold text-green-900">
                        {connectionRequests.filter(r => r.status === 'approved').length}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-green-900">Approved</div>
                    <div className="text-xs text-green-700 mt-1">Total approved connections</div>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-6">
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
                        <div key={request.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              <img
                                src={request.userAvatar}
                                alt={request.userName}
                                className="w-12 h-14 rounded-lg object-cover object-top ring-2 ring-gray-200"
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
                                      <span>•</span>
                                      <span>{request.userOrganization}</span>
                                    </div>
                                  </div>
                                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                    {request.timestamp}
                                  </span>
                                </div>
                                
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                                  <div className="text-sm font-semibold text-gray-700 mb-1">Connection Request Message:</div>
                                  <p className="text-gray-700 italic text-sm">"{request.message}"</p>
                                </div>

                                <div className="flex space-x-3">
                                  <button
                                    onClick={() => handleConnectionRequest(request.id, 'approve')}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                                  >
                                    <CheckCircle className="w-5 h-5" />
                                    <span>Approve Connection</span>
                                  </button>
                                  <button
                                    onClick={() => handleConnectionRequest(request.id, 'reject')}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
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
                  <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Pending Connection Requests</h3>
                    <p className="text-gray-600">When users request to connect with you, they will appear here</p>
                  </div>
                )}
              </div>
            )}

            {/* Meeting Access Requests Content */}
            {requestSubTab === 'meetings' && (
              <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <AlertCircle className="w-8 h-8 text-yellow-600" />
                  <span className="text-3xl font-bold text-yellow-900">
                    {sampleAccessRequests.filter(r => r.status === 'pending').length}
                  </span>
                </div>
                <div className="text-sm font-semibold text-yellow-900">Pending Requests</div>
                <div className="text-xs text-yellow-700 mt-1">Awaiting your review</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <span className="text-3xl font-bold text-green-900">
                    {sampleAccessRequests.filter(r => r.status === 'approved').length}
                  </span>
                </div>
                <div className="text-sm font-semibold text-green-900">Approved</div>
                <div className="text-xs text-green-700 mt-1">Total approved access</div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-6">
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
            <div className="flex space-x-2 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
              <button className="px-4 py-2 bg-white text-gray-900 rounded-md shadow-sm font-medium text-sm">
                All Requests ({sampleAccessRequests.length})
              </button>
              <button className="px-4 py-2 text-gray-600 hover:text-gray-900 rounded-md font-medium text-sm">
                Pending ({sampleAccessRequests.filter(r => r.status === 'pending').length})
              </button>
              <button className="px-4 py-2 text-gray-600 hover:text-gray-900 rounded-md font-medium text-sm">
                Approved ({sampleAccessRequests.filter(r => r.status === 'approved').length})
              </button>
              <button className="px-4 py-2 text-gray-600 hover:text-gray-900 rounded-md font-medium text-sm">
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
                    <div key={request.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
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
                                  <span>•</span>
                                  <span>{request.organization}</span>
                                </div>
                              </div>
                              <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {request.timestamp}
                              </span>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                              <div className="text-sm font-semibold text-gray-700 mb-1">Request Message:</div>
                              <p className="text-gray-700 italic text-sm">"{request.message}"</p>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                              <div className="text-xs font-semibold text-blue-900 mb-1">Webinar Details:</div>
                              <div className="text-sm text-blue-800">
                                "Cross-Border M&A Strategies" - Dec 18, 2025 @ 3:00 PM CAT
                              </div>
                            </div>

                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleAccessRequest(request.id, 'approve', '4')}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                              >
                                <CheckCircle className="w-5 h-5" />
                                <span>Approve Request</span>
                              </button>
                              <button
                                onClick={() => handleAccessRequest(request.id, 'reject')}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
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
                    <div key={request.id} className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                          {request.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{request.name}</div>
                          <div className="text-sm text-gray-600">{request.email} • {request.organization}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-xs text-gray-500">{request.timestamp}</span>
                        <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
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
                    <div key={request.id} className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                          {request.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{request.name}</div>
                          <div className="text-sm text-gray-600">{request.email} • {request.organization}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-xs text-gray-500">{request.timestamp}</span>
                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
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
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <Video className="w-4 h-4" />
                  <span>My Meetings ({scheduledMeetings.length})</span>
                </button>
                <button 
                  onClick={() => setShowScheduleModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule Webinar</span>
                </button>
              </div>
            </div>

            {/* Scheduled Meetings List */}
            {showMeetingsList && scheduledMeetings.length > 0 && (
              <div className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6">
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
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-1">{meeting.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">{meeting.description}</p>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="flex items-center space-x-2 text-gray-700">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              <span>{meeting.date} at {meeting.time}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-700">
                              <Users className="w-4 h-4 text-green-600" />
                              <span>{meeting.attendees.length} attendees</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-700">
                              <Award className="w-4 h-4 text-blue-600" />
                              <span>Expert: {meeting.expert}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-700">
                              <Globe className="w-4 h-4 text-orange-600" />
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
                                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
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
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-2 whitespace-nowrap"
                          >
                            <Video className="w-4 h-4" />
                            <span>Join Meeting</span>
                          </button>
                          <button
                            onClick={() => window.open(meeting.teamsLink, '_blank')}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-2 whitespace-nowrap"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20.625 8.25h-5.25a.375.375 0 0 0-.375.375v7.5c0 .207.168.375.375.375h5.25c.207 0 .375-.168.375-.375v-7.5a.375.375 0 0 0-.375-.375zM19.5 15h-3v-5.25h3V15zM9.75 8.25c-1.654 0-3 1.346-3 3v4.5H3v-4.5c0-3.722 3.028-6.75 6.75-6.75V8.25zM13.5 11.25v4.5h-3.75v-4.5c0-1.654 1.346-3 3-3v3.75c0 .207-.168.375-.375.375h-.375z"/>
                            </svg>
                            <span>Edit in Teams</span>
                          </button> */}
                          <button
                            onClick={() => {
                              if (confirm(`Delete meeting "${meeting.title}"?`)) {
                                const updated = scheduledMeetings.filter(m => m.id !== meeting.id);
                                setScheduledMeetings(updated);
                                localStorage.setItem('scheduledMeetings', JSON.stringify(updated));
                              }
                            }}
                            className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
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
                  <div key={webinar.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">{webinar.title}</h3>
                          {isRegistered && (
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                              ✓ Registered
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{webinar.description}</p>
                        
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center space-x-2">
                            <img
                              src={webinar.expertAvatar}
                              alt={webinar.expert}
                              className="w-8 h-10 rounded-md object-cover object-top"
                              style={{ aspectRatio: '4/5' }}
                            />
                            <span className="text-sm font-medium text-gray-700">{webinar.expert}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">{webinar.date}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span>{webinar.time}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <span>{webinar.region}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span className={isFull ? 'text-red-600 font-medium' : ''}>
                              {webinarAttendees[webinar.id] || webinar.attendees}/{webinar.maxAttendees} registered
                            </span>
                            {isFull && (
                              <span className="ml-2 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold">FULL</span>
                            )}
                          </div>
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                            {webinar.topic}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-6">
                        {isRegistered ? (
                          <>
                            <button 
                              onClick={() => handleJoinWebinar(webinar.teamsLink)}
                              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center space-x-2"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M9.5 1.5v3h3v-3h-3zm-4 0v3h3v-3h-3zm-4 3v3h3v-3h-3zm4 0v3h3v-3h-3zm4 0v3h3v-3h-3zm4 0v3h3v-3h-3zm-8 3v3h3v-3h-3zm4 0v3h3v-3h-3zm4 0v3h3v-3h-3zm-4 3v3h3v-3h-3z"/>
                              </svg>
                              <span>Join on Teams</span>
                            </button>
                            <button 
                              onClick={() => handleViewWebinar(webinar)}
                              className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
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
                                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                              } px-5 py-2.5 rounded-lg text-sm font-semibold transition-all`}
                            >
                              {isFull ? 'Full' : 'Register Now'}
                            </button>
                            <button 
                              onClick={() => handleViewWebinar(webinar)}
                              className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
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
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
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
                    className={`p-4 border-2 rounded-xl text-left transition-all ${
                      !newQuestion.expertId
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
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
                      className={`p-4 border-2 rounded-xl text-left transition-all ${
                        newQuestion.expertId === expert.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={expert.avatar}
                          alt={expert.name}
                          className="w-10 h-12 rounded-md object-cover object-top"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., tax, Nigeria, cross-border (comma separated)"
                />
              </div>

              {/* Privacy Option */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newQuestion.isPrivate}
                    onChange={(e) => setNewQuestion({...newQuestion, isPrivate: e.target.checked})}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
                <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
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
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAskQuestion}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
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
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-6">
                  <img
                    src={selectedExpert.avatar}
                    alt={selectedExpert.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedExpert.name}</h2>
                    <p className="text-xl text-blue-600 font-medium">{selectedExpert.title}</p>
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
                  ×
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
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
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
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
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
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
                  {selectedExpert.pastClients.join(' • ')}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowExpertModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    setShowExpertModal(false);
                    handleConnect(selectedExpert.id);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg text-sm font-medium transition-colors"
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
          <div className="bg-white rounded-xl max-w-md w-full">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendConnect}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
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
          <div className="bg-white rounded-xl max-w-md w-full">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendDirectMessage}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
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
          <div className="bg-white rounded-xl max-w-md w-full">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your company name"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">What happens next?</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
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
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRegistration}
                  disabled={!registrationData.name || !registrationData.email}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    registrationData.name && registrationData.email
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
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
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedWebinar.title}
                  </h3>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
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
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm text-gray-600">Expert Speaker</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedWebinar.expert}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-gray-600 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">Date</span>
                  </div>
                  <p className="text-gray-900 font-semibold">{selectedWebinar.date}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-gray-600 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Time</span>
                  </div>
                  <p className="text-gray-900 font-semibold">{selectedWebinar.time}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-gray-600 mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">Region</span>
                  </div>
                  <p className="text-gray-900 font-semibold">{selectedWebinar.region}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
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
                    <span className="text-blue-600 mr-2">✓</span>
                    <span>Latest regulatory developments and compliance requirements</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <span>Practical strategies and real-world case studies</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <span>Q&A session with industry expert</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <span>Networking opportunities with peers across Africa</span>
                  </li>
                </ul>
              </div>

              {selectedWebinar.teamsLink && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M9.5 1.5v3h3v-3h-3zm-4 0v3h3v-3h-3zm-4 3v3h3v-3h-3zm4 0v3h3v-3h-3zm4 0v3h3v-3h-3zm4 0v3h3v-3h-3zm-8 3v3h3v-3h-3zm4 0v3h3v-3h-3zm4 0v3h3v-3h-3zm-4 3v3h3v-3h-3z"/>
                    </svg>
                    <div className="flex-1">
                      <p className="font-semibold text-blue-900 mb-1">Join via Microsoft Teams</p>
                      <p className="text-sm text-blue-800 mb-3">
                        This webinar will be hosted on Microsoft Teams. Make sure you have the Teams app installed or use the web version.
                      </p>
                      {isWebinarRegistered(selectedWebinar.id) && (
                        <button
                          onClick={() => handleJoinWebinar(selectedWebinar.teamsLink)}
                          className="text-sm text-blue-700 hover:text-blue-900 font-medium underline"
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
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Close
                </button>
                {isWebinarRegistered(selectedWebinar.id) ? (
                  <button
                    onClick={() => handleJoinWebinar(selectedWebinar.teamsLink)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
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
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                      selectedWebinar.attendees >= selectedWebinar.maxAttendees
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
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
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className={`p-4 border-2 rounded-lg transition-all ${
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
                      className={`p-4 border-2 rounded-lg transition-all ${
                        newWebinar.isPrivate
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-2">
                        <Lock className={`w-6 h-6 ${
                          newWebinar.isPrivate ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="font-semibold text-gray-900 mb-1">Private Webinar</div>
                      <div className="text-xs text-gray-600">Invite-only or request access</div>
                    </button>
                  </div>
                </div>

                {/* Email Invitations (for all webinars) */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                  <div className="flex items-center space-x-2 mb-4">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <label className="text-sm font-semibold text-blue-900">
                      Invite Participants via Email (Optional)
                    </label>
                  </div>
                  <p className="text-xs text-blue-700 mb-3">
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
                            className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="Type name or email to search..."
                          />
                          
                          {/* Predictive Suggestions Dropdown */}
                          {showSuggestions && emailSuggestions.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {emailSuggestions.map((user) => (
                                <button
                                  key={user.id}
                                  type="button"
                                  onClick={() => addInvitedEmail(user.email)}
                                  className="w-full px-4 py-3 hover:bg-blue-50 flex items-center space-x-3 text-left border-b border-gray-100 last:border-b-0"
                                >
                                  <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-gray-900 text-sm truncate">
                                      {user.name}
                                    </div>
                                    <div className="text-xs text-blue-600 truncate">
                                      {user.email}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">
                                      {user.role} • {user.organization}
                                    </div>
                                  </div>
                                  <UserPlus className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            console.log('📧 Add button clicked. emailInput:', emailInput);
                            if (emailInput && emailInput.trim().length > 0) {
                              if (emailInput.includes('@')) {
                                addInvitedEmail(emailInput);
                              } else {
                                console.warn('⚠️ Email does not contain @ symbol');
                                alert('Please enter a valid email address');
                              }
                            } else {
                              console.warn('⚠️ Email input is empty');
                              alert('Please enter an email address');
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Invited Emails List */}
                    {newWebinar.invitedEmails.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-blue-900 mb-2">
                          Invited ({newWebinar.invitedEmails.length})
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {newWebinar.invitedEmails.map((email, index) => (
                            <div
                              key={index}
                              className="bg-white border border-blue-300 rounded-full px-3 py-1 flex items-center space-x-2 text-sm"
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
                    <div className="mt-5 pt-5 border-t border-blue-200">
                      <label className="block text-sm font-semibold text-blue-900 mb-3">
                        Microsoft Teams Lobby Settings
                      </label>
                      <p className="text-xs text-blue-700 mb-3">
                        Choose who can bypass the meeting lobby and join directly
                      </p>
                      <select
                        value={newWebinar.lobbyBypass}
                        onChange={(e) => setNewWebinar({
                          ...newWebinar, 
                          lobbyBypass: e.target.value as 'everyone' | 'organization' | 'organizationAndFederated' | 'invited'
                        })}
                        className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                      >
                        <option value="invited">Invited People Only</option>
                        <option value="organization">My Organization</option>
                        <option value="organizationAndFederated">My Organization and Trusted Partners</option>
                        <option value="everyone">Everyone (No Lobby)</option>
                      </select>
                      <p className="text-xs text-blue-600 mt-2">
                        {newWebinar.lobbyBypass === 'invited' && '🔒 Most secure - Only invited participants bypass lobby'}
                        {newWebinar.lobbyBypass === 'organization' && '🏢 Organization members bypass lobby'}
                        {newWebinar.lobbyBypass === 'organizationAndFederated' && '🤝 Your org and trusted partners bypass lobby'}
                        {newWebinar.lobbyBypass === 'everyone' && '🌐 No lobby - Anyone with link joins directly'}
                      </p>
                    </div>

                    {/* Access Requests Panel Toggle */}
                    {accessRequests.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowRequestsPanel(!showRequestsPanel)}
                        className="mt-4 w-full px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-900 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between"
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
                            className={`p-3 rounded-lg border ${
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
                                  {request.email} • {request.organization}
                                </div>
                              </div>
                              {request.status === 'pending' && (
                                <div className="flex space-x-1">
                                  <button
                                    type="button"
                                    onClick={() => handleAccessRequest(request.id, 'approve')}
                                    className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAccessRequest(request.id, 'reject')}
                                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold"
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
                                {request.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M9.5 1.5v3h3v-3h-3zm-4 0v3h3v-3h-3zm-4 3v3h3v-3h-3zm4 0v3h3v-3h-3zm4 0v3h3v-3h-3zm4 0v3h3v-3h-3zm-8 3v3h3v-3h-3zm4 0v3h3v-3h-3zm4 0v3h3v-3h-3zm-4 3v3h3v-3h-3z"/>
                    </svg>
                    <div className="flex-1">
                      <p className="font-semibold text-blue-900 mb-1">Microsoft Teams Integration</p>
                      <p className="text-sm text-blue-800">
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
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleWebinar}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-semibold mb-1">What happens next?</p>
                      <ul className="space-y-1 text-blue-800">
                        <li>• Our team will review your application within 2-3 business days</li>
                        <li>• We may contact you for additional information or an interview</li>
                        <li>• Once approved, you'll get access to expert features and be listed in the directory</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-4 mt-8">
                <button
                  onClick={() => setShowBecomeExpertModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitExpertApplication}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
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