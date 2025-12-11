/**
 * KAZI Campaign Sender Service
 *
 * Production-grade email campaign sending infrastructure.
 * Handles bulk sending, scheduling, A/B testing, throttling,
 * send time optimization, and comprehensive deliverability management.
 */

import { createClient } from '@/lib/supabase/client'
import { EmailService, EmailMessage, emailService } from './email-service'
import { eventTrackingService } from './event-tracking-service'

// ============================================================================
// Types & Interfaces
// ============================================================================

export type CampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'sending'
  | 'paused'
  | 'sent'
  | 'cancelled'
  | 'failed'

export type CampaignType =
  | 'regular'
  | 'ab_test'
  | 'automated'
  | 'transactional'
  | 'rss'

export type ABTestWinnerCriteria =
  | 'open_rate'
  | 'click_rate'
  | 'conversion_rate'
  | 'manual'

export interface Campaign {
  id: string
  userId: string
  name: string
  type: CampaignType
  status: CampaignStatus
  subject: string
  preheader?: string
  fromName: string
  fromEmail: string
  replyTo?: string
  content: CampaignContent
  recipients: RecipientConfig
  schedule?: ScheduleConfig
  abTest?: ABTestConfig
  sendOptions: SendOptions
  tracking: TrackingConfig
  stats: CampaignStats
  createdAt: Date
  updatedAt: Date
  scheduledFor?: Date
  startedAt?: Date
  completedAt?: Date
}

export interface CampaignContent {
  htmlBody: string
  textBody?: string
  templateId?: string
  templateData?: Record<string, any>
}

export interface RecipientConfig {
  type: 'list' | 'segment' | 'tags' | 'all' | 'custom'
  listIds?: string[]
  segmentIds?: string[]
  tagIds?: string[]
  excludeTagIds?: string[]
  excludeListIds?: string[]
  customFilter?: RecipientFilter
  suppressUnsubscribed: boolean
  suppressBounced: boolean
  suppressComplained: boolean
  deduplicateByEmail: boolean
}

export interface RecipientFilter {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_set' | 'is_not_set'
  value?: any
  and?: RecipientFilter[]
  or?: RecipientFilter[]
}

export interface ScheduleConfig {
  type: 'immediate' | 'scheduled' | 'optimal' | 'timezone_based'
  scheduledTime?: Date
  timezone?: string
  optimalWindow?: {
    start: number // hour 0-23
    end: number   // hour 0-23
    daysOfWeek?: number[] // 0-6
  }
  batchSending?: {
    enabled: boolean
    batchSize: number
    delayBetweenBatches: number // seconds
  }
}

export interface ABTestConfig {
  enabled: boolean
  variants: ABTestVariant[]
  testSampleSize: number // percentage
  testDuration: number   // hours
  winnerCriteria: ABTestWinnerCriteria
  autoSelectWinner: boolean
  winnerSelectedAt?: Date
  winningVariantId?: string
}

export interface ABTestVariant {
  id: string
  name: string
  weight: number
  subject?: string
  preheader?: string
  fromName?: string
  content?: CampaignContent
  stats: VariantStats
}

export interface VariantStats {
  sent: number
  delivered: number
  opened: number
  clicked: number
  openRate: number
  clickRate: number
  conversionRate: number
}

export interface SendOptions {
  trackOpens: boolean
  trackClicks: boolean
  trackConversions: boolean
  googleAnalytics?: {
    enabled: boolean
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
    utmContent?: string
    utmTerm?: string
  }
  throttling?: {
    enabled: boolean
    emailsPerHour: number
    emailsPerDay: number
  }
  deliveryOptimization: {
    warmupMode: boolean
    adaptiveThrottling: boolean
    priorityQueue: 'high' | 'normal' | 'low'
  }
}

export interface TrackingConfig {
  openTrackingEnabled: boolean
  clickTrackingEnabled: boolean
  conversionTrackingEnabled: boolean
  customTrackingDomain?: string
  linkTrackingExclusions?: string[]
}

