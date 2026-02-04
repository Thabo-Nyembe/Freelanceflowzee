/**
 * AI Design Studio API Routes
 *
 * REST endpoints for AI Design Studio:
 * GET - List projects, outputs, templates, tools, palettes, stats
 * POST - Create project, output, palette, review, track analytics
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('ai-design')
import {

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
  getDesignProjects,
  createDesignProject,
  getDesignOutputs,
  createDesignOutput,
  getDesignTemplates,
  getPopularTemplates,
  getAIReadyTemplates,
  getAITools,
  getPopularAITools,
  getColorPalettes,
  createColorPalette,
  getToolReviews,
  createToolReview,
  getDesignProjectStats,
  getTemplateStats,
  getAIToolStats,
  getUserProjectAnalytics,
  trackProjectAnalytics
} from '@/lib/ai-design-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'projects'
    const toolType = searchParams.get('tool_type') as string | null
    const status = searchParams.get('status') as string | null
    const model = searchParams.get('model') as string | null
    const category = searchParams.get('category') as string | null
    const aiReady = searchParams.get('ai_ready')
    const isPremium = searchParams.get('is_premium')
    const search = searchParams.get('search') || undefined
    const projectId = searchParams.get('project_id') || undefined
    const toolId = searchParams.get('tool_id') || undefined
    const limit = parseInt(searchParams.get('limit') || '10')

    switch (type) {
      case 'projects': {
        const { data, error } = await getDesignProjects(user.id, {
          type: toolType,
          status,
          model,
          search
        })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'outputs': {
        if (!projectId) {
          return NextResponse.json({ error: 'project_id required' }, { status: 400 })
        }
        const { data, error } = await getDesignOutputs(projectId)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'templates': {
        const { data, error } = await getDesignTemplates({
          category,
          ai_ready: aiReady ? aiReady === 'true' : undefined,
          is_premium: isPremium ? isPremium === 'true' : undefined,
          search
        })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'popular-templates': {
        const { data, error } = await getPopularTemplates(limit)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'ai-ready-templates': {
        const { data, error } = await getAIReadyTemplates()
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'tools': {
        const { data, error } = await getAITools()
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'popular-tools': {
        const { data, error } = await getPopularAITools(limit)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'palettes': {
        const { data, error } = await getColorPalettes(user.id)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'tool-reviews': {
        if (!toolId) {
          return NextResponse.json({ error: 'tool_id required' }, { status: 400 })
        }
        const { data, error } = await getToolReviews(toolId)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'project-stats': {
        const { data, error } = await getDesignProjectStats(user.id)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'template-stats': {
        const { data, error } = await getTemplateStats()
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'tool-stats': {
        const { data, error } = await getAIToolStats()
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'user-analytics': {
        const { data, error } = await getUserProjectAnalytics(user.id)
        if (error) throw error
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('AI Design API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch AI Design data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...payload } = body

    switch (action) {
      case 'create-project': {
        const { data, error } = await createDesignProject(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-output': {
        const { data, error } = await createDesignOutput(payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-palette': {
        const { data, error } = await createColorPalette(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-tool-review': {
        const { tool_id, ...reviewData } = payload
        if (!tool_id) {
          return NextResponse.json({ error: 'tool_id required' }, { status: 400 })
        }
        const { data, error } = await createToolReview(tool_id, user.id, reviewData)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'track-analytics': {
        const { project_id, ...analytics } = payload
        if (!project_id) {
          return NextResponse.json({ error: 'project_id required' }, { status: 400 })
        }
        const { data, error } = await trackProjectAnalytics(project_id, analytics)
        if (error) throw error
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('AI Design API error', { error })
    return NextResponse.json(
      { error: 'Failed to process AI Design request' },
      { status: 500 }
    )
  }
}
