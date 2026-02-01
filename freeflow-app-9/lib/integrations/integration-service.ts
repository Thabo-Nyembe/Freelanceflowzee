// =====================================================
// KAZI Integration Service - Webhooks & External Sync
// Third-party integrations, webhooks, and data sync
// =====================================================

import { createClient } from '@/lib/supabase/server';

// Types
export type IntegrationType =
  | 'stripe'
  | 'paypal'
  | 'google_calendar'
  | 'outlook_calendar'
  | 'google_drive'
  | 'dropbox'
  | 'slack'
  | 'discord'
  | 'notion'
  | 'trello'
  | 'asana'
  | 'zapier'
  | 'make'
  | 'custom_webhook';

export type IntegrationStatus = 'active' | 'inactive' | 'error' | 'pending' | 'expired';
export type WebhookEventType =
  | 'invoice.created' | 'invoice.paid' | 'invoice.overdue'
  | 'project.created' | 'project.completed' | 'project.status_changed'
  | 'client.created' | 'client.updated'
  | 'task.created' | 'task.completed' | 'task.assigned'
  | 'booking.created' | 'booking.confirmed' | 'booking.cancelled'
  | 'payment.received' | 'payment.failed'
  | 'file.uploaded' | 'file.shared'
  | 'message.received'
  | 'contract.signed' | 'contract.expired'
  | '*'; // Wildcard for all events

export interface Integration {
  id: string;
  user_id: string;
  type: IntegrationType;
  name: string;
  description?: string;
  status: IntegrationStatus;
  credentials?: Record<string, any>;
  settings: Record<string, any>;
  scopes?: string[];
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  last_sync_at?: string;
  sync_frequency?: string;
  error_message?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Webhook {
  id: string;
  user_id: string;
  name: string;
  url: string;
  secret?: string;
  events: WebhookEventType[];
  is_active: boolean;
  headers?: Record<string, string>;
  retry_policy: {
    max_retries: number;
    retry_delay_ms: number;
    exponential_backoff: boolean;
  };
  last_triggered_at?: string;
  total_deliveries: number;
  successful_deliveries: number;
  failed_deliveries: number;
  created_at: string;
  updated_at: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event_type: WebhookEventType;
  payload: Record<string, any>;
  response_status?: number;
  response_body?: string;
  response_time_ms?: number;
  status: 'pending' | 'success' | 'failed' | 'retrying';
  retry_count: number;
  next_retry_at?: string;
  error_message?: string;
  created_at: string;
  delivered_at?: string;
}

export interface SyncJob {
  id: string;
  integration_id: string;
  user_id: string;
  type: 'import' | 'export' | 'sync';
  entity_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  total_items: number;
  processed_items: number;
  created_items: number;
  updated_items: number;
  skipped_items: number;
  error_items: number;
  errors: Array<{ item_id: string; error: string }>;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  key_hash: string;
  scopes: string[];
  last_used_at?: string;
  usage_count: number;
  rate_limit: number;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

class IntegrationService {
  private static instance: IntegrationService;

  private constructor() {}

  static getInstance(): IntegrationService {
    if (!IntegrationService.instance) {
      IntegrationService.instance = new IntegrationService();
    }
    return IntegrationService.instance;
  }

  // =====================================================
  // INTEGRATIONS
  // =====================================================

