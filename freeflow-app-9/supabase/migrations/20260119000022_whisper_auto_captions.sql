-- ============================================================================
-- Whisper Auto-Captions System
-- Migration: 20260119000022
-- ============================================================================

-- ============================================================================
-- Transcription Jobs Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS transcription_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- File info
  filename VARCHAR(500),
  file_size INTEGER,
  file_type VARCHAR(100),

  -- Transcription options
  options JSONB DEFAULT '{}',

  -- Status tracking
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),

  -- Result
  result JSONB,
  language VARCHAR(10),
  duration NUMERIC(10, 2),

  -- Error handling
  error TEXT,

  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_transcription_jobs_user_id ON transcription_jobs(user_id);
CREATE INDEX idx_transcription_jobs_status ON transcription_jobs(status);
CREATE INDEX idx_transcription_jobs_created_at ON transcription_jobs(created_at DESC);
CREATE INDEX idx_transcription_jobs_language ON transcription_jobs(language);

-- RLS
ALTER TABLE transcription_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transcription jobs"
  ON transcription_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transcription jobs"
  ON transcription_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transcription jobs"
  ON transcription_jobs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transcription jobs"
  ON transcription_jobs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Caption Exports Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS caption_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transcription_job_id UUID REFERENCES transcription_jobs(id) ON DELETE SET NULL,

  -- Export format
  format VARCHAR(20) NOT NULL, -- 'srt', 'vtt', 'ass', 'json', 'txt'

  -- Style settings
  style JSONB DEFAULT '{}',

  -- Content (for caching)
  content TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_caption_exports_user_id ON caption_exports(user_id);
CREATE INDEX idx_caption_exports_job_id ON caption_exports(transcription_job_id);

-- RLS
ALTER TABLE caption_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own caption exports"
  ON caption_exports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own caption exports"
  ON caption_exports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own caption exports"
  ON caption_exports FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Caption Templates Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS caption_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Template info
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100),

  -- Style settings
  style JSONB NOT NULL DEFAULT '{
    "maxCharsPerLine": 42,
    "maxLines": 2,
    "minDuration": 1,
    "maxDuration": 7,
    "position": "bottom",
    "alignment": "center"
  }',

  -- Organization
  is_system BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE caption_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view templates"
  ON caption_templates FOR SELECT
  USING (is_system = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can create their own templates"
  ON caption_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_system = FALSE);

CREATE POLICY "Users can update their own templates"
  ON caption_templates FOR UPDATE
  USING (auth.uid() = user_id AND is_system = FALSE);

CREATE POLICY "Users can delete their own templates"
  ON caption_templates FOR DELETE
  USING (auth.uid() = user_id AND is_system = FALSE);

-- ============================================================================
-- Insert System Caption Templates
-- ============================================================================

INSERT INTO caption_templates (name, description, category, style, is_system) VALUES
-- Standard Templates
('Standard', 'Default caption style for most videos',
  'standard',
  '{"maxCharsPerLine": 42, "maxLines": 2, "minDuration": 1, "maxDuration": 7, "position": "bottom", "alignment": "center"}'::jsonb,
  TRUE),

('Compact', 'Shorter lines for cleaner appearance',
  'standard',
  '{"maxCharsPerLine": 32, "maxLines": 2, "minDuration": 1, "maxDuration": 5, "position": "bottom", "alignment": "center"}'::jsonb,
  TRUE),

('Single Line', 'One line at a time for simplicity',
  'standard',
  '{"maxCharsPerLine": 50, "maxLines": 1, "minDuration": 1.5, "maxDuration": 4, "position": "bottom", "alignment": "center"}'::jsonb,
  TRUE),

-- Social Media Templates
('Instagram Reels', 'Optimized for vertical video',
  'social',
  '{"maxCharsPerLine": 28, "maxLines": 3, "minDuration": 0.8, "maxDuration": 3, "position": "bottom", "alignment": "center"}'::jsonb,
  TRUE),

('TikTok', 'Short, punchy captions for TikTok',
  'social',
  '{"maxCharsPerLine": 25, "maxLines": 2, "minDuration": 0.5, "maxDuration": 2.5, "position": "bottom", "alignment": "center"}'::jsonb,
  TRUE),

('YouTube Shorts', 'Vertical format for YouTube Shorts',
  'social',
  '{"maxCharsPerLine": 30, "maxLines": 2, "minDuration": 1, "maxDuration": 4, "position": "bottom", "alignment": "center"}'::jsonb,
  TRUE),

-- Accessibility Templates
('Accessibility', 'Longer display time for easier reading',
  'accessibility',
  '{"maxCharsPerLine": 35, "maxLines": 2, "minDuration": 2, "maxDuration": 8, "position": "bottom", "alignment": "center"}'::jsonb,
  TRUE),

('High Contrast', 'Optimized for visibility',
  'accessibility',
  '{"maxCharsPerLine": 38, "maxLines": 2, "minDuration": 2, "maxDuration": 7, "position": "bottom", "alignment": "center", "fontSize": 24}'::jsonb,
  TRUE),

-- Broadcast Templates
('Broadcast Standard', 'Industry standard for TV/streaming',
  'broadcast',
  '{"maxCharsPerLine": 37, "maxLines": 2, "minDuration": 1.5, "maxDuration": 6, "position": "bottom", "alignment": "center"}'::jsonb,
  TRUE),

('Broadcast Top', 'Top position for lower thirds',
  'broadcast',
  '{"maxCharsPerLine": 37, "maxLines": 2, "minDuration": 1.5, "maxDuration": 6, "position": "top", "alignment": "center"}'::jsonb,
  TRUE);

