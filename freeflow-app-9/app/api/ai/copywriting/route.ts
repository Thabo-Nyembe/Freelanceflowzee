// =====================================================
// KAZI AI Copywriting API - World-Class
// Professional copywriting with conversion optimization
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// =====================================================
// Types
// =====================================================

type CopyType =
  | 'headline' | 'tagline' | 'slogan' | 'cta' | 'email_subject'
  | 'email_body' | 'ad_copy' | 'landing_page' | 'product_description'
  | 'meta_description' | 'social_caption' | 'bio' | 'about_us'
  | 'value_proposition' | 'elevator_pitch' | 'testimonial'
  | 'faq_answer' | 'notification' | 'error_message' | 'microcopy';

type CopyFramework =
  | 'aida' | 'pas' | 'bab' | 'fab' | '4ps' | 'quest' | 'slap'
  | 'star' | 'pppp' | 'acca' | 'pastor' | 'forest';

type CopyTone =
  | 'professional' | 'casual' | 'friendly' | 'urgent' | 'luxurious'
  | 'playful' | 'authoritative' | 'empathetic' | 'inspirational'
  | 'direct' | 'conversational' | 'formal' | 'witty';

interface CopywritingRequest {
  action: string;
  copy_type?: CopyType;
  framework?: CopyFramework;
  tone?: CopyTone;
  product_name?: string;
  product_description?: string;
  target_audience?: string;
  key_benefit?: string;
  pain_points?: string[];
  unique_selling_points?: string[];
  keywords?: string[];
  character_limit?: number;
  brand_voice?: string;
  call_to_action?: string;
  platform?: string;
  existing_copy?: string;
  competitor_examples?: string[];
  context?: string;
}

// =====================================================
// GET - Fetch copy history, templates, frameworks
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
        const copyType = searchParams.get('copy_type');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = (page - 1) * limit;

        let query = supabase
          .from('ai_copywriting_generations')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (copyType) {
          query = query.eq('copy_type', copyType);
        }

        const { data: copies, count, error } = await query;

        if (error) throw error;

        return NextResponse.json({
          success: true,
          copies,
          total: count || 0,
          page,
          limit
        });
      }

      case 'brand-voice': {
        const { data: brandVoice, error } = await supabase
          .from('ai_brand_voice_profiles')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({
          success: true,
          brand_voices: brandVoice || []
        });
      }

      case 'swipe-file': {
        const category = searchParams.get('category');

        let query = supabase
          .from('ai_copywriting_swipe_file')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (category) {
          query = query.eq('category', category);
        }

        const { data: swipeFile, error } = await query;

        if (error) throw error;

        return NextResponse.json({
          success: true,
          swipe_file: swipeFile || [],
          curated: getCuratedSwipeFile(category || undefined)
        });
      }

      case 'frameworks': {
        return NextResponse.json({
          success: true,
          frameworks: getCopywritingFrameworks(),
          copy_types: getCopyTypes(),
          tones: getCopyTones()
        });
      }

      case 'power-words': {
        const category = searchParams.get('category');
        return NextResponse.json({
          success: true,
          power_words: getPowerWords(category || undefined)
        });
      }

      case 'usage': {
        const { data: usage, error } = await supabase
          .from('ai_copywriting_usage')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        if (error) throw error;

        const stats = {
          total_copies: usage?.length || 0,
          total_words: usage?.reduce((sum, u) => sum + (u.word_count || 0), 0) || 0,
          by_type: {} as Record<string, number>,
          by_framework: {} as Record<string, number>,
          average_conversion_score: 0
        };

        usage?.forEach(u => {
          stats.by_type[u.copy_type] = (stats.by_type[u.copy_type] || 0) + 1;
          if (u.framework) {
            stats.by_framework[u.framework] = (stats.by_framework[u.framework] || 0) + 1;
          }
        });

        return NextResponse.json({ success: true, usage: stats });
      }

      default: {
        return NextResponse.json({
          success: true,
          service: 'AI Copywriting',
          version: '2.0.0',
          status: 'operational',
          capabilities: [
            'headlines', 'taglines', 'slogans', 'ctas', 'email_copy',
            'ad_copy', 'landing_pages', 'product_descriptions',
            'ab_variations', 'conversion_optimization', 'brand_voice',
            'power_words', 'emotional_triggers', 'frameworks'
          ]
        });
      }
    }
  } catch (error: any) {
    console.error('AI Copywriting GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch copywriting data' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Generate copy
// =====================================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body: CopywritingRequest = await request.json();
    const { action, ...data } = body;

    // Demo mode for unauthenticated users
    if (!user) {
      return handleDemoPost(action, data);
    }

    switch (action) {
      case 'generate': {
        if (!data.copy_type) {
          return NextResponse.json(
            { success: false, error: 'Copy type required' },
            { status: 400 }
          );
        }

        const result = await generateCopy(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'generate',
          ...result
        });
      }

      case 'generate-headlines': {
        if (!data.product_name && !data.context) {
          return NextResponse.json(
            { success: false, error: 'Product name or context required' },
            { status: 400 }
          );
        }

        const result = await generateHeadlines(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'generate-headlines',
          ...result
        });
      }

      case 'generate-ctas': {
        const result = await generateCTAs(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'generate-ctas',
          ...result
        });
      }

      case 'generate-email-sequence': {
        if (!data.product_name || !data.context) {
          return NextResponse.json(
            { success: false, error: 'Product name and context required' },
            { status: 400 }
          );
        }

        const result = await generateEmailSequence(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'generate-email-sequence',
          ...result
        });
      }

      case 'generate-ad-copy': {
        if (!data.product_name || !data.platform) {
          return NextResponse.json(
            { success: false, error: 'Product name and platform required' },
            { status: 400 }
          );
        }

        const result = await generateAdCopy(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'generate-ad-copy',
          ...result
        });
      }

      case 'generate-landing-page': {
        if (!data.product_name || !data.key_benefit) {
          return NextResponse.json(
            { success: false, error: 'Product name and key benefit required' },
            { status: 400 }
          );
        }

        const result = await generateLandingPageCopy(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'generate-landing-page',
          ...result
        });
      }

      case 'generate-ab-variations': {
        if (!data.existing_copy) {
          return NextResponse.json(
            { success: false, error: 'Existing copy required' },
            { status: 400 }
          );
        }

        const result = await generateABVariations(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'generate-ab-variations',
          ...result
        });
      }

      case 'optimize-conversion': {
        if (!data.existing_copy) {
          return NextResponse.json(
            { success: false, error: 'Existing copy required' },
            { status: 400 }
          );
        }

        const result = await optimizeForConversion(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'optimize-conversion',
          ...result
        });
      }

      case 'apply-framework': {
        if (!data.framework || !data.context) {
          return NextResponse.json(
            { success: false, error: 'Framework and context required' },
            { status: 400 }
          );
        }

        const result = await applyFramework(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'apply-framework',
          ...result
        });
      }

      case 'rewrite': {
        if (!data.existing_copy) {
          return NextResponse.json(
            { success: false, error: 'Existing copy required' },
            { status: 400 }
          );
        }

        const result = await rewriteCopy(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'rewrite',
          ...result
        });
      }

      case 'shorten': {
        if (!data.existing_copy) {
          return NextResponse.json(
            { success: false, error: 'Existing copy required' },
            { status: 400 }
          );
        }

        const result = await shortenCopy(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'shorten',
          ...result
        });
      }

      case 'expand': {
        if (!data.existing_copy) {
          return NextResponse.json(
            { success: false, error: 'Existing copy required' },
            { status: 400 }
          );
        }

        const result = await expandCopy(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'expand',
          ...result
        });
      }

      case 'analyze': {
        if (!data.existing_copy) {
          return NextResponse.json(
            { success: false, error: 'Copy to analyze required' },
            { status: 400 }
          );
        }

        const result = await analyzeCopy(data.existing_copy);

        return NextResponse.json({
          success: true,
          action: 'analyze',
          ...result
        });
      }

      case 'save-brand-voice': {
        const { name, description, tone_words, avoid_words, examples, personality_traits } = data as any;

        if (!name) {
          return NextResponse.json(
            { success: false, error: 'Brand voice name required' },
            { status: 400 }
          );
        }

        const { data: brandVoice, error } = await supabase
          .from('ai_brand_voice_profiles')
          .insert({
            user_id: user.id,
            name,
            description,
            tone_words: tone_words || [],
            avoid_words: avoid_words || [],
            examples: examples || [],
            personality_traits: personality_traits || []
          })
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({
          success: true,
          action: 'save-brand-voice',
          brand_voice: brandVoice,
          message: 'Brand voice saved successfully'
        }, { status: 201 });
      }

      case 'save-to-swipe-file': {
        const { title, content, category, source, tags } = data as any;

        if (!title || !content) {
          return NextResponse.json(
            { success: false, error: 'Title and content required' },
            { status: 400 }
          );
        }

        const { data: swipeItem, error } = await supabase
          .from('ai_copywriting_swipe_file')
          .insert({
            user_id: user.id,
            title,
            content,
            category: category || 'general',
            source,
            tags: tags || []
          })
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({
          success: true,
          action: 'save-to-swipe-file',
          swipe_item: swipeItem,
          message: 'Added to swipe file'
        }, { status: 201 });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('AI Copywriting POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Copywriting operation failed' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - Delete copy or brand voice
// =====================================================
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const copyId = searchParams.get('copyId');
    const brandVoiceId = searchParams.get('brandVoiceId');
    const swipeItemId = searchParams.get('swipeItemId');

    if (copyId) {
      const { error } = await supabase
        .from('ai_copywriting_generations')
        .delete()
        .eq('id', copyId)
        .eq('user_id', user.id);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Copy deleted successfully'
      });
    }

    if (brandVoiceId) {
      const { error } = await supabase
        .from('ai_brand_voice_profiles')
        .delete()
        .eq('id', brandVoiceId)
        .eq('user_id', user.id);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Brand voice deleted successfully'
      });
    }

    if (swipeItemId) {
      const { error } = await supabase
        .from('ai_copywriting_swipe_file')
        .delete()
        .eq('id', swipeItemId)
        .eq('user_id', user.id);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Swipe file item deleted successfully'
      });
    }

    return NextResponse.json(
      { success: false, error: 'ID required for deletion' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('AI Copywriting DELETE error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete' },
      { status: 500 }
    );
  }
}

