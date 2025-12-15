-- Batch 60: Health Scores, Renewals, Surveys
-- Tables for customer success metrics tracking

-- ============================================
-- HEALTH SCORES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS health_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  health_code VARCHAR(20) UNIQUE NOT NULL,

  -- Customer information
  customer_name VARCHAR(255) NOT NULL,
  customer_id UUID,
  account_type VARCHAR(50) DEFAULT 'standard',

  -- Overall scores
  overall_score INTEGER DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  category VARCHAR(50) DEFAULT 'fair' CHECK (category IN ('excellent', 'good', 'fair', 'poor', 'critical')),
  trend VARCHAR(50) DEFAULT 'stable' CHECK (trend IN ('improving', 'stable', 'declining')),
  previous_score INTEGER DEFAULT 0,
  score_change INTEGER DEFAULT 0,

  -- Component scores
  product_usage INTEGER DEFAULT 0 CHECK (product_usage >= 0 AND product_usage <= 100),
  engagement INTEGER DEFAULT 0 CHECK (engagement >= 0 AND engagement <= 100),
  support_health INTEGER DEFAULT 0 CHECK (support_health >= 0 AND support_health <= 100),
  financial INTEGER DEFAULT 0 CHECK (financial >= 0 AND financial <= 100),
  sentiment INTEGER DEFAULT 0 CHECK (sentiment >= 0 AND sentiment <= 100),

  -- Metrics
  risk_factors INTEGER DEFAULT 0,
  opportunities INTEGER DEFAULT 0,
  monthly_trend INTEGER[] DEFAULT ARRAY[]::INTEGER[],

  -- Metadata
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- RENEWALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  renewal_code VARCHAR(20) UNIQUE NOT NULL,

  -- Customer information
  customer_name VARCHAR(255) NOT NULL,
  customer_id UUID,

  -- Renewal status
  status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in-negotiation', 'renewed', 'churned', 'at-risk')),
  renewal_type VARCHAR(50) DEFAULT 'flat' CHECK (renewal_type IN ('expansion', 'flat', 'contraction', 'downgrade')),
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),

  -- Financial
  current_arr DECIMAL(15,2) DEFAULT 0,
  proposed_arr DECIMAL(15,2) DEFAULT 0,
  expansion_value DECIMAL(15,2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'USD',

  -- Dates
  renewal_date DATE,
  days_to_renewal INTEGER DEFAULT 0,
  contract_term INTEGER DEFAULT 12,

  -- Probability and health
  probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  health_score INTEGER DEFAULT 0 CHECK (health_score >= 0 AND health_score <= 100),

  -- Management
  csm_name VARCHAR(255),
  csm_email VARCHAR(255),
  last_contact_date DATE,
  meetings_scheduled INTEGER DEFAULT 0,
  proposal_sent BOOLEAN DEFAULT FALSE,
  proposal_sent_date DATE,

  -- Notes
  notes TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- SURVEYS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  survey_code VARCHAR(20) UNIQUE NOT NULL,

  -- Survey information
  title VARCHAR(255) NOT NULL,
  description TEXT,
  survey_type VARCHAR(50) DEFAULT 'customer-feedback' CHECK (survey_type IN ('nps', 'csat', 'customer-feedback', 'employee-engagement', 'market-research', 'product-feedback')),
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'closed', 'archived')),

  -- Authorship
  created_by VARCHAR(255),
  created_by_id UUID,

  -- Survey config
  total_questions INTEGER DEFAULT 0,
  target_responses INTEGER DEFAULT 100,

  -- Response stats
  total_responses INTEGER DEFAULT 0,
  sent_to INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0,
  average_time DECIMAL(5,2) DEFAULT 0,

  -- Scores
  nps_score INTEGER,
  csat_score DECIMAL(3,1),

  -- Dates
  published_date TIMESTAMP WITH TIME ZONE,
  closed_date TIMESTAMP WITH TIME ZONE,

  -- Tags
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- SURVEY QUESTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS survey_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Question details
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) DEFAULT 'multiple-choice' CHECK (question_type IN ('multiple-choice', 'single-choice', 'text', 'rating', 'nps', 'csat', 'matrix')),
  required BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,

  -- Options for choice questions
  options JSONB DEFAULT '[]'::JSONB,

  -- Settings
  min_value INTEGER,
  max_value INTEGER,
  placeholder TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SURVEY RESPONSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Respondent info
  respondent_email VARCHAR(255),
  respondent_name VARCHAR(255),

  -- Response data
  responses JSONB DEFAULT '{}'::JSONB,

  -- Status
  status VARCHAR(50) DEFAULT 'complete' CHECK (status IN ('in-progress', 'complete', 'abandoned')),
  completion_time INTEGER DEFAULT 0,

  -- Metadata
  ip_address VARCHAR(45),
  user_agent TEXT,

  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Health Scores indexes
