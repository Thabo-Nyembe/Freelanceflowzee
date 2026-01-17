/**
 * Settings React Hooks (TanStack Query)
 *
 * Production-ready hooks for user settings, preferences, and account management
 * Uses TanStack Query for caching, loading states, and error handling
 *
 * Caching Strategy:
 * - User settings: Infinity staleTime (static until user changes)
 * - Settings stats: 5 min staleTime (computed)
 * - Trusted devices: 5 min staleTime (security)
 * - Connected accounts: 5 min staleTime (user data)
 *
 * Features:
 * - Full profile management
 * - Notification preferences
 * - Appearance/theme settings
 * - Security settings (2FA, API keys)
 * - Privacy settings
 * - Integration settings
 * - Optimistic updates for all mutations
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  settingsClient,
  UserSettings,
  TrustedDevice,
  ConnectedAccount,
  UpdateProfileData,
  UpdateNotificationSettings,
  UpdateAppearanceSettings,
  UpdateRegionalSettings,
  UpdatePrivacySettings,
  UpdateSecuritySettings,
  UpdateBillingSettings,
  IntegrationSettings,
  SettingsStats
} from './settings-client'
import { STALE_TIMES, staticQueryOptions, userDataQueryOptions } from '@/lib/query-client'

// ============================================================================
// Query Keys
// ============================================================================

export const settingsQueryKeys = {
  all: ['settings'] as const,
  user: () => [...settingsQueryKeys.all, 'user'] as const,
  stats: () => [...settingsQueryKeys.all, 'stats'] as const,
  trustedDevices: () => [...settingsQueryKeys.all, 'trusted-devices'] as const,
  connectedAccounts: () => [...settingsQueryKeys.all, 'connected-accounts'] as const,
}

// ============================================================================
// Main Settings Hooks
// ============================================================================

/**
 * Get user settings
 */
export function useUserSettings(
  options?: Omit<UseQueryOptions<UserSettings>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: settingsQueryKeys.user(),
    queryFn: async () => {
      const response = await settingsClient.getSettings()
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch settings')
      }
      return response.data
    },
    staleTime: STALE_TIMES.STATIC,
    ...staticQueryOptions,
    ...options
  })
}

/**
 * Update user settings (generic)
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: Partial<UserSettings>) => {
      const response = await settingsClient.updateSettings(updates)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update settings')
      }
      return response.data
    },
    onMutate: async (updates) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: settingsQueryKeys.user() })

      const previousSettings = queryClient.getQueryData<UserSettings>(settingsQueryKeys.user())

      queryClient.setQueryData(settingsQueryKeys.user(), (old: UserSettings | undefined) => {
        if (!old) return old
        return { ...old, ...updates, updated_at: new Date().toISOString() }
      })

      return { previousSettings }
    },
    onError: (error: Error, _variables, context) => {
      // Rollback on error
      if (context?.previousSettings) {
        queryClient.setQueryData(settingsQueryKeys.user(), context.previousSettings)
      }
      toast.error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.user() })
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.stats() })

      toast.success('Settings updated')
    }
  })
}

// ============================================================================
// Profile Hooks
// ============================================================================

/**
 * Update profile settings
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (profile: UpdateProfileData) => {
      const response = await settingsClient.updateProfile(profile)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update profile')
      }
      return response.data
    },
    onMutate: async (profile) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: settingsQueryKeys.user() })

      const previousSettings = queryClient.getQueryData<UserSettings>(settingsQueryKeys.user())

      queryClient.setQueryData(settingsQueryKeys.user(), (old: UserSettings | undefined) => {
        if (!old) return old
        return { ...old, ...profile, updated_at: new Date().toISOString() }
      })

      return { previousSettings }
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(settingsQueryKeys.user(), context.previousSettings)
      }
      toast.error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.user() })
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.stats() })

      toast.success('Profile updated')
    }
  })
}

// ============================================================================
// Notification Hooks
// ============================================================================

/**
 * Update notification settings
 */
