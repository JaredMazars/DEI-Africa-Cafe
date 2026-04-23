import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Plus, Search, Filter, Star, MessageCircle, Heart, User, 
  ArrowLeft, MoreHorizontal, ThumbsUp, X, Lightbulb, Target, 
  MessageSquare, TrendingUp, Users, AlertCircle, CheckCircle
} from 'lucide-react';
import { reflectionsAPI } from '../services/api';

interface Reflection {
  id: string;
  userId: string;
  userName: string;
  userRole: 'mentor' | 'mentee';
  avatar?: string;
  category: string;
  title: string;
  content: string;
  keyTakeaways: string[];
  tags: string[];
  rating?: number;
  isAnonymous: boolean;
  timestamp: Date;
  reactions: { [emoji: string]: number };
  comments: Comment[];
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userRole: 'mentor' | 'mentee';
  content: string;
  timestamp: Date;
  isAnonymous: boolean;
}

const ReflectionBoard: React.FC = () => {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedReflection, setSelectedReflection] = useState<Reflection | null>(null);
  const [newComment, setNewComment] = useState('');
  const [commentAnonymous, setCommentAnonymous] = useState(false);
  const [loading, setLoading] = useState(true);

  const [reflections, setReflections] = useState<Reflection[]>([]);

  useEffect(() => {
    loadReflections();
  }, [filterCategory]);

  const loadReflections = async () => {
    try {
      setLoading(true);
      const res = await reflectionsAPI.getReflections({
        category: filterCategory !== 'all' ? filterCategory : undefined,
        search: searchTerm || undefined,
      });
      const raw: any[] = res.data?.reflections || [];
      const list: Reflection[] = raw.map((r: any) => ({
        id: r.id,
        userId: r.user_id || '',
        userName: r.userName || 'Anonymous',
        userRole: (r.userRole as 'mentor' | 'mentee') || 'mentee',
        avatar: r.avatar,
        category: r.category,
        title: r.title,
        content: r.content,
        keyTakeaways: r.keyTakeaways || [],
        tags: r.tags || [],
        rating: r.rating,
        isAnonymous: !!r.is_anonymous,
        timestamp: new Date(r.created_at),
        reactions: r.reactions || {},
        comments: [],
      }));
      setReflections(list);
    } catch (err) {
      console.error('Failed to load reflections:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (reflection: Reflection) => {
    const res = await reflectionsAPI.getComments(reflection.id);
    const raw: any[] = res.data?.comments || [];
    const comments: Comment[] = raw.map((c: any) => ({
      id: c.id,
      userId: c.user_id || '',
      userName: c.userName || 'Anonymous',
      userRole: (c.userRole as 'mentor' | 'mentee') || 'mentee',
      content: c.content,
      timestamp: new Date(c.created_at),
      isAnonymous: !!c.is_anonymous,
    }));
    setSelectedReflection({ ...reflection, comments });
  };
    {
      id: '1',
      userId: '1',
      userName: 'Sarah Johnson',
      userRole: 'mentee',
      category: 'Communication',
      title: 'Learning to Navigate Difficult Conversations',
      content: "Today's session was transformative. My mentor helped me understand that difficult conversations aren't about winning or losing—they're about understanding. We practiced using 'I' statements and active listening techniques. I realized I've been approaching conflicts defensively instead of curiously. This shift in mindset alone has already changed how I interact with my team.",
      keyTakeaways: [
        'Use "I feel..." statements instead of "You always..."',
        'Ask clarifying questions before responding',
        'Remember: seek to understand, not to win'
      ],
      tags: ['communication', 'conflict-resolution', 'active-listening'],
      rating: 5,
      isAnonymous: false,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      reactions: { '👍': 12, '💡': 8, '🙏': 5 },
      comments: [
        {
          id: '1',
          userId: '2',
          userName: 'Michael Chen',
          userRole: 'mentor',
          content: 'This is a profound insight, Sarah! The shift from defensive to curious is exactly what transforms relationships. Keep practicing!',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          isAnonymous: false
        }
      ]
    },
    {
      id: '2',
      userId: '2',
      userName: 'Anonymous',
      userRole: 'mentee',
      category: 'Challenge',
      title: 'Addressing Imposter Syndrome',
      content: "I finally opened up about feeling like a fraud despite my accomplishments. My mentor shared that even senior leaders experience this. We identified that my imposter syndrome spikes when I'm learning something new—which is actually a sign I'm growing, not failing. This reframe was powerful. I'm going to start tracking my wins and revisit them when doubt creeps in.",
      keyTakeaways: [
        'Imposter syndrome often means you\'re stretching yourself',
        'Keep a "wins" journal for tough moments',
        'Growth feels uncomfortable—that\'s normal'
      ],
      tags: ['imposter-syndrome', 'self-confidence', 'growth-mindset'],
      rating: 5,
      isAnonymous: true,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      reactions: { '🤝': 15, '💪': 10, '❤️': 8 },
      comments: []
    },
    {
      id: '3',
      userId: '3',
      userName: 'Dr. Amanda Williams',
      userRole: 'mentor',
      category: 'Success',
      title: 'Celebrating My Mentee\'s First Leadership Presentation',
      content: "I'm so proud! My mentee delivered their first executive presentation today. We'd been preparing for weeks—working on storytelling, handling tough questions, and managing nerves. They were brilliant. What struck me most was how they incorporated feedback from our sessions without losing their authentic voice. This is what mentorship is about: not changing someone, but amplifying who they already are.",
      keyTakeaways: [
        'Preparation builds confidence',
        'Authenticity > perfection',
        'Celebrate milestones, no matter how small'
      ],
      tags: ['leadership', 'presentation-skills', 'mentorship-wins'],
      isAnonymous: false,
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      reactions: { '🎉': 20, '👏': 15, '🌟': 12 },
      comments: []
    }
  ]);

  const categories = [
    { id: 'all', label: 'All', icon: BookOpen },
    { id: 'Goal Progress', label: 'Goal Progress', icon: Target },
    { id: 'Communication', label: 'Communication', icon: MessageSquare },
    { id: 'Skills Learned', label: 'Skills Learned', icon: TrendingUp },
    { id: 'Relationship', label: 'Relationship', icon: Users },
    { id: 'Challenge', label: 'Challenge', icon: AlertCircle },
    { id: 'Success', label: 'Success', icon: CheckCircle },
    { id: 'Insight', label: 'Insight', icon: Lightbulb }
  ];

  const filteredReflections = reflections.filter(reflection => {
    const matchesSearch = !searchTerm ||
      reflection.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reflection.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reflection.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const addReaction = async (reflectionId: string, emoji: string) => {
    try {
      const res = await reflectionsAPI.react(reflectionId, emoji);
      const updated = res.data?.reactions;
      if (updated) {
        setReflections(prev => prev.map(r =>
          r.id === reflectionId ? { ...r, reactions: updated } : r
        ));
        if (selectedReflection?.id === reflectionId) {
          setSelectedReflection(prev => prev ? { ...prev, reactions: updated } : null);
        }
      }
    } catch {}
  };

  const addComment = async (reflectionId: string) => {
    if (!newComment.trim()) return;
    try {
      await reflectionsAPI.addComment(reflectionId, newComment.trim(), commentAnonymous);
      setNewComment('');
      setCommentAnonymous(false);
      // Reload comments
      const reflection = reflections.find(r => r.id === reflectionId);
      if (reflection) await loadComments(reflection);
    } catch (err) {
      console.error('Failed to post comment', err);
    }
  };

  const availableEmojis = ['👍', '💡', '🙏', '🤝', '💭', '🌱', '❤️', '🔥', '🎯', '✨', '👏', '💪', '🎉', '🌟'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1A1F5E] via-[#0072CE] to-[#1A1F5E] text-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-white/70 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-3">Reflection Board</h1>
              <p className="text-xl text-white/80 max-w-3xl">
                Share insights, learn from others, and grow together through mentorship reflections
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>New Reflection</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search reflections by title, content, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div className="flex items-center space-x-3">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-w-[200px]"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-4 bg-gradient-to-br from-[#F4F4F4] to-[#F4F4F4] rounded-lg">
              <div className="text-3xl font-bold text-[#1A1F5E]">{reflections.length}</div>
              <div className="text-sm text-gray-600">Total Reflections</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-[#F4F4F4] to-[#F4F4F4] rounded-lg">
              <div className="text-3xl font-bold text-[#1A1F5E]">
                {reflections.filter(r => r.userRole === 'mentee').length}
              </div>
              <div className="text-sm text-gray-600">From Mentees</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="text-3xl font-bold text-green-900">
                {reflections.filter(r => r.userRole === 'mentor').length}
              </div>
              <div className="text-sm text-gray-600">From Mentors</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
              <div className="text-3xl font-bold text-orange-900">
                {reflections.reduce((sum, r) => sum + r.comments.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Comments</div>
            </div>
          </div>
        </div>

        {/* Reflections List */}
        <div className="space-y-6">
          {filteredReflections.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No reflections found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterCategory !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to share your mentorship journey!'}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-[#0072CE] to-[#1A1F5E] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Create First Reflection
              </button>
            </div>
          ) : (
            filteredReflections.map(reflection => (
              <div key={reflection.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                {/* Reflection Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        reflection.isAnonymous 
                          ? 'bg-gray-200' 
                          : reflection.userRole === 'mentor'
                          ? 'bg-gradient-to-br from-[#0072CE] to-[#1A1F5E]'
                          : 'bg-gradient-to-br from-[#0072CE] to-[#1A1F5E]'
                      }`}>
                        {reflection.isAnonymous ? (
                          <User className="w-6 h-6 text-gray-500" />
                        ) : (
                          <span className="text-white font-bold text-lg">
                            {reflection.userName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h4 className="font-bold text-gray-900">
                            {reflection.isAnonymous ? 'Anonymous' : reflection.userName}
                          </h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            reflection.userRole === 'mentor'
                              ? 'bg-[#1A1F5E]/10 text-[#1A1F5E]'
                              : 'bg-[#1A1F5E]/10 text-[#1A1F5E]'
                          }`}>
                            {reflection.userRole === 'mentor' ? '👨‍🏫 Mentor' : '👨‍🎓 Mentee'}
                          </span>
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                            {reflection.category}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm text-gray-500">
                          <span>{new Date(reflection.timestamp).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                          {reflection.rating && (
                            <div className="flex items-center space-x-1">
                              <span>•</span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < reflection.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 p-2">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Reflection Title */}
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{reflection.title}</h2>

                  {/* Reflection Content */}
                  <p className="text-gray-700 leading-relaxed mb-4">{reflection.content}</p>

                  {/* Key Takeaways */}
                  {reflection.keyTakeaways && reflection.keyTakeaways.length > 0 && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-r-lg p-4 mb-4">
                      <h3 className="font-semibold text-green-900 mb-2 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Key Takeaways
                      </h3>
                      <ul className="space-y-1">
                        {reflection.keyTakeaways.map((takeaway, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start">
                            <span className="text-green-600 mr-2">✓</span>
                            <span>{takeaway}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {reflection.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Reactions Bar */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      {Object.entries(reflection.reactions).slice(0, 3).map(([emoji, count]) => (
                        <span key={emoji} className="flex items-center space-x-1 text-sm">
                          <span className="text-lg">{emoji}</span>
                          <span className="text-gray-600 font-medium">{count}</span>
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => loadComments(reflection)}
                      className="text-gray-600 hover:text-[#0072CE] text-sm font-medium flex items-center space-x-1"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{reflection.comments.length} {reflection.comments.length === 1 ? 'comment' : 'comments'}</span>
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 pt-3 border-t border-gray-100 mt-3">
                    <div className="relative group">
                      <button className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <Heart className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700 font-medium">React</span>
                      </button>
                      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:flex bg-white border-2 border-gray-200 rounded-lg p-2 shadow-lg gap-1 z-10">
                        {availableEmojis.map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => addReaction(reflection.id, emoji)}
                            className="hover:scale-125 transition-transform text-xl p-1"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => loadComments(reflection)}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-700 font-medium">Comment</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Reflection Modal - Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Create Reflection</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600">This will open the enhanced reflection form...</p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="mt-6 w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {selectedReflection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-900">Comments</h3>
              <button
                onClick={() => setSelectedReflection(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Existing Comments */}
              {selectedReflection.comments.length > 0 && (
                <div className="space-y-4 mb-6">
                  {selectedReflection.comments.map(comment => (
                    <div key={comment.id} className="flex space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        comment.isAnonymous 
                          ? 'bg-gray-200' 
                          : comment.userRole === 'mentor'
                          ? 'bg-[#F4F4F4]0'
                          : 'bg-[#F4F4F4]0'
                      }`}>
                        {comment.isAnonymous ? (
                          <User className="w-5 h-5 text-gray-500" />
                        ) : (
                          <span className="text-white font-semibold">
                            {comment.userName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-semibold text-gray-900">
                              {comment.isAnonymous ? 'Anonymous' : comment.userName}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              comment.userRole === 'mentor'
                                ? 'bg-[#1A1F5E]/10 text-[#1A1F5E]'
                                : 'bg-[#1A1F5E]/10 text-[#1A1F5E]'
                            }`}>
                              {comment.userRole}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment Form */}
              <div className="border-t border-gray-200 pt-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                  rows={4}
                />
                <div className="flex items-center justify-between mt-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={commentAnonymous}
                      onChange={(e) => setCommentAnonymous(e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">Comment anonymously</span>
                  </label>
                  <button
                    onClick={() => addComment(selectedReflection.id)}
                    disabled={!newComment.trim()}
                    className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                  >
                    Post Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReflectionBoard;
