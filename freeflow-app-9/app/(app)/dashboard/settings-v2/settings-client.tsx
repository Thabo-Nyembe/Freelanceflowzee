'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
  Check,
  Search,
  Filter,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  RefreshCw,
  LogOut,
  Monitor,
  Moon,
  Sun,
  Laptop,
  Camera,
  Edit,
  Link2,
  Unlink,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Chrome,
  Fingerprint,
  History,
  FileText,
  HardDrive,
  Cloud,
  Languages,
  Accessibility,
  Volume2,
  Type,
  Contrast,
  MousePointer,
  Keyboard,
  BellRing,
  BellOff,
  MessageSquare,
  AtSign,
  Users,
  Calendar,
  Activity,
  Wifi,
  ExternalLink
} from 'lucide-react'

// Types
type ThemeMode = 'light' | 'dark' | 'system'
type NotificationType = 'all' | 'important' | 'none'
type PrivacyLevel = 'public' | 'contacts' | 'private'
type SessionStatus = 'active' | 'expired'
type IntegrationStatus = 'connected' | 'disconnected' | 'error'
type PlanTier = 'free' | 'pro' | 'enterprise'

interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  displayName: string
  avatar: string
  bio: string
  phone: string
  location: string
  website: string
  timezone: string
  language: string
  createdAt: string
}

interface SecuritySettings {
  twoFactorEnabled: boolean
  twoFactorMethod: 'app' | 'sms' | 'email'
  passwordLastChanged: string
  securityScore: number
  loginNotifications: boolean
  trustedDevices: number
}

interface Session {
  id: string
  device: string
  browser: string
  location: string
  ipAddress: string
  lastActive: string
  status: SessionStatus
  isCurrent: boolean
}

interface Integration {
  id: string
  name: string
  icon: string
  status: IntegrationStatus
  connectedAt: string | null
  scopes: string[]
  lastSync: string | null
}

interface NotificationPreference {
  id: string
  category: string
  email: boolean
  push: boolean
  inApp: boolean
  sms: boolean
}

interface BillingInfo {
  plan: PlanTier
  billingCycle: 'monthly' | 'yearly'
  nextBillingDate: string
  amount: number
  paymentMethod: string
  cardLast4: string
}

interface Invoice {
  id: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'failed'
  downloadUrl: string
}

// Mock Data
const mockProfile: UserProfile = {
  id: '1',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  displayName: 'John Doe',
  avatar: '/avatars/user.jpg',
  bio: 'Product designer and developer passionate about creating beautiful user experiences.',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  website: 'https://johndoe.com',
  timezone: 'America/Los_Angeles',
  language: 'en-US',
  createdAt: '2023-01-15T09:00:00Z'
}

const mockSecurity: SecuritySettings = {
  twoFactorEnabled: true,
  twoFactorMethod: 'app',
  passwordLastChanged: '2024-01-01T10:00:00Z',
  securityScore: 85,
  loginNotifications: true,
  trustedDevices: 3
}

const mockSessions: Session[] = [
  { id: '1', device: 'MacBook Pro', browser: 'Chrome 120', location: 'San Francisco, CA', ipAddress: '192.168.1.1', lastActive: '2024-01-15T12:30:00Z', status: 'active', isCurrent: true },
  { id: '2', device: 'iPhone 15 Pro', browser: 'Safari Mobile', location: 'San Francisco, CA', ipAddress: '192.168.1.2', lastActive: '2024-01-15T10:00:00Z', status: 'active', isCurrent: false },
  { id: '3', device: 'Windows PC', browser: 'Edge 120', location: 'New York, NY', ipAddress: '10.0.0.5', lastActive: '2024-01-10T14:00:00Z', status: 'expired', isCurrent: false }
]