export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notifications: UpdateNotificationSettings) => {
      const response = await settingsClient.updateNotificationSettings(notifications)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update notification settings')
      }
      return response.data
    },
    onMutate: async (notifications) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: settingsQueryKeys.user() })

      const previousSettings = queryClient.getQueryData<UserSettings>(settingsQueryKeys.user())

      queryClient.setQueryData(settingsQueryKeys.user(), (old: UserSettings | undefined) => {
        if (!old) return old
        return { ...old, ...notifications, updated_at: new Date().toISOString() }
      })

      return { previousSettings }
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(settingsQueryKeys.user(), context.previousSettings)
      }
      toast.error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.user() })

      toast.success('Notification preferences updated')
    }
  })
}

// ============================================================================
// Appearance Hooks
// ============================================================================

/**
 * Update appearance settings
 */
export function useUpdateAppearanceSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (appearance: UpdateAppearanceSettings) => {
      const response = await settingsClient.updateAppearanceSettings(appearance)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update appearance settings')
      }
      return response.data
    },
    onMutate: async (appearance) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: settingsQueryKeys.user() })

      const previousSettings = queryClient.getQueryData<UserSettings>(settingsQueryKeys.user())

      queryClient.setQueryData(settingsQueryKeys.user(), (old: UserSettings | undefined) => {
        if (!old) return old
        return { ...old, ...appearance, updated_at: new Date().toISOString() }
      })

      return { previousSettings }
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(settingsQueryKeys.user(), context.previousSettings)
      }
      toast.error(error.message)
    },
    onSuccess: (settings) => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.user() })

      // Apply theme immediately
      if (settings.theme) {
        document.documentElement.classList.remove('light', 'dark')
        if (settings.theme !== 'system') {
          document.documentElement.classList.add(settings.theme)
        }
      }

      toast.success('Appearance updated')
    }
  })
}

// ============================================================================
// Regional Hooks
// ============================================================================

/**
 * Update regional settings
 */
export function useUpdateRegionalSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (regional: UpdateRegionalSettings) => {
      const response = await settingsClient.updateRegionalSettings(regional)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update regional settings')
      }
      return response.data
    },
    onMutate: async (regional) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: settingsQueryKeys.user() })

      const previousSettings = queryClient.getQueryData<UserSettings>(settingsQueryKeys.user())

      queryClient.setQueryData(settingsQueryKeys.user(), (old: UserSettings | undefined) => {
        if (!old) return old
        return { ...old, ...regional, updated_at: new Date().toISOString() }
      })

      return { previousSettings }
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(settingsQueryKeys.user(), context.previousSettings)
      }
      toast.error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.user() })

      toast.success('Regional settings updated')
    }
  })
}

// ============================================================================
// Privacy Hooks
// ============================================================================

/**
 * Update privacy settings
 */
export function useUpdatePrivacySettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (privacy: UpdatePrivacySettings) => {
      const response = await settingsClient.updatePrivacySettings(privacy)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update privacy settings')
      }
      return response.data
    },
    onMutate: async (privacy) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: settingsQueryKeys.user() })

      const previousSettings = queryClient.getQueryData<UserSettings>(settingsQueryKeys.user())

      queryClient.setQueryData(settingsQueryKeys.user(), (old: UserSettings | undefined) => {
        if (!old) return old
        return { ...old, ...privacy, updated_at: new Date().toISOString() }
      })

      return { previousSettings }
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(settingsQueryKeys.user(), context.previousSettings)
      }
      toast.error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.user() })

      toast.success('Privacy settings updated')
    }
  })
}

// ============================================================================
// Security Hooks
// ============================================================================

/**
 * Update security settings
 */
