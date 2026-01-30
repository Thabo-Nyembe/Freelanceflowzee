'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// Demo mode detection
function isDemoModeEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('demo') === 'true') return true
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'demo_mode' && value === 'true') return true
  }
  return false
}

// ============================================================================
// TYPES
// ============================================================================

export interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  inAppNotifications: boolean
  projectUpdates: boolean
  clientMessages: boolean
  teamMentions: boolean
  taskAssignments: boolean
  deadlineReminders: boolean
  paymentAlerts: boolean
  invoiceReminders: boolean
  marketingEmails: boolean
  productUpdates: boolean
  weeklyDigest: boolean
  monthlyReports: boolean
  digestFrequency: 'daily' | 'weekly' | 'monthly'
  quietHoursEnabled: boolean
  quietHoursStart?: string
  quietHoursEnd?: string
}

export interface SecuritySettings {
  twoFactorAuth: boolean
  twoFactorMethod?: 'authenticator' | 'sms' | 'email'
  biometricAuth: boolean
  sessionTimeout: string
  rememberMeEnabled: boolean
  concurrentSessionsLimit: number
  loginAlerts: boolean
  loginAlertsEmail: boolean
  suspiciousActivityAlerts: boolean
  newDeviceAlerts: boolean
  passwordRequired: boolean
  passwordLastChanged?: string
  passwordExpiryDays?: number
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system'
  accentColor: string
  language: string
  timezone: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  currency: string
  compactMode: boolean
  animations: boolean
  reducedMotion: boolean
  highContrast: boolean
  fontSize: 'small' | 'medium' | 'large'
  sidebarCollapsed: boolean
  dashboardLayout: Record<string, any>
  pinnedItems: string[]
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'contacts'
  showEmail: boolean
  showPhone: boolean
  activityStatus: boolean
  onlineStatus: boolean
  readReceipts: boolean
  dataCollection: 'full' | 'minimal' | 'none'
  analyticsTracking: boolean
}

export interface ApiKey {
  id: string
  name: string
  prefix: string
  permissions: string[]
  lastUsedAt?: string
  createdAt: string
  expiresAt?: string
}

export interface Session {
  id: string
  deviceType: string
  browser: string
  os: string
  ipAddress: string
  location?: string
  lastActiveAt: string
  createdAt: string
  isCurrent?: boolean
}

export interface AllSettings {
  notifications: NotificationSettings
  security: SecuritySettings
  appearance: AppearanceSettings
  privacy: PrivacySettings
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockNotifications: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  inAppNotifications: true,
  projectUpdates: true,
  clientMessages: true,
  teamMentions: true,
  taskAssignments: true,
  deadlineReminders: true,
  paymentAlerts: true,
  invoiceReminders: true,
  marketingEmails: false,
  productUpdates: true,
  weeklyDigest: true,
  monthlyReports: true,
  digestFrequency: 'weekly',
  quietHoursEnabled: false
}

const mockSecurity: SecuritySettings = {
  twoFactorAuth: false,
  biometricAuth: false,
  sessionTimeout: '24h',
  rememberMeEnabled: true,
  concurrentSessionsLimit: 5,
  loginAlerts: true,
  loginAlertsEmail: true,
  suspiciousActivityAlerts: true,
  newDeviceAlerts: true,
  passwordRequired: true
}

const mockAppearance: AppearanceSettings = {
  theme: 'system',
  accentColor: '#8B5CF6',
  language: 'en',
  timezone: 'America/Los_Angeles',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  currency: 'USD',
  compactMode: false,
  animations: true,
  reducedMotion: false,
  highContrast: false,
  fontSize: 'medium',
  sidebarCollapsed: false,
  dashboardLayout: {},
  pinnedItems: []
}

const mockPrivacy: PrivacySettings = {
  profileVisibility: 'public',
  showEmail: false,
  showPhone: false,
  activityStatus: true,
  onlineStatus: true,
  readReceipts: true,
  dataCollection: 'minimal',
  analyticsTracking: true
}

