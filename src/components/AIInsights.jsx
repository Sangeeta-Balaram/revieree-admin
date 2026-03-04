import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  Target,
  Package,
  Megaphone,
  Rocket,
  AlertCircle,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';
import { generateBusinessInsights, isGeminiConfigured } from '../utils/geminiAI';

const AIInsights = ({ businessData }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastGenerated, setLastGenerated] = useState(null);

  const handleGenerateInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await generateBusinessInsights(businessData);
      setInsights(result);
      setLastGenerated(new Date());
    } catch (err) {
      console.error('Error generating insights:', err);
      setError(err.message || 'Failed to generate insights. Please check your Gemini API key.');
    } finally {
      setLoading(false);
    }
  };

  if (!isGeminiConfigured()) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="text-amber-600 flex-shrink-0 mt-1" size={20} />
          <div>
            <h3 className="font-semibold text-amber-900 mb-2">AI Features Not Configured</h3>
            <p className="text-sm text-amber-800 mb-3">
              To enable AI-powered business insights, add your free Gemini API key to Vercel environment variables.
            </p>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-amber-900 font-medium underline hover:text-amber-700"
            >
              Get Free Gemini API Key →
            </a>
            <p className="text-xs text-amber-700 mt-2">
              Add VITE_GEMINI_API_KEY to your Vercel environment variables
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#8B0000] to-[#DC143C] rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Sparkles className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AI Business Insights</h2>
              <p className="text-sm text-red-100 mt-1">
                {lastGenerated
                  ? `Last updated: ${lastGenerated.toLocaleDateString('en-GB')} at ${lastGenerated.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
                  : 'Get AI-powered recommendations for your business'}
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerateInsights}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-3 bg-white text-[#8B0000] rounded-lg hover:bg-red-50 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} size={18} />
            <span>{loading ? 'Analyzing...' : 'Generate Insights'}</span>
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
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

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl shadow-sm p-5 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
                <div className="h-5 bg-gray-300 rounded w-2/3"></div>
              </div>
              <div className="space-y-2.5">
                <div className="h-3 bg-gray-300 rounded"></div>
                <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                <div className="h-3 bg-gray-300 rounded w-4/6"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Insights Display */}
      <AnimatePresence>
        {insights && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5"
          >
            {/* Key Insights */}
            {insights.insights && insights.insights.length > 0 && (
              <InsightCard
                icon={Lightbulb}
                title="Key Insights"
                color="blue"
                items={insights.insights}
              />
            )}

            {/* Revenue Strategies */}
            {insights.revenueStrategies && insights.revenueStrategies.length > 0 && (
              <InsightCard
                icon={TrendingUp}
                title="Revenue Optimization"
                color="green"
                items={insights.revenueStrategies}
              />
            )}

            {/* Sales Tactics */}
            {insights.salesTactics && insights.salesTactics.length > 0 && (
              <InsightCard
                icon={Target}
                title="Sales Boosting Tactics"
                color="purple"
                items={insights.salesTactics}
              />
            )}

            {/* Inventory Recommendations */}
            {insights.inventoryRecommendations && insights.inventoryRecommendations.length > 0 && (
              <InsightCard
                icon={Package}
                title="Inventory Recommendations"
                color="yellow"
                items={insights.inventoryRecommendations}
              />
            )}

            {/* Marketing Strategies */}
            {insights.marketingStrategies && insights.marketingStrategies.length > 0 && (
              <InsightCard
                icon={Megaphone}
                title="Marketing Strategies"
                color="pink"
                items={insights.marketingStrategies}
              />
            )}

            {/* Scaling Opportunities */}
            {insights.scalingOpportunities && insights.scalingOpportunities.length > 0 && (
              <InsightCard
                icon={Rocket}
                title="Scaling Opportunities"
                color="indigo"
                items={insights.scalingOpportunities}
              />
            )}

            {/* Competitor Analysis */}
            {insights.competitorAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-2 xl:col-span-3 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2.5 bg-orange-100 text-orange-600 rounded-lg shadow-sm">
                    <TrendingUp size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Market & Competitor Analysis</h3>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-orange-100">
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{insights.competitorAnalysis}</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Insight Card Component
const InsightCard = ({ icon: Icon, title, color, items }) => {
  const colorClasses = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'bg-blue-100 text-blue-600', text: 'text-blue-600' },
    green: { bg: 'bg-green-50', border: 'border-green-200', icon: 'bg-green-100 text-green-600', text: 'text-green-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'bg-purple-100 text-purple-600', text: 'text-purple-600' },
    yellow: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'bg-amber-100 text-amber-600', text: 'text-amber-600' },
    pink: { bg: 'bg-pink-50', border: 'border-pink-200', icon: 'bg-pink-100 text-pink-600', text: 'text-pink-600' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'bg-indigo-100 text-indigo-600', text: 'text-indigo-600' },
  };

  const classes = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${classes.bg} border ${classes.border} rounded-xl shadow-sm hover:shadow-md transition-shadow p-5`}
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className={`p-2.5 rounded-lg ${classes.icon} shadow-sm`}>
          <Icon size={20} />
        </div>
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      </div>
      <ul className="space-y-2.5">
        {items.map((item, index) => (
          <li key={index} className="flex items-start space-x-3 group">
            <div className={`w-1.5 h-1.5 rounded-full ${classes.icon.split(' ')[0]} mt-2 flex-shrink-0`}></div>
            <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default AIInsights;