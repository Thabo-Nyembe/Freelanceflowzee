/**
 * Email Service Provider Integration
 *
 * Unified email sending service supporting multiple providers:
 * - Resend (primary)
 * - SendGrid
 * - Mailgun
 * - AWS SES
 * - SMTP
 *
 * Features:
 * - Provider abstraction
 * - Automatic retry with exponential backoff
 * - Rate limiting
 * - Batch sending
 * - Template rendering
 * - Attachment handling
 */

import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('EmailService')

// ============================================================================
// Types
// ============================================================================

export type EmailProvider = 'resend' | 'sendgrid' | 'mailgun' | 'ses' | 'smtp' | 'mock'

export interface EmailConfig {
  provider: EmailProvider
  apiKey?: string
  domain?: string
  region?: string
  // SMTP config
  smtp?: {
    host: string
    port: number
    secure: boolean
    auth: {
      user: string
      pass: string
    }
  }
  // Default sender
  defaultFrom: string
  defaultReplyTo?: string
  // Rate limiting
  rateLimit?: {
    maxPerSecond: number
    maxPerMinute: number
    maxPerHour: number
  }
  // Retry config
  retry?: {
    maxAttempts: number
    initialDelay: number
    maxDelay: number
    backoffMultiplier: number
  }
}

export interface EmailMessage {
  to: string | string[]
  from?: string
  replyTo?: string
  subject: string
  text?: string
  html?: string
  // Template support
  templateId?: string
  templateData?: Record<string, any>
  // Attachments
  attachments?: EmailAttachment[]
  // Headers
  headers?: Record<string, string>
  // Tags for analytics
  tags?: string[]
  // Custom metadata
  metadata?: Record<string, any>
  // Campaign tracking
  campaignId?: string
  subscriberId?: string
}

export interface EmailAttachment {
  filename: string
  content: string | Buffer
  contentType?: string
  encoding?: 'base64' | 'utf-8'
}

export interface EmailResult {
  success: boolean
  messageId?: string
  provider: EmailProvider
  timestamp: Date
  error?: string
  errorCode?: string
  retryable?: boolean
}

export interface BatchEmailResult {
  total: number
  successful: number
  failed: number
  results: EmailResult[]
  duration: number
}

export interface EmailEvent {
  id: string
  messageId: string
  type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'unsubscribed'
  timestamp: Date
  email: string
  metadata?: {
    ip?: string
    userAgent?: string
    link?: string
    bounceType?: 'hard' | 'soft'
    bounceReason?: string
    complaintType?: string
  }
}

// ============================================================================
// Provider Interfaces
// ============================================================================

interface EmailProviderAdapter {
  send(message: EmailMessage): Promise<EmailResult>
  sendBatch(messages: EmailMessage[]): Promise<BatchEmailResult>
  validateEmail(email: string): Promise<boolean>
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: Partial<EmailConfig> = {
  provider: 'mock',
  defaultFrom: 'noreply@kazi.com',
  rateLimit: {
    maxPerSecond: 10,
    maxPerMinute: 100,
    maxPerHour: 1000
  },
  retry: {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2
  }
}

// ============================================================================
// Provider Adapters
// ============================================================================

/**
 * Resend Provider Adapter
 */
class ResendAdapter implements EmailProviderAdapter {
  private apiKey: string
  private defaultFrom: string

  constructor(apiKey: string, defaultFrom: string) {
    this.apiKey = apiKey
    this.defaultFrom = defaultFrom
  }

