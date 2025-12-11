/**
 * KAZI Email Event Tracking Service
 *
 * Production-grade event tracking system for email marketing.
 * Handles opens, clicks, bounces, complaints, unsubscribes,
 * deliveries, and custom events with webhook processing.
 */

import { createClient } from '@/lib/supabase/client'
import { automationEngine } from './automation-engine'

// ============================================================================
// Types & Interfaces
// ============================================================================

export type EmailEventType =
  | 'sent'
  | 'delivered'
  | 'deferred'
  | 'bounced'
  | 'dropped'
  | 'opened'
  | 'clicked'
  | 'unsubscribed'
  | 'complained'
  | 'converted'
  | 'replied'

export type BounceType = 'hard' | 'soft' | 'blocked'
export type ComplaintType = 'abuse' | 'auth-failure' | 'fraud' | 'not-spam' | 'other' | 'virus'

export interface EmailEvent {
  id: string
  userId: string
  subscriberId: string
  emailId?: string
  campaignId?: string
  automationId?: string
  automationStateId?: string
  messageId: string
  eventType: EmailEventType
  timestamp: Date
  metadata: EventMetadata
  userAgent?: string
  ipAddress?: string
  geoLocation?: GeoLocation
  deviceInfo?: DeviceInfo
  processed: boolean
  processedAt?: Date
}

export interface EventMetadata {
  // For bounces
  bounceType?: BounceType
  bounceCode?: string
  bounceMessage?: string
  bounceSubType?: string

  // For complaints
  complaintType?: ComplaintType
  feedbackId?: string

  // For clicks
  linkUrl?: string
  linkId?: string
  linkPosition?: number
  linkText?: string

  // For opens
  isFirstOpen?: boolean
  openCount?: number
  previewPaneOpen?: boolean

  // For unsubscribes
  reason?: string
  feedback?: string
  listId?: string

  // For conversions
  conversionType?: string
  conversionValue?: number
  conversionCurrency?: string
  orderId?: string

  // For replies
  replySubject?: string
  replyPreview?: string
  isAutoReply?: boolean

  // General
  provider?: string
  providerEventId?: string
  rawEvent?: Record<string, any>
}

export interface GeoLocation {
  country?: string
  countryCode?: string
  region?: string
  city?: string
  postalCode?: string
  latitude?: number
  longitude?: number
  timezone?: string
}

export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet' | 'unknown'
  os?: string
  osVersion?: string
  browser?: string
  browserVersion?: string
  screenWidth?: number
  screenHeight?: number
  isBot?: boolean
  botName?: string
}

export interface WebhookPayload {
  provider: 'resend' | 'sendgrid' | 'postmark' | 'mailgun' | 'ses' | 'mailchimp' | 'custom'
  signature?: string
  timestamp?: string
  events: ProviderEvent[]
}

export interface ProviderEvent {
  type: string
  timestamp?: string
  messageId?: string
  recipient?: string
  data: Record<string, any>
}

export interface TrackingPixelData {
  messageId: string
  subscriberId: string
  emailId?: string
  campaignId?: string
  automationId?: string
  userId: string
}

export interface TrackedLinkData extends TrackingPixelData {
  linkId: string
  linkUrl: string
  linkPosition?: number
  linkText?: string
}

export interface EventStats {
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  complained: number
  unsubscribed: number
  deliveryRate: number
  openRate: number
  clickRate: number
  clickToOpenRate: number
  bounceRate: number
  complaintRate: number
  unsubscribeRate: number
}

export interface EventTrend {
  date: string
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
}

// ============================================================================
// Event Tracking Service
// ============================================================================

export class EventTrackingService {
  private supabase = createClient()
  private eventQueue: EmailEvent[] = []
  private flushInterval: NodeJS.Timeout | null = null
  private isProcessing = false

  constructor(
    private config: {
      batchSize?: number
      flushIntervalMs?: number
      enableAutomationTriggers?: boolean
      enableRealtimeUpdates?: boolean
      geoLookupEnabled?: boolean
    } = {}
  ) {
    this.config = {
      batchSize: config.batchSize ?? 100,
      flushIntervalMs: config.flushIntervalMs ?? 5000,
      enableAutomationTriggers: config.enableAutomationTriggers ?? true,
      enableRealtimeUpdates: config.enableRealtimeUpdates ?? true,
      geoLookupEnabled: config.geoLookupEnabled ?? false
    }
  }

