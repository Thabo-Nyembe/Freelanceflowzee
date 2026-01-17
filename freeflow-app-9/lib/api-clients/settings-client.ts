/**
 * Settings API Client
 *
 * Provides typed API methods for user settings, preferences, and account management
 * Integrates with Supabase for persistent storage
 *
 * Features:
 * - User profile management
 * - Notification preferences
 * - Appearance/theme settings
 * - Security settings (2FA, API keys)
 * - Privacy settings
 * - Integration settings
 * - Billing preferences
 */

import { createClient } from '@/lib/supabase/client'
import { BaseApiClient, type ApiResponse } from './base-client'

// ============================================================================
// Types
// ============================================================================

export interface UserSettings {
  id: string
  user_id: string

  // Profile
  first_name: string | null
  last_name: string | null
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  cover_image_url: string | null
  phone: string | null
  job_title: string | null
  company: string | null
  website: string | null
  location: string | null

  // Regional
  timezone: string
  locale: string
  language: string
  date_format: string
  time_format: '12h' | '24h'
  currency: string
  first_day_of_week: 0 | 1 | 6 // Sunday, Monday, Saturday

  // Notifications
  email_notifications: boolean
  push_notifications: boolean
  desktop_notifications: boolean
  mobile_notifications: boolean
  marketing_emails: boolean
  weekly_digest: boolean
  daily_summary: boolean
  mention_notifications: boolean
  task_reminders: boolean
  deadline_alerts: boolean
  invoice_notifications: boolean
  team_activity_notifications: boolean
  notification_sound: boolean
  notification_sound_type: string | null
  quiet_hours_enabled: boolean
  quiet_hours_start: string | null
  quiet_hours_end: string | null

  // Appearance
  theme: 'light' | 'dark' | 'system'
  accent_color: string
  sidebar_collapsed: boolean
  compact_mode: boolean
  high_contrast: boolean
  reduce_motion: boolean
  font_size: 'small' | 'medium' | 'large'
  custom_css: string | null

  // Privacy
  profile_visibility: 'public' | 'team' | 'private'
  show_online_status: boolean
  show_activity_status: boolean
  allow_direct_messages: boolean
  allow_email_search: boolean
  data_collection_consent: boolean
  analytics_enabled: boolean

  // Security
  two_factor_enabled: boolean
  two_factor_method: 'authenticator' | 'sms' | 'email' | null
  two_factor_backup_codes: string[]
  security_questions: SecurityQuestion[]
  trusted_devices: TrustedDevice[]
  login_alerts: boolean
  session_timeout_minutes: number
  require_password_change_days: number | null

  // API
  api_key: string | null
  api_key_created_at: string | null
  api_rate_limit: number
  api_calls_this_month: number
  webhook_url: string | null
  webhook_secret: string | null
  webhook_events: string[]

  // Integrations
  integrations: IntegrationSettings
  connected_accounts: ConnectedAccount[]

  // Storage & Limits
  storage_used_bytes: number
  storage_limit_bytes: number
  project_limit: number | null
  team_member_limit: number | null

  // Billing
  billing_email: string | null
  billing_address: BillingAddress | null
  tax_id: string | null
  auto_billing: boolean
  invoice_footer: string | null

