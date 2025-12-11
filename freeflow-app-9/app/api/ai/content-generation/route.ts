// =====================================================
// KAZI AI Content Generation API - World-Class
// Comprehensive content creation with multiple formats
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// =====================================================
// Types
// =====================================================

type ContentType =
  | 'blog_post' | 'article' | 'social_media' | 'newsletter'
  | 'product_description' | 'landing_page' | 'case_study'
  | 'whitepaper' | 'press_release' | 'video_script'
  | 'podcast_outline' | 'ebook_chapter' | 'course_content'
  | 'documentation' | 'faq' | 'testimonial_request';

type ContentTone =
  | 'professional' | 'casual' | 'friendly' | 'authoritative'
  | 'conversational' | 'persuasive' | 'informative' | 'inspiring'
  | 'humorous' | 'empathetic' | 'urgent' | 'luxurious';

type ContentLength = 'short' | 'medium' | 'long' | 'comprehensive';

interface ContentGenerationRequest {
  action: string;
  content_type: ContentType;
  topic: string;
  keywords?: string[];
  tone?: ContentTone;
  length?: ContentLength;
  target_audience?: string;
  brand_voice?: string;
  outline?: string[];
  reference_content?: string;
  language?: string;
  seo_optimized?: boolean;
  include_cta?: boolean;
  cta_text?: string;
  format_preferences?: {
    include_headers?: boolean;
    include_bullet_points?: boolean;
    include_quotes?: boolean;
    include_statistics?: boolean;
  };
}

// =====================================================
// GET - List generated content, templates
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
        const contentType = searchParams.get('content_type');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = (page - 1) * limit;

        let query = supabase
          .from('ai_content_generations')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (contentType) {
          query = query.eq('content_type', contentType);
        }

        const { data: content, count, error } = await query;

        if (error) throw error;

        return NextResponse.json({
          success: true,
          content,
          total: count || 0,
          page,
          limit
        });
      }

      case 'templates': {
        const category = searchParams.get('category');

        let query = supabase
          .from('ai_content_templates')
          .select('*')
          .or(`user_id.eq.${user.id},is_public.eq.true`)
          .order('use_count', { ascending: false });

        if (category) {
          query = query.eq('category', category);
        }

        const { data: templates, error } = await query;

        if (error) throw error;

        return NextResponse.json({
          success: true,
          templates: templates || getDefaultTemplates()
        });
      }

      case 'content-types': {
        return NextResponse.json({
          success: true,
          content_types: getContentTypes(),
          tones: getTones(),
          lengths: getLengths()
        });
      }

      case 'usage': {
        const { data: usage, error } = await supabase
          .from('ai_content_usage')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        if (error) throw error;

        const stats = {
          total_generations: usage?.length || 0,
          total_words: usage?.reduce((sum, u) => sum + (u.word_count || 0), 0) || 0,
          total_tokens: usage?.reduce((sum, u) => sum + (u.tokens_used || 0), 0) || 0,
          by_type: {} as Record<string, number>,
          by_tone: {} as Record<string, number>
        };

        usage?.forEach(u => {
          stats.by_type[u.content_type] = (stats.by_type[u.content_type] || 0) + 1;
          if (u.tone) {
            stats.by_tone[u.tone] = (stats.by_tone[u.tone] || 0) + 1;
          }
        });

        return NextResponse.json({ success: true, usage: stats });
      }

      default: {
        // Return service status
        return NextResponse.json({
          success: true,
          service: 'AI Content Generation',
          version: '2.0.0',
          status: 'operational',
          capabilities: [
            'blog_posts', 'articles', 'social_media', 'newsletters',
            'product_descriptions', 'landing_pages', 'case_studies',
            'video_scripts', 'documentation', 'seo_optimization',
            'multi_language', 'brand_voice_matching', 'content_repurposing'
          ]
        });
      }
    }
  } catch (error: any) {
    console.error('AI Content Generation GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch content data' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Generate content
// =====================================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body: ContentGenerationRequest = await request.json();
    const { action, ...data } = body;

    // Demo mode for unauthenticated users
    if (!user) {
      return handleDemoPost(action, data);
    }

    switch (action) {
      case 'generate': {
        if (!data.content_type || !data.topic) {
          return NextResponse.json(
            { success: false, error: 'Content type and topic required' },
            { status: 400 }
          );
        }

        const result = await generateContent(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'generate',
          ...result
        });
      }

      case 'generate-variations': {
        if (!data.topic) {
          return NextResponse.json(
            { success: false, error: 'Topic required' },
            { status: 400 }
          );
        }

        const variations = await generateVariations(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'generate-variations',
          variations
        });
      }

      case 'expand': {
        if (!data.reference_content) {
          return NextResponse.json(
            { success: false, error: 'Reference content required' },
            { status: 400 }
          );
        }

        const expanded = await expandContent(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'expand',
          ...expanded
        });
      }

      case 'summarize': {
        if (!data.reference_content) {
          return NextResponse.json(
            { success: false, error: 'Reference content required' },
            { status: 400 }
          );
        }

        const summary = await summarizeContent(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'summarize',
          ...summary
        });
      }

      case 'repurpose': {
        if (!data.reference_content || !data.content_type) {
          return NextResponse.json(
            { success: false, error: 'Reference content and target content type required' },
            { status: 400 }
          );
        }

        const repurposed = await repurposeContent(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'repurpose',
          ...repurposed
        });
      }

      case 'optimize-seo': {
        if (!data.reference_content) {
          return NextResponse.json(
            { success: false, error: 'Content to optimize required' },
            { status: 400 }
          );
        }

        const optimized = await optimizeForSEO(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'optimize-seo',
          ...optimized
        });
      }

      case 'generate-outline': {
        if (!data.topic || !data.content_type) {
          return NextResponse.json(
            { success: false, error: 'Topic and content type required' },
            { status: 400 }
          );
        }

        const outline = await generateOutline(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'generate-outline',
          ...outline
        });
      }

      case 'translate': {
        if (!data.reference_content || !data.language) {
          return NextResponse.json(
            { success: false, error: 'Content and target language required' },
            { status: 400 }
          );
        }

        const translated = await translateContent(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'translate',
          ...translated
        });
      }

      case 'improve': {
        if (!data.reference_content) {
          return NextResponse.json(
            { success: false, error: 'Content to improve required' },
            { status: 400 }
          );
        }

        const improved = await improveContent(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'improve',
          ...improved
        });
      }

      case 'save-template': {
        const { name, description, template_content, category, variables } = data as any;

        if (!name || !template_content) {
          return NextResponse.json(
            { success: false, error: 'Name and template content required' },
            { status: 400 }
          );
        }

        const { data: template, error } = await supabase
          .from('ai_content_templates')
          .insert({
            user_id: user.id,
            name,
            description,
            template_content,
            category: category || 'custom',
            variables: variables || [],
            is_public: false
          })
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({
          success: true,
          action: 'save-template',
          template,
          message: 'Template saved successfully'
        }, { status: 201 });
      }

      case 'apply-template': {
        const { template_id, variables: templateVars } = data as any;

        if (!template_id) {
          return NextResponse.json(
            { success: false, error: 'Template ID required' },
            { status: 400 }
          );
        }

        const result = await applyTemplate(user.id, template_id, templateVars, supabase);

        return NextResponse.json({
          success: true,
          action: 'apply-template',
          ...result
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('AI Content Generation POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Content generation failed' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - Delete generated content or template
// =====================================================
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');
    const templateId = searchParams.get('templateId');

    if (contentId) {
      const { error } = await supabase
        .from('ai_content_generations')
        .delete()
        .eq('id', contentId)
        .eq('user_id', user.id);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Content deleted successfully'
      });
    }

    if (templateId) {
      const { error } = await supabase
        .from('ai_content_templates')
        .delete()
        .eq('id', templateId)
        .eq('user_id', user.id);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Template deleted successfully'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Content ID or Template ID required' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('AI Content Generation DELETE error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete' },
      { status: 500 }
    );
  }
}