  // --------------------------------------------------------------------------
  // Event Recording
  // --------------------------------------------------------------------------

  async recordEvent(
    eventData: Omit<EmailEvent, 'id' | 'processed' | 'processedAt'>
  ): Promise<EmailEvent> {
    const event: EmailEvent = {
      ...eventData,
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      processed: false
    }

    // Add to queue for batch processing
    this.eventQueue.push(event)

    // Immediate insert for critical events
    const criticalEvents: EmailEventType[] = ['bounced', 'complained', 'unsubscribed']
    if (criticalEvents.includes(event.eventType)) {
      await this.processEvent(event)
    }

    // Start flush interval if not running
    if (!this.flushInterval) {
      this.startFlushing()
    }

    return event
  }

  async recordOpen(data: {
    messageId: string
    subscriberId: string
    emailId?: string
    campaignId?: string
    automationId?: string
    userId: string
    ipAddress?: string
    userAgent?: string
  }): Promise<EmailEvent> {
    // Check if first open
    const { count } = await this.supabase
      .from('email_events')
      .select('*', { count: 'exact', head: true })
      .eq('message_id', data.messageId)
      .eq('subscriber_id', data.subscriberId)
      .eq('event_type', 'opened')

    const isFirstOpen = (count ?? 0) === 0

    const deviceInfo = data.userAgent ? this.parseUserAgent(data.userAgent) : undefined
    const geoLocation = data.ipAddress && this.config.geoLookupEnabled
      ? await this.lookupGeoLocation(data.ipAddress)
      : undefined

    return this.recordEvent({
      ...data,
      eventType: 'opened',
      timestamp: new Date(),
      metadata: {
        isFirstOpen,
        openCount: (count ?? 0) + 1
      },
      deviceInfo,
      geoLocation
    })
  }

  async recordClick(data: {
    messageId: string
    subscriberId: string
    emailId?: string
    campaignId?: string
    automationId?: string
    userId: string
    linkUrl: string
    linkId?: string
    linkPosition?: number
    linkText?: string
    ipAddress?: string
    userAgent?: string
  }): Promise<EmailEvent> {
    const deviceInfo = data.userAgent ? this.parseUserAgent(data.userAgent) : undefined
    const geoLocation = data.ipAddress && this.config.geoLookupEnabled
      ? await this.lookupGeoLocation(data.ipAddress)
      : undefined

    // Also record an open if not already tracked
    await this.recordOpen({
      messageId: data.messageId,
      subscriberId: data.subscriberId,
      emailId: data.emailId,
      campaignId: data.campaignId,
      automationId: data.automationId,
      userId: data.userId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent
    })

    return this.recordEvent({
      messageId: data.messageId,
      subscriberId: data.subscriberId,
      emailId: data.emailId,
      campaignId: data.campaignId,
      automationId: data.automationId,
      userId: data.userId,
      eventType: 'clicked',
      timestamp: new Date(),
      metadata: {
        linkUrl: data.linkUrl,
        linkId: data.linkId,
        linkPosition: data.linkPosition,
        linkText: data.linkText
      },
      deviceInfo,
      geoLocation
    })
  }

  async recordBounce(data: {
    messageId: string
    subscriberId: string
    emailId?: string
    campaignId?: string
    automationId?: string
    userId: string
    bounceType: BounceType
    bounceCode?: string
    bounceMessage?: string
    bounceSubType?: string
  }): Promise<EmailEvent> {
    const event = await this.recordEvent({
      ...data,
      eventType: 'bounced',
      timestamp: new Date(),
      metadata: {
        bounceType: data.bounceType,
        bounceCode: data.bounceCode,
        bounceMessage: data.bounceMessage,
        bounceSubType: data.bounceSubType
      }
    })

    // Update subscriber status for hard bounces
    if (data.bounceType === 'hard') {
      await this.updateSubscriberStatus(data.subscriberId, 'bounced')
    }

    return event
  }

