/**
 * Video Studio AI Tools API
 * Uses existing OpenRouter service for video-related AI assistance
 */

import { NextRequest, NextResponse } from 'next/server'
import { openRouterService } from '@/lib/ai/openrouter-service'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('API-VideoTools')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { toolType, context } = body

    if (!toolType) {
      return NextResponse.json(
        { success: false, error: 'Tool type is required' },
        { status: 400 }
      )
    }

    let prompt = ''
    let systemContext = {}

    // Generate prompt based on tool type
    switch (toolType) {
      case 'script-generator':
        prompt = `Generate a professional video script for:
Topic: ${context.videoTopic || 'Not specified'}
Duration: ${context.videoDuration ? `${context.videoDuration} minutes` : 'Not specified'}
Target Audience: ${context.targetAudience || 'General audience'}
Additional Notes: ${context.additionalNotes || 'None'}

Create a complete, engaging script with:
- Clear introduction, body, and conclusion
- Timing cues and pacing suggestions
- Speaking notes and emphasis points
- Call-to-action

Format it professionally with sections.`
        systemContext = { type: 'script_generation', videoProduction: true }
        break

      case 'title-generator':
        prompt = `Generate 8-10 catchy, SEO-optimized video titles for:
Topic: ${context.videoTopic || 'Not specified'}
Target Audience: ${context.targetAudience || 'General audience'}
Video Type: ${context.videoType || 'General'}

Each title should:
- Be 40-70 characters
- Include relevant keywords
- Drive clicks without clickbait
- Accurately represent content

Rank them by effectiveness and explain why each works.`
        systemContext = { type: 'title_generation', seo: true }
        break

      case 'thumbnail-ideas':
        prompt = `Suggest 5 compelling thumbnail concepts for:
Video Title: ${context.videoTitle || 'Not specified'}
Topic: ${context.videoTopic || 'Not specified'}
Target Audience: ${context.targetAudience || 'General audience'}

For each concept provide:
- Visual composition description
- Text overlay suggestions (if any)
- Color scheme recommendations
- Emotional appeal strategy
- Why it will stand out

Be specific and actionable.`
        systemContext = { type: 'thumbnail_design', visual: true }
        break

      case 'description-generator':
        prompt = `Write a comprehensive video description for:
Title: ${context.videoTitle || 'Not specified'}
Topic: ${context.videoTopic || 'Not specified'}
Duration: ${context.videoDuration ? `${context.videoDuration} minutes` : 'Not specified'}

Include:
- Engaging summary (first 2-3 sentences are crucial)
- Chapter timestamps (if applicable)
- Relevant keywords naturally integrated
- Links and resources
- Strong call-to-action
- SEO optimization

Make it discoverable and engaging.`
        systemContext = { type: 'description_writing', seo: true }
        break

      case 'tag-generator':
        prompt = `Generate 15-20 strategic video tags for:
Topic: ${context.videoTopic || 'Not specified'}
Title: ${context.videoTitle || 'Not specified'}
Target Audience: ${context.targetAudience || 'General audience'}

Include mix of:
- Broad category tags
- Specific niche tags
- Long-tail keywords
- Trending topics (if relevant)
- Competitor tags

Explain the strategy behind the tag selection.`
        systemContext = { type: 'tag_generation', seo: true }
        break

      case 'content-analysis':
        prompt = `Analyze this video content:
Title: ${context.videoTitle || 'Not specified'}
Topic: ${context.videoTopic || 'Not specified'}
Script/Content: ${context.videoScript || 'Not provided'}
Target Audience: ${context.targetAudience || 'General audience'}

Provide analysis on:
- Content structure and flow
- Engagement potential
- Target audience alignment
- Pacing and timing
- Improvement opportunities
- Competitive positioning
- Expected performance

Give actionable recommendations.`
        systemContext = { type: 'content_analysis', strategic: true }
        break

      case 'seo-optimizer':
        prompt = `Optimize this video for search and discovery:
Current Title: ${context.videoTitle || 'Not specified'}
Topic: ${context.videoTopic || 'Not specified'}
Current Description: ${context.currentDescription || 'Not provided'}
Target Keywords: ${context.targetKeywords || 'Not specified'}

Provide:
- Optimized title suggestions
- Keyword integration strategy
- Description improvements
- Tag recommendations
- Playlist suggestions
- Cross-promotion ideas

Focus on discoverability and ranking.`
        systemContext = { type: 'seo_optimization', search: true }
        break

      case 'editing-suggestions':
        prompt = `Provide professional editing suggestions for:
Video Topic: ${context.videoTopic || 'Not specified'}
Duration: ${context.videoDuration ? `${context.videoDuration} minutes` : 'Not specified'}
Current Script/Content: ${context.videoScript || 'Not provided'}
Target Audience: ${context.targetAudience || 'General audience'}

Suggest:
- Pacing improvements
- Cut recommendations
- Transition ideas
- B-roll suggestions
- Music/sound effects ideas
- Visual effects to enhance message
- Color grading approach
- Overall flow optimization

Be specific with timestamps or sections.`
        systemContext = { type: 'editing_advice', technical: true }
        break

      case 'auto-edit':
        prompt = `Suggest automated editing optimizations for this video:
Duration: ${context.videoDuration || 'unknown'}
Content Type: ${context.contentType || 'general'}
Quality Goals: ${context.qualityGoals || 'professional standard'}

Recommend:
- Automated cuts and trims
- Silence removal strategy
- Scene detection points
- Audio normalization approach
- Color correction presets
- Automated B-roll insertion points
- Template suggestions`
        systemContext = { type: 'auto_editing', automation: true }
        break

      case 'smart-crop':
        prompt = `Recommend smart cropping strategy for:
Original Format: ${context.originalFormat || '16:9'}
Target Formats: ${context.targetFormats || 'square, vertical'}
Content Type: ${context.contentType || 'general'}

Provide:
- Focal point recommendations
- Format-specific crop suggestions
- Text-safe zones
- Important element preservation
- Automated crop rules`
        systemContext = { type: 'smart_cropping', technical: true }
        break

      case 'color-grade':
        prompt = `Suggest color grading approach for:
Video Topic: ${context.videoTopic || 'Not specified'}
Mood: ${context.mood || 'professional'}
Brand Colors: ${context.brandColors || 'not specified'}

Recommend:
- Color palette
- Mood/emotion goals
- Contrast and saturation levels
- LUT suggestions
- Scene-specific adjustments`
        systemContext = { type: 'color_grading', artistic: true }
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid tool type' },
          { status: 400 }
        )
    }

    // Call OpenRouter service
    const aiResponse = await openRouterService.generateResponse(
      prompt,
      { ...systemContext, videoStudio: true, ...context },
      'anthropic/claude-3.5-sonnet' // Best for creative content
    )

    // Parse response for suggestions if applicable
    const suggestions = extractSuggestions(aiResponse, toolType)

    return NextResponse.json({
      success: true,
      toolType,
      result: {
        content: aiResponse,
        suggestions,
        confidence: 0.9,
        model: 'claude-3.5-sonnet',
        provider: 'openrouter'
      }
    })

  } catch (error) {
    logger.error('Video tools API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      toolType: body?.toolType
    });

    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process request',
      details: error.stack
    }, { status: 500 })
  }
}

