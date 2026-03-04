import { useState, useEffect } from 'react';
import { TrendingUp, Target, DollarSign, Calendar, Users, Zap, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';

const AIAdSpecialist = ({ businessData }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load saved ad insights on mount
  useEffect(() => {
    const savedInsights = localStorage.getItem('ai_ad_insights');
    const savedDate = localStorage.getItem('ai_ad_insights_date');

    // Only restore if saved today (ad insights should be fresh)
    if (savedInsights && savedDate === new Date().toDateString()) {
      setInsights(JSON.parse(savedInsights));
    }
  }, []);

  const generateAdStrategy = async () => {
    setLoading(true);
    setError(null);

    try {
      const prompt = `You are a digital advertising expert specializing in e-commerce for luxury fragrances and cosmetics brands.

Analyze this business data for "Revieree" and provide a comprehensive advertising strategy:

**BUSINESS METRICS:**
- Total Products: ${businessData.totalProducts}
- Total Revenue: ₹${businessData.totalRevenue}
- Total Orders: ${businessData.totalOrders}
- Average Order Value: ₹${businessData.avgOrderValue}
- Newsletter Subscribers: ${businessData.subscribers}
- Top Selling Products: ${businessData.topProducts?.map(p => p.name).join(', ') || 'None yet'}

**CURRENT MONTH:** ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}

Provide actionable advertising recommendations:

1. **Ad Readiness Score**: Rate 1-10 how ready this business is to run paid ads
2. **Recommended Platforms**: Which platforms to prioritize (Meta/Facebook/Instagram, Google Ads, etc.) and why
3. **Budget Recommendations**:
   - Suggested monthly ad budget
   - Budget split across platforms
   - Expected ROI
4. **Campaign Ideas**:
   - 5 specific campaign concepts with target audience and messaging
   - Each campaign should have: name, platform, budget, duration, targeting, creative angle
5. **Timing Strategy**:
   - Best days/times to run ads
   - Seasonal opportunities
   - When to increase/decrease spending
6. **Ad Creative Recommendations**:
   - What visuals to use
   - What copy angles to test
   - Call-to-action suggestions
7. **Target Audiences**:
   - 3-5 audience segments to target
   - Demographics, interests, behaviors for each
8. **Success Metrics**: What KPIs to track
9. **Quick Wins**: 3 immediate actions to take this week

Format as JSON:
{
  "readinessScore": 7,
  "readinessReason": "explanation...",
  "platformStrategy": [
    {"platform": "Instagram", "priority": "High", "reason": "why", "budgetPercent": 40},
    ...
  ],
  "budgetRecommendation": {
    "monthlyBudget": 50000,
    "dailyBudget": 1667,
    "expectedROI": "300%",
    "breakdown": [...]
  },
  "campaigns": [
    {
      "name": "...",
      "platform": "Instagram",
      "objective": "Conversions",
      "budget": 15000,
      "duration": "14 days",
      "targeting": "...",
      "creative": "...",
      "expectedResults": "..."
    }
  ],
  "timingStrategy": {
    "bestDays": ["Friday", "Saturday", "Sunday"],
    "bestHours": ["6-9 PM", "8-11 PM"],
    "seasonalOpportunities": [...],
    "budgetingTips": [...]
  },
  "creativeGuidelines": {
    "visuals": [...],
    "copyAngles": [...],
    "ctas": [...]
  },
  "audiences": [
    {
      "name": "...",
      "demographics": "...",
      "interests": [...],
      "size": "Large/Medium/Small"
    }
  ],
  "successMetrics": [...],
  "quickWins": [...]
}`;

      const response = await fetch('/api/generate-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ b2bPrompt: prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate ad strategy');
      }

      const data = await response.json();
      setInsights(data);

      // Auto-save insights with today's date
      localStorage.setItem('ai_ad_insights', JSON.stringify(data));
      localStorage.setItem('ai_ad_insights_date', new Date().toDateString());
    } catch (err) {
      setError(err.message || 'Failed to generate advertising strategy');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <RefreshCw className="animate-spin mx-auto text-[#8B0000] mb-4" size={48} />
        <p className="text-gray-600">Analyzing your business and creating ad strategy...</p>
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
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-lg p-8 border border-indigo-200">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="text-white" size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Ad Specialist</h3>
          <p className="text-gray-600 mb-6">
            Get expert advertising recommendations tailored to your business. AI will analyze your data and suggest the best platforms, budgets, campaigns, and timing for maximum ROI.
          </p>
          <button
            onClick={generateAdStrategy}
            className="px-8 py-3 bg-[#8B0000] text-white rounded-lg hover:bg-[#DC143C] transition-colors font-semibold shadow-lg"
          >
            Generate Ad Strategy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Readiness Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Ad Readiness Score</h3>
          <div className="text-4xl font-bold text-green-600">{insights.readinessScore}/10</div>
        </div>
        <p className="text-gray-700 text-sm">{insights.readinessReason}</p>
      </motion.div>

      {/* Platform Strategy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Target className="text-white" size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Platform Strategy</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.platformStrategy?.map((platform, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{platform.platform}</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  platform.priority === 'High' ? 'bg-red-100 text-red-700' :
                  platform.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {platform.priority} Priority
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{platform.reason}</p>
              <div className="flex items-center space-x-2 text-sm font-medium text-indigo-600">
                <DollarSign size={16} />
                <span>{platform.budgetPercent}% of budget</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Budget Recommendations */}
      {insights.budgetRecommendation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-600 rounded-lg">
              <DollarSign className="text-white" size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Budget Recommendations</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-gray-600 mb-1">Monthly Budget</p>
              <p className="text-2xl font-bold text-gray-900">₹{insights.budgetRecommendation.monthlyBudget?.toLocaleString()}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Daily Budget</p>
              <p className="text-2xl font-bold text-gray-900">₹{insights.budgetRecommendation.dailyBudget?.toLocaleString()}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <p className="text-sm text-gray-600 mb-1">Expected ROI</p>
              <p className="text-2xl font-bold text-gray-900">{insights.budgetRecommendation.expectedROI}</p>
            </div>
          </div>
          {insights.budgetRecommendation.breakdown && (
            <div className="space-y-2">
              {insights.budgetRecommendation.breakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{item.platform || item.category}</span>
                  <span className="font-semibold text-gray-900">₹{item.amount?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Campaign Ideas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-purple-600 rounded-lg">
            <Zap className="text-white" size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Campaign Ideas</h3>
        </div>
        <div className="space-y-4">
          {insights.campaigns?.map((campaign, index) => (
            <div key={index} className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">{campaign.name}</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-700">
                      {campaign.platform}
                    </span>
                    <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-700">
                      {campaign.objective}
                    </span>
                    <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-700">
                      {campaign.duration}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-purple-600">₹{campaign.budget?.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">Budget</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p><strong>Targeting:</strong> {campaign.targeting}</p>
                <p><strong>Creative:</strong> {campaign.creative}</p>
                {campaign.expectedResults && (
                  <p className="text-green-700"><strong>Expected Results:</strong> {campaign.expectedResults}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Timing Strategy */}
      {insights.timingStrategy && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-orange-50 border border-orange-200 rounded-xl p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-orange-600 rounded-lg">
                <Calendar className="text-white" size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Best Times to Run Ads</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Best Days:</p>
                <div className="flex flex-wrap gap-2">
                  {insights.timingStrategy.bestDays?.map((day, i) => (
                    <span key={i} className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-900">
                      {day}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Best Hours:</p>
                <div className="flex flex-wrap gap-2">
                  {insights.timingStrategy.bestHours?.map((hour, i) => (
                    <span key={i} className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-900">
                      {hour}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-yellow-50 border border-yellow-200 rounded-xl p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-yellow-600 rounded-lg">
                <TrendingUp className="text-white" size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Seasonal Opportunities</h3>
            </div>
            <ul className="space-y-2">
              {insights.timingStrategy.seasonalOpportunities?.map((opp, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                  <CheckCircle className="text-yellow-600 mt-0.5" size={16} />
                  <span>{opp}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      )}

      {/* Target Audiences */}
      {insights.audiences && insights.audiences.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-pink-600 rounded-lg">
              <Users className="text-white" size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Target Audiences</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.audiences.map((audience, index) => (
              <div key={index} className="bg-pink-50 rounded-lg p-4 border border-pink-200">
                <h4 className="font-semibold text-gray-900 mb-2">{audience.name}</h4>
                <p className="text-xs text-gray-600 mb-2">{audience.demographics}</p>
                {audience.interests && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {audience.interests.slice(0, 3).map((interest, i) => (
                      <span key={i} className="px-2 py-1 bg-white rounded text-xs text-gray-700">
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
                <span className="text-xs font-medium text-pink-600">Size: {audience.size}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Wins */}
      {insights.quickWins && insights.quickWins.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Zap className="text-green-600" size={24} />
            <h3 className="text-lg font-bold text-gray-900">Quick Wins - Start This Week!</h3>
          </div>
          <ul className="space-y-3">
            {insights.quickWins.map((win, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <span className="text-gray-700">{win}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Regenerate Button */}
      <div className="text-center">
        <button
          onClick={generateAdStrategy}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Regenerate Strategy
        </button>
      </div>
    </div>
  );
};

export default AIAdSpecialist;