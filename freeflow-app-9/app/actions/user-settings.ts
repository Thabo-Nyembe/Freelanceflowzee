'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface UserSettingsInput {
  first_name?: string
  last_name?: string
  display_name?: string
  bio?: string
  avatar_url?: string
  timezone?: string
  locale?: string
  email_notifications?: boolean
  push_notifications?: boolean
  marketing_emails?: boolean
  weekly_digest?: boolean
  two_factor_enabled?: boolean
  two_factor_method?: string
  theme?: 'light' | 'dark' | 'system'
  accent_color?: string
  compact_mode?: boolean
  api_rate_limit?: number
}

export async function getUserSettings() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

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
    return newData
  }

  return data
}

export async function updateUserSettings(updates: UserSettingsInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('user_settings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/settings-v2')
  return data
}

export async function updateProfile(profile: {
  first_name?: string
  last_name?: string
  display_name?: string
  bio?: string
  avatar_url?: string
}) {
  return updateUserSettings(profile)
}

export async function updateNotificationSettings(notifications: {
  email_notifications?: boolean
  push_notifications?: boolean
  marketing_emails?: boolean
  weekly_digest?: boolean
}) {
  return updateUserSettings(notifications)
}

export async function updateSecuritySettings(security: {
  two_factor_enabled?: boolean
  two_factor_method?: string
}) {
  return updateUserSettings(security)
}

export async function updateAppearanceSettings(appearance: {
  theme?: 'light' | 'dark' | 'system'
  accent_color?: string
  compact_mode?: boolean
}) {
  return updateUserSettings(appearance)
}

export async function generateApiKey() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const newApiKey = `kazi_${crypto.randomUUID().replace(/-/g, '')}`

  const { data, error } = await supabase
    .from('user_settings')
    .update({
      api_key: newApiKey,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/settings-v2')
  return data
}

export async function revokeApiKey() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('user_settings')
    .update({
      api_key: null,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/settings-v2')
  return data
}
