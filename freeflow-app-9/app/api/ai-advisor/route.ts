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

const logger = createFeatureLogger('ai-advisor')

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'insights': {
        const { data, error } = await supabase
          .from('ai_insights')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) throw error
        return NextResponse.json({ data, refreshedAt: new Date().toISOString() })
      }

      case 'export': {
        const format = searchParams.get('format') || 'json'
        const { data, error } = await supabase
          .from('ai_insights')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        if (format === 'csv') {
          const csv = [
            'Title,Category,Priority,Impact,CreatedAt',
            ...(data || []).map(i => `${i.title},${i.category},${i.priority},${i.impact},${i.created_at}`)
          ].join('\n')
          return new NextResponse(csv, {
            headers: { 'Content-Type': 'text/csv' }
          })
        }

        return NextResponse.json({ data })
      }

      default: {
        const { data, error } = await supabase
          .from('ai_insights')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ data })
      }
    }
  } catch (error) {
    logger.error('AI Advisor API error', { error })
    return NextResponse.json(
      { error: error.message || 'Failed to fetch insights' },
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
      case 'implement_opportunity': {
        const { opportunityId, title } = body
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('implementation_plans')
          .insert({
            user_id: user?.id,
            opportunity_id: opportunityId,
            title,
            status: 'draft',
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'share_insight': {
        const { email, insightId, message } = body
        // In production, this would send an email
        return NextResponse.json({ success: true, email, insightId })
      }

      case 'generate_report': {
        const { data: { user } } = await supabase.auth.getUser()

        const { data: insights, error } = await supabase
          .from('ai_insights')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) throw error

        const report = {
          generatedAt: new Date().toISOString(),
          userId: user?.id,
          totalInsights: (insights || []).length,
          summary: 'AI Business Report generated successfully',
          recommendations: insights?.slice(0, 5).map(i => i.title) || []
        }

        return NextResponse.json({ data: report })
      }

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('AI Advisor API error', { error })
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    )
  }
}
