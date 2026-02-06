/**
 * Plugin Marketplace API - Single Resource Routes
 *
 * GET - Get single plugin, author, review, installation, plugin stats
 * PUT - Update plugin, author, review, installation, activate/deactivate, mark helpful
 * DELETE - Delete plugin, author, review, uninstall
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('plugin-marketplace')

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
  getPlugin,
  getPluginBySlug,
  updatePlugin,
  deletePlugin,
  incrementPluginViews,
  getAuthor,
  updateAuthor,
  deleteAuthor,
  getReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getInstallation,
  updateInstallation,
  deleteInstallation,
  deleteInstallationByPluginId,
  activatePlugin,
  deactivatePlugin,
  getPluginStats
} from '@/lib/plugin-marketplace-queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'plugin'
    const bySlug = searchParams.get('by_slug') === 'true'

    switch (type) {
      case 'plugin': {
        const data = bySlug ? await getPluginBySlug(id) : await getPlugin(id)
        if (!data) {
          return NextResponse.json({ error: 'Plugin not found' }, { status: 404 })
        }
        // Track view
        await incrementPluginViews(data.id)
        return NextResponse.json({ data })
      }

      case 'author': {
        const data = await getAuthor(id)
        if (!data) {
          return NextResponse.json({ error: 'Author not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      case 'review': {
        const data = await getReview(id)
        if (!data) {
          return NextResponse.json({ error: 'Review not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      case 'installation': {
        const data = await getInstallation(id)
        if (!data) {
          return NextResponse.json({ error: 'Installation not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      case 'plugin-stats': {
        const data = await getPluginStats(id)
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Plugin Marketplace API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    )
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
      case 'plugin': {
        const data = await updatePlugin(id, updates)
        return NextResponse.json({ data })
      }

      case 'author': {
        const data = await updateAuthor(id, updates)
        return NextResponse.json({ data })
      }

      case 'review': {
        if (action === 'mark-helpful') {
          const data = await markReviewHelpful(id)
          return NextResponse.json({ data })
        } else {
          const data = await updateReview(id, updates)
          return NextResponse.json({ data })
        }
      }

      case 'installation': {
        if (action === 'activate') {
          const data = await activatePlugin(id)
          return NextResponse.json({ data })
        } else if (action === 'deactivate') {
          const data = await deactivatePlugin(id)
          return NextResponse.json({ data })
        } else {
          const data = await updateInstallation(id, updates)
          return NextResponse.json({ data })
        }
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Plugin Marketplace API error', { error })
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    )
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
    const type = searchParams.get('type') || 'plugin'

    switch (type) {
      case 'plugin': {
        await deletePlugin(id)
        return NextResponse.json({ success: true })
      }

      case 'author': {
        await deleteAuthor(id)
        return NextResponse.json({ success: true })
      }

      case 'review': {
        await deleteReview(id)
        return NextResponse.json({ success: true })
      }

      case 'installation': {
        await deleteInstallation(id)
        return NextResponse.json({ success: true })
      }

      case 'uninstall-plugin': {
        // id here is plugin_id, uninstall for current user
        const result = await deleteInstallationByPluginId(user.id, id)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Plugin Marketplace API error', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