const mockIntegrations: Integration[] = [
  { id: '1', name: 'Google', icon: 'google', status: 'connected', connectedAt: '2023-06-15T09:00:00Z', scopes: ['email', 'calendar', 'drive'], lastSync: '2024-01-15T12:00:00Z' },
  { id: '2', name: 'GitHub', icon: 'github', status: 'connected', connectedAt: '2023-08-20T10:00:00Z', scopes: ['repo', 'user'], lastSync: '2024-01-15T11:00:00Z' },
  { id: '3', name: 'Slack', icon: 'slack', status: 'connected', connectedAt: '2023-09-10T11:00:00Z', scopes: ['chat', 'channels'], lastSync: '2024-01-15T10:30:00Z' },
  { id: '4', name: 'Notion', icon: 'notion', status: 'disconnected', connectedAt: null, scopes: [], lastSync: null },
  { id: '5', name: 'Figma', icon: 'figma', status: 'error', connectedAt: '2023-10-01T08:00:00Z', scopes: ['read'], lastSync: '2024-01-10T09:00:00Z' }
]

const mockNotifications: NotificationPreference[] = [
  { id: '1', category: 'Security Alerts', email: true, push: true, inApp: true, sms: true },
  { id: '2', category: 'Account Updates', email: true, push: true, inApp: true, sms: false },
  { id: '3', category: 'Marketing', email: false, push: false, inApp: true, sms: false },
  { id: '4', category: 'Product Updates', email: true, push: false, inApp: true, sms: false },
  { id: '5', category: 'Comments & Mentions', email: true, push: true, inApp: true, sms: false },
  { id: '6', category: 'Team Activity', email: false, push: true, inApp: true, sms: false },
  { id: '7', category: 'Weekly Digest', email: true, push: false, inApp: false, sms: false }
]

const mockBilling: BillingInfo = {
  plan: 'pro',
  billingCycle: 'yearly',
  nextBillingDate: '2025-01-15',
  amount: 199,
  paymentMethod: 'Visa',
  cardLast4: '4242'
}

const mockInvoices: Invoice[] = [
  { id: 'INV-001', date: '2024-01-15', amount: 199, status: 'paid', downloadUrl: '/invoices/inv-001.pdf' },
  { id: 'INV-002', date: '2023-12-15', amount: 199, status: 'paid', downloadUrl: '/invoices/inv-002.pdf' },
  { id: 'INV-003', date: '2023-11-15', amount: 199, status: 'paid', downloadUrl: '/invoices/inv-003.pdf' }
]

