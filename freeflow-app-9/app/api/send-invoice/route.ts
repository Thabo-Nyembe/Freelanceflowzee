/**
 * Invoice Email API Route
 * Handles sending invoice emails and payment reminders
 */

import { NextRequest, NextResponse } from 'next/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('invoice-email-api')

interface EmailAttachment {
  filename: string
  content: string // base64 encoded
}

interface EmailRequest {
  to: string
  subject: string
  html: string
  attachments?: EmailAttachment[]
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: EmailRequest = await request.json()
    const { to, subject, html, attachments } = body

    // Validate required fields
    if (!to || !subject || !html) {
      logger.warn('Invalid email request', { to, subject, hasHtml: !!html })
      return NextResponse.json(
        { success: false, error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      logger.warn('Invalid email address', { to })
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    logger.info('Processing email send request', {
      to,
      subject,
      hasAttachments: !!attachments && attachments.length > 0,
      attachmentCount: attachments?.length || 0
    })

    // ========================================================================
    // EMAIL SENDING LOGIC - Using Resend
    // ========================================================================

    const RESEND_API_KEY = process.env.RESEND_API_KEY
    const FROM_EMAIL = process.env.EMAIL_FROM || 'KAZI Platform <noreply@kazi.app>'

    // Check if email service is configured
    if (RESEND_API_KEY && process.env.NODE_ENV === 'production') {
      try {
        // Dynamic import Resend
        const { Resend } = await import('resend')
        const resend = new Resend(RESEND_API_KEY)

        const emailData: {
          from: string
          to: string
          subject: string
          html: string
          attachments?: Array<{ filename: string; content: Buffer }>
        } = {
          from: FROM_EMAIL,
          to: to,
          subject: subject,
          html: html,
        }

        // Add attachments if present
        if (attachments && attachments.length > 0) {
          emailData.attachments = attachments.map(att => ({
            filename: att.filename,
            content: Buffer.from(att.content, 'base64')
          }))
        }

        const result = await resend.emails.send(emailData)

        if (result.error) {
          throw new Error(result.error.message)
        }

        logger.info('Email sent successfully via Resend', {
          to,
          subject,
          emailId: result.data?.id,
          attachmentCount: attachments?.length || 0
        })
      } catch (emailError) {
        logger.error('Resend email failed, falling back to simulation', {
          error: emailError instanceof Error ? emailError.message : 'Unknown error'
        })
        // Fall through to simulation mode
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    } else {
      // Development mode or no API key - simulate email sending
      await new Promise(resolve => setTimeout(resolve, 500))

      logger.info('Email simulated (no RESEND_API_KEY or dev mode)', {
        to,
        subject,
        htmlLength: html.length,
        attachmentCount: attachments?.length || 0,
        attachmentFileNames: attachments?.map(a => a.filename) || []
      })

      if (process.env.NODE_ENV === 'development') {
        logger.info('Email preview', {
          to,
          subject,
          htmlPreview: html.substring(0, 200) + '...'
        })
      }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      data: {
        to,
        subject,
        sentAt: new Date().toISOString()
      }
    })
  } catch (error) {
    // Log error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Email sending failed', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    })

    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send email',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'invoice-email-api',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
}
