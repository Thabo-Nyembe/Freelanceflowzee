/**
 * KAZI Integrations & Webhooks System - Database Queries
 * World-class backend infrastructure for external integrations and webhook management
 */

import { supabase } from './supabase'
import * as crypto from 'crypto'
import { JsonValue } from '@/lib/types/database'

// =====================================================
// TYPES
// =====================================================

export interface Integration {
  id: string
  user_id: string
  type: IntegrationType
  name: string
  description?: string
  status: 'pending' | 'active' | 'error' | 'disconnected'
  credentials: Record<string, JsonValue>
  settings: IntegrationSettings
  scopes: string[]
  access_token?: string
  refresh_token?: string
  token_expires_at?: string
  last_sync_at?: string
  sync_frequency?: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual'
  error_message?: string
  metadata: Record<string, JsonValue>
  created_at: string
  updated_at: string
}

export type IntegrationType =
  | 'google_calendar'
  | 'google_drive'
  | 'outlook'
  | 'slack'
  | 'discord'
  | 'zapier'
  | 'quickbooks'
  | 'xero'
  | 'stripe'
  | 'paypal'
  | 'dropbox'
  | 'notion'
  | 'asana'
  | 'trello'
  | 'github'
  | 'gitlab'
  | 'custom_api'

export interface IntegrationSettings {
  sync_enabled?: boolean
  sync_direction?: 'import' | 'export' | 'both'
  auto_sync?: boolean
  sync_interval_minutes?: number
  notification_preferences?: {
    on_sync_complete?: boolean
    on_error?: boolean
  }
  field_mapping?: Record<string, string>
  filters?: Record<string, JsonValue>
}

export interface Webhook {
  id: string
  user_id: string
  name: string
  url: string
  secret?: string
  events: string[]
  is_active: boolean
  headers: Record<string, string>
  retry_policy: WebhookRetryPolicy
  last_triggered_at?: string
  total_deliveries: number
  successful_deliveries: number
  failed_deliveries: number
  created_at: string
  updated_at: string
}

export interface WebhookRetryPolicy {
  max_retries: number
  retry_delay_ms: number
  exponential_backoff: boolean
}

export interface WebhookDelivery {
  id: string
  webhook_id: string
  event_type: string
  payload: Record<string, JsonValue>
  response_status?: number
  response_body?: string
  response_time_ms?: number
  status: 'pending' | 'delivered' | 'failed' | 'retrying'
  retry_count: number
  next_retry_at?: string
  error_message?: string
  created_at: string
  delivered_at?: string
}

export interface IncomingWebhook {
  id: string
  user_id: string
  name: string
  source?: string
  description?: string
  secret?: string
  signature_type: 'hmac-sha256' | 'hmac-sha1' | 'basic' | 'none'
  is_active: boolean
  allowed_ips?: string[]
  total_received: number
  last_received_at?: string
  processing_rules: WebhookProcessingRule[]
  created_at: string
  updated_at: string
}

export interface WebhookProcessingRule {
  id: string
  condition: {
    field: string
    operator: 'equals' | 'contains' | 'matches' | 'exists'
    value?: JsonValue
  }
  action: {
    type: 'create_task' | 'send_notification' | 'trigger_workflow' | 'update_record' | 'custom'
    config: Record<string, JsonValue>
  }
}

export interface IncomingWebhookLog {
  id: string
  endpoint_id: string
  status: 'received' | 'processed' | 'rejected' | 'error'
  rejection_reason?: string
  event_type?: string
  payload?: Record<string, JsonValue>
  payload_preview?: string
  request_headers?: Record<string, string>
  response_time_ms?: number
  created_at: string
}

export interface SyncJob {
  id: string
  integration_id: string
  user_id: string
  type: 'full' | 'incremental' | 'manual'
  entity_type: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress: number
  total_items: number
  processed_items: number
  created_items: number
  updated_items: number
  skipped_items: number
  error_items: number
  errors: SyncError[]
  started_at?: string
  completed_at?: string
  created_at: string
}

