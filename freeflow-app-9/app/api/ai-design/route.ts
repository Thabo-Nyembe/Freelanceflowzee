/**
 * AI Design Studio API Routes
 *
 * REST endpoints for AI Design Studio:
 * GET - List projects, outputs, templates, tools, palettes, stats
 * POST - Create project, output, palette, review, track analytics
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
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
    const toolType = searchParams.get('tool_type') as any
    const status = searchParams.get('status') as any
    const model = searchParams.get('model') as any
    const category = searchParams.get('category') as any
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
    console.error('AI Design API error:', error)
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
    console.error('AI Design API error:', error)
    return NextResponse.json(
      { error: 'Failed to process AI Design request' },
      { status: 500 }
    )
  }
}