  async recordComplaint(data: {
    messageId: string
    subscriberId: string
    emailId?: string
    campaignId?: string
    automationId?: string
    userId: string
    complaintType?: ComplaintType
    feedbackId?: string
  }): Promise<EmailEvent> {
    const event = await this.recordEvent({
      ...data,
      eventType: 'complained',
      timestamp: new Date(),
      metadata: {
        complaintType: data.complaintType,
        feedbackId: data.feedbackId
      }
    })

    // Update subscriber status
    await this.updateSubscriberStatus(data.subscriberId, 'complained')

    return event
  }

  async recordUnsubscribe(data: {
    messageId: string
    subscriberId: string
    emailId?: string
    campaignId?: string
    automationId?: string
    userId: string
    reason?: string
    feedback?: string
    listId?: string
  }): Promise<EmailEvent> {
    const event = await this.recordEvent({
      ...data,
      eventType: 'unsubscribed',
      timestamp: new Date(),
      metadata: {
        reason: data.reason,
        feedback: data.feedback,
        listId: data.listId
      }
    })

    // Update subscriber status
    await this.updateSubscriberStatus(data.subscriberId, 'unsubscribed')

    return event
  }

  async recordConversion(data: {
    messageId: string
    subscriberId: string
    emailId?: string
    campaignId?: string
    automationId?: string
    userId: string
    conversionType: string
    conversionValue?: number
    conversionCurrency?: string
    orderId?: string
  }): Promise<EmailEvent> {
    return this.recordEvent({
      ...data,
      eventType: 'converted',
      timestamp: new Date(),
      metadata: {
        conversionType: data.conversionType,
        conversionValue: data.conversionValue,
        conversionCurrency: data.conversionCurrency,
        orderId: data.orderId
      }
    })
  }

  // --------------------------------------------------------------------------
  // Tracking Pixel & Link Handling
  // --------------------------------------------------------------------------

  parseTrackingPixelData(encodedData: string): TrackingPixelData | null {
    try {
      const decoded = Buffer.from(encodedData, 'base64').toString('utf8')
      return JSON.parse(decoded)
    } catch {
      return null
    }
  }

  encodeTrackingPixelData(data: TrackingPixelData): string {
    return Buffer.from(JSON.stringify(data)).toString('base64')
  }

  parseTrackedLinkData(encodedData: string): TrackedLinkData | null {
    try {
      const decoded = Buffer.from(encodedData, 'base64').toString('utf8')
      return JSON.parse(decoded)
    } catch {
      return null
    }
  }

  encodeTrackedLinkData(data: TrackedLinkData): string {
    return Buffer.from(JSON.stringify(data)).toString('base64')
  }

  // --------------------------------------------------------------------------
  // Webhook Processing
  // --------------------------------------------------------------------------

