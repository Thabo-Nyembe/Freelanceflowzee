// =====================================================
// KAZI AI Design Tools API - World-Class
// AI-powered design assistance and generation
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('ai-design-tools');

// =====================================================
// Types
// =====================================================

type DesignType =
  | 'logo' | 'brand_identity' | 'social_media_graphics' | 'banner'
  | 'infographic' | 'presentation' | 'ui_mockup' | 'illustration'
  | 'icon_set' | 'poster' | 'flyer' | 'business_card' | 'thumbnail'
  | 'email_header' | 'ad_creative' | 'packaging' | 'merchandise';

type DesignStyle =
  | 'minimalist' | 'modern' | 'vintage' | 'playful' | 'corporate'
  | 'luxurious' | 'bold' | 'elegant' | 'futuristic' | 'hand_drawn'
  | 'geometric' | 'organic' | 'abstract' | 'photorealistic' | 'flat';

type ColorScheme =
  | 'monochromatic' | 'complementary' | 'analogous' | 'triadic'
  | 'split_complementary' | 'warm' | 'cool' | 'neutral' | 'vibrant'
  | 'pastel' | 'dark' | 'light' | 'custom';

interface DesignRequest {
  action: string;
  design_type?: DesignType;
  style?: DesignStyle;
  description?: string;
  brand_name?: string;
  industry?: string;
  target_audience?: string;
  color_scheme?: ColorScheme;
  primary_color?: string;
  dimensions?: { width: number; height: number };
  reference_images?: string[];
  text_content?: string[];
  mood?: string[];
  constraints?: string[];
  existing_design_url?: string;
}

// =====================================================
// GET - Fetch design history, templates, resources
// =====================================================
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Demo mode for unauthenticated users
    if (!user) {
      return handleDemoGet(action);
    }

    switch (action) {
      case 'history': {
        const designType = searchParams.get('design_type');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = (page - 1) * limit;

        let query = supabase
          .from('ai_design_generations')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (designType) {
          query = query.eq('design_type', designType);
        }

        const { data: designs, count, error } = await query;

        if (error) throw error;

        return NextResponse.json({
          success: true,
          designs,
          total: count || 0,
          page,
          limit
        });
      }

      case 'brand-assets': {
        const { data: assets, error } = await supabase
          .from('ai_brand_assets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({
          success: true,
          assets: assets || []
        });
      }

      case 'color-palettes': {
        const { data: palettes, error } = await supabase
          .from('ai_color_palettes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({
          success: true,
          palettes: palettes || [],
          recommended: getRecommendedPalettes()
        });
      }

      case 'design-types': {
        return NextResponse.json({
          success: true,
          design_types: getDesignTypes(),
          styles: getDesignStyles(),
          color_schemes: getColorSchemes()
        });
      }

      case 'templates': {
        const category = searchParams.get('category');

        const templates = getDesignTemplates(category || undefined);

        return NextResponse.json({
          success: true,
          templates
        });
      }

      case 'usage': {
        const { data: usage, error } = await supabase
          .from('ai_design_usage')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        if (error) throw error;

        const stats = {
          total_designs: usage?.length || 0,
          by_type: {} as Record<string, number>,
          by_style: {} as Record<string, number>,
          tokens_used: usage?.reduce((sum, u) => sum + (u.tokens_used || 0), 0) || 0
        };

        usage?.forEach(u => {
          stats.by_type[u.design_type] = (stats.by_type[u.design_type] || 0) + 1;
          if (u.style) {
            stats.by_style[u.style] = (stats.by_style[u.style] || 0) + 1;
          }
        });

        return NextResponse.json({ success: true, usage: stats });
      }

      default: {
        return NextResponse.json({
          success: true,
          service: 'AI Design Tools',
          version: '2.0.0',
          status: 'operational',
          capabilities: [
            'logo_design', 'brand_identity', 'social_graphics', 'banners',
            'infographics', 'ui_mockups', 'color_palette_generation',
            'design_analysis', 'style_transfer', 'asset_resizing',
            'design_variations', 'accessibility_check'
          ]
        });
      }
    }
  } catch (error) {
    logger.error('AI Design Tools GET error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch design data' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Generate designs, analyze, transform
// =====================================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body: DesignRequest = await request.json();
    const { action, ...data } = body;

    // Demo mode for unauthenticated users
    if (!user) {
      return handleDemoPost(action, data);
    }

    switch (action) {
      case 'generate-concept': {
        if (!data.design_type || !data.description) {
          return NextResponse.json(
            { success: false, error: 'Design type and description required' },
            { status: 400 }
          );
        }

        const result = await generateDesignConcept(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'generate-concept',
          ...result
        });
      }

      case 'generate-logo': {
        if (!data.brand_name) {
          return NextResponse.json(
            { success: false, error: 'Brand name required' },
            { status: 400 }
          );
        }

        const result = await generateLogoConcepts(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'generate-logo',
          ...result
        });
      }

      case 'generate-palette': {
        const result = await generateColorPalette(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'generate-palette',
          ...result
        });
      }

      case 'analyze-design': {
        if (!data.existing_design_url && !data.description) {
          return NextResponse.json(
            { success: false, error: 'Design URL or description required' },
            { status: 400 }
          );
        }

        const result = await analyzeDesign(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'analyze-design',
          ...result
        });
      }

      case 'generate-variations': {
        if (!data.existing_design_url && !data.description) {
          return NextResponse.json(
            { success: false, error: 'Design URL or description required' },
            { status: 400 }
          );
        }

        const result = await generateDesignVariations(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'generate-variations',
          ...result
        });
      }

      case 'suggest-improvements': {
        if (!data.existing_design_url && !data.description) {
          return NextResponse.json(
            { success: false, error: 'Design URL or description required' },
            { status: 400 }
          );
        }

        const result = await suggestImprovements(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'suggest-improvements',
          ...result
        });
      }

      case 'generate-brand-guidelines': {
        if (!data.brand_name) {
          return NextResponse.json(
            { success: false, error: 'Brand name required' },
            { status: 400 }
          );
        }

        const result = await generateBrandGuidelines(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'generate-brand-guidelines',
          ...result
        });
      }

      case 'check-accessibility': {
        if (!data.primary_color) {
          return NextResponse.json(
            { success: false, error: 'Colors required for accessibility check' },
            { status: 400 }
          );
        }

        const result = await checkAccessibility(data);

        return NextResponse.json({
          success: true,
          action: 'check-accessibility',
          ...result
        });
      }

      case 'generate-social-assets': {
        if (!data.brand_name && !data.description) {
          return NextResponse.json(
            { success: false, error: 'Brand name or description required' },
            { status: 400 }
          );
        }

        const result = await generateSocialAssets(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'generate-social-assets',
          ...result
        });
      }

      case 'resize-for-platforms': {
        if (!data.existing_design_url && !data.description) {
          return NextResponse.json(
            { success: false, error: 'Design required' },
            { status: 400 }
          );
        }

        const result = await resizeForPlatforms(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'resize-for-platforms',
          ...result
        });
      }

      case 'save-brand-asset': {
        const { name, asset_type, content, metadata } = data as Record<string, unknown>;

        if (!name || !asset_type || !content) {
          return NextResponse.json(
            { success: false, error: 'Name, asset type, and content required' },
            { status: 400 }
          );
        }

        const { data: asset, error } = await supabase
          .from('ai_brand_assets')
          .insert({
            user_id: user.id,
            name,
            asset_type,
            content,
            metadata: metadata || {}
          })
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({
          success: true,
          action: 'save-brand-asset',
          asset,
          message: 'Brand asset saved successfully'
        }, { status: 201 });
      }

      case 'save-palette': {
        const { name, colors, mood, industry } = data as Record<string, unknown>;

        if (!name || !colors || !Array.isArray(colors)) {
          return NextResponse.json(
            { success: false, error: 'Name and colors array required' },
            { status: 400 }
          );
        }

        const { data: palette, error } = await supabase
          .from('ai_color_palettes')
          .insert({
            user_id: user.id,
            name,
            colors,
            mood,
            industry
          })
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({
          success: true,
          action: 'save-palette',
          palette,
          message: 'Color palette saved successfully'
        }, { status: 201 });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('AI Design Tools POST error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Design operation failed' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - Delete design or asset
// =====================================================
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const designId = searchParams.get('designId');
    const assetId = searchParams.get('assetId');
    const paletteId = searchParams.get('paletteId');

    if (designId) {
      const { error } = await supabase
        .from('ai_design_generations')
        .delete()
        .eq('id', designId)
        .eq('user_id', user.id);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Design deleted successfully'
      });
    }

    if (assetId) {
      const { error } = await supabase
        .from('ai_brand_assets')
        .delete()
        .eq('id', assetId)
        .eq('user_id', user.id);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Brand asset deleted successfully'
      });
    }

    if (paletteId) {
      const { error } = await supabase
        .from('ai_color_palettes')
        .delete()
        .eq('id', paletteId)
        .eq('user_id', user.id);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Color palette deleted successfully'
      });
    }

    return NextResponse.json(
      { success: false, error: 'ID required for deletion' },
      { status: 400 }
    );
  } catch (error) {
    logger.error('AI Design Tools DELETE error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete' },
      { status: 500 }
    );
  }
}

