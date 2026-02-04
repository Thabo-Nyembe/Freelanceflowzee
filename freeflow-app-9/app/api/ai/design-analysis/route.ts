import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createSimpleLogger('API-DesignAnalysis')

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, designDescription, projectId } = await request.json();

    if (!type || !designDescription) {
      return NextResponse.json({
        error: 'Type and designDescription are required'
      }, { status: 400 })
    }

    // Generate real analysis based on input
    const analysisScores = {
      accessibility: calculateAccessibilityScore(designDescription),
      performance: calculatePerformanceScore(designDescription),
      responsiveness: calculateResponsivenessScore(designDescription),
      usability: calculateUsabilityScore(designDescription)
    }

    const overallScore = Math.round(
      (analysisScores.accessibility + analysisScores.performance +
       analysisScores.responsiveness + analysisScores.usability) / 4
    )

    const recommendations = generateRecommendations(type, analysisScores, designDescription)

    // Save analysis to database
    const { data: analysis, error: dbError } = await supabase
      .from('design_analyses')
      .insert({
        user_id: user.id,
        project_id: projectId || null,
        analysis_type: type,
        design_description: designDescription,
        overall_score: overallScore,
        accessibility_score: analysisScores.accessibility,
        performance_score: analysisScores.performance,
        responsiveness_score: analysisScores.responsiveness,
        usability_score: analysisScores.usability,
        recommendations: recommendations,
        status: 'completed'
      })
      .select()
      .single()

    if (dbError) {
      logger.error('Database error saving analysis', { error: dbError.message })
      // Still return analysis even if save fails
    }

    return NextResponse.json({
      success: true,
      analysis: {
        id: analysis?.id,
        type,
        score: overallScore,
        scores: analysisScores,
        feedback: `${type.charAt(0).toUpperCase() + type.slice(1)} analysis completed`,
        recommendations,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('AI Design Analysis Error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')
    const limit = parseInt(searchParams.get('limit') || '10')

    let query = supabase
      .from('design_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    const { data: analyses, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      analyses: analyses || [],
      count: analyses?.length || 0
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Helper functions for analysis
function calculateAccessibilityScore(description: string): number {
  let score = 70
  const lowerDesc = description.toLowerCase()

  if (lowerDesc.includes('contrast') || lowerDesc.includes('color')) score += 5
  if (lowerDesc.includes('alt text') || lowerDesc.includes('aria')) score += 10
  if (lowerDesc.includes('keyboard') || lowerDesc.includes('focus')) score += 5
  if (lowerDesc.includes('screen reader')) score += 5
  if (lowerDesc.includes('wcag')) score += 5

  return Math.min(100, score)
}

function calculatePerformanceScore(description: string): number {
  let score = 75
  const lowerDesc = description.toLowerCase()

  if (lowerDesc.includes('lazy load') || lowerDesc.includes('optimize')) score += 10
  if (lowerDesc.includes('compress') || lowerDesc.includes('minif')) score += 5
  if (lowerDesc.includes('cache') || lowerDesc.includes('cdn')) score += 5
  if (lowerDesc.includes('fast') || lowerDesc.includes('speed')) score += 5

  return Math.min(100, score)
}

function calculateResponsivenessScore(description: string): number {
  let score = 70
  const lowerDesc = description.toLowerCase()

  if (lowerDesc.includes('responsive') || lowerDesc.includes('mobile')) score += 15
  if (lowerDesc.includes('tablet') || lowerDesc.includes('desktop')) score += 5
  if (lowerDesc.includes('breakpoint') || lowerDesc.includes('grid')) score += 5
  if (lowerDesc.includes('flex') || lowerDesc.includes('adaptive')) score += 5

  return Math.min(100, score)
}

function calculateUsabilityScore(description: string): number {
  let score = 75
  const lowerDesc = description.toLowerCase()

  if (lowerDesc.includes('intuitive') || lowerDesc.includes('simple')) score += 5
  if (lowerDesc.includes('navigation') || lowerDesc.includes('menu')) score += 5
  if (lowerDesc.includes('feedback') || lowerDesc.includes('error')) score += 5
  if (lowerDesc.includes('user') || lowerDesc.includes('ux')) score += 5
  if (lowerDesc.includes('clear') || lowerDesc.includes('readable')) score += 5

  return Math.min(100, score)
}

function generateRecommendations(type: string, scores: any, description: string): string[] {
  const recommendations: string[] = []

  if (scores.accessibility < 80) {
    recommendations.push('Add ARIA labels and roles for better screen reader support')
    recommendations.push('Ensure sufficient color contrast ratios (4.5:1 for text)')
  }

  if (scores.performance < 80) {
    recommendations.push('Implement lazy loading for images and heavy components')
    recommendations.push('Optimize and compress assets for faster loading')
  }

  if (scores.responsiveness < 80) {
    recommendations.push('Add responsive breakpoints for mobile, tablet, and desktop')
    recommendations.push('Use flexible grid layouts instead of fixed widths')
  }

  if (scores.usability < 80) {
    recommendations.push('Add clear visual feedback for interactive elements')
    recommendations.push('Improve navigation hierarchy and information architecture')
  }

  // Always add at least one recommendation
  if (recommendations.length === 0) {
    recommendations.push('Continue maintaining high design standards')
    recommendations.push('Consider A/B testing for further optimization')
  }

  return recommendations.slice(0, 5)
}