'use client'

import { useState, useEffect } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton,
  IconButton
} from '@/components/ui/modern-buttons'
import {
  Settings,
  User,
  Bell,
  Shield,
  Lock,
  Palette,
  Globe,
  CreditCard,
  Mail,
  Smartphone,
  Key,
  Database,
  Zap,
  Save,
  Download,
  Upload,
  Check
} from 'lucide-react'
import { useUserSettings } from '@/lib/hooks/use-user-settings'
import { updateProfile, updateNotificationSettings, updateSecuritySettings, updateAppearanceSettings, generateApiKey } from '@/app/actions/user-settings'

interface SettingsClientProps {
  initialSettings: any
  initialStats: {
    profileCompleteness: number
    storageUsedGB: number
    storageLimitGB: number
    securityScore: number
    accountAge: string
  }
}

export default function SettingsClient({ initialSettings, initialStats }: SettingsClientProps) {
  const [selectedTab, setSelectedTab] = useState<'profile' | 'account' | 'security' | 'notifications'>('profile')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const { settings, stats, fetchSettings } = useUserSettings(initialSettings)
  const displaySettings = settings || initialSettings
  const displayStats = stats || initialStats

  const [formData, setFormData] = useState({
    first_name: displaySettings?.first_name || '',
    last_name: displaySettings?.last_name || '',
    display_name: displaySettings?.display_name || '',
    bio: displaySettings?.bio || '',
    email_notifications: displaySettings?.email_notifications ?? true,
    push_notifications: displaySettings?.push_notifications ?? true,
    marketing_emails: displaySettings?.marketing_emails ?? false,
    weekly_digest: displaySettings?.weekly_digest ?? true,
    two_factor_enabled: displaySettings?.two_factor_enabled ?? false,
    theme: displaySettings?.theme || 'system',
    accent_color: displaySettings?.accent_color || 'blue',
    compact_mode: displaySettings?.compact_mode ?? false
  })

  useEffect(() => {
    if (displaySettings) {
      setFormData({
        first_name: displaySettings.first_name || '',
        last_name: displaySettings.last_name || '',
        display_name: displaySettings.display_name || '',
        bio: displaySettings.bio || '',
        email_notifications: displaySettings.email_notifications ?? true,
        push_notifications: displaySettings.push_notifications ?? true,
        marketing_emails: displaySettings.marketing_emails ?? false,
        weekly_digest: displaySettings.weekly_digest ?? true,
        two_factor_enabled: displaySettings.two_factor_enabled ?? false,
        theme: displaySettings.theme || 'system',
        accent_color: displaySettings.accent_color || 'blue',
        compact_mode: displaySettings.compact_mode ?? false
      })
    }
  }, [displaySettings])

  const statsDisplay = [
    { label: 'Account Age', value: displayStats?.accountAge || '0 days', change: 0, icon: <User className="w-5 h-5" /> },
    { label: 'Security Score', value: `${displayStats?.securityScore || 50}%`, change: 5.2, icon: <Shield className="w-5 h-5" /> },
    { label: 'API Rate Limit', value: '94%', change: 0, icon: <Zap className="w-5 h-5" /> },
    { label: 'Storage Used', value: `${displayStats?.storageUsedGB || 0} GB`, change: 8.7, icon: <Database className="w-5 h-5" /> }
  ]

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      await updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        display_name: formData.display_name,
        bio: formData.bio
      })
      setSaveMessage('Profile saved!')
      fetchSettings()
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      console.error('Error saving profile:', error)
      setSaveMessage('Error saving profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    setIsSaving(true)
    try {
      await updateNotificationSettings({
        email_notifications: formData.email_notifications,
        push_notifications: formData.push_notifications,
        marketing_emails: formData.marketing_emails,
        weekly_digest: formData.weekly_digest
      })
      setSaveMessage('Notifications saved!')
      fetchSettings()
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      console.error('Error saving notifications:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveSecurity = async () => {
    setIsSaving(true)
    try {
      await updateSecuritySettings({
        two_factor_enabled: formData.two_factor_enabled
      })
      setSaveMessage('Security settings saved!')
      fetchSettings()
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      console.error('Error saving security settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveAppearance = async () => {
    setIsSaving(true)
    try {
      await updateAppearanceSettings({
        theme: formData.theme as 'light' | 'dark' | 'system',
        accent_color: formData.accent_color,
        compact_mode: formData.compact_mode
      })
      setSaveMessage('Appearance settings saved!')
      fetchSettings()
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      console.error('Error saving appearance:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerateApiKey = async () => {
    try {
      await generateApiKey()
      setSaveMessage('API key generated!')
      fetchSettings()
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      console.error('Error generating API key:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50/30 to-zinc-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Settings className="w-10 h-10 text-slate-600" />
              Settings
            </h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
          <div className="flex items-center gap-3">
            {saveMessage && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <Check className="w-4 h-4" />
                {saveMessage}
              </span>
            )}
            <ModernButton variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </ModernButton>
          </div>
        </div>

        <StatGrid columns={4} stats={statsDisplay} />

        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          <PillButton variant={selectedTab === 'profile' ? 'primary' : 'ghost'} onClick={() => setSelectedTab('profile')}>
            <User className="w-4 h-4 mr-2" />
            Profile
          </PillButton>
          <PillButton variant={selectedTab === 'account' ? 'primary' : 'ghost'} onClick={() => setSelectedTab('account')}>
            <Settings className="w-4 h-4 mr-2" />
            Account
          </PillButton>
          <PillButton variant={selectedTab === 'security' ? 'primary' : 'ghost'} onClick={() => setSelectedTab('security')}>
            <Shield className="w-4 h-4 mr-2" />
            Security
          </PillButton>
          <PillButton variant={selectedTab === 'notifications' ? 'primary' : 'ghost'} onClick={() => setSelectedTab('notifications')}>
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {selectedTab === 'profile' && (
              <BentoCard className="p-6">
                <h3 className="text-xl font-semibold mb-6">Profile Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">First Name</label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                        placeholder="John"
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-slate-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Last Name</label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                        placeholder="Doe"
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-slate-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Display Name</label>
                    <input
                      type="text"
                      value={formData.display_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                      placeholder="John Doe"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>
                  <ModernButton variant="primary" onClick={handleSaveProfile} disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Profile'}
                  </ModernButton>
                </div>
              </BentoCard>
            )}

            {selectedTab === 'account' && (
              <BentoCard className="p-6">
                <h3 className="text-xl font-semibold mb-6">Appearance Settings</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Theme
                    </h4>
                    <div className="flex gap-2">
                      {['light', 'dark', 'system'].map((theme) => (
                        <button
                          key={theme}
                          onClick={() => setFormData(prev => ({ ...prev, theme }))}
                          className={`px-4 py-2 rounded-lg border ${formData.theme === theme ? 'border-slate-500 bg-slate-100 dark:bg-slate-800' : 'border-border'}`}
                        >
                          {theme.charAt(0).toUpperCase() + theme.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Accent Color</h4>
                    <div className="flex gap-2">
                      {['blue', 'green', 'purple', 'orange', 'red'].map((color) => (
                        <button
                          key={color}
                          onClick={() => setFormData(prev => ({ ...prev, accent_color: color }))}
                          className={`w-10 h-10 rounded-full border-2 ${formData.accent_color === color ? 'ring-2 ring-offset-2 ring-slate-500' : ''}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/50">
                    <div>
                      <p className="font-medium">Compact Mode</p>
                      <p className="text-sm text-muted-foreground">Reduce spacing in the interface</p>
                    </div>
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, compact_mode: !prev.compact_mode }))}
                      className={`w-12 h-6 rounded-full transition-colors ${formData.compact_mode ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${formData.compact_mode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <ModernButton variant="primary" onClick={handleSaveAppearance} disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Appearance'}
                  </ModernButton>
                </div>
              </BentoCard>
            )}

            {selectedTab === 'security' && (
              <BentoCard className="p-6">
                <h3 className="text-xl font-semibold mb-6">Security Settings</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Password
                    </h4>
                    <div className="space-y-3">
                      <input type="password" placeholder="Current password" className="w-full px-4 py-2 rounded-lg border border-border bg-background" />
                      <input type="password" placeholder="New password" className="w-full px-4 py-2 rounded-lg border border-border bg-background" />
                      <input type="password" placeholder="Confirm new password" className="w-full px-4 py-2 rounded-lg border border-border bg-background" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      Two-Factor Authentication
                    </h4>
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/50">
                      <div>
                        <p className="font-medium">Enable 2FA</p>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                      </div>
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, two_factor_enabled: !prev.two_factor_enabled }))}
                        className={`w-12 h-6 rounded-full transition-colors ${formData.two_factor_enabled ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${formData.two_factor_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      API Key
                    </h4>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={displaySettings?.api_key || 'No API key generated'}
                        readOnly
                        className="flex-1 px-4 py-2 rounded-lg border border-border bg-muted font-mono text-sm"
                      />
                      <ModernButton variant="outline" onClick={handleGenerateApiKey}>
                        Generate New
                      </ModernButton>
                    </div>
                  </div>
                  <ModernButton variant="primary" onClick={handleSaveSecurity} disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Security Settings'}
                  </ModernButton>
                </div>
              </BentoCard>
            )}

            {selectedTab === 'notifications' && (
              <BentoCard className="p-6">
                <h3 className="text-xl font-semibold mb-6">Notification Preferences</h3>
                <div className="space-y-4">
                  {[
                    { key: 'email_notifications', label: 'Email Notifications', desc: 'Receive important updates via email' },
                    { key: 'push_notifications', label: 'Push Notifications', desc: 'Get real-time notifications on your device' },
                    { key: 'marketing_emails', label: 'Marketing Emails', desc: 'Receive news about features and offers' },
                    { key: 'weekly_digest', label: 'Weekly Digest', desc: 'Get a summary of your activity each week' }
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/50">
                      <div>
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-muted-foreground">{desc}</p>
                      </div>
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                        className={`w-12 h-6 rounded-full transition-colors ${formData[key as keyof typeof formData] ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${formData[key as keyof typeof formData] ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  ))}
                  <ModernButton variant="primary" onClick={handleSaveNotifications} disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Notifications'}
                  </ModernButton>
                </div>
              </BentoCard>
            )}
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <BentoQuickAction icon={<User />} title="Profile" description="Personal info" onClick={() => setSelectedTab('profile')} />
              <BentoQuickAction icon={<Shield />} title="Security" description="Password & 2FA" onClick={() => setSelectedTab('security')} />
              <BentoQuickAction icon={<Bell />} title="Notifications" description="Alerts" onClick={() => setSelectedTab('notifications')} />
              <BentoQuickAction icon={<Palette />} title="Appearance" description="Theme" onClick={() => setSelectedTab('account')} />
            </div>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Profile Completeness" value={`${displayStats?.profileCompleteness || 0}%`} change={5.0} />
                <MiniKPI label="Storage Used" value={`${displayStats?.storageUsedGB || 0} / ${displayStats?.storageLimitGB || 100} GB`} change={0} />
                <MiniKPI label="Security Level" value={displayStats?.securityScore >= 80 ? 'High' : displayStats?.securityScore >= 50 ? 'Medium' : 'Low'} change={0} />
                <MiniKPI label="Account Age" value={displayStats?.accountAge || '0 days'} change={0} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
