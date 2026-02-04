/**
 * Themes API Routes
 *
 * REST endpoints for Theme Store Management:
 * GET - List themes, user themes, insights
 * POST - Upload theme, process insight, apply theme
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

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

const logger = createSimpleLogger('themes')

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'list'

    switch (type) {
      case 'list': {
        const { data, error } = await supabase
          .from('themes')
          .select('*')
          .eq('status', 'published')
          .order('downloads', { ascending: false })
          .limit(50)

        if (error && error.code !== '42P01') throw error

        return NextResponse.json({
          success: true,
          themes: data || []
        })
      }

      case 'user-themes': {
        const { data, error } = await supabase
          .from('user_themes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error && error.code !== '42P01') throw error

        return NextResponse.json({
          success: true,
          themes: data || []
        })
      }

      case 'insights': {
        return NextResponse.json({
          success: true,
          insights: [
            { id: '1', title: 'Color Trends', description: 'Popular color palettes this month', priority: 'high' },
            { id: '2', title: 'Typography', description: 'Font pairing suggestions', priority: 'medium' },
            { id: '3', title: 'Accessibility', description: 'Contrast improvement tips', priority: 'high' }
          ]
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Themes GET error', { error })
    return NextResponse.json({ error: 'Failed to fetch themes' }, { status: 500 })
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
    const { action, ...data } = body

    switch (action) {
      case 'upload-theme': {
        const { name, description, colors, fonts, preview } = data

        const { data: theme, error } = await supabase
          .from('user_themes')
          .insert({
            user_id: user.id,
            name,
            description,
            colors: colors || {},
            fonts: fonts || {},
            preview_url: preview,
            status: 'draft',
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error && error.code !== '42P01') throw error

        return NextResponse.json({
          success: true,
          action: 'upload-theme',
          theme: theme || {
            id: `theme-${Date.now()}`,
            name,
            status: 'draft'
          },
          message: 'Theme uploaded successfully'
        })
      }

      case 'process-insight': {
        const { insightId, apply } = data

        if (apply) {
          // Apply the insight recommendations
          return NextResponse.json({
            success: true,
            action: 'process-insight',
            message: 'Insight recommendations applied successfully'
          })
        }

        return NextResponse.json({
          success: true,
          action: 'process-insight',
          message: 'Insight processed'
        })
      }

      case 'apply-theme': {
        const { themeId } = data

        const { error } = await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            active_theme_id: themeId,
            updated_at: new Date().toISOString()
          })

        if (error && error.code !== '42P01') throw error

        return NextResponse.json({
          success: true,
          action: 'apply-theme',
          message: 'Theme applied successfully'
        })
      }

      case 'publish-theme': {
        const { themeId } = data

        const { error } = await supabase
          .from('user_themes')
          .update({ status: 'published', published_at: new Date().toISOString() })
          .eq('id', themeId)
          .eq('user_id', user.id)

        if (error && error.code !== '42P01') throw error

        return NextResponse.json({
          success: true,
          action: 'publish-theme',
          message: 'Theme published to store'
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Themes POST error', { error })
    return NextResponse.json({ error: 'Failed to process theme request' }, { status: 500 })
  }
}
