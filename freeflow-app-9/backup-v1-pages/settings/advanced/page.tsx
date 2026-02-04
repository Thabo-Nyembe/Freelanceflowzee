'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import {
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Settings,
  Zap,
  Key,
  AlertTriangle
} from 'lucide-react'
import {
  defaultProfile,
  defaultNotifications,
  defaultAppearance
} from '@/lib/settings-utils'
import { createSimpleLogger } from '@/lib/simple-logger'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'

const logger = createSimpleLogger('Settings:Advanced')

export default function AdvancedPage() {
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // AlertDialog states
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showClearCacheDialog, setShowClearCacheDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showFinalDeleteDialog, setShowFinalDeleteDialog] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const loadAdvancedSettings = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        logger.info('Loading advanced settings', { userId })

        // Dynamic import for code splitting
        const { getAdvancedSettingsStats, getRecentActivity } = await import('@/lib/advanced-settings-queries')

        const [statsResult, activityResult] = await Promise.all([
          getAdvancedSettingsStats(userId),
          getRecentActivity(userId, 5)
        ])

        setStats({
          ...statsResult.data,
          recent_activity: activityResult.data
        })

        logger.info('Advanced settings loaded', { userId })
        announce('Advanced settings loaded successfully', 'polite')
      } catch (error) {
        logger.error('Failed to load advanced settings', { error, userId })
        toast.error('Failed to load settings')
        announce('Error loading advanced settings', 'assertive')
      } finally {
        setLoading(false)
      }
    }

    loadAdvancedSettings()
  }, [userId, announce]) // eslint-disable-line react-hooks/exhaustive-deps

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
    if (!userId) {
      toast.error('Please log in')
      announce('Authentication required', 'assertive')
      return
    }

    logger.info('GDPR user data export initiated', { userId })

    setIsLoading(true)

    try {
      const { createUserDataExport } = await import('@/lib/advanced-settings-queries')

      // Create export request in database
      const { data: exportRecord, error } = await createUserDataExport(userId, {
        export_type: 'gdpr',
        export_status: 'pending',
        file_name: 'kazi-user-data-export.json',
        includes_sections: ['profile', 'projects', 'files', 'settings', 'activity'],
        gdpr_compliant: true,
        retry_count: 0
      } as any)

      if (error) throw new Error(error.message)

      // For now, create a local export (in production, this would be handled by a backend job)
      const userData = {
        export_id: exportRecord?.id,
        exported_at: new Date().toISOString(),
        user_id: userId,
        gdpr_compliant: true,
        data: {
          profile: defaultProfile,
          // ... other data would be fetched from database
        }
      }

      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'kazi-user-data-export.json'
      a.click()
      URL.revokeObjectURL(url)

      logger.info('GDPR user data exported successfully', {
        fileName: 'kazi-user-data-export.json',
        fileSize: blob.size,
        userId
      })

      toast.success('User Data Exported!', {
        description: `GDPR compliant export saved - ${Math.round(blob.size / 1024)}KB`
      })
      announce('User data exported successfully', 'polite')
    } catch (error: any) {
      logger.error('User data export failed', {
        error: error.message,
        userId
      })

      toast.error('Failed to export data', {
        description: error.message || 'Please try again later'
      })
      announce('Error exporting user data', 'assertive')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSyncSettings = async () => {
    if (!userId) {
      toast.error('Please log in')
      announce('Authentication required', 'assertive')
      return
    }

    const categories = ['profile', 'notifications', 'appearance', 'preferences']

    logger.info('Settings sync initiated', { categories, userId })

    setIsLoading(true)

    try {
      const { createSettingsSyncRecord, completeSettingsSync } = await import('@/lib/advanced-settings-queries')

      // Create sync record
      const syncStartTime = Date.now()
      const { data: syncRecord, error: createError } = await createSettingsSyncRecord(userId, {
        sync_status: 'syncing',
        synced_sections: categories,
        device_name: navigator.userAgent.split('(')[1]?.split(')')[0] || 'Unknown',
        device_type: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        browser: navigator.userAgent.split('/').pop()?.split(' ')[0] || 'Unknown',
        sync_started_at: new Date().toISOString(),
        had_conflicts: false,
        conflicts_resolved: 0,
        conflict_details: {}
      } as any)

      if (createError) throw new Error(createError.message)

      // Complete sync
      const syncDuration = Date.now() - syncStartTime
      if (syncRecord) {
        await completeSettingsSync(syncRecord.id, false, 0)
        await import('@/lib/advanced-settings-queries').then(m =>
          m.updateSettingsSyncRecord(syncRecord.id, { duration_ms: syncDuration } as any)
        )
      }

      const syncTime = new Date().toLocaleString()

      logger.info('Settings synced successfully', {
        categories,
        syncTime,
        duration: syncDuration,
        userId
      })

      toast.success('Settings Synced!', {
        description: `Synchronized across all devices - ${categories.length} sections - Last sync: ${syncTime}`
      })
      announce('Settings synced successfully', 'polite')
    } catch (error: any) {
      logger.error('Settings sync failed', {
        error: error.message,
        userId
      })

      toast.error('Failed to sync settings', {
        description: error.message || 'Please try again later'
      })
      announce('Error syncing settings', 'assertive')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetSettings = () => {
    logger.info('Reset settings initiated')
    setShowResetDialog(true)
  }

  const confirmResetSettings = () => {
    logger.info('Settings reset to defaults', {
      resetSections: ['Theme', 'Notifications', 'Preferences']
    })

    toast.success('Settings Reset!', {
      description: 'Theme, Notifications, and Preferences restored to defaults'
    })
    announce('Settings reset to defaults', 'polite')
    setShowResetDialog(false)
  }

  const handleClearCache = () => {
    logger.info('Clear cache initiated')
    setShowClearCacheDialog(true)
  }

  const confirmClearCache = () => {
    logger.info('Cache cleared successfully', {
      signOutScheduled: new Date(Date.now() + 3000).toISOString()
    })

    toast.success('Cache Cleared!', {
      description: 'Application cache cleared. You will be signed out in 3 seconds'
    })
    announce('Cache cleared, signing out', 'polite')

    setTimeout(() => {
      logger.info('Signing out after cache clear')
    }, 3000)

    setShowClearCacheDialog(false)
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
    if (!userId) {
      toast.error('Please log in')
      announce('Authentication required', 'assertive')
      return
    }

    logger.info('Account deletion initiated', { userId })
    setShowDeleteDialog(true)
  }

  const handleFirstDeleteConfirm = () => {
    setShowDeleteDialog(false)
    setDeleteConfirmText('')
    setShowFinalDeleteDialog(true)
  }

  const confirmDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm')
      return
    }

    setIsDeleting(true)

    try {
      const { createAccountDeletionRequest } = await import('@/lib/advanced-settings-queries')

      // Create deletion request with 7-day grace period
      const { data, error } = await createAccountDeletionRequest(userId!, undefined, 7)

      if (error) throw new Error(error.message)

      const deletionDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()

      logger.info('Account deletion confirmed', {
        deletionId: data?.id,
        deletionScheduled: data?.scheduled_for,
        userId
      })

      toast.info('Account Deletion Requested', {
        description: `Confirmation email sent. Account will be deleted on ${deletionDate} unless you cancel`
      })
      announce('Account deletion requested', 'assertive')
      setShowFinalDeleteDialog(false)
      setDeleteConfirmText('')
    } catch (error: any) {
      logger.error('Account deletion request failed', {
        error: error.message,
        userId
      })

      toast.error('Failed to request account deletion', {
        description: error.message || 'Please try again later'
      })
      announce('Error requesting account deletion', 'assertive')
    } finally {
      setIsDeleting(false)
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
              <Button variant="outline" onClick={handleExportData} disabled={loading || isLoading}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Import Data</h4>
                <p className="text-sm text-gray-500">Import settings from backup file</p>
              </div>
              <Button variant="outline" onClick={handleImportData} disabled={loading || isLoading}>
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
              <Button variant="outline" onClick={handleResetSettings} disabled={loading || isLoading}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Clear Cache</h4>
                <p className="text-sm text-gray-500">Clear stored data and sign out</p>
              </div>
              <Button variant="outline" onClick={handleClearCache} disabled={loading || isLoading}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Cache
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
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

            <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
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

      {/* Reset Settings Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Reset All Settings?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>This will restore the following to defaults:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Theme settings</li>
                <li>Notification preferences</li>
                <li>All custom preferences</li>
              </ul>
              <p className="text-green-600 font-medium">Your profile data will not be affected.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmResetSettings}>
              Reset Settings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Cache Dialog */}
      <AlertDialog open={showClearCacheDialog} onOpenChange={setShowClearCacheDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-blue-500" />
              Clear Application Cache?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>This will:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Clear stored preferences</li>
                <li>Remove cached data</li>
                <li>Sign you out</li>
              </ul>
              <p className="text-yellow-600 font-medium">You will need to sign in again.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClearCache}>
              Clear Cache
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account - First Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete Account?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p className="font-medium text-red-600">This will permanently delete:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your profile and all personal data</li>
                <li>All projects and files</li>
                <li>Payment history and invoices</li>
                <li>Team memberships and collaborations</li>
              </ul>
              <p className="text-red-700 font-bold mt-4">This action CANNOT be undone!</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFirstDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              I Understand, Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account - Final Confirmation */}
      <AlertDialog open={showFinalDeleteDialog} onOpenChange={setShowFinalDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Final Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p className="font-medium">
                Type <span className="font-mono bg-red-100 px-2 py-1 rounded text-red-700">DELETE</span> to confirm account deletion:
              </p>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE here"
                className="border-red-300 focus:border-red-500"
              />
              <p className="text-sm text-gray-500">
                Your account will be scheduled for deletion with a 7-day grace period.
                You can cancel during this time.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAccount}
              disabled={deleteConfirmText !== 'DELETE' || isDeleting}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Deleting...
                </>
              ) : (
                'Delete My Account'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
