import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, Share2, Bookmark, Calendar } from 'lucide-react';

const ArticleView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data - in production, fetch from API/state
  const article = {
    id: '1',
    title: 'The Future of Workplace Diversity',
    subtitle: 'How inclusive leadership shapes organizational success',
    content: `In today's rapidly evolving business landscape, diversity and inclusion have emerged as critical drivers of innovation and competitive advantage. Organizations that embrace diverse perspectives and create inclusive environments consistently outperform their peers across multiple metrics.

Research from McKinsey & Company demonstrates that companies in the top quartile for ethnic and cultural diversity on executive teams are 33% more likely to have industry-leading profitability. These findings underscore a fundamental truth: diversity isn't just a moral imperative—it's a business necessity.

Understanding the Diversity Advantage

The benefits of diversity extend far beyond compliance or social responsibility. Diverse teams bring varied experiences, perspectives, and problem-solving approaches that fuel creativity and innovation. When people from different backgrounds collaborate, they challenge assumptions, identify blind spots, and develop more comprehensive solutions.

Consider the tech industry, where homogeneous teams have historically dominated. Companies like Microsoft, Google, and Salesforce have made significant investments in diversifying their workforce, resulting in products and services that better serve global markets. This isn't coincidental—it's the natural outcome of having team members who reflect the diversity of their customer base.

Creating Truly Inclusive Cultures

However, diversity alone isn't sufficient. Without inclusion, organizations risk creating environments where diverse talent feels marginalized or unable to contribute fully. Inclusion means actively fostering a sense of belonging where all employees feel valued, heard, and empowered to bring their authentic selves to work.

Practical Steps for Leaders

1. Commit to Transparent Metrics: Establish clear diversity goals and regularly track progress. Share these metrics across the organization to maintain accountability.

2. Redesign Recruitment Processes: Partner with diverse organizations, use blind resume screening, and ensure interview panels reflect the diversity you seek.

3. Invest in Continuous Learning: Provide ongoing training on unconscious bias, cultural competence, and inclusive leadership practices.

4. Amplify Underrepresented Voices: Create formal channels for employees from underrepresented groups to share perspectives and influence decision-making.

5. Link Diversity to Business Strategy: Integrate diversity and inclusion goals into performance evaluations and strategic planning.

The Path Forward

As we look toward the future, the organizations that will thrive are those that view diversity and inclusion not as checkbox exercises but as fundamental components of their business strategy. This requires sustained commitment from leadership, meaningful investment in inclusive practices, and a willingness to have difficult conversations about systemic barriers.

The journey toward true workplace diversity is ongoing, but the destination—organizations where every employee can thrive and contribute their best work—is worth pursuing. By embracing diversity today, we build the innovative, resilient organizations of tomorrow.`,
    author: 'Dr. Emily Rodriguez',
    authorBio: 'Leadership Development Expert & DEI Consultant',
    category: 'DEI',
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200',
    publishedDate: '2024-01-20',
    readTime: '8 min'
  };

  const formatContent = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => {
      // Check if it's a heading
      if (paragraph.trim().length > 0 && paragraph.trim().length < 100 && !paragraph.includes('.')) {
        return (
          <h2 key={index} className="text-2xl md:text-3xl font-bold text-gray-900 mt-8 mb-4">
            {paragraph}
          </h2>
        );
      }
      // Check if it's a list item
      if (paragraph.startsWith('1.') || paragraph.match(/^\d+\./)) {
        const items = paragraph.split(/\d+\./).filter(item => item.trim());
        return (
          <ol key={index} className="list-decimal list-inside space-y-3 text-gray-700 leading-relaxed mb-6">
            {items.map((item, idx) => (
              <li key={idx} className="text-lg">{item.trim()}</li>
            ))}
          </ol>
        );
      }
      // Regular paragraph
      return (
        <p key={index} className="text-lg text-gray-700 leading-relaxed mb-6">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#F4F4F4]">
      {/* Hero Section */}
      <div className="relative h-[500px] bg-gradient-to-r from-[#1A1F5E] to-[#1A1F5E] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        
        <div className="relative max-w-4xl mx-auto px-6 h-full flex flex-col justify-end pb-16">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-8 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="mb-4">
            <span className="bg-[#0072CE] text-white px-4 py-2 -full text-sm font-bold">
              {article.category}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="text-xl md:text-2xl text-white/70 mb-6">
              {article.subtitle}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-6 text-white/90">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <div>
                <p className="font-semibold">{article.author}</p>
                <p className="text-sm text-white/70">{article.authorBio}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{new Date(article.publishedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{article.readTime} read</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mb-12">
          <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 -lg text-gray-700 font-medium transition-colors shadow-sm">
            <Bookmark className="w-4 h-4" />
            Save
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0072CE] hover:bg-[#1A1F5E] text-white -lg font-medium transition-colors shadow-lg">
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>

        {/* Article Content */}
        <article className="prose prose-lg max-w-none">
          <div className="text-justify">
            {formatContent(article.content)}
          </div>
        </article>

        {/* Author Card */}
        <div className="mt-16 pt-8 border-t-2 border-gray-200">
          <div className="bg-gradient-to-br from-[#F4F4F4] to-[#F4F4F4] -2xl p-8 border border-[#0072CE]/30">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-[#1A1F5E] -full flex items-center justify-center text-white text-2xl font-bold">
                {article.author.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{article.author}</h3>
                <p className="text-gray-600">{article.authorBio}</p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              A thought leader in diversity, equity, and inclusion with over 15 years of experience 
              helping organizations build more inclusive cultures and develop diverse leadership pipelines.
            </p>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Articles</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'Building Inclusive Teams',
                category: 'Leadership',
                image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600'
              },
              {
                title: 'Unconscious Bias in Hiring',
                category: 'DEI',
                image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600'
              }
            ].map((relatedArticle, idx) => (
              <div key={idx} className="bg-white -xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer border border-gray-200">
                <img 
                  src={relatedArticle.image}
                  alt={relatedArticle.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <span className="bg-[#1A1F5E]/10 text-[#1A1F5E] px-3 py-1 -full text-xs font-bold">
                    {relatedArticle.category}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mt-3">{relatedArticle.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleView;