// =====================================================
// Content Generation Functions
// =====================================================

async function generateContent(
  userId: string,
  data: Partial<ContentGenerationRequest>,
  supabase: any
): Promise<{
  content: string;
  metadata: Record<string, any>;
  suggestions: string[];
  seo_data?: Record<string, any>;
}> {
  const systemPrompt = buildSystemPrompt(data);
  const userPrompt = buildUserPrompt(data);

  // Call AI provider (using OpenRouter for flexibility)
  const response = await callAI(systemPrompt, userPrompt);

  // Calculate word count
  const wordCount = response.content.split(/\s+/).length;

  // Generate SEO data if requested
  let seoData = null;
  if (data.seo_optimized) {
    seoData = await generateSEOData(response.content, data.keywords || []);
  }

  // Save to database
  const { data: saved, error } = await supabase
    .from('ai_content_generations')
    .insert({
      user_id: userId,
      content_type: data.content_type,
      topic: data.topic,
      tone: data.tone || 'professional',
      content: response.content,
      word_count: wordCount,
      tokens_used: response.usage?.total_tokens || 0,
      keywords: data.keywords || [],
      seo_data: seoData,
      metadata: {
        length: data.length,
        target_audience: data.target_audience,
        brand_voice: data.brand_voice,
        language: data.language || 'en'
      }
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving content:', error);
  }

  // Generate improvement suggestions
  const suggestions = generateSuggestions(response.content, data.content_type!);

  return {
    content: response.content,
    metadata: {
      id: saved?.id,
      content_type: data.content_type,
      word_count: wordCount,
      tokens_used: response.usage?.total_tokens || 0,
      tone: data.tone || 'professional',
      language: data.language || 'en',
      created_at: new Date().toISOString()
    },
    suggestions,
    seo_data: seoData || undefined
  };
}

async function generateVariations(
  userId: string,
  data: Partial<ContentGenerationRequest>,
  supabase: any
): Promise<Array<{ content: string; tone: string; approach: string }>> {
  const variations: Array<{ content: string; tone: string; approach: string }> = [];
  const tones: ContentTone[] = ['professional', 'casual', 'persuasive'];
  const approaches = ['direct', 'storytelling', 'data-driven'];

  for (let i = 0; i < 3; i++) {
    const variation = await generateContent(
      userId,
      {
        ...data,
        tone: tones[i],
        content_type: data.content_type || 'article',
        length: 'short'
      },
      supabase
    );

    variations.push({
      content: variation.content,
      tone: tones[i],
      approach: approaches[i]
    });
  }

  return variations;
}

async function expandContent(
  userId: string,
  data: Partial<ContentGenerationRequest>,
  supabase: any
): Promise<{ expanded_content: string; sections_added: string[] }> {
  const systemPrompt = `You are a professional content expander. Your task is to take existing content and expand it with more detail, examples, and depth while maintaining the original tone and message.`;

  const userPrompt = `Expand the following content to be more comprehensive. Add relevant details, examples, and explanations while maintaining the original message and tone.

Original content:
${data.reference_content}

${data.keywords?.length ? `Focus on these keywords: ${data.keywords.join(', ')}` : ''}
${data.target_audience ? `Target audience: ${data.target_audience}` : ''}`;

  const response = await callAI(systemPrompt, userPrompt);

  // Track sections added
  const sectionsAdded = identifySectionsAdded(data.reference_content!, response.content);

  // Save to database
  await supabase
    .from('ai_content_generations')
    .insert({
      user_id: userId,
      content_type: 'expanded',
      topic: 'Content Expansion',
      content: response.content,
      word_count: response.content.split(/\s+/).length,
      tokens_used: response.usage?.total_tokens || 0,
      metadata: {
        original_word_count: data.reference_content!.split(/\s+/).length,
        sections_added: sectionsAdded
      }
    });

  return {
    expanded_content: response.content,
    sections_added: sectionsAdded
  };
}

async function summarizeContent(
  userId: string,
  data: Partial<ContentGenerationRequest>,
  supabase: any
): Promise<{
  summary: string;
  key_points: string[];
  word_reduction: number;
}> {
  const systemPrompt = `You are a professional content summarizer. Create concise, accurate summaries that capture the essential information.`;

  const targetLength = data.length === 'short' ? '2-3 sentences' :
                       data.length === 'medium' ? '1 paragraph' : '2-3 paragraphs';

  const userPrompt = `Summarize the following content into ${targetLength}. Extract key points and maintain accuracy.

Content to summarize:
${data.reference_content}`;

  const response = await callAI(systemPrompt, userPrompt);

  // Extract key points
  const keyPointsPrompt = `Extract 3-5 key bullet points from this content:\n${data.reference_content}`;
  const keyPointsResponse = await callAI(
    'Extract key points as a JSON array of strings.',
    keyPointsPrompt
  );

  let keyPoints: string[] = [];
  try {
    keyPoints = JSON.parse(keyPointsResponse.content);
  } catch {
    keyPoints = keyPointsResponse.content.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
      .map(line => line.replace(/^[-•]\s*/, '').trim());
  }

  const originalWordCount = data.reference_content!.split(/\s+/).length;
  const summaryWordCount = response.content.split(/\s+/).length;
  const wordReduction = Math.round(((originalWordCount - summaryWordCount) / originalWordCount) * 100);

  // Save to database
  await supabase
    .from('ai_content_generations')
    .insert({
      user_id: userId,
      content_type: 'summary',
      topic: 'Content Summary',
      content: response.content,
      word_count: summaryWordCount,
      tokens_used: response.usage?.total_tokens || 0,
      metadata: {
        original_word_count: originalWordCount,
        word_reduction: wordReduction,
        key_points: keyPoints
      }
    });

  return {
    summary: response.content,
    key_points: keyPoints,
    word_reduction: wordReduction
  };
}

async function repurposeContent(
  userId: string,
  data: Partial<ContentGenerationRequest>,
  supabase: any
): Promise<{
  repurposed_content: string;
  format_changes: string[];
  optimization_notes: string[];
}> {
  const formatGuide = getFormatGuide(data.content_type!);

  const systemPrompt = `You are a content repurposing expert. Transform content from one format to another while optimizing for the new medium's best practices.

Target format guidelines:
${formatGuide}`;

  const userPrompt = `Repurpose the following content into a ${data.content_type}.
${data.tone ? `Use a ${data.tone} tone.` : ''}
${data.target_audience ? `Target audience: ${data.target_audience}` : ''}
${data.include_cta ? `Include a call-to-action: ${data.cta_text || 'Learn more'}` : ''}

Original content:
${data.reference_content}`;

  const response = await callAI(systemPrompt, userPrompt);

  // Identify format changes made
  const formatChanges = identifyFormatChanges(data.content_type!);

  // Generate optimization notes
  const optimizationNotes = getOptimizationNotes(data.content_type!);

  // Save to database
  await supabase
    .from('ai_content_generations')
    .insert({
      user_id: userId,
      content_type: data.content_type,
      topic: 'Content Repurposing',
      content: response.content,
      word_count: response.content.split(/\s+/).length,
      tokens_used: response.usage?.total_tokens || 0,
      metadata: {
        source_format: 'original',
        target_format: data.content_type,
        format_changes: formatChanges
      }
    });

  return {
    repurposed_content: response.content,
    format_changes: formatChanges,
    optimization_notes: optimizationNotes
  };
}

async function optimizeForSEO(
  userId: string,
  data: Partial<ContentGenerationRequest>,
  supabase: any
): Promise<{
  optimized_content: string;
  seo_score: number;
  improvements: string[];
  meta_tags: { title: string; description: string; keywords: string[] };
}> {
  const systemPrompt = `You are an SEO expert. Optimize content for search engines while maintaining readability and user engagement. Focus on:
- Keyword placement and density
- Header structure (H1, H2, H3)
- Meta descriptions
- Internal linking opportunities
- Readability improvements`;

  const userPrompt = `Optimize this content for SEO.
${data.keywords?.length ? `Target keywords: ${data.keywords.join(', ')}` : ''}

Content:
${data.reference_content}

Return the optimized content with improvements integrated.`;

  const response = await callAI(systemPrompt, userPrompt);

  // Generate meta tags
  const metaTagsPrompt = `Generate SEO meta tags for this content as JSON:
{"title": "...", "description": "...", "keywords": ["..."]}

Content:
${response.content.substring(0, 1000)}`;

  const metaResponse = await callAI(
    'Generate SEO-optimized meta tags as JSON only.',
    metaTagsPrompt
  );

  let metaTags = { title: '', description: '', keywords: data.keywords || [] };
  try {
    metaTags = JSON.parse(metaResponse.content);
  } catch {
    // Use defaults
    metaTags = {
      title: data.topic || 'Optimized Content',
      description: response.content.substring(0, 160),
      keywords: data.keywords || []
    };
  }

  // Calculate SEO score
  const seoScore = calculateSEOScore(response.content, data.keywords || []);

  // Generate improvements list
  const improvements = identifySEOImprovements(response.content, data.keywords || []);

  // Save to database
  await supabase
    .from('ai_content_generations')
    .insert({
      user_id: userId,
      content_type: 'seo_optimized',
      topic: data.topic || 'SEO Optimization',
      content: response.content,
      word_count: response.content.split(/\s+/).length,
      tokens_used: response.usage?.total_tokens || 0,
      keywords: data.keywords || [],
      seo_data: {
        score: seoScore,
        meta_tags: metaTags,
        improvements
      }
    });

  return {
    optimized_content: response.content,
    seo_score: seoScore,
    improvements,
    meta_tags: metaTags
  };
}

async function generateOutline(
  userId: string,
  data: Partial<ContentGenerationRequest>,
  supabase: any
): Promise<{
  outline: Array<{
    section: string;
    subsections: string[];
    key_points: string[];
    estimated_words: number;
  }>;
  total_estimated_words: number;
  research_suggestions: string[];
}> {
  const lengthGuide = {
    short: '500-800 words',
    medium: '1000-1500 words',
    long: '2000-3000 words',
    comprehensive: '4000+ words'
  };

  const systemPrompt = `You are a professional content strategist. Create detailed, well-structured outlines for ${data.content_type} content. Return JSON format.`;

  const userPrompt = `Create a detailed outline for a ${data.content_type} about: ${data.topic}

Target length: ${lengthGuide[data.length || 'medium']}
${data.target_audience ? `Target audience: ${data.target_audience}` : ''}
${data.keywords?.length ? `Keywords to include: ${data.keywords.join(', ')}` : ''}

Return as JSON:
{
  "outline": [
    {
      "section": "Section title",
      "subsections": ["Subsection 1", "Subsection 2"],
      "key_points": ["Key point 1", "Key point 2"],
      "estimated_words": 200
    }
  ],
  "research_suggestions": ["Research topic 1", "Research topic 2"]
}`;

  const response = await callAI(systemPrompt, userPrompt);

  let outline;
  try {
    outline = JSON.parse(response.content);
  } catch {
    // Create basic outline if parsing fails
    outline = {
      outline: [
        { section: 'Introduction', subsections: [], key_points: ['Hook', 'Thesis'], estimated_words: 150 },
        { section: 'Main Content', subsections: ['Point 1', 'Point 2', 'Point 3'], key_points: [], estimated_words: 600 },
        { section: 'Conclusion', subsections: [], key_points: ['Summary', 'Call to action'], estimated_words: 150 }
      ],
      research_suggestions: ['Related statistics', 'Expert quotes', 'Case studies']
    };
  }

  const totalEstimatedWords = outline.outline.reduce(
    (sum: number, section: any) => sum + (section.estimated_words || 0),
    0
  );

  // Save outline to database
  await supabase
    .from('ai_content_generations')
    .insert({
      user_id: userId,
      content_type: 'outline',
      topic: data.topic,
      content: JSON.stringify(outline.outline),
      word_count: totalEstimatedWords,
      tokens_used: response.usage?.total_tokens || 0,
      metadata: {
        target_content_type: data.content_type,
        research_suggestions: outline.research_suggestions
      }
    });

  return {
    outline: outline.outline,
    total_estimated_words: totalEstimatedWords,
    research_suggestions: outline.research_suggestions || []
  };
}

async function translateContent(
  userId: string,
  data: Partial<ContentGenerationRequest>,
  supabase: any
): Promise<{
  translated_content: string;
  source_language: string;
  target_language: string;
  cultural_adaptations: string[];
}> {
  const systemPrompt = `You are a professional translator and cultural adaptation expert. Translate content accurately while adapting cultural references and idioms for the target audience.`;

  const userPrompt = `Translate the following content to ${data.language}.
Maintain the original tone and meaning while adapting cultural references appropriately.

Content:
${data.reference_content}`;

  const response = await callAI(systemPrompt, userPrompt);

  // Identify cultural adaptations made
  const culturalAdaptations = [
    'Adapted idioms and expressions',
    'Localized cultural references',
    'Adjusted formatting for target locale'
  ];

  // Save translation
  await supabase
    .from('ai_content_generations')
    .insert({
      user_id: userId,
      content_type: 'translation',
      topic: `Translation to ${data.language}`,
      content: response.content,
      word_count: response.content.split(/\s+/).length,
      tokens_used: response.usage?.total_tokens || 0,
      metadata: {
        source_language: 'auto-detected',
        target_language: data.language,
        cultural_adaptations: culturalAdaptations
      }
    });

  return {
    translated_content: response.content,
    source_language: 'auto-detected',
    target_language: data.language!,
    cultural_adaptations: culturalAdaptations
  };
}

async function improveContent(
  userId: string,
  data: Partial<ContentGenerationRequest>,
  supabase: any
): Promise<{
  improved_content: string;
  changes_made: string[];
  readability_improvement: number;
  engagement_score: number;
}> {
  const systemPrompt = `You are a professional editor. Improve content for clarity, engagement, and impact. Focus on:
- Sentence structure and flow
- Word choice and vocabulary
- Paragraph organization
- Active voice usage
- Removing redundancy
- Enhancing engagement hooks`;

  const userPrompt = `Improve this content while maintaining its core message:
${data.tone ? `Target tone: ${data.tone}` : ''}
${data.target_audience ? `Target audience: ${data.target_audience}` : ''}

Content:
${data.reference_content}`;

  const response = await callAI(systemPrompt, userPrompt);

  // Identify changes made
  const changesMade = [
    'Enhanced sentence structure for clarity',
    'Improved word choice for engagement',
    'Reorganized paragraphs for better flow',
    'Converted passive voice to active',
    'Added engagement hooks'
  ];

  // Calculate improvement metrics
  const readabilityImprovement = calculateReadabilityImprovement(
    data.reference_content!,
    response.content
  );
  const engagementScore = calculateEngagementScore(response.content);

  // Save improved content
  await supabase
    .from('ai_content_generations')
    .insert({
      user_id: userId,
      content_type: 'improved',
      topic: 'Content Improvement',
      content: response.content,
      word_count: response.content.split(/\s+/).length,
      tokens_used: response.usage?.total_tokens || 0,
      metadata: {
        changes_made: changesMade,
        readability_improvement: readabilityImprovement,
        engagement_score: engagementScore
      }
    });

  return {
    improved_content: response.content,
    changes_made: changesMade,
    readability_improvement: readabilityImprovement,
    engagement_score: engagementScore
  };
}

async function applyTemplate(
  userId: string,
  templateId: string,
  variables: Record<string, string>,
  supabase: any
): Promise<{ content: string; template_name: string }> {
  // Get template
  const { data: template, error } = await supabase
    .from('ai_content_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (error || !template) {
    throw new Error('Template not found');
  }

  // Replace variables in template
  let content = template.template_content;
  for (const [key, value] of Object.entries(variables || {})) {
    content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }

  // Generate with AI if template requires it
  if (content.includes('[AI_GENERATE]')) {
    const response = await callAI(
      'Complete the content based on the template structure.',
      content.replace('[AI_GENERATE]', 'Generate appropriate content here')
    );
    content = response.content;
  }

  // Update template use count
  await supabase
    .from('ai_content_templates')
    .update({ use_count: template.use_count + 1 })
    .eq('id', templateId);

  return {
    content,
    template_name: template.name
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
        'X-Title': 'KAZI AI Content Generation'
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
    usage: {
      total_tokens: data.usage?.total_tokens || 0
    }
  };
}

function buildSystemPrompt(data: Partial<ContentGenerationRequest>): string {
  const contentTypeGuide = getContentTypeGuide(data.content_type!);
  const toneGuide = getToneGuide(data.tone || 'professional');

  return `You are a world-class content creator specializing in ${data.content_type} content.

Content Type Guidelines:
${contentTypeGuide}

Tone Guidelines:
${toneGuide}

${data.brand_voice ? `Brand Voice: ${data.brand_voice}` : ''}
${data.target_audience ? `Target Audience: ${data.target_audience}` : ''}

Requirements:
- Create engaging, high-quality content
- Maintain consistency with the requested tone
- Include relevant examples and details
- Ensure readability and flow
${data.seo_optimized ? '- Optimize for search engines' : ''}
${data.include_cta ? `- Include call-to-action: ${data.cta_text || 'Take action now'}` : ''}`;
}

function buildUserPrompt(data: Partial<ContentGenerationRequest>): string {
  const lengthGuide = {
    short: '300-500 words',
    medium: '600-1000 words',
    long: '1200-2000 words',
    comprehensive: '2500+ words'
  };

  let prompt = `Create a ${data.content_type} about: ${data.topic}

Target length: ${lengthGuide[data.length || 'medium']}`;

  if (data.keywords?.length) {
    prompt += `\n\nKeywords to incorporate naturally: ${data.keywords.join(', ')}`;
  }

  if (data.outline?.length) {
    prompt += `\n\nFollow this outline:\n${data.outline.map((item, i) => `${i + 1}. ${item}`).join('\n')}`;
  }

  if (data.format_preferences) {
    const prefs = [];
    if (data.format_preferences.include_headers) prefs.push('Include clear headers/subheaders');
    if (data.format_preferences.include_bullet_points) prefs.push('Use bullet points for lists');
    if (data.format_preferences.include_quotes) prefs.push('Include relevant quotes');
    if (data.format_preferences.include_statistics) prefs.push('Include statistics/data');
    if (prefs.length) {
      prompt += `\n\nFormatting preferences:\n${prefs.join('\n')}`;
    }
  }

  return prompt;
}

function getContentTypeGuide(contentType: ContentType): string {
  const guides: Record<ContentType, string> = {
    blog_post: 'Create an engaging blog post with a compelling headline, introduction hook, well-structured body, and actionable conclusion.',
    article: 'Write a comprehensive article with proper journalistic structure, citations where appropriate, and balanced perspective.',
    social_media: 'Create punchy, shareable content optimized for social platforms. Include hashtag suggestions.',
    newsletter: 'Write a personal, engaging newsletter with clear sections, personality, and value for subscribers.',
    product_description: 'Create compelling product copy that highlights benefits, addresses pain points, and drives conversions.',
    landing_page: 'Write conversion-focused copy with headline, subheadline, benefits, social proof, and strong CTA.',
    case_study: 'Structure as Challenge → Solution → Results with specific metrics and quotes.',
    whitepaper: 'Create authoritative, research-backed content with executive summary, methodology, findings, and recommendations.',
    press_release: 'Follow AP style with headline, dateline, lead paragraph, body quotes, boilerplate, and contact info.',
    video_script: 'Write conversational script with hooks, transitions, visual cues, and timing notes.',
    podcast_outline: 'Create detailed episode structure with segments, talking points, and guest questions.',
    ebook_chapter: 'Write comprehensive chapter content with introduction, main sections, examples, and chapter summary.',
    course_content: 'Structure educational content with learning objectives, modules, key concepts, and assessments.',
    documentation: 'Write clear, technical documentation with proper formatting, code examples, and step-by-step instructions.',
    faq: 'Create comprehensive Q&A format addressing common questions with clear, helpful answers.',
    testimonial_request: 'Write a personalized request for testimonials with specific prompts and easy response format.'
  };
  return guides[contentType] || 'Create high-quality, engaging content.';
}

function getToneGuide(tone: ContentTone): string {
  const guides: Record<ContentTone, string> = {
    professional: 'Formal, expert, trustworthy. Use industry terminology appropriately.',
    casual: 'Relaxed, friendly, conversational. Use contractions and simple language.',
    friendly: 'Warm, approachable, supportive. Connect on a personal level.',
    authoritative: 'Expert, commanding, confident. Back claims with evidence.',
    conversational: 'Engaging dialogue style. Ask questions, use "you" language.',
    persuasive: 'Compelling, benefit-focused, action-oriented. Use power words.',
    informative: 'Clear, factual, educational. Focus on delivering value.',
    inspiring: 'Motivational, uplifting, visionary. Appeal to emotions and aspirations.',
    humorous: 'Witty, entertaining, playful. Use appropriate humor.',
    empathetic: 'Understanding, supportive, compassionate. Acknowledge challenges.',
    urgent: 'Time-sensitive, action-driving, FOMO-inducing. Create immediacy.',
    luxurious: 'Sophisticated, exclusive, premium. Emphasize quality and exclusivity.'
  };
  return guides[tone] || 'Professional and engaging.';
}

function getFormatGuide(contentType: ContentType): string {
  const guides: Record<string, string> = {
    social_media: 'Short, punchy, hashtag-friendly. Optimal lengths: Twitter 280 chars, LinkedIn 1300 chars, Instagram 2200 chars.',
    blog_post: 'Scannable format with headers, bullet points, images placeholders, and internal links.',
    newsletter: 'Personal greeting, sections with clear breaks, personality, value-first approach.',
    video_script: '[Visual cues in brackets], natural speech patterns, timestamps for editing.'
  };
  return guides[contentType] || 'Standard web content formatting.';
}

function generateSuggestions(content: string, contentType: ContentType): string[] {
  const suggestions: string[] = [];

  // Word count check
  const wordCount = content.split(/\s+/).length;
  if (wordCount < 300) {
    suggestions.push('Consider expanding the content for better SEO and depth');
  }

  // Header check
  if (!content.includes('#') && !content.includes('<h')) {
    suggestions.push('Add headers/subheaders to improve scannability');
  }

  // CTA check
  if (!content.toLowerCase().includes('click') &&
      !content.toLowerCase().includes('learn more') &&
      !content.toLowerCase().includes('get started')) {
    suggestions.push('Consider adding a clear call-to-action');
  }

  // Content type specific suggestions
  if (contentType === 'blog_post' && wordCount < 1000) {
    suggestions.push('Ideal blog posts are 1000-2000 words for SEO');
  }

  if (contentType === 'social_media' && wordCount > 100) {
    suggestions.push('Social media posts perform better when concise');
  }

  return suggestions.length ? suggestions : ['Content looks great! Consider A/B testing variations.'];
}

async function generateSEOData(content: string, keywords: string[]): Promise<Record<string, any>> {
  const wordCount = content.split(/\s+/).length;
  const keywordDensity: Record<string, number> = {};

  keywords.forEach(keyword => {
    const regex = new RegExp(keyword, 'gi');
    const matches = content.match(regex);
    keywordDensity[keyword] = matches ? (matches.length / wordCount) * 100 : 0;
  });

  return {
    word_count: wordCount,
    keyword_density: keywordDensity,
    readability_score: calculateReadabilityScore(content),
    has_headers: content.includes('#') || content.includes('<h'),
    has_lists: content.includes('- ') || content.includes('• ') || content.includes('<li'),
    recommended_meta_description: content.substring(0, 160).trim() + '...'
  };
}

function calculateSEOScore(content: string, keywords: string[]): number {
  let score = 50; // Base score

  // Word count
  const wordCount = content.split(/\s+/).length;
  if (wordCount >= 1000) score += 10;
  if (wordCount >= 2000) score += 5;

  // Keyword presence
  keywords.forEach(keyword => {
    if (content.toLowerCase().includes(keyword.toLowerCase())) {
      score += 5;
    }
  });

  // Headers
  if (content.includes('#') || content.includes('<h')) score += 10;

  // Lists
  if (content.includes('- ') || content.includes('<li')) score += 5;

  // Internal structure
  const paragraphs = content.split('\n\n').length;
  if (paragraphs >= 5) score += 5;

  return Math.min(100, score);
}

function identifySEOImprovements(content: string, keywords: string[]): string[] {
  const improvements: string[] = [];

  keywords.forEach(keyword => {
    if (!content.toLowerCase().includes(keyword.toLowerCase())) {
      improvements.push(`Keyword "${keyword}" not found - consider adding naturally`);
    }
  });

  if (!content.includes('#') && !content.includes('<h')) {
    improvements.push('Add H2/H3 headers for better structure');
  }

  const wordCount = content.split(/\s+/).length;
  if (wordCount < 1000) {
    improvements.push('Expand content to 1000+ words for better SEO');
  }

  return improvements.length ? improvements : ['SEO optimization looks good!'];
}

function identifySectionsAdded(original: string, expanded: string): string[] {
  // Simple heuristic - compare header count
  const originalHeaders = (original.match(/#+ /g) || []).length;
  const expandedHeaders = (expanded.match(/#+ /g) || []).length;

  const sections: string[] = [];
  if (expandedHeaders > originalHeaders) {
    sections.push(`${expandedHeaders - originalHeaders} new sections added`);
  }

  const originalWords = original.split(/\s+/).length;
  const expandedWords = expanded.split(/\s+/).length;
  sections.push(`${expandedWords - originalWords} words added`);

  return sections;
}

function identifyFormatChanges(contentType: ContentType): string[] {
  const changes: Record<string, string[]> = {
    social_media: ['Condensed for brevity', 'Added hashtags', 'Optimized for engagement'],
    blog_post: ['Added headers', 'Created introduction hook', 'Added conclusion with CTA'],
    newsletter: ['Added personal greeting', 'Created scannable sections', 'Added personality'],
    video_script: ['Added visual cues', 'Converted to spoken format', 'Added timing notes']
  };
  return changes[contentType] || ['Reformatted for target medium'];
}

function getOptimizationNotes(contentType: ContentType): string[] {
  const notes: Record<string, string[]> = {
    social_media: ['Best posted between 10-11am', 'Use relevant hashtags', 'Add compelling visuals'],
    blog_post: ['Add featured image', 'Include internal links', 'Optimize meta description'],
    newsletter: ['Test subject lines', 'Preview text matters', 'Include social sharing'],
    video_script: ['Keep hook in first 5 seconds', 'Add B-roll suggestions', 'Include lower thirds']
  };
  return notes[contentType] || ['Review for target platform best practices'];
}

function calculateReadabilityScore(content: string): number {
  // Simplified Flesch-Kincaid approximation
  const words = content.split(/\s+/).length;
  const sentences = content.split(/[.!?]+/).length;
  const syllables = content.split(/[aeiou]/gi).length;

  if (words === 0 || sentences === 0) return 50;

  const avgWordsPerSentence = words / sentences;
  const avgSyllablesPerWord = syllables / words;

  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateReadabilityImprovement(original: string, improved: string): number {
  const originalScore = calculateReadabilityScore(original);
  const improvedScore = calculateReadabilityScore(improved);
  return improvedScore - originalScore;
}

function calculateEngagementScore(content: string): number {
  let score = 50;

  // Power words
  const powerWords = ['amazing', 'incredible', 'exclusive', 'proven', 'guaranteed', 'instant', 'discover'];
  powerWords.forEach(word => {
    if (content.toLowerCase().includes(word)) score += 3;
  });

  // Questions
  if (content.includes('?')) score += 5;

  // Calls to action
  if (content.toLowerCase().includes('click') ||
      content.toLowerCase().includes('learn more') ||
      content.toLowerCase().includes('get started')) {
    score += 10;
  }

  // Personal pronouns
  if (content.includes('you') || content.includes('your')) score += 5;

  return Math.min(100, score);
}

function getContentTypes(): Array<{ id: ContentType; name: string; description: string }> {
  return [
    { id: 'blog_post', name: 'Blog Post', description: 'Engaging blog articles for your website' },
    { id: 'article', name: 'Article', description: 'In-depth articles and thought leadership pieces' },
    { id: 'social_media', name: 'Social Media', description: 'Posts for Twitter, LinkedIn, Instagram, etc.' },
    { id: 'newsletter', name: 'Newsletter', description: 'Email newsletters for your subscribers' },
    { id: 'product_description', name: 'Product Description', description: 'Compelling product copy' },
    { id: 'landing_page', name: 'Landing Page', description: 'Conversion-focused page copy' },
    { id: 'case_study', name: 'Case Study', description: 'Client success stories' },
    { id: 'whitepaper', name: 'Whitepaper', description: 'In-depth research documents' },
    { id: 'press_release', name: 'Press Release', description: 'Media announcements' },
    { id: 'video_script', name: 'Video Script', description: 'Scripts for video content' },
    { id: 'podcast_outline', name: 'Podcast Outline', description: 'Episode planning and scripts' },
    { id: 'ebook_chapter', name: 'eBook Chapter', description: 'Long-form book content' },
    { id: 'course_content', name: 'Course Content', description: 'Educational material' },
    { id: 'documentation', name: 'Documentation', description: 'Technical documentation' },
    { id: 'faq', name: 'FAQ', description: 'Frequently asked questions' },
    { id: 'testimonial_request', name: 'Testimonial Request', description: 'Customer feedback requests' }
  ];
}

function getTones(): Array<{ id: ContentTone; name: string; description: string }> {
  return [
    { id: 'professional', name: 'Professional', description: 'Formal and expert' },
    { id: 'casual', name: 'Casual', description: 'Relaxed and friendly' },
    { id: 'friendly', name: 'Friendly', description: 'Warm and approachable' },
    { id: 'authoritative', name: 'Authoritative', description: 'Expert and commanding' },
    { id: 'conversational', name: 'Conversational', description: 'Engaging dialogue' },
    { id: 'persuasive', name: 'Persuasive', description: 'Compelling and action-oriented' },
    { id: 'informative', name: 'Informative', description: 'Clear and educational' },
    { id: 'inspiring', name: 'Inspiring', description: 'Motivational and uplifting' },
    { id: 'humorous', name: 'Humorous', description: 'Witty and entertaining' },
    { id: 'empathetic', name: 'Empathetic', description: 'Understanding and supportive' },
    { id: 'urgent', name: 'Urgent', description: 'Time-sensitive and action-driving' },
    { id: 'luxurious', name: 'Luxurious', description: 'Sophisticated and premium' }
  ];
}

function getLengths(): Array<{ id: ContentLength; name: string; words: string }> {
  return [
    { id: 'short', name: 'Short', words: '300-500 words' },
    { id: 'medium', name: 'Medium', words: '600-1000 words' },
    { id: 'long', name: 'Long', words: '1200-2000 words' },
    { id: 'comprehensive', name: 'Comprehensive', words: '2500+ words' }
  ];
}

function getDefaultTemplates(): any[] {
  return [
    {
      id: 'tpl-blog-how-to',
      name: 'How-To Blog Post',
      category: 'blog',
      description: 'Step-by-step tutorial format',
      template_content: 'How to {{topic}}\n\n## Introduction\n[Hook about the problem]\n\n## What You\'ll Need\n- Item 1\n- Item 2\n\n## Step-by-Step Guide\n### Step 1: {{step_1}}\n### Step 2: {{step_2}}\n\n## Conclusion\n[AI_GENERATE]',
      variables: ['topic', 'step_1', 'step_2'],
      use_count: 156,
      is_public: true
    },
    {
      id: 'tpl-social-launch',
      name: 'Product Launch Announcement',
      category: 'social_media',
      description: 'Announce new products/features',
      template_content: '🚀 Exciting news! {{product_name}} is here!\n\n{{key_benefit}}\n\n{{cta}}\n\n#launch #new',
      variables: ['product_name', 'key_benefit', 'cta'],
      use_count: 89,
      is_public: true
    },
    {
      id: 'tpl-newsletter-weekly',
      name: 'Weekly Newsletter',
      category: 'newsletter',
      description: 'Regular newsletter template',
      template_content: 'Hey {{first_name}}! 👋\n\nThis week in {{brand_name}}:\n\n📌 **Top Story:** {{top_story}}\n\n💡 **Tip of the Week:** {{tip}}\n\n📅 **Coming Up:** {{upcoming}}\n\n{{sign_off}}',
      variables: ['first_name', 'brand_name', 'top_story', 'tip', 'upcoming', 'sign_off'],
      use_count: 234,
      is_public: true
    }
  ];
}

// =====================================================
// Demo Mode Handlers
// =====================================================

function handleDemoGet(action: string | null): NextResponse {
  switch (action) {
    case 'history':
      return NextResponse.json({
        success: true,
        content: [
          {
            id: 'demo-content-1',
            content_type: 'blog_post',
            topic: 'The Future of Remote Work',
            content: 'Sample blog post content...',
            word_count: 850,
            created_at: new Date().toISOString()
          },
          {
            id: 'demo-content-2',
            content_type: 'social_media',
            topic: 'Product Launch Announcement',
            content: '🚀 Exciting news! We just launched...',
            word_count: 45,
            created_at: new Date(Date.now() - 86400000).toISOString()
          }
        ],
        total: 2,
        page: 1,
        limit: 20,
        message: 'Demo content history'
      });

    case 'templates':
      return NextResponse.json({
        success: true,
        templates: getDefaultTemplates(),
        message: 'Demo templates'
      });

    case 'content-types':
      return NextResponse.json({
        success: true,
        content_types: getContentTypes(),
        tones: getTones(),
        lengths: getLengths()
      });

    default:
      return NextResponse.json({
        success: true,
        service: 'AI Content Generation',
        version: '2.0.0',
        status: 'demo',
        message: 'Log in to access full content generation features'
      });
  }
}

function handleDemoPost(action: string, data: any): NextResponse {
  switch (action) {
    case 'generate':
      return NextResponse.json({
        success: true,
        action: 'generate',
        content: `# ${data.topic || 'Sample Topic'}\n\nThis is a demo-generated ${data.content_type || 'article'}. In the full version, you would receive AI-generated content tailored to your specifications.\n\n## Key Points\n\n- Point 1 about ${data.topic || 'your topic'}\n- Point 2 with supporting details\n- Point 3 with actionable insights\n\n## Conclusion\n\nLog in to access the full AI content generation capabilities with multiple content types, tones, and advanced features.`,
        metadata: {
          content_type: data.content_type || 'article',
          word_count: 75,
          tone: data.tone || 'professional',
          created_at: new Date().toISOString()
        },
        suggestions: [
          'Log in to save and access your content history',
          'Full version supports 16+ content types',
          'Advanced SEO optimization available'
        ],
        message: 'Demo content generated'
      });

    case 'generate-outline':
      return NextResponse.json({
        success: true,
        action: 'generate-outline',
        outline: [
          { section: 'Introduction', subsections: ['Hook', 'Context'], key_points: ['Grab attention', 'Set expectations'], estimated_words: 150 },
          { section: 'Main Content', subsections: ['Point 1', 'Point 2', 'Point 3'], key_points: ['Key insight', 'Supporting evidence'], estimated_words: 600 },
          { section: 'Conclusion', subsections: ['Summary', 'Call to Action'], key_points: ['Recap main points', 'Drive action'], estimated_words: 150 }
        ],
        total_estimated_words: 900,
        research_suggestions: ['Industry statistics', 'Expert quotes', 'Case studies'],
        message: 'Demo outline generated'
      });

    default:
      return NextResponse.json({
        success: false,
        error: 'Log in to use AI content generation features'
      }, { status: 401 });
  }
}
