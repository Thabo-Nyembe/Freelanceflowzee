import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
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

const logger = createSimpleLogger('canvas')

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'projects': {
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('canvas_projects')
          .select('*')
          .eq('user_id', user?.id)
          .order('updated_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'export': {
        const format = searchParams.get('format') || 'png'
        const canvasId = searchParams.get('canvasId')

        const { data, error } = await supabase
          .from('canvas_projects')
          .select('*')
          .eq('id', canvasId)
          .single()

        if (error) throw error

        return NextResponse.json({
          data,
          exportFormat: format,
          downloadUrl: data?.thumbnail_url
        })
      }

      case 'settings': {
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('canvas_settings')
          .select('*')
          .eq('user_id', user?.id)
          .single()

        if (error && error.code !== 'PGRST116') throw error

        return NextResponse.json({
          data: data || {
            defaultSize: '1920x1080',
            gridEnabled: true,
            gridSize: 20,
            autoSave: true
          }
        })
      }

      default: {
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('canvas_projects')
          .select('*')
          .eq('user_id', user?.id)
          .order('updated_at', { ascending: false })
          .limit(10)

        if (error) throw error
        return NextResponse.json({ data })
      }
    }
  } catch (error) {
    logger.error('Canvas API error', { error })
    return NextResponse.json(
      { error: error.message || 'Failed to fetch canvas data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'create': {
        const { name, width, height } = body
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('canvas_projects')
          .insert({
            user_id: user?.id,
            name: name || 'Untitled Canvas',
            width: width || 1920,
            height: height || 1080,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'update': {
        const { canvasId, name, thumbnail_url, content } = body

        const { data, error } = await supabase
          .from('canvas_projects')
          .update({
            name,
            thumbnail_url,
            content,
            updated_at: new Date().toISOString()
          })
          .eq('id', canvasId)
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'update_settings': {
        const { settings } = body
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('canvas_settings')
          .upsert({
            user_id: user?.id,
            ...settings,
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'delete': {
        const { canvasId } = body

        const { error } = await supabase
          .from('canvas_projects')
          .delete()
          .eq('id', canvasId)

        if (error) throw error
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Canvas API error', { error })
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    )
  }
}
