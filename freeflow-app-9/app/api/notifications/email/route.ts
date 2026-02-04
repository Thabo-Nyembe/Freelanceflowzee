import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getEmailService } from '@/lib/email/email-service'
import {
  teamInvitationEmail,
  contractNotificationEmail,
  proposalNotificationEmail,
  projectUpdateEmail,
  paymentNotificationEmail,
  genericNotificationEmail,
  TeamInvitationData,
  ContractNotificationData,
  ProposalNotificationData,
  ProjectUpdateData,
  PaymentNotificationData,
  GenericNotificationData,
} from '@/lib/email/notification-templates'
import { createFeatureLogger } from '@/lib/logger'

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
 * Notification Email API
 *
 * Centralized endpoint for sending notification emails:
 * - Team invitations
 * - Contract notifications
 * - Proposal notifications
 * - Project updates
 * - Payment notifications
 * - Generic notifications
 */

const logger = createFeatureLogger('NotificationEmail')

type NotificationType =
  | 'team_invitation'
  | 'contract'
  | 'proposal'
  | 'project_update'
  | 'payment'
  | 'generic'

interface EmailRequest {
  type: NotificationType
  data: Record<string, unknown>
  sendNow?: boolean
  scheduledFor?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json() as EmailRequest
    const { type, data, sendNow = true, scheduledFor } = body

    if (!type || !data) {
      return NextResponse.json(
        { success: false, error: 'Type and data are required' },
        { status: 400 }
      )
    }

    // Demo mode - simulate email sending
    if (!user) {
      logger.info('Email notification simulated (demo mode)', { type, recipient: data.recipientEmail })
      return NextResponse.json({
        success: true,
        demo: true,
        message: 'Email notification queued (demo mode)',
        data: {
          type,
          recipient: data.recipientEmail,
          subject: generateSubject(type, data),
          scheduledFor: scheduledFor || 'immediate',
        },
      })
    }

    // Generate email content based on type
    let emailContent: { subject: string; html: string }

    switch (type) {
      case 'team_invitation':
        emailContent = teamInvitationEmail(data as TeamInvitationData)
        break

      case 'contract':
        emailContent = contractNotificationEmail(data as ContractNotificationData)
        break

      case 'proposal':
        emailContent = proposalNotificationEmail(data as ProposalNotificationData)
        break

      case 'project_update':
        emailContent = projectUpdateEmail(data as ProjectUpdateData)
        break

      case 'payment':
        emailContent = paymentNotificationEmail(data as PaymentNotificationData)
        break

      case 'generic':
        emailContent = genericNotificationEmail(data as GenericNotificationData)
        break

      default:
        return NextResponse.json(
          { success: false, error: `Unknown notification type: ${type}` },
          { status: 400 }
        )
    }

