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
            content: 'Executive presence is more than just confidence—it\'s about authenticity, clarity, and the ability to inspire others. Learn the key components of executive presence including body language, vocal tone, strategic storytelling, and how to command a room while remaining approachable...'
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
  const { mentorId } = useParams<{ mentorId: string }>();
  
  // Mentor data based on ID
  const [mentorData, setMentorData] = useState<any>(null);

  useEffect(() => {
    // Fetch mentor-specific data based on mentorId
    // For now, using mock data
    const mockMentors: Record<string, any> = {
      'mentor-1': {
        id: 'mentor-1',
        name: 'Sarah Johnson',
        role: 'Senior Strategy Consultant',
        company: 'Forvis Mazars',
        location: 'Lagos, Nigeria',
        image: 'https://randomuser.me/api/portraits/women/44.jpg',
        expertise: ['Business Strategy', 'Leadership', 'Digital Transformation'],
        relationshipStartDate: '2025-01-15',
        sessionsCompleted: 8,
        nextSession: '2026-01-20'
      },
      'mentor-2': {
        id: 'mentor-2',
        name: 'Dr. Kwame Mensah',
        role: 'Technology Director',
        company: 'Forvis Mazars',
        location: 'Accra, Ghana',
        image: 'https://randomuser.me/api/portraits/men/32.jpg',
        expertise: ['Software Engineering', 'AI/ML', 'Tech Leadership'],
        relationshipStartDate: '2024-11-20',
        sessionsCompleted: 12,
        nextSession: '2026-01-18'
      },
      'mentor-3': {
        id: 'mentor-3',
        name: 'Amina Hassan',
        role: 'Finance Partner',
        company: 'Forvis Mazars',
        location: 'Nairobi, Kenya',
        image: 'https://randomuser.me/api/portraits/women/68.jpg',
        expertise: ['Financial Planning', 'Risk Management', 'Investment Strategy'],
        relationshipStartDate: '2026-01-10',
        sessionsCompleted: 1,
        nextSession: '2026-01-22'
      },
      'mentor-4': {
        id: 'mentor-4',
        name: 'Michael Okonkwo',
        role: 'Marketing Director',
        company: 'Forvis Mazars',
        location: 'Johannesburg, South Africa',
        image: 'https://randomuser.me/api/portraits/men/52.jpg',
        expertise: ['Brand Strategy', 'Digital Marketing', 'Growth Hacking'],
        relationshipStartDate: '2024-06-15',
        sessionsCompleted: 24
      }
    };

    if (mentorId && mockMentors[mentorId]) {
      setMentorData(mockMentors[mentorId]);
    } else {
      // Default to first mentor if no ID or invalid ID
      setMentorData(mockMentors['mentor-1']);
    }
  }, [mentorId]);

  const [activeTab, setActiveTab] = useState<'goals' | 'progress' | 'learning' | 'feedback' | 'development' | 'activities' | 'resources' | 'reflections'>('activities');
  const [selectedGoal, setSelectedGoal] = useState<SMARTGoal | null>(null);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showProgressReport, setShowProgressReport] = useState(false);
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);
  
  // Goals State Management
  const [goals, setGoals] = useState<SMARTGoal[]>(mockGoals);
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

  // Progress Reports State Management
  const [progressReports, setProgressReports] = useState<ProgressReport[]>(mockProgressReports);
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
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>(mockLearningPaths);
  const [showWordwallGame, setShowWordwallGame] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [activityResults, setActivityResults] = useState({
    sessionsRated: 8,
    reflectionsPosted: 12,
    activitiesCompleted: 5,
    averageRating: 4.8,
    mixerScenarios: 6,
    wordsLearned: 15,
    gameHighScore: 850
  });

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
      setActivityResults({
        ...activityResults,
        gameHighScore: Math.max(activityResults.gameHighScore, score),
        activitiesCompleted: activityResults.activitiesCompleted + 1
      });
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
    if (percentage === 100) return "Perfect! Outstanding work! 🌟";
    if (percentage >= 80) return "Excellent! You're a mentorship expert! 🎉";
    if (percentage >= 60) return "Great job! Keep learning! 💪";
    return "Good effort! Review the concepts and try again! 📚";
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

    alert('✅ Resource marked as complete! Module progress updated.');
    setShowResourceViewer(false);
    setSelectedResource(null);
  };

  // Goal Management Functions
  const handleCreateGoal = () => {
    if (!newGoal.title || !newGoal.description || !newGoal.targetDate || !newGoal.measurable) {
      alert('⚠️ Please fill in all required fields (Title, Description, Target Date, and Success Metrics)');
      return;
    }

    const milestones: Milestone[] = newGoal.actionSteps
      .filter(step => step.trim() !== '')
      .map((step, index) => ({
        id: `milestone-${Date.now()}-${index}`,
        title: step,
        description: step,
        dueDate: newGoal.actionStepDates[index] || newGoal.targetDate,
        completed: false,
        tasks: [
          {
            id: `task-${Date.now()}-${index}-1`,
            title: step,
            completed: false,
            assignedTo: 'mentee' as 'mentee' | 'mentor'
          }
        ]
      }));

    const goal: SMARTGoal = {
      id: `goal-${Date.now()}`,
      title: newGoal.title,
      description: newGoal.description,
      specific: newGoal.description,
      measurable: newGoal.measurable,
      achievable: newGoal.resources || 'Achievable with dedicated effort',
      relevant: 'Aligned with career development goals',
      timeBound: `Complete by ${new Date(newGoal.targetDate).toLocaleDateString()}`,
      category: newGoal.category,
      priority: newGoal.priority,
      status: 'not-started',
      progress: 0,
      startDate: new Date().toISOString().split('T')[0],
      targetDate: newGoal.targetDate,
      mentorId: 'mentor-1',
      mentorName: 'Your Mentor',
      createdAt: new Date().toISOString(),
      milestones: milestones
    };

    setGoals([goal, ...goals]);
    setShowCreateGoal(false);
    
    // Reset form
    setNewGoal({
      title: '',
      description: '',
      category: 'technical',
      priority: 'medium',
      targetDate: '',
      measurable: '',
      actionSteps: ['', '', ''],
      actionStepDates: ['', '', ''],
      resources: '',
      obstacles: ''
    });
    
    alert('✅ Goal created successfully! Your SMART goal has been added to your mentorship plan.');
  };

  const handleCreateReport = () => {
    if (!newReport.goalId || !newReport.startDate || !newReport.endDate) {
      alert('⚠️ Please select a goal and provide start/end dates');
      return;
    }

    const selectedGoal = goals.find(g => g.id === newReport.goalId);
    if (!selectedGoal) return;

    const report: ProgressReport = {
      id: `report-${Date.now()}`,
      goalId: newReport.goalId,
      period: newReport.period,
      startDate: newReport.startDate,
      endDate: newReport.endDate,
      achievements: newReport.achievements.filter(a => a.trim() !== ''),
      challenges: newReport.challenges.filter(c => c.trim() !== ''),
      nextSteps: newReport.nextSteps.filter(n => n.trim() !== ''),
      menteeFeedback: newReport.menteeFeedback,
      createdAt: new Date().toISOString()
    };

    setProgressReports([report, ...progressReports]);
    setShowProgressReport(false);
    
    // Reset form
    setNewReport({
      goalId: '',
      period: 'weekly',
      startDate: '',
      endDate: '',
      achievements: ['', '', ''],
      challenges: ['', ''],
      nextSteps: ['', '', ''],
      menteeFeedback: ''
    });
    
    alert('✅ Progress report created successfully!');
  };

  const handleCreateReflection = () => {
    if (!newReflection.title || !newReflection.content) {
      alert('⚠️ Please provide a title and reflection content');
      return;
    }

    const reflection = {
      id: `reflection-${Date.now()}`,
      category: newReflection.category,
      title: newReflection.title,
      content: newReflection.content,
      sessionRating: newReflection.sessionRating,
      keyTakeaways: newReflection.keyTakeaways.filter(t => t.trim() !== ''),
      tags: newReflection.tags.split(',').map(t => t.trim()).filter(t => t !== ''),
      isAnonymous: newReflection.isAnonymous,
      author: newReflection.isAnonymous ? 'Anonymous Mentee' : 'Mentee',
      date: new Date().toISOString(),
      timestamp: 'Just now'
    };

    setReflections([reflection, ...reflections]);
    setActivityResults({...activityResults, reflectionsPosted: activityResults.reflectionsPosted + 1});
    setShowReflectionBoard(false);
    
    // Reset form
    setNewReflection({
      category: 'goal-progress',
      title: '',
      content: '',
      sessionRating: 0,
      keyTakeaways: ['', '', ''],
      tags: '',
      isAnonymous: false
    });
    
    alert('✅ Reflection posted successfully! Thank you for sharing your insights.');
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

  const handleTaskToggle = (goalId: string, milestoneId: string, taskId: string) => {
    setGoals(goals.map(goal => {
      if (goal.id !== goalId) return goal;
      
      const updatedMilestones = goal.milestones.map(milestone => {
        if (milestone.id !== milestoneId) return milestone;
        
        const updatedTasks = milestone.tasks.map(task => {
          if (task.id !== taskId) return task;
          return {
            ...task,
            completed: !task.completed,
            completedDate: !task.completed ? new Date().toISOString() : undefined
          };
        });
        
        const allTasksComplete = updatedTasks.every(t => t.completed);
        return {
          ...milestone,
          tasks: updatedTasks,
          completed: allTasksComplete,
          completedDate: allTasksComplete ? new Date().toISOString() : undefined
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1A1F5E] via-[#0072CE] to-[#1A1F5E] text-white">
        <div className="max-w-[1920px] mx-auto px-12 sm:px-16 lg:px-20 py-12">
          <button
            onClick={() => navigate('/mentorship-activities')}
            className="flex items-center space-x-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to My Mentors</span>
          </button>
          
          {/* Mentor Info Header */}
          {mentorData && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20">
              <div className="flex items-center gap-6">
                <img
                  src={mentorData.image}
                  alt={mentorData.name}
                  className="w-20 h-20 rounded-full border-4 border-white shadow-xl"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">{mentorData.name}</h2>
                    <Award className="w-6 h-6 text-yellow-400" />
                  </div>
                  <p className="text-white/80 text-lg mb-2">{mentorData.role} • {mentorData.company}</p>
                  <div className="flex items-center gap-4 text-sm text-white/70">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{mentorData.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Since {new Date(mentorData.relationshipStartDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{mentorData.sessionsCompleted} sessions completed</span>
                    </div>
                  </div>
                </div>
                {mentorData.nextSession && (
                  <div className="bg-green-500 rounded-xl px-6 py-4 text-center">
                    <p className="text-xs text-green-100 mb-1">Next Session</p>
                    <p className="text-white font-bold">
                      {new Date(mentorData.nextSession).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="text-center">
            <h1 className="text-4xl text-white font-bold mb-3">Mentorship Activities & Progress</h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Track goals, manage learning paths, and measure your development progress
            </p>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="max-w-[1920px] mx-auto px-12 sm:px-16 lg:px-20 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Goals</p>
                <p className="text-3xl font-bold text-gray-900">{totalGoals}</p>
              </div>
              <div className="bg-[#1A1F5E]/10 p-3 rounded-lg">
                <Target className="w-6 h-6 text-[#0072CE]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">In Progress</p>
                <p className="text-3xl font-bold text-gray-900">{inProgressGoals}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{completedGoals}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Avg. Progress</p>
                <p className="text-3xl font-bold text-gray-900">{averageProgress}%</p>
              </div>
              <div className="bg-[#1A1F5E]/10 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-[#0072CE]" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
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
            <div className="mb-6 bg-gradient-to-r from-[#0072CE] to-[#1A1F5E] rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V5C19 3.89543 18.1046 3 17 3Z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Need to discuss with your mentor?</h3>
                    <p className="text-white/80 text-sm">Schedule or join a Microsoft Teams meeting</p>
                  </div>
                </div>
                <a
                  href="https://teams.microsoft.com/l/meetup-join/19%3ameeting_mentorship_session"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-[#0072CE] hover:bg-[#1A1F5E]/5 px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
                >
                  <span>Open Teams</span>
                  <ChevronRight className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* INTERACTIVE ACTIVITIES TAB */}
            {activeTab === 'activities' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Interactive Activities</h2>
                  <p className="text-gray-600">Engage with tools designed to strengthen your mentorship relationship</p>
                </div>

                {/* Activities Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Reflection Board */}
                  <button
                    onClick={() => setShowReflectionBoard(true)}
                    className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm border-2 border-orange-200 p-8 hover:shadow-lg hover:scale-105 transition-all text-left group"
                  >
                    <div className="w-16 h-16 bg-orange-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Reflection Board</h3>
                    <p className="text-gray-600 mb-4">Share and explore mentorship reflections and growth insights</p>
                    <div className="text-orange-600 font-medium flex items-center">
                      Start Activity →
                    </div>
                  </button>

                  {/* Mentorship Challenge Game */}
                  <button
                    onClick={() => setShowWordwallGame(true)}
                    className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl shadow-sm border-2 border-pink-200 p-8 hover:shadow-lg hover:scale-105 transition-all text-left group"
                  >
                    <div className="w-16 h-16 bg-pink-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Mentorship Challenge</h3>
                    <p className="text-gray-600 mb-4">Test your mentorship knowledge with our quiz game</p>
                    <div className="text-pink-600 font-medium flex items-center">
                      Start Activity →
                    </div>
                  </button>
                </div>

                {/* Activity Stats Dashboard */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mt-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Your Activity Progress</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-gradient-to-br from-[#F4F4F4] to-[#F4F4F4] rounded-xl border border-[#0072CE]/30">
                      <div className="text-4xl font-bold text-[#1A1F5E] mb-2">{activityResults.reflectionsPosted}</div>
                      <div className="text-sm font-medium text-gray-700">Reflections Posted</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                      <div className="text-4xl font-bold text-green-900 mb-2">{activityResults.activitiesCompleted}</div>
                      <div className="text-sm font-medium text-gray-700">Activities Completed</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl border border-pink-200">
                      <div className="text-4xl font-bold text-pink-900 mb-2">{activityResults.gameHighScore}</div>
                      <div className="text-sm font-medium text-gray-700">Quiz High Score</div>
                    </div>
                  </div>

                  {/* Teams Meeting CTA */}
                  <div className="mt-6 bg-gradient-to-r from-[#F4F4F4] to-[#F4F4F4] border-2 border-[#0072CE]/30 rounded-xl p-6\">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4\">
                        <div className="w-12 h-12 bg-[#0072CE] rounded-lg flex items-center justify-center\">
                          <MessageSquare className="w-6 h-6 text-white\" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1\">Discuss your progress with your mentor</h4>
                          <p className="text-sm text-gray-600\">Schedule a Teams call to review your activities and get feedback</p>
                        </div>
                      </div>
                      <a
                        href="https://teams.microsoft.com/l/meetup-join/19%3ameeting_progress_review"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#0072CE] hover:bg-[#1A1F5E] text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors whitespace-nowrap"
                      >
                        <span>Open Teams</span>
                        <ChevronRight className="w-5 h-5\" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SMART GOALS TAB */}
            {activeTab === 'goals' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">SMART Goals</h2>
                    <p className="text-gray-600">Specific, Measurable, Achievable, Relevant, Time-bound goals</p>
                  </div>
                  <button
                    onClick={() => setShowCreateGoal(true)}
                    className="bg-[#0072CE] hover:bg-[#1A1F5E] text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create Goal</span>
                  </button>
                </div>

                {/* Goals List */}
                <div className="space-y-4">
                  {goals.map(goal => (
                    <div key={goal.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">{goal.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              goal.priority === 'high' ? 'bg-red-100 text-red-700' :
                              goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {goal.priority} priority
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-[#0072CE] to-[#1A1F5E] h-3 rounded-full transition-all duration-500"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Milestones Preview */}
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                        {goal.milestones.map(milestone => (
                          <div
                            key={milestone.id}
                            className={`p-3 rounded-lg border-2 cursor-pointer hover:shadow-md transition-shadow ${
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
                                className="w-4 h-4 text-green-600 rounded cursor-pointer"
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
                    <p className="text-gray-600">Weekly and monthly progress tracking</p>
                  </div>
                  <button
                    onClick={() => setShowProgressReport(true)}
                    className="bg-[#0072CE] hover:bg-[#1A1F5E] text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create Report</span>
                  </button>
                </div>

                {/* Reports List */}
                <div className="space-y-4">
                  {progressReports.map(report => {
                    const goal = goals.find(g => g.id === report.goalId);
                    return (
                      <div key={report.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{goal?.title}</h3>
                            <p className="text-sm text-gray-600">
                              {report.period === 'weekly' ? 'Weekly Report' : 'Monthly Report'} • 
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
                                  <span className="text-green-600 mt-0.5">•</span>
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
                                  <span className="text-yellow-600 mt-0.5">•</span>
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
                                  <span className="text-[#0072CE] mt-0.5">•</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {report.mentorFeedback && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-2">Mentor Feedback</h4>
                            <p className="text-sm text-gray-700 bg-[#F4F4F4] p-3 rounded-lg">{report.mentorFeedback}</p>
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
                          className={`rounded-xl border-2 p-6 hover:shadow-lg transition-all ${
                            path.enrolled ? 'bg-[#0072CE]/10 border-[#0072CE]/40' : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-xl font-semibold text-gray-900">{path.title}</h3>
                                {path.enrolled && (
                                  <span className="bg-[#1A1F5E]/10 text-[#1A1F5E] px-2 py-1 rounded-full text-xs font-medium">
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
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-[#0072CE] to-[#1A1F5E] h-2 rounded-full"
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
                                  className={`flex items-center justify-between p-3 rounded-lg ${
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
                                      <p className="text-xs text-gray-600">{module.resources.length} resources • {module.duration}</p>
                                    </div>
                                  </div>
                                  {module.assessment && !module.assessment.completed && (
                                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-medium">
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
                                alert('🎉 Enrolled in ' + path.title + '!');
                              }
                            }}
                            className={`w-full py-2 rounded-lg font-medium transition-colors ${
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

                    <div className="bg-gradient-to-r from-[#0072CE] to-[#1A1F5E] rounded-2xl p-8 text-white mb-6">
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
                      <div className="w-full bg-[#0072CE] rounded-full h-3 mt-6">
                        <div
                          className="bg-white h-3 rounded-full transition-all"
                          style={{ width: `${selectedLearningPath.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Modules List */}
                    <div className="space-y-4">
                      {selectedLearningPath.modules.map((module, idx) => (
                        <div key={module.id} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                          <button
                            onClick={() => setSelectedModule(selectedModule?.id === module.id ? null : module)}
                            className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4 flex-1">
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
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
                                        ✓ Completed {new Date(module.completedDate).toLocaleDateString()}
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
                                    className="bg-white rounded-lg border border-gray-200 p-4 hover:border-[#0072CE]/40 hover:shadow-md transition-all text-left"
                                  >
                                    <div className="flex items-start space-x-3">
                                      <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
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
                                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h5 className="font-semibold text-gray-900 mb-1">{module.assessment.title}</h5>
                                      <p className="text-sm text-gray-600 mb-2">
                                        {module.assessment.questions} questions • Passing score: {module.assessment.passingScore}%
                                      </p>
                                      {module.assessment.attempts > 0 && (
                                        <p className="text-xs text-gray-500">
                                          Attempts: {module.assessment.attempts} • Best score: {module.assessment.bestScore}%
                                        </p>
                                      )}
                                    </div>
                                    <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
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
                <div className="text-center py-12">
                  <div className="max-w-2xl mx-auto">
                    <div className="w-24 h-24 bg-[#1A1F5E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V5C19 3.89543 18.1046 3 17 3Z" fill="#5059C9"/>
                        <path d="M9 7H15M9 11H15M9 15H12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Schedule Feedback Session via Microsoft Teams</h2>
                    <p className="text-lg text-gray-600 mb-8">
                      For feedback discussions, performance reviews, and mentorship conversations, please use Microsoft Teams.
                    </p>
                    
                    <div className="bg-[#F4F4F4] border-2 border-[#0072CE]/30 rounded-xl p-8 mb-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">What to discuss in Teams:</h3>
                      <div className="grid md:grid-cols-2 gap-4 text-left">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-[#0072CE] mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">Session feedback and ratings</span>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-[#0072CE] mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">360-degree feedback reviews</span>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-[#0072CE] mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">Performance evaluations</span>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-[#0072CE] mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">Goal progress discussions</span>
                        </div>
                      </div>
                    </div>

                    <a
                      href="https://teams.microsoft.com/l/meetup-join/19%3ameeting_feedback_session"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-3 bg-gradient-to-r from-[#0072CE] to-[#1A1F5E] hover:opacity-90 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                    >
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V5C19 3.89543 18.1046 3 17 3Z"/>
                      </svg>
                      <span>Open Microsoft Teams</span>
                      <ChevronRight className="w-5 h-5" />
                    </a>
                    
                    <p className="text-sm text-gray-500 mt-6">
                      Your mentor will receive a notification. You can also schedule meetings directly from your Teams calendar.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Goal Details Modal */}
      {selectedGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
              <div className="bg-[#F4F4F4] rounded-xl p-6">
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
                    <div key={milestone.id} className="border border-gray-200 rounded-lg">
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
                            className="w-5 h-5 text-green-600 rounded cursor-pointer"
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
                                className="flex items-center space-x-3 bg-white p-3 rounded-lg hover:shadow-sm transition-shadow"
                              >
                                <input
                                  type="checkbox"
                                  checked={task.completed}
                                  onChange={() => handleTaskToggle(task.id, milestone.id, task.id)}
                                  className="w-4 h-4 text-[#0072CE] rounded cursor-pointer"
                                />
                                <span className={`flex-1 text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                  {task.title}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${
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
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Mentorship Resources & Guides</h2>
              <p className="text-gray-600">Educational articles and best practices to enhance your mentorship journey</p>
            </div>

            {/* Mentorship Mixer Article */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="bg-gradient-to-r from-[#0072CE] to-[#1A1F5E] p-8 rounded-t-xl">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Mentorship Mixer: Navigating Common Scenarios</h3>
                    <p className="text-white/80">Interactive scenarios and best practices</p>
                  </div>
                </div>
              </div>
              <div className="p-8 prose max-w-none">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-3">Understanding Mentorship Dynamics</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Effective mentorship requires navigating complex interpersonal situations with empathy, wisdom, and adaptability. 
                      This guide explores common scenarios you'll encounter and provides evidence-based approaches to handle them successfully.
                    </p>
                  </div>

                  <div className="bg-[#F4F4F4] border-l-4 border-[#0072CE] p-6 rounded-r-lg">
                    <h5 className="font-bold text-[#1A1F5E] mb-3 flex items-center">
                      <span className="w-8 h-8 bg-[#0072CE] text-white rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                      Scenario: First Meeting Nerves
                    </h5>
                    <p className="text-gray-800 mb-4">
                      <strong>Situation:</strong> Your mentee arrives for the first session appearing nervous, giving short answers, 
                      and avoiding eye contact. The conversation feels forced and uncomfortable.
                    </p>
                    <div className="bg-white rounded-lg p-4 mb-3">
                      <p className="font-semibold text-gray-900 mb-2">❌ What NOT to do:</p>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        <li>Jump straight into setting ambitious goals without building rapport</li>
                        <li>Interpret their nervousness as disinterest or lack of commitment</li>
                        <li>Dominate the conversation with your own achievements</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="font-semibold text-green-900 mb-2">✓ Best Approach:</p>
                      <ul className="list-disc list-inside text-gray-800 space-y-2">
                        <li><strong>Share your own first-time experiences:</strong> Vulnerability builds connection. Talk about your own nervousness when starting similar relationships.</li>
                        <li><strong>Use icebreaker activities:</strong> Start with low-stakes questions about interests, hobbies, or recent experiences.</li>
                        <li><strong>Establish psychological safety:</strong> Explicitly state that this is a judgment-free zone where all questions are welcome.</li>
                        <li><strong>Ask open-ended questions:</strong> Instead of "Did you prepare?" try "What are you hoping to get out of our time together?"</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-[#F4F4F4] border-l-4 border-[#0072CE] p-6 rounded-r-lg">
                    <h5 className="font-bold text-[#1A1F5E] mb-3 flex items-center">
                      <span className="w-8 h-8 bg-[#0072CE] text-white rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                      Scenario: Dealing with Setbacks
                    </h5>
                    <p className="text-gray-800 mb-4">
                      <strong>Situation:</strong> Your mentee failed to achieve a goal you set together. They seem discouraged 
                      and are avoiding discussing what went wrong.
                    </p>
                    <div className="bg-white rounded-lg p-4 mb-3">
                      <p className="font-semibold text-gray-900 mb-2">❌ What NOT to do:</p>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        <li>Minimize their feelings with phrases like "It's not a big deal"</li>
                        <li>Simply tell them to "try harder next time"</li>
                        <li>Focus on what they did wrong</li>
                        <li>Change the subject to avoid discomfort</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="font-semibold text-green-900 mb-2">✓ Best Approach:</p>
                      <ul className="list-disc list-inside text-gray-800 space-y-2">
                        <li><strong>Normalize failure as learning:</strong> Share your own failure stories and what you learned from them.</li>
                        <li><strong>Conduct a root cause analysis together:</strong> "Let's explore what happened without judgment. What factors contributed to this outcome?"</li>
                        <li><strong>Extract the lessons:</strong> Turn setbacks into data points. "What would you do differently if you could try again?"</li>
                        <li><strong>Adjust goals collaboratively:</strong> Perhaps the goal was unrealistic, or external factors changed. Adapt together.</li>
                        <li><strong>Celebrate effort and growth:</strong> Acknowledge the courage it took to attempt the goal and any partial progress made.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-[#F4F4F4] to-[#F4F4F4] border-2 border-[#0072CE]/30 p-6 rounded-lg">
                    <h5 className="font-bold text-gray-900 mb-3">🎯 Key Principles for All Scenarios</h5>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg">
                        <h6 className="font-semibold text-[#1A1F5E] mb-2">Active Listening</h6>
                        <p className="text-sm text-gray-700">Fully focus on understanding before responding. Repeat back what you heard to confirm.</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <h6 className="font-semibold text-[#1A1F5E] mb-2">Curiosity Over Judgment</h6>
                        <p className="text-sm text-gray-700">Approach situations with genuine curiosity rather than assumptions or criticism.</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <h6 className="font-semibold text-[#1A1F5E] mb-2">Empowerment</h6>
                        <p className="text-sm text-gray-700">Guide mentees to find their own solutions rather than prescribing answers.</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <h6 className="font-semibold text-[#1A1F5E] mb-2">Cultural Sensitivity</h6>
                        <p className="text-sm text-gray-700">Be aware of different communication styles and cultural contexts.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Power of Words Article */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-8 rounded-t-xl">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">The Power of Words: Communication Mastery</h3>
                    <p className="text-green-100">How language shapes mentorship relationships</p>
                  </div>
                </div>
              </div>
              <div className="p-8 prose max-w-none">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-3">Why Words Matter in Mentorship</h4>
                    <p className="text-gray-700 leading-relaxed">
                      The language we use as mentors can either empower or diminish. Research shows that specific communication patterns 
                      significantly impact mentee confidence, engagement, and outcomes. This guide provides evidence-based language strategies 
                      to maximize the positive impact of your mentorship.
                    </p>
                  </div>

                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                    <h5 className="font-bold text-green-900 mb-4 text-lg flex items-center">
                      <span className="text-2xl mr-3">✓</span>
                      Empowering Phrases to Use
                    </h5>
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-5 shadow-sm">
                        <p className="font-semibold text-green-900 text-lg mb-2">"What are your thoughts on this?"</p>
                        <p className="text-gray-700 mb-3"><strong>Why it works:</strong> This invites their perspective and shows you value their input as equally important.</p>
                        <p className="text-sm text-gray-600 italic">Use when: Discussing options, solving problems, or making decisions together.</p>
                      </div>

                      <div className="bg-white rounded-lg p-5 shadow-sm">
                        <p className="font-semibold text-green-900 text-lg mb-2">"I believe in your ability to..."</p>
                        <p className="text-gray-700 mb-3"><strong>Why it works:</strong> Explicit expressions of confidence boost self-efficacy and motivation.</p>
                        <p className="text-sm text-gray-600 italic">Use when: Your mentee is doubting themselves or facing a challenging task.</p>
                      </div>

                      <div className="bg-white rounded-lg p-5 shadow-sm">
                        <p className="font-semibold text-green-900 text-lg mb-2">"Let's explore this together"</p>
                        <p className="text-gray-700 mb-3"><strong>Why it works:</strong> Creates partnership and shared learning rather than a hierarchical dynamic.</p>
                        <p className="text-sm text-gray-600 italic">Use when: Entering unfamiliar territory or tackling complex problems.</p>
                      </div>

                      <div className="bg-white rounded-lg p-5 shadow-sm">
                        <p className="font-semibold text-green-900 text-lg mb-2">"Tell me more about..."</p>
                        <p className="text-gray-700 mb-3"><strong>Why it works:</strong> Shows genuine interest and encourages deeper sharing.</p>
                        <p className="text-sm text-gray-600 italic">Use when: Your mentee mentions something significant but doesn't elaborate.</p>
                      </div>

                      <div className="bg-white rounded-lg p-5 shadow-sm">
                        <p className="font-semibold text-green-900 text-lg mb-2">"I notice you've grown in..."</p>
                        <p className="text-gray-700 mb-3"><strong>Why it works:</strong> Specific recognition of progress reinforces positive behaviors and builds confidence.</p>
                        <p className="text-sm text-gray-600 italic">Use when: You observe improvement in specific skills or behaviors.</p>
                      </div>

                      <div className="bg-white rounded-lg p-5 shadow-sm">
                        <p className="font-semibold text-green-900 text-lg mb-2">"What support do you need from me?"</p>
                        <p className="text-gray-700 mb-3"><strong>Why it works:</strong> Puts them in control of the mentorship and shows you're there to serve their needs.</p>
                        <p className="text-sm text-gray-600 italic">Use when: Setting up new goals or when they seem stuck.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                    <h5 className="font-bold text-red-900 mb-4 text-lg flex items-center">
                      <span className="text-2xl mr-3">✗</span>
                      Phrases to Avoid
                    </h5>
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-5 shadow-sm border-l-4 border-red-400">
                        <p className="font-semibold text-red-900 text-lg mb-2">"You should just..."</p>
                        <p className="text-gray-700 mb-2"><strong>Why it's problematic:</strong> Dismisses their perspective and sounds prescriptive rather than collaborative.</p>
                        <p className="text-green-700 font-medium">Better alternative: "Have you considered..." or "One option might be..."</p>
                      </div>

                      <div className="bg-white rounded-lg p-5 shadow-sm border-l-4 border-red-400">
                        <p className="font-semibold text-red-900 text-lg mb-2">"That's wrong" or "You're wrong"</p>
                        <p className="text-gray-700 mb-2"><strong>Why it's problematic:</strong> Shuts down conversation, discourages future sharing, and damages psychological safety.</p>
                        <p className="text-green-700 font-medium">Better alternative: "I see it differently..." or "Another perspective is..."</p>
                      </div>

                      <div className="bg-white rounded-lg p-5 shadow-sm border-l-4 border-red-400">
                        <p className="font-semibold text-red-900 text-lg mb-2">"When I was your age..."</p>
                        <p className="text-gray-700 mb-2"><strong>Why it's problematic:</strong> Centers the conversation on you rather than them, and different contexts make direct comparisons unhelpful.</p>
                        <p className="text-green-700 font-medium">Better alternative: "I once faced something similar..." (if truly relevant)</p>
                      </div>

                      <div className="bg-white rounded-lg p-5 shadow-sm border-l-4 border-red-400">
                        <p className="font-semibold text-red-900 text-lg mb-2">"Don't worry about it"</p>
                        <p className="text-gray-700 mb-2"><strong>Why it's problematic:</strong> Minimizes their legitimate concerns and stops them from processing emotions.</p>
                        <p className="text-green-700 font-medium">Better alternative: "That sounds challenging. What specifically concerns you?"</p>
                      </div>

                      <div className="bg-white rounded-lg p-5 shadow-sm border-l-4 border-red-400">
                        <p className="font-semibold text-red-900 text-lg mb-2">"I'm too busy for this right now"</p>
                        <p className="text-gray-700 mb-2"><strong>Why it's problematic:</strong> Signals that mentorship is a burden rather than a priority.</p>
                        <p className="text-green-700 font-medium">Better alternative: "I want to give this my full attention. Can we schedule time tomorrow?"</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-6 rounded-lg">
                    <h5 className="font-bold text-gray-900 mb-3">💡 Communication Framework: LISTEN</h5>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">L</div>
                        <div>
                          <p className="font-semibold text-gray-900">Look for non-verbal cues</p>
                          <p className="text-sm text-gray-700">Body language often communicates more than words</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">I</div>
                        <div>
                          <p className="font-semibold text-gray-900">Inquire with curiosity</p>
                          <p className="text-sm text-gray-700">Ask questions to understand, not to judge</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">S</div>
                        <div>
                          <p className="font-semibold text-gray-900">Silence your inner voice</p>
                          <p className="text-sm text-gray-700">Resist planning your response while they're speaking</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">T</div>
                        <div>
                          <p className="font-semibold text-gray-900">Take time to understand</p>
                          <p className="text-sm text-gray-700">Don't rush to solutions; fully understand the situation first</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">E</div>
                        <div>
                          <p className="font-semibold text-gray-900">Empathize genuinely</p>
                          <p className="text-sm text-gray-700">Connect with their emotions, not just their words</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">N</div>
                        <div>
                          <p className="font-semibold text-gray-900">Nod and affirm</p>
                          <p className="text-sm text-gray-700">Show you're engaged through small verbal and non-verbal acknowledgments</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Safe Space Article */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="bg-gradient-to-r from-[#0072CE] to-[#1A1F5E] p-8 rounded-t-xl">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Creating a Safe Space: Psychological Safety Guide</h3>
                    <p className="text-white/80">Building trust and confidentiality in mentorship</p>
                  </div>
                </div>
              </div>
              <div className="p-8 prose max-w-none">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-3">What is Psychological Safety?</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Psychological safety is the foundation of effective mentorship. It's the shared belief that the relationship is safe 
                      for interpersonal risk-taking—asking questions, admitting mistakes, sharing concerns, and being vulnerable without 
                      fear of judgment or negative consequences. Research by Amy Edmondson shows that psychological safety is the number 
                      one predictor of team and relationship effectiveness.
                    </p>
                  </div>

                  <div className="bg-[#F4F4F4] border-l-4 border-[#0072CE] p-6 rounded-r-lg">
                    <h5 className="font-bold text-[#1A1F5E] mb-4 text-lg">🛡️ The Pillars of Safe Space</h5>
                    <div className="space-y-4">
                      <div className="bg-white p-5 rounded-lg shadow-sm">
                        <h6 className="font-semibold text-gray-900 mb-2">1. Confidentiality</h6>
                        <p className="text-gray-700 mb-3">
                          What is shared stays between you, except in cases of harm or legal obligations. Explicitly establish 
                          confidentiality boundaries at the start and honor them absolutely.
                        </p>
                        <p className="text-sm text-[#1A1F5E] font-medium">Action: "Everything we discuss here is confidential unless you give me permission to share it or there's a safety concern."</p>
                      </div>

                      <div className="bg-white p-5 rounded-lg shadow-sm">
                        <h6 className="font-semibold text-gray-900 mb-2">2. Non-Judgment</h6>
                        <p className="text-gray-700 mb-3">
                          Approach all conversations with curiosity rather than criticism. Even when you disagree, focus on 
                          understanding their perspective before sharing yours.
                        </p>
                        <p className="text-sm text-[#1A1F5E] font-medium">Action: Replace "Why did you do that?" with "Help me understand your thinking..."</p>
                      </div>

                      <div className="bg-white p-5 rounded-lg shadow-sm">
                        <h6 className="font-semibold text-gray-900 mb-2">3. Active Support</h6>
                        <p className="text-gray-700 mb-3">
                          Demonstrate that you're invested in their success and wellbeing. This means celebrating wins, 
                          supporting through challenges, and being consistently available within agreed boundaries.
                        </p>
                        <p className="text-sm text-[#1A1F5E] font-medium">Action: "I'm here for you. What kind of support would be most helpful right now?"</p>
                      </div>

                      <div className="bg-white p-5 rounded-lg shadow-sm">
                        <h6 className="font-semibold text-gray-900 mb-2">4. Boundaries & Respect</h6>
                        <p className="text-gray-700 mb-3">
                          Healthy boundaries protect both parties. Be clear about time commitments, communication channels, 
                          and the scope of your mentorship. Respect their autonomy in all decisions.
                        </p>
                        <p className="text-sm text-[#1A1F5E] font-medium">Action: Co-create a mentorship agreement outlining expectations, boundaries, and goals.</p>
                      </div>

                      <div className="bg-white p-5 rounded-lg shadow-sm">
                        <h6 className="font-semibold text-gray-900 mb-2">5. Cultural Humility</h6>
                        <p className="text-gray-700 mb-3">
                          Recognize that your mentee's experiences, especially around identity, may be vastly different from yours. 
                          Approach cultural differences with humility and a learning mindset.
                        </p>
                        <p className="text-sm text-[#1A1F5E] font-medium">Action: "I may not fully understand your experience. Please help me understand how your background influences this situation."</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 p-6 rounded-lg">
                    <h5 className="font-bold text-gray-900 mb-4 text-lg flex items-center">
                      <span className="text-2xl mr-3">⚠️</span>
                      When to Break Confidentiality
                    </h5>
                    <p className="text-gray-700 mb-4">While confidentiality is paramount, there are specific situations where you must act:</p>
                    <ul className="space-y-2 text-gray-800">
                      <li className="flex items-start">
                        <span className="font-bold mr-2">•</span>
                        <span><strong>Immediate danger:</strong> If your mentee expresses intent to harm themselves or others</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold mr-2">•</span>
                        <span><strong>Abuse or harassment:</strong> Ongoing abuse, discrimination, or harassment situations</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold mr-2">•</span>
                        <span><strong>Legal obligations:</strong> When legally required to report (varies by jurisdiction)</span>
                      </li>
                    </ul>
                    <p className="text-sm text-gray-600 mt-4 italic">
                      Always inform your mentee about these boundaries upfront and, when possible, involve them in the process of seeking help.
                    </p>
                  </div>

                  <div className="bg-white border-2 border-[#0072CE]/30 rounded-lg p-6">
                    <h5 className="font-bold text-gray-900 mb-4 text-lg">🔑 Support Resources Available</h5>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-[#F4F4F4] p-4 rounded-lg">
                        <h6 className="font-semibold text-[#1A1F5E] mb-2">Mental Health Resources</h6>
                        <p className="text-sm text-gray-700 mb-3">Access to counseling services, employee assistance programs, and support groups</p>
                        <button className="text-[#0072CE] font-medium text-sm hover:text-[#1A1F5E]">Learn More →</button>
                      </div>

                      <div className="bg-[#F4F4F4] p-4 rounded-lg">
                        <h6 className="font-semibold text-[#1A1F5E] mb-2">Conflict Resolution</h6>
                        <p className="text-sm text-gray-700 mb-3">Mediation services for difficult mentorship situations or relationship challenges</p>
                        <button className="text-[#0072CE] font-medium text-sm hover:text-[#1A1F5E]">Get Support →</button>
                      </div>

                      <div className="bg-[#F4F4F4] p-4 rounded-lg">
                        <h6 className="font-semibold text-[#1A1F5E] mb-2">DEI Support</h6>
                        <p className="text-sm text-gray-700 mb-3">Resources for addressing bias, discrimination, or identity-related concerns</p>
                        <button className="text-[#0072CE] font-medium text-sm hover:text-[#1A1F5E]">Access Resources →</button>
                      </div>

                      <div className="bg-pink-50 p-4 rounded-lg">
                        <h6 className="font-semibold text-pink-900 mb-2">Anonymous Feedback</h6>
                        <p className="text-sm text-gray-700 mb-3">Submit concerns or feedback anonymously to program administrators</p>
                        <button className="text-pink-600 font-medium text-sm hover:text-pink-800">Submit Feedback →</button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-[#F4F4F4] to-[#F4F4F4] border-2 border-[#0072CE]/30 p-6 rounded-lg">
                    <h5 className="font-bold text-gray-900 mb-3">💭 Reflection Questions for Mentors</h5>
                    <p className="text-gray-700 mb-4">Regularly assess the psychological safety of your mentorship relationship:</p>
                    <ul className="space-y-2 text-gray-800">
                      <li className="flex items-start">
                        <span className="text-[#0072CE] font-bold mr-2">❓</span>
                        <span>Does my mentee feel comfortable admitting when they don't understand something?</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#0072CE] font-bold mr-2">❓</span>
                        <span>Can they share failures or mistakes without fear of judgment?</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#0072CE] font-bold mr-2">❓</span>
                        <span>Do they bring up difficult topics or only share "safe" information?</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#0072CE] font-bold mr-2">❓</span>
                        <span>Have I modeled vulnerability by sharing my own challenges?</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#0072CE] font-bold mr-2">❓</span>
                        <span>When was the last time I explicitly checked in on their wellbeing?</span>
                      </li>
                    </ul>
                  </div>
                </div>
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
                <p className="text-gray-600">Private space to share reflections between you and your mentor/mentee</p>
              </div>
              <button
                onClick={() => {
                  console.log('Reflection Board button clicked!');
                  setShowReflectionBoard(true);
                  console.log('showReflectionBoard set to true');
                }}
                className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>New Reflection</span>
              </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-[#F4F4F4] to-[#F4F4F4] rounded-xl p-6 border-2 border-[#0072CE]/30">
                <div className="text-4xl font-bold text-[#1A1F5E] mb-2">{activityResults.reflectionsPosted}</div>
                <div className="text-sm font-medium text-gray-700">Reflections Posted</div>
              </div>
              <div className="bg-gradient-to-br from-[#F4F4F4] to-[#F4F4F4] rounded-xl p-6 border-2 border-[#0072CE]/30">
                <div className="text-4xl font-bold text-[#1A1F5E] mb-2">{activityResults.sessionsRated}</div>
                <div className="text-sm font-medium text-gray-700">Sessions Rated</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
                <div className="text-4xl font-bold text-green-900 mb-2">{activityResults.averageRating}</div>
                <div className="text-sm font-medium text-gray-700">Avg Session Rating</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200">
                <div className="text-4xl font-bold text-orange-900 mb-2">24</div>
                <div className="text-sm font-medium text-gray-700">Days Active</div>
              </div>
            </div>

            {/* Sample Reflections */}
            <div className="space-y-6">
              {/* User Created Reflections */}
              {reflections.map((reflection) => (
                <div key={reflection.id} className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl shadow-lg border-2 border-orange-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">YOU</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-bold text-gray-900">{reflection.author}</h4>
                          <span className="px-3 py-1 bg-orange-200 text-orange-900 rounded-full text-xs font-medium">
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
                      <div className="bg-white border-l-4 border-orange-500 rounded-r-lg p-4 mb-4">
                        <h4 className="font-semibold text-orange-900 mb-2 flex items-center">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Key Takeaways
                        </h4>
                        <ul className="space-y-1">
                          {reflection.keyTakeaways.filter((t: string) => t.trim() !== '').map((takeaway: string, idx: number) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start">
                              <span className="text-orange-600 mr-2">✓</span>
                              <span>{takeaway}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {reflection.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {reflection.tags.map((tag: string, idx: number) => (
                          <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Reflection 1 - Mentee */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#0072CE] to-[#1A1F5E] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">M</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-bold text-gray-900">Mentee Reflection</h4>
                        <span className="px-3 py-1 bg-[#1A1F5E]/10 text-[#1A1F5E] rounded-full text-xs font-medium">
                          Goal Progress
                        </span>
                        <span className="text-sm text-gray-500">2 days ago</span>
                      </div>
                      <div className="flex items-center space-x-2 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < 5 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Breakthrough Session on Leadership Communication</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Today's session was transformative. We discussed how to handle difficult conversations with team members, 
                    and my mentor shared a framework for approaching conflict with curiosity instead of defensiveness. 
                    I practiced using "I" statements and asking clarifying questions. This shift in mindset has already 
                    changed how I'm thinking about an upcoming conversation with a colleague.
                  </p>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-r-lg p-4 mb-4">
                    <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Key Takeaways
                    </h4>
                    <ul className="space-y-1">
                      <li className="text-sm text-gray-700 flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>Replace "You always..." with "I notice..." statements</span>
                      </li>
                      <li className="text-sm text-gray-700 flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>Ask "Help me understand..." to show curiosity</span>
                      </li>
                      <li className="text-sm text-gray-700 flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>Practice the conversation beforehand with a trusted friend</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">#communication</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">#leadership</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">#conflict-resolution</span>
                  </div>
                </div>
              </div>

              {/* Reflection 2 - Mentor Response */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ml-12">
                <div className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#0072CE] to-[#1A1F5E] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">M</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="font-bold text-gray-900">Mentor Response</h4>
                        <span className="px-3 py-1 bg-[#1A1F5E]/10 text-[#1A1F5E] rounded-full text-xs font-medium">
                          Feedback
                        </span>
                        <span className="text-sm text-gray-500">1 day ago</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed">
                    I'm so proud of how you're implementing these concepts! The shift from defensive to curious is exactly 
                    what transforms relationships. Remember, it's okay if the conversation doesn't go perfectly—what matters 
                    is your intention and approach. Let me know how it goes, and we can debrief in our next session.
                  </p>
                </div>
              </div>

              {/* Reflection 3 - Anonymous Mentee */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-bold text-gray-900">Anonymous</h4>
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                          Challenge
                        </span>
                        <span className="text-sm text-gray-500">1 week ago</span>
                      </div>
                      <div className="flex items-center space-x-2 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Struggling with Imposter Syndrome</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    I finally opened up about feeling like a fraud despite my accomplishments. My mentor shared that even 
                    senior leaders experience this, which was validating. We identified that my imposter syndrome spikes 
                    when I'm learning something new—which is actually a sign I'm growing, not failing. This reframe was powerful.
                  </p>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-r-lg p-4 mb-4">
                    <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Action Items
                    </h4>
                    <ul className="space-y-1">
                      <li className="text-sm text-gray-700 flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>Start a "wins journal" to track accomplishments</span>
                      </li>
                      <li className="text-sm text-gray-700 flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>Recognize discomfort as a growth signal, not failure</span>
                      </li>
                      <li className="text-sm text-gray-700 flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>Share my learning journey to help normalize struggles</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">#imposter-syndrome</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">#growth-mindset</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">#self-confidence</span>
                  </div>
                </div>
              </div>

              {/* Empty State Prompt */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-8 text-center">
                <Lightbulb className="w-16 h-16 text-orange-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Ready to reflect on your latest session?</h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Reflections help you process learnings, track growth, and strengthen your mentorship relationship. 
                  Share insights, challenges, or breakthroughs from your sessions.
                </p>
                <button
                  onClick={() => setShowReflectionBoard(true)}
                  className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all inline-flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Write a Reflection</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PROGRESS REPORT MODAL */}
      {showProgressReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-green-600 to-teal-600">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-[#1A1F5E]"
                  >
                    <option value="">Choose a goal to report on...</option>
                    {goals.map(goal => (
                      <option key={goal.id} value={goal.id}>
                        {goal.title} - {goal.progress}% complete
                      </option>
                    ))}
                  </select>
                  {newReport.goalId && (
                    <div className="mt-3 p-4 bg-[#F4F4F4] border border-[#0072CE]/30 rounded-lg">
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
                              <span className={`px-2 py-0.5 rounded ${
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-[#1A1F5E]"
                    >
                      <option value="weekly">📅 Weekly Report</option>
                      <option value="monthly">📊 Monthly Report</option>
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-[#1A1F5E]"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-[#1A1F5E]"
                    />
                  </div>
                </div>

                {/* Achievements */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    🎉 Mentee's Key Achievements
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newReport.achievements[0]}
                      onChange={(e) => setNewReport({...newReport, achievements: [e.target.value, newReport.achievements[1], newReport.achievements[2]]})}
                      placeholder="Achievement 1 (e.g., Mentee completed milestone X)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-[#1A1F5E]"
                    />
                    <input
                      type="text"
                      value={newReport.achievements[1]}
                      onChange={(e) => setNewReport({...newReport, achievements: [newReport.achievements[0], e.target.value, newReport.achievements[2]]})}
                      placeholder="Achievement 2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-[#1A1F5E]"
                    />
                    <input
                      type="text"
                      value={newReport.achievements[2]}
                      onChange={(e) => setNewReport({...newReport, achievements: [newReport.achievements[0], newReport.achievements[1], e.target.value]})}
                      placeholder="Achievement 3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-[#1A1F5E]"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">What did the mentee accomplish during this period?</p>
                </div>

                {/* Challenges */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    ⚠️ Challenges Faced by Mentee
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newReport.challenges[0]}
                      onChange={(e) => setNewReport({...newReport, challenges: [e.target.value, newReport.challenges[1]]})}
                      placeholder="Challenge 1 (e.g., Mentee struggling with time management)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-[#1A1F5E]"
                    />
                    <input
                      type="text"
                      value={newReport.challenges[1]}
                      onChange={(e) => setNewReport({...newReport, challenges: [newReport.challenges[0], e.target.value]})}
                      placeholder="Challenge 2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-[#1A1F5E]"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">What obstacles did the mentee encounter?</p>
                </div>

                {/* Next Steps */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    🎯 Recommended Next Steps for Mentee
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newReport.nextSteps[0]}
                      onChange={(e) => setNewReport({...newReport, nextSteps: [e.target.value, newReport.nextSteps[1], newReport.nextSteps[2]]})}
                      placeholder="Next step 1 (e.g., Recommend mentee focus on milestone Y)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-[#1A1F5E]"
                    />
                    <input
                      type="text"
                      value={newReport.nextSteps[1]}
                      onChange={(e) => setNewReport({...newReport, nextSteps: [newReport.nextSteps[0], e.target.value, newReport.nextSteps[2]]})}
                      placeholder="Next step 2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-[#1A1F5E]"
                    />
                    <input
                      type="text"
                      value={newReport.nextSteps[2]}
                      onChange={(e) => setNewReport({...newReport, nextSteps: [newReport.nextSteps[0], newReport.nextSteps[1], e.target.value]})}
                      placeholder="Next step 3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-[#1A1F5E]"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">What are the recommended action items for the mentee's next period?</p>
                </div>

                {/* Overall Feedback */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    💭 Mentor's Overall Assessment
                  </label>
                  <textarea
                    rows={4}
                    value={newReport.menteeFeedback}
                    onChange={(e) => setNewReport({...newReport, menteeFeedback: e.target.value})}
                    placeholder="Share your observations on the mentee's progress, growth areas, strengths demonstrated, and recommendations for continued development..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-[#1A1F5E] resize-none"
                  />
                </div>

                {/* Goal Progress Preview */}
                {newReport.goalId && (
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200 rounded-xl p-6">
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
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-teal-500 h-3 rounded-full transition-all"
                              style={{ width: `${selectedGoal.progress}%` }}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="bg-white rounded-lg p-3">
                              <p className="text-xs text-gray-600 mb-1">Milestones</p>
                              <p className="text-lg font-bold text-gray-900">
                                {selectedGoal.milestones.filter(m => m.completed).length} / {selectedGoal.milestones.length}
                              </p>
                            </div>
                            <div className="bg-white rounded-lg p-3">
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
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateReport}
                    className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
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
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-[#0072CE] to-[#1A1F5E]">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E] resize-none"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                    >
                      <option value="high">🔴 High Priority</option>
                      <option value="medium">🟡 Medium Priority</option>
                      <option value="low">🟢 Low Priority</option>
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                    />
                    <p className="text-xs text-gray-500 mt-1">When do you want to achieve this goal?</p>
                  </div>

                  {/* Review Frequency */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Review Frequency
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E] resize-none"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                      />
                      <input
                        type="date"
                        value={newGoal.actionStepDates[0]}
                        onChange={(e) => setNewGoal({...newGoal, actionStepDates: [e.target.value, newGoal.actionStepDates[1], newGoal.actionStepDates[2]]})}
                        placeholder="Due date"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={newGoal.actionSteps[1]}
                        onChange={(e) => setNewGoal({...newGoal, actionSteps: [newGoal.actionSteps[0], e.target.value, newGoal.actionSteps[2]]})}
                        placeholder="Milestone 2"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                      />
                      <input
                        type="date"
                        value={newGoal.actionStepDates[1]}
                        onChange={(e) => setNewGoal({...newGoal, actionStepDates: [newGoal.actionStepDates[0], e.target.value, newGoal.actionStepDates[2]]})}
                        placeholder="Due date"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={newGoal.actionSteps[2]}
                        onChange={(e) => setNewGoal({...newGoal, actionSteps: [newGoal.actionSteps[0], newGoal.actionSteps[1], e.target.value]})}
                        placeholder="Milestone 3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                      />
                      <input
                        type="date"
                        value={newGoal.actionStepDates[2]}
                        onChange={(e) => setNewGoal({...newGoal, actionStepDates: [newGoal.actionStepDates[0], newGoal.actionStepDates[1], e.target.value]})}
                        placeholder="Due date"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E] resize-none"
                  />
                </div>

                {/* SMART Goal Summary */}
                <div className="bg-gradient-to-r from-[#F4F4F4] to-[#F4F4F4] border-2 border-[#0072CE]/30 rounded-xl p-6">
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
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateGoal}
                    className="flex-1 bg-gradient-to-r from-[#0072CE] to-[#1A1F5E] hover:opacity-90 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
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
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                        className={`w-16 h-16 rounded-xl border-2 transition-all flex items-center justify-center font-bold text-xl ${
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                    placeholder="Share what you appreciated about this session..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Areas for improvement</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                    placeholder="Any suggestions for future sessions..."
                  />
                </div>
                <button 
                  onClick={() => {
                    setActivityResults({...activityResults, sessionsRated: activityResults.sessionsRated + 1});
                    setShowSessionRating(false);
                    alert('Thank you for your feedback! Your rating has been recorded.');
                  }}
                  className="w-full bg-[#0072CE] hover:bg-[#1A1F5E] text-white px-6 py-4 rounded-lg font-semibold transition-colors text-lg"
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
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
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
                <div className="bg-[#F4F4F4] rounded-xl p-6 border border-[#0072CE]/30">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-[#0072CE] text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <h3 className="font-bold text-gray-900">First Meeting Nerves</h3>
                  </div>
                  <p className="text-gray-700 mb-4">Your mentee seems nervous and quiet. What's the best approach?</p>
                  <div className="space-y-2">
                    <button className="w-full text-left p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-[#0072CE] transition-all">
                      <div className="font-medium text-gray-900">A) Jump straight into setting goals</div>
                    </button>
                    <button className="w-full text-left p-4 bg-white border-2 border-[#0072CE] bg-[#F4F4F4] rounded-lg">
                      <div className="font-medium text-[#1A1F5E] flex items-center justify-between">
                        <span>B) Share your own experiences to build rapport</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Best Choice</span>
                      </div>
                    </button>
                    <button className="w-full text-left p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-[#0072CE] transition-all">
                      <div className="font-medium text-gray-900">C) Ask open-ended questions</div>
                    </button>
                  </div>
                </div>

                <div className="bg-[#F4F4F4] rounded-xl p-6 border border-[#0072CE]/30">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-[#0072CE] text-white rounded-full flex items-center justify-center font-bold">2</div>
                    <h3 className="font-bold text-gray-900">Dealing with Setbacks</h3>
                  </div>
                  <p className="text-gray-700 mb-4">Your mentee didn't achieve their goal. How do you respond?</p>
                  <div className="space-y-2">
                    <button className="w-full text-left p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-[#0072CE] transition-all">
                      <div className="font-medium text-gray-900">A) Tell them to try harder</div>
                    </button>
                    <button className="w-full text-left p-4 bg-white border-2 border-[#0072CE] bg-[#F4F4F4] rounded-lg">
                      <div className="font-medium text-[#1A1F5E] flex items-center justify-between">
                        <span>B) Help them analyze and learn from it</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Best Choice</span>
                      </div>
                    </button>
                    <button className="w-full text-left p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-[#0072CE] transition-all">
                      <div className="font-medium text-gray-900">C) Change the subject</div>
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setActivityResults({...activityResults, mixerScenarios: activityResults.mixerScenarios + 2});
                    setShowMentorshipMixer(false);
                    alert('Great job! You completed 2 scenarios. Keep practicing to improve your mentorship skills.');
                  }}
                  className="w-full bg-[#0072CE] hover:bg-[#1A1F5E] text-white px-6 py-3 rounded-lg font-semibold"
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
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
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
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">✓</div>
                    <h3 className="text-xl font-bold text-green-900">Empowering Phrases</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="font-semibold text-green-900 mb-1">"What are your thoughts on this?"</div>
                      <div className="text-sm text-gray-600">Invites their perspective and shows you value their input</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="font-semibold text-green-900 mb-1">"I believe in your ability to..."</div>
                      <div className="text-sm text-gray-600">Builds confidence and shows trust</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="font-semibold text-green-900 mb-1">"Let's explore this together"</div>
                      <div className="text-sm text-gray-600">Creates partnership and shared learning</div>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-lg">✗</div>
                    <h3 className="text-xl font-bold text-red-900">Phrases to Avoid</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4 border border-red-200">
                      <div className="font-semibold text-red-900 mb-1">"You should just..."</div>
                      <div className="text-sm text-gray-600">Dismisses their perspective and sounds prescriptive</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-red-200">
                      <div className="font-semibold text-red-900 mb-1">"That's wrong"</div>
                      <div className="text-sm text-gray-600">Shuts down conversation and discourages sharing</div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setActivityResults({...activityResults, wordsLearned: activityResults.wordsLearned + 5});
                    setShowPowerOfWords(false);
                    alert('Excellent! You learned 5 new empowering phrases. Keep using positive language!');
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
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
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-orange-500 to-amber-600">
              <div>
                <h2 className="text-2xl font-bold text-white">Reflection Board</h2>
                <p className="text-orange-100 text-sm">Share your mentorship journey and learn from others</p>
              </div>
              <button
                onClick={() => setShowReflectionBoard(false)}
                className="text-white hover:text-orange-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8">
              {/* Reflection Prompt Suggestions */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-6 mb-6">
                <div className="flex items-start space-x-3 mb-4">
                  <Lightbulb className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Need Inspiration? Try These Prompts:</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      <button className="text-left bg-white hover:bg-orange-50 border border-orange-200 rounded-lg p-3 transition-all">
                        <p className="text-sm font-medium text-gray-900">💡 What was the most valuable insight from today's session?</p>
                      </button>
                      <button className="text-left bg-white hover:bg-orange-50 border border-orange-200 rounded-lg p-3 transition-all">
                        <p className="text-sm font-medium text-gray-900">🎯 Did I achieve my session goals? Why or why not?</p>
                      </button>
                      <button className="text-left bg-white hover:bg-orange-50 border border-orange-200 rounded-lg p-3 transition-all">
                        <p className="text-sm font-medium text-gray-900">🌱 How did today contribute to my growth?</p>
                      </button>
                      <button className="text-left bg-white hover:bg-orange-50 border border-orange-200 rounded-lg p-3 transition-all">
                        <p className="text-sm font-medium text-gray-900">🤔 What challenges came up and how did we address them?</p>
                      </button>
                      <button className="text-left bg-white hover:bg-orange-50 border border-orange-200 rounded-lg p-3 transition-all">
                        <p className="text-sm font-medium text-gray-900">📝 What action steps did we agree on?</p>
                      </button>
                      <button className="text-left bg-white hover:bg-orange-50 border border-orange-200 rounded-lg p-3 transition-all">
                        <p className="text-sm font-medium text-gray-900">💭 What support or resources do I need next?</p>
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
                      className={`flex items-center space-x-2 px-4 py-3 border-2 rounded-lg transition-all ${newReflection.category === 'goal-progress' ? 'border-[#0072CE]/30 bg-[#F4F4F4]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                      <Target className={`w-5 h-5 ${newReflection.category === 'goal-progress' ? 'text-[#0072CE]' : 'text-gray-600'}`} />
                      <span className={`font-medium ${newReflection.category === 'goal-progress' ? 'text-[#1A1F5E]' : 'text-gray-700'}`}>Goal Progress</span>
                    </button>
                    <button 
                      onClick={() => setNewReflection({...newReflection, category: 'communication'})}
                      className={`flex items-center space-x-2 px-4 py-3 border-2 rounded-lg transition-all ${newReflection.category === 'communication' ? 'border-[#0072CE]/30 bg-[#F4F4F4]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                      <MessageSquare className={`w-5 h-5 ${newReflection.category === 'communication' ? 'text-[#0072CE]' : 'text-gray-600'}`} />
                      <span className={`font-medium ${newReflection.category === 'communication' ? 'text-[#1A1F5E]' : 'text-gray-700'}`}>Communication</span>
                    </button>
                    <button 
                      onClick={() => setNewReflection({...newReflection, category: 'skills-learned'})}
                      className={`flex items-center space-x-2 px-4 py-3 border-2 rounded-lg transition-all ${newReflection.category === 'skills-learned' ? 'border-[#0072CE]/30 bg-[#F4F4F4]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                      <TrendingUp className={`w-5 h-5 ${newReflection.category === 'skills-learned' ? 'text-[#0072CE]' : 'text-gray-600'}`} />
                      <span className={`font-medium ${newReflection.category === 'skills-learned' ? 'text-[#1A1F5E]' : 'text-gray-700'}`}>Skills Learned</span>
                    </button>
                    <button 
                      onClick={() => setNewReflection({...newReflection, category: 'relationship'})}
                      className={`flex items-center space-x-2 px-4 py-3 border-2 rounded-lg transition-all ${newReflection.category === 'relationship' ? 'border-[#0072CE]/30 bg-[#F4F4F4]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                      <Users className={`w-5 h-5 ${newReflection.category === 'relationship' ? 'text-[#0072CE]' : 'text-gray-600'}`} />
                      <span className={`font-medium ${newReflection.category === 'relationship' ? 'text-[#1A1F5E]' : 'text-gray-700'}`}>Relationship</span>
                    </button>
                    <button 
                      onClick={() => setNewReflection({...newReflection, category: 'challenge'})}
                      className={`flex items-center space-x-2 px-4 py-3 border-2 rounded-lg transition-all ${newReflection.category === 'challenge' ? 'border-[#0072CE]/30 bg-[#F4F4F4]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                      <AlertCircle className={`w-5 h-5 ${newReflection.category === 'challenge' ? 'text-[#0072CE]' : 'text-gray-600'}`} />
                      <span className={`font-medium ${newReflection.category === 'challenge' ? 'text-[#1A1F5E]' : 'text-gray-700'}`}>Challenge</span>
                    </button>
                    <button 
                      onClick={() => setNewReflection({...newReflection, category: 'success'})}
                      className={`flex items-center space-x-2 px-4 py-3 border-2 rounded-lg transition-all ${newReflection.category === 'success' ? 'border-[#0072CE]/30 bg-[#F4F4F4]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                      <CheckCircle className={`w-5 h-5 ${newReflection.category === 'success' ? 'text-[#0072CE]' : 'text-gray-600'}`} />
                      <span className={`font-medium ${newReflection.category === 'success' ? 'text-[#1A1F5E]' : 'text-gray-700'}`}>Success</span>
                    </button>
                    <button 
                      onClick={() => setNewReflection({...newReflection, category: 'insight'})}
                      className={`flex items-center space-x-2 px-4 py-3 border-2 rounded-lg transition-all ${newReflection.category === 'insight' ? 'border-[#0072CE]/30 bg-[#F4F4F4]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                      <Lightbulb className={`w-5 h-5 ${newReflection.category === 'insight' ? 'text-[#0072CE]' : 'text-gray-600'}`} />
                      <span className={`font-medium ${newReflection.category === 'insight' ? 'text-[#1A1F5E]' : 'text-gray-700'}`}>Insight</span>
                    </button>
                    <button 
                      onClick={() => setNewReflection({...newReflection, category: 'learning'})}
                      className={`flex items-center space-x-2 px-4 py-3 border-2 rounded-lg transition-all ${newReflection.category === 'learning' ? 'border-[#0072CE]/30 bg-[#F4F4F4]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
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
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="First key learning or action item"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <input
                        type="text"
                        value={newReflection.keyTakeaways[1]}
                        onChange={(e) => setNewReflection({...newReflection, keyTakeaways: [newReflection.keyTakeaways[0], e.target.value, newReflection.keyTakeaways[2]]})}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="Second key learning or action item"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <input
                        type="text"
                        value={newReflection.keyTakeaways[2]}
                        onChange={(e) => setNewReflection({...newReflection, keyTakeaways: [newReflection.keyTakeaways[0], newReflection.keyTakeaways[1], e.target.value]})}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., communication, leadership, feedback, growth-mindset"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
                </div>
                </div>

                {/* Privacy Options */}
                <div className="bg-[#F4F4F4] border-2 border-[#0072CE]/30 rounded-lg p-5">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={newReflection.isAnonymous}
                      onChange={(e) => setNewReflection({...newReflection, isAnonymous: e.target.checked})}
                      className="mt-1 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
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
                    className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCreateReflection}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
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
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-[#0072CE] to-[#1A1F5E]">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
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
                      className="absolute top-0 left-0 w-full h-full rounded-lg"
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
                    <div className="bg-[#F4F4F4] border-l-4 border-[#0072CE] p-6 mb-6 rounded-r-lg">
                      <div className="flex items-center space-x-2 text-sm text-[#1A1F5E] mb-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{selectedResource.author || 'Unknown Author'}</span>
                        <span className="text-[#0072CE]">•</span>
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

                          <div className="bg-gradient-to-r from-[#F4F4F4] to-[#F4F4F4] border-l-4 border-[#0072CE] p-6 rounded-r-lg my-6">
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
                              <div className="bg-white border-2 border-gray-200 rounded-lg p-5">
                                <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                  Foundation Building
                                </h5>
                                <p className="text-sm text-gray-600 leading-6">
                                  Establish strong fundamentals through consistent practice and iterative learning approaches.
                                </p>
                              </div>
                              <div className="bg-white border-2 border-gray-200 rounded-lg p-5">
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
                                <span className="flex-shrink-0 w-8 h-8 bg-[#0072CE] text-white rounded-full flex items-center justify-center font-bold text-sm mr-3 mt-1">1</span>
                                <div>
                                  <h5 className="font-semibold text-gray-900 mb-1">Assessment & Planning</h5>
                                  <p className="text-gray-600 leading-6">
                                    Begin by assessing your current skill level and identifying specific areas for improvement. 
                                    Create a detailed action plan with clear milestones and realistic timelines.
                                  </p>
                                </div>
                              </li>
                              <li className="flex items-start">
                                <span className="flex-shrink-0 w-8 h-8 bg-[#0072CE] text-white rounded-full flex items-center justify-center font-bold text-sm mr-3 mt-1">2</span>
                                <div>
                                  <h5 className="font-semibold text-gray-900 mb-1">Active Learning & Practice</h5>
                                  <p className="text-gray-600 leading-6">
                                    Engage with the material through hands-on practice. Apply concepts in small, manageable projects 
                                    to build confidence and understanding progressively.
                                  </p>
                                </div>
                              </li>
                              <li className="flex items-start">
                                <span className="flex-shrink-0 w-8 h-8 bg-[#0072CE] text-white rounded-full flex items-center justify-center font-bold text-sm mr-3 mt-1">3</span>
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

                          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 my-6">
                            <h4 className="text-lg font-bold text-yellow-900 mb-3 flex items-center">
                              <AlertCircle className="w-5 h-5 mr-2" />
                              Common Pitfalls to Avoid
                            </h4>
                            <ul className="space-y-2 text-yellow-800">
                              <li className="flex items-start">
                                <span className="text-yellow-600 mr-2 mt-1">•</span>
                                <span>Rushing through foundational concepts without proper understanding</span>
                              </li>
                              <li className="flex items-start">
                                <span className="text-yellow-600 mr-2 mt-1">•</span>
                                <span>Neglecting to practice regularly and consistently</span>
                              </li>
                              <li className="flex items-start">
                                <span className="text-yellow-600 mr-2 mt-1">•</span>
                                <span>Avoiding feedback or constructive criticism</span>
                              </li>
                              <li className="flex items-start">
                                <span className="text-yellow-600 mr-2 mt-1">•</span>
                                <span>Setting unrealistic expectations or timelines</span>
                              </li>
                            </ul>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Key Takeaways</h4>
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6">
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

                          <div className="bg-[#F4F4F4] border-2 border-[#0072CE]/30 rounded-lg p-6 mt-8">
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
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-4 rounded-lg font-bold text-lg flex items-center justify-center space-x-2 transition-all shadow-lg hover:shadow-xl"
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
                    className="mt-4 inline-block bg-[#0072CE] hover:bg-[#1A1F5E] text-white px-6 py-2 rounded-lg font-medium"
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
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {gameState === 'menu' && (
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-[#1A1F5E] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Mentorship Challenge</h2>
                  <p className="text-gray-600">Test your mentorship knowledge and earn points!</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <button
                    onClick={() => startGame('practice')}
                    className="bg-gradient-to-br from-[#F4F4F4] to-[#F4F4F4] border-2 border-[#0072CE]/40 rounded-xl p-8 hover:shadow-lg transition-all text-left"
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
                    className="bg-gradient-to-br from-pink-50 to-[#F4F4F4] border-2 border-pink-300 rounded-xl p-8 hover:shadow-lg transition-all text-left"
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

                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Star className="w-5 h-5 text-yellow-500 mr-2" />
                    Your Stats
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{activityResults.gameHighScore}</p>
                      <p className="text-sm text-gray-600">High Score</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{activityResults.activitiesCompleted}</p>
                      <p className="text-sm text-gray-600">Games Played</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowWordwallGame(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-all"
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
                    <span className="bg-[#1A1F5E]/10 text-[#1A1F5E] px-3 py-1 rounded-full text-sm font-medium">
                      {gameMode === 'practice' ? '🎓 Practice' : '⚡ Challenge'}
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

                <div className="bg-gradient-to-r from-[#1A1F5E]/10 to-pink-100 rounded-xl p-6 mb-6">
                  <span className="inline-block bg-white px-3 py-1 rounded-full text-xs font-medium text-[#1A1F5E] mb-3">
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
                      className={`w-full p-4 rounded-lg text-left transition-all ${
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
                        <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
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
                  <div className={`rounded-lg p-6 mb-6 ${
                    selectedAnswer === gameQuestions[currentQuestion].correctAnswer
                      ? 'bg-green-50 border-2 border-green-200'
                      : 'bg-[#F4F4F4] border-2 border-[#0072CE]/30'
                  }`}>
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center">
                      <Lightbulb className="w-5 h-5 mr-2" />
                      {selectedAnswer === gameQuestions[currentQuestion].correctAnswer ? 'Correct! 🎉' : 'Learn More'}
                    </h4>
                    <p className="text-gray-700">{gameQuestions[currentQuestion].explanation}</p>
                    {selectedAnswer === gameQuestions[currentQuestion].correctAnswer && gameMode === 'challenge' && (
                      <p className="mt-2 text-sm text-green-700 font-medium">
                        ⚡ Time bonus: +{Math.floor(timeLeft * 2)} points
                      </p>
                    )}
                  </div>
                )}

                {showFeedback && (
                  <button
                    onClick={nextQuestion}
                    className="w-full bg-gradient-to-r from-[#0072CE] to-pink-600 hover:from-[#1A1F5E] hover:to-pink-700 text-white px-6 py-4 rounded-lg font-bold text-lg transition-all shadow-lg"
                  >
                    {currentQuestion < gameQuestions.length - 1 ? 'Next Question →' : 'See Results 🏆'}
                  </button>
                )}
              </div>
            )}

            {gameState === 'results' && (
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Game Complete!</h2>
                  <p className="text-xl text-gray-600">{getScoreMessage()}</p>
                </div>

                <div className="bg-gradient-to-r from-[#1A1F5E]/10 to-pink-100 rounded-xl p-8 mb-6">
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

                {score > activityResults.gameHighScore && (
                  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6 text-center">
                    <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <p className="font-bold text-yellow-900">🎉 New High Score!</p>
                    <p className="text-sm text-yellow-800">You beat your previous record of {activityResults.gameHighScore} points!</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={resetGame}
                    className="bg-gradient-to-r from-[#0072CE] to-pink-600 hover:from-[#1A1F5E] hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={() => {
                      setShowWordwallGame(false);
                      resetGame();
                    }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-all"
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
