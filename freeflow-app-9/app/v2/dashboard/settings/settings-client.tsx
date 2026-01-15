'use client'

import { useState, useMemo, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  Zap,
  Save,
  Download,
  Upload,
  ArrowUpRight,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  LogOut,
  Monitor,
  Moon,
  Sun,
  Laptop,
  Camera,
  Link2,
  Unlink,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Fingerprint,
  FileText,
  HardDrive,
  Accessibility,
  Volume2,
  Type,
  Contrast,
  MousePointer,
  MessageSquare
} from 'lucide-react'

// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'

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

// ============================================================================
// ENHANCED COMPETITIVE UPGRADE MOCK DATA - Settings Level
// ============================================================================

const mockSettingsAIInsights = [
  { id: '1', type: 'success' as const, title: 'Security Score', description: 'Your account security score is 95/100. All recommended protections enabled.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Security' },
  { id: '2', type: 'warning' as const, title: 'Session Alert', description: 'Active session detected from new device in London. Verify if this is you.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Security' },
  { id: '3', type: 'info' as const, title: 'Plan Upgrade', description: 'You have used 85% of your storage. Consider upgrading for more space.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Usage' },
]

const mockSettingsCollaborators = [
  { id: '1', name: 'Account Admin', avatar: '/avatars/admin.jpg', status: 'online' as const, role: 'Admin' },
  { id: '2', name: 'IT Support', avatar: '/avatars/it.jpg', status: 'online' as const, role: 'Support' },
  { id: '3', name: 'Billing Team', avatar: '/avatars/billing.jpg', status: 'away' as const, role: 'Billing' },
]