export interface CampaignStats {
  totalRecipients: number
  sent: number
  delivered: number
  opened: number
  uniqueOpened: number
  clicked: number
  uniqueClicked: number
  bounced: number
  softBounced: number
  hardBounced: number
  complained: number
  unsubscribed: number
  converted: number
  conversionValue: number
  deliveryRate: number
  openRate: number
  clickRate: number
  clickToOpenRate: number
  bounceRate: number
  complaintRate: number
  unsubscribeRate: number
  conversionRate: number
}

export interface SendQueueItem {
  id: string
  campaignId: string
  subscriberId: string
  email: string
  variantId?: string
  personalData: Record<string, any>
  status: 'pending' | 'sending' | 'sent' | 'failed' | 'skipped'
  attempts: number
  scheduledFor?: Date
  sentAt?: Date
  messageId?: string
  error?: string
}

export interface SendProgress {
  campaignId: string
  status: CampaignStatus
  total: number
  queued: number
  sent: number
  failed: number
  skipped: number
  progress: number
  estimatedCompletion?: Date
  currentBatch?: number
  totalBatches?: number
}

// ============================================================================
// Campaign Sender Service
// ============================================================================

export class CampaignSenderService {
  private supabase = createClient()
  private activeSends: Map<string, SendProgress> = new Map()
  private processInterval: NodeJS.Timeout | null = null

  constructor(
    private config: {
      defaultBatchSize?: number
      maxConcurrentSends?: number
      retryAttempts?: number
      retryDelayMs?: number
      processIntervalMs?: number
    } = {}
  ) {
    this.config = {
      defaultBatchSize: config.defaultBatchSize ?? 100,
      maxConcurrentSends: config.maxConcurrentSends ?? 5,
      retryAttempts: config.retryAttempts ?? 3,
      retryDelayMs: config.retryDelayMs ?? 5000,
      processIntervalMs: config.processIntervalMs ?? 1000
    }
  }

  // --------------------------------------------------------------------------
  // Campaign Management
  // --------------------------------------------------------------------------

  async createCampaign(
    userId: string,
    data: Omit<Campaign, 'id' | 'userId' | 'stats' | 'createdAt' | 'updatedAt'>
  ): Promise<Campaign> {
    const campaign: Campaign = {
      ...data,
      id: `cmp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      stats: this.getEmptyStats(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const { error } = await this.supabase
      .from('email_campaigns')
      .insert(this.mapCampaignToDb(campaign))

    if (error) throw new Error(`Failed to create campaign: ${error.message}`)
    return campaign
  }

  async updateCampaign(
    campaignId: string,
    updates: Partial<Pick<Campaign, 'name' | 'subject' | 'preheader' | 'fromName' | 'fromEmail' | 'replyTo' | 'content' | 'recipients' | 'schedule' | 'abTest' | 'sendOptions' | 'tracking'>>
  ): Promise<Campaign> {
    const { data, error } = await this.supabase
      .from('email_campaigns')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update campaign: ${error.message}`)
    return this.mapCampaignFromDb(data)
  }

  async getCampaign(campaignId: string): Promise<Campaign | null> {
    const { data, error } = await this.supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (error || !data) return null
    return this.mapCampaignFromDb(data)
  }

  async getCampaignsByUser(
    userId: string,
    options: {
      status?: CampaignStatus[]
      type?: CampaignType[]
      limit?: number
      offset?: number
    } = {}
  ): Promise<{ campaigns: Campaign[]; total: number }> {
    let query = this.supabase
      .from('email_campaigns')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (options.status?.length) {
      query = query.in('status', options.status)
    }

    if (options.type?.length) {
      query = query.in('type', options.type)
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1)
    }

    const { data, error, count } = await query

