'use client'

/**
 * Extended Updates Hooks
 * Tables: updates, update_channels, update_releases, update_installations, update_rollbacks, update_notifications
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useUpdate(updateId?: string) {
  const [update, setUpdate] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!updateId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('updates').select('*, update_channels(*), users(*)').eq('id', updateId).single(); setUpdate(data) } finally { setIsLoading(false) }
  }, [updateId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { update, isLoading, refresh: fetch }
}

export function useUpdates(options?: { channel_id?: string; is_critical?: boolean; is_published?: boolean; search?: string; limit?: number }) {
  const [updates, setUpdates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('updates').select('*, update_channels(*), update_installations(count)')
      if (options?.channel_id) query = query.eq('channel_id', options.channel_id)
      if (options?.is_critical !== undefined) query = query.eq('is_critical', options.is_critical)
      if (options?.is_published !== undefined) query = query.eq('is_published', options.is_published)
      if (options?.search) query = query.or(`title.ilike.%${options.search}%,version.ilike.%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setUpdates(data || [])
    } finally { setIsLoading(false) }
  }, [options?.channel_id, options?.is_critical, options?.is_published, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { updates, isLoading, refresh: fetch }
}

export function useUpdateChannels(options?: { is_active?: boolean }) {
  const [channels, setChannels] = useState<any[]>([])
  const [defaultChannel, setDefaultChannel] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('update_channels').select('*, updates(count)')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setChannels(data || [])
      setDefaultChannel(data?.find(c => c.is_default) || null)
    } finally { setIsLoading(false) }
  }, [options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { channels, defaultChannel, isLoading, refresh: fetch }
}

export function useLatestUpdate(channelId?: string) {
  const [update, setUpdate] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('updates').select('*').eq('is_published', true)
      if (channelId) query = query.eq('channel_id', channelId)
      const { data } = await query.order('version', { ascending: false }).limit(1).single()
      setUpdate(data)
    } finally { setIsLoading(false) }
  }, [channelId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { update, isLoading, refresh: fetch }
}

export function useCheckForUpdates(currentVersion?: string, channelId?: string) {
  const [hasUpdate, setHasUpdate] = useState(false)
  const [availableUpdate, setAvailableUpdate] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const check = useCallback(async () => {
    if (!currentVersion) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('updates').select('*').eq('is_published', true).gt('version', currentVersion)
      if (channelId) {
        query = query.eq('channel_id', channelId)
      } else {
        const { data: defaultChannel } = await supabase.from('update_channels').select('id').eq('is_default', true).single()
        if (defaultChannel) query = query.eq('channel_id', defaultChannel.id)
      }
      const { data } = await query.order('version', { ascending: false }).limit(1).single()
      const updateAvailable = !!data && (!data.min_version || currentVersion >= data.min_version)
      setHasUpdate(updateAvailable)
      setAvailableUpdate(updateAvailable ? data : null)
    } finally { setIsLoading(false) }
  }, [currentVersion, channelId, supabase])
  useEffect(() => { check() }, [check])
  return { hasUpdate, update: availableUpdate, isLoading, refresh: check }
}

export function useUpdateInstallations(updateId?: string, options?: { status?: string; limit?: number }) {
  const [installations, setInstallations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!updateId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('update_installations').select('*').eq('update_id', updateId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('installed_at', { ascending: false }).limit(options?.limit || 100)
      setInstallations(data || [])
    } finally { setIsLoading(false) }
  }, [updateId, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { installations, isLoading, refresh: fetch }
}

export function useUpdateRollbacks(updateId?: string, options?: { limit?: number }) {
  const [rollbacks, setRollbacks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!updateId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('update_rollbacks').select('*').eq('update_id', updateId).order('rolled_back_at', { ascending: false }).limit(options?.limit || 50); setRollbacks(data || []) } finally { setIsLoading(false) }
  }, [updateId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { rollbacks, isLoading, refresh: fetch }
}

export function useUpdateStats(updateId?: string) {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!updateId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [installsRes, rollbacksRes] = await Promise.all([
        supabase.from('update_installations').select('status').eq('update_id', updateId),
        supabase.from('update_rollbacks').select('id').eq('update_id', updateId)
      ])
      const installs = installsRes.data || []
      const rollbacks = rollbacksRes.data || []
      setStats({
        total_installs: installs.length,
        successful_installs: installs.filter(i => i.status === 'completed').length,
        failed_installs: installs.filter(i => i.status === 'failed').length,
        rollbacks: rollbacks.length
      })
    } finally { setIsLoading(false) }
  }, [updateId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useCriticalUpdates(options?: { channel_id?: string; limit?: number }) {
  const [updates, setUpdates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('updates').select('*, update_channels(*)').eq('is_published', true).eq('is_critical', true)
      if (options?.channel_id) query = query.eq('channel_id', options.channel_id)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 10)
      setUpdates(data || [])
    } finally { setIsLoading(false) }
  }, [options?.channel_id, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { updates, isLoading, refresh: fetch }
}

export function useScheduledUpdates(options?: { channel_id?: string; limit?: number }) {
  const [updates, setUpdates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('updates').select('*, update_channels(*)').eq('is_published', false).not('scheduled_at', 'is', null).gt('scheduled_at', new Date().toISOString())
      if (options?.channel_id) query = query.eq('channel_id', options.channel_id)
      const { data } = await query.order('scheduled_at', { ascending: true }).limit(options?.limit || 10)
      setUpdates(data || [])
    } finally { setIsLoading(false) }
  }, [options?.channel_id, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { updates, isLoading, refresh: fetch }
}

export function useUpdateNotifications(updateId?: string, options?: { status?: string; limit?: number }) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!updateId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('update_notifications').select('*').eq('update_id', updateId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setNotifications(data || [])
    } finally { setIsLoading(false) }
  }, [updateId, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { notifications, isLoading, refresh: fetch }
}

export function useDeviceUpdateHistory(deviceId?: string, options?: { limit?: number }) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!deviceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('update_installations').select('*, updates(*)').eq('device_id', deviceId).order('installed_at', { ascending: false }).limit(options?.limit || 50); setHistory(data || []) } finally { setIsLoading(false) }
  }, [deviceId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { history, isLoading, refresh: fetch }
}
