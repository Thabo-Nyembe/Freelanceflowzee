/**
 * MFA Verification API
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { mfaService } from '@/lib/auth/mfa-service'

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

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { code, method, setupComplete } = body

    if (!code) {
      return NextResponse.json(
        { error: 'Verification code required' },
        { status: 400 }
      )
    }

    // Complete MFA setup
    if (setupComplete) {
      const result = await mfaService.completeSetup(user.id, code)
      return NextResponse.json(result)
    }

    // Verify based on method
    let result

    switch (method) {
      case 'backup_code':
        result = await mfaService.verifyBackupCode(user.id, code)
        break
      case 'recovery_key':
        result = await mfaService.verifyRecoveryKey(user.id, code)
        break
      case 'totp':
      default:
        result = await mfaService.verifyTOTPCode(user.id, code)
        break
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('MFA verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}
