/**
 * Email Notification Templates
 *
 * Pre-built email templates for common platform notifications:
 * - Team invitations
 * - Contract notifications
 * - Proposal notifications
 * - Project updates
 * - Payment notifications
 * - Milestone completions
 */

export interface NotificationEmailData {
  recipientName: string
  recipientEmail: string
  subject: string
  preheader?: string
  primaryAction?: {
    text: string
    url: string
  }
  secondaryAction?: {
    text: string
    url: string
  }
}

// Base layout wrapper
function baseLayout(content: string, data: NotificationEmailData): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kazi.app'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.subject}</title>
  ${data.preheader ? `<meta name="x-apple-disable-message-reformatting">
  <!--[if mso]>
  <style type="text/css">
    table, td { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  </style>
  <![endif]-->
  <span style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${data.preheader}</span>` : ''}
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="min-width: 100%; background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px 24px; text-align: center; border-bottom: 1px solid #e4e4e7;">
              <a href="${baseUrl}" style="text-decoration: none;">
                <span style="font-size: 28px; font-weight: bold; color: #7c3aed;">KAZI</span>
              </a>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e4e4e7; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #71717a; text-align: center;">
                This email was sent by KAZI Platform
              </p>
              <p style="margin: 0; font-size: 12px; color: #71717a; text-align: center;">
                <a href="${baseUrl}/settings/notifications" style="color: #7c3aed; text-decoration: none;">Manage notification preferences</a>
                &nbsp;|&nbsp;
                <a href="${baseUrl}/help" style="color: #7c3aed; text-decoration: none;">Help Center</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// Button component
function actionButton(text: string, url: string, primary: boolean = true): string {
  const bgColor = primary ? '#7c3aed' : '#ffffff'
  const textColor = primary ? '#ffffff' : '#7c3aed'
  const border = primary ? 'none' : '2px solid #7c3aed'

  return `<a href="${url}" style="display: inline-block; padding: 14px 28px; background-color: ${bgColor}; color: ${textColor}; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; border: ${border}; text-align: center;">${text}</a>`
}

// ============================================================================
// Team Invitation Email
// ============================================================================

export interface TeamInvitationData extends NotificationEmailData {
  inviterName: string
  teamName: string
  role: string
  inviteUrl: string
  expiresAt?: string
  message?: string
}

export function teamInvitationEmail(data: TeamInvitationData): { subject: string; html: string } {
  const content = `
    <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #18181b;">
      You've been invited to join a team!
    </h1>
    <p style="margin: 0 0 24px; font-size: 16px; color: #52525b; line-height: 1.6;">
      Hi ${data.recipientName},
    </p>
    <p style="margin: 0 0 24px; font-size: 16px; color: #52525b; line-height: 1.6;">
      <strong>${data.inviterName}</strong> has invited you to join <strong>${data.teamName}</strong> as a <strong>${data.role}</strong> on KAZI.
    </p>
    ${data.message ? `
    <div style="margin: 0 0 24px; padding: 16px; background-color: #f4f4f5; border-radius: 8px;">
      <p style="margin: 0; font-size: 14px; color: #52525b; font-style: italic;">
        "${data.message}"
      </p>
    </div>
    ` : ''}
    <div style="margin: 32px 0; text-align: center;">
      ${actionButton('Accept Invitation', data.inviteUrl)}
    </div>
    ${data.expiresAt ? `
    <p style="margin: 24px 0 0; font-size: 12px; color: #a1a1aa; text-align: center;">
      This invitation expires on ${new Date(data.expiresAt).toLocaleDateString('en-US', { dateStyle: 'long' })}
    </p>
    ` : ''}
    <p style="margin: 24px 0 0; font-size: 14px; color: #71717a; line-height: 1.6;">
      If you didn't expect this invitation, you can safely ignore this email.
    </p>
  `

  return {
    subject: data.subject || `${data.inviterName} invited you to join ${data.teamName}`,
    html: baseLayout(content, data),
  }
}

// ============================================================================
// Contract Notification Email
// ============================================================================

export interface ContractNotificationData extends NotificationEmailData {
  senderName: string
  contractTitle: string
  projectName?: string
  contractUrl: string
  action: 'sent' | 'signed' | 'countersigned' | 'expired' | 'rejected'
  summary?: string
  deadline?: string
}

