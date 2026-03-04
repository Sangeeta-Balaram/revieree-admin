import { useState } from 'react';
import { Brain, TrendingUp, Target, Users, Lightbulb, RefreshCw, AlertCircle } from 'lucide-react';

const AIB2BCoach = ({ leadsData, pipelineAnalytics }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const prompt = `You are a B2B sales expert for a luxury fragrance and cosmetics wholesale business called "Revieree".

Analyze this sales pipeline data and provide actionable insights:

PIPELINE DATA:
- Total Leads: ${leadsData.total}
- Cold Leads: ${leadsData.cold}
- Contacted: ${leadsData.contacted}
- Interested: ${leadsData.interested}
- Qualified: ${leadsData.qualified}
- Closed Won: ${leadsData.closedWon}
- Closed Lost: ${leadsData.closedLost}
- Conversion Rate: ${pipelineAnalytics.conversionRate}%
- Total Deal Value: ₹${pipelineAnalytics.totalDealValue}
- Average Deal Value: ₹${pipelineAnalytics.avgDealValue}

TOP INDUSTRIES: ${leadsData.topIndustries?.join(', ') || 'None'}
TOP LOCATIONS: ${leadsData.topLocations?.join(', ') || 'None'}

Provide:
1. **Pipeline Health**: 3-4 observations about the current pipeline health
2. **Lead Generation Strategies**: 5 specific, actionable strategies to get MORE B2B clients
3. **Industry Targeting**: Which industries to focus on and why
4. **Geographic Expansion**: Which cities/regions to target
5. **Conversion Optimization**: How to improve conversion rate
6. **Deal Value Growth**: How to increase average deal size

Format as JSON:
{
  "pipelineHealth": ["observation1", "observation2", ...],
  "leadGenStrategies": [{"strategy": "title", "description": "details", "expectedImpact": "high/medium/low"}, ...],
  "industryTargets": [{"industry": "name", "reason": "why", "approach": "how"}, ...],
  "geographicTargets": [{"location": "name", "reason": "why", "tactics": "specific tactics"}, ...],
  "conversionTips": ["tip1", "tip2", ...],
  "dealValueTips": ["tip1", "tip2", ...]
}`;

      const response = await fetch('/api/generate-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ b2bPrompt: prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }

      const data = await response.json();
      setInsights(data);
    } catch (err) {
      setError(err.message || 'Failed to generate B2B insights');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <RefreshCw className="animate-spin mx-auto text-[#8B0000] mb-4" size={48} />
        <p className="text-gray-600">Analyzing your B2B pipeline...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="text-red-600" size={24} />
          <div>
            <h4 className="font-semibold text-red-900">Error</h4>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-lg p-8 border border-purple-200">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="text-white" size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">AI B2B Growth Coach</h3>
          <p className="text-gray-600 mb-6">
            Get AI-powered insights on how to acquire more B2B clients, improve your conversion rate, and grow deal sizes.
          </p>
          <button
            onClick={generateInsights}
            className="px-8 py-3 bg-[#8B0000] text-white rounded-lg hover:bg-[#DC143C] transition-colors font-semibold shadow-lg"
          >
            Generate B2B Insights
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pipeline Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border border-blue-200 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-600 rounded-lg">
            <TrendingUp className="text-white" size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Pipeline Health</h3>
        </div>
        <ul className="space-y-2">
          {insights.pipelineHealth?.map((observation, index) => (
            <li key={index} className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span className="text-gray-700 text-sm">{observation}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Lead Generation Strategies */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-[#8B0000] rounded-lg">
            <Users className="text-white" size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Lead Generation Strategies</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.leadGenStrategies?.map((strategy, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{strategy.strategy}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  strategy.expectedImpact === 'high' ? 'bg-green-100 text-green-700' :
                  strategy.expectedImpact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {strategy.expectedImpact} impact
                </span>
              </div>
              <p className="text-sm text-gray-600">{strategy.description}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Industry & Geographic Targets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-green-50 border border-green-200 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-600 rounded-lg">
              <Target className="text-white" size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Industry Targets</h3>
          </div>
          <div className="space-y-3">
            {insights.industryTargets?.map((target, index) => (
              <div key={index} className="bg-white rounded-lg p-3 border border-green-200">
                <h4 className="font-semibold text-gray-900 mb-1">{target.industry}</h4>
                <p className="text-xs text-gray-600 mb-1"><strong>Why:</strong> {target.reason}</p>
                <p className="text-xs text-gray-600"><strong>Approach:</strong> {target.approach}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-purple-50 border border-purple-200 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Target className="text-white" size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Geographic Targets</h3>
          </div>
          <div className="space-y-3">
            {insights.geographicTargets?.map((target, index) => (
              <div key={index} className="bg-white rounded-lg p-3 border border-purple-200">
                <h4 className="font-semibold text-gray-900 mb-1">{target.location}</h4>
                <p className="text-xs text-gray-600 mb-1"><strong>Why:</strong> {target.reason}</p>
                <p className="text-xs text-gray-600"><strong>Tactics:</strong> {target.tactics}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Conversion & Deal Value Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-yellow-50 border border-yellow-200 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-yellow-600 rounded-lg">
              <Lightbulb className="text-white" size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Conversion Optimization</h3>
          </div>
          <ul className="space-y-2">
            {insights.conversionTips?.map((tip, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span className="text-gray-700 text-sm">{tip}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-indigo-50 border border-indigo-200 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <TrendingUp className="text-white" size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Deal Value Growth</h3>
          </div>
          <ul className="space-y-2">
            {insights.dealValueTips?.map((tip, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-indigo-600 mt-1">•</span>
                <span className="text-gray-700 text-sm">{tip}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Regenerate Button */}
      <div className="text-center">
        <button
          onClick={generateInsights}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Regenerate Insights
        </button>
      </div>
    </div>
  );
};

export default AIB2BCoach;