export function useUpdateSecuritySettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (security: UpdateSecuritySettings) => {
      const response = await settingsClient.updateSecuritySettings(security)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update security settings')
      }
      return response.data
    },
    onMutate: async (security) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: settingsQueryKeys.user() })

      const previousSettings = queryClient.getQueryData<UserSettings>(settingsQueryKeys.user())

      queryClient.setQueryData(settingsQueryKeys.user(), (old: UserSettings | undefined) => {
        if (!old) return old
        return { ...old, ...security, updated_at: new Date().toISOString() }
      })

      return { previousSettings }
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(settingsQueryKeys.user(), context.previousSettings)
      }
      toast.error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.user() })
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.stats() })

      toast.success('Security settings updated')
    }
  })
}

/**
 * Enable two-factor authentication
 */
export function useEnable2FA() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (method: 'authenticator' | 'sms' | 'email') => {
      const response = await settingsClient.enable2FA(method)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to enable 2FA')
      }
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.user() })
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.stats() })

      toast.success('Two-factor authentication enabled', {
        description: 'Save your backup codes in a secure location'
      })

      // Return backup codes for display
      return data.backup_codes
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Disable two-factor authentication
 */
export function useDisable2FA() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await settingsClient.disable2FA()
      if (!response.success) {
        throw new Error(response.error || 'Failed to disable 2FA')
      }
      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.user() })
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.stats() })

      toast.success('Two-factor authentication disabled')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

// ============================================================================
// API Key Hooks
// ============================================================================

/**
 * Generate new API key
 */
export function useGenerateApiKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await settingsClient.generateApiKey()
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to generate API key')
      }
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.user() })

      toast.success('New API key generated', {
        description: 'Copy it now - it won\'t be shown again'
      })

      return data.api_key
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Revoke API key
 */
export function useRevokeApiKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await settingsClient.revokeApiKey()
      if (!response.success) {
        throw new Error(response.error || 'Failed to revoke API key')
      }
      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.user() })

      toast.success('API key revoked')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

// ============================================================================
// Webhook Hooks
// ============================================================================

/**
 * Update webhook configuration
 */
export function useUpdateWebhook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (webhook: { url?: string; secret?: string; events?: string[] }) => {
      const response = await settingsClient.updateWebhook(webhook)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update webhook')
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.user() })

      toast.success('Webhook configuration updated')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

// ============================================================================
// Trusted Devices Hooks
// ============================================================================

/**
 * Get trusted devices
 */
export function useTrustedDevices(
  options?: Omit<UseQueryOptions<TrustedDevice[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: settingsQueryKeys.trustedDevices(),
    queryFn: async () => {
      const response = await settingsClient.getTrustedDevices()
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch trusted devices')
      }
      return response.data
    },
    staleTime: STALE_TIMES.USER_DATA,
    ...userDataQueryOptions,
    ...options
  })
}

/**
 * Remove trusted device
 */
export function useRemoveTrustedDevice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (deviceId: string) => {
      const response = await settingsClient.removeTrustedDevice(deviceId)
      if (!response.success) {
        throw new Error(response.error || 'Failed to remove device')
      }
      return deviceId
    },
    onMutate: async (deviceId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: settingsQueryKeys.trustedDevices() })

      const previousDevices = queryClient.getQueryData<TrustedDevice[]>(
        settingsQueryKeys.trustedDevices()
      )

      queryClient.setQueryData(
        settingsQueryKeys.trustedDevices(),
        (old: TrustedDevice[] | undefined) => {
          if (!old) return old
          return old.filter(d => d.id !== deviceId)
        }
      )

      return { previousDevices }
    },
    onError: (error: Error, _deviceId, context) => {
      if (context?.previousDevices) {
        queryClient.setQueryData(
          settingsQueryKeys.trustedDevices(),
          context.previousDevices
        )
      }
      toast.error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.trustedDevices() })
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.stats() })

      toast.success('Device removed')
    }
  })
}

// ============================================================================
// Connected Accounts Hooks
// ============================================================================

/**
 * Get connected accounts
 */
