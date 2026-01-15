// Vercel Serverless Function for AI Blog Topics
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
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

    const prompt = `You are a content marketing expert for "Revieree", a luxury fragrance and cosmetics e-commerce brand.

Generate 5 engaging blog topic ideas that will:
1. Attract organic traffic through SEO
2. Educate customers about fragrances and cosmetics
3. Build brand authority
4. Drive sales conversions

For each topic, provide:
- Title (catchy and SEO-optimized)
- Description (2-3 sentences about what the blog will cover)
- Target Keywords (5-7 SEO keywords to include)
- Target Audience (who would find this valuable)
- Estimated Length (e.g., "1200-1500 words")

Format as JSON array with objects containing: title, description, keywords (array), targetAudience, estimatedLength`;

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
    console.error('Error generating blog topics:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate blog topics' });
  }
}