// =====================================================
// Copywriting Generation Functions
// =====================================================

async function generateCopy(
  userId: string,
  data: Partial<CopywritingRequest>,
  supabase: any
): Promise<{
  copy: string;
  variations: string[];
  conversion_score: number;
  emotional_triggers: string[];
  power_words_used: string[];
  suggestions: string[];
}> {
  const frameworkGuide = data.framework ? getFrameworkGuide(data.framework) : '';
  const copyTypeGuide = getCopyTypeGuide(data.copy_type!);

  const systemPrompt = `You are a world-class copywriter with expertise in conversion optimization.
${copyTypeGuide}
${frameworkGuide}
${data.brand_voice ? `Brand Voice: ${data.brand_voice}` : ''}

Writing principles:
- Lead with the benefit
- Use power words strategically
- Create emotional connection
- Include a clear call to action
- Keep it scannable and readable`;

  const userPrompt = `Write ${data.copy_type} copy.

${data.product_name ? `Product/Service: ${data.product_name}` : ''}
${data.product_description ? `Description: ${data.product_description}` : ''}
${data.target_audience ? `Target Audience: ${data.target_audience}` : ''}
${data.key_benefit ? `Key Benefit: ${data.key_benefit}` : ''}
${data.pain_points?.length ? `Pain Points: ${data.pain_points.join(', ')}` : ''}
${data.unique_selling_points?.length ? `USPs: ${data.unique_selling_points.join(', ')}` : ''}
${data.tone ? `Tone: ${data.tone}` : ''}
${data.character_limit ? `Character Limit: ${data.character_limit}` : ''}
${data.call_to_action ? `CTA: ${data.call_to_action}` : ''}
${data.context ? `Context: ${data.context}` : ''}

Return the primary copy followed by 2 alternative variations.`;

  const response = await callAI(systemPrompt, userPrompt);

  // Parse response to extract variations
  const lines = response.content.split('\n\n').filter(line => line.trim());
  const mainCopy = lines[0] || response.content;
  const variations = lines.slice(1, 4);

  // Analyze the copy
  const analysis = analyzeCopy(mainCopy);

  // Save to database
  const wordCount = mainCopy.split(/\s+/).length;

  await supabase
    .from('ai_copywriting_generations')
    .insert({
      user_id: userId,
      copy_type: data.copy_type,
      framework: data.framework,
      tone: data.tone || 'professional',
      content: mainCopy,
      variations,
      word_count: wordCount,
      conversion_score: analysis.conversion_score,
      metadata: {
        product_name: data.product_name,
        target_audience: data.target_audience,
        key_benefit: data.key_benefit,
        emotional_triggers: analysis.emotional_triggers,
        power_words_used: analysis.power_words_used
      }
    });

  return {
    copy: mainCopy,
    variations: variations.length > 0 ? variations : [
      `Alternative version focusing on urgency: ${mainCopy.substring(0, 50)}...`,
      `Alternative version focusing on benefit: ${mainCopy.substring(0, 50)}...`
    ],
    conversion_score: analysis.conversion_score,
    emotional_triggers: analysis.emotional_triggers,
    power_words_used: analysis.power_words_used,
    suggestions: analysis.suggestions
  };
}