/**
 * Extract suggestions from AI response
 */
function extractSuggestions(content: string, toolType: string): string[] | undefined {
  // For certain tool types, extract list items
  if (['title-generator', 'tag-generator', 'thumbnail-ideas'].includes(toolType)) {
    const suggestions: string[] = []
    const lines = content.split('\n')

    for (const line of lines) {
      const trimmed = line.trim()
      // Match numbered lists or bullet points
      if (trimmed.match(/^[\d]+\./) || trimmed.match(/^[-*•]/)) {
        const cleaned = trimmed
          .replace(/^[\d]+\./, '')
          .replace(/^[-*•]/, '')
          .trim()

        if (cleaned.length > 0 && cleaned.length < 200) {
          suggestions.push(cleaned)
        }
      }
    }

    return suggestions.length > 0 ? suggestions : undefined
  }

  return undefined
}

/**
 * GET handler - Return available tools
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    tools: [
      {
        id: 'script-generator',
        name: 'Script Generator',
        description: 'Generate professional video scripts',
        requiredFields: ['videoTopic'],
        optionalFields: ['videoDuration', 'targetAudience', 'additionalNotes']
      },
      {
        id: 'title-generator',
        name: 'Title Generator',
        description: 'Create catchy, SEO-optimized titles',
        requiredFields: ['videoTopic'],
        optionalFields: ['targetAudience', 'videoType']
      },
      {
        id: 'thumbnail-ideas',
        name: 'Thumbnail Ideas',
        description: 'Get thumbnail design suggestions',
        requiredFields: ['videoTopic'],
        optionalFields: ['videoTitle', 'targetAudience']
      },
      {
        id: 'description-generator',
        name: 'Description Generator',
        description: 'Write comprehensive video descriptions',
        requiredFields: ['videoTopic', 'videoTitle'],
        optionalFields: ['videoDuration']
      },
      {
        id: 'tag-generator',
        name: 'Tag Generator',
        description: 'Generate strategic video tags',
        requiredFields: ['videoTopic'],
        optionalFields: ['videoTitle', 'targetAudience']
      },
      {
        id: 'content-analysis',
        name: 'Content Analysis',
        description: 'Analyze video content for improvements',
        requiredFields: ['videoTopic'],
        optionalFields: ['videoTitle', 'videoScript', 'targetAudience']
      },
      {
        id: 'seo-optimizer',
        name: 'SEO Optimizer',
        description: 'Optimize video for search engines',
        requiredFields: ['videoTopic', 'videoTitle'],
        optionalFields: ['currentDescription', 'targetKeywords']
      },
      {
        id: 'editing-suggestions',
        name: 'Editing Suggestions',
        description: 'Get professional editing recommendations',
        requiredFields: ['videoTopic'],
        optionalFields: ['videoDuration', 'videoScript', 'targetAudience']
      },
      {
        id: 'auto-edit',
        name: 'Auto Edit Suggestions',
        description: 'AI-powered automated editing recommendations',
        requiredFields: [],
        optionalFields: ['videoDuration', 'contentType', 'qualityGoals']
      },
      {
        id: 'smart-crop',
        name: 'Smart Crop',
        description: 'Intelligent cropping for multiple formats',
        requiredFields: [],
        optionalFields: ['originalFormat', 'targetFormats', 'contentType']
      },
      {
        id: 'color-grade',
        name: 'Color Grading Assistant',
        description: 'Color grading recommendations',
        requiredFields: [],
        optionalFields: ['videoTopic', 'mood', 'brandColors']
      }
    ]
  })
}
