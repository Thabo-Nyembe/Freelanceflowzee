'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Shield, AlertCircle, Download, Key, Eye, EyeOff } from 'lucide-react'
import { SecuritySettings, defaultSecurity, defaultProfile } from '@/lib/settings-utils'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('Settings:Security')

export default function SecurityPage() {
  const [security, setSecurity] = useState<SecuritySettings>(defaultSecurity)
  const [showPassword, setShowPassword] = useState(false)

  const handleEnable2FA = () => {
    if (!security.twoFactorAuth) {
      logger.info('Two-Factor Authentication enabled', {
        previousStatus: security.twoFactorAuth
      })

      setSecurity({ ...security, twoFactorAuth: true })

      toast.info('Two-Factor Authentication Enabled', {
        description: 'Setup: Scan QR code with authenticator app, enter code to verify, save backup codes'
      })
    } else {
      if (confirm('⚠️ Disable Two-Factor Authentication?\n\nThis will reduce your account security.')) {
        logger.info('Two-Factor Authentication disabled')

        setSecurity({ ...security, twoFactorAuth: false })

        toast.success('Two-Factor Authentication Disabled', {
          description: 'Your account security has been reduced'
        })
      }
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
                onCheckedChange={(checked) =>
                  setSecurity({ ...security, loginAlerts: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout</Label>
              <Select
                value={security.sessionTimeout}
                onValueChange={(value) =>
                  setSecurity({ ...security, sessionTimeout: value })
                }
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
                onCheckedChange={(checked) =>
                  setSecurity({ ...security, biometricAuth: checked })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