// =====================================================
// Design Generation Functions
// =====================================================

async function generateDesignConcept(
  userId: string,
  data: Partial<DesignRequest>,
  supabase: any
): Promise<{
  concepts: Array<{
    name: string;
    description: string;
    visual_elements: string[];
    color_suggestions: string[];
    typography_suggestions: string[];
    mood_board_keywords: string[];
  }>;
  design_prompt: string;
  recommendations: string[];
}> {
  const systemPrompt = `You are a world-class graphic designer with expertise in ${data.design_type} design.
Create detailed design concepts that are professional, creative, and aligned with industry best practices.

Consider:
- Target audience appeal
- Brand personality
- Visual hierarchy
- Current design trends
- Cultural relevance`;

  const userPrompt = `Create 3 distinct design concepts for a ${data.design_type}.

Description: ${data.description}
${data.brand_name ? `Brand: ${data.brand_name}` : ''}
${data.industry ? `Industry: ${data.industry}` : ''}
${data.style ? `Style preference: ${data.style}` : ''}
${data.target_audience ? `Target audience: ${data.target_audience}` : ''}
${data.mood?.length ? `Mood/Feel: ${data.mood.join(', ')}` : ''}
${data.color_scheme ? `Color scheme: ${data.color_scheme}` : ''}

Return as JSON:
{
  "concepts": [
    {
      "name": "Concept name",
      "description": "Detailed description of the design concept",
      "visual_elements": ["element 1", "element 2"],
      "color_suggestions": ["#hex1", "#hex2", "#hex3"],
      "typography_suggestions": ["Font 1 for headings", "Font 2 for body"],
      "mood_board_keywords": ["keyword1", "keyword2"]
    }
  ],
  "design_prompt": "Optimized prompt for image generation",
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`;

  const response = await callAI(systemPrompt, userPrompt);

  let result;
  try {
    result = JSON.parse(response.content);
  } catch {
    result = {
      concepts: [{
        name: 'Primary Concept',
        description: response.content,
        visual_elements: ['Clean layout', 'Bold typography', 'Strategic whitespace'],
        color_suggestions: ['#2563EB', '#1E40AF', '#DBEAFE'],
        typography_suggestions: ['Inter for headings', 'System UI for body'],
        mood_board_keywords: ['modern', 'professional', 'clean']
      }],
      design_prompt: data.description || '',
      recommendations: ['Consider multiple color variations', 'Test across different sizes']
    };
  }

  // Save to database
  await supabase
    .from('ai_design_generations')
    .insert({
      user_id: userId,
      design_type: data.design_type,
      style: data.style || 'modern',
      description: data.description,
      concepts: result.concepts,
      design_prompt: result.design_prompt,
      metadata: {
        brand_name: data.brand_name,
        industry: data.industry,
        target_audience: data.target_audience
      }
    });

  return result;
}

