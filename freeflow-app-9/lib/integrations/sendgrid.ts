// =====================================================
// KAZI SendGrid Integration - Email Service
// Send transactional emails, marketing campaigns, templates
// =====================================================

export interface SendGridConfig {
  apiKey: string;
  fromEmail: string;
  fromName?: string;
  replyTo?: string;
}

export interface EmailAddress {
  email: string;
  name?: string;
}

export interface EmailMessage {
  to: EmailAddress | EmailAddress[];
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  replyTo?: EmailAddress;
  attachments?: EmailAttachment[];
  categories?: string[];
  customArgs?: Record<string, string>;
  sendAt?: number; // Unix timestamp
  batchId?: string;
}

export interface EmailAttachment {
  content: string; // Base64 encoded
  filename: string;
  type?: string;
  disposition?: 'attachment' | 'inline';
  contentId?: string;
}

export interface SendGridResponse {
  statusCode: number;
  messageId?: string;
  success: boolean;
  error?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  generation: 'legacy' | 'dynamic';
  updatedAt: string;
  versions?: Array<{
    id: string;
    name: string;
    active: boolean;
    subject: string;
  }>;
}

export interface EmailStats {
  date: string;
  stats: Array<{
    metrics: {
      requests: number;
      delivered: number;
      opens: number;
      clicks: number;
      bounces: number;
      spam_reports: number;
      unsubscribes: number;
    };
  }>;
}

class SendGridService {
  private static instance: SendGridService;
  private config: SendGridConfig | null = null;
  private baseUrl = 'https://api.sendgrid.com/v3';

  private constructor() {}

  static getInstance(): SendGridService {
    if (!SendGridService.instance) {
      SendGridService.instance = new SendGridService();
    }
    return SendGridService.instance;
  }

  /**
   * Initialize SendGrid with API key
   */
  initialize(config: SendGridConfig): void {
    this.config = config;
  }

  /**
   * Initialize from environment variables
   */
  initializeFromEnv(): void {
    this.config = {
      apiKey: process.env.SENDGRID_API_KEY || '',
      fromEmail: process.env.SENDGRID_FROM_EMAIL || '',
      fromName: process.env.SENDGRID_FROM_NAME || 'KAZI',
      replyTo: process.env.SENDGRID_REPLY_TO,
    };
  }

  private getHeaders(): Record<string, string> {
    if (!this.config) {
      throw new Error('SendGrid not initialized. Call initialize() first.');
    }
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  // =====================================================
  // EMAIL SENDING
  // =====================================================

  /**
   * Send a single email
   */
  async sendEmail(message: EmailMessage): Promise<SendGridResponse> {
    if (!this.config) throw new Error('SendGrid not initialized');

    const toAddresses = Array.isArray(message.to) ? message.to : [message.to];

    const payload: any = {
      personalizations: [{
        to: toAddresses,
        cc: message.cc,
        bcc: message.bcc,
        dynamic_template_data: message.dynamicTemplateData,
        custom_args: message.customArgs,
      }],
      from: {
        email: this.config.fromEmail,
        name: this.config.fromName,
      },
      subject: message.subject,
      reply_to: message.replyTo || (this.config.replyTo ? { email: this.config.replyTo } : undefined),
      categories: message.categories,
      send_at: message.sendAt,
      batch_id: message.batchId,
    };

    if (message.templateId) {
      payload.template_id = message.templateId;
    } else {
      payload.content = [];
      if (message.text) {
        payload.content.push({ type: 'text/plain', value: message.text });
      }
      if (message.html) {
        payload.content.push({ type: 'text/html', value: message.html });
      }
    }

    if (message.attachments?.length) {
      payload.attachments = message.attachments;
    }

    const response = await fetch(`${this.baseUrl}/mail/send`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    const messageId = response.headers.get('X-Message-Id');

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        statusCode: response.status,
        success: false,
        error: errorData.errors?.[0]?.message || 'Failed to send email',
      };
    }

    return {
      statusCode: response.status,
      messageId: messageId || undefined,
      success: true,
    };
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(messages: EmailMessage[]): Promise<SendGridResponse[]> {
    return Promise.all(messages.map(msg => this.sendEmail(msg)));
  }

  // =====================================================
  // TEMPLATE MANAGEMENT
  // =====================================================

  /**
   * List all email templates
   */
  async listTemplates(generations = 'dynamic'): Promise<EmailTemplate[]> {
    const response = await fetch(
      `${this.baseUrl}/templates?generations=${generations}&page_size=100`,
      { headers: this.getHeaders() }
    );

    if (!response.ok) {
      throw new Error('Failed to list templates');
    }

    const data = await response.json();
    return data.templates || [];
  }

  /**
   * Get template details
   */
  async getTemplate(templateId: string): Promise<EmailTemplate> {
    const response = await fetch(
      `${this.baseUrl}/templates/${templateId}`,
      { headers: this.getHeaders() }
    );

    if (!response.ok) {
      throw new Error('Failed to get template');
    }

    return response.json();
  }

  // =====================================================
  // KAZI EMAIL TEMPLATES
  // =====================================================

  /**
   * Send invoice email
   */
  async sendInvoiceEmail(data: {
    to: EmailAddress;
    invoiceNumber: string;
    amount: string;
    dueDate: string;
    clientName: string;
    items: Array<{ description: string; quantity: number; price: string }>;
    paymentLink: string;
    companyName?: string;
  }): Promise<SendGridResponse> {
    const itemsHtml = data.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.description}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Invoice #${data.invoiceNumber}</h1>
        </div>
        <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px;">
          <p>Hi ${data.clientName},</p>
          <p>Please find your invoice details below:</p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 10px; text-align: left;">Description</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 15px; font-weight: bold;">Total Due</td>
                <td style="padding: 15px; font-weight: bold; text-align: right; font-size: 1.2em;">${data.amount}</td>
              </tr>
            </tfoot>
          </table>

          <p><strong>Due Date:</strong> ${data.dueDate}</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.paymentLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold;">Pay Now</a>
          </div>

          <p style="color: #666; font-size: 0.9em;">
            If you have any questions about this invoice, please reply to this email.
          </p>
        </div>
        <div style="text-align: center; padding: 20px; color: #999; font-size: 0.8em;">
          <p>${data.companyName || 'KAZI'} - Professional Invoicing</p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: data.to,
      subject: `Invoice #${data.invoiceNumber} - ${data.amount} Due`,
      html,
      categories: ['invoice', 'transactional'],
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(data: {
    to: EmailAddress;
    userName: string;
    loginLink: string;
  }): Promise<SendGridResponse> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to KAZI! 🎉</h1>
        </div>
        <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 1.1em;">Hi ${data.userName},</p>
          <p>We're thrilled to have you on board! KAZI is your all-in-one platform for managing projects, clients, invoices, and growing your business.</p>

          <h3>Here's what you can do:</h3>
          <ul style="line-height: 1.8;">
            <li>📋 Manage projects and tasks efficiently</li>
            <li>👥 Keep track of clients and contacts</li>
            <li>💰 Create and send professional invoices</li>
            <li>📊 View analytics and insights</li>
            <li>🤖 Use AI-powered tools to boost productivity</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.loginLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold;">Get Started</a>
          </div>

          <p>Need help? Our support team is always here to assist you.</p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: data.to,
      subject: 'Welcome to KAZI! 🎉',
      html,
      categories: ['welcome', 'onboarding'],
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(data: {
    to: EmailAddress;
    userName: string;
    resetLink: string;
    expiresIn: string;
  }): Promise<SendGridResponse> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hi ${data.userName},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetLink}" style="background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>