  async getIntegrations(userId: string, type?: IntegrationType): Promise<Integration[]> {
    const supabase = await createClient();

    let query = supabase
      .from('integrations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getIntegration(integrationId: string): Promise<Integration | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', integrationId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createIntegration(userId: string, data: {
    type: IntegrationType;
    name: string;
    description?: string;
    credentials?: Record<string, any>;
    settings?: Record<string, any>;
    scopes?: string[];
    access_token?: string;
    refresh_token?: string;
    token_expires_at?: string;
    sync_frequency?: string;
    metadata?: Record<string, any>;
  }): Promise<Integration> {
    const supabase = await createClient();

    const { data: integration, error } = await supabase
      .from('integrations')
      .insert({
        user_id: userId,
        type: data.type,
        name: data.name,
        description: data.description,
        status: 'pending',
        credentials: data.credentials || {},
        settings: data.settings || {},
        scopes: data.scopes || [],
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        token_expires_at: data.token_expires_at,
        sync_frequency: data.sync_frequency,
        metadata: data.metadata || {},
      })
      .select()
      .single();

    if (error) throw error;
    return integration;
  }

  async updateIntegration(integrationId: string, updates: Partial<Integration>): Promise<Integration> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('integrations')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', integrationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteIntegration(integrationId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('id', integrationId);

    if (error) throw error;
  }

  async activateIntegration(integrationId: string): Promise<Integration> {
    return this.updateIntegration(integrationId, {
      status: 'active',
      error_message: undefined,
    });
  }

  async deactivateIntegration(integrationId: string): Promise<Integration> {
    return this.updateIntegration(integrationId, { status: 'inactive' });
  }

  async refreshIntegrationToken(integrationId: string): Promise<Integration> {
    const integration = await this.getIntegration(integrationId);
    if (!integration) throw new Error('Integration not found');
    if (!integration.refresh_token) throw new Error('No refresh token available');

    // Token refresh logic depends on the integration type
    // This is a placeholder - actual implementation would call the provider's OAuth endpoint
    const refreshedData = await this.performTokenRefresh(integration);

    return this.updateIntegration(integrationId, {
      access_token: refreshedData.access_token,
      refresh_token: refreshedData.refresh_token,
      token_expires_at: refreshedData.expires_at,
      status: 'active',
    });
  }

  private async performTokenRefresh(integration: Integration): Promise<{
    access_token: string;
    refresh_token?: string;
    expires_at: string;
  }> {
    // Provider-specific token refresh logic
    switch (integration.type) {
      case 'google_calendar':
      case 'google_drive':
        return this.refreshGoogleToken(integration);
      case 'outlook_calendar':
        return this.refreshMicrosoftToken(integration);
      case 'dropbox':
        return this.refreshDropboxToken(integration);
      case 'slack':
        return this.refreshSlackToken(integration);
      case 'notion':
        // Notion uses long-lived tokens that don't need refresh
        throw new Error('Notion tokens do not require refresh');
      case 'stripe':
      case 'paypal':
        // Payment providers use API keys, not OAuth
        throw new Error(`${integration.type} uses API keys, not OAuth refresh tokens`);
      default:
        throw new Error(`Token refresh not supported for ${integration.type}`);
    }
  }

  private async refreshGoogleToken(integration: Integration): Promise<{
    access_token: string;
    refresh_token?: string;
    expires_at: string;
  }> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials not configured');
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: integration.refresh_token!,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Google token refresh failed: ${errorData.error_description || response.statusText}`);
    }

    const data = await response.json();

    return {
      access_token: data.access_token,
      // Google may or may not return a new refresh token
      refresh_token: data.refresh_token || integration.refresh_token,
      expires_at: new Date(Date.now() + (data.expires_in || 3600) * 1000).toISOString(),
    };
  }

  private async refreshMicrosoftToken(integration: Integration): Promise<{
    access_token: string;
    refresh_token?: string;
    expires_at: string;
  }> {
    const clientId = process.env.MICROSOFT_CLIENT_ID;
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Microsoft OAuth credentials not configured');
    }

    const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: integration.refresh_token!,
        grant_type: 'refresh_token',
        scope: integration.scopes?.join(' ') || 'https://graph.microsoft.com/Calendars.ReadWrite offline_access',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Microsoft token refresh failed: ${errorData.error_description || response.statusText}`);
    }

