-- Drop existing types from AI Code Completion system
DROP TYPE IF EXISTS programming_language CASCADE;
DROP TYPE IF EXISTS completion_status CASCADE;
DROP TYPE IF EXISTS bug_severity CASCADE;
DROP TYPE IF EXISTS bug_type CASCADE;
DROP TYPE IF EXISTS suggestion_type CASCADE;
DROP TYPE IF EXISTS analysis_type CASCADE;
DROP TYPE IF EXISTS template_category CASCADE;
DROP TYPE IF EXISTS export_format CASCADE;
DROP TYPE IF EXISTS ai_model CASCADE;
DROP TYPE IF EXISTS impact_level CASCADE;
DROP TYPE IF EXISTS version_action CASCADE;

-- ============================================================================
-- AI Code Completion System - Production Database Schema
-- ============================================================================
-- Comprehensive AI-powered code completion, analysis, optimization, and
-- intelligent code generation with bug detection and security scanning
-- ============================================================================

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

CREATE TYPE programming_language AS ENUM (
  'javascript', 'typescript', 'python', 'react', 'vue', 'angular',
  'node', 'php', 'java', 'csharp', 'cpp', 'rust', 'go', 'swift',
  'kotlin', 'ruby', 'scala', 'dart'
);

CREATE TYPE completion_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE bug_severity AS ENUM ('critical', 'high', 'medium', 'low', 'info');
CREATE TYPE bug_type AS ENUM ('syntax', 'logic', 'security', 'performance', 'style', 'type');
CREATE TYPE suggestion_type AS ENUM ('optimization', 'refactoring', 'security', 'best_practice', 'documentation');
CREATE TYPE analysis_type AS ENUM ('bugs', 'security', 'performance', 'complexity', 'coverage');
CREATE TYPE template_category AS ENUM ('component', 'api', 'hook', 'utility', 'test', 'config');
CREATE TYPE export_format AS ENUM ('gist', 'markdown', 'pdf', 'html', 'zip');
CREATE TYPE ai_model AS ENUM ('gpt-4', 'gpt-3.5-turbo', 'claude-3', 'codex', 'copilot');
CREATE TYPE impact_level AS ENUM ('high', 'medium', 'low');
CREATE TYPE version_action AS ENUM ('create', 'edit', 'optimize', 'refactor', 'manual_save');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Code Completions
CREATE TABLE IF NOT EXISTS code_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language programming_language NOT NULL,
  original_code TEXT NOT NULL,
  completed_code TEXT NOT NULL,
  prompt TEXT,
  model ai_model NOT NULL DEFAULT 'gpt-4',
  status completion_status NOT NULL DEFAULT 'pending',
  confidence INTEGER NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
  tokens_used INTEGER NOT NULL DEFAULT 0,
  processing_time INTEGER NOT NULL DEFAULT 0, -- milliseconds
  suggestions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Code Snippets
CREATE TABLE IF NOT EXISTS code_snippets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  language programming_language NOT NULL,
  category template_category NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  usage_count INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bug Reports
CREATE TABLE IF NOT EXISTS bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL,
  line_number INTEGER NOT NULL,
  column_number INTEGER,
  type bug_type NOT NULL,
  severity bug_severity NOT NULL,
  message TEXT NOT NULL,
  suggestion TEXT,
  code_snippet TEXT,
  auto_fixable BOOLEAN NOT NULL DEFAULT FALSE,
  fixed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Code Suggestions
CREATE TABLE IF NOT EXISTS code_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL,
  type suggestion_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact impact_level NOT NULL,
  effort impact_level NOT NULL,
  code_example TEXT,
  priority INTEGER NOT NULL DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Code Analysis
