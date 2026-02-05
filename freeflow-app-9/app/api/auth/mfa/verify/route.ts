/**
 * MFA Verification API
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { mfaService } from '@/lib/auth/mfa-service'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('mfa-verify')

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
    logger.error('MFA verification error', { error })
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}