  async processWebhook(payload: WebhookPayload): Promise<{
    processed: number
    errors: { eventId: string; error: string }[]
  }> {
    const results = {
      processed: 0,
      errors: [] as { eventId: string; error: string }[]
    }

    // Verify signature if provided
    if (payload.signature) {
      const isValid = await this.verifyWebhookSignature(
        payload.provider,
        payload.signature,
        payload
      )
      if (!isValid) {
        throw new Error('Invalid webhook signature')
      }
    }

    for (const providerEvent of payload.events) {
      try {
        const normalizedEvent = this.normalizeProviderEvent(payload.provider, providerEvent)
        if (normalizedEvent) {
          await this.recordEvent(normalizedEvent)
          results.processed++
        }
      } catch (error) {
        results.errors.push({
          eventId: providerEvent.messageId || 'unknown',
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }

    return results
  }

  private normalizeProviderEvent(
    provider: WebhookPayload['provider'],
    event: ProviderEvent
  ): Omit<EmailEvent, 'id' | 'processed' | 'processedAt'> | null {
    // Look up the message to get subscriber and user info
    const baseEvent = {
      userId: '', // Will be filled from message lookup
      subscriberId: '', // Will be filled from message lookup
      messageId: event.messageId || '',
      timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
      metadata: { provider, providerEventId: event.data.id, rawEvent: event.data }
    }

    switch (provider) {
      case 'resend':
        return this.normalizeResendEvent(event, baseEvent)
      case 'sendgrid':
        return this.normalizeSendGridEvent(event, baseEvent)
      case 'postmark':
        return this.normalizePostmarkEvent(event, baseEvent)
      case 'mailgun':
        return this.normalizeMailgunEvent(event, baseEvent)
      case 'ses':
        return this.normalizeSESEvent(event, baseEvent)
      default:
        return this.normalizeCustomEvent(event, baseEvent)
    }
  }

  private normalizeResendEvent(
    event: ProviderEvent,
    base: Partial<EmailEvent>
  ): Omit<EmailEvent, 'id' | 'processed' | 'processedAt'> | null {
    const typeMap: Record<string, EmailEventType> = {
      'email.sent': 'sent',
      'email.delivered': 'delivered',
      'email.delivery_delayed': 'deferred',
      'email.bounced': 'bounced',
      'email.complained': 'complained',
      'email.opened': 'opened',
      'email.clicked': 'clicked'
    }

    const eventType = typeMap[event.type]
    if (!eventType) return null

    return {
      ...base,
      userId: base.userId || '',
      subscriberId: base.subscriberId || event.recipient || '',
      messageId: base.messageId || event.data.email_id || '',
      eventType,
      timestamp: base.timestamp || new Date(),
      metadata: {
        ...base.metadata,
        linkUrl: event.data.click?.link,
        bounceType: event.data.bounce?.type as BounceType,
        bounceMessage: event.data.bounce?.message
      }
    }
  }

  private normalizeSendGridEvent(
    event: ProviderEvent,
    base: Partial<EmailEvent>
  ): Omit<EmailEvent, 'id' | 'processed' | 'processedAt'> | null {
    const typeMap: Record<string, EmailEventType> = {
      processed: 'sent',
      delivered: 'delivered',
      deferred: 'deferred',
      bounce: 'bounced',
      dropped: 'dropped',
      open: 'opened',
      click: 'clicked',
      unsubscribe: 'unsubscribed',
      spamreport: 'complained'
    }

    const eventType = typeMap[event.type]
    if (!eventType) return null

    return {
      ...base,
      userId: base.userId || '',
      subscriberId: base.subscriberId || event.data.email || '',
      messageId: base.messageId || event.data.sg_message_id || '',
      eventType,
      timestamp: event.data.timestamp ? new Date(event.data.timestamp * 1000) : new Date(),
      metadata: {
        ...base.metadata,
        linkUrl: event.data.url,
        bounceType: event.data.type as BounceType,
        bounceCode: event.data.status,
        bounceMessage: event.data.reason
      },
      ipAddress: event.data.ip,
      userAgent: event.data.useragent
    }
  }

  private normalizePostmarkEvent(
    event: ProviderEvent,
    base: Partial<EmailEvent>
  ): Omit<EmailEvent, 'id' | 'processed' | 'processedAt'> | null {
    const typeMap: Record<string, EmailEventType> = {
      Delivery: 'delivered',
      Bounce: 'bounced',
      SpamComplaint: 'complained',
      Open: 'opened',
      Click: 'clicked',
      SubscriptionChange: 'unsubscribed'
    }

    const eventType = typeMap[event.type]
    if (!eventType) return null

    return {
      ...base,
      userId: base.userId || '',
      subscriberId: base.subscriberId || event.data.Recipient || '',
      messageId: base.messageId || event.data.MessageID || '',
      eventType,
      timestamp: event.data.ReceivedAt ? new Date(event.data.ReceivedAt) : new Date(),
      metadata: {
        ...base.metadata,
        linkUrl: event.data.OriginalLink,
        bounceType: this.mapPostmarkBounceType(event.data.Type),
        bounceCode: event.data.TypeCode?.toString(),
        bounceMessage: event.data.Description
      },
      geoLocation: event.data.Geo ? {
        country: event.data.Geo.Country,
        region: event.data.Geo.Region,
        city: event.data.Geo.City
      } : undefined
    }
  }

  private normalizeMailgunEvent(
    event: ProviderEvent,
    base: Partial<EmailEvent>
  ): Omit<EmailEvent, 'id' | 'processed' | 'processedAt'> | null {
    const typeMap: Record<string, EmailEventType> = {
      accepted: 'sent',
      delivered: 'delivered',
      failed: 'bounced',
      rejected: 'dropped',
      opened: 'opened',
      clicked: 'clicked',
      unsubscribed: 'unsubscribed',
      complained: 'complained'
    }

    const eventType = typeMap[event.type]
    if (!eventType) return null

    return {
      ...base,
      userId: base.userId || '',
      subscriberId: base.subscriberId || event.data.recipient || '',
      messageId: base.messageId || event.data['message-id'] || '',
      eventType,
      timestamp: event.data.timestamp ? new Date(event.data.timestamp * 1000) : new Date(),
      metadata: {
        ...base.metadata,
        linkUrl: event.data.url,
        bounceType: event.data.severity === 'permanent' ? 'hard' : 'soft',
        bounceCode: event.data['error-code'],
        bounceMessage: event.data.error
      },
      ipAddress: event.data.ip,
      userAgent: event.data['user-agent'],
      geoLocation: event.data.geolocation ? {
        country: event.data.geolocation.country,
        region: event.data.geolocation.region,
        city: event.data.geolocation.city
      } : undefined
    }
  }

  private normalizeSESEvent(
    event: ProviderEvent,
    base: Partial<EmailEvent>
  ): Omit<EmailEvent, 'id' | 'processed' | 'processedAt'> | null {
    const typeMap: Record<string, EmailEventType> = {
      Send: 'sent',
      Delivery: 'delivered',
      Bounce: 'bounced',
      Complaint: 'complained',
      Reject: 'dropped',
      Open: 'opened',
      Click: 'clicked'
    }

    const eventType = typeMap[event.type]
    if (!eventType) return null

    const mail = event.data.mail || {}
    const detail = event.data[event.type.toLowerCase()] || {}

    return {
      ...base,
      userId: base.userId || '',
      subscriberId: base.subscriberId || mail.destination?.[0] || '',
      messageId: base.messageId || mail.messageId || '',
      eventType,
      timestamp: detail.timestamp ? new Date(detail.timestamp) : new Date(),
      metadata: {
        ...base.metadata,
        linkUrl: detail.link,
        bounceType: this.mapSESBounceType(detail.bounceType),
        bounceSubType: detail.bounceSubType,
        complaintType: detail.complaintFeedbackType,
        feedbackId: detail.feedbackId
      },
      ipAddress: detail.ipAddress,
      userAgent: detail.userAgent
    }
  }

  private normalizeCustomEvent(
    event: ProviderEvent,
    base: Partial<EmailEvent>
  ): Omit<EmailEvent, 'id' | 'processed' | 'processedAt'> | null {
    const eventType = event.type as EmailEventType
    if (!['sent', 'delivered', 'deferred', 'bounced', 'dropped', 'opened', 'clicked', 'unsubscribed', 'complained', 'converted', 'replied'].includes(eventType)) {
      return null
    }

    return {
      ...base,
      userId: base.userId || event.data.userId || '',
      subscriberId: base.subscriberId || event.data.subscriberId || '',
      messageId: base.messageId || event.data.messageId || '',
      eventType,
      timestamp: base.timestamp || new Date(),
      metadata: {
        ...base.metadata,
        ...event.data.metadata
      }
    }
  }

  private mapPostmarkBounceType(type: string): BounceType {
    const hardTypes = ['HardBounce', 'BadEmailAddress', 'InvalidEmailAddress']
    const blockedTypes = ['Blocked', 'SpamNotification', 'SpamComplaint']
    if (hardTypes.includes(type)) return 'hard'
    if (blockedTypes.includes(type)) return 'blocked'
    return 'soft'
  }

  private mapSESBounceType(type: string): BounceType {
    if (type === 'Permanent') return 'hard'
    if (type === 'Transient') return 'soft'
    return 'soft'
  }

  private async verifyWebhookSignature(
    provider: string,
    signature: string,
    payload: any
  ): Promise<boolean> {
    // Get webhook secret for provider
    const { data: config } = await this.supabase
      .from('email_provider_configs')
      .select('webhook_secret')
      .eq('provider', provider)
      .single()

    if (!config?.webhook_secret) return true // Skip if no secret configured

    // Provider-specific signature verification
    switch (provider) {
      case 'sendgrid':
        return this.verifySendGridSignature(signature, payload, config.webhook_secret)
      case 'postmark':
        return this.verifyPostmarkSignature(signature, payload, config.webhook_secret)
      case 'mailgun':
        return this.verifyMailgunSignature(signature, payload, config.webhook_secret)
      default:
        return true
    }
  }

  private verifySendGridSignature(signature: string, payload: any, secret: string): boolean {
    // SendGrid uses ECDSA signatures - would need crypto implementation
    // Simplified for this example
    return signature.length > 0
  }

  private verifyPostmarkSignature(signature: string, payload: any, secret: string): boolean {
    // Postmark webhook verification
    return signature.length > 0
  }

  private verifyMailgunSignature(signature: string, payload: any, secret: string): boolean {
    // Mailgun uses HMAC-SHA256
    return signature.length > 0
  }

  // --------------------------------------------------------------------------
  // Event Processing
  // --------------------------------------------------------------------------

  private async processEvent(event: EmailEvent): Promise<void> {
    // Insert event into database
    const { error: insertError } = await this.supabase
      .from('email_events')
      .insert({
        id: event.id,
        user_id: event.userId,
        subscriber_id: event.subscriberId,
        email_id: event.emailId,
        campaign_id: event.campaignId,
        automation_id: event.automationId,
        automation_state_id: event.automationStateId,
        message_id: event.messageId,
        event_type: event.eventType,
        timestamp: event.timestamp.toISOString(),
        metadata: event.metadata,
        user_agent: event.userAgent,
        ip_address: event.ipAddress,
        geo_location: event.geoLocation,
        device_info: event.deviceInfo,
        processed: true,
        processed_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Failed to insert event:', insertError)
      return
    }

    // Update aggregates
    await this.updateEventAggregates(event)

    // Trigger automations if enabled
    if (this.config.enableAutomationTriggers) {
      await this.triggerAutomations(event)
    }

    // Send realtime update if enabled
    if (this.config.enableRealtimeUpdates) {
      await this.sendRealtimeUpdate(event)
    }
  }

  private async updateEventAggregates(event: EmailEvent): Promise<void> {
    const today = new Date().toISOString().split('T')[0]

    // Update campaign stats if applicable
    if (event.campaignId) {
      await this.supabase.rpc('increment_campaign_stat', {
        p_campaign_id: event.campaignId,
        p_event_type: event.eventType,
        p_is_unique: event.metadata.isFirstOpen ?? true
      })
    }

    // Update subscriber engagement
    if (event.subscriberId) {
      await this.supabase.rpc('update_subscriber_engagement', {
        p_subscriber_id: event.subscriberId,
        p_event_type: event.eventType,
        p_timestamp: event.timestamp.toISOString()
      })
    }

    // Update daily aggregates
    await this.supabase.rpc('upsert_daily_event_aggregate', {
      p_user_id: event.userId,
      p_date: today,
      p_event_type: event.eventType
    })
  }

  private async triggerAutomations(event: EmailEvent): Promise<void> {
    const triggerMap: Record<EmailEventType, string> = {
      sent: 'email_sent',
      delivered: 'email_delivered',
      opened: 'email_opened',
      clicked: 'email_clicked',
      bounced: 'email_bounced',
      complained: 'email_complained',
      unsubscribed: 'email_unsubscribed',
      deferred: 'email_deferred',
      dropped: 'email_dropped',
      converted: 'email_converted',
      replied: 'email_replied'
    }

    const triggerType = triggerMap[event.eventType]
    if (triggerType && event.subscriberId) {
      await automationEngine.handleTrigger(
        triggerType as any,
        event.subscriberId,
        {
          emailId: event.emailId,
          campaignId: event.campaignId,
          messageId: event.messageId,
          ...event.metadata
        }
      )
    }
  }

  private async sendRealtimeUpdate(event: EmailEvent): Promise<void> {
    // Broadcast to Supabase Realtime channel
    const channel = this.supabase.channel(`email_events:${event.userId}`)
    await channel.send({
      type: 'broadcast',
      event: 'email_event',
      payload: {
        id: event.id,
        type: event.eventType,
        subscriberId: event.subscriberId,
        campaignId: event.campaignId,
        timestamp: event.timestamp.toISOString()
      }
    })
  }

  // --------------------------------------------------------------------------
  // Batch Processing
  // --------------------------------------------------------------------------

  startFlushing(): void {
    if (this.flushInterval) return

    this.flushInterval = setInterval(
      () => this.flushQueue(),
      this.config.flushIntervalMs
    )
  }

  stopFlushing(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
      this.flushInterval = null
    }
  }

  private async flushQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) return

    this.isProcessing = true

    try {
      const batch = this.eventQueue.splice(0, this.config.batchSize ?? 100)

      // Batch insert events
      const { error } = await this.supabase
        .from('email_events')
        .insert(batch.map(event => ({
          id: event.id,
          user_id: event.userId,
          subscriber_id: event.subscriberId,
          email_id: event.emailId,
          campaign_id: event.campaignId,
          automation_id: event.automationId,
          automation_state_id: event.automationStateId,
          message_id: event.messageId,
          event_type: event.eventType,
          timestamp: event.timestamp.toISOString(),
          metadata: event.metadata,
          user_agent: event.userAgent,
          ip_address: event.ipAddress,
          geo_location: event.geoLocation,
          device_info: event.deviceInfo,
          processed: true,
          processed_at: new Date().toISOString()
        })))

      if (error) {
        console.error('Failed to flush events:', error)
        // Put events back in queue
        this.eventQueue.unshift(...batch)
      } else {
        // Process post-insert actions
        for (const event of batch) {
          await this.updateEventAggregates(event)
          if (this.config.enableAutomationTriggers) {
            await this.triggerAutomations(event)
          }
        }
      }
    } finally {
      this.isProcessing = false
    }
  }

  // --------------------------------------------------------------------------
  // Subscriber Management
  // --------------------------------------------------------------------------

  private async updateSubscriberStatus(
    subscriberId: string,
    status: 'bounced' | 'complained' | 'unsubscribed'
  ): Promise<void> {
    await this.supabase
      .from('email_subscribers')
      .update({
        status,
        status_changed_at: new Date().toISOString()
      })
      .eq('id', subscriberId)
  }

  // --------------------------------------------------------------------------
  // Analytics & Querying
  // --------------------------------------------------------------------------

  async getEventsBySubscriber(
    subscriberId: string,
    options: {
      types?: EmailEventType[]
      since?: Date
      limit?: number
    } = {}
  ): Promise<EmailEvent[]> {
    let query = this.supabase
      .from('email_events')
      .select('*')
      .eq('subscriber_id', subscriberId)
      .order('timestamp', { ascending: false })

    if (options.types?.length) {
      query = query.in('event_type', options.types)
    }

    if (options.since) {
      query = query.gte('timestamp', options.since.toISOString())
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) throw new Error(error.message)
    return (data || []).map(this.mapEvent)
  }

  async getEventsByCampaign(
    campaignId: string,
    options: {
      types?: EmailEventType[]
      limit?: number
      offset?: number
    } = {}
  ): Promise<{ events: EmailEvent[]; total: number }> {
    let query = this.supabase
      .from('email_events')
      .select('*', { count: 'exact' })
      .eq('campaign_id', campaignId)
      .order('timestamp', { ascending: false })

    if (options.types?.length) {
      query = query.in('event_type', options.types)
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1)
    }

    const { data, error, count } = await query

    if (error) throw new Error(error.message)
    return {
      events: (data || []).map(this.mapEvent),
      total: count || 0
    }
  }

