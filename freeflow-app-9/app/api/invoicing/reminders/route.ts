/**
 * Payment Reminders API
 *
 * Manage automated payment reminders and follow-ups
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { createClient } from '@/lib/supabase/server'
import {

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
  createReminder,
  getRemindersByInvoice,
  getUpcomingReminders,
  markReminderSent,
  markReminderOpened,
  markReminderClicked,
  processScheduledReminders,
  snoozeReminder,
  cancelReminder,
  getReminderStats,
  type ReminderCreate
} from '@/lib/invoicing/payment-reminder-service'

const logger = createSimpleLogger('API-PaymentReminders')

/**
 * GET /api/invoicing/reminders
 * List reminders or get reminder stats
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'list'
    const invoiceId = searchParams.get('invoiceId')

    switch (action) {
      case 'list': {
        if (invoiceId) {
          const reminders = await getRemindersByInvoice(invoiceId)
          return NextResponse.json({
            success: true,
            reminders
          })
        }

        // Get upcoming reminders for user
        const days = parseInt(searchParams.get('days') || '7')
        const reminders = await getUpcomingReminders(user.id, days)
        return NextResponse.json({
          success: true,
          reminders,
          upcomingDays: days
        })
      }

      case 'stats': {
        const period = searchParams.get('period') as 'week' | 'month' | 'quarter' | 'year' || 'month'
        const stats = await getReminderStats(user.id, period)
        return NextResponse.json({
          success: true,
          stats,
          period
        })
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: list, stats' },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Reminders GET error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get reminders',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/invoicing/reminders
 * Create reminder or process actions
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'create': {
        const data: ReminderCreate = body.data
        if (!data.invoiceId || !data.type || !data.scheduledFor) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields: invoiceId, type, scheduledFor' },
            { status: 400 }
          )
        }

        const reminder = await createReminder(data)
        logger.info('Reminder created', { id: reminder.id, invoiceId: data.invoiceId })

        return NextResponse.json({
          success: true,
          reminder
        })
      }

      case 'mark_sent': {
        if (!body.reminderId) {
          return NextResponse.json(
            { success: false, error: 'reminderId is required' },
            { status: 400 }
          )
        }

        await markReminderSent(body.reminderId)
        return NextResponse.json({
          success: true,
          message: 'Reminder marked as sent'
        })
      }

      case 'mark_opened': {
        if (!body.reminderId) {
          return NextResponse.json(
            { success: false, error: 'reminderId is required' },
            { status: 400 }
          )
        }

        await markReminderOpened(body.reminderId)
        return NextResponse.json({
          success: true,
          message: 'Reminder marked as opened'
        })
      }

      case 'mark_clicked': {
        if (!body.reminderId) {
          return NextResponse.json(
            { success: false, error: 'reminderId is required' },
            { status: 400 }
          )
        }

        await markReminderClicked(body.reminderId)
        return NextResponse.json({
          success: true,
          message: 'Reminder marked as clicked'
        })
      }

      case 'snooze': {
        if (!body.reminderId || !body.days) {
          return NextResponse.json(
            { success: false, error: 'reminderId and days are required' },
            { status: 400 }
          )
        }

        const snoozed = await snoozeReminder(body.reminderId, body.days)
        return NextResponse.json({
          success: true,
          reminder: snoozed
        })
      }

      case 'cancel': {
        if (!body.reminderId) {
          return NextResponse.json(
            { success: false, error: 'reminderId is required' },
            { status: 400 }
          )
        }

        await cancelReminder(body.reminderId)
        return NextResponse.json({
          success: true,
          message: 'Reminder cancelled'
        })
      }

      case 'process': {
        // Manual trigger for processing scheduled reminders
        const result = await processScheduledReminders()
        return NextResponse.json({
          success: true,
          result
        })
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
            validActions: ['create', 'mark_sent', 'mark_opened', 'mark_clicked', 'snooze', 'cancel', 'process']
          },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Reminders POST error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Reminder operation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/invoicing/reminders
 * Delete a reminder
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const reminderId = searchParams.get('id')

    if (!reminderId) {
      return NextResponse.json(
        { success: false, error: 'Reminder ID is required' },
        { status: 400 }
      )
    }

    await cancelReminder(reminderId)

    return NextResponse.json({
      success: true,
      message: 'Reminder deleted'
    })
  } catch (error) {
    logger.error('Reminders DELETE error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete reminder',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
