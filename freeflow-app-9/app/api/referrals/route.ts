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

const logger = createSimpleLogger('referrals')

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'list':
      default: {
        const { data, error } = await supabase
          .from('referrals')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'export': {
        const format = searchParams.get('format') || 'json'
        const { data, error } = await supabase
          .from('referrals')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        if (format === 'csv') {
          const csv = [
            'Name,Email,Status,Commission,Date',
            ...(data || []).map(r => `${r.name},${r.email},${r.status},${r.commission},${r.created_at}`)
          ].join('\n')
          return new NextResponse(csv, {
            headers: { 'Content-Type': 'text/csv' }
          })
        }

        return NextResponse.json({ data })
      }

      case 'settings': {
        const { data, error } = await supabase
          .from('referral_settings')
          .select('*')
          .single()

        if (error && error.code !== 'PGRST116') throw error
        return NextResponse.json({ data: data || {} })
      }

      case 'refresh': {
        const { data, error } = await supabase
          .from('referrals')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ data, refreshed: true })
      }
    }
  } catch (error) {
    logger.error('Referrals API error', { error })
    return NextResponse.json(
      { error: error.message || 'Failed to fetch referrals' },
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
        const { name, email, company, notes } = body
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('referrals')
          .insert({
            user_id: user?.id,
            name,
            email,
            company,
            notes,
            status: 'pending',
            commission: 0
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'payout': {
        const { amount, method } = body
        const { data: { user } } = await supabase.auth.getUser()

        // Record payout request
        const { data, error } = await supabase
          .from('referral_payouts')
          .insert({
            user_id: user?.id,
            amount,
            method,
            status: 'pending'
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'save_settings': {
        const { settings } = body
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('referral_settings')
          .upsert({
            user_id: user?.id,
            ...settings
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'send_reminder': {
        const { referralId, email } = body
        // In production, this would send an actual email
        return NextResponse.json({ success: true, email })
      }

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Referrals API error', { error })
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    )
  }
}
