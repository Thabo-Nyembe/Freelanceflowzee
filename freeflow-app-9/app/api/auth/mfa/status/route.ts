/**
 * MFA Status API
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { mfaService } from '@/lib/auth/mfa-service'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('mfa-status')

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

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const status = await mfaService.getStatus(user.id)

    return NextResponse.json(status)
  } catch (error) {
    logger.error('MFA status error', { error })
    return NextResponse.json(
      { error: 'Failed to get MFA status' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json(
        { error: 'Password required to disable MFA' },
        { status: 400 }
      )
    }

    const result = await mfaService.disable(user.id, password)

    return NextResponse.json(result)
  } catch (error) {
    logger.error('MFA disable error', { error })
    return NextResponse.json(
      { error: 'Failed to disable MFA' },
      { status: 500 }
    )
  }
}
