import { useState, useEffect } from 'react';
import { Search, BookOpen, Play, FileText, Download, Star, Bookmark, Eye, Clock, TrendingUp, Grid, List } from 'lucide-react';
import { mockAPI } from '../services/mockData';

interface Resource {
  id: string;
  title: string;
  type: string;
  category: string;
  url: string;
  description: string;
  uploadedBy: string;
  uploadDate: string;
  rating?: number;
  downloads?: number;
  duration?: string;
  pages?: number;
}

const ResourceLibrary: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [savedResources, setSavedResources] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [searchTerm, selectedCategory, selectedType, resources]);

  const loadResources = async () => {
    try {
      const response = await mockAPI.getResourcesExpanded();
      setResources(response.data);
      setFilteredResources(response.data);
    } catch (error) {
      console.error('Failed to load resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    if (selectedType !== 'All') {
      filtered = filtered.filter(resource => resource.type.toLowerCase().includes(selectedType.toLowerCase()));
    }

    setFilteredResources(filtered);
    setCurrentPage(1); // Reset to page 1 when filters change
  };

  const toggleSaveResource = (resourceId: string) => {
    setSavedResources(prev => {
      const newSet = new Set(prev);
      if (newSet.has(resourceId)) {
        newSet.delete(resourceId);
      } else {
        newSet.add(resourceId);
      }
      return newSet;
    });
  };

  const getIconForType = (type: string) => {
    if (type.toLowerCase().includes('video')) return <Play className="w-5 h-5" />;
    if (type.toLowerCase().includes('pdf')) return <FileText className="w-5 h-5" />;
    if (type.toLowerCase().includes('course') || type.toLowerCase().includes('tutorial')) return <BookOpen className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const categories = ['All', 'Leadership', 'Technology', 'Marketing', 'Finance', 'Business', 'Career Development', 'Sustainability'];
  const types = ['All', 'PDF', 'Video', 'Course', 'Tutorial', 'Webinar'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header with Forvis Mazars Branding */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="max-w-[1920px] mx-auto px-12 sm:px-16 lg:px-20 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-3 text-white">Resource Library</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Discover curated learning materials and professional resources
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-12 sm:px-16 lg:px-20 py-8">{/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="lg:w-56">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="lg:w-48">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
              >
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-900' : 'text-gray-600'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-900' : 'text-gray-600'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Resources Grid/List */}
        {filteredResources.length > 0 && (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredResources.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((resource) => {
              const isSaved = savedResources.has(resource.id);
              
              if (viewMode === 'grid') {
                return (
                  <div
                    key={resource.id}
                    className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 group hover:scale-[1.02]"
                  >
                    {/* Card Header */}
                    <div className="h-40 bg-gradient-to-br from-blue-900 to-blue-800 p-6 flex items-center justify-center relative">
                      <div className="text-white text-6xl opacity-20">
                        {getIconForType(resource.type)}
                      </div>
                      <button
                        onClick={() => toggleSaveResource(resource.id)}
                        className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all"
                      >
                        <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-white text-white' : 'text-white'}`} />
                      </button>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-lg text-xs font-semibold">
                          {resource.type}
                        </span>
                        {resource.rating && (
                          <div className="flex items-center text-yellow-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="ml-1 text-sm font-semibold text-gray-700">{resource.rating}</span>
                          </div>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-900 transition-colors">
                        {resource.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{resource.description}</p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          {resource.duration && (
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>{resource.duration}</span>
                            </div>
                          )}
                          {resource.downloads && (
                            <div className="flex items-center">
                              <Download className="w-3 h-3 mr-1" />
                              <span>{resource.downloads}</span>
                            </div>
                          )}
                        </div>
                        <button className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-medium transition-colors text-sm">
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                );
              } else {
                // List View
                return (
                  <div
                    key={resource.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-200"
                  >
                    <div className="flex items-center space-x-6">
                      {/* Icon */}
                      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg flex items-center justify-center text-white">
                        {getIconForType(resource.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-grow">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-lg font-bold text-gray-900 hover:text-blue-900 transition-colors">
                                {resource.title}
                              </h3>
                              <span className="px-2 py-1 bg-blue-100 text-blue-900 rounded-lg text-xs font-semibold">
                                {resource.type}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-1">{resource.description}</p>
                          </div>
                          {resource.rating && (
                            <div className="flex items-center text-yellow-500 ml-4">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="ml-1 text-sm font-semibold text-gray-700">{resource.rating}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="bg-gray-100 px-2 py-1 rounded">{resource.category}</span>
                            {resource.duration && (
                              <div className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                <span>{resource.duration}</span>
                              </div>
                            )}
                            {resource.downloads && (
                              <div className="flex items-center">
                                <Eye className="w-3 h-3 mr-1" />
                                <span>{resource.downloads} views</span>
                              </div>
                            )}
                            <span>By {resource.uploadedBy}</span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleSaveResource(resource.id)}
                              className={`p-2 rounded-lg border transition-all ${isSaved ? 'bg-blue-50 border-blue-900 text-blue-900' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                            >
                              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                            </button>
                            <button className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-medium transition-colors">
                              View
                            </button>
                            <button className="p-2 border border-blue-900 text-blue-900 hover:bg-blue-50 rounded-lg transition-colors">
                              <Download className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {filteredResources.length > 0 && (
          <div className="flex items-center justify-center space-x-2 mt-8">
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
            
            {Array.from({ length: Math.ceil(filteredResources.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
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
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredResources.length / itemsPerPage), prev + 1))}
              disabled={currentPage === Math.ceil(filteredResources.length / itemsPerPage)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === Math.ceil(filteredResources.length / itemsPerPage)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
        )}

        {/* No Results */}
        {filteredResources.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSelectedType('All');
              }}
              className="px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceLibrary;
