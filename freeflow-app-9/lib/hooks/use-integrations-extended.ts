'use client'

/**
 * Extended Integrations Hooks
 * Tables: integrations, integration_configs, integration_logs, integration_webhooks
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useIntegration(integrationId?: string) {
  const [integration, setIntegration] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!integrationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('integrations').select('*').eq('id', integrationId).single(); setIntegration(data) } finally { setIsLoading(false) }
  }, [integrationId])
  useEffect(() => { fetch() }, [fetch])
  return { integration, isLoading, refresh: fetch }
}

export function useIntegrations(options?: { user_id?: string; type?: string; provider?: string; status?: string; is_active?: boolean; limit?: number }) {
  const [integrations, setIntegrations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('integrations').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.provider) query = query.eq('provider', options.provider)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setIntegrations(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.type, options?.provider, options?.status, options?.is_active, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { integrations, isLoading, refresh: fetch }
}

export function useIntegrationLogs(integrationId?: string, options?: { level?: string; limit?: number }) {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!integrationId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('integration_logs').select('*').eq('integration_id', integrationId)
      if (options?.level) query = query.eq('level', options.level)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100)
      setLogs(data || [])
    } finally { setIsLoading(false) }
  }, [integrationId, options?.level, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { logs, isLoading, refresh: fetch }
}

export function useActiveIntegrations(userId?: string) {
  const [integrations, setIntegrations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('integrations').select('*').eq('user_id', userId).eq('is_active', true).order('name', { ascending: true }); setIntegrations(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { integrations, isLoading, refresh: fetch }
}

export function useIntegrationsByProvider(provider?: string) {
  const [integrations, setIntegrations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!provider) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('integrations').select('*').eq('provider', provider).eq('is_active', true).order('name', { ascending: true }); setIntegrations(data || []) } finally { setIsLoading(false) }
  }, [provider])
  useEffect(() => { fetch() }, [fetch])
  return { integrations, isLoading, refresh: fetch }
}
