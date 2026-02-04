/**
 * Projects Hub API - Single Resource Routes
 *
 * GET - Get single project
 * PUT - Update project, toggle star/pin, update status/progress
 * DELETE - Delete project, template, import
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('projects-hub')
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
  getProject,
  updateProject,
  deleteProject,
  updateProjectStatus,
  toggleProjectStar,
  toggleProjectPin,
  updateProjectProgress,
  updateImportStatus,
  retryImport,
  deleteImport,
  disconnectImportSource
} from '@/lib/projects-hub-queries'

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
        const { data, error } = await getProject(id)
        if (error || !data) {
          return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Projects Hub API error', { error })
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
        if (action === 'toggle-star') {
          const { data, error } = await toggleProjectStar(id, updates.is_starred)
          if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
          }
          return NextResponse.json({ data })
        } else if (action === 'toggle-pin') {
          const { data, error } = await toggleProjectPin(id, updates.is_pinned)
          if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
          }
          return NextResponse.json({ data })
        } else if (action === 'update-status') {
          const { data, error } = await updateProjectStatus(id, updates.status)
          if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
          }
          return NextResponse.json({ data })
        } else if (action === 'update-progress') {
          const { data, error } = await updateProjectProgress(id, updates.progress)
          if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
          }
          return NextResponse.json({ data })
        } else {
          const { data, error } = await updateProject(id, updates)
          if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
          }
          return NextResponse.json({ data })
        }
      }

      case 'import': {
        if (action === 'update-status') {
          const { data, error } = await updateImportStatus(id, updates.status, updates.error_message)
          if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
          }
          return NextResponse.json({ data })
        } else if (action === 'retry') {
          const { data, error } = await retryImport(user.id, id)
          if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
          }
          return NextResponse.json({ data })
        }
        return NextResponse.json({ error: 'Invalid action for import' }, { status: 400 })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Projects Hub API error', { error })
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
        const { success, error } = await deleteProject(id)
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 })
        }
        return NextResponse.json({ success })
      }

      case 'import': {
        const { success, error } = await deleteImport(user.id, id)
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 })
        }
        return NextResponse.json({ success })
      }

      case 'import-source': {
        const { success, error } = await disconnectImportSource(user.id, id)
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 })
        }
        return NextResponse.json({ success })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Projects Hub API error', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