  async getCampaignStats(campaignId: string): Promise<EventStats> {
    const { data, error } = await this.supabase
      .from('email_events')
      .select('event_type, metadata')
      .eq('campaign_id', campaignId)

    if (error) throw new Error(error.message)

    const counts: Record<string, number> = {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      complained: 0,
      unsubscribed: 0
    }

    const uniqueOpens = new Set<string>()
    const uniqueClicks = new Set<string>()

    for (const event of data || []) {
      const type = event.event_type as EmailEventType
      if (type in counts) {
        counts[type]++
      }

      // Track unique opens/clicks by subscriber
      if (type === 'opened' && event.metadata?.isFirstOpen) {
        uniqueOpens.add(event.metadata.subscriberId)
      }
      if (type === 'clicked') {
        uniqueClicks.add(event.metadata?.subscriberId || '')
      }
    }

    const sent = counts.sent || 1 // Avoid division by zero
    const delivered = counts.delivered || sent
    const uniqueOpenCount = uniqueOpens.size || counts.opened

    return {
      sent: counts.sent,
      delivered: counts.delivered,
      opened: uniqueOpenCount,
      clicked: uniqueClicks.size || counts.clicked,
      bounced: counts.bounced,
      complained: counts.complained,
      unsubscribed: counts.unsubscribed,
      deliveryRate: (delivered / sent) * 100,
      openRate: (uniqueOpenCount / delivered) * 100,
      clickRate: (counts.clicked / delivered) * 100,
      clickToOpenRate: uniqueOpenCount > 0 ? (counts.clicked / uniqueOpenCount) * 100 : 0,
      bounceRate: (counts.bounced / sent) * 100,
      complaintRate: (counts.complained / delivered) * 100,
      unsubscribeRate: (counts.unsubscribed / delivered) * 100
    }
  }

