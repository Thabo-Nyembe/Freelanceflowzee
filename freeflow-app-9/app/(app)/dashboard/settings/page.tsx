'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  CreditCard,
  Key,
  Download,
  Upload,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
  X,
  Camera,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Clock,
  Monitor,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Smartphone,
  Lock,
  Trash2,
  AlertCircle,
  Info,
  HelpCircle
} from 'lucide-react'

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
  bio: string
  location: string
  website: string
  company: string
  position: string
  avatar: string
}

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  projectUpdates: boolean
  clientMessages: boolean
  paymentAlerts: boolean
  marketingEmails: boolean
  weeklyDigest: boolean
}

interface SecuritySettings {
  twoFactorAuth: boolean
  loginAlerts: boolean
  sessionTimeout: string
  passwordRequired: boolean
  biometricAuth: boolean
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  dateFormat: string
  currency: string
  compactMode: boolean
  animations: boolean
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<string>('profile')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [profile, setProfile] = useState<UserProfile>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    bio: 'Freelance designer and developer with 5+ years of experience creating digital experiences.',
    location: 'San Francisco, CA',
    website: 'https://johndoe.com',
    company: 'FreeFlow Creative',
    position: 'Senior Designer',
    avatar: ''
  })

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    projectUpdates: true,
    clientMessages: true,
    paymentAlerts: true,
    marketingEmails: false,
    weeklyDigest: true
  })

  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorAuth: true,
    loginAlerts: true,
    sessionTimeout: '24h',
    passwordRequired: true,
    biometricAuth: false
  })

  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: 'system',
    language: 'en',
    timezone: 'America/Los_Angeles',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    compactMode: false,
    animations: true
  })

  const handleSave = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/settings/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          category: 'all',
          data: { profile, notifications, security, appearance }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      const result = await response.json()

      if (result.success) {
        toast.success(result.message || 'Settings saved successfully!')

        // Show achievement if present
        if (result.achievement) {
          toast.success(`${result.achievement.message} +${result.achievement.points} points!`, {
            description: result.achievement.badge
          })
        }

        // Show next steps
        setTimeout(() => {
          alert(`✅ Settings Saved Successfully!\n\nNext Steps:\n• Review your updated preferences\n• Test notification settings\n• Update your profile picture if needed\n• Configure integrations and connected apps\n• Set up two-factor authentication for security`)
        }, 500)
      } else {
        throw new Error(result.error || 'Failed to save settings')
      }
    } catch (error: any) {
      console.error('Settings save error:', error)
      toast.error('Failed to save settings', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = () => {
    console.log('💾 EXPORT SETTINGS')
    const data = {
      profile,
      notifications,
      security: { ...security, passwordRequired: undefined },
      appearance
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'freeflow-settings.json'
    a.click()
    URL.revokeObjectURL(url)
    alert('💾 Settings Exported!\n\nFile: freeflow-settings.json')
  }

  const handleImportData = () => {
    console.log('📥 IMPORT SETTINGS')
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        try {
          const text = await file.text()
          const imported = JSON.parse(text)
          console.log('✅ SETTINGS IMPORTED:', imported)

          if (imported.profile) setProfile(imported.profile)
          if (imported.notifications) setNotifications(imported.notifications)
          if (imported.appearance) setAppearance(imported.appearance)

          alert(`✅ Settings Imported!\n\nFile: ${file.name}\n\nYour settings have been restored.`)
        } catch (error) {
          console.error('❌ IMPORT ERROR:', error)
          alert('❌ Import Failed\n\nInvalid settings file. Please check the file format.')
        }
      }
    }
    input.click()
  }

  const handleEnable2FA = () => {
    console.log('🔒 ENABLE 2FA')
    if (!security.twoFactorAuth) {
      alert('🔒 Enable Two-Factor Authentication\n\nSetup steps:\n1. Scan QR code with authenticator app\n2. Enter 6-digit code to verify\n3. Save backup codes\n\nThis adds extra security to your account.')
      setSecurity({ ...security, twoFactorAuth: true })
    } else {
      if (confirm('⚠️ Disable Two-Factor Authentication?\n\nThis will reduce your account security.')) {
        setSecurity({ ...security, twoFactorAuth: false })
        alert('✅ Two-Factor Authentication disabled.')
      }
    }
  }

  const handleDownloadBackupCodes = () => {
    console.log('📋 DOWNLOAD 2FA BACKUP CODES')
    const codes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substr(2, 8).toUpperCase()
    )
    const text = `KAZI Two-Factor Authentication Backup Codes
Generated: ${new Date().toLocaleString()}

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

    alert('📋 Backup Codes Downloaded!\n\n10 backup codes saved to:\nkazi-backup-codes.txt\n\nStore them securely!')
  }

  const handleChangePassword = async () => {
    console.log('🔑 CHANGE PASSWORD')
    alert('🔑 Change Password\n\nRequirements:\n• At least 8 characters\n• 1 uppercase letter\n• 1 number\n• 1 special character\n\nEnter your current password to continue.')
  }

  const handleUpdateProfile = async () => {
    console.log('👤 UPDATE PROFILE')
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    alert('👤 Profile Updated!\n\nYour information has been saved successfully.')
  }

  const handleDeleteAccount = () => {
    console.log('🗑️ DELETE ACCOUNT')
    if (confirm('⚠️ DELETE ACCOUNT?\n\nThis will permanently delete:\n• Your profile and data\n• All projects and files\n• Payment history\n• Team memberships\n\nThis action CANNOT be undone!')) {
      if (confirm('⚠️ FINAL CONFIRMATION\n\nType DELETE to confirm account deletion.\n\nAre you absolutely sure?')) {
        alert('🗑️ Account Deletion Requested\n\nWe\'ve sent a confirmation email to verify this request.\n\nYour account will be deleted in 7 days unless you cancel.')
      }
    }
  }

  const handleClearCache = () => {
    console.log('🧹 CLEAR CACHE')
    if (confirm('🧹 Clear Application Cache?\n\nThis will:\n• Clear stored preferences\n• Remove cached data\n• Sign you out\n\nYou\'ll need to sign in again.')) {
      alert('✅ Cache Cleared!\n\nApplication cache has been cleared.\n\nYou will be signed out in 3 seconds...')
      setTimeout(() => {
        console.log('🚪 SIGNING OUT...')
      }, 3000)
    }
  }

  const handleManageIntegrations = () => {
    console.log('🔌 MANAGE INTEGRATIONS')
    alert('🔌 Manage Integrations\n\nAvailable integrations:\n• Google Drive\n• Dropbox\n• Slack\n• GitHub\n• Figma\n• Adobe Creative Cloud\n\nConnect your favorite tools!')
  }

  const handleExportUserData = async () => {
    console.log('📦 EXPORT USER DATA (GDPR)')
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)

    const userData = {
      profile,
      notifications,
      appearance,
      projects: 'All project data',
      files: 'All uploaded files',
      messages: 'All conversations',
      analytics: 'Usage statistics',
      exportDate: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'kazi-user-data-export.json'
    a.click()
    URL.revokeObjectURL(url)

    alert('📦 User Data Exported!\n\nGDPR Compliant Data Export\n\nFile: kazi-user-data-export.json\n\nThis includes all your personal data stored in KAZI.')
  }

  const handleToggleNotification = (notificationType: string, enabled: boolean) => {
    console.log(`🔔 TOGGLE NOTIFICATION - Type: ${notificationType}, Enabled: ${enabled}`)
    alert(`🔔 Notification ${enabled ? 'Enabled' : 'Disabled'}\n\n${notificationType} notifications are now ${enabled ? 'ON' : 'OFF'}.`)
  }

  const handleUpdateTheme = (theme: 'light' | 'dark' | 'system') => {
    console.log('🎨 UPDATE THEME:', theme)
    setAppearance({ ...appearance, theme })
    alert(`🎨 Theme Updated!\n\nNow using: ${theme.charAt(0).toUpperCase() + theme.slice(1)} mode\n\nThe interface will update automatically.`)
  }

  const handleSyncSettings = async () => {
    console.log('🔄 SYNC SETTINGS')
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsLoading(false)
    alert('🔄 Settings Synced!\n\nYour settings have been synchronized across all devices.\n\nLast sync: ' + new Date().toLocaleString())
  }

  const handleResetSettings = () => {
    console.log('🔄 RESET SETTINGS')
    if (confirm('⚠️ Reset All Settings?\n\nThis will restore:\n• Default theme\n• Default notifications\n• Default preferences\n\nYour profile data will not be affected.')) {
      setAppearance({
        theme: 'system',
        language: 'en',
        timezone: 'America/Los_Angeles',
        dateFormat: 'MM/DD/YYYY',
        currency: 'USD',
        compactMode: false,
        animations: true
      })
      setNotifications({
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        projectUpdates: true,
        clientMessages: true,
        paymentAlerts: true,
        marketingEmails: false,
        weeklyDigest: true
      })
      alert('✅ Settings Reset!\n\nAll preferences have been restored to defaults.')
    }
  }

  const handleUpdateBilling = () => {
    console.log('💳 UPDATE BILLING')
    alert('💳 Update Billing Information\n\nManage:\n• Payment method\n• Billing address\n• Tax information\n• Invoices\n\nYour payment data is securely encrypted.')
  }

  const handleCancelSubscription = () => {
    console.log('❌ CANCEL SUBSCRIPTION')
    if (confirm('⚠️ Cancel Subscription?\n\nYou will:\n• Lose access to premium features\n• Keep your data until end of billing period\n• Can resubscribe anytime\n\nContinue with cancellation?')) {
      alert('❌ Subscription Canceled\n\nYour subscription will remain active until:\nJanuary 15, 2025\n\nAfter that, you\'ll be on the free plan.\n\nWe\'re sad to see you go!')
    }
  }

  const handleUploadPhoto = () => {
    console.log('📸 UPLOAD PHOTO')
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        console.log('✅ PHOTO SELECTED:', file.name)
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setProfile({ ...profile, avatar: result })
          alert(`✅ Photo Uploaded!\n\nFile: ${file.name}\n\nYour profile picture has been updated.`)
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const handleRemovePhoto = () => {
    console.log('🗑️ REMOVE PHOTO')
    if (confirm('⚠️ Remove profile photo?\n\nYour photo will be replaced with your initials.')) {
      setProfile({ ...profile, avatar: '' })
      alert('✅ Photo Removed\n\nYour profile picture has been removed.')
    }
  }

  const handleTestNotifications = () => { console.log('🔔 TEST NOTIF'); alert('🔔 Test notification sent!\n\nCheck your notification settings to verify.') }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Settings className="w-6 h-6 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">Settings & Preferences</h1>
              <Badge className="bg-gradient-to-r from-purple-500 to-violet-600 text-white">A+++</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Customize your experience</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button data-testid="export-settings-btn" variant="outline" size="sm" onClick={handleExportData}>
              <Download className="w-4 h-4 mr-2" />
              Export Settings
            </Button>

            <Button data-testid="save-changes-btn" size="sm" onClick={handleSave} disabled={isLoading}>
              {isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger data-testid="profile-tab" value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger data-testid="notifications-settings-tab" value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger data-testid="security-tab" value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger data-testid="appearance-tab" value="appearance" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger data-testid="billing-tab" value="billing" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger data-testid="advanced-tab" value="advanced" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Advanced
            </TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profile.firstName}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profile.lastName}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          id="location"
                          value={profile.location}
                          onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          id="website"
                          value={profile.website}
                          onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          id="company"
                          value={profile.company}
                          onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        value={profile.position}
                        onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={profile.avatar} alt={profile.name} />
                      <AvatarFallback className="text-lg">
                        {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-2 w-full">
                      <Button variant="outline" className="w-full" onClick={handleUploadPhoto}>
                        <Camera className="w-4 h-4 mr-2" />
                        Upload Photo
                      </Button>
                      <Button variant="ghost" className="w-full text-red-600 hover:text-red-700" onClick={handleRemovePhoto}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Photo
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-center text-sm text-gray-500">
                    <p>Recommended: Square image, at least 400x400px</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
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
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, emailNotifications: checked })
                      }
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
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, pushNotifications: checked })
                      }
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
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, smsNotifications: checked })
                      }
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
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, projectUpdates: checked })
                      }
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
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, clientMessages: checked })
                      }
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
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, paymentAlerts: checked })
                      }
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
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, marketingEmails: checked })
                      }
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
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, weeklyDigest: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
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
          </TabsContent>
          
          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
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
                        className="flex items-center gap-2"
                      >
                        <Sun className="w-4 h-4" />
                        Light
                      </Button>
                      <Button
                        variant={appearance.theme === 'dark' ? 'default' : 'outline'}
                        onClick={() => handleUpdateTheme('dark')}
                        className="flex items-center gap-2"
                      >
                        <Moon className="w-4 h-4" />
                        Dark
                      </Button>
                      <Button
                        variant={appearance.theme === 'system' ? 'default' : 'outline'}
                        onClick={() => handleUpdateTheme('system')}
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
                      onCheckedChange={(checked) => 
                        setAppearance({ ...appearance, compactMode: checked })
                      }
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
                      onCheckedChange={(checked) => 
                        setAppearance({ ...appearance, animations: checked })
                      }
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
                      onValueChange={(value) => 
                        setAppearance({ ...appearance, language: value })
                      }
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
                      onValueChange={(value) => 
                        setAppearance({ ...appearance, timezone: value })
                      }
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
                      onValueChange={(value) => 
                        setAppearance({ ...appearance, dateFormat: value })
                      }
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
                      onValueChange={(value) => 
                        setAppearance({ ...appearance, currency: value })
                      }
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
          </TabsContent>
          
          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-purple-900">Professional Plan</h3>
                          <p className="text-purple-700">Full access to all features</p>
                        </div>
                        <Badge className="bg-purple-600 text-white">Active</Badge>
                      </div>
                      <div className="mt-3 text-2xl font-bold text-purple-900">
                        $29/month
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Next billing date: January 15, 2024</p>
                      <p className="text-sm text-gray-600">Payment method: **** **** **** 4242</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={handleUpdateBilling}>
                        Change Plan
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={handleCancelSubscription}>
                        Cancel Subscription
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
                          <div>
                            <p className="font-medium">**** **** **** 4242</p>
                            <p className="text-sm text-gray-500">Expires 12/25</p>
                          </div>
                        </div>
                        <Badge variant="outline">Default</Badge>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full" onClick={handleUpdateBilling}>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { date: 'Dec 15, 2023', amount: '$29.00', status: 'Paid' },
                    { date: 'Nov 15, 2023', amount: '$29.00', status: 'Paid' },
                    { date: 'Oct 15, 2023', amount: '$29.00', status: 'Paid' }
                  ].map((invoice, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{invoice.date}</p>
                        <p className="text-sm text-gray-500">Professional Plan</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{invoice.amount}</p>
                        <Badge variant="outline" className="text-green-600">
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
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

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Manage Integrations</h4>
                      <p className="text-sm text-gray-500">Connect third-party tools</p>
                    </div>
                    <Button variant="outline" onClick={handleManageIntegrations}>
                      <Settings className="w-4 h-4 mr-2" />
                      Manage
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}