-- ============================================================================
-- Transcription Credits/Usage Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS transcription_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Usage period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Minutes transcribed
  minutes_used NUMERIC(10, 2) DEFAULT 0,
  minutes_limit NUMERIC(10, 2) DEFAULT 60, -- Default 60 mins/month

  -- Job counts
  jobs_count INTEGER DEFAULT 0,

  -- Plan info
  plan_type VARCHAR(50) DEFAULT 'free',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_transcription_usage_user_id ON transcription_usage(user_id);
CREATE INDEX idx_transcription_usage_period ON transcription_usage(period_start, period_end);
CREATE UNIQUE INDEX idx_transcription_usage_user_period ON transcription_usage(user_id, period_start);

-- RLS
ALTER TABLE transcription_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage"
  ON transcription_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage usage"
  ON transcription_usage FOR ALL
  USING (TRUE);

-- ============================================================================
-- Utility Functions
-- ============================================================================

-- Update transcription job timestamps
CREATE OR REPLACE FUNCTION update_transcription_job_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();

  IF OLD.status = 'pending' AND NEW.status != 'pending' AND NEW.started_at IS NULL THEN
    NEW.started_at = NOW();
  END IF;

  IF NEW.status IN ('completed', 'failed') AND NEW.completed_at IS NULL THEN
    NEW.completed_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_transcription_job_timestamps
  BEFORE UPDATE ON transcription_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_transcription_job_timestamps();

-- Update user transcription usage
CREATE OR REPLACE FUNCTION update_transcription_usage()
RETURNS TRIGGER AS $$
DECLARE
  current_period_start DATE;
  current_period_end DATE;
BEGIN
  -- Only run when job completes
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.duration IS NOT NULL THEN
    -- Get current month period
    current_period_start := DATE_TRUNC('month', NOW())::DATE;
    current_period_end := (DATE_TRUNC('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

    -- Upsert usage record
    INSERT INTO transcription_usage (user_id, period_start, period_end, minutes_used, jobs_count)
    VALUES (
      NEW.user_id,
      current_period_start,
      current_period_end,
      NEW.duration / 60.0,
      1
    )
    ON CONFLICT (user_id, period_start) DO UPDATE SET
      minutes_used = transcription_usage.minutes_used + EXCLUDED.minutes_used,
      jobs_count = transcription_usage.jobs_count + 1,
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_transcription_usage
  AFTER UPDATE ON transcription_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_transcription_usage();

-- Check if user has transcription quota
CREATE OR REPLACE FUNCTION check_transcription_quota(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_usage RECORD;
BEGIN
  SELECT * INTO current_usage
  FROM transcription_usage
  WHERE user_id = p_user_id
    AND period_start <= CURRENT_DATE
    AND period_end >= CURRENT_DATE;

  IF NOT FOUND THEN
    RETURN TRUE; -- No record means hasn't started using yet
  END IF;

  RETURN current_usage.minutes_used < current_usage.minutes_limit;
END;
$$ LANGUAGE plpgsql;

-- Get user transcription stats
CREATE OR REPLACE FUNCTION get_transcription_stats(p_user_id UUID)
RETURNS TABLE (
  total_jobs INTEGER,
  completed_jobs INTEGER,
  total_minutes NUMERIC,
  current_month_minutes NUMERIC,
  current_month_limit NUMERIC,
  most_used_language VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_jobs,
    COUNT(*) FILTER (WHERE tj.status = 'completed')::INTEGER as completed_jobs,
    COALESCE(SUM(tj.duration) / 60.0, 0)::NUMERIC as total_minutes,
    COALESCE(tu.minutes_used, 0)::NUMERIC as current_month_minutes,
    COALESCE(tu.minutes_limit, 60)::NUMERIC as current_month_limit,
    (
      SELECT language
      FROM transcription_jobs
      WHERE user_id = p_user_id AND language IS NOT NULL
      GROUP BY language
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) as most_used_language
  FROM transcription_jobs tj
  LEFT JOIN transcription_usage tu ON tu.user_id = p_user_id
    AND tu.period_start <= CURRENT_DATE
    AND tu.period_end >= CURRENT_DATE
  WHERE tj.user_id = p_user_id
  GROUP BY tu.minutes_used, tu.minutes_limit;
END;
$$ LANGUAGE plpgsql;

-- Cleanup old transcription jobs (30 days)
CREATE OR REPLACE FUNCTION cleanup_old_transcription_jobs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM transcription_jobs
  WHERE created_at < NOW() - INTERVAL '30 days'
    AND status IN ('completed', 'failed');

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Views
-- ============================================================================

-- User transcription summary
CREATE OR REPLACE VIEW user_transcription_summary AS
SELECT
  user_id,
  COUNT(*) as total_jobs,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_jobs,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_jobs,
  COUNT(*) FILTER (WHERE status IN ('pending', 'processing')) as active_jobs,
  ROUND(COALESCE(SUM(duration) / 60.0, 0)::numeric, 2) as total_minutes,
  COUNT(DISTINCT language) as languages_used,
  MAX(created_at) as last_transcription
FROM transcription_jobs
GROUP BY user_id;

-- Language distribution
CREATE OR REPLACE VIEW transcription_language_distribution AS
SELECT
  language,
  COUNT(*) as job_count,
  COUNT(DISTINCT user_id) as unique_users,
  ROUND(AVG(duration)::numeric, 2) as avg_duration_seconds
FROM transcription_jobs
WHERE language IS NOT NULL AND status = 'completed'
GROUP BY language
ORDER BY job_count DESC;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE transcription_jobs IS 'Stores Whisper transcription job history';
COMMENT ON TABLE caption_exports IS 'Tracks caption exports in various formats';
COMMENT ON TABLE caption_templates IS 'Pre-configured caption styling templates';
COMMENT ON TABLE transcription_usage IS 'Tracks monthly transcription usage per user';