export default function SettingsClient() {
  const [profile, setProfile] = useState<UserProfile>(mockProfile)
  const [security] = useState<SecuritySettings>(mockSecurity)
  const [sessions] = useState<Session[]>(mockSessions)
  const [integrations] = useState<Integration[]>(mockIntegrations)
  const [notifications, setNotifications] = useState<NotificationPreference[]>(mockNotifications)
  const [billing] = useState<BillingInfo>(mockBilling)
  const [invoices] = useState<Invoice[]>(mockInvoices)

  const [theme, setTheme] = useState<ThemeMode>('system')
  const [showPassword, setShowPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  // Stats
  const stats = useMemo(() => {
    const connectedIntegrations = integrations.filter(i => i.status === 'connected').length
    const storageUsed = 45.2
    const storageLimit = 100
    const profileCompleteness = 85
    return { connectedIntegrations, storageUsed, storageLimit, profileCompleteness, securityScore: security.securityScore }
  }, [integrations, security])

  // Helper functions
  const getIntegrationStatusColor = (status: IntegrationStatus) => {
    const colors: Record<IntegrationStatus, string> = {
      connected: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      disconnected: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }
    return colors[status]
  }

  const getSessionStatusColor = (status: SessionStatus) => {
    const colors: Record<SessionStatus, string> = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      expired: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
    return colors[status]
  }

  const getPlanColor = (plan: PlanTier) => {
    const colors: Record<PlanTier, string> = {
      free: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      pro: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      enterprise: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    }
    return colors[plan]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const handleSave = async (section: string) => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaveMessage(`${section} saved successfully!`)
    setIsSaving(false)
    setTimeout(() => setSaveMessage(''), 3000)
  }

  const toggleNotification = (id: string, field: keyof NotificationPreference) => {
    setNotifications(prev => prev.map(n =>
      n.id === id ? { ...n, [field]: !n[field] } : n
    ))
  }

  const statCards = [
    { label: 'Profile', value: `${stats.profileCompleteness}%`, change: 5.0, icon: User, color: 'from-blue-500 to-cyan-500' },
    { label: 'Security', value: `${stats.securityScore}%`, change: 8.5, icon: Shield, color: 'from-green-500 to-emerald-500' },
    { label: 'Storage', value: `${stats.storageUsed} GB`, change: 12.3, icon: HardDrive, color: 'from-purple-500 to-pink-500' },
    { label: 'Integrations', value: stats.connectedIntegrations.toString(), change: 0, icon: Link2, color: 'from-orange-500 to-amber-500' },
    { label: 'Sessions', value: sessions.filter(s => s.status === 'active').length.toString(), change: 0, icon: Monitor, color: 'from-indigo-500 to-violet-500' },
    { label: 'Plan', value: billing.plan.toUpperCase(), change: 0, icon: CreditCard, color: 'from-rose-500 to-red-500' },
    { label: 'Notifications', value: 'On', change: 0, icon: Bell, color: 'from-yellow-500 to-orange-500' },
    { label: 'Account Age', value: '1y 2m', change: 0, icon: Calendar, color: 'from-teal-500 to-green-500' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50/30 to-zinc-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">System Preferences-level account management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {saveMessage && (
              <Badge className="bg-green-100 text-green-700">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {saveMessage}
              </Badge>
            )}
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  {stat.change > 0 && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <ArrowUpRight className="w-3 h-3" />
                      {stat.change}%
                    </div>
                  )}
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 shadow-sm">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Appearance
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details and public profile</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={profile.avatar} />
                        <AvatarFallback className="text-2xl">{profile.firstName[0]}{profile.lastName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm">
                          <Camera className="w-4 h-4 mr-2" />
                          Change Photo
                        </Button>
                        <p className="text-xs text-gray-500">JPG, GIF or PNG. Max 5MB.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">First Name</label>
                        <Input
                          value={profile.firstName}
                          onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Last Name</label>
                        <Input
                          value={profile.lastName}
                          onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Display Name</label>
                      <Input
                        value={profile.displayName}
                        onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Email</label>
                      <Input value={profile.email} disabled />
                      <p className="text-xs text-gray-500 mt-1">Contact support to change your email</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Bio</label>
                      <textarea
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Phone</label>
                        <Input
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Location</label>
                        <Input
                          value={profile.location}
                          onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Website</label>
                      <Input
                        value={profile.website}
                        onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                      />
                    </div>

                    <Button onClick={() => handleSave('Profile')} disabled={isSaving}>
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Profile Completeness</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">{stats.profileCompleteness}%</span>
                        <Badge className="bg-green-100 text-green-700">Good</Badge>
                      </div>
                      <Progress value={stats.profileCompleteness} className="h-2" />
                      <div className="space-y-2">
                        {[
                          { label: 'Add photo', done: true },
                          { label: 'Complete bio', done: true },
                          { label: 'Add phone number', done: true },
                          { label: 'Connect social accounts', done: false },
                          { label: 'Verify email', done: true }
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            {item.done ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                            )}
                            <span className={item.done ? 'text-gray-500 line-through' : ''}>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Timezone</label>
                      <select className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="Europe/London">London (GMT)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Language</label>
                      <select className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <option value="en-US">English (US)</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>Change your password to keep your account secure</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Current Password</label>
                      <div className="relative">
                        <Input type={showPassword ? 'text' : 'password'} placeholder="Enter current password" />
                        <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">New Password</label>
                      <Input type="password" placeholder="Enter new password" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Confirm New Password</label>
                      <Input type="password" placeholder="Confirm new password" />
                    </div>
                    <p className="text-xs text-gray-500">Last changed {formatTimeAgo(security.passwordLastChanged)}</p>
                    <Button onClick={() => handleSave('Password')}>Update Password</Button>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>Add an extra layer of security to your account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${security.twoFactorEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <Fingerprint className={`w-5 h-5 ${security.twoFactorEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-500">
                            {security.twoFactorEnabled ? `Enabled via ${security.twoFactorMethod === 'app' ? 'Authenticator App' : security.twoFactorMethod.toUpperCase()}` : 'Not enabled'}
                          </p>
                        </div>
                      </div>
                      <Button variant={security.twoFactorEnabled ? 'outline' : 'default'}>
                        {security.twoFactorEnabled ? 'Manage' : 'Enable'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Active Sessions</CardTitle>
                      <Button variant="outline" size="sm">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sessions.map(session => (
                        <div key={session.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              {session.device.includes('Mac') ? <Laptop className="w-5 h-5" /> :
                               session.device.includes('iPhone') ? <Smartphone className="w-5 h-5" /> :
                               <Monitor className="w-5 h-5" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{session.device}</p>
                                {session.isCurrent && <Badge className="bg-green-100 text-green-700 text-xs">Current</Badge>}
                              </div>
                              <p className="text-sm text-gray-500">{session.browser} • {session.location}</p>
                              <p className="text-xs text-gray-400">Last active {formatTimeAgo(session.lastActive)}</p>
                            </div>
                          </div>
                          {!session.isCurrent && (
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <LogOut className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Security Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold text-green-600">{security.securityScore}%</span>
                        <Badge className="bg-green-100 text-green-700">Strong</Badge>
                      </div>
                      <Progress value={security.securityScore} className="h-2" />
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          Strong password
                        </div>
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          2FA enabled
                        </div>
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          Email verified
                        </div>
                        <div className="flex items-center gap-2 text-yellow-600">
                          <AlertTriangle className="w-4 h-4" />
                          Review active sessions
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { action: 'Password changed', time: '2 weeks ago' },
                        { action: 'New login from iPhone', time: '3 days ago' },
                        { action: '2FA method updated', time: '1 month ago' }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span>{item.action}</span>
                          <span className="text-gray-500">{item.time}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to receive notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Category</th>
                        <th className="text-center py-3 px-4 font-medium">
                          <div className="flex items-center justify-center gap-1">
                            <Mail className="w-4 h-4" /> Email
                          </div>
                        </th>
                        <th className="text-center py-3 px-4 font-medium">
                          <div className="flex items-center justify-center gap-1">
                            <Bell className="w-4 h-4" /> Push
                          </div>
                        </th>
                        <th className="text-center py-3 px-4 font-medium">
                          <div className="flex items-center justify-center gap-1">
                            <MessageSquare className="w-4 h-4" /> In-App
                          </div>
                        </th>
                        <th className="text-center py-3 px-4 font-medium">
                          <div className="flex items-center justify-center gap-1">
                            <Smartphone className="w-4 h-4" /> SMS
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {notifications.map(notif => (
                        <tr key={notif.id} className="border-b">
                          <td className="py-4 px-4 font-medium">{notif.category}</td>
                          {(['email', 'push', 'inApp', 'sms'] as const).map(field => (
                            <td key={field} className="text-center py-4 px-4">
                              <button
                                onClick={() => toggleNotification(notif.id, field)}
                                className={`w-10 h-6 rounded-full transition-colors ${notif[field] ? 'bg-blue-500' : 'bg-gray-300'}`}
                              >
                                <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${notif[field] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                              </button>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6">
                  <Button onClick={() => handleSave('Notifications')}>Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrations.map(integration => (
                <Card key={integration.id} className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <Globe className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{integration.name}</h4>
                          <Badge className={getIntegrationStatusColor(integration.status)}>
                            {integration.status === 'connected' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {integration.status === 'error' && <AlertTriangle className="w-3 h-3 mr-1" />}
                            {integration.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {integration.status === 'connected' && (
                      <div className="space-y-2 mb-4 text-sm text-gray-500">
                        <div className="flex items-center justify-between">
                          <span>Connected</span>
                          <span>{integration.connectedAt && formatTimeAgo(integration.connectedAt)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Last sync</span>
                          <span>{integration.lastSync && formatTimeAgo(integration.lastSync)}</span>
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {integration.scopes.map(scope => (
                            <Badge key={scope} variant="secondary" className="text-xs">{scope}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      variant={integration.status === 'connected' ? 'outline' : 'default'}
                      className="w-full"
                    >
                      {integration.status === 'connected' ? (
                        <>
                          <Unlink className="w-4 h-4 mr-2" />
                          Disconnect
                        </>
                      ) : (
                        <>
                          <Link2 className="w-4 h-4 mr-2" />
                          Connect
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Current Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      <div>
                        <p className="text-sm opacity-90">Your Plan</p>
                        <p className="text-2xl font-bold">{billing.plan.toUpperCase()}</p>
                        <p className="text-sm opacity-90">${billing.amount}/{billing.billingCycle === 'yearly' ? 'year' : 'month'}</p>
                      </div>
                      <Button variant="secondary">Upgrade Plan</Button>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <p className="text-gray-500">Next billing date</p>
                        <p className="font-medium">{formatDate(billing.nextBillingDate)}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <p className="text-gray-500">Payment method</p>
                        <p className="font-medium">{billing.paymentMethod} •••• {billing.cardLast4}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {invoices.map(invoice => (
                        <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium">{invoice.id}</p>
                              <p className="text-sm text-gray-500">{formatDate(invoice.date)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-medium">${invoice.amount}</span>
                            <Badge className={invoice.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>{invoice.status}</Badge>
                            <Button variant="ghost" size="icon">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-4">
                      <CreditCard className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="font-medium">{billing.paymentMethod} •••• {billing.cardLast4}</p>
                        <p className="text-sm text-gray-500">Expires 12/25</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      Update Payment Method
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Storage</span>
                          <span>{stats.storageUsed} / {stats.storageLimit} GB</span>
                        </div>
                        <Progress value={(stats.storageUsed / stats.storageLimit) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>API Requests</span>
                          <span>8,450 / 10,000</span>
                        </div>
                        <Progress value={84.5} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Theme</CardTitle>
                  <CardDescription>Choose your preferred color scheme</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: 'light', label: 'Light', icon: Sun },
                      { value: 'dark', label: 'Dark', icon: Moon },
                      { value: 'system', label: 'System', icon: Laptop }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setTheme(option.value as ThemeMode)}
                        className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                          theme === option.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <option.icon className="w-6 h-6" />
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Accent Color</CardTitle>
                  <CardDescription>Personalize your interface</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    {['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'].map(color => (
                      <button
                        key={color}
                        className="w-10 h-10 rounded-full ring-2 ring-offset-2 ring-transparent hover:ring-gray-300"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Accessibility</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Reduce motion', desc: 'Minimize animations', icon: MousePointer },
                    { label: 'High contrast', desc: 'Increase text contrast', icon: Contrast },
                    { label: 'Large text', desc: 'Increase font size', icon: Type }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                      </div>
                      <button className="w-10 h-6 rounded-full bg-gray-300">
                        <div className="w-5 h-5 rounded-full bg-white transform translate-x-0.5" />
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Keyboard Shortcuts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { keys: ['⌘', 'K'], action: 'Quick search' },
                      { keys: ['⌘', 'N'], action: 'New item' },
                      { keys: ['⌘', '/'], action: 'Toggle sidebar' },
                      { keys: ['⌘', '.'], action: 'Open settings' }
                    ].map((shortcut, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm">{shortcut.action}</span>
                        <div className="flex gap-1">
                          {shortcut.keys.map((key, j) => (
                            <kbd key={j} className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-xs font-mono">{key}</kbd>
                          ))}
                        </div>
                      </div>
                    ))}
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