async function generateLogoConcepts(
  userId: string,
  data: Partial<DesignRequest>,
  supabase: any
): Promise<{
  logo_concepts: Array<{
    name: string;
    type: string;
    description: string;
    visual_elements: string[];
    symbolism: string;
    color_palette: string[];
    font_suggestions: string[];
    use_cases: string[];
    image_prompt: string;
  }>;
  brand_personality: string[];
  recommendations: string[];
}> {
  const systemPrompt = `You are an expert logo designer with 20+ years of experience creating iconic brand identities.
Create logo concepts that are:
- Memorable and distinctive
- Scalable (works at all sizes)
- Versatile (works in color and B&W)
- Timeless (avoids fleeting trends)
- Appropriate for the industry`;

  const userPrompt = `Create 4 distinct logo concepts for: ${data.brand_name}

${data.industry ? `Industry: ${data.industry}` : ''}
${data.description ? `Brand description: ${data.description}` : ''}
${data.target_audience ? `Target audience: ${data.target_audience}` : ''}
${data.style ? `Style preference: ${data.style}` : ''}
${data.mood?.length ? `Brand personality: ${data.mood.join(', ')}` : ''}

Create one of each type:
1. Wordmark (typography-based)
2. Lettermark (initials)
3. Symbol/Icon
4. Combination mark (symbol + text)

Return as JSON:
{
  "logo_concepts": [
    {
      "name": "Concept name",
      "type": "wordmark|lettermark|symbol|combination",
      "description": "Detailed description",
      "visual_elements": ["element 1", "element 2"],
      "symbolism": "What the design represents",
      "color_palette": ["#primary", "#secondary", "#accent"],
      "font_suggestions": ["Primary font", "Secondary font"],
      "use_cases": ["Business cards", "Website", "Signage"],
      "image_prompt": "Detailed prompt for AI image generation"
    }
  ],
  "brand_personality": ["trait1", "trait2"],
  "recommendations": ["recommendation 1", "recommendation 2"]
}`;

  const response = await callAI(systemPrompt, userPrompt);

  let result;
  try {
    result = JSON.parse(response.content);
  } catch {
    result = {
      logo_concepts: [
        {
          name: `${data.brand_name} Wordmark`,
          type: 'wordmark',
          description: `Clean, modern typography treatment of "${data.brand_name}"`,
          visual_elements: ['Custom letterforms', 'Strategic spacing', 'Balanced proportions'],
          symbolism: 'Professionalism and clarity',
          color_palette: ['#1E3A8A', '#3B82F6', '#DBEAFE'],
          font_suggestions: ['Montserrat Bold', 'Inter Regular'],
          use_cases: ['Website header', 'Business cards', 'Email signature'],
          image_prompt: `Minimalist wordmark logo for "${data.brand_name}", clean typography, professional, vector style`
        }
      ],
      brand_personality: ['Professional', 'Modern', 'Trustworthy'],
      recommendations: ['Test logo at various sizes', 'Create monochrome version', 'Develop usage guidelines']
    };
  }

  // Save to database
  await supabase
    .from('ai_design_generations')
    .insert({
      user_id: userId,
      design_type: 'logo',
      style: data.style || 'modern',
      description: `Logo concepts for ${data.brand_name}`,
      concepts: result.logo_concepts,
      metadata: {
        brand_name: data.brand_name,
        industry: data.industry,
        brand_personality: result.brand_personality
      }
    });

  return result;
}

async function generateColorPalette(
  userId: string,
  data: Partial<DesignRequest>,
  supabase: any
): Promise<{
  palette: {
    primary: { hex: string; name: string; usage: string };
    secondary: { hex: string; name: string; usage: string };
    accent: { hex: string; name: string; usage: string };
    neutral: { hex: string; name: string; usage: string };
    background: { hex: string; name: string; usage: string };
  };
  variations: Array<{
    name: string;
    colors: string[];
    mood: string;
  }>;
  color_theory: string;
  accessibility: {
    contrast_ratios: Record<string, number>;
    wcag_compliance: string;
  };
  psychology: Record<string, string>;
}> {
  const systemPrompt = `You are a color theory expert and brand designer. Create harmonious, purposeful color palettes that evoke the right emotions and ensure accessibility.`;

  const userPrompt = `Generate a comprehensive color palette.

${data.brand_name ? `Brand: ${data.brand_name}` : ''}
${data.industry ? `Industry: ${data.industry}` : ''}
${data.mood?.length ? `Mood/Feel: ${data.mood.join(', ')}` : ''}
${data.color_scheme ? `Color scheme preference: ${data.color_scheme}` : ''}
${data.primary_color ? `Starting color: ${data.primary_color}` : ''}
${data.target_audience ? `Target audience: ${data.target_audience}` : ''}

Return as JSON:
{
  "palette": {
    "primary": { "hex": "#XXXXXX", "name": "Color Name", "usage": "Primary buttons, headers" },
    "secondary": { "hex": "#XXXXXX", "name": "Color Name", "usage": "Secondary elements" },
    "accent": { "hex": "#XXXXXX", "name": "Color Name", "usage": "CTAs, highlights" },
    "neutral": { "hex": "#XXXXXX", "name": "Color Name", "usage": "Text, borders" },
    "background": { "hex": "#XXXXXX", "name": "Color Name", "usage": "Backgrounds" }
  },
  "variations": [
    { "name": "Dark Mode", "colors": ["#hex1", "#hex2"], "mood": "Sophisticated" },
    { "name": "Light Mode", "colors": ["#hex1", "#hex2"], "mood": "Clean" }
  ],
  "color_theory": "Explanation of the color relationships",
  "accessibility": {
    "contrast_ratios": { "text_on_background": 4.5 },
    "wcag_compliance": "AA"
  },
  "psychology": {
    "primary_emotion": "Trust",
    "secondary_emotion": "Energy"
  }
}`;

  const response = await callAI(systemPrompt, userPrompt);

  let result;
  try {
    result = JSON.parse(response.content);
  } catch {
    // Generate default palette based on industry
    const industryPalettes: Record<string, any> = {
      technology: {
        primary: { hex: '#2563EB', name: 'Electric Blue', usage: 'Primary buttons, headers' },
        secondary: { hex: '#7C3AED', name: 'Vivid Purple', usage: 'Secondary elements' },
        accent: { hex: '#06B6D4', name: 'Cyan', usage: 'CTAs, highlights' },
        neutral: { hex: '#374151', name: 'Cool Gray', usage: 'Text, borders' },
        background: { hex: '#F9FAFB', name: 'Off White', usage: 'Backgrounds' }
      },
      default: {
        primary: { hex: '#1E40AF', name: 'Deep Blue', usage: 'Primary buttons, headers' },
        secondary: { hex: '#059669', name: 'Emerald', usage: 'Secondary elements' },
        accent: { hex: '#F59E0B', name: 'Amber', usage: 'CTAs, highlights' },
        neutral: { hex: '#4B5563', name: 'Gray', usage: 'Text, borders' },
        background: { hex: '#FFFFFF', name: 'White', usage: 'Backgrounds' }
      }
    };

    result = {
      palette: industryPalettes[data.industry || 'default'] || industryPalettes.default,
      variations: [
        { name: 'Dark Mode', colors: ['#1F2937', '#374151'], mood: 'Sophisticated' },
        { name: 'Muted', colors: ['#94A3B8', '#CBD5E1'], mood: 'Calm' }
      ],
      color_theory: 'Complementary color scheme with high contrast for accessibility',
      accessibility: { contrast_ratios: { text_on_background: 7.1 }, wcag_compliance: 'AAA' },
      psychology: { primary_emotion: 'Trust', secondary_emotion: 'Stability' }
    };
  }

  // Save palette to database
  const colors = [
    result.palette.primary.hex,
    result.palette.secondary.hex,
    result.palette.accent.hex,
    result.palette.neutral.hex,
    result.palette.background.hex
  ];

  await supabase
    .from('ai_color_palettes')
    .insert({
      user_id: userId,
      name: data.brand_name ? `${data.brand_name} Palette` : 'Generated Palette',
      colors,
      mood: data.mood?.join(', ') || 'Professional',
      industry: data.industry,
      metadata: {
        color_theory: result.color_theory,
        accessibility: result.accessibility,
        psychology: result.psychology
      }
    });

  return result;
}