export function useConnectedAccounts(
  options?: Omit<UseQueryOptions<ConnectedAccount[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: settingsQueryKeys.connectedAccounts(),
    queryFn: async () => {
      const response = await settingsClient.getConnectedAccounts()
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch connected accounts')
      }
      return response.data
    },
    staleTime: STALE_TIMES.USER_DATA,
    ...userDataQueryOptions,
    ...options
  })
}

/**
 * Disconnect account
 */
export function useDisconnectAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (accountId: string) => {
      const response = await settingsClient.disconnectAccount(accountId)
      if (!response.success) {
        throw new Error(response.error || 'Failed to disconnect account')
      }
      return accountId
    },
    onMutate: async (accountId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: settingsQueryKeys.connectedAccounts() })

      const previousAccounts = queryClient.getQueryData<ConnectedAccount[]>(
        settingsQueryKeys.connectedAccounts()
      )

      queryClient.setQueryData(
        settingsQueryKeys.connectedAccounts(),
        (old: ConnectedAccount[] | undefined) => {
          if (!old) return old
          return old.filter(a => a.id !== accountId)
        }
      )

      return { previousAccounts }
    },
    onError: (error: Error, _accountId, context) => {
      if (context?.previousAccounts) {
        queryClient.setQueryData(
          settingsQueryKeys.connectedAccounts(),
          context.previousAccounts
        )
      }
      toast.error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.connectedAccounts() })
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.stats() })

      toast.success('Account disconnected')
    }
  })
}

// ============================================================================
// Integration Hooks
// ============================================================================

/**
 * Update integrations
 */
export function useUpdateIntegrations() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (integrations: Partial<IntegrationSettings>) => {
      const response = await settingsClient.updateIntegrations(integrations)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update integrations')
      }
      return response.data
    },
    onMutate: async (integrations) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: settingsQueryKeys.user() })

      const previousSettings = queryClient.getQueryData<UserSettings>(settingsQueryKeys.user())

      queryClient.setQueryData(settingsQueryKeys.user(), (old: UserSettings | undefined) => {
        if (!old) return old
        return {
          ...old,
          integrations: { ...(old.integrations || {}), ...integrations },
          updated_at: new Date().toISOString()
        }
      })

      return { previousSettings }
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(settingsQueryKeys.user(), context.previousSettings)
      }
      toast.error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.user() })
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.stats() })

      toast.success('Integrations updated')
    }
  })
}

// ============================================================================
// Billing Hooks
// ============================================================================

/**
 * Update billing settings
 */
export function useUpdateBillingSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (billing: UpdateBillingSettings) => {
      const response = await settingsClient.updateBillingSettings(billing)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update billing settings')
      }
      return response.data
    },
    onMutate: async (billing) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: settingsQueryKeys.user() })

      const previousSettings = queryClient.getQueryData<UserSettings>(settingsQueryKeys.user())

      queryClient.setQueryData(settingsQueryKeys.user(), (old: UserSettings | undefined) => {
        if (!old) return old
        return { ...old, ...billing, updated_at: new Date().toISOString() }
      })

      return { previousSettings }
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(settingsQueryKeys.user(), context.previousSettings)
      }
      toast.error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.user() })

      toast.success('Billing settings updated')
    }
  })
}

// ============================================================================
// Stats Hook
// ============================================================================

/**
 * Get settings statistics
 */
export function useSettingsStats(
  options?: Omit<UseQueryOptions<SettingsStats>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: settingsQueryKeys.stats(),
    queryFn: async () => {
      const response = await settingsClient.getSettingsStats()
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch settings stats')
      }
      return response.data
    },
    staleTime: STALE_TIMES.USER_DATA,
    ...userDataQueryOptions,
    ...options
  })
}

// ============================================================================
// Account Management Hooks
// ============================================================================

/**
 * Export user data (GDPR)
 */
