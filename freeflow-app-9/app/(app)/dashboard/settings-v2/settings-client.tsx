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
  Database,
  Zap,
  Save,
  Download,
  Upload,
  Filter,
  ArrowUpRight,
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
  Link2,
  Unlink,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
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
  MessageSquare,
  Calendar,
  Activity,
  ExternalLink,
  AlertOctagon,
  Copy,
  Terminal,
  Code,
  Cpu,
  Server,
  Trash,
  ShieldCheck,
  Ban,
  BookOpen
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

const mockSettingsQuickActions = [
  { id: '1', label: 'Change Password', icon: 'lock', action: () => console.log('Change password'), variant: 'default' as const },
  { id: '2', label: 'Export Data', icon: 'download', action: () => console.log('Export data'), variant: 'default' as const },
  { id: '3', label: 'View Invoices', icon: 'file', action: () => console.log('View invoices'), variant: 'outline' as const },
]

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
      toast.success('Notifications saved', { description: 'Your preferences have been updated' })
    } catch (error: any) {
      toast.error('Error', { description: error.message || 'Failed to save notifications' })
    } finally {
      setIsSaving(false)
    }
  }

  // Update password
  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setIsSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      toast.success('Password updated', { description: 'Your password has been changed' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSecurity(prev => ({ ...prev, passwordLastChanged: new Date().toISOString() }))
    } catch (error: any) {
      toast.error('Error', { description: error.message || 'Failed to update password' })
    } finally {
      setIsSaving(false)
    }
  }

  // Toggle 2FA
  const handleToggle2FA = async () => {
    if (!userId) return
    setIsSaving(true)
    try {
      const newValue = !security.twoFactorEnabled
      const { error } = await supabase
        .from('user_settings')
        .update({ two_factor_enabled: newValue, updated_at: new Date().toISOString() })
        .eq('user_id', userId)

      if (error) throw error
      setSecurity(prev => ({ ...prev, twoFactorEnabled: newValue }))
      toast.success(newValue ? '2FA enabled' : '2FA disabled', {
        description: newValue ? 'Two-factor authentication is now active' : 'Two-factor authentication has been disabled'
      })
    } catch (error: any) {
      toast.error('Error', { description: error.message || 'Failed to toggle 2FA' })
    } finally {
      setIsSaving(false)
    }
  }

  // Revoke session
  const handleRevokeSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false, revoked_at: new Date().toISOString() })
        .eq('id', sessionId)

      if (error) throw error
      setSessions(prev => prev.filter(s => s.id !== sessionId))
      toast.success('Session revoked', { description: 'Device has been logged out' })
    } catch (error: any) {
      toast.error('Error', { description: error.message || 'Failed to revoke session' })
    }
  }

  // Revoke all sessions
  const handleRevokeAllSessions = async () => {
    if (!userId) return
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false, revoked_at: new Date().toISOString() })
        .eq('user_id', userId)
        .neq('is_current', true)

      if (error) throw error
      setSessions(prev => prev.filter(s => s.isCurrent))
      toast.success('All sessions revoked', { description: 'All other devices have been logged out' })
    } catch (error: any) {
      toast.error('Error', { description: error.message || 'Failed to revoke sessions' })
    }
  }

  // Connect/disconnect integration
  const handleToggleIntegration = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId)
    if (!integration) return

    try {
      const isConnecting = integration.status !== 'connected'
      const { error } = await supabase
        .from('integrations')
        .update({
          status: isConnecting ? 'connected' : 'disconnected',
          is_connected: isConnecting,
          connected_at: isConnecting ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', integrationId)

      if (error) throw error
      setIntegrations(prev => prev.map(i =>
        i.id === integrationId
          ? { ...i, status: isConnecting ? 'connected' : 'disconnected', connectedAt: isConnecting ? new Date().toISOString() : null }
          : i
      ))
      toast.success(isConnecting ? 'Connected' : 'Disconnected', {
        description: `${integration.name} has been ${isConnecting ? 'connected' : 'disconnected'}`
      })
    } catch (error: any) {
      toast.error('Error', { description: error.message || 'Failed to update integration' })
    }
  }

  // Save theme
  const handleSaveTheme = async (newTheme: ThemeMode) => {
    if (!userId) return
    setTheme(newTheme)
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({ theme: newTheme, updated_at: new Date().toISOString() })
        .eq('user_id', userId)

      if (error) throw error
      toast.success('Theme updated', { description: `Theme set to ${newTheme}` })
    } catch (error: any) {
      toast.error('Error', { description: error.message || 'Failed to save theme' })
    }
  }

  // Export data
  const handleExportData = async () => {
    if (!userId) return
    toast.info('Exporting data', { description: 'Preparing your data export...' })
    try {
      const { data: settings } = await supabase.from('user_settings').select('*').eq('user_id', userId).single()
      const { data: sessions } = await supabase.from('user_sessions').select('*').eq('user_id', userId)
      const { data: integrations } = await supabase.from('integrations').select('*').eq('user_id', userId)

      const exportData = { settings, sessions, integrations, exportedAt: new Date().toISOString() }
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `settings-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Data exported', { description: 'Your data has been downloaded' })
    } catch (error: any) {
      toast.error('Error', { description: error.message || 'Failed to export data' })
    }
  }

  // Delete account
  const handleDeleteAccount = async () => {
    toast.warning('Delete Account', {
      description: 'This action cannot be undone. Please contact support to delete your account.',
      duration: 5000
    })
  }

  // Legacy handler for compatibility
  const handleSave = async (section: string) => {
    if (section === 'Profile') await handleSaveProfile()
    else if (section === 'Notifications') await handleSaveNotifications()
    else if (section === 'Password') await handleUpdatePassword()
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
            <Button variant="outline" onClick={handleExportData}>
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
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Profile Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Profile Settings</h2>
                  <p className="text-blue-100">Manage your personal information and preferences</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">
                      <CheckCircle2 className="w-6 h-6 mx-auto" />
                    </p>
                    <p className="text-blue-200 text-sm">Verified</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">85%</p>
                    <p className="text-blue-200 text-sm">Complete</p>
                  </div>
                  <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white" onClick={handleSaveProfile} disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Profile Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Camera, label: 'Change Photo', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                { icon: User, label: 'Edit Profile', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
                { icon: Lock, label: 'Password', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: Shield, label: 'Privacy', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
                { icon: Bell, label: 'Notifications', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
                { icon: Link2, label: 'Connections', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
                { icon: Download, label: 'Export Data', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
                { icon: Trash2, label: 'Delete', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

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

                    <Button onClick={handleSaveProfile} disabled={isSaving}>
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
            {/* Security Banner */}
            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Security Center</h2>
                  <p className="text-green-100">Protect your account with enterprise-grade security</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold flex items-center gap-1">
                      <Shield className="w-6 h-6" />
                      Strong
                    </p>
                    <p className="text-green-200 text-sm">Security Level</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">
                      <CheckCircle2 className="w-6 h-6 mx-auto" />
                    </p>
                    <p className="text-green-200 text-sm">2FA Enabled</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">3</p>
                    <p className="text-green-200 text-sm">Active Sessions</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Lock, label: 'Password', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
                { icon: Fingerprint, label: '2FA Setup', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
                { icon: Key, label: 'API Keys', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
                { icon: Monitor, label: 'Sessions', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                { icon: History, label: 'Activity Log', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: AlertTriangle, label: 'Alerts', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
                { icon: Download, label: 'Backup Codes', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
                { icon: LogOut, label: 'Log Out All', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

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
                        <Input type={showPassword ? 'text' : 'password'} placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                        <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">New Password</label>
                      <Input type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Confirm New Password</label>
                      <Input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                    <p className="text-xs text-gray-500">Last changed {formatTimeAgo(security.passwordLastChanged)}</p>
                    <Button onClick={handleUpdatePassword} disabled={isSaving || !newPassword}>
                      {isSaving ? 'Updating...' : 'Update Password'}
                    </Button>
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
                      <Button variant={security.twoFactorEnabled ? 'outline' : 'default'} onClick={handleToggle2FA} disabled={isSaving}>
                        {security.twoFactorEnabled ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Active Sessions</CardTitle>
                      <Button variant="outline" size="sm" onClick={handleRevokeAllSessions}>
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
                            <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleRevokeSession(session.id)}>
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
            {/* Notifications Banner */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Notification Center</h2>
                  <p className="text-amber-100">Customize how and when you receive alerts</p>
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white">
                    <Bell className="w-4 h-4 mr-2" />
                    Test Notification
                  </Button>
                </div>
              </div>
            </div>

            {/* Notifications Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Mail, label: 'Email', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
                { icon: Bell, label: 'Push', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
                { icon: Smartphone, label: 'SMS', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
                { icon: Volume2, label: 'Sounds', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
                { icon: Moon, label: 'Do Not Disturb', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: Clock, label: 'Schedule', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                { icon: Filter, label: 'Filters', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
                { icon: XCircle, label: 'Mute All', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400' },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

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
                  <Button onClick={handleSaveNotifications} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            {/* Integrations Banner */}
            <div className="bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Connected Apps</h2>
                  <p className="text-purple-100">Manage your third-party integrations and connections</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{integrations.filter(i => i.status === 'connected').length}</p>
                  <p className="text-purple-200 text-sm">Active</p>
                </div>
              </div>
            </div>

            {/* Integrations Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'Add New', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: Globe, label: 'Browse All', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
                { icon: Link2, label: 'OAuth Apps', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
                { icon: Key, label: 'API Tokens', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                { icon: Database, label: 'Webhooks', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
                { icon: RefreshCw, label: 'Sync', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
                { icon: History, label: 'Logs', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
                { icon: Unlink, label: 'Revoke All', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

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
                      onClick={() => handleToggleIntegration(integration.id)}
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
            {/* Billing Banner */}
            <div className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Billing & Subscription</h2>
                  <p className="text-teal-100">Manage your plan, payments, and invoices</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">${billing.amount}</p>
                    <p className="text-teal-200 text-sm">/{billing.billingCycle}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: ArrowUpRight, label: 'Upgrade', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
                { icon: CreditCard, label: 'Payment', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400' },
                { icon: FileText, label: 'Invoices', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                { icon: History, label: 'History', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
                { icon: Download, label: 'Download', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: RefreshCw, label: 'Auto-Renew', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
                { icon: Mail, label: 'Receipts', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
                { icon: XCircle, label: 'Cancel', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

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
            {/* Appearance Banner */}
            <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Appearance & Display</h2>
                  <p className="text-pink-100">Customize your visual experience</p>
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset to Defaults
                  </Button>
                </div>
              </div>
            </div>

            {/* Appearance Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Sun, label: 'Light Mode', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
                { icon: Moon, label: 'Dark Mode', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
                { icon: Palette, label: 'Colors', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
                { icon: Type, label: 'Fonts', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
                { icon: Contrast, label: 'Contrast', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: Languages, label: 'Language', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                { icon: Accessibility, label: 'A11y', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
                { icon: Monitor, label: 'Display', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400' },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

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
                        onClick={() => handleSaveTheme(option.value as ThemeMode)}
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

          {/* Advanced Tab - System Preferences level */}
          <TabsContent value="advanced" className="space-y-6">
            {/* Advanced Banner */}
            <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Advanced Settings</h2>
                  <p className="text-slate-200">Developer options and system configuration</p>
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white">
                    <Download className="w-4 h-4 mr-2" />
                    Export Config
                  </Button>
                </div>
              </div>
            </div>

            {/* Advanced Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Key, label: 'API Keys', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400' },
                { icon: Database, label: 'Webhooks', color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400' },
                { icon: HardDrive, label: 'Storage', color: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900/30 dark:text-zinc-400' },
                { icon: Cloud, label: 'Backups', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                { icon: History, label: 'Logs', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: Zap, label: 'Performance', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
                { icon: RefreshCw, label: 'Reset', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
                { icon: Trash2, label: 'Delete Account', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Developer Settings */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="w-5 h-5 text-blue-500" />
                      Developer Settings
                    </CardTitle>
                    <CardDescription>Configure developer tools and API access</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>API Key</Label>
                      <div className="flex gap-2">
                        <Input type="password" value="STRIPE_KEY_PLACEHOLDER" readOnly className="font-mono" />
                        <Button variant="outline" size="icon">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">Regenerate</Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Never share your API key publicly</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Webhook URL</Label>
                      <Input placeholder="https://your-app.com/webhooks" />
                    </div>

                    <div className="border-t pt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Enable API Access</p>
                          <p className="text-sm text-muted-foreground">Allow programmatic access to your account</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Developer Mode</p>
                          <p className="text-sm text-muted-foreground">Show additional debugging info</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Verbose Logging</p>
                          <p className="text-sm text-muted-foreground">Enable detailed activity logs</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Data Management */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-green-500" />
                      Data Management
                    </CardTitle>
                    <CardDescription>Control your data and storage settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Data Retention Period</Label>
                        <Select defaultValue="90">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 Days</SelectItem>
                            <SelectItem value="60">60 Days</SelectItem>
                            <SelectItem value="90">90 Days</SelectItem>
                            <SelectItem value="180">180 Days</SelectItem>
                            <SelectItem value="365">1 Year</SelectItem>
                            <SelectItem value="forever">Forever</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Backup Frequency</Label>
                        <Select defaultValue="daily">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="realtime">Real-time</SelectItem>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Auto-archive Old Data</p>
                          <p className="text-sm text-muted-foreground">Move old data to cold storage</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Compress Backups</p>
                          <p className="text-sm text-muted-foreground">Reduce backup storage size</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={handleExportData}>
                        <Download className="w-4 h-4 mr-2" />
                        Export All Data
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Upload className="w-4 h-4 mr-2" />
                        Import Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Settings */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-purple-500" />
                      Performance Settings
                    </CardTitle>
                    <CardDescription>Optimize application performance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Enable Caching</p>
                        <p className="text-sm text-muted-foreground">Cache data for faster loading</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Prefetch Resources</p>
                        <p className="text-sm text-muted-foreground">Preload content for instant access</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Hardware Acceleration</p>
                        <p className="text-sm text-muted-foreground">Use GPU for rendering</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Background Sync</p>
                        <p className="text-sm text-muted-foreground">Sync data in background</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="space-y-2">
                      <Label>Cache Size Limit (MB)</Label>
                      <div className="flex items-center gap-4">
                        <Input type="range" min="100" max="1000" defaultValue="500" className="flex-1" />
                        <span className="text-sm font-medium w-16">500 MB</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Experimental Features */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      Experimental Features
                    </CardTitle>
                    <CardDescription>Try out new features before they're released</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-900">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800 dark:text-yellow-200">Warning</p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">Experimental features may be unstable</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {[
                        { name: 'AI Assistant', description: 'Use AI to help with tasks', beta: true },
                        { name: 'New Dashboard', description: 'Redesigned dashboard layout', beta: true },
                        { name: 'Voice Commands', description: 'Control with voice', alpha: true },
                        { name: 'Collaborative Editing', description: 'Real-time collaboration', beta: true }
                      ].map(feature => (
                        <div key={feature.name} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{feature.name}</p>
                                <Badge variant="secondary" className="text-xs">
                                  {feature.alpha ? 'Alpha' : 'Beta'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </div>
                          </div>
                          <Switch />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Privacy & Security Advanced */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-green-500" />
                      Advanced Privacy
                    </CardTitle>
                    <CardDescription>Enhanced privacy and security settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">End-to-End Encryption</p>
                        <p className="text-sm text-muted-foreground">Encrypt all data transfers</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Anonymous Analytics</p>
                        <p className="text-sm text-muted-foreground">Share anonymous usage data</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Telemetry</p>
                        <p className="text-sm text-muted-foreground">Send crash reports</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Cookie Preferences</p>
                        <p className="text-sm text-muted-foreground">Manage cookie consent</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    <div className="space-y-2">
                      <Label>Session Timeout (minutes)</Label>
                      <Select defaultValue="30">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 Minutes</SelectItem>
                          <SelectItem value="30">30 Minutes</SelectItem>
                          <SelectItem value="60">1 Hour</SelectItem>
                          <SelectItem value="240">4 Hours</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-red-200 dark:border-red-900 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <AlertOctagon className="w-5 h-5" />
                      Danger Zone
                    </CardTitle>
                    <CardDescription className="text-red-600/70">Irreversible and destructive actions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg">
                      <div>
                        <p className="font-medium text-red-600">Clear All Caches</p>
                        <p className="text-sm text-muted-foreground">Remove all cached data</p>
                      </div>
                      <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                        <Trash className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg">
                      <div>
                        <p className="font-medium text-red-600">Reset All Settings</p>
                        <p className="text-sm text-muted-foreground">Restore default settings</p>
                      </div>
                      <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg">
                      <div>
                        <p className="font-medium text-red-600">Deactivate Account</p>
                        <p className="text-sm text-muted-foreground">Temporarily disable your account</p>
                      </div>
                      <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                        <Ban className="w-4 h-4 mr-2" />
                        Deactivate
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg bg-red-50 dark:bg-red-900/10">
                      <div>
                        <p className="font-medium text-red-600">Delete Account</p>
                        <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                      </div>
                      <Button variant="destructive" onClick={handleDeleteAccount}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="w-5 h-5" />
                      System Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { label: 'Version', value: 'v2.4.1' },
                      { label: 'Build', value: '2024.12.25-stable' },
                      { label: 'Environment', value: 'Production' },
                      { label: 'Region', value: 'US-East-1' },
                      { label: 'Last Updated', value: 'Dec 25, 2024' }
                    ].map(item => (
                      <div key={item.label} className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-mono">{item.value}</span>
                      </div>
                    ))}
                    <div className="pt-3 border-t">
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Changelog
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Resource Usage
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Storage Used</span>
                        <span className="font-medium">2.4 GB / 10 GB</span>
                      </div>
                      <Progress value={24} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>API Calls</span>
                        <span className="font-medium">8,420 / 10,000</span>
                      </div>
                      <Progress value={84} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Bandwidth</span>
                        <span className="font-medium">45 GB / 100 GB</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Documentation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { label: 'API Reference', href: '#' },
                      { label: 'Developer Guide', href: '#' },
                      { label: 'Webhook Documentation', href: '#' },
                      { label: 'Security Best Practices', href: '#' }
                    ].map(link => (
                      <a
                        key={link.label}
                        href={link.href}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm transition-colors"
                      >
                        <span>{link.label}</span>
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </a>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="w-5 h-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { action: 'API key regenerated', time: '2 hours ago' },
                      { action: 'Settings updated', time: '1 day ago' },
                      { action: 'Backup created', time: '3 days ago' },
                      { action: 'Cache cleared', time: '1 week ago' }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span>{item.action}</span>
                        <span className="text-muted-foreground">{item.time}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockSettingsAIInsights}
              title="Account Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockSettingsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockSettingsPredictions}
              title="Account Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockSettingsActivities}
            title="Account Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockSettingsQuickActions}
            variant="grid"
          />
        </div>
      </div>
    </div>
  )
}