  // Metadata
  onboarding_completed: boolean
  onboarding_step: number
  last_password_change: string | null
  last_login_at: string | null
  last_active_at: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface SecurityQuestion {
  question: string
  answer_hash: string
}

export interface TrustedDevice {
  id: string
  device_name: string
  device_type: 'desktop' | 'mobile' | 'tablet'
  browser: string | null
  os: string | null
  ip_address: string
  location: string | null
  last_used_at: string
  created_at: string
}

export interface IntegrationSettings {
  google_calendar?: boolean
  outlook?: boolean
  slack?: boolean
  discord?: boolean
  github?: boolean
  jira?: boolean
  asana?: boolean
  notion?: boolean
  trello?: boolean
  stripe?: boolean
  quickbooks?: boolean
  zapier?: boolean
}

export interface ConnectedAccount {
  id: string
  provider: string
  provider_account_id: string
  email: string | null
  name: string | null
  avatar_url: string | null
  scopes: string[]
  connected_at: string
  last_used_at: string | null
}

export interface BillingAddress {
  line1: string
  line2: string | null
  city: string
  state: string | null
  postal_code: string
  country: string
}

export interface UpdateProfileData {
  first_name?: string
  last_name?: string
  display_name?: string
  bio?: string
  avatar_url?: string
  cover_image_url?: string
  phone?: string
  job_title?: string
  company?: string
  website?: string
  location?: string
}

export interface UpdateNotificationSettings {
  email_notifications?: boolean
  push_notifications?: boolean
  desktop_notifications?: boolean
  mobile_notifications?: boolean
  marketing_emails?: boolean
  weekly_digest?: boolean
  daily_summary?: boolean
  mention_notifications?: boolean
  task_reminders?: boolean
  deadline_alerts?: boolean
  invoice_notifications?: boolean
  team_activity_notifications?: boolean
  notification_sound?: boolean
  notification_sound_type?: string
  quiet_hours_enabled?: boolean
  quiet_hours_start?: string
  quiet_hours_end?: string
}

export interface UpdateAppearanceSettings {
  theme?: 'light' | 'dark' | 'system'
  accent_color?: string
  sidebar_collapsed?: boolean
  compact_mode?: boolean
  high_contrast?: boolean
  reduce_motion?: boolean
  font_size?: 'small' | 'medium' | 'large'
  custom_css?: string
}

export interface UpdateRegionalSettings {
  timezone?: string
  locale?: string
  language?: string
  date_format?: string
  time_format?: '12h' | '24h'
  currency?: string
  first_day_of_week?: 0 | 1 | 6
}

export interface UpdatePrivacySettings {
  profile_visibility?: 'public' | 'team' | 'private'
  show_online_status?: boolean
  show_activity_status?: boolean
  allow_direct_messages?: boolean
  allow_email_search?: boolean
  data_collection_consent?: boolean
  analytics_enabled?: boolean
}

export interface UpdateSecuritySettings {
  two_factor_enabled?: boolean
  two_factor_method?: 'authenticator' | 'sms' | 'email' | null
  login_alerts?: boolean
  session_timeout_minutes?: number
  require_password_change_days?: number | null
}

export interface UpdateBillingSettings {
  billing_email?: string
  billing_address?: BillingAddress
  tax_id?: string
  auto_billing?: boolean
  invoice_footer?: string
}

export interface SettingsStats {
  profile_completeness: number
  security_score: number
  storage_used_percentage: number
  storage_used_gb: number
  storage_limit_gb: number
  api_calls_this_month: number
  api_calls_remaining: number
  connected_integrations: number
  trusted_devices_count: number
  days_since_password_change: number | null
  account_age_days: number
}

// ============================================================================
// API Client
// ============================================================================

class SettingsClient extends BaseApiClient {
  private supabase = createClient()

  /**
   * Get user settings
   */
  async getSettings(): Promise<ApiResponse<UserSettings>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await this.supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      // Create default settings if none exist
      if (!data) {
        const { data: newData, error: createError } = await this.supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            locale: navigator.language,
            language: navigator.language.split('-')[0],
            theme: 'system',
            email_notifications: true,
            push_notifications: true
          })
          .select()
          .single()

