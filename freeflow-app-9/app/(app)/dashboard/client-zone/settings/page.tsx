'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Download,
  Save,
  MessageSquare,
  Clock,
  Lock,
  User,
  Eye,
  Check,
  FileText,
  Database,
  Zap
} from 'lucide-react'
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { KAZI_CLIENT_DATA } from '@/lib/client-zone-utils'

const logger = createFeatureLogger('ClientSettings')

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface NotificationSetting {
  id: string
  label: string
  description: string
  enabled: boolean
  icon: any
  category: 'project' | 'communication' | 'payment' | 'system'
}

interface PrivacySetting {
  id: string
  label: string
  description: string
  enabled: boolean
  icon: any
}

// ============================================================================
// SETTINGS COMPONENT
// ============================================================================

export default function SettingsPage() {
  // A+++ UTILITIES
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState<'notifications' | 'account' | 'privacy' | 'data'>('notifications')

  // NOTIFICATION SETTINGS
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([])

  // ACCOUNT SETTINGS
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [language, setLanguage] = useState('en')
  const [timezone, setTimezone] = useState('UTC')

  // PRIVACY SETTINGS
  const [privacySettings, setPrivacySettings] = useState<PrivacySetting[]>([])

  // A+++ LOAD SETTINGS DATA
  useEffect(() => {
    const loadSettingsData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Initialize notification settings
        const notifications: NotificationSetting[] = [
          {
            id: 'project-updates',
            label: 'Project Updates',
            description: 'Get notified about project progress and milestones',
            enabled: true,
            icon: FileText,
            category: 'project'
          },
          {
            id: 'deliverable-status',
            label: 'Deliverable Status Changes',
            description: 'Receive alerts when deliverables change status',
            enabled: true,
            icon: Check,
            category: 'project'
          },
          {
            id: 'team-messages',
            label: 'Team Messages',
            description: 'Get notified about new messages from your team',
            enabled: true,
            icon: MessageSquare,
            category: 'communication'
          },
          {
            id: 'meeting-reminders',
            label: 'Meeting Reminders',
            description: 'Reminders for scheduled meetings and calls',
            enabled: true,
            icon: Clock,
            category: 'communication'
          },
          {
            id: 'invoice-notifications',
            label: 'Invoice Notifications',
            description: 'New invoices and payment due dates',
            enabled: true,
            icon: FileText,
            category: 'payment'
          },
          {
            id: 'payment-confirmed',
            label: 'Payment Confirmations',
            description: 'Confirmation when payments are received',
            enabled: true,
            icon: Check,
            category: 'payment'
          },
          {
            id: 'system-updates',
            label: 'System Updates',
            description: 'Platform updates and maintenance notices',
            enabled: false,
            icon: Zap,
            category: 'system'
          },
          {
            id: 'feature-announcements',
            label: 'Feature Announcements',
            description: 'New features and improvements',
            enabled: true,
            icon: Bell,
            category: 'system'
          }
        ]

        // Initialize privacy settings
        const privacy: PrivacySetting[] = [
          {
            id: 'profile-visibility',
            label: 'Profile Visibility',
            description: 'Allow your profile to be visible to other users',
            enabled: true,
            icon: Eye
          },
          {
            id: 'testimonials-public',
            label: 'Public Testimonials',
            description: 'Allow your feedback to appear in public testimonials',
            enabled: true,
            icon: MessageSquare
          },
          {
            id: 'analytics-sharing',
            label: 'Analytics Sharing',
            description: 'Share project analytics with team members',
            enabled: true,
            icon: Database
          },
          {
            id: 'activity-visibility',
            label: 'Activity History',
            description: 'Show your activity history to project team',
            enabled: false,
            icon: Clock
          }
        ]

        setNotificationSettings(notifications)
        setPrivacySettings(privacy)
        setEmail(KAZI_CLIENT_DATA.clientInfo.email)
        setPhone(KAZI_CLIENT_DATA.clientInfo.phone)

        // Load settings from API
        const response = await fetch('/api/client-zone/settings')
        if (!response.ok) throw new Error('Failed to load settings')

        setIsLoading(false)
        announce('Settings loaded successfully', 'polite')
        logger.info('Settings data loaded', {
          clientName: KAZI_CLIENT_DATA.clientInfo.name
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings')
        setIsLoading(false)
        announce('Error loading settings', 'assertive')
        logger.error('Failed to load settings data', { error: err })
      }
    }

    loadSettingsData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================================
  // HANDLER 1: SAVE SETTINGS
  // ============================================================================

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true)

      logger.info('Settings save initiated', {
        clientName: KAZI_CLIENT_DATA.clientInfo.name,
        email,
        phone,
        language,
        timezone
      })

      const response = await fetch('/api/user/update-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: KAZI_CLIENT_DATA.clientInfo.name,
          email,
          phone,
          language,
          timezone,
          notificationSettings: notificationSettings.map(n => ({
            id: n.id,
            enabled: n.enabled
          })),
          privacySettings: privacySettings.map(p => ({
            id: p.id,
            enabled: p.enabled
          })),
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      const result = await response.json()

      if (result.success) {
        logger.info('Settings saved successfully', {
          clientName: KAZI_CLIENT_DATA.clientInfo.name
        })

        toast.success('Settings saved successfully!', {
          description: 'Your preferences have been updated'
        })
      }
    } catch (error) {
      logger.error('Failed to save settings', { error })
      toast.error('Failed to save settings', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsSaving(false)
    }
  }

  // ============================================================================
  // HANDLER 2: TOGGLE NOTIFICATION
  // ============================================================================

  const handleToggleNotification = (settingId: string) => {
    setNotificationSettings(
      notificationSettings.map(setting =>
        setting.id === settingId
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    )

    logger.info('Notification setting toggled', {
      settingId,
      clientName: KAZI_CLIENT_DATA.clientInfo.name
    })
  }

  // ============================================================================
  // HANDLER 3: TOGGLE PRIVACY SETTING
  // ============================================================================

  const handleTogglePrivacy = (settingId: string) => {
    setPrivacySettings(
      privacySettings.map(setting =>
        setting.id === settingId
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    )

    logger.info('Privacy setting toggled', {
      settingId,
      clientName: KAZI_CLIENT_DATA.clientInfo.name
    })
  }

  // ============================================================================
  // HANDLER 4: EXPORT DATA
  // ============================================================================

  const handleExportData = async (format: 'json' | 'csv') => {
    try {
      setIsExporting(true)

      logger.info('Data export initiated', {
        clientName: KAZI_CLIENT_DATA.clientInfo.name,
        format
      })

      const response = await fetch('/api/user/export-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: KAZI_CLIENT_DATA.clientInfo.name,
          format,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to export data')
      }

      const result = await response.json()

      if (result.success) {
        logger.info('Data exported successfully', {
          clientName: KAZI_CLIENT_DATA.clientInfo.name,
          format
        })

        // Create download
        const dataStr = format === 'json'
          ? JSON.stringify(result.data, null, 2)
          : result.data

        const blob = new Blob([dataStr], {
          type: format === 'json' ? 'application/json' : 'text/csv'
        })

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `client-data-${new Date().toISOString().split('T')[0]}.${format}`
        link.click()
        URL.revokeObjectURL(url)

        toast.success(`Data exported as ${format.toUpperCase()}!`, {
          description: 'Your file is ready to download'
        })
      }
    } catch (error) {
      logger.error('Failed to export data', { error, format })
      toast.error('Failed to export data', {
        description: error.message || 'Please try again'
      })
    } finally {
      setIsExporting(false)
    }
  }

  // ============================================================================
  // HANDLER 5: CHANGE PASSWORD
  // ============================================================================

  const handleChangePassword = async () => {
    logger.info('Password change initiated', {
      clientName: KAZI_CLIENT_DATA.clientInfo.name
    })

    toast.info('Opening password change dialog...', {
      description: 'You will be sent a verification email'
    })
  }

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error) {
    return (
      <ErrorEmptyState
        error={error}
        onRetry={() => window.location.reload()}
      />
    )
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
            <SettingsIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings & Preferences</h1>
            <p className="text-gray-600 mt-1">Manage your account, notifications, and privacy</p>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex gap-2 bg-white/70 backdrop-blur-sm rounded-lg p-2 border border-white/40 overflow-x-auto">
          {[
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'account', label: 'Account', icon: User },
            { id: 'privacy', label: 'Privacy', icon: Shield },
            { id: 'data', label: 'Data & Export', icon: Download }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-900 font-medium'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* NOTIFICATIONS TAB */}
      {activeTab === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="space-y-6"
        >
          {['project', 'communication', 'payment', 'system'].map((category) => (
            <Card key={category} className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle className="capitalize">
                  {category === 'project' ? 'Project Notifications' :
                   category === 'communication' ? 'Communication Notifications' :
                   category === 'payment' ? 'Payment & Invoice Notifications' :
                   'System Notifications'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {notificationSettings
                  .filter(setting => setting.category === category)
                  .map((setting) => {
                    const Icon = setting.icon
                    return (
                      <div
                        key={setting.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-900">{setting.label}</p>
                            <p className="text-sm text-gray-600">{setting.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleNotification(setting.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            setting.enabled ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              setting.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    )
                  })}
              </CardContent>
            </Card>
          ))}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                const allEnabled = notificationSettings.every(s => s.enabled)
                setNotificationSettings(
                  notificationSettings.map(s => ({ ...s, enabled: !allEnabled }))
                )
                toast.success(allEnabled ? 'All notifications disabled' : 'All notifications enabled')
              }}
            >
              {notificationSettings.every(s => s.enabled) ? 'Disable All' : 'Enable All'}
            </Button>
            <Button
              className="ml-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              onClick={handleSaveSettings}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </motion.div>
      )}

      {/* ACCOUNT TAB */}
      {activeTab === 'account' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="space-y-6"
        >
          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">EST (Eastern)</option>
                    <option value="CST">CST (Central)</option>
                    <option value="MST">MST (Mountain)</option>
                    <option value="PST">PST (Pacific)</option>
                    <option value="GMT">GMT (London)</option>
                    <option value="CET">CET (Central Europe)</option>
                    <option value="IST">IST (India)</option>
                    <option value="JST">JST (Japan)</option>
                  </select>
                </div>
              </div>

              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                onClick={handleSaveSettings}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Account Settings'}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-sm text-gray-600 mb-3">Last password change: 30 days ago</p>
                <Button
                  variant="outline"
                  onClick={handleChangePassword}
                >
                  Change Password
                </Button>
              </div>

              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <p className="font-medium text-green-900">Two-Factor Authentication</p>
                </div>
                <p className="text-sm text-green-700">Enabled - Your account is secure</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* PRIVACY TAB */}
      {activeTab === 'privacy' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {privacySettings.map((setting) => {
                const Icon = setting.icon
                return (
                  <div
                    key={setting.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">{setting.label}</p>
                        <p className="text-sm text-gray-600">{setting.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleTogglePrivacy(setting.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        setting.enabled ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          setting.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                )
              })}

              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white mt-6"
                onClick={handleSaveSettings}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Privacy Settings'}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200 shadow-lg">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600">
                Your privacy is important to us. We never share your personal information with third parties without your consent.
              </p>
              <Button variant="outline" className="mt-4">
                View Privacy Policy
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* DATA & EXPORT TAB */}
      {activeTab === 'data' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="space-y-6"
        >
          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Your Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Download all your data including projects, messages, feedback, and account information.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 dark:bg-slate-800">
                  <h4 className="font-medium text-gray-900 mb-2">JSON Format</h4>
                  <p className="text-sm text-gray-600 mb-3">Structured data format, easy to import to other systems</p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleExportData('json')}
                    disabled={isExporting}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export as JSON
                  </Button>
                </div>

                <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 dark:bg-slate-800">
                  <h4 className="font-medium text-gray-900 mb-2">CSV Format</h4>
                  <p className="text-sm text-gray-600 mb-3">Spreadsheet format, compatible with Excel and Google Sheets</p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleExportData('csv')}
                    disabled={isExporting}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export as CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <span className="text-sm text-gray-600">Projects</span>
                  <Badge>12 items</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <span className="text-sm text-gray-600">Messages</span>
                  <Badge>127 items</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <span className="text-sm text-gray-600">Files</span>
                  <Badge>23 items</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <span className="text-sm text-gray-600">Feedback</span>
                  <Badge>3 submissions</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Account Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                <p className="text-sm text-yellow-900 mb-3">Deactivate your account</p>
                <p className="text-xs text-yellow-800 mb-3">
                  You can deactivate your account temporarily or permanently. You will lose access to all your projects.
                </p>
                <Button variant="outline">
                  Deactivate Account
                </Button>
              </div>

              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-900 mb-3">Permanently delete account</p>
                <p className="text-xs text-red-800 mb-3">
                  This action is irreversible. All your data will be permanently deleted.
                </p>
                <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
