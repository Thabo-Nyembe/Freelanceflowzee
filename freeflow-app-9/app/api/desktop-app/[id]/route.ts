/**
 * Desktop App API - Single Resource Routes
 *
 * GET - Get single project, build, distribution, framework
 * PUT - Update project, build, distribution, archive/unarchive project
 * DELETE - Delete project, build, distribution
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'
import {
  getProject,
  updateProject,
  deleteProject,
  archiveProject,
  unarchiveProject,
  getBuild,
  updateBuild,
  deleteBuild,
  startBuild,
  completeBuild,
  failBuild,
  cancelBuild,
  signBuild,
  getDistribution,
  updateDistribution,
  deleteDistribution,
  submitDistribution,
  approveDistribution,
  rejectDistribution,
  publishDistribution,
  unpublishDistribution,
  getFramework
} from '@/lib/desktop-app-queries'

const logger = createFeatureLogger('desktop-app')

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
        const data = await getProject(id)
        if (!data) {
          return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      case 'build': {
        const data = await getBuild(id)
        if (!data) {
          return NextResponse.json({ error: 'Build not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      case 'distribution': {
        const data = await getDistribution(id)
        if (!data) {
          return NextResponse.json({ error: 'Distribution not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      case 'framework': {
        const data = await getFramework(id as any)
        if (!data) {
          return NextResponse.json({ error: 'Framework not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Desktop App GET error', { error })
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
        if (action === 'archive') {
          const data = await archiveProject(id)
          return NextResponse.json({ data })
        } else if (action === 'unarchive') {
          const data = await unarchiveProject(id)
          return NextResponse.json({ data })
        } else {
          const data = await updateProject(id, updates)
          return NextResponse.json({ data })
        }
      }

      case 'build': {
        if (action === 'start') {
          const data = await startBuild(id)
          return NextResponse.json({ data })
        } else if (action === 'complete') {
          const data = await completeBuild(id, updates.installer_url, updates.output_size, updates.portable_url)
          return NextResponse.json({ data })
        } else if (action === 'fail') {
          const data = await failBuild(id, updates.error_message, updates.build_log)
          return NextResponse.json({ data })
        } else if (action === 'cancel') {
          const data = await cancelBuild(id)
          return NextResponse.json({ data })
        } else if (action === 'sign') {
          const data = await signBuild(id, updates.certificate)
          return NextResponse.json({ data })
        } else {
          const data = await updateBuild(id, updates)
          return NextResponse.json({ data })
        }
      }

      case 'distribution': {
        if (action === 'submit') {
          const data = await submitDistribution(id, updates.review_notes)
          return NextResponse.json({ data })
        } else if (action === 'approve') {
          const data = await approveDistribution(id)
          return NextResponse.json({ data })
        } else if (action === 'reject') {
          const data = await rejectDistribution(id, updates.reason)
          return NextResponse.json({ data })
        } else if (action === 'publish') {
          const data = await publishDistribution(id)
          return NextResponse.json({ data })
        } else if (action === 'unpublish') {
          const data = await unpublishDistribution(id)
          return NextResponse.json({ data })
        } else {
          const data = await updateDistribution(id, updates)
          return NextResponse.json({ data })
        }
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Desktop App PUT error', { error })
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
        await deleteProject(id)
        break
      }

      case 'build': {
        await deleteBuild(id)
        break
      }

      case 'distribution': {
        await deleteDistribution(id)
        break
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Desktop App DELETE error', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
