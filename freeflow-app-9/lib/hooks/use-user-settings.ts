'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface UserSettings {
  id: string
  user_id: string
  first_name: string | null
  last_name: string | null
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  timezone: string
  locale: string
  email_notifications: boolean
  push_notifications: boolean
  marketing_emails: boolean
  weekly_digest: boolean
  two_factor_enabled: boolean
  two_factor_method: string | null
  security_questions: any[]
  theme: 'light' | 'dark' | 'system'
  accent_color: string
  compact_mode: boolean
  api_key: string | null
  api_rate_limit: number
  storage_used_bytes: number
  storage_limit_bytes: number
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export function useUserSettings(initialSettings: UserSettings | null = null) {
  const [settings, setSettings] = useState<UserSettings | null>(initialSettings)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchSettings = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      // Create default settings if none exist
      if (!data) {
        const { data: newData, error: createError } = await supabase
          .from('user_settings')
          .insert([{ user_id: user.id }])
          .select()
          .single()

        if (createError) throw createError
        setSettings(newData)
      } else {
        setSettings(data)
      }
    } catch (err: unknown) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!settings) throw new Error('Settings not loaded')

    const { data, error } = await supabase
      .from('user_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', settings.id)
      .select()
      .single()

    if (error) throw error
    setSettings(data)
    return data
  }

  const updateProfile = async (profile: { first_name?: string, last_name?: string, display_name?: string, bio?: string, avatar_url?: string }) => {
    return updateSettings(profile)
  }

  const updateNotificationSettings = async (notifications: { email_notifications?: boolean, push_notifications?: boolean, marketing_emails?: boolean, weekly_digest?: boolean }) => {
    return updateSettings(notifications)
  }

  const updateSecuritySettings = async (security: { two_factor_enabled?: boolean, two_factor_method?: string }) => {
    return updateSettings(security)
  }

  const updateAppearanceSettings = async (appearance: { theme?: 'light' | 'dark' | 'system', accent_color?: string, compact_mode?: boolean }) => {
    return updateSettings(appearance)
  }

  const generateApiKey = async () => {
    const newApiKey = `kazi_${crypto.randomUUID().replace(/-/g, '')}`
    return updateSettings({ api_key: newApiKey })
  }

  useEffect(() => {
    const channel = supabase
      .channel('user_settings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_settings' },
        () => fetchSettings()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, fetchSettings])

  const stats = settings ? {
    profileCompleteness: calculateProfileCompleteness(settings),
    storageUsedPercentage: Math.round((settings.storage_used_bytes / settings.storage_limit_bytes) * 100),
    storageUsedGB: Math.round(settings.storage_used_bytes / (1024 * 1024 * 1024) * 100) / 100,
    storageLimitGB: Math.round(settings.storage_limit_bytes / (1024 * 1024 * 1024)),
    securityScore: calculateSecurityScore(settings),
    accountAge: calculateAccountAge(settings.created_at)
  } : null

  return {
    settings,
    stats,
    isLoading,
    error,
    fetchSettings,
    updateSettings,
    updateProfile,
    updateNotificationSettings,
    updateSecuritySettings,
    updateAppearanceSettings,
    generateApiKey
  }
}

function calculateProfileCompleteness(settings: UserSettings): number {
  const fields = ['first_name', 'last_name', 'display_name', 'bio', 'avatar_url', 'timezone']
  const completed = fields.filter(f => settings[f as keyof UserSettings]).length
  return Math.round((completed / fields.length) * 100)
}

function calculateSecurityScore(settings: UserSettings): number {
  let score = 50 // Base score
  if (settings.two_factor_enabled) score += 30
  if (settings.security_questions?.length > 0) score += 20
  return Math.min(score, 100)
}

function calculateAccountAge(createdAt: string): string {
  const created = new Date(createdAt)
  const now = new Date()
  const years = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 365)
  if (years >= 1) return `${years.toFixed(1)} years`
  const months = years * 12
  if (months >= 1) return `${Math.round(months)} months`
  const days = years * 365
  return `${Math.round(days)} days`
}