async function analyzeDesign(
  userId: string,
  data: Partial<DesignRequest>,
  supabase: any
): Promise<{
  analysis: {
    overall_score: number;
    strengths: string[];
    weaknesses: string[];
    visual_hierarchy: { score: number; notes: string };
    color_usage: { score: number; notes: string };
    typography: { score: number; notes: string };
    balance: { score: number; notes: string };
    whitespace: { score: number; notes: string };
  };
  improvements: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    suggestion: string;
    implementation: string;
  }>;
  industry_comparison: string;
  trend_alignment: string[];
}> {
  const systemPrompt = `You are a senior design critic with expertise in visual communication, UX design, and brand strategy.
Provide thorough, constructive analysis with actionable feedback.`;

  const userPrompt = `Analyze this design and provide detailed feedback.

${data.existing_design_url ? `Design URL: ${data.existing_design_url}` : ''}
${data.description ? `Design description: ${data.description}` : ''}
${data.design_type ? `Design type: ${data.design_type}` : ''}
${data.industry ? `Industry: ${data.industry}` : ''}
${data.target_audience ? `Target audience: ${data.target_audience}` : ''}

Evaluate:
1. Visual hierarchy
2. Color usage and harmony
3. Typography choices
4. Balance and composition
5. Use of whitespace
6. Brand alignment
7. Accessibility

Return as JSON:
{
  "analysis": {
    "overall_score": 75,
    "strengths": ["strength 1", "strength 2"],
    "weaknesses": ["weakness 1", "weakness 2"],
    "visual_hierarchy": { "score": 80, "notes": "..." },
    "color_usage": { "score": 70, "notes": "..." },
    "typography": { "score": 75, "notes": "..." },
    "balance": { "score": 80, "notes": "..." },
    "whitespace": { "score": 70, "notes": "..." }
  },
  "improvements": [
    {
      "priority": "high",
      "category": "Typography",
      "suggestion": "...",
      "implementation": "..."
    }
  ],
  "industry_comparison": "How it compares to industry standards",
  "trend_alignment": ["trend 1", "trend 2"]
}`;

  const response = await callAI(systemPrompt, userPrompt);

  let result;
  try {
    result = JSON.parse(response.content);
  } catch {
    result = {
      analysis: {
        overall_score: 70,
        strengths: ['Clean layout', 'Good use of whitespace'],
        weaknesses: ['Could improve color contrast', 'Typography hierarchy needs work'],
        visual_hierarchy: { score: 70, notes: 'Consider making key elements more prominent' },
        color_usage: { score: 65, notes: 'Color palette is cohesive but lacks impact' },
        typography: { score: 70, notes: 'Font choices are appropriate but sizing needs refinement' },
        balance: { score: 75, notes: 'Generally well-balanced composition' },
        whitespace: { score: 80, notes: 'Good breathing room between elements' }
      },
      improvements: [
        {
          priority: 'high' as const,
          category: 'Color',
          suggestion: 'Increase contrast for better readability',
          implementation: 'Darken text color or lighten background'
        }
      ],
      industry_comparison: 'Meets basic industry standards with room for improvement',
      trend_alignment: ['Minimalism', 'Clean typography']
    };
  }

  // Save analysis
  await supabase
    .from('ai_design_generations')
    .insert({
      user_id: userId,
      design_type: data.design_type || 'analysis',
      description: 'Design analysis',
      concepts: [result.analysis],
      metadata: {
        improvements: result.improvements,
        industry_comparison: result.industry_comparison,
        trend_alignment: result.trend_alignment
      }
    });

  return result;
}

async function generateDesignVariations(
  userId: string,
  data: Partial<DesignRequest>,
  supabase: any
): Promise<{
  variations: Array<{
    name: string;
    description: string;
    changes: string[];
    mood: string;
    best_for: string;
    image_prompt: string;
  }>;
  recommendations: string[];
}> {
  const systemPrompt = `You are a creative director who excels at exploring design possibilities.
Generate diverse variations that maintain brand consistency while exploring different creative directions.`;

  const userPrompt = `Create 5 distinct variations of this design.

${data.description ? `Original design: ${data.description}` : ''}
${data.existing_design_url ? `Design URL: ${data.existing_design_url}` : ''}
${data.design_type ? `Design type: ${data.design_type}` : ''}
${data.style ? `Current style: ${data.style}` : ''}

Create variations exploring:
1. Different color schemes
2. Alternative layouts
3. Typography variations
4. Style shifts (minimal, bold, elegant)
5. Mood variations

Return as JSON:
{
  "variations": [
    {
      "name": "Variation name",
      "description": "What makes this variation unique",
      "changes": ["change 1", "change 2"],
      "mood": "The emotional feel",
      "best_for": "When to use this variation",
      "image_prompt": "Detailed prompt for generating this variation"
    }
  ],
  "recommendations": ["Which variation to test first", "A/B testing suggestions"]
}`;

  const response = await callAI(systemPrompt, userPrompt);

  let result;
  try {
    result = JSON.parse(response.content);
  } catch {
    result = {
      variations: [
        {
          name: 'Minimalist',
          description: 'Stripped-down version focusing on essential elements',
          changes: ['Reduced color palette', 'Increased whitespace', 'Simplified typography'],
          mood: 'Clean and sophisticated',
          best_for: 'Luxury brands, tech companies',
          image_prompt: 'Minimalist design variation, clean lines, ample whitespace'
        },
        {
          name: 'Bold',
          description: 'High-impact version with strong visual elements',
          changes: ['Vibrant colors', 'Large typography', 'Dynamic composition'],
          mood: 'Energetic and confident',
          best_for: 'Startups, youth brands',
          image_prompt: 'Bold design variation, vibrant colors, impactful typography'
        }
      ],
      recommendations: ['Test minimalist version first for professional audiences', 'Consider A/B testing color variations']
    };
  }

  return result;
}

