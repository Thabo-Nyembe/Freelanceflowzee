/**
 * Push Notification Send API
 * Server-to-server endpoint for sending notifications
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { pushNotificationService, NotificationType } from '@/lib/push-notifications'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('push-send')

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, userId, userIds, notification, data } = body

    // Send using template
    if (type && (userId || userIds)) {
      if (userId) {
        const result = await pushNotificationService.sendTemplatedNotification(
          userId,
          type as NotificationType,
          data
        )
        return NextResponse.json({ success: true, ...result })
      }

      // Send to multiple users
      if (userIds?.length) {
        const results = await Promise.all(
          userIds.map((id: string) =>
            pushNotificationService.sendTemplatedNotification(
              id,
              type as NotificationType,
              data
            )
          )
        )

        const totals = results.reduce(
          (acc, r) => ({
            success: acc.success + r.success,
            failed: acc.failed + r.failed
          }),
          { success: 0, failed: 0 }
        )

        return NextResponse.json({ success: true, ...totals })
      }
    }

    // Send custom notification
    if (notification && (userId || userIds)) {
      if (userId) {
        const result = await pushNotificationService.sendToUser(userId, notification)
        return NextResponse.json({ success: true, ...result })
      }

      if (userIds?.length) {
        const result = await pushNotificationService.sendToUsers(userIds, notification)
        return NextResponse.json({ success: true, ...result })
      }
    }

    return NextResponse.json(
      { error: 'Invalid request. Provide type or notification with userId or userIds.' },
      { status: 400 }
    )
  } catch (error) {
    logger.error('Push send error', { error })
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}
