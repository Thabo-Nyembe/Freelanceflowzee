/**
 * Invoice Email Templates
 * Professional HTML email templates for invoice sending and reminders
 */

import { Invoice } from './invoice-types'

/**
 * Generate HTML email for sending invoice to client
 */
export function generateInvoiceEmailHTML(invoice: Invoice): string {
  const formattedTotal = `${invoice.currency} ${invoice.total.toFixed(2)}`
  const formattedIssueDate = invoice.issueDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const formattedDueDate = invoice.dueDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #374151;
      background-color: #f9fafb;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
      color: #ffffff;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 8px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 16px;
      color: #1f2937;
      margin-bottom: 20px;
    }
    .message {
      font-size: 15px;
      color: #4b5563;
      margin-bottom: 30px;
      line-height: 1.7;
    }
    .invoice-card {
      background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 24px;
      margin: 30px 0;
    }
    .invoice-detail {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .invoice-detail:last-child {
      border-bottom: none;
    }
    .invoice-detail-label {
      font-size: 14px;
      color: #6b7280;
      font-weight: 500;
    }
    .invoice-detail-value {
      font-size: 14px;
      color: #1f2937;
      font-weight: 600;
    }
    .total-amount {
      background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
      color: #ffffff;
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
      text-align: center;
    }
    .total-label {
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .total-value {
      font-size: 36px;
      font-weight: 700;
      margin: 0;
      letter-spacing: -1px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      text-align: center;
      margin: 20px 0;
      box-shadow: 0 4px 6px rgba(34, 197, 94, 0.2);
      transition: all 0.3s ease;
    }
    .cta-button:hover {
      box-shadow: 0 6px 8px rgba(34, 197, 94, 0.3);
    }
    .items-section {
      margin: 30px 0;
    }
    .items-title {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 16px;
    }
    .item-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .item-description {
      flex: 1;
      font-size: 14px;
      color: #4b5563;
    }
    .item-amount {
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
      margin-left: 20px;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer-text {
      font-size: 13px;
      color: #6b7280;
      margin: 8px 0;
    }
    .footer-link {
      color: #4F46E5;
      text-decoration: none;
    }
    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, #e5e7eb, transparent);
      margin: 30px 0;
    }
    @media only screen and (max-width: 600px) {
      .header {
        padding: 30px 20px;
      }
      .content {
        padding: 30px 20px;
      }
      .total-value {
        font-size: 28px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>Invoice from KAZI</h1>
      <p>Professional Freelance Platform</p>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="greeting">
        Hello ${invoice.clientName || 'Valued Client'},
      </div>

      <div class="message">
        Thank you for your business! We've generated a new invoice for your recent project. Please find the invoice details below and the complete PDF invoice attached to this email.
      </div>

      <!-- Invoice Details Card -->
      <div class="invoice-card">
        <div class="invoice-detail">
          <span class="invoice-detail-label">Invoice Number</span>
          <span class="invoice-detail-value">${invoice.invoiceNumber}</span>
        </div>
        <div class="invoice-detail">
          <span class="invoice-detail-label">Issue Date</span>
          <span class="invoice-detail-value">${formattedIssueDate}</span>
        </div>
        <div class="invoice-detail">
          <span class="invoice-detail-label">Due Date</span>
          <span class="invoice-detail-value">${formattedDueDate}</span>
        </div>
        <div class="invoice-detail">
          <span class="invoice-detail-label">Status</span>
          <span class="invoice-detail-value">${invoice.status.toUpperCase()}</span>
        </div>
      </div>

      <!-- Items Section -->
      ${invoice.items && invoice.items.length > 0 ? `
      <div class="items-section">
        <div class="items-title">Invoice Items</div>
        ${invoice.items.map(item => `
        <div class="item-row">
          <span class="item-description">${item.description} (×${item.quantity})</span>
          <span class="item-amount">${invoice.currency} ${item.total.toFixed(2)}</span>
        </div>
        `).join('')}
      </div>
      ` : ''}

      <!-- Total Amount -->
      <div class="total-amount">
        <div class="total-label">Total Amount Due</div>
        <div class="total-value">${formattedTotal}</div>
      </div>

      <div class="message">
        Payment is due by <strong>${formattedDueDate}</strong>. Please review the attached PDF invoice for complete details, including payment methods and terms.
      </div>

      ${invoice.notes ? `
      <div class="divider"></div>
      <div class="message">
        <strong>Note:</strong><br>
        ${invoice.notes}
      </div>
      ` : ''}

      <div class="message">
        If you have any questions about this invoice, please don't hesitate to reach out. We're here to help!
      </div>

      <div class="message">
        Best regards,<br>
        <strong>The KAZI Team</strong>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-text">
        This is an automated invoice email from KAZI Platform
      </div>
      <div class="footer-text">
        <a href="mailto:support@kazi.com" class="footer-link">support@kazi.com</a>
      </div>
      <div class="footer-text" style="margin-top: 16px; color: #9ca3af; font-size: 12px;">
        © ${new Date().getFullYear()} KAZI Platform. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Generate HTML email for sending payment reminder
 */
export function generateReminderEmailHTML(invoice: Invoice): string {
  const formattedTotal = `${invoice.currency} ${invoice.total.toFixed(2)}`
  const formattedIssueDate = invoice.issueDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const formattedDueDate = invoice.dueDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Calculate days overdue
  const today = new Date()
  const dueDate = new Date(invoice.dueDate)
  const diffTime = today.getTime() - dueDate.getTime()
  const daysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  const isOverdue = daysOverdue > 0
  const urgencyLevel = daysOverdue > 30 ? 'critical' : daysOverdue > 7 ? 'high' : 'medium'

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Payment Reminder - Invoice ${invoice.invoiceNumber}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #374151;
      background-color: #f9fafb;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
      color: #ffffff;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 8px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 16px;
      color: #1f2937;
      margin-bottom: 20px;
    }
    .message {
      font-size: 15px;
      color: #4b5563;
      margin-bottom: 20px;
      line-height: 1.7;
    }
    .urgent-banner {
      background: ${isOverdue ? '#FEE2E2' : '#FEF3C7'};
      border-left: 4px solid ${isOverdue ? '#EF4444' : '#F59E0B'};
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
    }
    .urgent-banner-title {
      font-size: 16px;
      font-weight: 700;
      color: ${isOverdue ? '#991B1B' : '#92400E'};
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
    }
    .urgent-banner-text {
      font-size: 14px;
      color: ${isOverdue ? '#7F1D1D' : '#78350F'};
      margin: 0;
    }
    .invoice-card {
      background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 24px;
      margin: 30px 0;
    }
    .invoice-detail {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .invoice-detail:last-child {
      border-bottom: none;
    }
    .invoice-detail-label {
      font-size: 14px;
      color: #6b7280;
      font-weight: 500;
    }
    .invoice-detail-value {
      font-size: 14px;
      color: #1f2937;
      font-weight: 600;
    }
    .total-amount {
      background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
      color: #ffffff;
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
      text-align: center;
    }
    .total-label {
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .total-value {
      font-size: 36px;
      font-weight: 700;
      margin: 0;
      letter-spacing: -1px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      text-align: center;
      margin: 20px 0;
      box-shadow: 0 4px 6px rgba(239, 68, 68, 0.2);
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer-text {
      font-size: 13px;
      color: #6b7280;
      margin: 8px 0;
    }
    .footer-link {
      color: #EF4444;
      text-decoration: none;
    }
    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, #e5e7eb, transparent);
      margin: 30px 0;
    }
    @media only screen and (max-width: 600px) {
      .header {
        padding: 30px 20px;
      }
      .content {
        padding: 30px 20px;
      }
      .total-value {
        font-size: 28px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>Payment Reminder</h1>
      <p>Invoice ${invoice.invoiceNumber}</p>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="greeting">
        Hello ${invoice.clientName || 'Valued Client'},
      </div>

      <!-- Urgent Banner -->
      <div class="urgent-banner">
        <div class="urgent-banner-title">
          ${isOverdue ? '⚠️ Payment Overdue' : '🔔 Payment Due Soon'}
        </div>
        <div class="urgent-banner-text">
          ${isOverdue
            ? `This invoice is ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue. Please submit payment as soon as possible.`
            : `This is a friendly reminder that payment for this invoice is due soon.`
          }
        </div>
      </div>

      <div class="message">
        ${isOverdue
          ? `We noticed that payment for invoice ${invoice.invoiceNumber} has not been received. The payment was due on <strong>${formattedDueDate}</strong>, which was ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} ago.`
          : `This is a friendly reminder about invoice ${invoice.invoiceNumber}. Payment is due on <strong>${formattedDueDate}</strong>.`
        }
      </div>

      <!-- Invoice Details Card -->
      <div class="invoice-card">
        <div class="invoice-detail">
          <span class="invoice-detail-label">Invoice Number</span>
          <span class="invoice-detail-value">${invoice.invoiceNumber}</span>
        </div>
        <div class="invoice-detail">
          <span class="invoice-detail-label">Issue Date</span>
          <span class="invoice-detail-value">${formattedIssueDate}</span>
        </div>
        <div class="invoice-detail">
          <span class="invoice-detail-label">Due Date</span>
          <span class="invoice-detail-value">${formattedDueDate}</span>
        </div>
        ${isOverdue ? `
        <div class="invoice-detail">
          <span class="invoice-detail-label">Days Overdue</span>
          <span class="invoice-detail-value" style="color: #EF4444;">${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}</span>
        </div>
        ` : ''}
      </div>

      <!-- Total Amount -->
      <div class="total-amount">
        <div class="total-label">Amount Due</div>
        <div class="total-value">${formattedTotal}</div>
      </div>

      <div class="message">
        ${isOverdue
          ? `We kindly request that you submit payment at your earliest convenience. If you have already sent payment, please disregard this notice and accept our thanks.`
          : `Please ensure payment is submitted by the due date. If you have already sent payment, thank you and please disregard this reminder.`
        }
      </div>

      <div class="divider"></div>

      <div class="message">
        If you have any questions or concerns about this invoice, or if you're experiencing difficulty with payment, please contact us immediately. We're here to help and may be able to arrange alternative payment terms.
      </div>

      <div class="message">
        Thank you for your prompt attention to this matter.
      </div>

      <div class="message">
        Best regards,<br>
        <strong>The KAZI Team</strong>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-text">
        This is an automated payment reminder from KAZI Platform
      </div>
      <div class="footer-text">
        Need assistance? Contact us at <a href="mailto:support@kazi.com" class="footer-link">support@kazi.com</a>
      </div>
      <div class="footer-text" style="margin-top: 16px; color: #9ca3af; font-size: 12px;">
        © ${new Date().getFullYear()} KAZI Platform. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}