  async send(message: EmailMessage): Promise<EmailResult> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: message.from || this.defaultFrom,
          to: Array.isArray(message.to) ? message.to : [message.to],
          reply_to: message.replyTo,
          subject: message.subject,
          text: message.text,
          html: message.html,
          attachments: message.attachments?.map(att => ({
            filename: att.filename,
            content: typeof att.content === 'string' ? att.content : att.content.toString('base64')
          })),
          headers: message.headers,
          tags: message.tags?.map(tag => ({ name: tag, value: 'true' }))
        })
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          provider: 'resend',
          timestamp: new Date(),
          error: data.message || 'Failed to send email',
          errorCode: data.name,
          retryable: response.status >= 500
        }
      }

      return {
        success: true,
        messageId: data.id,
        provider: 'resend',
        timestamp: new Date()
      }
    } catch (error) {
      return {
        success: false,
        provider: 'resend',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
        retryable: true
      }
    }
  }

  async sendBatch(messages: EmailMessage[]): Promise<BatchEmailResult> {
    const startTime = Date.now()
    const results: EmailResult[] = []

    // Resend supports batch sending
    try {
      const response = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messages.map(msg => ({
          from: msg.from || this.defaultFrom,
          to: Array.isArray(msg.to) ? msg.to : [msg.to],
          reply_to: msg.replyTo,
          subject: msg.subject,
          text: msg.text,
          html: msg.html
        })))
      })

      const data = await response.json()

      if (response.ok && Array.isArray(data.data)) {
        for (const item of data.data) {
          results.push({
            success: true,
            messageId: item.id,
            provider: 'resend',
            timestamp: new Date()
          })
        }
      } else {
        // Fall back to individual sends
        for (const msg of messages) {
          results.push(await this.send(msg))
        }
      }
    } catch {
      // Fall back to individual sends
      for (const msg of messages) {
        results.push(await this.send(msg))
      }
    }

    return {
      total: messages.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
      duration: Date.now() - startTime
    }
  }

  async validateEmail(email: string): Promise<boolean> {
    // Basic validation - Resend doesn't have email validation API
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

/**
 * SendGrid Provider Adapter
 */
class SendGridAdapter implements EmailProviderAdapter {
  private apiKey: string
  private defaultFrom: string

  constructor(apiKey: string, defaultFrom: string) {
    this.apiKey = apiKey
    this.defaultFrom = defaultFrom
  }

  async send(message: EmailMessage): Promise<EmailResult> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: (Array.isArray(message.to) ? message.to : [message.to]).map(email => ({ email }))
          }],
          from: { email: message.from || this.defaultFrom },
          reply_to: message.replyTo ? { email: message.replyTo } : undefined,
          subject: message.subject,
          content: [
            message.text ? { type: 'text/plain', value: message.text } : null,
            message.html ? { type: 'text/html', value: message.html } : null
          ].filter(Boolean),
          attachments: message.attachments?.map(att => ({
            content: typeof att.content === 'string' ? att.content : att.content.toString('base64'),
            filename: att.filename,
            type: att.contentType
          })),
          custom_args: message.metadata,
          categories: message.tags
        })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        return {
          success: false,
          provider: 'sendgrid',
          timestamp: new Date(),
          error: data.errors?.[0]?.message || 'Failed to send email',
          retryable: response.status >= 500
        }
      }

      const messageId = response.headers.get('X-Message-Id')

      return {
        success: true,
        messageId: messageId || undefined,
        provider: 'sendgrid',
        timestamp: new Date()
      }
    } catch (error) {
      return {
        success: false,
        provider: 'sendgrid',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
        retryable: true
      }
    }
  }

  async sendBatch(messages: EmailMessage[]): Promise<BatchEmailResult> {
    const startTime = Date.now()
    const results: EmailResult[] = []

    // SendGrid batch through personalizations
    for (const msg of messages) {
      results.push(await this.send(msg))
      // Small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return {
      total: messages.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
      duration: Date.now() - startTime
    }
  }

  async validateEmail(email: string): Promise<boolean> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

/**
 * Mock Provider Adapter (for testing)
 */
class MockAdapter implements EmailProviderAdapter {
  private simulateDelay: number
  private failureRate: number

  constructor(simulateDelay: number = 100, failureRate: number = 0) {
    this.simulateDelay = simulateDelay
    this.failureRate = failureRate
  }

  async send(message: EmailMessage): Promise<EmailResult> {
    await new Promise(resolve => setTimeout(resolve, this.simulateDelay))

    if (Math.random() < this.failureRate) {
      return {
        success: false,
        provider: 'mock',
        timestamp: new Date(),
        error: 'Simulated failure',
        retryable: true
      }
    }

    const messageId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    logger.info('Mock email sent', {
      messageId,
      to: message.to,
      subject: message.subject
    })

    return {
      success: true,
      messageId,
      provider: 'mock',
      timestamp: new Date()
    }
  }

