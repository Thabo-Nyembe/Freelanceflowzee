/**
 * Email Templates - KAZI Platform
 *
 * Centralized email templates for all platform notifications.
 * Uses the email service for actual sending.
 */

import { getEmailService } from './email-service'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('EmailTemplates')
const emailService = getEmailService()

// ============================================================================
// Base Template
// ============================================================================

function getBaseTemplate(content: string, footerText?: string): string {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KAZI Notification</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
               line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;
               background-color: #f5f5f5;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">KAZI</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Freelance Business Platform</p>
    </div>
    <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb;
                border-top: none; border-radius: 0 0 10px 10px;">
      ${content}
    </div>
    <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
      <p>${footerText || 'This email was sent by KAZI. You can manage your preferences in your account settings.'}</p>
      <p style="margin-top: 10px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings-v2" style="color: #6366f1; text-decoration: none;">Manage Preferences</a> |
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe" style="color: #6366f1; text-decoration: none;">Unsubscribe</a>
      </p>
    </div>
  </body>
</html>
  `
}

function getActionButton(url: string, label: string, color: string = '#4F46E5'): string {
  const fullUrl = url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_APP_URL}${url}`
  return `
    <p style="margin-top: 25px; text-align: center;">
      <a href="${fullUrl}"
         style="background-color: ${color}; color: white; padding: 14px 28px;
                text-decoration: none; border-radius: 8px; display: inline-block;
                font-weight: 600; font-size: 16px;">
        ${label}
      </a>
    </p>
  `
}

// ============================================================================
// Invoice Templates
// ============================================================================

export interface InvoiceEmailData {
  clientName: string
  clientEmail: string
  invoiceNumber: string
  amount: string
  currency: string
  dueDate: string
  items: Array<{ description: string; quantity: number; price: string }>
  paymentUrl: string
  businessName?: string
}

