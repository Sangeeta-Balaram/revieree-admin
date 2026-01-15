// Test endpoint to list available Gemini models using REST API
module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  
    const apiKey = process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }
  
    try {
      // Call the REST API to list models
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );
  
      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({
          error: `API returned ${response.status}`,
          details: errorText
        });
      }
  
      const data = await response.json();
  
      return res.status(200).json({
        success: true,
        totalModels: data.models?.length || 0,
        models: data.models?.map(m => ({
          name: m.name,
          displayName: m.displayName,
          supportedGenerationMethods: m.supportedGenerationMethods
        })) || []
      });
    } catch (error) {
      console.error('Error listing models:', error);
      return res.status(500).json({
        error: error.message,
        stack: error.stack
      });
    }
  }