/**
 * Plugin Marketplace API Routes
 *
 * REST endpoints for Plugin Marketplace:
 * GET - List plugins, authors, reviews, installations, versions, analytics, stats
 * POST - Create plugin, author, review, installation, version, track download
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
  getAllPlugins,
  getPluginsByCategory,
  getPluginsByAuthor,
  getFeaturedPlugins,
  getTrendingPlugins,
  getPopularPlugins,
  getTopRatedPlugins,
  getFreePlugins,
  searchPlugins,
  createPlugin,
  getAllAuthors,
  getVerifiedAuthors,
  createAuthor,
  getReviewsByPlugin,
  getReviewsByUser,
  createReview,
  getInstallationsByUser,
  getActiveInstallations,
  createInstallation,
  isPluginInstalled,
  getVersionsByPlugin,
  getLatestVersion,
  createVersion,
  trackDownload,
  getPluginAnalytics,
  getMarketplaceStats,
  getUserPluginStats
} from '@/lib/plugin-marketplace-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'plugins'
    const category = searchParams.get('category') as string | null
    const authorId = searchParams.get('author_id')
    const pluginId = searchParams.get('plugin_id')
    const search = searchParams.get('search')
    const days = parseInt(searchParams.get('days') || '30')
    const limit = parseInt(searchParams.get('limit') || '10')

    switch (type) {
      case 'plugins': {
        let data
        if (category) {
          data = await getPluginsByCategory(category)
        } else if (authorId) {
          data = await getPluginsByAuthor(authorId)
        } else if (search) {
          data = await searchPlugins(search)
        } else {
          data = await getAllPlugins()
        }
        return NextResponse.json({ data })
      }

      case 'featured': {
        const data = await getFeaturedPlugins(limit)
        return NextResponse.json({ data })
      }

      case 'trending': {
        const data = await getTrendingPlugins(limit)
        return NextResponse.json({ data })
      }

      case 'popular': {
        const data = await getPopularPlugins(limit)
        return NextResponse.json({ data })
      }

      case 'top-rated': {
        const data = await getTopRatedPlugins(limit)
        return NextResponse.json({ data })
      }

      case 'free': {
        const data = await getFreePlugins()
        return NextResponse.json({ data })
      }

      case 'authors': {
        const verified = searchParams.get('verified') === 'true'
        const data = verified ? await getVerifiedAuthors() : await getAllAuthors()
        return NextResponse.json({ data })
      }

      case 'reviews': {
        if (pluginId) {
          const data = await getReviewsByPlugin(pluginId)
          return NextResponse.json({ data })
        } else {
          const data = await getReviewsByUser(user.id)
          return NextResponse.json({ data })
        }
      }

      case 'my-installations': {
        const active = searchParams.get('active') === 'true'
        const data = active
          ? await getActiveInstallations(user.id)
          : await getInstallationsByUser(user.id)
        return NextResponse.json({ data })
      }

      case 'is-installed': {
        if (!pluginId) {
          return NextResponse.json({ error: 'plugin_id required' }, { status: 400 })
        }
        const isInstalled = await isPluginInstalled(user.id, pluginId)
        return NextResponse.json({ data: { is_installed: isInstalled } })
      }

      case 'versions': {
        if (!pluginId) {
          return NextResponse.json({ error: 'plugin_id required' }, { status: 400 })
        }
        const data = await getVersionsByPlugin(pluginId)
        return NextResponse.json({ data })
      }

      case 'latest-version': {
        if (!pluginId) {
          return NextResponse.json({ error: 'plugin_id required' }, { status: 400 })
        }
        const data = await getLatestVersion(pluginId)
        return NextResponse.json({ data })
      }

      case 'analytics': {
        if (!pluginId) {
          return NextResponse.json({ error: 'plugin_id required' }, { status: 400 })
        }
        const data = await getPluginAnalytics(pluginId, days)
        return NextResponse.json({ data })
      }

      case 'marketplace-stats': {
        const data = await getMarketplaceStats()
        return NextResponse.json({ data })
      }

      case 'my-stats': {
        const data = await getUserPluginStats(user.id)
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Plugin Marketplace API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Plugin Marketplace data' },
      { status: 500 }
    )
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
      case 'create-plugin': {
        const data = await createPlugin(payload)
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-author': {
        const data = await createAuthor({ user_id: user.id, ...payload })
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-review': {
        const data = await createReview({
          plugin_id: payload.plugin_id,
          user_id: user.id,
          rating: payload.rating,
          title: payload.title,
          comment: payload.comment
        })
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'install-plugin': {
        const data = await createInstallation(user.id, {
          plugin_id: payload.plugin_id,
          version: payload.version,
          is_active: true,
          settings: payload.settings || {}
        })
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-version': {
        const data = await createVersion(payload)
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'track-download': {
        const data = await trackDownload({
          plugin_id: payload.plugin_id,
          user_id: user.id,
          version: payload.version
        })
        return NextResponse.json({ data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Plugin Marketplace API error', { error })
    return NextResponse.json(
      { error: 'Failed to process Plugin Marketplace request' },
      { status: 500 }
    )
  }
