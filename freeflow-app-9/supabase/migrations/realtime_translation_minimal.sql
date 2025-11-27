-- Minimal Real-time Translation Schema
-- Multi-language translation system with text, voice, document, and live translation

-- ENUMS
DROP TYPE IF EXISTS translation_language CASCADE;
DROP TYPE IF EXISTS translation_mode CASCADE;
DROP TYPE IF EXISTS translation_quality CASCADE;
DROP TYPE IF EXISTS translation_engine CASCADE;
DROP TYPE IF EXISTS translation_status CASCADE;
DROP TYPE IF EXISTS session_status CASCADE;
DROP TYPE IF EXISTS participant_role CASCADE;

CREATE TYPE translation_language AS ENUM ('en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi', 'nl', 'sv', 'pl', 'tr', 'th', 'vi', 'id', 'ms');
CREATE TYPE translation_mode AS ENUM ('text', 'voice', 'video', 'document', 'subtitle', 'live-chat');
CREATE TYPE translation_quality AS ENUM ('fast', 'balanced', 'accurate', 'native');
CREATE TYPE translation_engine AS ENUM ('kazi-ai', 'google', 'deepl', 'microsoft', 'neural-mt');
CREATE TYPE translation_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE session_status AS ENUM ('active', 'paused', 'ended');
CREATE TYPE participant_role AS ENUM ('speaker', 'listener', 'moderator');

-- TABLES
DROP TABLE IF EXISTS translation_analytics CASCADE;
DROP TABLE IF EXISTS translation_glossary_terms CASCADE;
DROP TABLE IF EXISTS translation_glossaries CASCADE;
DROP TABLE IF EXISTS translation_memory CASCADE;
DROP TABLE IF EXISTS document_translations CASCADE;
DROP TABLE IF EXISTS transcript_segments CASCADE;
DROP TABLE IF EXISTS session_participants CASCADE;
DROP TABLE IF EXISTS live_sessions CASCADE;
DROP TABLE IF EXISTS translation_results CASCADE;
DROP TABLE IF EXISTS translation_requests CASCADE;

CREATE TABLE translation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_language translation_language NOT NULL,
  target_language translation_language NOT NULL,
  mode translation_mode NOT NULL DEFAULT 'text',
  engine translation_engine NOT NULL DEFAULT 'kazi-ai',
  quality translation_quality NOT NULL DEFAULT 'balanced',
  content TEXT NOT NULL,
  status translation_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE translation_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES translation_requests(id) ON DELETE CASCADE,
  source_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  source_language translation_language NOT NULL,
  target_language translation_language NOT NULL,
  confidence DECIMAL(5, 4) NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 1),
  detected_language translation_language,
  processing_time INTEGER NOT NULL DEFAULT 0,
  engine translation_engine NOT NULL,
  quality translation_quality NOT NULL,
  word_count INTEGER DEFAULT 0,
  character_count INTEGER DEFAULT 0,
  cost DECIMAL(10, 4) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE live_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  source_language translation_language NOT NULL,
  target_languages translation_language[] NOT NULL DEFAULT ARRAY[]::translation_language[],
  mode translation_mode NOT NULL DEFAULT 'voice',
  status session_status NOT NULL DEFAULT 'active',
  start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_time TIMESTAMPTZ,
  duration INTEGER DEFAULT 0,
  auto_detect_language BOOLEAN NOT NULL DEFAULT true,
  show_original_text BOOLEAN NOT NULL DEFAULT true,
  enable_subtitles BOOLEAN NOT NULL DEFAULT true,
  save_transcript BOOLEAN NOT NULL DEFAULT true,
  filter_profanity BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE session_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT,
  language translation_language NOT NULL,
  role participant_role NOT NULL DEFAULT 'listener',
  is_active BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE transcript_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
  speaker_id UUID NOT NULL REFERENCES session_participants(id) ON DELETE CASCADE,
  speaker_name TEXT NOT NULL,
  original_text TEXT NOT NULL,
  original_language translation_language NOT NULL,
  translations JSONB NOT NULL DEFAULT '{}'::JSONB,
  confidence DECIMAL(5, 4) NOT NULL DEFAULT 0,
  is_final BOOLEAN NOT NULL DEFAULT false,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE document_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT,
  source_language translation_language NOT NULL,
  target_languages translation_language[] NOT NULL DEFAULT ARRAY[]::translation_language[],
  status translation_status NOT NULL DEFAULT 'pending',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  page_count INTEGER,
  estimated_time INTEGER DEFAULT 0,
  preserve_formatting BOOLEAN NOT NULL DEFAULT true,
  download_url TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE translation_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  source_language translation_language NOT NULL,
  target_language translation_language NOT NULL,
  context TEXT,
  domain TEXT,
  usage_count INTEGER NOT NULL DEFAULT 1,
  quality DECIMAL(5, 4) NOT NULL DEFAULT 0.8,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  last_used TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE translation_glossaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  source_language translation_language NOT NULL,
  target_language translation_language NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE translation_glossary_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  glossary_id UUID NOT NULL REFERENCES translation_glossaries(id) ON DELETE CASCADE,
  source_term TEXT NOT NULL,
  target_term TEXT NOT NULL,
  context TEXT,
  case_sensitive BOOLEAN NOT NULL DEFAULT false,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE translation_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_translations INTEGER DEFAULT 0,
  characters_translated INTEGER DEFAULT 0,
  average_confidence DECIMAL(5, 4) DEFAULT 0,
  average_processing_time INTEGER DEFAULT 0,
  success_rate DECIMAL(5, 4) DEFAULT 0,
  total_cost DECIMAL(10, 4) DEFAULT 0,
  language_pairs JSONB DEFAULT '{}'::JSONB,
  engine_usage JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- INDEXES