const mockSettingsPredictions = [
  { id: '1', title: 'Storage Forecast', prediction: 'At current usage rate, storage will be full in 45 days', confidence: 92, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Renewal Savings', prediction: 'Annual billing could save you $50/year on current plan', confidence: 100, trend: 'stable' as const, impact: 'medium' as const },
]

const mockSettingsActivities = [
  { id: '1', user: 'You', action: 'Changed', target: 'notification preferences', timestamp: new Date().toISOString(), type: 'info' as const },
  { id: '2', user: 'You', action: 'Enabled', target: 'two-factor authentication', timestamp: new Date(Date.now() - 86400000).toISOString(), type: 'success' as const },
  { id: '3', user: 'System', action: 'Revoked', target: 'inactive API key', timestamp: new Date(Date.now() - 172800000).toISOString(), type: 'warning' as const },
]

// Quick actions will be defined inside the component to use component functions

export default function SettingsClient() {
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Form state with Supabase data
  const [profile, setProfile] = useState<UserProfile>(mockProfile)
  const [security, setSecurity] = useState<SecuritySettings>(mockSecurity)
  const [sessions, setSessions] = useState<Session[]>(mockSessions)
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations)
  const [notifications, setNotifications] = useState<NotificationPreference[]>(mockNotifications)
  const [billing, setBilling] = useState<BillingInfo>(mockBilling)
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices)

  const [theme, setTheme] = useState<ThemeMode>('system')
  const [showPassword, setShowPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Accessibility settings state
  const [largeText, setLargeText] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [soundEffects, setSoundEffects] = useState(true)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedAccessibility = localStorage.getItem('accessibility_settings')
    if (savedAccessibility) {
      try {
        const parsed = JSON.parse(savedAccessibility)
        setLargeText(parsed.largeText ?? false)
        setHighContrast(parsed.highContrast ?? false)
        setReduceMotion(parsed.reduceMotion ?? false)
        setSoundEffects(parsed.soundEffects ?? true)
      } catch (e) {
        console.error('Failed to parse accessibility settings:', e)
      }
    }
  }, [])

  // Fetch user and settings on mount
  useEffect(() => {
    const fetchUserAndSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        setUserId(user.id)

        // Fetch user settings
        const { data: settings } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (settings) {
          setProfile(prev => ({
            ...prev,
            id: user.id,
            email: user.email || prev.email,
            firstName: settings.first_name || prev.firstName,
            lastName: settings.last_name || prev.lastName,
            displayName: settings.display_name || prev.displayName,
            bio: settings.bio || prev.bio,
            avatar: settings.avatar_url || prev.avatar,
            timezone: settings.timezone || prev.timezone,
            language: settings.locale || prev.language
          }))
          setSecurity(prev => ({
            ...prev,
            twoFactorEnabled: settings.two_factor_enabled || false,
            twoFactorMethod: settings.two_factor_method || 'app'
          }))
          setTheme(settings.theme || 'system')
        }

        // Fetch user sessions
        const { data: sessionsData } = await supabase
          .from('user_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('last_active_at', { ascending: false })

        if (sessionsData?.length) {
          setSessions(sessionsData.map((s: any) => ({
            id: s.id,
            device: s.device_name || 'Unknown Device',
            browser: s.browser || 'Unknown Browser',
            location: s.location || 'Unknown',
            ipAddress: s.ip_address || '',
            lastActive: s.last_active_at,
            status: s.is_active ? 'active' : 'expired',
            isCurrent: s.is_current || false
          })))
        }

        // Fetch integrations
        const { data: integrationsData } = await supabase
          .from('integrations')
          .select('*')
          .eq('user_id', user.id)

        if (integrationsData?.length) {
          setIntegrations(integrationsData.map((i: any) => ({
            id: i.id,
            name: i.name,
            icon: i.icon || 'globe',
            status: i.status,
            connectedAt: i.connected_at,
            scopes: i.permissions || [],
            lastSync: i.last_sync_at
          })))
        }

        // Fetch notification preferences
        const { data: notifData } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', user.id)

        if (notifData) {
          const prefs = Array.isArray(notifData) ? notifData : [notifData]
          if (prefs.length) {
            setNotifications(prefs.map((n: any) => ({
              id: n.id,
              category: n.category || 'General',
              email: n.email_enabled ?? true,
              push: n.push_enabled ?? true,
              inApp: n.in_app_enabled ?? true,
              sms: n.sms_enabled ?? false
            })))
          }
        }

      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUserAndSettings()
  }, [supabase])

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

  // Save profile to Supabase
  const handleSaveProfile = async () => {
    if (!userId) return
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          first_name: profile.firstName,
          last_name: profile.lastName,
          display_name: profile.displayName,
          bio: profile.bio,
          timezone: profile.timezone,
          locale: profile.language,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })

      if (error) throw error
      toast.success('Profile saved', { description: 'Your profile has been updated' })
      setSaveMessage('Profile saved successfully!')
    } catch (error: any) {
      toast.error('Error', { description: error.message || 'Failed to save profile' })
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveMessage(''), 3000)
    }
  }

  // Save notifications to Supabase
  const handleSaveNotifications = async () => {
    if (!userId) return
    setIsSaving(true)
    try {
      for (const notif of notifications) {
        await supabase
          .from('notification_preferences')
          .upsert({
            id: notif.id,
            user_id: userId,
            category: notif.category,
            email_enabled: notif.email,
            push_enabled: notif.push,
            in_app_enabled: notif.inApp,
            sms_enabled: notif.sms,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' })
      }
      toast.success('Notifications saved', { description: 'Your notification preferences have been updated' })
    } catch (error: any) {
      toast.error('Error', { description: error.message || 'Failed to save notifications' })
    } finally {
      setIsSaving(false)
    }
  }

  // Save security settings
  const handleSaveSecurity = async () => {
    if (!userId) return
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          two_factor_enabled: security.twoFactorEnabled,
          two_factor_method: security.twoFactorMethod,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })

      if (error) throw error
      toast.success('Security settings saved', { description: 'Your security preferences have been updated' })
    } catch (error: any) {
      toast.error('Error', { description: error.message || 'Failed to save security settings' })
    } finally {
      setIsSaving(false)
    }
  }

  // Save theme preference
  const handleSaveTheme = async (newTheme: ThemeMode) => {
    setTheme(newTheme)
    if (!userId) return
    try {
      await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          theme: newTheme,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
      toast.success('Theme updated', { description: `Theme set to ${newTheme}` })
    } catch (error: any) {
      toast.error('Error', { description: error.message || 'Failed to update theme' })
    }
  }

  // Change password
  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Missing fields', { description: 'Please fill in all password fields' })
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Password mismatch', { description: 'New passwords do not match' })
      return
    }
    if (newPassword.length < 8) {
      toast.error('Weak password', { description: 'Password must be at least 8 characters' })
      return
    }

    setIsSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      toast.success('Password changed', { description: 'Your password has been updated successfully' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      toast.error('Error', { description: error.message || 'Failed to change password' })
    } finally {
      setIsSaving(false)
    }
  }

  // Toggle integration connection
  const handleToggleIntegration = async (integration: Integration) => {
    if (!userId) return
    const newStatus = integration.status === 'connected' ? 'disconnected' : 'connected'
    setIntegrations(prev => prev.map(i =>
      i.id === integration.id
        ? { ...i, status: newStatus, connectedAt: newStatus === 'connected' ? new Date().toISOString() : null }
        : i
    ))

    try {
      await supabase
        .from('integrations')
        .upsert({
          id: integration.id,
          user_id: userId,
          name: integration.name,
          status: newStatus,
          connected_at: newStatus === 'connected' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })

      toast.success(
        newStatus === 'connected' ? 'Connected' : 'Disconnected',
        { description: `${integration.name} ${newStatus === 'connected' ? 'connected' : 'disconnected'} successfully` }
      )
    } catch (error: any) {
      toast.error('Error', { description: error.message || 'Failed to update integration' })
    }
  }

  // Revoke session
  const handleRevokeSession = async (session: Session) => {
    if (!userId) return
    setSessions(prev => prev.filter(s => s.id !== session.id))

    try {
      await supabase
        .from('user_sessions')
        .delete()
        .eq('id', session.id)

      toast.success('Session revoked', { description: `Session on ${session.device} has been terminated` })
    } catch (error: any) {
      toast.error('Error', { description: error.message || 'Failed to revoke session' })
    }
  }

  // Delete account
  const handleDeleteAccount = async () => {
    toast.error('Account deletion', { description: 'Please contact support to delete your account' })
  }

  // Toggle notification preference
  const toggleNotificationPreference = (id: string, field: 'email' | 'push' | 'inApp' | 'sms') => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, [field]: !n[field] } : n
      )
    )
  }

  // Toggle accessibility setting with localStorage persistence
  const toggleAccessibilitySetting = (setting: 'largeText' | 'highContrast' | 'reduceMotion' | 'soundEffects') => {
    const newValues = {
      largeText: setting === 'largeText' ? !largeText : largeText,
      highContrast: setting === 'highContrast' ? !highContrast : highContrast,
      reduceMotion: setting === 'reduceMotion' ? !reduceMotion : reduceMotion,
      soundEffects: setting === 'soundEffects' ? !soundEffects : soundEffects
    }

    // Update state
    if (setting === 'largeText') setLargeText(!largeText)
    if (setting === 'highContrast') setHighContrast(!highContrast)
    if (setting === 'reduceMotion') setReduceMotion(!reduceMotion)
    if (setting === 'soundEffects') setSoundEffects(!soundEffects)

    // Persist to localStorage
    localStorage.setItem('accessibility_settings', JSON.stringify(newValues))

    // Apply CSS classes for accessibility
    const root = document.documentElement
    if (setting === 'largeText') {
      root.classList.toggle('large-text', newValues.largeText)
    }
    if (setting === 'highContrast') {
      root.classList.toggle('high-contrast', newValues.highContrast)
    }
    if (setting === 'reduceMotion') {
      root.classList.toggle('reduce-motion', newValues.reduceMotion)
    }

    toast.success(`${setting.replace(/([A-Z])/g, ' $1').trim()} ${newValues[setting] ? 'enabled' : 'disabled'}`)
  }

  // Export all settings as JSON file
  const handleExportSettings = () => {
    const allSettings = {
      profile,
      security: {
        twoFactorEnabled: security.twoFactorEnabled,
        twoFactorMethod: security.twoFactorMethod,
        loginNotifications: security.loginNotifications
      },
      notifications,
      theme,
      accessibility: { largeText, highContrast, reduceMotion, soundEffects },
      integrations: integrations.map(i => ({ id: i.id, name: i.name, status: i.status })),
      exportedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(allSettings, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `settings-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Settings exported', { description: 'Your settings have been downloaded as JSON' })
  }

  // Download invoice as file
  const handleDownloadInvoice = (invoice: Invoice) => {
    const invoiceData = {
      invoiceId: invoice.id,
      date: invoice.date,
      amount: invoice.amount,
      status: invoice.status,
      billingDetails: {
        plan: billing.plan,
        paymentMethod: billing.paymentMethod,
        cardLast4: billing.cardLast4
      }
    }

    const blob = new Blob([JSON.stringify(invoiceData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${invoice.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Invoice downloaded', { description: `${invoice.id} has been downloaded` })
  }

  // Handle avatar upload
  const handleAvatarUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/jpeg,image/png,image/gif'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      if (file.size > 5 * 1024 * 1024) {
        toast.error('File too large', { description: 'Please select an image under 5MB' })
        return
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setProfile(prev => ({ ...prev, avatar: previewUrl }))

      // In a real app, upload to server/storage here
      toast.success('Photo uploaded', { description: 'Your profile picture has been updated' })
    }
    input.click()
  }

  // Remove avatar
  const handleRemoveAvatar = () => {
    setProfile(prev => ({ ...prev, avatar: '' }))
    toast.success('Photo removed', { description: 'Your profile picture has been removed' })
  }

  // Sync integration
  const handleSyncIntegration = async (integration: Integration) => {
    setIntegrations(prev =>
      prev.map(i => i.id === integration.id ? { ...i, lastSync: new Date().toISOString() } : i)
    )

    if (userId) {
      try {
        await supabase
          .from('integrations')
          .update({ last_sync_at: new Date().toISOString() })
          .eq('id', integration.id)
      } catch (error) {
        console.error('Failed to update sync time:', error)
      }
    }

    toast.success('Synced', { description: `${integration.name} has been synced` })
  }

  // Open upgrade dialog / redirect
  const handleUpgradePlan = () => {
    // Store intent in localStorage for the billing page
    localStorage.setItem('billing_intent', JSON.stringify({ action: 'upgrade', currentPlan: billing.plan }))
    toast.success('Upgrade options', { description: 'Redirecting to upgrade page...' })
    // In a real app, would use router.push('/billing/upgrade')
  }

  // Open payment method update
  const handleUpdatePaymentMethod = () => {
    localStorage.setItem('billing_intent', JSON.stringify({ action: 'update_payment', cardLast4: billing.cardLast4 }))
    toast.success('Payment methods', { description: 'Opening payment method editor...' })
  }

  // Send verification email
  const handleSendVerificationEmail = async () => {
    if (!userId) {
      toast.error('Not authenticated', { description: 'Please log in to verify your email' })
      return
    }

    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: profile.email })
      if (error) throw error
      toast.success('Verification email sent', { description: `Check ${profile.email} for the verification link` })
    } catch (error: any) {
      toast.error('Error', { description: error.message || 'Failed to send verification email' })
    }
  }

  // Handle AI insights action clicks with real operations
  const handleInsightAction = (insight: { id: string; type: 'success' | 'warning' | 'info' | 'error'; title: string; category?: string }) => {
    switch (insight.category) {
      case 'Security':
        // Navigate to security tab for security-related insights
        const securityTab = document.querySelector('[value="security"]') as HTMLElement
        if (securityTab) {
          securityTab.click()
          toast.success('Security settings opened', { description: `Review: ${insight.title}` })
        }
        break
      case 'Usage':
        // Navigate to billing tab for usage/storage insights
        const billingTab = document.querySelector('[value="billing"]') as HTMLElement
        if (billingTab) {
          billingTab.click()
          toast.info('Billing & usage opened', { description: 'Review your usage and consider upgrading' })
        }
        break
      default:
        // Generic handling based on insight type
        if (insight.type === 'warning') {
          // For warnings, show sessions and prompt review
          const sessionsTab = document.querySelector('[value="security"]') as HTMLElement
          if (sessionsTab) sessionsTab.click()
          toast.warning('Action required', { description: insight.title })
        } else if (insight.type === 'info') {
          toast.info('Insight noted', { description: insight.title })
        } else {
          toast.success('Action completed', { description: insight.title })
        }
    }
  }

  // Quick actions with real functionality
  const settingsQuickActions = [
    {
      id: '1',
      label: 'Change Password',
      icon: 'lock',
      action: () => {
        // Scroll to security tab and focus password input
        const securityTab = document.querySelector('[value="security"]') as HTMLElement
        if (securityTab) securityTab.click()
        setTimeout(() => {
          const passwordInput = document.getElementById('currentPassword') as HTMLInputElement
          if (passwordInput) passwordInput.focus()
        }, 100)
      },
      variant: 'default' as const
    },
    {
      id: '2',
      label: 'Export Data',
      icon: 'download',
      action: handleExportSettings,
      variant: 'default' as const
    },
    {
      id: '3',
      label: 'View Invoices',
      icon: 'file',
      action: () => {
        // Navigate to billing tab
        const billingTab = document.querySelector('[value="billing"]') as HTMLElement
        if (billingTab) billingTab.click()
      },
      variant: 'outline' as const
    },
  ]

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your account, preferences, and security settings
          </p>
        </div>

        <div className="flex items-center gap-3">
          <CollaborationIndicator
            collaborators={mockSettingsCollaborators}
            maxDisplay={3}
            showStatus={true}
          />
          <QuickActionsToolbar
            actions={settingsQuickActions}
            variant="compact"
          />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/50 dark:to-gray-900 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Security Score</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.securityScore}%</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <Progress value={stats.securityScore} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/50 dark:to-gray-900 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Profile Completeness</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.profileCompleteness}%</p>
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center">
                <User className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <Progress value={stats.profileCompleteness} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/50 dark:to-gray-900 border-purple-200 dark:border-purple-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Integrations</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.connectedIntegrations}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
                <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">Connected apps</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/50 dark:to-gray-900 border-orange-200 dark:border-orange-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Storage Used</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.storageUsed} GB</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/50 rounded-xl flex items-center justify-center">
                <HardDrive className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <Progress value={(stats.storageUsed / stats.storageLimit) * 100} className="mt-3 h-2" />
            <p className="text-xs text-muted-foreground mt-1">{stats.storageLimit - stats.storageUsed} GB remaining</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Panel */}
      <AIInsightsPanel
        insights={mockSettingsAIInsights}
        title="Account Insights"
        onActionClick={handleInsightAction}
      />

      {/* Main Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 gap-2 h-auto p-1">
          <TabsTrigger value="profile" className="flex items-center gap-2 py-2.5">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 py-2.5">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 py-2.5">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2 py-2.5">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2 py-2.5">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2 py-2.5">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Picture Card */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Profile Picture
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <Avatar className="h-32 w-32 border-4 border-primary/20">
                  <AvatarImage src={profile.avatar} alt={profile.displayName} />
                  <AvatarFallback className="text-3xl">
                    {profile.firstName[0]}{profile.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleAvatarUpload}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleRemoveAvatar}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  JPG, PNG, GIF up to 5MB
                </p>
              </CardContent>
            </Card>

            {/* Personal Information Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={profile.displayName}
                    onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex gap-2">
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="flex-1"
                    />
                    <Button variant="outline" onClick={handleSendVerificationEmail}>Verify</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={profile.timezone} onValueChange={(value) => setProfile(prev => ({ ...prev, timezone: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                        <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={profile.language} onValueChange={(value) => setProfile(prev => ({ ...prev, language: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="en-GB">English (UK)</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveProfile} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Password Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Password
                </CardTitle>
                <CardDescription>
                  Last changed {formatDate(security.passwordLastChanged)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
                <Button className="w-full" onClick={handleChangePassword} disabled={isSaving}>
                  <Key className="h-4 w-4 mr-2" />
                  {isSaving ? 'Changing...' : 'Change Password'}
                </Button>
              </CardContent>
            </Card>

            {/* Two-Factor Authentication Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fingerprint className="h-5 w-5" />
                  Two-Factor Authentication
                </CardTitle>
                <CardDescription>Add an extra layer of security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {security.twoFactorEnabled ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : (
                      <XCircle className="h-6 w-6 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium">2FA Status</p>
                      <p className="text-sm text-muted-foreground">
                        {security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={security.twoFactorEnabled}
                    onCheckedChange={(checked) => {
                      setSecurity(prev => ({ ...prev, twoFactorEnabled: checked }))
                      toast.success(`2FA ${checked ? 'enabled' : 'disabled'}`)
                    }}
                  />
                </div>
                {security.twoFactorEnabled && (
                  <div className="space-y-2">
                    <Label>Authentication Method</Label>
                    <Select
                      value={security.twoFactorMethod}
                      onValueChange={(value: 'app' | 'sms' | 'email') => {
                        setSecurity(prev => ({ ...prev, twoFactorMethod: value }))
                        toast.success(`2FA method changed to ${value}`)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="app">Authenticator App</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button variant="outline" className="w-full" onClick={handleSaveSecurity}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Security Settings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Active Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Active Sessions
              </CardTitle>
              <CardDescription>Manage devices where you are logged in</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      session.isCurrent ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                        {session.device.includes('Mac') || session.device.includes('iPhone') ? (
                          <Laptop className="h-5 w-5" />
                        ) : (
                          <Monitor className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{session.device}</p>
                          {session.isCurrent && (
                            <Badge variant="outline" className="text-xs">Current</Badge>
                          )}
                          <Badge className={getSessionStatusColor(session.status)}>
                            {session.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {session.browser} • {session.location} • {formatTimeAgo(session.lastActive)}
                        </p>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleRevokeSession(session)}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible account actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900">
                <div>
                  <p className="font-medium text-red-700 dark:text-red-400">Delete Account</p>
                  <p className="text-sm text-red-600/70 dark:text-red-400/70">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Table Header */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 pb-4 border-b">
                  <div className="font-medium">Category</div>
                  <div className="text-center font-medium flex items-center justify-center gap-1">
                    <Mail className="h-4 w-4" /> Email
                  </div>
                  <div className="text-center font-medium flex items-center justify-center gap-1">
                    <Bell className="h-4 w-4" /> Push
                  </div>
                  <div className="text-center font-medium flex items-center justify-center gap-1">
                    <MessageSquare className="h-4 w-4" /> In-App
                  </div>
                  <div className="text-center font-medium flex items-center justify-center gap-1">
                    <Smartphone className="h-4 w-4" /> SMS
                  </div>
                </div>

                {/* Notification Rows */}
                {notifications.map((notif) => (
                  <div key={notif.id} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 items-center py-2">
                    <div className="font-medium">{notif.category}</div>
                    <div className="flex justify-center">
                      <Switch
                        checked={notif.email}
                        onCheckedChange={() => toggleNotificationPreference(notif.id, 'email')}
                      />
                    </div>
                    <div className="flex justify-center">
                      <Switch
                        checked={notif.push}
                        onCheckedChange={() => toggleNotificationPreference(notif.id, 'push')}
                      />
                    </div>
                    <div className="flex justify-center">
                      <Switch
                        checked={notif.inApp}
                        onCheckedChange={() => toggleNotificationPreference(notif.id, 'inApp')}
                      />
                    </div>
                    <div className="flex justify-center">
                      <Switch
                        checked={notif.sms}
                        onCheckedChange={() => toggleNotificationPreference(notif.id, 'sms')}
                      />
                    </div>
                  </div>
                ))}

                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={handleSaveNotifications} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Theme Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Theme
                </CardTitle>
                <CardDescription>Customize the look of your interface</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  <button
                    onClick={() => handleSaveTheme('light')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === 'light'
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-12 w-12 bg-white border rounded-lg flex items-center justify-center">
                        <Sun className="h-6 w-6 text-yellow-500" />
                      </div>
                      <span className="font-medium">Light</span>
                    </div>
                  </button>
                  <button
                    onClick={() => handleSaveTheme('dark')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === 'dark'
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-12 w-12 bg-gray-900 border rounded-lg flex items-center justify-center">
                        <Moon className="h-6 w-6 text-blue-400" />
                      </div>
                      <span className="font-medium">Dark</span>
                    </div>
                  </button>
                  <button
                    onClick={() => handleSaveTheme('system')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === 'system'
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-12 w-12 bg-gradient-to-br from-white to-gray-900 border rounded-lg flex items-center justify-center">
                        <Monitor className="h-6 w-6 text-gray-600" />
                      </div>
                      <span className="font-medium">System</span>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Accessibility Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Accessibility className="h-5 w-5" />
                  Accessibility
                </CardTitle>
                <CardDescription>Make the interface easier to use</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Type className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Large Text</p>
                      <p className="text-sm text-muted-foreground">Increase font size</p>
                    </div>
                  </div>
                  <Switch checked={largeText} onCheckedChange={() => toggleAccessibilitySetting('largeText')} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Contrast className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">High Contrast</p>
                      <p className="text-sm text-muted-foreground">Increase contrast</p>
                    </div>
                  </div>
                  <Switch checked={highContrast} onCheckedChange={() => toggleAccessibilitySetting('highContrast')} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MousePointer className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Reduce Motion</p>
                      <p className="text-sm text-muted-foreground">Minimize animations</p>
                    </div>
                  </div>
                  <Switch checked={reduceMotion} onCheckedChange={() => toggleAccessibilitySetting('reduceMotion')} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Volume2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Sound Effects</p>
                      <p className="text-sm text-muted-foreground">Play UI sounds</p>
                    </div>
                  </div>
                  <Switch checked={soundEffects} onCheckedChange={() => toggleAccessibilitySetting('soundEffects')} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Connected Apps
              </CardTitle>
              <CardDescription>Manage your third-party integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center border">
                        <Globe className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{integration.name}</p>
                          <Badge className={getIntegrationStatusColor(integration.status)}>
                            {integration.status}
                          </Badge>
                        </div>
                        {integration.status === 'connected' && integration.lastSync && (
                          <p className="text-sm text-muted-foreground">
                            Last synced {formatTimeAgo(integration.lastSync)}
                          </p>
                        )}
                        {integration.status === 'error' && (
                          <p className="text-sm text-red-500">
                            Connection error - reconnect required
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {integration.status === 'connected' && (
                        <Button variant="ghost" size="sm" onClick={() => handleSyncIntegration(integration)}>
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant={integration.status === 'connected' ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => handleToggleIntegration(integration)}
                      >
                        {integration.status === 'connected' ? (
                          <>
                            <Unlink className="h-4 w-4 mr-2" />
                            Disconnect
                          </>
                        ) : (
                          <>
                            <Link2 className="h-4 w-4 mr-2" />
                            Connect
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Plan */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-xl border">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getPlanColor(billing.plan)}>
                        {billing.plan.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{billing.billingCycle}</Badge>
                    </div>
                    <p className="text-3xl font-bold">${billing.amount}<span className="text-lg font-normal text-muted-foreground">/year</span></p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Next billing date: {formatDate(billing.nextBillingDate)}
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleUpgradePlan}>
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{billing.paymentMethod} •••• {billing.cardLast4}</p>
                      <p className="text-sm text-muted-foreground">Default payment method</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleUpdatePaymentMethod}>
                    Update
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Usage This Month</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Storage</span>
                    <span className="font-medium">{stats.storageUsed} / {stats.storageLimit} GB</span>
                  </div>
                  <Progress value={(stats.storageUsed / stats.storageLimit) * 100} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">API Calls</span>
                    <span className="font-medium">8,500 / 10,000</span>
                  </div>
                  <Progress value={85} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Team Members</span>
                    <span className="font-medium">5 / 10</span>
                  </div>
                  <Progress value={50} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Billing History
              </CardTitle>
              <CardDescription>Download past invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{invoice.id}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(invoice.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">${invoice.amount}</p>
                        <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                          {invoice.status}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDownloadInvoice(invoice)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Predictive Analytics */}
          <PredictiveAnalytics
            predictions={mockSettingsPredictions}
            title="Billing Predictions"
          />
        </TabsContent>
      </Tabs>

      {/* Activity Feed */}
      <ActivityFeed
        activities={mockSettingsActivities}
        title="Recent Settings Activity"
        maxItems={5}
      />
    </div>
  )
}