export function contractNotificationEmail(data: ContractNotificationData): { subject: string; html: string } {
  const actionMessages = {
    sent: `<strong>${data.senderName}</strong> has sent you a contract to review and sign.`,
    signed: `<strong>${data.senderName}</strong> has signed the contract.`,
    countersigned: `The contract has been fully executed! All parties have signed.`,
    expired: `The contract "${data.contractTitle}" has expired.`,
    rejected: `The contract "${data.contractTitle}" has been rejected.`,
  }

  const ctaText = {
    sent: 'Review Contract',
    signed: 'View Contract',
    countersigned: 'Download Contract',
    expired: 'View Details',
    rejected: 'View Details',
  }

  const content = `
    <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #18181b;">
      Contract ${data.action === 'sent' ? 'Ready for Review' : data.action.charAt(0).toUpperCase() + data.action.slice(1)}
    </h1>
    <p style="margin: 0 0 24px; font-size: 16px; color: #52525b; line-height: 1.6;">
      Hi ${data.recipientName},
    </p>
    <p style="margin: 0 0 24px; font-size: 16px; color: #52525b; line-height: 1.6;">
      ${actionMessages[data.action]}
    </p>
    <div style="margin: 24px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #7c3aed;">
      <p style="margin: 0 0 8px; font-size: 14px; color: #71717a;">Contract</p>
      <p style="margin: 0; font-size: 18px; font-weight: 600; color: #18181b;">${data.contractTitle}</p>
      ${data.projectName ? `<p style="margin: 8px 0 0; font-size: 14px; color: #52525b;">Project: ${data.projectName}</p>` : ''}
    </div>
    ${data.summary ? `
    <p style="margin: 0 0 24px; font-size: 14px; color: #52525b; line-height: 1.6;">
      ${data.summary}
    </p>
    ` : ''}
    <div style="margin: 32px 0; text-align: center;">
      ${actionButton(ctaText[data.action], data.contractUrl)}
    </div>
    ${data.deadline && data.action === 'sent' ? `
    <p style="margin: 24px 0 0; font-size: 14px; color: #f59e0b; text-align: center;">
      <strong>Please sign by:</strong> ${new Date(data.deadline).toLocaleDateString('en-US', { dateStyle: 'long' })}
    </p>
    ` : ''}
  `

  const subjects = {
    sent: `Contract ready for your signature: ${data.contractTitle}`,
    signed: `Contract signed: ${data.contractTitle}`,
    countersigned: `Contract fully executed: ${data.contractTitle}`,
    expired: `Contract expired: ${data.contractTitle}`,
    rejected: `Contract rejected: ${data.contractTitle}`,
  }

  return {
    subject: data.subject || subjects[data.action],
    html: baseLayout(content, data),
  }
}

// ============================================================================
// Proposal Notification Email
// ============================================================================

export interface ProposalNotificationData extends NotificationEmailData {
  senderName: string
  proposalTitle: string
  projectDescription?: string
  proposalUrl: string
  amount?: number
  currency?: string
  action: 'sent' | 'viewed' | 'accepted' | 'rejected' | 'revised'
  timeline?: string
}