async function generateHeadlines(
  userId: string,
  data: Partial<CopywritingRequest>,
  supabase: any
): Promise<{
  headlines: Array<{
    text: string;
    type: string;
    hook: string;
    estimated_ctr: number;
  }>;
  best_performing_type: string;
  tips: string[];
}> {
  const systemPrompt = `You are a headline specialist who writes attention-grabbing headlines that drive clicks and conversions.

Headline formulas to use:
1. How to [achieve benefit] without [pain point]
2. [Number] ways to [achieve benefit]
3. The secret to [desired outcome]
4. Why [target audience] are [doing X]
5. [Benefit] in [timeframe]
6. Warning: [common mistake]
7. What [authority] knows about [topic]
8. The ultimate guide to [topic]
9. [Number] [adjective] tips for [outcome]
10. Stop [problem] - start [solution]`;

  const userPrompt = `Generate 10 compelling headlines.

${data.product_name ? `Product: ${data.product_name}` : ''}
${data.product_description ? `Description: ${data.product_description}` : ''}
${data.target_audience ? `Audience: ${data.target_audience}` : ''}
${data.key_benefit ? `Key Benefit: ${data.key_benefit}` : ''}
${data.pain_points?.length ? `Pain Points: ${data.pain_points.join(', ')}` : ''}
${data.context ? `Context: ${data.context}` : ''}
${data.tone ? `Tone: ${data.tone}` : ''}
${data.platform ? `Platform: ${data.platform}` : ''}

For each headline, specify the type (how-to, list, question, command, curiosity, fear, social-proof, urgency) and the emotional hook used.

Return as JSON:
{
  "headlines": [
    {
      "text": "Headline text",
      "type": "how-to|list|question|command|curiosity|fear|social-proof|urgency",
      "hook": "The emotional/psychological trigger used",
      "estimated_ctr": 3.5
    }
  ]
}`;

  const response = await callAI(systemPrompt, userPrompt);

  let result;
  try {
    result = JSON.parse(response.content);
  } catch {
    // Generate default headlines
    const product = data.product_name || 'your solution';
    result = {
      headlines: [
        { text: `How to ${data.key_benefit || 'achieve your goals'} with ${product}`, type: 'how-to', hook: 'Promise of benefit', estimated_ctr: 3.2 },
        { text: `5 Ways ${product} Transforms Your ${data.context || 'Business'}`, type: 'list', hook: 'Curiosity about methods', estimated_ctr: 3.5 },
        { text: `Why Smart ${data.target_audience || 'Professionals'} Choose ${product}`, type: 'social-proof', hook: 'Social validation', estimated_ctr: 2.8 },
        { text: `The ${product} Secret That Changed Everything`, type: 'curiosity', hook: 'Mystery and intrigue', estimated_ctr: 3.0 },
        { text: `Stop Struggling. Start ${data.key_benefit || 'Succeeding'}.`, type: 'command', hook: 'Direct action', estimated_ctr: 2.5 }
      ]
    };
  }

  // Determine best performing type
  const typeCounts: Record<string, { count: number; totalCtr: number }> = {};
  result.headlines.forEach((h: any) => {
    if (!typeCounts[h.type]) {
      typeCounts[h.type] = { count: 0, totalCtr: 0 };
    }
    typeCounts[h.type].count++;
    typeCounts[h.type].totalCtr += h.estimated_ctr || 0;
  });

  let bestType = 'how-to';
  let bestAvgCtr = 0;
  for (const [type, stats] of Object.entries(typeCounts)) {
    const avgCtr = stats.totalCtr / stats.count;
    if (avgCtr > bestAvgCtr) {
      bestAvgCtr = avgCtr;
      bestType = type;
    }
  }

  // Save to database
  await supabase
    .from('ai_copywriting_generations')
    .insert({
      user_id: userId,
      copy_type: 'headline',
      content: result.headlines.map((h: any) => h.text).join('\n'),
      variations: result.headlines.slice(0, 5).map((h: any) => h.text),
      metadata: {
        headlines: result.headlines,
        best_performing_type: bestType
      }
    });

  return {
    headlines: result.headlines,
    best_performing_type: bestType,
    tips: [
      'A/B test your top 3 headlines',
      'Headlines with numbers tend to perform well',
      'Include your key benefit in the headline',
      `${bestType} headlines work best for your audience`
    ]
  };
}

async function generateCTAs(
  userId: string,
  data: Partial<CopywritingRequest>,
  supabase: any
): Promise<{
  ctas: Array<{
    text: string;
    type: string;
    urgency_level: 'low' | 'medium' | 'high';
    best_for: string;
  }>;
  button_variations: string[];
  microcopy_suggestions: string[];
}> {
  const systemPrompt = `You are a CTA specialist who writes compelling calls-to-action that drive conversions.

CTA best practices:
- Use action verbs (Get, Start, Discover, Join, Claim)
- Create urgency when appropriate
- Highlight the benefit, not the action
- Keep it short (2-5 words)
- Use first person when appropriate ("Get My Free...")`;

  const userPrompt = `Generate 10 compelling CTAs.

${data.product_name ? `Product: ${data.product_name}` : ''}
${data.key_benefit ? `Key Benefit: ${data.key_benefit}` : ''}
${data.target_audience ? `Audience: ${data.target_audience}` : ''}
${data.call_to_action ? `Desired Action: ${data.call_to_action}` : ''}
${data.tone ? `Tone: ${data.tone}` : ''}
${data.platform ? `Platform: ${data.platform}` : ''}

Create a mix of:
1. Benefit-focused CTAs
2. Urgency CTAs
3. Value-focused CTAs
4. Social proof CTAs
5. Simple action CTAs

Return as JSON:
{
  "ctas": [
    {
      "text": "CTA text",
      "type": "benefit|urgency|value|social-proof|action",
      "urgency_level": "low|medium|high",
      "best_for": "email|landing-page|ad|popup"
    }
  ],
  "button_variations": ["variation 1", "variation 2"],
  "microcopy_suggestions": ["supporting text 1", "supporting text 2"]
}`;

  const response = await callAI(systemPrompt, userPrompt);

  let result;
  try {
    result = JSON.parse(response.content);
  } catch {
    result = {
      ctas: [
        { text: 'Get Started Free', type: 'value', urgency_level: 'low' as const, best_for: 'landing-page' },
        { text: 'Claim Your Spot', type: 'urgency', urgency_level: 'medium' as const, best_for: 'email' },
        { text: 'Start Saving Today', type: 'benefit', urgency_level: 'low' as const, best_for: 'ad' },
        { text: 'Join 10,000+ Users', type: 'social-proof', urgency_level: 'low' as const, best_for: 'landing-page' },
        { text: 'Yes, I Want This!', type: 'action', urgency_level: 'medium' as const, best_for: 'popup' }
      ],
      button_variations: ['Try Free for 14 Days', 'Start My Trial', 'Show Me How'],
      microcopy_suggestions: ['No credit card required', '30-day money-back guarantee', 'Cancel anytime']
    };
  }

  return result;
}

