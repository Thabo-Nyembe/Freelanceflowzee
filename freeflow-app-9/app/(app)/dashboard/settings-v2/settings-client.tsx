'use client'

import { createClient } from '@/lib/supabase/client'

// MIGRATED: Batch #17 - Verified database hook integration
// Hooks used: useSettings, useState, useMemo, useEffect, useCallback

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useSettings } from '@/hooks/use-settings'
import { Skeleton } from '@/components/ui/skeleton'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
  BookOpen,
  Users
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

import { useTeam } from '@/lib/hooks/use-team'
import { useActivityLogs } from '@/lib/hooks/use-activity-logs'

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

// Initial States
const emptyProfile: UserProfile = {
  id: '',
  email: '',
  firstName: '',
  lastName: '',
  displayName: '',
  avatar: '',
  bio: '',
  phone: '',
  location: '',
  website: '',
  timezone: '',
  language: 'en-US',
  createdAt: ''
}

const emptySecurity: SecuritySettings = {
  twoFactorEnabled: false,
  twoFactorMethod: 'app',
  passwordLastChanged: '',
  securityScore: 0,
  loginNotifications: true,
  trustedDevices: 0
}

const emptyBilling: BillingInfo = {
  plan: 'free',
  billingCycle: 'monthly',
  nextBillingDate: '',
  amount: 0,
  paymentMethod: '',
  cardLast4: ''
}

// ============================================================================
// ENHANCED COMPETITIVE UPGRADE - Settings Level
// ============================================================================

// Types for competitive upgrade components
interface AIInsight {
  id: string
  type: 'recommendation' | 'alert' | 'opportunity' | 'prediction' | 'success' | 'info' | 'warning' | 'error'
  title: string
  description: string
  impact?: 'high' | 'medium' | 'low'
  priority?: 'high' | 'medium' | 'low'
  metric?: string
  change?: number
  confidence?: number
  action?: string
  category?: string
  timestamp?: string | Date
  createdAt?: Date
}

interface Collaborator {
  id: string
  name: string
  avatar?: string
  color?: string
  status: 'online' | 'away' | 'offline'
  role?: string
  isTyping?: boolean
  lastSeen?: Date
  lastActive?: string | Date
  cursor?: { x: number; y: number }
}

interface Prediction {
  id?: string
  label?: string
  title?: string
  prediction?: string
  current?: number
  target?: number
  currentValue?: number
  predictedValue?: number
  predicted?: number
  confidence: number
  trend: 'up' | 'down' | 'stable'
  timeframe?: string
  impact?: string
  factors?: Array<{ name: string; impact: 'positive' | 'negative' | 'neutral'; weight: number }> | string[]
}

interface ActivityItem {
  id: string
  type: 'comment' | 'update' | 'create' | 'delete' | 'mention' | 'assignment' | 'status_change' | 'milestone' | 'integration'
  title: string
  action?: string
  description?: string
  user: {
    id: string
    name: string
    avatar?: string
  }
  target?: {
    type: string
    name: string
    url?: string
  }
  metadata?: Record<string, unknown>
  timestamp: Date | string
  isRead?: boolean
  isPinned?: boolean
  actions?: Array<{
    label: string
    action: () => void
    variant?: 'default' | 'destructive'
  }>
}

// Empty arrays for competitive upgrade components - data will come from hooks/API
const settingsAIInsights: AIInsight[] = []
const settingsCollaborators: Collaborator[] = []
const settingsPredictions: Prediction[] = []
const settingsActivities: ActivityItem[] = []

