/**
 * Webhook Delivery Service
 *
 * Handles webhook subscriptions and event delivery for the Manus AI agent.
 */

import { createClient } from '@/lib/supabase/client';
import crypto from 'crypto';

export type WebhookEventType =
  | 'task.created'
  | 'task.started'
  | 'task.completed'
  | 'task.failed'
  | 'task.cancelled'
  | 'step.started'
  | 'step.completed'
  | 'step.failed'
  | 'file.created'
  | 'file.updated'
  | 'session.created'
  | 'session.completed'
  | 'session.failed'
  | 'message.created';

export interface WebhookConfig {
  id: string;
  userId: string;
  url: string;
  events: WebhookEventType[];
  secret?: string;
  isActive: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookPayload {
  id: string;
  event: WebhookEventType;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEventType;
  payload: WebhookPayload;
  status: 'pending' | 'success' | 'failed';
  attempts: number;
  lastAttemptAt?: Date;
  responseCode?: number;
  responseBody?: string;
  error?: string;
  createdAt: Date;
}

export interface WebhookServiceConfig {
  maxRetries?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
  signatureHeader?: string;
}

/**
 * Webhook Service - Event delivery management
 */
export class WebhookService {
  private supabase = createClient();
  private config: WebhookServiceConfig;
  private pendingDeliveries: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: WebhookServiceConfig = {}) {
    this.config = {
      maxRetries: config.maxRetries ?? 3,
      retryDelayMs: config.retryDelayMs ?? 5000,
      timeoutMs: config.timeoutMs ?? 30000,
      signatureHeader: config.signatureHeader ?? 'X-Webhook-Signature'
    };
  }

  /**
   * Register a new webhook
   */
  async registerWebhook(
    userId: string,
    url: string,
    events: WebhookEventType[],
    options?: { secret?: string; metadata?: Record<string, unknown> }
  ): Promise<WebhookConfig> {
    const secret = options?.secret || this.generateSecret();

    const { data, error } = await this.supabase
      .from('ai_webhooks')
      .insert({
        user_id: userId,
        url,
        events,
        secret,
        is_active: true,
        metadata: options?.metadata || {}
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to register webhook: ${error.message}`);
    }

    return this.mapWebhookConfig(data);
  }

  /**
   * Update a webhook
   */
  async updateWebhook(
    webhookId: string,
    updates: Partial<Pick<WebhookConfig, 'url' | 'events' | 'isActive' | 'metadata'>>
  ): Promise<WebhookConfig> {
    const { data, error } = await this.supabase
      .from('ai_webhooks')
      .update({
        url: updates.url,
        events: updates.events,
        is_active: updates.isActive,
        metadata: updates.metadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', webhookId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update webhook: ${error.message}`);
    }

    return this.mapWebhookConfig(data);
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(webhookId: string): Promise<void> {
    const { error } = await this.supabase
      .from('ai_webhooks')
      .delete()
      .eq('id', webhookId);

    if (error) {
      throw new Error(`Failed to delete webhook: ${error.message}`);
    }
  }

  /**
   * Get webhooks for a user
   */
  async getWebhooks(userId: string): Promise<WebhookConfig[]> {
    const { data, error } = await this.supabase
      .from('ai_webhooks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get webhooks: ${error.message}`);
    }

    return (data || []).map(this.mapWebhookConfig);
  }

  /**
   * Emit a webhook event
   */
  async emit(
    userId: string,
    event: WebhookEventType,
    data: Record<string, unknown>
  ): Promise<void> {
    // Get all active webhooks for this user that are subscribed to this event
    const { data: webhooks, error } = await this.supabase
      .from('ai_webhooks')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .contains('events', [event]);

    if (error) {
      console.error('Failed to fetch webhooks:', error);
      return;
    }

    // Deliver to each webhook
    for (const webhook of webhooks || []) {
      await this.deliver(this.mapWebhookConfig(webhook), event, data);
    }
  }

  /**
   * Deliver a webhook event
   */
  private async deliver(
    webhook: WebhookConfig,
    event: WebhookEventType,
    data: Record<string, unknown>
  ): Promise<void> {
    const payload: WebhookPayload = {
      id: crypto.randomUUID(),
      event,
      timestamp: new Date().toISOString(),
      data
    };

    // Create delivery record
    const { data: delivery, error: insertError } = await this.supabase
      .from('webhook_deliveries')
      .insert({
        webhook_id: webhook.id,
        event,
        payload,
        status: 'pending',
        attempts: 0
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create delivery record:', insertError);
      return;
    }

    // Attempt delivery
    await this.attemptDelivery(webhook, payload, delivery.id);
  }

  /**
   * Attempt to deliver a webhook
   */
  private async attemptDelivery(
    webhook: WebhookConfig,
    payload: WebhookPayload,
    deliveryId: string,
    attempt: number = 1
  ): Promise<void> {
    const body = JSON.stringify(payload);
    const signature = this.generateSignature(body, webhook.secret || '');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [this.config.signatureHeader!]: signature,
          'X-Webhook-Event': payload.event,
          'X-Webhook-Delivery': deliveryId
        },
        body,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const responseBody = await response.text();

      // Update delivery record
      await this.supabase
        .from('webhook_deliveries')
        .update({
          status: response.ok ? 'success' : 'failed',
          attempts: attempt,
          last_attempt_at: new Date().toISOString(),
          response_code: response.status,
          response_body: responseBody.slice(0, 1000),
          delivered_at: response.ok ? new Date().toISOString() : null
        })
        .eq('id', deliveryId);

      // Retry if failed and under max attempts
      if (!response.ok && attempt < this.config.maxRetries!) {
        this.scheduleRetry(webhook, payload, deliveryId, attempt + 1);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Delivery failed';

      await this.supabase
        .from('webhook_deliveries')
        .update({
          status: 'failed',
          attempts: attempt,
          last_attempt_at: new Date().toISOString(),
          error: errorMessage
        })
        .eq('id', deliveryId);

      // Retry if under max attempts
      if (attempt < this.config.maxRetries!) {
        this.scheduleRetry(webhook, payload, deliveryId, attempt + 1);
      }
    }
  }

  /**
   * Schedule a retry delivery
   */
  private scheduleRetry(
    webhook: WebhookConfig,
    payload: WebhookPayload,
    deliveryId: string,
    attempt: number
  ): void {
    // Exponential backoff
    const delay = this.config.retryDelayMs! * Math.pow(2, attempt - 1);

    const timeoutId = setTimeout(async () => {
      this.pendingDeliveries.delete(deliveryId);
      await this.attemptDelivery(webhook, payload, deliveryId, attempt);
    }, delay);

    this.pendingDeliveries.set(deliveryId, timeoutId);
  }

  /**
   * Generate webhook signature
   */
  private generateSignature(body: string, secret: string): string {
    const timestamp = Date.now();
    const signedPayload = `${timestamp}.${body}`;
    const signature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    return `t=${timestamp},v1=${signature}`;
  }

  /**
   * Verify webhook signature (for consumers)
   */
  verifySignature(
    body: string,
    signature: string,
    secret: string,
    tolerance: number = 300000 // 5 minutes
  ): boolean {
    const parts = signature.split(',');
    const timestamp = parseInt(parts.find(p => p.startsWith('t='))?.slice(2) || '0', 10);
    const providedSignature = parts.find(p => p.startsWith('v1='))?.slice(3);

    if (!timestamp || !providedSignature) {
      return false;
    }

    // Check timestamp tolerance
    if (Math.abs(Date.now() - timestamp) > tolerance) {
      return false;
    }

    const signedPayload = `${timestamp}.${body}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(providedSignature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Generate a webhook secret
   */
  private generateSecret(): string {
    return `whsec_${crypto.randomBytes(32).toString('hex')}`;
  }

  /**
   * Get delivery history for a webhook
   */
  async getDeliveryHistory(
    webhookId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<WebhookDelivery[]> {
    const query = this.supabase
      .from('webhook_deliveries')
      .select('*')
      .eq('webhook_id', webhookId)
      .order('created_at', { ascending: false });

    if (options?.limit) {
      query.limit(options.limit);
    }
    if (options?.offset) {
      query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get delivery history: ${error.message}`);
    }