async function suggestImprovements(
  userId: string,
  data: Partial<DesignRequest>,
  supabase: any
): Promise<{
  improvements: Array<{
    area: string;
    current_state: string;
    suggested_change: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
    implementation_steps: string[];
  }>;
  quick_wins: string[];
  long_term: string[];
  resources: string[];
}> {
  const systemPrompt = `You are a design consultant who provides practical, actionable improvement suggestions.
Focus on changes that will have the biggest impact on design effectiveness.`;

  const userPrompt = `Suggest specific improvements for this design.

${data.description ? `Design: ${data.description}` : ''}
${data.existing_design_url ? `URL: ${data.existing_design_url}` : ''}
${data.design_type ? `Type: ${data.design_type}` : ''}
${data.target_audience ? `Target audience: ${data.target_audience}` : ''}
${data.constraints?.length ? `Constraints: ${data.constraints.join(', ')}` : ''}

Provide improvements categorized by:
1. Visual design
2. Typography
3. Color
4. Layout
5. User experience

Return as JSON:
{
  "improvements": [
    {
      "area": "Typography",
      "current_state": "Current observation",
      "suggested_change": "What to change",
      "impact": "high",
      "effort": "low",
      "implementation_steps": ["Step 1", "Step 2"]
    }
  ],
  "quick_wins": ["Easy improvement 1", "Easy improvement 2"],
  "long_term": ["Strategic change 1", "Strategic change 2"],
  "resources": ["Tool or resource 1", "Tool or resource 2"]
}`;

  const response = await callAI(systemPrompt, userPrompt);

  let result;
  try {
    result = JSON.parse(response.content);
  } catch {
    result = {
      improvements: [
        {
          area: 'Typography',
          current_state: 'Generic font choices',
          suggested_change: 'Use brand-appropriate typefaces',
          impact: 'high' as const,
          effort: 'low' as const,
          implementation_steps: ['Research brand-aligned fonts', 'Test readability', 'Apply consistently']
        }
      ],
      quick_wins: ['Increase font size for better readability', 'Add more whitespace'],
      long_term: ['Develop comprehensive brand guidelines', 'Create design system'],
      resources: ['Google Fonts', 'Coolors.co', 'Figma']
    };
  }

  return result;
}

async function generateBrandGuidelines(
  userId: string,
  data: Partial<DesignRequest>,
  supabase: any
): Promise<{
  guidelines: {
    brand_overview: {
      mission: string;
      vision: string;
      values: string[];
      personality: string[];
      voice: string;
    };
    visual_identity: {
      logo_usage: {
        clear_space: string;
        minimum_size: string;
        dos: string[];
        donts: string[];
      };
      color_palette: {
        primary: { hex: string; cmyk: string; pantone: string; usage: string };
        secondary: { hex: string; cmyk: string; pantone: string; usage: string };
        accent: { hex: string; cmyk: string; pantone: string; usage: string };
      };
      typography: {
        primary_font: string;
        secondary_font: string;
        heading_sizes: Record<string, string>;
        body_sizes: Record<string, string>;
      };
      imagery: {
        style: string;
        mood: string[];
        subjects: string[];
        filters: string;
      };
    };
    applications: {
      business_cards: string;
      letterhead: string;
      social_media: string;
      website: string;
    };
  };
  implementation_checklist: string[];
}> {
  const systemPrompt = `You are a brand strategist creating comprehensive brand guidelines.
Create professional, detailed guidelines that ensure brand consistency across all touchpoints.`;

  const userPrompt = `Create comprehensive brand guidelines for: ${data.brand_name}

${data.industry ? `Industry: ${data.industry}` : ''}
${data.description ? `Brand description: ${data.description}` : ''}
${data.target_audience ? `Target audience: ${data.target_audience}` : ''}
${data.mood?.length ? `Brand personality: ${data.mood.join(', ')}` : ''}
${data.style ? `Visual style: ${data.style}` : ''}

Create complete brand guidelines including:
1. Brand overview (mission, vision, values)
2. Visual identity (logo, colors, typography, imagery)
3. Applications (business cards, letterhead, social, web)

Return as comprehensive JSON structure.`;

  const response = await callAI(systemPrompt, userPrompt);

  let result;
  try {
    result = JSON.parse(response.content);
  } catch {
    result = {
      guidelines: {
        brand_overview: {
          mission: `To empower ${data.target_audience || 'our customers'} with exceptional ${data.industry || 'solutions'}`,
          vision: `To be the leading ${data.industry || 'company'} known for innovation and excellence`,
          values: ['Innovation', 'Quality', 'Integrity', 'Customer Focus'],
          personality: data.mood || ['Professional', 'Approachable', 'Innovative'],
          voice: 'Confident yet approachable, expert yet accessible'
        },
        visual_identity: {
          logo_usage: {
            clear_space: 'Minimum clear space equal to logo height on all sides',
            minimum_size: '24px height for digital, 12mm for print',
            dos: ['Use on approved backgrounds', 'Maintain aspect ratio', 'Use official color versions'],
            donts: ['Stretch or distort', 'Add effects', 'Place on busy backgrounds', 'Change colors']
          },
          color_palette: {
            primary: { hex: '#1E40AF', cmyk: '87, 73, 0, 31', pantone: '287 C', usage: 'Primary brand color' },
            secondary: { hex: '#059669', cmyk: '87, 0, 58, 41', pantone: '340 C', usage: 'Accents and CTAs' },
            accent: { hex: '#F59E0B', cmyk: '0, 40, 96, 4', pantone: '137 C', usage: 'Highlights' }
          },
          typography: {
            primary_font: 'Inter',
            secondary_font: 'Georgia',
            heading_sizes: { h1: '48px', h2: '36px', h3: '24px', h4: '18px' },
            body_sizes: { large: '18px', regular: '16px', small: '14px', caption: '12px' }
          },
          imagery: {
            style: 'Clean, professional photography with natural lighting',
            mood: ['Authentic', 'Aspirational', 'Diverse'],
            subjects: ['People in action', 'Product in use', 'Abstract textures'],
            filters: 'Subtle warmth, high contrast, desaturated blacks'
          }
        },
        applications: {
          business_cards: '3.5" x 2", logo front center, contact back left-aligned',
          letterhead: 'Logo top-left, 1" margins, footer with contact info',
          social_media: 'Profile: logo on brand color, Cover: brand imagery with tagline',
          website: 'Logo top-left, primary color for CTAs, ample whitespace'
        }
      },
      implementation_checklist: [
        'Update all logo files to new specifications',
        'Create color swatch files (ASE, CLR)',
        'Install brand fonts on team computers',
        'Update website to new guidelines',
        'Redesign business cards and stationery',
        'Create social media templates',
        'Brief team on new brand guidelines'
      ]
    };
  }

  // Save brand guidelines
  await supabase
    .from('ai_brand_assets')
    .insert({
      user_id: userId,
      name: `${data.brand_name} Brand Guidelines`,
      asset_type: 'guidelines',
      content: result.guidelines,
      metadata: {
        implementation_checklist: result.implementation_checklist,
        created_for: data.brand_name
      }
    });

  return result;
}

