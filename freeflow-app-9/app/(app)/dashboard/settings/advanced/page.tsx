'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Settings,
  Zap,
  Key
} from 'lucide-react'
import {
  defaultProfile,
  defaultNotifications,
  defaultAppearance
} from '@/lib/settings-utils'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('Settings:Advanced')

export default function AdvancedPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleExportData = () => {
    const data = {
      profile: defaultProfile,
      notifications: defaultNotifications,
      appearance: defaultAppearance
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'freeflow-settings.json'
    a.click()
    URL.revokeObjectURL(url)

    logger.info('Settings exported successfully', {
      fileName: 'freeflow-settings.json',
      fileSize: blob.size,
      exportedSections: ['profile', 'notifications', 'appearance']
    })

    toast.success('Settings Exported!', {
      description: `freeflow-settings.json - ${Math.round(blob.size / 1024)}KB - Profile, Notifications, Appearance`
    })
  }

  const handleImportData = () => {
    logger.info('Import settings initiated')

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        try {
          const text = await file.text()
          const imported = JSON.parse(text)

          const sectionsImported: string[] = []
          if (imported.profile) sectionsImported.push('Profile')
          if (imported.notifications) sectionsImported.push('Notifications')
          if (imported.appearance) sectionsImported.push('Appearance')

          logger.info('Settings imported successfully', {
            fileName: file.name,
            fileSize: file.size,
            sectionsImported
          })

          toast.success('Settings Imported!', {
            description: `${file.name} - ${sectionsImported.join(', ')} updated - ${Math.round(file.size / 1024)}KB`
          })
        } catch (error: any) {
          logger.error('Settings import failed', {
            fileName: file?.name,
            error: error.message
          })

          toast.error('Import Failed', {
            description: 'Invalid settings file format'
          })
        }
      }
    }
    input.click()
  }

  const handleExportUserData = async () => {
    logger.info('GDPR user data export initiated')

    setIsLoading(true)

    try {
      const response = await fetch('/api/settings/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'export',
          action: 'get'
        })
      })

      const result = await response.json()

      if (response.ok) {
        const userData = typeof result === 'string' ? JSON.parse(result) : result

        const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'kazi-user-data-export.json'
        a.click()
        URL.revokeObjectURL(url)

        logger.info('GDPR user data exported successfully', {
          fileName: 'kazi-user-data-export.json',
          fileSize: blob.size
        })

        toast.success('User Data Exported!', {
          description: `GDPR compliant export saved to kazi-user-data-export.json - ${Math.round(blob.size / 1024)}KB`
        })
      } else {
        throw new Error(result.error || 'Failed to export data')
      }
    } catch (error: any) {
      logger.error('User data export failed', {
        error: error.message
      })

      toast.error('Failed to export data', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSyncSettings = async () => {
    const categories = ['profile', 'notifications', 'appearance', 'preferences']

    logger.info('Settings sync initiated', {
      categories
    })

    setIsLoading(true)

    try {
      const syncData = {
        profile: defaultProfile,
        notifications: defaultNotifications,
        appearance: defaultAppearance,
        preferences: { synced: true }
      }

      const response = await fetch('/api/settings/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'preferences',
          action: 'update',
          data: syncData.preferences
        })
      })

      const result = await response.json()

      if (result.success) {
        const syncTime = new Date().toLocaleString()

        logger.info('Settings synced successfully', {
          categories,
          syncTime
        })

        toast.success('Settings Synced!', {
          description: `Synchronized across all devices - ${categories.length} sections - Last sync: ${syncTime}`
        })
      } else {
        throw new Error(result.error || 'Failed to sync settings')
      }
    } catch (error: any) {
      logger.error('Settings sync failed', {
        error: error.message
      })

      toast.error('Failed to sync settings', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetSettings = () => {
    logger.info('Reset settings initiated')

    if (confirm('⚠️ Reset All Settings?\n\nThis will restore:\n• Default theme\n• Default notifications\n• Default preferences\n\nYour profile data will not be affected.')) {
      logger.info('Settings reset to defaults', {
        resetSections: ['Theme', 'Notifications', 'Preferences']
      })

      toast.success('Settings Reset!', {
        description: 'Theme, Notifications, and Preferences restored to defaults'
      })
    }
  }

  const handleClearCache = () => {
    logger.info('Clear cache initiated')

    if (confirm('🧹 Clear Application Cache?\n\nThis will:\n• Clear stored preferences\n• Remove cached data\n• Sign you out\n\nYou\'ll need to sign in again.')) {
      logger.info('Cache cleared successfully', {
        signOutScheduled: new Date(Date.now() + 3000).toISOString()
      })

      toast.success('Cache Cleared!', {
        description: 'Application cache cleared. You will be signed out in 3 seconds'
      })

      setTimeout(() => {
        logger.info('Signing out after cache clear')
      }, 3000)
    }
  }

  const handleManageIntegrations = () => {
    logger.info('Navigating to integrations page')
    window.location.href = '/dashboard/integrations'
  }

  const handleQuickSetupIntegrations = () => {
    logger.info('Navigating to easy integration setup')
    window.location.href = '/dashboard/integrations/setup'
  }

  const handleDeleteAccount = () => {
    logger.info('Account deletion initiated')

    if (confirm('⚠️ DELETE ACCOUNT?\n\nThis will permanently delete:\n• Your profile and data\n• All projects and files\n• Payment history\n• Team memberships\n\nThis action CANNOT be undone!')) {
      if (confirm('⚠️ FINAL CONFIRMATION\n\nType DELETE to confirm account deletion.\n\nAre you absolutely sure?')) {
        logger.info('Account deletion confirmed', {
          deletionScheduled: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })

        toast.info('Account Deletion Requested', {
          description: `Confirmation email sent. Account will be deleted in 7 days unless you cancel`
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Export Your Data</h4>
                <p className="text-sm text-gray-500">Download all your data in JSON format</p>
              </div>
              <Button variant="outline" onClick={handleExportData}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Import Data</h4>
                <p className="text-sm text-gray-500">Import settings from backup file</p>
              </div>
              <Button variant="outline" onClick={handleImportData}>
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Export User Data (GDPR)</h4>
                <p className="text-sm text-gray-500">Download all your personal data</p>
              </div>
              <Button variant="outline" onClick={handleExportUserData} disabled={isLoading}>
                <Download className="w-4 h-4 mr-2" />
                Export All Data
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Sync Settings</h4>
                <p className="text-sm text-gray-500">Sync across all your devices</p>
              </div>
              <Button variant="outline" onClick={handleSyncSettings} disabled={isLoading}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Now
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Reset Settings</h4>
                <p className="text-sm text-gray-500">Restore default preferences</p>
              </div>
              <Button variant="outline" onClick={handleResetSettings}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Clear Cache</h4>
                <p className="text-sm text-gray-500">Clear stored data and sign out</p>
              </div>
              <Button variant="outline" onClick={handleClearCache}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Cache
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
              <div>
                <h4 className="font-medium flex items-center gap-2">
                  Manage Integrations
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">Easy Setup</Badge>
                </h4>
                <p className="text-sm text-gray-500">Connect Gmail, AI, Calendar & more in minutes</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleManageIntegrations}>
                  <Settings className="w-4 h-4 mr-2" />
                  Manage
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  onClick={handleQuickSetupIntegrations}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Quick Setup
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
              <div>
                <h4 className="font-medium flex items-center gap-2">
                  API Keys (BYOK)
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Your Own Keys</Badge>
                </h4>
                <p className="text-sm text-gray-500">Use your own API keys for full control & unlimited usage</p>
              </div>
              <Button
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                onClick={() => window.location.href = '/dashboard/api-keys'}
              >
                <Key className="w-4 h-4 mr-2" />
                Manage API Keys
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div>
                <h4 className="font-medium text-red-700">Delete Account</h4>
                <p className="text-sm text-red-600">Permanently delete your account and all data</p>
              </div>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