    return (data || []).map(this.mapDelivery);
  }

  /**
   * Cancel pending retries
   */
  cancelPendingRetries(): void {
    for (const [, timeoutId] of this.pendingDeliveries) {
      clearTimeout(timeoutId);
    }
    this.pendingDeliveries.clear();
  }

  /**
   * Map database row to WebhookConfig
   */
  private mapWebhookConfig(data: Record<string, unknown>): WebhookConfig {
    return {
      id: data.id as string,
      userId: data.user_id as string,
      url: data.url as string,
      events: data.events as WebhookEventType[],
      secret: data.secret as string | undefined,
      isActive: data.is_active as boolean,
      metadata: data.metadata as Record<string, unknown> | undefined,
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string)
    };
  }

  /**
   * Map database row to WebhookDelivery
   */
  private mapDelivery(data: Record<string, unknown>): WebhookDelivery {
    return {
      id: data.id as string,
      webhookId: data.webhook_id as string,
      event: data.event as WebhookEventType,
      payload: data.payload as WebhookPayload,
      status: data.status as WebhookDelivery['status'],
      attempts: data.attempts as number,
      lastAttemptAt: data.last_attempt_at ? new Date(data.last_attempt_at as string) : undefined,
      responseCode: data.response_code as number | undefined,
      responseBody: data.response_body as string | undefined,
      error: data.error as string | undefined,
      createdAt: new Date(data.created_at as string)
    };
  }
}

/**
 * Create webhook service instance
 */
let webhookServiceInstance: WebhookService | null = null;

export function getWebhookService(config?: WebhookServiceConfig): WebhookService {
  if (!webhookServiceInstance) {
    webhookServiceInstance = new WebhookService(config);
  }
  return webhookServiceInstance;
}

export default WebhookService;