    const data = await response.json();

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: new Date(Date.now() + (data.expires_in || 3600) * 1000).toISOString(),
    };
  }

  private async refreshDropboxToken(integration: Integration): Promise<{
    access_token: string;
    refresh_token?: string;
    expires_at: string;
  }> {
    const clientId = process.env.DROPBOX_CLIENT_ID;
    const clientSecret = process.env.DROPBOX_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Dropbox OAuth credentials not configured');
    }

    const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        refresh_token: integration.refresh_token!,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Dropbox token refresh failed: ${errorData.error_description || response.statusText}`);
    }

    const data = await response.json();

    return {
      access_token: data.access_token,
      // Dropbox refresh tokens are long-lived and don't rotate
      refresh_token: integration.refresh_token,
      expires_at: new Date(Date.now() + (data.expires_in || 14400) * 1000).toISOString(),
    };
  }

  private async refreshSlackToken(integration: Integration): Promise<{
    access_token: string;
    refresh_token?: string;
    expires_at: string;
  }> {
    const clientId = process.env.SLACK_CLIENT_ID;
    const clientSecret = process.env.SLACK_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Slack OAuth credentials not configured');
    }

    // Slack uses a different rotation strategy - they don't use refresh tokens
    // Instead, bot tokens are long-lived. User tokens may need refresh.
    if (!integration.refresh_token) {
      // Bot tokens don't expire
      throw new Error('Slack bot tokens do not require refresh');
    }

    const response = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: integration.refresh_token,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error(`Slack token refresh failed: ${data.error}`);
    }

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: new Date(Date.now() + (data.expires_in || 43200) * 1000).toISOString(),
    };
  }

  /**
   * Check all integrations for tokens that need refresh
   * and refresh them proactively
   */
  async refreshExpiringTokens(userId: string): Promise<{
    refreshed: string[];
    failed: Array<{ integrationId: string; error: string }>;
  }> {
    const integrations = await this.getIntegrations(userId);
    const refreshed: string[] = [];
    const failed: Array<{ integrationId: string; error: string }> = [];

    // Check each integration
    for (const integration of integrations) {
      if (integration.status !== 'active') continue;
      if (!integration.refresh_token) continue;
      if (!integration.token_expires_at) continue;

      const expiresAt = new Date(integration.token_expires_at);
      const now = new Date();
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

      // Refresh if token expires within 5 minutes
      if (expiresAt <= fiveMinutesFromNow) {
        try {
          await this.refreshIntegrationToken(integration.id);
          refreshed.push(integration.id);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          failed.push({ integrationId: integration.id, error: message });

          // Mark integration as having an error
          await this.updateIntegration(integration.id, {
            status: 'error',
            error_message: `Token refresh failed: ${message}`,
          });
        }
      }
    }

    return { refreshed, failed };
  }

  /**
   * Get integrations that need attention (expired or expiring soon)
   */
  async getIntegrationsNeedingRefresh(userId: string): Promise<Integration[]> {
    const integrations = await this.getIntegrations(userId);
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    return integrations.filter(integration => {
      if (!integration.token_expires_at) return false;
      if (!integration.refresh_token) return false;

      const expiresAt = new Date(integration.token_expires_at);
      return expiresAt <= oneHourFromNow;
    });
  }

  // =====================================================
  // WEBHOOKS
  // =====================================================

  async getWebhooks(userId: string): Promise<Webhook[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getWebhook(webhookId: string): Promise<Webhook | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('id', webhookId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createWebhook(userId: string, data: {
    name: string;
    url: string;
    events: WebhookEventType[];
    secret?: string;
    headers?: Record<string, string>;
    retry_policy?: Partial<Webhook['retry_policy']>;
  }): Promise<Webhook> {
    const supabase = await createClient();

    // Generate a secret if not provided
    const secret = data.secret || this.generateWebhookSecret();

    const { data: webhook, error } = await supabase
      .from('webhooks')
      .insert({
        user_id: userId,
        name: data.name,
        url: data.url,
        secret,
        events: data.events,
        is_active: true,
        headers: data.headers || {},
        retry_policy: {
          max_retries: data.retry_policy?.max_retries ?? 3,
          retry_delay_ms: data.retry_policy?.retry_delay_ms ?? 5000,
          exponential_backoff: data.retry_policy?.exponential_backoff ?? true,
        },
        total_deliveries: 0,
        successful_deliveries: 0,
        failed_deliveries: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return webhook;
  }

  async updateWebhook(webhookId: string, updates: Partial<Webhook>): Promise<Webhook> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('webhooks')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', webhookId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteWebhook(webhookId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', webhookId);

    if (error) throw error;
  }

  async toggleWebhook(webhookId: string, isActive: boolean): Promise<Webhook> {
    return this.updateWebhook(webhookId, { is_active: isActive });
  }

  async testWebhook(webhookId: string): Promise<WebhookDelivery> {
    const webhook = await this.getWebhook(webhookId);
    if (!webhook) throw new Error('Webhook not found');

    const testPayload = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook delivery',
        webhook_id: webhookId,
      },
    };

    return this.triggerWebhook(webhook, 'invoice.created', testPayload);
  }

  // =====================================================
  // WEBHOOK DELIVERY
  // =====================================================

  async triggerWebhook(
    webhook: Webhook,
    eventType: WebhookEventType,
    payload: Record<string, any>
  ): Promise<WebhookDelivery> {
    const supabase = await createClient();

    // Create delivery record
    const { data: delivery, error: createError } = await supabase
      .from('webhook_deliveries')
      .insert({
        webhook_id: webhook.id,
        event_type: eventType,
        payload,
        status: 'pending',
        retry_count: 0,
      })
      .select()
      .single();

    if (createError) throw createError;

    // Attempt delivery
    try {
      const startTime = Date.now();

      const signature = this.signWebhookPayload(JSON.stringify(payload), webhook.secret || '');

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': eventType,
          'X-Webhook-ID': delivery.id,
          'X-Webhook-Timestamp': new Date().toISOString(),
          ...webhook.headers,
        },
        body: JSON.stringify(payload),
      });

      const responseTime = Date.now() - startTime;
      const responseBody = await response.text();

      // Update delivery record
      const status = response.ok ? 'success' : 'failed';

      await supabase
        .from('webhook_deliveries')
        .update({
          status,
          response_status: response.status,
          response_body: responseBody.substring(0, 5000), // Limit response body size
          response_time_ms: responseTime,
          delivered_at: new Date().toISOString(),
        })
        .eq('id', delivery.id);

      // Update webhook stats
      await supabase
        .from('webhooks')
        .update({
          total_deliveries: webhook.total_deliveries + 1,
          successful_deliveries: response.ok
            ? webhook.successful_deliveries + 1
            : webhook.successful_deliveries,
          failed_deliveries: response.ok
            ? webhook.failed_deliveries
            : webhook.failed_deliveries + 1,
          last_triggered_at: new Date().toISOString(),
        })
        .eq('id', webhook.id);

      return {
        ...delivery,
        status,
        response_status: response.status,
        response_time_ms: responseTime,
      };

    } catch (error) {
      // Update delivery as failed
      await supabase
        .from('webhook_deliveries')
        .update({
          status: 'failed',
          error_message: error.message,
          next_retry_at: webhook.retry_policy.max_retries > 0
            ? new Date(Date.now() + webhook.retry_policy.retry_delay_ms).toISOString()
            : undefined,
        })
        .eq('id', delivery.id);

      // Update webhook failed count
      await supabase
        .from('webhooks')
        .update({
          total_deliveries: webhook.total_deliveries + 1,
          failed_deliveries: webhook.failed_deliveries + 1,
          last_triggered_at: new Date().toISOString(),
        })
        .eq('id', webhook.id);

      return {
        ...delivery,
        status: 'failed',
        error_message: error.message,
      };
    }
  }

  async triggerWebhooksForEvent(
    userId: string,
    eventType: WebhookEventType,
    payload: Record<string, any>
  ): Promise<WebhookDelivery[]> {
    const supabase = await createClient();

    // Find all active webhooks for this user that subscribe to this event
    const { data: webhooks, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .or(`events.cs.{${eventType}},events.cs.{*}`);

    if (error) throw error;
    if (!webhooks?.length) return [];

    // Trigger each webhook
    const deliveries = await Promise.all(
      webhooks.map(webhook =>
        this.triggerWebhook(webhook, eventType, {
          ...payload,
          event: eventType,
          timestamp: new Date().toISOString(),
        })
      )
    );

    return deliveries;
  }

  async getWebhookDeliveries(webhookId: string, limit = 50): Promise<WebhookDelivery[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('webhook_deliveries')
      .select('*')
      .eq('webhook_id', webhookId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async retryWebhookDelivery(deliveryId: string): Promise<WebhookDelivery> {
    const supabase = await createClient();

    const { data: delivery, error: fetchError } = await supabase
      .from('webhook_deliveries')
      .select('*, webhooks(*)')
      .eq('id', deliveryId)
      .single();

    if (fetchError) throw fetchError;
    if (!delivery) throw new Error('Delivery not found');

    const webhook = delivery.webhooks as Webhook;
    if (delivery.retry_count >= webhook.retry_policy.max_retries) {
      throw new Error('Maximum retry attempts reached');
    }

    // Update retry count
    await supabase
      .from('webhook_deliveries')
      .update({
        retry_count: delivery.retry_count + 1,
        status: 'retrying',
      })
      .eq('id', deliveryId);

    // Attempt redelivery
    return this.triggerWebhook(webhook, delivery.event_type, delivery.payload);
  }

  // =====================================================
  // SYNC JOBS
  // =====================================================

  async getSyncJobs(userId: string, integrationId?: string): Promise<SyncJob[]> {
    const supabase = await createClient();

    let query = supabase
      .from('sync_jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (integrationId) {
      query = query.eq('integration_id', integrationId);
    }

    const { data, error } = await query.limit(50);
    if (error) throw error;
    return data || [];
  }

  async getSyncJob(jobId: string): Promise<SyncJob | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('sync_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createSyncJob(userId: string, data: {
    integration_id: string;
    type: 'import' | 'export' | 'sync';
    entity_type: string;
    total_items?: number;
  }): Promise<SyncJob> {
    const supabase = await createClient();

    const { data: job, error } = await supabase
      .from('sync_jobs')
      .insert({
        integration_id: data.integration_id,
        user_id: userId,
        type: data.type,
        entity_type: data.entity_type,
        status: 'pending',
        progress: 0,
        total_items: data.total_items || 0,
        processed_items: 0,
        created_items: 0,
        updated_items: 0,
        skipped_items: 0,
        error_items: 0,
        errors: [],
      })
      .select()
      .single();

    if (error) throw error;
    return job;
  }

  async updateSyncJobProgress(jobId: string, progress: {
    processed_items?: number;
    created_items?: number;
    updated_items?: number;
    skipped_items?: number;
    error_items?: number;
    errors?: Array<{ item_id: string; error: string }>;
  }): Promise<SyncJob> {
    const supabase = await createClient();

    const job = await this.getSyncJob(jobId);
    if (!job) throw new Error('Sync job not found');

    const processedItems = progress.processed_items ?? job.processed_items;
    const progressPercent = job.total_items > 0
      ? Math.round((processedItems / job.total_items) * 100)
      : 0;

    const { data, error } = await supabase
      .from('sync_jobs')
      .update({
        progress: progressPercent,
        processed_items: processedItems,
        created_items: progress.created_items ?? job.created_items,
        updated_items: progress.updated_items ?? job.updated_items,
        skipped_items: progress.skipped_items ?? job.skipped_items,
        error_items: progress.error_items ?? job.error_items,
        errors: progress.errors ?? job.errors,
      })
      .eq('id', jobId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async completeSyncJob(jobId: string, status: 'completed' | 'failed', errorMessage?: string): Promise<SyncJob> {
    const supabase = await createClient();

    const updates: Partial<SyncJob> = {
      status,
      progress: status === 'completed' ? 100 : undefined,
      completed_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('sync_jobs')
      .update(updates)
      .eq('id', jobId)
      .select()
      .single();

    if (error) throw error;

    // Update integration last_sync_at
    const job = await this.getSyncJob(jobId);
    if (job && status === 'completed') {
      await this.updateIntegration(job.integration_id, {
        last_sync_at: new Date().toISOString(),
      });
    }

    return data;
  }

  async startSyncJob(jobId: string): Promise<SyncJob> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('sync_jobs')
      .update({
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .eq('id', jobId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // =====================================================
  // API KEYS
  // =====================================================

  async getApiKeys(userId: string): Promise<Omit<ApiKey, 'key_hash'>[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('api_keys')
      .select('id, user_id, name, key_prefix, scopes, last_used_at, usage_count, rate_limit, expires_at, is_active, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createApiKey(userId: string, data: {
    name: string;
    scopes?: string[];
    rate_limit?: number;
    expires_at?: string;
  }): Promise<{ apiKey: Omit<ApiKey, 'key_hash'>; key: string }> {
    const supabase = await createClient();

    // Generate API key
    const key = this.generateApiKey();
    const keyPrefix = key.substring(0, 8);
    const keyHash = await this.hashApiKey(key);

    const { data: apiKey, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: userId,
        name: data.name,
        key_prefix: keyPrefix,
        key_hash: keyHash,
        scopes: data.scopes || ['read'],
        rate_limit: data.rate_limit || 1000,
        expires_at: data.expires_at,
        is_active: true,
        usage_count: 0,
      })
      .select('id, user_id, name, key_prefix, scopes, last_used_at, usage_count, rate_limit, expires_at, is_active, created_at')
      .single();

    if (error) throw error;

    // Return the full key only once during creation
    return { apiKey, key };
  }

  async validateApiKey(key: string): Promise<ApiKey | null> {
    const supabase = await createClient();

    const keyPrefix = key.substring(0, 8);
    const keyHash = await this.hashApiKey(key);

    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key_prefix', keyPrefix)
      .eq('key_hash', keyHash)
      .eq('is_active', true)
      .single();

    if (error || !data) return null;

    // Check expiration
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return null;
    }

    // Update usage stats
    await supabase
      .from('api_keys')
      .update({
        last_used_at: new Date().toISOString(),
        usage_count: data.usage_count + 1,
      })
      .eq('id', data.id);

    return data;
  }

  async revokeApiKey(keyId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', keyId);

    if (error) throw error;
  }

  async deleteApiKey(keyId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', keyId);

    if (error) throw error;
  }

  // =====================================================
  // OAUTH FLOW HELPERS
  // =====================================================

  async initiateOAuthFlow(userId: string, integrationType: IntegrationType): Promise<{
    authUrl: string;
    state: string;
  }> {
    const state = this.generateRandomString(32);

    // Store state for verification
    const supabase = await createClient();
    await supabase
      .from('oauth_states')
      .insert({
        user_id: userId,
        state,
        integration_type: integrationType,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min
      });

    // Get OAuth config for the integration type
    const config = this.getOAuthConfig(integrationType);

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: config.scopes.join(' '),
      state,
      access_type: 'offline',
      prompt: 'consent',
    });

    return {
      authUrl: `${config.authUrl}?${params.toString()}`,
      state,
    };
  }

  async handleOAuthCallback(code: string, state: string): Promise<Integration> {
    const supabase = await createClient();

    // Verify state
    const { data: stateData, error: stateError } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .single();

    if (stateError || !stateData) {
      throw new Error('Invalid or expired OAuth state');
    }

    if (new Date(stateData.expires_at) < new Date()) {
      throw new Error('OAuth state has expired');
    }

    // Exchange code for tokens
    const config = this.getOAuthConfig(stateData.integration_type);
    const tokens = await this.exchangeCodeForTokens(code, config);

    // Delete used state
    await supabase
      .from('oauth_states')
      .delete()
      .eq('id', stateData.id);

    // Create integration
    return this.createIntegration(stateData.user_id, {
      type: stateData.integration_type,
      name: this.getIntegrationDisplayName(stateData.integration_type),
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: tokens.expires_at,
      scopes: config.scopes,
    });
  }

  private getOAuthConfig(type: IntegrationType): {
    authUrl: string;
    tokenUrl: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes: string[];
  } {
    // These should come from environment variables in production
    const configs: Record<string, any> = {
      google_calendar: {
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/callback/google`,
        scopes: ['https://www.googleapis.com/auth/calendar'],
      },
      google_drive: {
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/callback/google`,
        scopes: ['https://www.googleapis.com/auth/drive.file'],
      },
      dropbox: {
        authUrl: 'https://www.dropbox.com/oauth2/authorize',
        tokenUrl: 'https://api.dropboxapi.com/oauth2/token',
        clientId: process.env.DROPBOX_CLIENT_ID || '',
        clientSecret: process.env.DROPBOX_CLIENT_SECRET || '',
        redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/callback/dropbox`,
        scopes: ['files.content.read', 'files.content.write'],
      },
      slack: {
        authUrl: 'https://slack.com/oauth/v2/authorize',
        tokenUrl: 'https://slack.com/api/oauth.v2.access',
        clientId: process.env.SLACK_CLIENT_ID || '',
        clientSecret: process.env.SLACK_CLIENT_SECRET || '',
        redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/callback/slack`,
        scopes: ['chat:write', 'channels:read'],
      },
    };

    if (!configs[type]) {
      throw new Error(`OAuth not supported for integration type: ${type}`);
    }

    return configs[type];
  }

  private async exchangeCodeForTokens(code: string, config: any): Promise<{
    access_token: string;
    refresh_token?: string;
    expires_at?: string;
  }> {
    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const data = await response.json();

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined,
    };
  }

  private getIntegrationDisplayName(type: IntegrationType): string {
    const names: Record<IntegrationType, string> = {
      stripe: 'Stripe',
      paypal: 'PayPal',
      google_calendar: 'Google Calendar',
      outlook_calendar: 'Outlook Calendar',
      google_drive: 'Google Drive',
      dropbox: 'Dropbox',
      slack: 'Slack',
      discord: 'Discord',
      notion: 'Notion',
      trello: 'Trello',
      asana: 'Asana',
      zapier: 'Zapier',
      make: 'Make (Integromat)',
      custom_webhook: 'Custom Webhook',
    };
    return names[type] || type;
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  private generateWebhookSecret(): string {
    return 'whsec_' + this.generateRandomString(32);
  }

  private generateApiKey(): string {
    return 'kazi_' + this.generateRandomString(40);
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
      result += chars[randomValues[i] % chars.length];
    }
    return result;
  }

  private async hashApiKey(key: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private signWebhookPayload(payload: string, secret: string): string {
    // In production, use proper HMAC signing
    // This is a simplified version
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const payloadData = encoder.encode(payload);

    // For now, return a simple hash - in production use HMAC-SHA256
    return `sha256=${this.simpleHash(payload + secret)}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  // =====================================================
  // INTEGRATION-SPECIFIC SYNC METHODS
  // =====================================================

  async syncGoogleCalendar(integrationId: string): Promise<SyncJob> {
    const integration = await this.getIntegration(integrationId);
    if (!integration) throw new Error('Integration not found');
    if (integration.type !== 'google_calendar') {
      throw new Error('Invalid integration type');
    }

    const job = await this.createSyncJob(integration.user_id, {
      integration_id: integrationId,
      type: 'sync',
      entity_type: 'calendar_events',
    });

    // Start sync in background
    await this.startSyncJob(job.id);

    // Actual sync logic would be here
    // This is a placeholder for the Google Calendar API calls

    return job;
  }

  async syncStripePayments(integrationId: string): Promise<SyncJob> {
    const integration = await this.getIntegration(integrationId);
    if (!integration) throw new Error('Integration not found');
    if (integration.type !== 'stripe') {
      throw new Error('Invalid integration type');
    }

    const job = await this.createSyncJob(integration.user_id, {
      integration_id: integrationId,
      type: 'import',
      entity_type: 'payments',
    });

    await this.startSyncJob(job.id);

    // Actual Stripe sync logic would be here

    return job;
  }

  // =====================================================
  // STATS & ANALYTICS
  // =====================================================

  async getIntegrationStats(userId: string): Promise<{
    total_integrations: number;
    active_integrations: number;
    total_webhooks: number;
    active_webhooks: number;
    total_api_keys: number;
    total_sync_jobs: number;
    recent_webhook_deliveries: number;
    webhook_success_rate: number;
  }> {
    const supabase = await createClient();

    const [integrations, webhooks, apiKeys, syncJobs, recentDeliveries] = await Promise.all([
      supabase.from('integrations').select('status').eq('user_id', userId),
      supabase.from('webhooks').select('is_active, successful_deliveries, failed_deliveries').eq('user_id', userId),
      supabase.from('api_keys').select('is_active').eq('user_id', userId),
      supabase.from('sync_jobs').select('status').eq('user_id', userId),
      supabase.from('webhook_deliveries')
        .select('status')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    ]);

    const totalSuccessful = webhooks.data?.reduce((sum, w) => sum + (w.successful_deliveries || 0), 0) || 0;
    const totalFailed = webhooks.data?.reduce((sum, w) => sum + (w.failed_deliveries || 0), 0) || 0;
    const totalDeliveries = totalSuccessful + totalFailed;

    return {
      total_integrations: integrations.data?.length || 0,
      active_integrations: integrations.data?.filter(i => i.status === 'active').length || 0,
      total_webhooks: webhooks.data?.length || 0,
      active_webhooks: webhooks.data?.filter(w => w.is_active).length || 0,
      total_api_keys: apiKeys.data?.length || 0,
      total_sync_jobs: syncJobs.data?.length || 0,
      recent_webhook_deliveries: recentDeliveries.data?.length || 0,
      webhook_success_rate: totalDeliveries > 0
        ? Math.round((totalSuccessful / totalDeliveries) * 100)
        : 100,
    };
  }
}

export const integrationService = IntegrationService.getInstance();
