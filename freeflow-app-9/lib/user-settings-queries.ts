/**
 * User Settings Query Library
 */

import { createClient } from '@/lib/supabase/client'

export type ThemeMode = 'light' | 'dark' | 'system'
export type SessionTimeout = '15m' | '1h' | '4h' | '12h' | '24h' | '7d' | '30d' | 'never'
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'DD-MM-YYYY' | 'YYYY/MM/DD'
export type ProfileVisibility = 'public' | 'private' | 'connections'
export type TwoFactorMethod = 'sms' | 'email' | 'authenticator' | 'none'
export type DigestFrequency = 'daily' | 'weekly' | 'monthly' | 'never'
export type TimeFormat = '12h' | '24h'
export type FontSize = 'small' | 'medium' | 'large' | 'xlarge'

export interface UserProfile {
  id: string
  user_id: string

  // Personal Information
  first_name?: string
  last_name?: string
  phone?: string
  bio?: string
  location?: string
  website?: string
  company?: string
  position?: string
  avatar_url?: string

  // Social Links
  linkedin_url?: string
  twitter_url?: string
  github_url?: string
  behance_url?: string
  dribbble_url?: string

  // Professional Info
  skills: string[]
  languages: string[]
  portfolio_items: string[]

  // Privacy
  profile_visibility: ProfileVisibility
  show_email: boolean
  show_phone: boolean

  created_at: string
  updated_at: string
}

export interface NotificationSettings {
  id: string
  user_id: string

  // Channel Preferences
  email_notifications: boolean
  push_notifications: boolean
  sms_notifications: boolean
  in_app_notifications: boolean

  // Activity Notifications
  project_updates: boolean
  client_messages: boolean
  team_mentions: boolean
  task_assignments: boolean
  deadline_reminders: boolean

  // Financial Notifications
  payment_alerts: boolean
  invoice_reminders: boolean
  payment_confirmations: boolean

  // Marketing & Updates
  marketing_emails: boolean
  product_updates: boolean
  weekly_digest: boolean
  monthly_reports: boolean

  // Frequency Settings
  digest_frequency: DigestFrequency
  quiet_hours_enabled: boolean
  quiet_hours_start?: string
  quiet_hours_end?: string

  created_at: string
  updated_at: string
}

export interface SecuritySettings {
  id: string
  user_id: string

  // Authentication
  two_factor_auth: boolean
  two_factor_method?: TwoFactorMethod
  biometric_auth: boolean

  // Session Management
  session_timeout: SessionTimeout
  remember_me_enabled: boolean
  concurrent_sessions_limit: number

  // Security Alerts
  login_alerts: boolean
  login_alerts_email: boolean
  suspicious_activity_alerts: boolean
  new_device_alerts: boolean

  // Password Policy
  password_required: boolean
  password_last_changed?: string
  password_expiry_days?: number

  // Active Sessions
  active_sessions: any[]

  created_at: string
  updated_at: string
}

export interface AppearanceSettings {
  id: string
  user_id: string

  // Theme
  theme: ThemeMode
  accent_color: string
  custom_css?: string

  // Localization
  language: string
  timezone: string
  date_format: DateFormat
  time_format: TimeFormat
  currency: string

  // Display Preferences
  compact_mode: boolean
  animations: boolean
  reduced_motion: boolean
  high_contrast: boolean
  font_size: FontSize

  // Layout
  sidebar_collapsed: boolean
  dashboard_layout: Record<string, any>
  pinned_items: string[]

  created_at: string
  updated_at: string
}

// USER PROFILE
export async function getUserProfile(userId: string) {
  const supabase = createClient()
  return await supabase.from('user_profiles').select('*').eq('user_id', userId).single()
}

export async function createUserProfile(userId: string, profile: Partial<UserProfile>) {
  const supabase = createClient()
  return await supabase.from('user_profiles').insert({ user_id: userId, ...profile }).select().single()
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const supabase = createClient()
  return await supabase.from('user_profiles').update(updates).eq('user_id', userId).select().single()
}

export async function updateAvatar(userId: string, avatarUrl: string) {
  const supabase = createClient()
  return await supabase.from('user_profiles').update({ avatar_url: avatarUrl }).eq('user_id', userId).select().single()
}

