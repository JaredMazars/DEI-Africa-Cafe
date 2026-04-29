import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Save, X, Video, FileText, Upload, 
  Eye, Trash2, Edit, BookOpen, Link as LinkIcon, Image, Type
} from 'lucide-react';

interface VideoContent {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  videoId: string;
  category: string;
  duration: string;
  uploadedDate: string;
}

interface Article {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  author: string;
  category: string;
  coverImage: string;
  publishedDate: string;
  readTime: string;
}

const AdminContentManager: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'videos' | 'articles'>('videos');

  // Video Content State
  const [videos, setVideos] = useState<VideoContent[]>([
    {
      id: '1',
      title: 'Introduction to Leadership',
      description: 'Learn the fundamentals of effective leadership in modern organizations',
      youtubeUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
      videoId: '9bZkp7q19f0',
      category: 'Leadership',
      duration: '28:17',
      uploadedDate: '2024-01-15'
    }
  ]);

  const [showAddVideo, setShowAddVideo] = useState(false);
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
    category: 'Leadership',
    duration: ''
  });

  // Article State
  const [articles, setArticles] = useState<Article[]>([
    {
      id: '1',
      title: 'The Future of Workplace Diversity',
      subtitle: 'How inclusive leadership shapes organizational success',
      content: 'In today\'s rapidly evolving business landscape, diversity and inclusion have emerged as critical drivers of innovation and competitive advantage...',
      author: 'Dr. Emily Rodriguez',
      category: 'DEI',
      coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
      publishedDate: '2024-01-20',
      readTime: '8 min'
    }
  ]);

  const [showAddArticle, setShowAddArticle] = useState(false);
  const [editingArticle, setEditingArticle] = useState<string | null>(null);
  const [newArticle, setNewArticle] = useState({
    title: '',
    subtitle: '',
    content: '',
    author: '',
    category: 'Leadership',
    coverImage: '',
    readTime: ''
  });

  const handleAddVideo = () => {
    if (!newVideo.title || !newVideo.youtubeUrl) {
      alert('Please fill in title and YouTube URL');
      return;
    }

    const videoId = newVideo.youtubeUrl.includes('youtube.com') || newVideo.youtubeUrl.includes('youtu.be')
      ? newVideo.youtubeUrl.split('v=')[1]?.split('&')[0] || newVideo.youtubeUrl.split('youtu.be/')[1]?.split('?')[0]
      : '';

    if (!videoId) {
      alert('Invalid YouTube URL');
      return;
    }

    const video: VideoContent = {
      id: Date.now().toString(),
      title: newVideo.title,
      description: newVideo.description,
      youtubeUrl: newVideo.youtubeUrl,
      videoId,
      category: newVideo.category,
      duration: newVideo.duration,
      uploadedDate: new Date().toISOString().split('T')[0]
    };

    setVideos([...videos, video]);
    setShowAddVideo(false);
    setNewVideo({ title: '', description: '', youtubeUrl: '', category: 'Leadership', duration: '' });
  };

  const handleDeleteVideo = (id: string) => {
    if (confirm('Are you sure you want to delete this video?')) {
      setVideos(videos.filter(v => v.id !== id));
    }
  };

  const handleSaveArticle = () => {
    if (!newArticle.title || !newArticle.content) {
      alert('Please fill in title and content');
      return;
    }

    if (editingArticle) {
      setArticles(articles.map(a => 
        a.id === editingArticle ? {
          ...a,
          title: newArticle.title,
          subtitle: newArticle.subtitle,
          content: newArticle.content,
          author: newArticle.author,
          category: newArticle.category,
          coverImage: newArticle.coverImage,
          readTime: newArticle.readTime
        } : a
      ));
      setEditingArticle(null);
    } else {
      const article: Article = {
        id: Date.now().toString(),
        title: newArticle.title,
        subtitle: newArticle.subtitle,
        content: newArticle.content,
        author: newArticle.author,
        category: newArticle.category,
        coverImage: newArticle.coverImage || 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800',
        publishedDate: new Date().toISOString().split('T')[0],
        readTime: newArticle.readTime
      };
      setArticles([...articles, article]);
    }

    setShowAddArticle(false);
    setNewArticle({ title: '', subtitle: '', content: '', author: '', category: 'Leadership', coverImage: '', readTime: '' });
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article.id);
    setNewArticle({
      title: article.title,
      subtitle: article.subtitle,
      content: article.content,
      author: article.author,
      category: article.category,
      coverImage: article.coverImage,
      readTime: article.readTime
    });
    setShowAddArticle(true);
  };

  const handleDeleteArticle = (id: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      setArticles(articles.filter(a => a.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F4F4] via-white to-[#F4F4F4] pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-[#0072CE] hover:text-[#1A1F5E] mb-4 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-[#1A1F5E] bg-clip-text text-transparent mb-2">
                Content Library
              </h1>
              <p className="text-gray-600">
                Upload YouTube videos and create beautiful articles for mentees
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white -xl shadow-lg border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex gap-4 px-6">
              {[
                { id: 'videos', label: 'Video Content', icon: Video },
                { id: 'articles', label: 'Articles & Guides', icon: FileText }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-[#0072CE] text-[#0072CE]'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-8">
            {/* VIDEOS TAB */}
            {activeTab === 'videos' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Video Library</h2>
                    <p className="text-gray-600 mt-1">Add YouTube videos to your content library</p>
                  </div>
                  <button
                    onClick={() => setShowAddVideo(true)}
                    className="flex items-center gap-2 bg-[#1A1F5E] hover:opacity-90 text-white px-6 py-3 -xl font-bold shadow-lg transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Add Video
                  </button>
                </div>

                {/* Add Video Form */}
                {showAddVideo && (
                  <div className="bg-gradient-to-br from-[#F4F4F4] to-[#F4F4F4] -2xl p-6 border-2 border-[#0072CE]/30">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">Add YouTube Video</h3>
                      <button
                        onClick={() => setShowAddVideo(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-sm font-bold text-gray-700 mb-2">Video Title *</label>
                          <input
                            type="text"
                            value={newVideo.title}
                            onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                            placeholder="e.g., Introduction to Leadership"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                          <textarea
                            value={newVideo.description}
                            onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                            rows={3}
                            placeholder="What will viewers learn from this video?"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-sm font-bold text-gray-700 mb-2">YouTube URL *</label>
                          <input
                            type="url"
                            value={newVideo.youtubeUrl}
                            onChange={(e) => setNewVideo({ ...newVideo, youtubeUrl: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                            placeholder="https://www.youtube.com/watch?v=..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                          <select
                            value={newVideo.category}
                            onChange={(e) => setNewVideo({ ...newVideo, category: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20"
                          >
                            <option value="Leadership">Leadership</option>
                            <option value="Technical">Technical</option>
                            <option value="Communication">Communication</option>
                            <option value="DEI">Diversity & Inclusion</option>
                            <option value="Personal Development">Personal Development</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Duration</label>
                          <input
                            type="text"
                            value={newVideo.duration}
                            onChange={(e) => setNewVideo({ ...newVideo, duration: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20"
                            placeholder="e.g., 28:17"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => setShowAddVideo(false)}
                          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 -lg font-bold transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddVideo}
                          className="flex items-center gap-2 px-6 py-3 bg-[#1A1F5E] hover:opacity-90 text-white -lg font-bold shadow-lg"
                        >
                          <Save className="w-5 h-5" />
                          Add Video
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Videos Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map(video => (
                    <div key={video.id} className="bg-white -xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                      <div className="relative">
                        <img 
                          src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <a
                            href={video.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-red-600 hover:bg-red-700 text-white p-4 -full"
                          >
                            <Video className="w-8 h-8" />
                          </a>
                        </div>
                        {video.duration && (
                          <span className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white px-2 py-1  text-xs font-bold">
                            {video.duration}
                          </span>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 flex-1">{video.title}</h3>
                          <button
                            onClick={() => handleDeleteVideo(video.id)}
                            className="text-red-600 hover:text-red-700 ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{video.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="bg-[#1A1F5E]/10 text-[#1A1F5E] px-2 py-1  font-medium">
                            {video.category}
                          </span>
                          <span>{video.uploadedDate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {videos.length === 0 && (
                  <div className="text-center py-16 bg-gray-50 -xl border-2 border-dashed border-gray-300">
                    <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No videos yet. Click "Add Video" to get started.</p>
                  </div>
                )}
              </div>
            )}

            {/* ARTICLES TAB - Will continue in next part */}
            {activeTab === 'articles' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Articles & Guides</h2>
                    <p className="text-gray-600 mt-1">Create beautifully formatted articles for your mentees</p>
                  </div>
                  <button
                    onClick={() => setShowAddArticle(true)}
                    className="flex items-center gap-2 bg-[#1A1F5E] hover:opacity-90 text-white px-6 py-3 -xl font-bold shadow-lg transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Create Article
                  </button>
                </div>

                {/* Add/Edit Article Form */}
                {showAddArticle && (
                  <div className="bg-gradient-to-br from-[#F4F4F4] to-[#F4F4F4] -2xl p-6 border-2 border-[#0072CE]/30">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">
                        {editingArticle ? 'Edit Article' : 'Create New Article'}
                      </h3>
                      <button
                        onClick={() => {
                          setShowAddArticle(false);
                          setEditingArticle(null);
                          setNewArticle({ title: '', subtitle: '', content: '', author: '', category: 'Leadership', coverImage: '', readTime: '' });
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
                          <input
                            type="text"
                            value={newArticle.title}
                            onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 text-xl font-bold"
                            placeholder="e.g., The Future of Workplace Diversity"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-sm font-bold text-gray-700 mb-2">Subtitle</label>
                          <input
                            type="text"
                            value={newArticle.subtitle}
                            onChange={(e) => setNewArticle({ ...newArticle, subtitle: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20"
                            placeholder="A brief subtitle or tagline"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Author</label>
                          <input
                            type="text"
                            value={newArticle.author}
                            onChange={(e) => setNewArticle({ ...newArticle, author: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20"
                            placeholder="Author name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                          <select
                            value={newArticle.category}
                            onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20"
                          >
                            <option value="Leadership">Leadership</option>
                            <option value="Technical">Technical</option>
                            <option value="Communication">Communication</option>
                            <option value="DEI">Diversity & Inclusion</option>
                            <option value="Career">Career Development</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Cover Image URL</label>
                          <input
                            type="url"
                            value={newArticle.coverImage}
                            onChange={(e) => setNewArticle({ ...newArticle, coverImage: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20"
                            placeholder="https://..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Read Time</label>
                          <input
                            type="text"
                            value={newArticle.readTime}
                            onChange={(e) => setNewArticle({ ...newArticle, readTime: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20"
                            placeholder="e.g., 8 min"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-sm font-bold text-gray-700 mb-2">Content *</label>
                          <textarea
                            value={newArticle.content}
                            onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 -lg focus:ring-2 focus:ring-[#1A1F5E]/20 font-serif"
                            rows={12}
                            placeholder="Write your article content here... 

Use paragraphs to organize your thoughts.

You can format the text with line breaks and spacing for better readability."
                          />
                          <p className="text-xs text-gray-500 mt-2">💡 Tip: Use line breaks to separate paragraphs for better formatting</p>
                        </div>
                      </div>

                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => {
                            setShowAddArticle(false);
                            setEditingArticle(null);
                            setNewArticle({ title: '', subtitle: '', content: '', author: '', category: 'Leadership', coverImage: '', readTime: '' });
                          }}
                          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 -lg font-bold transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveArticle}
                          className="flex items-center gap-2 px-6 py-3 bg-[#1A1F5E] hover:opacity-90 text-white -lg font-bold shadow-lg"
                        >
                          <Save className="w-5 h-5" />
                          {editingArticle ? 'Update Article' : 'Publish Article'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Articles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {articles.map(article => (
                    <div key={article.id} className="bg-white -xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                      <img 
                        src={article.coverImage}
                        alt={article.title}
                        className="w-full h-48 object-cover"
                      />

                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <span className="bg-[#1A1F5E]/10 text-[#1A1F5E] px-3 py-1 -full text-xs font-bold">
                              {article.category}
                            </span>
                            <h3 className="text-xl font-bold text-gray-900 mt-2 mb-1">{article.title}</h3>
                            {article.subtitle && (
                              <p className="text-sm text-gray-600 mb-3">{article.subtitle}</p>
                            )}
                          </div>
                        </div>

                        <p className="text-gray-700 line-clamp-3 mb-4">{article.content}</p>

                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <span>{article.author}</span>
                          <span>{article.readTime}</span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/article/${article.id}`)}
                            className="flex-1 flex items-center justify-center gap-2 bg-[#0072CE] hover:bg-[#1A1F5E] text-white px-4 py-2 -lg font-medium transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() => handleEditArticle(article)}
                            className="p-2 text-gray-600 hover:bg-gray-100 -lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(article.id)}
                            className="p-2 text-red-600 hover:bg-red-50 -lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {articles.length === 0 && (
                  <div className="text-center py-16 bg-gray-50 -xl border-2 border-dashed border-gray-300">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No articles yet. Click "Create Article" to start writing.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContentManager;