async function generateEmailSequence(
  userId: string,
  data: Partial<CopywritingRequest>,
  supabase: any
): Promise<{
  sequence: Array<{
    email_number: number;
    timing: string;
    subject_line: string;
    preview_text: string;
    body: string;
    cta: string;
    goal: string;
  }>;
  sequence_strategy: string;
  tips: string[];
}> {
  const systemPrompt = `You are an email marketing expert who writes high-converting email sequences.

Email sequence best practices:
- First email: Deliver value, build trust
- Follow-ups: Address objections, share proof
- Final emails: Create urgency, make the offer`;

  const userPrompt = `Create a 5-email nurture sequence.

${data.product_name ? `Product: ${data.product_name}` : ''}
${data.product_description ? `Description: ${data.product_description}` : ''}
${data.target_audience ? `Audience: ${data.target_audience}` : ''}
${data.key_benefit ? `Key Benefit: ${data.key_benefit}` : ''}
${data.pain_points?.length ? `Pain Points: ${data.pain_points.join(', ')}` : ''}
${data.unique_selling_points?.length ? `USPs: ${data.unique_selling_points.join(', ')}` : ''}
${data.context ? `Context/Goal: ${data.context}` : ''}
${data.tone ? `Tone: ${data.tone}` : ''}

Structure:
1. Welcome/Value email
2. Problem awareness email
3. Solution introduction email
4. Social proof/case study email
5. Final offer/urgency email

Return as JSON with full email bodies.`;

  const response = await callAI(systemPrompt, userPrompt);

  let result;
  try {
    result = JSON.parse(response.content);
  } catch {
    result = {
      sequence: [
        {
          email_number: 1,
          timing: 'Immediately after signup',
          subject_line: `Welcome! Here's your first step to ${data.key_benefit || 'success'}`,
          preview_text: 'Plus a special bonus inside...',
          body: `Hi there,\n\nWelcome to ${data.product_name || 'our community'}!\n\nWe're excited to help you ${data.key_benefit || 'achieve your goals'}.\n\nHere's what you can do right now:\n\n1. [First step]\n2. [Second step]\n3. [Third step]\n\nReply to this email if you have any questions!\n\nCheers,\nThe Team`,
          cta: 'Get Started',
          goal: 'Deliver value, set expectations'
        },
        {
          email_number: 2,
          timing: 'Day 2',
          subject_line: `The #1 mistake ${data.target_audience || 'people'} make...`,
          preview_text: 'And how to avoid it',
          body: `Quick question...\n\nAre you making this common mistake?\n\n[Problem description]\n\nHere's how to fix it:\n\n[Solution]\n\nTomorrow, I'll share how ${data.product_name || 'we'} can help even more.\n\nBest,\nThe Team`,
          cta: 'Learn More',
          goal: 'Problem awareness'
        }
      ],
      sequence_strategy: 'Value-first nurture sequence leading to conversion',
      tips: ['Personalize subject lines', 'Keep emails scannable', 'Include one clear CTA per email']
    };
  }

  // Save to database
  await supabase
    .from('ai_copywriting_generations')
    .insert({
      user_id: userId,
      copy_type: 'email_body',
      content: JSON.stringify(result.sequence),
      metadata: {
        sequence_type: 'nurture',
        email_count: result.sequence?.length || 5,
        strategy: result.sequence_strategy
      }
    });

  return {
    sequence: result.sequence || [],
    sequence_strategy: result.sequence_strategy || 'Value-first nurture sequence',
    tips: result.tips || ['Personalize subject lines', 'A/B test timing', 'Track open rates']
  };
}

async function generateAdCopy(
  userId: string,
  data: Partial<CopywritingRequest>,
  supabase: any
): Promise<{
  ads: Array<{
    platform: string;
    format: string;
    headline: string;
    primary_text: string;
    description?: string;
    cta: string;
    character_counts: Record<string, number>;
  }>;
  targeting_suggestions: string[];
  creative_tips: string[];
}> {
  const platformSpecs: Record<string, any> = {
    facebook: {
      headline: 40,
      primary_text: 125,
      description: 30,
      formats: ['feed', 'story', 'carousel']
    },
    google: {
      headline: 30,
      description: 90,
      formats: ['search', 'display', 'responsive']
    },
    linkedin: {
      headline: 70,
      primary_text: 150,
      formats: ['feed', 'message', 'carousel']
    },
    twitter: {
      text: 280,
      formats: ['tweet', 'promoted']
    }
  };

  const platform = data.platform?.toLowerCase() || 'facebook';
  const specs = platformSpecs[platform] || platformSpecs.facebook;

  const systemPrompt = `You are a paid advertising expert who writes high-converting ad copy.

Platform: ${platform}
Character limits: ${JSON.stringify(specs)}

Ad copy principles:
- Hook attention immediately
- Focus on one clear benefit
- Include social proof when possible
- Create urgency appropriately
- Match ad to landing page`;

  const userPrompt = `Create ad copy for ${platform}.

${data.product_name ? `Product: ${data.product_name}` : ''}
${data.product_description ? `Description: ${data.product_description}` : ''}
${data.target_audience ? `Audience: ${data.target_audience}` : ''}
${data.key_benefit ? `Key Benefit: ${data.key_benefit}` : ''}
${data.pain_points?.length ? `Pain Points: ${data.pain_points.join(', ')}` : ''}
${data.unique_selling_points?.length ? `USPs: ${data.unique_selling_points.join(', ')}` : ''}
${data.tone ? `Tone: ${data.tone}` : ''}
${data.call_to_action ? `CTA: ${data.call_to_action}` : ''}

Create 3 ad variations optimized for the platform.

Return as JSON with exact character counts.`;

  const response = await callAI(systemPrompt, userPrompt);

  let result;
  try {
    result = JSON.parse(response.content);
  } catch {
    result = {
      ads: [
        {
          platform,
          format: 'feed',
          headline: `${data.key_benefit || 'Transform Your Business'} Today`,
          primary_text: `Tired of ${data.pain_points?.[0] || 'struggling'}? ${data.product_name || 'Our solution'} helps ${data.target_audience || 'you'} ${data.key_benefit || 'achieve success'}. Join thousands who've already made the switch.`,
          description: 'Start your free trial',
          cta: data.call_to_action || 'Learn More',
          character_counts: { headline: 28, primary_text: 120, description: 20 }
        }
      ],
      targeting_suggestions: ['Interest-based targeting', 'Lookalike audiences', 'Retargeting website visitors'],
      creative_tips: ['Use eye-catching visuals', 'Test different CTAs', 'Include social proof']
    };
  }

  // Save to database
  await supabase
    .from('ai_copywriting_generations')
    .insert({
      user_id: userId,
      copy_type: 'ad_copy',
      content: JSON.stringify(result.ads),
      metadata: {
        platform,
        ad_count: result.ads?.length || 1,
        targeting_suggestions: result.targeting_suggestions
      }
    });

  return {
    ads: result.ads || [],
    targeting_suggestions: result.targeting_suggestions || [],
    creative_tips: result.creative_tips || []
  };
}

