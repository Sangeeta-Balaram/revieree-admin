// Vercel Serverless Function for AI Blog Content
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
    const topic = req.body;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

    const prompt = `You are a professional content writer for "Revieree", a luxury fragrance and cosmetics brand.

Write a complete, engaging blog post based on this topic:

Title: ${topic.title}
Description: ${topic.description}
Target Keywords: ${topic.keywords?.join(', ')}
Target Audience: ${topic.targetAudience}
Target Length: ${topic.estimatedLength}

Requirements:
1. Write in a conversational, engaging tone
2. Include the target keywords naturally (don't stuff)
3. Use proper headings (## for H2, ### for H3)
4. Include practical tips and actionable advice
5. Add a strong conclusion with a call-to-action
6. Make it SEO-friendly but human-readable

Format the response as JSON with these keys:
- title (final blog title)
- content (full blog post in markdown format)
- excerpt (2-3 sentence summary for preview)
- metaDescription (SEO meta description, 150-160 characters)
- keywords (array of keywords used)
- readabilityScore (estimated 1-100, where 100 is easiest to read)
- wordCount (estimated)`;

    const result = await model.generateContent(prompt);
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

    // Fallback response
    return res.status(200).json({
      title: topic.title,
      content: text,
      excerpt: topic.description,
      metaDescription: topic.description?.substring(0, 160),
      keywords: topic.keywords || [],
      readabilityScore: 75,
      wordCount: text.split(' ').length
    });
  } catch (error) {
    console.error('Error generating blog content:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate blog content' });
  }
}