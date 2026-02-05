import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('features-notify')

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

/**
 * POST /api/features/notify - Subscribe to feature launch notifications
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const body = await request.json()
        const { email, user_id, feature, source } = body

        // Validate input
        if (!email && !user_id) {
            return NextResponse.json({
                success: false,
                error: 'Email or user ID required'
            }, { status: 400 })
        }

        // Insert notification subscription
        const { data, error } = await supabase
            .from('feature_notifications')
            .insert({
                user_id,
                email,
                feature: feature || 'general',
                source: source || 'manual',
                subscribed_at: new Date().toISOString(),
                status: 'active'
            })
            .select()
            .single()

        if (error) {
            // If table doesn't exist, create a fallback notification log
            if (error.code === '42P01') {
                // Table doesn't exist - log to console for now
                logger.info('Feature notification subscription', { email, user_id, feature, source })
                return NextResponse.json({
                    success: true,
                    message: 'Subscription received (logging mode)',
                    data: { email, feature }
                })
            }
            throw error
        }

        return NextResponse.json({
            success: true,
            message: 'Successfully subscribed to notifications',
            data
        })
    } catch (error) {
        logger.error('Feature notify error', { error })
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to subscribe'
        }, { status: 500 })
    }
}
