/**
 * Mobile App API - Single Resource Routes
 *
 * GET - Get single device, screen, build, template, test
 * PUT - Update device, screen, build, template, test, toggle favorite
 * DELETE - Delete device, screen, build, template, test
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('mobile-app')
import {
  getDevice,
  updateDevice,
  deleteDevice,
  toggleDeviceFavorite,
  getScreen,
  updateScreen,
  deleteScreen,
  getBuild,
  updateBuild,
  deleteBuild,
  startBuild,
  completeBuild,
  failBuild,
  cancelBuild,
  getTemplate,
  updateTemplate,
  deleteTemplate,
  getTest,
  updateTest,
  deleteTest,
  startTest,
  passTest,
  failTest
} from '@/lib/mobile-app-queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'device'

    switch (type) {
      case 'device': {
        const data = await getDevice(id)
        if (!data) {
          return NextResponse.json({ error: 'Device not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      case 'screen': {
        const data = await getScreen(id)
        if (!data) {
          return NextResponse.json({ error: 'Screen not found' }, { status: 404 })
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

      case 'template': {
        const data = await getTemplate(id)
        if (!data) {
          return NextResponse.json({ error: 'Template not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      case 'test': {
        const data = await getTest(id)
        if (!data) {
          return NextResponse.json({ error: 'Test not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Mobile App API error', { error })
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
      case 'device': {
        if (action === 'toggle-favorite') {
          const data = await toggleDeviceFavorite(id, updates.is_favorite)
          return NextResponse.json({ data })
        } else {
          const data = await updateDevice(id, updates)
          return NextResponse.json({ data })
        }
      }

      case 'screen': {
        const data = await updateScreen(id, updates)
        return NextResponse.json({ data })
      }

      case 'build': {
        if (action === 'start') {
          const data = await startBuild(id)
          return NextResponse.json({ data })
        } else if (action === 'complete') {
          const data = await completeBuild(id, updates.output_url, updates.build_size)
          return NextResponse.json({ data })
        } else if (action === 'fail') {
          const data = await failBuild(id, updates.error_message, updates.build_log)
          return NextResponse.json({ data })
        } else if (action === 'cancel') {
          const data = await cancelBuild(id)
          return NextResponse.json({ data })
        } else {
          const data = await updateBuild(id, updates)
          return NextResponse.json({ data })
        }
      }

      case 'template': {
        const data = await updateTemplate(id, updates)
        return NextResponse.json({ data })
      }

      case 'test': {
        if (action === 'start') {
          const data = await startTest(id)
          return NextResponse.json({ data })
        } else if (action === 'pass') {
          const data = await passTest(id, updates.passed_checks, updates.result)
          return NextResponse.json({ data })
        } else if (action === 'fail') {
          const data = await failTest(id, updates.failed_checks, updates.errors, updates.result)
          return NextResponse.json({ data })
        } else {
          const data = await updateTest(id, updates)
          return NextResponse.json({ data })
        }
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Mobile App API error', { error })
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
    const type = searchParams.get('type') || 'device'

    switch (type) {
      case 'device': {
        await deleteDevice(id)
        break
      }

      case 'screen': {
        await deleteScreen(id)
        break
      }

      case 'build': {
        await deleteBuild(id)
        break
      }

      case 'template': {
        await deleteTemplate(id)
        break
      }

      case 'test': {
        await deleteTest(id)
        break
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Mobile App API error', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