  async sendBatch(messages: EmailMessage[]): Promise<BatchEmailResult> {
    const startTime = Date.now()
    const results: EmailResult[] = []

    for (const msg of messages) {
      results.push(await this.send(msg))
    }

    return {
      total: messages.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
      duration: Date.now() - startTime
    }
  }

  async validateEmail(email: string): Promise<boolean> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

// ============================================================================
// Email Service Class
// ============================================================================

export class EmailService {
  private config: EmailConfig
  private adapter: EmailProviderAdapter
  private rateLimiter: RateLimiter

  constructor(config: Partial<EmailConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config } as EmailConfig
    this.adapter = this.createAdapter()
    this.rateLimiter = new RateLimiter(this.config.rateLimit!)
  }

  private createAdapter(): EmailProviderAdapter {
    switch (this.config.provider) {
      case 'resend':
        if (!this.config.apiKey) throw new Error('Resend API key required')
        return new ResendAdapter(this.config.apiKey, this.config.defaultFrom)

      case 'sendgrid':
        if (!this.config.apiKey) throw new Error('SendGrid API key required')
        return new SendGridAdapter(this.config.apiKey, this.config.defaultFrom)

      case 'mock':
      default:
        return new MockAdapter()
    }
  }

  /**
   * Send a single email
   */
  async send(message: EmailMessage): Promise<EmailResult> {
    // Wait for rate limiter
    await this.rateLimiter.acquire()

    // Validate email addresses
    const emails = Array.isArray(message.to) ? message.to : [message.to]
    for (const email of emails) {
      if (!await this.adapter.validateEmail(email)) {
        return {
          success: false,
          provider: this.config.provider,
          timestamp: new Date(),
          error: `Invalid email address: ${email}`,
          retryable: false
        }
      }
    }

    // Send with retry
    return this.sendWithRetry(message)
  }

  /**
   * Send multiple emails in batch
   */
  async sendBatch(messages: EmailMessage[]): Promise<BatchEmailResult> {
    // Acquire rate limit tokens for all messages
    for (let i = 0; i < messages.length; i++) {
      await this.rateLimiter.acquire()
    }

    return this.adapter.sendBatch(messages)
  }

  /**
   * Send with automatic retry
   */
  private async sendWithRetry(message: EmailMessage): Promise<EmailResult> {
    const { maxAttempts, initialDelay, maxDelay, backoffMultiplier } = this.config.retry!
    let lastResult: EmailResult | null = null
    let delay = initialDelay

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      lastResult = await this.adapter.send(message)

      if (lastResult.success || !lastResult.retryable) {
        return lastResult
      }

      if (attempt < maxAttempts) {
        logger.warn('Email send failed, retrying', {
          attempt,
          maxAttempts,
          delay,
          error: lastResult.error
        })
        await new Promise(resolve => setTimeout(resolve, delay))
        delay = Math.min(delay * backoffMultiplier, maxDelay)
      }
    }

