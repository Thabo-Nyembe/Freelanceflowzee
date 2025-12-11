/**
 * KAZI Email Automation Engine
 *
 * Production-grade automation workflow execution engine for email marketing.
 * Handles complex multi-step sequences, conditional branching, A/B testing,
 * and intelligent timing optimization.
 */

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// Types & Interfaces
// ============================================================================

export type TriggerType =
  | 'subscriber_added'
  | 'tag_added'
  | 'tag_removed'
  | 'field_updated'
  | 'email_opened'
  | 'email_clicked'
  | 'email_replied'
  | 'link_clicked'
  | 'form_submitted'
  | 'purchase_made'
  | 'cart_abandoned'
  | 'date_based'
  | 'api_trigger'
  | 'segment_entered'
  | 'segment_exited'
  | 'custom_event'

export type ActionType =
  | 'send_email'
  | 'wait'
  | 'wait_until'
  | 'condition'
  | 'split'
  | 'add_tag'
  | 'remove_tag'
  | 'update_field'
  | 'move_to_list'
  | 'remove_from_list'
  | 'webhook'
  | 'notify_team'
  | 'score_lead'
  | 'end_automation'
  | 'goto_step'

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'is_set'
  | 'is_not_set'
  | 'in_segment'
  | 'not_in_segment'
  | 'has_tag'
  | 'missing_tag'
  | 'opened_email'
  | 'clicked_email'
  | 'before_date'
  | 'after_date'

export type WaitUnit = 'minutes' | 'hours' | 'days' | 'weeks'

export interface AutomationTrigger {
  id: string
  type: TriggerType
  config: {
    // For tag triggers
    tagId?: string
    tagName?: string
    // For field triggers
    fieldName?: string
    fieldValue?: any
    // For email triggers
    emailId?: string
    campaignId?: string
    // For link triggers
    linkUrl?: string
    linkId?: string
    // For date triggers
    dateField?: string
    daysOffset?: number
    time?: string
    timezone?: string
    // For segment triggers
    segmentId?: string
    // For custom events
    eventName?: string
    eventProperties?: Record<string, any>
    // For API triggers
    webhookSecret?: string
  }
  filters?: AutomationCondition[]
}

export interface AutomationCondition {
  field: string
  operator: ConditionOperator
  value?: any
  // For nested conditions
  and?: AutomationCondition[]
  or?: AutomationCondition[]
}

export interface AutomationStep {
  id: string
  type: ActionType
  name: string
  description?: string
  config: StepConfig
  position: { x: number; y: number }
  nextSteps: {
    default?: string
    yes?: string
    no?: string
    branches?: { condition: AutomationCondition; stepId: string }[]
  }
}

export type StepConfig =
  | SendEmailConfig
  | WaitConfig
  | WaitUntilConfig
  | ConditionConfig
  | SplitConfig
  | TagConfig
  | FieldConfig
  | ListConfig
  | WebhookConfig
  | NotifyConfig
  | ScoreConfig
  | GotoConfig
  | EndConfig

export interface SendEmailConfig {
  type: 'send_email'
  emailId?: string
  templateId?: string
  subject?: string
  preheader?: string
  fromName?: string
  fromEmail?: string
  replyTo?: string
  // A/B Testing
  abTest?: {
    enabled: boolean
    variants: {
      id: string
      weight: number
      emailId?: string
      subject?: string
    }[]
    winnerCriteria: 'open_rate' | 'click_rate' | 'conversion'
    testDuration: number // hours
    testSampleSize: number // percentage
  }
  // Send time optimization
  sendTimeOptimization?: {
    enabled: boolean
    timezone?: 'subscriber' | 'sender' | string
    optimalWindow?: { start: number; end: number } // hours 0-23
  }
}

export interface WaitConfig {
  type: 'wait'
  duration: number
  unit: WaitUnit
  businessHoursOnly?: boolean
  skipWeekends?: boolean
}

export interface WaitUntilConfig {
  type: 'wait_until'
  condition: AutomationCondition
  timeout?: {
    duration: number
    unit: WaitUnit
    action: 'continue' | 'end' | 'goto'
    gotoStepId?: string
  }
}

export interface ConditionConfig {
  type: 'condition'
  condition: AutomationCondition
}

export interface SplitConfig {
  type: 'split'
  splitType: 'random' | 'conditional'
  // For random splits
  variants?: {
    id: string
    weight: number
    stepId: string
  }[]
  // For conditional splits
  branches?: {
    id: string
    condition: AutomationCondition
    stepId: string
  }[]
  defaultStepId?: string
}

export interface TagConfig {
  type: 'add_tag' | 'remove_tag'
  tagId?: string
  tagName?: string
  createIfNotExists?: boolean
}

export interface FieldConfig {
  type: 'update_field'
  fieldName: string
  value: any
  operation?: 'set' | 'increment' | 'decrement' | 'append' | 'prepend'
}

export interface ListConfig {
  type: 'move_to_list' | 'remove_from_list'
  listId: string
  keepInCurrentList?: boolean
}

export interface WebhookConfig {
  type: 'webhook'
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH'
  headers?: Record<string, string>
  payload?: Record<string, any>
  retryOnFailure?: boolean
  maxRetries?: number
}

export interface NotifyConfig {
  type: 'notify_team'
  channel: 'email' | 'slack' | 'webhook'
  recipients?: string[]
  slackWebhook?: string
  message: string
  includeSubscriberData?: boolean
}

export interface ScoreConfig {
  type: 'score_lead'
  scoreField: string
  points: number
  operation: 'add' | 'subtract' | 'set'
}

export interface GotoConfig {
  type: 'goto_step'
  stepId: string
  maxLoops?: number
}

export interface EndConfig {
  type: 'end_automation'
  reason?: string
  removeFromOtherAutomations?: boolean
}

