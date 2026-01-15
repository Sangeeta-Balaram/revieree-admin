// Vercel Serverless Function for AI SEO Keywords
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
    const { category = 'all' } = req.body;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

    const categoryText = category === 'all'
      ? 'fragrances and cosmetics'
      : category === 'fragrance'
      ? 'luxury fragrances and perfumes'
      : 'premium cosmetics and beauty products';

    const prompt = `You are an SEO expert specializing in e-commerce for luxury beauty products.

Generate a comprehensive SEO keyword strategy for "Revieree", an online store selling ${categoryText}.

For each keyword, provide:
- Keyword phrase
- Estimated search volume (low/medium/high)
- Difficulty level (low/medium/high)
- Relevance score (1-100, how relevant to our business)
- Category (fragrance/cosmetic/general)
- Recommendations (how to use this keyword effectively)

Focus on:
1. Long-tail keywords (easier to rank)
2. Buyer intent keywords (people ready to purchase)
3. Local SEO keywords (if applicable)
4. Trending beauty/fragrance keywords
5. Low competition opportunities

Provide 15-20 keywords. Format as JSON array with objects containing: keyword, searchVolume, difficulty, relevanceScore, category, recommendations`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return res.status(200).json(data);
      }
    } catch (e) {
      console.warn('Could not parse JSON');
    }

    return res.status(200).json([]);
  } catch (error) {
    console.error('Error generating SEO keywords:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate SEO keywords' });
  }
}