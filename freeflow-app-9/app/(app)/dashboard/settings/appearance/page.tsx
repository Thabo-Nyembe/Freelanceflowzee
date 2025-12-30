'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sun, Moon, Monitor } from 'lucide-react'
import { AppearanceSettings, defaultAppearance } from '@/lib/settings-utils'
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { createFeatureLogger } from '@/lib/logger'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'

const logger = createFeatureLogger('Settings:Appearance')

export default function AppearancePage() {
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  const [appearance, setAppearance] = useState<AppearanceSettings>(defaultAppearance)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAppearanceSettings = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        logger.info('Loading appearance settings', { userId })

        // Dynamic import for code splitting
        const { getAppearanceSettings } = await import('@/lib/appearance-settings-queries')

        const { data, error } = await getAppearanceSettings(userId)
        if (error) throw new Error(error.message)

        if (data) {
          const mappedSettings: AppearanceSettings = {
            theme: (data.theme || 'system') as 'light' | 'dark' | 'system',
            compactMode: data.compact_mode || false,
            animations: data.animations_enabled !== false,
            language: data.language || 'en',
            timezone: data.timezone || 'America/New_York',
            dateFormat: data.date_format || 'MM/DD/YYYY',
            currency: data.currency || 'USD'
          }
          setAppearance(mappedSettings)
        }

        logger.info('Appearance settings loaded', { userId })
        announce('Appearance settings loaded successfully', 'polite')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load appearance settings'
        setError(errorMessage)
        logger.error('Failed to load appearance settings', { error: err, userId })
        toast.error('Failed to load appearance settings')
        announce('Error loading appearance settings', 'assertive')
      } finally {
        setLoading(false)
      }
    }

    loadAppearanceSettings()
  }, [userId, announce]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdateTheme = async (theme: 'light' | 'dark' | 'system') => {
    if (!userId) {
      toast.error('Please log in')
      announce('Authentication required', 'assertive')
      return
    }

    try {
      const oldTheme = appearance.theme
      setAppearance({ ...appearance, theme })

      logger.info('Theme updated', { oldTheme, newTheme: theme, userId })

      const { updateAppearanceSettings } = await import('@/lib/appearance-settings-queries')
      await updateAppearanceSettings(userId, { theme })

      toast.success('Theme Updated!', {
        description: `Now using ${theme.charAt(0).toUpperCase() + theme.slice(1)} mode - ${oldTheme} → ${theme}`
      })
      announce(`Theme updated to ${theme}`, 'polite')
    } catch (error) {
      logger.error('Failed to update theme', { error, userId })
      toast.error('Failed to update theme')
      announce('Error updating theme', 'assertive')
    }
  }

  // A+++ LOADING STATE
  if (loading || userLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="space-y-6">
        <ErrorEmptyState
          error={error}
          action={{
            label: 'Retry',
            onClick: () => window.location.reload()
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Theme & Display</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Theme</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={appearance.theme === 'light' ? 'default' : 'outline'}
                  onClick={() => handleUpdateTheme('light')}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Sun className="w-4 h-4" />
                  Light
                </Button>
                <Button
                  variant={appearance.theme === 'dark' ? 'default' : 'outline'}
                  onClick={() => handleUpdateTheme('dark')}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Moon className="w-4 h-4" />
                  Dark
                </Button>
                <Button
                  variant={appearance.theme === 'system' ? 'default' : 'outline'}
                  onClick={() => handleUpdateTheme('system')}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Monitor className="w-4 h-4" />
                  System
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="compact-mode">Compact Mode</Label>
                <p className="text-sm text-gray-500">Reduce spacing and padding</p>
              </div>
              <Switch
                id="compact-mode"
                checked={appearance.compactMode}
                disabled={loading}
                onCheckedChange={async (checked) => {
                  if (!userId) {
                    toast.error('Please log in')
                    return
                  }

                  try {
                    setAppearance({ ...appearance, compactMode: checked })
                    logger.info('Compact mode toggled', { checked, userId })

                    const { updateAppearanceSettings } = await import('@/lib/appearance-settings-queries')
                    await updateAppearanceSettings(userId, { compact_mode: checked })

                    toast.success(`Compact Mode ${checked ? 'Enabled' : 'Disabled'}`)
                    announce(`Compact mode ${checked ? 'enabled' : 'disabled'}`, 'polite')
                  } catch (error) {
                    logger.error('Failed to update compact mode', { error, userId })
                    toast.error('Failed to update compact mode')
                  }
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="animations">Animations</Label>
                <p className="text-sm text-gray-500">Enable smooth transitions</p>
              </div>
              <Switch
                id="animations"
                checked={appearance.animations}
                disabled={loading}
                onCheckedChange={async (checked) => {
                  if (!userId) {
                    toast.error('Please log in')
                    return
                  }

                  try {
                    setAppearance({ ...appearance, animations: checked })
                    logger.info('Animations toggled', { checked, userId })

                    const { updateAppearanceSettings } = await import('@/lib/appearance-settings-queries')
                    await updateAppearanceSettings(userId, { animations_enabled: checked })

                    toast.success(`Animations ${checked ? 'Enabled' : 'Disabled'}`)
                    announce(`Animations ${checked ? 'enabled' : 'disabled'}`, 'polite')
                  } catch (error) {
                    logger.error('Failed to update animations', { error, userId })
                    toast.error('Failed to update animations')
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Localization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={appearance.language}
                disabled={loading}
                onValueChange={async (value) => {
                  if (!userId) {
                    toast.error('Please log in')
                    return
                  }

                  try {
                    setAppearance({ ...appearance, language: value })
                    logger.info('Language updated', { value, userId })

                    const { updateAppearanceSettings } = await import('@/lib/appearance-settings-queries')
                    await updateAppearanceSettings(userId, { language: value })

                    toast.success('Language Updated')
                    announce('Language updated', 'polite')
                  } catch (error) {
                    logger.error('Failed to update language', { error, userId })
                    toast.error('Failed to update language')
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="pt">Portuguese</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={appearance.timezone}
                disabled={loading}
                onValueChange={async (value) => {
                  if (!userId) {
                    toast.error('Please log in')
                    return
                  }

                  try {
                    setAppearance({ ...appearance, timezone: value })
                    logger.info('Timezone updated', { value, userId })

                    const { updateAppearanceSettings } = await import('@/lib/appearance-settings-queries')
                    await updateAppearanceSettings(userId, { timezone: value })

                    toast.success('Timezone Updated')
                    announce('Timezone updated', 'polite')
                  } catch (error) {
                    logger.error('Failed to update timezone', { error, userId })
                    toast.error('Failed to update timezone')
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="Europe/London">London</SelectItem>
                  <SelectItem value="Europe/Paris">Paris</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-format">Date Format</Label>
              <Select
                value={appearance.dateFormat}
                disabled={loading}
                onValueChange={async (value) => {
                  if (!userId) {
                    toast.error('Please log in')
                    return
                  }

                  try {
                    setAppearance({ ...appearance, dateFormat: value })
                    logger.info('Date format updated', { value, userId })

                    const { updateAppearanceSettings } = await import('@/lib/appearance-settings-queries')
                    await updateAppearanceSettings(userId, { date_format: value })

                    toast.success('Date Format Updated')
                    announce('Date format updated', 'polite')
                  } catch (error) {
                    logger.error('Failed to update date format', { error, userId })
                    toast.error('Failed to update date format')
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={appearance.currency}
                disabled={loading}
                onValueChange={async (value) => {
                  if (!userId) {
                    toast.error('Please log in')
                    return
                  }

                  try {
                    setAppearance({ ...appearance, currency: value })
                    logger.info('Currency updated', { value, userId })

                    const { updateAppearanceSettings } = await import('@/lib/appearance-settings-queries')
                    await updateAppearanceSettings(userId, { currency: value })

                    toast.success('Currency Updated')
                    announce('Currency updated', 'polite')
                  } catch (error) {
                    logger.error('Failed to update currency', { error, userId })
                    toast.error('Failed to update currency')
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CAD">CAD (C$)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