async function generateLandingPageCopy(
  userId: string,
  data: Partial<CopywritingRequest>,
  supabase: any
): Promise<{
  sections: {
    hero: { headline: string; subheadline: string; cta: string; supporting_text: string };
    problem: { headline: string; pain_points: string[] };
    solution: { headline: string; benefits: Array<{ title: string; description: string }> };
    social_proof: { headline: string; testimonials: string[]; stats: string[] };
    features: Array<{ title: string; description: string; icon_suggestion: string }>;
    faq: Array<{ question: string; answer: string }>;
    final_cta: { headline: string; subheadline: string; button_text: string; guarantee: string };
  };
  seo_meta: { title: string; description: string };
  conversion_tips: string[];
}> {
  const framework = data.framework || 'pas';

  const systemPrompt = `You are a landing page copywriting expert who writes high-converting page copy.

Using the ${framework.toUpperCase()} framework, create compelling landing page copy that:
- Hooks visitors instantly
- Addresses pain points
- Presents the solution clearly
- Uses social proof effectively
- Drives action with clear CTAs`;

  const userPrompt = `Create complete landing page copy.

${data.product_name ? `Product: ${data.product_name}` : ''}
${data.product_description ? `Description: ${data.product_description}` : ''}
${data.target_audience ? `Target Audience: ${data.target_audience}` : ''}
${data.key_benefit ? `Key Benefit: ${data.key_benefit}` : ''}
${data.pain_points?.length ? `Pain Points: ${data.pain_points.join(', ')}` : ''}
${data.unique_selling_points?.length ? `USPs: ${data.unique_selling_points.join(', ')}` : ''}
${data.tone ? `Tone: ${data.tone}` : ''}

Create all sections: hero, problem, solution, social proof, features, FAQ, final CTA.

Return as comprehensive JSON structure.`;

  const response = await callAI(systemPrompt, userPrompt);

  let result;
  try {
    result = JSON.parse(response.content);
  } catch {
    result = {
      sections: {
        hero: {
          headline: `${data.key_benefit || 'Transform Your Results'} Without the Hassle`,
          subheadline: `The smart way for ${data.target_audience || 'professionals'} to ${data.key_benefit || 'achieve success'}`,
          cta: 'Start Free Trial',
          supporting_text: 'Join 10,000+ who trust us'
        },
        problem: {
          headline: 'Sound Familiar?',
          pain_points: data.pain_points || ['Wasting time on manual tasks', 'Missing opportunities', 'Feeling overwhelmed']
        },
        solution: {
          headline: `Introducing ${data.product_name || 'Your Solution'}`,
          benefits: (data.unique_selling_points || ['Save time', 'Increase revenue', 'Scale effortlessly']).map(usp => ({
            title: usp,
            description: `${usp} with our proven approach.`
          }))
        },
        social_proof: {
          headline: 'Trusted by Industry Leaders',
          testimonials: ['This changed everything for our team.', 'ROI within the first month.'],
          stats: ['10,000+ users', '4.9/5 rating', '99% satisfaction']
        },
        features: [
          { title: 'Feature 1', description: 'Description of feature 1', icon_suggestion: 'zap' },
          { title: 'Feature 2', description: 'Description of feature 2', icon_suggestion: 'shield' }
        ],
        faq: [
          { question: 'How does it work?', answer: 'Simple explanation of how the product works.' },
          { question: 'Is there a free trial?', answer: 'Yes, we offer a 14-day free trial.' }
        ],
        final_cta: {
          headline: 'Ready to Get Started?',
          subheadline: 'Join thousands of satisfied customers today',
          button_text: 'Start Your Free Trial',
          guarantee: '30-day money-back guarantee'
        }
      },
      seo_meta: {
        title: `${data.product_name || 'Product'} - ${data.key_benefit || 'Transform Your Business'}`,
        description: `${data.product_description?.substring(0, 150) || 'The best solution for your needs'}`
      },
      conversion_tips: ['Add trust badges', 'Include video testimonials', 'Highlight guarantees']
    };
  }

  // Save to database
  await supabase
    .from('ai_copywriting_generations')
    .insert({
      user_id: userId,
      copy_type: 'landing_page',
      framework: data.framework,
      content: JSON.stringify(result.sections),
      metadata: {
        product_name: data.product_name,
        seo_meta: result.seo_meta
      }
    });

  return {
    sections: result.sections,
    seo_meta: result.seo_meta || { title: '', description: '' },
    conversion_tips: result.conversion_tips || []
  };
}

async function generateABVariations(
  userId: string,
  data: Partial<CopywritingRequest>,
  supabase: any
): Promise<{
  original: string;
  variations: Array<{
    id: string;
    copy: string;
    change_type: string;
    hypothesis: string;
    expected_impact: string;
  }>;
  test_recommendations: string[];
}> {
  const systemPrompt = `You are an A/B testing expert who creates strategic copy variations for conversion optimization.

For each variation:
- Make one significant change
- Have a clear hypothesis
- Predict expected impact`;

  const userPrompt = `Create A/B test variations for this copy:

Original: ${data.existing_copy}

${data.copy_type ? `Copy type: ${data.copy_type}` : ''}
${data.target_audience ? `Audience: ${data.target_audience}` : ''}

Create 4 variations testing different elements:
1. Headline/hook variation
2. Benefit emphasis variation
3. CTA variation
4. Tone/voice variation

Return as JSON with clear hypotheses.`;

  const response = await callAI(systemPrompt, userPrompt);

  let result;
  try {
    result = JSON.parse(response.content);
  } catch {
    result = {
      variations: [
        {
          id: 'var-a',
          copy: data.existing_copy?.replace(/\./g, '!') || 'Variation A',
          change_type: 'Punctuation/Urgency',
          hypothesis: 'Adding urgency will increase CTR',
          expected_impact: '+5-10% CTR'
        },
        {
          id: 'var-b',
          copy: `🔥 ${data.existing_copy}` || 'Variation B',
          change_type: 'Emoji addition',
          hypothesis: 'Emojis will increase attention',
          expected_impact: '+3-8% engagement'
        }
      ],
      test_recommendations: ['Run for 2 weeks minimum', 'Ensure statistical significance', 'Test one variable at a time']
    };
  }

  return {
    original: data.existing_copy || '',
    variations: result.variations || [],
    test_recommendations: result.test_recommendations || []
  };
}

async function optimizeForConversion(
  userId: string,
  data: Partial<CopywritingRequest>,
  supabase: any
): Promise<{
  optimized_copy: string;
  changes_made: string[];
  conversion_score_before: number;
  conversion_score_after: number;
  power_words_added: string[];
  psychological_triggers: string[];
}> {
  const beforeAnalysis = analyzeCopy(data.existing_copy || '');

  const systemPrompt = `You are a conversion rate optimization expert. Optimize copy for maximum conversions.

Optimization tactics:
- Add power words
- Use psychological triggers
- Improve clarity
- Add urgency/scarcity when appropriate
- Strengthen the CTA
- Remove friction words`;

  const userPrompt = `Optimize this copy for conversions:

${data.existing_copy}

${data.target_audience ? `Target audience: ${data.target_audience}` : ''}
${data.call_to_action ? `Desired action: ${data.call_to_action}` : ''}

Return the optimized version with specific improvements noted.`;

  const response = await callAI(systemPrompt, userPrompt);

  const afterAnalysis = analyzeCopy(response.content);

  // Identify power words added
  const powerWordsAfter = afterAnalysis.power_words_used;
  const powerWordsBefore = beforeAnalysis.power_words_used;
  const newPowerWords = powerWordsAfter.filter(w => !powerWordsBefore.includes(w));

  return {
    optimized_copy: response.content,
    changes_made: [
      'Added emotional triggers',
      'Strengthened call-to-action',
      'Improved clarity and flow',
      'Added urgency elements'
    ],
    conversion_score_before: beforeAnalysis.conversion_score,
    conversion_score_after: afterAnalysis.conversion_score,
    power_words_added: newPowerWords,
    psychological_triggers: afterAnalysis.emotional_triggers
  };
}