    // If scheduled for later, queue the email
    if (scheduledFor && !sendNow) {
      const { data: queued, error } = await supabase
        .from('email_queue')
        .insert({
          user_id: user.id,
          type,
          recipient_email: data.recipientEmail as string,
          subject: emailContent.subject,
          html: emailContent.html,
          status: 'scheduled',
          scheduled_for: scheduledFor,
          metadata: { originalData: data },
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      logger.info('Email notification scheduled', {
        type,
        recipient: data.recipientEmail,
        scheduledFor,
        queueId: queued?.id,
      })

      return NextResponse.json({
        success: true,
        message: 'Email notification scheduled',
        data: {
          queueId: queued?.id,
          scheduledFor,
          subject: emailContent.subject,
        },
      })
    }

    // Send immediately
    const emailService = getEmailService()

    const result = await emailService.send({
      to: data.recipientEmail as string,
      subject: emailContent.subject,
      html: emailContent.html,
      tags: [type, 'notification'],
      metadata: {
        notificationType: type,
        userId: user.id,
      },
    })

    if (!result.success) {
      logger.error('Email notification failed', {
        type,
        recipient: data.recipientEmail,
        error: result.error,
      })

      // Queue for retry
      await supabase.from('email_queue').insert({
        user_id: user.id,
        type,
        recipient_email: data.recipientEmail as string,
        subject: emailContent.subject,
        html: emailContent.html,
        status: 'failed',
        error_message: result.error,
        retry_count: 0,
        metadata: { originalData: data },
        created_at: new Date().toISOString(),
      })

      return NextResponse.json({
        success: false,
        error: 'Failed to send email notification',
        details: result.error,
        queued: true,
      }, { status: 500 })
    }

    // Log successful send
    await supabase.from('email_logs').insert({
      user_id: user.id,
      type,
      recipient_email: data.recipientEmail as string,
      subject: emailContent.subject,
      message_id: result.messageId,
      provider: result.provider,
      status: 'sent',
      sent_at: new Date().toISOString(),
    })

    logger.info('Email notification sent', {
      type,
      recipient: data.recipientEmail,
      messageId: result.messageId,
      provider: result.provider,
    })

    return NextResponse.json({
      success: true,
      message: 'Email notification sent',
      data: {
        messageId: result.messageId,
        subject: emailContent.subject,
        sentAt: result.timestamp.toISOString(),
      },
    })
  } catch (error) {
    logger.error('Email notification error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { success: false, error: 'Failed to process email notification' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { searchParams } = new URL(request.url)
    const view = searchParams.get('view') || 'logs'
    const limit = parseInt(searchParams.get('limit') || '50')

    // Demo mode
    if (!user) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          logs: [
            {
              id: 'log-001',
              type: 'team_invitation',
              recipient: 'user@example.com',
              subject: 'You have been invited to join Team Alpha',
              status: 'sent',
              sent_at: '2026-01-29T10:00:00Z',
            },
            {
              id: 'log-002',
              type: 'payment',
              recipient: 'client@example.com',
              subject: 'Payment Received: $1,500.00',
              status: 'sent',
              sent_at: '2026-01-28T15:30:00Z',
            },
          ],
          stats: {
            totalSent: 156,
            deliveryRate: 98.5,
            openRate: 42.3,
            clickRate: 15.8,
          },
        },
      })
    }

    if (view === 'logs') {
      const { data: logs } = await supabase
        .from('email_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(limit)

      return NextResponse.json({
        success: true,
        data: { logs },
      })
    }

    if (view === 'queue') {
      const { data: queue } = await supabase
        .from('email_queue')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['scheduled', 'pending', 'failed'])
        .order('created_at', { ascending: false })
        .limit(limit)

      return NextResponse.json({
        success: true,
        data: { queue },
      })
    }

    if (view === 'stats') {
      const { data: logs } = await supabase
        .from('email_logs')
        .select('status, type')
        .eq('user_id', user.id)
        .gte('sent_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      const stats = {
        totalSent: logs?.filter(l => l.status === 'sent').length || 0,
        byType: {} as Record<string, number>,
      }

      logs?.forEach(l => {
        stats.byType[l.type] = (stats.byType[l.type] || 0) + 1
      })

      return NextResponse.json({
        success: true,
        data: { stats },
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid view parameter',
    }, { status: 400 })
  } catch (error) {
    console.error('Email notification GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch email data' },
      { status: 500 }
    )
  }
}

function generateSubject(type: NotificationType, data: Record<string, unknown>): string {
  switch (type) {
    case 'team_invitation':
      return `You've been invited to join ${data.teamName || 'a team'}`
    case 'contract':
      return `Contract: ${data.contractTitle || 'New contract'}`
    case 'proposal':
      return `Proposal: ${data.proposalTitle || 'New proposal'}`
    case 'project_update':
      return `[${data.projectName || 'Project'}] Update`
    case 'payment':
      return `Payment notification`
    case 'generic':
      return (data.subject as string) || 'Notification from KAZI'
    default:
      return 'Notification from KAZI'
  }
}