        if (createError) throw createError
        return { success: true, data: newData }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch settings'
      }
    }
  }

  /**
   * Update user settings (generic)
   */
  async updateSettings(updates: Partial<UserSettings>): Promise<ApiResponse<UserSettings>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await this.supabase
        .from('user_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Failed to update settings:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update settings'
      }
    }
  }

  /**
   * Update profile settings
   */
  async updateProfile(profile: UpdateProfileData): Promise<ApiResponse<UserSettings>> {
    return this.updateSettings(profile)
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(
    notifications: UpdateNotificationSettings
  ): Promise<ApiResponse<UserSettings>> {
    return this.updateSettings(notifications)
  }

  /**
   * Update appearance settings
   */
  async updateAppearanceSettings(
    appearance: UpdateAppearanceSettings
  ): Promise<ApiResponse<UserSettings>> {
    return this.updateSettings(appearance)
  }

  /**
   * Update regional settings
   */
  async updateRegionalSettings(
    regional: UpdateRegionalSettings
  ): Promise<ApiResponse<UserSettings>> {
    return this.updateSettings(regional)
  }

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(
    privacy: UpdatePrivacySettings
  ): Promise<ApiResponse<UserSettings>> {
    return this.updateSettings(privacy)
  }

  /**
   * Update security settings
   */
  async updateSecuritySettings(
    security: UpdateSecuritySettings
  ): Promise<ApiResponse<UserSettings>> {
    return this.updateSettings(security)
  }

  /**
   * Update billing settings
   */
  async updateBillingSettings(
    billing: UpdateBillingSettings
  ): Promise<ApiResponse<UserSettings>> {
    return this.updateSettings(billing)
  }

  /**
   * Generate new API key
   */
  async generateApiKey(): Promise<ApiResponse<{ api_key: string }>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const newApiKey = `kazi_${crypto.randomUUID().replace(/-/g, '')}${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`

      const { error } = await this.supabase
        .from('user_settings')
        .update({
          api_key: newApiKey,
          api_key_created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) throw error

      return { success: true, data: { api_key: newApiKey } }
    } catch (error) {
      console.error('Failed to generate API key:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate API key'
      }
    }
  }

  /**
   * Revoke API key
   */
  async revokeApiKey(): Promise<ApiResponse<void>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await this.supabase
        .from('user_settings')
        .update({
          api_key: null,
          api_key_created_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Failed to revoke API key:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to revoke API key'
      }
    }
  }

  /**
   * Update webhook configuration
   */
  async updateWebhook(
    webhook: { url?: string; secret?: string; events?: string[] }
  ): Promise<ApiResponse<UserSettings>> {
    const updates: Partial<UserSettings> = {}

    if (webhook.url !== undefined) updates.webhook_url = webhook.url
    if (webhook.secret !== undefined) updates.webhook_secret = webhook.secret
    if (webhook.events !== undefined) updates.webhook_events = webhook.events

    return this.updateSettings(updates)
  }

  /**
   * Enable two-factor authentication
   */
  async enable2FA(
    method: 'authenticator' | 'sms' | 'email'
  ): Promise<ApiResponse<{ backup_codes: string[] }>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Generate backup codes
      const backupCodes = Array.from({ length: 10 }, () =>
        crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()
      )

      const { error } = await this.supabase
        .from('user_settings')
        .update({
          two_factor_enabled: true,
          two_factor_method: method,
          two_factor_backup_codes: backupCodes,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) throw error

      return { success: true, data: { backup_codes: backupCodes } }
    } catch (error) {
      console.error('Failed to enable 2FA:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to enable 2FA'
      }
    }
  }

  /**
   * Disable two-factor authentication
   */
  async disable2FA(): Promise<ApiResponse<void>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await this.supabase
        .from('user_settings')
        .update({
          two_factor_enabled: false,
          two_factor_method: null,
          two_factor_backup_codes: [],
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Failed to disable 2FA:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to disable 2FA'
      }
    }
  }

  /**
   * Get trusted devices
   */
  async getTrustedDevices(): Promise<ApiResponse<TrustedDevice[]>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await this.supabase
        .from('user_settings')
        .select('trusted_devices')
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      return { success: true, data: data?.trusted_devices || [] }
    } catch (error) {
      console.error('Failed to fetch trusted devices:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch trusted devices'
      }
    }
  }

  /**
   * Remove trusted device
   */
  async removeTrustedDevice(deviceId: string): Promise<ApiResponse<void>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get current devices
      const { data: settings, error: fetchError } = await this.supabase
        .from('user_settings')
        .select('trusted_devices')
        .eq('user_id', user.id)
        .single()

      if (fetchError) throw fetchError

      const updatedDevices = (settings?.trusted_devices || []).filter(
        (d: TrustedDevice) => d.id !== deviceId
      )

      const { error } = await this.supabase
        .from('user_settings')
        .update({
          trusted_devices: updatedDevices,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Failed to remove trusted device:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove trusted device'
      }
    }
  }

  /**
   * Get connected accounts
   */
  async getConnectedAccounts(): Promise<ApiResponse<ConnectedAccount[]>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await this.supabase
        .from('user_settings')
        .select('connected_accounts')
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      return { success: true, data: data?.connected_accounts || [] }
    } catch (error) {
      console.error('Failed to fetch connected accounts:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch connected accounts'
      }
    }
  }

  /**
   * Disconnect account
   */
  async disconnectAccount(accountId: string): Promise<ApiResponse<void>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get current accounts
      const { data: settings, error: fetchError } = await this.supabase
        .from('user_settings')
        .select('connected_accounts')
        .eq('user_id', user.id)
        .single()

      if (fetchError) throw fetchError

      const updatedAccounts = (settings?.connected_accounts || []).filter(
        (a: ConnectedAccount) => a.id !== accountId
      )

      const { error } = await this.supabase
        .from('user_settings')
        .update({
          connected_accounts: updatedAccounts,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Failed to disconnect account:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to disconnect account'
      }
    }
  }

  /**
   * Update integrations
   */
  async updateIntegrations(
    integrations: Partial<IntegrationSettings>
  ): Promise<ApiResponse<UserSettings>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get current integrations
      const { data: settings, error: fetchError } = await this.supabase
        .from('user_settings')
        .select('integrations')
        .eq('user_id', user.id)
        .single()

      if (fetchError) throw fetchError

      const updatedIntegrations = {
        ...(settings?.integrations || {}),
        ...integrations
      }

      return this.updateSettings({ integrations: updatedIntegrations })
    } catch (error) {
      console.error('Failed to update integrations:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update integrations'
      }
    }
  }

  /**
   * Get settings statistics
   */
  async getSettingsStats(): Promise<ApiResponse<SettingsStats>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: settings, error } = await this.supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      const stats: SettingsStats = {
        profile_completeness: this.calculateProfileCompleteness(settings),
        security_score: this.calculateSecurityScore(settings),
        storage_used_percentage: Math.round(
          (settings.storage_used_bytes / settings.storage_limit_bytes) * 100
        ),
        storage_used_gb: Math.round(
          (settings.storage_used_bytes / (1024 * 1024 * 1024)) * 100
        ) / 100,
        storage_limit_gb: Math.round(
          settings.storage_limit_bytes / (1024 * 1024 * 1024)
        ),
        api_calls_this_month: settings.api_calls_this_month || 0,
        api_calls_remaining: Math.max(
          0,
          (settings.api_rate_limit || 1000) - (settings.api_calls_this_month || 0)
        ),
        connected_integrations: Object.values(settings.integrations || {})
          .filter(Boolean).length,
        trusted_devices_count: (settings.trusted_devices || []).length,
        days_since_password_change: settings.last_password_change
          ? Math.floor(
              (Date.now() - new Date(settings.last_password_change).getTime()) /
              (1000 * 60 * 60 * 24)
            )
          : null,
        account_age_days: Math.floor(
          (Date.now() - new Date(settings.created_at).getTime()) /
          (1000 * 60 * 60 * 24)
        )
      }

      return { success: true, data: stats }
    } catch (error) {
      console.error('Failed to fetch settings stats:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch settings stats'
      }
    }
  }

  /**
   * Export user data (GDPR compliance)
   */
  async exportUserData(): Promise<ApiResponse<{ download_url: string }>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // This would typically trigger a background job to compile user data
      // For now, we'll return a placeholder
      const { data, error } = await this.supabase
        .functions.invoke('export-user-data', {
          body: { user_id: user.id }
        })

      if (error) throw error

      return { success: true, data: { download_url: data.download_url } }
    } catch (error) {
      console.error('Failed to export user data:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export user data'
      }
    }
  }

  /**
   * Delete account (GDPR compliance)
   */
  async deleteAccount(password: string): Promise<ApiResponse<void>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Re-authenticate user
      const { error: authError } = await this.supabase.auth.signInWithPassword({
        email: user.email || '',
        password
      })

      if (authError) throw new Error('Invalid password')

      // Trigger account deletion
      const { error } = await this.supabase.rpc('delete_user_account', {
        user_id: user.id
      })

      if (error) throw error

      // Sign out
      await this.supabase.auth.signOut()

      return { success: true }
    } catch (error) {
      console.error('Failed to delete account:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete account'
      }
    }
  }

  /**
   * Calculate profile completeness
   */
  private calculateProfileCompleteness(settings: UserSettings): number {
    const fields = [
      'first_name', 'last_name', 'display_name', 'bio',
      'avatar_url', 'timezone', 'phone', 'job_title', 'location'
    ]
    const completed = fields.filter(f =>
      settings[f as keyof UserSettings]
    ).length
    return Math.round((completed / fields.length) * 100)
  }

  /**
   * Calculate security score
   */
  private calculateSecurityScore(settings: UserSettings): number {
    let score = 30 // Base score

    if (settings.two_factor_enabled) score += 30
    if (settings.security_questions?.length > 0) score += 15
    if (settings.login_alerts) score += 10
    if (settings.session_timeout_minutes && settings.session_timeout_minutes <= 60) score += 5
    if (settings.last_password_change) {
      const daysSinceChange = Math.floor(
        (Date.now() - new Date(settings.last_password_change).getTime()) /
        (1000 * 60 * 60 * 24)
      )
      if (daysSinceChange < 90) score += 10
    }

    return Math.min(score, 100)
  }
}

// Export singleton instance
export const settingsClient = new SettingsClient()
