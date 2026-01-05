'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type WebhookStatus = 'active' | 'paused' | 'failed'
export type WebhookEvent = 'user.created' | 'user.updated' | 'user.deleted' | 'project.created' | 'project.updated' | 'project.deleted' | 'task.created' | 'task.updated' | 'task.completed' | 'invoice.created' | 'invoice.paid' | 'payment.received' | 'file.uploaded' | 'comment.added' | '*'

export interface Webhook {
  id: string
  name: string
  url: string
  secret?: string
  events: WebhookEvent[]
  status: WebhookStatus
  headers: Record<string, string>
  retryPolicy: RetryPolicy
  failureThreshold: number
  consecutiveFailures: number
  lastTriggeredAt?: string
  lastSuccessAt?: string
  lastFailureAt?: string
  lastResponse?: WebhookResponse
  deliveries: WebhookDelivery[]
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
}

export interface RetryPolicy {
  maxRetries: number
  retryInterval: number // seconds
  exponentialBackoff: boolean
}

export interface WebhookResponse {
  statusCode: number
  body?: string
  headers?: Record<string, string>
  duration: number // ms
}

export interface WebhookDelivery {
  id: string
  webhookId: string
  event: WebhookEvent
  payload: Record<string, any>
  status: 'pending' | 'success' | 'failed' | 'retrying'
  attempts: DeliveryAttempt[]
  createdAt: string
  completedAt?: string
}

export interface DeliveryAttempt {
  attemptNumber: number
  timestamp: string
  response?: WebhookResponse
  error?: string
}

