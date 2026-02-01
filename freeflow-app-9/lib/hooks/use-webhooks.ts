'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// =====================================================
// TYPES
// =====================================================

export interface Webhook {
  id: string
  user_id: string
  webhook_code: string
  name: string
  description: string | null
  url: string
  secret: string | null
  events: string[]
  status: 'active' | 'paused' | 'failed' | 'disabled'
  total_deliveries: number
  successful_deliveries: number
  failed_deliveries: number
  success_rate: number
  avg_response_time_ms: number
  last_delivery_at: string | null
  last_success_at: string | null
  last_failure_at: string | null
  consecutive_failures: number
  retry_count: number
  retry_delay_seconds: number
  timeout_ms: number
  verify_ssl: boolean
  custom_headers: Record<string, string>
  tags: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface WebhookDelivery {
  id: string
  webhook_id: string
  event_type: string
  event_id: string | null
  payload: Record<string, any>
  status: 'pending' | 'success' | 'failed' | 'retrying'
  attempts: number
  max_attempts: number
  response_status_code: number | null
  response_body: string | null
  response_headers: Record<string, string>
  response_time_ms: number | null
  scheduled_at: string
  delivered_at: string | null
  next_retry_at: string | null
  error_message: string | null
  created_at: string
}

export interface WebhookEventType {
  id: string
  user_id: string
  name: string
  description: string | null
  category: string | null
  total_deliveries: number
  subscribers_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface WebhookStats {
  total: number
  active: number
  paused: number
  failed: number
  totalDeliveries: number
  successfulDeliveries: number
  avgSuccessRate: number
  avgResponseTime: number
}

// =====================================================
// WEBHOOKS HOOK
// =====================================================

export function useWebhooks(initialWebhooks: Webhook[] = [], initialStats?: WebhookStats) {
  const [webhooks, setWebhooks] = useState<Webhook[]>(initialWebhooks)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<WebhookStats>(initialStats || {
    total: 0,
    active: 0,
    paused: 0,
    failed: 0,
    totalDeliveries: 0,
    successfulDeliveries: 0,
    avgSuccessRate: 100,
    avgResponseTime: 0
  })

  const supabase = createClient()

  // Calculate stats from webhooks
  const calculateStats = useCallback((webhooksList: Webhook[]): WebhookStats => {
    if (webhooksList.length === 0) {
      return {
        total: 0,
        active: 0,
        paused: 0,
        failed: 0,
        totalDeliveries: 0,
        successfulDeliveries: 0,
        avgSuccessRate: 100,
        avgResponseTime: 0
      }
    }

    return {
      total: webhooksList.length,
      active: webhooksList.filter(w => w.status === 'active').length,
      paused: webhooksList.filter(w => w.status === 'paused').length,
      failed: webhooksList.filter(w => w.status === 'failed').length,
      totalDeliveries: webhooksList.reduce((sum, w) => sum + w.total_deliveries, 0),
      successfulDeliveries: webhooksList.reduce((sum, w) => sum + w.successful_deliveries, 0),
      avgSuccessRate: webhooksList.reduce((sum, w) => sum + w.success_rate, 0) / webhooksList.length,
      avgResponseTime: webhooksList.reduce((sum, w) => sum + w.avg_response_time_ms, 0) / webhooksList.length
    }
  }, [])

  // Fetch webhooks
  const fetchWebhooks = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: fetchError } = await supabase
        .from('webhooks')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      const webhooksList = data || []
      setWebhooks(webhooksList)
      setStats(calculateStats(webhooksList))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch webhooks')
    } finally {
      setLoading(false)
    }
  }, [supabase, calculateStats])

  // Create webhook
  const createWebhook = useCallback(async (webhook: Partial<Webhook>) => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: createError } = await supabase
        .from('webhooks')
        .insert({
          ...webhook,
          user_id: user.id
        })
        .select()
        .single()

      if (createError) throw createError

      setWebhooks(prev => {
        const updated = [data, ...prev]
        setStats(calculateStats(updated))
        return updated
      })

      return { success: true, data }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create webhook'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [supabase, calculateStats])

  // Update webhook
  const updateWebhook = useCallback(async (id: string, updates: Partial<Webhook>) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: updateError } = await supabase
        .from('webhooks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      setWebhooks(prev => {
        const updated = prev.map(w => w.id === id ? data : w)
        setStats(calculateStats(updated))
        return updated
      })

      return { success: true, data }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update webhook'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [supabase, calculateStats])

  // Delete webhook (soft delete)
  const deleteWebhook = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const { error: deleteError } = await supabase
        .from('webhooks')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (deleteError) throw deleteError

      setWebhooks(prev => {
        const updated = prev.filter(w => w.id !== id)
        setStats(calculateStats(updated))
        return updated
      })

      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete webhook'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [supabase, calculateStats])

  // Toggle webhook status
  const toggleStatus = useCallback(async (id: string, status: Webhook['status']) => {
    return updateWebhook(id, { status })
  }, [updateWebhook])

  // Test webhook - makes actual HTTP request to the webhook URL
  const testWebhook = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const webhook = webhooks.find(w => w.id === id)
      if (!webhook) throw new Error('Webhook not found')

      // Create test payload
      const testPayload = {
        id: `test-${Date.now()}`,
        event: 'test',
        timestamp: new Date().toISOString(),
        data: {
          test: true,
          message: 'This is a test webhook delivery from FreeFlow',
          webhook_id: id,
          webhook_name: webhook.name
        }
      }

      // Create a pending delivery record first
      const { data: deliveryRecord, error: insertError } = await supabase
        .from('webhook_deliveries')
        .insert({
          webhook_id: id,
          event_type: 'test',
          event_id: testPayload.id,
          payload: testPayload,
          status: 'pending',
          attempts: 1,
          max_attempts: 1
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Make actual HTTP request to the webhook URL
      const startTime = Date.now()
      let responseStatus = 0
      let responseBody = ''
      let deliveryError: string | null = null
      let deliveryStatus: 'success' | 'failed' = 'failed'

      try {
        // Generate signature if secret exists
        const body = JSON.stringify(testPayload)
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'X-Webhook-Event': 'test',
          'X-Webhook-Delivery': deliveryRecord.id,
          'User-Agent': 'FreeFlow-Webhook/1.0',
          ...(webhook.custom_headers || {})
        }

        // Add signature header if secret exists
        if (webhook.secret) {
          const timestamp = Date.now()
          const signedPayload = `${timestamp}.${body}`
          // Use Web Crypto API for client-side signing
          const encoder = new TextEncoder()
          const keyData = encoder.encode(webhook.secret)
          const messageData = encoder.encode(signedPayload)

          const cryptoKey = await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
          )
          const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
          const signatureHex = Array.from(new Uint8Array(signature))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')

          headers['X-Webhook-Signature'] = `t=${timestamp},v1=${signatureHex}`
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), webhook.timeout_ms || 30000)

        const response = await fetch(webhook.url, {
          method: 'POST',
          headers,
          body,
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        responseStatus = response.status
        responseBody = await response.text().catch(() => '')
        deliveryStatus = response.ok ? 'success' : 'failed'

        if (!response.ok) {
          deliveryError = `HTTP ${response.status}: ${response.statusText}`
        }
      } catch (fetchError) {
        deliveryError = fetchError instanceof Error ? fetchError.message : 'Request failed'
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          deliveryError = 'Request timeout'
        }
      }

      const responseTime = Date.now() - startTime

      // Update the delivery record with the result
      await supabase
        .from('webhook_deliveries')
        .update({
          status: deliveryStatus,
          response_status_code: responseStatus || null,
          response_body: responseBody.slice(0, 1000) || null,
          response_time_ms: responseTime,
          error_message: deliveryError,
          delivered_at: deliveryStatus === 'success' ? new Date().toISOString() : null
        })
        .eq('id', deliveryRecord.id)

      // Update webhook stats
      if (deliveryStatus === 'success') {
        await supabase
          .from('webhooks')
          .update({
            total_deliveries: webhook.total_deliveries + 1,
            successful_deliveries: webhook.successful_deliveries + 1,
            last_delivery_at: new Date().toISOString(),
            last_success_at: new Date().toISOString(),
            consecutive_failures: 0,
            avg_response_time_ms: Math.round((webhook.avg_response_time_ms * webhook.total_deliveries + responseTime) / (webhook.total_deliveries + 1)),
            success_rate: Math.round(((webhook.successful_deliveries + 1) / (webhook.total_deliveries + 1)) * 10000) / 100
          })
          .eq('id', id)
      } else {
        await supabase
          .from('webhooks')
          .update({
            total_deliveries: webhook.total_deliveries + 1,
            failed_deliveries: webhook.failed_deliveries + 1,
            last_delivery_at: new Date().toISOString(),
            last_failure_at: new Date().toISOString(),
            consecutive_failures: webhook.consecutive_failures + 1,
            success_rate: Math.round((webhook.successful_deliveries / (webhook.total_deliveries + 1)) * 10000) / 100
          })
          .eq('id', id)
      }

      // Refresh webhooks to get updated stats
      await fetchWebhooks()

      return {
        success: deliveryStatus === 'success',
        data: {
          deliveryId: deliveryRecord.id,
          status: deliveryStatus,
          responseStatus,
          responseTime,
          error: deliveryError
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to test webhook'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [supabase, webhooks, fetchWebhooks])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('webhooks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'webhooks' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setWebhooks(prev => {
              const updated = [payload.new as Webhook, ...prev]
              setStats(calculateStats(updated))
              return updated
            })
          } else if (payload.eventType === 'UPDATE') {
            setWebhooks(prev => {
              const updated = prev.map(w => w.id === payload.new.id ? payload.new as Webhook : w)
              setStats(calculateStats(updated))
              return updated
            })
          } else if (payload.eventType === 'DELETE') {
            setWebhooks(prev => {
              const updated = prev.filter(w => w.id !== payload.old.id)
              setStats(calculateStats(updated))
              return updated
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, calculateStats])

  return {
    webhooks,
    loading,
    error,
    stats,
    fetchWebhooks,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    toggleStatus,
    testWebhook
  }
}

// =====================================================
// WEBHOOK DELIVERIES HOOK
// =====================================================

export function useWebhookDeliveries(webhookId: string, initialDeliveries: WebhookDelivery[] = []) {
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>(initialDeliveries)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Fetch deliveries
  const fetchDeliveries = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('webhook_deliveries')
        .select('*')
        .eq('webhook_id', webhookId)
        .order('created_at', { ascending: false })
        .limit(100)

      if (fetchError) throw fetchError

      setDeliveries(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch deliveries')
    } finally {
      setLoading(false)
    }
  }, [supabase, webhookId])

  // Retry delivery
  const retryDelivery = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: updateError } = await supabase
        .from('webhook_deliveries')
        .update({
          status: 'retrying',
          next_retry_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      setDeliveries(prev => prev.map(d => d.id === id ? data : d))
      return { success: true, data }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to retry delivery'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`webhook-deliveries-${webhookId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'webhook_deliveries', filter: `webhook_id=eq.${webhookId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setDeliveries(prev => [payload.new as WebhookDelivery, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setDeliveries(prev => prev.map(d => d.id === payload.new.id ? payload.new as WebhookDelivery : d))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, webhookId])

  return {
    deliveries,
    loading,
    error,
    fetchDeliveries,
    retryDelivery
  }
}

// =====================================================
// WEBHOOK EVENT TYPES HOOK
// =====================================================

export function useWebhookEventTypes(initialEventTypes: WebhookEventType[] = []) {
  const [eventTypes, setEventTypes] = useState<WebhookEventType[]>(initialEventTypes)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Fetch event types
  const fetchEventTypes = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: fetchError } = await supabase
        .from('webhook_event_types')
        .select('*')
        .eq('user_id', user.id)
        .order('category', { ascending: true })

      if (fetchError) throw fetchError

      setEventTypes(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch event types')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Create event type
  const createEventType = useCallback(async (eventType: Partial<WebhookEventType>) => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: createError } = await supabase
        .from('webhook_event_types')
        .insert({
          ...eventType,
          user_id: user.id
        })
        .select()
        .single()

      if (createError) throw createError

      setEventTypes(prev => [...prev, data])
      return { success: true, data }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create event type'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Toggle event type active status
  const toggleEventType = useCallback(async (id: string, isActive: boolean) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: updateError } = await supabase
        .from('webhook_event_types')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      setEventTypes(prev => prev.map(et => et.id === id ? data : et))
      return { success: true, data }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to toggle event type'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  return {
    eventTypes,
    loading,
    error,
    fetchEventTypes,
    createEventType,
    toggleEventType
  }
}