export async function sendInvoiceEmail(data: InvoiceEmailData): Promise<boolean> {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.description}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.price}</td>
    </tr>
  `).join('')

  const content = `
    <h2 style="color: #1f2937; margin-top: 0;">Invoice ${data.invoiceNumber}</h2>
    <p style="color: #4b5563;">Hi ${data.clientName},</p>
    <p style="color: #4b5563;">
      ${data.businessName ? `${data.businessName} has` : 'You have'} a new invoice ready for payment.
    </p>

    <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #e5e7eb;">
            <th style="padding: 12px; text-align: left;">Description</th>
            <th style="padding: 12px; text-align: center;">Qty</th>
            <th style="padding: 12px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr style="font-weight: bold;">
            <td colspan="2" style="padding: 12px; text-align: right;">Total:</td>
            <td style="padding: 12px; text-align: right; color: #4F46E5; font-size: 18px;">
              ${data.currency} ${data.amount}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <p style="color: #4b5563;">
      <strong>Due Date:</strong> ${data.dueDate}
    </p>

    ${getActionButton(data.paymentUrl, 'Pay Now', '#10B981')}

    <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
      If you have any questions about this invoice, please reply to this email.
    </p>
  `

  try {
    const result = await emailService.send({
      to: data.clientEmail,
      subject: `Invoice ${data.invoiceNumber} - ${data.currency} ${data.amount} Due`,
      html: getBaseTemplate(content),
      text: `Invoice ${data.invoiceNumber}\n\nAmount: ${data.currency} ${data.amount}\nDue: ${data.dueDate}\n\nPay at: ${data.paymentUrl}`,
      tags: ['invoice', 'payment'],
      metadata: { invoiceNumber: data.invoiceNumber }
    })
    logger.info('Invoice email sent', { invoiceNumber: data.invoiceNumber, to: data.clientEmail })
    return result.success
  } catch (error) {
    logger.error('Failed to send invoice email', { error, invoiceNumber: data.invoiceNumber })
    return false
  }
}

// ============================================================================
// Payment Reminder Templates
// ============================================================================

export interface PaymentReminderData {
  clientName: string
  clientEmail: string
  invoiceNumber: string
  amount: string
  currency: string
  dueDate: string
  daysOverdue?: number
  paymentUrl: string
}

export async function sendPaymentReminder(data: PaymentReminderData): Promise<boolean> {
  const isOverdue = data.daysOverdue && data.daysOverdue > 0
  const urgencyColor = isOverdue ? '#EF4444' : '#F59E0B'

  const content = `
    <h2 style="color: ${urgencyColor}; margin-top: 0;">
      ${isOverdue ? 'Payment Overdue' : 'Payment Reminder'}
    </h2>
    <p style="color: #4b5563;">Hi ${data.clientName},</p>
    <p style="color: #4b5563;">
      ${isOverdue
        ? `Your invoice ${data.invoiceNumber} is now ${data.daysOverdue} days overdue.`
        : `This is a friendly reminder that invoice ${data.invoiceNumber} is due on ${data.dueDate}.`
      }
    </p>

    <div style="background: ${isOverdue ? '#FEF2F2' : '#FFFBEB'}; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid ${urgencyColor};">
      <p style="margin: 0; font-size: 14px; color: #4b5563;">
        <strong>Invoice:</strong> ${data.invoiceNumber}<br>
        <strong>Amount Due:</strong> <span style="color: ${urgencyColor}; font-size: 18px; font-weight: bold;">${data.currency} ${data.amount}</span><br>
        <strong>Due Date:</strong> ${data.dueDate}
        ${isOverdue ? `<br><strong style="color: ${urgencyColor};">Days Overdue:</strong> ${data.daysOverdue}` : ''}
      </p>
    </div>

    ${getActionButton(data.paymentUrl, 'Pay Now', urgencyColor)}

    <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
      If you've already made this payment, please disregard this email.
    </p>
  `

  try {
    const result = await emailService.send({
      to: data.clientEmail,
      subject: isOverdue
        ? `OVERDUE: Invoice ${data.invoiceNumber} - ${data.daysOverdue} Days Past Due`
        : `Reminder: Invoice ${data.invoiceNumber} Due ${data.dueDate}`,
      html: getBaseTemplate(content),
      text: `Payment ${isOverdue ? 'Overdue' : 'Reminder'}\n\nInvoice: ${data.invoiceNumber}\nAmount: ${data.currency} ${data.amount}\nDue: ${data.dueDate}\n\nPay at: ${data.paymentUrl}`,
      tags: ['invoice', 'reminder', isOverdue ? 'overdue' : 'upcoming'],
      metadata: { invoiceNumber: data.invoiceNumber }
    })
    logger.info('Payment reminder sent', { invoiceNumber: data.invoiceNumber, to: data.clientEmail, isOverdue })
    return result.success
  } catch (error) {
    logger.error('Failed to send payment reminder', { error, invoiceNumber: data.invoiceNumber })
    return false
  }
}

// ============================================================================
// Booking/Calendar Templates
// ============================================================================

export interface BookingEmailData {
  clientName: string
  clientEmail: string
  bookingTitle: string
  bookingDate: string
  bookingTime: string
  duration: string
  location?: string
  meetingUrl?: string
  hostName: string
  notes?: string
}

export async function sendBookingConfirmation(data: BookingEmailData): Promise<boolean> {
  const content = `
    <h2 style="color: #10B981; margin-top: 0;">Booking Confirmed!</h2>
    <p style="color: #4b5563;">Hi ${data.clientName},</p>
    <p style="color: #4b5563;">
      Your booking with ${data.hostName} has been confirmed.
    </p>

    <div style="background: #F0FDF4; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #10B981;">
      <h3 style="margin: 0 0 15px 0; color: #1f2937;">${data.bookingTitle}</h3>
      <p style="margin: 0; color: #4b5563; line-height: 1.8;">
        <strong>Date:</strong> ${data.bookingDate}<br>
        <strong>Time:</strong> ${data.bookingTime}<br>
        <strong>Duration:</strong> ${data.duration}<br>
        ${data.location ? `<strong>Location:</strong> ${data.location}<br>` : ''}
        ${data.meetingUrl ? `<strong>Meeting Link:</strong> <a href="${data.meetingUrl}" style="color: #4F46E5;">${data.meetingUrl}</a>` : ''}
      </p>
    </div>

    ${data.notes ? `
      <div style="background: #f9fafb; border-radius: 8px; padding: 15px; margin: 15px 0;">
        <p style="margin: 0; color: #6b7280; font-size: 14px;"><strong>Notes:</strong> ${data.notes}</p>
      </div>
    ` : ''}

    ${data.meetingUrl ? getActionButton(data.meetingUrl, 'Join Meeting', '#4F46E5') : ''}

    <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
      Need to reschedule? Please contact ${data.hostName} to make changes.
    </p>
  `

  try {
    const result = await emailService.send({
      to: data.clientEmail,
      subject: `Booking Confirmed: ${data.bookingTitle} on ${data.bookingDate}`,
      html: getBaseTemplate(content),
      text: `Booking Confirmed\n\n${data.bookingTitle}\nDate: ${data.bookingDate}\nTime: ${data.bookingTime}\nDuration: ${data.duration}`,
      tags: ['booking', 'confirmation'],
      metadata: { bookingTitle: data.bookingTitle }
    })
    logger.info('Booking confirmation sent', { to: data.clientEmail })
    return result.success
  } catch (error) {
    logger.error('Failed to send booking confirmation', { error })
    return false
  }
}

export async function sendBookingCancellation(data: BookingEmailData & { reason?: string }): Promise<boolean> {
  const content = `
    <h2 style="color: #EF4444; margin-top: 0;">Booking Cancelled</h2>
    <p style="color: #4b5563;">Hi ${data.clientName},</p>
    <p style="color: #4b5563;">
      We're sorry to inform you that your booking with ${data.hostName} has been cancelled.
    </p>

    <div style="background: #FEF2F2; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #EF4444;">
      <h3 style="margin: 0 0 15px 0; color: #1f2937; text-decoration: line-through;">${data.bookingTitle}</h3>
      <p style="margin: 0; color: #4b5563;">
        <strong>Date:</strong> ${data.bookingDate}<br>
        <strong>Time:</strong> ${data.bookingTime}
      </p>
      ${data.reason ? `<p style="margin: 10px 0 0 0; color: #6b7280;"><strong>Reason:</strong> ${data.reason}</p>` : ''}
    </div>

    ${getActionButton('/dashboard/bookings-v2', 'Book Again', '#6366F1')}
  `

  try {
    const result = await emailService.send({
      to: data.clientEmail,
      subject: `Booking Cancelled: ${data.bookingTitle}`,
      html: getBaseTemplate(content),
      text: `Booking Cancelled\n\n${data.bookingTitle}\nDate: ${data.bookingDate}\nTime: ${data.bookingTime}`,
      tags: ['booking', 'cancellation'],
      metadata: { bookingTitle: data.bookingTitle }
    })
    logger.info('Booking cancellation sent', { to: data.clientEmail })
    return result.success
  } catch (error) {
    logger.error('Failed to send booking cancellation', { error })
    return false
  }
}

export async function sendBookingReschedule(data: BookingEmailData & {
  oldDate: string
  oldTime: string
}): Promise<boolean> {
  const content = `
    <h2 style="color: #F59E0B; margin-top: 0;">Booking Rescheduled</h2>
    <p style="color: #4b5563;">Hi ${data.clientName},</p>
    <p style="color: #4b5563;">
      Your booking with ${data.hostName} has been rescheduled.
    </p>

    <div style="display: flex; gap: 20px; margin: 20px 0;">
      <div style="flex: 1; background: #FEF2F2; border-radius: 8px; padding: 15px; border-left: 4px solid #EF4444;">
        <p style="margin: 0; color: #9ca3af; font-size: 12px;">OLD TIME</p>
        <p style="margin: 5px 0 0 0; color: #6b7280; text-decoration: line-through;">
          ${data.oldDate}<br>${data.oldTime}
        </p>
      </div>
      <div style="flex: 1; background: #F0FDF4; border-radius: 8px; padding: 15px; border-left: 4px solid #10B981;">
        <p style="margin: 0; color: #9ca3af; font-size: 12px;">NEW TIME</p>
        <p style="margin: 5px 0 0 0; color: #1f2937; font-weight: bold;">
          ${data.bookingDate}<br>${data.bookingTime}
        </p>
      </div>
    </div>

    <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 10px 0; color: #1f2937;">${data.bookingTitle}</h3>
      <p style="margin: 0; color: #4b5563;">
        <strong>Duration:</strong> ${data.duration}
        ${data.meetingUrl ? `<br><strong>Meeting Link:</strong> <a href="${data.meetingUrl}" style="color: #4F46E5;">${data.meetingUrl}</a>` : ''}
      </p>
    </div>

    ${data.meetingUrl ? getActionButton(data.meetingUrl, 'Join Meeting', '#4F46E5') : ''}
  `

  try {
    const result = await emailService.send({
      to: data.clientEmail,
      subject: `Booking Rescheduled: ${data.bookingTitle} - New Time: ${data.bookingDate}`,
      html: getBaseTemplate(content),
      text: `Booking Rescheduled\n\nOld: ${data.oldDate} ${data.oldTime}\nNew: ${data.bookingDate} ${data.bookingTime}`,
      tags: ['booking', 'reschedule'],
      metadata: { bookingTitle: data.bookingTitle }
    })
    logger.info('Booking reschedule notification sent', { to: data.clientEmail })
    return result.success
  } catch (error) {
    logger.error('Failed to send booking reschedule', { error })
    return false
  }
}

// ============================================================================
// Team Invite Templates
// ============================================================================

export interface TeamInviteData {
  inviteeName: string
  inviteeEmail: string
  teamName: string
  inviterName: string
  role: string
  inviteUrl: string
  expiresAt?: string
}

export async function sendTeamInvite(data: TeamInviteData): Promise<boolean> {
  const content = `
    <h2 style="color: #4F46E5; margin-top: 0;">You're Invited!</h2>
    <p style="color: #4b5563;">Hi ${data.inviteeName || 'there'},</p>
    <p style="color: #4b5563;">
      ${data.inviterName} has invited you to join <strong>${data.teamName}</strong> on KAZI.
    </p>

    <div style="background: #EEF2FF; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #4F46E5; text-align: center;">
      <p style="margin: 0; font-size: 18px; color: #1f2937;">
        <strong>${data.teamName}</strong>
      </p>
      <p style="margin: 10px 0 0 0; color: #6366f1; font-size: 14px;">
        Role: ${data.role}
      </p>
    </div>

    ${getActionButton(data.inviteUrl, 'Accept Invitation', '#4F46E5')}

    ${data.expiresAt ? `
      <p style="color: #9ca3af; font-size: 12px; margin-top: 20px; text-align: center;">
        This invitation expires on ${data.expiresAt}
      </p>
    ` : ''}
  `

  try {
    const result = await emailService.send({
      to: data.inviteeEmail,
      subject: `${data.inviterName} invited you to join ${data.teamName}`,
      html: getBaseTemplate(content),
      text: `You've been invited to join ${data.teamName}\n\nRole: ${data.role}\n\nAccept at: ${data.inviteUrl}`,
      tags: ['team', 'invite'],
      metadata: { teamName: data.teamName }
    })
    logger.info('Team invite sent', { to: data.inviteeEmail, team: data.teamName })
    return result.success
  } catch (error) {
    logger.error('Failed to send team invite', { error })
    return false
  }
}

