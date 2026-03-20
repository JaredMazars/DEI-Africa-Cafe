import React, { useState, useEffect } from 'react';
import { Star, Coffee, MessageSquare, BookOpen, Eye, Trophy, X, ArrowLeft, RotateCcw, Clock, Target, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GameQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  explanation: string;
}

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

const MentorshipActivities: React.FC = () => {
  const navigate = useNavigate();
  const [showSessionRating, setShowSessionRating] = useState(false);
  const [showMentorshipMixer, setShowMentorshipMixer] = useState(false);
  const [showPowerOfWords, setShowPowerOfWords] = useState(false);
  const [showReflectionBoard, setShowReflectionBoard] = useState(false);
  const [showSafeSpace, setShowSafeSpace] = useState(false);
  const [showWordwallGame, setShowWordwallGame] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  
  // Game state
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'results'>('menu');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [gameMode, setGameMode] = useState<'timed' | 'practice'>('practice');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && gameMode === 'timed' && timeLeft > 0 && !showFeedback) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && gameMode === 'timed' && !showFeedback) {
      handleTimeUp();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameState, gameMode, showFeedback]);

  const startGame = (mode: 'timed' | 'practice') => {
    setGameMode(mode);
    setGameState('playing');
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(30);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowFeedback(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === gameQuestions[currentQuestion].correctAnswer;
    setAnswers(prev => [...prev, isCorrect]);
    
    if (isCorrect) {
      setScore(prev => prev + (gameMode === 'timed' ? Math.max(1, Math.floor(timeLeft / 5)) : 1));
    }
    
    setShowFeedback(true);
  };

  const handleTimeUp = () => {
    setAnswers(prev => [...prev, false]);
    setShowFeedback(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < gameQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setTimeLeft(30);
    } else {
      setGameState('results');
    }
  };

  const resetGame = () => {
    setGameState('menu');
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(30);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowFeedback(false);
  };

  const getScoreMessage = () => {
    const percentage = (score / (gameQuestions.length * (gameMode === 'timed' ? 6 : 1))) * 100;
    if (percentage >= 80) {
      return {
        title: "🏆 Mentorship Master!",
        message: "Outstanding! You've mastered the fundamentals of effective mentorship.",
        color: "from-yellow-500 to-pink-500"
      };
    } else if (percentage >= 60) {
      return {
        title: "⭐ Well Done!",
        message: "Great job! You have a solid understanding of mentorship principles.",
        color: "from-pink-500 to-pink-600"
      };
    } else {
      return {
        title: "📚 Keep Learning!",
        message: "Good effort! Review the concepts and try again to improve your score.",
        color: "from-pink-500 to-pink-700"
      };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header with Forvis Mazars Branding */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="max-w-[1920px] mx-auto px-12 sm:px-16 lg:px-20 py-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-blue-100 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-3 text-white">Mentorship Activities</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Engage with interactive tools designed to strengthen your mentorship relationship
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Activities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Session Rating */}
          <button
            onClick={() => setShowSessionRating(true)}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 hover:shadow-lg transition-all text-left group"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Star className="w-8 h-8 text-blue-900" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Rate Your Session</h3>
            <p className="text-gray-600 mb-4">Provide feedback on your mentorship sessions and help improve the program</p>
            <div className="text-blue-600 font-medium flex items-center">
              Start Activity →
            </div>
          </button>

          {/* Mentorship Mixer */}
          <button
            onClick={() => setShowMentorshipMixer(true)}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 hover:shadow-lg transition-all text-left group"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-purple-50 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Coffee className="w-8 h-8 text-blue-900" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Mentorship Mixer</h3>
            <p className="text-gray-600 mb-4">Interactive scenarios and best practices to enhance your mentoring skills</p>
            <div className="text-blue-600 font-medium flex items-center">
              Start Activity →
            </div>
          </button>

          {/* Power of Words */}
          <button
            onClick={() => setShowPowerOfWords(true)}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 hover:shadow-lg transition-all text-left group"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-green-50 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-8 h-8 text-green-900" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Power of Words</h3>
            <p className="text-gray-600 mb-4">Learn effective communication techniques to inspire and empower</p>
            <div className="text-green-600 font-medium flex items-center">
              Start Activity →
            </div>
          </button>

          {/* Reflection Board */}
          <button
            onClick={() => setShowReflectionBoard(true)}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 hover:shadow-lg transition-all text-left group"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-orange-50 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BookOpen className="w-8 h-8 text-orange-900" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Reflection Board</h3>
            <p className="text-gray-600 mb-4">Share and explore mentorship reflections with the community</p>
            <div className="text-orange-600 font-medium flex items-center">
              Start Activity →
            </div>
          </button>

          {/* Safe Space */}
          <button
            onClick={() => setShowSafeSpace(true)}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 hover:shadow-lg transition-all text-left group"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-100 to-indigo-50 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Eye className="w-8 h-8 text-indigo-900" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Safe Space</h3>
            <p className="text-gray-600 mb-4">Confidential support and resources for sensitive topics</p>
            <div className="text-indigo-600 font-medium flex items-center">
              Start Activity →
            </div>
          </button>

          {/* Wordwall Game */}
          <button
            onClick={() => setShowWordwallGame(true)}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 hover:shadow-lg transition-all text-left group"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-pink-50 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Trophy className="w-8 h-8 text-pink-900" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Wordwall Game</h3>
            <p className="text-gray-600 mb-4">Test your mentorship knowledge with fun interactive games</p>
            <div className="text-pink-600 font-medium flex items-center">
              Start Activity →
            </div>
          </button>
        </div>

        {/* Activity Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Activity Progress</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="text-4xl font-bold text-blue-900 mb-2">12</div>
              <div className="text-sm font-medium text-gray-700">Reflections Posted</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="text-4xl font-bold text-blue-900 mb-2">8</div>
              <div className="text-sm font-medium text-gray-700">Sessions Rated</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="text-4xl font-bold text-green-900 mb-2">5</div>
              <div className="text-sm font-medium text-gray-700">Activities Completed</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
              <div className="text-4xl font-bold text-orange-900 mb-2">4.8</div>
              <div className="text-sm font-medium text-gray-700">Average Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Session Rating Modal */}
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
              <p className="text-gray-600 mb-6">Rate your last mentorship session and provide feedback to help improve the program</p>
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
                            ? 'border-blue-900 bg-blue-900 text-white scale-110'
                            : 'border-gray-300 hover:border-blue-900 hover:bg-blue-50'
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Share what you appreciated about this session..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Areas for improvement</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any suggestions for future sessions..."
                  />
                </div>
                <button className="w-full bg-blue-900 hover:bg-blue-800 text-white px-6 py-4 rounded-lg font-semibold transition-colors text-lg">
                  Submit Rating
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mentorship Mixer Modal */}
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
              <p className="text-gray-600 mb-6">Interactive scenarios to improve your mentorship skills. Choose the best approach for each situation.</p>
              
              <div className="space-y-6">
                {/* Scenario 1 */}
                <div className="bg-blue-50 rounded-xl p-6 border border-purple-100">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-blue-900 text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <h3 className="font-bold text-gray-900">First Meeting Nerves</h3>
                  </div>
                  <p className="text-gray-700 mb-4">Your mentee seems nervous and quiet in your first meeting. What's the best approach?</p>
                  <div className="space-y-2">
                    <button className="w-full text-left p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-purple-900 hover:bg-blue-50 transition-all group">
                      <div className="font-medium text-gray-900 group-hover:text-blue-900">A) Jump straight into setting concrete goals</div>
                      <div className="text-sm text-gray-600 mt-1">Get right to business and establish clear objectives</div>
                    </button>
                    <button className="w-full text-left p-4 bg-white border-2 border-purple-900 bg-blue-50 rounded-lg">
                      <div className="font-medium text-blue-900 flex items-center justify-between">
                        <span>B) Share your own experiences to build rapport</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Best Choice</span>
                      </div>
                      <div className="text-sm text-gray-700 mt-1">Create a comfortable environment by being vulnerable first</div>
                    </button>
                    <button className="w-full text-left p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-purple-900 hover:bg-blue-50 transition-all group">
                      <div className="font-medium text-gray-900 group-hover:text-blue-900">C) Ask open-ended questions about their interests</div>
                      <div className="text-sm text-gray-600 mt-1">Let them talk about topics they're comfortable with</div>
                    </button>
                  </div>
                </div>

                {/* Scenario 2 */}
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-blue-900 text-white rounded-full flex items-center justify-center font-bold">2</div>
                    <h3 className="font-bold text-gray-900">Dealing with Setbacks</h3>
                  </div>
                  <p className="text-gray-700 mb-4">Your mentee didn't achieve their goal and seems discouraged. How do you respond?</p>
                  <div className="space-y-2">
                    <button className="w-full text-left p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-900 hover:bg-blue-50 transition-all group">
                      <div className="font-medium text-gray-900 group-hover:text-blue-900">A) Tell them to try harder next time</div>
                      <div className="text-sm text-gray-600 mt-1">Provide direct advice on effort</div>
                    </button>
                    <button className="w-full text-left p-4 bg-white border-2 border-blue-900 bg-blue-50 rounded-lg">
                      <div className="font-medium text-blue-900 flex items-center justify-between">
                        <span>B) Help them analyze what happened and learn from it</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Best Choice</span>
                      </div>
                      <div className="text-sm text-gray-700 mt-1">Turn setback into learning opportunity</div>
                    </button>
                    <button className="w-full text-left p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-900 hover:bg-blue-50 transition-all group">
                      <div className="font-medium text-gray-900 group-hover:text-blue-900">C) Change the subject to something positive</div>
                      <div className="text-sm text-gray-600 mt-1">Focus on their strengths instead</div>
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
                  <h4 className="font-bold text-gray-900 mb-2">💡 Pro Tip</h4>
                  <p className="text-gray-700 text-sm">
                    Great mentors create psychological safety by being authentic, listening actively, and helping mentees reframe challenges as learning opportunities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Power of Words Modal */}
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
              <p className="text-gray-600 mb-6">Learn how language shapes mentorship relationships. The words we choose can empower or discourage.</p>
              
              <div className="space-y-6">
                {/* Empowering Phrases */}
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">✓</div>
                    <h3 className="text-xl font-bold text-green-900">Empowering Phrases</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="font-semibold text-green-900 mb-1">"What are your thoughts on this?"</div>
                      <div className="text-sm text-gray-600">Invites their perspective and shows you value their input</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="font-semibold text-green-900 mb-1">"I believe in your ability to..."</div>
                      <div className="text-sm text-gray-600">Builds confidence and shows trust in their capabilities</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="font-semibold text-green-900 mb-1">"Let's explore this together"</div>
                      <div className="text-sm text-gray-600">Creates partnership and collaborative learning</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="font-semibold text-green-900 mb-1">"What did you learn from this experience?"</div>
                      <div className="text-sm text-gray-600">Encourages reflection and growth mindset</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="font-semibold text-green-900 mb-1">"How can I support you in achieving this?"</div>
                      <div className="text-sm text-gray-600">Shows commitment and opens dialogue</div>
                    </div>
                  </div>
                </div>

                {/* Phrases to Avoid */}
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-lg">✗</div>
                    <h3 className="text-xl font-bold text-red-900">Phrases to Avoid</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-red-200">
                      <div className="font-semibold text-red-900 mb-1">"You should have..."</div>
                      <div className="text-sm text-gray-600">Creates guilt and focuses on past mistakes</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-red-200">
                      <div className="font-semibold text-red-900 mb-1">"That's not how we do it"</div>
                      <div className="text-sm text-gray-600">Dismissive and shuts down creativity</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-red-200">
                      <div className="font-semibold text-red-900 mb-1">"Just do it my way"</div>
                      <div className="text-sm text-gray-600">Removes autonomy and learning opportunity</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-red-200">
                      <div className="font-semibold text-red-900 mb-1">"You're wrong about that"</div>
                      <div className="text-sm text-gray-600">Confrontational and damages trust</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-red-200">
                      <div className="font-semibold text-red-900 mb-1">"I don't have time for this"</div>
                      <div className="text-sm text-gray-600">Shows lack of commitment to the relationship</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                  <h4 className="font-bold text-gray-900 mb-2">🎯 Key Principle</h4>
                  <p className="text-gray-700">
                    Effective mentorship language focuses on growth, collaboration, and empowerment rather than judgment or directive commands.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reflection Board Modal */}
      {showReflectionBoard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Reflection Board</h2>
              <button
                onClick={() => setShowReflectionBoard(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2">
                  <BookOpen className="w-5 h-5" />
                  <span>Add Your Reflection</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Sample Reflections */}
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-full flex items-center justify-center text-white font-bold">
                      SC
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-bold text-gray-900">Sarah Chen</div>
                          <div className="text-sm text-gray-600">Mentor • 2 days ago</div>
                        </div>
                        <div className="px-3 py-1 bg-orange-200 text-orange-900 rounded-full text-xs font-semibold">
                          Leadership
                        </div>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">The Power of Active Listening</h4>
                      <p className="text-gray-700 mb-3">
                        Today's session reminded me how transformative active listening can be. By truly focusing on my mentee's words without planning my response, I noticed subtle concerns they hadn't explicitly stated. This led to a breakthrough conversation about imposter syndrome.
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <button className="flex items-center space-x-1 hover:text-orange-600">
                          <span>❤️</span>
                          <span>24</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-orange-600">
                          <span>💬</span>
                          <span>8 comments</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                      MJ
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-bold text-gray-900">Michael Johnson</div>
                          <div className="text-sm text-gray-600">Mentee • 5 days ago</div>
                        </div>
                        <div className="px-3 py-1 bg-blue-200 text-blue-900 rounded-full text-xs font-semibold">
                          Career Growth
                        </div>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Overcoming Self-Doubt</h4>
                      <p className="text-gray-700 mb-3">
                        My mentor helped me reframe my fear of taking on a leadership role. Instead of seeing it as a test I might fail, we discussed it as an opportunity to learn and grow. This shift in perspective has been game-changing for my confidence.
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <button className="flex items-center space-x-1 hover:text-blue-600">
                          <span>❤️</span>
                          <span>42</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-blue-600">
                          <span>💬</span>
                          <span>15 comments</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-bold">
                      AP
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-bold text-gray-900">Aisha Patel</div>
                          <div className="text-sm text-gray-600">Mentor • 1 week ago</div>
                        </div>
                        <div className="px-3 py-1 bg-blue-200 text-blue-900 rounded-full text-xs font-semibold">
                          DEI
                        </div>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Creating Inclusive Spaces</h4>
                      <p className="text-gray-700 mb-3">
                        During our mentorship session, we discussed how to navigate workplace dynamics as a woman of color. The conversation evolved into strategies for creating more inclusive spaces for others. It's beautiful when mentorship becomes mutual learning.
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <button className="flex items-center space-x-1 hover:text-blue-600">
                          <span>❤️</span>
                          <span>67</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-blue-600">
                          <span>💬</span>
                          <span>23 comments</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Safe Space Modal */}
      {showSafeSpace && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Safe Space</h2>
              <button
                onClick={() => setShowSafeSpace(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200 mb-6">
                <div className="flex items-start space-x-3">
                  <Eye className="w-6 h-6 text-indigo-600 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Confidential Support</h3>
                    <p className="text-gray-700 text-sm">
                      This is a safe space to discuss any concerns about your mentorship relationship or workplace experiences. 
                      All conversations are confidential and handled with care by our DEI team.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">What would you like to discuss?</label>
                  <textarea
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Share your concerns confidentially..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Would you like a follow-up?</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input type="radio" name="followup" className="text-indigo-600" />
                      <span className="text-gray-700">Yes, please contact me</span>
                    </label>
                    <label className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input type="radio" name="followup" className="text-indigo-600" />
                      <span className="text-gray-700">No, I just wanted to share</span>
                    </label>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">🚨 Need Immediate Help?</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    If you're experiencing urgent concerns or need immediate support:
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">Email:</span>
                      <a href="mailto:dei-support@forvismazars.com" className="text-blue-600 hover:underline">
                        dei-support@forvismazars.com
                      </a>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">Hotline:</span>
                      <span className="text-gray-700">+27 (0) 21 443 1200</span>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors text-lg">
                  Submit Confidentially
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Your submission is encrypted and will only be accessed by authorized DEI team members
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wordwall Game Modal */}
      {showWordwallGame && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-pink-50">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-pink-600 to-pink-600 p-3 rounded-xl">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-pink-600 bg-clip-text text-transparent">
                    Wordwall Challenge
                  </h3>
                  <p className="text-gray-600 text-sm">Interactive Learning Game</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowWordwallGame(false);
                  resetGame();
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Game Content */}
            <div className="p-6">
              {gameState === 'menu' && (
                <div className="text-center space-y-8">
                  <div className="bg-gradient-to-br from-pink-50 to-pink-50 rounded-2xl p-8">
                    <div className="text-6xl mb-4">🎯</div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      Mentorship Challenge
                    </h2>
                    <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                      Test your knowledge of mentorship best practices, communication skills, and relationship building. 
                      Choose your challenge level and see how well you understand effective mentorship!
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                      <button
                        onClick={() => startGame('practice')}
                        className="bg-white border-2 border-pink-200 hover:border-pink-400 rounded-xl p-6 text-left transition-all duration-200 group"
                      >
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="bg-pink-500 p-3 rounded-lg group-hover:scale-110 transition-transform duration-200">
                            <Target className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">Practice Mode</h3>
                            <p className="text-sm text-gray-600">Take your time to learn</p>
                          </div>
                        </div>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• No time pressure</li>
                          <li>• Detailed explanations</li>
                          <li>• Perfect for learning</li>
                        </ul>
                      </button>

                      <button
                        onClick={() => startGame('timed')}
                        className="bg-white border-2 border-pink-200 hover:border-pink-400 rounded-xl p-6 text-left transition-all duration-200 group"
                      >
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="bg-pink-500 p-3 rounded-lg group-hover:scale-110 transition-transform duration-200">
                            <Zap className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">Challenge Mode</h3>
                            <p className="text-sm text-gray-600">Race against time</p>
                          </div>
                        </div>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• 30 seconds per question</li>
                          <li>• Bonus points for speed</li>
                          <li>• Test your quick thinking</li>
                        </ul>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {gameState === 'playing' && (
                <div className="space-y-6">
                  {/* Progress and Timer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gray-200 rounded-full h-2 flex-1 max-w-xs">
                        <div 
                          className="bg-gradient-to-r from-pink-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${((currentQuestion + 1) / gameQuestions.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {currentQuestion + 1} / {gameQuestions.length}
                      </span>
                    </div>
                    
                    {gameMode === 'timed' && (
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                        timeLeft <= 10 ? 'bg-red-100 text-red-700' : 'bg-pink-100 text-pink-700'
                      }`}>
                        <Clock className="h-4 w-4" />
                        <span className="font-semibold">{timeLeft}s</span>
                      </div>
                    )}
                  </div>

                  {/* Question Card */}
                  <div className="bg-gradient-to-br from-pink-50 to-pink-50 rounded-2xl p-8">
                    <div className="text-center mb-6">
                      <div className="inline-block bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                        {gameQuestions[currentQuestion].category}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        {gameQuestions[currentQuestion].question}
                      </h3>
                    </div>

                    {!showFeedback ? (
                      <div className="grid gap-3">
                        {gameQuestions[currentQuestion].options.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => handleAnswerSelect(index)}
                            className="w-full text-left p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-all duration-200 font-medium"
                          >
                            <span className="text-pink-600 font-bold mr-3">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            {option}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid gap-3">
                          {gameQuestions[currentQuestion].options.map((option, index) => (
                            <div
                              key={index}
                              className={`w-full text-left p-4 rounded-lg border-2 font-medium ${
                                index === gameQuestions[currentQuestion].correctAnswer
                                  ? 'bg-green-50 border-green-300 text-green-800'
                                  : selectedAnswer === index
                                  ? 'bg-red-50 border-red-300 text-red-800'
                                  : 'bg-gray-50 border-gray-200 text-gray-600'
                              }`}
                            >
                              <span className="font-bold mr-3">
                                {String.fromCharCode(65 + index)}.
                              </span>
                              {option}
                              {index === gameQuestions[currentQuestion].correctAnswer && (
                                <span className="ml-2 text-green-600">✓</span>
                              )}
                              {selectedAnswer === index && index !== gameQuestions[currentQuestion].correctAnswer && (
                                <span className="ml-2 text-red-600">✗</span>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
                          <h4 className="font-semibold text-pink-800 mb-2">Explanation:</h4>
                          <p className="text-pink-700 text-sm">{gameQuestions[currentQuestion].explanation}</p>
                        </div>

                        <button
                          onClick={nextQuestion}
                          className="w-full bg-gradient-to-r from-pink-600 to-pink-600 text-white py-3 rounded-lg hover:shadow-lg transition-all duration-200 font-semibold"
                        >
                          {currentQuestion < gameQuestions.length - 1 ? 'Next Question' : 'See Results'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {gameState === 'results' && (
                <div className="text-center space-y-8">
                  <div className="bg-gradient-to-br from-pink-50 to-pink-50 rounded-2xl p-8">
                    <div className="text-6xl mb-4">
                      {score >= (gameQuestions.length * (gameMode === 'timed' ? 6 : 1)) * 0.8 ? '🏆' : 
                       score >= (gameQuestions.length * (gameMode === 'timed' ? 6 : 1)) * 0.6 ? '⭐' : '📚'}
                    </div>
                    <div className={`text-3xl font-bold bg-gradient-to-r ${getScoreMessage().color} bg-clip-text text-transparent mb-4`}>
                      {getScoreMessage().title}
                    </div>
                    <p className="text-gray-600 mb-8 text-lg">
                      {getScoreMessage().message}
                    </p>
                    
                    <div className="bg-white rounded-lg p-6 mb-6 shadow-sm max-w-md mx-auto">
                      <h4 className="font-semibold text-gray-900 mb-4">Your Performance</h4>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-pink-600">{score}</div>
                          <div className="text-sm text-gray-600">Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-pink-600">
                            {answers.filter(Boolean).length}
                          </div>
                          <div className="text-sm text-gray-600">Correct</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-pink-600">
                            {Math.round((score / (gameQuestions.length * (gameMode === 'timed' ? 6 : 1))) * 100)}%
                          </div>
                          <div className="text-sm text-gray-600">Accuracy</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-8 gap-1 mt-4">
                        {answers.map((correct, index) => (
                          <div
                            key={index}
                            className={`h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                              correct ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          >
                            {index + 1}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={resetGame}
                        className="bg-gradient-to-r from-pink-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
                      >
                        <RotateCcw className="h-5 h-5" />
                        <span>Play Again</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorshipActivities;
