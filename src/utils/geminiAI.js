// Google Gemini AI Integration via Vercel Serverless Functions
// 100% FREE - No costs involved

// Check if Gemini API is configured
export const isGeminiConfigured = () => {
    return true; // API key is configured on the server
  };
  
  /**
   * Generate business insights and recommendations
   */
  export const generateBusinessInsights = async (businessData) => {
    try {
      const response = await fetch('/api/generate-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(businessData),
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate insights');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error calling insights API:', error);
      throw error;
    }
  };
  
  /**
   * Generate 5 blog topic ideas with SEO keywords
   */
  export const generateBlogTopics = async () => {
    try {
      const response = await fetch('/api/generate-blog-topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate blog topics');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error calling blog topics API:', error);
      throw error;
    }
  };
  
  /**
   * Generate full blog content from approved topic
   */
  export const generateBlogContent = async (topic) => {
    try {
      const response = await fetch('/api/generate-blog-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(topic),
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate blog content');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error calling blog content API:', error);
      throw error;
    }
  };
  
  /**
   * Generate SEO keyword recommendations
   */
  export const generateSEOKeywords = async (category = 'all') => {
    try {
      const response = await fetch('/api/generate-seo-keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category }),
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate SEO keywords');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error calling SEO keywords API:', error);
      throw error;
    }
  };