export async function addSkill(userId: string, skill: string) {
  const supabase = createClient()
  const { data: profile } = await supabase.from('user_profiles').select('skills').eq('user_id', userId).single()
  if (!profile) return { data: null, error: new Error('Profile not found') }

  const skills = [...(profile.skills || []), skill]
  return await supabase.from('user_profiles').update({ skills }).eq('user_id', userId).select().single()
}

export async function removeSkill(userId: string, skill: string) {
  const supabase = createClient()
  const { data: profile } = await supabase.from('user_profiles').select('skills').eq('user_id', userId).single()
  if (!profile) return { data: null, error: new Error('Profile not found') }

  const skills = (profile.skills || []).filter(s => s !== skill)
  return await supabase.from('user_profiles').update({ skills }).eq('user_id', userId).select().single()
}

// NOTIFICATION SETTINGS
export async function getNotificationSettings(userId: string) {
  const supabase = createClient()
  return await supabase.from('notification_settings').select('*').eq('user_id', userId).single()
}

export async function createNotificationSettings(userId: string, settings: Partial<NotificationSettings>) {
  const supabase = createClient()
  return await supabase.from('notification_settings').insert({ user_id: userId, ...settings }).select().single()
}

export async function updateNotificationSettings(userId: string, updates: Partial<NotificationSettings>) {
  const supabase = createClient()
  return await supabase.from('notification_settings').update(updates).eq('user_id', userId).select().single()
}

export async function toggleNotification(userId: string, notificationType: keyof NotificationSettings, enabled: boolean) {
  const supabase = createClient()
  return await supabase.from('notification_settings').update({ [notificationType]: enabled }).eq('user_id', userId).select().single()
}

// SECURITY SETTINGS
export async function getSecuritySettings(userId: string) {
  const supabase = createClient()
  return await supabase.from('security_settings').select('*').eq('user_id', userId).single()
}

export async function createSecuritySettings(userId: string, settings: Partial<SecuritySettings>) {
  const supabase = createClient()
  return await supabase.from('security_settings').insert({ user_id: userId, ...settings }).select().single()
}

export async function updateSecuritySettings(userId: string, updates: Partial<SecuritySettings>) {
  const supabase = createClient()
  return await supabase.from('security_settings').update(updates).eq('user_id', userId).select().single()
}

export async function enableTwoFactorAuth(userId: string, method: TwoFactorMethod) {
  const supabase = createClient()
  return await supabase.from('security_settings').update({ two_factor_auth: true, two_factor_method: method }).eq('user_id', userId).select().single()
}

export async function disableTwoFactorAuth(userId: string) {
  const supabase = createClient()
  return await supabase.from('security_settings').update({ two_factor_auth: false, two_factor_method: 'none' }).eq('user_id', userId).select().single()
}

export async function updatePasswordChanged(userId: string) {
  const supabase = createClient()
  return await supabase.from('security_settings').update({ password_last_changed: new Date().toISOString() }).eq('user_id', userId).select().single()
}

export async function addActiveSession(userId: string, session: any) {
  const supabase = createClient()
  const { data: settings } = await supabase.from('security_settings').select('active_sessions').eq('user_id', userId).single()
  if (!settings) return { data: null, error: new Error('Security settings not found') }

  const activeSessions = [...(settings.active_sessions || []), session]
  return await supabase.from('security_settings').update({ active_sessions: activeSessions }).eq('user_id', userId).select().single()
}

export async function removeActiveSession(userId: string, sessionId: string) {
  const supabase = createClient()
  const { data: settings } = await supabase.from('security_settings').select('active_sessions').eq('user_id', userId).single()
  if (!settings) return { data: null, error: new Error('Security settings not found') }

  const activeSessions = (settings.active_sessions || []).filter((s: any) => s.id !== sessionId)
  return await supabase.from('security_settings').update({ active_sessions: activeSessions }).eq('user_id', userId).select().single()
}

// APPEARANCE SETTINGS
export async function getAppearanceSettings(userId: string) {
  const supabase = createClient()
  return await supabase.from('appearance_settings').select('*').eq('user_id', userId).single()
}

export async function createAppearanceSettings(userId: string, settings: Partial<AppearanceSettings>) {
  const supabase = createClient()
  return await supabase.from('appearance_settings').insert({ user_id: userId, ...settings }).select().single()
}

export async function updateAppearanceSettings(userId: string, updates: Partial<AppearanceSettings>) {
  const supabase = createClient()
  return await supabase.from('appearance_settings').update(updates).eq('user_id', userId).select().single()
}

