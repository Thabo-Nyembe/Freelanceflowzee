-- Minimal AI Code Completion Schema
--
-- Comprehensive AI-powered code completion, analysis, and optimization:
-- - Code Completions with AI models and confidence tracking
-- - Code Snippets with versioning and usage analytics
-- - Code Analysis with quality metrics and complexity
-- - Bug Reports and Security Issues detection
-- - Code Templates and Suggestions
-- - AI Code Stats for user insights

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Drop existing types if they exist
DROP TYPE IF EXISTS programming_language CASCADE;
DROP TYPE IF EXISTS completion_status CASCADE;
DROP TYPE IF EXISTS bug_severity CASCADE;
DROP TYPE IF EXISTS bug_type CASCADE;
DROP TYPE IF EXISTS suggestion_type CASCADE;
DROP TYPE IF EXISTS analysis_type CASCADE;
DROP TYPE IF EXISTS template_category CASCADE;
DROP TYPE IF EXISTS ai_model CASCADE;
DROP TYPE IF EXISTS impact_level CASCADE;

-- Programming languages
CREATE TYPE programming_language AS ENUM (
  'javascript', 'typescript', 'python', 'react', 'vue', 'angular',
  'node', 'php', 'java', 'csharp', 'cpp', 'rust', 'go', 'swift',
  'kotlin', 'ruby', 'scala', 'dart'
);

-- Completion status
CREATE TYPE completion_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Bug severity
CREATE TYPE bug_severity AS ENUM ('critical', 'high', 'medium', 'low', 'info');

-- Bug type
CREATE TYPE bug_type AS ENUM ('syntax', 'logic', 'security', 'performance', 'style', 'type');

-- Suggestion type
CREATE TYPE suggestion_type AS ENUM ('optimization', 'refactoring', 'security', 'best_practice', 'documentation');

-- Analysis type
CREATE TYPE analysis_type AS ENUM ('bugs', 'security', 'performance', 'complexity', 'coverage');

-- Template category
CREATE TYPE template_category AS ENUM ('component', 'api', 'hook', 'utility', 'test', 'config');

-- AI model
CREATE TYPE ai_model AS ENUM ('gpt-4', 'gpt-3.5-turbo', 'claude-3', 'codex', 'copilot');

-- Impact level
CREATE TYPE impact_level AS ENUM ('high', 'medium', 'low');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS ai_code_stats CASCADE;
DROP TABLE IF EXISTS security_issues CASCADE;
DROP TABLE IF EXISTS code_suggestions CASCADE;
DROP TABLE IF EXISTS bug_reports CASCADE;
DROP TABLE IF EXISTS code_analysis CASCADE;
DROP TABLE IF EXISTS code_snippets CASCADE;
DROP TABLE IF EXISTS code_completions CASCADE;