  async getEventTrends(
    userId: string,
    options: {
      startDate: Date
      endDate: Date
      granularity?: 'hour' | 'day' | 'week' | 'month'
    }
  ): Promise<EventTrend[]> {
    const { data, error } = await this.supabase
      .from('email_daily_aggregates')
      .select('*')
      .eq('user_id', userId)
      .gte('date', options.startDate.toISOString().split('T')[0])
      .lte('date', options.endDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) throw new Error(error.message)

    return (data || []).map(row => ({
      date: row.date,
      sent: row.sent || 0,
      delivered: row.delivered || 0,
      opened: row.opened || 0,
      clicked: row.clicked || 0,
      bounced: row.bounced || 0
    }))
  }

  // --------------------------------------------------------------------------
  // Utilities
  // --------------------------------------------------------------------------

  private parseUserAgent(userAgent: string): DeviceInfo {
    const ua = userAgent.toLowerCase()

    let type: DeviceInfo['type'] = 'unknown'
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      type = 'mobile'
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      type = 'tablet'
    } else if (ua.includes('windows') || ua.includes('macintosh') || ua.includes('linux')) {
      type = 'desktop'
    }

    // Detect bots
    const botPatterns = [
      'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
      'yandexbot', 'facebot', 'ia_archiver', 'crawler', 'spider'
    ]
    const isBot = botPatterns.some(pattern => ua.includes(pattern))
    const botName = isBot ? botPatterns.find(pattern => ua.includes(pattern)) : undefined