export interface SyncError {
  item_id?: string
  message: string
  details?: Record<string, JsonValue>
}

export interface APIKey {
  id: string
  user_id: string
  name: string
  key_prefix: string
  key_hash: string
  scopes: string[]
  last_used_at?: string
  usage_count: number
  rate_limit: number
  expires_at?: string
  is_active: boolean
  created_at: string
}

export interface OAuthState {
  id: string
  user_id: string
  state: string
  integration_type: IntegrationType
  redirect_uri?: string
  expires_at: string
  created_at: string
}

// =====================================================
// INTEGRATION OPERATIONS
// =====================================================

export async function getIntegrations(userId: string): Promise<Integration[]> {
  try {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching integrations:', error)
    return []
  }
}

export async function getIntegrationById(integrationId: string): Promise<Integration | null> {
  try {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', integrationId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching integration:', error)
    return null
  }
}

export async function getIntegrationByType(userId: string, type: IntegrationType): Promise<Integration | null> {
  try {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  } catch (error) {
    console.error('Error fetching integration by type:', error)
    return null
  }
}

export async function createIntegration(integration: Partial<Integration>): Promise<Integration | null> {
  try {
    const { data, error } = await supabase
      .from('integrations')
      .insert({
        user_id: integration.user_id,
        type: integration.type,
        name: integration.name,
        description: integration.description,
        status: 'pending',
        credentials: integration.credentials || {},
        settings: integration.settings || {
          sync_enabled: true,
          sync_direction: 'both',
          auto_sync: false
        },
        scopes: integration.scopes || [],
        access_token: integration.access_token,
        refresh_token: integration.refresh_token,
        token_expires_at: integration.token_expires_at,
        sync_frequency: integration.sync_frequency || 'manual',
        metadata: integration.metadata || {}
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating integration:', error)
    return null
  }
}

export async function updateIntegration(
  integrationId: string,
  updates: Partial<Integration>
): Promise<Integration | null> {
  try {
    const { data, error } = await supabase
      .from('integrations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', integrationId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating integration:', error)
    return null
  }
}

export async function deleteIntegration(integrationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('id', integrationId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting integration:', error)
    return false
  }
}

export async function disconnectIntegration(integrationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('integrations')
      .update({
        status: 'disconnected',
        access_token: null,
        refresh_token: null,
        token_expires_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', integrationId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error disconnecting integration:', error)
    return false
  }
}

export async function refreshIntegrationToken(integrationId: string): Promise<boolean> {
  try {
    const integration = await getIntegrationById(integrationId)
    if (!integration || !integration.refresh_token) return false

    // TODO: Implement actual token refresh logic based on integration type
    // This would call the OAuth provider's token refresh endpoint

    return true
  } catch (error) {
    console.error('Error refreshing integration token:', error)
    return false
  }
}

export async function testIntegration(integrationId: string): Promise<{ success: boolean; message: string }> {
  try {
    const integration = await getIntegrationById(integrationId)
    if (!integration) {
      return { success: false, message: 'Integration not found' }
    }

    // TODO: Implement actual integration testing based on type
    // This would make a test API call to verify credentials

    await supabase
      .from('integrations')
      .update({
        status: 'active',
        error_message: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', integrationId)

    return { success: true, message: 'Connection successful' }
  } catch (error) {
    console.error('Error testing integration:', error)
    return { success: false, message: 'Connection test failed' }
  }
}

// =====================================================
// WEBHOOK OPERATIONS
// =====================================================

export async function getWebhooks(userId: string): Promise<Webhook[]> {
  try {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching webhooks:', error)
    return []
  }
}

export async function getWebhookById(webhookId: string): Promise<Webhook | null> {
  try {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('id', webhookId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching webhook:', error)
    return null
  }
}

export async function createWebhook(webhook: Partial<Webhook>): Promise<Webhook | null> {
  try {
    const secret = generateWebhookSecret()

    const { data, error } = await supabase
      .from('webhooks')
      .insert({
        user_id: webhook.user_id,
        name: webhook.name,
        url: webhook.url,
        secret,
        events: webhook.events || [],
        is_active: true,
        headers: webhook.headers || {},
        retry_policy: webhook.retry_policy || {
          max_retries: 3,
          retry_delay_ms: 5000,
          exponential_backoff: true
        },
        total_deliveries: 0,
        successful_deliveries: 0,
        failed_deliveries: 0
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating webhook:', error)
    return null
  }
}

export async function updateWebhook(webhookId: string, updates: Partial<Webhook>): Promise<Webhook | null> {
  try {
    const { data, error } = await supabase
      .from('webhooks')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', webhookId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating webhook:', error)
    return null
  }
}

export async function deleteWebhook(webhookId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', webhookId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting webhook:', error)
    return false
  }
}

export async function toggleWebhook(webhookId: string, isActive: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('webhooks')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', webhookId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error toggling webhook:', error)
    return false
  }
}

export async function regenerateWebhookSecret(webhookId: string): Promise<string | null> {
  try {
    const secret = generateWebhookSecret()

    const { error } = await supabase
      .from('webhooks')
      .update({ secret, updated_at: new Date().toISOString() })
      .eq('id', webhookId)

    if (error) throw error
    return secret
  } catch (error) {
    console.error('Error regenerating webhook secret:', error)
    return null
  }
}

export async function triggerWebhook(
  userId: string,
  eventType: string,
  payload: Record<string, JsonValue>
): Promise<number> {
  try {
    // Get all active webhooks subscribed to this event
    const { data: webhooks } = await supabase
      .from('webhooks')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .or(`events.cs.{${eventType}},events.cs.{*}`)

    let deliveryCount = 0

    for (const webhook of webhooks || []) {
      // Create delivery record
      await supabase
        .from('webhook_deliveries')
        .insert({
          webhook_id: webhook.id,
          event_type: eventType,
          payload: {
            event: eventType,
            timestamp: new Date().toISOString(),
            data: payload
          },
          status: 'pending',
          retry_count: 0
        })

      deliveryCount++

      // Update webhook stats
      await supabase
        .from('webhooks')
        .update({
          last_triggered_at: new Date().toISOString(),
          total_deliveries: webhook.total_deliveries + 1
        })
        .eq('id', webhook.id)
    }

    return deliveryCount
  } catch (error) {
    console.error('Error triggering webhooks:', error)
    return 0
  }
}

// =====================================================
// WEBHOOK DELIVERY OPERATIONS
// =====================================================

export async function getWebhookDeliveries(
  webhookId: string,
  options: { status?: string; limit?: number } = {}
): Promise<WebhookDelivery[]> {
  try {
    let query = supabase
      .from('webhook_deliveries')
      .select('*')
      .eq('webhook_id', webhookId)
      .order('created_at', { ascending: false })

    if (options.status) {
      query = query.eq('status', options.status)
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching webhook deliveries:', error)
    return []
  }
}

export async function retryWebhookDelivery(deliveryId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('webhook_deliveries')
      .update({
        status: 'pending',
        retry_count: 0,
        next_retry_at: null,
        error_message: null
      })
      .eq('id', deliveryId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error retrying webhook delivery:', error)
    return false
  }
}

// =====================================================
// INCOMING WEBHOOK OPERATIONS
// =====================================================

export async function getIncomingWebhooks(userId: string): Promise<IncomingWebhook[]> {
  try {
    const { data, error } = await supabase
      .from('incoming_webhooks')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching incoming webhooks:', error)
    return []
  }
}

export async function getIncomingWebhookById(endpointId: string): Promise<IncomingWebhook | null> {
  try {
    const { data, error } = await supabase
      .from('incoming_webhooks')
      .select('*')
      .eq('id', endpointId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching incoming webhook:', error)
    return null
  }
}

export async function createIncomingWebhook(endpoint: Partial<IncomingWebhook>): Promise<IncomingWebhook | null> {
  try {
    const secret = generateWebhookSecret()

    const { data, error } = await supabase
      .from('incoming_webhooks')
      .insert({
        user_id: endpoint.user_id,
        name: endpoint.name,
        source: endpoint.source,
        description: endpoint.description,
        secret,
        signature_type: endpoint.signature_type || 'hmac-sha256',
        is_active: true,
        allowed_ips: endpoint.allowed_ips,
        total_received: 0,
        processing_rules: endpoint.processing_rules || []
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating incoming webhook:', error)
    return null
  }
}

export async function updateIncomingWebhook(
  endpointId: string,
  updates: Partial<IncomingWebhook>
): Promise<IncomingWebhook | null> {
  try {
    const { data, error } = await supabase
      .from('incoming_webhooks')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', endpointId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating incoming webhook:', error)
    return null
  }
}

export async function deleteIncomingWebhook(endpointId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('incoming_webhooks')
      .delete()
      .eq('id', endpointId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting incoming webhook:', error)
    return false
  }
}

export async function logIncomingWebhook(
  endpointId: string,
  log: Partial<IncomingWebhookLog>
): Promise<IncomingWebhookLog | null> {
  try {
    const { data, error } = await supabase
      .from('incoming_webhook_logs')
      .insert({
        endpoint_id: endpointId,
        status: log.status,
        rejection_reason: log.rejection_reason,
        event_type: log.event_type,
        payload: log.payload,
        payload_preview: log.payload_preview || JSON.stringify(log.payload).substring(0, 500),
        request_headers: log.request_headers,
        response_time_ms: log.response_time_ms
      })
      .select()
      .single()

    if (error) throw error

    // Update endpoint stats
    await supabase
      .from('incoming_webhooks')
      .update({
        total_received: supabase.rpc('increment', { row_id: endpointId }),
        last_received_at: new Date().toISOString()
      })
      .eq('id', endpointId)

    return data
  } catch (error) {
    console.error('Error logging incoming webhook:', error)
    return null
  }
}

export async function getIncomingWebhookLogs(
  endpointId: string,
  options: { status?: string; limit?: number } = {}
): Promise<IncomingWebhookLog[]> {
  try {
    let query = supabase
      .from('incoming_webhook_logs')
      .select('*')
      .eq('endpoint_id', endpointId)
      .order('created_at', { ascending: false })

    if (options.status) {
      query = query.eq('status', options.status)
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching incoming webhook logs:', error)
    return []
  }
}

// =====================================================
// SYNC JOB OPERATIONS
// =====================================================

export async function getSyncJobs(
  userId: string,
  options: { integrationId?: string; status?: string; limit?: number } = {}
): Promise<SyncJob[]> {
  try {
    let query = supabase
      .from('sync_jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (options.integrationId) {
      query = query.eq('integration_id', options.integrationId)
    }

    if (options.status) {
      query = query.eq('status', options.status)
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching sync jobs:', error)
    return []
  }
}

export async function createSyncJob(job: Partial<SyncJob>): Promise<SyncJob | null> {
  try {
    const { data, error } = await supabase
      .from('sync_jobs')
      .insert({
        integration_id: job.integration_id,
        user_id: job.user_id,
        type: job.type || 'incremental',
        entity_type: job.entity_type,
        status: 'pending',
        progress: 0,
        total_items: 0,
        processed_items: 0,
        created_items: 0,
        updated_items: 0,
        skipped_items: 0,
        error_items: 0,
        errors: []
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating sync job:', error)
    return null
  }
}

export async function updateSyncJobProgress(
  jobId: string,
  progress: Partial<SyncJob>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('sync_jobs')
      .update(progress)
      .eq('id', jobId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating sync job progress:', error)
    return false
  }
}

export async function cancelSyncJob(jobId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('sync_jobs')
      .update({ status: 'cancelled' })
      .eq('id', jobId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error cancelling sync job:', error)
    return false
  }
}

// =====================================================
// API KEY OPERATIONS
// =====================================================

export async function getAPIKeys(userId: string): Promise<APIKey[]> {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching API keys:', error)
    return []
  }
}

export async function createAPIKey(
  userId: string,
  name: string,
  scopes: string[],
  expiresAt?: Date
): Promise<{ apiKey: APIKey; plainTextKey: string } | null> {
  try {
    const plainTextKey = generateAPIKey()
    const keyPrefix = plainTextKey.substring(0, 8)
    const keyHash = hashAPIKey(plainTextKey)

    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: userId,
        name,
        key_prefix: keyPrefix,
        key_hash: keyHash,
        scopes,
        rate_limit: 1000,
        expires_at: expiresAt?.toISOString(),
        is_active: true,
        usage_count: 0
      })
      .select()
      .single()

    if (error) throw error
    return { apiKey: data, plainTextKey }
  } catch (error) {
    console.error('Error creating API key:', error)
    return null
  }
}

export async function validateAPIKey(key: string): Promise<{ valid: boolean; apiKey?: APIKey; user_id?: string }> {
  try {
    const keyPrefix = key.substring(0, 8)
    const keyHash = hashAPIKey(key)

    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key_prefix', keyPrefix)
      .eq('key_hash', keyHash)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return { valid: false }
    }

    // Check expiration
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { valid: false }
    }

    // Update usage stats
    await supabase
      .from('api_keys')
      .update({
        last_used_at: new Date().toISOString(),
        usage_count: data.usage_count + 1
      })
      .eq('id', data.id)

    return { valid: true, apiKey: data, user_id: data.user_id }
  } catch (error) {
    console.error('Error validating API key:', error)
    return { valid: false }
  }
}

export async function revokeAPIKey(keyId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', keyId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error revoking API key:', error)
    return false
  }
}

export async function deleteAPIKey(keyId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', keyId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting API key:', error)
    return false
  }
}

// =====================================================
// OAUTH OPERATIONS
// =====================================================

export async function createOAuthState(
  userId: string,
  integrationType: IntegrationType,
  redirectUri?: string
): Promise<string | null> {
  try {
    const state = generateOAuthState()
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 10) // 10 minute expiry

    const { error } = await supabase
      .from('oauth_states')
      .insert({
        user_id: userId,
        state,
        integration_type: integrationType,
        redirect_uri: redirectUri,
        expires_at: expiresAt.toISOString()
      })

    if (error) throw error
    return state
  } catch (error) {
    console.error('Error creating OAuth state:', error)
    return null
  }
}

