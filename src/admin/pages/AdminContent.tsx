import React, { useState, useEffect } from 'react';
import {
  FileText,
  Video,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  Eye
} from 'lucide-react';
import { getData, setData, STORAGE_KEYS } from '../../services/dataStore';
import { logAuditAction } from '../../services/auditLogger';

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

const AdminContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'videos' | 'articles'>('videos');
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
    category: 'Leadership',
    duration: ''
  });
  const [articleForm, setArticleForm] = useState({
    title: '',
    subtitle: '',
    content: '',
    author: '',
    category: 'Leadership',
    coverImage: '',
    readTime: ''
  });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = () => {
    const storedVideos = getData(STORAGE_KEYS.VIDEOS, []) as VideoContent[];
    const storedArticles = getData(STORAGE_KEYS.ARTICLES, []) as Article[];
    setVideos(storedVideos);
    setArticles(storedArticles);
  };

  const handleVideoSubmit = () => {
    if (!videoForm.title || !videoForm.youtubeUrl) {
      alert('Please fill in title and YouTube URL');
      return;
    }

    const videoId = extractYouTubeId(videoForm.youtubeUrl);
    if (!videoId) {
      alert('Invalid YouTube URL');
      return;
    }

    if (editingId) {
      const updatedVideos = videos.map(v =>
        v.id === editingId ? { ...v, ...videoForm, videoId } : v
      );
      setVideos(updatedVideos);
      setData(STORAGE_KEYS.VIDEOS, updatedVideos);
      logAuditAction('UPDATED', 'Video', videoForm.title);
    } else {
      const newVideo: VideoContent = {
        id: Date.now().toString(),
        ...videoForm,
        videoId,
        uploadedDate: new Date().toISOString().split('T')[0]
      };
      const updatedVideos = [...videos, newVideo];
      setVideos(updatedVideos);
      setData(STORAGE_KEYS.VIDEOS, updatedVideos);
      logAuditAction('CREATED', 'Video', videoForm.title);
    }
    resetModal();
  };

  const handleArticleSubmit = () => {
    if (!articleForm.title || !articleForm.content) {
      alert('Please fill in title and content');
      return;
    }

    if (editingId) {
      const updatedArticles = articles.map(a =>
        a.id === editingId ? { ...a, ...articleForm } : a
      );
      setArticles(updatedArticles);
      setData(STORAGE_KEYS.ARTICLES, updatedArticles);
      logAuditAction('UPDATED', 'Article', articleForm.title);
    } else {
      const newArticle: Article = {
        id: Date.now().toString(),
        ...articleForm,
        publishedDate: new Date().toISOString().split('T')[0]
      };
      const updatedArticles = [...articles, newArticle];
      setArticles(updatedArticles);
      setData(STORAGE_KEYS.ARTICLES, updatedArticles);
      logAuditAction('CREATED', 'Article', articleForm.title);
    }
    resetModal();
  };

  const handleDeleteVideo = (id: string) => {
    if (confirm('Are you sure you want to delete this video?')) {
      const video = videos.find(v => v.id === id);
      const updatedVideos = videos.filter(v => v.id !== id);
      setVideos(updatedVideos);
      setData(STORAGE_KEYS.VIDEOS, updatedVideos);
      logAuditAction('DELETED', 'Video', video?.title || id);
    }
  };

  const handleDeleteArticle = (id: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      const article = articles.find(a => a.id === id);
      const updatedArticles = articles.filter(a => a.id !== id);
      setArticles(updatedArticles);
      setData(STORAGE_KEYS.ARTICLES, updatedArticles);
      logAuditAction('DELETED', 'Article', article?.title || id);
    }
  };

  const extractYouTubeId = (url: string): string => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/);
    return match ? match[1] : '';
  };

  const resetModal = () => {
    setShowModal(false);
    setEditingId(null);
    setVideoForm({ title: '', description: '', youtubeUrl: '', category: 'Leadership', duration: '' });
    setArticleForm({ title: '', subtitle: '', content: '', author: '', category: 'Leadership', coverImage: '', readTime: '' });
  };

  const filteredVideos = videos.filter(v =>
    v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredArticles = articles.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600 mt-1">Manage videos and articles</p>
        </div>
        <button
          onClick={() => {
            resetModal();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-[#0072CE] to-[#1A1F5E] hover:opacity-90 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          Add {activeTab === 'videos' ? 'Video' : 'Article'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="inline-flex p-3 rounded-lg bg-[#1A1F5E]/10 mb-3">
            <Video className="w-6 h-6 text-[#0072CE]" />
          </div>
          <p className="text-gray-600 text-sm">Total Videos</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{videos.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="inline-flex p-3 rounded-lg bg-green-100 mb-3">
            <FileText className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-gray-600 text-sm">Total Articles</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{articles.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 p-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('videos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'videos'
                  ? 'bg-[#1A1F5E]/10 text-[#1A1F5E]'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Video className="w-5 h-5" />
              Videos
            </button>
            <button
              onClick={() => setActiveTab('articles')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'articles'
                  ? 'bg-[#1A1F5E]/10 text-[#1A1F5E]'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-5 h-5" />
              Articles
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
            />
          </div>
        </div>

        {/* Content List */}
        <div className="p-4">
          {activeTab === 'videos' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVideos.map(video => (
                <div key={video.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="aspect-video bg-gray-900 rounded-lg mb-3 relative">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.videoId}`}
                      className="w-full h-full rounded-lg"
                      allowFullScreen
                    />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{video.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{video.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-[#1A1F5E]/10 text-[#1A1F5E] px-2 py-1 rounded">
                      {video.category}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingId(video.id);
                          setVideoForm({
                            title: video.title,
                            description: video.description,
                            youtubeUrl: video.youtubeUrl,
                            category: video.category,
                            duration: video.duration
                          });
                          setShowModal(true);
                        }}
                        className="p-2 text-[#0072CE] hover:bg-[#1A1F5E]/5 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredVideos.length === 0 && (
                <div className="col-span-2 text-center py-12 text-gray-500">
                  No videos found
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredArticles.map(article => (
                <div key={article.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-32 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{article.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{article.subtitle}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{article.author}</span>
                        <span>•</span>
                        <span>{article.readTime}</span>
                        <span>•</span>
                        <span className="bg-[#1A1F5E]/10 text-[#1A1F5E] px-2 py-1 rounded">
                          {article.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingId(article.id);
                          setArticleForm({
                            title: article.title,
                            subtitle: article.subtitle,
                            content: article.content,
                            author: article.author,
                            category: article.category,
                            coverImage: article.coverImage,
                            readTime: article.readTime
                          });
                          setShowModal(true);
                        }}
                        className="p-2 text-[#0072CE] hover:bg-[#1A1F5E]/5 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(article.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredArticles.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No articles found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Edit' : 'Add'} {activeTab === 'videos' ? 'Video' : 'Article'}
              </h3>
              <button onClick={resetModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            {activeTab === 'videos' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={videoForm.title}
                    onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">YouTube URL *</label>
                  <input
                    type="url"
                    value={videoForm.youtubeUrl}
                    onChange={(e) => setVideoForm({ ...videoForm, youtubeUrl: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={videoForm.description}
                    onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                    <input
                      type="text"
                      value={videoForm.category}
                      onChange={(e) => setVideoForm({ ...videoForm, category: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Duration</label>
                    <input
                      type="text"
                      value={videoForm.duration}
                      onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                      placeholder="28:17"
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={resetModal}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVideoSubmit}
                    className="flex-1 bg-gradient-to-r from-[#0072CE] to-[#1A1F5E] text-white py-3 rounded-lg font-bold"
                  >
                    <Save className="w-5 h-5 inline mr-2" />
                    {editingId ? 'Update' : 'Add'} Video
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={articleForm.title}
                    onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Subtitle</label>
                  <input
                    type="text"
                    value={articleForm.subtitle}
                    onChange={(e) => setArticleForm({ ...articleForm, subtitle: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Content *</label>
                  <textarea
                    value={articleForm.content}
                    onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                    rows={8}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Author</label>
                    <input
                      type="text"
                      value={articleForm.author}
                      onChange={(e) => setArticleForm({ ...articleForm, author: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Read Time</label>
                    <input
                      type="text"
                      value={articleForm.readTime}
                      onChange={(e) => setArticleForm({ ...articleForm, readTime: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                      placeholder="8 min"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                    <input
                      type="text"
                      value={articleForm.category}
                      onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Cover Image URL</label>
                    <input
                      type="url"
                      value={articleForm.coverImage}
                      onChange={(e) => setArticleForm({ ...articleForm, coverImage: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={resetModal}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleArticleSubmit}
                    className="flex-1 bg-gradient-to-r from-[#0072CE] to-[#1A1F5E] text-white py-3 rounded-lg font-bold"
                  >
                    <Save className="w-5 h-5 inline mr-2" />
                    {editingId ? 'Update' : 'Add'} Article
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContent;

