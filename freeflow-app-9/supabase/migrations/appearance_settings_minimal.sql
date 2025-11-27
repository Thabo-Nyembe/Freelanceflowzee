-- Minimal Appearance Settings Schema
-- Advanced theme customization, presets, custom CSS, color schemes

-- ENUMS
DROP TYPE IF EXISTS theme_preset_category CASCADE;
DROP TYPE IF EXISTS customization_type CASCADE;
DROP TYPE IF EXISTS font_family CASCADE;
DROP TYPE IF EXISTS color_scheme_type CASCADE;

CREATE TYPE theme_preset_category AS ENUM ('minimal', 'modern', 'classic', 'bold', 'professional', 'creative', 'custom');
CREATE TYPE customization_type AS ENUM ('theme', 'color', 'font', 'spacing', 'layout', 'component', 'css');
CREATE TYPE font_family AS ENUM ('inter', 'roboto', 'open-sans', 'lato', 'montserrat', 'poppins', 'system', 'custom');
CREATE TYPE color_scheme_type AS ENUM ('monochrome', 'analogous', 'complementary', 'triadic', 'custom');

-- TABLES
DROP TABLE IF EXISTS theme_customizations CASCADE;
DROP TABLE IF EXISTS theme_presets CASCADE;
DROP TABLE IF EXISTS custom_css_snippets CASCADE;
DROP TABLE IF EXISTS color_schemes CASCADE;
DROP TABLE IF EXISTS font_preferences CASCADE;
DROP TABLE IF EXISTS customization_history CASCADE;

CREATE TABLE theme_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Customization Details
  customization_name TEXT NOT NULL,
  customization_type customization_type NOT NULL,

  -- Values
  primary_color TEXT,
  secondary_color TEXT,
  accent_color TEXT,
  background_color TEXT,
  text_color TEXT,
  border_color TEXT,

  -- Typography
  font_family font_family DEFAULT 'inter',
  font_size_base INTEGER DEFAULT 16,
  line_height DECIMAL(3, 2) DEFAULT 1.5,
  letter_spacing DECIMAL(3, 2) DEFAULT 0,

  -- Spacing
  spacing_unit INTEGER DEFAULT 4,
  border_radius INTEGER DEFAULT 8,

  -- Layout
  sidebar_width INTEGER DEFAULT 280,
  max_content_width INTEGER DEFAULT 1200,

  -- Custom Properties
  custom_properties JSONB DEFAULT '{}'::JSONB,

  -- Flags
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_default BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE theme_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Preset Details
  preset_name TEXT NOT NULL,
  preset_category theme_preset_category NOT NULL,
  description TEXT,

  -- Configuration
  config JSONB NOT NULL DEFAULT '{}'::JSONB,

  -- Metadata
  thumbnail_url TEXT,
  author TEXT,

  -- Popularity
  usage_count INTEGER NOT NULL DEFAULT 0,
  favorite_count INTEGER NOT NULL DEFAULT 0,

  -- Flags
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_system BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE custom_css_snippets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Snippet Details
  snippet_name TEXT NOT NULL,
  description TEXT,
  css_code TEXT NOT NULL,

  -- Targeting
  target_selector TEXT,
  target_component TEXT,

  -- Status
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  is_validated BOOLEAN NOT NULL DEFAULT false,

  -- Metadata
  order_index INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE color_schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Scheme Details
  scheme_name TEXT NOT NULL,
  scheme_type color_scheme_type NOT NULL,
  description TEXT,

  -- Colors
  colors JSONB NOT NULL DEFAULT '[]'::JSONB,

  -- Metadata
  is_light_mode BOOLEAN NOT NULL DEFAULT true,
  contrast_ratio DECIMAL(4, 2),

  -- Flags
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_favorite BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE font_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Font Details
  font_name TEXT NOT NULL,
  font_family font_family NOT NULL,
  font_url TEXT,

  -- Usage
  used_for TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Fallbacks
  fallback_fonts TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Flags
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_web_font BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE customization_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Change Details
  customization_type customization_type NOT NULL,
  changed_property TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,

  -- Context
  customization_id UUID,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Metadata
  change_reason TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_theme_customizations_user_id ON theme_customizations(user_id);