async function applyFramework(
  userId: string,
  data: Partial<CopywritingRequest>,
  supabase: any
): Promise<{
  copy: string;
  framework_breakdown: Record<string, string>;
  framework_explanation: string;
}> {
  const frameworkGuide = getFrameworkGuide(data.framework!);
  const frameworkExplanation = getFrameworkExplanation(data.framework!);

  const systemPrompt = `You are a copywriting expert applying the ${data.framework?.toUpperCase()} framework.

${frameworkGuide}

Apply this framework meticulously and label each section.`;

  const userPrompt = `Write copy using the ${data.framework?.toUpperCase()} framework.

${data.product_name ? `Product: ${data.product_name}` : ''}
${data.context ? `Context: ${data.context}` : ''}
${data.target_audience ? `Audience: ${data.target_audience}` : ''}
${data.key_benefit ? `Key benefit: ${data.key_benefit}` : ''}
${data.pain_points?.length ? `Pain points: ${data.pain_points.join(', ')}` : ''}

Return the copy with clear framework section labels.`;

  const response = await callAI(systemPrompt, userPrompt);

  // Parse framework sections
  const frameworkBreakdown: Record<string, string> = {};
  const sections = response.content.split(/\n(?=[A-Z]+:)/);
  sections.forEach(section => {
    const match = section.match(/^([A-Z]+):\s*([\s\S]*)/);
    if (match) {
      frameworkBreakdown[match[1]] = match[2].trim();
    }
  });

  return {
    copy: response.content,
    framework_breakdown: Object.keys(frameworkBreakdown).length > 0 ? frameworkBreakdown : { content: response.content },
    framework_explanation: frameworkExplanation
  };
}

async function rewriteCopy(
  userId: string,
  data: Partial<CopywritingRequest>,
  supabase: any
): Promise<{
  rewritten: string;
  tone_applied: string;
  changes: string[];
}> {
  const systemPrompt = `You are a copywriter who rewrites content while maintaining the core message.
${data.tone ? `Apply a ${data.tone} tone.` : ''}
${data.brand_voice ? `Match this brand voice: ${data.brand_voice}` : ''}`;

  const userPrompt = `Rewrite this copy${data.tone ? ` with a ${data.tone} tone` : ''}:

${data.existing_copy}

${data.character_limit ? `Character limit: ${data.character_limit}` : ''}
${data.target_audience ? `Target audience: ${data.target_audience}` : ''}`;

  const response = await callAI(systemPrompt, userPrompt);

  return {
    rewritten: response.content,
    tone_applied: data.tone || 'professional',
    changes: ['Applied new tone', 'Maintained core message', 'Improved flow']
  };
}

async function shortenCopy(
  userId: string,
  data: Partial<CopywritingRequest>,
  supabase: any
): Promise<{
  shortened: string;
  original_length: number;
  new_length: number;
  reduction_percentage: number;
  key_points_preserved: string[];
}> {
  const targetLength = data.character_limit || Math.floor((data.existing_copy?.length || 100) / 2);

  const systemPrompt = `You are an expert at concise writing. Shorten copy while preserving key messages and impact.`;

  const userPrompt = `Shorten this copy to approximately ${targetLength} characters while keeping the core message:

${data.existing_copy}

Preserve:
- Key benefit
- Call to action
- Essential information`;

  const response = await callAI(systemPrompt, userPrompt);

  const originalLength = data.existing_copy?.length || 0;
  const newLength = response.content.length;
  const reduction = Math.round(((originalLength - newLength) / originalLength) * 100);

  return {
    shortened: response.content,
    original_length: originalLength,
    new_length: newLength,
    reduction_percentage: reduction,
    key_points_preserved: ['Core message', 'Call to action', 'Key benefit']
  };
}

async function expandCopy(
  userId: string,
  data: Partial<CopywritingRequest>,
  supabase: any
): Promise<{
  expanded: string;
  original_length: number;
  new_length: number;
  additions: string[];
}> {
  const systemPrompt = `You are a copywriter who expands content with valuable details while maintaining engagement.`;

  const userPrompt = `Expand this copy with more details, examples, and persuasive elements:

${data.existing_copy}

${data.target_audience ? `Target audience: ${data.target_audience}` : ''}
${data.key_benefit ? `Emphasize this benefit: ${data.key_benefit}` : ''}

Add:
- Supporting details
- Examples or proof points
- Emotional elements
- Stronger transitions`;

  const response = await callAI(systemPrompt, userPrompt);

  return {
    expanded: response.content,
    original_length: data.existing_copy?.length || 0,
    new_length: response.content.length,
    additions: ['Supporting details', 'Examples', 'Emotional elements', 'Better transitions']
  };
}

function analyzeCopy(copy: string): {
  conversion_score: number;
  emotional_triggers: string[];
  power_words_used: string[];
  suggestions: string[];
  readability: string;
  word_count: number;
} {
  const powerWords = getPowerWords();
  const allPowerWords = Object.values(powerWords).flat();

  // Count power words
  const usedPowerWords: string[] = [];
  allPowerWords.forEach(word => {
    if (copy.toLowerCase().includes(word.toLowerCase())) {
      usedPowerWords.push(word);
    }
  });

  // Identify emotional triggers
  const emotionalTriggers: string[] = [];
  if (copy.match(/free|save|discount|bonus/i)) emotionalTriggers.push('Value/Savings');
  if (copy.match(/limited|exclusive|only|now/i)) emotionalTriggers.push('Scarcity/Urgency');
  if (copy.match(/join|thousands|popular|trusted/i)) emotionalTriggers.push('Social Proof');
  if (copy.match(/guaranteed|risk-free|secure/i)) emotionalTriggers.push('Trust/Safety');
  if (copy.match(/easy|simple|quick|instant/i)) emotionalTriggers.push('Convenience');
  if (copy.match(/you|your|yourself/i)) emotionalTriggers.push('Personal Connection');

  // Calculate conversion score
  let score = 50;
  score += usedPowerWords.length * 3;
  score += emotionalTriggers.length * 5;
  if (copy.includes('?')) score += 3; // Questions engage
  if (copy.match(/!$/)) score += 2; // Ends with excitement
  if (copy.length < 50) score -= 5; // Too short
  if (copy.length > 500) score -= 5; // Too long

  // Ensure score is within bounds
  score = Math.min(100, Math.max(0, score));

  // Generate suggestions
  const suggestions: string[] = [];
  if (usedPowerWords.length < 3) suggestions.push('Add more power words');
  if (!emotionalTriggers.includes('Urgency')) suggestions.push('Consider adding urgency');
  if (!copy.match(/you|your/i)) suggestions.push('Make it more personal with "you/your"');
  if (!copy.match(/\d/)) suggestions.push('Add specific numbers for credibility');

  // Calculate readability
  const wordCount = copy.split(/\s+/).length;
  const sentenceCount = copy.split(/[.!?]+/).length;
  const avgWordsPerSentence = wordCount / sentenceCount;

  let readability = 'Good';
  if (avgWordsPerSentence > 20) readability = 'Could be simpler';
  if (avgWordsPerSentence < 8) readability = 'Very easy';

  return {
    conversion_score: score,
    emotional_triggers: emotionalTriggers,
    power_words_used: usedPowerWords,
    suggestions: suggestions.length > 0 ? suggestions : ['Copy looks optimized!'],
    readability,
    word_count: wordCount
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
        'X-Title': 'KAZI AI Copywriting'
      })
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_API_KEY ? 'anthropic/claude-3.5-sonnet' : 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
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

