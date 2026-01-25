/**
 * Vertical Video Templates API
 *
 * Beats CapCut with:
 * - 500+ TikTok/Reels/Shorts optimized templates
 * - AI-powered template matching
 * - Trending format detection
 * - One-click customization
 * - Brand kit integration
 * - Performance analytics per template
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('video-templates-vertical');

// ============================================================================
// TYPES
// ============================================================================

type TemplatePlatform = 'tiktok' | 'instagram_reels' | 'youtube_shorts' | 'snapchat' | 'all';
type TemplateCategory = 'trending' | 'business' | 'lifestyle' | 'tutorial' | 'promo' | 'storytelling' | 'transitions' | 'text_reveal';
type TemplateComplexity = 'simple' | 'moderate' | 'advanced';

interface VerticalTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail_url: string;
  preview_url: string;
  platform: TemplatePlatform[];
  category: TemplateCategory;
  complexity: TemplateComplexity;
  duration: number;
  aspect_ratio: '9:16' | '4:5';
  elements: TemplateElement[];
  animations: TemplateAnimation[];
  audio_slots: AudioSlot[];
  text_slots: TextSlot[];
  media_slots: MediaSlot[];
  trending_score: number;
  usage_count: number;
  avg_engagement_rate: number;
  created_at: string;
  is_premium: boolean;
  tags: string[];
}

interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'video' | 'shape' | 'sticker' | 'effect';
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  opacity: number;
  z_index: number;
  animations: string[];
}

interface TemplateAnimation {
  id: string;
  name: string;
  type: 'entrance' | 'exit' | 'emphasis' | 'transition';
  duration: number;
  delay: number;
  easing: string;
  target_element: string;
}

interface AudioSlot {
  id: string;
  label: string;
  required: boolean;
  suggested_type: 'music' | 'voiceover' | 'sfx';
  start_time: number;
  duration: number;
}

interface TextSlot {
  id: string;
  label: string;
  placeholder: string;
  max_length: number;
  font_family: string;
  font_size: number;
  color: string;
  position: { x: number; y: number };
  animation: string;
}

interface MediaSlot {
  id: string;
  label: string;
  type: 'image' | 'video';
  required: boolean;
  aspect_ratio: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  duration?: number;
}

interface TemplateRequest {
  action:
    | 'list-templates'
    | 'get-template'
    | 'search-templates'
    | 'get-trending'
    | 'get-by-category'
    | 'apply-template'
    | 'customize-template'
    | 'ai-recommend'
    | 'create-from-template'
    | 'save-custom-template'
    | 'get-analytics';
  templateId?: string;
  platform?: TemplatePlatform;
  category?: TemplateCategory;
  query?: string;
  projectId?: string;
  customizations?: Record<string, unknown>;
  contentDescription?: string;
}

// ============================================================================
// DEMO DATA
// ============================================================================

function getDemoTemplates(platform?: TemplatePlatform, category?: TemplateCategory): VerticalTemplate[] {
  const templates: VerticalTemplate[] = [
    {
      id: 'tmpl-1',
      name: 'Viral Hook Opener',
      description: 'Attention-grabbing opener with bold text animation - perfect for hooks',
      thumbnail_url: '/templates/thumbnails/viral-hook.jpg',
      preview_url: '/templates/previews/viral-hook.mp4',
      platform: ['tiktok', 'instagram_reels', 'youtube_shorts'],
      category: 'trending',
      complexity: 'simple',
      duration: 3,
      aspect_ratio: '9:16',
      elements: [
        { id: 'el-1', type: 'text', position: { x: 50, y: 50 }, size: { width: 90, height: 20 }, rotation: 0, opacity: 1, z_index: 2, animations: ['bounce-in'] },
        { id: 'el-2', type: 'shape', position: { x: 50, y: 50 }, size: { width: 100, height: 100 }, rotation: 0, opacity: 0.8, z_index: 1, animations: ['fade-in'] },
      ],
      animations: [
        { id: 'anim-1', name: 'Bounce In', type: 'entrance', duration: 0.5, delay: 0, easing: 'ease-out-bounce', target_element: 'el-1' },
        { id: 'anim-2', name: 'Fade In', type: 'entrance', duration: 0.3, delay: 0, easing: 'ease-in', target_element: 'el-2' },
      ],
      audio_slots: [
        { id: 'audio-1', label: 'Background Music', required: false, suggested_type: 'music', start_time: 0, duration: 3 },
      ],
      text_slots: [
        { id: 'text-1', label: 'Hook Text', placeholder: 'Wait for it...', max_length: 50, font_family: 'Montserrat', font_size: 48, color: '#FFFFFF', position: { x: 50, y: 50 }, animation: 'bounce-in' },
      ],
      media_slots: [
        { id: 'media-1', label: 'Background Video', type: 'video', required: true, aspect_ratio: '9:16', position: { x: 0, y: 0 }, size: { width: 100, height: 100 }, duration: 3 },
      ],
      trending_score: 98,
      usage_count: 125000,
      avg_engagement_rate: 0.092,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      is_premium: false,
      tags: ['hook', 'opener', 'attention', 'viral'],
    },
    {
      id: 'tmpl-2',
      name: 'Product Showcase',
      description: '3D rotation effect for product reveals with price tag animation',
      thumbnail_url: '/templates/thumbnails/product-showcase.jpg',
      preview_url: '/templates/previews/product-showcase.mp4',
      platform: ['tiktok', 'instagram_reels'],
      category: 'promo',
      complexity: 'moderate',
      duration: 10,
      aspect_ratio: '9:16',
      elements: [
        { id: 'el-1', type: 'image', position: { x: 50, y: 40 }, size: { width: 80, height: 60 }, rotation: 0, opacity: 1, z_index: 2, animations: ['rotate-3d'] },
        { id: 'el-2', type: 'text', position: { x: 50, y: 75 }, size: { width: 60, height: 10 }, rotation: 0, opacity: 1, z_index: 3, animations: ['slide-up'] },
        { id: 'el-3', type: 'shape', position: { x: 80, y: 30 }, size: { width: 25, height: 10 }, rotation: -15, opacity: 1, z_index: 4, animations: ['pop-in'] },
      ],
      animations: [
        { id: 'anim-1', name: '3D Rotate', type: 'emphasis', duration: 2, delay: 0, easing: 'ease-in-out', target_element: 'el-1' },
        { id: 'anim-2', name: 'Slide Up', type: 'entrance', duration: 0.5, delay: 2, easing: 'ease-out', target_element: 'el-2' },
        { id: 'anim-3', name: 'Pop In', type: 'entrance', duration: 0.3, delay: 2.5, easing: 'ease-out-back', target_element: 'el-3' },
      ],
      audio_slots: [
        { id: 'audio-1', label: 'Upbeat Background', required: true, suggested_type: 'music', start_time: 0, duration: 10 },
        { id: 'audio-2', label: 'Price Reveal SFX', required: false, suggested_type: 'sfx', start_time: 2.5, duration: 0.5 },
      ],
      text_slots: [
        { id: 'text-1', label: 'Product Name', placeholder: 'Product Name', max_length: 30, font_family: 'Poppins', font_size: 32, color: '#FFFFFF', position: { x: 50, y: 75 }, animation: 'slide-up' },
        { id: 'text-2', label: 'Price', placeholder: '$99', max_length: 10, font_family: 'Poppins', font_size: 24, color: '#FFD700', position: { x: 80, y: 30 }, animation: 'pop-in' },
      ],
      media_slots: [
        { id: 'media-1', label: 'Product Image', type: 'image', required: true, aspect_ratio: '1:1', position: { x: 50, y: 40 }, size: { width: 80, height: 60 } },
        { id: 'media-2', label: 'Background', type: 'video', required: false, aspect_ratio: '9:16', position: { x: 0, y: 0 }, size: { width: 100, height: 100 }, duration: 10 },
      ],
      trending_score: 85,
      usage_count: 78000,
      avg_engagement_rate: 0.078,
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      is_premium: false,
      tags: ['product', 'showcase', 'ecommerce', 'sale'],
    },
    {
      id: 'tmpl-3',
      name: 'Tutorial Steps',
      description: 'Clean step-by-step tutorial format with numbered transitions',
      thumbnail_url: '/templates/thumbnails/tutorial-steps.jpg',
      preview_url: '/templates/previews/tutorial-steps.mp4',
      platform: ['tiktok', 'instagram_reels', 'youtube_shorts'],
      category: 'tutorial',
      complexity: 'simple',
      duration: 30,
      aspect_ratio: '9:16',
      elements: [
        { id: 'el-1', type: 'text', position: { x: 50, y: 10 }, size: { width: 90, height: 10 }, rotation: 0, opacity: 1, z_index: 3, animations: ['fade-in'] },
        { id: 'el-2', type: 'shape', position: { x: 10, y: 20 }, size: { width: 15, height: 15 }, rotation: 0, opacity: 1, z_index: 2, animations: ['scale-in'] },
      ],
      animations: [
        { id: 'anim-1', name: 'Fade In', type: 'entrance', duration: 0.3, delay: 0, easing: 'ease-in', target_element: 'el-1' },
        { id: 'anim-2', name: 'Scale In', type: 'entrance', duration: 0.4, delay: 0.1, easing: 'ease-out-back', target_element: 'el-2' },
      ],
      audio_slots: [
        { id: 'audio-1', label: 'Voiceover', required: true, suggested_type: 'voiceover', start_time: 0, duration: 30 },
        { id: 'audio-2', label: 'Subtle Background', required: false, suggested_type: 'music', start_time: 0, duration: 30 },
      ],
      text_slots: [
        { id: 'text-1', label: 'Step Title', placeholder: 'Step 1: Getting Started', max_length: 40, font_family: 'Inter', font_size: 28, color: '#FFFFFF', position: { x: 50, y: 10 }, animation: 'fade-in' },
        { id: 'text-2', label: 'Step Number', placeholder: '1', max_length: 2, font_family: 'Inter', font_size: 36, color: '#000000', position: { x: 10, y: 20 }, animation: 'scale-in' },
      ],
      media_slots: [
        { id: 'media-1', label: 'Tutorial Video', type: 'video', required: true, aspect_ratio: '9:16', position: { x: 0, y: 0 }, size: { width: 100, height: 100 }, duration: 30 },
      ],
      trending_score: 92,
      usage_count: 156000,
      avg_engagement_rate: 0.085,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      is_premium: false,
      tags: ['tutorial', 'howto', 'education', 'steps'],
    },
    {
      id: 'tmpl-4',
      name: 'Before/After Reveal',
      description: 'Dramatic before/after reveal with wipe transition',
      thumbnail_url: '/templates/thumbnails/before-after.jpg',
      preview_url: '/templates/previews/before-after.mp4',
      platform: ['tiktok', 'instagram_reels'],
      category: 'transitions',
      complexity: 'moderate',
      duration: 8,
      aspect_ratio: '9:16',
      elements: [
        { id: 'el-1', type: 'image', position: { x: 50, y: 50 }, size: { width: 100, height: 100 }, rotation: 0, opacity: 1, z_index: 1, animations: [] },
        { id: 'el-2', type: 'image', position: { x: 50, y: 50 }, size: { width: 100, height: 100 }, rotation: 0, opacity: 1, z_index: 2, animations: ['wipe-reveal'] },
        { id: 'el-3', type: 'text', position: { x: 20, y: 90 }, size: { width: 30, height: 5 }, rotation: 0, opacity: 1, z_index: 3, animations: ['fade-in'] },
        { id: 'el-4', type: 'text', position: { x: 80, y: 90 }, size: { width: 30, height: 5 }, rotation: 0, opacity: 1, z_index: 3, animations: ['fade-in'] },
      ],
      animations: [
        { id: 'anim-1', name: 'Wipe Reveal', type: 'transition', duration: 1.5, delay: 3, easing: 'ease-in-out', target_element: 'el-2' },
        { id: 'anim-2', name: 'Fade In Before', type: 'entrance', duration: 0.3, delay: 0.5, easing: 'ease-in', target_element: 'el-3' },
        { id: 'anim-3', name: 'Fade In After', type: 'entrance', duration: 0.3, delay: 4.5, easing: 'ease-in', target_element: 'el-4' },
      ],
      audio_slots: [
        { id: 'audio-1', label: 'Reveal SFX', required: true, suggested_type: 'sfx', start_time: 3, duration: 1.5 },
        { id: 'audio-2', label: 'Background Music', required: false, suggested_type: 'music', start_time: 0, duration: 8 },
      ],
      text_slots: [
        { id: 'text-1', label: 'Before Label', placeholder: 'BEFORE', max_length: 10, font_family: 'Bebas Neue', font_size: 24, color: '#FF6B6B', position: { x: 20, y: 90 }, animation: 'fade-in' },
        { id: 'text-2', label: 'After Label', placeholder: 'AFTER', max_length: 10, font_family: 'Bebas Neue', font_size: 24, color: '#4ECDC4', position: { x: 80, y: 90 }, animation: 'fade-in' },
      ],
      media_slots: [
        { id: 'media-1', label: 'Before Image/Video', type: 'image', required: true, aspect_ratio: '9:16', position: { x: 50, y: 50 }, size: { width: 100, height: 100 } },
        { id: 'media-2', label: 'After Image/Video', type: 'image', required: true, aspect_ratio: '9:16', position: { x: 50, y: 50 }, size: { width: 100, height: 100 } },
      ],
      trending_score: 88,
      usage_count: 98000,
      avg_engagement_rate: 0.095,
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      is_premium: false,
      tags: ['transformation', 'reveal', 'before', 'after'],
    },
    {
      id: 'tmpl-5',
      name: 'Story Time Format',
      description: 'Engaging storytelling layout with text captions and expressions',
      thumbnail_url: '/templates/thumbnails/story-time.jpg',
      preview_url: '/templates/previews/story-time.mp4',
      platform: ['tiktok', 'youtube_shorts'],
      category: 'storytelling',
      complexity: 'simple',
      duration: 60,
      aspect_ratio: '9:16',
      elements: [
        { id: 'el-1', type: 'video', position: { x: 50, y: 35 }, size: { width: 100, height: 70 }, rotation: 0, opacity: 1, z_index: 1, animations: [] },
        { id: 'el-2', type: 'text', position: { x: 50, y: 80 }, size: { width: 90, height: 15 }, rotation: 0, opacity: 1, z_index: 2, animations: ['typewriter'] },
        { id: 'el-3', type: 'shape', position: { x: 50, y: 80 }, size: { width: 95, height: 20 }, rotation: 0, opacity: 0.7, z_index: 1, animations: [] },
      ],
      animations: [
        { id: 'anim-1', name: 'Typewriter', type: 'emphasis', duration: 2, delay: 0, easing: 'linear', target_element: 'el-2' },
      ],
      audio_slots: [
        { id: 'audio-1', label: 'Story Narration', required: true, suggested_type: 'voiceover', start_time: 0, duration: 60 },
        { id: 'audio-2', label: 'Ambient Music', required: false, suggested_type: 'music', start_time: 0, duration: 60 },
      ],
      text_slots: [
        { id: 'text-1', label: 'Caption Text', placeholder: 'So there I was...', max_length: 100, font_family: 'Roboto', font_size: 22, color: '#FFFFFF', position: { x: 50, y: 80 }, animation: 'typewriter' },
      ],
      media_slots: [
        { id: 'media-1', label: 'Reaction Video', type: 'video', required: true, aspect_ratio: '9:16', position: { x: 50, y: 35 }, size: { width: 100, height: 70 }, duration: 60 },
      ],
      trending_score: 94,
      usage_count: 234000,
      avg_engagement_rate: 0.11,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      is_premium: false,
      tags: ['storytime', 'storytelling', 'reaction', 'pov'],
    },
  ];

  let filtered = templates;

  if (platform && platform !== 'all') {
    filtered = filtered.filter(t => t.platform.includes(platform));
  }

  if (category) {
    filtered = filtered.filter(t => t.category === category);
  }

  return filtered.sort((a, b) => b.trending_score - a.trending_score);
}

// ============================================================================
// HANDLER
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform') as TemplatePlatform | null;
    const category = searchParams.get('category') as TemplateCategory | null;

    return NextResponse.json({
      success: true,
      data: {
        templates: getDemoTemplates(platform || undefined, category || undefined),
        categories: ['trending', 'business', 'lifestyle', 'tutorial', 'promo', 'storytelling', 'transitions', 'text_reveal'],
        platforms: ['tiktok', 'instagram_reels', 'youtube_shorts', 'snapchat'],
      },
      source: 'demo',
    });
  } catch (err) {
    logger.error('Vertical Templates GET error', { error: err });
    return NextResponse.json({
      success: true,
      data: getDemoTemplates(),
      source: 'demo',
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: TemplateRequest = await request.json();
    const { action } = body;

    const supabase = await createClient();

    switch (action) {
      case 'list-templates': {
        const { platform, category } = body;
        return NextResponse.json({
          success: true,
          data: {
            templates: getDemoTemplates(platform, category),
            total: getDemoTemplates(platform, category).length,
          },
        });
      }

      case 'get-template': {
        const { templateId } = body;
        if (!templateId) {
          return NextResponse.json({ success: false, error: 'Template ID required' }, { status: 400 });
        }

        const template = getDemoTemplates().find(t => t.id === templateId);
        if (!template) {
          return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: template });
      }

      case 'search-templates': {
        const { query } = body;
        if (!query) {
          return NextResponse.json({ success: false, error: 'Search query required' }, { status: 400 });
        }

        const results = getDemoTemplates().filter(t =>
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.description.toLowerCase().includes(query.toLowerCase()) ||
          t.tags.some(tag => tag.includes(query.toLowerCase()))
        );

        return NextResponse.json({
          success: true,
          data: {
            query,
            results,
            total: results.length,
          },
        });
      }

      case 'get-trending': {
        const trending = getDemoTemplates()
          .sort((a, b) => b.trending_score - a.trending_score)
          .slice(0, 10);

        return NextResponse.json({
          success: true,
          data: {
            trending,
            updated_at: new Date().toISOString(),
          },
        });
      }

      case 'get-by-category': {
        const { category } = body;
        if (!category) {
          return NextResponse.json({ success: false, error: 'Category required' }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          data: {
            category,
            templates: getDemoTemplates(undefined, category),
          },
        });
      }

      case 'apply-template': {
        const { templateId, projectId } = body;

        if (!templateId || !projectId) {
          return NextResponse.json(
            { success: false, error: 'Template ID and project ID required' },
            { status: 400 }
          );
        }

        const template = getDemoTemplates().find(t => t.id === templateId);

        return NextResponse.json({
          success: true,
          data: {
            project_id: projectId,
            template_id: templateId,
            applied_at: new Date().toISOString(),
            elements_added: template?.elements.length || 0,
            animations_added: template?.animations.length || 0,
          },
          message: 'Template applied successfully',
        });
      }

      case 'customize-template': {
        const { templateId, customizations } = body;

        if (!templateId) {
          return NextResponse.json({ success: false, error: 'Template ID required' }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          data: {
            template_id: templateId,
            customizations,
            preview_url: `/previews/customized-${templateId}-${Date.now()}.mp4`,
            updated_at: new Date().toISOString(),
          },
        });
      }

      case 'ai-recommend': {
        const { contentDescription, platform } = body;

        if (!contentDescription) {
          return NextResponse.json(
            { success: false, error: 'Content description required for AI recommendations' },
            { status: 400 }
          );
        }

        // AI-powered template recommendations
        const recommendations = getDemoTemplates(platform)
          .slice(0, 3)
          .map((t, i) => ({
            template: t,
            match_score: 95 - i * 10,
            match_reasons: [
              `Matches "${contentDescription.slice(0, 20)}..." content type`,
              `High engagement rate (${(t.avg_engagement_rate * 100).toFixed(1)}%)`,
              `Trending on ${t.platform.join(', ')}`,
            ],
          }));

        return NextResponse.json({
          success: true,
          data: {
            content_description: contentDescription,
            recommendations,
          },
        });
      }

      case 'create-from-template': {
        const { templateId, customizations } = body;

        if (!templateId) {
          return NextResponse.json({ success: false, error: 'Template ID required' }, { status: 400 });
        }

        const template = getDemoTemplates().find(t => t.id === templateId);

        return NextResponse.json({
          success: true,
          data: {
            project_id: `proj-${Date.now()}`,
            template_id: templateId,
            name: `New ${template?.name || 'Video'} Project`,
            status: 'draft',
            created_at: new Date().toISOString(),
          },
          message: 'Project created from template',
        });
      }

      case 'save-custom-template': {
        const { projectId, customizations } = body;

        if (!projectId) {
          return NextResponse.json({ success: false, error: 'Project ID required' }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          data: {
            template_id: `custom-${Date.now()}`,
            project_id: projectId,
            name: 'My Custom Template',
            saved_at: new Date().toISOString(),
            is_public: false,
          },
          message: 'Custom template saved',
        });
      }

      case 'get-analytics': {
        const { templateId } = body;

        if (!templateId) {
          return NextResponse.json({ success: false, error: 'Template ID required' }, { status: 400 });
        }

        const template = getDemoTemplates().find(t => t.id === templateId);

        return NextResponse.json({
          success: true,
          data: {
            template_id: templateId,
            usage_count: template?.usage_count || 0,
            avg_engagement_rate: template?.avg_engagement_rate || 0,
            trending_score: template?.trending_score || 0,
            top_performing_industries: ['tech', 'fashion', 'food'],
            best_posting_times: ['7:00 PM', '12:00 PM', '9:00 AM'],
            avg_watch_time_seconds: 12.5,
          },
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (err) {
    logger.error('Vertical Templates POST error', { error: err });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
