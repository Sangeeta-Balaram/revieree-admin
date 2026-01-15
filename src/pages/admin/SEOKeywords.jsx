import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, RefreshCw, TrendingUp, AlertCircle, Calendar, Download } from 'lucide-react';
import { generateSEOKeywords, isGeminiConfigured } from '../../utils/geminiAI';

const SEOKeywords = () => {
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastGenerated, setLastGenerated] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadSavedKeywords();
  }, []);

  const loadSavedKeywords = () => {
    const saved = localStorage.getItem('ai_seo_keywords');
    const savedDate = localStorage.getItem('ai_seo_keywords_date');

    if (saved && savedDate) {
      const generatedDate = new Date(savedDate);
      const daysSince = Math.floor((new Date() - generatedDate) / (1000 * 60 * 60 * 24));

      if (daysSince < 15) {
        setKeywords(JSON.parse(saved));
        setLastGenerated(generatedDate);
      }
    }
  };

  const handleGenerateKeywords = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await generateSEOKeywords(selectedCategory);
      setKeywords(result);
      const now = new Date();
      setLastGenerated(now);

      localStorage.setItem('ai_seo_keywords', JSON.stringify(result));
      localStorage.setItem('ai_seo_keywords_date', now.toISOString());
    } catch (err) {
      console.error('Error generating keywords:', err);
      setError(err.message || 'Failed to generate SEO keywords');
    } finally {
      setLoading(false);
    }
  };

  const exportKeywords = () => {
    const csv = [
      ['Keyword', 'Search Volume', 'Difficulty', 'Relevance', 'Category', 'Recommendations'].join(','),
      ...keywords.map(k => [
        k.keyword,
        k.searchVolume,
        k.difficulty,
        k.relevanceScore,
        k.category,
        `"${k.recommendations?.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo_keywords_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isGeminiConfigured()) {
    return (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">SEO Keywords Research</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="text-amber-600 flex-shrink-0 mt-1" size={20} />
            <div>
              <h3 className="font-semibold text-amber-900 mb-2">AI Features Not Configured</h3>
              <p className="text-sm text-amber-800">
                Add your Gemini API key to Vercel environment variables to enable SEO keyword research.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const daysUntilRefresh = lastGenerated
    ? 15 - Math.floor((new Date() - new Date(lastGenerated)) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-100 rounded-lg">
            <Search className="text-[#8B0000]" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SEO Keywords Research</h1>
            <p className="text-sm text-gray-600">AI-powered keyword recommendations (refresh every 15 days)</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {keywords.length > 0 && (
            <button
              onClick={exportKeywords}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <Download size={18} />
              <span>Export CSV</span>
            </button>
          )}
          <button
            onClick={handleGenerateKeywords}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-3 bg-[#8B0000] text-white rounded-lg hover:bg-[#DC143C] disabled:opacity-50"
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} size={18} />
            <span>{loading ? 'Generating...' : 'Generate Keywords'}</span>
          </button>
        </div>
      </div>

      {/* Info Banner */}
      {lastGenerated && daysUntilRefresh > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <Calendar className="text-[#8B0000]" size={20} />
            <div className="text-sm">
              <span className="text-red-900 font-medium">
                Last updated: {new Date(lastGenerated).toLocaleDateString('en-GB')}
              </span>
              <span className="text-red-700 ml-2">
                • Next refresh in {daysUntilRefresh} days
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex space-x-3">
          {['all', 'fragrance', 'cosmetic', 'general'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#8B0000] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
        >
          <div className="flex items-start space-x-3">
            <AlertCircle className="text-red-600" size={20} />
            <div>
              <h4 className="font-semibold text-red-900">Error</h4>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Keywords Table */}
      {loading && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="animate-pulse p-6 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      )}

      {!loading && keywords.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Keyword</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Volume</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Difficulty</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Relevance</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">How to Use</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {keywords.map((keyword, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">{keyword.keyword}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      keyword.searchVolume === 'high' ? 'bg-green-100 text-green-700' :
                      keyword.searchVolume === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {keyword.searchVolume}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      keyword.difficulty === 'low' ? 'bg-green-100 text-green-700' :
                      keyword.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {keyword.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${keyword.relevanceScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{keyword.relevanceScore}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                      {keyword.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                    {keyword.recommendations}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && keywords.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-xl text-gray-600 mb-2">No keywords generated yet</p>
          <p className="text-sm text-gray-500">Click "Generate Keywords" to get AI-powered SEO recommendations</p>
        </div>
      )}
    </div>
  );
};

export default SEOKeywords;