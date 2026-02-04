/**
 * AI Design Studio API - Single Resource Routes
 *
 * GET - Get single project, template, palette
 * PUT - Update project, status, variation, quality score, palette, review
 * DELETE - Delete project, output, palette, review
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
  getDesignProject,
  updateDesignProject,
  deleteDesignProject,
  updateProjectStatus,
  setSelectedVariation,
  addProjectQualityScore,
  archiveDesignProject,
  selectDesignOutput,
  incrementOutputDownloads,
  deleteDesignOutput,
  getDesignTemplate,
  incrementTemplateUses,
  getColorPalette,
  incrementPaletteUses,
  deleteColorPalette,
  incrementToolUses,
  updateToolReview,
  deleteToolReview,
  getProjectAnalytics
} from '@/lib/ai-design-queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'project'

    switch (type) {
      case 'project': {
        const { data, error } = await getDesignProject(id)
        if (error) throw error
        if (!data) {
          return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      case 'template': {
        const { data, error } = await getDesignTemplate(id)
        if (error) throw error
        if (!data) {
          return NextResponse.json({ error: 'Template not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      case 'palette': {
        const { data, error } = await getColorPalette(id)
        if (error) throw error
        if (!data) {
          return NextResponse.json({ error: 'Palette not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      case 'project-analytics': {
        const fromDate = searchParams.get('from') || undefined
        const toDate = searchParams.get('to') || undefined
        const { data, error } = await getProjectAnalytics(
          id,
          fromDate && toDate ? { from: fromDate, to: toDate } : undefined
        )
        if (error) throw error
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('AI Design API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, action, ...updates } = body

    switch (type) {
      case 'project': {
        if (action === 'update-status') {
          const { data, error } = await updateProjectStatus(id, updates.status, updates.progress)
          if (error) throw error
          return NextResponse.json({ data })
        } else if (action === 'set-variation') {
          const { data, error } = await setSelectedVariation(id, updates.variation_number)
          if (error) throw error
          return NextResponse.json({ data })
        } else if (action === 'add-quality-score') {
          const { data, error } = await addProjectQualityScore(id, updates.quality_score, updates.feedback)
          if (error) throw error
          return NextResponse.json({ data })
        } else if (action === 'archive') {
          const { data, error } = await archiveDesignProject(id)
          if (error) throw error
          return NextResponse.json({ data })
        } else {
          const { data, error } = await updateDesignProject(id, updates)
          if (error) throw error
          return NextResponse.json({ data })
        }
      }

      case 'output': {
        if (action === 'select') {
          const { error } = await selectDesignOutput(id, updates.variation_number)
          if (error) throw error
          return NextResponse.json({ success: true })
        } else if (action === 'download') {
          const { data, error } = await incrementOutputDownloads(id)
          if (error) throw error
          return NextResponse.json({ data })
        }
        return NextResponse.json({ error: 'Invalid action for output' }, { status: 400 })
      }

      case 'template': {
        if (action === 'use') {
          const { data, error } = await incrementTemplateUses(id)
          if (error) throw error
          return NextResponse.json({ data })
        }
        return NextResponse.json({ error: 'Invalid action for template' }, { status: 400 })
      }

      case 'palette': {
        if (action === 'use') {
          const { data, error } = await incrementPaletteUses(id)
          if (error) throw error
          return NextResponse.json({ data })
        }
        return NextResponse.json({ error: 'Invalid action for palette' }, { status: 400 })
      }

      case 'tool': {
        if (action === 'use') {
          const { data, error } = await incrementToolUsesid
          if (error) throw error
          return NextResponse.json({ data })
        }
        return NextResponse.json({ error: 'Invalid action for tool' }, { status: 400 })
      }

      case 'review': {
        const { data, error } = await updateToolReview(id, updates)
        if (error) throw error
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('AI Design API error', { error })
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'project'

    switch (type) {
      case 'project': {
        const { error } = await deleteDesignProject(id)
        if (error) throw error
        break
      }

      case 'output': {
        const { error } = await deleteDesignOutput(id)
        if (error) throw error
        break
      }

      case 'palette': {
        const { error } = await deleteColorPalette(id)
        if (error) throw error
        break
      }

      case 'review': {
        const { error } = await deleteToolReview(id)
        if (error) throw error
        break
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('AI Design API error', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
