'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createSimpleLogger } from '@/lib/simple-logger'
import { uuidSchema } from '@/lib/validations'

// ============================================
// TYPES
// ============================================

interface Webhook {
  id: string
  user_id: string
  name: string
  url: string
  description?: string | null
  secret?: string | null
  events: string[]
  status: string
  retry_count: number
  timeout_ms: number
  verify_ssl: boolean
  custom_headers?: Record<string, string>
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

interface WebhookDelivery {
  id: string
  webhook_id: string
  event_type: string
  event_id: string
  payload: Record<string, unknown>
  status: string
  next_retry_at?: string | null
  created_at: string
  updated_at: string
}

interface WebhookEventType {
  id: string
  user_id: string
  name: string
  description?: string | null
  category?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface CreateWebhookData {
  name: string
  url: string
  description?: string | null
  secret?: string | null
  events: string[]
  retry_count?: number
  timeout_ms?: number
  verify_ssl?: boolean
}

interface UpdateWebhookData {
  name?: string
  url?: string
  description?: string | null
  secret?: string | null
  events?: string[]
  status?: string
  retry_count?: number
  timeout_ms?: number
  verify_ssl?: boolean
  custom_headers?: Record<string, string>
}

type WebhookStatus = 'active' | 'paused' | 'disabled'

// ============================================
// LOGGER
// ============================================

const logger = createSimpleLogger('webhooks')

// Safe JSON parse helper
function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch (e) {
    logger.warn('Failed to parse JSON value', { value: value.substring(0, 100) })
    return fallback
  }
}

// ============================================
// WEBHOOKS ACTIONS
// ============================================

/**
 * Create a new webhook
 */
export async function createWebhook(
  formData: FormData
): Promise<ActionResult<Webhook>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Create webhook failed: User not authenticated')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const name = formData.get('name') as string
    const url = formData.get('url') as string
    const description = formData.get('description') as string | null
    const secret = formData.get('secret') as string | null
    const events = safeJsonParse<string[]>(formData.get('events') as string, [])
    const retryCount = parseInt(formData.get('retry_count') as string || '3')
    const timeoutMs = parseInt(formData.get('timeout_ms') as string || '30000')
    const verifySsl = formData.get('verify_ssl') !== 'false'

    if (!name || name.trim().length === 0) {
      return actionError('Webhook name is required', 'VALIDATION_ERROR')
    }

    if (!url || url.trim().length === 0) {
      return actionError('Webhook URL is required', 'VALIDATION_ERROR')
    }

    if (!Array.isArray(events) || events.length === 0) {
      return actionError('At least one event is required', 'VALIDATION_ERROR')
    }

    const webhookData: CreateWebhookData = {
      name,
      url,
      description,
      secret,
      events,
      retry_count: retryCount,
      timeout_ms: timeoutMs,
      verify_ssl: verifySsl
    }

    const { data, error } = await supabase
      .from('webhooks')
      .insert({
        user_id: user.id,
        ...webhookData
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create webhook', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Webhook created successfully', {
      webhookId: data.id,
      userId: user.id,
      url
    })

    revalidatePath('/dashboard/webhooks-v2')
    return actionSuccess(data as Webhook)
  } catch (error) {
    logger.error('Unexpected error creating webhook', { error })
    return actionError('Failed to create webhook', 'INTERNAL_ERROR')
  }
}

/**
 * Update a webhook
 */
export async function updateWebhook(
  id: string,
  formData: FormData
): Promise<ActionResult<Webhook>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid webhook ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Update webhook failed: User not authenticated', { webhookId: id })
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const updates: UpdateWebhookData = {}

    const name = formData.get('name')
    if (name) updates.name = name as string

    const url = formData.get('url')
    if (url) updates.url = url as string

    const description = formData.get('description')
    if (description !== null) updates.description = description as string | null

    const secret = formData.get('secret')
    if (secret !== null) updates.secret = secret as string | null

    const events = formData.get('events')
    if (events) updates.events = safeJsonParse<string[]>(events as string, [])

    const status = formData.get('status')
    if (status) updates.status = status as string

    const retryCount = formData.get('retry_count')
    if (retryCount) updates.retry_count = parseInt(retryCount as string)

    const timeoutMs = formData.get('timeout_ms')
    if (timeoutMs) updates.timeout_ms = parseInt(timeoutMs as string)

    const verifySsl = formData.get('verify_ssl')
    if (verifySsl !== null) updates.verify_ssl = verifySsl !== 'false'

    const customHeaders = formData.get('custom_headers')
    if (customHeaders) updates.custom_headers = safeJsonParse<Record<string, string>>(customHeaders as string, {})

    const { data, error } = await supabase
      .from('webhooks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update webhook', { error, webhookId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Webhook updated successfully', { webhookId: id, userId: user.id })

    revalidatePath('/dashboard/webhooks-v2')
    return actionSuccess(data as Webhook)
  } catch (error) {
    logger.error('Unexpected error updating webhook', { error, webhookId: id })
    return actionError('Failed to update webhook', 'INTERNAL_ERROR')
  }
}