function checkAccessibility(data: Partial<DesignRequest>): {
  contrast_results: Array<{
    combination: string;
    ratio: number;
    wcag_aa: boolean;
    wcag_aaa: boolean;
    recommendation: string;
  }>;
  overall_score: number;
  issues: string[];
  recommendations: string[];
} {
  // Calculate contrast ratio between colors
  const hexToLuminance = (hex: string): number => {
    const rgb = parseInt(hex.replace('#', ''), 16);
    const r = ((rgb >> 16) & 255) / 255;
    const g = ((rgb >> 8) & 255) / 255;
    const b = (rgb & 255) / 255;

    const [rLinear, gLinear, bLinear] = [r, g, b].map(c =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );

    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  };

  const getContrastRatio = (color1: string, color2: string): number => {
    const l1 = hexToLuminance(color1);
    const l2 = hexToLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  const primaryColor = data.primary_color || '#1E40AF';
  const backgroundColor = '#FFFFFF';
  const textColor = '#1F2937';

  const results: Array<{
    combination: string;
    ratio: number;
    wcag_aa: boolean;
    wcag_aaa: boolean;
    recommendation: string;
  }> = [];

  // Test primary on white
  const primaryOnWhite = getContrastRatio(primaryColor, backgroundColor);
  results.push({
    combination: `${primaryColor} on ${backgroundColor}`,
    ratio: Math.round(primaryOnWhite * 100) / 100,
    wcag_aa: primaryOnWhite >= 4.5,
    wcag_aaa: primaryOnWhite >= 7,
    recommendation: primaryOnWhite < 4.5 ? 'Darken the primary color for better contrast' : 'Passes accessibility standards'
  });

  // Test text on white
  const textOnWhite = getContrastRatio(textColor, backgroundColor);
  results.push({
    combination: `${textColor} on ${backgroundColor}`,
    ratio: Math.round(textOnWhite * 100) / 100,
    wcag_aa: textOnWhite >= 4.5,
    wcag_aaa: textOnWhite >= 7,
    recommendation: textOnWhite < 4.5 ? 'Darken the text color' : 'Excellent readability'
  });

  // Test white on primary
  const whiteOnPrimary = getContrastRatio('#FFFFFF', primaryColor);
  results.push({
    combination: `#FFFFFF on ${primaryColor}`,
    ratio: Math.round(whiteOnPrimary * 100) / 100,
    wcag_aa: whiteOnPrimary >= 4.5,
    wcag_aaa: whiteOnPrimary >= 7,
    recommendation: whiteOnPrimary < 4.5 ? 'Darken the primary color for white text' : 'Good for buttons and badges'
  });

  const passCount = results.filter(r => r.wcag_aa).length;
  const overallScore = Math.round((passCount / results.length) * 100);

  const issues = results.filter(r => !r.wcag_aa).map(r => `${r.combination}: ratio ${r.ratio} (needs 4.5+)`);
  const recommendations = results.filter(r => !r.wcag_aaa).map(r => r.recommendation);

  return {
    contrast_results: results,
    overall_score: overallScore,
    issues,
    recommendations: [...new Set(recommendations)]
  };
}

async function generateSocialAssets(
  userId: string,
  data: Partial<DesignRequest>,
  supabase: any
): Promise<{
  assets: Array<{
    platform: string;
    dimensions: string;
    description: string;
    text_content: string[];
    image_prompt: string;
  }>;
  brand_consistency_tips: string[];
  posting_schedule: Record<string, string>;
}> {
  const systemPrompt = `You are a social media design expert. Create asset specifications optimized for each platform's requirements and best practices.`;

  const userPrompt = `Create social media asset specifications for: ${data.brand_name || 'the brand'}

${data.description ? `Brand description: ${data.description}` : ''}
${data.industry ? `Industry: ${data.industry}` : ''}
${data.text_content?.length ? `Key messages: ${data.text_content.join(', ')}` : ''}
${data.style ? `Visual style: ${data.style}` : ''}

Create assets for:
1. Instagram (feed post, story, reel cover)
2. LinkedIn (post, banner)
3. Twitter/X (post, header)
4. Facebook (post, cover)
5. YouTube (thumbnail, banner)

Return as JSON with detailed specifications for each.`;

  const response = await callAI(systemPrompt, userPrompt);

  let result;
  try {
    result = JSON.parse(response.content);
  } catch {
    result = {
      assets: [
        { platform: 'Instagram Feed', dimensions: '1080x1080', description: 'Square post', text_content: ['Brand message', 'CTA'], image_prompt: 'Instagram square post design' },
        { platform: 'Instagram Story', dimensions: '1080x1920', description: 'Vertical story', text_content: ['Hook', 'Swipe up CTA'], image_prompt: 'Instagram story design' },
        { platform: 'LinkedIn Post', dimensions: '1200x627', description: 'Professional post', text_content: ['Insight', 'Question'], image_prompt: 'LinkedIn professional post' },
        { platform: 'Twitter/X Post', dimensions: '1200x675', description: 'Twitter image', text_content: ['Concise message'], image_prompt: 'Twitter post design' },
        { platform: 'YouTube Thumbnail', dimensions: '1280x720', description: 'Click-worthy thumbnail', text_content: ['Video title', 'Key benefit'], image_prompt: 'YouTube thumbnail design' }
      ],
      brand_consistency_tips: [
        'Use consistent color palette across all platforms',
        'Maintain logo placement in same position',
        'Use approved fonts only',
        'Follow brand voice guidelines'
      ],
      posting_schedule: {
        Instagram: 'Best times: 11am-1pm, 7pm-9pm',
        LinkedIn: 'Best times: 7am-8am, 5pm-6pm',
        Twitter: 'Best times: 8am-10am, 12pm-1pm'
      }
    };
  }

  return result;
}

async function resizeForPlatforms(
  userId: string,
  data: Partial<DesignRequest>,
  supabase: any
): Promise<{
  resized_versions: Array<{
    platform: string;
    format: string;
    dimensions: { width: number; height: number };
    aspect_ratio: string;
    crop_suggestion: string;
    file_size_recommendation: string;
  }>;
  optimization_tips: string[];
}> {
  const platformSizes = [
    { platform: 'Instagram Feed', format: 'Square', dimensions: { width: 1080, height: 1080 }, aspect_ratio: '1:1', crop_suggestion: 'Center-weighted', file_size_recommendation: 'Under 8MB' },
    { platform: 'Instagram Story', format: 'Vertical', dimensions: { width: 1080, height: 1920 }, aspect_ratio: '9:16', crop_suggestion: 'Expand vertically with brand elements', file_size_recommendation: 'Under 8MB' },
    { platform: 'LinkedIn Post', format: 'Landscape', dimensions: { width: 1200, height: 627 }, aspect_ratio: '1.91:1', crop_suggestion: 'Horizontal crop, keep text visible', file_size_recommendation: 'Under 5MB' },
    { platform: 'Twitter Post', format: 'Landscape', dimensions: { width: 1200, height: 675 }, aspect_ratio: '16:9', crop_suggestion: 'Similar to LinkedIn', file_size_recommendation: 'Under 5MB' },
    { platform: 'Facebook Post', format: 'Landscape', dimensions: { width: 1200, height: 630 }, aspect_ratio: '1.91:1', crop_suggestion: 'Center focus', file_size_recommendation: 'Under 8MB' },
    { platform: 'YouTube Thumbnail', format: 'Landscape', dimensions: { width: 1280, height: 720 }, aspect_ratio: '16:9', crop_suggestion: 'Right-third rule for face', file_size_recommendation: 'Under 2MB' },
    { platform: 'Pinterest Pin', format: 'Vertical', dimensions: { width: 1000, height: 1500 }, aspect_ratio: '2:3', crop_suggestion: 'Vertical composition', file_size_recommendation: 'Under 20MB' }
  ];

  return {
    resized_versions: platformSizes,
    optimization_tips: [
      'Export at 2x resolution for retina displays',
      'Use PNG for graphics with transparency',
      'Use JPEG for photographs (quality 80-85%)',
      'Compress images before uploading',
      'Test how images appear in feed before posting'
    ]
  };
}

// =====================================================
// Helper Functions
// =====================================================

async function callAI(
  systemPrompt: string,
  userPrompt: string
): Promise<{ content: string; usage?: { total_tokens: number } }> {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  const endpoint = process.env.OPENROUTER_API_KEY
    ? 'https://openrouter.ai/api/v1/chat/completions'
    : 'https://api.openai.com/v1/chat/completions';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      ...(process.env.OPENROUTER_API_KEY && {
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9323',
        'X-Title': 'KAZI AI Design Tools'
      })
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_API_KEY ? 'anthropic/claude-3.5-sonnet' : 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI API error: ${error}`);
  }

  const data = await response.json();

  return {
    content: data.choices[0]?.message?.content || '',
    usage: { total_tokens: data.usage?.total_tokens || 0 }
  };
}

function getDesignTypes(): Array<{ id: DesignType; name: string; description: string }> {
  return [
    { id: 'logo', name: 'Logo', description: 'Brand logos and marks' },
    { id: 'brand_identity', name: 'Brand Identity', description: 'Complete brand systems' },
    { id: 'social_media_graphics', name: 'Social Media', description: 'Posts and stories' },
    { id: 'banner', name: 'Banner', description: 'Web and ad banners' },
    { id: 'infographic', name: 'Infographic', description: 'Data visualizations' },
    { id: 'presentation', name: 'Presentation', description: 'Slide decks' },
    { id: 'ui_mockup', name: 'UI Mockup', description: 'Interface designs' },
    { id: 'illustration', name: 'Illustration', description: 'Custom illustrations' },
    { id: 'icon_set', name: 'Icon Set', description: 'Custom icon collections' },
    { id: 'poster', name: 'Poster', description: 'Print and digital posters' },
    { id: 'flyer', name: 'Flyer', description: 'Promotional flyers' },
    { id: 'business_card', name: 'Business Card', description: 'Professional cards' },
    { id: 'thumbnail', name: 'Thumbnail', description: 'Video and content thumbnails' },
    { id: 'email_header', name: 'Email Header', description: 'Newsletter headers' },
    { id: 'ad_creative', name: 'Ad Creative', description: 'Advertising designs' },
    { id: 'packaging', name: 'Packaging', description: 'Product packaging' },
    { id: 'merchandise', name: 'Merchandise', description: 'Swag and merch designs' }
  ];
}

function getDesignStyles(): Array<{ id: DesignStyle; name: string; description: string }> {
  return [
    { id: 'minimalist', name: 'Minimalist', description: 'Clean, simple, less is more' },
    { id: 'modern', name: 'Modern', description: 'Contemporary and current' },
    { id: 'vintage', name: 'Vintage', description: 'Retro and nostalgic' },
    { id: 'playful', name: 'Playful', description: 'Fun and whimsical' },
    { id: 'corporate', name: 'Corporate', description: 'Professional business style' },
    { id: 'luxurious', name: 'Luxurious', description: 'Premium and elegant' },
    { id: 'bold', name: 'Bold', description: 'Strong and impactful' },
    { id: 'elegant', name: 'Elegant', description: 'Refined and sophisticated' },
    { id: 'futuristic', name: 'Futuristic', description: 'Tech-forward and innovative' },
    { id: 'hand_drawn', name: 'Hand Drawn', description: 'Organic and artistic' },
    { id: 'geometric', name: 'Geometric', description: 'Shape-based patterns' },
    { id: 'organic', name: 'Organic', description: 'Natural and flowing' },
    { id: 'abstract', name: 'Abstract', description: 'Non-representational' },
    { id: 'photorealistic', name: 'Photorealistic', description: 'Lifelike imagery' },
    { id: 'flat', name: 'Flat', description: '2D with minimal depth' }
  ];
}

function getColorSchemes(): Array<{ id: ColorScheme; name: string; description: string }> {
  return [
    { id: 'monochromatic', name: 'Monochromatic', description: 'Single color variations' },
    { id: 'complementary', name: 'Complementary', description: 'Opposite colors' },
    { id: 'analogous', name: 'Analogous', description: 'Adjacent colors' },
    { id: 'triadic', name: 'Triadic', description: 'Three evenly spaced colors' },
    { id: 'split_complementary', name: 'Split Complementary', description: 'Balanced contrast' },
    { id: 'warm', name: 'Warm', description: 'Reds, oranges, yellows' },
    { id: 'cool', name: 'Cool', description: 'Blues, greens, purples' },
    { id: 'neutral', name: 'Neutral', description: 'Grays and earth tones' },
    { id: 'vibrant', name: 'Vibrant', description: 'Bold, saturated colors' },
    { id: 'pastel', name: 'Pastel', description: 'Soft, muted colors' },
    { id: 'dark', name: 'Dark', description: 'Deep, moody tones' },
    { id: 'light', name: 'Light', description: 'Bright, airy palette' },
    { id: 'custom', name: 'Custom', description: 'Your own color selection' }
  ];
}

function getRecommendedPalettes(): any[] {
  return [
    {
      name: 'Professional Blue',
      colors: ['#1E40AF', '#3B82F6', '#93C5FD', '#1F2937', '#F9FAFB'],
      mood: 'Trust, Stability',
      industries: ['Technology', 'Finance', 'Healthcare']
    },
    {
      name: 'Creative Orange',
      colors: ['#EA580C', '#FB923C', '#FED7AA', '#292524', '#FAFAF9'],
      mood: 'Energy, Creativity',
      industries: ['Marketing', 'Entertainment', 'Food']
    },
    {
      name: 'Nature Green',
      colors: ['#059669', '#34D399', '#A7F3D0', '#1F2937', '#F0FDF4'],
      mood: 'Growth, Health',
      industries: ['Environment', 'Wellness', 'Agriculture']
    },
    {
      name: 'Luxury Purple',
      colors: ['#7C3AED', '#A78BFA', '#DDD6FE', '#1F2937', '#FAF5FF'],
      mood: 'Premium, Innovation',
      industries: ['Beauty', 'Fashion', 'Tech']
    }
  ];
}

function getDesignTemplates(category?: string): any[] {
  const templates = [
    { id: 'tpl-logo-minimal', name: 'Minimal Logo', category: 'logo', description: 'Clean, simple logo design' },
    { id: 'tpl-logo-emblem', name: 'Emblem Logo', category: 'logo', description: 'Badge-style logo design' },
    { id: 'tpl-social-quote', name: 'Quote Post', category: 'social', description: 'Inspirational quote design' },
    { id: 'tpl-social-promo', name: 'Promo Post', category: 'social', description: 'Product promotion design' },
    { id: 'tpl-banner-hero', name: 'Hero Banner', category: 'banner', description: 'Website hero section' },
    { id: 'tpl-banner-ad', name: 'Ad Banner', category: 'banner', description: 'Advertising banner' },
    { id: 'tpl-card-business', name: 'Business Card', category: 'print', description: 'Professional card design' },
    { id: 'tpl-flyer-event', name: 'Event Flyer', category: 'print', description: 'Event promotion flyer' }
  ];

  if (category) {
    return templates.filter(t => t.category === category);
  }
  return templates;
}

// =====================================================
// Demo Mode Handlers
// =====================================================

function handleDemoGet(action: string | null): NextResponse {
  switch (action) {
    case 'history':
      return NextResponse.json({
        success: true,
        designs: [
          {
            id: 'demo-design-1',
            design_type: 'logo',
            description: 'Modern tech company logo',
            created_at: new Date().toISOString()
          }
        ],
        total: 1,
        page: 1,
        limit: 20,
        message: 'Demo design history'
      });

    case 'design-types':
      return NextResponse.json({
        success: true,
        design_types: getDesignTypes(),
        styles: getDesignStyles(),
        color_schemes: getColorSchemes()
      });

    case 'color-palettes':
      return NextResponse.json({
        success: true,
        palettes: [],
        recommended: getRecommendedPalettes()
      });

    default:
      return NextResponse.json({
        success: true,
        service: 'AI Design Tools',
        version: '2.0.0',
        status: 'demo',
        message: 'Log in to access full design features'
      });
  }
}

function handleDemoPost(action: string, data: any): NextResponse {
  switch (action) {
    case 'generate-concept':
      return NextResponse.json({
        success: true,
        action: 'generate-concept',
        concepts: [{
          name: 'Demo Concept',
          description: 'This is a demo design concept. Log in to generate real AI-powered designs.',
          visual_elements: ['Clean typography', 'Balanced composition', 'Strategic color use'],
          color_suggestions: ['#2563EB', '#1E40AF', '#DBEAFE'],
          typography_suggestions: ['Inter', 'System UI'],
          mood_board_keywords: ['modern', 'professional', 'clean']
        }],
        design_prompt: 'Demo prompt for image generation',
        recommendations: ['Log in to access full features', 'Try different design types']
      });

    case 'generate-palette':
      return NextResponse.json({
        success: true,
        action: 'generate-palette',
        palette: {
          primary: { hex: '#2563EB', name: 'Brand Blue', usage: 'Primary elements' },
          secondary: { hex: '#059669', name: 'Success Green', usage: 'Secondary elements' },
          accent: { hex: '#F59E0B', name: 'Accent Amber', usage: 'Highlights' },
          neutral: { hex: '#4B5563', name: 'Cool Gray', usage: 'Text' },
          background: { hex: '#FFFFFF', name: 'White', usage: 'Backgrounds' }
        },
        message: 'Demo color palette'
      });

    default:
      return NextResponse.json({
        success: false,
        error: 'Log in to use AI design features'
      }, { status: 401 });
  }
}