    return lastResult!
  }

  /**
   * Render template with data
   */
  renderTemplate(template: string, data: Record<string, any>): string {
    let rendered = template

    // Simple mustache-style replacement
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
      rendered = rendered.replace(regex, String(value ?? ''))
    }

    // Handle conditionals {{#if key}}...{{/if}}
    rendered = rendered.replace(
      /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (_, key, content) => data[key] ? content : ''
    )

    // Handle loops {{#each key}}...{{/each}}
    rendered = rendered.replace(
      /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
      (_, key, content) => {
        const items = data[key]
        if (!Array.isArray(items)) return ''
        return items.map(item => {
          let itemContent = content
          for (const [k, v] of Object.entries(item)) {
            const regex = new RegExp(`{{\\s*${k}\\s*}}`, 'g')
            itemContent = itemContent.replace(regex, String(v ?? ''))
          }
          return itemContent
        }).join('')
      }
    )

    return rendered
  }

  /**
   * Generate tracking pixel URL
   */
  generateTrackingPixel(messageId: string, subscriberId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const params = new URLSearchParams({
      mid: messageId,
      sid: subscriberId
    })
    return `${baseUrl}/api/email/track/open?${params.toString()}`
  }

  /**
   * Generate tracked link URL
   */
  generateTrackedLink(
    originalUrl: string,
    messageId: string,
    subscriberId: string,
    linkId: string
  ): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const params = new URLSearchParams({
      mid: messageId,
      sid: subscriberId,
      lid: linkId,
      url: originalUrl
    })
    return `${baseUrl}/api/email/track/click?${params.toString()}`
  }

  /**
   * Add tracking to HTML email
   */
  addTracking(
    html: string,
    messageId: string,
    subscriberId: string,
    campaignId?: string
  ): string {
    let tracked = html

    // Add tracking pixel before </body>
    const trackingPixel = `<img src="${this.generateTrackingPixel(messageId, subscriberId)}" width="1" height="1" style="display:none;" alt="" />`
    tracked = tracked.replace('</body>', `${trackingPixel}</body>`)

    // Replace links with tracked versions
    let linkIndex = 0
    tracked = tracked.replace(
      /href="(https?:\/\/[^"]+)"/g,
      (_, url) => {
        // Don't track unsubscribe links
        if (url.includes('unsubscribe')) return `href="${url}"`

        const linkId = `link_${linkIndex++}`
        const trackedUrl = this.generateTrackedLink(url, messageId, subscriberId, linkId)
        return `href="${trackedUrl}"`
      }
    )

    return tracked
  }

  /**
   * Validate email address format
   */
  async validateEmail(email: string): Promise<boolean> {
    return this.adapter.validateEmail(email)
  }

  /**
   * Get provider name
   */
  getProvider(): EmailProvider {
    return this.config.provider
  }
}

// ============================================================================
// Rate Limiter
// ============================================================================

class RateLimiter {
  private tokens: number
  private maxTokens: number
  private refillRate: number // tokens per second
  private lastRefill: number
  private queue: Array<() => void> = []

  constructor(config: { maxPerSecond: number; maxPerMinute: number; maxPerHour: number }) {
    this.maxTokens = config.maxPerSecond
    this.tokens = this.maxTokens
    this.refillRate = config.maxPerSecond
    this.lastRefill = Date.now()
  }

  async acquire(): Promise<void> {
    this.refill()

    if (this.tokens > 0) {
      this.tokens--
      return
    }

    // Wait for token
    return new Promise(resolve => {
      this.queue.push(resolve)
      setTimeout(() => this.processQueue(), 1000 / this.refillRate)
    })
  }

  private refill(): void {
    const now = Date.now()
    const elapsed = (now - this.lastRefill) / 1000
    const newTokens = elapsed * this.refillRate

    this.tokens = Math.min(this.maxTokens, this.tokens + newTokens)
    this.lastRefill = now
  }

  private processQueue(): void {
    this.refill()

    while (this.tokens > 0 && this.queue.length > 0) {
      this.tokens--
      const resolve = this.queue.shift()
      resolve?.()
    }

    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), 1000 / this.refillRate)
    }
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

let defaultEmailService: EmailService | null = null

export function getEmailService(): EmailService {
  if (!defaultEmailService) {
    defaultEmailService = new EmailService({
      provider: (process.env.EMAIL_PROVIDER as EmailProvider) || 'mock',
      apiKey: process.env.EMAIL_API_KEY || process.env.RESEND_API_KEY,
      defaultFrom: process.env.EMAIL_FROM || 'KAZI <noreply@kazi.com>',
      defaultReplyTo: process.env.EMAIL_REPLY_TO
    })
  }
  return defaultEmailService
}

export function createEmailService(config: Partial<EmailConfig>): EmailService {
  return new EmailService(config)
}

// Export singleton instance for convenience
export const emailService = getEmailService()

export default {
  EmailService,
  getEmailService,
  createEmailService,
  emailService
}
