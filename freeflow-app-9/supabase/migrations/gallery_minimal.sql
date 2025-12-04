-- Minimal Gallery Schema for Gallery Page

-- Drop existing tables and types if they exist
DROP TABLE IF EXISTS gallery_images CASCADE;
DROP TABLE IF EXISTS gallery_albums CASCADE;
DROP TYPE IF EXISTS image_type CASCADE;
DROP TYPE IF EXISTS image_category CASCADE;
DROP TYPE IF EXISTS album_privacy CASCADE;
DROP TYPE IF EXISTS processing_status CASCADE;

-- ENUMs
CREATE TYPE image_type AS ENUM ('image', 'video', 'audio', 'document');

CREATE TYPE image_category AS ENUM (
  'branding',
  'web-design',
  'mobile',
  'social',
  'print',
  'video',
  'photography',
  'illustration',
  '3d',
  'animation',
  'ai-generated',
  'other'
);

CREATE TYPE album_privacy AS ENUM ('private', 'unlisted', 'public');

CREATE TYPE processing_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Gallery Albums Table
CREATE TABLE gallery_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,

  privacy album_privacy DEFAULT 'private',

  image_count INTEGER DEFAULT 0,
  total_size BIGINT DEFAULT 0,
  views INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery Images Table
CREATE TABLE gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  format TEXT NOT NULL,

  url TEXT NOT NULL,
  thumbnail TEXT,

  type image_type DEFAULT 'image',
  category image_category DEFAULT 'other',

  album_id UUID REFERENCES gallery_albums(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',

  is_favorite BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  processing_status processing_status DEFAULT 'completed',

  client TEXT,
  project TEXT,

  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,

  ai_generated BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_gallery_images_user_id ON gallery_images(user_id);
CREATE INDEX idx_gallery_images_album_id ON gallery_images(album_id);
CREATE INDEX idx_gallery_images_type ON gallery_images(type);
CREATE INDEX idx_gallery_images_category ON gallery_images(category);
CREATE INDEX idx_gallery_images_created_at ON gallery_images(created_at DESC);
CREATE INDEX idx_gallery_images_is_favorite ON gallery_images(is_favorite);

CREATE INDEX idx_gallery_albums_user_id ON gallery_albums(user_id);
CREATE INDEX idx_gallery_albums_created_at ON gallery_albums(created_at DESC);