CREATE TABLE IF NOT EXISTS code_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  language programming_language NOT NULL,
  type analysis_type NOT NULL,
  performance_score INTEGER CHECK (performance_score >= 0 AND performance_score <= 100),
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  lines_of_code INTEGER NOT NULL DEFAULT 0,
  complexity INTEGER NOT NULL DEFAULT 0,
  maintainability INTEGER CHECK (maintainability >= 0 AND maintainability <= 100),
  test_coverage INTEGER CHECK (test_coverage >= 0 AND test_coverage <= 100),
  duplicate_code INTEGER CHECK (duplicate_code >= 0 AND duplicate_code <= 100),
  comment_ratio DECIMAL(5, 2) NOT NULL DEFAULT 0,
  function_count INTEGER NOT NULL DEFAULT 0,
  class_count INTEGER NOT NULL DEFAULT 0,
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Security Issues
CREATE TABLE IF NOT EXISTS security_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES code_analysis(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  severity bug_severity NOT NULL,
  description TEXT NOT NULL,
  line_number INTEGER NOT NULL,
  column_number INTEGER,
  recommendation TEXT NOT NULL,
  cwe TEXT, -- Common Weakness Enumeration
  owasp TEXT, -- OWASP Top 10
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Code Templates
CREATE TABLE IF NOT EXISTS code_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category template_category NOT NULL,
  language programming_language NOT NULL,
  template TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_time INTEGER NOT NULL DEFAULT 0, -- minutes
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Code Versions
CREATE TABLE IF NOT EXISTS code_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snippet_id UUID NOT NULL REFERENCES code_snippets(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  action version_action NOT NULL,
  additions INTEGER NOT NULL DEFAULT 0,
  deletions INTEGER NOT NULL DEFAULT 0,
  modifications INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Code Exports
CREATE TABLE IF NOT EXISTS code_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  language programming_language NOT NULL,
  format export_format NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL, -- bytes
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Code Stats
CREATE TABLE IF NOT EXISTS ai_code_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_completions INTEGER NOT NULL DEFAULT 0,
  total_tokens_used INTEGER NOT NULL DEFAULT 0,
  average_confidence DECIMAL(5, 2) NOT NULL DEFAULT 0,
  favorite_language programming_language,
  total_bugs_fixed INTEGER NOT NULL DEFAULT 0,
  total_optimizations INTEGER NOT NULL DEFAULT 0,
  code_quality_improvement DECIMAL(5, 2) NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Code Completions indexes
CREATE INDEX IF NOT EXISTS idx_code_completions_user_id ON code_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_code_completions_language ON code_completions(language);
CREATE INDEX IF NOT EXISTS idx_code_completions_status ON code_completions(status);
CREATE INDEX IF NOT EXISTS idx_code_completions_model ON code_completions(model);
CREATE INDEX IF NOT EXISTS idx_code_completions_created_at ON code_completions(created_at DESC);

-- Code Snippets indexes
CREATE INDEX IF NOT EXISTS idx_code_snippets_user_id ON code_snippets(user_id);
CREATE INDEX IF NOT EXISTS idx_code_snippets_language ON code_snippets(language);
CREATE INDEX IF NOT EXISTS idx_code_snippets_category ON code_snippets(category);
CREATE INDEX IF NOT EXISTS idx_code_snippets_is_public ON code_snippets(is_public);
CREATE INDEX IF NOT EXISTS idx_code_snippets_tags ON code_snippets USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_code_snippets_usage_count ON code_snippets(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_code_snippets_likes ON code_snippets(likes DESC);

-- Bug Reports indexes
CREATE INDEX IF NOT EXISTS idx_bug_reports_analysis_id ON bug_reports(analysis_id);
CREATE INDEX IF NOT EXISTS idx_bug_reports_severity ON bug_reports(severity);
CREATE INDEX IF NOT EXISTS idx_bug_reports_type ON bug_reports(type);
CREATE INDEX IF NOT EXISTS idx_bug_reports_fixed ON bug_reports(fixed);

-- Code Suggestions indexes
CREATE INDEX IF NOT EXISTS idx_code_suggestions_analysis_id ON code_suggestions(analysis_id);
CREATE INDEX IF NOT EXISTS idx_code_suggestions_type ON code_suggestions(type);
CREATE INDEX IF NOT EXISTS idx_code_suggestions_priority ON code_suggestions(priority DESC);

-- Code Analysis indexes
CREATE INDEX IF NOT EXISTS idx_code_analysis_user_id ON code_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_code_analysis_language ON code_analysis(language);
CREATE INDEX IF NOT EXISTS idx_code_analysis_type ON code_analysis(type);
CREATE INDEX IF NOT EXISTS idx_code_analysis_quality_score ON code_analysis(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_code_analysis_analyzed_at ON code_analysis(analyzed_at DESC);

-- Security Issues indexes
CREATE INDEX IF NOT EXISTS idx_security_issues_analysis_id ON security_issues(analysis_id);
CREATE INDEX IF NOT EXISTS idx_security_issues_severity ON security_issues(severity);
CREATE INDEX IF NOT EXISTS idx_security_issues_type ON security_issues(type);

-- Code Templates indexes
CREATE INDEX IF NOT EXISTS idx_code_templates_user_id ON code_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_code_templates_category ON code_templates(category);
CREATE INDEX IF NOT EXISTS idx_code_templates_language ON code_templates(language);
CREATE INDEX IF NOT EXISTS idx_code_templates_is_public ON code_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_code_templates_tags ON code_templates USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_code_templates_usage_count ON code_templates(usage_count DESC);

-- Code Versions indexes
CREATE INDEX IF NOT EXISTS idx_code_versions_snippet_id ON code_versions(snippet_id);
CREATE INDEX IF NOT EXISTS idx_code_versions_created_at ON code_versions(created_at DESC);

-- Code Exports indexes
CREATE INDEX IF NOT EXISTS idx_code_exports_user_id ON code_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_code_exports_format ON code_exports(format);
CREATE INDEX IF NOT EXISTS idx_code_exports_created_at ON code_exports(created_at DESC);

-- AI Code Stats indexes
CREATE INDEX IF NOT EXISTS idx_ai_code_stats_user_id ON ai_code_stats(user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE TRIGGER update_code_snippets_updated_at
  BEFORE UPDATE ON code_snippets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_code_templates_updated_at
  BEFORE UPDATE ON code_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_code_stats_updated_at
  BEFORE UPDATE ON ai_code_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update stats on completion
CREATE OR REPLACE FUNCTION update_ai_code_stats_on_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO ai_code_stats (user_id, total_completions, total_tokens_used, average_confidence, favorite_language)
    VALUES (NEW.user_id, 1, NEW.tokens_used, NEW.confidence, NEW.language)
    ON CONFLICT (user_id) DO UPDATE
    SET
      total_completions = ai_code_stats.total_completions + 1,
      total_tokens_used = ai_code_stats.total_tokens_used + NEW.tokens_used,
      average_confidence = (ai_code_stats.average_confidence * ai_code_stats.total_completions + NEW.confidence) / (ai_code_stats.total_completions + 1),
      favorite_language = NEW.language,
      last_used_at = NOW(),
      updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stats_on_completion_trigger
  AFTER INSERT OR UPDATE ON code_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_code_stats_on_completion();

-- Auto-increment usage count
CREATE OR REPLACE FUNCTION increment_snippet_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE code_snippets
  SET usage_count = usage_count + 1
  WHERE id = NEW.snippet_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get completion statistics
CREATE OR REPLACE FUNCTION get_completion_stats(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'totalCompletions', COUNT(*),
    'completedCount', COUNT(*) FILTER (WHERE status = 'completed'),
    'averageConfidence', ROUND(AVG(confidence), 2),
    'totalTokens', SUM(tokens_used),
    'averageProcessingTime', ROUND(AVG(processing_time), 0),
    'topLanguage', (
      SELECT language
      FROM code_completions
      WHERE user_id = p_user_id AND created_at >= CURRENT_DATE - p_days
      GROUP BY language
      ORDER BY COUNT(*) DESC
      LIMIT 1
    )
  )
  INTO v_stats
  FROM code_completions
  WHERE user_id = p_user_id AND created_at >= CURRENT_DATE - p_days;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- Get code quality summary
CREATE OR REPLACE FUNCTION get_code_quality_summary(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_summary JSON;
BEGIN
  SELECT json_build_object(
    'averageQuality', ROUND(AVG(quality_score), 2),
    'averageMaintainability', ROUND(AVG(maintainability), 2),
    'totalBugs', (
      SELECT COUNT(*)
      FROM bug_reports br
      JOIN code_analysis ca ON br.analysis_id = ca.id
      WHERE ca.user_id = p_user_id
    ),
    'criticalBugs', (
      SELECT COUNT(*)
      FROM bug_reports br
      JOIN code_analysis ca ON br.analysis_id = ca.id
      WHERE ca.user_id = p_user_id AND br.severity = 'critical'
    ),
    'securityIssues', (
      SELECT COUNT(*)
      FROM security_issues si
      JOIN code_analysis ca ON si.analysis_id = ca.id
      WHERE ca.user_id = p_user_id
    )
  )
  INTO v_summary
  FROM code_analysis
  WHERE user_id = p_user_id;

  RETURN v_summary;
END;
$$ LANGUAGE plpgsql;

-- Get popular snippets
CREATE OR REPLACE FUNCTION get_popular_snippets(p_language programming_language DEFAULT NULL, p_limit INTEGER DEFAULT 10)
RETURNS TABLE(
  id UUID,
  name TEXT,
  language programming_language,
  category template_category,
  usage_count INTEGER,
  likes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT cs.id, cs.name, cs.language, cs.category, cs.usage_count, cs.likes
  FROM code_snippets cs
  WHERE cs.is_public = TRUE
    AND (p_language IS NULL OR cs.language = p_language)
  ORDER BY cs.usage_count DESC, cs.likes DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Analyze code complexity
CREATE OR REPLACE FUNCTION analyze_code_complexity(p_code TEXT)
RETURNS JSON AS $$
DECLARE
  v_lines INTEGER;
  v_functions INTEGER;
  v_complexity INTEGER;
  v_result JSON;
BEGIN
  v_lines := array_length(string_to_array(p_code, E'\n'), 1);
  v_functions := array_length(regexp_split_to_array(p_code, 'function'), 1) - 1;
  v_complexity := 1 +
    array_length(regexp_split_to_array(p_code, 'if'), 1) - 1 +
    array_length(regexp_split_to_array(p_code, 'for'), 1) - 1 +
    array_length(regexp_split_to_array(p_code, 'while'), 1) - 1;

  SELECT json_build_object(
    'linesOfCode', v_lines,
    'functionCount', v_functions,
    'cyclomaticComplexity', v_complexity,
    'averageFunctionLength', CASE WHEN v_functions > 0 THEN v_lines::DECIMAL / v_functions ELSE 0 END
  )
  INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Get user's AI coding insights
CREATE OR REPLACE FUNCTION get_user_ai_insights(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_insights JSON;
BEGIN
  SELECT json_build_object(
    'stats', row_to_json(acs.*),
    'recentCompletions', (
      SELECT json_agg(json_build_object(
        'id', cc.id,
        'language', cc.language,
        'confidence', cc.confidence,
        'createdAt', cc.created_at
      ))
      FROM (
        SELECT id, language, confidence, created_at
        FROM code_completions
        WHERE user_id = p_user_id
        ORDER BY created_at DESC
        LIMIT 5
      ) cc
    ),
    'topSnippets', (
      SELECT json_agg(json_build_object(
        'id', cs.id,
        'name', cs.name,
        'language', cs.language,
        'usageCount', cs.usage_count
      ))
      FROM (
        SELECT id, name, language, usage_count
        FROM code_snippets
        WHERE user_id = p_user_id
        ORDER BY usage_count DESC
        LIMIT 5
      ) cs
    )
  )
  INTO v_insights
  FROM ai_code_stats acs
  WHERE acs.user_id = p_user_id;

  RETURN v_insights;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE code_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_code_stats ENABLE ROW LEVEL SECURITY;

-- Code Completions policies
CREATE POLICY "Users can view their own completions"
  ON code_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own completions"
  ON code_completions FOR ALL
  USING (auth.uid() = user_id);

-- Code Snippets policies
CREATE POLICY "Users can view public snippets"
  ON code_snippets FOR SELECT
  USING (is_public = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own snippets"
  ON code_snippets FOR ALL
  USING (auth.uid() = user_id);

-- Code Analysis policies (with related tables access through analysis_id)
CREATE POLICY "Users can view their own analysis"
  ON code_analysis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own analysis"
  ON code_analysis FOR ALL
  USING (auth.uid() = user_id);

-- Bug Reports policies
CREATE POLICY "Users can view bugs from their analysis"
  ON bug_reports FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM code_analysis
    WHERE id = bug_reports.analysis_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage bugs from their analysis"
  ON bug_reports FOR ALL
  USING (EXISTS (
    SELECT 1 FROM code_analysis
    WHERE id = bug_reports.analysis_id AND user_id = auth.uid()
  ));

-- Code Suggestions policies
CREATE POLICY "Users can view suggestions from their analysis"
  ON code_suggestions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM code_analysis
    WHERE id = code_suggestions.analysis_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage suggestions from their analysis"
  ON code_suggestions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM code_analysis
    WHERE id = code_suggestions.analysis_id AND user_id = auth.uid()
  ));

-- Security Issues policies
CREATE POLICY "Users can view security issues from their analysis"
  ON security_issues FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM code_analysis
    WHERE id = security_issues.analysis_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage security issues from their analysis"
  ON security_issues FOR ALL
  USING (EXISTS (
    SELECT 1 FROM code_analysis
    WHERE id = security_issues.analysis_id AND user_id = auth.uid()
  ));

-- Code Templates policies
CREATE POLICY "Users can view public templates"
  ON code_templates FOR SELECT
  USING (is_public = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own templates"
  ON code_templates FOR ALL
  USING (auth.uid() = user_id);

-- Code Versions policies
CREATE POLICY "Users can view versions of their snippets"
  ON code_versions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM code_snippets
    WHERE id = code_versions.snippet_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage versions of their snippets"
  ON code_versions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM code_snippets
    WHERE id = code_versions.snippet_id AND user_id = auth.uid()
  ));

-- Code Exports policies
CREATE POLICY "Users can view their own exports"
  ON code_exports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own exports"
  ON code_exports FOR ALL
  USING (auth.uid() = user_id);

-- AI Code Stats policies
CREATE POLICY "Users can view their own stats"
  ON ai_code_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own stats"
  ON ai_code_stats FOR ALL
  USING (auth.uid() = user_id);
