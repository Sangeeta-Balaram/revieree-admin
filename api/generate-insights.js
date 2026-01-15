// Vercel Serverless Function for AI Business Insights
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  try {
    const businessData = req.body;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

    // Check if this is a B2B-specific request
    if (businessData.b2bPrompt) {
      const result = await model.generateContent(businessData.b2bPrompt);
      const response = await result.response;
      const text = response.text();

      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[0]);
          return res.status(200).json(data);
        }
      } catch (e) {
        console.warn('Could not parse JSON');
      }

      return res.status(200).json({ rawText: text });
    }

    const prompt = `You are a business analytics expert for an e-commerce fragrance and cosmetics brand called "Revieree".

Analyze the following business data and provide actionable insights:

Current Statistics:
- Total Products: ${businessData.totalProducts}
- Total Revenue: ₹${businessData.totalRevenue}
- Total Orders: ${businessData.totalOrders}
- Average Order Value: ₹${businessData.avgOrderValue}
- Newsletter Subscribers: ${businessData.subscribers}
- Low Stock Items: ${businessData.lowStockItems}

Product Categories:
- Fragrances: ${businessData.fragranceCount} products
- Cosmetics: ${businessData.cosmeticCount} products

Top Selling Products:
${businessData.topProducts?.map(p => `- ${p.name}: ${p.sold} units, ₹${p.revenue} revenue`).join('\n') || 'No sales data yet'}

Please provide:
1. **Key Insights**: 3-5 critical observations about the current business state
2. **Revenue Optimization**: Specific strategies to increase revenue
3. **Sales Boosting Tactics**: Actionable steps to boost sales
4. **Inventory Recommendations**: What products to stock more/less
5. **Marketing Strategies**: How to increase footfalls and conversions
6. **Competitor Analysis**: Compare with typical fragrance/cosmetics e-commerce benchmarks
7. **Scaling Opportunities**: How to scale the business based on current trends

Format the response as JSON with these keys: insights (array), revenueStrategies (array), salesTactics (array), inventoryRecommendations (array), marketingStrategies (array), competitorAnalysis (string), scalingOpportunities (array)`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse JSON
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return res.status(200).json(data);
      }
    } catch (e) {
      console.warn('Could not parse JSON, returning structured text');
    }

    // Fallback response
    return res.status(200).json({
      insights: [text],
      revenueStrategies: [],
      salesTactics: [],
      inventoryRecommendations: [],
      marketingStrategies: [],
      competitorAnalysis: text,
      scalingOpportunities: []
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate insights' });
  }
}