          <p style="color: #666; font-size: 0.9em;">This link will expire in ${data.expiresIn}.</p>
          <p style="color: #666; font-size: 0.9em;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: data.to,
      subject: 'Reset Your Password',
      html,
      categories: ['password-reset', 'security'],
    });
  }

  /**
   * Send project update notification
   */
  async sendProjectUpdateEmail(data: {
    to: EmailAddress;
    clientName: string;
    projectName: string;
    status: string;
    updateMessage: string;
    viewLink: string;
  }): Promise<SendGridResponse> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #333;">Project Update 📋</h2>
          <p>Hi ${data.clientName},</p>
          <p>Your project <strong>${data.projectName}</strong> has been updated:</p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Status:</strong> ${data.status}</p>
            <p style="margin: 10px 0 0;">${data.updateMessage}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.viewLink}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">View Project</a>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: data.to,
      subject: `Project Update: ${data.projectName}`,
      html,
      categories: ['project-update', 'notification'],
    });
  }

  /**
   * Send payment confirmation
   */
  async sendPaymentConfirmationEmail(data: {
    to: EmailAddress;
    clientName: string;
    amount: string;
    invoiceNumber: string;
    paymentMethod: string;
    transactionId: string;
    receiptLink: string;
  }): Promise<SendGridResponse> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #10b981; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">Payment Received ✓</h1>
        </div>
        <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px;">
          <p>Hi ${data.clientName},</p>
          <p>Thank you for your payment! Here are the details:</p>

          <table style="width: 100%; margin: 20px 0;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Amount</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${data.amount}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Invoice</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">#${data.invoiceNumber}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Payment Method</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${data.paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0;"><strong>Transaction ID</strong></td>
              <td style="padding: 10px 0; text-align: right; font-family: monospace;">${data.transactionId}</td>
            </tr>
          </table>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.receiptLink}" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Download Receipt</a>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: data.to,
      subject: `Payment Confirmed - ${data.amount}`,
      html,
      categories: ['payment', 'receipt'],
    });
  }

  // =====================================================
  // STATISTICS
  // =====================================================

  /**
   * Get email statistics
   */
  async getStats(startDate: string, endDate: string): Promise<EmailStats[]> {
    const response = await fetch(
      `${this.baseUrl}/stats?start_date=${startDate}&end_date=${endDate}`,
      { headers: this.getHeaders() }
    );

    if (!response.ok) {
      throw new Error('Failed to get email stats');
    }

    return response.json();
  }

  /**
   * Get category statistics
   */
  async getCategoryStats(startDate: string, endDate: string, categories: string[]): Promise<any> {
    const categoriesParam = categories.map(c => `categories=${c}`).join('&');
    const response = await fetch(
      `${this.baseUrl}/categories/stats?start_date=${startDate}&end_date=${endDate}&${categoriesParam}`,
      { headers: this.getHeaders() }
    );

    if (!response.ok) {
      throw new Error('Failed to get category stats');
    }

    return response.json();
  }
}

export const sendGridService = SendGridService.getInstance();
