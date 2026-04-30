import React, { useState, useEffect } from 'react';
import { 
  Target, CheckCircle, Clock, Calendar, TrendingUp, Award, 
  BookOpen, BarChart3, MessageSquare, Star, Plus, Edit2, Trash2,
  ChevronRight, ChevronDown, Filter, Download, Upload, Users,
  FileText, AlertCircle, ThumbsUp, ThumbsDown, Lock, Play,
  PieChart, ArrowLeft, Send, X, Check, Menu, Trophy, Zap, RotateCcw, 
  Lightbulb, CheckCircle2, XCircle, ChevronLeft, 
  User, MapPin
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSimpleAuth } from '../contexts/SimpleAuthContext';

// ==================== INTERFACES ====================

interface GameQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  explanation: string;
}

interface SMARTGoal {
  id: string;
  title: string;
  description: string;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: string;
  category: 'skill' | 'career' | 'leadership' | 'technical' | 'personal';
  priority: 'high' | 'medium' | 'low';
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  progress: number;
  startDate: string;
  targetDate: string;
  completedDate?: string;
  milestones: Milestone[];
  mentorId: string;
  mentorName: string;
  createdAt: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  completedDate?: string;
  tasks: Task[];
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  completedDate?: string;
  assignedTo: 'mentee' | 'mentor';
}

interface ProgressReport {
  id: string;
  goalId: string;
  period: 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  achievements: string[];
  challenges: string[];
  nextSteps: string[];
  mentorFeedback?: string;
  menteeFeedback?: string;
  createdAt: string;
}

interface FeedbackForm {
  id: string;
  type: '360-degree' | 'session' | 'mentor-performance' | 'anonymous';
  recipientId: string;
  recipientName: string;
  recipientRole: 'mentor' | 'mentee';
  ratings: {
    communication: number;
    expertise: number;
    responsiveness: number;
    empathy: number;
    goalAlignment: number;
  };
  strengths: string[];
  areasForImprovement: string[];
  specificExamples: string;
  recommendations: string;
  wouldRecommend: boolean;
  isAnonymous: boolean;
  submittedAt: string;
  submittedBy: string;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  category: 'leadership' | 'technical' | 'communication' | 'strategy' | 'custom';
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  modules: LearningModule[];
  progress: number;
  enrolled: boolean;
  enrolledDate?: string;
  certificateEarned?: boolean;
}

interface LearningModule {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'reading' | 'exercise' | 'assessment' | 'project';
  duration: string;
  completed: boolean;
  completedDate?: string;
  resources: Resource[];
  assessment?: Assessment;
}

interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'article' | 'document';
  url: string;
  videoId?: string; // YouTube video ID
  duration?: string;
  author?: string;
  readTime?: string;
  content?: string; // Article content
  thumbnail?: string;
}

interface Assessment {
  id: string;
  title: string;
  questions: number;
  passingScore: number;
  attempts: number;
  bestScore?: number;
  completed: boolean;
}

interface DevelopmentPlan {
  id: string;
  title: string;
  mentorId: string;
  mentorName: string;
  startDate: string;
  endDate: string;
  objectives: string[];
  focusAreas: string[];
  skillsTodevelops: string[];
  timeline: TimelineEvent[];
  status: 'active' | 'completed' | 'paused';
}

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'milestone' | 'session' | 'assessment' | 'review';
  completed: boolean;
}

// ==================== MOCK DATA ====================

const gameQuestions: GameQuestion[] = [
  {
    id: 1,
    question: "What is the most important quality in a mentor?",
    options: ["Experience", "Active Listening", "Authority", "Perfection"],
    correctAnswer: 1,
    category: "Mentorship Basics",
    explanation: "Active listening helps mentors understand their mentees' needs and provide relevant guidance."
  },
  {
    id: 2,
    question: "How often should mentorship meetings typically occur?",
    options: ["Daily", "Weekly", "Bi-weekly", "Monthly"],
    correctAnswer: 2,
    category: "Meeting Frequency",
    explanation: "Bi-weekly meetings provide regular contact while allowing time to implement advice between sessions."
  },
  {
    id: 3,
    question: "What should a mentee prepare before each session?",
    options: ["Nothing", "Questions and Updates", "Gifts", "Complaints"],
    correctAnswer: 1,
    category: "Preparation",
    explanation: "Coming prepared with questions and updates maximizes the value of mentorship sessions."
  },
  {
    id: 4,
    question: "Which bias affects mentorship relationships most commonly?",
    options: ["Confirmation Bias", "Affinity Bias", "Anchoring Bias", "Availability Bias"],
    correctAnswer: 1,
    category: "Bias Awareness",
    explanation: "Affinity bias leads to preferring people similar to ourselves, which can limit diverse mentorship opportunities."
  },
  {
    id: 5,
    question: "What's the best way to give constructive feedback?",
    options: ["Be Direct and Blunt", "Use Examples and Be Specific", "Avoid Negative Points", "Give General Advice"],
    correctAnswer: 1,
    category: "Feedback",
    explanation: "Specific examples make feedback actionable and easier to understand and implement."
  },
  {
    id: 6,
    question: "How should mentees respond to challenging feedback?",
    options: ["Defend Themselves", "Ask Clarifying Questions", "Ignore It", "Get Emotional"],
    correctAnswer: 1,
    category: "Receiving Feedback",
    explanation: "Asking questions shows engagement and helps ensure the feedback is understood correctly."
  },
  {
    id: 7,
    question: "What indicates a successful mentorship relationship?",
    options: ["Perfect Agreement", "Mutual Growth", "No Conflicts", "Quick Results"],
    correctAnswer: 1,
    category: "Success Metrics",
    explanation: "Both mentor and mentee should learn and grow from the relationship for it to be truly successful."
  },
  {
    id: 8,
    question: "When should you consider ending a mentorship?",
    options: ["After First Disagreement", "When Goals Are Misaligned", "Never", "After 3 Months"],
    correctAnswer: 1,
    category: "Relationship Management",
    explanation: "Persistent misalignment of goals or values may indicate the need to find a better match."
  }
];

const mockGoals: SMARTGoal[] = [
  {
    id: 'goal-1',
    title: 'Master Data Analysis with Python',
    description: 'Develop proficiency in Python for data analysis, including pandas, numpy, and data visualization',
    specific: 'Learn Python libraries: pandas, numpy, matplotlib, seaborn',
    measurable: 'Complete 5 projects, pass 3 assessments with 80%+ score',
    achievable: 'Dedicate 5 hours/week for 3 months with mentor guidance',
    relevant: 'Essential for transitioning to data analyst role',
    timeBound: 'Complete by March 31, 2025',
    category: 'technical',
    priority: 'high',
    status: 'in-progress',
    progress: 65,
    startDate: '2025-01-01',
    targetDate: '2025-03-31',
    mentorId: 'mentor-1',
    mentorName: 'Dr. Sarah Chen',
    createdAt: '2025-01-01',
    milestones: [
      {
        id: 'milestone-1',
        title: 'Python Fundamentals',
        description: 'Master basic Python syntax and data structures',
        dueDate: '2025-01-31',
        completed: true,
        completedDate: '2025-01-28',
        tasks: [
          { id: 'task-1', title: 'Complete Python basics course', completed: true, completedDate: '2025-01-15', assignedTo: 'mentee' },
          { id: 'task-2', title: 'Build first Python project', completed: true, completedDate: '2025-01-28', assignedTo: 'mentee' }
        ]
      },
      {
        id: 'milestone-2',
        title: 'Data Manipulation with Pandas',
        description: 'Learn data cleaning, transformation, and analysis with pandas',
        dueDate: '2025-02-28',
        completed: true,
        completedDate: '2025-02-25',
        tasks: [
          { id: 'task-3', title: 'Study pandas documentation', completed: true, completedDate: '2025-02-10', assignedTo: 'mentee' },
          { id: 'task-4', title: 'Complete data cleaning project', completed: true, completedDate: '2025-02-25', assignedTo: 'mentee' }
        ]
      },
      {
        id: 'milestone-3',
        title: 'Data Visualization',
        description: 'Create compelling visualizations with matplotlib and seaborn',
        dueDate: '2025-03-15',
        completed: false,
        tasks: [
          { id: 'task-5', title: 'Learn matplotlib basics', completed: true, completedDate: '2025-03-05', assignedTo: 'mentee' },
          { id: 'task-6', title: 'Build dashboard project', completed: false, assignedTo: 'mentee' }
        ]
      },
      {
        id: 'milestone-4',
        title: 'Capstone Project',
        description: 'Complete end-to-end data analysis project',
        dueDate: '2025-03-31',
        completed: false,
        tasks: [
          { id: 'task-7', title: 'Define project scope', completed: false, assignedTo: 'mentee' },
          { id: 'task-8', title: 'Present findings', completed: false, assignedTo: 'mentee' }
        ]
      }
    ]
  },
  {
    id: 'goal-2',
    title: 'Develop Leadership Communication Skills',
    description: 'Enhance public speaking, team communication, and executive presence',
    specific: 'Deliver 3 presentations, lead 2 team meetings, receive coaching on executive presence',
    measurable: 'Audience feedback scores 4+/5, peer ratings improvement by 20%',
    achievable: 'Practice weekly, record sessions, get mentor feedback',
    relevant: 'Required for senior leadership position',
    timeBound: 'Achieve by April 30, 2025',
    category: 'leadership',
    priority: 'high',
    status: 'in-progress',
    progress: 40,
    startDate: '2025-02-01',
    targetDate: '2025-04-30',
    mentorId: 'mentor-2',
    mentorName: 'James Williams',
    createdAt: '2025-02-01',
    milestones: [
      {
        id: 'milestone-5',
        title: 'Presentation Skills Foundation',
        description: 'Master basic presentation delivery techniques',
        dueDate: '2025-02-28',
        completed: true,
        completedDate: '2025-02-26',
        tasks: [
          { id: 'task-9', title: 'Complete presentation skills workshop', completed: true, completedDate: '2025-02-15', assignedTo: 'mentee' },
          { id: 'task-10', title: 'Deliver practice presentation', completed: true, completedDate: '2025-02-26', assignedTo: 'mentee' }
        ]
      },
      {
        id: 'milestone-6',
        title: 'Team Leadership Practice',
        description: 'Lead team meetings and facilitate discussions',
        dueDate: '2025-03-31',
        completed: false,
        tasks: [
          { id: 'task-11', title: 'Lead first team meeting', completed: true, completedDate: '2025-03-10', assignedTo: 'mentee' },
          { id: 'task-12', title: 'Facilitate conflict resolution', completed: false, assignedTo: 'mentee' }
        ]
      }
    ]
  }
];

const mockLearningPaths: LearningPath[] = [
  {
    id: 'path-1',
    title: 'Leadership Excellence Track',
    description: 'Comprehensive program to develop strategic leadership skills for senior roles',
    category: 'leadership',
    duration: '12 weeks',
    level: 'advanced',
    progress: 45,
    enrolled: true,
    enrolledDate: '2025-01-15',
    modules: [
      {
        id: 'module-1',
        title: 'Strategic Thinking Fundamentals',
        description: 'Learn to think strategically and make high-impact decisions that drive organizational success',
        type: 'video',
        duration: '2 hours',
        completed: true,
        completedDate: '2025-02-01',
        resources: [
          { 
            id: 'res-1', 
            title: 'What is Strategic Thinking?', 
            type: 'video', 
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            videoId: 'dQw4w9WgXcQ',
            duration: '15:24',
            author: 'Leadership Academy',
            thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
          },
          { 
            id: 'res-2', 
            title: 'Strategic Leadership in Practice', 
            type: 'article', 
            url: '#',
            author: 'Dr. Sarah Johnson',
            readTime: '10 min read',
            content: 'Strategic thinking is the ability to see the big picture, anticipate future trends, and make decisions that position your organization for long-term success. This comprehensive guide explores proven frameworks and methodologies used by top executives worldwide...'
          },
          { 
            id: 'res-3', 
            title: 'Strategic Planning Workshop', 
            type: 'video', 
            url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
            videoId: '9bZkp7q19f0',
            duration: '28:17',
            author: 'Harvard Business Review',
            thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg'
          }
        ]
      },
      {
        id: 'module-2',
        title: 'Team Building & Motivation',
        description: 'Build high-performing teams and maintain motivation through effective leadership techniques',
        type: 'video',
        duration: '2.5 hours',
        completed: true,
        completedDate: '2025-02-15',
        resources: [
          { 
            id: 'res-4', 
            title: 'Building High Performance Teams', 
            type: 'video', 
            url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
            videoId: 'jNQXAC9IVRw',
            duration: '18:42',
            author: 'Simon Sinek',
            thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg'
          },
          { 
            id: 'res-5', 
            title: 'The Psychology of Team Motivation', 
            type: 'article', 
            url: '#',
            author: 'Michael Chen, PhD',
            readTime: '12 min read',
            content: 'Understanding what drives team members goes beyond simple incentives. Research shows that intrinsic motivation, autonomy, and purpose are key factors in building sustainable high-performance teams. This article explores evidence-based strategies for creating a motivating team environment...'
          },
          { 
            id: 'res-6', 
            title: 'Team Dynamics and Communication', 
            type: 'video', 
            url: 'https://www.youtube.com/watch?v=eIho2S0ZahI',
            videoId: 'eIho2S0ZahI',
            duration: '22:35',
            author: 'TEDx Talks',
            thumbnail: 'https://img.youtube.com/vi/eIho2S0ZahI/maxresdefault.jpg'
          }
        ]
      },
      {
        id: 'module-3',
        title: 'Change Management',
        description: 'Lead organizational change effectively with proven frameworks and strategies',
        type: 'video',
        duration: '3 hours',
        completed: false,
        resources: [
          { 
            id: 'res-7', 
            title: 'Introduction to Change Management', 
            type: 'video', 
            url: 'https://www.youtube.com/watch?v=Nz6QtqO3yP0',
            videoId: 'Nz6QtqO3yP0',
            duration: '16:28',
            author: 'McKinsey & Company',
            thumbnail: 'https://img.youtube.com/vi/Nz6QtqO3yP0/maxresdefault.jpg'
          },
          { 
            id: 'res-8', 
            title: 'Managing Resistance to Change', 
            type: 'article', 
            url: '#',
            author: 'Emily Rodriguez',
            readTime: '15 min read',
            content: 'Change is inevitable in modern organizations, but resistance to change is equally common. This guide provides practical strategies for identifying sources of resistance, building stakeholder buy-in, and creating momentum for organizational transformation...'
          },
          { 
            id: 'res-9', 
            title: 'Leading Through Uncertainty', 
            type: 'video', 
            url: 'https://www.youtube.com/watch?v=3yQFebRcznA',
            videoId: '3yQFebRcznA',
            duration: '24:18',
            author: 'MIT Sloan',
            thumbnail: 'https://img.youtube.com/vi/3yQFebRcznA/maxresdefault.jpg'
          }
        ],
        assessment: {
          id: 'assess-1',
          title: 'Change Management Assessment',
          questions: 20,
          passingScore: 80,
          attempts: 0,
          completed: false
        }
      },
      {
        id: 'module-4',
        title: 'Executive Presence & Influence',
        description: 'Develop commanding presence and influence to lead with confidence and authority',
        type: 'video',
        duration: '4 hours',
        completed: false,
        resources: [
          { 
            id: 'res-10', 
            title: 'Executive Presence Masterclass', 
            type: 'video', 
            url: 'https://www.youtube.com/watch?v=VzUpfqbDXN0',
            videoId: 'VzUpfqbDXN0',
            duration: '19:45',
            author: 'The Leadership Institute',
            thumbnail: 'https://img.youtube.com/vi/VzUpfqbDXN0/maxresdefault.jpg'
          },
          { 
            id: 'res-11', 
            title: 'The Art of Executive Communication', 
            type: 'article', 
            url: '#',
            author: 'James Patterson',
            readTime: '8 min read',
            content: 'Executive presence is more than just confidence�it\'s about authenticity, clarity, and the ability to inspire others. Learn the key components of executive presence including body language, vocal tone, strategic storytelling, and how to command a room while remaining approachable...'
          }
        ]
      }
    ]
  },
  {
    id: 'path-2',
    title: 'Technical Excellence in Data Science',
    description: 'Master data science tools, techniques, and best practices for modern analytics',
    category: 'technical',
    duration: '16 weeks',
    level: 'intermediate',
    progress: 25,
    enrolled: true,
    enrolledDate: '2025-02-01',
    modules: [
      {
        id: 'module-5',
        title: 'Python for Data Analysis',
        description: 'Master Python programming fundamentals for data science applications',
        type: 'video',
        duration: '5 hours',
        completed: true,
        completedDate: '2025-02-20',
        resources: [
          { 
            id: 'res-12', 
            title: 'Python Basics for Data Science', 
            type: 'video', 
            url: 'https://www.youtube.com/watch?v=LHBE6Q9XlzI',
            videoId: 'LHBE6Q9XlzI',
            duration: '45:30',
            author: 'freeCodeCamp',
            thumbnail: 'https://img.youtube.com/vi/LHBE6Q9XlzI/maxresdefault.jpg'
          },
          { 
            id: 'res-13', 
            title: 'Data Manipulation with Pandas', 
            type: 'article', 
            url: '#',
            author: 'Alex Kumar',
            readTime: '20 min read',
            content: 'Pandas is the cornerstone library for data manipulation in Python. This comprehensive tutorial covers DataFrames, Series, data cleaning, transformation, aggregation, and advanced techniques for handling real-world datasets efficiently...'
          },
          { 
            id: 'res-14', 
            title: 'NumPy Array Programming', 
            type: 'video', 
            url: 'https://www.youtube.com/watch?v=QUT1VHiLmmI',
            videoId: 'QUT1VHiLmmI',
            duration: '32:15',
            author: 'Corey Schafer',
            thumbnail: 'https://img.youtube.com/vi/QUT1VHiLmmI/maxresdefault.jpg'
          }
        ]
      },
      {
        id: 'module-6',
        title: 'Machine Learning Fundamentals',
        description: 'Understand core ML concepts and build your first predictive models',
        type: 'video',
        duration: '6 hours',
        completed: false,
        resources: [
          { 
            id: 'res-15', 
            title: 'Introduction to Machine Learning', 
            type: 'video', 
            url: 'https://www.youtube.com/watch?v=ukzFI9rgwfU',
            videoId: 'ukzFI9rgwfU',
            duration: '38:42',
            author: 'Stanford Online',
            thumbnail: 'https://img.youtube.com/vi/ukzFI9rgwfU/maxresdefault.jpg'
          },
          { 
            id: 'res-16', 
            title: 'Supervised vs Unsupervised Learning', 
            type: 'article', 
            url: '#',
            author: 'Dr. Maya Patel',
            readTime: '14 min read',
            content: 'Machine learning can be categorized into supervised, unsupervised, and reinforcement learning. This guide breaks down each approach with practical examples, use cases, and decision frameworks to help you choose the right methodology for your data science projects...'
          },
          { 
            id: 'res-17', 
            title: 'Building Your First ML Model', 
            type: 'video', 
            url: 'https://www.youtube.com/watch?v=7eh4d6sabA0',
            videoId: '7eh4d6sabA0',
            duration: '27:50',
            author: 'Python Engineer',
            thumbnail: 'https://img.youtube.com/vi/7eh4d6sabA0/maxresdefault.jpg'
          }
        ]
      },
      {
        id: 'module-7',
        title: 'Data Visualization',
        description: 'Create compelling visualizations that tell data-driven stories',
        type: 'video',
        duration: '4 hours',
        completed: false,
        resources: [
          { 
            id: 'res-18', 
            title: 'Data Visualization Principles', 
            type: 'video', 
            url: 'https://www.youtube.com/watch?v=xekEXM0Vonw',
            videoId: 'xekEXM0Vonw',
            duration: '21:33',
            author: 'Data Science Dojo',
            thumbnail: 'https://img.youtube.com/vi/xekEXM0Vonw/maxresdefault.jpg'
          },
          { 
            id: 'res-19', 
            title: 'Advanced Matplotlib & Seaborn', 
            type: 'article', 
            url: '#',
            author: 'Rachel Thompson',
            readTime: '18 min read',
            content: 'Creating professional visualizations requires understanding both technical tools and design principles. Learn advanced techniques in Matplotlib and Seaborn for creating publication-quality charts, customizing aesthetics, and choosing the right visualization for your data...'
          }
        ]
      }
    ]
  },
  {
    id: 'path-3',
    title: 'Effective Communication Mastery',
    description: 'Enhance written, verbal, and interpersonal communication skills for professional success',
    category: 'communication',
    duration: '8 weeks',
    level: 'beginner',
    progress: 60,
    enrolled: true,
    enrolledDate: '2025-01-20',
    modules: [
      {
        id: 'module-8',
        title: 'Professional Writing Skills',
        description: 'Master business writing including emails, reports, and presentations',
        type: 'reading',
        duration: '3 hours',
        completed: true,
        completedDate: '2025-02-05',
        resources: [
          { 
            id: 'res-20', 
            title: 'Business Writing Essentials', 
            type: 'video', 
            url: 'https://www.youtube.com/watch?v=JJyJfkVWAkQ',
            videoId: 'JJyJfkVWAkQ',
            duration: '14:22',
            author: 'Grammarly',
            thumbnail: 'https://img.youtube.com/vi/JJyJfkVWAkQ/maxresdefault.jpg'
          },
          { 
            id: 'res-21', 
            title: 'Crafting Effective Emails', 
            type: 'article', 
            url: '#',
            author: 'Jennifer Lee',
            readTime: '7 min read',
            content: 'Email remains the primary communication tool in professional settings. Learn how to write clear, concise, and action-oriented emails that get results. This guide covers subject lines, email structure, tone, and common mistakes to avoid...'
          }
        ]
      },
      {
        id: 'module-9',
        title: 'Public Speaking & Presentations',
        description: 'Deliver confident, engaging presentations that captivate audiences',
        type: 'video',
        duration: '4 hours',
        completed: true,
        completedDate: '2025-03-01',
        resources: [
          { 
            id: 'res-22', 
            title: 'Overcoming Public Speaking Fear', 
            type: 'video', 
            url: 'https://www.youtube.com/watch?v=XIXvKKEQQJo',
            videoId: 'XIXvKKEQQJo',
            duration: '16:48',
            author: 'TED-Ed',
            thumbnail: 'https://img.youtube.com/vi/XIXvKKEQQJo/maxresdefault.jpg'
          },
          { 
            id: 'res-23', 
            title: 'The Art of Storytelling in Presentations', 
            type: 'article', 
            url: '#',
            author: 'David Martinez',
            readTime: '11 min read',
            content: 'Great presentations tell stories. Learn how to structure your presentations using narrative techniques, create emotional connections with audiences, and use visual aids effectively to reinforce your message and leave lasting impressions...'
          },
          { 
            id: 'res-24', 
            title: 'Presentation Design Best Practices', 
            type: 'video', 
            url: 'https://www.youtube.com/watch?v=Iwpi1Lm6dFo',
            videoId: 'Iwpi1Lm6dFo',
            duration: '12:27',
            author: 'Presentation Process',
            thumbnail: 'https://img.youtube.com/vi/Iwpi1Lm6dFo/maxresdefault.jpg'
          }
        ]
      },
      {
        id: 'module-10',
        title: 'Active Listening & Empathy',
        description: 'Develop deep listening skills and emotional intelligence',
        type: 'exercise',
        duration: '2 hours',
        completed: false,
        resources: [
          { 
            id: 'res-25', 
            title: 'The Power of Listening', 
            type: 'video', 
            url: 'https://www.youtube.com/watch?v=HAnw168huqA',
            videoId: 'HAnw168huqA',
            duration: '18:15',
            author: 'TEDx Talks',
            thumbnail: 'https://img.youtube.com/vi/HAnw168huqA/maxresdefault.jpg'
          },
          { 
            id: 'res-26', 
            title: 'Emotional Intelligence in Communication', 
            type: 'article', 
            url: '#',
            author: 'Dr. Lisa Wong',
            readTime: '13 min read',
            content: 'Emotional intelligence is the foundation of effective communication. This comprehensive guide explores the five components of EQ, practical techniques for developing empathy, and strategies for reading non-verbal cues and responding with sensitivity and insight...'
          }
        ]
      }
    ]
  },
  {
    id: 'path-4',
    title: 'Digital Marketing Strategy',
    description: 'Learn modern digital marketing techniques from SEO to social media campaigns',
    category: 'strategy',
    duration: '10 weeks',
    level: 'intermediate',
    progress: 0,
    enrolled: false,
    modules: [
      {
        id: 'module-11',
        title: 'SEO & Content Marketing',
        description: 'Drive organic traffic with search engine optimization and content strategy',
        type: 'video',
        duration: '5 hours',
        completed: false,
        resources: [
          { 
            id: 'res-27', 
            title: 'SEO Fundamentals 2024', 
            type: 'video', 
            url: 'https://www.youtube.com/watch?v=DvwS7cV9GmQ',
            videoId: 'DvwS7cV9GmQ',
            duration: '32:54',
            author: 'Neil Patel',
            thumbnail: 'https://img.youtube.com/vi/DvwS7cV9GmQ/maxresdefault.jpg'
          },
          { 
            id: 'res-28', 
            title: 'Content Marketing Strategy Guide', 
            type: 'article', 
            url: '#',
            author: 'Amanda Foster',
            readTime: '16 min read',
            content: 'Content marketing drives customer engagement and brand loyalty. Learn how to develop a comprehensive content strategy, create valuable content that attracts your target audience, measure ROI, and optimize your content funnel for conversions...'
          }
        ]
      }
    ]
  }
];