export interface Automation {
  id: string
  userId: string
  name: string
  description?: string
  status: 'draft' | 'active' | 'paused' | 'archived'
  triggers: AutomationTrigger[]
  steps: AutomationStep[]
  settings: AutomationSettings
  stats: AutomationStats
  createdAt: Date
  updatedAt: Date
  activatedAt?: Date
  lastTriggeredAt?: Date
}

export interface AutomationSettings {
  // Entry rules
  allowReEntry: boolean
  reEntryDelay?: { duration: number; unit: WaitUnit }
  maxEntriesPerSubscriber?: number
  entryRateLimit?: { count: number; period: WaitUnit }

  // Exit rules
  exitOnUnsubscribe: boolean
  exitOnBounce: boolean
  exitOnComplaint: boolean
  exitConditions?: AutomationCondition[]

  // Goals
  goal?: {
    condition: AutomationCondition
    trackConversion: boolean
    conversionWindow?: { duration: number; unit: WaitUnit }
  }

  // Timing
  timezone: string
  businessHours?: {
    enabled: boolean
    start: number // 0-23
    end: number   // 0-23
    days: number[] // 0-6 (Sunday-Saturday)
  }

  // Notifications
  notifications?: {
    onGoalReached?: boolean
    onErrorRate?: number // percentage threshold
    dailyDigest?: boolean
  }
}

export interface AutomationStats {
  totalEntered: number
  currentlyActive: number
  completed: number
  exitedEarly: number
  goalReached: number
  emailsSent: number
  uniqueOpens: number
  uniqueClicks: number
  unsubscribes: number
  bounces: number
  conversionRate: number
  averageTimeToComplete: number // seconds
}

export interface SubscriberAutomationState {
  id: string
  subscriberId: string
  automationId: string
  currentStepId: string | null
  status: 'active' | 'paused' | 'completed' | 'exited' | 'errored'
  enteredAt: Date
  lastProcessedAt: Date
  scheduledFor?: Date
  completedAt?: Date
  exitedAt?: Date
  exitReason?: string
  stepHistory: StepHistoryEntry[]
  metadata: Record<string, any>
  loopCounts: Record<string, number>
  abTestAssignments: Record<string, string>
  errorCount: number
  lastError?: string
}

export interface StepHistoryEntry {
  stepId: string
  stepType: ActionType
  startedAt: Date
  completedAt?: Date
  result: 'success' | 'failed' | 'skipped' | 'waiting'
  data?: Record<string, any>
  error?: string
}

export interface ProcessingResult {
  success: boolean
  nextStepId?: string | null
  waitUntil?: Date
  data?: Record<string, any>
  error?: string
  shouldExit?: boolean
  exitReason?: string
}

// ============================================================================
// Automation Engine
// ============================================================================

export class AutomationEngine {
  private supabase = createClient()
  private processingQueue: Map<string, Promise<void>> = new Map()
  private isProcessing = false
  private processInterval: NodeJS.Timeout | null = null

  constructor(
    private config: {
      batchSize?: number
      processingIntervalMs?: number
      maxConcurrent?: number
      maxRetries?: number
    } = {}
  ) {
    this.config = {
      batchSize: config.batchSize ?? 100,
      processingIntervalMs: config.processingIntervalMs ?? 10000, // 10 seconds
      maxConcurrent: config.maxConcurrent ?? 10,
      maxRetries: config.maxRetries ?? 3
    }
  }

  // --------------------------------------------------------------------------
  // Automation Management
  // --------------------------------------------------------------------------

  async createAutomation(
    userId: string,
    data: Omit<Automation, 'id' | 'userId' | 'stats' | 'createdAt' | 'updatedAt'>
  ): Promise<Automation> {
    const automation: Automation = {
      ...data,
      id: `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      stats: this.getEmptyStats(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const { error } = await this.supabase
      .from('email_automations')
      .insert({
        id: automation.id,
        user_id: userId,
        name: automation.name,
        description: automation.description,
        status: automation.status,
        triggers: automation.triggers,
        steps: automation.steps,
        settings: automation.settings,
        stats: automation.stats,
        created_at: automation.createdAt.toISOString(),
        updated_at: automation.updatedAt.toISOString()
      })

    if (error) throw new Error(`Failed to create automation: ${error.message}`)
    return automation
  }

  async updateAutomation(
    automationId: string,
    updates: Partial<Pick<Automation, 'name' | 'description' | 'triggers' | 'steps' | 'settings'>>
  ): Promise<Automation> {
    const { data, error } = await this.supabase
      .from('email_automations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', automationId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update automation: ${error.message}`)
    return this.mapAutomation(data)
  }

  async activateAutomation(automationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('email_automations')
      .update({
        status: 'active',
        activated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', automationId)

    if (error) throw new Error(`Failed to activate automation: ${error.message}`)
  }

  async pauseAutomation(automationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('email_automations')
      .update({
        status: 'paused',
        updated_at: new Date().toISOString()
      })
      .eq('id', automationId)

    if (error) throw new Error(`Failed to pause automation: ${error.message}`)
  }

  async archiveAutomation(automationId: string): Promise<void> {
    // Exit all active subscribers first
    await this.exitAllSubscribers(automationId, 'automation_archived')

    const { error } = await this.supabase
      .from('email_automations')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString()
      })
      .eq('id', automationId)

    if (error) throw new Error(`Failed to archive automation: ${error.message}`)
  }

  async getAutomation(automationId: string): Promise<Automation | null> {
    const { data, error } = await this.supabase
      .from('email_automations')
      .select('*')
      .eq('id', automationId)
      .single()

    if (error || !data) return null
    return this.mapAutomation(data)
  }