/**
 * Delete a webhook (soft delete)
 */
export async function deleteWebhook(
  id: string
): Promise<ActionResult<{ success: true }>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid webhook ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Delete webhook failed: User not authenticated', { webhookId: id })
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('webhooks')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete webhook', { error, webhookId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Webhook deleted successfully', { webhookId: id, userId: user.id })

    revalidatePath('/dashboard/webhooks-v2')
    return actionSuccess({ success: true })
  } catch (error) {
    logger.error('Unexpected error deleting webhook', { error, webhookId: id })
    return actionError('Failed to delete webhook', 'INTERNAL_ERROR')
  }
}

/**
 * Toggle webhook status
 */
export async function toggleWebhookStatus(
  id: string,
  status: WebhookStatus
): Promise<ActionResult<Webhook>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid webhook ID format', 'VALIDATION_ERROR')
    }

    if (!['active', 'paused', 'disabled'].includes(status)) {
      return actionError('Invalid status value', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Toggle webhook status failed: User not authenticated', { webhookId: id })
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('webhooks')
      .update({ status })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to toggle webhook status', {
        error,
        webhookId: id,
        userId: user.id,
        status
      })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Webhook status toggled successfully', {
      webhookId: id,
      userId: user.id,
      status
    })

    revalidatePath('/dashboard/webhooks-v2')
    return actionSuccess(data as Webhook)
  } catch (error) {
    logger.error('Unexpected error toggling webhook status', { error, webhookId: id })
    return actionError('Failed to toggle webhook status', 'INTERNAL_ERROR')
  }
}

/**
 * Test a webhook
 */
export async function testWebhook(
  id: string
): Promise<ActionResult<WebhookDelivery>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid webhook ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Test webhook failed: User not authenticated', { webhookId: id })
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Create a test delivery
    const { data, error } = await supabase
      .from('webhook_deliveries')
      .insert({
        webhook_id: id,
        event_type: 'test',
        event_id: `test-${Date.now()}`,
        payload: {
          test: true,
          timestamp: new Date().toISOString(),
          message: 'This is a test webhook delivery'
        },
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to test webhook', { error, webhookId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Webhook test created successfully', { webhookId: id, userId: user.id })

    revalidatePath('/dashboard/webhooks-v2')
    return actionSuccess(data as WebhookDelivery)
  } catch (error) {
    logger.error('Unexpected error testing webhook', { error, webhookId: id })
    return actionError('Failed to test webhook', 'INTERNAL_ERROR')
  }
}

/**
 * Retry a webhook delivery
 */
export async function retryDelivery(
  id: string
): Promise<ActionResult<WebhookDelivery>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid delivery ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Retry delivery failed: User not authenticated', { deliveryId: id })
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('webhook_deliveries')
      .update({
        status: 'retrying',
        next_retry_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to retry delivery', { error, deliveryId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Delivery retry initiated successfully', { deliveryId: id, userId: user.id })

    revalidatePath('/dashboard/webhooks-v2')
    return actionSuccess(data as WebhookDelivery)
  } catch (error) {
    logger.error('Unexpected error retrying delivery', { error, deliveryId: id })
    return actionError('Failed to retry delivery', 'INTERNAL_ERROR')
  }
}

// ============================================
// WEBHOOK EVENT TYPES ACTIONS
// ============================================

/**
 * Create a webhook event type
 */
export async function createEventType(
  formData: FormData
): Promise<ActionResult<WebhookEventType>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Create event type failed: User not authenticated')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const name = formData.get('name') as string
    const description = formData.get('description') as string | null
    const category = formData.get('category') as string | null

    if (!name || name.trim().length === 0) {
      return actionError('Event type name is required', 'VALIDATION_ERROR')
    }

    const { data, error } = await supabase
      .from('webhook_event_types')
      .insert({
        user_id: user.id,
        name,
        description,
        category
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create event type', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Event type created successfully', {
      eventTypeId: data.id,
      userId: user.id,
      name
    })

    revalidatePath('/dashboard/webhooks-v2')
    return actionSuccess(data as WebhookEventType)
  } catch (error) {
    logger.error('Unexpected error creating event type', { error })
    return actionError('Failed to create event type', 'INTERNAL_ERROR')
  }
}

/**
 * Toggle event type active status
 */
export async function toggleEventType(
  id: string,
  isActive: boolean
): Promise<ActionResult<WebhookEventType>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid event type ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Toggle event type failed: User not authenticated', { eventTypeId: id })
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('webhook_event_types')
      .update({ is_active: isActive })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to toggle event type', {
        error,
        eventTypeId: id,
        userId: user.id,
        isActive
      })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Event type toggled successfully', {
      eventTypeId: id,
      userId: user.id,
      isActive
    })

    revalidatePath('/dashboard/webhooks-v2')
    return actionSuccess(data as WebhookEventType)
  } catch (error) {
    logger.error('Unexpected error toggling event type', { error, eventTypeId: id })
    return actionError('Failed to toggle event type', 'INTERNAL_ERROR')
  }
}
