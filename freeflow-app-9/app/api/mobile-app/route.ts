/**
 * Mobile App API Routes
 *
 * REST endpoints for Mobile App Management:
 * GET - List devices, screens, builds, templates, tests, stats
 * POST - Create device, screen, build, template, test
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('mobile-app')
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
  getDevicesByUser,
  createDevice,
  getDevicesByCategory,
  getDevicesByPlatform,
  getFavoriteDevices,
  getScreensByUser,
  createScreen,
  getScreensByType,
  getPublishedScreens,
  getScreenTemplates,
  getBuildsByUser,
  createBuild,
  getBuildsByStatus,
  getBuildsByPlatform,
  getDistributedBuilds,
  getAllTemplates,
  getPublishedTemplates,
  getTemplatesByCategory,
  getPremiumTemplates,
  getFreeTemplates,
  getTopRatedTemplates,
  getMostUsedTemplates,
  getTestsByUser,
  createTest,
  getTestsByScreen,
  getTestsByDevice,
  getTestsByBuild,
  getTestsByType,
  getTestsByStatus,
  getMobileAppStats,
  getDeviceStats,
  getScreenStats,
  getBuildStats,
  getTestStats
} from '@/lib/mobile-app-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'devices'
    const category = searchParams.get('category') as string | null
    const platform = searchParams.get('platform') as string | null
    const status = searchParams.get('status') as string | null
    const screenType = searchParams.get('screen_type') || undefined
    const testType = searchParams.get('test_type') || undefined
    const screenId = searchParams.get('screen_id') || undefined
    const deviceId = searchParams.get('device_id') || undefined
    const buildId = searchParams.get('build_id') || undefined
    const limit = parseInt(searchParams.get('limit') || '20')

    switch (type) {
      case 'devices': {
        let data
        if (category) {
          data = await getDevicesByCategory(user.id, category)
        } else if (platform) {
          data = await getDevicesByPlatform(user.id, platform)
        } else {
          data = await getDevicesByUser(user.id)
        }
        return NextResponse.json({ data })
      }

      case 'favorite-devices': {
        const data = await getFavoriteDevices(user.id)
        return NextResponse.json({ data })
      }

      case 'screens': {
        let data
        if (screenType) {
          data = await getScreensByType(user.id, screenType)
        } else {
          data = await getScreensByUser(user.id)
        }
        return NextResponse.json({ data })
      }

      case 'published-screens': {
        const data = await getPublishedScreens(user.id)
        return NextResponse.json({ data })
      }

      case 'screen-templates': {
        const data = await getScreenTemplates(user.id)
        return NextResponse.json({ data })
      }

      case 'builds': {
        let data
        if (status) {
          data = await getBuildsByStatus(user.id, status)
        } else if (platform) {
          data = await getBuildsByPlatform(user.id, platform)
        } else {
          data = await getBuildsByUser(user.id)
        }
        return NextResponse.json({ data })
      }

      case 'distributed-builds': {
        const data = await getDistributedBuilds(user.id)
        return NextResponse.json({ data })
      }

      case 'templates': {
        let data
        if (category) {
          data = await getTemplatesByCategory(category)
        } else {
          data = await getAllTemplates()
        }
        return NextResponse.json({ data })
      }

      case 'published-templates': {
        const data = await getPublishedTemplates()
        return NextResponse.json({ data })
      }

      case 'premium-templates': {
        const data = await getPremiumTemplates()
        return NextResponse.json({ data })
      }

      case 'free-templates': {
        const data = await getFreeTemplates()
        return NextResponse.json({ data })
      }

      case 'top-rated-templates': {
        const data = await getTopRatedTemplates(limit)
        return NextResponse.json({ data })
      }

      case 'popular-templates': {
        const data = await getMostUsedTemplates(limit)
        return NextResponse.json({ data })
      }

      case 'tests': {
        let data
        if (screenId) {
          data = await getTestsByScreen(screenId)
        } else if (deviceId) {
          data = await getTestsByDevice(deviceId)
        } else if (buildId) {
          data = await getTestsByBuild(buildId)
        } else if (testType) {
          data = await getTestsByType(user.id, testType)
        } else if (status) {
          data = await getTestsByStatus(user.id, status)
        } else {
          data = await getTestsByUser(user.id)
        }
        return NextResponse.json({ data })
      }

      case 'stats': {
        const data = await getMobileAppStats(user.id)
        return NextResponse.json({ data })
      }

      case 'device-stats': {
        const data = await getDeviceStats(user.id)
        return NextResponse.json({ data })
      }

      case 'screen-stats': {
        const data = await getScreenStats(user.id)
        return NextResponse.json({ data })
      }

      case 'build-stats': {
        const data = await getBuildStats(user.id)
        return NextResponse.json({ data })
      }

      case 'test-stats': {
        const data = await getTestStats(user.id)
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Mobile App API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Mobile App data' },
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
      case 'create-device': {
        const data = await createDevice(user.id, payload)
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-screen': {
        const data = await createScreen(user.id, payload)
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-build': {
        const data = await createBuild(user.id, payload)
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-test': {
        const data = await createTest(user.id, payload)
        return NextResponse.json({ data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Mobile App API error', { error })
    return NextResponse.json(
      { error: 'Failed to process Mobile App request' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, id, ...updates } = body

    if (!type || !id) {
      return NextResponse.json({ error: 'Type and ID required' }, { status: 400 })
    }

    const tableMap: Record<string, string> = {
      'device': 'mobile_devices',
      'screen': 'mobile_screens',
      'build': 'mobile_builds',
      'test': 'mobile_tests'
    }

    const table = tableMap[type]
    if (!table) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from(table)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    logger.info('Mobile app item updated', { type, id })
    return NextResponse.json({ data })

  } catch (error) {
    logger.error('Mobile App PATCH error', { error })
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    if (!type || !id) {
      return NextResponse.json({ error: 'Type and ID required' }, { status: 400 })
    }

    const tableMap: Record<string, string> = {
      'device': 'mobile_devices',
      'screen': 'mobile_screens',
      'build': 'mobile_builds',
      'test': 'mobile_tests'
    }

    const table = tableMap[type]
    if (!table) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    logger.info('Mobile app item deleted', { type, id })
    return NextResponse.json({ success: true, message: `${type} deleted successfully` })

  } catch (error) {
    logger.error('Mobile App DELETE error', { error })
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
  }
}
