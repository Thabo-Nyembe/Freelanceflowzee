import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createFeatureLogger } from '@/lib/logger'

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

const logger = createFeatureLogger('ai-content')

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'history': {
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('ai_content')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'templates': {
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('ai_content_templates')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'settings': {
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('ai_content_settings')
          .select('*')
          .eq('user_id', user?.id)
          .single()

        if (error && error.code !== 'PGRST116') throw error

        return NextResponse.json({
          data: data || {
            aiModel: 'gpt-4',
            autoSaveEnabled: true,
            defaultTone: 'professional',
            maxTokens: 2000
          }
        })
      }

      case 'export': {
        const format = searchParams.get('format') || 'json'
        const includeMetadata = searchParams.get('includeMetadata') === 'true'
        const dateRange = searchParams.get('dateRange') || 'all'
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('ai_content')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        const exportData = {
          exportedAt: new Date().toISOString(),
          format,
          includeMetadata,
          dateRange,
          content: data
        }

        if (format === 'csv') {
          const csvRows = ['ID,Title,Type,Platform,Created At']
          data?.forEach(item => {
            csvRows.push(`"${item.id}","${item.title}","${item.content_type}","${item.platform || 'N/A'}","${item.created_at}"`)
          })
          return new NextResponse(csvRows.join('\n'), {
            headers: {
              'Content-Type': 'text/csv',
              'Content-Disposition': `attachment; filename="ai-content-export-${Date.now()}.csv"`
            }
          })
        }

        return NextResponse.json({ data: exportData })
      }

      default: {
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('ai_content')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) throw error
        return NextResponse.json({ data })
      }
    }
  } catch (error) {
    logger.error('AI Content API error', { error })
    return NextResponse.json(
      { error: error.message || 'Failed to fetch AI content' },
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
        const { title, type, description, content } = body
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('ai_content')
          .insert({
            user_id: user?.id,
            title,
            content_type: type || 'social-post',
            description,
            content: content || '',
            status: 'draft'
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'save_settings': {
        const { aiModel, autoSaveEnabled, defaultTone, maxTokens } = body
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('ai_content_settings')
          .upsert({
            user_id: user?.id,
            ai_model: aiModel,
            auto_save_enabled: autoSaveEnabled,
            default_tone: defaultTone,
            max_tokens: parseInt(maxTokens) || 2000,
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'share': {
        const { email, message, permission, contentId } = body
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('ai_content_shares')
          .insert({
            user_id: user?.id,
            content_id: contentId,
            shared_with_email: email,
            message,
            permission: permission || 'view'
          })
          .select()
          .single()

        if (error && error.code !== '42P01') throw error
        return NextResponse.json({ success: true, sharedWith: email })
      }

      case 'schedule': {
        const { contentId, date, time, platform } = body
        const { data: { user } } = await supabase.auth.getUser()

        const scheduledAt = new Date(`${date}T${time}`).toISOString()

        const { data, error } = await supabase
          .from('ai_content_schedule')
          .insert({
            user_id: user?.id,
            content_id: contentId,
            scheduled_at: scheduledAt,
            platform,
            status: 'scheduled'
          })
          .select()
          .single()

        if (error && error.code !== '42P01') throw error
        return NextResponse.json({ success: true, scheduledAt, platform })
      }

      case 'save_template': {
        const { name, category, content, settings } = body
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('ai_content_templates')
          .insert({
            user_id: user?.id,
            name,
            category: category || 'social',
            content,
            settings: settings || {}
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('AI Content API error', { error })
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    )
  }
}