CREATE INDEX IF NOT EXISTS idx_health_scores_user_id ON health_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_health_scores_customer_name ON health_scores(customer_name);
CREATE INDEX IF NOT EXISTS idx_health_scores_category ON health_scores(category);
CREATE INDEX IF NOT EXISTS idx_health_scores_trend ON health_scores(trend);
CREATE INDEX IF NOT EXISTS idx_health_scores_overall_score ON health_scores(overall_score);
CREATE INDEX IF NOT EXISTS idx_health_scores_deleted_at ON health_scores(deleted_at);

-- Renewals indexes
CREATE INDEX IF NOT EXISTS idx_renewals_user_id ON renewals(user_id);
CREATE INDEX IF NOT EXISTS idx_renewals_customer_name ON renewals(customer_name);
CREATE INDEX IF NOT EXISTS idx_renewals_status ON renewals(status);
CREATE INDEX IF NOT EXISTS idx_renewals_renewal_date ON renewals(renewal_date);
CREATE INDEX IF NOT EXISTS idx_renewals_priority ON renewals(priority);
CREATE INDEX IF NOT EXISTS idx_renewals_deleted_at ON renewals(deleted_at);

-- Surveys indexes
CREATE INDEX IF NOT EXISTS idx_surveys_user_id ON surveys(user_id);
CREATE INDEX IF NOT EXISTS idx_surveys_status ON surveys(status);
CREATE INDEX IF NOT EXISTS idx_surveys_survey_type ON surveys(survey_type);
CREATE INDEX IF NOT EXISTS idx_surveys_deleted_at ON surveys(deleted_at);

-- Survey questions indexes
CREATE INDEX IF NOT EXISTS idx_survey_questions_survey_id ON survey_questions(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_questions_order ON survey_questions(survey_id, order_index);

-- Survey responses indexes
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_status ON survey_responses(status);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Health Scores policies
CREATE POLICY "Users can view own health scores" ON health_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own health scores" ON health_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own health scores" ON health_scores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own health scores" ON health_scores FOR DELETE USING (auth.uid() = user_id);

-- Renewals policies
CREATE POLICY "Users can view own renewals" ON renewals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own renewals" ON renewals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own renewals" ON renewals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own renewals" ON renewals FOR DELETE USING (auth.uid() = user_id);

-- Surveys policies
CREATE POLICY "Users can view own surveys" ON surveys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own surveys" ON surveys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own surveys" ON surveys FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own surveys" ON surveys FOR DELETE USING (auth.uid() = user_id);

-- Survey questions policies
CREATE POLICY "Users can view own survey questions" ON survey_questions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own survey questions" ON survey_questions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own survey questions" ON survey_questions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own survey questions" ON survey_questions FOR DELETE USING (auth.uid() = user_id);

-- Survey responses policies
CREATE POLICY "Users can view own survey responses" ON survey_responses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own survey responses" ON survey_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own survey responses" ON survey_responses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own survey responses" ON survey_responses FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Updated_at triggers
CREATE TRIGGER update_health_scores_updated_at BEFORE UPDATE ON health_scores
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_renewals_updated_at BEFORE UPDATE ON renewals
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_surveys_updated_at BEFORE UPDATE ON surveys
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_survey_questions_updated_at BEFORE UPDATE ON survey_questions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE health_scores;
ALTER PUBLICATION supabase_realtime ADD TABLE renewals;
ALTER PUBLICATION supabase_realtime ADD TABLE surveys;
ALTER PUBLICATION supabase_realtime ADD TABLE survey_questions;
ALTER PUBLICATION supabase_realtime ADD TABLE survey_responses;