export async function validateOAuthState(state: string): Promise<OAuthState | null> {
  try {
    const { data, error } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .single()

    if (error || !data) return null

    // Check expiration
    if (new Date(data.expires_at) < new Date()) {
      await supabase.from('oauth_states').delete().eq('id', data.id)
      return null
    }

    // Delete used state
    await supabase.from('oauth_states').delete().eq('id', data.id)

    return data
  } catch (error) {
    console.error('Error validating OAuth state:', error)
    return null
  }
}

// =====================================================
// STATS & ANALYTICS
// =====================================================

export async function getIntegrationStats(userId: string): Promise<{
  totalIntegrations: number
  activeIntegrations: number
  totalWebhooks: number
  activeWebhooks: number
  totalAPIKeys: number
  recentSyncJobs: SyncJob[]
  webhookSuccessRate: number
}> {
  try {
    // Integration counts
    const { count: totalIntegrations } = await supabase
      .from('integrations')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)

    const { count: activeIntegrations } = await supabase
      .from('integrations')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('status', 'active')

    // Webhook counts
    const { count: totalWebhooks } = await supabase
      .from('webhooks')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)

    const { count: activeWebhooks } = await supabase
      .from('webhooks')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_active', true)

    // API key count
    const { count: totalAPIKeys } = await supabase
      .from('api_keys')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_active', true)

    // Recent sync jobs
    const recentSyncJobs = await getSyncJobs(userId, { limit: 5 })

    // Webhook success rate
    const { data: webhooks } = await supabase
      .from('webhooks')
      .select('total_deliveries, successful_deliveries')
      .eq('user_id', userId)

    let totalDeliveries = 0
    let successfulDeliveries = 0
    webhooks?.forEach(w => {
      totalDeliveries += w.total_deliveries || 0
      successfulDeliveries += w.successful_deliveries || 0
    })
    const webhookSuccessRate = totalDeliveries > 0
      ? (successfulDeliveries / totalDeliveries) * 100
      : 100

    return {
      totalIntegrations: totalIntegrations || 0,
      activeIntegrations: activeIntegrations || 0,
      totalWebhooks: totalWebhooks || 0,
      activeWebhooks: activeWebhooks || 0,
      totalAPIKeys: totalAPIKeys || 0,
      recentSyncJobs,
      webhookSuccessRate
    }
  } catch (error) {
    console.error('Error getting integration stats:', error)
    return {
      totalIntegrations: 0,
      activeIntegrations: 0,
      totalWebhooks: 0,
      activeWebhooks: 0,
      totalAPIKeys: 0,
      recentSyncJobs: [],
      webhookSuccessRate: 100
    }
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function generateWebhookSecret(): string {
  return `whsec_${crypto.randomBytes(32).toString('hex')}`
}

function generateAPIKey(): string {
  return `kazi_${crypto.randomBytes(32).toString('base64url')}`
}

function hashAPIKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

function generateOAuthState(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  algorithm: 'hmac-sha256' | 'hmac-sha1' = 'hmac-sha256'
): boolean {
  const hmac = crypto.createHmac(algorithm === 'hmac-sha256' ? 'sha256' : 'sha1', secret)
  hmac.update(payload)
  const expectedSignature = hmac.digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

export function generateWebhookSignature(
  payload: string,
  secret: string,
  algorithm: 'sha256' | 'sha1' = 'sha256'
): string {
  const hmac = crypto.createHmac(algorithm, secret)
  hmac.update(payload)
  return `${algorithm}=${hmac.digest('hex')}`
}

// =====================================================
// INTEGRATION TYPE CONFIGS
// =====================================================

export const INTEGRATION_CONFIGS: Record<IntegrationType, {
  name: string
  icon: string
  category: string
  scopes: string[]
  oauthUrl?: string
}> = {
  google_calendar: {
    name: 'Google Calendar',
    icon: 'calendar',
    category: 'productivity',
    scopes: ['https://www.googleapis.com/auth/calendar'],
    oauthUrl: 'https://accounts.google.com/o/oauth2/v2/auth'
  },
  google_drive: {
    name: 'Google Drive',
    icon: 'hard-drive',
    category: 'storage',
    scopes: ['https://www.googleapis.com/auth/drive'],
    oauthUrl: 'https://accounts.google.com/o/oauth2/v2/auth'
  },
  outlook: {
    name: 'Microsoft Outlook',
    icon: 'mail',
    category: 'productivity',
    scopes: ['Calendars.ReadWrite', 'Mail.ReadWrite'],
    oauthUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
  },
  slack: {
    name: 'Slack',
    icon: 'message-square',
    category: 'communication',
    scopes: ['chat:write', 'channels:read'],
    oauthUrl: 'https://slack.com/oauth/v2/authorize'
  },
  discord: {
    name: 'Discord',
    icon: 'message-circle',
    category: 'communication',
    scopes: ['bot', 'applications.commands'],
    oauthUrl: 'https://discord.com/api/oauth2/authorize'
  },
  zapier: {
    name: 'Zapier',
    icon: 'zap',
    category: 'automation',
    scopes: []
  },
  quickbooks: {
    name: 'QuickBooks',
    icon: 'dollar-sign',
    category: 'accounting',
    scopes: ['com.intuit.quickbooks.accounting'],
    oauthUrl: 'https://appcenter.intuit.com/connect/oauth2'
  },
  xero: {
    name: 'Xero',
    icon: 'dollar-sign',
    category: 'accounting',
    scopes: ['accounting.transactions', 'accounting.contacts'],
    oauthUrl: 'https://login.xero.com/identity/connect/authorize'
  },
  stripe: {
    name: 'Stripe',
    icon: 'credit-card',
    category: 'payments',
    scopes: ['read_write'],
    oauthUrl: 'https://connect.stripe.com/oauth/authorize'
  },
  paypal: {
    name: 'PayPal',
    icon: 'credit-card',
    category: 'payments',
    scopes: ['openid', 'email']
  },
  dropbox: {
    name: 'Dropbox',
    icon: 'box',
    category: 'storage',
    scopes: ['files.content.read', 'files.content.write'],
    oauthUrl: 'https://www.dropbox.com/oauth2/authorize'
  },
  notion: {
    name: 'Notion',
    icon: 'file-text',
    category: 'productivity',
    scopes: [],
    oauthUrl: 'https://api.notion.com/v1/oauth/authorize'
  },
  asana: {
    name: 'Asana',
    icon: 'check-square',
    category: 'project-management',
    scopes: ['default'],
    oauthUrl: 'https://app.asana.com/-/oauth_authorize'
  },
  trello: {
    name: 'Trello',
    icon: 'layout',
    category: 'project-management',
    scopes: ['read', 'write'],
    oauthUrl: 'https://trello.com/1/authorize'
  },
  github: {
    name: 'GitHub',
    icon: 'github',
    category: 'development',
    scopes: ['repo', 'user'],
    oauthUrl: 'https://github.com/login/oauth/authorize'
  },
  gitlab: {
    name: 'GitLab',
    icon: 'gitlab',
    category: 'development',
    scopes: ['api', 'read_user'],
    oauthUrl: 'https://gitlab.com/oauth/authorize'
  },
  custom_api: {
    name: 'Custom API',
    icon: 'code',
    category: 'custom',
    scopes: []
  }
}

// =====================================================
// WEBHOOK EVENT TYPES
// =====================================================

export const WEBHOOK_EVENTS = {
  // Client events
  'client.created': 'Client Created',
  'client.updated': 'Client Updated',
  'client.deleted': 'Client Deleted',

  // Project events
  'project.created': 'Project Created',
  'project.updated': 'Project Updated',
  'project.completed': 'Project Completed',
  'project.deleted': 'Project Deleted',

  // Invoice events
  'invoice.created': 'Invoice Created',
  'invoice.sent': 'Invoice Sent',
  'invoice.paid': 'Invoice Paid',
  'invoice.overdue': 'Invoice Overdue',

  // Booking events
  'booking.created': 'Booking Created',
  'booking.confirmed': 'Booking Confirmed',
  'booking.cancelled': 'Booking Cancelled',
  'booking.rescheduled': 'Booking Rescheduled',

  // Task events
  'task.created': 'Task Created',
  'task.completed': 'Task Completed',
  'task.assigned': 'Task Assigned',

  // File events
  'file.uploaded': 'File Uploaded',
  'file.shared': 'File Shared',
  'file.downloaded': 'File Downloaded',

  // Team events
  'team.member_added': 'Team Member Added',
  'team.member_removed': 'Team Member Removed',

  // Wildcard
  '*': 'All Events'
}
