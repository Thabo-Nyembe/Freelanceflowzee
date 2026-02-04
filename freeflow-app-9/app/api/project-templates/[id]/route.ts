/**
 * Project Templates API - Single Resource Routes
 *
 * GET - Get single template, by slug, complete template with all data
 * PUT - Update template, task, milestone, deliverable, pricing, duplicate
 * DELETE - Delete template, task, milestone, deliverable, pricing, favorite
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('project-templates-id')
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
  getTemplateById,
  getTemplateBySlug,
  getCompleteTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
  updateTemplateTask,
  deleteTemplateTask,
  updateTemplateMilestone,
  deleteTemplateMilestone,
  updateTemplateDeliverable,
  deleteTemplateDeliverable,
  updatePricingTier,
  deletePricingTier,
  removeFavorite,
  isTemplateFavorited,
  getUserReview
} from '@/lib/project-templates-queries'

export async function GET(
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
    const type = searchParams.get('type') || 'template'

    switch (type) {
      case 'template': {
        const result = await getTemplateById(id)
        if (!result) {
          return NextResponse.json({ error: 'Template not found' }, { status: 404 })
        }
        return NextResponse.json({ data: result })
      }

      case 'slug': {
        const result = await getTemplateBySlug(id)
        if (!result) {
          return NextResponse.json({ error: 'Template not found' }, { status: 404 })
        }
        return NextResponse.json({ data: result })
      }

      case 'complete': {
        const result = await getCompleteTemplate(id)
        if (!result.template) {
          return NextResponse.json({ error: 'Template not found' }, { status: 404 })
        }
        return NextResponse.json({ data: result })
      }

      case 'is-favorited': {
        const result = await isTemplateFavorited(id, user.id)
        return NextResponse.json({ data: { is_favorited: result } })
      }

      case 'user-review': {
        const result = await getUserReview(id, user.id)
        return NextResponse.json({ data: result })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Project Templates API error', { error })
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
      case 'template': {
        if (action === 'duplicate') {
          const result = await duplicateTemplate(id, updates.new_name)
          return NextResponse.json({ data: result })
        } else {
          const result = await updateTemplate(id, updates)
          return NextResponse.json({ data: result })
        }
      }

      case 'task': {
        const result = await updateTemplateTask(id, updates)
        return NextResponse.json({ data: result })
      }

      case 'milestone': {
        const result = await updateTemplateMilestone(id, updates)
        return NextResponse.json({ data: result })
      }

      case 'deliverable': {
        const result = await updateTemplateDeliverable(id, updates)
        return NextResponse.json({ data: result })
      }

      case 'pricing': {
        const result = await updatePricingTier(id, updates)
        return NextResponse.json({ data: result })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Project Templates API error', { error })
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
    const type = searchParams.get('type') || 'template'

    switch (type) {
      case 'template': {
        await deleteTemplate(id)
        return NextResponse.json({ success: true })
      }

      case 'task': {
        await deleteTemplateTask(id)
        return NextResponse.json({ success: true })
      }

      case 'milestone': {
        await deleteTemplateMilestone(id)
        return NextResponse.json({ success: true })
      }

      case 'deliverable': {
        await deleteTemplateDeliverable(id)
        return NextResponse.json({ success: true })
      }

      case 'pricing': {
        await deletePricingTier(id)
        return NextResponse.json({ success: true })
      }

      case 'favorite': {
        await removeFavorite(id, user.id)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Project Templates API error', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