export interface WebhookStats {
  totalWebhooks: number
  activeWebhooks: number
  totalDeliveries: number
  successfulDeliveries: number
  failedDeliveries: number
  successRate: number
  avgResponseTime: number
  deliveriesByEvent: Record<string, number>
  deliveryTrend: { date: string; success: number; failed: number }[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockWebhooks: Webhook[] = [
  { id: 'wh-1', name: 'Slack Notifications', url: 'https://hooks.slack.com/services/xxx', events: ['task.completed', 'invoice.paid'], status: 'active', headers: { 'Content-Type': 'application/json' }, retryPolicy: { maxRetries: 3, retryInterval: 60, exponentialBackoff: true }, failureThreshold: 5, consecutiveFailures: 0, lastTriggeredAt: '2024-03-20T10:00:00Z', lastSuccessAt: '2024-03-20T10:00:00Z', deliveries: [], createdBy: 'user-1', createdByName: 'Alex Chen', createdAt: '2024-01-15', updatedAt: '2024-03-15' },
  { id: 'wh-2', name: 'CRM Sync', url: 'https://api.crm.com/webhooks/freeflow', secret: 'whsec_xxx', events: ['user.created', 'user.updated'], status: 'active', headers: { 'Content-Type': 'application/json', 'X-API-Key': 'xxx' }, retryPolicy: { maxRetries: 5, retryInterval: 120, exponentialBackoff: true }, failureThreshold: 3, consecutiveFailures: 0, lastTriggeredAt: '2024-03-20T09:30:00Z', lastSuccessAt: '2024-03-20T09:30:00Z', deliveries: [], createdBy: 'user-1', createdByName: 'Alex Chen', createdAt: '2024-02-01', updatedAt: '2024-03-10' },
  { id: 'wh-3', name: 'Analytics Tracker', url: 'https://analytics.example.com/track', events: ['*'], status: 'paused', headers: {}, retryPolicy: { maxRetries: 2, retryInterval: 30, exponentialBackoff: false }, failureThreshold: 10, consecutiveFailures: 8, lastTriggeredAt: '2024-03-19T15:00:00Z', lastFailureAt: '2024-03-19T15:00:00Z', lastResponse: { statusCode: 500, duration: 2500 }, deliveries: [], createdBy: 'user-2', createdByName: 'Sarah Miller', createdAt: '2024-03-01', updatedAt: '2024-03-19' }
]

const mockDeliveries: WebhookDelivery[] = [
  { id: 'del-1', webhookId: 'wh-1', event: 'task.completed', payload: { taskId: 'task-123', title: 'Design mockups' }, status: 'success', attempts: [{ attemptNumber: 1, timestamp: '2024-03-20T10:00:00Z', response: { statusCode: 200, duration: 150 } }], createdAt: '2024-03-20T10:00:00Z', completedAt: '2024-03-20T10:00:00Z' },
  { id: 'del-2', webhookId: 'wh-2', event: 'user.created', payload: { userId: 'user-new', email: 'new@example.com' }, status: 'success', attempts: [{ attemptNumber: 1, timestamp: '2024-03-20T09:30:00Z', response: { statusCode: 200, duration: 320 } }], createdAt: '2024-03-20T09:30:00Z', completedAt: '2024-03-20T09:30:00Z' },
  { id: 'del-3', webhookId: 'wh-3', event: 'file.uploaded', payload: { fileId: 'file-456' }, status: 'failed', attempts: [{ attemptNumber: 1, timestamp: '2024-03-19T15:00:00Z', response: { statusCode: 500, duration: 2500 } }, { attemptNumber: 2, timestamp: '2024-03-19T15:01:00Z', response: { statusCode: 500, duration: 3000 } }], createdAt: '2024-03-19T15:00:00Z', completedAt: '2024-03-19T15:01:00Z' }
]

const mockStats: WebhookStats = {
  totalWebhooks: 8,
  activeWebhooks: 6,
  totalDeliveries: 15420,
  successfulDeliveries: 14850,
  failedDeliveries: 570,
  successRate: 96.3,
  avgResponseTime: 245,
  deliveriesByEvent: { 'task.completed': 5200, 'user.created': 2100, 'invoice.paid': 1800, 'file.uploaded': 3500 },
  deliveryTrend: Array.from({ length: 7 }, (_, i) => ({ date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0], success: 200 + Math.floor(Math.random() * 50), failed: Math.floor(Math.random() * 10) }))
}

// ============================================================================
// HOOK
// ============================================================================

interface UseWebhooksOptions {
  
}

export function useWebhooks(options: UseWebhooksOptions = {}) {
  const {  } = options

  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([])
  const [currentWebhook, setCurrentWebhook] = useState<Webhook | null>(null)
  const [stats, setStats] = useState<WebhookStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isTesting, setIsTesting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchWebhooks = useCallback(async () => {
    }, [])

  const updateWebhook = useCallback(async (webhookId: string, updates: Partial<Webhook>) => {
    setWebhooks(prev => prev.map(w => w.id === webhookId ? {
      ...w,
      ...updates,
      updatedAt: new Date().toISOString()
    } : w))
    return { success: true }
  }, [])

  const deleteWebhook = useCallback(async (webhookId: string) => {
    setWebhooks(prev => prev.filter(w => w.id !== webhookId))
    return { success: true }
  }, [])

  const pauseWebhook = useCallback(async (webhookId: string) => {
    return updateWebhook(webhookId, { status: 'paused' })
  }, [updateWebhook])

  const resumeWebhook = useCallback(async (webhookId: string) => {
    return updateWebhook(webhookId, { status: 'active', consecutiveFailures: 0 })
  }, [updateWebhook])

  const testWebhook = useCallback(async (webhookId: string, testPayload?: Record<string, any>) => {
    setIsTesting(true)
    try {
      const webhook = webhooks.find(w => w.id === webhookId)
      if (!webhook) return { success: false, error: 'Webhook not found' }

      // Simulate test delivery
      await new Promise(resolve => setTimeout(resolve, 1000))
      const success = Math.random() > 0.1 // 90% success rate for testing

      const delivery: WebhookDelivery = {
        id: `del-${Date.now()}`,
        webhookId,
        event: 'test' as WebhookEvent,
        payload: testPayload || { test: true, timestamp: new Date().toISOString() },
        status: success ? 'success' : 'failed',
        attempts: [{
          attemptNumber: 1,
          timestamp: new Date().toISOString(),
          response: success ? { statusCode: 200, duration: 150 } : { statusCode: 500, duration: 2000 }
        }],
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      }
      setDeliveries(prev => [delivery, ...prev])

      return { success, response: delivery.attempts[0].response }
    } finally {
      setIsTesting(false)
    }
  }, [webhooks])

  const regenerateSecret = useCallback(async (webhookId: string) => {
    const newSecret = `whsec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
    return updateWebhook(webhookId, { secret: newSecret })
  }, [updateWebhook])

  const retryDelivery = useCallback(async (deliveryId: string) => {
    setDeliveries(prev => prev.map(d => d.id === deliveryId ? {
      ...d,
      status: 'retrying' as const
    } : d))

    // Simulate retry
    await new Promise(resolve => setTimeout(resolve, 500))
    const success = Math.random() > 0.3

    setDeliveries(prev => prev.map(d => d.id === deliveryId ? {
      ...d,
      status: success ? 'success' as const : 'failed' as const,
      attempts: [...d.attempts, {
        attemptNumber: d.attempts.length + 1,
        timestamp: new Date().toISOString(),
        response: success ? { statusCode: 200, duration: 200 } : { statusCode: 500, duration: 2500 }
      }],
      completedAt: new Date().toISOString()
    } : d))

    return { success }
  }, [])

  const getDeliveriesByWebhook = useCallback((webhookId: string) => {
    return deliveries.filter(d => d.webhookId === webhookId)
  }, [deliveries])

  const getDeliveriesByEvent = useCallback((event: WebhookEvent) => {
    return deliveries.filter(d => d.event === event)
  }, [deliveries])

  const availableEvents: WebhookEvent[] = ['user.created', 'user.updated', 'user.deleted', 'project.created', 'project.updated', 'project.deleted', 'task.created', 'task.updated', 'task.completed', 'invoice.created', 'invoice.paid', 'payment.received', 'file.uploaded', 'comment.added', '*']

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchWebhooks()
  }, [fetchWebhooks])

  useEffect(() => { refresh() }, [refresh])

  // Computed values
  const activeWebhooks = useMemo(() => webhooks.filter(w => w.status === 'active'), [webhooks])
  const pausedWebhooks = useMemo(() => webhooks.filter(w => w.status === 'paused'), [webhooks])
  const failedWebhooks = useMemo(() => webhooks.filter(w => w.status === 'failed'), [webhooks])
  const recentDeliveries = useMemo(() => deliveries.slice(0, 50), [deliveries])
  const failedDeliveries = useMemo(() => deliveries.filter(d => d.status === 'failed'), [deliveries])

  return {
    webhooks, deliveries, currentWebhook, stats, availableEvents,
    activeWebhooks, pausedWebhooks, failedWebhooks, recentDeliveries, failedDeliveries,
    isLoading, isTesting, error,
    refresh, createWebhook, updateWebhook, deleteWebhook,
    pauseWebhook, resumeWebhook, testWebhook, regenerateSecret, retryDelivery,
    getDeliveriesByWebhook, getDeliveriesByEvent, setCurrentWebhook
  }
}

export default useWebhooks