export function useExportUserData() {
  return useMutation({
    mutationFn: async () => {
      const response = await settingsClient.exportUserData()
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to export user data')
      }
      return response.data
    },
    onSuccess: (data) => {
      toast.success('Data export started', {
        description: 'You will receive a download link shortly'
      })

      // Open download link if available immediately
      if (data.download_url) {
        window.open(data.download_url, '_blank')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Delete account
 */
export function useDeleteAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (password: string) => {
      const response = await settingsClient.deleteAccount(password)
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete account')
      }
      return true
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear()

      toast.success('Account deleted', {
        description: 'We\'re sorry to see you go'
      })

      // Redirect to home page
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Example component showing how to use these hooks:
 *
 * ```tsx
 * function SettingsPage() {
 *   const { data: settings, isLoading } = useUserSettings()
 *   const { data: stats } = useSettingsStats()
 *   const { data: devices } = useTrustedDevices()
 *
 *   const updateProfile = useUpdateProfile()
 *   const updateAppearance = useUpdateAppearanceSettings()
 *   const updateNotifications = useUpdateNotificationSettings()
 *   const enable2FA = useEnable2FA()
 *   const generateApiKey = useGenerateApiKey()
 *
 *   if (isLoading) return <Skeleton />
 *
 *   return (
 *     <div className="space-y-8">
 *       {/* Profile Section *\/}
 *       <Card>
 *         <CardHeader>
 *           <CardTitle>Profile</CardTitle>
 *           <p className="text-sm text-muted-foreground">
 *             {stats?.profile_completeness}% complete
 *           </p>
 *         </CardHeader>
 *         <CardContent>
 *           <ProfileForm
 *             settings={settings}
 *             onSubmit={(data) => updateProfile.mutate(data)}
 *             isLoading={updateProfile.isPending}
 *           />
 *         </CardContent>
 *       </Card>
 *
 *       {/* Appearance Section *\/}
 *       <Card>
 *         <CardHeader>
 *           <CardTitle>Appearance</CardTitle>
 *         </CardHeader>
 *         <CardContent>
 *           <ThemeSelector
 *             currentTheme={settings?.theme}
 *             onSelect={(theme) => updateAppearance.mutate({ theme })}
 *           />
 *         </CardContent>
 *       </Card>
 *
 *       {/* Notifications Section *\/}
 *       <Card>
 *         <CardHeader>
 *           <CardTitle>Notifications</CardTitle>
 *         </CardHeader>
 *         <CardContent>
 *           <NotificationToggles
 *             settings={settings}
 *             onChange={(notifications) => updateNotifications.mutate(notifications)}
 *           />
 *         </CardContent>
 *       </Card>
 *
 *       {/* Security Section *\/}
 *       <Card>
 *         <CardHeader>
 *           <CardTitle>Security</CardTitle>
 *           <Badge variant={stats?.security_score >= 80 ? 'default' : 'warning'}>
 *             Score: {stats?.security_score}%
 *           </Badge>
 *         </CardHeader>
 *         <CardContent className="space-y-4">
 *           <div className="flex items-center justify-between">
 *             <Label>Two-Factor Authentication</Label>
 *             <Switch
 *               checked={settings?.two_factor_enabled}
 *               onCheckedChange={(enabled) => {
 *                 if (enabled) {
 *                   enable2FA.mutate('authenticator')
 *                 } else {
 *                   // Show confirmation dialog
 *                 }
 *               }}
 *             />
 *           </div>
 *
 *           <Separator />
 *
 *           <div>
 *             <Label>Trusted Devices ({devices?.length || 0})</Label>
 *             <DeviceList devices={devices} />
 *           </div>
 *
 *           <Separator />
 *
 *           <div>
 *             <Label>API Key</Label>
 *             {settings?.api_key ? (
 *               <ApiKeyDisplay apiKey={settings.api_key} />
 *             ) : (
 *               <Button onClick={() => generateApiKey.mutate()}>
 *                 Generate API Key
 *               </Button>
 *             )}
 *           </div>
 *         </CardContent>
 *       </Card>
 *     </div>
 *   )
 * }
 * ```
 */
