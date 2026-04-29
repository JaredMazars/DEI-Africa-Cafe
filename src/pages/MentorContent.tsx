import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, Save, X, BookOpen, 
  Video, HelpCircle, Target, Upload,
  Check, FileText, ChevronDown, ChevronUp
} from 'lucide-react';

interface GameQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  explanation: string;
}

interface LearningModule {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'reading' | 'exercise';
  videoUrl?: string;
  videoId?: string;
  content?: string;
  articleUrl?: string;
  duration: string;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  modules: LearningModule[];
}

const MentorContent: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'questions' | 'learning' | 'resources'>('questions');
  
  // Questions State
  const [questions, setQuestions] = useState<GameQuestion[]>([
    {
      id: '1',
      question: 'What is the most important quality in a mentor?',
      options: ['Experience', 'Active Listening', 'Authority', 'Perfection'],
      correctAnswer: 1,
      category: 'Mentorship Basics',
      explanation: 'Active listening helps mentors understand their mentees\' needs and provide relevant guidance.'
    }
  ]);
  
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    category: '',
    explanation: ''
  });

  // Learning Paths State
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([
    {
      id: '1',
      title: 'Leadership Fundamentals',
      description: 'Master the core principles of effective leadership and build essential skills to guide teams successfully',
      category: 'Leadership',
      level: 'beginner',
      modules: [
        {
          id: 'm1',
          title: 'Introduction to Leadership',
          description: 'Understanding leadership principles and the difference between management and leadership',
          type: 'video',
          videoUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
          videoId: '9bZkp7q19f0',
          duration: '28:17'
        },
        {
          id: 'm2',
          title: 'Emotional Intelligence for Leaders',
          description: 'Learn how to develop and use emotional intelligence to connect with your team',
          type: 'reading',
          articleUrl: 'https://hbr.org/2017/02/emotional-intelligence-has-12-elements-which-do-you-need-to-work-on',
          content: 'Emotional intelligence consists of self-awareness, self-management, social awareness, and relationship management. Leaders who master these areas create more cohesive and productive teams.',
          duration: '15 min'
        },
        {
          id: 'm3',
          title: 'Communication Strategies',
          description: 'Master effective communication techniques for diverse teams',
          type: 'video',
          videoUrl: 'https://www.youtube.com/watch?v=HAnw168huqA',
          videoId: 'HAnw168huqA',
          duration: '14:52'
        },
        {
          id: 'm4',
          title: 'Leadership Reflection Exercise',
          description: 'Reflect on your leadership style and identify areas for growth',
          type: 'exercise',
          content: 'Answer these questions: 1) What are your top 3 leadership strengths? 2) What challenges do you face when leading others? 3) How do you handle conflict? 4) What kind of leader do you aspire to be?',
          duration: '30 min'
        }
      ]
    },
    {
      id: '2',
      title: 'Diversity & Inclusion Essentials',
      description: 'Build awareness and skills to create inclusive environments where everyone can thrive',
      category: 'Personal Development',
      level: 'intermediate',
      modules: [
        {
          id: 'm5',
          title: 'Understanding Unconscious Bias',
          description: 'Explore how unconscious biases affect decision-making and team dynamics',
          type: 'video',
          videoUrl: 'https://www.youtube.com/watch?v=GP-cqFLS8Q4',
          videoId: 'GP-cqFLS8Q4',
          duration: '18:34'
        },
        {
          id: 'm6',
          title: 'Creating Inclusive Teams',
          description: 'Practical strategies for building and maintaining diverse, high-performing teams',
          type: 'reading',
          articleUrl: 'https://www.mckinsey.com/featured-insights/diversity-and-inclusion',
          content: 'Companies with diverse teams are 35% more likely to outperform their competitors. Learn the key practices that make inclusion actionable.',
          duration: '20 min'
        }
      ]
    }
  ]);

  const [showAddPath, setShowAddPath] = useState(false);
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [newPath, setNewPath] = useState({
    title: '',
    description: '',
    category: 'Leadership',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced'
  });

  const [newModule, setNewModule] = useState({
    title: '',
    description: '',
    type: 'video' as 'video' | 'reading' | 'exercise',
    videoUrl: '',
    articleUrl: '',
    content: '',
    duration: ''
  });

  // Question Management
  const handleSaveQuestion = () => {
    if (!newQuestion.question || newQuestion.options.some(o => !o) || !newQuestion.category) {
      alert('Please fill in all fields');
      return;
    }

    const question: GameQuestion = {
      id: Date.now().toString(),
      question: newQuestion.question,
      options: newQuestion.options,
      correctAnswer: newQuestion.correctAnswer,
      category: newQuestion.category,
      explanation: newQuestion.explanation
    };

    setQuestions([...questions, question]);
    setShowAddQuestion(false);
    setNewQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      category: '',
      explanation: ''
    });
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  // Learning Path Management
  const handleSavePath = () => {
    if (!newPath.title || !newPath.description) {
      alert('Please fill in title and description');
      return;
    }

    const path: LearningPath = {
      id: Date.now().toString(),
      ...newPath,
      modules: []
    };

    setLearningPaths([...learningPaths, path]);
    setShowAddPath(false);
    setNewPath({
      title: '',
      description: '',
      category: 'Leadership',
      level: 'beginner'
    });
  };

  const handleAddModule = (pathId: string) => {
    if (!newModule.title || !newModule.description) {
      alert('Please fill in module title and description');
      return;
    }

    const videoId = newModule.videoUrl.includes('youtube.com') || newModule.videoUrl.includes('youtu.be')
      ? newModule.videoUrl.split('v=')[1]?.split('&')[0] || newModule.videoUrl.split('youtu.be/')[1]
      : '';

    const module: LearningModule = {
      id: `m${Date.now()}`,
      ...newModule,
      videoId
    };

    setLearningPaths(learningPaths.map(path => {
      if (path.id === pathId) {
        return { ...path, modules: [...path.modules, module] };
      }
      return path;
    }));

    setNewModule({
      title: '',
      description: '',
      type: 'video',
      videoUrl: '',
      articleUrl: '',
      content: '',
      duration: ''
    });
    setEditingPath(null);
  };

  const handleDeletePath = (id: string) => {
    if (confirm('Are you sure you want to delete this learning path and all its modules?')) {
      setLearningPaths(learningPaths.filter(p => p.id !== id));
    }
  };

  const handleDeleteModule = (pathId: string, moduleId: string) => {
    if (confirm('Are you sure you want to delete this module?')) {
      setLearningPaths(learningPaths.map(path => {
        if (path.id === pathId) {
          return { ...path, modules: path.modules.filter(m => m.id !== moduleId) };
        }
        return path;
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F4F4] via-white to-[#F4F4F4] pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/my-mentees')}
            className="flex items-center gap-2 text-[#0072CE] hover:text-[#1A1F5E] mb-4 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Mentees
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-[#1A1F5E] bg-clip-text text-transparent mb-2">
                Content Management
              </h1>
              <p className="text-gray-600">
                Create and manage learning content for your mentees
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white -xl shadow-lg border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex gap-4 px-6">
              {[
                { id: 'questions', label: 'Challenge Questions', icon: HelpCircle },
                { id: 'learning', label: 'Learning Paths', icon: BookOpen },
                { id: 'resources', label: 'Resources & Guides', icon: FileText }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
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
            {/* QUESTIONS TAB */}
            {activeTab === 'questions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Mentorship Challenge Questions</h2>
                    <p className="text-gray-600 mt-1">Create interactive quiz questions for your mentees</p>
                  </div>
                  <button
                    onClick={() => setShowAddQuestion(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0072CE] hover:bg-[#1A1F5E] text-white -lg font-medium shadow-lg transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Add Question
                  </button>
                </div>

                {/* Add Question Form */}
                {showAddQuestion && (
                  <div className="bg-[#F4F4F4] border-2 border-[#0072CE]/30 -xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">New Question</h3>
                      <button
                        onClick={() => setShowAddQuestion(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <input
                          type="text"
                          value={newQuestion.category}
                          onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20"
                          placeholder="e.g., Mentorship Basics, Communication Skills"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                        <textarea
                          value={newQuestion.question}
                          onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20"
                          rows={3}
                          placeholder="Enter your question..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {newQuestion.options.map((option, index) => (
                          <div key={index}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Option {index + 1}
                              {newQuestion.correctAnswer === index && (
                                <span className="ml-2 text-green-600 text-xs">(Correct Answer)</span>
                              )}
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...newQuestion.options];
                                  newOptions[index] = e.target.value;
                                  setNewQuestion({ ...newQuestion, options: newOptions });
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20"
                                placeholder={`Option ${index + 1}`}
                              />
                              <button
                                onClick={() => setNewQuestion({ ...newQuestion, correctAnswer: index })}
                                className={`px-3 py-2 -lg transition-all ${
                                  newQuestion.correctAnswer === index
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                }`}
                              >
                                <Check className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Explanation</label>
                        <textarea
                          value={newQuestion.explanation}
                          onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20"
                          rows={2}
                          placeholder="Explain why this is the correct answer..."
                        />
                      </div>

                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => setShowAddQuestion(false)}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 -lg font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveQuestion}
                          className="flex items-center gap-2 px-4 py-2 bg-[#0072CE] hover:bg-[#1A1F5E] text-white -lg font-medium"
                        >
                          <Save className="w-4 h-4" />
                          Save Question
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Questions List */}
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div key={question.id} className="bg-white border border-gray-200 -xl p-6 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-[#1A1F5E]/10 text-[#1A1F5E] -full text-xs font-medium">
                              {question.category}
                            </span>
                            <span className="text-gray-500 text-sm">Question #{index + 1}</span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-3">{question.question}</h3>
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {question.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className={`px-3 py-2 -lg text-sm ${
                                  optIndex === question.correctAnswer
                                    ? 'bg-green-100 border-2 border-green-500 text-green-800 font-medium'
                                    : 'bg-gray-50 border border-gray-200 text-gray-700'
                                }`}
                              >
                                {option}
                                {optIndex === question.correctAnswer && (
                                  <Check className="w-4 h-4 inline ml-2 text-green-600" />
                                )}
                              </div>
                            ))}
                          </div>
                          <p className="text-sm text-gray-600 italic">
                            <strong>Explanation:</strong> {question.explanation}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-600 hover:text-red-700 p-2"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {questions.length === 0 && !showAddQuestion && (
                  <div className="text-center py-12 bg-gray-50 -xl border-2 border-dashed border-gray-300">
                    <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No questions created yet. Click "Add Question" to get started.</p>
                  </div>
                )}
              </div>
            )}

            {/* LEARNING PATHS TAB */}
            {activeTab === 'learning' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Learning Paths</h2>
                    <p className="text-gray-600 mt-1">Create structured learning journeys with videos and content</p>
                  </div>
                  <button
                    onClick={() => setShowAddPath(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0072CE] hover:bg-[#1A1F5E] text-white -lg font-medium shadow-lg transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    New Learning Path
                  </button>
                </div>

                {/* Add Path Form */}
                {showAddPath && (
                  <div className="bg-[#F4F4F4] border-2 border-[#0072CE]/30 -xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">New Learning Path</h3>
                      <button
                        onClick={() => setShowAddPath(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input
                          type="text"
                          value={newPath.title}
                          onChange={(e) => setNewPath({ ...newPath, title: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20"
                          placeholder="e.g., Leadership Fundamentals"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          value={newPath.description}
                          onChange={(e) => setNewPath({ ...newPath, description: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20"
                          rows={3}
                          placeholder="Describe what mentees will learn..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                          <select
                            value={newPath.category}
                            onChange={(e) => setNewPath({ ...newPath, category: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20"
                          >
                            <option value="Leadership">Leadership</option>
                            <option value="Technical">Technical</option>
                            <option value="Communication">Communication</option>
                            <option value="Strategy">Strategy</option>
                            <option value="Personal Development">Personal Development</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                          <select
                            value={newPath.level}
                            onChange={(e) => setNewPath({ ...newPath, level: e.target.value as any })}
                            className="w-full px-4 py-2 border border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20"
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => setShowAddPath(false)}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 -lg font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSavePath}
                          className="flex items-center gap-2 px-4 py-2 bg-[#0072CE] hover:bg-[#1A1F5E] text-white -lg font-medium"
                        >
                          <Save className="w-4 h-4" />
                          Create Path
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Learning Paths List */}
                <div className="space-y-4">
                  {learningPaths.map((path) => (
                    <div key={path.id} className="bg-white border border-gray-200 -xl overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-900">{path.title}</h3>
                              <span className={`px-3 py-1 -full text-xs font-medium ${
                                path.level === 'beginner' ? 'bg-green-100 text-green-700' :
                                path.level === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {path.level.charAt(0).toUpperCase() + path.level.slice(1)}
                              </span>
                              <span className="px-3 py-1 bg-[#1A1F5E]/10 text-[#1A1F5E] -full text-xs font-medium">
                                {path.category}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-3">{path.description}</p>
                            <p className="text-sm text-gray-500">{path.modules.length} modules</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingPath(editingPath === path.id ? null : path.id)}
                              className="text-[#0072CE] hover:text-[#1A1F5E] p-2"
                            >
                              {editingPath === path.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                            <button
                              onClick={() => handleDeletePath(path.id)}
                              className="text-red-600 hover:text-red-700 p-2"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Modules */}
                        {editingPath === path.id && (
                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <h4 className="text-lg font-bold text-gray-900 mb-4">Modules</h4>
                            
                            {/* Add Module Form */}
                            <div className="bg-gradient-to-br from-[#F4F4F4] to-[#F4F4F4] -lg p-5 mb-4 border border-[#0072CE]/30">
                              <h5 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-[#0072CE]" />
                                Add New Module
                              </h5>
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Module Title *</label>
                                    <input
                                      type="text"
                                      value={newModule.title}
                                      onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 -lg text-sm focus:ring-2 focus:ring-[#1A1F5E]/20"
                                      placeholder="e.g., Introduction to Leadership"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Type *</label>
                                    <select
                                      value={newModule.type}
                                      onChange={(e) => setNewModule({ ...newModule, type: e.target.value as any })}
                                      className="w-full px-3 py-2 border border-gray-300 -lg text-sm focus:ring-2 focus:ring-[#1A1F5E]/20"
                                    >
                                      <option value="video">📹 Video</option>
                                      <option value="reading">📄 Reading/Article</option>
                                      <option value="exercise">✍️ Exercise</option>
                                    </select>
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Description *</label>
                                  <textarea
                                    value={newModule.description}
                                    onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 -lg text-sm focus:ring-2 focus:ring-[#1A1F5E]/20"
                                    rows={2}
                                    placeholder="What will mentees learn in this module?"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      {newModule.type === 'video' ? 'YouTube URL' : 'Article URL'}
                                    </label>
                                    <input
                                      type="text"
                                      value={newModule.type === 'video' ? newModule.videoUrl : newModule.articleUrl}
                                      onChange={(e) => setNewModule({ 
                                        ...newModule, 
                                        ...(newModule.type === 'video' 
                                          ? { videoUrl: e.target.value } 
                                          : { articleUrl: e.target.value })
                                      })}
                                      className="w-full px-3 py-2 border border-gray-300 -lg text-sm focus:ring-2 focus:ring-[#1A1F5E]/20"
                                      placeholder={newModule.type === 'video' ? 'https://youtube.com/watch?v=...' : 'https://...'}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Duration</label>
                                    <input
                                      type="text"
                                      value={newModule.duration}
                                      onChange={(e) => setNewModule({ ...newModule, duration: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 -lg text-sm focus:ring-2 focus:ring-[#1A1F5E]/20"
                                      placeholder="e.g., 15:30 or 10 min"
                                    />
                                  </div>
                                </div>
                                {newModule.type === 'reading' && (
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Content/Summary (Optional)</label>
                                    <textarea
                                      value={newModule.content}
                                      onChange={(e) => setNewModule({ ...newModule, content: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 -lg text-sm focus:ring-2 focus:ring-[#1A1F5E]/20"
                                      rows={3}
                                      placeholder="Add article summary or key points..."
                                    />
                                  </div>
                                )}
                                <button
                                  onClick={() => handleAddModule(path.id)}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#0072CE] hover:bg-[#1A1F5E] text-white -lg font-medium text-sm"
                                >
                                  <Plus className="w-4 h-4" />
                                  Add Module
                                </button>
                              </div>
                            </div>

                            {/* Modules List */}
                            <div className="space-y-3">
                              {path.modules.length === 0 && (
                                <div className="text-center py-8 bg-gray-50 -lg border-2 border-dashed border-gray-300">
                                  <BookOpen className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                                  <p className="text-gray-600 text-sm">No modules yet. Add your first module above.</p>
                                </div>
                              )}
                              {path.modules.map((module, index) => (
                                <div key={module.id} className="bg-white border-2 border-gray-200 -lg p-4 hover:border-[#0072CE]/40 transition-colors">
                                  <div className="flex gap-4">
                                    {/* Module Icon/Thumbnail */}
                                    <div className="flex-shrink-0">
                                      {module.type === 'video' && module.videoId ? (
                                        <div className="relative w-32 h-20 -lg overflow-hidden group cursor-pointer">
                                          <img 
                                            src={`https://img.youtube.com/vi/${module.videoId}/mqdefault.jpg`}
                                            alt={module.title}
                                            className="w-full h-full object-cover"
                                          />
                                          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-60 transition-all">
                                            <Video className="w-8 h-8 text-white" />
                                          </div>
                                        </div>
                                      ) : (
                                        <div className={`w-20 h-20 -lg flex items-center justify-center ${
                                          module.type === 'video' ? 'bg-red-100' :
                                          module.type === 'reading' ? 'bg-[#1A1F5E]/10' : 'bg-green-100'
                                        }`}>
                                          {module.type === 'video' ? <Video className="w-8 h-8 text-red-600" /> :
                                           module.type === 'reading' ? <BookOpen className="w-8 h-8 text-[#0072CE]" /> :
                                           <Target className="w-8 h-8 text-green-600" />}
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Module Details */}
                                    <div className="flex-1">
                                      <div className="flex items-start justify-between mb-2">
                                        <div>
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-[#0072CE]">Module {index + 1}</span>
                                            <span className={`px-2 py-0.5  text-xs font-medium ${
                                              module.type === 'video' ? 'bg-red-100 text-red-700' :
                                              module.type === 'reading' ? 'bg-[#1A1F5E]/10 text-[#1A1F5E]' : 'bg-green-100 text-green-700'
                                            }`}>
                                              {module.type === 'video' ? '📹 Video' : module.type === 'reading' ? '📄 Reading' : '✍️ Exercise'}
                                            </span>
                                            {module.duration && (
                                              <span className="text-xs text-gray-500">⏱️ {module.duration}</span>
                                            )}
                                          </div>
                                          <h5 className="font-bold text-gray-900">{module.title}</h5>
                                          <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                                        </div>
                                        <button
                                          onClick={() => handleDeleteModule(path.id, module.id)}
                                          className="text-red-600 hover:text-red-700 p-1"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                      
                                      {/* Links */}
                                      <div className="flex flex-wrap gap-2 mt-3">
                                        {module.videoUrl && (
                                          <a
                                            href={module.videoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 -lg text-xs font-medium transition-colors"
                                          >
                                            <Video className="w-3 h-3" />
                                            Watch Video
                                          </a>
                                        )}
                                        {module.articleUrl && (
                                          <a
                                            href={module.articleUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 px-3 py-1 bg-[#F4F4F4] hover:bg-[#1A1F5E]/10 text-[#1A1F5E] -lg text-xs font-medium transition-colors"
                                          >
                                            <FileText className="w-3 h-3" />
                                            Read Article
                                          </a>
                                        )}
                                      </div>
                                      
                                      {/* Content Preview */}
                                      {module.content && (
                                        <div className="mt-3 p-3 bg-gray-50 -lg border border-gray-200">
                                          <p className="text-xs text-gray-600 line-clamp-2">{module.content}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {learningPaths.length === 0 && !showAddPath && (
                  <div className="text-center py-12 bg-gray-50 -xl border-2 border-dashed border-gray-300">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No learning paths created yet. Click "New Learning Path" to get started.</p>
                  </div>
                )}
              </div>
            )}

            {/* RESOURCES TAB */}
            {activeTab === 'resources' && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Resources & Guides</h3>
                <p className="text-gray-600 mb-6">Upload documents, PDFs, and other learning materials</p>
                <button className="flex items-center gap-2 px-6 py-3 bg-[#0072CE] hover:bg-[#1A1F5E] text-white -lg font-medium mx-auto">
                  <Upload className="w-5 h-5" />
                  Upload Resource
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorContent;
