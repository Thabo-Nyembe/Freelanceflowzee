/**
 * Push Notification Subscription API
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { pushNotificationService } from '@/lib/push-notifications'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('push-subscribe')

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { subscription, deviceInfo } = body

    if (!subscription?.endpoint || !subscription?.keys) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      )
    }

    const saved = await pushNotificationService.saveSubscription(
      user.id,
      subscription,
      deviceInfo
    )

    return NextResponse.json({
      success: true,
      subscription: {
        id: saved.id,
        created_at: saved.created_at
      }
    })
  } catch (error) {
    logger.error('Push subscription error', { error })
    return NextResponse.json(
      { error: 'Failed to save subscription' },
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

    const { endpoint } = await request.json()

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint required' },
        { status: 400 }
      )
    }

    await pushNotificationService.removeSubscription(endpoint)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Push unsubscribe error', { error })
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    )
  }
}