CREATE INDEX idx_theme_customizations_type ON theme_customizations(customization_type);
CREATE INDEX idx_theme_customizations_is_active ON theme_customizations(is_active);
CREATE INDEX idx_theme_presets_user_id ON theme_presets(user_id);
CREATE INDEX idx_theme_presets_category ON theme_presets(preset_category);
CREATE INDEX idx_theme_presets_is_public ON theme_presets(is_public);
CREATE INDEX idx_theme_presets_usage_count ON theme_presets(usage_count DESC);
CREATE INDEX idx_custom_css_snippets_user_id ON custom_css_snippets(user_id);
CREATE INDEX idx_custom_css_snippets_is_enabled ON custom_css_snippets(is_enabled);
CREATE INDEX idx_custom_css_snippets_order_index ON custom_css_snippets(user_id, order_index);
CREATE INDEX idx_color_schemes_user_id ON color_schemes(user_id);
CREATE INDEX idx_color_schemes_type ON color_schemes(scheme_type);
CREATE INDEX idx_color_schemes_is_active ON color_schemes(is_active);
CREATE INDEX idx_font_preferences_user_id ON font_preferences(user_id);
CREATE INDEX idx_font_preferences_is_active ON font_preferences(is_active);
CREATE INDEX idx_customization_history_user_id ON customization_history(user_id);
CREATE INDEX idx_customization_history_type ON customization_history(customization_type);
CREATE INDEX idx_customization_history_applied_at ON customization_history(applied_at DESC);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_appearance_settings_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_theme_customizations_updated_at BEFORE UPDATE ON theme_customizations FOR EACH ROW EXECUTE FUNCTION update_appearance_settings_updated_at();
CREATE TRIGGER trigger_theme_presets_updated_at BEFORE UPDATE ON theme_presets FOR EACH ROW EXECUTE FUNCTION update_appearance_settings_updated_at();
CREATE TRIGGER trigger_custom_css_snippets_updated_at BEFORE UPDATE ON custom_css_snippets FOR EACH ROW EXECUTE FUNCTION update_appearance_settings_updated_at();
CREATE TRIGGER trigger_color_schemes_updated_at BEFORE UPDATE ON color_schemes FOR EACH ROW EXECUTE FUNCTION update_appearance_settings_updated_at();
CREATE TRIGGER trigger_font_preferences_updated_at BEFORE UPDATE ON font_preferences FOR EACH ROW EXECUTE FUNCTION update_appearance_settings_updated_at();

CREATE OR REPLACE FUNCTION deactivate_other_customizations() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE theme_customizations
    SET is_active = false
    WHERE user_id = NEW.user_id
      AND customization_type = NEW.customization_type
      AND id != NEW.id
      AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_deactivate_other_customizations AFTER INSERT OR UPDATE ON theme_customizations FOR EACH ROW EXECUTE FUNCTION deactivate_other_customizations();

CREATE OR REPLACE FUNCTION increment_preset_usage() RETURNS TRIGGER AS $$
BEGIN
  UPDATE theme_presets
  SET usage_count = usage_count + 1
  WHERE id = NEW.customization_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_preset_usage AFTER INSERT ON customization_history FOR EACH ROW WHEN (NEW.customization_type = 'theme') EXECUTE FUNCTION increment_preset_usage();

CREATE OR REPLACE FUNCTION log_customization_change() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO customization_history (
    user_id,
    customization_type,
    changed_property,
    old_value,
    new_value,
    customization_id
  )
  VALUES (
    NEW.user_id,
    NEW.customization_type,
    'activation_status',
    CASE WHEN OLD.is_active IS NULL THEN 'new' ELSE OLD.is_active::TEXT END,
    NEW.is_active::TEXT,
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_customization_change AFTER INSERT OR UPDATE OF is_active ON theme_customizations FOR EACH ROW EXECUTE FUNCTION log_customization_change();

CREATE OR REPLACE FUNCTION deactivate_other_color_schemes() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE color_schemes
    SET is_active = false
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_deactivate_other_color_schemes AFTER INSERT OR UPDATE ON color_schemes FOR EACH ROW EXECUTE FUNCTION deactivate_other_color_schemes();