export async function updateTheme(userId: string, theme: ThemeMode) {
  const supabase = createClient()
  return await supabase.from('appearance_settings').update({ theme }).eq('user_id', userId).select().single()
}

export async function updateAccentColor(userId: string, accentColor: string) {
  const supabase = createClient()
  return await supabase.from('appearance_settings').update({ accent_color: accentColor }).eq('user_id', userId).select().single()
}

export async function toggleCompactMode(userId: string, enabled: boolean) {
  const supabase = createClient()
  return await supabase.from('appearance_settings').update({ compact_mode: enabled }).eq('user_id', userId).select().single()
}

export async function toggleAnimations(userId: string, enabled: boolean) {
  const supabase = createClient()
  return await supabase.from('appearance_settings').update({ animations: enabled }).eq('user_id', userId).select().single()
}

export async function pinItem(userId: string, itemId: string) {
  const supabase = createClient()
  const { data: settings } = await supabase.from('appearance_settings').select('pinned_items').eq('user_id', userId).single()
  if (!settings) return { data: null, error: new Error('Appearance settings not found') }

  const pinnedItems = [...(settings.pinned_items || []), itemId]
  return await supabase.from('appearance_settings').update({ pinned_items: pinnedItems }).eq('user_id', userId).select().single()
}

export async function unpinItem(userId: string, itemId: string) {
  const supabase = createClient()
  const { data: settings } = await supabase.from('appearance_settings').select('pinned_items').eq('user_id', userId).single()
  if (!settings) return { data: null, error: new Error('Appearance settings not found') }

  const pinnedItems = (settings.pinned_items || []).filter(id => id !== itemId)
  return await supabase.from('appearance_settings').update({ pinned_items: pinnedItems }).eq('user_id', userId).select().single()
}

// ALL SETTINGS
export async function getAllUserSettings(userId: string) {
  const supabase = createClient()
  const [profileResult, notificationsResult, securityResult, appearanceResult] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('user_id', userId).single(),
    supabase.from('notification_settings').select('*').eq('user_id', userId).single(),
    supabase.from('security_settings').select('*').eq('user_id', userId).single(),
    supabase.from('appearance_settings').select('*').eq('user_id', userId).single()
  ])

  return {
    data: {
      profile: profileResult.data,
      notifications: notificationsResult.data,
      security: securityResult.data,
      appearance: appearanceResult.data
    },
    error: profileResult.error || notificationsResult.error || securityResult.error || appearanceResult.error
  }
}

export async function resetAllSettings(userId: string) {
  const supabase = createClient()

  const [profileResult, notificationsResult, securityResult, appearanceResult] = await Promise.all([
    supabase.from('user_profiles').update({
      skills: [],
      languages: [],
      portfolio_items: [],
      profile_visibility: 'public',
      show_email: false,
      show_phone: false
    }).eq('user_id', userId),
    supabase.from('notification_settings').update({
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false,
      in_app_notifications: true,
      project_updates: true,
      client_messages: true,
      team_mentions: true,
      task_assignments: true,
      deadline_reminders: true,
      payment_alerts: true,
      invoice_reminders: true,
      payment_confirmations: true,
      marketing_emails: false,
      product_updates: true,
      weekly_digest: true,
      monthly_reports: true,
      digest_frequency: 'weekly',
      quiet_hours_enabled: false
    }).eq('user_id', userId),
    supabase.from('security_settings').update({
      two_factor_auth: false,
      biometric_auth: false,
      session_timeout: '24h',
      remember_me_enabled: true,
      concurrent_sessions_limit: 5,
      login_alerts: true,
      login_alerts_email: true,
      suspicious_activity_alerts: true,
      new_device_alerts: true,
      password_required: true
    }).eq('user_id', userId),
    supabase.from('appearance_settings').update({
      theme: 'system',
      accent_color: '#8B5CF6',
      language: 'en',
      timezone: 'UTC',
      date_format: 'MM/DD/YYYY',
      time_format: '12h',
      currency: 'USD',
      compact_mode: false,
      animations: true,
      reduced_motion: false,
      high_contrast: false,
      font_size: 'medium',
      sidebar_collapsed: false,
      pinned_items: []
    }).eq('user_id', userId)
  ])

  return {
    data: { success: true },
    error: profileResult.error || notificationsResult.error || securityResult.error || appearanceResult.error
  }
}
