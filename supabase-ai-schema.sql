-- AI Features Database Schema for Revieree
-- Add these tables to your existing Supabase database

-- AI Business Insights Table
CREATE TABLE IF NOT EXISTS ai_business_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  insights JSONB NOT NULL, -- Stores the full analysis
  recommendations JSONB NOT NULL, -- Action items
  competitor_analysis JSONB, -- Competitor insights
  trends JSONB, -- Market trends
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE, -- Cache expiry
  created_by TEXT -- Admin email who requested
);

-- AI Blog Topics Table
CREATE TABLE IF NOT EXISTS ai_blog_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_title TEXT NOT NULL,
  description TEXT,
  keywords TEXT[], -- SEO keywords for this topic
  target_audience TEXT,
  estimated_length TEXT, -- e.g., "1200-1500 words"
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, published
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by TEXT, -- Admin email
  approved_at TIMESTAMP WITH TIME ZONE
);

-- AI Generated Blog Content Table
CREATE TABLE IF NOT EXISTS ai_blog_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES ai_blog_topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- Full blog content in markdown
  excerpt TEXT,
  meta_description TEXT,
  keywords TEXT[],
  readability_score INTEGER, -- 1-100
  word_count INTEGER,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'draft', -- draft, reviewed, published
  published_at TIMESTAMP WITH TIME ZONE
);

-- AI SEO Keywords Table
CREATE TABLE IF NOT EXISTS ai_seo_keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword TEXT NOT NULL,
  search_volume INTEGER, -- Estimated monthly searches
  difficulty TEXT, -- low, medium, high
  relevance_score INTEGER, -- 1-100
  category TEXT, -- fragrance, cosmetic, general
  recommendations TEXT, -- How to use this keyword
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE, -- Valid for 15 days
  status TEXT DEFAULT 'active' -- active, implemented, archived
);

-- AI Activity Log Table
CREATE TABLE IF NOT EXISTS ai_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_type TEXT NOT NULL, -- generate_insights, generate_topics, generate_blog, generate_seo
  user_email TEXT NOT NULL,
  ai_model TEXT, -- gpt-4, gemini-pro
  tokens_used INTEGER,
  cost_estimate NUMERIC(10, 4), -- Estimated cost in USD
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_topics_status ON ai_blog_topics(status);
CREATE INDEX IF NOT EXISTS idx_blog_topics_generated_at ON ai_blog_topics(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_content_topic_id ON ai_blog_content(topic_id);
CREATE INDEX IF NOT EXISTS idx_seo_keywords_category ON ai_seo_keywords(category);
CREATE INDEX IF NOT EXISTS idx_seo_keywords_valid_until ON ai_seo_keywords(valid_until);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON ai_activity_log(user_email);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON ai_activity_log(created_at DESC);

-- Enable Row Level Security
ALTER TABLE ai_business_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_blog_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_blog_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_seo_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_activity_log ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for authenticated users)
CREATE POLICY "Enable all for authenticated users" ON ai_business_insights FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON ai_blog_topics FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON ai_blog_content FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON ai_seo_keywords FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON ai_activity_log FOR ALL USING (true);