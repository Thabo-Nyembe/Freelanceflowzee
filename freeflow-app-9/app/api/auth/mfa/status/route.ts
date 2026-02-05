/**
 * MFA Status API
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { mfaService } from '@/lib/auth/mfa-service'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('mfa-status')

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
