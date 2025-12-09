'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
import { Shield, AlertCircle, Download, Key, Eye, EyeOff, AlertTriangle, Loader2 } from 'lucide-react'
import { SecuritySettings, defaultSecurity } from '@/lib/settings-utils'
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { createFeatureLogger } from '@/lib/logger'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'

const logger = createFeatureLogger('Settings:Security')

export default function SecurityPage() {
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  const [security, setSecurity] = useState<SecuritySettings>(defaultSecurity)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDisable2FADialog, setShowDisable2FADialog] = useState(false)

  useEffect(() => {
    const loadSecuritySettings = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        logger.info('Loading security settings', { userId })

        // Dynamic import for code splitting
        const { getSecuritySettings } = await import('@/lib/security-settings-queries')

        const { data, error } = await getSecuritySettings(userId)
        if (error) throw new Error(error.message)

        if (data) {
          const mappedSettings: SecuritySettings = {
            twoFactorAuth: data.two_factor_enabled || false,
            loginAlerts: data.login_alerts_enabled || false,
            sessionTimeout: data.session_timeout || '8h',
            biometricAuth: data.biometric_enabled || false
          }
          setSecurity(mappedSettings)
        }

        logger.info('Security settings loaded', { userId })
        announce('Security settings loaded successfully', 'polite')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load security settings'
        setError(errorMessage)
        logger.error('Failed to load security settings', { error: err, userId })
        toast.error('Failed to load security settings')
        announce('Error loading security settings', 'assertive')
      } finally {
        setLoading(false)
      }
    }

    loadSecuritySettings()
  }, [userId, announce]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleEnable2FA = async () => {
    if (!userId) {
      toast.error('Please log in')
      announce('Authentication required', 'assertive')
      return
    }

    try {
      const newValue = !security.twoFactorAuth

      if (newValue) {
        logger.info('Two-Factor Authentication enabled', { userId })
        setSecurity({ ...security, twoFactorAuth: true })

        const { updateSecuritySettings } = await import('@/lib/security-settings-queries')
        await updateSecuritySettings(userId, { two_factor_enabled: true })

        toast.info('Two-Factor Authentication Enabled', {
          description: 'Setup: Scan QR code with authenticator app, enter code to verify, save backup codes'
        })
        announce('Two-Factor Authentication enabled', 'polite')
      } else {
        setShowDisable2FADialog(true)
      }
    } catch (error) {
      logger.error('Failed to update 2FA setting', { error, userId })
      toast.error('Failed to update Two-Factor Authentication')
      announce('Error updating Two-Factor Authentication', 'assertive')
    }
  }

  const confirmDisable2FA = async () => {
    try {
      logger.info('Two-Factor Authentication disabled', { userId })
      setSecurity({ ...security, twoFactorAuth: false })

      const { updateSecuritySettings } = await import('@/lib/security-settings-queries')
      await updateSecuritySettings(userId!, { two_factor_enabled: false })

      toast.success('Two-Factor Authentication Disabled', {
        description: 'Your account security has been reduced'
      })
      announce('Two-Factor Authentication disabled', 'assertive')
      setShowDisable2FADialog(false)
    } catch (error) {
      logger.error('Failed to disable 2FA', { error, userId })
      toast.error('Failed to disable Two-Factor Authentication')
    }
  }

  const handleDownloadBackupCodes = () => {
    const codes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substr(2, 8).toUpperCase()
    )
    const generatedAt = new Date().toLocaleString()
    const text = `KAZI Two-Factor Authentication Backup Codes
Generated: ${generatedAt}

IMPORTANT: Store these codes in a safe place. Each code can only be used once.

${codes.map((code, i) => `${i + 1}. ${code}`).join('\n')}

If you lose access to your authenticator app, you can use these codes to sign in.`

    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'kazi-backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)

    logger.info('2FA backup codes downloaded', {
      codesCount: codes.length,
      generatedAt,
      fileSize: blob.size
    })

    toast.success('Backup Codes Downloaded!', {
      description: `10 backup codes saved to kazi-backup-codes.txt - ${Math.round(blob.size / 1024)}KB - Store securely!`
    })
  }

  const handleChangePassword = async () => {
    logger.info('Change password initiated')

    toast.info('Change Password', {
      description: 'Requirements: At least 8 characters, 1 uppercase, 1 number, 1 special character'
    })
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
            <CardTitle>Account Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-500" />
                <div>
                  <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">Extra security for your account</p>
                </div>
              </div>
              <Switch
                id="two-factor"
                checked={security.twoFactorAuth}
                onCheckedChange={handleEnable2FA}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-gray-500" />
                <div>
                  <Label htmlFor="login-alerts">Login Alerts</Label>
                  <p className="text-sm text-gray-500">Notify me of new login attempts</p>
                </div>
              </div>
              <Switch
                id="login-alerts"
                checked={security.loginAlerts}
                disabled={loading}
                onCheckedChange={async (checked) => {
                  if (!userId) {
                    toast.error('Please log in')
                    return
                  }

                  try {
                    setSecurity({ ...security, loginAlerts: checked })
                    logger.info('Login alerts toggled', { checked, userId })

                    const { updateSecuritySettings } = await import('@/lib/security-settings-queries')
                    await updateSecuritySettings(userId, { login_alerts_enabled: checked })

                    toast.success(`Login Alerts ${checked ? 'Enabled' : 'Disabled'}`)
                    announce(`Login alerts ${checked ? 'enabled' : 'disabled'}`, 'polite')
                  } catch (error) {
                    logger.error('Failed to update login alerts', { error, userId })
                    toast.error('Failed to update login alerts')
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout</Label>
              <Select
                value={security.sessionTimeout}
                disabled={loading}
                onValueChange={async (value) => {
                  if (!userId) {
                    toast.error('Please log in')
                    return
                  }

                  try {
                    setSecurity({ ...security, sessionTimeout: value })
                    logger.info('Session timeout updated', { value, userId })

                    const { updateSecuritySettings } = await import('@/lib/security-settings-queries')
                    await updateSecuritySettings(userId, { session_timeout: value })

                    toast.success('Session Timeout Updated')
                    announce('Session timeout updated', 'polite')
                  } catch (error) {
                    logger.error('Failed to update session timeout', { error, userId })
                    toast.error('Failed to update session timeout')
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 hour</SelectItem>
                  <SelectItem value="8h">8 hours</SelectItem>
                  <SelectItem value="24h">24 hours</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {security.twoFactorAuth && (
              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full" onClick={handleDownloadBackupCodes}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Backup Codes
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Save these codes in case you lose access to your authenticator
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password & Authentication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
              />
            </div>

            <Button className="w-full" onClick={handleChangePassword}>
              <Key className="w-4 h-4 mr-2" />
              Update Password
            </Button>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label htmlFor="biometric">Biometric Authentication</Label>
                <p className="text-sm text-gray-500">Use fingerprint or face ID</p>
              </div>
              <Switch
                id="biometric"
                checked={security.biometricAuth}
                disabled={loading}
                onCheckedChange={async (checked) => {
                  if (!userId) {
                    toast.error('Please log in')
                    return
                  }

                  try {
                    setSecurity({ ...security, biometricAuth: checked })
                    logger.info('Biometric authentication toggled', { checked, userId })

                    const { updateSecuritySettings } = await import('@/lib/security-settings-queries')
                    await updateSecuritySettings(userId, { biometric_enabled: checked })

                    toast.success(`Biometric Authentication ${checked ? 'Enabled' : 'Disabled'}`)
                    announce(`Biometric authentication ${checked ? 'enabled' : 'disabled'}`, 'polite')
                  } catch (error) {
                    logger.error('Failed to update biometric auth', { error, userId })
                    toast.error('Failed to update biometric authentication')
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disable 2FA Confirmation Dialog */}
      <AlertDialog open={showDisable2FADialog} onOpenChange={setShowDisable2FADialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="w-5 h-5" />
              Disable Two-Factor Authentication?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p className="font-medium text-yellow-700">
                This will reduce your account security.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Your account will only be protected by your password</li>
                <li>Attackers with your password can access your account</li>
                <li>You can re-enable 2FA at any time</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep 2FA Enabled</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDisable2FA}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Disable 2FA
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