-- Code Completions
CREATE TABLE code_completions (
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
  processing_time INTEGER NOT NULL DEFAULT 0,
  suggestions TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Code Snippets
CREATE TABLE code_snippets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  language programming_language NOT NULL,
  category template_category NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_public BOOLEAN NOT NULL DEFAULT false,
  usage_count INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Code Analysis
CREATE TABLE code_analysis (
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
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bug Reports
CREATE TABLE bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES code_analysis(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  column_number INTEGER,
  type bug_type NOT NULL,
  severity bug_severity NOT NULL,
  message TEXT NOT NULL,
  suggestion TEXT,
  code_snippet TEXT,
  auto_fixable BOOLEAN NOT NULL DEFAULT false,
  fixed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Code Suggestions
CREATE TABLE code_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES code_analysis(id) ON DELETE CASCADE,
  type suggestion_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact impact_level NOT NULL,
  effort impact_level NOT NULL,
  code_example TEXT,
  priority INTEGER NOT NULL DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Security Issues
CREATE TABLE security_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES code_analysis(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  severity bug_severity NOT NULL,
  description TEXT NOT NULL,
  line_number INTEGER NOT NULL,
  column_number INTEGER,
  recommendation TEXT NOT NULL,
  cwe TEXT,
  owasp TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI Code Stats
CREATE TABLE ai_code_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_completions INTEGER NOT NULL DEFAULT 0,
  total_tokens_used INTEGER NOT NULL DEFAULT 0,
  average_confidence DECIMAL(5, 2) NOT NULL DEFAULT 0,
  favorite_language programming_language,
  total_bugs_fixed INTEGER NOT NULL DEFAULT 0,
  total_optimizations INTEGER NOT NULL DEFAULT 0,
  code_quality_improvement DECIMAL(5, 2) NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- code_completions indexes
CREATE INDEX IF NOT EXISTS idx_code_completions_user_id ON code_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_code_completions_language ON code_completions(language);
CREATE INDEX IF NOT EXISTS idx_code_completions_status ON code_completions(status);
CREATE INDEX IF NOT EXISTS idx_code_completions_model ON code_completions(model);
CREATE INDEX IF NOT EXISTS idx_code_completions_created_at ON code_completions(created_at DESC);

-- code_snippets indexes
CREATE INDEX IF NOT EXISTS idx_code_snippets_user_id ON code_snippets(user_id);
CREATE INDEX IF NOT EXISTS idx_code_snippets_language ON code_snippets(language);
CREATE INDEX IF NOT EXISTS idx_code_snippets_category ON code_snippets(category);
CREATE INDEX IF NOT EXISTS idx_code_snippets_is_public ON code_snippets(is_public);
CREATE INDEX IF NOT EXISTS idx_code_snippets_tags ON code_snippets USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_code_snippets_usage_count ON code_snippets(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_code_snippets_likes ON code_snippets(likes DESC);
CREATE INDEX IF NOT EXISTS idx_code_snippets_created_at ON code_snippets(created_at DESC);

-- code_analysis indexes
CREATE INDEX IF NOT EXISTS idx_code_analysis_user_id ON code_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_code_analysis_language ON code_analysis(language);
CREATE INDEX IF NOT EXISTS idx_code_analysis_type ON code_analysis(type);
CREATE INDEX IF NOT EXISTS idx_code_analysis_quality_score ON code_analysis(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_code_analysis_analyzed_at ON code_analysis(analyzed_at DESC);
CREATE INDEX IF NOT EXISTS idx_code_analysis_created_at ON code_analysis(created_at DESC);

-- bug_reports indexes
CREATE INDEX IF NOT EXISTS idx_bug_reports_analysis_id ON bug_reports(analysis_id);
CREATE INDEX IF NOT EXISTS idx_bug_reports_severity ON bug_reports(severity);
CREATE INDEX IF NOT EXISTS idx_bug_reports_type ON bug_reports(type);
CREATE INDEX IF NOT EXISTS idx_bug_reports_fixed ON bug_reports(fixed);
CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON bug_reports(created_at DESC);

-- code_suggestions indexes
CREATE INDEX IF NOT EXISTS idx_code_suggestions_analysis_id ON code_suggestions(analysis_id);
CREATE INDEX IF NOT EXISTS idx_code_suggestions_type ON code_suggestions(type);
CREATE INDEX IF NOT EXISTS idx_code_suggestions_priority ON code_suggestions(priority DESC);
CREATE INDEX IF NOT EXISTS idx_code_suggestions_created_at ON code_suggestions(created_at DESC);

-- security_issues indexes
CREATE INDEX IF NOT EXISTS idx_security_issues_analysis_id ON security_issues(analysis_id);
CREATE INDEX IF NOT EXISTS idx_security_issues_severity ON security_issues(severity);
CREATE INDEX IF NOT EXISTS idx_security_issues_type ON security_issues(type);
CREATE INDEX IF NOT EXISTS idx_security_issues_created_at ON security_issues(created_at DESC);

-- ai_code_stats indexes
CREATE INDEX IF NOT EXISTS idx_ai_code_stats_user_id ON ai_code_stats(user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_ai_code_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_code_completions_updated_at
  BEFORE UPDATE ON code_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_code_updated_at();

CREATE TRIGGER trigger_code_snippets_updated_at
  BEFORE UPDATE ON code_snippets
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_code_updated_at();

CREATE TRIGGER trigger_code_analysis_updated_at
  BEFORE UPDATE ON code_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_code_updated_at();

CREATE TRIGGER trigger_bug_reports_updated_at
  BEFORE UPDATE ON bug_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_code_updated_at();

CREATE TRIGGER trigger_code_suggestions_updated_at
  BEFORE UPDATE ON code_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_code_updated_at();

CREATE TRIGGER trigger_security_issues_updated_at
  BEFORE UPDATE ON security_issues
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_code_updated_at();

CREATE TRIGGER trigger_ai_code_stats_updated_at
  BEFORE UPDATE ON ai_code_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_code_updated_at();

-- Auto-update stats on completion
CREATE OR REPLACE FUNCTION update_ai_code_stats_on_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO ai_code_stats (
      user_id,
      total_completions,
      total_tokens_used,
      average_confidence,
      favorite_language,
      last_used_at
    )
    VALUES (
      NEW.user_id,
      1,
      NEW.tokens_used,
      NEW.confidence,
      NEW.language,
      now()
    )
    ON CONFLICT (user_id) DO UPDATE
    SET
      total_completions = ai_code_stats.total_completions + 1,
      total_tokens_used = ai_code_stats.total_tokens_used + NEW.tokens_used,
      average_confidence = (ai_code_stats.average_confidence * ai_code_stats.total_completions + NEW.confidence) / (ai_code_stats.total_completions + 1),
      favorite_language = NEW.language,
      last_used_at = now(),
      updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stats_on_completion
  AFTER INSERT OR UPDATE ON code_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_code_stats_on_completion();