CREATE INDEX idx_translation_requests_user_id ON translation_requests(user_id);
CREATE INDEX idx_translation_requests_status ON translation_requests(status);
CREATE INDEX idx_translation_requests_created_at ON translation_requests(created_at DESC);
CREATE INDEX idx_translation_results_request_id ON translation_results(request_id);
CREATE INDEX idx_translation_results_languages ON translation_results(source_language, target_language);
CREATE INDEX idx_live_sessions_user_id ON live_sessions(user_id);
CREATE INDEX idx_live_sessions_status ON live_sessions(status);
CREATE INDEX idx_session_participants_session_id ON session_participants(session_id);
CREATE INDEX idx_session_participants_user_id ON session_participants(user_id);
CREATE INDEX idx_transcript_segments_session_id ON transcript_segments(session_id);
CREATE INDEX idx_transcript_segments_speaker_id ON transcript_segments(speaker_id);
CREATE INDEX idx_document_translations_user_id ON document_translations(user_id);
CREATE INDEX idx_document_translations_status ON document_translations(status);
CREATE INDEX idx_translation_memory_user_id ON translation_memory(user_id);
CREATE INDEX idx_translation_memory_languages ON translation_memory(source_language, target_language);
CREATE INDEX idx_translation_glossaries_user_id ON translation_glossaries(user_id);
CREATE INDEX idx_glossary_terms_glossary_id ON translation_glossary_terms(glossary_id);
CREATE INDEX idx_translation_analytics_user_id ON translation_analytics(user_id);
CREATE INDEX idx_translation_analytics_date ON translation_analytics(date DESC);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_translation_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_translation_requests_updated_at BEFORE UPDATE ON translation_requests FOR EACH ROW EXECUTE FUNCTION update_translation_updated_at();
CREATE TRIGGER trigger_live_sessions_updated_at BEFORE UPDATE ON live_sessions FOR EACH ROW EXECUTE FUNCTION update_translation_updated_at();
CREATE TRIGGER trigger_session_participants_updated_at BEFORE UPDATE ON session_participants FOR EACH ROW EXECUTE FUNCTION update_translation_updated_at();
CREATE TRIGGER trigger_document_translations_updated_at BEFORE UPDATE ON document_translations FOR EACH ROW EXECUTE FUNCTION update_translation_updated_at();
CREATE TRIGGER trigger_translation_memory_updated_at BEFORE UPDATE ON translation_memory FOR EACH ROW EXECUTE FUNCTION update_translation_updated_at();
CREATE TRIGGER trigger_translation_glossaries_updated_at BEFORE UPDATE ON translation_glossaries FOR EACH ROW EXECUTE FUNCTION update_translation_updated_at();
CREATE TRIGGER trigger_glossary_terms_updated_at BEFORE UPDATE ON translation_glossary_terms FOR EACH ROW EXECUTE FUNCTION update_translation_updated_at();
CREATE TRIGGER trigger_translation_analytics_updated_at BEFORE UPDATE ON translation_analytics FOR EACH ROW EXECUTE FUNCTION update_translation_updated_at();

CREATE OR REPLACE FUNCTION set_session_end_time() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'ended' AND (OLD.status IS NULL OR OLD.status != 'ended') THEN
    NEW.end_time = now();
    IF NEW.start_time IS NOT NULL THEN
      NEW.duration = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time))::INTEGER;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_session_end_time BEFORE UPDATE ON live_sessions FOR EACH ROW EXECUTE FUNCTION set_session_end_time();

CREATE OR REPLACE FUNCTION set_participant_left_at() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = false AND (OLD.is_active IS NULL OR OLD.is_active = true) THEN
    NEW.left_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_participant_left_at BEFORE UPDATE ON session_participants FOR EACH ROW EXECUTE FUNCTION set_participant_left_at();

CREATE OR REPLACE FUNCTION set_document_completed_at() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_document_completed_at BEFORE UPDATE ON document_translations FOR EACH ROW EXECUTE FUNCTION set_document_completed_at();
