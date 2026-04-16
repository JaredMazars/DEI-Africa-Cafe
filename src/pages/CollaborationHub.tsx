import React, { useState } from 'react';
import { useEffect } from 'react';
import { Plus, Search, MapPin, Users, Calendar, TrendingUp, FileText, Target, Send, DollarSign, Clock, Filter, BarChart3, Globe } from 'lucide-react';
import { opportunitiesAPI } from '../services/api';
import { useNotifications } from '../contexts/NotificationContext';

// Industry to Client Sector mapping
const industrySectorMap: Record<string, string[]> = {
  'Financial Services': ['Banking', 'Insurance', 'Investment Management', 'Private Equity', 'Asset Management', 'Wealth Management'],
  'Energy & Resources': ['Oil & Gas', 'Mining & Metals', 'Renewable Energy', 'Utilities'],
  'Technology': ['Technology & Software', 'Telecommunications', 'IT Services', 'Cybersecurity'],
  'Healthcare & Life Sciences': ['Healthcare', 'Pharmaceuticals', 'Biotechnology', 'Medical Devices'],
  'Consumer & Retail': ['Retail', 'Food & Beverage', 'Consumer Goods', 'E-commerce'],
  'Infrastructure & Real Estate': ['Real Estate', 'Construction', 'Transportation & Logistics', 'Infrastructure Development'],
  'Manufacturing & Industrial': ['Manufacturing', 'Automotive', 'Aerospace & Defense', 'Industrial Equipment'],
  'Public Sector': ['Government & Public Sector', 'Education', 'NGO & Non-Profit', 'Healthcare Services'],
  'Media & Entertainment': ['Media & Entertainment', 'Hospitality & Tourism', 'Sports & Recreation', 'Arts & Culture'],
  'Agriculture & Natural Resources': ['Agriculture', 'Forestry', 'Fisheries', 'Water Resources'],
  'Professional Services': ['Professional Services', 'Legal Services', 'Consulting', 'Accounting & Audit'],
  'Other': ['Other']
};

interface Opportunity {
  id: string;
  title: string;
  description: string;
  industry: string;
  clientSector: string;
  regionsNeeded: string[];
  contactPerson: string;
  contactAvatar: string;
  deadline: string;
  budget: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in-progress' | 'closed';
  applicants: number;
  createdAt: string;
}

interface GroupDocument {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'xlsx' | 'pptx';
  uploadedBy: string;
  uploadedAt: string;
  size: string;
  url: string;
}

interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  email: string;
  role: string;
  organization: string;
  serviceLine: string;
  country: string;
  expertise: string[];
  yearsOfExperience: number;
  bio: string;
}

interface CollaborationGroup {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  members: Array<{
    id: string;
    name: string;
    avatar: string;
    role: string;
  }>;
  opportunities: string[];
  status: 'active' | 'completed';
  lastActivity: string;
  documents: GroupDocument[];
}

interface DealPipeline {
  id: string;
  clientName: string;
  value: string;
  stage: 'prospecting' | 'proposal' | 'negotiation' | 'closed';
  regions: string[];
  probability: number;
  expectedClose: string;
  teamLead: string;
}

interface CaseStudy {
  id: string;
  title: string;
  industry: string;
  region: string;
  author: string;
  authorAvatar: string;
  summary: string;
  downloadCount: number;
  publishedAt: string;
  tags: string[];
}

