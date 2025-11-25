'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Mail, Bell, Smartphone } from 'lucide-react'
import { NotificationSettings, defaultNotifications } from '@/lib/settings-utils'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('Settings:Notifications')

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationSettings>(defaultNotifications)

  const handleToggleNotification = (notificationType: string, enabled: boolean) => {
    logger.info('Notification setting toggled', {
      notificationType,
      enabled
    })

    toast.success(`Notification ${enabled ? 'Enabled' : 'Disabled'}`, {
      description: `${notificationType} notifications are now ${enabled ? 'ON' : 'OFF'}`
    })
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
                onCheckedChange={(checked) => {
                  setNotifications({ ...notifications, emailNotifications: checked })
                  handleToggleNotification('Email', checked)
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
                onCheckedChange={(checked) => {
                  setNotifications({ ...notifications, pushNotifications: checked })
                  handleToggleNotification('Push', checked)
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
                onCheckedChange={(checked) => {
                  setNotifications({ ...notifications, smsNotifications: checked })
                  handleToggleNotification('SMS', checked)
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
                onCheckedChange={(checked) => {
                  setNotifications({ ...notifications, projectUpdates: checked })
                  handleToggleNotification('Project Updates', checked)
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
                onCheckedChange={(checked) => {
                  setNotifications({ ...notifications, clientMessages: checked })
                  handleToggleNotification('Client Messages', checked)
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
                onCheckedChange={(checked) => {
                  setNotifications({ ...notifications, paymentAlerts: checked })
                  handleToggleNotification('Payment Alerts', checked)
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
                onCheckedChange={(checked) => {
                  setNotifications({ ...notifications, marketingEmails: checked })
                  handleToggleNotification('Marketing Emails', checked)
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
                onCheckedChange={(checked) => {
                  setNotifications({ ...notifications, weeklyDigest: checked })
                  handleToggleNotification('Weekly Digest', checked)
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