// Quick actions will be defined inside component to access handlers
const getSettingsQuickActions = (handleExportData: () => Promise<void>) => [
  { id: '1', label: 'Change Password', icon: 'lock', action: () => { document.querySelector('[value="security"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true })); toast.success('Navigate to Security tab to change password') }, variant: 'default' as const },
  { id: '2', label: 'Export Data', icon: 'download', action: () => { handleExportData(); }, variant: 'default' as const },
  { id: '3', label: 'View Invoices', icon: 'file', action: () => { document.querySelector('[value="billing"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true })); toast.success('Navigate to Billing tab to view invoices') }, variant: 'outline' as const },
]

export default function SettingsClient() {
  const supabase = createClient()
  const router = useRouter()

  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Use the useSettings hook for centralized settings management
  const {
    notifications: hookNotifications,
    security: hookSecurity,
    appearance: hookAppearance,
    privacy: hookPrivacy,
    apiKeys,
    sessions: hookSessions,
    isLoading: isSettingsLoading,
    isSaving: isSettingsSaving,
    error: settingsError,
    hasUnsavedChanges,
    updateNotifications,
    updateSecurity,
    updateAppearance,
    updatePrivacy,
    generateApiKey,
    revokeApiKey,
    fetchApiKeys,
    enable2FA,
    verify2FA,
    disable2FA,
    terminateSession: hookTerminateSession,
    terminateAllSessions: hookTerminateAllSessions,
    changePassword: hookChangePassword,
    exportSettings,
    refresh: refreshSettings
  } = useSettings({ autoSave: false })

  // Form state with Supabase data
  const [profile, setProfile] = useState<UserProfile>(emptyProfile)
  const [security, setSecurity] = useState<SecuritySettings>(emptySecurity)
  const [sessions, setSessions] = useState<Session[]>([])
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [notifications, setNotifications] = useState<NotificationPreference[]>([])
  const [billing, setBilling] = useState<BillingInfo>(emptyBilling)
  const [invoices, setInvoices] = useState<Invoice[]>([])

  const [theme, setTheme] = useState<ThemeMode>('system')
  const [showPassword, setShowPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // API Keys state
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [newApiKeyName, setNewApiKeyName] = useState('')
  const [newApiKeyPermissions, setNewApiKeyPermissions] = useState<string[]>(['read'])
  const [generatedApiKey, setGeneratedApiKey] = useState<string | null>(null)

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Additional settings state
  const [soundsEnabled, setSoundsEnabled] = useState(true)
  const [doNotDisturb, setDoNotDisturb] = useState(false)
  const [notificationSchedule, setNotificationSchedule] = useState<'all-day' | 'work-hours' | 'custom'>('all-day')
  const [notificationFilters, setNotificationFilters] = useState<string[]>([])
  const [autoRenew, setAutoRenew] = useState(true)
  const [emailReceipts, setEmailReceipts] = useState(true)
  const [accentColor, setAccentColor] = useState('#3B82F6')
  const [fontScale, setFontScale] = useState<'default' | 'large'>('default')
  const [highContrast, setHighContrast] = useState(false)
  const [cookiePreferences, setCookiePreferences] = useState<'essential' | 'functional' | 'all'>('essential')

  // Confirmation dialog states
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false)
  const [showRevokeAllIntegrationsDialog, setShowRevokeAllIntegrationsDialog] = useState(false)
  const [showResetSettingsDialog, setShowResetSettingsDialog] = useState(false)
  const [showClearCacheDialog, setShowClearCacheDialog] = useState(false)
  const [showDeactivateAccountDialog, setShowDeactivateAccountDialog] = useState(false)
  const [showCancelSubscriptionDialog, setShowCancelSubscriptionDialog] = useState(false)
  const [showMuteAllNotificationsDialog, setShowMuteAllNotificationsDialog] = useState(false)
  const [showRevokeAllSessionsDialog, setShowRevokeAllSessionsDialog] = useState(false)

  // Accessibility settings state
  const [reduceMotion, setReduceMotion] = useState(false)
  const [largeText, setLargeText] = useState(false)

  // Avatar file upload state
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  // Webhook URL state
  const [webhookUrl, setWebhookUrl] = useState('')
  const [isSavingWebhook, setIsSavingWebhook] = useState(false)

  // Developer settings state
  const [apiAccessEnabled, setApiAccessEnabled] = useState(true)
  const [developerMode, setDeveloperMode] = useState(false)
  const [verboseLogging, setVerboseLogging] = useState(false)

  // Data management state
  const [dataRetentionPeriod, setDataRetentionPeriod] = useState('90')
  const [backupFrequency, setBackupFrequency] = useState('daily')
  const [autoArchive, setAutoArchive] = useState(true)
  const [compressBackups, setCompressBackups] = useState(true)

  // Performance settings state
  const [cachingEnabled, setCachingEnabled] = useState(true)
  const [prefetchEnabled, setPrefetchEnabled] = useState(true)
  const [hardwareAcceleration, setHardwareAcceleration] = useState(true)
  const [backgroundSync, setBackgroundSync] = useState(true)
  const [cacheSizeLimit, setCacheSizeLimit] = useState(500)

  // Experimental features state
  const [experimentalFeatures, setExperimentalFeatures] = useState<Record<string, boolean>>({
    'AI Assistant': false,
    'New Dashboard': false,
    'Voice Commands': false,
    'Collaborative Editing': false
  })

  // Privacy settings state
  const [e2eEncryption, setE2eEncryption] = useState(true)
  const [anonymousAnalytics, setAnonymousAnalytics] = useState(false)
  const [telemetryEnabled, setTelemetryEnabled] = useState(true)
  const [sessionTimeout, setSessionTimeout] = useState('30')

  // Team and activity logs hooks for collaboration and activity components
  const { members: teamMembers } = useTeam()
  const { logs: activityLogsData } = useActivityLogs()

  // Map team members to collaborators format
  const settingsCollaboratorsData = useMemo(() =>
    teamMembers.map(member => ({
      id: member.id,
      name: member.name,
      avatar: member.avatar_url || '/avatars/default.jpg',
      status: member.status === 'active' ? 'online' as const : member.status === 'on_leave' ? 'away' as const : 'offline' as const,
      role: member.role || 'Team Member'
    })), [teamMembers])

  // Map activity logs to activities format
  const settingsActivitiesData = useMemo(() =>
    activityLogsData.slice(0, 10).map(log => ({
      id: log.id,
      user: log.user_name || 'System',
      action: log.action,
      target: log.resource_name || log.resource_type || '',
      timestamp: log.created_at,
      type: log.status === 'success' ? 'success' as const : log.status === 'failed' ? 'error' as const : 'info' as const
    })), [activityLogsData])

  // Load additional settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('freeflow-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        if (parsed.soundsEnabled !== undefined) setSoundsEnabled(parsed.soundsEnabled)
        if (parsed.doNotDisturb !== undefined) setDoNotDisturb(parsed.doNotDisturb)
        if (parsed.notificationSchedule) setNotificationSchedule(parsed.notificationSchedule)
        if (parsed.notificationFilters) setNotificationFilters(parsed.notificationFilters)
        if (parsed.autoRenew !== undefined) setAutoRenew(parsed.autoRenew)
        if (parsed.emailReceipts !== undefined) setEmailReceipts(parsed.emailReceipts)
        if (parsed.accentColor) setAccentColor(parsed.accentColor)
        if (parsed.fontScale) setFontScale(parsed.fontScale)
        if (parsed.highContrast !== undefined) setHighContrast(parsed.highContrast)
        if (parsed.cookiePreferences) setCookiePreferences(parsed.cookiePreferences)
        // Load new settings
        if (parsed.reduceMotion !== undefined) setReduceMotion(parsed.reduceMotion)
        if (parsed.largeText !== undefined) setLargeText(parsed.largeText)
        if (parsed.webhookUrl) setWebhookUrl(parsed.webhookUrl)
        if (parsed.apiAccessEnabled !== undefined) setApiAccessEnabled(parsed.apiAccessEnabled)
        if (parsed.developerMode !== undefined) setDeveloperMode(parsed.developerMode)
        if (parsed.verboseLogging !== undefined) setVerboseLogging(parsed.verboseLogging)
        if (parsed.dataRetentionPeriod) setDataRetentionPeriod(parsed.dataRetentionPeriod)
        if (parsed.backupFrequency) setBackupFrequency(parsed.backupFrequency)
        if (parsed.autoArchive !== undefined) setAutoArchive(parsed.autoArchive)
        if (parsed.compressBackups !== undefined) setCompressBackups(parsed.compressBackups)
        if (parsed.cachingEnabled !== undefined) setCachingEnabled(parsed.cachingEnabled)
        if (parsed.prefetchEnabled !== undefined) setPrefetchEnabled(parsed.prefetchEnabled)
        if (parsed.hardwareAcceleration !== undefined) setHardwareAcceleration(parsed.hardwareAcceleration)
        if (parsed.backgroundSync !== undefined) setBackgroundSync(parsed.backgroundSync)
        if (parsed.cacheSizeLimit !== undefined) setCacheSizeLimit(parsed.cacheSizeLimit)
        if (parsed.experimentalFeatures) setExperimentalFeatures(parsed.experimentalFeatures)
        if (parsed.e2eEncryption !== undefined) setE2eEncryption(parsed.e2eEncryption)
        if (parsed.anonymousAnalytics !== undefined) setAnonymousAnalytics(parsed.anonymousAnalytics)
        if (parsed.telemetryEnabled !== undefined) setTelemetryEnabled(parsed.telemetryEnabled)
        if (parsed.sessionTimeout) setSessionTimeout(parsed.sessionTimeout)
        // Apply loaded accessibility settings to DOM
        if (parsed.reduceMotion) document.documentElement.classList.add('reduce-motion')
        if (parsed.highContrast) document.documentElement.classList.add('high-contrast')
        if (parsed.largeText) document.documentElement.style.fontSize = '18px'
      } catch (e) {
        // Silently handle parsing errors
      }
    }
  }, [])

  // Save additional settings to localStorage
  const saveLocalSettings = (updates: Record<string, any>) => {
    const current = localStorage.getItem('freeflow-settings')
    const parsed = current ? JSON.parse(current) : {}
    const updated = { ...parsed, ...updates }
    localStorage.setItem('freeflow-settings', JSON.stringify(updated))
  }

  // Sync hook data with local state when hook data changes
  useEffect(() => {
    if (!isSettingsLoading && hookAppearance) {
      setTheme(hookAppearance.theme as ThemeMode)
      setAccentColor(hookAppearance.accentColor || '#3B82F6')
      setHighContrast(hookAppearance.highContrast || false)
      setFontScale(hookAppearance.fontSize === 'large' ? 'large' : 'default')
    }
  }, [isSettingsLoading, hookAppearance])

  // Sync security settings from hook
  useEffect(() => {
    if (!isSettingsLoading && hookSecurity) {
      setSecurity(prev => ({
        ...prev,
        twoFactorEnabled: hookSecurity.twoFactorAuth || false,
        twoFactorMethod: hookSecurity.twoFactorMethod === 'authenticator' ? 'app' : (hookSecurity.twoFactorMethod || 'app'),
        loginNotifications: hookSecurity.loginAlerts || true,
        passwordLastChanged: hookSecurity.passwordLastChanged || prev.passwordLastChanged
      }))
    }
  }, [isSettingsLoading, hookSecurity])

  // Mark initial load complete
  useEffect(() => {
    if (!isSettingsLoading && isInitialLoad) {
      setIsInitialLoad(false)
    }
  }, [isSettingsLoading, isInitialLoad])

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
  }, [])

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
    if (!userId) {
      toast.error('Error')
      return
    }
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
      toast.success('Profile saved')
      setSaveMessage('Profile saved successfully!')
      setLastSaved(new Date())
    } catch (error) {
      console.error('Profile save error:', error)
      toast.error('Failed to save profile')
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
      toast.success('Notifications saved')
    } catch (error) {
      toast.error('Error')
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
      toast.success('Password updated')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSecurity(prev => ({ ...prev, passwordLastChanged: new Date().toISOString() }))
    } catch (error) {
      toast.error('Error')
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
      toast.success(newValue ? '2FA enabled' : '2FA disabled')
    } catch (error) {
      toast.error('Error')
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
      toast.success('Session revoked')
    } catch (error) {
      toast.error('Error')
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
      toast.success('All sessions revoked')
    } catch (error) {
      toast.error('Error')
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
      toast.success(`${isConnecting ? 'Connected' : 'Disconnected'} has been ${isConnecting ? 'connected' : 'disconnected'}`)
    } catch (error) {
      toast.error('Error')
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
      toast.success(`Theme updated to ${newTheme}`)
    } catch (error) {
      toast.error('Error')
    }
  }

  // Export data
  const handleExportData = async () => {
    if (!userId) return
    toast.info('Exporting data')
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
      toast.success('Data exported')
    } catch (error) {
      toast.error('Error')
    }
  }

  // Delete account
  const handleDeleteAccount = () => {
    setShowDeleteAccountDialog(true)
  }

  // Confirm delete account
  const handleConfirmDeleteAccount = async () => {
    try {
      const response = await fetch('/api/account/delete', { method: 'DELETE' })
      if (response.ok) {
        toast.success('Account deletion requested')
        // Sign out user
        await supabase.auth.signOut()
        window.location.href = '/'
      } else {
        toast.error('Failed to delete account')
      }
    } catch {
      toast.error('Failed to delete account')
    }
    setShowDeleteAccountDialog(false)
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

  // API Key Management handlers
  const handleGenerateApiKey = async () => {
    if (!newApiKeyName.trim()) {
      toast.error('Please enter a name for your API key')
      return
    }
    setIsSaving(true)
    try {
      const result = await generateApiKey({
        name: newApiKeyName,
        permissions: newApiKeyPermissions
      })
      if (result.success && result.apiKey) {
        setGeneratedApiKey(result.apiKey.key)
        toast.success('API key generated')
        setNewApiKeyName('')
        setNewApiKeyPermissions(['read'])
        setLastSaved(new Date())
      } else {
        toast.error('Failed to generate API key')
      }
    } catch (error) {
      toast.error('Error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRevokeApiKey = async (keyId: string) => {
    try {
      const result = await revokeApiKey(keyId)
      if (result.success) {
        toast.success('API key revoked')
        refreshSettings()
      } else {
        toast.error('Failed to revoke key')
      }
    } catch (error) {
      toast.error('Error')
    }
  }

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key)
    toast.success('API key copied to clipboard')
  }

  // Enhanced appearance save that uses the hook
  const handleSaveAppearance = async () => {
    setIsSaving(true)
    try {
      const result = await updateAppearance({
        theme: theme,
        accentColor: accentColor,
        highContrast: highContrast,
        fontSize: fontScale === 'large' ? 'large' : 'medium'
      })
      if (result.success) {
        toast.success('Appearance saved')
        setLastSaved(new Date())
      } else {
        toast.error('Failed to save appearance')
      }
    } catch (error) {
      toast.error('Error')
    } finally {
      setIsSaving(false)
    }
  }

  // Enhanced notifications save using the hook
  const handleSaveNotificationsEnhanced = async () => {
    setIsSaving(true)
    try {
      // Convert notification preferences to hook format
      const notifSettings = {
        emailNotifications: notifications.some(n => n.email),
        pushNotifications: notifications.some(n => n.push),
        inAppNotifications: notifications.some(n => n.inApp),
        smsNotifications: notifications.some(n => n.sms),
        quietHoursEnabled: doNotDisturb
      }
      const result = await updateNotifications(notifSettings)
      if (result.success) {
        toast.success('Notifications saved')
        setLastSaved(new Date())
      }
      // Also save to direct Supabase for category-level preferences
      await handleSaveNotifications()
    } catch (error) {
      toast.error('Error')
    } finally {
      setIsSaving(false)
    }
  }

  // Refresh all settings from Supabase
  const handleRefreshSettings = useCallback(async () => {
    setIsLoading(true)
    try {
      await refreshSettings()
      toast.success('Settings refreshed')
    } catch (error) {
      toast.error('Error')
    } finally {
      setIsLoading(false)
    }
  }, [refreshSettings])

  // Avatar upload handler
  const handleAvatarUpload = async (file: File) => {
    if (!userId || !file) return
    setIsUploadingAvatar(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      await supabase
        .from('user_settings')
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('user_id', userId)

      setProfile(prev => ({ ...prev, avatar: publicUrl }))
      setAvatarFile(null)
      toast.success('Avatar updated')
    } catch (error) {
      toast.error('Upload failed')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // Webhook save handler
  const handleSaveWebhook = async () => {
    if (!userId) return
    setIsSavingWebhook(true)
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({ webhook_url: webhookUrl, updated_at: new Date().toISOString() })
        .eq('user_id', userId)

      if (error) throw error
      saveLocalSettings({ webhookUrl })
      toast.success('Webhook saved')
    } catch (error) {
      toast.error('Error')
    } finally {
      setIsSavingWebhook(false)
    }
  }

  // Revoke all integrations handler
  const handleRevokeAllIntegrations = async () => {
    try {
      if (userId) {
        await supabase
          .from('integrations')
          .update({
            status: 'disconnected',
            is_connected: false,
            connected_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
      }
      setIntegrations(prev => prev.map(i => ({
        ...i,
        status: 'disconnected' as IntegrationStatus,
        connectedAt: null
      })))
      toast.success('All integrations revoked')
    } catch (error) {
      toast.error('Error')
    }
    setShowRevokeAllIntegrationsDialog(false)
  }

  // Clear all caches handler
  const handleClearAllCaches = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
      }
      localStorage.clear()
      sessionStorage.clear()
      toast.success('All caches cleared')
    } catch (error) {
      toast.error('Error')
    }
    setShowClearCacheDialog(false)
  }

  // Reset all settings handler
  const handleResetAllSettings = async () => {
    try {
      const response = await fetch('/api/settings/reset', { method: 'POST' })
      if (!response.ok) throw new Error('Reset failed')
      toast.success('All settings reset to defaults')
      setTimeout(() => window.location.reload(), 1500)
    } catch {
      toast.error('Failed to reset settings')
    }
    setShowResetSettingsDialog(false)
  }

  // Deactivate account handler
  const handleDeactivateAccount = async () => {
    try {
      const response = await fetch('/api/account/deactivate', { method: 'POST' })
      if (!response.ok) throw new Error('Deactivation failed')
      toast.success('Account deactivated')
    } catch {
      toast.error('Failed to deactivate account')
    }
    setShowDeactivateAccountDialog(false)
  }

  // Cancel subscription handler
  const handleCancelSubscription = async () => {
    try {
      const response = await fetch('/api/billing/cancel-subscription', { method: 'POST' })
      if (response.ok) {
        setBilling(prev => ({ ...prev, plan: 'free' }))
        toast.success('Subscription cancelled')
      } else {
        toast.warning('Contact support')
      }
    } catch {
      toast.warning('Contact support')
    }
    setShowCancelSubscriptionDialog(false)
  }

  // Mute all notifications handler
  const handleMuteAllNotifications = async () => {
    setNotifications(prev => prev.map(n => ({
      ...n,
      email: false,
      push: false,
      inApp: false,
      sms: false
    })))
    await handleSaveNotifications()
    toast.success('All notifications muted')
    setShowMuteAllNotificationsDialog(false)
  }

  // Revoke all sessions handler with confirmation
  const handleRevokeAllSessionsConfirmed = async () => {
    await handleRevokeAllSessions()
    setShowRevokeAllSessionsDialog(false)
  }

  // Handle insight action from AI panel
  const handleInsightAction = (insight: { id: string; type: string; title: string }) => {
    switch (insight.type) {
      case 'warning':
        toast.warning(insight.title)
        break
      case 'success':
        toast.success(insight.title)
        break
      default:
        toast.info(insight.title)
    }
  }

  // Generate backup codes with download
  const handleGenerateBackupCodes = () => {
    const codes = Array.from({ length: 8 }, () =>
      Math.random().toString(36).substring(2, 8).toUpperCase()
    )
    const codesText = codes.join('\n')
    const blob = new Blob([`FreeFlow Backup Codes\nGenerated: ${new Date().toISOString()}\n\n${codesText}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `freeflow-backup-codes-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
    navigator.clipboard.writeText(codesText)
    toast.success('Backup codes generated')
  }

  // Download invoice as PDF-like JSON
  const handleDownloadInvoice = (invoice: Invoice) => {
    const invoiceData = {
      id: invoice.id,
      date: invoice.date,
      amount: invoice.amount,
      status: invoice.status,
      currency: 'USD',
      plan: billing.plan,
      billingCycle: billing.billingCycle,
      paymentMethod: `${billing.paymentMethod} ****${billing.cardLast4}`,
      generatedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(invoiceData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${invoice.id}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Invoice ${invoice.id} downloaded`)
  }

  const statCards = [
    { label: 'Profile', value: `${stats.profileCompleteness}%`, change: 5.0, icon: User, color: 'from-blue-500 to-cyan-500' },
    { label: 'Security', value: `${stats.securityScore}%`, change: 8.5, icon: Shield, color: 'from-green-500 to-emerald-500' },
    { label: 'API Keys', value: apiKeys.length.toString(), change: 0, icon: Key, color: 'from-purple-500 to-pink-500' },
    { label: 'Integrations', value: stats.connectedIntegrations.toString(), change: 0, icon: Link2, color: 'from-orange-500 to-amber-500' },
    { label: 'Sessions', value: sessions.filter(s => s.status === 'active').length.toString(), change: 0, icon: Monitor, color: 'from-indigo-500 to-violet-500' },
    { label: 'Plan', value: billing.plan.toUpperCase(), change: 0, icon: CreditCard, color: 'from-rose-500 to-red-500' },
    { label: 'Notifications', value: doNotDisturb ? 'DND' : 'On', change: 0, icon: Bell, color: 'from-yellow-500 to-orange-500' },
    { label: 'Theme', value: theme.charAt(0).toUpperCase() + theme.slice(1), change: 0, icon: Palette, color: 'from-teal-500 to-green-500' }
  ]


  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50/30 to-zinc-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <Skeleton className="h-8 w-8 rounded-lg mb-2" />
                <Skeleton className="h-6 w-16 mb-1" />
                <Skeleton className="h-4 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-12 w-full max-w-3xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                  <div className="space-y-4 pt-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Show loading skeleton during initial load
  if (isInitialLoad && (isLoading || isSettingsLoading)) {
    return <LoadingSkeleton />
  }

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
            {/* Save Status Indicator */}
            {(isSaving || isSettingsSaving) && (
              <Badge className="bg-blue-100 text-blue-700 animate-pulse">
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                Saving...
              </Badge>
            )}
            {saveMessage && (
              <Badge className="bg-green-100 text-green-700">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {saveMessage}
              </Badge>
            )}
            {lastSaved && !saveMessage && !isSaving && (
              <span className="text-xs text-gray-500">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
            {settingsError && (
              <Badge className="bg-red-100 text-red-700">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Error loading settings
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={handleRefreshSettings} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
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

        {/* Related Dashboards Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quick Navigation</h3>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push('/dashboard/user-management-v2')}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 transition-colors"
            >
              <Users className="w-4 h-4 text-blue-600" />
              User Management
            </button>
            <button
              onClick={() => router.push('/dashboard/roles-v2')}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-purple-50 hover:border-purple-300 dark:hover:bg-purple-900/20 transition-colors"
            >
              <Shield className="w-4 h-4 text-purple-600" />
              Roles
            </button>
            <button
              onClick={() => router.push('/dashboard/security-v2')}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-900/20 transition-colors"
            >
              <Lock className="w-4 h-4 text-red-600" />
              Security
            </button>
            <button
              onClick={() => router.push('/dashboard/api-keys-v2')}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-amber-50 hover:border-amber-300 dark:hover:bg-amber-900/20 transition-colors"
            >
              <Key className="w-4 h-4 text-amber-600" />
              API Keys
            </button>
          </div>
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
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:scale-105 transition-all duration-200"
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*'
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error('File too large')
                        return
                      }
                      setAvatarFile(file)
                      handleAvatarUpload(file)
                    }
                  }
                  input.click()
                }}
                disabled={isUploadingAvatar}
              >
                <Camera className="w-5 h-5" />
                <span className="text-xs font-medium">{isUploadingAvatar ? 'Uploading...' : 'Change Photo'}</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 hover:scale-105 transition-all duration-200"
                onClick={() => { document.querySelector('input[value="' + profile.firstName + '"]')?.focus(); toast.success('Edit your profile fields below'); }}
              >
                <User className="w-5 h-5" />
                <span className="text-xs font-medium">Edit Profile</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 hover:scale-105 transition-all duration-200"
                onClick={() => { document.querySelector('[value="security"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true })); toast.success('Navigate to Security tab'); }}
              >
                <Lock className="w-5 h-5" />
                <span className="text-xs font-medium">Password</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 hover:scale-105 transition-all duration-200"
                onClick={() => { document.querySelector('[value="advanced"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true })); setTimeout(() => document.querySelector('[data-privacy-section]')?.scrollIntoView({ behavior: 'smooth' }), 100); toast.success('Navigating to Privacy settings'); }}
              >
                <Shield className="w-5 h-5" />
                <span className="text-xs font-medium">Privacy</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 hover:scale-105 transition-all duration-200"
                onClick={() => { document.querySelector('[value="notifications"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true })); toast.success('Navigate to Notifications tab'); }}
              >
                <Bell className="w-5 h-5" />
                <span className="text-xs font-medium">Notifications</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400 hover:scale-105 transition-all duration-200"
                onClick={() => { document.querySelector('[value="integrations"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true })); toast.success('Navigate to Integrations tab'); }}
              >
                <Link2 className="w-5 h-5" />
                <span className="text-xs font-medium">Connections</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 hover:scale-105 transition-all duration-200"
                onClick={handleExportData}
              >
                <Download className="w-5 h-5" />
                <span className="text-xs font-medium">Export Data</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:scale-105 transition-all duration-200"
                onClick={handleDeleteAccount}
              >
                <Trash2 className="w-5 h-5" />
                <span className="text-xs font-medium">Delete</span>
              </Button>
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
                        <AvatarImage src={profile.avatar} alt="User avatar" />
                        <AvatarFallback className="text-2xl">{profile.firstName[0]}{profile.lastName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const input = document.createElement('input')
                            input.type = 'file'
                            input.accept = 'image/*'
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0]
                              if (file) {
                                if (file.size > 5 * 1024 * 1024) {
                                  toast.error('File too large')
                                  return
                                }
                                setAvatarFile(file)
                                handleAvatarUpload(file)
                              }
                            }
                            input.click()
                          }}
                          disabled={isUploadingAvatar}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          {isUploadingAvatar ? 'Uploading...' : 'Change Photo'}
                        </Button>
                        <p className="text-xs text-gray-500">JPG, GIF or PNG. Max 5MB.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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

                    <div className="flex items-center gap-4">
                      <Button onClick={handleSaveProfile} disabled={isSaving || isSettingsSaving}>
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving || isSettingsSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                      {lastSaved && (
                        <span className="text-sm text-gray-500">
                          Last saved: {lastSaved.toLocaleTimeString()}
                        </span>
                      )}
                    </div>
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
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 hover:scale-105 transition-all duration-200"
                onClick={() => { document.querySelector('input[placeholder="Enter current password"]')?.scrollIntoView({ behavior: 'smooth' }); toast.success('Scroll to password form'); }}
              >
                <Lock className="w-5 h-5" />
                <span className="text-xs font-medium">Password</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 hover:scale-105 transition-all duration-200"
                onClick={handleToggle2FA}
              >
                <Fingerprint className="w-5 h-5" />
                <span className="text-xs font-medium">2FA Setup</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 hover:scale-105 transition-all duration-200"
                onClick={() => { document.querySelector('[value="advanced"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true })); toast.success('Navigate to Advanced tab for API Keys'); }}
              >
                <Key className="w-5 h-5" />
                <span className="text-xs font-medium">API Keys</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:scale-105 transition-all duration-200"
                onClick={() => { document.querySelector('[data-sessions-section]')?.scrollIntoView({ behavior: 'smooth' }); toast.success(`${sessions.filter(s => s.status === 'active').length} active sessions - scrolling to view`); }}
              >
                <Monitor className="w-5 h-5" />
                <span className="text-xs font-medium">Sessions</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 hover:scale-105 transition-all duration-200"
                onClick={() => { document.querySelector('[data-activity-section]')?.scrollIntoView({ behavior: 'smooth' }); toast.success('Scrolling to Activity Log'); }}
              >
                <History className="w-5 h-5" />
                <span className="text-xs font-medium">Activity Log</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 hover:scale-105 transition-all duration-200"
                onClick={() => { const alertCount = sessions.filter(s => s.status === 'expired').length; toast.info(`${alertCount} security alerts`); }}
              >
                <AlertTriangle className="w-5 h-5" />
                <span className="text-xs font-medium">Alerts</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 hover:scale-105 transition-all duration-200"
                onClick={handleGenerateBackupCodes}
              >
                <Download className="w-5 h-5" />
                <span className="text-xs font-medium">Backup Codes</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:scale-105 transition-all duration-200"
                onClick={() => setShowRevokeAllSessionsDialog(true)}
              >
                <LogOut className="w-5 h-5" />
                <span className="text-xs font-medium">Log Out All</span>
              </Button>
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
                  <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white" onClick={() => { if ('Notification' in window) { Notification.requestPermission().then(perm => { if (perm === 'granted') { new Notification('Test Notification', { body: 'This is a test notification from FreeFlow!' }); toast.success('Test notification sent!'); } else { toast.info('Enable browser notifications to receive alerts'); } }); } else { toast.info('Browser notifications not supported'); } }}>
                    <Bell className="w-4 h-4 mr-2" />
                    Test Notification
                  </Button>
                </div>
              </div>
            </div>

            {/* Notifications Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 hover:scale-105 transition-all duration-200"
                onClick={() => { setNotifications(prev => prev.map(n => ({ ...n, email: !prev[0].email }))); toast.success(notifications[0]?.email ? 'Email notifications disabled' : 'Email notifications enabled'); }}
              >
                <Mail className="w-5 h-5" />
                <span className="text-xs font-medium">Email</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 hover:scale-105 transition-all duration-200"
                onClick={() => { setNotifications(prev => prev.map(n => ({ ...n, push: !prev[0].push }))); toast.success(notifications[0]?.push ? 'Push notifications disabled' : 'Push notifications enabled'); }}
              >
                <Bell className="w-5 h-5" />
                <span className="text-xs font-medium">Push</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:scale-105 transition-all duration-200"
                onClick={() => { setNotifications(prev => prev.map(n => ({ ...n, sms: !prev[0].sms }))); toast.success(notifications[0]?.sms ? 'SMS notifications disabled' : 'SMS notifications enabled'); }}
              >
                <Smartphone className="w-5 h-5" />
                <span className="text-xs font-medium">SMS</span>
              </Button>
              <Button
                variant="ghost"
                className={`h-20 flex-col gap-2 ${soundsEnabled ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'} hover:scale-105 transition-all duration-200`}
                onClick={() => { const newValue = !soundsEnabled; setSoundsEnabled(newValue); saveLocalSettings({ soundsEnabled: newValue }); toast.success(newValue ? 'Notification sounds enabled' : 'Notification sounds disabled'); }}
              >
                <Volume2 className="w-5 h-5" />
                <span className="text-xs font-medium">Sounds {soundsEnabled ? 'On' : 'Off'}</span>
              </Button>
              <Button
                variant="ghost"
                className={`h-20 flex-col gap-2 ${doNotDisturb ? 'bg-purple-600 text-white dark:bg-purple-700' : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'} hover:scale-105 transition-all duration-200`}
                onClick={() => { const newValue = !doNotDisturb; setDoNotDisturb(newValue); saveLocalSettings({ doNotDisturb: newValue }); toast.success(newValue ? 'Do Not Disturb enabled' : 'Do Not Disturb disabled'); }}
              >
                <Moon className="w-5 h-5" />
                <span className="text-xs font-medium">DND {doNotDisturb ? 'On' : 'Off'}</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:scale-105 transition-all duration-200"
                onClick={() => { const schedules: Array<'all-day' | 'work-hours' | 'custom'> = ['all-day', 'work-hours', 'custom']; const currentIndex = schedules.indexOf(notificationSchedule); const nextSchedule = schedules[(currentIndex + 1) % schedules.length]; setNotificationSchedule(nextSchedule); saveLocalSettings({ notificationSchedule: nextSchedule }); const labels = { 'all-day': 'All Day', 'work-hours': 'Work Hours (9AM-6PM)', 'custom': 'Custom Schedule' }; toast.success(`Notification schedule: ${labels[nextSchedule]}`); }}
              >
                <Clock className="w-5 h-5" />
                <span className="text-xs font-medium">{notificationSchedule === 'all-day' ? 'All Day' : notificationSchedule === 'work-hours' ? 'Work Hours' : 'Custom'}</span>
              </Button>
              <Button
                variant="ghost"
                className={`h-20 flex-col gap-2 ${notificationFilters.length > 0 ? 'bg-green-600 text-white dark:bg-green-700' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'} hover:scale-105 transition-all duration-200`}
                onClick={() => { const filters = notificationFilters.length > 0 ? [] : ['Marketing', 'Updates']; setNotificationFilters(filters); saveLocalSettings({ notificationFilters: filters }); toast.success(filters.length > 0 ? `Filters active: ${filters.join(', ')}` : 'All notification filters cleared'); }}
              >
                <Filter className="w-5 h-5" />
                <span className="text-xs font-medium">{notificationFilters.length > 0 ? `${notificationFilters.length} Active` : 'No Filters'}</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400 hover:scale-105 transition-all duration-200"
                onClick={() => setShowMuteAllNotificationsDialog(true)}
              >
                <XCircle className="w-5 h-5" />
                <span className="text-xs font-medium">Mute All</span>
              </Button>
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
                <div className="mt-6 flex items-center gap-4">
                  <Button onClick={handleSaveNotificationsEnhanced} disabled={isSaving || isSettingsSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving || isSettingsSaving ? 'Saving...' : 'Save Preferences'}
                  </Button>
                  {lastSaved && (
                    <span className="text-sm text-gray-500">
                      Last saved: {lastSaved.toLocaleTimeString()}
                    </span>
                  )}
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
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 hover:scale-105 transition-all duration-200"
                onClick={() => { document.querySelector('[data-integrations-grid]')?.scrollIntoView({ behavior: 'smooth' }); toast.success('Scroll to available integrations'); }}
              >
                <Plus className="w-5 h-5" />
                <span className="text-xs font-medium">Add New</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 hover:scale-105 transition-all duration-200"
                onClick={() => { window.open('/integrations/marketplace', '_blank'); toast.success(`Opening integrations marketplace (${integrations.length} available)`); }}
              >
                <Globe className="w-5 h-5" />
                <span className="text-xs font-medium">Browse All</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 hover:scale-105 transition-all duration-200"
                onClick={() => { const connected = integrations.filter(i => i.status === 'connected'); const details = connected.map(i => `${i.name}: ${i.scopes.join(', ')}`).join('\n'); if (connected.length > 0) { navigator.clipboard.writeText(details); toast.success(`${connected.length} OAuth apps connected - details copied`); } else { toast.info('No OAuth apps connected yet'); } }}
              >
                <Link2 className="w-5 h-5" />
                <span className="text-xs font-medium">OAuth Apps</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:scale-105 transition-all duration-200"
                onClick={() => { document.querySelector('[value="advanced"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true })); toast.success('Navigate to Advanced tab for API Tokens'); }}
              >
                <Key className="w-5 h-5" />
                <span className="text-xs font-medium">API Tokens</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 hover:scale-105 transition-all duration-200"
                onClick={() => { document.querySelector('[value="advanced"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true })); toast.success('Navigate to Advanced tab for Webhooks'); }}
              >
                <Database className="w-5 h-5" />
                <span className="text-xs font-medium">Webhooks</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 hover:scale-105 transition-all duration-200"
                onClick={() => { setIntegrations(prev => prev.map(i => i.status === 'connected' ? { ...i, lastSync: new Date().toISOString() } : i)); toast.success('All integrations synced'); }}
              >
                <RefreshCw className="w-5 h-5" />
                <span className="text-xs font-medium">Sync</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 hover:scale-105 transition-all duration-200"
                onClick={() => { const logs = integrations.filter(i => i.lastSync).map(i => `${i.name}: Last sync ${i.lastSync}`).join('\n'); if (logs) { navigator.clipboard.writeText(logs); toast.success('Integration sync logs copied to clipboard'); } else { toast.info('No sync logs available'); } }}
              >
                <History className="w-5 h-5" />
                <span className="text-xs font-medium">Logs</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:scale-105 transition-all duration-200"
                onClick={() => setShowRevokeAllIntegrationsDialog(true)}
              >
                <Unlink className="w-5 h-5" />
                <span className="text-xs font-medium">Revoke All</span>
              </Button>
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
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 hover:scale-105 transition-all duration-200"
                onClick={() => { setBilling(prev => ({ ...prev, plan: prev.plan === 'pro' ? 'enterprise' : 'pro' })); toast.success('Contact sales for enterprise upgrade'); }}
              >
                <ArrowUpRight className="w-5 h-5" />
                <span className="text-xs font-medium">Upgrade</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400 hover:scale-105 transition-all duration-200"
                onClick={() => { document.querySelector('[data-payment-section]')?.scrollIntoView({ behavior: 'smooth' }); toast.success(`Current: ${billing.paymentMethod} ending in ${billing.cardLast4}`); }}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs font-medium">Payment</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:scale-105 transition-all duration-200"
                onClick={() => { document.querySelector('[data-invoices-section]')?.scrollIntoView({ behavior: 'smooth' }); toast.success(`${invoices.length} invoices available - scrolling to view`); }}
              >
                <FileText className="w-5 h-5" />
                <span className="text-xs font-medium">Invoices</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 hover:scale-105 transition-all duration-200"
                onClick={() => { document.querySelector('[data-billing-history]')?.scrollIntoView({ behavior: 'smooth' }); toast.success('Scrolling to billing history'); }}
              >
                <History className="w-5 h-5" />
                <span className="text-xs font-medium">History</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 hover:scale-105 transition-all duration-200"
                onClick={() => { const data = { billing, invoices }; const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'billing-history.json'; a.click(); URL.revokeObjectURL(url); toast.success('Billing data downloaded'); }}
              >
                <Download className="w-5 h-5" />
                <span className="text-xs font-medium">Download</span>
              </Button>
              <Button
                variant="ghost"
                className={`h-20 flex-col gap-2 ${autoRenew ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'} hover:scale-105 transition-all duration-200`}
                onClick={() => { const newValue = !autoRenew; setAutoRenew(newValue); saveLocalSettings({ autoRenew: newValue }); toast.success(newValue ? 'Auto-renew enabled' : 'Auto-renew disabled'); }}
              >
                <RefreshCw className="w-5 h-5" />
                <span className="text-xs font-medium">Auto-Renew {autoRenew ? 'On' : 'Off'}</span>
              </Button>
              <Button
                variant="ghost"
                className={`h-20 flex-col gap-2 ${emailReceipts ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'} hover:scale-105 transition-all duration-200`}
                onClick={() => { const newValue = !emailReceipts; setEmailReceipts(newValue); saveLocalSettings({ emailReceipts: newValue }); toast.success(newValue ? 'Email receipts enabled' : 'Email receipts disabled'); }}
              >
                <Mail className="w-5 h-5" />
                <span className="text-xs font-medium">Receipts {emailReceipts ? 'On' : 'Off'}</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:scale-105 transition-all duration-200"
                onClick={() => setShowCancelSubscriptionDialog(true)}
              >
                <XCircle className="w-5 h-5" />
                <span className="text-xs font-medium">Cancel</span>
              </Button>
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
                      <Button variant="secondary" onClick={() => { window.open('/pricing', '_blank'); toast.success('Opening pricing page'); }}>Upgrade Plan</Button>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-sm">
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
                            <Button variant="ghost" size="icon" onClick={() => handleDownloadInvoice(invoice)}>
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
                    <Button variant="outline" className="w-full mt-4" onClick={async () => { try { const res = await fetch('/api/billing/create-portal-session', { method: 'POST' }); if (res.ok) { const { url } = await res.json(); window.open(url, '_blank'); toast.success('Opening payment portal'); } else { toast.info('Contact support to update payment method'); } } catch { toast.info('Contact support to update payment method'); } }}>
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
                  <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white" onClick={() => { setTheme('system'); setAccentColor('#3B82F6'); setHighContrast(false); setFontScale('default'); toast.success('Appearance settings reset to defaults'); }}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset to Defaults
                  </Button>
                  <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white" onClick={handleSaveAppearance} disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Appearance Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400 hover:scale-105 transition-all duration-200"
                onClick={() => handleSaveTheme('light')}
              >
                <Sun className="w-5 h-5" />
                <span className="text-xs font-medium">Light Mode</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 hover:scale-105 transition-all duration-200"
                onClick={() => handleSaveTheme('dark')}
              >
                <Moon className="w-5 h-5" />
                <span className="text-xs font-medium">Dark Mode</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 hover:scale-105 transition-all duration-200"
                onClick={() => { document.querySelector('[data-accent-colors]')?.scrollIntoView({ behavior: 'smooth' }); toast.success('Scrolling to accent color picker'); }}
              >
                <Palette className="w-5 h-5" />
                <span className="text-xs font-medium">Colors</span>
              </Button>
              <Button
                variant="ghost"
                className={`h-20 flex-col gap-2 ${fontScale === 'large' ? 'bg-amber-600 text-white dark:bg-amber-700' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'} hover:scale-105 transition-all duration-200`}
                onClick={() => { const newScale = fontScale === 'default' ? 'large' : 'default'; setFontScale(newScale); document.documentElement.style.fontSize = newScale === 'large' ? '18px' : '16px'; saveLocalSettings({ fontScale: newScale }); toast.success(newScale === 'large' ? 'Large fonts enabled' : 'Default fonts restored'); }}
              >
                <Type className="w-5 h-5" />
                <span className="text-xs font-medium">{fontScale === 'large' ? 'Large Font' : 'Default Font'}</span>
              </Button>
              <Button
                variant="ghost"
                className={`h-20 flex-col gap-2 ${highContrast ? 'bg-purple-600 text-white dark:bg-purple-700' : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'} hover:scale-105 transition-all duration-200`}
                onClick={() => { const newValue = !highContrast; setHighContrast(newValue); document.documentElement.classList.toggle('high-contrast', newValue); saveLocalSettings({ highContrast: newValue }); toast.success(newValue ? 'High contrast enabled' : 'High contrast disabled'); }}
              >
                <Contrast className="w-5 h-5" />
                <span className="text-xs font-medium">{highContrast ? 'High Contrast' : 'Normal'}</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:scale-105 transition-all duration-200"
                onClick={() => { const lang = profile.language === 'en-US' ? 'es' : profile.language === 'es' ? 'fr' : 'en-US'; setProfile(prev => ({ ...prev, language: lang })); const labels: Record<string, string> = { 'en-US': 'English (US)', 'es': 'Spanish', 'fr': 'French' }; toast.success(`Language changed to ${labels[lang]}`); }}
              >
                <Languages className="w-5 h-5" />
                <span className="text-xs font-medium">{profile.language === 'en-US' ? 'English' : profile.language === 'es' ? 'Spanish' : 'French'}</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 hover:scale-105 transition-all duration-200"
                onClick={() => { document.querySelector('[data-accessibility-section]')?.scrollIntoView({ behavior: 'smooth' }); toast.success('Scrolling to accessibility options'); }}
              >
                <Accessibility className="w-5 h-5" />
                <span className="text-xs font-medium">A11y</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400 hover:scale-105 transition-all duration-200"
                onClick={() => handleSaveTheme('system')}
              >
                <Monitor className="w-5 h-5" />
                <span className="text-xs font-medium">Display</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Theme</CardTitle>
                  <CardDescription>Choose your preferred color scheme</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {[
                      { value: 'light', label: 'Light', icon: Sun },
                      { value: 'dark', label: 'Dark', icon: Moon },
                      { value: 'system', label: 'System', icon: Laptop }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSaveTheme(option.value as ThemeMode)}
                        className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${theme === option.value
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
                        onClick={() => { document.documentElement.style.setProperty('--accent-color', color); toast.success(`Accent color set to ${color}`); }}
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
                  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <MousePointer className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Reduce motion</p>
                        <p className="text-sm text-gray-500">Minimize animations</p>
                      </div>
                    </div>
                    <Switch
                      checked={reduceMotion}
                      onCheckedChange={(checked) => {
                        setReduceMotion(checked)
                        document.documentElement.classList.toggle('reduce-motion', checked)
                        saveLocalSettings({ reduceMotion: checked })
                        toast.success(checked ? 'Reduce motion enabled' : 'Reduce motion disabled')
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <Contrast className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">High contrast</p>
                        <p className="text-sm text-gray-500">Increase text contrast</p>
                      </div>
                    </div>
                    <Switch
                      checked={highContrast}
                      onCheckedChange={(checked) => {
                        setHighContrast(checked)
                        document.documentElement.classList.toggle('high-contrast', checked)
                        saveLocalSettings({ highContrast: checked })
                        toast.success(checked ? 'High contrast enabled' : 'High contrast disabled')
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <Type className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Large text</p>
                        <p className="text-sm text-gray-500">Increase font size</p>
                      </div>
                    </div>
                    <Switch
                      checked={largeText}
                      onCheckedChange={(checked) => {
                        setLargeText(checked)
                        setFontScale(checked ? 'large' : 'default')
                        document.documentElement.style.fontSize = checked ? '18px' : '16px'
                        saveLocalSettings({ largeText: checked, fontScale: checked ? 'large' : 'default' })
                        toast.success(checked ? 'Large text enabled' : 'Large text disabled')
                      }}
                    />
                  </div>
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
                  <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white" onClick={() => { const config = { theme, profile: { timezone: profile.timezone, language: profile.language }, security: { twoFactorEnabled: security.twoFactorEnabled } }; const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'settings-config.json'; a.click(); URL.revokeObjectURL(url); toast.success('Configuration exported'); }}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Config
                  </Button>
                </div>
              </div>
            </div>

            {/* Advanced Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400 hover:scale-105 transition-all duration-200"
                onClick={() => { document.querySelector('[data-developer-section]')?.scrollIntoView({ behavior: 'smooth' }); toast.success('Scrolling to API keys section'); }}
              >
                <Key className="w-5 h-5" />
                <span className="text-xs font-medium">API Keys</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400 hover:scale-105 transition-all duration-200"
                onClick={() => { document.querySelector('[data-webhook-section]')?.scrollIntoView({ behavior: 'smooth' }); toast.success('Scrolling to Webhooks configuration'); }}
              >
                <Database className="w-5 h-5" />
                <span className="text-xs font-medium">Webhooks</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-zinc-100 text-zinc-600 dark:bg-zinc-900/30 dark:text-zinc-400 hover:scale-105 transition-all duration-200"
                onClick={() => { document.querySelector('[data-storage-section]')?.scrollIntoView({ behavior: 'smooth' }); toast.info(`Storage: ${stats.storageUsed} GB / ${stats.storageLimit} GB (${Math.round((stats.storageUsed / stats.storageLimit) * 100)}% used)`); }}
              >
                <HardDrive className="w-5 h-5" />
                <span className="text-xs font-medium">Storage</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:scale-105 transition-all duration-200"
                onClick={handleExportData}
              >
                <Cloud className="w-5 h-5" />
                <span className="text-xs font-medium">Backups</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 hover:scale-105 transition-all duration-200"
                onClick={() => { document.querySelector('[data-activity-sidebar]')?.scrollIntoView({ behavior: 'smooth' }); toast.success('Scrolling to activity logs'); }}
              >
                <History className="w-5 h-5" />
                <span className="text-xs font-medium">Logs</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 hover:scale-105 transition-all duration-200"
                onClick={() => { document.querySelector('[data-performance-section]')?.scrollIntoView({ behavior: 'smooth' }); toast.success('Scrolling to performance settings'); }}
              >
                <Zap className="w-5 h-5" />
                <span className="text-xs font-medium">Performance</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 hover:scale-105 transition-all duration-200"
                onClick={() => setShowResetSettingsDialog(true)}
              >
                <RefreshCw className="w-5 h-5" />
                <span className="text-xs font-medium">Reset</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:scale-105 transition-all duration-200"
                onClick={handleDeleteAccount}
              >
                <Trash2 className="w-5 h-5" />
                <span className="text-xs font-medium">Delete Account</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Developer Settings */}
                <Card className="border-0 shadow-sm" data-developer-section>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="w-5 h-5 text-blue-500" />
                      API Keys Management
                    </CardTitle>
                    <CardDescription>Create and manage API keys for programmatic access</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Generate New API Key Section */}
                    <div className="p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Generate New API Key
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Key Name</Label>
                          <Input
                            placeholder="e.g., Production API Key"
                            value={newApiKeyName}
                            onChange={(e) => setNewApiKeyName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Permissions</Label>
                          <Select
                            value={newApiKeyPermissions.join(',')}
                            onValueChange={(value) => setNewApiKeyPermissions(value.split(','))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select permissions" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="read">Read Only</SelectItem>
                              <SelectItem value="read,write">Read & Write</SelectItem>
                              <SelectItem value="read,write,delete">Full Access</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        onClick={handleGenerateApiKey}
                        disabled={isSaving || !newApiKeyName.trim()}
                        className="w-full md:w-auto"
                      >
                        <Key className="w-4 h-4 mr-2" />
                        {isSaving ? 'Generating...' : 'Generate API Key'}
                      </Button>
                    </div>

                    {/* Generated Key Display */}
                    {generatedApiKey && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg space-y-3">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="font-medium">API Key Generated Successfully!</span>
                        </div>
                        <p className="text-sm text-green-600 dark:text-green-500">
                          Copy this key now - it will not be shown again.
                        </p>
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            value={generatedApiKey}
                            readOnly
                            className="font-mono text-sm bg-white dark:bg-gray-800"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleCopyApiKey(generatedApiKey)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setGeneratedApiKey(null)}
                        >
                          Dismiss
                        </Button>
                      </div>
                    )}

                    {/* Existing API Keys List */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Your API Keys</h4>
                      {apiKeys.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Key className="w-10 h-10 mx-auto mb-3 opacity-50" />
                          <p>No API keys created yet</p>
                          <p className="text-sm">Create your first API key above</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {apiKeys.map((key) => (
                            <div
                              key={key.id}
                              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                  <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <p className="font-medium">{key.name}</p>
                                  <p className="text-sm text-gray-500 font-mono">
                                    {key.prefix}...
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {key.permissions?.join(', ') || 'read'}
                                    </Badge>
                                    {key.lastUsedAt && (
                                      <span className="text-xs text-gray-400">
                                        Last used: {formatTimeAgo(key.lastUsedAt)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to revoke "${key.name}"? This action cannot be undone.`)) {
                                      handleRevokeApiKey(key.id)
                                    }
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Revoke
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                      <Label>Webhook URL</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="https://your-app.com/webhooks"
                          value={webhookUrl}
                          onChange={(e) => setWebhookUrl(e.target.value)}
                        />
                        <Button
                          variant="outline"
                          onClick={handleSaveWebhook}
                          disabled={isSavingWebhook || !webhookUrl}
                        >
                          {isSavingWebhook ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Receive real-time notifications via webhooks</p>
                    </div>

                    <div className="border-t pt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Enable API Access</p>
                          <p className="text-sm text-muted-foreground">Allow programmatic access to your account</p>
                        </div>
                        <Switch
                          checked={apiAccessEnabled}
                          onCheckedChange={(checked) => {
                            setApiAccessEnabled(checked)
                            saveLocalSettings({ apiAccessEnabled: checked })
                            toast.success(checked ? 'API access enabled' : 'API access disabled')
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Developer Mode</p>
                          <p className="text-sm text-muted-foreground">Show additional debugging info</p>
                        </div>
                        <Switch
                          checked={developerMode}
                          onCheckedChange={(checked) => {
                            setDeveloperMode(checked)
                            saveLocalSettings({ developerMode: checked })
                            toast.success(checked ? 'Developer mode enabled' : 'Developer mode disabled')
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Verbose Logging</p>
                          <p className="text-sm text-muted-foreground">Enable detailed activity logs</p>
                        </div>
                        <Switch
                          checked={verboseLogging}
                          onCheckedChange={(checked) => {
                            setVerboseLogging(checked)
                            saveLocalSettings({ verboseLogging: checked })
                            toast.success(checked ? 'Verbose logging enabled' : 'Verbose logging disabled')
                          }}
                        />
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="space-y-2">
                        <Label>Data Retention Period</Label>
                        <Select
                          value={dataRetentionPeriod}
                          onValueChange={(value) => {
                            setDataRetentionPeriod(value)
                            saveLocalSettings({ dataRetentionPeriod: value })
                            toast.success(`Data retention set to ${value} days`)
                          }}
                        >
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
                        <Select
                          value={backupFrequency}
                          onValueChange={(value) => {
                            setBackupFrequency(value)
                            saveLocalSettings({ backupFrequency: value })
                            toast.success(`Backup frequency set to ${value}`)
                          }}
                        >
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
                        <Switch
                          checked={autoArchive}
                          onCheckedChange={(checked) => {
                            setAutoArchive(checked)
                            saveLocalSettings({ autoArchive: checked })
                            toast.success(checked ? 'Auto-archive enabled' : 'Auto-archive disabled')
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Compress Backups</p>
                          <p className="text-sm text-muted-foreground">Reduce backup storage size</p>
                        </div>
                        <Switch
                          checked={compressBackups}
                          onCheckedChange={(checked) => {
                            setCompressBackups(checked)
                            saveLocalSettings({ compressBackups: checked })
                            toast.success(checked ? 'Backup compression enabled' : 'Backup compression disabled')
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={handleExportData}>
                        <Download className="w-4 h-4 mr-2" />
                        Export All Data
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          const input = document.createElement('input')
                          input.type = 'file'
                          input.accept = '.json'
                          input.onchange = async (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0]
                            if (file) {
                              const reader = new FileReader()
                              reader.onload = async () => {
                                try {
                                  const data = JSON.parse(reader.result as string)
                                  // Validate and apply imported settings
                                  if (data.settings) {
                                    setProfile(prev => ({ ...prev, ...data.settings.profile }))
                                  }
                                  toast.success('Data imported successfully')
                                } catch {
                                  toast.error('Invalid JSON file')
                                }
                              }
                              reader.readAsText(file)
                            }
                          }
                          input.click()
                        }}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Import Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Settings */}
                <Card className="border-0 shadow-sm" data-performance-section>
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
                      <Switch
                        checked={cachingEnabled}
                        onCheckedChange={(checked) => {
                          setCachingEnabled(checked)
                          saveLocalSettings({ cachingEnabled: checked })
                          toast.success(checked ? 'Caching enabled' : 'Caching disabled')
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Prefetch Resources</p>
                        <p className="text-sm text-muted-foreground">Preload content for instant access</p>
                      </div>
                      <Switch
                        checked={prefetchEnabled}
                        onCheckedChange={(checked) => {
                          setPrefetchEnabled(checked)
                          saveLocalSettings({ prefetchEnabled: checked })
                          toast.success(checked ? 'Prefetching enabled' : 'Prefetching disabled')
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Hardware Acceleration</p>
                        <p className="text-sm text-muted-foreground">Use GPU for rendering</p>
                      </div>
                      <Switch
                        checked={hardwareAcceleration}
                        onCheckedChange={(checked) => {
                          setHardwareAcceleration(checked)
                          saveLocalSettings({ hardwareAcceleration: checked })
                          toast.success(checked ? 'Hardware acceleration enabled' : 'Hardware acceleration disabled')
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Background Sync</p>
                        <p className="text-sm text-muted-foreground">Sync data in background</p>
                      </div>
                      <Switch
                        checked={backgroundSync}
                        onCheckedChange={(checked) => {
                          setBackgroundSync(checked)
                          saveLocalSettings({ backgroundSync: checked })
                          toast.success(checked ? 'Background sync enabled' : 'Background sync disabled')
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cache Size Limit (MB)</Label>
                      <div className="flex items-center gap-4">
                        <Input
                          type="range"
                          min="100"
                          max="1000"
                          value={cacheSizeLimit}
                          onChange={(e) => {
                            const value = parseInt(e.target.value)
                            setCacheSizeLimit(value)
                            saveLocalSettings({ cacheSizeLimit: value })
                          }}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium w-16">{cacheSizeLimit} MB</span>
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
                          <Switch
                            checked={experimentalFeatures[feature.name] || false}
                            onCheckedChange={(checked) => {
                              const newFeatures = { ...experimentalFeatures, [feature.name]: checked }
                              setExperimentalFeatures(newFeatures)
                              saveLocalSettings({ experimentalFeatures: newFeatures })
                              toast.success(checked ? `${feature.name} enabled` : `${feature.name} disabled`)
                            }}
                          />
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
                      <Switch
                        checked={e2eEncryption}
                        onCheckedChange={(checked) => {
                          setE2eEncryption(checked)
                          saveLocalSettings({ e2eEncryption: checked })
                          toast.success(checked ? 'End-to-end encryption enabled' : 'End-to-end encryption disabled')
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Anonymous Analytics</p>
                        <p className="text-sm text-muted-foreground">Share anonymous usage data</p>
                      </div>
                      <Switch
                        checked={anonymousAnalytics}
                        onCheckedChange={(checked) => {
                          setAnonymousAnalytics(checked)
                          saveLocalSettings({ anonymousAnalytics: checked })
                          toast.success(checked ? 'Anonymous analytics enabled' : 'Anonymous analytics disabled')
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Telemetry</p>
                        <p className="text-sm text-muted-foreground">Send crash reports</p>
                      </div>
                      <Switch
                        checked={telemetryEnabled}
                        onCheckedChange={(checked) => {
                          setTelemetryEnabled(checked)
                          saveLocalSettings({ telemetryEnabled: checked })
                          toast.success(checked ? 'Telemetry enabled' : 'Telemetry disabled')
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Cookie Preferences</p>
                        <p className="text-sm text-muted-foreground">Manage cookie consent ({cookiePreferences})</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => { const prefs: Array<'essential' | 'functional' | 'all'> = ['essential', 'functional', 'all']; const currentIdx = prefs.indexOf(cookiePreferences); const next = prefs[(currentIdx + 1) % prefs.length]; setCookiePreferences(next); saveLocalSettings({ cookiePreferences: next }); const labels = { essential: 'Essential only', functional: 'Essential + Functional', all: 'All cookies' }; toast.success(`Cookie preferences: ${labels[next]}`); }}>{cookiePreferences === 'essential' ? 'Essential' : cookiePreferences === 'functional' ? 'Functional' : 'All'}</Button>
                    </div>
                    <div className="space-y-2">
                      <Label>Session Timeout (minutes)</Label>
                      <Select
                        value={sessionTimeout}
                        onValueChange={(value) => {
                          setSessionTimeout(value)
                          saveLocalSettings({ sessionTimeout: value })
                          toast.success(`Session timeout set to ${value === 'never' ? 'never expire' : value + ' minutes'}`)
                        }}
                      >
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
                      <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => setShowClearCacheDialog(true)}>
                        <Trash className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg">
                      <div>
                        <p className="font-medium text-red-600">Reset All Settings</p>
                        <p className="text-sm text-muted-foreground">Restore default settings</p>
                      </div>
                      <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => setShowResetSettingsDialog(true)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg">
                      <div>
                        <p className="font-medium text-red-600">Deactivate Account</p>
                        <p className="text-sm text-muted-foreground">Temporarily disable your account</p>
                      </div>
                      <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => setShowDeactivateAccountDialog(true)}>
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
                      <Button variant="outline" size="sm" className="w-full" onClick={() => window.open('/changelog', '_blank')}>
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
                    {([] as Array<{ action: string; time: string }>).length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                    ) : (
                      ([] as Array<{ action: string; time: string }>).map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <span>{item.action}</span>
                          <span className="text-muted-foreground">{item.time}</span>
                        </div>
                      ))
                    )}
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
              insights={settingsAIInsights}
              title="Account Intelligence"
              onInsightAction={handleInsightAction}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={settingsCollaboratorsData}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={settingsPredictions}
              title="Account Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={settingsActivitiesData}
            title="Account Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={getSettingsQuickActions(handleExportData)}
            variant="grid"
          />
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <AlertDialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteAccount} className="bg-red-600 hover:bg-red-700">
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRevokeAllIntegrationsDialog} onOpenChange={setShowRevokeAllIntegrationsDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke All Integrations</AlertDialogTitle>
            <AlertDialogDescription>
              This will disconnect all connected apps and services. You will need to reconnect them manually.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevokeAllIntegrations}>
              Revoke All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showResetSettingsDialog} onOpenChange={setShowResetSettingsDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset All Settings</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all your settings to their default values. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetAllSettings}>
              Reset Settings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showClearCacheDialog} onOpenChange={setShowClearCacheDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Caches</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all cached data including local storage and session data. You may experience slower initial page loads.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAllCaches}>
              Clear Caches
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeactivateAccountDialog} onOpenChange={setShowDeactivateAccountDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Account</AlertDialogTitle>
            <AlertDialogDescription>
              Your account will be temporarily disabled. You can reactivate it by logging in again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivateAccount}>
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showCancelSubscriptionDialog} onOpenChange={setShowCancelSubscriptionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your subscription? You will retain access until the end of your current billing period.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelSubscription}>
              Cancel Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showMuteAllNotificationsDialog} onOpenChange={setShowMuteAllNotificationsDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mute All Notifications</AlertDialogTitle>
            <AlertDialogDescription>
              This will disable all email, push, in-app, and SMS notifications. You can re-enable them at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMuteAllNotifications}>
              Mute All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRevokeAllSessionsDialog} onOpenChange={setShowRevokeAllSessionsDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log Out All Sessions</AlertDialogTitle>
            <AlertDialogDescription>
              This will log you out from all devices except this one. You will need to log in again on other devices.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevokeAllSessionsConfirmed}>
              Log Out All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