function getCopyTypeGuide(copyType: CopyType): string {
  const guides: Record<CopyType, string> = {
    headline: 'Create attention-grabbing headlines that stop the scroll. Focus on benefits, use power words, and create curiosity.',
    tagline: 'Write memorable, concise brand taglines that capture essence in 3-7 words.',
    slogan: 'Create catchy, memorable slogans that embody brand personality and values.',
    cta: 'Write action-oriented call-to-action buttons/links that compel clicks. Use strong verbs.',
    email_subject: 'Craft subject lines that drive opens. Use curiosity, urgency, or personalization.',
    email_body: 'Write engaging email body copy with clear structure, value, and single CTA.',
    ad_copy: 'Create compelling ad copy that grabs attention, presents benefit, and drives action.',
    landing_page: 'Write conversion-focused landing page copy with clear hierarchy and persuasion.',
    product_description: 'Create benefit-focused product descriptions that sell features as solutions.',
    meta_description: 'Write SEO meta descriptions (150-160 chars) that encourage clicks from search.',
    social_caption: 'Create engaging social media captions optimized for each platform.',
    bio: 'Write compelling personal or company bios that establish credibility.',
    about_us: 'Create authentic about us copy that builds connection and trust.',
    value_proposition: 'Write clear, compelling value propositions that differentiate from competitors.',
    elevator_pitch: 'Create concise, memorable pitches that explain value in 30-60 seconds.',
    testimonial: 'Write or refine testimonials that feel authentic and address objections.',
    faq_answer: 'Create helpful FAQ answers that address concerns and remove barriers.',
    notification: 'Write clear, actionable notification copy for apps and emails.',
    error_message: 'Create helpful, friendly error messages that guide users to solutions.',
    microcopy: 'Write UX microcopy that guides, reassures, and reduces friction.'
  };
  return guides[copyType] || 'Write compelling, conversion-focused copy.';
}

function getFrameworkGuide(framework: CopyFramework): string {
  const guides: Record<CopyFramework, string> = {
    aida: `AIDA Framework:
A - Attention: Grab attention with a bold statement or question
I - Interest: Build interest with relevant facts and benefits
D - Desire: Create desire by painting the transformation
A - Action: Drive action with a clear, compelling CTA`,
    pas: `PAS Framework:
P - Problem: Identify and agitate the pain point
A - Agitate: Make the problem feel urgent and real
S - Solution: Present your solution as the answer`,
    bab: `Before-After-Bridge:
Before: Describe the current painful state
After: Paint the picture of the desired state
Bridge: Show how your solution gets them there`,
    fab: `FAB Framework:
F - Feature: What it is/has
A - Advantage: What it does
B - Benefit: What it means for the customer`,
    '4ps': `4 Ps Framework:
P - Promise: Make a bold promise
P - Picture: Paint the vision
P - Proof: Provide evidence
P - Push: Drive action`,
    quest: `QUEST Framework:
Q - Qualify: Identify the target reader
U - Understand: Show you understand their problem
E - Educate: Teach something valuable
S - Stimulate: Create emotional response
T - Transition: Move to the offer`,
    slap: `SLAP Framework:
S - Stop: Pattern interrupt
L - Look: Engage with visuals/copy
A - Act: Clear CTA
P - Purchase: Remove barriers`,
    star: `STAR Framework:
S - Situation: Set the scene
T - Task: Explain the challenge
A - Action: Describe what was done
R - Result: Share the outcome`,
    pppp: `4 Ps of Persuasion:
P - Problem: Identify the issue
P - Promise: Make a commitment
P - Proof: Provide evidence
P - Proposal: Make your offer`,
    acca: `ACCA Framework:
A - Awareness: Create awareness of the problem
C - Comprehension: Help understand the solution
C - Conviction: Build belief and desire
A - Action: Drive the next step`,
    pastor: `PASTOR Framework:
P - Problem: Identify the pain
A - Amplify: Make it urgent
S - Story: Share a relatable story
T - Transformation: Show the change
O - Offer: Present your solution
R - Response: Ask for action`,
    forest: `FOREST Framework:
F - Facts: Start with compelling facts
O - Opinion: Share expert opinion
R - Repetition: Repeat key messages
E - Examples: Provide proof
S - Statistics: Use data
T - Threes: Group in threes`
  };
  return guides[framework] || 'Apply a strategic copywriting framework.';
}

function getFrameworkExplanation(framework: CopyFramework): string {
  const explanations: Record<CopyFramework, string> = {
    aida: 'AIDA is the classic marketing framework - Attention, Interest, Desire, Action. Perfect for sales pages and ads.',
    pas: 'Problem-Agitate-Solve is powerful for addressing pain points. Great for email and landing pages.',
    bab: 'Before-After-Bridge shows transformation. Ideal for testimonials and case studies.',
    fab: 'Features-Advantages-Benefits translates features into customer value. Great for product copy.',
    '4ps': 'Promise-Picture-Proof-Push builds desire systematically. Excellent for long-form sales.',
    quest: 'QUEST qualifies and educates before selling. Perfect for content marketing.',
    slap: 'Stop-Look-Act-Purchase is designed for fast-paced environments like social media.',
    star: 'Situation-Task-Action-Result is perfect for case studies and testimonials.',
    pppp: 'Problem-Promise-Proof-Proposal is a simple persuasion framework for any copy.',
    acca: 'Awareness-Comprehension-Conviction-Action guides prospects through the buying journey.',
    pastor: 'PASTOR is comprehensive for long-form sales copy and webinar scripts.',
    forest: 'FOREST provides variety in your persuasion techniques for engagement.'
  };
  return explanations[framework] || 'A proven copywriting framework for conversion.';
}

function getCopyTypes(): Array<{ id: CopyType; name: string; description: string }> {
  return [
    { id: 'headline', name: 'Headline', description: 'Attention-grabbing headlines' },
    { id: 'tagline', name: 'Tagline', description: 'Brand taglines (3-7 words)' },
    { id: 'slogan', name: 'Slogan', description: 'Memorable brand slogans' },
    { id: 'cta', name: 'Call-to-Action', description: 'Button and link text' },
    { id: 'email_subject', name: 'Email Subject', description: 'Subject lines that drive opens' },
    { id: 'email_body', name: 'Email Body', description: 'Email content' },
    { id: 'ad_copy', name: 'Ad Copy', description: 'Advertising copy' },
    { id: 'landing_page', name: 'Landing Page', description: 'Conversion page copy' },
    { id: 'product_description', name: 'Product Description', description: 'Product sales copy' },
    { id: 'meta_description', name: 'Meta Description', description: 'SEO descriptions' },
    { id: 'social_caption', name: 'Social Caption', description: 'Social media posts' },
    { id: 'bio', name: 'Bio', description: 'Personal/company bios' },
    { id: 'about_us', name: 'About Us', description: 'Company story' },
    { id: 'value_proposition', name: 'Value Proposition', description: 'Core value statement' },
    { id: 'elevator_pitch', name: 'Elevator Pitch', description: '30-60 second pitch' },
    { id: 'testimonial', name: 'Testimonial', description: 'Customer reviews' },
    { id: 'faq_answer', name: 'FAQ Answer', description: 'FAQ responses' },
    { id: 'notification', name: 'Notification', description: 'App/email notifications' },
    { id: 'error_message', name: 'Error Message', description: 'User-friendly errors' },
    { id: 'microcopy', name: 'Microcopy', description: 'UX writing' }
  ];
}