    if (error) throw new Error(`Failed to fetch campaigns: ${error.message}`)
    return {
      campaigns: (data || []).map(this.mapCampaignFromDb),
      total: count || 0
    }
  }

  // --------------------------------------------------------------------------
  // Recipient Building
  // --------------------------------------------------------------------------

  async buildRecipientList(
    campaign: Campaign
  ): Promise<{ count: number; estimatedTime: number }> {
    const recipientConfig = campaign.recipients
    let query = this.supabase
      .from('email_subscribers')
      .select('id, email, first_name, last_name, custom_fields, timezone')
      .eq('user_id', campaign.userId)
      .eq('status', 'active')

    // Apply list filters
    if (recipientConfig.type === 'list' && recipientConfig.listIds?.length) {
      const { data: listSubscribers } = await this.supabase
        .from('subscriber_lists')
        .select('subscriber_id')
        .in('list_id', recipientConfig.listIds)

      const subscriberIds = [...new Set(listSubscribers?.map(ls => ls.subscriber_id) || [])]
      query = query.in('id', subscriberIds.length ? subscriberIds : ['none'])
    }

    // Apply segment filters
    if (recipientConfig.type === 'segment' && recipientConfig.segmentIds?.length) {
      // Would need segment evaluation logic
      // For now, just get subscribers in segments
    }

    // Apply tag filters
    if (recipientConfig.type === 'tags' && recipientConfig.tagIds?.length) {
      const { data: taggedSubscribers } = await this.supabase
        .from('subscriber_tags')
        .select('subscriber_id')
        .in('tag_id', recipientConfig.tagIds)

      const subscriberIds = [...new Set(taggedSubscribers?.map(ts => ts.subscriber_id) || [])]
      query = query.in('id', subscriberIds.length ? subscriberIds : ['none'])
    }

    // Apply exclusions
    if (recipientConfig.suppressBounced) {
      query = query.not('status', 'eq', 'bounced')
    }
    if (recipientConfig.suppressComplained) {
      query = query.not('status', 'eq', 'complained')
    }
    if (recipientConfig.suppressUnsubscribed) {
      query = query.not('status', 'eq', 'unsubscribed')
    }

    // Exclude tags
    if (recipientConfig.excludeTagIds?.length) {
      const { data: excludedSubscribers } = await this.supabase
        .from('subscriber_tags')
        .select('subscriber_id')
        .in('tag_id', recipientConfig.excludeTagIds)

      const excludeIds = [...new Set(excludedSubscribers?.map(ts => ts.subscriber_id) || [])]
      if (excludeIds.length) {
        query = query.not('id', 'in', `(${excludeIds.join(',')})`)
      }
    }

    // Get all matching subscribers
    const { data: subscribers, error } = await query

    if (error) throw new Error(`Failed to build recipient list: ${error.message}`)

    // Deduplicate by email if enabled
    let recipientList = subscribers || []
    if (recipientConfig.deduplicateByEmail) {
      const seen = new Set<string>()
      recipientList = recipientList.filter(s => {
        if (seen.has(s.email.toLowerCase())) return false
        seen.add(s.email.toLowerCase())
        return true
      })
    }

    // Clear existing queue and build new one
    await this.supabase
      .from('email_send_queue')
      .delete()
      .eq('campaign_id', campaign.id)

    // Build send queue
    const queueItems: Partial<SendQueueItem>[] = recipientList.map(subscriber => ({
      id: `sq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      campaignId: campaign.id,
      subscriberId: subscriber.id,
      email: subscriber.email,
      personalData: {
        firstName: subscriber.first_name,
        lastName: subscriber.last_name,
        email: subscriber.email,
        ...subscriber.custom_fields
      },
      status: 'pending' as const,
      attempts: 0
    }))

    // Insert in batches
    const batchSize = 1000
    for (let i = 0; i < queueItems.length; i += batchSize) {
      const batch = queueItems.slice(i, i + batchSize)
      await this.supabase
        .from('email_send_queue')
        .insert(batch.map(item => ({
          id: item.id,
          campaign_id: item.campaignId,
          subscriber_id: item.subscriberId,
          email: item.email,
          personal_data: item.personalData,
          status: item.status,
          attempts: item.attempts
        })))
    }

    // Update campaign stats
    await this.supabase
      .from('email_campaigns')
      .update({
        'stats->totalRecipients': recipientList.length,
        updated_at: new Date().toISOString()
      })
      .eq('id', campaign.id)

    // Estimate send time
    const emailsPerHour = campaign.sendOptions.throttling?.enabled
      ? campaign.sendOptions.throttling.emailsPerHour
      : 10000 // Default rate

    const estimatedHours = recipientList.length / emailsPerHour
    const estimatedTime = Math.ceil(estimatedHours * 3600) // seconds

    return {
      count: recipientList.length,
      estimatedTime
    }
  }

  // --------------------------------------------------------------------------
  // Campaign Sending
  // --------------------------------------------------------------------------

  async scheduleCampaign(campaignId: string, scheduledFor: Date): Promise<void> {
    const campaign = await this.getCampaign(campaignId)
    if (!campaign) throw new Error('Campaign not found')

    if (campaign.status !== 'draft') {
      throw new Error('Only draft campaigns can be scheduled')
    }

    // Build recipient list
    await this.buildRecipientList(campaign)

    await this.supabase
      .from('email_campaigns')
      .update({
        status: 'scheduled',
        scheduled_for: scheduledFor.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId)
  }

  async sendCampaign(campaignId: string): Promise<SendProgress> {
    const campaign = await this.getCampaign(campaignId)
    if (!campaign) throw new Error('Campaign not found')

    if (!['draft', 'scheduled'].includes(campaign.status)) {
      throw new Error(`Cannot send campaign with status: ${campaign.status}`)
    }

    // Build recipient list if not already built
    const { count: queueCount } = await this.supabase
      .from('email_send_queue')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)

    if (!queueCount) {
      await this.buildRecipientList(campaign)
    }

    // Update campaign status
    await this.supabase
      .from('email_campaigns')
      .update({
        status: 'sending',
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId)

    // Initialize progress tracking
    const progress: SendProgress = {
      campaignId,
      status: 'sending',
      total: queueCount || 0,
      queued: queueCount || 0,
      sent: 0,
      failed: 0,
      skipped: 0,
      progress: 0
    }
    this.activeSends.set(campaignId, progress)

    // Start processing
    this.processCampaignQueue(campaign)

    return progress
  }

  async pauseCampaign(campaignId: string): Promise<void> {
    await this.supabase
      .from('email_campaigns')
      .update({
        status: 'paused',
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId)

    const progress = this.activeSends.get(campaignId)
    if (progress) {
      progress.status = 'paused'
    }
  }

  async resumeCampaign(campaignId: string): Promise<SendProgress> {
    const campaign = await this.getCampaign(campaignId)
    if (!campaign) throw new Error('Campaign not found')

    if (campaign.status !== 'paused') {
      throw new Error('Only paused campaigns can be resumed')
    }

    await this.supabase
      .from('email_campaigns')
      .update({
        status: 'sending',
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId)

    // Get current progress
    const { count: total } = await this.supabase
      .from('email_send_queue')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)

    const { count: sent } = await this.supabase
      .from('email_send_queue')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('status', 'sent')

    const { count: failed } = await this.supabase
      .from('email_send_queue')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('status', 'failed')

    const progress: SendProgress = {
      campaignId,
      status: 'sending',
      total: total || 0,
      queued: (total || 0) - (sent || 0) - (failed || 0),
      sent: sent || 0,
      failed: failed || 0,
      skipped: 0,
      progress: ((sent || 0) / (total || 1)) * 100
    }
    this.activeSends.set(campaignId, progress)

    // Resume processing
    this.processCampaignQueue(campaign)

    return progress
  }

  async cancelCampaign(campaignId: string): Promise<void> {
    await this.supabase
      .from('email_campaigns')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId)

    this.activeSends.delete(campaignId)
  }

  getSendProgress(campaignId: string): SendProgress | null {
    return this.activeSends.get(campaignId) || null
  }

  // --------------------------------------------------------------------------
  // Queue Processing
  // --------------------------------------------------------------------------

  private async processCampaignQueue(campaign: Campaign): Promise<void> {
    const progress = this.activeSends.get(campaign.id)
    if (!progress) return

    while (progress.status === 'sending') {
      // Check if campaign is still active
      const currentCampaign = await this.getCampaign(campaign.id)
      if (!currentCampaign || currentCampaign.status !== 'sending') {
        break
      }

      // Get batch of pending items
      const batchSize = campaign.schedule?.batchSending?.enabled
        ? campaign.schedule.batchSending.batchSize
        : this.config.defaultBatchSize ?? 100

      const { data: queueItems, error } = await this.supabase
        .from('email_send_queue')
        .select('*')
        .eq('campaign_id', campaign.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(batchSize)

      if (error || !queueItems?.length) {
        // No more items to process
        await this.completeCampaign(campaign.id, progress)
        break
      }

      // Process batch
      await this.processBatch(campaign, queueItems, progress)

      // Update progress
      progress.queued -= queueItems.length
      progress.progress = ((progress.sent + progress.failed) / progress.total) * 100

      // Apply throttling
      if (campaign.sendOptions.throttling?.enabled) {
        const delayMs = (3600000 / campaign.sendOptions.throttling.emailsPerHour) * batchSize
        await this.sleep(delayMs)
      } else if (campaign.schedule?.batchSending?.enabled) {
        await this.sleep(campaign.schedule.batchSending.delayBetweenBatches * 1000)
      } else {
        await this.sleep(100) // Small delay between batches
      }
    }
  }

  private async processBatch(
    campaign: Campaign,
    queueItems: any[],
    progress: SendProgress
  ): Promise<void> {
    const sendPromises = queueItems.map(item =>
      this.sendToSubscriber(campaign, this.mapQueueItemFromDb(item), progress)
    )

    // Process with concurrency limit
    const maxConcurrent = this.config.maxConcurrentSends ?? 5
    for (let i = 0; i < sendPromises.length; i += maxConcurrent) {
      const batch = sendPromises.slice(i, i + maxConcurrent)
      await Promise.all(batch)
    }
  }

  private async sendToSubscriber(
    campaign: Campaign,
    queueItem: SendQueueItem,
    progress: SendProgress
  ): Promise<void> {
    try {
      // Mark as sending
      await this.supabase
        .from('email_send_queue')
        .update({ status: 'sending', attempts: queueItem.attempts + 1 })
        .eq('id', queueItem.id)

      // Determine variant for A/B test
      let variant: ABTestVariant | undefined
      if (campaign.abTest?.enabled && !campaign.abTest.winningVariantId) {
        variant = this.selectABTestVariant(campaign.abTest, queueItem.subscriberId)
        queueItem.variantId = variant.id
      } else if (campaign.abTest?.winningVariantId) {
        variant = campaign.abTest.variants.find(v => v.id === campaign.abTest!.winningVariantId)
      }

      // Build email message
      const message = this.buildEmailMessage(campaign, queueItem, variant)

      // Send email
      const result = await emailService.send(message)

      if (result.success) {
        // Update queue item
        await this.supabase
          .from('email_send_queue')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            message_id: result.messageId,
            variant_id: queueItem.variantId
          })
          .eq('id', queueItem.id)

        progress.sent++

        // Record sent event
        await eventTrackingService.recordEvent({
          userId: campaign.userId,
          subscriberId: queueItem.subscriberId,
          emailId: campaign.id,
          campaignId: campaign.id,
          messageId: result.messageId!,
          eventType: 'sent',
          timestamp: new Date(),
          metadata: { variantId: queueItem.variantId }
        })
      } else {
        throw new Error(result.error || 'Send failed')
      }
    } catch (error) {
      // Handle failure
      const errorMessage = error instanceof Error ? error.message : String(error)

      if (queueItem.attempts + 1 >= (this.config.retryAttempts ?? 3)) {
        // Max retries reached
        await this.supabase
          .from('email_send_queue')
          .update({ status: 'failed', error: errorMessage })
          .eq('id', queueItem.id)
        progress.failed++
      } else {
        // Will retry
        await this.supabase
          .from('email_send_queue')
          .update({
            status: 'pending',
            error: errorMessage,
            scheduled_for: new Date(Date.now() + (this.config.retryDelayMs ?? 5000)).toISOString()
          })
          .eq('id', queueItem.id)
      }
    }
  }

  private buildEmailMessage(
    campaign: Campaign,
    queueItem: SendQueueItem,
    variant?: ABTestVariant
  ): EmailMessage {
    // Get subject and content from variant or campaign
    const subject = variant?.subject || campaign.subject
    const content = variant?.content || campaign.content
    const fromName = variant?.fromName || campaign.fromName
    const preheader = variant?.preheader || campaign.preheader

    // Render template with personal data
    let htmlBody = emailService.renderTemplate(content.htmlBody, queueItem.personalData)
    let textBody = content.textBody
      ? emailService.renderTemplate(content.textBody, queueItem.personalData)
      : undefined

    // Add tracking
    if (campaign.tracking.openTrackingEnabled || campaign.tracking.clickTrackingEnabled) {
      htmlBody = emailService.addTracking(
        htmlBody,
        queueItem.id,
        queueItem.subscriberId
      )
    }

    // Add Google Analytics parameters
    if (campaign.sendOptions.googleAnalytics?.enabled) {
      htmlBody = this.addGoogleAnalytics(htmlBody, campaign.sendOptions.googleAnalytics)
    }

    return {
      to: queueItem.email,
      subject: emailService.renderTemplate(subject, queueItem.personalData),
      html: htmlBody,
      text: textBody,
      from: {
        name: fromName,
        email: campaign.fromEmail
      },
      replyTo: campaign.replyTo,
      headers: {
        'X-Campaign-Id': campaign.id,
        'X-Subscriber-Id': queueItem.subscriberId,
        'X-Variant-Id': queueItem.variantId || '',
        'List-Unsubscribe': `<mailto:unsubscribe@${campaign.fromEmail.split('@')[1]}?subject=unsubscribe-${queueItem.subscriberId}>`
      },
      metadata: {
        campaignId: campaign.id,
        subscriberId: queueItem.subscriberId,
        variantId: queueItem.variantId
      }
    }
  }

  private addGoogleAnalytics(
    html: string,
    gaConfig: NonNullable<SendOptions['googleAnalytics']>
  ): string {
    const params = new URLSearchParams()
    if (gaConfig.utmSource) params.set('utm_source', gaConfig.utmSource)
    if (gaConfig.utmMedium) params.set('utm_medium', gaConfig.utmMedium)
    if (gaConfig.utmCampaign) params.set('utm_campaign', gaConfig.utmCampaign)
    if (gaConfig.utmContent) params.set('utm_content', gaConfig.utmContent)
    if (gaConfig.utmTerm) params.set('utm_term', gaConfig.utmTerm)

    const paramString = params.toString()
    if (!paramString) return html

    // Add UTM parameters to all links
    return html.replace(
      /href="(https?:\/\/[^"]+)"/g,
      (match, url) => {
        const separator = url.includes('?') ? '&' : '?'
        return `href="${url}${separator}${paramString}"`
      }
    )
  }

  private selectABTestVariant(
    abTest: ABTestConfig,
    subscriberId: string
  ): ABTestVariant {
    // Use subscriber ID to deterministically assign variant
    const hash = this.hashString(subscriberId)
    const totalWeight = abTest.variants.reduce((sum, v) => sum + v.weight, 0)
    let target = hash % totalWeight

    for (const variant of abTest.variants) {
      target -= variant.weight
      if (target < 0) return variant
    }

    return abTest.variants[0]
  }

  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash)
  }

  private async completeCampaign(campaignId: string, progress: SendProgress): Promise<void> {
    progress.status = 'sent'

    await this.supabase
      .from('email_campaigns')
      .update({
        status: 'sent',
        completed_at: new Date().toISOString(),
        'stats->sent': progress.sent,
        'stats->failed': progress.failed,
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId)

    this.activeSends.delete(campaignId)
  }

  // --------------------------------------------------------------------------
  // A/B Testing
  // --------------------------------------------------------------------------

  async selectABTestWinner(campaignId: string, variantId?: string): Promise<void> {
    const campaign = await this.getCampaign(campaignId)
    if (!campaign) throw new Error('Campaign not found')
    if (!campaign.abTest?.enabled) throw new Error('Campaign has no A/B test')

    let winningVariantId = variantId

    // Auto-select based on criteria if not specified
    if (!winningVariantId && campaign.abTest.autoSelectWinner) {
      const stats = await this.getVariantStats(campaignId)

      switch (campaign.abTest.winnerCriteria) {
        case 'open_rate':
          winningVariantId = stats.reduce((best, v) =>
            v.openRate > (best?.openRate || 0) ? v : best
          , stats[0])?.id
          break
        case 'click_rate':
          winningVariantId = stats.reduce((best, v) =>
            v.clickRate > (best?.clickRate || 0) ? v : best
          , stats[0])?.id
          break
        case 'conversion_rate':
          winningVariantId = stats.reduce((best, v) =>
            v.conversionRate > (best?.conversionRate || 0) ? v : best
          , stats[0])?.id
          break
      }
    }

    if (!winningVariantId) {
      throw new Error('Could not determine winning variant')
    }

    // Update campaign
    await this.supabase
      .from('email_campaigns')
      .update({
        'ab_test->winningVariantId': winningVariantId,
        'ab_test->winnerSelectedAt': new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId)
  }

  async getVariantStats(campaignId: string): Promise<(ABTestVariant & VariantStats)[]> {
    const campaign = await this.getCampaign(campaignId)
    if (!campaign || !campaign.abTest?.enabled) return []

    const stats: (ABTestVariant & VariantStats)[] = []

    for (const variant of campaign.abTest.variants) {
      // Get events for this variant
      const { data: events } = await this.supabase
        .from('email_events')
        .select('event_type, subscriber_id')
        .eq('campaign_id', campaignId)
        .eq('metadata->>variantId', variant.id)

      const sent = (events || []).filter(e => e.event_type === 'sent').length
      const delivered = (events || []).filter(e => e.event_type === 'delivered').length
      const uniqueOpens = new Set((events || []).filter(e => e.event_type === 'opened').map(e => e.subscriber_id)).size
      const uniqueClicks = new Set((events || []).filter(e => e.event_type === 'clicked').map(e => e.subscriber_id)).size
      const conversions = (events || []).filter(e => e.event_type === 'converted').length

      stats.push({
        ...variant,
        stats: {
          sent,
          delivered,
          opened: uniqueOpens,
          clicked: uniqueClicks,
          openRate: delivered > 0 ? (uniqueOpens / delivered) * 100 : 0,
          clickRate: delivered > 0 ? (uniqueClicks / delivered) * 100 : 0,
          conversionRate: sent > 0 ? (conversions / sent) * 100 : 0
        }
      })
    }

    return stats
  }

  // --------------------------------------------------------------------------
  // Scheduled Campaign Processing
  // --------------------------------------------------------------------------

  startScheduleProcessor(): void {
    if (this.processInterval) return

    this.processInterval = setInterval(
      () => this.processScheduledCampaigns(),
      60000 // Check every minute
    )
  }

  stopScheduleProcessor(): void {
    if (this.processInterval) {
      clearInterval(this.processInterval)
      this.processInterval = null
    }
  }

  private async processScheduledCampaigns(): Promise<void> {
    const { data: campaigns, error } = await this.supabase
      .from('email_campaigns')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_for', new Date().toISOString())

    if (error || !campaigns) return

    for (const campaignData of campaigns) {
      const campaign = this.mapCampaignFromDb(campaignData)
      await this.sendCampaign(campaign.id)
    }
  }

  // --------------------------------------------------------------------------
  // Utilities
  // --------------------------------------------------------------------------

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private getEmptyStats(): CampaignStats {
    return {
      totalRecipients: 0,
      sent: 0,
      delivered: 0,
      opened: 0,
      uniqueOpened: 0,
      clicked: 0,
      uniqueClicked: 0,
      bounced: 0,
      softBounced: 0,
      hardBounced: 0,
      complained: 0,
      unsubscribed: 0,
      converted: 0,
      conversionValue: 0,
      deliveryRate: 0,
      openRate: 0,
      clickRate: 0,
      clickToOpenRate: 0,
      bounceRate: 0,
      complaintRate: 0,
      unsubscribeRate: 0,
      conversionRate: 0
    }
  }

  private mapCampaignToDb(campaign: Campaign): any {
    return {
      id: campaign.id,
      user_id: campaign.userId,
      name: campaign.name,
      type: campaign.type,
      status: campaign.status,
      subject: campaign.subject,
      preheader: campaign.preheader,
      from_name: campaign.fromName,
      from_email: campaign.fromEmail,
      reply_to: campaign.replyTo,
      content: campaign.content,
      recipients: campaign.recipients,
      schedule: campaign.schedule,
      ab_test: campaign.abTest,
      send_options: campaign.sendOptions,
      tracking: campaign.tracking,
      stats: campaign.stats,
      created_at: campaign.createdAt.toISOString(),
      updated_at: campaign.updatedAt.toISOString(),
      scheduled_for: campaign.scheduledFor?.toISOString(),
      started_at: campaign.startedAt?.toISOString(),
      completed_at: campaign.completedAt?.toISOString()
    }
  }

  private mapCampaignFromDb(data: any): Campaign {
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      type: data.type,
      status: data.status,
      subject: data.subject,
      preheader: data.preheader,
      fromName: data.from_name,
      fromEmail: data.from_email,
      replyTo: data.reply_to,
      content: data.content || {},
      recipients: data.recipients || {},
      schedule: data.schedule,
      abTest: data.ab_test,
      sendOptions: data.send_options || {},
      tracking: data.tracking || {},
      stats: data.stats || this.getEmptyStats(),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      scheduledFor: data.scheduled_for ? new Date(data.scheduled_for) : undefined,
      startedAt: data.started_at ? new Date(data.started_at) : undefined,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined
    }
  }

  private mapQueueItemFromDb(data: any): SendQueueItem {
    return {
      id: data.id,
      campaignId: data.campaign_id,
      subscriberId: data.subscriber_id,
      email: data.email,
      variantId: data.variant_id,
      personalData: data.personal_data || {},
      status: data.status,
      attempts: data.attempts || 0,
      scheduledFor: data.scheduled_for ? new Date(data.scheduled_for) : undefined,
      sentAt: data.sent_at ? new Date(data.sent_at) : undefined,
      messageId: data.message_id,
      error: data.error
    }
  }
}

// ============================================================================
// Exports
// ============================================================================

export const campaignSenderService = new CampaignSenderService({
  defaultBatchSize: 100,
  maxConcurrentSends: 5,
  retryAttempts: 3,
  retryDelayMs: 5000
})
