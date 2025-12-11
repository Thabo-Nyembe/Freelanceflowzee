-- Phase 7: Advanced Features Database Migration
-- This migration creates tables for: Video Editor, 3D Modeling, Canvas Collaboration,
-- Portfolio Builder, Client Gallery, and Booking System

-- =====================================================
-- SECTION 1: VIDEO EDITOR ENHANCED TABLES
-- =====================================================

-- Video Projects table
CREATE TABLE IF NOT EXISTS video_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    duration INTEGER DEFAULT 0,
    frame_rate INTEGER DEFAULT 30,
    resolution_width INTEGER DEFAULT 1920,
    resolution_height INTEGER DEFAULT 1080,
    aspect_ratio VARCHAR(20) DEFAULT '16:9',
    status VARCHAR(50) DEFAULT 'draft',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video Tracks table
CREATE TABLE IF NOT EXISTS video_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES video_projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'video', 'audio', 'text', 'effects'
    order_index INTEGER DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    is_muted BOOLEAN DEFAULT FALSE,
    is_visible BOOLEAN DEFAULT TRUE,
    volume DECIMAL(3,2) DEFAULT 1.0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video Clips table
CREATE TABLE IF NOT EXISTS video_clips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    track_id UUID REFERENCES video_tracks(id) ON DELETE CASCADE,
    project_id UUID REFERENCES video_projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'video', 'audio', 'image', 'text'
    source_url TEXT,
    start_time INTEGER DEFAULT 0,
    end_time INTEGER DEFAULT 0,
    duration INTEGER DEFAULT 0,
    trim_start INTEGER DEFAULT 0,
    trim_end INTEGER DEFAULT 0,
    volume DECIMAL(3,2) DEFAULT 1.0,
    playback_speed DECIMAL(4,2) DEFAULT 1.0,
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    scale_x DECIMAL(4,2) DEFAULT 1.0,
    scale_y DECIMAL(4,2) DEFAULT 1.0,
    rotation INTEGER DEFAULT 0,
    opacity DECIMAL(3,2) DEFAULT 1.0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video Effects table