  async getAutomationsByUser(userId: string): Promise<Automation[]> {
    const { data, error } = await this.supabase
      .from('email_automations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch automations: ${error.message}`)
    return (data || []).map(this.mapAutomation)
  }

  // --------------------------------------------------------------------------
  // Trigger Handling
  // --------------------------------------------------------------------------

  async handleTrigger(
    triggerType: TriggerType,
    subscriberId: string,
    eventData: Record<string, any> = {}
  ): Promise<{ automationsTriggered: string[] }> {
    const automationsTriggered: string[] = []

    // Find all active automations with matching triggers
    const { data: automations, error } = await this.supabase
      .from('email_automations')
      .select('*')
      .eq('status', 'active')
      .contains('triggers', [{ type: triggerType }])

    if (error || !automations) return { automationsTriggered }

    for (const automationData of automations) {
      const automation = this.mapAutomation(automationData)

      // Find matching trigger
      const matchingTrigger = automation.triggers.find(t =>
        t.type === triggerType && this.triggerMatches(t, eventData)
      )

      if (matchingTrigger) {
        // Check if subscriber can enter
        const canEnter = await this.canSubscriberEnter(automation, subscriberId)

        if (canEnter) {
          await this.enterAutomation(automation, subscriberId, matchingTrigger.id, eventData)
          automationsTriggered.push(automation.id)
        }
      }
    }

    return { automationsTriggered }
  }

  private triggerMatches(trigger: AutomationTrigger, eventData: Record<string, any>): boolean {
    const config = trigger.config

    switch (trigger.type) {
      case 'tag_added':
      case 'tag_removed':
        return config.tagId === eventData.tagId || config.tagName === eventData.tagName

      case 'field_updated':
        if (config.fieldName !== eventData.fieldName) return false
        if (config.fieldValue !== undefined && config.fieldValue !== eventData.fieldValue) return false
        return true

      case 'email_opened':
      case 'email_clicked':
      case 'email_replied':
        if (config.emailId && config.emailId !== eventData.emailId) return false
        if (config.campaignId && config.campaignId !== eventData.campaignId) return false
        return true

      case 'link_clicked':
        if (config.linkUrl && config.linkUrl !== eventData.linkUrl) return false
        if (config.linkId && config.linkId !== eventData.linkId) return false
        return true

      case 'custom_event':
        if (config.eventName !== eventData.eventName) return false
        if (config.eventProperties) {
          for (const [key, value] of Object.entries(config.eventProperties)) {
            if (eventData.eventProperties?.[key] !== value) return false
          }
        }
        return true

      case 'segment_entered':
      case 'segment_exited':
        return config.segmentId === eventData.segmentId

      case 'subscriber_added':
      case 'form_submitted':
      case 'purchase_made':
      case 'cart_abandoned':
      case 'api_trigger':
        return true // Basic triggers just need the type to match

      case 'date_based':
        // Date-based triggers are handled by a separate scheduler
        return false

      default:
        return true
    }
  }

  private async canSubscriberEnter(
    automation: Automation,
    subscriberId: string
  ): Promise<boolean> {
    const settings = automation.settings

    // Check if subscriber is already in automation
    const { data: existing } = await this.supabase
      .from('subscriber_automation_states')
      .select('id, status, entered_at')
      .eq('automation_id', automation.id)
      .eq('subscriber_id', subscriberId)
      .order('entered_at', { ascending: false })
      .limit(1)
      .single()

    if (existing) {
      // If currently active, can't re-enter
      if (existing.status === 'active' || existing.status === 'paused') {
        return false
      }

      // Check re-entry rules
      if (!settings.allowReEntry) {
        return false
      }

      // Check re-entry delay
      if (settings.reEntryDelay) {
        const lastEntry = new Date(existing.entered_at)
        const delayMs = this.durationToMs(settings.reEntryDelay.duration, settings.reEntryDelay.unit)
        if (Date.now() - lastEntry.getTime() < delayMs) {
          return false
        }
      }

      // Check max entries
      if (settings.maxEntriesPerSubscriber) {
        const { count } = await this.supabase
          .from('subscriber_automation_states')
          .select('*', { count: 'exact', head: true })
          .eq('automation_id', automation.id)
          .eq('subscriber_id', subscriberId)

        if ((count ?? 0) >= settings.maxEntriesPerSubscriber) {
          return false
        }
      }
    }

    // Check entry rate limit
    if (settings.entryRateLimit) {
      const periodMs = this.durationToMs(1, settings.entryRateLimit.period)
      const since = new Date(Date.now() - periodMs).toISOString()

      const { count } = await this.supabase
        .from('subscriber_automation_states')
        .select('*', { count: 'exact', head: true })
        .eq('automation_id', automation.id)
        .eq('subscriber_id', subscriberId)
        .gte('entered_at', since)

      if ((count ?? 0) >= settings.entryRateLimit.count) {
        return false
      }
    }

    return true
  }

  async enterAutomation(
    automation: Automation,
    subscriberId: string,
    triggerId: string,
    eventData: Record<string, any> = {}
  ): Promise<SubscriberAutomationState> {
    // Find the first step
    const firstStep = automation.steps.find(s =>
      automation.triggers.some(t => t.id === triggerId && s.id === t.config.firstStepId)
    ) || automation.steps[0]

    const state: SubscriberAutomationState = {
      id: `sas_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      subscriberId,
      automationId: automation.id,
      currentStepId: firstStep?.id || null,
      status: 'active',
      enteredAt: new Date(),
      lastProcessedAt: new Date(),
      stepHistory: [],
      metadata: { triggerId, eventData },
      loopCounts: {},
      abTestAssignments: {},
      errorCount: 0
    }

    const { error } = await this.supabase
      .from('subscriber_automation_states')
      .insert({
        id: state.id,
        subscriber_id: subscriberId,
        automation_id: automation.id,
        current_step_id: state.currentStepId,
        status: state.status,
        entered_at: state.enteredAt.toISOString(),
        last_processed_at: state.lastProcessedAt.toISOString(),
        step_history: state.stepHistory,
        metadata: state.metadata,
        loop_counts: state.loopCounts,
        ab_test_assignments: state.abTestAssignments,
        error_count: state.errorCount
      })

    if (error) throw new Error(`Failed to enter automation: ${error.message}`)

    // Update automation stats
    await this.incrementStat(automation.id, 'total_entered')
    await this.incrementStat(automation.id, 'currently_active')

    // Update last triggered timestamp
    await this.supabase
      .from('email_automations')
      .update({ last_triggered_at: new Date().toISOString() })
      .eq('id', automation.id)

    // Process immediately if first step doesn't require waiting
    if (firstStep && firstStep.type !== 'wait' && firstStep.type !== 'wait_until') {
      await this.processSubscriberState(state)
    }

    return state
  }

  // --------------------------------------------------------------------------
  // Step Processing
  // --------------------------------------------------------------------------

  async processSubscriberState(state: SubscriberAutomationState): Promise<void> {
    if (state.status !== 'active' || !state.currentStepId) return

    const automation = await this.getAutomation(state.automationId)
    if (!automation || automation.status !== 'active') return

    const step = automation.steps.find(s => s.id === state.currentStepId)
    if (!step) {
      await this.exitSubscriber(state, 'step_not_found')
      return
    }

    try {
      // Record step start
      const historyEntry: StepHistoryEntry = {
        stepId: step.id,
        stepType: step.type,
        startedAt: new Date(),
        result: 'waiting'
      }

      // Process the step
      const result = await this.processStep(automation, step, state)

      // Update history entry
      historyEntry.completedAt = new Date()
      historyEntry.result = result.success ? 'success' : 'failed'
      historyEntry.data = result.data
      historyEntry.error = result.error

      state.stepHistory.push(historyEntry)
      state.lastProcessedAt = new Date()
      state.errorCount = result.success ? 0 : state.errorCount + 1

      if (result.shouldExit) {
        await this.exitSubscriber(state, result.exitReason || 'step_exit')
        return
      }

      if (result.error && state.errorCount >= (this.config.maxRetries ?? 3)) {
        state.lastError = result.error
        await this.exitSubscriber(state, 'max_errors')
        return
      }

      // Determine next step
      if (result.waitUntil) {
        state.scheduledFor = result.waitUntil
        state.currentStepId = result.nextStepId ?? step.nextSteps.default ?? null
      } else if (result.nextStepId !== undefined) {
        state.currentStepId = result.nextStepId
        state.scheduledFor = undefined
      } else {
        state.currentStepId = step.nextSteps.default ?? null
        state.scheduledFor = undefined
      }

      // Check if automation is complete
      if (!state.currentStepId) {
        await this.completeSubscriber(state)
        return
      }

      // Update state in database
      await this.updateSubscriberState(state)

      // Continue processing if no wait
      if (!state.scheduledFor) {
        const nextStep = automation.steps.find(s => s.id === state.currentStepId)
        if (nextStep && nextStep.type !== 'wait' && nextStep.type !== 'wait_until') {
          await this.processSubscriberState(state)
        }
      }
    } catch (error) {
      state.errorCount++
      state.lastError = error instanceof Error ? error.message : String(error)

      if (state.errorCount >= (this.config.maxRetries ?? 3)) {
        await this.exitSubscriber(state, 'processing_error')
      } else {
        // Retry after delay
        state.scheduledFor = new Date(Date.now() + 60000 * state.errorCount) // Exponential backoff
        await this.updateSubscriberState(state)
      }
    }
  }

  private async processStep(
    automation: Automation,
    step: AutomationStep,
    state: SubscriberAutomationState
  ): Promise<ProcessingResult> {
    const config = step.config as StepConfig

    switch (step.type) {
      case 'send_email':
        return this.processSendEmail(automation, step, state, config as SendEmailConfig)

      case 'wait':
        return this.processWait(config as WaitConfig, automation.settings)

      case 'wait_until':
        return this.processWaitUntil(state, config as WaitUntilConfig)

      case 'condition':
        return this.processCondition(state.subscriberId, step, config as ConditionConfig)

      case 'split':
        return this.processSplit(state, step, config as SplitConfig)

      case 'add_tag':
      case 'remove_tag':
        return this.processTag(state.subscriberId, step.type, config as TagConfig)

      case 'update_field':
        return this.processField(state.subscriberId, config as FieldConfig)

      case 'move_to_list':
      case 'remove_from_list':
        return this.processList(state.subscriberId, step.type, config as ListConfig)

      case 'webhook':
        return this.processWebhook(state, config as WebhookConfig)

      case 'notify_team':
        return this.processNotify(automation, state, config as NotifyConfig)

      case 'score_lead':
        return this.processScore(state.subscriberId, config as ScoreConfig)

      case 'goto_step':
        return this.processGoto(state, step, config as GotoConfig)

      case 'end_automation':
        return this.processEnd(state, config as EndConfig)

      default:
        return { success: false, error: `Unknown step type: ${step.type}` }
    }
  }

  private async processSendEmail(
    automation: Automation,
    step: AutomationStep,
    state: SubscriberAutomationState,
    config: SendEmailConfig
  ): Promise<ProcessingResult> {
    try {
      let emailId = config.emailId
      let subject = config.subject

      // Handle A/B testing
      if (config.abTest?.enabled) {
        const variantId = state.abTestAssignments[step.id] || this.selectVariant(config.abTest.variants)
        state.abTestAssignments[step.id] = variantId

        const variant = config.abTest.variants.find(v => v.id === variantId)
        if (variant) {
          emailId = variant.emailId || emailId
          subject = variant.subject || subject
        }
      }

      // Calculate send time
      let sendAt: Date | undefined
      if (config.sendTimeOptimization?.enabled) {
        sendAt = await this.calculateOptimalSendTime(state.subscriberId, automation.settings, config)
      }

      // Queue the email
      const { error } = await this.supabase
        .from('email_queue')
        .insert({
          id: `eq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          automation_id: automation.id,
          automation_state_id: state.id,
          step_id: step.id,
          subscriber_id: state.subscriberId,
          email_id: emailId,
          template_id: config.templateId,
          subject,
          preheader: config.preheader,
          from_name: config.fromName,
          from_email: config.fromEmail,
          reply_to: config.replyTo,
          status: sendAt ? 'scheduled' : 'pending',
          scheduled_for: sendAt?.toISOString(),
          created_at: new Date().toISOString()
        })

      if (error) throw new Error(error.message)

      // Update stats
      await this.incrementStat(automation.id, 'emails_sent')

      return {
        success: true,
        data: { emailId, subject, scheduledFor: sendAt }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  private processWait(config: WaitConfig, settings: AutomationSettings): ProcessingResult {
    let waitMs = this.durationToMs(config.duration, config.unit)

    // Adjust for business hours if needed
    if (config.businessHoursOnly && settings.businessHours?.enabled) {
      // Calculate actual wait considering business hours
      const now = new Date()
      const targetTime = this.calculateBusinessHoursWait(now, waitMs, settings)
      return {
        success: true,
        waitUntil: targetTime
      }
    }

    return {
      success: true,
      waitUntil: new Date(Date.now() + waitMs)
    }
  }

  private async processWaitUntil(
    state: SubscriberAutomationState,
    config: WaitUntilConfig
  ): Promise<ProcessingResult> {
    // Check if condition is met
    const conditionMet = await this.evaluateCondition(state.subscriberId, config.condition)

    if (conditionMet) {
      return { success: true }
    }

    // Check timeout
    if (config.timeout) {
      const startedAt = state.stepHistory.find(h => h.stepId === state.currentStepId)?.startedAt
      if (startedAt) {
        const timeoutMs = this.durationToMs(config.timeout.duration, config.timeout.unit)
        const elapsed = Date.now() - new Date(startedAt).getTime()

        if (elapsed >= timeoutMs) {
          if (config.timeout.action === 'end') {
            return { success: true, shouldExit: true, exitReason: 'wait_timeout' }
          } else if (config.timeout.action === 'goto' && config.timeout.gotoStepId) {
            return { success: true, nextStepId: config.timeout.gotoStepId }
          }
          return { success: true } // Continue to next step
        }
      }
    }

    // Keep waiting - check again in 1 hour
    return {
      success: true,
      waitUntil: new Date(Date.now() + 3600000)
    }
  }

  private async processCondition(
    subscriberId: string,
    step: AutomationStep,
    config: ConditionConfig
  ): Promise<ProcessingResult> {
    const conditionMet = await this.evaluateCondition(subscriberId, config.condition)

    return {
      success: true,
      nextStepId: conditionMet ? step.nextSteps.yes : step.nextSteps.no
    }
  }

  private processSplit(
    state: SubscriberAutomationState,
    step: AutomationStep,
    config: SplitConfig
  ): ProcessingResult {
    if (config.splitType === 'random' && config.variants) {
      // Check if already assigned
      let variantId = state.abTestAssignments[`split_${step.id}`]

      if (!variantId) {
        variantId = this.selectVariant(config.variants)
        state.abTestAssignments[`split_${step.id}`] = variantId
      }

      const variant = config.variants.find(v => v.id === variantId)
      return {
        success: true,
        nextStepId: variant?.stepId || config.defaultStepId
      }
    }

    // Conditional split - should use branches in nextSteps
    return {
      success: true,
      nextStepId: config.defaultStepId
    }
  }

  private async processTag(
    subscriberId: string,
    action: 'add_tag' | 'remove_tag',
    config: TagConfig
  ): Promise<ProcessingResult> {
    try {
      if (action === 'add_tag') {
        let tagId = config.tagId

        // Create tag if needed
        if (!tagId && config.tagName && config.createIfNotExists) {
          const { data: newTag } = await this.supabase
            .from('email_tags')
            .insert({ name: config.tagName })
            .select('id')
            .single()
          tagId = newTag?.id
        }

        if (tagId) {
          await this.supabase
            .from('subscriber_tags')
            .upsert({ subscriber_id: subscriberId, tag_id: tagId })
        }
      } else {
        const { error } = await this.supabase
          .from('subscriber_tags')
          .delete()
          .eq('subscriber_id', subscriberId)
          .eq('tag_id', config.tagId)

        if (error) throw error
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  private async processField(
    subscriberId: string,
    config: FieldConfig
  ): Promise<ProcessingResult> {
    try {
      const { data: subscriber } = await this.supabase
        .from('email_subscribers')
        .select('custom_fields')
        .eq('id', subscriberId)
        .single()

      let newValue = config.value
      const currentValue = subscriber?.custom_fields?.[config.fieldName]

      switch (config.operation) {
        case 'increment':
          newValue = (Number(currentValue) || 0) + Number(config.value)
          break
        case 'decrement':
          newValue = (Number(currentValue) || 0) - Number(config.value)
          break
        case 'append':
          newValue = `${currentValue || ''}${config.value}`
          break
        case 'prepend':
          newValue = `${config.value}${currentValue || ''}`
          break
      }

      await this.supabase
        .from('email_subscribers')
        .update({
          custom_fields: {
            ...subscriber?.custom_fields,
            [config.fieldName]: newValue
          }
        })
        .eq('id', subscriberId)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  private async processList(
    subscriberId: string,
    action: 'move_to_list' | 'remove_from_list',
    config: ListConfig
  ): Promise<ProcessingResult> {
    try {
      if (action === 'move_to_list') {
        if (!config.keepInCurrentList) {
          // Remove from all other lists first
          await this.supabase
            .from('subscriber_lists')
            .delete()
            .eq('subscriber_id', subscriberId)
            .neq('list_id', config.listId)
        }

        await this.supabase
          .from('subscriber_lists')
          .upsert({ subscriber_id: subscriberId, list_id: config.listId })
      } else {
        await this.supabase
          .from('subscriber_lists')
          .delete()
          .eq('subscriber_id', subscriberId)
          .eq('list_id', config.listId)
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  private async processWebhook(
    state: SubscriberAutomationState,
    config: WebhookConfig
  ): Promise<ProcessingResult> {
    try {
      const { data: subscriber } = await this.supabase
        .from('email_subscribers')
        .select('*')
        .eq('id', state.subscriberId)
        .single()

      const payload = {
        ...config.payload,
        subscriber,
        automation_id: state.automationId,
        state_id: state.id,
        timestamp: new Date().toISOString()
      }

      const response = await fetch(config.url, {
        method: config.method,
        headers: {
          'Content-Type': 'application/json',
          ...config.headers
        },
        body: config.method !== 'GET' ? JSON.stringify(payload) : undefined
      })

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status}`)
      }

      return {
        success: true,
        data: { status: response.status }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  private async processNotify(
    automation: Automation,
    state: SubscriberAutomationState,
    config: NotifyConfig
  ): Promise<ProcessingResult> {
    try {
      let subscriberData: any = null
      if (config.includeSubscriberData) {
        const { data } = await this.supabase
          .from('email_subscribers')
          .select('*')
          .eq('id', state.subscriberId)
          .single()
        subscriberData = data
      }

      const message = this.interpolateMessage(config.message, {
        automation_name: automation.name,
        subscriber: subscriberData
      })

      if (config.channel === 'slack' && config.slackWebhook) {
        await fetch(config.slackWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: message })
        })
      } else if (config.channel === 'email' && config.recipients) {
        // Queue notification emails
        for (const recipient of config.recipients) {
          await this.supabase
            .from('email_queue')
            .insert({
              id: `eq_notify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              to_email: recipient,
              subject: `Automation Alert: ${automation.name}`,
              body_text: message,
              status: 'pending',
              created_at: new Date().toISOString()
            })
        }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  private async processScore(
    subscriberId: string,
    config: ScoreConfig
  ): Promise<ProcessingResult> {
    try {
      const { data: subscriber } = await this.supabase
        .from('email_subscribers')
        .select('custom_fields')
        .eq('id', subscriberId)
        .single()

      const currentScore = Number(subscriber?.custom_fields?.[config.scoreField]) || 0
      let newScore: number

      switch (config.operation) {
        case 'add':
          newScore = currentScore + config.points
          break
        case 'subtract':
          newScore = currentScore - config.points
          break
        case 'set':
          newScore = config.points
          break
        default:
          newScore = currentScore
      }

      await this.supabase
        .from('email_subscribers')
        .update({
          custom_fields: {
            ...subscriber?.custom_fields,
            [config.scoreField]: newScore
          }
        })
        .eq('id', subscriberId)

      return { success: true, data: { previousScore: currentScore, newScore } }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  private processGoto(
    state: SubscriberAutomationState,
    step: AutomationStep,
    config: GotoConfig
  ): ProcessingResult {
    const loopKey = `goto_${step.id}`
    const loopCount = (state.loopCounts[loopKey] || 0) + 1

    if (config.maxLoops && loopCount > config.maxLoops) {
      return {
        success: true,
        nextStepId: step.nextSteps.default, // Continue past the goto
        data: { skippedGoto: true, loopCount }
      }
    }

    state.loopCounts[loopKey] = loopCount

    return {
      success: true,
      nextStepId: config.stepId,
      data: { loopCount }
    }
  }

  private processEnd(
    _state: SubscriberAutomationState,
    config: EndConfig
  ): ProcessingResult {
    return {
      success: true,
      shouldExit: true,
      exitReason: config.reason || 'completed'
    }
  }

  // --------------------------------------------------------------------------
  // Condition Evaluation
  // --------------------------------------------------------------------------

  async evaluateCondition(
    subscriberId: string,
    condition: AutomationCondition
  ): Promise<boolean> {
    // Handle nested conditions
    if (condition.and) {
      for (const subCondition of condition.and) {
        if (!await this.evaluateCondition(subscriberId, subCondition)) {
          return false
        }
      }
      return true
    }

    if (condition.or) {
      for (const subCondition of condition.or) {
        if (await this.evaluateCondition(subscriberId, subCondition)) {
          return true
        }
      }
      return false
    }

    // Get subscriber data
    const { data: subscriber } = await this.supabase
      .from('email_subscribers')
      .select('*, subscriber_tags(tag_id)')
      .eq('id', subscriberId)
      .single()

    if (!subscriber) return false

    const fieldValue = this.getFieldValue(subscriber, condition.field)

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value

      case 'not_equals':
        return fieldValue !== condition.value

      case 'contains':
        return String(fieldValue).includes(String(condition.value))

      case 'not_contains':
        return !String(fieldValue).includes(String(condition.value))

      case 'greater_than':
        return Number(fieldValue) > Number(condition.value)

      case 'less_than':
        return Number(fieldValue) < Number(condition.value)

      case 'is_set':
        return fieldValue !== null && fieldValue !== undefined && fieldValue !== ''

      case 'is_not_set':
        return fieldValue === null || fieldValue === undefined || fieldValue === ''

      case 'has_tag':
        return subscriber.subscriber_tags?.some(
          (t: { tag_id: string }) => t.tag_id === condition.value
        ) ?? false

      case 'missing_tag':
        return !subscriber.subscriber_tags?.some(
          (t: { tag_id: string }) => t.tag_id === condition.value
        )

      case 'before_date':
        return new Date(fieldValue) < new Date(condition.value)

      case 'after_date':
        return new Date(fieldValue) > new Date(condition.value)

      case 'in_segment':
        // Would need segment evaluation logic
        return false

      case 'not_in_segment':
        return true

      case 'opened_email':
      case 'clicked_email':
        // Check email engagement
        const eventType = condition.operator === 'opened_email' ? 'open' : 'click'
        const { count } = await this.supabase
          .from('email_events')
          .select('*', { count: 'exact', head: true })
          .eq('subscriber_id', subscriberId)
          .eq('email_id', condition.value)
          .eq('event_type', eventType)
        return (count ?? 0) > 0

      default:
        return false
    }
  }

  private getFieldValue(subscriber: any, field: string): any {
    // Handle nested fields like "custom_fields.score"
    const parts = field.split('.')
    let value = subscriber

    for (const part of parts) {
      value = value?.[part]
    }

    return value
  }

  // --------------------------------------------------------------------------
  // State Management
  // --------------------------------------------------------------------------

  private async updateSubscriberState(state: SubscriberAutomationState): Promise<void> {
    const { error } = await this.supabase
      .from('subscriber_automation_states')
      .update({
        current_step_id: state.currentStepId,
        status: state.status,
        last_processed_at: state.lastProcessedAt.toISOString(),
        scheduled_for: state.scheduledFor?.toISOString(),
        step_history: state.stepHistory,
        loop_counts: state.loopCounts,
        ab_test_assignments: state.abTestAssignments,
        error_count: state.errorCount,
        last_error: state.lastError
      })
      .eq('id', state.id)

    if (error) throw new Error(`Failed to update state: ${error.message}`)
  }

  private async exitSubscriber(
    state: SubscriberAutomationState,
    reason: string
  ): Promise<void> {
    state.status = 'exited'
    state.exitedAt = new Date()
    state.exitReason = reason

    const { error } = await this.supabase
      .from('subscriber_automation_states')
      .update({
        status: 'exited',
        exited_at: state.exitedAt.toISOString(),
        exit_reason: reason,
        current_step_id: null
      })
      .eq('id', state.id)

    if (error) throw new Error(`Failed to exit subscriber: ${error.message}`)

    // Update stats
    await this.incrementStat(state.automationId, 'exited_early')
    await this.decrementStat(state.automationId, 'currently_active')
  }

  private async completeSubscriber(state: SubscriberAutomationState): Promise<void> {
    state.status = 'completed'
    state.completedAt = new Date()

    const { error } = await this.supabase
      .from('subscriber_automation_states')
      .update({
        status: 'completed',
        completed_at: state.completedAt.toISOString(),
        current_step_id: null
      })
      .eq('id', state.id)

    if (error) throw new Error(`Failed to complete subscriber: ${error.message}`)

    // Update stats
    await this.incrementStat(state.automationId, 'completed')
    await this.decrementStat(state.automationId, 'currently_active')

    // Calculate average time to complete
    const timeToComplete = state.completedAt.getTime() - state.enteredAt.getTime()
    await this.updateAverageTime(state.automationId, timeToComplete)
  }

  private async exitAllSubscribers(automationId: string, reason: string): Promise<void> {
    await this.supabase
      .from('subscriber_automation_states')
      .update({
        status: 'exited',
        exited_at: new Date().toISOString(),
        exit_reason: reason,
        current_step_id: null
      })
      .eq('automation_id', automationId)
      .in('status', ['active', 'paused'])
  }

  // --------------------------------------------------------------------------
  // Background Processing
  // --------------------------------------------------------------------------

  startProcessing(): void {
    if (this.isProcessing) return

    this.isProcessing = true
    this.processInterval = setInterval(
      () => this.processScheduledStates(),
      this.config.processingIntervalMs
    )
  }

  stopProcessing(): void {
    this.isProcessing = false
    if (this.processInterval) {
      clearInterval(this.processInterval)
      this.processInterval = null
    }
  }

  private async processScheduledStates(): Promise<void> {
    try {
      // Get states that are due for processing
      const { data: states, error } = await this.supabase
        .from('subscriber_automation_states')
        .select('*')
        .eq('status', 'active')
        .lte('scheduled_for', new Date().toISOString())
        .order('scheduled_for', { ascending: true })
        .limit(this.config.batchSize ?? 100)

      if (error || !states) return

      // Process in batches with concurrency limit
      const maxConcurrent = this.config.maxConcurrent ?? 10
      for (let i = 0; i < states.length; i += maxConcurrent) {
        const batch = states.slice(i, i + maxConcurrent)
        await Promise.all(batch.map(stateData =>
          this.processSubscriberState(this.mapSubscriberState(stateData))
        ))
      }
    } catch (error) {
      console.error('Error processing scheduled states:', error)
    }
  }

  // --------------------------------------------------------------------------
  // Utilities
  // --------------------------------------------------------------------------

  private durationToMs(duration: number, unit: WaitUnit): number {
    const multipliers: Record<WaitUnit, number> = {
      minutes: 60 * 1000,
      hours: 60 * 60 * 1000,
      days: 24 * 60 * 60 * 1000,
      weeks: 7 * 24 * 60 * 60 * 1000
    }
    return duration * multipliers[unit]
  }

  private calculateBusinessHoursWait(
    startTime: Date,
    waitMs: number,
    settings: AutomationSettings
  ): Date {
    const bh = settings.businessHours!
    let remaining = waitMs
    const current = new Date(startTime)

    while (remaining > 0) {
      const day = current.getDay()
      const hour = current.getHours()

      // Check if it's a business day
      if (!bh.days.includes(day)) {
        // Skip to next day
        current.setDate(current.getDate() + 1)
        current.setHours(bh.start, 0, 0, 0)
        continue
      }

      // Check if within business hours
      if (hour < bh.start) {
        current.setHours(bh.start, 0, 0, 0)
        continue
      }

      if (hour >= bh.end) {
        // Skip to next business day
        current.setDate(current.getDate() + 1)
        current.setHours(bh.start, 0, 0, 0)
        continue
      }

      // Calculate time until end of business hours
      const endOfDay = new Date(current)
      endOfDay.setHours(bh.end, 0, 0, 0)
      const msUntilEnd = endOfDay.getTime() - current.getTime()

      if (remaining <= msUntilEnd) {
        return new Date(current.getTime() + remaining)
      }

      remaining -= msUntilEnd
      current.setDate(current.getDate() + 1)
      current.setHours(bh.start, 0, 0, 0)
    }

    return current
  }

  private async calculateOptimalSendTime(
    subscriberId: string,
    settings: AutomationSettings,
    config: SendEmailConfig
  ): Promise<Date | undefined> {
    if (!config.sendTimeOptimization?.enabled) return undefined

    // Get subscriber's timezone or use sender's
    let timezone = settings.timezone
    if (config.sendTimeOptimization.timezone === 'subscriber') {
      const { data: subscriber } = await this.supabase
        .from('email_subscribers')
        .select('timezone')
        .eq('id', subscriberId)
        .single()
      timezone = subscriber?.timezone || timezone
    }

    // Get optimal window or use default (9am-6pm)
    const window = config.sendTimeOptimization.optimalWindow || { start: 9, end: 18 }

    // Calculate next available time in window
    const now = new Date()
    // Simplified - would need proper timezone handling
    const hour = now.getHours()

    if (hour >= window.start && hour < window.end) {
      return undefined // Send now
    }

    const sendTime = new Date(now)
    if (hour >= window.end) {
      sendTime.setDate(sendTime.getDate() + 1)
    }
    sendTime.setHours(window.start, 0, 0, 0)

    return sendTime
  }

  private selectVariant(variants: { id: string; weight: number }[]): string {
    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0)
    let random = Math.random() * totalWeight

    for (const variant of variants) {
      random -= variant.weight
      if (random <= 0) return variant.id
    }

    return variants[0].id
  }

  private interpolateMessage(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
      const parts = path.split('.')
      let value: any = data
      for (const part of parts) {
        value = value?.[part]
      }
      return value !== undefined ? String(value) : match
    })
  }

  private async incrementStat(automationId: string, field: string): Promise<void> {
    await this.supabase.rpc('increment_automation_stat', {
      p_automation_id: automationId,
      p_field: field
    })
  }

  private async decrementStat(automationId: string, field: string): Promise<void> {
    await this.supabase.rpc('decrement_automation_stat', {
      p_automation_id: automationId,
      p_field: field
    })
  }

  private async updateAverageTime(automationId: string, timeMs: number): Promise<void> {
    // Would implement running average calculation
    await this.supabase.rpc('update_automation_average_time', {
      p_automation_id: automationId,
      p_time_ms: timeMs
    })
  }

  private getEmptyStats(): AutomationStats {
    return {
      totalEntered: 0,
      currentlyActive: 0,
      completed: 0,
      exitedEarly: 0,
      goalReached: 0,
      emailsSent: 0,
      uniqueOpens: 0,
      uniqueClicks: 0,
      unsubscribes: 0,
      bounces: 0,
      conversionRate: 0,
      averageTimeToComplete: 0
    }
  }

  private mapAutomation(data: any): Automation {
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      description: data.description,
      status: data.status,
      triggers: data.triggers || [],
      steps: data.steps || [],
      settings: data.settings || {},
      stats: data.stats || this.getEmptyStats(),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      activatedAt: data.activated_at ? new Date(data.activated_at) : undefined,
      lastTriggeredAt: data.last_triggered_at ? new Date(data.last_triggered_at) : undefined
    }
  }

  private mapSubscriberState(data: any): SubscriberAutomationState {
    return {
      id: data.id,
      subscriberId: data.subscriber_id,
      automationId: data.automation_id,
      currentStepId: data.current_step_id,
      status: data.status,
      enteredAt: new Date(data.entered_at),
      lastProcessedAt: new Date(data.last_processed_at),
      scheduledFor: data.scheduled_for ? new Date(data.scheduled_for) : undefined,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      exitedAt: data.exited_at ? new Date(data.exited_at) : undefined,
      exitReason: data.exit_reason,
      stepHistory: data.step_history || [],
      metadata: data.metadata || {},
      loopCounts: data.loop_counts || {},
      abTestAssignments: data.ab_test_assignments || {},
      errorCount: data.error_count || 0,
      lastError: data.last_error
    }
  }
}

// ============================================================================
// Date-Based Trigger Scheduler
// ============================================================================

export class DateTriggerScheduler {
  private supabase = createClient()
  private automationEngine: AutomationEngine
  private checkInterval: NodeJS.Timeout | null = null

  constructor(automationEngine: AutomationEngine) {
    this.automationEngine = automationEngine
  }

  start(intervalMs: number = 60000): void {
    this.checkInterval = setInterval(() => this.checkDateTriggers(), intervalMs)
  }

  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  private async checkDateTriggers(): Promise<void> {
    try {
      // Find all active automations with date-based triggers
      const { data: automations } = await this.supabase
        .from('email_automations')
        .select('*')
        .eq('status', 'active')

      if (!automations) return

      for (const automationData of automations) {
        const automation = {
          ...automationData,
          triggers: automationData.triggers || [],
          settings: automationData.settings || {}
        }

        const dateTriggers = automation.triggers.filter(
          (t: AutomationTrigger) => t.type === 'date_based'
        )

        for (const trigger of dateTriggers) {
          await this.processDateTrigger(automation.id, trigger)
        }
      }
    } catch (error) {
      console.error('Error checking date triggers:', error)
    }
  }

  private async processDateTrigger(automationId: string, trigger: AutomationTrigger): Promise<void> {
    const config = trigger.config
    if (!config.dateField) return

    const today = new Date()
    const offset = config.daysOffset || 0

    // Find subscribers whose date field matches
    const targetDate = new Date(today)
    targetDate.setDate(targetDate.getDate() - offset)
    const dateStr = targetDate.toISOString().split('T')[0]

    const { data: subscribers } = await this.supabase
      .from('email_subscribers')
      .select('id')
      .eq(`custom_fields->>${config.dateField}`, dateStr)
      .eq('status', 'active')

    if (!subscribers) return

    for (const subscriber of subscribers) {
      // Check if already triggered today
      const { count } = await this.supabase
        .from('subscriber_automation_states')
        .select('*', { count: 'exact', head: true })
        .eq('automation_id', automationId)
        .eq('subscriber_id', subscriber.id)
        .gte('entered_at', today.toISOString().split('T')[0])

      if (count === 0) {
        await this.automationEngine.handleTrigger('date_based', subscriber.id, {
          dateField: config.dateField,
          dateValue: dateStr
        })
      }
    }
  }
}

// ============================================================================
// Exports
// ============================================================================

export const automationEngine = new AutomationEngine()
export const dateTriggerScheduler = new DateTriggerScheduler(automationEngine)
