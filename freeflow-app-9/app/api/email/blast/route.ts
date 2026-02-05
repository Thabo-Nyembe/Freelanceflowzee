/**
 * Email Blast API
 *
 * Sends bulk emails to a list of leads/recipients.
 * Uses the existing email service infrastructure.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getEmailService, EmailMessage } from '@/lib/email/email-service'
import { createSimpleLogger } from '@/lib/simple-logger'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('API-EmailBlast')

export interface EmailBlastRequest {
  subject: string
  content: string
  recipients: Array<{
    id: string
    email: string
    name?: string
  }>
  trackEngagement?: boolean
  fromName?: string
  replyTo?: string
}

export interface EmailBlastResponse {
  success: boolean
  message: string
  stats: {
    total: number
    sent: number
    failed: number
    skipped: number
  }
  errors?: Array<{
    email: string
    error: string
  }>
}

export async function POST(request: NextRequest): Promise<NextResponse<EmailBlastResponse>> {
  try {
    // Parse request body
    let body: EmailBlastRequest
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request body',
          stats: { total: 0, sent: 0, failed: 0, skipped: 0 }
        },
        { status: 400 }
      )
    }

    const { subject, content, recipients, trackEngagement = true, fromName, replyTo } = body

    // Validate required fields
    if (!subject?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email subject is required',
          stats: { total: 0, sent: 0, failed: 0, skipped: 0 }
        },
        { status: 400 }
      )
    }

    if (!content?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email content is required',
          stats: { total: 0, sent: 0, failed: 0, skipped: 0 }
        },
        { status: 400 }
      )
    }

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'At least one recipient is required',
          stats: { total: 0, sent: 0, failed: 0, skipped: 0 }
        },
        { status: 400 }
      )
    }

    // Filter out invalid emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const validRecipients = recipients.filter(r => r.email && emailRegex.test(r.email))
    const skippedCount = recipients.length - validRecipients.length

    if (validRecipients.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No valid email addresses provided',
          stats: { total: recipients.length, sent: 0, failed: 0, skipped: skippedCount }
        },
        { status: 400 }
      )
    }

    logger.info('Starting email blast', {
      subject,
      totalRecipients: recipients.length,
      validRecipients: validRecipients.length,
      skipped: skippedCount,
      trackEngagement
    })

    // Get email service
    const emailService = getEmailService()

    // Build HTML email template
    const htmlContent = buildEmailTemplate(content, trackEngagement)

    // Prepare email messages with personalization
    const emailMessages: EmailMessage[] = validRecipients.map(recipient => ({
      to: recipient.email,
      subject: personalizeContent(subject, recipient),
      html: personalizeContent(htmlContent, recipient),
      text: personalizeContent(content, recipient),
      from: fromName ? `${fromName} <noreply@kazi.com>` : undefined,
      replyTo,
      tags: ['email-blast', 'lead-generation'],
      metadata: {
        recipientId: recipient.id,
        recipientName: recipient.name,
        blastTimestamp: new Date().toISOString()
      }
    }))

    // Send emails in batch
    const result = await emailService.sendBatch(emailMessages)

    // Collect errors for reporting
    const errors = result.results
      .filter(r => !r.success)
      .map((r, index) => ({
        email: validRecipients[index]?.email || 'unknown',
        error: r.error || 'Unknown error'
      }))

    // Log to database for tracking (optional - create record if table exists)
    try {
      const supabase = await createClient()
      await supabase.from('email_blast_logs').insert({
        subject,
        total_recipients: recipients.length,
        sent_count: result.successful,
        failed_count: result.failed,
        skipped_count: skippedCount,
        track_engagement: trackEngagement,
        created_at: new Date().toISOString()
      })
    } catch {
      // Table might not exist, continue without logging
      logger.warn('Could not log email blast to database')
    }

    logger.info('Email blast completed', {
      total: recipients.length,
      sent: result.successful,
      failed: result.failed,
      skipped: skippedCount,
      duration: result.duration
    })

    return NextResponse.json({
      success: result.failed === 0,
      message: result.failed === 0
        ? `Successfully sent ${result.successful} emails`
        : `Sent ${result.successful} emails, ${result.failed} failed`,
      stats: {
        total: recipients.length,
        sent: result.successful,
        failed: result.failed,
        skipped: skippedCount
      },
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    logger.error('Email blast failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send email blast',
        stats: { total: 0, sent: 0, failed: 0, skipped: 0 }
      },
      { status: 500 }
    )
  }
}

/**
 * Build a professional HTML email template
 */
function buildEmailTemplate(content: string, trackEngagement: boolean): string {
  // Convert plain text content to HTML with proper formatting
  const formattedContent = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => `<p style="margin: 0 0 16px 0; line-height: 1.6;">${escapeHtml(line)}</p>`)
    .join('\n')

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px 24px 40px; border-bottom: 1px solid #e5e5e5;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">
                KAZI
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">
              <div style="color: #333333; font-size: 16px;">
                ${formattedContent}
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 32px 40px; border-top: 1px solid #e5e5e5; background-color: #fafafa; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #666666;">
                This email was sent by KAZI Lead Generation
              </p>
              <p style="margin: 0; font-size: 12px; color: #999999;">
                If you no longer wish to receive these emails, please contact us.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim()
}

/**
 * Personalize content with recipient data
 */
function personalizeContent(content: string, recipient: { id: string; email: string; name?: string }): string {
  let personalized = content

  // Replace common placeholders
  personalized = personalized.replace(/\{\{name\}\}/gi, recipient.name || 'there')
  personalized = personalized.replace(/\{\{firstName\}\}/gi, recipient.name?.split(' ')[0] || 'there')
  personalized = personalized.replace(/\{\{email\}\}/gi, recipient.email)
  personalized = personalized.replace(/\{\{recipient_id\}\}/gi, recipient.id)

  return personalized
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, char => map[char])
}