export function proposalNotificationEmail(data: ProposalNotificationData): { subject: string; html: string } {
  const actionMessages = {
    sent: `<strong>${data.senderName}</strong> has sent you a proposal.`,
    viewed: `<strong>${data.recipientName}</strong> has viewed your proposal.`,
    accepted: `Great news! Your proposal has been accepted.`,
    rejected: `Your proposal has been declined.`,
    revised: `<strong>${data.senderName}</strong> has revised the proposal.`,
  }

  const content = `
    <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #18181b;">
      Proposal ${data.action === 'sent' ? 'Received' : data.action.charAt(0).toUpperCase() + data.action.slice(1)}
    </h1>
    <p style="margin: 0 0 24px; font-size: 16px; color: #52525b; line-height: 1.6;">
      Hi ${data.recipientName},
    </p>
    <p style="margin: 0 0 24px; font-size: 16px; color: #52525b; line-height: 1.6;">
      ${actionMessages[data.action]}
    </p>
    <div style="margin: 24px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <p style="margin: 0 0 8px; font-size: 14px; color: #71717a;">Proposal</p>
      <p style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #18181b;">${data.proposalTitle}</p>
      ${data.projectDescription ? `<p style="margin: 0 0 16px; font-size: 14px; color: #52525b;">${data.projectDescription}</p>` : ''}
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          ${data.amount ? `
          <td style="padding: 8px 0;">
            <p style="margin: 0; font-size: 12px; color: #71717a;">Budget</p>
            <p style="margin: 4px 0 0; font-size: 16px; font-weight: 600; color: #18181b;">
              ${data.currency || '$'}${data.amount.toLocaleString()}
            </p>
          </td>
          ` : ''}
          ${data.timeline ? `
          <td style="padding: 8px 0;">
            <p style="margin: 0; font-size: 12px; color: #71717a;">Timeline</p>
            <p style="margin: 4px 0 0; font-size: 16px; font-weight: 600; color: #18181b;">${data.timeline}</p>
          </td>
          ` : ''}
        </tr>
      </table>
    </div>
    <div style="margin: 32px 0; text-align: center;">
      ${actionButton(data.action === 'sent' ? 'Review Proposal' : 'View Proposal', data.proposalUrl)}
    </div>
  `

  const subjects = {
    sent: `New proposal: ${data.proposalTitle}`,
    viewed: `${data.recipientName} viewed your proposal`,
    accepted: `Proposal accepted: ${data.proposalTitle}`,
    rejected: `Proposal declined: ${data.proposalTitle}`,
    revised: `Proposal revised: ${data.proposalTitle}`,
  }

  return {
    subject: data.subject || subjects[data.action],
    html: baseLayout(content, data),
  }
}

// ============================================================================
// Project Update Email
// ============================================================================

export interface ProjectUpdateData extends NotificationEmailData {
  projectName: string
  projectUrl: string
  updateType: 'milestone_completed' | 'status_changed' | 'deliverable_ready' | 'comment_added' | 'feedback_requested'
  updaterName: string
  details?: string
  milestoneName?: string
  newStatus?: string
}

export function projectUpdateEmail(data: ProjectUpdateData): { subject: string; html: string } {
  const titles = {
    milestone_completed: 'Milestone Completed',
    status_changed: 'Project Status Updated',
    deliverable_ready: 'Deliverable Ready for Review',
    comment_added: 'New Comment on Project',
    feedback_requested: 'Feedback Requested',
  }

  const messages = {
    milestone_completed: `<strong>${data.updaterName}</strong> has marked <strong>${data.milestoneName || 'a milestone'}</strong> as complete.`,
    status_changed: `<strong>${data.updaterName}</strong> has updated the project status to <strong>${data.newStatus}</strong>.`,
    deliverable_ready: `<strong>${data.updaterName}</strong> has uploaded a deliverable for your review.`,
    comment_added: `<strong>${data.updaterName}</strong> commented on the project.`,
    feedback_requested: `<strong>${data.updaterName}</strong> is requesting your feedback.`,
  }

  const content = `
    <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #18181b;">
      ${titles[data.updateType]}
    </h1>
    <p style="margin: 0 0 24px; font-size: 16px; color: #52525b; line-height: 1.6;">
      Hi ${data.recipientName},
    </p>
    <p style="margin: 0 0 24px; font-size: 16px; color: #52525b; line-height: 1.6;">
      ${messages[data.updateType]}
    </p>
    <div style="margin: 24px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #7c3aed;">
      <p style="margin: 0 0 8px; font-size: 14px; color: #71717a;">Project</p>
      <p style="margin: 0; font-size: 18px; font-weight: 600; color: #18181b;">${data.projectName}</p>
    </div>
    ${data.details ? `
    <div style="margin: 0 0 24px; padding: 16px; background-color: #f4f4f5; border-radius: 8px;">
      <p style="margin: 0; font-size: 14px; color: #52525b;">${data.details}</p>
    </div>
    ` : ''}
    <div style="margin: 32px 0; text-align: center;">
      ${actionButton('View Project', data.projectUrl)}
    </div>
  `

  return {
    subject: data.subject || `[${data.projectName}] ${titles[data.updateType]}`,
    html: baseLayout(content, data),
  }
}

// ============================================================================
// Payment Notification Email
// ============================================================================

export interface PaymentNotificationData extends NotificationEmailData {
  type: 'received' | 'sent' | 'pending' | 'failed' | 'refunded' | 'escrow_funded' | 'escrow_released'
  amount: number
  currency: string
  invoiceNumber?: string
  projectName?: string
  paymentUrl: string
  otherPartyName?: string
}

