-- ============================================================================
-- FreeflowZee Complete Database Setup Script - V2.1 Idempotent Edition
-- ============================================================================
-- This script is now IDEMPOTENT, meaning it can be run multiple times without
-- causing errors. It creates tables if they don't exist and adds missing
-- columns to existing tables.
--
-- Run this in your Supabase SQL Editor to set up or update the database.
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- TABLE CREATION & MIGRATION
-- ============================================================================

-- Create a base projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns to projects table if they don't exist to make script idempotent
ALTER TABLE projects ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS coverImage TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS isArchived BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS isPublished BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS parentProject UUID REFERENCES projects(id) ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_name VARCHAR(200);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_email VARCHAR(200);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS budget DECIMAL(10,2) DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS spent DECIMAL(10,2) DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(8,2) DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS actual_hours DECIMAL(8,2) DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_satisfaction_score INTEGER;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS completion_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE projects ADD COLUMN IF NOT EXISTS embedding vector(1536);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create user profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name VARCHAR(200),
  avatar_url TEXT,
  bio TEXT,
  website VARCHAR(255),
  location VARCHAR(100),
  skills TEXT[],
  hourly_rate DECIMAL(10,2),
  timezone VARCHAR(50),
  social_links JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  notification_settings JSONB DEFAULT '{}',
  subscription_tier VARCHAR(20) DEFAULT 'free',
  storage_quota_gb INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update the search_vector column for projects
CREATE OR REPLACE FUNCTION update_project_search_vector() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update the search_vector on project insert or update
DROP TRIGGER IF EXISTS project_search_vector_update ON projects;
CREATE TRIGGER project_search_vector_update
BEFORE INSERT OR UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION update_project_search_vector();

-- Function for semantic search
CREATE OR REPLACE FUNCTION match_projects ( 
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE ( 
  id uuid,
  title text,
  description text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.description,
    1 - (p.embedding <=> query_embedding) as similarity
  FROM projects p
  WHERE p.embedding IS NOT NULL AND 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for full-text search
CREATE INDEX IF NOT EXISTS projects_search_vector_idx ON projects USING GIN (search_vector);

-- Index for semantic search (using HNSW for performance)
CREATE INDEX IF NOT EXISTS projects_embedding_idx ON projects USING hnsw (embedding vector_cosine_ops);

-- Other useful indexes
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects (user_id);
CREATE INDEX IF NOT EXISTS projects_parent_project_idx ON projects (parentProject);
CREATE INDEX IF NOT EXISTS projects_status_idx ON projects (status);
CREATE INDEX IF NOT EXISTS projects_priority_idx ON projects (priority);

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'FreeflowZee V2.1 Idempotent Database Setup Complete!';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Your database is now fully migrated and equipped with all features, including AI-powered semantic search.';
END $$;
