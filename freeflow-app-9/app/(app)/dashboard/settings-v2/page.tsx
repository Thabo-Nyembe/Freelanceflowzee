"use client"

import { useState } from 'react'
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
  Upload
} from 'lucide-react'

/**
 * Settings V2 - Groundbreaking Settings Management
 * Showcases configuration with modern components
 */
export default function SettingsV2() {
  const [selectedTab, setSelectedTab] = useState<'profile' | 'account' | 'security' | 'notifications'>('profile')

  const stats = [
    { label: 'Account Age', value: '2.5 years', change: 0, icon: <User className="w-5 h-5" /> },
    { label: 'Security Score', value: '94%', change: 5.2, icon: <Shield className="w-5 h-5" /> },
    { label: 'API Calls', value: '12.4K', change: 15.3, icon: <Zap className="w-5 h-5" /> },
    { label: 'Storage Used', value: '45 GB', change: 8.7, icon: <Database className="w-5 h-5" /> }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50/30 to-zinc-50/40 dark:from-slate-950 dark:via-gray-950/30 dark:to-zinc-950/40 p-6">
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
            <ModernButton variant="outline" onClick={() => console.log('Export')}>
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </ModernButton>
            <GradientButton from="slate" to="gray" onClick={() => console.log('Save')}>
              <Save className="w-5 h-5 mr-2" />
              Save Changes
            </GradientButton>
          </div>
        </div>

        <StatGrid columns={4} stats={stats} />

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
                      <input type="text" placeholder="John" className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-slate-500" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Last Name</label>
                      <input type="text" placeholder="Doe" className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-slate-500" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <input type="email" placeholder="john@example.com" className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-slate-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Bio</label>
                    <textarea placeholder="Tell us about yourself..." rows={4} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-slate-500" />
                  </div>
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
                      <div className="w-12 h-6 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </BentoCard>
            )}
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <BentoQuickAction icon={<User />} title="Profile" description="Personal info" onClick={() => setSelectedTab('profile')} />
              <BentoQuickAction icon={<Shield />} title="Security" description="Password & 2FA" onClick={() => setSelectedTab('security')} />
              <BentoQuickAction icon={<Bell />} title="Notifications" description="Alerts" onClick={() => setSelectedTab('notifications')} />
              <BentoQuickAction icon={<Palette />} title="Appearance" description="Theme" onClick={() => console.log('Appearance')} />
            </div>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Profile Completeness" value="85%" change={5.0} />
                <MiniKPI label="Login Streak" value="12 days" change={12.0} />
                <MiniKPI label="API Rate Limit" value="94%" change={0} />
                <MiniKPI label="Security Level" value="High" change={0} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