interface InterestRequest {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  applicantName: string;
  applicantEmail: string;
  applicantAvatar: string;
  applicantOrganization: string;
  applicantRole: string;
  message: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface GroupMessage {
  id: string;
  sender: string;
  senderAvatar: string;
  message: string;
  timestamp: string;
  type: 'message' | 'file' | 'knowledge';
}

const CollaborationHub: React.FC = () => {
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<'opportunities' | 'groups' | 'requests' | 'knowledge'>('opportunities');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    industry: '',
    region: '',
    status: 'all'
  });
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [interestMessage, setInterestMessage] = useState('');
  const [newOpportunity, setNewOpportunity] = useState({
    title: '',
    description: '',
    industry: '',
    clientSector: '',
    regionsNeeded: '',
    budget: '',
    deadline: ''
  });
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [interestRequests, setInterestRequests] = useState<InterestRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<InterestRequest | null>(null);
  const [showRequestDetailModal, setShowRequestDetailModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<CollaborationGroup | null>(null);
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showKnowledgePanel, setShowKnowledgePanel] = useState(false);
  const [showGroupManageModal, setShowGroupManageModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [currentUserId] = useState('1'); // This should come from auth context
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);

  // Sample user profiles database
  const userProfiles: Record<string, UserProfile> = {
    '1': {
      id: '1',
      name: 'Amara Okafor',
      avatar: 'https://images.pexels.com/photos/3778966/pexels-photo-3778966.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
      email: 'amara.okafor@forvismazars.com',
      role: 'Senior Partner',
      organization: 'Forvis Mazars Nigeria',
      serviceLine: 'Financial Services Advisory',
      country: 'Nigeria',
      expertise: ['Banking Regulations', 'Financial Services', 'M&A', 'Market Entry Strategy'],
      yearsOfExperience: 15,
      bio: 'Specializing in financial services expansion across West Africa with deep expertise in regulatory compliance and cross-border banking operations.'
    },
    '2': {
      id: '2',
      name: 'Kwame Asante',
      avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
      email: 'kwame.asante@forvismazars.com',
      role: 'Tax Partner',
      organization: 'Forvis Mazars Ghana',
      serviceLine: 'Tax Advisory',
      country: 'Ghana',
      expertise: ['International Tax', 'Transfer Pricing', 'Tax Compliance', 'M&A Tax'],
      yearsOfExperience: 12,
      bio: 'Expert in international tax planning and transfer pricing with extensive experience in cross-border transactions across West Africa.'
    },
    '3': {
      id: '3',
      name: 'Marie Kouassi',
      avatar: 'https://images.pexels.com/photos/3776164/pexels-photo-3776164.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
      email: 'marie.kouassi@forvismazars.com',
      role: 'Audit Director',
      organization: 'Forvis Mazars Côte d\'Ivoire',
      serviceLine: 'Audit & Assurance',
      country: 'Côte d\'Ivoire',
      expertise: ['Financial Audit', 'IFRS', 'Risk Management', 'Internal Controls'],
      yearsOfExperience: 10,
      bio: 'Specialized in financial auditing and IFRS implementation for multinational corporations operating in Francophone Africa.'
    },
    '4': {
      id: '4',
      name: 'Thabo Mthembu',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
      email: 'thabo.mthembu@forvismazars.com',
      role: 'ESG Lead Partner',
      organization: 'Forvis Mazars South Africa',
      serviceLine: 'ESG & Sustainability',
      country: 'South Africa',
      expertise: ['ESG Strategy', 'Sustainability Reporting', 'Climate Risk', 'Mining Sector'],
      yearsOfExperience: 14,
      bio: 'Leading ESG and sustainability consulting for mining and natural resources sectors across Southern Africa.'
    },
    '5': {
      id: '5',
      name: 'Sarah Mwangi',
      avatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
      email: 'sarah.mwangi@forvismazars.com',
      role: 'Advisory Partner',
      organization: 'Forvis Mazars Kenya',
      serviceLine: 'Business Advisory',
      country: 'Kenya',
      expertise: ['Digital Transformation', 'Technology Advisory', 'Process Optimization', 'Change Management'],
      yearsOfExperience: 11,
      bio: 'Focused on digital transformation and technology advisory for financial institutions and fintech companies in East Africa.'
    },
    '6': {
      id: '6',
      name: 'David Chanda',
      avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
      email: 'david.chanda@forvismazars.com',
      role: 'Senior Manager',
      organization: 'Forvis Mazars Zambia',
      serviceLine: 'Corporate Finance',
      country: 'Zambia',
      expertise: ['Valuation', 'Due Diligence', 'Financial Modeling', 'Transaction Support'],
      yearsOfExperience: 8,
      bio: 'Specializing in valuations and due diligence for mining and infrastructure transactions in Southern Africa.'
    }
  };

  const handleViewProfile = (userId: string) => {
    const profile = userProfiles[userId];
    if (profile) {
      setSelectedProfile(profile);
      setShowProfileModal(true);
    }
  };

  // Dummy opportunities data as fallback
  const dummyOpportunities: Opportunity[] = [
    {
      id: '1',
      title: 'Regional Banking Expansion - West Africa',
      description: 'Leading Nigerian bank seeking expertise for multi-country expansion into Ghana, Côte d\'Ivoire, and Senegal. Need specialists in banking regulations, tax structuring, and market entry strategies.',
      industry: 'Financial Services',
      clientSector: 'Banking',
      regionsNeeded: ['Nigeria', 'Ghana', 'Côte d\'Ivoire', 'Senegal'],
      contactPerson: 'Amara Okafor',
      contactAvatar: 'https://images.pexels.com/photos/3778966/pexels-photo-3778966.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
      deadline: 'March 15, 2024',
      budget: '$500K - $1M',
      priority: 'high',
      status: 'open',
      applicants: 8,
      createdAt: 'Jan 28, 2024'
    },
    {
      id: '2',
      title: 'ESG Compliance for Mining Operations',
      description: 'Large mining conglomerate needs comprehensive ESG audit and sustainability roadmap across Southern African operations. Focus on environmental impact, community relations, and governance frameworks.',
      industry: 'Mining',
      clientSector: 'Natural Resources',
      regionsNeeded: ['South Africa', 'Botswana', 'Zambia', 'Zimbabwe'],
      contactPerson: 'Thabo Mthembu',
      contactAvatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
      deadline: 'April 1, 2024',
      budget: '$750K - $1.5M',
      priority: 'high',
      status: 'open',
      applicants: 12,
      createdAt: 'Jan 25, 2024'
    },
    {
      id: '3',
      title: 'Digital Payment Platform Launch - East Africa',
      description: 'Fintech startup launching mobile payment solution across EA Community. Require regulatory compliance, payment systems integration, and market analysis expertise.',
      industry: 'Technology',
      clientSector: 'Fintech',
      regionsNeeded: ['Kenya', 'Tanzania', 'Uganda', 'Rwanda'],
      contactPerson: 'Kemi Adebayo',
      contactAvatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
      deadline: 'March 30, 2024',
      budget: '$300K - $600K',
      priority: 'medium',
      status: 'open',
      applicants: 6,
      createdAt: 'Feb 1, 2024'
    },
    {
      id: '4',
      title: 'Cross-Border M&A Advisory - Consumer Goods',
      description: 'International consumer goods company acquiring West African distribution network. Need M&A advisory, due diligence, valuation, and integration planning across multiple markets.',
      industry: 'Consumer Goods',
      clientSector: 'Retail & Distribution',
      regionsNeeded: ['Ghana', 'Nigeria', 'Côte d\'Ivoire'],
      contactPerson: 'Kwame Asante',
      contactAvatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
      deadline: 'April 15, 2024',
      budget: '$400K - $800K',
      priority: 'high',
      status: 'in-progress',
      applicants: 5,
      createdAt: 'Jan 20, 2024'
    },
    {
      id: '5',
      title: 'Infrastructure PPP Structuring - Transport Sector',
      description: 'Government-led public-private partnership for regional transportation infrastructure. Seeking experts in project finance, regulatory frameworks, and risk management.',
      industry: 'Infrastructure',
      clientSector: 'Transportation',
      regionsNeeded: ['Ethiopia', 'Kenya', 'Uganda'],
      contactPerson: 'Sarah Mwangi',
      contactAvatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
      deadline: 'May 1, 2024',
      budget: '$1M - $2M',
      priority: 'high',
      status: 'open',
      applicants: 15,
      createdAt: 'Jan 18, 2024'
    },
    {
      id: '6',
      title: 'Tax Optimization for Multinational Corporation',
      description: 'Global corporation needs comprehensive tax strategy for African operations. Focus on transfer pricing, withholding tax optimization, and treaty navigation across 10+ countries.',
      industry: 'Professional Services',
      clientSector: 'Tax Advisory',
      regionsNeeded: ['South Africa', 'Nigeria', 'Kenya', 'Egypt', 'Morocco'],
      contactPerson: 'Fatima El-Sayed',
      contactAvatar: 'https://images.pexels.com/photos/3776164/pexels-photo-3776164.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
      deadline: 'March 20, 2024',
      budget: '$600K - $1.2M',
      priority: 'medium',
      status: 'open',
      applicants: 9,
      createdAt: 'Jan 30, 2024'
    },
    {
      id: '7',
      title: 'Healthcare System Digital Transformation',
      description: 'Regional healthcare provider implementing digital health records and telemedicine platform. Need expertise in healthcare regulations, data privacy, and system integration.',
      industry: 'Healthcare',
      clientSector: 'Medical Services',
      regionsNeeded: ['Ghana', 'Nigeria', 'Kenya'],
      contactPerson: 'Dr. Nia Banda',
      contactAvatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
      deadline: 'April 10, 2024',
      budget: '$250K - $500K',
      priority: 'medium',
      status: 'open',
      applicants: 4,
      createdAt: 'Feb 3, 2024'
    },
    {
      id: '8',
      title: 'Renewable Energy Project Finance - Solar',
      description: 'Large-scale solar energy project across Southern Africa seeking project finance advisory, regulatory compliance, and environmental impact assessment.',
      industry: 'Energy',
      clientSector: 'Renewable Energy',
      regionsNeeded: ['South Africa', 'Namibia', 'Botswana'],
      contactPerson: 'Thabo Mthembu',
      contactAvatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
      deadline: 'March 25, 2024',
      budget: '$800K - $1.5M',
      priority: 'high',
      status: 'open',
      applicants: 11,
      createdAt: 'Jan 22, 2024'
    }
  ];

  // Load opportunities from API
  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        setLoading(true);
        const response = await opportunitiesAPI.getOpportunities();
        
        // Transform backend data to frontend format
        const transformedOpportunities = response.data.opportunities.map((opp: any) => ({
          id: opp.opportunity_id,
          title: opp.title,
          description: opp.description,
          industry: opp.industry,
          clientSector: opp.client_sector,
          regionsNeeded: opp.regions_needed.split(',').map((r: string) => r.trim()),
          contactPerson: opp.contact_person_name,
          contactAvatar: opp.contact_person_avatar || 'https://images.pexels.com/photos/3778966/pexels-photo-3778966.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
          deadline: new Date(opp.deadline).toLocaleDateString(),
          budget: opp.budget_range,
          priority: opp.priority,
          status: opp.status,
          applicants: opp.applicant_count || 0,
          createdAt: new Date(opp.created_at).toLocaleDateString()
        }));

        // Use dummy data if API returns empty
        setOpportunities(transformedOpportunities.length > 0 ? transformedOpportunities : dummyOpportunities);
      } catch (error) {
        console.error('Error loading opportunities:', error);
        // Use dummy data on error
        setOpportunities(dummyOpportunities);
      } finally {
        setLoading(false);
      }
    };

    loadOpportunities();
  }, []);

  // Demo: Add a welcome notification on first load
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('collaborationWelcomeSeen');
    if (!hasSeenWelcome) {
      setTimeout(() => {
        addNotification({
          type: 'system',
          title: 'Welcome to Collaboration Hub! 🎉',
          message: 'Explore opportunities, join groups, and collaborate with colleagues across Africa.',
          priority: 'medium'
        });
        localStorage.setItem('collaborationWelcomeSeen', 'true');
      }, 1000);
    }
  }, [addNotification]);

  // Sample interest requests
  const sampleInterestRequests: InterestRequest[] = [
    {
      id: '1',
      opportunityId: '1',
      opportunityTitle: 'Regional Banking Expansion - West Africa',
      applicantName: 'David Osei',
      applicantEmail: 'david.osei@kpmgafrica.com',
      applicantAvatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
      applicantOrganization: 'KPMG Ghana',
      applicantRole: 'Senior Tax Consultant',
      message: 'I have extensive experience in West African banking regulations and have led similar expansion projects across Ghana and Côte d\'Ivoire. Would love to contribute my expertise in regulatory compliance and market entry strategies.',
      timestamp: '2 hours ago',
      status: 'pending'
    },
    {
      id: '2',
      opportunityId: '2',
      opportunityTitle: 'ESG Compliance for Mining Operations',
      applicantName: 'Lindiwe Nkosi',
      applicantEmail: 'lindiwe.nkosi@pwc.co.za',
      applicantAvatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
      applicantOrganization: 'PwC South Africa',
      applicantRole: 'ESG & Sustainability Lead',
      message: 'I specialize in ESG audits for mining companies across Southern Africa. My team has completed comprehensive sustainability assessments for major operations in Zambia and Botswana. I believe we can add significant value to this project.',
      timestamp: '5 hours ago',
      status: 'pending'
    },
    {
      id: '3',
      opportunityId: '3',
      opportunityTitle: 'Digital Payment Platform Launch - East Africa',
      applicantName: 'James Kimani',
      applicantEmail: 'james.kimani@ey.com',
      applicantAvatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
      applicantOrganization: 'EY Kenya',
      applicantRole: 'Fintech Advisory Manager',
      message: 'With 8+ years in fintech regulatory compliance across East Africa, I\'ve helped multiple payment platforms navigate the complex regulatory landscape in Kenya, Tanzania, and Rwanda. Happy to discuss how we can support this launch.',
      timestamp: '1 day ago',
      status: 'pending'
    }
  ];

  // Initialize interest requests
  useEffect(() => {
    setInterestRequests(sampleInterestRequests);
  }, []);

  const collaborationGroups: CollaborationGroup[] = [
    {
      id: '1',
      name: 'West Africa Banking Expansion Team',
      description: 'Cross-regional team working on financial services expansion projects',
      creatorId: '1',
      members: [
        { id: '1', name: 'Amara Okafor', avatar: 'https://images.pexels.com/photos/3778966/pexels-photo-3778966.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop', role: 'Lead' },
        { id: '2', name: 'Kwame Asante', avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop', role: 'Ghana Expert' },
        { id: '3', name: 'Marie Kouassi', avatar: 'https://images.pexels.com/photos/3776164/pexels-photo-3776164.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop', role: 'Côte d\'Ivoire Expert' }
      ],
      opportunities: ['1'],
      status: 'active',
      lastActivity: '2 hours ago',
      documents: [
        {
          id: 'd1',
          name: 'Banking Regulations - West Africa.pdf',
          type: 'pdf',
          uploadedBy: 'Amara Okafor',
          uploadedAt: '2 days ago',
          size: '2.4 MB',
          url: '#'
        }
      ]
    },
    {
      id: '2',
      name: 'ESG & Sustainability Network',
      description: 'Regional experts focusing on ESG compliance and sustainability reporting',
      creatorId: '4',
      members: [
        { id: '4', name: 'Thabo Mthembu', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop', role: 'Lead' },
        { id: '5', name: 'Sarah Mwangi', avatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop', role: 'Kenya Partner' },
        { id: '6', name: 'David Chanda', avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop', role: 'Zambia Partner' }
      ],
      opportunities: ['2'],
      status: 'active',
      lastActivity: '5 hours ago',
      documents: []
    }
  ];

  const dealPipeline: DealPipeline[] = [
    {
      id: '1',
      clientName: 'First Bank Nigeria',
      value: '$4.2M',
      stage: 'negotiation',
      regions: ['Nigeria', 'Ghana'],
      probability: 75,
      expectedClose: '2024-03-30',
      teamLead: 'Amara Okafor'
    },
    {
      id: '2',
      clientName: 'Anglo American',
      value: '$2.8M',
      stage: 'proposal',
      regions: ['South Africa', 'Botswana'],
      probability: 60,
      expectedClose: '2024-04-15',
      teamLead: 'Thabo Mthembu'
    },
    {
      id: '3',
      clientName: 'Safaricom Ethiopia',
      value: '$1.5M',
      stage: 'prospecting',
      regions: ['Kenya', 'Ethiopia'],
      probability: 30,
      expectedClose: '2024-05-20',
      teamLead: 'Kemi Adebayo'
    }
  ];

  const caseStudies: CaseStudy[] = [
    {
      id: '1',
      title: 'Cross-Border M&A Success: Nigerian Bank\'s Expansion into Ghana',
      industry: 'Financial Services',
      region: 'West Africa',
      author: 'Amara Okafor',
      authorAvatar: 'https://images.pexels.com/photos/3778966/pexels-photo-3778966.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
      summary: 'Complete case study on regulatory navigation, tax optimization, and stakeholder management for a successful cross-border acquisition.',
      downloadCount: 156,
      publishedAt: '2024-01-15',
      tags: ['M&A', 'Banking', 'Regulatory', 'West Africa']
    },
    {
      id: '2',
      title: 'ESG Transformation in Southern African Mining',
      industry: 'Mining',
      region: 'Southern Africa',
      author: 'Thabo Mthembu',
      authorAvatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
      summary: 'Comprehensive guide to implementing ESG frameworks and achieving sustainability certifications in the mining sector.',
      downloadCount: 203,
      publishedAt: '2024-01-20',
      tags: ['ESG', 'Mining', 'Sustainability', 'Compliance']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'prospecting': return 'bg-blue-100 text-blue-800';
      case 'proposal': return 'bg-yellow-100 text-yellow-800';
      case 'negotiation': return 'bg-orange-100 text-orange-800';
      case 'closed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const handleCreateOpportunity = () => {
    const createOpportunity = async () => {
      if (newOpportunity.title.trim() && newOpportunity.description.trim()) {
        try {
          await opportunitiesAPI.createOpportunity({
            title: newOpportunity.title,
            description: newOpportunity.description,
            industry: newOpportunity.industry,
            client_sector: newOpportunity.clientSector,
            regions_needed: newOpportunity.regionsNeeded,
            budget_range: newOpportunity.budget,
            deadline: newOpportunity.deadline,
            priority: 'medium'
          });
          
          setShowCreateModal(false);
          setNewOpportunity({
            title: '',
            description: '',
            industry: '',
            clientSector: '',
            regionsNeeded: '',
            budget: '',
            deadline: ''
          });
          
          // Reload opportunities
          const response = await opportunitiesAPI.getOpportunities();
          const transformedOpportunities = response.data.opportunities.map((opp: any) => ({
            id: opp.opportunity_id,
            title: opp.title,
            description: opp.description,
            industry: opp.industry,
            clientSector: opp.client_sector,
            regionsNeeded: opp.regions_needed.split(',').map((r: string) => r.trim()),
            contactPerson: opp.contact_person_name,
            contactAvatar: opp.contact_person_avatar || 'https://images.pexels.com/photos/3778966/pexels-photo-3778966.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
            deadline: new Date(opp.deadline).toLocaleDateString(),
            budget: opp.budget_range,
            priority: opp.priority,
            status: opp.status,
            applicants: opp.applicant_count || 0,
            createdAt: new Date(opp.created_at).toLocaleDateString()
          }));
          setOpportunities(transformedOpportunities);
          
        } catch (error) {
          console.error('Error creating opportunity:', error);
          alert('Failed to create opportunity. Please try again.');
        }
      }
    };
    
    createOpportunity();
  };

  const handleLearnMore = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowOpportunityModal(true);
  };

  const handleExpressInterest = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowInterestModal(true);
  };

  const handleSendInterest = () => {
    if (interestMessage.trim() && selectedOpportunity) {
      // Create a new interest request
      const newRequest: InterestRequest = {
        id: String(interestRequests.length + 1),
        opportunityId: selectedOpportunity.id,
        opportunityTitle: selectedOpportunity.title,
        applicantName: 'Current User', // This should come from auth context
        applicantEmail: 'user@example.com', // This should come from auth context
        applicantAvatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
        applicantOrganization: 'Your Organization', // This should come from user profile
        applicantRole: 'Your Role', // This should come from user profile
        message: interestMessage,
        timestamp: 'Just now',
        status: 'pending'
      };
      
      setInterestRequests([...interestRequests, newRequest]);
      setShowInterestModal(false);
      setInterestMessage('');
      setSelectedOpportunity(null);
      
      // Add notification for the opportunity holder
      addNotification({
        type: 'request',
        title: 'New Interest Request',
        message: `Someone expressed interest in "${selectedOpportunity.title}"`,
        avatar: newRequest.applicantAvatar,
        actionUrl: '/collaboration',
        priority: 'high'
      });
      
      // Show success message
      alert('Your interest has been submitted! The opportunity holder will review your request.');
    }
  };

  const handleRequestAction = (requestId: string, action: 'accept' | 'reject') => {
    const request = interestRequests.find(r => r.id === requestId);
    if (!request) return;

    if (action === 'accept') {
      // Create a new collaboration group
      const newGroup: CollaborationGroup = {
        id: String(collaborationGroups.length + 1),
        name: `${request.opportunityTitle} - Collaboration`,
        description: `Collaboration group for ${request.opportunityTitle}`,
        creatorId: currentUserId,
        members: [
          {
            id: '1',
            name: request.applicantName,
            avatar: request.applicantAvatar,
            role: request.applicantRole
          }
        ],
        opportunities: [request.opportunityId],
        status: 'active',
        lastActivity: 'Just now',
        documents: []
      };
      
      // Update request status
      setInterestRequests(interestRequests.map(r =>
        r.id === requestId ? { ...r, status: 'accepted' } : r
      ));
      
      // Notify the applicant that their request was accepted
      addNotification({
        type: 'opportunity',
        title: 'Request Accepted!',
        message: `Your interest in "${request.opportunityTitle}" has been accepted. A collaboration group has been created.`,
        avatar: request.applicantAvatar,
        actionUrl: '/collaboration',
        priority: 'high'
      });
      
      // Switch to groups tab and select the new group
      setActiveTab('groups');
      setSelectedGroup(newGroup);
      
      alert(`${request.applicantName} has been accepted! A collaboration group has been created.`);
    } else {
      // Reject the request
      setInterestRequests(interestRequests.map(r =>
        r.id === requestId ? { ...r, status: 'rejected' } : r
      ));
      
      // Notify the applicant that their request was rejected
      addNotification({
        type: 'opportunity',
        title: 'Request Declined',
        message: `Your interest in "${request.opportunityTitle}" was not accepted at this time.`,
        priority: 'low'
      });
      
      alert(`Request from ${request.applicantName} has been declined.`);
    }
    
    setShowRequestDetailModal(false);
    setSelectedRequest(null);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedGroup) {
      const message: GroupMessage = {
        id: String(groupMessages.length + 1),
        sender: 'You',
        senderAvatar: 'https://images.pexels.com/photos/3778966/pexels-photo-3778966.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
        message: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'message'
      };
      
      setGroupMessages([...groupMessages, message]);
      setNewMessage('');
    }
  };

  const handleUploadDocument = () => {
    if (uploadFile && selectedGroup) {
      const newDoc: GroupDocument = {
        id: `d${selectedGroup.documents.length + 1}`,
        name: uploadFile.name,
        type: uploadFile.name.split('.').pop() as 'pdf' | 'doc' | 'xlsx' | 'pptx',
        uploadedBy: 'You',
        uploadedAt: 'Just now',
        size: `${(uploadFile.size / (1024 * 1024)).toFixed(2)} MB`,
        url: URL.createObjectURL(uploadFile)
      };

      // Update the selected group's documents
      selectedGroup.documents.push(newDoc);
      setSelectedGroup({ ...selectedGroup });
      
      // Add a message to the chat about the upload
      const message: GroupMessage = {
        id: String(groupMessages.length + 1),
        sender: 'You',
        senderAvatar: 'https://images.pexels.com/photos/3778966/pexels-photo-3778966.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
        message: `Uploaded document: ${uploadFile.name}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'file'
      };
      
      setGroupMessages([...groupMessages, message]);
      setUploadFile(null);
      setShowUploadModal(false);
    }
  };

  const handleRemoveMember = (memberId: string) => {
    if (selectedGroup && selectedGroup.creatorId === currentUserId) {
      const updatedMembers = selectedGroup.members.filter(m => m.id !== memberId);
      setSelectedGroup({ ...selectedGroup, members: updatedMembers });
      alert('Member removed from group');
    }
  };

  const handleDeleteGroup = () => {
    if (selectedGroup && selectedGroup.creatorId === currentUserId) {
      if (window.confirm(`Are you sure you want to delete the group "${selectedGroup.name}"? This action cannot be undone.`)) {
        // In real app, this would call an API to delete the group
        setSelectedGroup(null);
        setShowGroupManageModal(false);
        alert('Group deleted successfully');
        // Reload or filter groups list to remove deleted group
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header with Forvis Mazars Branding */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="max-w-[1920px] mx-auto px-12 sm:px-16 lg:px-20 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-3 text-white">Client Collaboration & Opportunity Hub</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Share opportunities and collaborate on cross-border projects across our network
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-12 sm:px-16 lg:px-20 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Tabs Header */}
          <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-6">
            {activeTab === 'opportunities' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ml-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Post Opportunity</span>
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('opportunities')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'opportunities'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Opportunities
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'groups'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Groups
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'requests'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Requests
              {interestRequests.filter(r => r.status === 'pending').length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {interestRequests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'knowledge'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Knowledge Sharing
            </button>
          </div>
        </div>

        {/* Opportunities Tab */}
        {activeTab === 'opportunities' && (
          <div className="flex h-full">
            {/* Filters Sidebar */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
              <div className="p-6">
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search opportunities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                    <select
                      value={selectedFilters.industry}
                      onChange={(e) => setSelectedFilters({...selectedFilters, industry: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Industries</option>
                      <option value="Financial Services">Financial Services</option>
                      <option value="Mining">Mining</option>
                      <option value="Technology">Technology</option>
                      <option value="Energy">Energy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                    <select
                      value={selectedFilters.region}
                      onChange={(e) => setSelectedFilters({...selectedFilters, region: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Regions</option>
                      <option value="West Africa">West Africa</option>
                      <option value="East Africa">East Africa</option>
                      <option value="Southern Africa">Southern Africa</option>
                      <option value="North Africa">North Africa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={selectedFilters.status}
                      onChange={(e) => setSelectedFilters({...selectedFilters, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Statuses</option>
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Opportunity Stats</h4>
                  <div className="space-y-2 text-sm text-blue-700">
                    <div className="flex justify-between">
                      <span>Open Opportunities:</span>
                      <span className="font-medium">{opportunities.filter(o => o.status === 'open').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Value:</span>
                      <span className="font-medium">$8M+</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Collaborations:</span>
                      <span className="font-medium">{collaborationGroups.filter(g => g.status === 'active').length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Opportunities List */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-6">
                {opportunities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((opportunity) => (
                  <div key={opportunity.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{opportunity.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{opportunity.industry}</span>
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">{opportunity.clientSector}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(opportunity.status)}`}>
                            {opportunity.status.replace('-', ' ')}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(opportunity.priority)}`}>
                            {opportunity.priority} priority
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">{opportunity.budget}</div>
                        <div className="text-sm text-gray-600">Budget Range</div>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{opportunity.description}</p>

                    <div className="flex items-center space-x-6 mb-4">
                      <div className="flex items-center space-x-2">
                        <img
                          src={opportunity.contactAvatar}
                          alt={opportunity.contactPerson}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{opportunity.contactPerson}</div>
                          <div className="text-xs text-gray-600">Contact Person</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Deadline: {opportunity.deadline}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{opportunity.applicants} interested</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Regions Needed:</div>
                        <div className="flex space-x-2">
                          {opportunity.regionsNeeded.map((region) => (
                            <span key={region} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                              {region}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                          Express Interest
                        </button>
                        <button className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                          <span onClick={() => handleLearnMore(opportunity)}>Learn More</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-center space-x-2 mt-6 pb-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.ceil(opportunities.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(opportunities.length / itemsPerPage), prev + 1))}
                  disabled={currentPage === Math.ceil(opportunities.length / itemsPerPage)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === Math.ceil(opportunities.length / itemsPerPage)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* My Groups Tab - Shows groups user is currently in */}
        {activeTab === 'groups' && (
          <div className="flex h-[600px]">
            {!selectedGroup ? (
              /* Group List View */
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="grid gap-4">
                  {collaborationGroups.map((group) => (
                    <div 
                      key={group.id} 
                      onClick={() => {
                        setSelectedGroup(group);
                        // Initialize sample messages for the group
                        setGroupMessages([
                          {
                            id: '1',
                            sender: group.members[0].name,
                            senderAvatar: group.members[0].avatar,
                            message: 'Welcome to the collaboration group! Let\'s discuss our strategy for this opportunity.',
                            timestamp: '10:30 AM',
                            type: 'message'
                          }
                        ]);
                      }}
                      className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all cursor-pointer hover:border-blue-300"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{group.name}</h3>
                          <p className="text-gray-600 text-sm mb-3">{group.description}</p>
                          <div className="flex items-center space-x-3 text-sm text-gray-600">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              group.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {group.status}
                            </span>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{group.lastActivity}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="flex -space-x-2">
                          {group.members.slice(0, 4).map((member) => (
                            <img
                              key={member.id}
                              src={member.avatar}
                              alt={member.name}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewProfile(member.id);
                              }}
                              className="w-8 h-8 rounded-full border-2 border-white object-cover cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                              title={`View ${member.name}'s profile`}
                            />
                          ))}
                          {group.members.length > 4 && (
                            <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                              +{group.members.length - 4}
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-gray-600">{group.members.length} members</span>
                      </div>
                    </div>
                  ))}
                  
                  {collaborationGroups.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Groups Yet</h3>
                      <p className="text-gray-600">Accept interest requests to create collaboration groups</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Group Chat View with Knowledge Panel */
              <div className="flex flex-1">
                {/* Chat Window */}
                <div className="flex-1 flex flex-col border-r border-gray-200">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setSelectedGroup(null)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          ← Back
                        </button>
                        <div>
                          <h3 className="font-semibold text-gray-900">{selectedGroup.name}</h3>
                          <p className="text-sm text-gray-600">{selectedGroup.members.length} members</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {selectedGroup.creatorId === currentUserId && (
                          <>
                            <button
                              onClick={() => setShowUploadModal(true)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Upload</span>
                            </button>
                            <button
                              onClick={() => setShowGroupManageModal(true)}
                              className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                            >
                              Manage
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setShowKnowledgePanel(!showKnowledgePanel)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          {showKnowledgePanel ? 'Hide' : 'Show'} Knowledge
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    {groupMessages.map((msg) => (
                      <div key={msg.id} className="mb-4">
                        <div className="flex items-start space-x-3">
                          <img
                            src={msg.senderAvatar}
                            alt={msg.sender}
                            onClick={() => {
                              // Try to find matching user profile
                              const profile = Object.values(userProfiles).find(p => p.name === msg.sender);
                              if (profile) handleViewProfile(profile.id);
                            }}
                            className="w-8 h-8 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                            title="View profile"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-gray-900 text-sm">{msg.sender}</span>
                              <span className="text-xs text-gray-500">{msg.timestamp}</span>
                            </div>
                            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                              <p className="text-gray-800 text-sm">{msg.message}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Knowledge Panel (conditionally shown) */}
                {showKnowledgePanel && (
                  <div className="w-80 bg-white p-4 overflow-y-auto border-l border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4">Shared Documents</h3>
                    
                    {selectedGroup.documents.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-600">No documents yet</p>
                        {selectedGroup.creatorId === currentUserId && (
                          <p className="text-xs text-gray-500 mt-1">Upload documents to share with the team</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedGroup.documents.map((doc) => (
                          <div key={doc.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2 flex-1">
                                <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                <span className="text-sm font-medium text-gray-900 break-words">{doc.name}</span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-600 space-y-1">
                              <div>Uploaded by {doc.uploadedBy}</div>
                              <div className="flex items-center justify-between">
                                <span>{doc.uploadedAt}</span>
                                <span>{doc.size}</span>
                              </div>
                            </div>
                            <div className="mt-2 flex space-x-2">
                              <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                                Download
                              </button>
                              {selectedGroup.creatorId === currentUserId && (
                                <button className="text-xs text-red-600 hover:text-red-700 font-medium">
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Requests Tab - Shows interest requests for opportunities user posted */}
        {activeTab === 'requests' && (
          <div className="p-6 overflow-y-auto h-full">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Interest Requests</h2>
              <p className="text-gray-600">Review and respond to collaboration requests from other professionals</p>
            </div>

            <div className="space-y-4">
              {interestRequests.filter(r => r.status === 'pending').length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
                  <p className="text-gray-600">You'll see collaboration requests here when others express interest in your opportunities</p>
                </div>
              ) : (
                interestRequests.filter(r => r.status === 'pending').map((request) => (
                  <div key={request.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <img
                        src={request.applicantAvatar}
                        alt={request.applicantName}
                        onClick={() => handleViewProfile(request.applicantName.split(' ')[0].toLowerCase() + request.applicantName.split(' ')[1].toLowerCase().charAt(0))}
                        className="w-16 h-16 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                        title="View profile"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{request.applicantName}</h3>
                            <p className="text-sm text-gray-600">{request.applicantRole} at {request.applicantOrganization}</p>
                          </div>
                          <span className="text-xs text-gray-500">{request.timestamp}</span>
                        </div>
                        
                        <div className="mb-3">
                          <div className="text-sm font-medium text-blue-600 mb-1">
                            Opportunity: {request.opportunityTitle}
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">{request.message}</p>
                        </div>

                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowRequestDetailModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() => handleRequestAction(request.id, 'accept')}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRequestAction(request.id, 'reject')}
                            className="border border-red-300 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {/* Show accepted/rejected requests history */}
              {interestRequests.filter(r => r.status !== 'pending').length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Request History</h3>
                  <div className="space-y-3">
                    {interestRequests.filter(r => r.status !== 'pending').map((request) => (
                      <div key={request.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img
                            src={request.applicantAvatar}
                            alt={request.applicantName}
                            onClick={() => handleViewProfile(request.applicantName.split(' ')[0].toLowerCase() + request.applicantName.split(' ')[1].toLowerCase().charAt(0))}
                            className="w-10 h-10 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                            title="View profile"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{request.applicantName}</p>
                            <p className="text-xs text-gray-600">{request.opportunityTitle}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          request.status === 'accepted' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Knowledge Sharing Tab */}
        {activeTab === 'knowledge' && (
          <div className="p-6 overflow-y-auto h-full">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Business Strategy & Market Intelligence</h2>
              <p className="text-gray-600">Case studies and insights to help win similar business</p>
            </div>

            <div className="grid gap-6">
              {caseStudies.map((study) => (
                <div key={study.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                        {study.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{study.industry}</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{study.region}</span>
                        <div className="flex items-center space-x-1">
                          <FileText className="w-4 h-4" />
                          <span>{study.downloadCount} downloads</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{study.summary}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={study.authorAvatar}
                        alt={study.author}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{study.author}</div>
                        <div className="text-xs text-gray-600">Published {study.publishedAt}</div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Preview
                      </button>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Download
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {study.tags.map((tag) => (
                      <span key={tag} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Opportunity Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Post New Opportunity</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Opportunity Title</label>
                <input
                  type="text"
                  value={newOpportunity.title}
                  onChange={(e) => setNewOpportunity({...newOpportunity, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief, descriptive title for the opportunity"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={4}
                  value={newOpportunity.description}
                  onChange={(e) => setNewOpportunity({...newOpportunity, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Detailed description of the opportunity, client needs, and required expertise..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Industry Sector</label>
                  <select
                    value={newOpportunity.industry}
                    onChange={(e) => {
                      setNewOpportunity({
                        ...newOpportunity, 
                        industry: e.target.value,
                        clientSector: '' // Reset client sector when industry changes
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Industry Sector</option>
                    <option value="Financial Services">Financial Services</option>
                    <option value="Energy & Resources">Energy & Resources</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                    <option value="Consumer & Retail">Consumer & Retail</option>
                    <option value="Infrastructure & Real Estate">Infrastructure & Real Estate</option>
                    <option value="Manufacturing & Industrial">Manufacturing & Industrial</option>
                    <option value="Public Sector">Public Sector</option>
                    <option value="Media & Entertainment">Media & Entertainment</option>
                    <option value="Agriculture & Natural Resources">Agriculture & Natural Resources</option>
                    <option value="Professional Services">Professional Services</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client Sector</label>
                  <select
                    value={newOpportunity.clientSector}
                    onChange={(e) => setNewOpportunity({...newOpportunity, clientSector: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    disabled={!newOpportunity.industry}
                  >
                    <option value="">
                      {newOpportunity.industry ? 'Select client sector' : 'Select industry first'}
                    </option>
                    {newOpportunity.industry && industrySectorMap[newOpportunity.industry]?.map((sector) => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Regions Where Expertise is Needed</label>
                <select
                  multiple
                  value={newOpportunity.regionsNeeded.split(',').map(r => r.trim()).filter(r => r)}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setNewOpportunity({...newOpportunity, regionsNeeded: selected.join(', ')});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 h-32"
                >
                  <option value="Algeria">Algeria</option>
                  <option value="Angola">Angola</option>
                  <option value="Benin">Benin</option>
                  <option value="Botswana">Botswana</option>
                  <option value="Burkina Faso">Burkina Faso</option>
                  <option value="Burundi">Burundi</option>
                  <option value="Cameroon">Cameroon</option>
                  <option value="Cape Verde">Cape Verde</option>
                  <option value="Central African Republic">Central African Republic</option>
                  <option value="Chad">Chad</option>
                  <option value="Comoros">Comoros</option>
                  <option value="Congo">Congo</option>
                  <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                  <option value="Democratic Republic of Congo">Democratic Republic of Congo</option>
                  <option value="Djibouti">Djibouti</option>
                  <option value="Egypt">Egypt</option>
                  <option value="Equatorial Guinea">Equatorial Guinea</option>
                  <option value="Eritrea">Eritrea</option>
                  <option value="Eswatini">Eswatini</option>
                  <option value="Ethiopia">Ethiopia</option>
                  <option value="Gabon">Gabon</option>
                  <option value="Gambia">Gambia</option>
                  <option value="Ghana">Ghana</option>
                  <option value="Guinea">Guinea</option>
                  <option value="Guinea-Bissau">Guinea-Bissau</option>
                  <option value="Kenya">Kenya</option>
                  <option value="Lesotho">Lesotho</option>
                  <option value="Liberia">Liberia</option>
                  <option value="Libya">Libya</option>
                  <option value="Madagascar">Madagascar</option>
                  <option value="Malawi">Malawi</option>
                  <option value="Mali">Mali</option>
                  <option value="Mauritania">Mauritania</option>
                  <option value="Mauritius">Mauritius</option>
                  <option value="Morocco">Morocco</option>
                  <option value="Mozambique">Mozambique</option>
                  <option value="Namibia">Namibia</option>
                  <option value="Niger">Niger</option>
                  <option value="Nigeria">Nigeria</option>
                  <option value="Rwanda">Rwanda</option>
                  <option value="São Tomé and Príncipe">São Tomé and Príncipe</option>
                  <option value="Senegal">Senegal</option>
                  <option value="Seychelles">Seychelles</option>
                  <option value="Sierra Leone">Sierra Leone</option>
                  <option value="Somalia">Somalia</option>
                  <option value="South Africa">South Africa</option>
                  <option value="South Sudan">South Sudan</option>
                  <option value="Sudan">Sudan</option>
                  <option value="Tanzania">Tanzania</option>
                  <option value="Togo">Togo</option>
                  <option value="Tunisia">Tunisia</option>
                  <option value="Uganda">Uganda</option>
                  <option value="Zambia">Zambia</option>
                  <option value="Zimbabwe">Zimbabwe</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple countries</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
                  <select
                    value={newOpportunity.budget}
                    onChange={(e) => setNewOpportunity({...newOpportunity, budget: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Budget Range</option>
                    <option value="$100K - $500K">$100K - $500K</option>
                    <option value="$500K - $1M">$500K - $1M</option>
                    <option value="$1M - $3M">$1M - $3M</option>
                    <option value="$3M - $5M">$3M - $5M</option>
                    <option value="$5M+">$5M+</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                  <input
                    type="date"
                    value={newOpportunity.deadline}
                    onChange={(e) => setNewOpportunity({...newOpportunity, deadline: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOpportunity}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Post Opportunity</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Opportunity Details Modal */}
      {showOpportunityModal && selectedOpportunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedOpportunity.title}</h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{selectedOpportunity.industry}</span>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">{selectedOpportunity.clientSector}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOpportunity.status)}`}>
                      {selectedOpportunity.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowOpportunityModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-lg font-bold text-gray-900">{selectedOpportunity.budget}</div>
                  <div className="text-sm text-gray-600">Budget Range</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">{selectedOpportunity.deadline}</div>
                  <div className="text-sm text-gray-600">Deadline</div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{selectedOpportunity.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Regions Needed</h3>
                <div className="flex space-x-2">
                  {selectedOpportunity.regionsNeeded.map((region) => (
                    <span key={region} className="bg-orange-100 text-orange-800 text-sm px-3 py-1 rounded-full">
                      {region}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Person</h3>
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedOpportunity.contactAvatar}
                    alt={selectedOpportunity.contactPerson}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{selectedOpportunity.contactPerson}</div>
                    <div className="text-sm text-gray-600">Project Lead</div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <div className="text-sm text-gray-600">
                  <strong>{selectedOpportunity.applicants}</strong> professionals have expressed interest in this opportunity
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowOpportunityModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    setShowOpportunityModal(false);
                    handleExpressInterest(selectedOpportunity);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Express Interest
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Express Interest Modal */}
      {showInterestModal && selectedOpportunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Express Interest: {selectedOpportunity.title}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why are you interested in this opportunity?
                </label>
                <textarea
                  rows={4}
                  value={interestMessage}
                  onChange={(e) => setInterestMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your relevant experience and how you can contribute..."
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowInterestModal(false);
                    setInterestMessage('');
                    setSelectedOpportunity(null);
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendInterest}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Submit Interest
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Detail Modal */}
      {showRequestDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Applicant Profile
                </h3>
                <button
                  onClick={() => {
                    setShowRequestDetailModal(false);
                    setSelectedRequest(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="flex items-start space-x-4 mb-6">
                <img
                  src={selectedRequest.applicantAvatar}
                  alt={selectedRequest.applicantName}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-gray-900">{selectedRequest.applicantName}</h4>
                  <p className="text-gray-600">{selectedRequest.applicantRole}</p>
                  <p className="text-gray-600">{selectedRequest.applicantOrganization}</p>
                  <p className="text-sm text-gray-500 mt-1">{selectedRequest.applicantEmail}</p>
                </div>
              </div>

              <div className="mb-6">
                <h5 className="font-semibold text-gray-900 mb-2">Opportunity</h5>
                <p className="text-blue-600">{selectedRequest.opportunityTitle}</p>
              </div>

              <div className="mb-6">
                <h5 className="font-semibold text-gray-900 mb-2">Message</h5>
                <p className="text-gray-700 leading-relaxed">{selectedRequest.message}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h5 className="font-semibold text-gray-900 mb-2">Quick Stats</h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Response Time</p>
                    <p className="font-medium text-gray-900">Within 24 hours</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Availability</p>
                    <p className="font-medium text-gray-900">Immediate</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => handleRequestAction(selectedRequest.id, 'reject')}
                  className="flex-1 border border-red-300 text-red-600 hover:bg-red-50 py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Decline
                </button>
                <button
                  onClick={() => handleRequestAction(selectedRequest.id, 'accept')}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Accept & Create Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Upload Document
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File (PDF, DOC, XLSX, PPTX)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xlsx,.xls,.pptx,.ppt"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {uploadFile && (
                  <div className="mt-2 text-sm text-gray-600">
                    Selected: {uploadFile.name} ({(uploadFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFile(null);
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadDocument}
                  disabled={!uploadFile}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Group Management Modal */}
      {showGroupManageModal && selectedGroup && selectedGroup.creatorId === currentUserId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Manage Group: {selectedGroup.name}
                </h3>
                <button
                  onClick={() => setShowGroupManageModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
              
              {/* Group Members Management */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Group Members</h4>
                <div className="space-y-3">
                  {selectedGroup.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          onClick={() => handleViewProfile(member.id)}
                          className="w-10 h-10 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                          title="View profile"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{member.name}</p>
                          <p className="text-sm text-gray-600">{member.role}</p>
                        </div>
                      </div>
                      {member.id !== currentUserId && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Group Documents */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Shared Documents</h4>
                {selectedGroup.documents.length === 0 ? (
                  <p className="text-gray-600 text-sm">No documents uploaded yet</p>
                ) : (
                  <div className="space-y-2">
                    {selectedGroup.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                            <p className="text-xs text-gray-600">{doc.size} • {doc.uploadedAt}</p>
                          </div>
                        </div>
                        <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Danger Zone */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-red-600 mb-3">Danger Zone</h4>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 mb-3">
                    Deleting this group will permanently remove all messages, documents, and member access. This action cannot be undone.
                  </p>
                  <button
                    onClick={handleDeleteGroup}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Delete Group Permanently
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowGroupManageModal(false)}
                  className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {showProfileModal && selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Professional Profile
                </h3>
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    setSelectedProfile(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
              
              {/* Profile Header */}
              <div className="flex items-start space-x-6 mb-6 pb-6 border-b border-gray-200">
                <img
                  src={selectedProfile.avatar}
                  alt={selectedProfile.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedProfile.name}</h2>
                  <p className="text-lg text-gray-700 mb-2">{selectedProfile.role}</p>
                  <p className="text-gray-600 mb-3">{selectedProfile.organization}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                      {selectedProfile.country}
                    </span>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                      {selectedProfile.yearsOfExperience} years experience
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600 w-24">Email:</span>
                    <a href={`mailto:${selectedProfile.email}`} className="text-sm text-blue-600 hover:text-blue-700">
                      {selectedProfile.email}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600 w-24">Location:</span>
                    <span className="text-sm text-gray-800">{selectedProfile.country}</span>
                  </div>
                </div>
              </div>

              {/* Service Line */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Service Line</h4>
                <p className="text-gray-700">{selectedProfile.serviceLine}</p>
              </div>

              {/* Expertise */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Areas of Expertise</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProfile.expertise.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">About</h4>
                <p className="text-gray-700 leading-relaxed">{selectedProfile.bio}</p>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => window.location.href = `mailto:${selectedProfile.email}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Send Email
                </button>
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    setSelectedProfile(null);
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Close
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

export default CollaborationHub;