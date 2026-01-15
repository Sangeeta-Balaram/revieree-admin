import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  FileText,
  RefreshCw,
  Check,
  X,
  AlertCircle,
  Eye,
  Download,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { generateBlogTopics, generateBlogContent, isGeminiConfigured } from '../../utils/geminiAI';
import { addBlog } from '../../utils/adminStorage';

const AIBlogAssistant = () => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [generatedBlog, setGeneratedBlog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('topics'); // topics, preview, success
  const [lastGenerated, setLastGenerated] = useState(null);

  useEffect(() => {
    // Check if topics were generated today
    const savedTopics = localStorage.getItem('ai_blog_topics');
    const savedDate = localStorage.getItem('ai_blog_topics_date');
    const savedBlog = localStorage.getItem('ai_blog_draft');
    const savedSelectedTopic = localStorage.getItem('ai_blog_selected_topic');

    if (savedTopics && savedDate === new Date().toDateString()) {
      setTopics(JSON.parse(savedTopics));
      setLastGenerated(new Date(savedDate));
    }

    // Restore draft blog if exists
    if (savedBlog) {
      setGeneratedBlog(JSON.parse(savedBlog));
      setStep('preview');
    }

    // Restore selected topic if exists
    if (savedSelectedTopic) {
      setSelectedTopic(JSON.parse(savedSelectedTopic));
    }
  }, []);

  const handleGenerateTopics = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await generateBlogTopics();
      setTopics(result);
      setLastGenerated(new Date());

      // Save to localStorage
      localStorage.setItem('ai_blog_topics', JSON.stringify(result));
      localStorage.setItem('ai_blog_topics_date', new Date().toDateString());
    } catch (err) {
      console.error('Error generating topics:', err);
      setError(err.message || 'Failed to generate topics');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTopic = (topic) => {
    setSelectedTopic(topic);
    // Auto-save selected topic
    localStorage.setItem('ai_blog_selected_topic', JSON.stringify(topic));
  };

  const handleGenerateBlog = async () => {
    if (!selectedTopic) return;

    setLoading(true);
    setError(null);

    try {
      const result = await generateBlogContent(selectedTopic);
      setGeneratedBlog(result);
      setStep('preview');

      // Auto-save generated blog
      localStorage.setItem('ai_blog_draft', JSON.stringify(result));
    } catch (err) {
      console.error('Error generating blog:', err);
      setError(err.message || 'Failed to generate blog content');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishBlog = () => {
    if (!generatedBlog) return;

    const blog = {
      title: generatedBlog.title,
      content: generatedBlog.content,
      excerpt: generatedBlog.excerpt,
      author: localStorage.getItem('adminEmail') || 'Admin',
      image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop',
      category: 'AI Generated',
      tags: generatedBlog.keywords || [],
      status: 'Draft', // Save as draft for review
    };

    addBlog(blog);
    setStep('success');

    // Clear saved draft after publishing
    localStorage.removeItem('ai_blog_draft');
    localStorage.removeItem('ai_blog_selected_topic');
  };

  const handleReset = () => {
    setSelectedTopic(null);
    setGeneratedBlog(null);
    setStep('topics');
    setError(null);

    // Clear saved drafts
    localStorage.removeItem('ai_blog_draft');
    localStorage.removeItem('ai_blog_selected_topic');
  };

  if (!isGeminiConfigured()) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">AI Blog Assistant</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="text-amber-600 flex-shrink-0 mt-1" size={20} />
            <div>
              <h3 className="font-semibold text-amber-900 mb-2">AI Features Not Configured</h3>
              <p className="text-sm text-amber-800 mb-3">
                To enable AI-powered blog generation, add your free Gemini API key to Vercel environment variables.
              </p>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-amber-900 font-medium underline hover:text-amber-700"
              >
                Get Free Gemini API Key →
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-100 rounded-lg">
            <Sparkles className="text-[#8B0000]" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Blog Assistant</h1>
            <p className="text-sm text-gray-600">
              Generate blog topics daily and create content with AI
            </p>
          </div>
        </div>

        {step === 'topics' && (
          <button
            onClick={handleGenerateTopics}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-3 bg-[#8B0000] text-white rounded-lg hover:bg-[#DC143C] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} size={18} />
            <span>{loading ? 'Generating...' : 'Generate New Topics'}</span>
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
        >
          <div className="flex items-start space-x-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-semibold text-red-900 mb-1">Error</h4>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 1: Topic Selection */}
      {step === 'topics' && (
        <div>
          {lastGenerated && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
              <Calendar size={16} />
              <span>Topics generated: {new Date(lastGenerated).toLocaleDateString('en-GB')}</span>
            </div>
          )}

          {topics.length === 0 && !loading && (
            <div className="text-center py-16 bg-white rounded-lg shadow">
              <Sparkles size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-xl text-gray-600 mb-2">No topics generated yet</p>
              <p className="text-sm text-gray-500">Click "Generate New Topics" to get 5 blog ideas</p>
            </div>
          )}

          {loading && topics.length === 0 && (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {topics.map((topic, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all ${
                  selectedTopic?.title === topic.title
                    ? 'ring-2 ring-purple-700 shadow-lg'
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleSelectTopic(topic)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{topic.title}</h3>
                    <p className="text-gray-700 mb-3">{topic.description}</p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {topic.keywords?.slice(0, 5).map((keyword, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-red-100 text-[#8B0000] text-xs rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>👥 {topic.targetAudience}</span>
                      <span>📝 {topic.estimatedLength}</span>
                    </div>
                  </div>

                  {selectedTopic?.title === topic.title && (
                    <div className="ml-4">
                      <div className="w-6 h-6 bg-[#8B0000] rounded-full flex items-center justify-center">
                        <Check className="text-white" size={16} />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {selectedTopic && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex justify-end"
            >
              <button
                onClick={handleGenerateBlog}
                className="flex items-center space-x-2 px-8 py-4 bg-[#8B0000] text-white rounded-lg hover:bg-[#DC143C] transition-colors text-lg font-medium"
              >
                <Sparkles size={20} />
                <span>Generate Full Blog</span>
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* Step 2: Blog Preview */}
      {step === 'preview' && generatedBlog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Blog Preview</h2>
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{generatedBlog.wordCount}</span> words
                </div>
                <div className="h-4 w-px bg-gray-300"></div>
                <div className="text-sm text-gray-600">
                  Readability: <span className="font-medium">{generatedBlog.readabilityScore}/100</span>
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{generatedBlog.title}</h1>
            <p className="text-lg text-gray-600 mb-6 italic">{generatedBlog.excerpt}</p>

            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-800">{generatedBlog.content}</div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">SEO Keywords:</h3>
              <div className="flex flex-wrap gap-2">
                {generatedBlog.keywords?.map((keyword, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={handleReset}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X size={18} />
              <span>Cancel</span>
            </button>

            <button
              onClick={handlePublishBlog}
              className="flex items-center space-x-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileText size={18} />
              <span>Save as Draft</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Success */}
      {step === 'success' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow p-12 text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="text-green-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog Saved Successfully!</h2>
          <p className="text-gray-600 mb-8">
            Your AI-generated blog has been saved as a draft. You can review and publish it from the Blogs page.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-[#8B0000] text-white rounded-lg hover:bg-[#DC143C] transition-colors"
            >
              Generate Another Blog
            </button>
            <a
              href="/admin/blogs"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors inline-block"
            >
              Go to Blogs
            </a>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AIBlogAssistant;