export function paymentNotificationEmail(data: PaymentNotificationData): { subject: string; html: string } {
  const titles = {
    received: 'Payment Received',
    sent: 'Payment Sent',
    pending: 'Payment Pending',
    failed: 'Payment Failed',
    refunded: 'Payment Refunded',
    escrow_funded: 'Escrow Funded',
    escrow_released: 'Escrow Released',
  }

  const messages = {
    received: `You've received a payment of <strong>${data.currency}${data.amount.toLocaleString()}</strong>${data.otherPartyName ? ` from <strong>${data.otherPartyName}</strong>` : ''}.`,
    sent: `Your payment of <strong>${data.currency}${data.amount.toLocaleString()}</strong>${data.otherPartyName ? ` to <strong>${data.otherPartyName}</strong>` : ''} has been processed.`,
    pending: `Your payment of <strong>${data.currency}${data.amount.toLocaleString()}</strong> is pending processing.`,
    failed: `Your payment of <strong>${data.currency}${data.amount.toLocaleString()}</strong> could not be processed.`,
    refunded: `A refund of <strong>${data.currency}${data.amount.toLocaleString()}</strong> has been issued.`,
    escrow_funded: `<strong>${data.currency}${data.amount.toLocaleString()}</strong> has been deposited into escrow${data.projectName ? ` for <strong>${data.projectName}</strong>` : ''}.`,
    escrow_released: `<strong>${data.currency}${data.amount.toLocaleString()}</strong> has been released from escrow.`,
  }

  const statusColors = {
    received: '#22c55e',
    sent: '#3b82f6',
    pending: '#f59e0b',
    failed: '#ef4444',
    refunded: '#8b5cf6',
    escrow_funded: '#7c3aed',
    escrow_released: '#22c55e',
  }

  const content = `
    <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #18181b;">
      ${titles[data.type]}
    </h1>
    <p style="margin: 0 0 24px; font-size: 16px; color: #52525b; line-height: 1.6;">
      Hi ${data.recipientName},
    </p>
    <p style="margin: 0 0 24px; font-size: 16px; color: #52525b; line-height: 1.6;">
      ${messages[data.type]}
    </p>
    <div style="margin: 24px 0; padding: 24px; background-color: #f9fafb; border-radius: 8px; text-align: center;">
      <p style="margin: 0 0 8px; font-size: 14px; color: #71717a;">Amount</p>
      <p style="margin: 0; font-size: 36px; font-weight: 700; color: ${statusColors[data.type]};">
        ${data.currency}${data.amount.toLocaleString()}
      </p>
      ${data.invoiceNumber ? `
      <p style="margin: 16px 0 0; font-size: 14px; color: #71717a;">
        Invoice: ${data.invoiceNumber}
      </p>
      ` : ''}
      ${data.projectName ? `
      <p style="margin: 8px 0 0; font-size: 14px; color: #52525b;">
        Project: ${data.projectName}
      </p>
      ` : ''}
    </div>
    <div style="margin: 32px 0; text-align: center;">
      ${actionButton('View Details', data.paymentUrl)}
    </div>
  `

  return {
    subject: data.subject || `${titles[data.type]}: ${data.currency}${data.amount.toLocaleString()}`,
    html: baseLayout(content, data),
  }
}

// ============================================================================
// Generic Notification Email
// ============================================================================

export interface GenericNotificationData extends NotificationEmailData {
  title: string
  message: string
  icon?: 'info' | 'success' | 'warning' | 'error'
  ctaText?: string
  ctaUrl?: string
}

export function genericNotificationEmail(data: GenericNotificationData): { subject: string; html: string } {
  const iconColors = {
    info: '#3b82f6',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
  }

  const content = `
    <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #18181b;">
      ${data.title}
    </h1>
    <p style="margin: 0 0 24px; font-size: 16px; color: #52525b; line-height: 1.6;">
      Hi ${data.recipientName},
    </p>
    <p style="margin: 0 0 24px; font-size: 16px; color: #52525b; line-height: 1.6;">
      ${data.message}
    </p>
    ${data.ctaText && data.ctaUrl ? `
    <div style="margin: 32px 0; text-align: center;">
      ${actionButton(data.ctaText, data.ctaUrl)}
    </div>
    ` : ''}
  `

  return {
    subject: data.subject,
    html: baseLayout(content, data),
  }
}