CREATE TABLE IF NOT EXISTS video_effects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clip_id UUID REFERENCES video_clips(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    parameters JSONB DEFAULT '{}',
    is_enabled BOOLEAN DEFAULT TRUE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video Transitions table
CREATE TABLE IF NOT EXISTS video_transitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES video_projects(id) ON DELETE CASCADE,
    from_clip_id UUID REFERENCES video_clips(id) ON DELETE SET NULL,
    to_clip_id UUID REFERENCES video_clips(id) ON DELETE SET NULL,
    type VARCHAR(100) NOT NULL,
    duration INTEGER DEFAULT 500,
    parameters JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video Render Jobs table
CREATE TABLE IF NOT EXISTS video_render_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES video_projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    format VARCHAR(50) NOT NULL,
    quality VARCHAR(50) DEFAULT 'high',
    resolution VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    output_url TEXT,
    file_size BIGINT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SECTION 2: 3D MODELING TABLES
-- =====================================================

-- 3D Scenes table
CREATE TABLE IF NOT EXISTS modeling_scenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    units VARCHAR(20) DEFAULT 'meters',
    up_axis VARCHAR(10) DEFAULT 'Y',
    background_color VARCHAR(20) DEFAULT '#1a1a2e',
    ambient_light_color VARCHAR(20) DEFAULT '#404040',
    ambient_light_intensity DECIMAL(3,2) DEFAULT 0.3,
    grid_visible BOOLEAN DEFAULT TRUE,
    grid_size INTEGER DEFAULT 10,
    status VARCHAR(50) DEFAULT 'draft',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3D Objects table
CREATE TABLE IF NOT EXISTS modeling_objects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id UUID REFERENCES modeling_scenes(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES modeling_objects(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'mesh', 'light', 'camera', 'group', 'primitive'
    primitive_type VARCHAR(50), -- 'cube', 'sphere', 'cylinder', etc.
    position_x DECIMAL(10,4) DEFAULT 0,
    position_y DECIMAL(10,4) DEFAULT 0,
    position_z DECIMAL(10,4) DEFAULT 0,
    rotation_x DECIMAL(10,4) DEFAULT 0,
    rotation_y DECIMAL(10,4) DEFAULT 0,
    rotation_z DECIMAL(10,4) DEFAULT 0,
    scale_x DECIMAL(10,4) DEFAULT 1,
    scale_y DECIMAL(10,4) DEFAULT 1,
    scale_z DECIMAL(10,4) DEFAULT 1,
    is_visible BOOLEAN DEFAULT TRUE,
    is_locked BOOLEAN DEFAULT FALSE,
    cast_shadow BOOLEAN DEFAULT TRUE,
    receive_shadow BOOLEAN DEFAULT TRUE,
    geometry_data JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3D Materials table
CREATE TABLE IF NOT EXISTS modeling_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id UUID REFERENCES modeling_scenes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'standard', -- 'standard', 'physical', 'basic', 'toon'
    color VARCHAR(20) DEFAULT '#808080',
    metalness DECIMAL(3,2) DEFAULT 0,
    roughness DECIMAL(3,2) DEFAULT 0.5,
    opacity DECIMAL(3,2) DEFAULT 1,
    emissive_color VARCHAR(20),
    emissive_intensity DECIMAL(5,2) DEFAULT 0,
    normal_scale DECIMAL(3,2) DEFAULT 1,
    ao_intensity DECIMAL(3,2) DEFAULT 1,
    texture_map_url TEXT,
    normal_map_url TEXT,
    roughness_map_url TEXT,
    metalness_map_url TEXT,
    ao_map_url TEXT,
    is_transparent BOOLEAN DEFAULT FALSE,
    is_double_sided BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Object-Material assignments
CREATE TABLE IF NOT EXISTS modeling_object_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    object_id UUID REFERENCES modeling_objects(id) ON DELETE CASCADE,
    material_id UUID REFERENCES modeling_materials(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(object_id, material_id)
);

-- 3D Lights table
CREATE TABLE IF NOT EXISTS modeling_lights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id UUID REFERENCES modeling_scenes(id) ON DELETE CASCADE,
    object_id UUID REFERENCES modeling_objects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'point', 'directional', 'spot', 'area', 'hemisphere'
    color VARCHAR(20) DEFAULT '#ffffff',
    intensity DECIMAL(5,2) DEFAULT 1,
    distance DECIMAL(10,2),
    decay DECIMAL(3,2) DEFAULT 2,
    angle DECIMAL(5,2), -- for spot lights
    penumbra DECIMAL(3,2), -- for spot lights
    cast_shadow BOOLEAN DEFAULT TRUE,
    shadow_bias DECIMAL(6,4) DEFAULT -0.0001,
    shadow_map_size INTEGER DEFAULT 1024,
    is_enabled BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3D Cameras table
CREATE TABLE IF NOT EXISTS modeling_cameras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id UUID REFERENCES modeling_scenes(id) ON DELETE CASCADE,
    object_id UUID REFERENCES modeling_objects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'perspective', -- 'perspective', 'orthographic'
    fov INTEGER DEFAULT 50,
    near DECIMAL(10,4) DEFAULT 0.1,
    far DECIMAL(10,2) DEFAULT 1000,
    zoom DECIMAL(5,2) DEFAULT 1,
    is_active BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3D Animations table
CREATE TABLE IF NOT EXISTS modeling_animations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id UUID REFERENCES modeling_scenes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    duration DECIMAL(10,2) DEFAULT 1,
    fps INTEGER DEFAULT 30,
    loop_mode VARCHAR(20) DEFAULT 'once', -- 'once', 'loop', 'pingpong'
    is_playing BOOLEAN DEFAULT FALSE,
    current_time DECIMAL(10,4) DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3D Animation Keyframes table
CREATE TABLE IF NOT EXISTS modeling_keyframes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    animation_id UUID REFERENCES modeling_animations(id) ON DELETE CASCADE,
    object_id UUID REFERENCES modeling_objects(id) ON DELETE CASCADE,
    property VARCHAR(100) NOT NULL, -- 'position', 'rotation', 'scale', 'opacity'
    time DECIMAL(10,4) NOT NULL,
    value JSONB NOT NULL,
    easing VARCHAR(50) DEFAULT 'linear',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3D Render Jobs table
CREATE TABLE IF NOT EXISTS modeling_render_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id UUID REFERENCES modeling_scenes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) DEFAULT 'image', -- 'image', 'animation', '360'
    format VARCHAR(20) DEFAULT 'png',
    width INTEGER DEFAULT 1920,
    height INTEGER DEFAULT 1080,
    samples INTEGER DEFAULT 128,
    status VARCHAR(50) DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    output_url TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SECTION 3: CANVAS COLLABORATION TABLES
-- =====================================================

-- Canvas Boards table
CREATE TABLE IF NOT EXISTS canvas_boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    width INTEGER DEFAULT 4000,
    height INTEGER DEFAULT 3000,
    background_color VARCHAR(20) DEFAULT '#ffffff',
    grid_enabled BOOLEAN DEFAULT TRUE,
    grid_size INTEGER DEFAULT 20,
    snap_to_grid BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    is_template BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Canvas Pages table
CREATE TABLE IF NOT EXISTS canvas_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canvas_id UUID REFERENCES canvas_boards(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    order_index INTEGER DEFAULT 0,
    background_color VARCHAR(20) DEFAULT '#ffffff',
    thumbnail_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Canvas Elements table
CREATE TABLE IF NOT EXISTS canvas_elements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID REFERENCES canvas_pages(id) ON DELETE CASCADE,
    canvas_id UUID REFERENCES canvas_boards(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'shape', 'text', 'image', 'sticky', 'connector', 'frame', 'drawing'
    x DECIMAL(10,2) DEFAULT 0,
    y DECIMAL(10,2) DEFAULT 0,
    width DECIMAL(10,2) DEFAULT 100,
    height DECIMAL(10,2) DEFAULT 100,
    rotation DECIMAL(6,2) DEFAULT 0,
    z_index INTEGER DEFAULT 0,
    fill_color VARCHAR(20),
    stroke_color VARCHAR(20),
    stroke_width INTEGER DEFAULT 1,
    opacity DECIMAL(3,2) DEFAULT 1,
    is_locked BOOLEAN DEFAULT FALSE,
    content TEXT,
    font_family VARCHAR(100),
    font_size INTEGER,
    font_weight VARCHAR(20),
    text_align VARCHAR(20),
    shape_type VARCHAR(50), -- 'rectangle', 'ellipse', 'triangle', etc.
    corner_radius INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Canvas Connectors table
CREATE TABLE IF NOT EXISTS canvas_connectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canvas_id UUID REFERENCES canvas_boards(id) ON DELETE CASCADE,
    from_element_id UUID REFERENCES canvas_elements(id) ON DELETE CASCADE,
    to_element_id UUID REFERENCES canvas_elements(id) ON DELETE CASCADE,
    from_point VARCHAR(20) DEFAULT 'right', -- 'top', 'right', 'bottom', 'left'
    to_point VARCHAR(20) DEFAULT 'left',
    line_type VARCHAR(20) DEFAULT 'straight', -- 'straight', 'curved', 'orthogonal'
    stroke_color VARCHAR(20) DEFAULT '#333333',
    stroke_width INTEGER DEFAULT 2,
    start_arrow VARCHAR(20), -- 'arrow', 'diamond', 'circle'
    end_arrow VARCHAR(20) DEFAULT 'arrow',
    label TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Canvas Collaborators table
CREATE TABLE IF NOT EXISTS canvas_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canvas_id UUID REFERENCES canvas_boards(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'viewer', -- 'owner', 'editor', 'commenter', 'viewer'
    cursor_x DECIMAL(10,2),
    cursor_y DECIMAL(10,2),
    cursor_color VARCHAR(20),
    last_seen_at TIMESTAMPTZ,
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    joined_at TIMESTAMPTZ,
    UNIQUE(canvas_id, user_id)
);

-- Canvas Comments table
CREATE TABLE IF NOT EXISTS canvas_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canvas_id UUID REFERENCES canvas_boards(id) ON DELETE CASCADE,
    element_id UUID REFERENCES canvas_elements(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES canvas_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    x DECIMAL(10,2),
    y DECIMAL(10,2),
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Canvas Version History table
CREATE TABLE IF NOT EXISTS canvas_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canvas_id UUID REFERENCES canvas_boards(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(255),
    description TEXT,
    snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SECTION 4: PORTFOLIO BUILDER TABLES
-- =====================================================

-- Portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    tagline VARCHAR(500),
    bio TEXT,
    avatar_url TEXT,
    cover_image_url TEXT,
    theme VARCHAR(100) DEFAULT 'minimal',
    primary_color VARCHAR(20) DEFAULT '#6366f1',
    secondary_color VARCHAR(20) DEFAULT '#8b5cf6',
    font_heading VARCHAR(100) DEFAULT 'Inter',
    font_body VARCHAR(100) DEFAULT 'Inter',
    custom_css TEXT,
    custom_domain VARCHAR(255),
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    seo_title VARCHAR(255),
    seo_description VARCHAR(500),
    seo_keywords TEXT,
    social_image_url TEXT,
    google_analytics_id VARCHAR(50),
    contact_email VARCHAR(255),
    contact_form_enabled BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio Pages table
CREATE TABLE IF NOT EXISTS portfolio_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    order_index INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    seo_title VARCHAR(255),
    seo_description VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(portfolio_id, slug)
);

-- Portfolio Sections table
CREATE TABLE IF NOT EXISTS portfolio_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID REFERENCES portfolio_pages(id) ON DELETE CASCADE,
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'hero', 'about', 'projects', 'skills', 'experience', 'contact', etc.
    title VARCHAR(255),
    subtitle TEXT,
    content TEXT,
    order_index INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    background_color VARCHAR(20),
    background_image_url TEXT,
    layout VARCHAR(50) DEFAULT 'default',
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio Projects table
CREATE TABLE IF NOT EXISTS portfolio_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    section_id UUID REFERENCES portfolio_sections(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    description TEXT,
    content TEXT,
    thumbnail_url TEXT,
    cover_image_url TEXT,
    category VARCHAR(100),
    tags TEXT[],
    client_name VARCHAR(255),
    project_url TEXT,
    github_url TEXT,
    start_date DATE,
    end_date DATE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_visible BOOLEAN DEFAULT TRUE,
    order_index INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio Project Images table
CREATE TABLE IF NOT EXISTS portfolio_project_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES portfolio_projects(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    caption TEXT,
    alt_text VARCHAR(255),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio Social Links table
CREATE TABLE IF NOT EXISTS portfolio_social_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- 'twitter', 'linkedin', 'github', 'dribbble', etc.
    url TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio Skills table
CREATE TABLE IF NOT EXISTS portfolio_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    section_id UUID REFERENCES portfolio_sections(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    proficiency INTEGER DEFAULT 80, -- 0-100
    icon VARCHAR(100),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio Experience table
CREATE TABLE IF NOT EXISTS portfolio_experience (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    section_id UUID REFERENCES portfolio_sections(id) ON DELETE SET NULL,
    type VARCHAR(50) DEFAULT 'work', -- 'work', 'education', 'certification'
    title VARCHAR(255) NOT NULL,
    organization VARCHAR(255),
    location VARCHAR(255),
    description TEXT,
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio Analytics table
CREATE TABLE IF NOT EXISTS portfolio_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    page_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    project_views JSONB DEFAULT '{}',
    referrers JSONB DEFAULT '{}',
    countries JSONB DEFAULT '{}',
    devices JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(portfolio_id, date)
);

-- Portfolio Contact Submissions table
CREATE TABLE IF NOT EXISTS portfolio_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    replied_at TIMESTAMPTZ,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SECTION 5: CLIENT GALLERY TABLES
-- =====================================================

-- Client Galleries table
CREATE TABLE IF NOT EXISTS client_galleries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    description TEXT,
    cover_image_url TEXT,
    client_name VARCHAR(255),
    client_email VARCHAR(255),
    event_date DATE,
    event_type VARCHAR(100),
    layout VARCHAR(50) DEFAULT 'grid', -- 'grid', 'masonry', 'carousel', 'slideshow', 'justified'
    columns INTEGER DEFAULT 3,
    gap INTEGER DEFAULT 16,
    show_metadata BOOLEAN DEFAULT FALSE,
    allow_downloads BOOLEAN DEFAULT TRUE,
    download_quality VARCHAR(50) DEFAULT 'original', -- 'original', 'high', 'medium', 'web'
    require_password BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255),
    watermark_enabled BOOLEAN DEFAULT FALSE,
    watermark_text VARCHAR(255),
    watermark_image_url TEXT,
    watermark_position VARCHAR(50) DEFAULT 'bottom-right',
    watermark_opacity DECIMAL(3,2) DEFAULT 0.5,
    proofing_enabled BOOLEAN DEFAULT FALSE,
    proofing_deadline TIMESTAMPTZ,
    proofing_max_selections INTEGER,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'active', 'delivered', 'archived'
    expires_at TIMESTAMPTZ,
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery Collections table
CREATE TABLE IF NOT EXISTS gallery_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gallery_id UUID REFERENCES client_galleries(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery Images table
CREATE TABLE IF NOT EXISTS gallery_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gallery_id UUID REFERENCES client_galleries(id) ON DELETE CASCADE,
    collection_id UUID REFERENCES gallery_collections(id) ON DELETE SET NULL,
    filename VARCHAR(255) NOT NULL,
    original_url TEXT NOT NULL,
    thumbnail_url TEXT,
    medium_url TEXT,
    large_url TEXT,
    watermarked_url TEXT,
    width INTEGER,
    height INTEGER,
    file_size BIGINT,
    mime_type VARCHAR(100),
    caption TEXT,
    photographer_notes TEXT,
    camera_model VARCHAR(255),
    lens VARCHAR(255),
    focal_length VARCHAR(50),
    aperture VARCHAR(20),
    shutter_speed VARCHAR(20),
    iso INTEGER,
    taken_at TIMESTAMPTZ,
    is_cover BOOLEAN DEFAULT FALSE,
    is_hidden BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery Proofing Selections table
CREATE TABLE IF NOT EXISTS gallery_proofing_selections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gallery_id UUID REFERENCES client_galleries(id) ON DELETE CASCADE,
    image_id UUID REFERENCES gallery_images(id) ON DELETE CASCADE,
    client_link_id UUID,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    notes TEXT,
    selected_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id),
    UNIQUE(gallery_id, image_id, client_link_id)
);

-- Gallery Favorites table
CREATE TABLE IF NOT EXISTS gallery_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gallery_id UUID REFERENCES client_galleries(id) ON DELETE CASCADE,
    image_id UUID REFERENCES gallery_images(id) ON DELETE CASCADE,
    client_link_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(gallery_id, image_id, client_link_id)
);

-- Gallery Client Links table
CREATE TABLE IF NOT EXISTS gallery_client_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gallery_id UUID REFERENCES client_galleries(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    permissions JSONB DEFAULT '{"view": true, "download": false, "proof": false, "favorite": false}',
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ,
    access_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery Download History table
CREATE TABLE IF NOT EXISTS gallery_downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gallery_id UUID REFERENCES client_galleries(id) ON DELETE CASCADE,
    image_id UUID REFERENCES gallery_images(id) ON DELETE SET NULL,
    client_link_id UUID REFERENCES gallery_client_links(id) ON DELETE SET NULL,
    download_type VARCHAR(50), -- 'single', 'collection', 'all', 'selected'
    quality VARCHAR(50),
    file_count INTEGER DEFAULT 1,
    total_size BIGINT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery Comments table
CREATE TABLE IF NOT EXISTS gallery_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gallery_id UUID REFERENCES client_galleries(id) ON DELETE CASCADE,
    image_id UUID REFERENCES gallery_images(id) ON DELETE CASCADE,
    client_link_id UUID REFERENCES gallery_client_links(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SECTION 6: BOOKING SYSTEM TABLES
-- =====================================================

-- Booking Services table
CREATE TABLE IF NOT EXISTS booking_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    description TEXT,
    category VARCHAR(100),
    duration INTEGER NOT NULL, -- in minutes
    buffer_before INTEGER DEFAULT 0,
    buffer_after INTEGER DEFAULT 15,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    deposit_amount DECIMAL(10,2),
    deposit_percentage INTEGER,
    max_attendees INTEGER DEFAULT 1,
    is_group BOOLEAN DEFAULT FALSE,
    location_type VARCHAR(50) DEFAULT 'in_person', -- 'in_person', 'video', 'phone', 'client_location'
    location_address TEXT,
    video_platform VARCHAR(50), -- 'zoom', 'google_meet', 'teams'
    requires_approval BOOLEAN DEFAULT FALSE,
    allow_cancellation BOOLEAN DEFAULT TRUE,
    cancellation_hours INTEGER DEFAULT 24,
    is_active BOOLEAN DEFAULT TRUE,
    color VARCHAR(20) DEFAULT '#6366f1',
    image_url TEXT,
    order_index INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Packages table
CREATE TABLE IF NOT EXISTS booking_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    discount_percentage INTEGER DEFAULT 0,
    valid_days INTEGER DEFAULT 365,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Package Services (many-to-many)
CREATE TABLE IF NOT EXISTS booking_package_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID REFERENCES booking_packages(id) ON DELETE CASCADE,
    service_id UUID REFERENCES booking_services(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    UNIQUE(package_id, service_id)
);

-- Availability Schedules table
CREATE TABLE IF NOT EXISTS booking_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    service_id UUID REFERENCES booking_services(id) ON DELETE CASCADE,
    day_of_week INTEGER, -- 0-6 (Sunday-Saturday), NULL for specific date
    specific_date DATE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    timezone VARCHAR(100) DEFAULT 'UTC',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_day_or_date CHECK (day_of_week IS NOT NULL OR specific_date IS NOT NULL)
);

-- Blocked Times table
CREATE TABLE IF NOT EXISTS booking_blocked_times (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    service_id UUID REFERENCES booking_services(id) ON DELETE SET NULL,
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    reason VARCHAR(255),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking Clients table
CREATE TABLE IF NOT EXISTS booking_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- the provider
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    timezone VARCHAR(100) DEFAULT 'UTC',
    notes TEXT,
    tags TEXT[],
    total_bookings INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    last_booking_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, email)
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- the provider
    service_id UUID REFERENCES booking_services(id) ON DELETE SET NULL,
    package_id UUID REFERENCES booking_packages(id) ON DELETE SET NULL,
    client_id UUID REFERENCES booking_clients(id) ON DELETE SET NULL,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50),
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    timezone VARCHAR(100) DEFAULT 'UTC',
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled', 'no_show'
    location_type VARCHAR(50),
    location_details TEXT,
    video_link TEXT,
    notes TEXT,
    internal_notes TEXT,
    price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'deposit_paid', 'paid', 'refunded'
    payment_method VARCHAR(50),
    payment_id VARCHAR(255),
    deposit_paid DECIMAL(10,2) DEFAULT 0,
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at TIMESTAMPTZ,
    followup_sent BOOLEAN DEFAULT FALSE,
    followup_sent_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancelled_by VARCHAR(50), -- 'client', 'provider'
    cancellation_reason TEXT,
    confirmation_token VARCHAR(255) UNIQUE,
    reschedule_count INTEGER DEFAULT 0,
    source VARCHAR(50) DEFAULT 'website', -- 'website', 'widget', 'manual', 'api'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking Attendees (for group sessions)
CREATE TABLE IF NOT EXISTS booking_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking Payments table
CREATE TABLE IF NOT EXISTS booking_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    type VARCHAR(50) DEFAULT 'payment', -- 'payment', 'deposit', 'refund'
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_provider VARCHAR(50), -- 'stripe', 'paypal', 'square'
    provider_payment_id VARCHAR(255),
    provider_fee DECIMAL(10,2),
    receipt_url TEXT,
    refund_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking Coupons table
CREATE TABLE IF NOT EXISTS booking_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed'
    discount_value DECIMAL(10,2) NOT NULL,
    min_booking_amount DECIMAL(10,2),
    max_discount DECIMAL(10,2),
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    per_client_limit INTEGER DEFAULT 1,
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    applicable_services UUID[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking Coupon Usage table
CREATE TABLE IF NOT EXISTS booking_coupon_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID REFERENCES booking_coupons(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    client_email VARCHAR(255),
    discount_applied DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking Reminders table
CREATE TABLE IF NOT EXISTS booking_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    service_id UUID REFERENCES booking_services(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL, -- 'email', 'sms'
    trigger_type VARCHAR(50) NOT NULL, -- 'before_booking', 'after_booking'
    trigger_hours INTEGER NOT NULL,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking Integrations table
CREATE TABLE IF NOT EXISTS booking_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'google_calendar', 'outlook', 'zoom', 'stripe'
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SECTION 7: INDEXES FOR PERFORMANCE
-- =====================================================

-- Video Editor indexes
CREATE INDEX IF NOT EXISTS idx_video_projects_user ON video_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_video_tracks_project ON video_tracks(project_id);
CREATE INDEX IF NOT EXISTS idx_video_clips_track ON video_clips(track_id);
CREATE INDEX IF NOT EXISTS idx_video_clips_project ON video_clips(project_id);
CREATE INDEX IF NOT EXISTS idx_video_effects_clip ON video_effects(clip_id);
CREATE INDEX IF NOT EXISTS idx_video_render_jobs_project ON video_render_jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_video_render_jobs_status ON video_render_jobs(status);

-- 3D Modeling indexes
CREATE INDEX IF NOT EXISTS idx_modeling_scenes_user ON modeling_scenes(user_id);
CREATE INDEX IF NOT EXISTS idx_modeling_objects_scene ON modeling_objects(scene_id);
CREATE INDEX IF NOT EXISTS idx_modeling_materials_scene ON modeling_materials(scene_id);
CREATE INDEX IF NOT EXISTS idx_modeling_lights_scene ON modeling_lights(scene_id);
CREATE INDEX IF NOT EXISTS idx_modeling_animations_scene ON modeling_animations(scene_id);
CREATE INDEX IF NOT EXISTS idx_modeling_keyframes_animation ON modeling_keyframes(animation_id);
CREATE INDEX IF NOT EXISTS idx_modeling_render_jobs_status ON modeling_render_jobs(status);

-- Canvas Collaboration indexes
CREATE INDEX IF NOT EXISTS idx_canvas_boards_user ON canvas_boards(user_id);
CREATE INDEX IF NOT EXISTS idx_canvas_pages_canvas ON canvas_pages(canvas_id);
CREATE INDEX IF NOT EXISTS idx_canvas_elements_page ON canvas_elements(page_id);
CREATE INDEX IF NOT EXISTS idx_canvas_elements_canvas ON canvas_elements(canvas_id);
CREATE INDEX IF NOT EXISTS idx_canvas_collaborators_canvas ON canvas_collaborators(canvas_id);
CREATE INDEX IF NOT EXISTS idx_canvas_collaborators_user ON canvas_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_canvas_comments_canvas ON canvas_comments(canvas_id);

-- Portfolio Builder indexes
CREATE INDEX IF NOT EXISTS idx_portfolios_user ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_slug ON portfolios(slug);
CREATE INDEX IF NOT EXISTS idx_portfolio_pages_portfolio ON portfolio_pages(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_sections_page ON portfolio_sections(page_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_portfolio ON portfolio_projects(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_portfolio ON portfolio_analytics(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_date ON portfolio_analytics(date);

-- Client Gallery indexes
CREATE INDEX IF NOT EXISTS idx_client_galleries_user ON client_galleries(user_id);
CREATE INDEX IF NOT EXISTS idx_client_galleries_slug ON client_galleries(slug);
CREATE INDEX IF NOT EXISTS idx_gallery_images_gallery ON gallery_images(gallery_id);
CREATE INDEX IF NOT EXISTS idx_gallery_images_collection ON gallery_images(collection_id);
CREATE INDEX IF NOT EXISTS idx_gallery_client_links_gallery ON gallery_client_links(gallery_id);
CREATE INDEX IF NOT EXISTS idx_gallery_client_links_token ON gallery_client_links(token);
CREATE INDEX IF NOT EXISTS idx_gallery_proofing_gallery ON gallery_proofing_selections(gallery_id);
CREATE INDEX IF NOT EXISTS idx_gallery_favorites_gallery ON gallery_favorites(gallery_id);

-- Booking System indexes
CREATE INDEX IF NOT EXISTS idx_booking_services_user ON booking_services(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_availability_user ON booking_availability(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_availability_service ON booking_availability(service_id);
CREATE INDEX IF NOT EXISTS idx_booking_clients_user ON booking_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start_datetime ON bookings(start_datetime);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_booking_payments_booking ON booking_payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_coupons_code ON booking_coupons(code);

-- =====================================================
-- SECTION 8: ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE video_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_effects ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_render_jobs ENABLE ROW LEVEL SECURITY;

ALTER TABLE modeling_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE modeling_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE modeling_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE modeling_object_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE modeling_lights ENABLE ROW LEVEL SECURITY;
ALTER TABLE modeling_cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE modeling_animations ENABLE ROW LEVEL SECURITY;
ALTER TABLE modeling_keyframes ENABLE ROW LEVEL SECURITY;
ALTER TABLE modeling_render_jobs ENABLE ROW LEVEL SECURITY;

ALTER TABLE canvas_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_versions ENABLE ROW LEVEL SECURITY;

ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_contacts ENABLE ROW LEVEL SECURITY;

ALTER TABLE client_galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_proofing_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_client_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_comments ENABLE ROW LEVEL SECURITY;

ALTER TABLE booking_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_package_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_blocked_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_integrations ENABLE ROW LEVEL SECURITY;

-- Video Editor RLS Policies
CREATE POLICY "Users can manage their own video projects" ON video_projects
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage tracks in their projects" ON video_tracks
    FOR ALL USING (project_id IN (SELECT id FROM video_projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage clips in their projects" ON video_clips
    FOR ALL USING (project_id IN (SELECT id FROM video_projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage effects in their projects" ON video_effects
    FOR ALL USING (clip_id IN (SELECT id FROM video_clips WHERE project_id IN (SELECT id FROM video_projects WHERE user_id = auth.uid())));

CREATE POLICY "Users can manage transitions in their projects" ON video_transitions
    FOR ALL USING (project_id IN (SELECT id FROM video_projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their render jobs" ON video_render_jobs
    FOR ALL USING (auth.uid() = user_id);

-- 3D Modeling RLS Policies
CREATE POLICY "Users can manage their own 3D scenes" ON modeling_scenes
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage objects in their scenes" ON modeling_objects
    FOR ALL USING (scene_id IN (SELECT id FROM modeling_scenes WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage materials in their scenes" ON modeling_materials
    FOR ALL USING (scene_id IN (SELECT id FROM modeling_scenes WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage object-material assignments" ON modeling_object_materials
    FOR ALL USING (object_id IN (SELECT id FROM modeling_objects WHERE scene_id IN (SELECT id FROM modeling_scenes WHERE user_id = auth.uid())));

CREATE POLICY "Users can manage lights in their scenes" ON modeling_lights
    FOR ALL USING (scene_id IN (SELECT id FROM modeling_scenes WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage cameras in their scenes" ON modeling_cameras
    FOR ALL USING (scene_id IN (SELECT id FROM modeling_scenes WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage animations in their scenes" ON modeling_animations
    FOR ALL USING (scene_id IN (SELECT id FROM modeling_scenes WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage keyframes in their scenes" ON modeling_keyframes
    FOR ALL USING (animation_id IN (SELECT id FROM modeling_animations WHERE scene_id IN (SELECT id FROM modeling_scenes WHERE user_id = auth.uid())));

CREATE POLICY "Users can manage their 3D render jobs" ON modeling_render_jobs
    FOR ALL USING (auth.uid() = user_id);

-- Canvas Collaboration RLS Policies
CREATE POLICY "Users can manage their own canvas boards" ON canvas_boards
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Collaborators can view shared canvas boards" ON canvas_boards
    FOR SELECT USING (
        auth.uid() = user_id OR
        id IN (SELECT canvas_id FROM canvas_collaborators WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can manage pages in their canvas" ON canvas_pages
    FOR ALL USING (canvas_id IN (SELECT id FROM canvas_boards WHERE user_id = auth.uid()));

CREATE POLICY "Collaborators can manage pages" ON canvas_pages
    FOR ALL USING (canvas_id IN (SELECT canvas_id FROM canvas_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')));

CREATE POLICY "Users can manage elements in their canvas" ON canvas_elements
    FOR ALL USING (canvas_id IN (SELECT id FROM canvas_boards WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage connectors in their canvas" ON canvas_connectors
    FOR ALL USING (canvas_id IN (SELECT id FROM canvas_boards WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage collaborators on their canvas" ON canvas_collaborators
    FOR ALL USING (canvas_id IN (SELECT id FROM canvas_boards WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage comments on their canvas" ON canvas_comments
    FOR ALL USING (canvas_id IN (SELECT id FROM canvas_boards WHERE user_id = auth.uid()) OR auth.uid() = user_id);

CREATE POLICY "Users can manage versions of their canvas" ON canvas_versions
    FOR ALL USING (canvas_id IN (SELECT id FROM canvas_boards WHERE user_id = auth.uid()));

-- Portfolio Builder RLS Policies
CREATE POLICY "Users can manage their own portfolios" ON portfolios
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public portfolios are viewable" ON portfolios
    FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Users can manage pages in their portfolios" ON portfolio_pages
    FOR ALL USING (portfolio_id IN (SELECT id FROM portfolios WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage sections in their portfolios" ON portfolio_sections
    FOR ALL USING (portfolio_id IN (SELECT id FROM portfolios WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage projects in their portfolios" ON portfolio_projects
    FOR ALL USING (portfolio_id IN (SELECT id FROM portfolios WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage project images" ON portfolio_project_images
    FOR ALL USING (project_id IN (SELECT id FROM portfolio_projects WHERE portfolio_id IN (SELECT id FROM portfolios WHERE user_id = auth.uid())));

CREATE POLICY "Users can manage social links" ON portfolio_social_links
    FOR ALL USING (portfolio_id IN (SELECT id FROM portfolios WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage skills" ON portfolio_skills
    FOR ALL USING (portfolio_id IN (SELECT id FROM portfolios WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage experience" ON portfolio_experience
    FOR ALL USING (portfolio_id IN (SELECT id FROM portfolios WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their portfolio analytics" ON portfolio_analytics
    FOR ALL USING (portfolio_id IN (SELECT id FROM portfolios WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their portfolio contacts" ON portfolio_contacts
    FOR ALL USING (portfolio_id IN (SELECT id FROM portfolios WHERE user_id = auth.uid()));

-- Client Gallery RLS Policies
CREATE POLICY "Users can manage their own galleries" ON client_galleries
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage collections in their galleries" ON gallery_collections
    FOR ALL USING (gallery_id IN (SELECT id FROM client_galleries WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage images in their galleries" ON gallery_images
    FOR ALL USING (gallery_id IN (SELECT id FROM client_galleries WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage proofing selections" ON gallery_proofing_selections
    FOR ALL USING (gallery_id IN (SELECT id FROM client_galleries WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage favorites" ON gallery_favorites
    FOR ALL USING (gallery_id IN (SELECT id FROM client_galleries WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage client links" ON gallery_client_links
    FOR ALL USING (gallery_id IN (SELECT id FROM client_galleries WHERE user_id = auth.uid()));

CREATE POLICY "Users can view download history" ON gallery_downloads
    FOR ALL USING (gallery_id IN (SELECT id FROM client_galleries WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage gallery comments" ON gallery_comments
    FOR ALL USING (gallery_id IN (SELECT id FROM client_galleries WHERE user_id = auth.uid()) OR auth.uid() = user_id);

-- Booking System RLS Policies
CREATE POLICY "Users can manage their own services" ON booking_services
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public can view active services" ON booking_services
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Users can manage their own packages" ON booking_packages
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage package services" ON booking_package_services
    FOR ALL USING (package_id IN (SELECT id FROM booking_packages WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their availability" ON booking_availability
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their blocked times" ON booking_blocked_times
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their clients" ON booking_clients
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their bookings" ON bookings
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage booking attendees" ON booking_attendees
    FOR ALL USING (booking_id IN (SELECT id FROM bookings WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage booking payments" ON booking_payments
    FOR ALL USING (booking_id IN (SELECT id FROM bookings WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their coupons" ON booking_coupons
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view coupon usage" ON booking_coupon_usage
    FOR ALL USING (coupon_id IN (SELECT id FROM booking_coupons WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their reminders" ON booking_reminders
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their integrations" ON booking_integrations
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- SECTION 9: FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all relevant tables
CREATE TRIGGER update_video_projects_updated_at BEFORE UPDATE ON video_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_tracks_updated_at BEFORE UPDATE ON video_tracks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_clips_updated_at BEFORE UPDATE ON video_clips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modeling_scenes_updated_at BEFORE UPDATE ON modeling_scenes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modeling_objects_updated_at BEFORE UPDATE ON modeling_objects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modeling_materials_updated_at BEFORE UPDATE ON modeling_materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modeling_animations_updated_at BEFORE UPDATE ON modeling_animations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_boards_updated_at BEFORE UPDATE ON canvas_boards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_pages_updated_at BEFORE UPDATE ON canvas_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_elements_updated_at BEFORE UPDATE ON canvas_elements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_comments_updated_at BEFORE UPDATE ON canvas_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_pages_updated_at BEFORE UPDATE ON portfolio_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_sections_updated_at BEFORE UPDATE ON portfolio_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_projects_updated_at BEFORE UPDATE ON portfolio_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_galleries_updated_at BEFORE UPDATE ON client_galleries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_services_updated_at BEFORE UPDATE ON booking_services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_clients_updated_at BEFORE UPDATE ON booking_clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_integrations_updated_at BEFORE UPDATE ON booking_integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment gallery view count
CREATE OR REPLACE FUNCTION increment_gallery_view()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE client_galleries SET view_count = view_count + 1 WHERE id = NEW.gallery_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update booking client stats
CREATE OR REPLACE FUNCTION update_booking_client_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        UPDATE booking_clients
        SET
            total_bookings = total_bookings + 1,
            total_spent = total_spent + COALESCE(NEW.price, 0),
            last_booking_at = NEW.end_datetime
        WHERE id = NEW.client_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_client_stats_on_booking AFTER INSERT OR UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_booking_client_stats();

-- Function to increment coupon usage
CREATE OR REPLACE FUNCTION increment_coupon_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE booking_coupons SET usage_count = usage_count + 1 WHERE id = NEW.coupon_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_coupon_on_use AFTER INSERT ON booking_coupon_usage
    FOR EACH ROW EXECUTE FUNCTION increment_coupon_usage();

-- =====================================================
-- SECTION 10: COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE video_projects IS 'Stores video editing projects with timeline and rendering configuration';
COMMENT ON TABLE modeling_scenes IS 'Stores 3D modeling scenes with objects, materials, lights, and cameras';
COMMENT ON TABLE canvas_boards IS 'Stores collaborative whiteboard/canvas boards';
COMMENT ON TABLE portfolios IS 'Stores professional portfolio websites for creatives';
COMMENT ON TABLE client_galleries IS 'Stores client-facing photo/video galleries for proofing and delivery';
COMMENT ON TABLE booking_services IS 'Stores bookable services with pricing and availability';
COMMENT ON TABLE bookings IS 'Stores booking appointments and reservations';

-- Phase 7 Advanced Features Migration Complete