    // Extract OS
    let os: string | undefined
    if (ua.includes('windows')) os = 'Windows'
    else if (ua.includes('mac os') || ua.includes('macintosh')) os = 'macOS'
    else if (ua.includes('linux')) os = 'Linux'
    else if (ua.includes('android')) os = 'Android'
    else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS'

    // Extract browser
    let browser: string | undefined
    if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome'
    else if (ua.includes('firefox')) browser = 'Firefox'
    else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari'
    else if (ua.includes('edg')) browser = 'Edge'
    else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera'

    return {
      type,
      os,
      browser,
      isBot,
      botName
    }
  }

  private async lookupGeoLocation(ipAddress: string): Promise<GeoLocation | undefined> {
    // Would integrate with a geo-IP service like MaxMind or IP-API
    // Returning undefined for now as this requires external service
    return undefined
  }

  private mapEvent(data: any): EmailEvent {
    return {
      id: data.id,
      userId: data.user_id,
      subscriberId: data.subscriber_id,
      emailId: data.email_id,
      campaignId: data.campaign_id,
      automationId: data.automation_id,
      automationStateId: data.automation_state_id,
      messageId: data.message_id,
      eventType: data.event_type,
      timestamp: new Date(data.timestamp),
      metadata: data.metadata || {},
      userAgent: data.user_agent,
      ipAddress: data.ip_address,
      geoLocation: data.geo_location,
      deviceInfo: data.device_info,
      processed: data.processed,
      processedAt: data.processed_at ? new Date(data.processed_at) : undefined
    }
  }
}

// ============================================================================
// Exports
// ============================================================================

export const eventTrackingService = new EventTrackingService({
  batchSize: 100,
  flushIntervalMs: 5000,
  enableAutomationTriggers: true,
  enableRealtimeUpdates: true
})