const mockApiKeys: ApiKey[] = [
  {
    id: 'key-1',
    name: 'Production API Key',
    prefix: 'kazi_prod_',
    permissions: ['read', 'write'],
    lastUsedAt: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: 'key-2',
    name: 'Development Key',
    prefix: 'kazi_dev_',
    permissions: ['read'],
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
  }
]

const mockSessions: Session[] = [
  {
    id: 'session-1',
    deviceType: 'Desktop',
    browser: 'Chrome 120',
    os: 'macOS Sonoma',
    ipAddress: '192.168.1.100',
    location: 'San Francisco, CA',
    lastActiveAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    isCurrent: true
  },
  {
    id: 'session-2',
    deviceType: 'Mobile',
    browser: 'Safari',
    os: 'iOS 17',
    ipAddress: '192.168.1.101',
    location: 'San Francisco, CA',
    lastActiveAt: new Date(Date.now() - 7200000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  }
]

// ============================================================================
// HOOK
// ============================================================================

interface UseSettingsOptions {
  
  autoSave?: boolean
  autoSaveDelay?: number
}

export function useSettings(options: UseSettingsOptions = {}) {
  const {

    autoSave = false,
    autoSaveDelay = 1000
  } = options

  const isDemo = isDemoModeEnabled()

  // State
  const [notifications, setNotifications] = useState<NotificationSettings>(mockNotifications)
  const [security, setSecurity] = useState<SecuritySettings>(mockSecurity)
  const [appearance, setAppearance] = useState<AppearanceSettings>(mockAppearance)
  const [privacy, setPrivacy] = useState<PrivacySettings>(mockPrivacy)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(isDemo ? mockApiKeys : [])
  const [sessions, setSessions] = useState<Session[]>(isDemo ? mockSessions : [])
  const [isLoading, setIsLoading] = useState(!isDemo)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({})
  const [saveTimer, setSaveTimer] = useState<NodeJS.Timeout | null>(null)

  // Fetch all settings
  const fetchSettings = useCallback(async () => {
    // In demo mode, use mock data
    if (isDemo) {
      setApiKeys(mockApiKeys)
      setIsLoading(false)
      return mockApiKeys
    }

    try {
      const response = await fetch('/api/settings?category=api-keys')
      const result = await response.json()

      if (result.success && result.apiKeys) {
        setApiKeys(result.apiKeys)
        return result.apiKeys
      }
      setApiKeys([])
      return []
    } catch (err) {
      console.error('Error fetching API keys:', err)
      setApiKeys([])
      return []
    }
  }, [isDemo])

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    // In demo mode, use mock data
    if (isDemo) {
      setSessions(mockSessions)
      return mockSessions
    }

    try {
      const response = await fetch('/api/settings?category=sessions')
      const result = await response.json()

      if (result.success && result.sessions) {
        setSessions(result.sessions)
        return result.sessions
      }
      setSessions(mockSessions)
      return []
    } catch (err) {
      console.error('Error fetching sessions:', err)
      setSessions(mockSessions)
      return []
    }
  }, [isDemo])

  // Fetch API Keys
  const fetchApiKeys = useCallback(async () => {
    // In demo mode, use mock data
    if (isDemo) {
      setApiKeys(mockApiKeys)
      return mockApiKeys
    }

    try {
      const response = await fetch('/api/settings?category=api-keys')
      const result = await response.json()

      if (result.success && result.apiKeys) {
        setApiKeys(result.apiKeys)
        return result.apiKeys
      }
      setApiKeys([])
      return []
    } catch (err) {
      console.error('Error fetching API keys:', err)
      setApiKeys([])
      return []
    }
  }, [isDemo])

  // Transform helpers
  const transformNotifications = (data: any): NotificationSettings => ({
    emailNotifications: data.email_notifications ?? data.emailNotifications ?? true,
    pushNotifications: data.push_notifications ?? data.pushNotifications ?? true,
    smsNotifications: data.sms_notifications ?? data.smsNotifications ?? false,
    inAppNotifications: data.in_app_notifications ?? data.inAppNotifications ?? true,
    projectUpdates: data.project_updates ?? data.projectUpdates ?? true,
    clientMessages: data.client_messages ?? data.clientMessages ?? true,
    teamMentions: data.team_mentions ?? data.teamMentions ?? true,
    taskAssignments: data.task_assignments ?? data.taskAssignments ?? true,
    deadlineReminders: data.deadline_reminders ?? data.deadlineReminders ?? true,
    paymentAlerts: data.payment_alerts ?? data.paymentAlerts ?? true,
    invoiceReminders: data.invoice_reminders ?? data.invoiceReminders ?? true,
    marketingEmails: data.marketing_emails ?? data.marketingEmails ?? false,
    productUpdates: data.product_updates ?? data.productUpdates ?? true,
    weeklyDigest: data.weekly_digest ?? data.weeklyDigest ?? true,
    monthlyReports: data.monthly_reports ?? data.monthlyReports ?? true,
    digestFrequency: data.digest_frequency ?? data.digestFrequency ?? 'weekly',
    quietHoursEnabled: data.quiet_hours_enabled ?? data.quietHoursEnabled ?? false,
    quietHoursStart: data.quiet_hours_start ?? data.quietHoursStart,
    quietHoursEnd: data.quiet_hours_end ?? data.quietHoursEnd
  })

  const transformSecurity = (data: any): SecuritySettings => ({
    twoFactorAuth: data.two_factor_auth ?? data.twoFactorAuth ?? false,
    twoFactorMethod: data.two_factor_method ?? data.twoFactorMethod,
    biometricAuth: data.biometric_auth ?? data.biometricAuth ?? false,
    sessionTimeout: data.session_timeout ?? data.sessionTimeout ?? '24h',
    rememberMeEnabled: data.remember_me_enabled ?? data.rememberMeEnabled ?? true,
    concurrentSessionsLimit: data.concurrent_sessions_limit ?? data.concurrentSessionsLimit ?? 5,
    loginAlerts: data.login_alerts ?? data.loginAlerts ?? true,
    loginAlertsEmail: data.login_alerts_email ?? data.loginAlertsEmail ?? true,
    suspiciousActivityAlerts: data.suspicious_activity_alerts ?? data.suspiciousActivityAlerts ?? true,
    newDeviceAlerts: data.new_device_alerts ?? data.newDeviceAlerts ?? true,
    passwordRequired: data.password_required ?? data.passwordRequired ?? true,
    passwordLastChanged: data.password_last_changed ?? data.passwordLastChanged,
    passwordExpiryDays: data.password_expiry_days ?? data.passwordExpiryDays
  })

  const transformAppearance = (data: any): AppearanceSettings => ({
    theme: data.theme ?? 'system',
    accentColor: data.accent_color ?? data.accentColor ?? '#8B5CF6',
    language: data.language ?? 'en',
    timezone: data.timezone ?? 'UTC',
    dateFormat: data.date_format ?? data.dateFormat ?? 'MM/DD/YYYY',
    timeFormat: data.time_format ?? data.timeFormat ?? '12h',
    currency: data.currency ?? 'USD',
    compactMode: data.compact_mode ?? data.compactMode ?? false,
    animations: data.animations ?? true,
    reducedMotion: data.reduced_motion ?? data.reducedMotion ?? false,
    highContrast: data.high_contrast ?? data.highContrast ?? false,
    fontSize: data.font_size ?? data.fontSize ?? 'medium',
    sidebarCollapsed: data.sidebar_collapsed ?? data.sidebarCollapsed ?? false,
    dashboardLayout: data.dashboard_layout ?? data.dashboardLayout ?? {},
    pinnedItems: data.pinned_items ?? data.pinnedItems ?? []
  })

  // Update settings category
  const updateSettings = useCallback(async (category: string, updates: any) => {
    setIsSaving(true)

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, ...updates })
      })

      const result = await response.json()

      if (result.success) {
        // Update local state based on category
        switch (category) {
          case 'notifications':
            setNotifications(prev => ({ ...prev, ...updates }))
            break
          case 'security':
            setSecurity(prev => ({ ...prev, ...updates }))
            break
          case 'appearance':
            setAppearance(prev => ({ ...prev, ...updates }))
            break
          case 'privacy':
            setPrivacy(prev => ({ ...prev, ...updates }))
            break
        }
        return { success: true }
      }

      return { success: false, error: result.error || 'Failed to update settings' }
    } catch (err) {
      console.error('Error updating settings:', err)
      return { success: false, error: 'Failed to update settings' }
    } finally {
      setIsSaving(false)
    }
  }, [])

  // Shorthand update methods
  const updateNotifications = useCallback((updates: Partial<NotificationSettings>) => {
    setNotifications(prev => ({ ...prev, ...updates }))
    if (autoSave) {
      if (saveTimer) clearTimeout(saveTimer)
      const timer = setTimeout(() => updateSettings('notifications', updates), autoSaveDelay)
      setSaveTimer(timer)
    }
    return updateSettings('notifications', updates)
  }, [updateSettings, autoSave, autoSaveDelay, saveTimer])

  const updateSecurity = useCallback((updates: Partial<SecuritySettings>) => {
    setSecurity(prev => ({ ...prev, ...updates }))
    return updateSettings('security', updates)
  }, [updateSettings])

  const updateAppearance = useCallback((updates: Partial<AppearanceSettings>) => {
    setAppearance(prev => ({ ...prev, ...updates }))
    // Apply theme immediately
    if (updates.theme) {
      document.documentElement.classList.remove('light', 'dark')
      if (updates.theme !== 'system') {
        document.documentElement.classList.add(updates.theme)
      }
    }
    return updateSettings('appearance', updates)
  }, [updateSettings])

  const updatePrivacy = useCallback((updates: Partial<PrivacySettings>) => {
    setPrivacy(prev => ({ ...prev, ...updates }))
    return updateSettings('privacy', updates)
  }, [updateSettings])

  // API Key actions
  const generateApiKey = useCallback(async (data: {
    name: string
    permissions: string[]
    expiresAt?: string
  }) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate-api-key', ...data })
      })

      const result = await response.json()
      if (result.success) {
        await fetchApiKeys()
        return { success: true, apiKey: result.apiKey }
      }
      return { success: false, error: result.error }
    } catch (err) {
      console.error('Error generating API key:', err)
      return { success: false, error: 'Failed to generate API key' }
    }
  }, [fetchApiKeys])

  const revokeApiKey = useCallback(async (keyId: string) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revoke-api-key', keyId })
      })

      const result = await response.json()
      if (result.success) {
        setApiKeys(prev => prev.filter(k => k.id !== keyId))
        return { success: true }
      }
      return { success: false, error: result.error }
    } catch (err) {
      console.error('Error revoking API key:', err)
      return { success: false, error: 'Failed to revoke API key' }
    }
  }, [])

  // 2FA actions
  const enable2FA = useCallback(async (method: 'authenticator' | 'sms' | 'email') => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'enable-2fa', method })
      })

      const result = await response.json()
      return result
    } catch (err) {
      console.error('Error enabling 2FA:', err)
      return { success: false, error: 'Failed to enable 2FA' }
    }
  }, [])

  const verify2FA = useCallback(async (code: string) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-2fa', code })
      })

      const result = await response.json()
      if (result.verified) {
        setSecurity(prev => ({ ...prev, twoFactorAuth: true }))
      }
      return result
    } catch (err) {
      console.error('Error verifying 2FA:', err)
      return { success: false, error: 'Failed to verify 2FA' }
    }
  }, [])

  const disable2FA = useCallback(async (code: string) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disable-2fa', code })
      })

      const result = await response.json()
      if (result.success) {
        setSecurity(prev => ({ ...prev, twoFactorAuth: false, twoFactorMethod: undefined }))
      }
      return result
    } catch (err) {
      console.error('Error disabling 2FA:', err)
      return { success: false, error: 'Failed to disable 2FA' }
    }
  }, [])

  // Session actions
  const terminateSession = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'terminate-session', sessionId })
      })

      const result = await response.json()
      if (result.success) {
        setSessions(prev => prev.filter(s => s.id !== sessionId))
      }
      return result
    } catch (err) {
      console.error('Error terminating session:', err)
      return { success: false, error: 'Failed to terminate session' }
    }
  }, [])

  const terminateAllSessions = useCallback(async (exceptCurrent = true) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'terminate-all-sessions', exceptCurrent })
      })

      const result = await response.json()
      if (result.success) {
        if (exceptCurrent) {
          setSessions(prev => prev.filter(s => s.isCurrent))
        } else {
          setSessions([])
        }
      }
      return result
    } catch (err) {
      console.error('Error terminating all sessions:', err)
      return { success: false, error: 'Failed to terminate sessions' }
    }
  }, [])

  // Password change
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change-password', currentPassword, newPassword })
      })

      const result = await response.json()
      if (result.success) {
        setSecurity(prev => ({
          ...prev,
          passwordLastChanged: new Date().toISOString()
        }))
      }
      return result
    } catch (err) {
      console.error('Error changing password:', err)
      return { success: false, error: 'Failed to change password' }
    }
  }, [])

  // Export/Import settings
  const exportSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'export-data', format: 'json' })
      })

      const result = await response.json()
      return result
    } catch (err) {
      console.error('Error exporting settings:', err)
      return { success: false, error: 'Failed to export settings' }
    }
  }, [])

  // Reset to defaults
  const resetToDefaults = useCallback(async (category: string) => {
    setIsSaving(true)

    try {
      const response = await fetch('/api/settings/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, action: 'reset' })
      })

      const result = await response.json()
      if (result.success) {
        switch (category) {
          case 'notifications':
            setNotifications([])
            break
          case 'security':
            setSecurity(mockSecurity)
            break
          case 'appearance':
            setAppearance(mockAppearance)
            break
          case 'privacy':
            setPrivacy(mockPrivacy)
            break
        }
        return { success: true }
      }
      return { success: false, error: result.error }
    } catch (err) {
      console.error('Error resetting settings:', err)
      return { success: false, error: 'Failed to reset settings' }
    } finally {
      setIsSaving(false)
    }
  }, [])

  // Refresh all
  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    await Promise.all([fetchSettings(), fetchApiKeys(), fetchSessions()])
  }, [fetchSettings, fetchApiKeys, fetchSessions])

  // Initial load
  useEffect(() => {
    refresh()
  }, [refresh])

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimer) clearTimeout(saveTimer)
    }
  }, [saveTimer])

  // Computed values
  const allSettings = useMemo<AllSettings>(() => ({
    notifications,
    security,
    appearance,
    privacy
  }), [notifications, security, appearance, privacy])

  const hasUnsavedChanges = useMemo(() =>
    Object.keys(pendingChanges).length > 0,
  [pendingChanges])

  const activeSessionsCount = useMemo(() =>
    sessions.length,
  [sessions])

  return {
    // Data
    notifications,
    security,
    appearance,
    privacy,
    apiKeys,
    sessions,
    allSettings,

    // State
    isLoading,
    isSaving,
    error,
    hasUnsavedChanges,
    activeSessionsCount,

    // Fetch methods
    refresh,
    fetchSettings,
    fetchApiKeys,
    fetchSessions,

    // Update methods
    updateSettings,
    updateNotifications,
    updateSecurity,
    updateAppearance,
    updatePrivacy,
    resetToDefaults,

    // API Key actions
    generateApiKey,
    revokeApiKey,

    // 2FA actions
    enable2FA,
    verify2FA,
    disable2FA,

    // Session actions
    terminateSession,
    terminateAllSessions,

    // Password
    changePassword,

    // Export
    exportSettings,
  }
}

export default useSettings