function getCopyTones(): Array<{ id: CopyTone; name: string; description: string }> {
  return [
    { id: 'professional', name: 'Professional', description: 'Business-appropriate' },
    { id: 'casual', name: 'Casual', description: 'Relaxed and approachable' },
    { id: 'friendly', name: 'Friendly', description: 'Warm and personable' },
    { id: 'urgent', name: 'Urgent', description: 'Time-sensitive' },
    { id: 'luxurious', name: 'Luxurious', description: 'Premium and exclusive' },
    { id: 'playful', name: 'Playful', description: 'Fun and lighthearted' },
    { id: 'authoritative', name: 'Authoritative', description: 'Expert and commanding' },
    { id: 'empathetic', name: 'Empathetic', description: 'Understanding and supportive' },
    { id: 'inspirational', name: 'Inspirational', description: 'Motivating and uplifting' },
    { id: 'direct', name: 'Direct', description: 'Straightforward and clear' },
    { id: 'conversational', name: 'Conversational', description: 'Natural dialogue' },
    { id: 'formal', name: 'Formal', description: 'Traditional and proper' },
    { id: 'witty', name: 'Witty', description: 'Clever and amusing' }
  ];
}

function getCopywritingFrameworks(): Array<{ id: CopyFramework; name: string; description: string; best_for: string }> {
  return [
    { id: 'aida', name: 'AIDA', description: 'Attention, Interest, Desire, Action', best_for: 'Sales pages, ads' },
    { id: 'pas', name: 'PAS', description: 'Problem, Agitate, Solution', best_for: 'Email, landing pages' },
    { id: 'bab', name: 'BAB', description: 'Before, After, Bridge', best_for: 'Testimonials, case studies' },
    { id: 'fab', name: 'FAB', description: 'Feature, Advantage, Benefit', best_for: 'Product descriptions' },
    { id: '4ps', name: '4 Ps', description: 'Promise, Picture, Proof, Push', best_for: 'Long-form sales' },
    { id: 'quest', name: 'QUEST', description: 'Qualify, Understand, Educate, Stimulate, Transition', best_for: 'Content marketing' },
    { id: 'slap', name: 'SLAP', description: 'Stop, Look, Act, Purchase', best_for: 'Social media ads' },
    { id: 'star', name: 'STAR', description: 'Situation, Task, Action, Result', best_for: 'Case studies' },
    { id: 'pppp', name: '4 Ps Persuasion', description: 'Problem, Promise, Proof, Proposal', best_for: 'General persuasion' },
    { id: 'acca', name: 'ACCA', description: 'Awareness, Comprehension, Conviction, Action', best_for: 'Educational content' },
    { id: 'pastor', name: 'PASTOR', description: 'Problem, Amplify, Story, Transformation, Offer, Response', best_for: 'Long-form, webinars' },
    { id: 'forest', name: 'FOREST', description: 'Facts, Opinion, Repetition, Examples, Statistics, Threes', best_for: 'Varied persuasion' }
  ];
}

function getPowerWords(category?: string): Record<string, string[]> {
  const words: Record<string, string[]> = {
    urgency: ['Now', 'Today', 'Hurry', 'Limited', 'Fast', 'Quick', 'Instant', 'Deadline', 'Last chance', 'Act now'],
    exclusivity: ['Exclusive', 'Members-only', 'Private', 'VIP', 'Elite', 'Secret', 'Insider', 'Limited edition', 'Rare'],
    value: ['Free', 'Save', 'Bonus', 'Discount', 'Deal', 'Bargain', 'Value', 'Affordable', 'Budget', 'Economical'],
    trust: ['Guaranteed', 'Proven', 'Certified', 'Trusted', 'Official', 'Authentic', 'Verified', 'Secure', 'Safe'],
    results: ['Results', 'Transform', 'Boost', 'Increase', 'Improve', 'Enhance', 'Maximize', 'Optimize', 'Accelerate'],
    curiosity: ['Secret', 'Discover', 'Reveal', 'Uncover', 'Hidden', 'Unknown', 'Surprising', 'Shocking', 'Finally'],
    simplicity: ['Easy', 'Simple', 'Effortless', 'Quick', 'Straightforward', 'Hassle-free', 'Painless', 'Smooth'],
    emotion: ['Love', 'Amazing', 'Incredible', 'Wonderful', 'Remarkable', 'Extraordinary', 'Breathtaking', 'Powerful']
  };

  if (category && words[category]) {
    return { [category]: words[category] };
  }
  return words;
}

function getCuratedSwipeFile(category?: string): any[] {
  const swipeFile = [
    { title: 'Apple "Think Different"', content: 'Think Different.', category: 'tagline', source: 'Apple', notes: 'Simple, bold, memorable' },
    { title: 'Nike "Just Do It"', content: 'Just Do It.', category: 'slogan', source: 'Nike', notes: 'Action-oriented, universal' },
    { title: 'Dropbox Value Prop', content: 'Your stuff, anywhere.', category: 'value_proposition', source: 'Dropbox', notes: 'Clear benefit, simple' },
    { title: 'Slack Headline', content: 'Where work happens.', category: 'headline', source: 'Slack', notes: 'Defines the product simply' },
    { title: 'Mailchimp CTA', content: 'Start sending better email today.', category: 'cta', source: 'Mailchimp', notes: 'Benefit + urgency' }
  ];

  if (category) {
    return swipeFile.filter(item => item.category === category);
  }
  return swipeFile;
}

// =====================================================
// Demo Mode Handlers
// =====================================================

function handleDemoGet(action: string | null): NextResponse {
  switch (action) {
    case 'frameworks':
      return NextResponse.json({
        success: true,
        frameworks: getCopywritingFrameworks(),
        copy_types: getCopyTypes(),
        tones: getCopyTones()
      });

    case 'power-words':
      return NextResponse.json({
        success: true,
        power_words: getPowerWords()
      });

    default:
      return NextResponse.json({
        success: true,
        service: 'AI Copywriting',
        version: '2.0.0',
        status: 'demo',
        message: 'Log in to access full copywriting features'
      });
  }
}

function handleDemoPost(action: string, data: any): NextResponse {
  switch (action) {
    case 'generate':
      return NextResponse.json({
        success: true,
        action: 'generate',
        copy: 'Transform your business with our proven solution. Join thousands of satisfied customers who have already made the switch. Start your free trial today.',
        variations: [
          'Ready to level up? Our solution delivers results in days, not months.',
          'Stop struggling. Start succeeding. Get started now.'
        ],
        conversion_score: 72,
        emotional_triggers: ['Social Proof', 'Urgency', 'Value'],
        power_words_used: ['Transform', 'Proven', 'Free', 'Today'],
        suggestions: ['Log in to generate personalized copy', 'Try different frameworks'],
        message: 'Demo copy generated'
      });

    case 'generate-headlines':
      return NextResponse.json({
        success: true,
        action: 'generate-headlines',
        headlines: [
          { text: 'How to 10x Your Results in 30 Days', type: 'how-to', hook: 'Specific promise', estimated_ctr: 3.5 },
          { text: 'The Secret Top Performers Don\'t Share', type: 'curiosity', hook: 'Mystery', estimated_ctr: 3.2 }
        ],
        best_performing_type: 'how-to',
        tips: ['Log in for personalized headlines', 'A/B test variations'],
        message: 'Demo headlines generated'
      });

    case 'analyze':
      return NextResponse.json({
        success: true,
        action: 'analyze',
        ...analyzeCopy(data.existing_copy || 'Sample copy for analysis'),
        message: 'Demo analysis complete'
      });

    default:
      return NextResponse.json({
        success: false,
        error: 'Log in to use AI copywriting features'
      }, { status: 401 });
  }
}