const mockProgressReports: ProgressReport[] = [
  {
    id: 'report-1',
    goalId: 'goal-1',
    period: 'weekly',
    startDate: '2025-03-10',
    endDate: '2025-03-17',
    achievements: [
      'Completed matplotlib tutorial series',
      'Created 3 different types of visualizations',
      'Started working on dashboard project'
    ],
    challenges: [
      'Struggled with seaborn customization',
      'Time management with work commitments'
    ],
    nextSteps: [
      'Complete dashboard project by March 20',
      'Schedule review session with mentor',
      'Practice presentation of findings'
    ],
    mentorFeedback: 'Great progress this week! Your visualizations are improving. Focus on storytelling with data for your dashboard.',
    menteeFeedback: 'Mentor feedback was very helpful. Need more time for practice.',
    createdAt: '2025-03-17'
  }
];

// ==================== MAIN COMPONENT ====================

const MentorshipActivitiesEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const { mentorId, menteeId, connectionId: connIdParam } = useParams<{ mentorId?: string; menteeId?: string; connectionId?: string }>();
  const { currentUser } = useSimpleAuth();

  // Mentor data based on ID
  const [mentorData, setMentorData] = useState<any>(null);
  const [menteeData, setMenteeData] = useState<any>(null);
  const [isMentorView, setIsMentorView] = useState(false);
  const [activeConnectionId, setActiveConnectionId] = useState<string>('');

  // Unified connection fetch � works for both /mentorship-session/:connectionId
  // and the legacy /mentorship-activities/:mentorId / /mentor-view/mentee/:menteeId routes
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/connections', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        const all: any[] = data.data?.connections || [];
        // Find the right connection depending on which URL param is present
        const conn = connIdParam
          ? all.find(c => String(c.id) === String(connIdParam))
          : menteeId
            ? all.find(c => String(c.requester_id) === String(menteeId))
            : mentorId
              ? all.find(c => String(c.mentor_user_id) === String(mentorId) || String(c.expert_id) === String(mentorId))
              : all[0];
        if (!conn) return;
        setActiveConnectionId(conn.id);
        const isRequester = String(conn.requester_id) === String(currentUser?.id);
        setIsMentorView(!isRequester);
        if (!isRequester) {
          // Mentor sees mentee info
          setMenteeData({
            id: conn.requester_id,
            name: conn.mentee_name || 'Your Mentee',
            location: conn.mentee_location || '',
            bio: conn.mentee_bio || '',
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(conn.mentee_name || 'M')}&background=E83E2D&color=fff&size=200`,
            connectedSince: conn.created_at,
          });
        } else {
          // Mentee sees mentor info
          setMentorData({
            id: conn.mentor_user_id,
            name: conn.mentor_name || 'Your Mentor',
            role: conn.mentor_title || 'Professional',
            company: 'Forvis Mazars',
            location: conn.mentor_location || '',
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(conn.mentor_name || 'M')}&background=1A1F5E&color=fff&size=200`,
            expertise: [],
          });
        }
      })
      .catch(() => {});
  }, [connIdParam, mentorId, menteeId, currentUser?.id]);

  const [activeTab, setActiveTab] = useState<'goals' | 'progress' | 'learning' | 'feedback' | 'development' | 'activities' | 'resources' | 'reflections'>('activities');
  const [selectedGoal, setSelectedGoal] = useState<SMARTGoal | null>(null);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showProgressReport, setShowProgressReport] = useState(false);
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);
  const [showUploadResource, setShowUploadResource] = useState(false);
  const [newResource, setNewResource] = useState({ title: '', description: '', url: '', type: 'article' as 'article' | 'video' | 'guide', category: '' });
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Goals State Management � seeded from DB per connection
  const [goals, setGoals] = useState<SMARTGoal[]>([]);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'technical' as 'skill' | 'career' | 'leadership' | 'technical' | 'personal',
    priority: 'medium' as 'high' | 'medium' | 'low',
    targetDate: '',
    measurable: '',
    actionSteps: ['', '', ''],
    actionStepDates: ['', '', ''],
    resources: '',
    obstacles: ''
  });

  // Progress Reports State Management � seeded from DB per connection
  const [progressReports, setProgressReports] = useState<ProgressReport[]>([]);
  const [newReport, setNewReport] = useState({
    goalId: '',
    period: 'weekly' as 'weekly' | 'monthly',
    startDate: '',
    endDate: '',
    achievements: ['', '', ''],
    challenges: ['', ''],
    nextSteps: ['', '', ''],
    menteeFeedback: ''
  });

  // Fetch goals & progress reports when activeConnectionId is known
  useEffect(() => {
    if (!activeConnectionId) return;
    const token = localStorage.getItem('token');
    fetch(`/api/goals?connection_id=${activeConnectionId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setGoals(d.data.goals); })
      .catch(() => {});
    fetch(`/api/goals/progress-reports?connection_id=${activeConnectionId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setProgressReports(d.data.reports); })
      .catch(() => {});
    // Fetch reflections scoped to this connection
    fetch(`/api/reflections?connection_id=${activeConnectionId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setReflections(d.data.reflections); })
      .catch(() => {});
    // Fetch sessions for this connection
    fetch(`/api/sessions/connection/${activeConnectionId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setSessions(d.data.sessions); })
      .catch(() => {});
    // Fetch learning paths scoped to this connection
    fetch(`/api/learning-paths?connection_id=${activeConnectionId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setLearningPaths(d.data.paths); })
      .catch(() => {});
    // Fetch resources
    fetch('/api/resources', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setDbResources(d.data.resources); })
      .catch(() => {});
  }, [activeConnectionId]);

  // Refresh sessions helper
  const refreshSessions = () => {
    if (!activeConnectionId) return;
    const token = localStorage.getItem('token');
    fetch(`/api/sessions/connection/${activeConnectionId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setSessions(d.data.sessions); })
      .catch(() => {});
  };

  // Handle create session
  const handleCreateSession = async () => {
    if (!newSession.title || !newSession.scheduled_at) {
      alert('Please provide a title and date/time for the session.');
      return;
    }
    setSessionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...newSession, connection_id: activeConnectionId }),
      });
      const data = await res.json();
      if (data.success) {
        refreshSessions();
        setShowNewSession(false);
        setNewSession({ title: '', scheduled_at: '', duration_minutes: 60, meeting_link: '', description: '' });
      } else {
        alert(data.message || 'Failed to create session');
      }
    } catch { alert('Failed to create session'); }
    setSessionLoading(false);
  };

  // Reflections State Management
  const [reflections, setReflections] = useState<any[]>([]);
  const [newReflection, setNewReflection] = useState({
    category: 'goal-progress' as string,
    title: '',
    content: '',
    sessionRating: 0,
    keyTakeaways: ['', '', ''],
    tags: '',
    isAnonymous: false
  });
  
  // Interactive Activities State
  const [showSessionRating, setShowSessionRating] = useState(false);
  const [showMentorshipMixer, setShowMentorshipMixer] = useState(false);
  const [showPowerOfWords, setShowPowerOfWords] = useState(false);
  const [showReflectionBoard, setShowReflectionBoard] = useState(false);
  const [selectedLearningPath, setSelectedLearningPath] = useState<LearningPath | null>(null);
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showResourceViewer, setShowResourceViewer] = useState(false);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [showWordwallGame, setShowWordwallGame] = useState(false);
  const [showQuizManager, setShowQuizManager] = useState(false);
  const [activeQuestionIds, setActiveQuestionIds] = useState<number[]>(() => gameQuestions.map(q => q.id));
  const [customQuestions, setCustomQuestions] = useState<GameQuestion[]>([]);
  const [newCustomQ, setNewCustomQ] = useState({ question: '', options: ['', '', '', ''], correctAnswer: 0, category: '', explanation: '' });
  const [selectedRating, setSelectedRating] = useState(0);
  const [gameHighScore, setGameHighScore] = useState(() => parseInt(localStorage.getItem('mentorship_game_high') || '0'));
  // Sessions state
  const [sessions, setSessions] = useState<any[]>([]);
  const [showNewSession, setShowNewSession] = useState(false);
  const [newSession, setNewSession] = useState({ title: '', scheduled_at: '', duration_minutes: 60, meeting_link: '', description: '' });
  const [sessionLoading, setSessionLoading] = useState(false);
  // Resources state
  const [dbResources, setDbResources] = useState<any[]>([]);
  const [resourceSearch, setResourceSearch] = useState('');

  // Wordwall Game State
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'results'>('menu');
  const [gameMode, setGameMode] = useState<'practice' | 'challenge'>('practice');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<{ correct: boolean; time: number }[]>([]);

  // Timer effect for Challenge mode
  useEffect(() => {
    if (gameState === 'playing' && gameMode === 'challenge' && !showFeedback && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showFeedback) {
      handleTimeUp();
    }
  }, [gameState, gameMode, showFeedback, timeLeft]);
  
  // Stats
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const inProgressGoals = goals.filter(g => g.status === 'in-progress').length;
  const averageProgress = goals.length > 0 ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length) : 0;

  // Wordwall Game Functions
  const startGame = (mode: 'practice' | 'challenge') => {
    setGameMode(mode);
    setGameState('playing');
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(30);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setAnswers([]);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null || showFeedback) return;
    
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === gameQuestions[currentQuestion].correctAnswer;
    
    let points = 0;
    if (isCorrect) {
      if (gameMode === 'challenge') {
        const timeBonus = Math.floor(timeLeft * 2);
        points = 100 + timeBonus;
      } else {
        points = 100;
      }
      setScore(score + points);
    }
    
    setAnswers([...answers, { correct: isCorrect, time: gameMode === 'challenge' ? timeLeft : 0 }]);
    setShowFeedback(true);
  };

  const handleTimeUp = () => {
    if (selectedAnswer === null) {
      setAnswers([...answers, { correct: false, time: 0 }]);
      setShowFeedback(true);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < gameQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setTimeLeft(30);
    } else {
      setGameState('results');
      const newHigh = Math.max(gameHighScore, score);
      if (newHigh > gameHighScore) {
        setGameHighScore(newHigh);
        localStorage.setItem('mentorship_game_high', String(newHigh));
      }
    }
  };

  const resetGame = () => {
    setGameState('menu');
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(30);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setAnswers([]);
  };

  const getScoreMessage = () => {
    const percentage = (answers.filter(a => a.correct).length / gameQuestions.length) * 100;
    if (percentage === 100) return "Perfect! Outstanding work! ??";
    if (percentage >= 80) return "Excellent! You're a mentorship expert! ??";
    if (percentage >= 60) return "Great job! Keep learning! ??";
    return "Good effort! Review the concepts and try again! ??";
  };

  // Learning Path Functions
  const handleMarkResourceComplete = () => {
    if (!selectedResource || !selectedModule || !selectedLearningPath) return;

    const updatedPaths = learningPaths.map(path => {
      if (path.id !== selectedLearningPath.id) return path;

      const updatedModules = path.modules.map(module => {
        if (module.id !== selectedModule.id) return module;

        return {
          ...module,
          completed: true,
          completedDate: new Date().toISOString()
        };
      });

      const completedModules = updatedModules.filter(m => m.completed).length;
      const totalModules = updatedModules.length;
      const newProgress = Math.round((completedModules / totalModules) * 100);

      return {
        ...path,
        modules: updatedModules,
        progress: newProgress
      };
    });

    setLearningPaths(updatedPaths);
    
    const updatedPath = updatedPaths.find(p => p.id === selectedLearningPath.id);
    if (updatedPath) {
      setSelectedLearningPath(updatedPath);
      const updatedModule = updatedPath.modules.find(m => m.id === selectedModule.id);
      if (updatedModule) {
        setSelectedModule(updatedModule);
      }
    }

    alert('? Resource marked as complete! Module progress updated.');
    setShowResourceViewer(false);
    setSelectedResource(null);
  };

  // Goal Management Functions
  const handleCreateGoal = async () => {
    if (!newGoal.title || !newGoal.description || !newGoal.targetDate || !newGoal.measurable) {
      alert('?? Please fill in all required fields (Title, Description, Target Date, and Success Metrics)');
      return;
    }

    const milestones = newGoal.actionSteps
      .filter(step => step.trim() !== '')
      .map((step, index) => ({
        title: step,
        description: step,
        due_date: newGoal.actionStepDates[index] || newGoal.targetDate,
        tasks: [{ title: step, assigned_to: 'mentee' }]
      }));

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          connection_id: activeConnectionId,
          title:       newGoal.title,
          description: newGoal.description,
          specific:    newGoal.description,
          measurable:  newGoal.measurable,
          achievable:  newGoal.resources || 'Achievable with dedicated effort',
          relevant:    'Aligned with career development goals',
          time_bound:  `Complete by ${new Date(newGoal.targetDate).toLocaleDateString()}`,
          category:    newGoal.category,
          priority:    newGoal.priority,
          start_date:  new Date().toISOString().split('T')[0],
          target_date: newGoal.targetDate,
          milestones,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh goals from server to get milestones/tasks populated
        const refreshed = await fetch(`/api/goals?connection_id=${activeConnectionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const rd = await refreshed.json();
        if (rd.success) setGoals(rd.data.goals);
      }
    } catch { /* silent */ }

    setShowCreateGoal(false);
    setNewGoal({ title: '', description: '', category: 'technical', priority: 'medium', targetDate: '', measurable: '', actionSteps: ['', '', ''], actionStepDates: ['', '', ''], resources: '', obstacles: '' });
    alert('? Goal created successfully!');
  };

  const handleCreateReport = async () => {
    if (!newReport.goalId || !newReport.startDate || !newReport.endDate) {
      alert('?? Please select a goal and provide start/end dates');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/goals/progress-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          connection_id:   activeConnectionId,
          goal_id:         newReport.goalId,
          period:          newReport.period,
          start_date:      newReport.startDate,
          end_date:        newReport.endDate,
          achievements:    newReport.achievements.filter(a => a.trim() !== ''),
          challenges:      newReport.challenges.filter(c => c.trim() !== ''),
          next_steps:      newReport.nextSteps.filter(n => n.trim() !== ''),
          mentee_feedback: newReport.menteeFeedback,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const refreshed = await fetch(`/api/goals/progress-reports?connection_id=${activeConnectionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const rd = await refreshed.json();
        if (rd.success) setProgressReports(rd.data.reports);
      }
    } catch { /* silent */ }

    setShowProgressReport(false);
    setNewReport({ goalId: '', period: 'weekly', startDate: '', endDate: '', achievements: ['', '', ''], challenges: ['', ''], nextSteps: ['', '', ''], menteeFeedback: '' });
    alert('? Progress report created successfully!');
  };

  const handleCreateReflection = async () => {
    if (!newReflection.title || !newReflection.content) {
      alert('?? Please provide a title and reflection content');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/reflections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          connection_id: activeConnectionId,
          category: newReflection.category,
          title: newReflection.title,
          content: newReflection.content,
          rating: newReflection.sessionRating || undefined,
          keyTakeaways: newReflection.keyTakeaways.filter(t => t.trim() !== ''),
          tags: newReflection.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t !== ''),
          isAnonymous: newReflection.isAnonymous,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh from DB
        const refreshed = await fetch(`/api/reflections?connection_id=${activeConnectionId}`, { headers: { Authorization: `Bearer ${token}` } });
        const rd = await refreshed.json();
        if (rd.success) setReflections(rd.data.reflections);
      }
    } catch { /* silent */ }
    setShowReflectionBoard(false);
    setNewReflection({
      category: 'goal-progress',
      title: '',
      content: '',
      sessionRating: 0,
      keyTakeaways: ['', '', ''],
      tags: '',
      isAnonymous: false
    });
    
    alert('? Reflection posted successfully! Thank you for sharing your insights.');
  };

  const handleMilestoneToggle = (goalId: string, milestoneId: string) => {
    setGoals(goals.map(goal => {
      if (goal.id !== goalId) return goal;
      
      const updatedMilestones = goal.milestones.map(milestone => {
        if (milestone.id !== milestoneId) return milestone;
        
        const newCompleted = !milestone.completed;
        const updatedTasks = milestone.tasks.map(task => ({
          ...task,
          completed: newCompleted,
          completedDate: newCompleted ? new Date().toISOString() : undefined
        }));
        
        return {
          ...milestone,
          completed: newCompleted,
          completedDate: newCompleted ? new Date().toISOString() : undefined,
          tasks: updatedTasks
        };
      });
      
      const completedMilestones = updatedMilestones.filter(m => m.completed).length;
      const totalMilestones = updatedMilestones.length;
      const newProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
      const allMilestonesComplete = updatedMilestones.every(m => m.completed);
      
      return {
        ...goal,
        milestones: updatedMilestones,
        progress: newProgress,
        status: allMilestonesComplete ? 'completed' as const : newProgress > 0 ? 'in-progress' as const : 'not-started' as const,
        completedDate: allMilestonesComplete ? new Date().toISOString() : undefined
      };
    }));
  };

  const handleTaskToggle = async (goalId: string, milestoneId: string, taskId: string) => {
    // Optimistic UI update
    setGoals(goals.map(goal => {
      if (goal.id !== goalId) return goal;
      const updatedMilestones = goal.milestones.map(milestone => {
        if (milestone.id !== milestoneId) return milestone;
        const updatedTasks = milestone.tasks.map(task => {
          if (task.id !== taskId) return task;
          return { ...task, completed: !task.completed, completedDate: !task.completed ? new Date().toISOString() : undefined };
        });
        const allTasksComplete = updatedTasks.every(t => t.completed);
        return { ...milestone, tasks: updatedTasks, completed: allTasksComplete, completedDate: allTasksComplete ? new Date().toISOString() : undefined };
      });
      const completedMilestones = updatedMilestones.filter(m => m.completed).length;
      const totalMilestones = updatedMilestones.length;
      const newProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
      const allMilestonesComplete = updatedMilestones.every(m => m.completed);
      return { ...goal, milestones: updatedMilestones, progress: newProgress, status: allMilestonesComplete ? 'completed' as const : newProgress > 0 ? 'in-progress' as const : 'not-started' as const, completedDate: allMilestonesComplete ? new Date().toISOString() : undefined };
    }));

    // Persist to DB
    try {
      const token = localStorage.getItem('token');
      const currentTask = goals.find(g => g.id === goalId)?.milestones.find(m => m.id === milestoneId)?.tasks.find(t => t.id === taskId);
      await fetch(`/api/goals/${goalId}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ completed: !currentTask?.completed }),
      });
    } catch { /* silent - optimistic update already applied */ }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1A1F5E] text-white">
        <div className="max-w-[1920px] mx-auto px-12 sm:px-16 lg:px-20 py-12">
          <button
            onClick={() => navigate(isMentorView ? '/my-mentees' : '/mentorship-activities')}
            className="flex items-center space-x-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{isMentorView ? 'Back to My Mentees' : 'Back to My Mentors'}</span>
          </button>

          {/* Person Info Header */}
          {isMentorView ? (
            menteeData && (
              <div className="bg-white/10 backdrop-blur-sm -2xl p-6 mb-6 border border-white/20">
                <div className="flex items-center gap-6">
                  <img
                    src={menteeData.image}
                    alt={menteeData.name}
                    className="w-20 h-20 -full border-4 border-white shadow-xl"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-white">{menteeData.name}</h2>
                      <span className="bg-[#E83E2D]/80 text-white text-xs font-semibold px-3 py-1 -full">Your Mentee</span>
                    </div>
                    {menteeData.bio && <p className="text-white/70 text-sm mb-2 line-clamp-2">{menteeData.bio}</p>}
                    <div className="flex items-center gap-4 text-sm text-white/70">
                      {menteeData.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{menteeData.location}</span>
                        </div>
                      )}
                      {menteeData.connectedSince && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Connected {new Date(menteeData.connectedSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            mentorData && (
              <div className="bg-white/10 backdrop-blur-sm -2xl p-6 mb-6 border border-white/20">
                <div className="flex items-center gap-6">
                  <img
                    src={mentorData.image}
                    alt={mentorData.name}
                    className="w-20 h-20 -full border-4 border-white shadow-xl"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-white">{mentorData.name}</h2>
                      <Award className="w-6 h-6 text-yellow-400" />
                    </div>
                    <p className="text-white/80 text-lg mb-2">{mentorData.role} � {mentorData.company}</p>
                    <div className="flex items-center gap-4 text-sm text-white/70">
                      {mentorData.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{mentorData.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
          
          <div className="text-center">
            <h1 className="text-4xl text-white font-bold mb-3">
              {isMentorView ? 'Mentee Activities & Progress' : 'Mentorship Activities & Progress'}
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              {isMentorView
                ? 'Review goals, track progress, and guide your mentee\'s development'
                : 'Track goals, manage learning paths, and measure your development progress'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="max-w-[1920px] mx-auto px-12 sm:px-16 lg:px-20 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white -xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Goals</p>
                <p className="text-3xl font-bold text-gray-900">{totalGoals}</p>
              </div>
              <div className="bg-[#1A1F5E]/10 p-3 -lg">
                <Target className="w-6 h-6 text-[#0072CE]" />
              </div>
            </div>
          </div>

          <div className="bg-white -xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">In Progress</p>
                <p className="text-3xl font-bold text-gray-900">{inProgressGoals}</p>
              </div>
              <div className="bg-[#1A1F5E]/10 p-3 -lg">
                <Clock className="w-6 h-6 text-[#1A1F5E]" />
              </div>
            </div>
          </div>

          <div className="bg-white -xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{completedGoals}</p>
              </div>
              <div className="bg-[#1A1F5E]/10 p-3 -lg">
                <CheckCircle className="w-6 h-6 text-[#1A1F5E]" />
              </div>
            </div>
          </div>

          <div className="bg-white -xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Avg. Progress</p>
                <p className="text-3xl font-bold text-gray-900">{averageProgress}%</p>
              </div>
              <div className="bg-[#1A1F5E]/10 p-3 -lg">
                <TrendingUp className="w-6 h-6 text-[#0072CE]" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white -xl shadow-sm border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              {[
                { id: 'activities', label: 'Interactive Activities', icon: Trophy },
                { id: 'reflections', label: 'Reflection Board', icon: MessageSquare },
                { id: 'goals', label: 'SMART Goals', icon: Target },
                { id: 'progress', label: 'Progress Reports', icon: BarChart3 },
                { id: 'learning', label: 'Learning Paths', icon: BookOpen },
                { id: 'feedback', label: 'Teams Meetings', icon: MessageSquare },
                // { id: 'development', label: 'Development Plans', icon: FileText },
                { id: 'resources', label: 'Resources & Guides', icon: BookOpen }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-[#0072CE] text-[#0072CE]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Teams Meeting Quick Access */}
            <div className="mb-6 bg-[#1A1F5E] -xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 p-3 -lg">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V5C19 3.89543 18.1046 3 17 3Z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl text-white font-bold mb-3">Need to discuss with your mentor?</h3>
                    <p className="text-white/80 text-sm">Schedule or join a Microsoft Teams meeting</p>
                  </div>
                </div>
                <a
                  href="https://teams.microsoft.com/l/meetup-join/19%3ameeting_mentorship_session"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-[#0072CE] hover:bg-[#1A1F5E]/5 px-6 py-3 -lg font-semibold flex items-center space-x-2 transition-colors"
                >
                  <span>Open Teams</span>
                  <ChevronRight className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* INTERACTIVE ACTIVITIES TAB */}
            {activeTab === 'activities' && (
              <div className="space-y-6">
                {isMentorView ? (
                  /* -- MENTOR ACTIVITIES DASHBOARD -- */
                  <>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Mentor Dashboard</h2>
                      <p className="text-gray-600">Manage your mentee's activities, set quiz questions, and track their engagement</p>
                    </div>

                    {/* Mentor Action Cards */}
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* View Reflections */}
                      <button
                        onClick={() => setActiveTab('reflections')}
                        className="bg-[#F4F4F4] -xl shadow-sm border-2 border-[#E5E7EB] p-8 hover:shadow-lg hover:scale-105 transition-all text-left group"
                      >
                        <div className="w-14 h-14 bg-[#F4F4F4] -lg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                          <BookOpen className="w-7 h-7 text-[#1A1F5E]" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Mentee Reflections</h3>
                        <p className="text-gray-600 text-sm mb-3">Read your mentee's reflection entries and growth insights</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[#1A1F5E] font-medium text-sm">View Reflections ?</span>
                          <span className="bg-[#1A1F5E]/10 text-[#1A1F5E] text-xs font-bold px-2 py-1 -full">{reflections.length}</span>
                        </div>
                      </button>

                      {/* Manage Quiz Questions */}
                      <button
                        onClick={() => setShowQuizManager(true)}
                        className="bg-gradient-to-br from-[#1A1F5E]/5 to-[#0072CE]/10 -xl shadow-sm border-2 border-[#0072CE]/30 p-8 hover:shadow-lg hover:scale-105 transition-all text-left group"
                      >
                        <div className="w-14 h-14 bg-[#F4F4F4] -lg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                          <Trophy className="w-7 h-7 text-[#1A1F5E]" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Set Quiz Questions</h3>
                        <p className="text-gray-600 text-sm mb-3">Choose and customise which questions appear in your mentee's challenge game</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[#0072CE] font-medium text-sm">Manage Questions ?</span>
                          <span className="bg-[#0072CE]/10 text-[#1A1F5E] text-xs font-bold px-2 py-1 -full">{activeQuestionIds.length} active</span>
                        </div>
                      </button>

                      {/* Mentee Progress Overview */}
                      <button
                        onClick={() => setActiveTab('goals')}
                        className="bg-[#F4F4F4] -xl shadow-sm border-2 border-[#E5E7EB] p-8 hover:shadow-lg hover:scale-105 transition-all text-left group"
                      >
                        <div className="w-14 h-14 bg-[#F4F4F4] -lg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                          <TrendingUp className="w-7 h-7 text-[#1A1F5E]" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Mentee Progress</h3>
                        <p className="text-gray-600 text-sm mb-3">Review goal progress, milestones, and progress reports</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[#1A1F5E] font-medium text-sm">View Progress ?</span>
                          <span className="bg-[#1A1F5E]/10 text-[#1A1F5E] text-xs font-bold px-2 py-1 -full">{goals.length} goals</span>
                        </div>
                      </button>
                    </div>

                    {/* Mentee Activity Stats */}
                    <div className="bg-white -xl border border-gray-200 p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Mentee Activity Overview</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center p-5 bg-[#F4F4F4] -xl border border-[#E5E7EB]">
                          <div className="text-3xl font-bold text-[#1A1F5E] mb-1">{reflections.length}</div>
                          <div className="text-sm font-medium text-gray-700">Reflections</div>
                        </div>
                        <div className="text-center p-5 bg-gradient-to-br from-[#F4F4F4] to-[#F4F4F4] -xl border border-[#0072CE]/30">
                          <div className="text-3xl font-bold text-[#1A1F5E] mb-1">{goals.length}</div>
                          <div className="text-sm font-medium text-gray-700">Goals Set</div>
                        </div>
                        <div className="text-center p-5 bg-[#F4F4F4] -xl border border-[#E5E7EB]">
                          <div className="text-3xl font-bold text-[#1A1F5E] mb-1">{goals.filter(g => g.status === 'completed').length}</div>
                          <div className="text-sm font-medium text-gray-700">Goals Completed</div>
                        </div>
                        <div className="text-center p-5 bg-[#F4F4F4] -xl border border-[#E5E7EB]">
                          <div className="text-3xl font-bold text-[#1A1F5E] mb-1">{sessions.filter((s: any) => s.status === 'completed').length}</div>
                          <div className="text-sm font-medium text-gray-700">Sessions Done</div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* -- MENTEE ACTIVITIES DASHBOARD -- */
                  <>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Interactive Activities</h2>
                      <p className="text-gray-600">Engage with tools designed to strengthen your mentorship journey</p>
                    </div>

                    {/* Activities Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Reflection Board */}
                      <button
                        onClick={() => setShowReflectionBoard(true)}
                        className="bg-[#F4F4F4] -xl shadow-sm border-2 border-[#E5E7EB] p-8 hover:shadow-lg hover:scale-105 transition-all text-left group"
                      >
                        <div className="w-16 h-16 bg-[#F4F4F4] -lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <BookOpen className="w-8 h-8 text-[#1A1F5E]" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Reflection Board</h3>
                        <p className="text-gray-600 mb-4">Share and explore mentorship reflections and growth insights</p>
                        <div className="text-[#1A1F5E] font-medium flex items-center">Start Activity ?</div>
                      </button>

                      {/* Mentorship Challenge Game */}
                      <button
                        onClick={() => setShowWordwallGame(true)}
                        className="bg-[#F4F4F4] -xl shadow-sm border-2 border-[#E5E7EB] p-8 hover:shadow-lg hover:scale-105 transition-all text-left group"
                      >
                        <div className="w-16 h-16 bg-[#E83E2D] -lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <Trophy className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Mentorship Challenge</h3>
                        <p className="text-gray-600 mb-4">Test your mentorship knowledge with our quiz game</p>
                        <div className="text-[#E83E2D] font-medium flex items-center">Start Activity ?</div>
                      </button>
                    </div>

                    {/* Activity Stats Dashboard */}
                    <div className="bg-white -xl border border-gray-200 p-6 mt-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Your Activity Progress</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-gradient-to-br from-[#F4F4F4] to-[#F4F4F4] -xl border border-[#0072CE]/30">
                          <div className="text-4xl font-bold text-[#1A1F5E] mb-2">{reflections.length}</div>
                          <div className="text-sm font-medium text-gray-700">Reflections Posted</div>
                        </div>
                        <div className="text-center p-6 bg-[#F4F4F4] -xl border border-[#E5E7EB]">
                          <div className="text-4xl font-bold text-[#1A1F5E] mb-2">{goals.filter(g => g.status === 'completed').length + sessions.filter(s => s.status === 'completed').length}</div>
                          <div className="text-sm font-medium text-gray-700">Activities Completed</div>
                        </div>
                        <div className="text-center p-6 bg-[#F4F4F4] -xl border border-[#E5E7EB]">
                          <div className="text-4xl font-bold text-[#1A1F5E] mb-2">{gameHighScore}</div>
                          <div className="text-sm font-medium text-gray-700">Quiz High Score</div>
                        </div>
                      </div>

                      <div className="mt-6 bg-gradient-to-r from-[#F4F4F4] to-[#F4F4F4] border-2 border-[#0072CE]/30 -xl p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-[#0072CE] -lg flex items-center justify-center">
                              <MessageSquare className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-1">Discuss your progress with your mentor</h4>
                              <p className="text-sm text-gray-600">Schedule a Teams call to review your activities and get feedback</p>
                            </div>
                          </div>
                          <a
                            href="https://teams.microsoft.com/l/meetup-join/19%3ameeting_progress_review"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#0072CE] hover:bg-[#1A1F5E] text-white px-6 py-3 -lg font-semibold flex items-center space-x-2 transition-colors whitespace-nowrap"
                          >
                            <span>Open Teams</span>
                            <ChevronRight className="w-5 h-5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* SMART GOALS TAB */}
            {activeTab === 'goals' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">SMART Goals</h2>
                    <p className="text-gray-600">
                      {isMentorView
                        ? 'Review and guide your mentee\'s goals � track progress and provide feedback'
                        : 'Specific, Measurable, Achievable, Relevant, Time-bound goals'}
                    </p>
                  </div>
                  {!isMentorView ? (
                    <button
                      onClick={() => setShowCreateGoal(true)}
                      className="bg-[#0072CE] hover:bg-[#1A1F5E] text-white px-4 py-2 -lg flex items-center space-x-2 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Create Goal</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2 bg-[#1A1F5E]/10 text-[#1A1F5E] px-4 py-2 -lg text-sm font-medium">
                      <Users className="w-4 h-4" />
                      <span>Goals are set by your mentee</span>
                    </div>
                  )}
                </div>
                {isMentorView && goals.length === 0 && (
                  <div className="bg-[#F4F4F4] border border-[#E5E7EB] -2xl p-8 text-center">
                    <Target className="w-12 h-12 text-[#8C8C8C] mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-[#333333] mb-2">No goals created yet</h3>
                    <p className="text-[#8C8C8C] text-sm">Encourage your mentee to create SMART goals so you can track and guide their progress.</p>
                  </div>
                )}

                {/* Goals List */}
                <div className="space-y-4">
                  {goals.map(goal => (
                    <div key={goal.id} className="bg-gray-50 -xl p-6 border border-gray-200 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">{goal.title}</h3>
                            <span className={`px-3 py-1 -full text-xs font-medium ${
                              goal.priority === 'high' ? 'bg-red-100 text-red-700' :
                              goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {goal.priority} priority
                            </span>
                            <span className={`px-3 py-1 -full text-xs font-medium ${
                              goal.status === 'completed' ? 'bg-green-100 text-green-700' :
                              goal.status === 'in-progress' ? 'bg-[#1A1F5E]/10 text-[#1A1F5E]' :
                              goal.status === 'blocked' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {goal.status}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{goal.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>Mentor: {goal.mentorName}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Due: {new Date(goal.targetDate).toLocaleDateString()}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <CheckCircle className="w-4 h-4" />
                              <span>{goal.milestones.filter(m => m.completed).length}/{goal.milestones.length} milestones</span>
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedGoal(goal)}
                          className="text-[#0072CE] hover:text-[#1A1F5E] ml-4"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                          <span className="text-sm font-bold text-[#0072CE]">{goal.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 -full h-3">
                          <div
                            className="bg-[#1A1F5E] h-3 -full transition-all duration-500"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Milestones Preview */}
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                        {goal.milestones.map(milestone => (
                          <div
                            key={milestone.id}
                            className={`p-3 -lg border-2 cursor-pointer hover:shadow-md transition-shadow ${
                              milestone.completed
                                ? 'bg-green-50 border-green-300'
                                : 'bg-white border-gray-200'
                            }`}
                            onClick={() => handleMilestoneToggle(goal.id, milestone.id)}
                          >
                            <div className="flex items-center space-x-2 mb-1">
                              <input
                                type="checkbox"
                                checked={milestone.completed}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleMilestoneToggle(goal.id, milestone.id);
                                }}
                                className="w-4 h-4 text-green-600  cursor-pointer"
                              />
                              <span className={`text-xs font-medium ${
                                milestone.completed ? 'text-green-900 line-through' : 'text-gray-900'
                              }`}>{milestone.title}</span>
                            </div>
                            <p className="text-xs text-gray-600">
                              {milestone.completed ? 'Completed' : `Due ${new Date(milestone.dueDate).toLocaleDateString()}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PROGRESS REPORTS TAB */}
            {activeTab === 'progress' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Progress Reports</h2>
                    <p className="text-gray-600">
                      {isMentorView
                        ? 'Review your mentee\'s progress reports and add your feedback'
                        : 'Weekly and monthly progress tracking � document your achievements and challenges'}
                    </p>
                  </div>
                  {!isMentorView ? (
                    <button
                      onClick={() => setShowProgressReport(true)}
                      className="bg-[#0072CE] hover:bg-[#1A1F5E] text-white px-4 py-2 -lg flex items-center space-x-2"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Create Report</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2 bg-[#1A1F5E]/10 text-[#1A1F5E] px-4 py-2 -lg text-sm font-medium">
                      <FileText className="w-4 h-4" />
                      <span>Reports are submitted by your mentee</span>
                    </div>
                  )}
                </div>
                {isMentorView && progressReports.length === 0 && (
                  <div className="bg-[#F4F4F4] border border-[#E5E7EB] -2xl p-8 text-center">
                    <BarChart3 className="w-12 h-12 text-[#8C8C8C] mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-[#333333] mb-2">No reports yet</h3>
                    <p className="text-[#8C8C8C] text-sm">Once your mentee submits a progress report, it will appear here for you to review and provide feedback.</p>
                  </div>
                )}

                {/* Reports List */}
                <div className="space-y-4">
                  {progressReports.map(report => {
                    const goal = goals.find(g => g.id === report.goalId);
                    return (
                      <div key={report.id} className="bg-white -xl border border-gray-200 p-6 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{goal?.title}</h3>
                            <p className="text-sm text-gray-600">
                              {report.period === 'weekly' ? 'Weekly Report' : 'Monthly Report'} � 
                              {new Date(report.startDate).toLocaleDateString()} - {new Date(report.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="text-sm text-gray-500">{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span>Achievements</span>
                            </h4>
                            <ul className="space-y-1">
                              {report.achievements.map((achievement, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-start space-x-2">
                                  <span className="text-green-600 mt-0.5">�</span>
                                  <span>{achievement}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                              <AlertCircle className="w-4 h-4 text-yellow-600" />
                              <span>Challenges</span>
                            </h4>
                            <ul className="space-y-1">
                              {report.challenges.map((challenge, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-start space-x-2">
                                  <span className="text-yellow-600 mt-0.5">�</span>
                                  <span>{challenge}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                              <Target className="w-4 h-4 text-[#0072CE]" />
                              <span>Next Steps</span>
                            </h4>
                            <ul className="space-y-1">
                              {report.nextSteps.map((step, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-start space-x-2">
                                  <span className="text-[#0072CE] mt-0.5">�</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {report.mentorFeedback && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-2">Mentor Feedback</h4>
                            <p className="text-sm text-gray-700 bg-[#F4F4F4] p-3 -lg">{report.mentorFeedback}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* LEARNING PATHS TAB */}
            {activeTab === 'learning' && (
              <div className="space-y-6">
                {!selectedLearningPath ? (
                  <>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Learning Paths</h2>
                      <p className="text-gray-600">Structured curricula to develop specific skills with videos and articles</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {learningPaths.map(path => (
                        <div
                          key={path.id}
                          className={`-xl border-2 p-6 hover:shadow-lg transition-all ${
                            path.enrolled ? 'bg-[#0072CE]/10 border-[#0072CE]/40' : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-xl font-semibold text-gray-900">{path.title}</h3>
                                {path.enrolled && (
                                  <span className="bg-[#1A1F5E]/10 text-[#1A1F5E] px-2 py-1 -full text-xs font-medium">
                                    Enrolled
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 text-sm mb-3">{path.description}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{path.duration}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Award className="w-4 h-4" />
                                  <span className="capitalize">{path.level}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <BookOpen className="w-4 h-4" />
                                  <span>{path.modules.length} modules</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {path.enrolled && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Progress</span>
                                <span className="text-sm font-bold text-[#0072CE]">{path.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 -full h-2">
                                <div
                                  className="bg-[#1A1F5E] h-2 -full"
                                  style={{ width: `${path.progress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {path.enrolled && path.modules.length > 0 ? (
                            <div className="space-y-2 mb-4">
                              <h4 className="font-semibold text-gray-900 text-sm mb-2">Modules</h4>
                              {path.modules.slice(0, 3).map(module => (
                                <div
                                  key={module.id}
                                  className={`flex items-center justify-between p-3 -lg ${
                                    module.completed ? 'bg-green-50' : 'bg-white'
                                  }`}
                                >
                                  <div className="flex items-center space-x-3">
                                    {module.completed ? (
                                      <CheckCircle className="w-5 h-5 text-green-600" />
                                    ) : (
                                      <Play className="w-5 h-5 text-gray-400" />
                                    )}
                                    <div>
                                      <p className="font-medium text-gray-900 text-sm">{module.title}</p>
                                      <p className="text-xs text-gray-600">{module.resources.length} resources � {module.duration}</p>
                                    </div>
                                  </div>
                                  {module.assessment && !module.assessment.completed && (
                                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1  text-xs font-medium">
                                      Assessment
                                    </span>
                                  )}
                                </div>
                              ))}
                              {path.modules.length > 3 && (
                                <p className="text-xs text-gray-500 pl-3">+{path.modules.length - 3} more modules</p>
                              )}
                            </div>
                          ) : null}

                          <button
                            onClick={() => {
                              if (path.enrolled) {
                                setSelectedLearningPath(path);
                              } else {
                                alert('?? Enrolled in ' + path.title + '!');
                              }
                            }}
                            className={`w-full py-2 -lg font-medium transition-colors ${
                              path.enrolled
                                ? 'bg-[#0072CE] hover:bg-[#1A1F5E] text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                          >
                            {path.enrolled ? 'Continue Learning' : 'Enroll Now'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  /* DETAILED LEARNING PATH VIEW */
                  <div>
                    <button
                      onClick={() => setSelectedLearningPath(null)}
                      className="mb-4 flex items-center space-x-2 text-[#0072CE] hover:text-[#1A1F5E] font-medium"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      <span>Back to All Paths</span>
                    </button>

                    <div className="bg-[#1A1F5E] -2xl p-8 text-white mb-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h1 className="text-3xl font-bold mb-2">{selectedLearningPath.title}</h1>
                          <p className="text-white/80 mb-4">{selectedLearningPath.description}</p>
                          <div className="flex items-center space-x-6 text-sm">
                            <span className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{selectedLearningPath.duration}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Award className="w-4 h-4" />
                              <span className="capitalize">{selectedLearningPath.level}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <BookOpen className="w-4 h-4" />
                              <span>{selectedLearningPath.modules.length} modules</span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-4xl font-bold mb-1">{selectedLearningPath.progress}%</div>
                          <div className="text-white/80 text-sm">Complete</div>
                        </div>
                      </div>
                      <div className="w-full bg-[#0072CE] -full h-3 mt-6">
                        <div
                          className="bg-white h-3 -full transition-all"
                          style={{ width: `${selectedLearningPath.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Modules List */}
                    <div className="space-y-4">
                      {selectedLearningPath.modules.map((module, idx) => (
                        <div key={module.id} className="bg-white -xl border-2 border-gray-200 overflow-hidden">
                          <button
                            onClick={() => setSelectedModule(selectedModule?.id === module.id ? null : module)}
                            className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4 flex-1">
                                <div className={`flex-shrink-0 w-10 h-10 -full flex items-center justify-center font-bold ${
                                  module.completed ? 'bg-green-100 text-green-700' : 'bg-[#1A1F5E]/10 text-[#1A1F5E]'
                                }`}>
                                  {module.completed ? <CheckCircle className="w-6 h-6" /> : idx + 1}
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{module.title}</h3>
                                  <p className="text-gray-600 text-sm mb-2">{module.description}</p>
                                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span className="flex items-center space-x-1">
                                      <Clock className="w-4 h-4" />
                                      <span>{module.duration}</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                      <BookOpen className="w-4 h-4" />
                                      <span>{module.resources.length} resources</span>
                                    </span>
                                    {module.completed && module.completedDate && (
                                      <span className="text-green-600 text-xs">
                                        ? Completed {new Date(module.completedDate).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <ChevronLeft className={`w-5 h-5 text-gray-400 transform transition-transform ${
                                selectedModule?.id === module.id ? 'rotate-90' : '-rotate-90'
                              }`} />
                            </div>
                          </button>

                          {selectedModule?.id === module.id && (
                            <div className="border-t border-gray-200 bg-gray-50 p-6">
                              <h4 className="font-semibold text-gray-900 mb-4">Learning Resources</h4>
                              <div className="grid gap-4">
                                {module.resources.map(resource => (
                                  <button
                                    key={resource.id}
                                    onClick={() => {
                                      setSelectedResource(resource);
                                      setShowResourceViewer(true);
                                    }}
                                    className="bg-white -lg border border-gray-200 p-4 hover:border-[#0072CE]/40 hover:shadow-md transition-all text-left"
                                  >
                                    <div className="flex items-start space-x-3">
                                      <div className={`flex-shrink-0 w-12 h-12 -lg flex items-center justify-center ${
                                        resource.type === 'video' ? 'bg-red-100' : 'bg-[#1A1F5E]/10'
                                      }`}>
                                        {resource.type === 'video' ? (
                                          <Play className={`w-6 h-6 ${resource.type === 'video' ? 'text-red-600' : 'text-[#0072CE]'}`} />
                                        ) : (
                                          <FileText className="w-6 h-6 text-[#0072CE]" />
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <h5 className="font-medium text-gray-900 mb-1">{resource.title}</h5>
                                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                                          {resource.author && (
                                            <span className="flex items-center space-x-1">
                                              <User className="w-3 h-3" />
                                              <span>{resource.author}</span>
                                            </span>
                                          )}
                                          {resource.duration && (
                                            <span className="flex items-center space-x-1">
                                              <Clock className="w-3 h-3" />
                                              <span>{resource.duration}</span>
                                            </span>
                                          )}
                                          {resource.readTime && (
                                            <span className="flex items-center space-x-1">
                                              <BookOpen className="w-3 h-3" />
                                              <span>{resource.readTime}</span>
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <ChevronLeft className="w-5 h-5 text-gray-400 -rotate-90" />
                                    </div>
                                  </button>
                                ))}
                              </div>

                              {module.assessment && (
                                <div className="mt-4 bg-yellow-50 border border-yellow-200 -lg p-4">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h5 className="font-semibold text-gray-900 mb-1">{module.assessment.title}</h5>
                                      <p className="text-sm text-gray-600 mb-2">
                                        {module.assessment.questions} questions � Passing score: {module.assessment.passingScore}%
                                      </p>
                                      {module.assessment.attempts > 0 && (
                                        <p className="text-xs text-gray-500">
                                          Attempts: {module.assessment.attempts} � Best score: {module.assessment.bestScore}%
                                        </p>
                                      )}
                                    </div>
                                    <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 -lg text-sm font-medium">
                                      {module.assessment.completed ? 'Retake' : 'Start Assessment'}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TEAMS MEETINGS TAB */}
            {activeTab === 'feedback' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-[#1A1F5E]">Teams Meetings</h2>
                    <p className="text-[#8C8C8C]">Scheduled sessions for this mentorship connection</p>
                  </div>
                  <button
                    onClick={() => setShowNewSession(true)}
                    className="bg-[#1A1F5E] text-white font-semibold px-6 py-3 -full transition-all duration-200 hover:opacity-90 hover:scale-105 shadow-lg flex items-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Schedule Session</span>
                  </button>
                </div>

                {sessions.length === 0 ? (
                  <div className="bg-white -3xl shadow-xl p-12 border border-[#E5E7EB] text-center">
                    <div className="w-16 h-16 bg-[#1A1F5E]/10 -full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-[#1A1F5E]" viewBox="0 0 24 24" fill="none">
                        <path d="M17 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V5C19 3.89543 18.1046 3 17 3Z" fill="#5059C9"/>
                        <path d="M9 7H15M9 11H15M9 15H12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-[#333333] mb-2">No sessions scheduled yet</h3>
                    <p className="text-[#8C8C8C] mb-6">Schedule your first Teams meeting to get started</p>
                    <button
                      onClick={() => setShowNewSession(true)}
                      className="bg-[#1A1F5E] text-white font-semibold px-8 py-3 -full hover:opacity-90 transition-all"
                    >
                      Schedule First Session
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session: any) => {
                      const isPast = new Date(session.scheduled_at) < new Date();
                      const statusColor = session.status === 'completed' ? 'bg-green-100 text-green-700'
                        : session.status === 'cancelled' ? 'bg-[#8C8C8C]/10 text-[#8C8C8C]'
                        : isPast ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-[#0072CE]/10 text-[#0072CE]';
                      const statusLabel = session.status === 'completed' ? 'Completed'
                        : session.status === 'cancelled' ? 'Cancelled'
                        : isPast ? 'Past'
                        : 'Scheduled';
                      return (
                        <div key={session.session_id} className="bg-white -3xl shadow-xl p-6 border border-[#E5E7EB]">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-xl font-semibold text-[#333333]">{session.title}</h3>
                                <span className={`px-3 py-1 -full text-xs font-semibold ${statusColor}`}>
                                  {statusLabel}
                                </span>
                              </div>
                              {session.description && (
                                <p className="text-[#8C8C8C] text-sm mb-3">{session.description}</p>
                              )}
                              <div className="flex items-center space-x-6 text-sm text-[#8C8C8C]">
                                <span className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{new Date(session.scheduled_at).toLocaleString()}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Target className="w-4 h-4" />
                                  <span>{session.duration_minutes} min</span>
                                </span>
                              </div>
                            </div>
                            {session.meeting_link && (
                              <a
                                href={session.meeting_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-4 bg-[#1A1F5E] text-white px-5 py-2 -full text-sm font-semibold hover:opacity-90 transition-all flex items-center space-x-2 whitespace-nowrap"
                              >
                                <span>Join Teams</span>
                                <ChevronRight className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* New Session Modal */}
                {showNewSession && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white -3xl shadow-2xl max-w-lg w-full p-8 border border-[#E5E7EB]">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-[#1A1F5E]">Schedule Teams Session</h2>
                        <button onClick={() => setShowNewSession(false)} className="text-[#8C8C8C] hover:text-[#333333]">
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-[#333333] mb-2">Session Title *</label>
                          <input
                            value={newSession.title}
                            onChange={e => setNewSession(s => ({ ...s, title: e.target.value }))}
                            placeholder="e.g. Monthly check-in, Goal review..."
                            className="w-full px-4 py-3 -2xl border-2 border-[#E5E7EB] text-[#333333] placeholder-[#8C8C8C] focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#333333] mb-2">Date & Time *</label>
                          <input
                            type="datetime-local"
                            value={newSession.scheduled_at}
                            onChange={e => setNewSession(s => ({ ...s, scheduled_at: e.target.value }))}
                            className="w-full px-4 py-3 -2xl border-2 border-[#E5E7EB] text-[#333333] focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#333333] mb-2">Duration (minutes)</label>
                          <select
                            value={newSession.duration_minutes}
                            onChange={e => setNewSession(s => ({ ...s, duration_minutes: parseInt(e.target.value) }))}
                            className="w-full px-4 py-3 -2xl border-2 border-[#E5E7EB] text-[#333333] bg-white focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all"
                          >
                            <option value="30">30 minutes</option>
                            <option value="45">45 minutes</option>
                            <option value="60">60 minutes</option>
                            <option value="90">90 minutes</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#333333] mb-2">Teams Meeting Link</label>
                          <input
                            value={newSession.meeting_link}
                            onChange={e => setNewSession(s => ({ ...s, meeting_link: e.target.value }))}
                            placeholder="https://teams.microsoft.com/..."
                            className="w-full px-4 py-3 -2xl border-2 border-[#E5E7EB] text-[#333333] placeholder-[#8C8C8C] focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#333333] mb-2">Description</label>
                          <textarea
                            value={newSession.description}
                            onChange={e => setNewSession(s => ({ ...s, description: e.target.value }))}
                            placeholder="What will you discuss?"
                            rows={2}
                            className="w-full px-4 py-3 -2xl border-2 border-[#E5E7EB] text-[#333333] placeholder-[#8C8C8C] focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all resize-none"
                          />
                        </div>
                        <div className="flex space-x-3 pt-2">
                          <button
                            onClick={() => setShowNewSession(false)}
                            className="flex-1 bg-transparent text-[#1A1F5E] font-semibold px-6 py-3 -full border-2 border-[#1A1F5E] hover:bg-[#1A1F5E] hover:text-white transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleCreateSession}
                            disabled={sessionLoading}
                            className="flex-1 bg-[#1A1F5E] text-white font-semibold px-6 py-3 -full hover:opacity-90 transition-all disabled:opacity-50"
                          >
                            {sessionLoading ? 'Scheduling...' : 'Schedule Session'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Goal Details Modal */}
      {selectedGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white -2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{selectedGoal.title}</h2>
              <button
                onClick={() => setSelectedGoal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* SMART Breakdown */}
              <div className="bg-[#F4F4F4] -xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">SMART Goal Breakdown</h3>
                <div className="grid gap-4">
                  {[
                    { label: 'Specific', value: selectedGoal.specific },
                    { label: 'Measurable', value: selectedGoal.measurable },
                    { label: 'Achievable', value: selectedGoal.achievable },
                    { label: 'Relevant', value: selectedGoal.relevant },
                    { label: 'Time-bound', value: selectedGoal.timeBound }
                  ].map(item => (
                    <div key={item.label}>
                      <h4 className="font-medium text-[#1A1F5E] text-sm mb-1">{item.label}</h4>
                      <p className="text-gray-700 text-sm">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestones */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Milestones & Tasks</h3>
                <div className="space-y-3">
                  {selectedGoal.milestones.map(milestone => (
                    <div key={milestone.id} className="border border-gray-200 -lg">
                      <button
                        onClick={() => setExpandedMilestone(expandedMilestone === milestone.id ? null : milestone.id)}
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={milestone.completed}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleMilestoneToggle(selectedGoal.id, milestone.id);
                            }}
                            className="w-5 h-5 text-green-600  cursor-pointer"
                          />
                          <div className="text-left">
                            <h4 className={`font-medium ${
                              milestone.completed ? 'text-green-900 line-through' : 'text-gray-900'
                            }`}>{milestone.title}</h4>
                            <p className="text-sm text-gray-600">
                              {milestone.completed 
                                ? `Completed ${new Date(milestone.completedDate!).toLocaleDateString()}`
                                : `Due ${new Date(milestone.dueDate).toLocaleDateString()}`
                              }
                            </p>
                          </div>
                        </div>
                        {expandedMilestone === milestone.id ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </button>

                      {expandedMilestone === milestone.id && (
                        <div className="p-4 pt-0 border-t border-gray-200 bg-gray-50">
                          <p className="text-sm text-gray-600 mb-3">{milestone.description}</p>
                          <div className="space-y-2">
                            {milestone.tasks.map(task => (
                              <div
                                key={task.id}
                                className="flex items-center space-x-3 bg-white p-3 -lg hover:shadow-sm transition-shadow"
                              >
                                <input
                                  type="checkbox"
                                  checked={task.completed}
                                  onChange={() => handleTaskToggle(task.id, milestone.id, task.id)}
                                  className="w-4 h-4 text-[#0072CE]  cursor-pointer"
                                />
                                <span className={`flex-1 text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                  {task.title}
                                </span>
                                <span className={`text-xs px-2 py-1  ${
                                  task.assignedTo === 'mentee' ? 'bg-[#1A1F5E]/10 text-[#1A1F5E]' : 'bg-[#1A1F5E]/10 text-[#1A1F5E]'
                                }`}>
                                  {task.assignedTo}
                                </span>
                                {task.completed && task.completedDate && (
                                  <span className="text-xs text-green-600 flex items-center">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    {new Date(task.completedDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESOURCES & GUIDES TAB */}
      {activeTab === 'resources' && (
        <div className="max-w-[1920px] mx-auto px-12 sm:px-16 lg:px-20 py-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="h-1 w-12 bg-[#E83E2D] -full mb-4" />
                <h2 className="text-3xl font-bold text-[#1A1F5E]">Resources & Guides</h2>
                <p className="text-[#8C8C8C] mt-2">
                  {isMentorView
                    ? 'Upload guides, articles, and videos to support your mentee\'s development'
                    : 'Learning materials provided by your mentor � browse and download'}
                </p>
              </div>
              {isMentorView && (
                <button
                  onClick={() => setShowUploadResource(true)}
                  className="bg-[#1A1F5E] text-white font-semibold px-6 py-3 -full flex items-center space-x-2 hover:opacity-90 hover:scale-105 transition-all shadow-lg"
                >
                  <Upload className="w-5 h-5" />
                  <span>Upload Resource</span>
                </button>
              )}
            </div>

            {/* Search */}
            <input
              value={resourceSearch}
              onChange={e => setResourceSearch(e.target.value)}
              placeholder="Search resources..."
              className="w-full max-w-md px-4 py-3 -2xl border-2 border-[#E5E7EB] text-[#333333] placeholder-[#8C8C8C] bg-white focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all"
            />

            {/* Resource Grid */}
            {dbResources.filter(r =>
              !resourceSearch || r.title?.toLowerCase().includes(resourceSearch.toLowerCase()) || r.description?.toLowerCase().includes(resourceSearch.toLowerCase())
            ).length === 0 ? (
              <div className="bg-white -3xl shadow-xl p-12 border border-[#E5E7EB] text-center">
                <BookOpen className="w-12 h-12 text-[#8C8C8C] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#333333] mb-2">
                  {resourceSearch ? 'No results found' : isMentorView ? 'No resources uploaded yet' : 'No resources available yet'}
                </h3>
                <p className="text-[#8C8C8C] mb-4">
                  {resourceSearch ? 'Try a different search term' : isMentorView
                    ? 'Upload guides, articles, or videos to help your mentee grow.'
                    : 'Your mentor hasn\'t uploaded any resources yet. Check back soon.'}
                </p>
                {isMentorView && !resourceSearch && (
                  <button
                    onClick={() => setShowUploadResource(true)}
                    className="bg-[#1A1F5E] text-white font-semibold px-6 py-3 -full hover:opacity-90 transition-all shadow-lg"
                  >
                    Upload Your First Resource
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dbResources
                  .filter(r => !resourceSearch || r.title?.toLowerCase().includes(resourceSearch.toLowerCase()) || r.description?.toLowerCase().includes(resourceSearch.toLowerCase()))
                  .map((resource: any) => {
                    const typeIconBg = resource.type === 'video' ? 'bg-red-100' : resource.type === 'article' ? 'bg-[#0072CE]/10' : 'bg-green-100';
                    const typeIconColor = resource.type === 'video' ? 'text-red-600' : resource.type === 'article' ? 'text-[#0072CE]' : 'text-green-600';
                    const TypeIcon = resource.type === 'video' ? Play : resource.type === 'article' ? FileText : BookOpen;
                    return (
                      <a
                        key={resource.id}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white -3xl shadow-xl p-6 border-t-4 border-t-[#1A1F5E] border border-[#E5E7EB] hover:shadow-2xl transition-shadow duration-300 flex flex-col"
                      >
                        <div className="flex items-start space-x-4 mb-4">
                          <div className={`flex-shrink-0 w-12 h-12 ${typeIconBg} -2xl flex items-center justify-center`}>
                            <TypeIcon className={`w-6 h-6 ${typeIconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-[#333333] mb-1 line-clamp-2">{resource.title}</h3>
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 -full text-xs font-semibold bg-[#1A1F5E]/10 text-[#1A1F5E] capitalize">{resource.type}</span>
                              {resource.category && (
                                <span className="px-2 py-0.5 -full text-xs font-semibold bg-[#F4F4F4] text-[#8C8C8C]">{resource.category}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {resource.description && (
                          <p className="text-[#8C8C8C] text-sm leading-relaxed mb-4 flex-1 line-clamp-3">{resource.description}</p>
                        )}
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#E5E7EB]">
                          <span className="text-xs text-[#8C8C8C]">by {resource.uploadedBy || 'Forvis Mazars'}</span>
                          <span className="text-[#0072CE] text-sm font-semibold flex items-center space-x-1">
                            {isMentorView ? (
                              <><span>View</span><ChevronRight className="w-4 h-4" /></>
                            ) : (
                              <><Download className="w-4 h-4" /><span>Download / Open</span></>
                            )}
                          </span>
                        </div>
                      </a>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* UPLOAD RESOURCE MODAL (Mentor only) */}
      {showUploadResource && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white -3xl max-w-xl w-full shadow-2xl border border-[#E5E7EB]">
            <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between bg-[#1A1F5E] -t-3xl">
              <div>
                <h2 className="text-2xl font-bold text-white">Upload Resource</h2>
                <p className="text-white/80 text-sm mt-1">Share a guide, article, or video with your mentee</p>
              </div>
              <button onClick={() => { setShowUploadResource(false); setNewResource({ title: '', description: '', url: '', type: 'article', category: '' }); setUploadMode('url'); setPickedFile(null); }} className="text-white hover:text-white/70 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-2">Resource Title *</label>
                <input
                  type="text"
                  value={newResource.title}
                  onChange={e => setNewResource(r => ({ ...r, title: e.target.value }))}
                  placeholder="e.g., Introduction to Leadership Frameworks"
                  className="w-full px-4 py-3 -2xl border-2 border-[#E5E7EB] text-[#333333] placeholder-[#8C8C8C] bg-white focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#333333] mb-2">Type *</label>
                  <select
                    value={newResource.type}
                    onChange={e => setNewResource(r => ({ ...r, type: e.target.value as any }))}
                    className="w-full px-4 py-3 -2xl border-2 border-[#E5E7EB] text-[#333333] bg-white focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all"
                  >
                    <option value="article">Article / PDF</option>
                    <option value="video">Video</option>
                    <option value="guide">Guide / Template</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#333333] mb-2">Category</label>
                  <input
                    type="text"
                    value={newResource.category}
                    onChange={e => setNewResource(r => ({ ...r, category: e.target.value }))}
                    placeholder="e.g., Leadership, Technical"
                    className="w-full px-4 py-3 -2xl border-2 border-[#E5E7EB] text-[#333333] placeholder-[#8C8C8C] bg-white focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all"
                  />
                </div>
              </div>
              {/* Source toggle */}
              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-2">Source *</label>
                <div className="flex -full border-2 border-[#E5E7EB] overflow-hidden mb-3">
                  <button
                    type="button"
                    onClick={() => { setUploadMode('url'); setPickedFile(null); }}
                    className={`flex-1 py-2.5 text-sm font-semibold transition-all ${
                      uploadMode === 'url'
                        ? 'bg-[#1A1F5E] text-white'
                        : 'bg-white text-[#8C8C8C] hover:text-[#333333]'
                    }`}
                  >
                    Paste a Link
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUploadMode('file'); setNewResource(r => ({ ...r, url: '' })); }}
                    className={`flex-1 py-2.5 text-sm font-semibold transition-all ${
                      uploadMode === 'file'
                        ? 'bg-[#1A1F5E] text-white'
                        : 'bg-white text-[#8C8C8C] hover:text-[#333333]'
                    }`}
                  >
                    Upload File
                  </button>
                </div>

                {uploadMode === 'url' ? (
                  <input
                    type="url"
                    value={newResource.url}
                    onChange={e => setNewResource(r => ({ ...r, url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-4 py-3 -2xl border-2 border-[#E5E7EB] text-[#333333] placeholder-[#8C8C8C] bg-white focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all"
                  />
                ) : (
                  <div>
                    <label
                      htmlFor="resource-file-input"
                      className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed -2xl cursor-pointer transition-all ${
                        pickedFile ? 'border-[#1A1F5E] bg-[#1A1F5E]/5' : 'border-[#E5E7EB] bg-[#F4F4F4] hover:border-[#1A1F5E]/50'
                      }`}
                    >
                      {pickedFile ? (
                        <>
                          <svg className="w-8 h-8 text-[#1A1F5E] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          <span className="text-sm font-semibold text-[#1A1F5E]">{pickedFile.name}</span>
                          <span className="text-xs text-[#8C8C8C] mt-1">{(pickedFile.size / (1024 * 1024)).toFixed(2)} MB — click to change</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-8 h-8 text-[#8C8C8C] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                          <span className="text-sm font-semibold text-[#333333]">Click to browse or drag & drop</span>
                          <span className="text-xs text-[#8C8C8C] mt-1">PDF, Word, PowerPoint, images, video — max 50 MB</span>
                        </>
                      )}
                    </label>
                    <input
                      id="resource-file-input"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.zip"
                      onChange={e => setPickedFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-2">Description</label>
                <textarea
                  rows={3}
                  value={newResource.description}
                  onChange={e => setNewResource(r => ({ ...r, description: e.target.value }))}
                  placeholder="Brief description of what this resource covers..."
                  className="w-full px-4 py-3 -2xl border-2 border-[#E5E7EB] text-[#333333] placeholder-[#8C8C8C] bg-white focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all resize-none"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadResource(false);
                    setNewResource({ title: '', description: '', url: '', type: 'article', category: '' });
                    setUploadMode('url');
                    setPickedFile(null);
                  }}
                  className="flex-1 bg-transparent text-[#1A1F5E] font-semibold px-6 py-3 -full border-2 border-[#1A1F5E] hover:bg-[#1A1F5E] hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={async () => {
                    if (!newResource.title) { alert('Please enter a title.'); return; }
                    if (uploadMode === 'url' && !newResource.url) { alert('Please paste a URL.'); return; }
                    if (uploadMode === 'file' && !pickedFile) { alert('Please choose a file to upload.'); return; }
                    try {
                      setUploading(true);
                      const token = localStorage.getItem('token');
                      let savedResource: any;

                      if (uploadMode === 'file' && pickedFile) {
                        // Multipart upload to Azure Blob Storage
                        const fd = new FormData();
                        fd.append('file', pickedFile);
                        fd.append('title', newResource.title);
                        fd.append('type', newResource.type);
                        fd.append('category', newResource.category || 'General');
                        fd.append('description', newResource.description || '');
                        if (activeConnectionId) fd.append('connection_id', String(activeConnectionId));
                        const res = await fetch('/api/resources/upload', {
                          method: 'POST',
                          headers: { Authorization: `Bearer ${token}` },
                          body: fd,
                        });
                        const data = await res.json();
                        if (!data.success) throw new Error(data.message || 'Upload failed');
                        savedResource = { ...data.data, uploadedBy: data.data.uploadedBy || 'Forvis Mazars' };
                      } else {
                        // URL-based resource
                        const res = await fetch('/api/resources', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                          body: JSON.stringify({ ...newResource, connection_id: activeConnectionId }),
                        });
                        const data = await res.json();
                        if (!data.success) throw new Error(data.message || 'Failed to save resource');
                        savedResource = { ...newResource, id: data.data?.id, uploadedBy: 'Forvis Mazars' };
                      }

                      setDbResources((prev: any[]) => [savedResource, ...prev]);
                      setShowUploadResource(false);
                      setNewResource({ title: '', description: '', url: '', type: 'article', category: '' });
                      setUploadMode('url');
                      setPickedFile(null);
                      alert('✓ Resource saved successfully!');
                    } catch (err: any) {
                      alert(err.message || 'Failed to upload resource. Please check your connection.');
                    } finally {
                      setUploading(false);
                    }
                  }}
                  className="flex-1 bg-[#1A1F5E] text-white font-semibold px-6 py-3 -full hover:opacity-90 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading…' : 'Upload Resource'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUIZ MANAGER MODAL (Mentor only) */}
      {showQuizManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white -3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E5E7EB]">
            <div className="sticky top-0 p-6 border-b border-[#E5E7EB] flex items-center justify-between bg-[#1A1F5E] -t-3xl z-10">
              <div>
                <h2 className="text-2xl font-bold text-white">Manage Quiz Questions</h2>
                <p className="text-white/80 text-sm mt-1">Choose which questions appear in your mentee's Mentorship Challenge</p>
              </div>
              <button onClick={() => setShowQuizManager(false)} className="text-white hover:text-white/70 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Active count banner */}
              <div className="flex items-center justify-between bg-[#0072CE]/10 border border-[#0072CE]/30 -2xl px-5 py-3">
                <span className="text-[#1A1F5E] font-semibold text-sm">{activeQuestionIds.length} of {gameQuestions.length + customQuestions.length} questions active</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveQuestionIds([...gameQuestions.map(q => q.id), ...customQuestions.map(q => q.id)])}
                    className="text-xs font-semibold text-[#0072CE] hover:underline"
                  >
                    Select all
                  </button>
                  <span className="text-[#8C8C8C]">�</span>
                  <button
                    onClick={() => setActiveQuestionIds([])}
                    className="text-xs font-semibold text-[#E83E2D] hover:underline"
                  >
                    Clear all
                  </button>
                </div>
              </div>

              {/* Built-in questions */}
              <div>
                <h3 className="text-sm font-bold text-[#8C8C8C] uppercase tracking-wide mb-3">Built-in Questions</h3>
                <div className="space-y-3">
                  {gameQuestions.map(q => {
                    const isActive = activeQuestionIds.includes(q.id);
                    return (
                      <div
                        key={q.id}
                        onClick={() => setActiveQuestionIds(prev => isActive ? prev.filter(id => id !== q.id) : [...prev, q.id])}
                        className={`flex items-start gap-4 p-4 -2xl border-2 cursor-pointer transition-all ${isActive ? 'border-[#1A1F5E] bg-[#1A1F5E]/5' : 'border-[#E5E7EB] bg-white hover:border-[#0072CE]/40'}`}
                      >
                        <div className={`flex-shrink-0 w-6 h-6 -full border-2 flex items-center justify-center mt-0.5 ${isActive ? 'border-[#1A1F5E] bg-[#1A1F5E]' : 'border-[#8C8C8C]'}`}>
                          {isActive && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#333333] mb-1">{q.question}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 -full bg-[#1A1F5E]/10 text-[#1A1F5E] font-medium">{q.category}</span>
                            <span className="text-xs text-[#8C8C8C]">Answer: {q.options[q.correctAnswer]}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom questions */}
              {customQuestions.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-[#8C8C8C] uppercase tracking-wide mb-3">Your Custom Questions</h3>
                  <div className="space-y-3">
                    {customQuestions.map(q => {
                      const isActive = activeQuestionIds.includes(q.id);
                      return (
                        <div
                          key={q.id}
                          className={`flex items-start gap-4 p-4 -2xl border-2 cursor-pointer transition-all ${isActive ? 'border-[#E83E2D] bg-[#E83E2D]/5' : 'border-[#E5E7EB] bg-white hover:border-[#E83E2D]/40'}`}
                          onClick={() => setActiveQuestionIds(prev => isActive ? prev.filter(id => id !== q.id) : [...prev, q.id])}
                        >
                          <div className={`flex-shrink-0 w-6 h-6 -full border-2 flex items-center justify-center mt-0.5 ${isActive ? 'border-[#E83E2D] bg-[#E83E2D]' : 'border-[#8C8C8C]'}`}>
                            {isActive && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#333333] mb-1">{q.question}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-0.5 -full bg-[#E83E2D]/10 text-[#E83E2D] font-medium">Custom</span>
                              <span className="text-xs text-[#8C8C8C]">Answer: {q.options[q.correctAnswer]}</span>
                            </div>
                          </div>
                          <button
                            onClick={e => { e.stopPropagation(); setCustomQuestions(prev => prev.filter(cq => cq.id !== q.id)); setActiveQuestionIds(prev => prev.filter(id => id !== q.id)); }}
                            className="text-[#8C8C8C] hover:text-[#E83E2D] transition-colors flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add custom question */}
              <div className="bg-[#F4F4F4] -2xl p-6 border border-[#E5E7EB]">
                <h3 className="text-sm font-bold text-[#333333] mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#0072CE]" />
                  Add a Custom Question
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newCustomQ.question}
                    onChange={e => setNewCustomQ(q => ({ ...q, question: e.target.value }))}
                    placeholder="Question text..."
                    className="w-full px-4 py-3 -2xl border-2 border-[#E5E7EB] text-[#333333] placeholder-[#8C8C8C] bg-white focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {newCustomQ.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={newCustomQ.correctAnswer === i}
                          onChange={() => setNewCustomQ(q => ({ ...q, correctAnswer: i }))}
                          className="text-[#1A1F5E] flex-shrink-0"
                          title="Mark as correct answer"
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={e => { const opts = [...newCustomQ.options]; opts[i] = e.target.value; setNewCustomQ(q => ({ ...q, options: opts })); }}
                          placeholder={`Option ${i + 1}${i === newCustomQ.correctAnswer ? ' ? correct' : ''}`}
                          className="flex-1 px-3 py-2 -xl border-2 border-[#E5E7EB] text-[#333333] placeholder-[#8C8C8C] bg-white focus:outline-none focus:border-[#1A1F5E] transition-all text-xs"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newCustomQ.category}
                      onChange={e => setNewCustomQ(q => ({ ...q, category: e.target.value }))}
                      placeholder="Category (e.g. Leadership)"
                      className="px-3 py-2 -xl border-2 border-[#E5E7EB] text-[#333333] placeholder-[#8C8C8C] bg-white focus:outline-none focus:border-[#1A1F5E] transition-all text-xs"
                    />
                    <input
                      type="text"
                      value={newCustomQ.explanation}
                      onChange={e => setNewCustomQ(q => ({ ...q, explanation: e.target.value }))}
                      placeholder="Explanation (optional)"
                      className="px-3 py-2 -xl border-2 border-[#E5E7EB] text-[#333333] placeholder-[#8C8C8C] bg-white focus:outline-none focus:border-[#1A1F5E] transition-all text-xs"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (!newCustomQ.question.trim() || newCustomQ.options.some(o => !o.trim())) {
                        alert('Please fill in the question and all 4 options.');
                        return;
                      }
                      const id = Date.now();
                      const q: GameQuestion = { id, question: newCustomQ.question, options: newCustomQ.options, correctAnswer: newCustomQ.correctAnswer, category: newCustomQ.category || 'Custom', explanation: newCustomQ.explanation };
                      setCustomQuestions(prev => [...prev, q]);
                      setActiveQuestionIds(prev => [...prev, id]);
                      setNewCustomQ({ question: '', options: ['', '', '', ''], correctAnswer: 0, category: '', explanation: '' });
                    }}
                    className="bg-[#1A1F5E] text-white font-semibold px-5 py-2 -full text-sm hover:opacity-90 transition-all"
                  >
                    Add Question
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowQuizManager(false)}
                  className="flex-1 bg-transparent text-[#1A1F5E] font-semibold px-6 py-3 -full border-2 border-[#1A1F5E] hover:bg-[#1A1F5E] hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setShowQuizManager(false); alert(`? Quiz updated � ${activeQuestionIds.length} questions active for your mentee.`); }}
                  className="flex-1 bg-[#1A1F5E] text-white font-semibold px-6 py-3 -full hover:opacity-90 transition-all shadow-lg"
                >
                  Save Quiz Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REFLECTION BOARD TAB */}
      {activeTab === 'reflections' && (
        <div className="max-w-[1920px] mx-auto px-12 sm:px-16 lg:px-20 py-8">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Reflection Board</h2>
                <p className="text-gray-600">
                  {isMentorView
                    ? 'Read your mentee\'s reflections � their growth journey, insights, and session takeaways'
                    : 'Your private space to record reflections and growth insights from each session'}
                </p>
              </div>
              {!isMentorView && (
                <button
                  onClick={() => setShowReflectionBoard(true)}
                  className="bg-[#1A1F5E] hover:opacity-90 text-white px-6 py-3 -lg font-semibold hover:shadow-lg transition-all flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>New Reflection</span>
                </button>
              )}
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-[#F4F4F4] to-[#F4F4F4] -xl p-6 border-2 border-[#0072CE]/30">
                <div className="text-4xl font-bold text-[#1A1F5E] mb-2">{reflections.length}</div>
                <div className="text-sm font-medium text-gray-700">Reflections Posted</div>
              </div>
              <div className="bg-gradient-to-br from-[#F4F4F4] to-[#F4F4F4] -xl p-6 border-2 border-[#0072CE]/30">
                <div className="text-4xl font-bold text-[#1A1F5E] mb-2">{sessions.length}</div>
                <div className="text-sm font-medium text-gray-700">Sessions Scheduled</div>
              </div>
              <div className="bg-[#F4F4F4] -xl p-6 border-2 border-[#E5E7EB]">
                <div className="text-4xl font-bold text-green-900 mb-2">{goals.filter(g => g.status === 'completed').length}</div>
                <div className="text-sm font-medium text-gray-700">Goals Completed</div>
              </div>
              <div className="bg-[#F4F4F4] -xl p-6 border-2 border-[#E5E7EB]">
                <div className="text-4xl font-bold text-blue-900 mb-2">24</div>
                <div className="text-sm font-medium text-gray-700">Days Active</div>
              </div>
            </div>

            {/* Sample Reflections */}
            <div className="space-y-6">
              {/* User Created Reflections */}
              {reflections.map((reflection) => (
                <div key={reflection.id} className="bg-[#F4F4F4] -xl shadow-lg border-2 border-[#E5E7EB] overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-12 h-12 bg-[#1A1F5E] -full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">YOU</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-bold text-gray-900">{reflection.author}</h4>
                          <span className="px-3 py-1 bg-[#1A1F5E]/10 text-[#1A1F5E] -full text-xs font-medium">
                            {reflection.category.replace('-', ' ')}
                          </span>
                          <span className="text-sm text-gray-500">{reflection.timestamp}</span>
                        </div>
                        {reflection.sessionRating > 0 && (
                          <div className="flex items-center space-x-2 mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${
                                i < reflection.sessionRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{reflection.title}</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {reflection.content}
                    </p>

                    {reflection.keyTakeaways.filter((t: string) => t.trim() !== '').length > 0 && (
                      <div className="bg-white border-l-4 border-[#1A1F5E] -r-lg p-4 mb-4">
                        <h4 className="font-semibold text-[#1A1F5E] mb-2 flex items-center">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Key Takeaways
                        </h4>
                        <ul className="space-y-1">
                          {reflection.keyTakeaways.filter((t: string) => t.trim() !== '').map((takeaway: string, idx: number) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start">
                              <span className="text-[#1A1F5E] mr-2">?</span>
                              <span>{takeaway}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {reflection.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {reflection.tags.map((tag: string, idx: number) => (
                          <span key={idx} className="px-3 py-1 bg-[#1A1F5E]/10 text-[#1A1F5E] -full text-xs font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {reflections.length === 0 && (
                <div className="bg-[#F4F4F4] border-2 border-[#E5E7EB] -xl p-8 text-center">
                  <Lightbulb className="w-16 h-16 text-[#1A1F5E] mx-auto mb-4" />
                  {isMentorView ? (
                    <>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">No reflections yet</h3>
                      <p className="text-gray-600 max-w-2xl mx-auto">
                        Your mentee hasn't written any reflections yet. Encourage them to share insights after each session.
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Ready to reflect on your latest session?</h3>
                      <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                        Reflections help you process learnings, track growth, and strengthen your mentorship relationship.
                        Share insights, challenges, or breakthroughs from your sessions.
                      </p>
                      <button
                        onClick={() => setShowReflectionBoard(true)}
                        className="bg-[#1A1F5E] hover:opacity-90 text-white px-8 py-3 -lg font-semibold hover:shadow-lg transition-all inline-flex items-center space-x-2"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Write a Reflection</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE PROGRESS REPORT MODAL */}
      {showProgressReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white -2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-[#1A1F5E]">
              <div>
                <h2 className="text-2xl font-bold text-white">Mentee Progress Report</h2>
                <p className="text-green-100 text-sm">Document mentee's achievements and challenges</p>
              </div>
              <button
                onClick={() => setShowProgressReport(false)}
                className="text-white hover:text-green-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8">
              <form className="space-y-6">
                {/* Goal Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Select Goal *
                  </label>
                  <select 
                    value={newReport.goalId} 
                    onChange={(e) => setNewReport({...newReport, goalId: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-green-500 focus:border-[#1A1F5E]"
                  >
                    <option value="">Choose a goal to report on...</option>
                    {goals.map(goal => (
                      <option key={goal.id} value={goal.id}>
                        {goal.title} - {goal.progress}% complete
                      </option>
                    ))}
                  </select>
                  {newReport.goalId && (
                    <div className="mt-3 p-4 bg-[#F4F4F4] border border-[#0072CE]/30 -lg">
                      {(() => {
                        const selectedGoal = goals.find(g => g.id === newReport.goalId);
                        return selectedGoal ? (
                          <div>
                            <p className="text-sm font-medium text-[#1A1F5E] mb-1">Goal Context:</p>
                            <p className="text-sm text-[#1A1F5E]">{selectedGoal.description}</p>
                            <div className="mt-2 flex items-center space-x-4 text-xs text-[#1A1F5E]">
                              <span className="flex items-center">
                                <Target className="w-3 h-3 mr-1" />
                                Progress: {selectedGoal.progress}%
                              </span>
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                Due: {new Date(selectedGoal.targetDate).toLocaleDateString()}
                              </span>
                              <span className={`px-2 py-0.5  ${
                                selectedGoal.status === 'completed' ? 'bg-green-100 text-green-700' :
                                selectedGoal.status === 'in-progress' ? 'bg-[#1A1F5E]/10 text-[#1A1F5E]' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {selectedGoal.status}
                              </span>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {/* Period */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Report Period *
                    </label>
                    <select 
                      value={newReport.period} 
                      onChange={(e) => setNewReport({...newReport, period: e.target.value as 'weekly' | 'monthly'})}
                      className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-green-500 focus:border-[#1A1F5E]"
                    >
                      <option value="weekly">?? Weekly Report</option>
                      <option value="monthly">?? Monthly Report</option>
                    </select>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={newReport.startDate}
                      onChange={(e) => setNewReport({...newReport, startDate: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-green-500 focus:border-[#1A1F5E]"
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={newReport.endDate}
                      onChange={(e) => setNewReport({...newReport, endDate: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-green-500 focus:border-[#1A1F5E]"
                    />
                  </div>
                </div>

                {/* Achievements */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    ?? Mentee's Key Achievements
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newReport.achievements[0]}
                      onChange={(e) => setNewReport({...newReport, achievements: [e.target.value, newReport.achievements[1], newReport.achievements[2]]})}
                      placeholder="Achievement 1 (e.g., Mentee completed milestone X)"
                      className="w-full px-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-green-500 focus:border-[#1A1F5E]"
                    />
                    <input
                      type="text"
                      value={newReport.achievements[1]}
                      onChange={(e) => setNewReport({...newReport, achievements: [newReport.achievements[0], e.target.value, newReport.achievements[2]]})}
                      placeholder="Achievement 2"
                      className="w-full px-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-green-500 focus:border-[#1A1F5E]"
                    />
                    <input
                      type="text"
                      value={newReport.achievements[2]}
                      onChange={(e) => setNewReport({...newReport, achievements: [newReport.achievements[0], newReport.achievements[1], e.target.value]})}
                      placeholder="Achievement 3"
                      className="w-full px-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-green-500 focus:border-[#1A1F5E]"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">What did the mentee accomplish during this period?</p>
                </div>

                {/* Challenges */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    ?? Challenges Faced by Mentee
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newReport.challenges[0]}
                      onChange={(e) => setNewReport({...newReport, challenges: [e.target.value, newReport.challenges[1]]})}
                      placeholder="Challenge 1 (e.g., Mentee struggling with time management)"
                      className="w-full px-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-green-500 focus:border-[#1A1F5E]"
                    />
                    <input
                      type="text"
                      value={newReport.challenges[1]}
                      onChange={(e) => setNewReport({...newReport, challenges: [newReport.challenges[0], e.target.value]})}
                      placeholder="Challenge 2"
                      className="w-full px-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-green-500 focus:border-[#1A1F5E]"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">What obstacles did the mentee encounter?</p>
                </div>

                {/* Next Steps */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    ?? Recommended Next Steps for Mentee
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newReport.nextSteps[0]}
                      onChange={(e) => setNewReport({...newReport, nextSteps: [e.target.value, newReport.nextSteps[1], newReport.nextSteps[2]]})}
                      placeholder="Next step 1 (e.g., Recommend mentee focus on milestone Y)"
                      className="w-full px-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-green-500 focus:border-[#1A1F5E]"
                    />
                    <input
                      type="text"
                      value={newReport.nextSteps[1]}
                      onChange={(e) => setNewReport({...newReport, nextSteps: [newReport.nextSteps[0], e.target.value, newReport.nextSteps[2]]})}
                      placeholder="Next step 2"
                      className="w-full px-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-green-500 focus:border-[#1A1F5E]"
                    />
                    <input
                      type="text"
                      value={newReport.nextSteps[2]}
                      onChange={(e) => setNewReport({...newReport, nextSteps: [newReport.nextSteps[0], newReport.nextSteps[1], e.target.value]})}
                      placeholder="Next step 3"
                      className="w-full px-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-green-500 focus:border-[#1A1F5E]"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">What are the recommended action items for the mentee's next period?</p>
                </div>

                {/* Overall Feedback */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    ?? Mentor's Overall Assessment
                  </label>
                  <textarea
                    rows={4}
                    value={newReport.menteeFeedback}
                    onChange={(e) => setNewReport({...newReport, menteeFeedback: e.target.value})}
                    placeholder="Share your observations on the mentee's progress, growth areas, strengths demonstrated, and recommendations for continued development..."
                    className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-green-500 focus:border-[#1A1F5E] resize-none"
                  />
                </div>

                {/* Goal Progress Preview */}
                {newReport.goalId && (
                  <div className="bg-[#F4F4F4] border-2 border-[#E5E7EB] -xl p-6">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                      <BarChart3 className="w-5 h-5 text-green-600 mr-2" />
                      Goal Progress Snapshot
                    </h3>
                    {(() => {
                      const selectedGoal = goals.find(g => g.id === newReport.goalId);
                      if (!selectedGoal) return null;
                      
                      return (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Overall Progress</span>
                            <span className="text-lg font-bold text-green-700">{selectedGoal.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 -full h-3">
                            <div 
                              className="bg-[#1A1F5E] h-3 -full transition-all"
                              style={{ width: `${selectedGoal.progress}%` }}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="bg-white -lg p-3">
                              <p className="text-xs text-gray-600 mb-1">Milestones</p>
                              <p className="text-lg font-bold text-gray-900">
                                {selectedGoal.milestones.filter(m => m.completed).length} / {selectedGoal.milestones.length}
                              </p>
                            </div>
                            <div className="bg-white -lg p-3">
                              <p className="text-xs text-gray-600 mb-1">Status</p>
                              <p className={`text-sm font-semibold ${
                                selectedGoal.status === 'completed' ? 'text-green-700' :
                                selectedGoal.status === 'in-progress' ? 'text-[#1A1F5E]' :
                                'text-gray-700'
                              }`}>
                                {selectedGoal.status}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowProgressReport(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 -lg font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateReport}
                    className="flex-1 bg-[#1A1F5E] hover:from-green-700 hover:to-teal-700 text-white px-6 py-3 -lg font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Create Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CREATE GOAL MODAL */}
      {showCreateGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white -2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-[#1A1F5E]">
              <div>
                <h2 className="text-2xl font-bold text-white">Create SMART Goal</h2>
                <p className="text-white/80 text-sm">Specific, Measurable, Achievable, Relevant, Time-bound</p>
              </div>
              <button
                onClick={() => setShowCreateGoal(false)}
                className="text-white hover:text-white/80 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8">
              <form className="space-y-6">
                {/* Goal Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Goal Title *
                  </label>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                    placeholder="e.g., Improve Public Speaking Skills"
                    className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                  />
                  <p className="text-xs text-gray-500 mt-1">Be specific and clear about what you want to achieve</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Description *
                  </label>
                  <textarea
                    rows={4}
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                    placeholder="Describe your goal in detail. What will you accomplish? Why is this important?"
                    className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E] resize-none"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Category *
                    </label>
                    <select 
                      value={newGoal.category} 
                      onChange={(e) => setNewGoal({...newGoal, category: e.target.value as any})}
                      className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                    >
                      <option value="technical">Technical Skills</option>
                      <option value="leadership">Leadership & Management</option>
                      <option value="career">Career Development</option>
                      <option value="personal">Personal Growth</option>
                      <option value="skill">Skill Development</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Priority *
                    </label>
                    <select 
                      value={newGoal.priority} 
                      onChange={(e) => setNewGoal({...newGoal, priority: e.target.value as any})}
                      className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                    >
                      <option value="high">?? High Priority</option>
                      <option value="medium">?? Medium Priority</option>
                      <option value="low">?? Low Priority</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Target Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Target Date *
                    </label>
                    <input
                      type="date"
                      value={newGoal.targetDate}
                      onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                    />
                    <p className="text-xs text-gray-500 mt-1">When do you want to achieve this goal?</p>
                  </div>

                  {/* Review Frequency */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Review Frequency
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]">
                      <option value="weekly" selected>Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                  </div>
                </div>

                {/* Measurable Metrics */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    How will you measure success? *
                  </label>
                  <textarea
                    rows={3}
                    value={newGoal.measurable}
                    onChange={(e) => setNewGoal({...newGoal, measurable: e.target.value})}
                    placeholder="e.g., Present at 3 team meetings, Receive positive feedback from 5+ colleagues, Complete a public speaking course"
                    className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E] resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Define specific, measurable criteria for success</p>
                </div>

                {/* Action Steps */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Key Action Steps (Milestones)
                  </label>
                  <div className="space-y-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={newGoal.actionSteps[0]}
                        onChange={(e) => setNewGoal({...newGoal, actionSteps: [e.target.value, newGoal.actionSteps[1], newGoal.actionSteps[2]]})}
                        placeholder="Milestone 1"
                        className="w-full px-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                      />
                      <input
                        type="date"
                        value={newGoal.actionStepDates[0]}
                        onChange={(e) => setNewGoal({...newGoal, actionStepDates: [e.target.value, newGoal.actionStepDates[1], newGoal.actionStepDates[2]]})}
                        placeholder="Due date"
                        className="w-full px-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={newGoal.actionSteps[1]}
                        onChange={(e) => setNewGoal({...newGoal, actionSteps: [newGoal.actionSteps[0], e.target.value, newGoal.actionSteps[2]]})}
                        placeholder="Milestone 2"
                        className="w-full px-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                      />
                      <input
                        type="date"
                        value={newGoal.actionStepDates[1]}
                        onChange={(e) => setNewGoal({...newGoal, actionStepDates: [newGoal.actionStepDates[0], e.target.value, newGoal.actionStepDates[2]]})}
                        placeholder="Due date"
                        className="w-full px-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={newGoal.actionSteps[2]}
                        onChange={(e) => setNewGoal({...newGoal, actionSteps: [newGoal.actionSteps[0], newGoal.actionSteps[1], e.target.value]})}
                        placeholder="Milestone 3"
                        className="w-full px-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                      />
                      <input
                        type="date"
                        value={newGoal.actionStepDates[2]}
                        onChange={(e) => setNewGoal({...newGoal, actionStepDates: [newGoal.actionStepDates[0], newGoal.actionStepDates[1], e.target.value]})}
                        placeholder="Due date"
                        className="w-full px-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Break down your goal into milestones with individual due dates</p>
                </div>

                {/* Resources Needed */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Resources Needed
                  </label>
                  <input
                    type="text"
                    value={newGoal.resources}
                    onChange={(e) => setNewGoal({...newGoal, resources: e.target.value})}
                    placeholder="e.g., Online course, Mentor time, Books, Budget"
                    className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                  />
                </div>

                {/* Potential Obstacles */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Potential Obstacles
                  </label>
                  <textarea
                    rows={2}
                    value={newGoal.obstacles}
                    onChange={(e) => setNewGoal({...newGoal, obstacles: e.target.value})}
                    placeholder="What challenges might you face? How will you overcome them?"
                    className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E] resize-none"
                  />
                </div>

                {/* SMART Goal Summary */}
                <div className="bg-gradient-to-r from-[#F4F4F4] to-[#F4F4F4] border-2 border-[#0072CE]/30 -xl p-6">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                    <Target className="w-5 h-5 text-[#0072CE] mr-2" />
                    SMART Goal Checklist
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">Specific</p>
                        <p className="text-gray-600">Clear and well-defined</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">Measurable</p>
                        <p className="text-gray-600">Trackable progress</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">Achievable</p>
                        <p className="text-gray-600">Realistic and attainable</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">Relevant</p>
                        <p className="text-gray-600">Aligns with your goals</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">Time-bound</p>
                        <p className="text-gray-600">Has a target deadline</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateGoal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 -lg font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateGoal}
                    className="flex-1 bg-[#1A1F5E] hover:opacity-90 text-white px-6 py-3 -lg font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Create Goal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* SESSION RATING MODAL */}
      {showSessionRating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white -2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Rate Your Session</h2>
              <button
                onClick={() => setShowSessionRating(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">Rate your last mentorship session and provide feedback</p>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">How would you rate this session?</label>
                  <div className="flex justify-center space-x-3">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setSelectedRating(rating)}
                        className={`w-16 h-16 -xl border-2 transition-all flex items-center justify-center font-bold text-xl ${
                          selectedRating === rating
                            ? 'border-[#0072CE] bg-[#0072CE] text-white scale-110'
                            : 'border-gray-300 hover:border-[#0072CE] hover:bg-[#1A1F5E]/5'
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mt-2 px-2">
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">What went well?</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                    placeholder="Share what you appreciated about this session..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Areas for improvement</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                    placeholder="Any suggestions for future sessions..."
                  />
                </div>
                <button 
                  onClick={() => {
                    setShowSessionRating(false);
                    alert('Thank you for your feedback! Your rating has been recorded.');
                  }}
                  className="w-full bg-[#0072CE] hover:bg-[#1A1F5E] text-white px-6 py-4 -lg font-semibold transition-colors text-lg"
                >
                  Submit Rating
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MENTORSHIP MIXER MODAL */}
      {showMentorshipMixer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white -2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Mentorship Mixer</h2>
              <button
                onClick={() => setShowMentorshipMixer(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">Interactive scenarios to improve your mentorship skills</p>
              
              <div className="space-y-6">
                <div className="bg-[#F4F4F4] -xl p-6 border border-[#0072CE]/30">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-[#F4F4F4] text-white -full flex items-center justify-center font-bold">1</div>
                    <h3 className="font-bold text-gray-900">First Meeting Nerves</h3>
                  </div>
                  <p className="text-gray-700 mb-4">Your mentee seems nervous and quiet. What's the best approach?</p>
                  <div className="space-y-2">
                    <button className="w-full text-left p-4 bg-white border-2 border-gray-200 -lg hover:border-[#0072CE] transition-all">
                      <div className="font-medium text-gray-900">A) Jump straight into setting goals</div>
                    </button>
                    <button className="w-full text-left p-4 bg-white border-2 border-[#0072CE] bg-[#F4F4F4] -lg">
                      <div className="font-medium text-[#1A1F5E] flex items-center justify-between">
                        <span>B) Share your own experiences to build rapport</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 -full">Best Choice</span>
                      </div>
                    </button>
                    <button className="w-full text-left p-4 bg-white border-2 border-gray-200 -lg hover:border-[#0072CE] transition-all">
                      <div className="font-medium text-gray-900">C) Ask open-ended questions</div>
                    </button>
                  </div>
                </div>

                <div className="bg-[#F4F4F4] -xl p-6 border border-[#0072CE]/30">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-[#F4F4F4] text-white -full flex items-center justify-center font-bold">2</div>
                    <h3 className="font-bold text-gray-900">Dealing with Setbacks</h3>
                  </div>
                  <p className="text-gray-700 mb-4">Your mentee didn't achieve their goal. How do you respond?</p>
                  <div className="space-y-2">
                    <button className="w-full text-left p-4 bg-white border-2 border-gray-200 -lg hover:border-[#0072CE] transition-all">
                      <div className="font-medium text-gray-900">A) Tell them to try harder</div>
                    </button>
                    <button className="w-full text-left p-4 bg-white border-2 border-[#0072CE] bg-[#F4F4F4] -lg">
                      <div className="font-medium text-[#1A1F5E] flex items-center justify-between">
                        <span>B) Help them analyze and learn from it</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 -full">Best Choice</span>
                      </div>
                    </button>
                    <button className="w-full text-left p-4 bg-white border-2 border-gray-200 -lg hover:border-[#0072CE] transition-all">
                      <div className="font-medium text-gray-900">C) Change the subject</div>
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setShowMentorshipMixer(false);
                    alert('Great job! You completed 2 scenarios. Keep practicing to improve your mentorship skills.');
                  }}
                  className="w-full bg-[#0072CE] hover:bg-[#1A1F5E] text-white px-6 py-3 -lg font-semibold"
                >
                  Complete Activity
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POWER OF WORDS MODAL */}
      {showPowerOfWords && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white -2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Power of Words</h2>
              <button
                onClick={() => setShowPowerOfWords(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">Learn how language shapes mentorship relationships</p>
              
              <div className="space-y-6">
                <div className="bg-green-50 border-2 border-green-200 -xl p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-10 h-10 bg-[#1A1F5E] text-white -full flex items-center justify-center font-bold text-lg">?</div>
                    <h3 className="text-xl font-bold text-green-900">Empowering Phrases</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white -lg p-4 border border-green-200">
                      <div className="font-semibold text-green-900 mb-1">"What are your thoughts on this?"</div>
                      <div className="text-sm text-gray-600">Invites their perspective and shows you value their input</div>
                    </div>
                    <div className="bg-white -lg p-4 border border-green-200">
                      <div className="font-semibold text-green-900 mb-1">"I believe in your ability to..."</div>
                      <div className="text-sm text-gray-600">Builds confidence and shows trust</div>
                    </div>
                    <div className="bg-white -lg p-4 border border-green-200">
                      <div className="font-semibold text-green-900 mb-1">"Let's explore this together"</div>
                      <div className="text-sm text-gray-600">Creates partnership and shared learning</div>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border-2 border-red-200 -xl p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-10 h-10 bg-red-600 text-white -full flex items-center justify-center font-bold text-lg">?</div>
                    <h3 className="text-xl font-bold text-red-900">Phrases to Avoid</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white -lg p-4 border border-red-200">
                      <div className="font-semibold text-red-900 mb-1">"You should just..."</div>
                      <div className="text-sm text-gray-600">Dismisses their perspective and sounds prescriptive</div>
                    </div>
                    <div className="bg-white -lg p-4 border border-red-200">
                      <div className="font-semibold text-red-900 mb-1">"That's wrong"</div>
                      <div className="text-sm text-gray-600">Shuts down conversation and discourages sharing</div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setShowPowerOfWords(false);
                    alert('Excellent! You learned 5 new empowering phrases. Keep using positive language!');
                  }}
                  className="w-full bg-[#1A1F5E] hover:opacity-90 text-white px-6 py-3 -lg font-semibold"
                >
                  Complete Activity
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REFLECTION BOARD MODAL */}
      {showReflectionBoard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white -2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-[#1A1F5E]">
              <div>
                <h2 className="text-2xl font-bold text-white">Reflection Board</h2>
                <p className="text-blue-100 text-sm">Share your mentorship journey and learn from others</p>
              </div>
              <button
                onClick={() => setShowReflectionBoard(false)}
                className="text-white hover:text-blue-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8">
              {/* Reflection Prompt Suggestions */}
              <div className="bg-[#F4F4F4] border-2 border-[#E5E7EB] -xl p-6 mb-6">
                <div className="flex items-start space-x-3 mb-4">
                  <Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Need Inspiration? Try These Prompts:</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      <button className="text-left bg-white hover:bg-[#1A1F5E]/5 border border-[#E5E7EB] -lg p-3 transition-all">
                        <p className="text-sm font-medium text-gray-900">?? What was the most valuable insight from today's session?</p>
                      </button>
                      <button className="text-left bg-white hover:bg-[#1A1F5E]/5 border border-[#E5E7EB] -lg p-3 transition-all">
                        <p className="text-sm font-medium text-gray-900">?? Did I achieve my session goals? Why or why not?</p>
                      </button>
                      <button className="text-left bg-white hover:bg-[#1A1F5E]/5 border border-[#E5E7EB] -lg p-3 transition-all">
                        <p className="text-sm font-medium text-gray-900">?? How did today contribute to my growth?</p>
                      </button>
                      <button className="text-left bg-white hover:bg-[#1A1F5E]/5 border border-[#E5E7EB] -lg p-3 transition-all">
                        <p className="text-sm font-medium text-gray-900">?? What challenges came up and how did we address them?</p>
                      </button>
                      <button className="text-left bg-white hover:bg-[#1A1F5E]/5 border border-[#E5E7EB] -lg p-3 transition-all">
                        <p className="text-sm font-medium text-gray-900">?? What action steps did we agree on?</p>
                      </button>
                      <button className="text-left bg-white hover:bg-[#1A1F5E]/5 border border-[#E5E7EB] -lg p-3 transition-all">
                        <p className="text-sm font-medium text-gray-900">?? What support or resources do I need next?</p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Reflection Category</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button 
                      onClick={() => setNewReflection({...newReflection, category: 'goal-progress'})}
                      className={`flex items-center space-x-2 px-4 py-3 border-2 -lg transition-all ${newReflection.category === 'goal-progress' ? 'border-[#0072CE]/30 bg-[#F4F4F4]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                      <Target className={`w-5 h-5 ${newReflection.category === 'goal-progress' ? 'text-[#0072CE]' : 'text-gray-600'}`} />
                      <span className={`font-medium ${newReflection.category === 'goal-progress' ? 'text-[#1A1F5E]' : 'text-gray-700'}`}>Goal Progress</span>
                    </button>
                    <button 
                      onClick={() => setNewReflection({...newReflection, category: 'communication'})}
                      className={`flex items-center space-x-2 px-4 py-3 border-2 -lg transition-all ${newReflection.category === 'communication' ? 'border-[#0072CE]/30 bg-[#F4F4F4]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                      <MessageSquare className={`w-5 h-5 ${newReflection.category === 'communication' ? 'text-[#0072CE]' : 'text-gray-600'}`} />
                      <span className={`font-medium ${newReflection.category === 'communication' ? 'text-[#1A1F5E]' : 'text-gray-700'}`}>Communication</span>
                    </button>
                    <button 
                      onClick={() => setNewReflection({...newReflection, category: 'skills-learned'})}
                      className={`flex items-center space-x-2 px-4 py-3 border-2 -lg transition-all ${newReflection.category === 'skills-learned' ? 'border-[#0072CE]/30 bg-[#F4F4F4]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                      <TrendingUp className={`w-5 h-5 ${newReflection.category === 'skills-learned' ? 'text-[#0072CE]' : 'text-gray-600'}`} />
                      <span className={`font-medium ${newReflection.category === 'skills-learned' ? 'text-[#1A1F5E]' : 'text-gray-700'}`}>Skills Learned</span>
                    </button>
                    <button 
                      onClick={() => setNewReflection({...newReflection, category: 'relationship'})}
                      className={`flex items-center space-x-2 px-4 py-3 border-2 -lg transition-all ${newReflection.category === 'relationship' ? 'border-[#0072CE]/30 bg-[#F4F4F4]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                      <Users className={`w-5 h-5 ${newReflection.category === 'relationship' ? 'text-[#0072CE]' : 'text-gray-600'}`} />
                      <span className={`font-medium ${newReflection.category === 'relationship' ? 'text-[#1A1F5E]' : 'text-gray-700'}`}>Relationship</span>
                    </button>
                    <button 
                      onClick={() => setNewReflection({...newReflection, category: 'challenge'})}
                      className={`flex items-center space-x-2 px-4 py-3 border-2 -lg transition-all ${newReflection.category === 'challenge' ? 'border-[#0072CE]/30 bg-[#F4F4F4]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                      <AlertCircle className={`w-5 h-5 ${newReflection.category === 'challenge' ? 'text-[#0072CE]' : 'text-gray-600'}`} />
                      <span className={`font-medium ${newReflection.category === 'challenge' ? 'text-[#1A1F5E]' : 'text-gray-700'}`}>Challenge</span>
                    </button>
                    <button 
                      onClick={() => setNewReflection({...newReflection, category: 'success'})}
                      className={`flex items-center space-x-2 px-4 py-3 border-2 -lg transition-all ${newReflection.category === 'success' ? 'border-[#0072CE]/30 bg-[#F4F4F4]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                      <CheckCircle className={`w-5 h-5 ${newReflection.category === 'success' ? 'text-[#0072CE]' : 'text-gray-600'}`} />
                      <span className={`font-medium ${newReflection.category === 'success' ? 'text-[#1A1F5E]' : 'text-gray-700'}`}>Success</span>
                    </button>
                    <button 
                      onClick={() => setNewReflection({...newReflection, category: 'insight'})}
                      className={`flex items-center space-x-2 px-4 py-3 border-2 -lg transition-all ${newReflection.category === 'insight' ? 'border-[#0072CE]/30 bg-[#F4F4F4]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                      <Lightbulb className={`w-5 h-5 ${newReflection.category === 'insight' ? 'text-[#0072CE]' : 'text-gray-600'}`} />
                      <span className={`font-medium ${newReflection.category === 'insight' ? 'text-[#1A1F5E]' : 'text-gray-700'}`}>Insight</span>
                    </button>
                    <button 
                      onClick={() => setNewReflection({...newReflection, category: 'learning'})}
                      className={`flex items-center space-x-2 px-4 py-3 border-2 -lg transition-all ${newReflection.category === 'learning' ? 'border-[#0072CE]/30 bg-[#F4F4F4]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                      <BookOpen className={`w-5 h-5 ${newReflection.category === 'learning' ? 'text-[#0072CE]' : 'text-gray-600'}`} />
                      <span className={`font-medium ${newReflection.category === 'learning' ? 'text-[#1A1F5E]' : 'text-gray-700'}`}>Learning</span>
                    </button>
                  </div>
                </div>

                {/* Reflection Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reflection Title *</label>
                  <input
                    type="text"
                    value={newReflection.title}
                    onChange={(e) => setNewReflection({...newReflection, title: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 -lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Learning to navigate difficult conversations"
                  />
                </div>

                {/* Session Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">How would you rate this session? (Optional)</label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setNewReflection({...newReflection, sessionRating: rating})}
                        className="p-2 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-8 h-8 ${
                          rating <= newReflection.sessionRating ? 'text-yellow-400' : 'text-gray-300'
                        } fill-current`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reflection Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Reflection *</label>
                  <textarea
                    rows={8}
                    value={newReflection.content}
                    onChange={(e) => setNewReflection({...newReflection, content: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 -lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Share your thoughts, insights, challenges, and learnings from your mentorship experience...

What went well?
What surprised you?
What will you do differently next time?
How are you feeling about your progress?"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-gray-500">Minimum 100 characters recommended</span>
                    <span className="text-sm text-gray-500">{newReflection.content.length} / 1000</span>
                  </div>
                </div>

                {/* Key Takeaways */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Key Takeaways (Optional)</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <input
                        type="text"
                        value={newReflection.keyTakeaways[0]}
                        onChange={(e) => setNewReflection({...newReflection, keyTakeaways: [e.target.value, newReflection.keyTakeaways[1], newReflection.keyTakeaways[2]]})}
                        className="flex-1 px-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-blue-500"
                        placeholder="First key learning or action item"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <input
                        type="text"
                        value={newReflection.keyTakeaways[1]}
                        onChange={(e) => setNewReflection({...newReflection, keyTakeaways: [newReflection.keyTakeaways[0], e.target.value, newReflection.keyTakeaways[2]]})}
                        className="flex-1 px-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Second key learning or action item"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <input
                        type="text"
                        value={newReflection.keyTakeaways[2]}
                        onChange={(e) => setNewReflection({...newReflection, keyTakeaways: [newReflection.keyTakeaways[0], newReflection.keyTakeaways[1], e.target.value]})}
                        className="flex-1 px-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Third key learning or action item"
                      />
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <input
                    type="text"
                    value={newReflection.tags}
                    onChange={(e) => setNewReflection({...newReflection, tags: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 -lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., communication, leadership, feedback, growth-mindset"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
                </div>
                </div>

                {/* Privacy Options */}
                <div className="bg-[#F4F4F4] border-2 border-[#0072CE]/30 -lg p-5">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={newReflection.isAnonymous}
                      onChange={(e) => setNewReflection({...newReflection, isAnonymous: e.target.checked})}
                      className="mt-1  border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="anonymous" className="flex-1">
                      <span className="font-medium text-gray-900">Post Anonymously</span>
                      <p className="text-sm text-gray-600 mt-1">
                        Your reflection will be shared without identifying information. This encourages honest sharing 
                        while maintaining privacy.
                      </p>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={() => setShowReflectionBoard(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 -lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCreateReflection}
                    className="flex-1 bg-[#1A1F5E] hover:opacity-90 text-white px-6 py-3 -lg font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Post Reflection
                  </button>
                </div>
              </div>
            </div>
          </div>
      )}

      {/* RESOURCE VIEWER MODAL */}
      {showResourceViewer && selectedResource && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white -2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-[#1A1F5E]">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 -lg flex items-center justify-center ${
                  selectedResource.type === 'video' ? 'bg-red-500' : 'bg-[#F4F4F4]0'
                }`}>
                  {selectedResource.type === 'video' ? (
                    <Play className="w-6 h-6 text-white" />
                  ) : (
                    <FileText className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedResource.title}</h2>
                  <div className="flex items-center space-x-3 text-sm text-white/80">
                    {selectedResource.author && (
                      <span className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{selectedResource.author}</span>
                      </span>
                    )}
                    {selectedResource.duration && (
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{selectedResource.duration}</span>
                      </span>
                    )}
                    {selectedResource.readTime && (
                      <span className="flex items-center space-x-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{selectedResource.readTime}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowResourceViewer(false);
                  setSelectedResource(null);
                }}
                className="text-white hover:text-white/80 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8">
              {selectedResource.type === 'video' && selectedResource.videoId ? (
                <div>
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      className="absolute top-0 left-0 w-full h-full -lg"
                      src={`https://www.youtube.com/embed/${selectedResource.videoId}`}
                      title={selectedResource.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">About this video</h3>
                    <p className="text-gray-600">
                      {selectedResource.content || 'This video provides valuable insights and practical knowledge to help you master the concepts covered in this module.'}
                    </p>
                  </div>
                </div>
              ) : selectedResource.type === 'article' ? (
                <div>
                  <div className="prose max-w-none">
                    <div className="bg-[#F4F4F4] border-l-4 border-[#0072CE] p-6 mb-6 -r-lg">
                      <div className="flex items-center space-x-2 text-sm text-[#1A1F5E] mb-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{selectedResource.author || 'Unknown Author'}</span>
                        <span className="text-[#0072CE]">�</span>
                        <Clock className="w-4 h-4" />
                        <span>{selectedResource.readTime || '5 min read'}</span>
                      </div>
                    </div>
                    
                    <div className="text-gray-800 leading-relaxed space-y-6">
                      {selectedResource.content ? (
                        selectedResource.content.split('\n\n').map((paragraph, idx) => (
                          <p key={idx} className="text-base leading-7">{paragraph}</p>
                        ))
                      ) : (
                        <>
                          <div className="space-y-5">
                            <p className="text-lg leading-8">
                              This comprehensive article explores key concepts and practical applications that will enhance your 
                              understanding of the subject matter. Through detailed analysis and real-world examples, you'll gain 
                              valuable insights that can be immediately applied to your professional development.
                            </p>
                            <p className="text-base leading-7">
                              The content is structured to provide both theoretical foundations and actionable strategies, ensuring 
                              you can leverage this knowledge effectively in your role. Each section builds upon previous concepts 
                              while introducing new perspectives and methodologies.
                            </p>
                          </div>

                          <div className="bg-gradient-to-r from-[#F4F4F4] to-[#F4F4F4] border-l-4 border-[#0072CE] p-6 -r-lg my-6">
                            <h4 className="text-lg font-bold text-[#1A1F5E] mb-3 flex items-center">
                              <Lightbulb className="w-5 h-5 mr-2" />
                              Why This Matters
                            </h4>
                            <p className="text-[#1A1F5E] leading-7">
                              In today's rapidly evolving professional landscape, staying current with best practices and emerging 
                              trends is essential. This content has been carefully curated to provide you with actionable insights 
                              that bridge the gap between theory and practice, helping you make immediate improvements in your work.
                            </p>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Core Concepts</h4>
                            <p className="text-base leading-7">
                              Understanding the fundamental principles is crucial for long-term success. These core concepts form 
                              the foundation upon which all advanced techniques are built. By mastering these basics, you create 
                              a solid platform for continuous growth and development.
                            </p>
                            <div className="grid md:grid-cols-2 gap-4 my-6">
                              <div className="bg-white border-2 border-gray-200 -lg p-5">
                                <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                  Foundation Building
                                </h5>
                                <p className="text-sm text-gray-600 leading-6">
                                  Establish strong fundamentals through consistent practice and iterative learning approaches.
                                </p>
                              </div>
                              <div className="bg-white border-2 border-gray-200 -lg p-5">
                                <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                  Practical Application
                                </h5>
                                <p className="text-sm text-gray-600 leading-6">
                                  Apply theoretical knowledge to real-world scenarios for deeper understanding and retention.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Step-by-Step Implementation</h4>
                            <p className="text-base leading-7">
                              Follow this structured approach to implement what you've learned effectively:
                            </p>
                            <ol className="space-y-4 ml-4">
                              <li className="flex items-start">
                                <span className="flex-shrink-0 w-8 h-8 bg-[#F4F4F4] text-white -full flex items-center justify-center font-bold text-sm mr-3 mt-1">1</span>
                                <div>
                                  <h5 className="font-semibold text-gray-900 mb-1">Assessment & Planning</h5>
                                  <p className="text-gray-600 leading-6">
                                    Begin by assessing your current skill level and identifying specific areas for improvement. 
                                    Create a detailed action plan with clear milestones and realistic timelines.
                                  </p>
                                </div>
                              </li>
                              <li className="flex items-start">
                                <span className="flex-shrink-0 w-8 h-8 bg-[#F4F4F4] text-white -full flex items-center justify-center font-bold text-sm mr-3 mt-1">2</span>
                                <div>
                                  <h5 className="font-semibold text-gray-900 mb-1">Active Learning & Practice</h5>
                                  <p className="text-gray-600 leading-6">
                                    Engage with the material through hands-on practice. Apply concepts in small, manageable projects 
                                    to build confidence and understanding progressively.
                                  </p>
                                </div>
                              </li>
                              <li className="flex items-start">
                                <span className="flex-shrink-0 w-8 h-8 bg-[#F4F4F4] text-white -full flex items-center justify-center font-bold text-sm mr-3 mt-1">3</span>
                                <div>
                                  <h5 className="font-semibold text-gray-900 mb-1">Review & Refinement</h5>
                                  <p className="text-gray-600 leading-6">
                                    Regularly review your progress, seek feedback from mentors or peers, and refine your approach 
                                    based on lessons learned. Continuous improvement is key to mastery.
                                  </p>
                                </div>
                              </li>
                            </ol>
                          </div>

                          <div className="bg-yellow-50 border-2 border-yellow-200 -lg p-6 my-6">
                            <h4 className="text-lg font-bold text-yellow-900 mb-3 flex items-center">
                              <AlertCircle className="w-5 h-5 mr-2" />
                              Common Pitfalls to Avoid
                            </h4>
                            <ul className="space-y-2 text-yellow-800">
                              <li className="flex items-start">
                                <span className="text-yellow-600 mr-2 mt-1">�</span>
                                <span>Rushing through foundational concepts without proper understanding</span>
                              </li>
                              <li className="flex items-start">
                                <span className="text-yellow-600 mr-2 mt-1">�</span>
                                <span>Neglecting to practice regularly and consistently</span>
                              </li>
                              <li className="flex items-start">
                                <span className="text-yellow-600 mr-2 mt-1">�</span>
                                <span>Avoiding feedback or constructive criticism</span>
                              </li>
                              <li className="flex items-start">
                                <span className="text-yellow-600 mr-2 mt-1">�</span>
                                <span>Setting unrealistic expectations or timelines</span>
                              </li>
                            </ul>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Key Takeaways</h4>
                            <div className="bg-[#F4F4F4] border-2 border-[#E5E7EB] -lg p-6">
                              <ul className="space-y-3">
                                <li className="flex items-start">
                                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                                  <span className="text-gray-800 leading-6">
                                    <strong>Foundational mastery</strong> is essential before advancing to complex topics
                                  </span>
                                </li>
                                <li className="flex items-start">
                                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                                  <span className="text-gray-800 leading-6">
                                    <strong>Practical application</strong> reinforces learning and builds real-world skills
                                  </span>
                                </li>
                                <li className="flex items-start">
                                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                                  <span className="text-gray-800 leading-6">
                                    <strong>Continuous feedback</strong> and iteration accelerate your development
                                  </span>
                                </li>
                                <li className="flex items-start">
                                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                                  <span className="text-gray-800 leading-6">
                                    <strong>Consistent practice</strong> over time yields better results than sporadic intensive sessions
                                  </span>
                                </li>
                              </ul>
                            </div>
                          </div>

                          <div className="space-y-4 mt-8">
                            <h4 className="text-2xl font-bold text-gray-900 mb-4">Next Steps</h4>
                            <p className="text-base leading-7">
                              By mastering these concepts, you'll be well-equipped to advance your skills and contribute more 
                            effectively to your organization's success.
                          </p>
                          </div>

                          <div className="bg-[#F4F4F4] border-2 border-[#0072CE]/30 -lg p-6 mt-8">
                            <h4 className="text-lg font-bold text-[#1A1F5E] mb-3">Ready to Move Forward?</h4>
                            <p className="text-[#1A1F5E] mb-4 leading-6">
                              Now that you've completed this article, apply what you've learned immediately. Start with small 
                              experiments, track your progress, and don't hesitate to revisit this content as you grow.
                            </p>
                            <p className="text-[#1A1F5E] text-sm">
                              Remember: Mastery comes through consistent practice and continuous learning. You're on the right path!
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleMarkResourceComplete}
                      className="w-full bg-[#1A1F5E] hover:opacity-90 text-white px-6 py-4 -lg font-bold text-lg flex items-center justify-center space-x-2 transition-all shadow-lg hover:shadow-xl"
                    >
                      <CheckCircle className="w-6 h-6" />
                      <span>Mark Module as Complete & Update Progress</span>
                    </button>
                    <p className="text-center text-sm text-gray-500 mt-3">
                      Completing this resource will update your learning path progress
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">This resource type is not yet supported for preview.</p>
                  <a
                    href={selectedResource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block bg-[#0072CE] hover:bg-[#1A1F5E] text-white px-6 py-2 -lg font-medium"
                  >
                    Open Resource
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* WORDWALL GAME MODAL */}
      {showWordwallGame && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white -2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {gameState === 'menu' && (
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-[#F4F4F4] -full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-10 h-10 text-[#1A1F5E]" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Mentorship Challenge</h2>
                  <p className="text-gray-600">Test your mentorship knowledge and earn points!</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <button
                    onClick={() => startGame('practice')}
                    className="bg-gradient-to-br from-[#F4F4F4] to-[#F4F4F4] border-2 border-[#0072CE]/40 -xl p-8 hover:shadow-lg transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <BookOpen className="w-8 h-8 text-[#0072CE]" />
                      <span className="text-[#0072CE] font-semibold">Practice Mode</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Learn & Practice</h3>
                    <p className="text-gray-600 text-sm mb-4">Take your time to learn without pressure. Perfect for building confidence!</p>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-600 mr-2" />
                        No time limit
                      </li>
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-600 mr-2" />
                        Instant explanations
                      </li>
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-600 mr-2" />
                        100 points per question
                      </li>
                    </ul>
                  </button>

                  <button
                    onClick={() => startGame('challenge')}
                    className="bg-[#F4F4F4] border-2 border-[#E83E2D]/30 -xl p-8 hover:shadow-lg transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Zap className="w-8 h-8 text-pink-600" />
                      <span className="text-pink-600 font-semibold">Challenge Mode</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Race Against Time</h3>
                    <p className="text-gray-600 text-sm mb-4">Quick thinking required! Earn bonus points for speed.</p>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-600 mr-2" />
                        30 seconds per question
                      </li>
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-600 mr-2" />
                        Time bonus points
                      </li>
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-600 mr-2" />
                        Compete for high score
                      </li>
                    </ul>
                  </button>
                </div>

                <div className="bg-gray-50 -xl p-6 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Star className="w-5 h-5 text-yellow-500 mr-2" />
                    Your Stats
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{gameHighScore}</p>
                      <p className="text-sm text-gray-600">High Score</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{goals.filter(g => g.status === 'completed').length}</p>
                      <p className="text-sm text-gray-600">Games Played</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowWordwallGame(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 -lg font-semibold transition-all"
                >
                  Close
                </button>
              </div>
            )}

            {gameState === 'playing' && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-600">Question {currentQuestion + 1}/{gameQuestions.length}</span>
                    <span className="bg-[#1A1F5E]/10 text-[#1A1F5E] px-3 py-1 -full text-sm font-medium">
                      {gameMode === 'practice' ? '?? Practice' : '? Challenge'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-6">
                    {gameMode === 'challenge' && (
                      <div className={`flex items-center space-x-2 ${timeLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}>
                        <Clock className="w-5 h-5" />
                        <span className="text-2xl font-bold">{timeLeft}s</span>
                      </div>
                    )}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#0072CE]">{score}</p>
                      <p className="text-xs text-gray-600">points</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-[#1A1F5E]/10 to-pink-100 -xl p-6 mb-6">
                  <span className="inline-block bg-white px-3 py-1 -full text-xs font-medium text-[#1A1F5E] mb-3">
                    {gameQuestions[currentQuestion].category}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{gameQuestions[currentQuestion].question}</h3>
                </div>

                <div className="space-y-3 mb-6">
                  {gameQuestions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={selectedAnswer !== null}
                      className={`w-full p-4 -lg text-left transition-all ${
                        selectedAnswer === null
                          ? 'bg-white border-2 border-gray-200 hover:border-[#1A1F5E] hover:shadow-md'
                          : selectedAnswer === index
                          ? index === gameQuestions[currentQuestion].correctAnswer
                            ? 'bg-green-100 border-2 border-green-500'
                            : 'bg-red-100 border-2 border-red-500'
                          : index === gameQuestions[currentQuestion].correctAnswer
                          ? 'bg-green-100 border-2 border-green-500'
                          : 'bg-gray-50 border-2 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`flex-shrink-0 w-8 h-8 -full flex items-center justify-center font-bold ${
                          selectedAnswer === null
                            ? 'bg-gray-200 text-gray-700'
                            : index === gameQuestions[currentQuestion].correctAnswer
                            ? 'bg-green-500 text-white'
                            : selectedAnswer === index
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="font-medium text-gray-900">{option}</span>
                        {showFeedback && index === gameQuestions[currentQuestion].correctAnswer && (
                          <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                        )}
                        {showFeedback && selectedAnswer === index && index !== gameQuestions[currentQuestion].correctAnswer && (
                          <XCircle className="w-5 h-5 text-red-600 ml-auto" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {showFeedback && (
                  <div className={`-lg p-6 mb-6 ${
                    selectedAnswer === gameQuestions[currentQuestion].correctAnswer
                      ? 'bg-green-50 border-2 border-green-200'
                      : 'bg-[#F4F4F4] border-2 border-[#0072CE]/30'
                  }`}>
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center">
                      <Lightbulb className="w-5 h-5 mr-2" />
                      {selectedAnswer === gameQuestions[currentQuestion].correctAnswer ? 'Correct! ??' : 'Learn More'}
                    </h4>
                    <p className="text-gray-700">{gameQuestions[currentQuestion].explanation}</p>
                    {selectedAnswer === gameQuestions[currentQuestion].correctAnswer && gameMode === 'challenge' && (
                      <p className="mt-2 text-sm text-green-700 font-medium">
                        ? Time bonus: +{Math.floor(timeLeft * 2)} points
                      </p>
                    )}
                  </div>
                )}

                {showFeedback && (
                  <button
                    onClick={nextQuestion}
                    className="w-full bg-gradient-to-r from-[#0072CE] to-pink-600 hover:from-[#1A1F5E] hover:to-pink-700 text-white px-6 py-4 -lg font-bold text-lg transition-all shadow-lg"
                  >
                    {currentQuestion < gameQuestions.length - 1 ? 'Next Question ?' : 'See Results ??'}
                  </button>
                )}
              </div>
            )}

            {gameState === 'results' && (
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-blue-500 -full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Game Complete!</h2>
                  <p className="text-xl text-gray-600">{getScoreMessage()}</p>
                </div>

                <div className="bg-gradient-to-r from-[#1A1F5E]/10 to-pink-100 -xl p-8 mb-6">
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                      <p className="text-4xl font-bold text-[#1A1F5E] mb-1">{score}</p>
                      <p className="text-sm text-gray-700">Total Score</p>
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-[#1A1F5E] mb-1">{answers.filter(a => a.correct).length}/{gameQuestions.length}</p>
                      <p className="text-sm text-gray-700">Correct Answers</p>
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-[#1A1F5E] mb-1">{Math.round((answers.filter(a => a.correct).length / gameQuestions.length) * 100)}%</p>
                      <p className="text-sm text-gray-700">Accuracy</p>
                    </div>
                  </div>
                </div>

                {score > gameHighScore && (
                  <div className="bg-yellow-50 border-2 border-yellow-300 -lg p-4 mb-6 text-center">
                    <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <p className="font-bold text-yellow-900">?? New High Score!</p>
                    <p className="text-sm text-yellow-800">You beat your previous record of {gameHighScore} points!</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={resetGame}
                    className="bg-gradient-to-r from-[#0072CE] to-pink-600 hover:from-[#1A1F5E] hover:to-pink-700 text-white px-6 py-3 -lg font-semibold transition-all"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={() => {
                      setShowWordwallGame(false);
                      resetGame();
                    }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 -lg font-semibold transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
    </div>);
};

export default MentorshipActivitiesEnhanced;