// ============================================================================
// Recurring Invoice Templates
// ============================================================================

export async function sendRecurringInvoiceCreated(data: InvoiceEmailData & {
  frequency: string
  nextDueDate: string
}): Promise<boolean> {
  const content = `
    <h2 style="color: #1f2937; margin-top: 0;">New Recurring Invoice</h2>
    <p style="color: #4b5563;">Hi ${data.clientName},</p>
    <p style="color: #4b5563;">
      A new invoice has been automatically generated based on your recurring billing schedule.
    </p>

    <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin: 0; color: #4b5563;">
        <strong>Invoice Number:</strong> ${data.invoiceNumber}<br>
        <strong>Amount:</strong> <span style="color: #4F46E5; font-size: 20px; font-weight: bold;">${data.currency} ${data.amount}</span><br>
        <strong>Due Date:</strong> ${data.dueDate}<br>
        <strong>Billing Frequency:</strong> ${data.frequency}<br>
        <strong>Next Invoice:</strong> ${data.nextDueDate}
      </p>
    </div>

    ${getActionButton(data.paymentUrl, 'View & Pay Invoice', '#10B981')}

    <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
      This is an automatically generated invoice. Contact us if you need to make changes to your billing.
    </p>
  `

  try {
    const result = await emailService.send({
      to: data.clientEmail,
      subject: `Recurring Invoice ${data.invoiceNumber} - ${data.currency} ${data.amount}`,
      html: getBaseTemplate(content),
      text: `Recurring Invoice Generated\n\nInvoice: ${data.invoiceNumber}\nAmount: ${data.currency} ${data.amount}\nDue: ${data.dueDate}`,
      tags: ['invoice', 'recurring'],
      metadata: { invoiceNumber: data.invoiceNumber }
    })
    logger.info('Recurring invoice email sent', { invoiceNumber: data.invoiceNumber })
    return result.success
  } catch (error) {
    logger.error('Failed to send recurring invoice email', { error })
    return false
  }
}

// ============================================================================
// Export All Templates
// ============================================================================

export const emailTemplates = {
  sendInvoiceEmail,
  sendPaymentReminder,
  sendBookingConfirmation,
  sendBookingCancellation,
  sendBookingReschedule,
  sendTeamInvite,
  sendRecurringInvoiceCreated,
}

export default emailTemplates
