'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Mail, Bell, Smartphone } from 'lucide-react'
import { NotificationSettings, defaultNotifications } from '@/lib/settings-utils'
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { createFeatureLogger } from '@/lib/logger'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'

const logger = createFeatureLogger('Settings:Notifications')

export default function NotificationsPage() {
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  const [notifications, setNotifications] = useState<NotificationSettings>(defaultNotifications)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadNotificationSettings = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        logger.info('Loading notification settings', { userId })

        // Dynamic import for code splitting
        const { getNotificationPreferences } = await import('@/lib/notification-settings-queries')

        const { data, error } = await getNotificationPreferences(userId)
        if (error) throw new Error(error.message)

        // Map database preferences to UI state
        const preferences = data || []
        const mappedSettings: NotificationSettings = {
          emailNotifications: preferences.some(p => p.channel === 'email' && p.is_enabled),
          pushNotifications: preferences.some(p => p.channel === 'push' && p.is_enabled),
          smsNotifications: preferences.some(p => p.channel === 'sms' && p.is_enabled),
          projectUpdates: preferences.some(p => p.category === 'project_updates' && p.is_enabled),
          clientMessages: preferences.some(p => p.category === 'client_messages' && p.is_enabled),
          paymentAlerts: preferences.some(p => p.category === 'payment_alerts' && p.is_enabled),
          marketingEmails: preferences.some(p => p.category === 'marketing' && p.is_enabled),
          weeklyDigest: preferences.some(p => p.category === 'weekly_digest' && p.is_enabled)
        }

        setNotifications(mappedSettings)
        logger.info('Notification settings loaded', { count: preferences.length, userId })
        announce('Notification settings loaded successfully', 'polite')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load notification settings'
        setError(errorMessage)
        logger.error('Failed to load notification settings', { error: err, userId })
        toast.error('Failed to load notification settings')
        announce('Error loading notification settings', 'assertive')
      } finally {
        setLoading(false)
      }
    }

    loadNotificationSettings()
  }, [userId, announce]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleNotification = async (notificationType: string, category: string, channel: string, enabled: boolean) => {
    if (!userId) {
      toast.error('Please log in')
      announce('Authentication required', 'assertive')
      return
    }

    try {
      logger.info('Toggling notification setting', { notificationType, category, channel, enabled, userId })

      const { toggleNotificationPreference } = await import('@/lib/notification-settings-queries')
      const { error } = await toggleNotificationPreference(userId, category, channel as any, enabled)

      if (error) throw new Error(error.message)

      logger.info('Notification setting updated', { notificationType, enabled, userId })
      toast.success(`Notification ${enabled ? 'Enabled' : 'Disabled'}`, {
        description: `${notificationType} notifications are now ${enabled ? 'ON' : 'OFF'}`
      })
      announce(`${notificationType} notifications ${enabled ? 'enabled' : 'disabled'}`, 'polite')
    } catch (error) {
      logger.error('Failed to toggle notification', { error, notificationType, userId })
      toast.error('Failed to update notification setting')
      announce('Error updating notification setting', 'assertive')
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
            <CardTitle>Communication Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
              </div>
              <Switch
                id="email-notifications"
                checked={notifications.emailNotifications}
                disabled={loading}
                onCheckedChange={(checked) => {
                  setNotifications({ ...notifications, emailNotifications: checked })
                  handleToggleNotification('Email', 'email', 'email', checked)
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-500" />
                <div>
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-gray-500">Browser and mobile notifications</p>
                </div>
              </div>
              <Switch
                id="push-notifications"
                checked={notifications.pushNotifications}
                disabled={loading}
                onCheckedChange={(checked) => {
                  setNotifications({ ...notifications, pushNotifications: checked })
                  handleToggleNotification('Push', 'push', 'push', checked)
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-gray-500" />
                <div>
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <p className="text-sm text-gray-500">Text message alerts</p>
                </div>
              </div>
              <Switch
                id="sms-notifications"
                checked={notifications.smsNotifications}
                disabled={loading}
                onCheckedChange={(checked) => {
                  setNotifications({ ...notifications, smsNotifications: checked })
                  handleToggleNotification('SMS', 'sms', 'sms', checked)
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="project-updates">Project Updates</Label>
                <p className="text-sm text-gray-500">Status changes and milestones</p>
              </div>
              <Switch
                id="project-updates"
                checked={notifications.projectUpdates}
                disabled={loading}
                onCheckedChange={(checked) => {
                  setNotifications({ ...notifications, projectUpdates: checked })
                  handleToggleNotification('Project Updates', 'project_updates', 'email', checked)
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="client-messages">Client Messages</Label>
                <p className="text-sm text-gray-500">New messages from clients</p>
              </div>
              <Switch
                id="client-messages"
                checked={notifications.clientMessages}
                disabled={loading}
                onCheckedChange={(checked) => {
                  setNotifications({ ...notifications, clientMessages: checked })
                  handleToggleNotification('Client Messages', 'client_messages', 'email', checked)
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="payment-alerts">Payment Alerts</Label>
                <p className="text-sm text-gray-500">Invoices and payment updates</p>
              </div>
              <Switch
                id="payment-alerts"
                checked={notifications.paymentAlerts}
                disabled={loading}
                onCheckedChange={(checked) => {
                  setNotifications({ ...notifications, paymentAlerts: checked })
                  handleToggleNotification('Payment Alerts', 'payment_alerts', 'email', checked)
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="marketing-emails">Marketing Emails</Label>
                <p className="text-sm text-gray-500">Product updates and tips</p>
              </div>
              <Switch
                id="marketing-emails"
                checked={notifications.marketingEmails}
                disabled={loading}
                onCheckedChange={(checked) => {
                  setNotifications({ ...notifications, marketingEmails: checked })
                  handleToggleNotification('Marketing Emails', 'marketing', 'email', checked)
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weekly-digest">Weekly Digest</Label>
                <p className="text-sm text-gray-500">Summary of your activity</p>
              </div>
              <Switch
                id="weekly-digest"
                checked={notifications.weeklyDigest}
                disabled={loading}
                onCheckedChange={(checked) => {
                  setNotifications({ ...notifications, weeklyDigest: checked })
                  handleToggleNotification('Weekly Digest', 'weekly_digest', 'email', checked)
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
