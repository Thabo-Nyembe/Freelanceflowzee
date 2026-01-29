/**
 * VAPID Public Key API
 * Returns the public key for push notification subscription
 */

import { NextResponse } from 'next/server'
import { pushNotificationService } from '@/lib/push-notifications'

export async function GET() {
  const publicKey = pushNotificationService.getVapidPublicKey()

  if (!publicKey) {
    return NextResponse.json(
      { error: 'Push notifications not configured', publicKey: null },
      { status: 503 }
    )
  }

  return NextResponse.json({ publicKey })
}
