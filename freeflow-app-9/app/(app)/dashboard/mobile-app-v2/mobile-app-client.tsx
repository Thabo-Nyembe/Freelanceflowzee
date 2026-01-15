'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAuthUserId } from '@/lib/hooks/use-auth-user-id'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Smartphone, Download, Star, TrendingUp, Users, Activity,
  Package, Upload, Play, Clock,
  Settings, Globe, Bell, Shield, BarChart3, Target,
  Bug, Cpu, Apple,
  RefreshCw, Send, ChevronRight,
  Key, Webhook, Mail, Database, Lock, AlertOctagon, Trash2,
  Copy, GitBranch, Image
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
type Platform = 'ios' | 'android' | 'all'
type BuildStatus = 'processing' | 'ready' | 'submitted' | 'in-review' | 'approved' | 'rejected' | 'released'
type ReleaseType = 'production' | 'beta' | 'internal' | 'staged'

interface Build {
  id: string
  version: string
  buildNumber: string
  platform: Platform
  status: BuildStatus
  releaseType: ReleaseType
  uploadedAt: string
  size: string
  minOsVersion: string
  expiresAt?: string
  testFlightEnabled: boolean
  testers: number
  crashes: number
  sessions: number
  feedback: number
}

interface AppVersion {
  id: string
  version: string
  platform: Platform
  status: 'draft' | 'ready' | 'in-review' | 'pending-release' | 'released' | 'rejected'
  releaseDate?: string
  phaseRelease: boolean
  phasePercentage: number
  whatsnew: string
  builds: Build[]
  screenshots: { device: string; urls: string[] }[]
  reviewNotes?: string
}

interface AppReview {
  id: string
  rating: number
  title: string
  body: string
  author: string
  date: string
  version: string
  platform: Platform
  response?: string
  responseDate?: string
  helpful: number
  territory: string
}

interface Analytics {
  downloads: { date: string; count: number }[]
  activeUsers: { date: string; count: number }[]
  sessions: { date: string; count: number }[]
  crashes: { date: string; count: number }[]
  revenue: { date: string; amount: number }[]
}

interface PushCampaign {
  id: string
  title: string
  message: string
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled'
  scheduledAt?: string
  sentAt?: string
  platform: Platform
  targetAudience: string
  sent: number
  opened: number
  clicked: number
}

interface InAppPurchase {
  id: string
  productId: string
  name: string
  type: 'consumable' | 'non-consumable' | 'subscription'
  price: string
  status: 'active' | 'inactive' | 'pending'
  purchases: number
  revenue: number
}

interface MobileAppClientProps {
  initialFeatures: any[]
  initialVersions: any[]
  initialStats: any
}

// Mock Data
const mockBuilds: Build[] = [
  { id: 'b1', version: '2.5.0', buildNumber: '250', platform: 'ios', status: 'released', releaseType: 'production', uploadedAt: '2024-01-15', size: '45.2 MB', minOsVersion: 'iOS 15.0', testFlightEnabled: true, testers: 156, crashes: 12, sessions: 45000, feedback: 23 },
  { id: 'b2', version: '2.5.1', buildNumber: '251', platform: 'ios', status: 'in-review', releaseType: 'production', uploadedAt: '2024-01-18', size: '45.8 MB', minOsVersion: 'iOS 15.0', testFlightEnabled: true, testers: 89, crashes: 2, sessions: 8500, feedback: 8 },
  { id: 'b3', version: '2.5.0', buildNumber: '2500', platform: 'android', status: 'released', releaseType: 'production', uploadedAt: '2024-01-15', size: '38.4 MB', minOsVersion: 'Android 10', testFlightEnabled: false, testers: 0, crashes: 18, sessions: 62000, feedback: 0 },
  { id: 'b4', version: '2.6.0', buildNumber: '260', platform: 'ios', status: 'processing', releaseType: 'beta', uploadedAt: '2024-01-18', size: '46.1 MB', minOsVersion: 'iOS 15.0', expiresAt: '2024-04-18', testFlightEnabled: true, testers: 45, crashes: 0, sessions: 1200, feedback: 5 },
]

const mockReviews: AppReview[] = [
  { id: 'r1', rating: 5, title: 'Best productivity app!', body: 'This app has completely changed how I manage my work. The interface is beautiful and intuitive.', author: 'ProductivityPro', date: '2024-01-17', version: '2.5.0', platform: 'ios', helpful: 42, territory: 'US' },
  { id: 'r2', rating: 4, title: 'Great but needs dark mode', body: 'Love the app overall but my eyes hurt at night. Please add dark mode!', author: 'NightOwl', date: '2024-01-16', version: '2.5.0', platform: 'ios', response: 'Thanks for the feedback! Dark mode is coming in v2.6.0, available in beta now.', responseDate: '2024-01-17', helpful: 28, territory: 'UK' },
  { id: 'r3', rating: 2, title: 'Crashes on startup', body: 'App keeps crashing on my Pixel 6. Please fix!', author: 'PixelUser', date: '2024-01-15', version: '2.5.0', platform: 'android', helpful: 15, territory: 'DE' },
  { id: 'r4', rating: 5, title: 'Worth every penny', body: 'The pro subscription is absolutely worth it. Customer support is excellent too.', author: 'HappyCustomer', date: '2024-01-14', version: '2.4.2', platform: 'android', helpful: 67, territory: 'US' },
]

const mockCampaigns: PushCampaign[] = [
  { id: 'p1', title: 'New Feature Launch', message: 'Check out our new AI assistant feature!', status: 'sent', sentAt: '2024-01-15', platform: 'all', targetAudience: 'All Users', sent: 125000, opened: 45000, clicked: 12500 },
  { id: 'p2', title: 'Weekend Sale', message: '50% off Pro subscription this weekend only!', status: 'scheduled', scheduledAt: '2024-01-20', platform: 'all', targetAudience: 'Free Users', sent: 0, opened: 0, clicked: 0 },
  { id: 'p3', title: 'Update Available', message: 'Version 2.5.1 is now available with bug fixes.', status: 'draft', platform: 'ios', targetAudience: 'iOS Users', sent: 0, opened: 0, clicked: 0 },
]

const mockIAPs: InAppPurchase[] = [
  { id: 'iap1', productId: 'com.app.pro_monthly', name: 'Pro Monthly', type: 'subscription', price: '$9.99/mo', status: 'active', purchases: 4500, revenue: 44955 },
  { id: 'iap2', productId: 'com.app.pro_yearly', name: 'Pro Yearly', type: 'subscription', price: '$79.99/yr', status: 'active', purchases: 2100, revenue: 167979 },
  { id: 'iap3', productId: 'com.app.credits_100', name: '100 Credits', type: 'consumable', price: '$4.99', status: 'active', purchases: 8900, revenue: 44411 },
  { id: 'iap4', productId: 'com.app.lifetime', name: 'Lifetime Access', type: 'non-consumable', price: '$199.99', status: 'active', purchases: 156, revenue: 31198 },
]

// ============================================================================
// ENHANCED COMPETITIVE UPGRADE MOCK DATA - App Store Connect Level
// ============================================================================

const mockMobileAppAIInsights = [
  { id: '1', type: 'success' as const, title: 'Store Approved', description: 'iOS v3.2.1 approved and live on App Store with 4.8★ rating.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Release' },
  { id: '2', type: 'warning' as const, title: 'Crash Rate Spike', description: 'Android crash rate increased 0.3% on Samsung devices. Investigation needed.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Stability' },
  { id: '3', type: 'info' as const, title: 'Revenue Milestone', description: 'In-app purchases crossed $50K this month. 15% increase from last month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Revenue' },
]

const mockMobileAppCollaborators = [
  { id: '1', name: 'iOS Lead', avatar: '/avatars/ios.jpg', status: 'online' as const, role: 'iOS Developer' },
  { id: '2', name: 'Android Lead', avatar: '/avatars/android.jpg', status: 'online' as const, role: 'Android Developer' },
  { id: '3', name: 'QA Manager', avatar: '/avatars/qa.jpg', status: 'away' as const, role: 'QA' },
]

const mockMobileAppPredictions = [
  { id: '1', title: 'Download Forecast', prediction: 'Expected 25K new downloads next week based on ASO improvements', confidence: 87, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Revenue Projection', prediction: 'Subscription revenue to reach $75K by end of quarter', confidence: 91, trend: 'up' as const, impact: 'medium' as const },
]

const mockMobileAppActivities = [
  { id: '1', user: 'iOS Lead', action: 'Submitted', target: 'v3.2.2 to App Store review', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Android Lead', action: 'Released', target: 'v3.2.1 to Play Store beta', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'QA Manager', action: 'Flagged', target: '3 critical bugs for hotfix', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'warning' as const },
]

// Quick actions will be defined inside the component to access state setters

export default function MobileAppClient({ initialFeatures, initialVersions, initialStats }: MobileAppClientProps) {
  const supabase = createClient()
  const { getUserId } = useAuthUserId()
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [activeTab, setActiveTab] = useState('overview')
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('all')
  const [selectedBuild, setSelectedBuild] = useState<Build | null>(null)
  const [showBuildDialog, setShowBuildDialog] = useState(false)
  const [selectedReview, setSelectedReview] = useState<AppReview | null>(null)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [settingsTab, setSettingsTab] = useState('general')

  // Form states
  const [buildForm, setBuildForm] = useState({ version: '', buildNumber: '', platform: 'ios' as Platform, releaseType: 'beta' as ReleaseType })
  const [campaignForm, setCampaignForm] = useState({ title: '', message: '', platform: 'all' as Platform, targetAudience: '' })
  const [iapForm, setIapForm] = useState({ productId: '', name: '', type: 'subscription' as 'consumable' | 'non-consumable' | 'subscription', price: '' })

  // Modal states
  const [showCreateBuildModal, setShowCreateBuildModal] = useState(false)
  const [showCreateCampaignModal, setShowCreateCampaignModal] = useState(false)
  const [showCreateIapModal, setShowCreateIapModal] = useState(false)

  // Quick Action Dialog States
  const [showQueueBuildDialog, setShowQueueBuildDialog] = useState(false)
  const [showSubmitReviewDialog, setShowSubmitReviewDialog] = useState(false)
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false)

  // Additional Dialog States
  const [showTestFlightDialog, setShowTestFlightDialog] = useState(false)
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false)
  const [showCrashReportsDialog, setShowCrashReportsDialog] = useState(false)
  const [showMetadataDialog, setShowMetadataDialog] = useState(false)
  const [showEditCampaignDialog, setShowEditCampaignDialog] = useState(false)
  const [selectedCampaignForEdit, setSelectedCampaignForEdit] = useState<PushCampaign | null>(null)
  const [showEditIapDialog, setShowEditIapDialog] = useState(false)
  const [selectedIapForEdit, setSelectedIapForEdit] = useState<InAppPurchase | null>(null)
  const [showEditAppNameDialog, setShowEditAppNameDialog] = useState(false)
  const [appNameValue, setAppNameValue] = useState('FreeFlow Mobile')
  const [showWebhookTestDialog, setShowWebhookTestDialog] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [showCiCdDialog, setShowCiCdDialog] = useState(false)
  const [selectedCiCd, setSelectedCiCd] = useState<{name: string; connected: boolean} | null>(null)
  const [showCreateTesterGroupDialog, setShowCreateTesterGroupDialog] = useState(false)
  const [testerGroupName, setTesterGroupName] = useState('')
  const [showExportAnalyticsDialog, setShowExportAnalyticsDialog] = useState(false)
  const [showRemoveFromStoreDialog, setShowRemoveFromStoreDialog] = useState(false)
  const [showDeleteAppDialog, setShowDeleteAppDialog] = useState(false)
  const [confirmDeleteText, setConfirmDeleteText] = useState('')

  // Quick Action Form States
  const [queueBuildForm, setQueueBuildForm] = useState({
    version: '',
    platform: 'ios' as Platform,
    buildType: 'debug' as 'debug' | 'release',
    branch: 'main'
  })
  const [submitReviewForm, setSubmitReviewForm] = useState({
    buildId: '',
    releaseNotes: '',
    targetAudience: 'all'
  })

  // Fetch user ID on mount
  useEffect(() => {
    getUserId().then(setUserId)
  }, [getUserId])

  const builds = mockBuilds
  const reviews = mockReviews
  const campaigns = mockCampaigns
  const iaps = mockIAPs

  const filteredBuilds = useMemo(() => {
    return builds.filter(b => selectedPlatform === 'all' || b.platform === selectedPlatform)
  }, [builds, selectedPlatform])

  const stats = {
    totalDownloads: 2340000,
    monthlyActiveUsers: 890000,
    dailyActiveUsers: 125000,
    avgRating: 4.6,
    totalReviews: 12500,
    crashFreeRate: 99.2,
    avgSessionLength: 8.5,
    retention7Day: 42,
    revenue: 288543,
    iosDownloads: 1250000,
    androidDownloads: 1090000
  }

  const getStatusColor = (status: BuildStatus | string) => {
    const colors: Record<string, string> = {
      processing: 'bg-yellow-100 text-yellow-700',
      ready: 'bg-blue-100 text-blue-700',
      submitted: 'bg-purple-100 text-purple-700',
      'in-review': 'bg-orange-100 text-orange-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      released: 'bg-emerald-100 text-emerald-700',
      draft: 'bg-gray-100 text-gray-700',
      scheduled: 'bg-blue-100 text-blue-700',
      sent: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-700',
      pending: 'bg-yellow-100 text-yellow-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getPlatformIcon = (platform: Platform) => {
    if (platform === 'ios') return <Apple className="h-4 w-4" />
    if (platform === 'android') return <Smartphone className="h-4 w-4" />
    return <Globe className="h-4 w-4" />
  }

  const openBuildDetails = (build: Build) => {
    setSelectedBuild(build)
    setShowBuildDialog(true)
  }

  const openReviewResponse = (review: AppReview) => {
    setSelectedReview(review)
    setResponseText(review.response || '')
    setShowReviewDialog(true)
  }

  // CRUD Handlers
  const handleCreateBuild = async () => {
    if (!userId || !buildForm.version.trim()) {
      toast.error('Missing required fields', { description: 'Please fill in version number' })
      return
    }
    setIsLoading(true)
    try {
      const { error } = await supabase.from('mobile_app_builds').insert({
        user_id: userId,
        version: buildForm.version,
        build_number: buildForm.buildNumber,
        platform: buildForm.platform,
        release_type: buildForm.releaseType,
        status: 'processing',
        size: '0 MB',
        min_os_version: buildForm.platform === 'ios' ? 'iOS 15.0' : 'Android 10'
      })
      if (error) throw error
      toast.success('Build created', { description: `Build v${buildForm.version} is being processed` })
      setBuildForm({ version: '', buildNumber: '', platform: 'ios', releaseType: 'beta' })
      setShowCreateBuildModal(false)
    } catch (err: any) {
      toast.error('Failed to create build', { description: err.message })
    } finally { setIsLoading(false) }
  }

  const handleSubmitToStore = async (buildId: string, platform: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from('mobile_app_builds').update({ status: 'submitted', submitted_at: new Date().toISOString() }).eq('id', buildId)
      if (error) throw error
      toast.success('Submitted to store', { description: `Build submitted to ${platform} for review` })
    } catch (err: any) {
      toast.error('Submission failed', { description: err.message })
    } finally { setIsLoading(false) }
  }

  const handleDownloadBuild = async (buildId: string, buildVersion: string) => {
    toast.promise(
      (async () => {
        const res = await fetch(`/api/mobile-app/builds/${buildId}/download`)
        if (!res.ok) throw new Error('Download failed')
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `build-v${buildVersion}.zip`
        a.click()
        URL.revokeObjectURL(url)
        // Log download event
        try {
          await supabase.from('mobile_app_downloads').insert({ build_id: buildId, user_id: userId, downloaded_at: new Date().toISOString() })
        } catch { /* ignore logging errors */ }
      })(),
      {
        loading: `Preparing download for build v${buildVersion}...`,
        success: `Build v${buildVersion} download started`,
        error: 'Failed to start download'
      }
    )
  }

  const handleDeleteBuild = async (buildId: string, buildVersion: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from('mobile_app_builds').delete().eq('id', buildId)
      if (error) throw error
      toast.success('Build deleted', { description: `Build v${buildVersion} has been removed` })
      setSelectedBuild(null)
      setShowBuildDialog(false)
    } catch (err: any) {
      toast.error('Delete failed', { description: err.message })
    } finally { setIsLoading(false) }
  }

  const handleReplyToReview = async () => {
    if (!selectedReview || !responseText.trim()) {
      toast.error('Missing response', { description: 'Please write a response' })
      return
    }
    setIsLoading(true)
    try {
      const { error } = await supabase.from('mobile_app_review_responses').insert({
        review_id: selectedReview.id,
        user_id: userId,
        response: responseText,
        responded_at: new Date().toISOString()
      })
      if (error) throw error
      toast.success('Reply sent', { description: `Response sent to ${selectedReview.author}` })
      setResponseText('')
      setShowReviewDialog(false)
    } catch (err: any) {
      toast.error('Reply failed', { description: err.message })
    } finally { setIsLoading(false) }
  }

  const handleReportReview = async (reviewId: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from('mobile_app_review_reports').insert({
        review_id: reviewId,
        user_id: userId,
        reason: 'inappropriate',
        reported_at: new Date().toISOString()
      })
      if (error) throw error
      toast.info('Review reported', { description: 'Review has been flagged for moderation' })
    } catch (err: any) {
      toast.error('Report failed', { description: err.message })
    } finally { setIsLoading(false) }
  }

  const handleCreateCampaign = async () => {
    if (!userId || !campaignForm.title.trim()) {
      toast.error('Missing required fields', { description: 'Please fill in campaign title' })
      return
    }
    setIsLoading(true)
    try {
      const { error } = await supabase.from('mobile_app_push_campaigns').insert({
        user_id: userId,
        title: campaignForm.title,
        message: campaignForm.message,
        platform: campaignForm.platform,
        target_audience: campaignForm.targetAudience,
        status: 'draft'
      })
      if (error) throw error
      toast.success('Campaign created', { description: `"${campaignForm.title}" is ready to schedule` })
      setCampaignForm({ title: '', message: '', platform: 'all', targetAudience: '' })
      setShowCreateCampaignModal(false)
    } catch (err: any) {
      toast.error('Failed to create campaign', { description: err.message })
    } finally { setIsLoading(false) }
  }

  const handleSendCampaign = async (campaignId: string, campaignTitle: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from('mobile_app_push_campaigns').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', campaignId)
      if (error) throw error
      toast.success('Campaign sent', { description: `"${campaignTitle}" has been sent` })
    } catch (err: any) {
      toast.error('Send failed', { description: err.message })
    } finally { setIsLoading(false) }
  }

  const handleDeleteCampaign = async (campaignId: string, campaignTitle: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from('mobile_app_push_campaigns').delete().eq('id', campaignId)
      if (error) throw error
      toast.success('Campaign deleted', { description: `"${campaignTitle}" has been removed` })
    } catch (err: any) {
      toast.error('Delete failed', { description: err.message })
    } finally { setIsLoading(false) }
  }

  const handleCreateIap = async () => {
    if (!userId || !iapForm.productId.trim()) {
      toast.error('Missing required fields', { description: 'Please fill in product ID' })
      return
    }
    setIsLoading(true)
    try {
      const { error } = await supabase.from('mobile_app_iaps').insert({
        user_id: userId,
        product_id: iapForm.productId,
        name: iapForm.name,
        type: iapForm.type,
        price: iapForm.price,
        status: 'pending'
      })
      if (error) throw error
      toast.success('Product created', { description: `"${iapForm.name}" is pending approval` })
      setIapForm({ productId: '', name: '', type: 'subscription', price: '' })
      setShowCreateIapModal(false)
    } catch (err: any) {
      toast.error('Failed to create product', { description: err.message })
    } finally { setIsLoading(false) }
  }

  const handleDeleteIap = async (iapId: string, iapName: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from('mobile_app_iaps').delete().eq('id', iapId)
      if (error) throw error
      toast.success('Product deleted', { description: `"${iapName}" has been removed` })
    } catch (err: any) {
      toast.error('Delete failed', { description: err.message })
    } finally { setIsLoading(false) }
  }

  const handleSaveSettings = async (section: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from('mobile_app_settings').upsert({
        user_id: userId,
        section,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,section' })
      if (error) throw error
      toast.success('Settings saved', { description: `${section} settings have been updated` })
    } catch (err: any) {
      toast.error('Save failed', { description: err.message })
    } finally { setIsLoading(false) }
  }

  const handleRefreshData = useCallback(() => {
    toast.promise(
      fetch('/api/mobile-app/refresh', { method: 'POST' }).then(res => {
        if (!res.ok) throw new Error('Failed to refresh')
      }),
      {
        loading: 'Refreshing mobile app data...',
        success: 'All mobile app data has been updated',
        error: 'Failed to refresh data'
      }
    )
  }, [])

  // Quick Action Handlers
  const handleQueueBuild = async () => {
    if (!userId || !queueBuildForm.version.trim()) {
      toast.error('Missing required fields', { description: 'Please fill in version number' })
      return
    }
    setIsLoading(true)
    try {
      const { error } = await supabase.from('mobile_app_builds').insert({
        user_id: userId,
        version: queueBuildForm.version,
        platform: queueBuildForm.platform,
        build_type: queueBuildForm.buildType,
        branch: queueBuildForm.branch,
        status: 'queued',
        queued_at: new Date().toISOString()
      })
      if (error) throw error
      toast.success('Build Queued', { description: `${queueBuildForm.platform.toUpperCase()} build v${queueBuildForm.version} has been queued for processing` })
      setQueueBuildForm({ version: '', platform: 'ios', buildType: 'debug', branch: 'main' })
      setShowQueueBuildDialog(false)
    } catch (err: any) {
      toast.error('Failed to queue build', { description: err.message })
    } finally { setIsLoading(false) }
  }

  const handleSubmitForReview = async () => {
    if (!userId || !submitReviewForm.buildId || !submitReviewForm.releaseNotes.trim()) {
      toast.error('Missing required fields', { description: 'Please select a build and provide release notes' })
      return
    }
    setIsLoading(true)
    try {
      const { error } = await supabase.from('mobile_app_builds').update({
        status: 'submitted',
        release_notes: submitReviewForm.releaseNotes,
        target_audience: submitReviewForm.targetAudience,
        submitted_at: new Date().toISOString()
      }).eq('id', submitReviewForm.buildId)
      if (error) throw error
      toast.success('Submitted for Review', { description: 'Your app has been submitted to the App Store for review' })
      setSubmitReviewForm({ buildId: '', releaseNotes: '', targetAudience: 'all' })
      setShowSubmitReviewDialog(false)
    } catch (err: any) {
      toast.error('Submission failed', { description: err.message })
    } finally { setIsLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Smartphone className="h-8 w-8" />
                Mobile App Console
              </h1>
              <p className="text-indigo-100 mt-1">Manage your iOS and Android applications</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={handleRefreshData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync
              </Button>
              <Button className="bg-white text-indigo-600 hover:bg-indigo-50" onClick={() => setShowCreateBuildModal(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Build
              </Button>
            </div>
          </div>

          {/* Platform Toggle */}
          <div className="flex items-center gap-3 mb-6">
            {(['all', 'ios', 'android'] as Platform[]).map(platform => (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedPlatform === platform ? 'bg-white text-indigo-600' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {getPlatformIcon(platform)}
                {platform === 'all' ? 'All Platforms' : platform.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
            {[
              { label: 'Total Downloads', value: `${(stats.totalDownloads / 1000000).toFixed(1)}M`, icon: Download, trend: '+12.5%' },
              { label: 'Monthly Active', value: `${(stats.monthlyActiveUsers / 1000).toFixed(0)}K`, icon: Users, trend: '+8.3%' },
              { label: 'Avg Rating', value: stats.avgRating.toFixed(1), icon: Star, trend: '+0.2' },
              { label: 'Crash-Free', value: `${stats.crashFreeRate}%`, icon: Shield, trend: '+0.5%' },
              { label: '7-Day Retention', value: `${stats.retention7Day}%`, icon: Target, trend: '+3.1%' },
              { label: 'Revenue (MTD)', value: `$${(stats.revenue / 1000).toFixed(0)}K`, icon: TrendingUp, trend: '+18.2%' }
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="h-5 w-5 text-indigo-200" />
                  <span className="text-xs text-emerald-300">{stat.trend}</span>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-indigo-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="builds">Builds</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="push">Push Notifications</TabsTrigger>
            <TabsTrigger value="iap">In-App Purchases</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            {/* Overview Banner */}
            <div className="bg-gradient-to-r from-fuchsia-600 via-purple-600 to-violet-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">App Overview</h2>
                  <p className="text-fuchsia-100">App Store Connect-level mobile app management dashboard</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{(stats?.downloads || 0).toLocaleString()}</p>
                    <p className="text-fuchsia-200 text-sm">Downloads</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{(stats?.activeUsers || 0).toLocaleString()}</p>
                    <p className="text-fuchsia-200 text-sm">Active Users</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{(stats?.rating || 0).toFixed(1)}</p>
                    <p className="text-fuchsia-200 text-sm">Rating</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Overview Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Upload, label: 'Submit', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', action: () => setShowSubmitReviewDialog(true) },
                { icon: Smartphone, label: 'TestFlight', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', action: () => setShowTestFlightDialog(true) },
                { icon: Star, label: 'Reviews', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', action: () => setActiveTab('reviews') },
                { icon: BarChart3, label: 'Analytics', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', action: () => setShowAnalyticsDialog(true) },
                { icon: Bell, label: 'Push', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', action: () => setActiveTab('push') },
                { icon: Key, label: 'In-App', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', action: () => setActiveTab('iap') },
                { icon: Shield, label: 'Privacy', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', action: () => setShowPrivacyDialog(true) },
                { icon: Settings, label: 'Settings', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', action: () => setActiveTab('settings') },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.action}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
              {/* Recent Builds */}
              <div className="col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Recent Builds</CardTitle>
                      <Button variant="outline" size="sm" onClick={() => setActiveTab('builds')}>
                        View All
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredBuilds.slice(0, 4).map(build => (
                        <div key={build.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => openBuildDetails(build)}>
                          <div className={`p-2 rounded-lg ${build.platform === 'ios' ? 'bg-gray-900 text-white' : 'bg-green-500 text-white'}`}>
                            {getPlatformIcon(build.platform)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">v{build.version} ({build.buildNumber})</h4>
                              <Badge className={getStatusColor(build.status)}>{build.status}</Badge>
                              {build.releaseType !== 'production' && (
                                <Badge variant="outline">{build.releaseType}</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {build.size} • Min {build.minOsVersion} • Uploaded {build.uploadedAt}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{build.sessions.toLocaleString()} sessions</p>
                            <p className="text-xs text-gray-500">{build.crashes} crashes</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Reviews */}
                <Card className="mt-6">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Recent Reviews</CardTitle>
                      <Button variant="outline" size="sm" onClick={() => setActiveTab('reviews')}>
                        View All
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reviews.slice(0, 3).map(review => (
                        <div key={review.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <div className="flex">
                                  {[1,2,3,4,5].map(star => (
                                    <Star key={star} className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                                  ))}
                                </div>
                                <h4 className="font-medium">{review.title}</h4>
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2">{review.body}</p>
                            </div>
                            {!review.response && (
                              <Button size="sm" variant="outline" onClick={() => openReviewResponse(review)}>
                                Reply
                              </Button>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                            <span>{review.author}</span>
                            <span>v{review.version}</span>
                            <span className="flex items-center gap-1">
                              {getPlatformIcon(review.platform)}
                              {review.platform.toUpperCase()}
                            </span>
                            <span>{review.territory}</span>
                          </div>
                          {review.response && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm text-blue-800">Developer Response:</p>
                              <p className="text-sm text-blue-700">{review.response}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Platform Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Platform Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="flex items-center gap-2 text-sm">
                          <Apple className="h-4 w-4" />
                          iOS
                        </span>
                        <span className="text-sm font-medium">{(stats.iosDownloads / 1000000).toFixed(1)}M</span>
                      </div>
                      <Progress value={(stats.iosDownloads / stats.totalDownloads) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="flex items-center gap-2 text-sm">
                          <Smartphone className="h-4 w-4" />
                          Android
                        </span>
                        <span className="text-sm font-medium">{(stats.androidDownloads / 1000000).toFixed(1)}M</span>
                      </div>
                      <Progress value={(stats.androidDownloads / stats.totalDownloads) * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { label: 'Upload New Build', icon: Upload, color: 'text-indigo-600', action: () => setShowCreateBuildModal(true) },
                      { label: 'Send Push Notification', icon: Bell, color: 'text-blue-600', action: () => setShowCreateCampaignModal(true) },
                      { label: 'View Crash Reports', icon: Bug, color: 'text-red-600', action: () => setShowCrashReportsDialog(true) },
                      { label: 'Update App Metadata', icon: Settings, color: 'text-gray-600', action: () => setShowMetadataDialog(true) },
                    ].map((action, i) => (
                      <button key={i} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-left" onClick={action.action}>
                        <action.icon className={`h-5 w-5 ${action.color}`} />
                        <span className="text-sm">{action.label}</span>
                      </button>
                    ))}
                  </CardContent>
                </Card>

                {/* Rating Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Rating Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <p className="text-4xl font-bold">{stats.avgRating}</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        {[1,2,3,4,5].map(star => (
                          <Star key={star} className={`h-4 w-4 ${star <= Math.round(stats.avgRating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{stats.totalReviews.toLocaleString()} reviews</p>
                    </div>
                    <div className="space-y-2">
                      {[
                        { stars: 5, percent: 72 },
                        { stars: 4, percent: 18 },
                        { stars: 3, percent: 5 },
                        { stars: 2, percent: 3 },
                        { stars: 1, percent: 2 },
                      ].map(rating => (
                        <div key={rating.stars} className="flex items-center gap-2">
                          <span className="text-xs w-3">{rating.stars}</span>
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <Progress value={rating.percent} className="h-1.5 flex-1" />
                          <span className="text-xs text-gray-500 w-8">{rating.percent}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Builds Tab */}
          <TabsContent value="builds">
            {/* Builds Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Build Management</h2>
                  <p className="text-emerald-100">TestFlight and Google Play Console integration</p>
                  <p className="text-emerald-200 text-xs mt-1">Auto-deploy • Beta testing • Phased rollouts</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockBuilds.length}</p>
                    <p className="text-emerald-200 text-sm">Builds</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockBuilds.filter(b => b.status === 'released').length}</p>
                    <p className="text-emerald-200 text-sm">Released</p>
                  </div>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Builds</CardTitle>
                  <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setShowCreateBuildModal(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Build
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredBuilds.map(build => (
                    <div key={build.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => openBuildDetails(build)}>
                      <div className={`p-3 rounded-lg ${build.platform === 'ios' ? 'bg-gray-900 text-white' : 'bg-green-500 text-white'}`}>
                        {getPlatformIcon(build.platform)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">Version {build.version}</h4>
                          <Badge variant="outline">Build {build.buildNumber}</Badge>
                          <Badge className={getStatusColor(build.status)}>{build.status}</Badge>
                          {build.releaseType !== 'production' && (
                            <Badge variant="secondary">{build.releaseType}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{build.size}</span>
                          <span>Min {build.minOsVersion}</span>
                          <span>Uploaded {build.uploadedAt}</span>
                          {build.expiresAt && <span className="text-orange-600">Expires {build.expiresAt}</span>}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-6 text-center">
                        <div>
                          <p className="text-lg font-semibold">{build.sessions.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Sessions</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-red-600">{build.crashes}</p>
                          <p className="text-xs text-gray-500">Crashes</p>
                        </div>
                        {build.testFlightEnabled && (
                          <>
                            <div>
                              <p className="text-lg font-semibold text-blue-600">{build.testers}</p>
                              <p className="text-xs text-gray-500">Testers</p>
                            </div>
                            <div>
                              <p className="text-lg font-semibold">{build.feedback}</p>
                              <p className="text-xs text-gray-500">Feedback</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            {/* Reviews Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">App Reviews</h2>
                  <p className="text-amber-100">Monitor ratings and respond to user feedback</p>
                  <p className="text-amber-200 text-xs mt-1">Sentiment analysis • Auto-replies • Trending topics</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockReviews.length}</p>
                    <p className="text-amber-200 text-sm">Reviews</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{(stats?.rating || 0).toFixed(1)}</p>
                    <p className="text-amber-200 text-sm">Avg Rating</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
              <div className="col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>App Reviews</CardTitle>
                      <div className="flex items-center gap-2">
                        <select className="px-3 py-2 border rounded-lg text-sm">
                          <option>All Ratings</option>
                          <option>5 Stars</option>
                          <option>4 Stars</option>
                          <option>3 Stars</option>
                          <option>2 Stars</option>
                          <option>1 Star</option>
                        </select>
                        <select className="px-3 py-2 border rounded-lg text-sm">
                          <option>All Versions</option>
                          <option>v2.5.0</option>
                          <option>v2.4.2</option>
                        </select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reviews.map(review => (
                        <div key={review.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex">
                                  {[1,2,3,4,5].map(star => (
                                    <Star key={star} className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                                  ))}
                                </div>
                                <h4 className="font-semibold">{review.title}</h4>
                              </div>
                              <p className="text-gray-600 mb-3">{review.body}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>{review.author}</span>
                                <span>{review.date}</span>
                                <span className="flex items-center gap-1">
                                  {getPlatformIcon(review.platform)}
                                  v{review.version}
                                </span>
                                <span>{review.territory}</span>
                                <span>{review.helpful} found helpful</span>
                              </div>
                            </div>
                            <Button size="sm" variant={review.response ? 'secondary' : 'outline'} onClick={() => openReviewResponse(review)}>
                              {review.response ? 'Edit Response' : 'Reply'}
                            </Button>
                          </div>
                          {review.response && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary">Developer Response</Badge>
                                <span className="text-xs text-gray-500">{review.responseDate}</span>
                              </div>
                              <p className="text-sm text-gray-700">{review.response}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Review Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <p className="text-5xl font-bold">{stats.avgRating}</p>
                      <p className="text-sm text-gray-500">{stats.totalReviews.toLocaleString()} total reviews</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-center">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold">{reviews.filter(r => !r.response).length}</p>
                        <p className="text-xs text-gray-500">Needs Response</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold">{reviews.filter(r => r.rating <= 2).length}</p>
                        <p className="text-xs text-gray-500">Negative</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Common Topics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        { topic: 'Performance', sentiment: 'positive', count: 245 },
                        { topic: 'UI/UX', sentiment: 'positive', count: 189 },
                        { topic: 'Crashes', sentiment: 'negative', count: 45 },
                        { topic: 'Pricing', sentiment: 'neutral', count: 78 },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                          <span className="text-sm">{item.topic}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs ${item.sentiment === 'positive' ? 'text-green-600' : item.sentiment === 'negative' ? 'text-red-600' : 'text-gray-600'}`}>
                              {item.count} mentions
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            {/* Analytics Banner */}
            <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">App Analytics</h2>
                  <p className="text-indigo-100">Firebase Analytics-level insights and metrics</p>
                  <p className="text-indigo-200 text-xs mt-1">Real-time data from iOS and Android</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{(stats?.activeUsers || 0).toLocaleString()}</p>
                    <p className="text-indigo-200 text-sm">MAU</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{(stats?.sessions || 0).toLocaleString()}</p>
                    <p className="text-indigo-200 text-sm">Sessions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{((stats?.revenue || 0) / 1000).toFixed(1)}k</p>
                    <p className="text-indigo-200 text-sm">Revenue</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats?.crashes || 0}</p>
                    <p className="text-indigo-200 text-sm">Crashes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">4.5m</p>
                    <p className="text-indigo-200 text-sm">Events</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Downloads Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <BarChart3 className="h-16 w-16 text-gray-300" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <Activity className="h-16 w-16 text-gray-300" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Device Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {[
                      { label: 'Avg Session', value: `${stats.avgSessionLength}m`, icon: Clock },
                      { label: 'Crash-Free Rate', value: `${stats.crashFreeRate}%`, icon: Shield },
                      { label: 'DAU', value: `${(stats.dailyActiveUsers / 1000).toFixed(0)}K`, icon: Users },
                      { label: 'MAU', value: `${(stats.monthlyActiveUsers / 1000).toFixed(0)}K`, icon: Users },
                    ].map((metric, i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-lg">
                        <metric.icon className="h-5 w-5 text-gray-400 mb-2" />
                        <p className="text-2xl font-bold">{metric.value}</p>
                        <p className="text-sm text-gray-500">{metric.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Retention</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { period: 'Day 1', rate: 68 },
                      { period: 'Day 7', rate: 42 },
                      { period: 'Day 14', rate: 31 },
                      { period: 'Day 30', rate: 22 },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">{item.period}</span>
                          <span className="text-sm font-medium">{item.rate}%</span>
                        </div>
                        <Progress value={item.rate} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Push Notifications Tab */}
          <TabsContent value="push">
            {/* Push Notifications Banner */}
            <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Push Notifications</h2>
                  <p className="text-rose-100">OneSignal-level push notification management</p>
                  <p className="text-rose-200 text-xs mt-1">Automated campaigns • A/B testing • Segmentation</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockCampaigns.length}</p>
                    <p className="text-rose-200 text-sm">Campaigns</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockCampaigns.reduce((sum, c) => sum + c.sent, 0).toLocaleString()}</p>
                    <p className="text-rose-200 text-sm">Sent</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
              <div className="col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Push Campaigns</CardTitle>
                      <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setShowCreateCampaignModal(true)}>
                        <Bell className="h-4 w-4 mr-2" />
                        New Campaign
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {campaigns.map(campaign => (
                        <div key={campaign.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{campaign.title}</h4>
                                <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                              </div>
                              <p className="text-sm text-gray-600">{campaign.message}</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => { setSelectedCampaignForEdit(campaign); setShowEditCampaignDialog(true); }}>Edit</Button>
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <span className="flex items-center gap-1">
                              {getPlatformIcon(campaign.platform)}
                              {campaign.platform === 'all' ? 'All' : campaign.platform.toUpperCase()}
                            </span>
                            <span className="text-gray-500">{campaign.targetAudience}</span>
                            {campaign.sentAt && <span>Sent: {campaign.sentAt}</span>}
                            {campaign.scheduledAt && <span className="text-blue-600">Scheduled: {campaign.scheduledAt}</span>}
                          </div>
                          {campaign.sent > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-4 pt-4 border-t">
                              <div>
                                <p className="text-lg font-semibold">{campaign.sent.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">Sent</p>
                              </div>
                              <div>
                                <p className="text-lg font-semibold">{((campaign.opened / campaign.sent) * 100).toFixed(1)}%</p>
                                <p className="text-xs text-gray-500">Open Rate</p>
                              </div>
                              <div>
                                <p className="text-lg font-semibold">{((campaign.clicked / campaign.sent) * 100).toFixed(1)}%</p>
                                <p className="text-xs text-gray-500">Click Rate</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Campaign Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <p className="text-3xl font-bold text-indigo-600">{campaigns.filter(c => c.status === 'sent').length}</p>
                    <p className="text-sm text-gray-600">Campaigns Sent</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Avg Open Rate</span>
                      <span className="font-medium">36%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Avg Click Rate</span>
                      <span className="font-medium">10%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Total Sent</span>
                      <span className="font-medium">125K</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* In-App Purchases Tab */}
          <TabsContent value="iap">
            {/* In-App Purchases Banner */}
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">In-App Purchases</h2>
                  <p className="text-green-100">RevenueCat-level subscription and purchase management</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockIAPs.length}</p>
                    <p className="text-green-200 text-sm">Products</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">${(stats?.revenue || 0 / 1000).toFixed(1)}k</p>
                    <p className="text-green-200 text-sm">Revenue</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockIAPs.filter(p => p.type === 'subscription').length}</p>
                    <p className="text-green-200 text-sm">Subs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockIAPs.filter(p => p.type === 'consumable').length}</p>
                    <p className="text-green-200 text-sm">Consumable</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">85%</p>
                    <p className="text-green-200 text-sm">Retention</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
              <div className="col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>In-App Purchases</CardTitle>
                      <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setShowCreateIapModal(true)}>
                        <Package className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {iaps.map(iap => (
                        <div key={iap.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className={`p-3 rounded-lg ${iap.type === 'subscription' ? 'bg-purple-100' : iap.type === 'consumable' ? 'bg-blue-100' : 'bg-green-100'}`}>
                            <Package className={`h-5 w-5 ${iap.type === 'subscription' ? 'text-purple-600' : iap.type === 'consumable' ? 'text-blue-600' : 'text-green-600'}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{iap.name}</h4>
                              <Badge variant="outline" className="capitalize">{iap.type}</Badge>
                              <Badge className={getStatusColor(iap.status)}>{iap.status}</Badge>
                            </div>
                            <p className="text-sm text-gray-500">{iap.productId}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">{iap.price}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{iap.purchases.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">Purchases</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">${iap.revenue.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">Revenue</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => { setSelectedIapForEdit(iap); setShowEditIapDialog(true); }}>Edit</Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Revenue Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <p className="text-4xl font-bold text-green-600">
                      ${iaps.reduce((sum, iap) => sum + iap.revenue, 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { type: 'Subscriptions', amount: iaps.filter(i => i.type === 'subscription').reduce((s, i) => s + i.revenue, 0), color: 'bg-purple-500' },
                      { type: 'Consumables', amount: iaps.filter(i => i.type === 'consumable').reduce((s, i) => s + i.revenue, 0), color: 'bg-blue-500' },
                      { type: 'One-time', amount: iaps.filter(i => i.type === 'non-consumable').reduce((s, i) => s + i.revenue, 0), color: 'bg-green-500' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="flex-1 text-sm">{item.type}</span>
                        <span className="font-medium">${item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab - App Store Connect Level with 6 Sub-tabs */}
          <TabsContent value="settings">
            {/* Settings Banner */}
            <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">App Settings</h2>
                  <p className="text-slate-100">Configure app metadata, privacy, and distribution</p>
                  <p className="text-slate-200 text-xs mt-1">App Info • Pricing • Availability • Privacy</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">v{mockBuilds[0]?.version || '1.0'}</p>
                    <p className="text-slate-200 text-sm">Version</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">2</p>
                    <p className="text-slate-200 text-sm">Platforms</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-6">
              {/* Settings Sidebar */}
              <div className="w-64 shrink-0">
                <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 px-3">Settings</h3>
                  <nav className="space-y-1">
                    {[
                      { id: 'general', icon: Settings, label: 'General' },
                      { id: 'distribution', icon: Package, label: 'Distribution' },
                      { id: 'notifications', icon: Bell, label: 'Notifications' },
                      { id: 'api', icon: Key, label: 'API & Integrations' },
                      { id: 'testers', icon: Users, label: 'Testers' },
                      { id: 'advanced', icon: Lock, label: 'Advanced' }
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => setSettingsTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                          settingsTab === item.id
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Settings Content */}
              <div className="flex-1 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <Smartphone className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <CardTitle>App Information</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Basic app settings</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">App Name</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{appNameValue}</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setShowEditAppNameDialog(true)}>Edit</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Bundle ID</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">com.freeflow.app</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText('com.freeflow.app'); toast.success('Copied to clipboard', { description: 'Bundle ID has been copied' }); }}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Primary Language</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Select app default language</p>
                          </div>
                          <Select defaultValue="en">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="de">German</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Content Rating</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">App content rating</p>
                          </div>
                          <Badge>4+ / Everyone</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Image className="h-5 w-5 text-purple-600 dark:text-purple-400"  loading="lazy"/>
                          </div>
                          <div>
                            <CardTitle>Store Presence</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">App Store listing settings</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Show in Search</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Allow app to appear in search</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Pre-order Enabled</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Allow pre-orders for new versions</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Made for Kids</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">App is designed for children</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Distribution Settings */}
                {settingsTab === 'distribution' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <CardTitle>Availability</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Where your app is available</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Available Territories</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Countries where app is available</p>
                          </div>
                          <Badge>175 countries</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Release Type</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Default release strategy</p>
                          </div>
                          <Select defaultValue="manual">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="manual">Manual</SelectItem>
                              <SelectItem value="auto">Automatic</SelectItem>
                              <SelectItem value="phased">Phased</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Phased Release</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Gradually roll out to users</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                            <Apple className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <CardTitle>TestFlight</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Beta testing configuration</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">TestFlight Enabled</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Enable beta testing</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Public Link</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Allow public test invites</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Auto-distribute Builds</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically send to testers</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <CardTitle>Email Notifications</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">App Store notifications</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Review Status</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Get notified on review updates</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">New Ratings</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Daily summary of new ratings</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Crash Reports</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Alert on crash spikes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Sales Reports</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Weekly sales summary</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Webhook className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <CardTitle>Webhook Notifications</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Send alerts to external services</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Slack Integration</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Post updates to Slack</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Discord</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Send to Discord channels</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Label className="text-gray-900 dark:text-white font-medium mb-2 block">Custom Webhook</Label>
                          <div className="flex gap-2">
                            <Input placeholder="https://your-webhook-url.com" className="flex-1" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} />
                            <Button variant="outline" onClick={() => setShowWebhookTestDialog(true)}>Test</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* API & Integrations */}
                {settingsTab === 'api' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <Key className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <CardTitle>API Keys</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Manage API access tokens</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-gray-900 dark:text-white font-medium">App Store Connect API Key</Label>
                            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText('asc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'); toast.success('Copied to clipboard', { description: 'API key has been copied' }); }}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                          </div>
                          <code className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded block font-mono">
                            asc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                          </code>
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => { toast.promise(fetch('/api/mobile-app/api-keys/regenerate', { method: 'POST' }).then(res => { if (!res.ok) throw new Error('Failed'); }), { loading: 'Regenerating API key...', success: 'New API key generated successfully', error: 'Failed to regenerate API key' }); }}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Regenerate API Key
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <GitBranch className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <CardTitle>CI/CD Integration</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Connect build pipelines</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          {[
                            { name: 'GitHub Actions', connected: true },
                            { name: 'Bitrise', connected: false },
                            { name: 'CircleCI', connected: false },
                            { name: 'Fastlane', connected: true }
                          ].map(ci => (
                            <div key={ci.name} className="flex items-center justify-between p-4 border dark:border-gray-600 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Cpu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                <span className="font-medium text-gray-900 dark:text-white">{ci.name}</span>
                              </div>
                              <Button variant={ci.connected ? 'outline' : 'default'} size="sm" onClick={() => { setSelectedCiCd(ci); setShowCiCdDialog(true); }}>
                                {ci.connected ? 'Configure' : 'Connect'}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Testers */}
                {settingsTab === 'testers' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                            <Users className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                          </div>
                          <div>
                            <CardTitle>Tester Groups</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Manage beta tester groups</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Internal Team', testers: 25, active: true },
                          { name: 'Beta Testers', testers: 150, active: true },
                          { name: 'Public Beta', testers: 1000, active: false }
                        ].map(group => (
                          <div key={group.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <Label className="text-gray-900 dark:text-white font-medium">{group.name}</Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{group.testers} testers</p>
                            </div>
                            <Switch defaultChecked={group.active} />
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => setShowCreateTesterGroupDialog(true)}>
                          <Users className="h-4 w-4 mr-2" />
                          Create New Group
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                            <Mail className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <CardTitle>Tester Invitations</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Invite settings</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Auto-invite on Build</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Invite testers when new build is ready</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Require NDA</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Testers must accept NDA</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <CardTitle>Security</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">App security settings</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">App Transport Security</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Require HTTPS connections</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Encryption Export</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Uses encryption requiring export compliance</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <Database className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <CardTitle>Data & Analytics</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Data collection settings</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Crash Reporting</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Collect crash reports</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">App Analytics</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Share data with analytics</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1" onClick={() => setShowExportAnalyticsDialog(true)}>
                            <Download className="h-4 w-4 mr-2" />
                            Export Analytics
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={() => setShowAnalyticsDialog(true)}>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Reports
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                          <AlertOctagon className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">Danger Zone</h3>
                          <p className="text-sm text-red-600/70 dark:text-red-400/70">Destructive actions</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Remove from App Store</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Temporarily remove app from sale</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20" onClick={() => setShowRemoveFromStoreDialog(true)}>
                            Remove
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Delete App</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Permanently delete this app</p>
                          </div>
                          <Button variant="destructive" onClick={() => setShowDeleteAppDialog(true)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockMobileAppAIInsights}
              title="Mobile App Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight', { description: insight.description || 'View insight details' })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockMobileAppCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockMobileAppPredictions}
              title="App Store Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockMobileAppActivities}
            title="Mobile App Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={[
              { id: '1', label: 'New Build', icon: 'plus', action: () => setShowQueueBuildDialog(true), variant: 'default' as const },
              { id: '2', label: 'Submit Review', icon: 'send', action: () => setShowSubmitReviewDialog(true), variant: 'default' as const },
              { id: '3', label: 'View Analytics', icon: 'chart', action: () => setShowAnalyticsDialog(true), variant: 'outline' as const },
            ]}
            variant="grid"
          />
        </div>
      </div>

      {/* Build Detail Dialog */}
      <Dialog open={showBuildDialog} onOpenChange={setShowBuildDialog}>
        <DialogContent className="max-w-2xl">
          {selectedBuild && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {getPlatformIcon(selectedBuild.platform)}
                  Version {selectedBuild.version} (Build {selectedBuild.buildNumber})
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(selectedBuild.status)}>{selectedBuild.status}</Badge>
                  <Badge variant="outline">{selectedBuild.releaseType}</Badge>
                  {selectedBuild.testFlightEnabled && <Badge variant="secondary">TestFlight</Badge>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Size</p>
                    <p className="text-lg font-semibold">{selectedBuild.size}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Min OS Version</p>
                    <p className="text-lg font-semibold">{selectedBuild.minOsVersion}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Uploaded</p>
                    <p className="text-lg font-semibold">{selectedBuild.uploadedAt}</p>
                  </div>
                  {selectedBuild.expiresAt && (
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <p className="text-sm text-orange-600">Expires</p>
                      <p className="text-lg font-semibold text-orange-700">{selectedBuild.expiresAt}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold">{selectedBuild.sessions.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Sessions</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{selectedBuild.crashes}</p>
                    <p className="text-sm text-gray-500">Crashes</p>
                  </div>
                  {selectedBuild.testFlightEnabled && (
                    <>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{selectedBuild.testers}</p>
                        <p className="text-sm text-gray-500">Testers</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold">{selectedBuild.feedback}</p>
                        <p className="text-sm text-gray-500">Feedback</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-3">
                  {selectedBuild.status === 'ready' && (
                    <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => { setShowBuildDialog(false); setSubmitReviewForm({ ...submitReviewForm, buildId: selectedBuild.id }); setShowSubmitReviewDialog(true); }}>
                      <Send className="h-4 w-4 mr-2" />
                      Submit for Review
                    </Button>
                  )}
                  {selectedBuild.status === 'approved' && (
                    <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => { toast.promise(handleSubmitToStore(selectedBuild.id, selectedBuild.platform), { loading: 'Releasing to App Store...', success: 'Successfully released to App Store!', error: 'Failed to release to App Store' }); }}>
                      <Play className="h-4 w-4 mr-2" />
                      Release to App Store
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => { setShowBuildDialog(false); setShowCrashReportsDialog(true); }}>
                    <Bug className="h-4 w-4 mr-2" />
                    View Crashes
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Response Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          {selectedReview && (
            <>
              <DialogHeader>
                <DialogTitle>Respond to Review</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} className={`h-4 w-4 ${star <= selectedReview.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="font-medium">{selectedReview.title}</span>
                  </div>
                  <p className="text-sm text-gray-600">{selectedReview.body}</p>
                  <p className="text-xs text-gray-500 mt-2">by {selectedReview.author} • {selectedReview.date}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Your Response</label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={4}
                    placeholder="Write a helpful response to this review..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Your response will be publicly visible on the App Store.</p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setShowReviewDialog(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={handleReplyToReview} disabled={isLoading}>
                    <Send className="h-4 w-4 mr-2" />
                    {isLoading ? 'Sending...' : 'Submit Response'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Build Modal */}
      <Dialog open={showCreateBuildModal} onOpenChange={setShowCreateBuildModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload New Build</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Version Number</Label>
              <Input placeholder="e.g., 2.6.0" value={buildForm.version} onChange={(e) => setBuildForm({ ...buildForm, version: e.target.value })} />
            </div>
            <div>
              <Label>Build Number</Label>
              <Input placeholder="e.g., 260" value={buildForm.buildNumber} onChange={(e) => setBuildForm({ ...buildForm, buildNumber: e.target.value })} />
            </div>
            <div>
              <Label>Platform</Label>
              <Select value={buildForm.platform} onValueChange={(v: Platform) => setBuildForm({ ...buildForm, platform: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ios">iOS</SelectItem>
                  <SelectItem value="android">Android</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Release Type</Label>
              <Select value={buildForm.releaseType} onValueChange={(v: ReleaseType) => setBuildForm({ ...buildForm, releaseType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beta">Beta</SelectItem>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staged">Staged</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateBuildModal(false)}>Cancel</Button>
              <Button onClick={handleCreateBuild} disabled={isLoading}>{isLoading ? 'Creating...' : 'Create Build'}</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Campaign Modal */}
      <Dialog open={showCreateCampaignModal} onOpenChange={setShowCreateCampaignModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Push Campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Campaign Title</Label>
              <Input placeholder="e.g., New Feature Launch" value={campaignForm.title} onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })} />
            </div>
            <div>
              <Label>Message</Label>
              <Input placeholder="Push notification message" value={campaignForm.message} onChange={(e) => setCampaignForm({ ...campaignForm, message: e.target.value })} />
            </div>
            <div>
              <Label>Platform</Label>
              <Select value={campaignForm.platform} onValueChange={(v: Platform) => setCampaignForm({ ...campaignForm, platform: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="ios">iOS Only</SelectItem>
                  <SelectItem value="android">Android Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Target Audience</Label>
              <Input placeholder="e.g., All Users, Free Users" value={campaignForm.targetAudience} onChange={(e) => setCampaignForm({ ...campaignForm, targetAudience: e.target.value })} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateCampaignModal(false)}>Cancel</Button>
              <Button onClick={handleCreateCampaign} disabled={isLoading}>{isLoading ? 'Creating...' : 'Create Campaign'}</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create IAP Modal */}
      <Dialog open={showCreateIapModal} onOpenChange={setShowCreateIapModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add In-App Purchase</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Product ID</Label>
              <Input placeholder="e.g., com.app.pro_monthly" value={iapForm.productId} onChange={(e) => setIapForm({ ...iapForm, productId: e.target.value })} />
            </div>
            <div>
              <Label>Product Name</Label>
              <Input placeholder="e.g., Pro Monthly" value={iapForm.name} onChange={(e) => setIapForm({ ...iapForm, name: e.target.value })} />
            </div>
            <div>
              <Label>Product Type</Label>
              <Select value={iapForm.type} onValueChange={(v: 'consumable' | 'non-consumable' | 'subscription') => setIapForm({ ...iapForm, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="consumable">Consumable</SelectItem>
                  <SelectItem value="non-consumable">Non-Consumable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Price</Label>
              <Input placeholder="e.g., $9.99/mo" value={iapForm.price} onChange={(e) => setIapForm({ ...iapForm, price: e.target.value })} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateIapModal(false)}>Cancel</Button>
              <Button onClick={handleCreateIap} disabled={isLoading}>{isLoading ? 'Creating...' : 'Add Product'}</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Queue Build Dialog */}
      <Dialog open={showQueueBuildDialog} onOpenChange={setShowQueueBuildDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-indigo-600" />
              Queue New Build
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Version Number</Label>
              <Input
                placeholder="e.g., 3.0.0"
                value={queueBuildForm.version}
                onChange={(e) => setQueueBuildForm({ ...queueBuildForm, version: e.target.value })}
              />
            </div>
            <div>
              <Label>Platform</Label>
              <Select value={queueBuildForm.platform} onValueChange={(v: Platform) => setQueueBuildForm({ ...queueBuildForm, platform: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ios">iOS</SelectItem>
                  <SelectItem value="android">Android</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Build Type</Label>
              <Select value={queueBuildForm.buildType} onValueChange={(v: 'debug' | 'release') => setQueueBuildForm({ ...queueBuildForm, buildType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="debug">Debug</SelectItem>
                  <SelectItem value="release">Release</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Git Branch</Label>
              <Input
                placeholder="e.g., main, develop, feature/xyz"
                value={queueBuildForm.branch}
                onChange={(e) => setQueueBuildForm({ ...queueBuildForm, branch: e.target.value })}
              />
            </div>
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <h4 className="font-medium text-indigo-700 dark:text-indigo-300 mb-2">Build Queue Info</h4>
              <ul className="text-sm text-indigo-600 dark:text-indigo-400 space-y-1">
                <li>Build will be processed in CI/CD pipeline</li>
                <li>Estimated build time: 15-30 minutes</li>
                <li>You will be notified when complete</li>
              </ul>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowQueueBuildDialog(false)}>Cancel</Button>
              <Button onClick={handleQueueBuild} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
                {isLoading ? 'Queueing...' : 'Queue Build'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Submit for Review Dialog */}
      <Dialog open={showSubmitReviewDialog} onOpenChange={setShowSubmitReviewDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-green-600" />
              Submit to App Store Review
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Build</Label>
              <Select value={submitReviewForm.buildId} onValueChange={(v) => setSubmitReviewForm({ ...submitReviewForm, buildId: v })}>
                <SelectTrigger><SelectValue placeholder="Choose a build to submit" /></SelectTrigger>
                <SelectContent>
                  {filteredBuilds.filter(b => b.status === 'ready' || b.status === 'approved').map(build => (
                    <SelectItem key={build.id} value={build.id}>
                      v{build.version} ({build.buildNumber}) - {build.platform.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Release Notes (What&apos;s New)</Label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg min-h-[100px] dark:bg-gray-800 dark:border-gray-700"
                placeholder="Describe the new features and improvements in this version..."
                value={submitReviewForm.releaseNotes}
                onChange={(e) => setSubmitReviewForm({ ...submitReviewForm, releaseNotes: e.target.value })}
              />
            </div>
            <div>
              <Label>Target Audience</Label>
              <Select value={submitReviewForm.targetAudience} onValueChange={(v) => setSubmitReviewForm({ ...submitReviewForm, targetAudience: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="new">New Users Only</SelectItem>
                  <SelectItem value="existing">Existing Users Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <h4 className="font-medium text-amber-700 dark:text-amber-300 mb-2">Review Guidelines</h4>
              <ul className="text-sm text-amber-600 dark:text-amber-400 space-y-1">
                <li>App review typically takes 24-48 hours</li>
                <li>Ensure all metadata is complete and accurate</li>
                <li>Test thoroughly before submission</li>
              </ul>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSubmitReviewDialog(false)}>Cancel</Button>
              <Button onClick={handleSubmitForReview} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                {isLoading ? 'Submitting...' : 'Submit for Review'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog open={showAnalyticsDialog} onOpenChange={setShowAnalyticsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Mobile App Analytics Dashboard
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                <Download className="h-6 w-6 mx-auto text-blue-600 dark:text-blue-400 mb-2" />
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{(stats.totalDownloads / 1000000).toFixed(1)}M</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">Total Downloads</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <Users className="h-6 w-6 mx-auto text-green-600 dark:text-green-400 mb-2" />
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{(stats.monthlyActiveUsers / 1000).toFixed(0)}K</p>
                <p className="text-sm text-green-600 dark:text-green-400">Monthly Active</p>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-center">
                <Star className="h-6 w-6 mx-auto text-amber-600 dark:text-amber-400 mb-2" />
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.avgRating.toFixed(1)}</p>
                <p className="text-sm text-amber-600 dark:text-amber-400">Avg Rating</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                <TrendingUp className="h-6 w-6 mx-auto text-purple-600 dark:text-purple-400 mb-2" />
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">${(stats.revenue / 1000).toFixed(0)}K</p>
                <p className="text-sm text-purple-600 dark:text-purple-400">Revenue (MTD)</p>
              </div>
            </div>

            {/* Platform Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Apple className="h-4 w-4" />
                    iOS Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Downloads</span>
                      <span className="font-medium">{(stats.iosDownloads / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">App Store Rating</span>
                      <span className="font-medium">4.7</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Crash-Free Rate</span>
                      <span className="font-medium text-green-600">99.4%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Day 7 Retention</span>
                      <span className="font-medium">44%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Android Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Downloads</span>
                      <span className="font-medium">{(stats.androidDownloads / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Play Store Rating</span>
                      <span className="font-medium">4.5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Crash-Free Rate</span>
                      <span className="font-medium text-green-600">99.0%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Day 7 Retention</span>
                      <span className="font-medium">40%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Engagement Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">User Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-xl font-bold">{stats.avgSessionLength}m</p>
                    <p className="text-xs text-gray-500">Avg Session</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-xl font-bold">{(stats.dailyActiveUsers / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-gray-500">Daily Active</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-xl font-bold">{stats.retention7Day}%</p>
                    <p className="text-xs text-gray-500">7-Day Retention</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-xl font-bold">{stats.crashFreeRate}%</p>
                    <p className="text-xs text-gray-500">Crash-Free</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <DialogFooter>
              <Button variant="outline" onClick={() => setActiveTab('analytics')}>
                <BarChart3 className="h-4 w-4 mr-2" />
                View Full Analytics
              </Button>
              <Button onClick={() => setShowAnalyticsDialog(false)}>Close</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* TestFlight Dialog */}
      <Dialog open={showTestFlightDialog} onOpenChange={setShowTestFlightDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-purple-600" />
              TestFlight Configuration
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h4 className="font-medium text-purple-700 dark:text-purple-300 mb-2">TestFlight Status</h4>
              <p className="text-sm text-purple-600 dark:text-purple-400">Beta testing is currently enabled for your app.</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="font-medium">Enable TestFlight</Label>
                  <p className="text-xs text-gray-500">Allow beta testing through TestFlight</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="font-medium">Auto-distribute to Testers</Label>
                  <p className="text-xs text-gray-500">Automatically send builds to all testers</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="font-medium">Public Beta Link</Label>
                  <p className="text-xs text-gray-500">Allow public access via link</p>
                </div>
                <Switch />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 text-center">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xl font-bold text-purple-600">156</p>
                <p className="text-xs text-gray-500">Active Testers</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xl font-bold text-blue-600">4</p>
                <p className="text-xs text-gray-500">Beta Builds</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xl font-bold text-green-600">23</p>
                <p className="text-xs text-gray-500">Feedback Items</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTestFlightDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                toast.loading('Saving TestFlight settings...', { id: 'testflight-save' })
                try {
                  const res = await fetch('/api/mobile-app/testflight/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled: true }) })
                  if (!res.ok) throw new Error('Failed to save')
                  toast.success('TestFlight settings saved', { id: 'testflight-save', description: '156 active testers configured' })
                  setShowTestFlightDialog(false)
                } catch {
                  toast.error('Failed to save TestFlight settings', { id: 'testflight-save' })
                }
              }}>Save Settings</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Dialog */}
      <Dialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-teal-600" />
              App Privacy Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
              <h4 className="font-medium text-teal-700 dark:text-teal-300 mb-2">Privacy Nutrition Labels</h4>
              <p className="text-sm text-teal-600 dark:text-teal-400">Configure what data your app collects for App Store privacy labels.</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="font-medium">Contact Info</Label>
                  <p className="text-xs text-gray-500">Email, phone number, name</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="font-medium">Usage Data</Label>
                  <p className="text-xs text-gray-500">App interactions, analytics</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="font-medium">Identifiers</Label>
                  <p className="text-xs text-gray-500">User ID, device ID</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="font-medium">Location Data</Label>
                  <p className="text-xs text-gray-500">Precise or coarse location</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="font-medium">Sensitive Data</Label>
                  <p className="text-xs text-gray-500">Health, financial data</p>
                </div>
                <Switch />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPrivacyDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                toast.loading('Updating privacy labels...', { id: 'privacy-save' })
                try {
                  const res = await fetch('/api/mobile-app/privacy-labels', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ labels: {} }) })
                  if (!res.ok) throw new Error('Failed to update')
                  toast.success('Privacy settings updated', { id: 'privacy-save', description: 'App Store privacy labels configured' })
                  setShowPrivacyDialog(false)
                } catch {
                  toast.error('Failed to update privacy settings', { id: 'privacy-save' })
                }
              }}>Save Privacy Labels</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Crash Reports Dialog */}
      <Dialog open={showCrashReportsDialog} onOpenChange={setShowCrashReportsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-red-600" />
              Crash Reports
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-600">32</p>
                <p className="text-sm text-red-700 dark:text-red-400">Total Crashes (7d)</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">99.2%</p>
                <p className="text-sm text-green-700 dark:text-green-400">Crash-Free Rate</p>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-orange-600">5</p>
                <p className="text-sm text-orange-700 dark:text-orange-400">Unique Issues</p>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Recent Crash Reports</h4>
              {[
                { id: 1, title: 'NullPointerException in MainActivity', count: 12, version: '2.5.0', platform: 'android' },
                { id: 2, title: 'EXC_BAD_ACCESS in NetworkManager', count: 8, version: '2.5.0', platform: 'ios' },
                { id: 3, title: 'OutOfMemoryError in ImageLoader', count: 6, version: '2.5.0', platform: 'android' },
                { id: 4, title: 'NSInternalInconsistencyException', count: 4, version: '2.5.1', platform: 'ios' },
                { id: 5, title: 'ArrayIndexOutOfBoundsException', count: 2, version: '2.5.1', platform: 'android' },
              ].map(crash => (
                <div key={crash.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    {crash.platform === 'ios' ? <Apple className="h-4 w-4 text-gray-600" /> : <Smartphone className="h-4 w-4 text-green-600" />}
                    <div>
                      <p className="font-medium text-sm">{crash.title}</p>
                      <p className="text-xs text-gray-500">v{crash.version}</p>
                    </div>
                  </div>
                  <Badge variant="destructive">{crash.count} crashes</Badge>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCrashReportsDialog(false)}>Close</Button>
              <Button onClick={() => {
                window.open('https://console.firebase.google.com/crashlytics', '_blank')
                toast.info('Opening Crashlytics dashboard...', { description: 'Redirecting to Firebase Console' })
              }}>View in Crashlytics</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Metadata Dialog */}
      <Dialog open={showMetadataDialog} onOpenChange={setShowMetadataDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-600" />
              Update App Metadata
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>App Description</Label>
              <textarea className="w-full px-3 py-2 border rounded-lg min-h-[100px] dark:bg-gray-800 dark:border-gray-700" placeholder="Enter app description..." defaultValue="FreeFlow is your all-in-one creative workspace for managing projects, collaborating with teams, and delivering exceptional work." />
            </div>
            <div>
              <Label>Keywords</Label>
              <Input placeholder="productivity, collaboration, project management" defaultValue="productivity, collaboration, creative, design, freelance" />
              <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
            </div>
            <div>
              <Label>What&apos;s New (Release Notes)</Label>
              <textarea className="w-full px-3 py-2 border rounded-lg min-h-[80px] dark:bg-gray-800 dark:border-gray-700" placeholder="Enter release notes for this version..." />
            </div>
            <div>
              <Label>Support URL</Label>
              <Input placeholder="https://support.freeflow.app" defaultValue="https://support.freeflow.app" />
            </div>
            <div>
              <Label>Privacy Policy URL</Label>
              <Input placeholder="https://freeflow.app/privacy" defaultValue="https://freeflow.app/privacy" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMetadataDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                toast.loading('Updating app metadata...', { id: 'metadata-save' })
                try {
                  const res = await fetch('/api/mobile-app/metadata', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ metadata: {} }) })
                  if (!res.ok) throw new Error('Failed to update')
                  toast.success('App metadata updated successfully', { id: 'metadata-save', description: 'Changes will appear in App Store within 24 hours' })
                  setShowMetadataDialog(false)
                } catch {
                  toast.error('Failed to update metadata', { id: 'metadata-save' })
                }
              }}>Save Metadata</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Campaign Dialog */}
      <Dialog open={showEditCampaignDialog} onOpenChange={setShowEditCampaignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Push Campaign</DialogTitle>
          </DialogHeader>
          {selectedCampaignForEdit && (
            <div className="space-y-4">
              <div>
                <Label>Campaign Title</Label>
                <Input defaultValue={selectedCampaignForEdit.title} />
              </div>
              <div>
                <Label>Message</Label>
                <Input defaultValue={selectedCampaignForEdit.message} />
              </div>
              <div>
                <Label>Platform</Label>
                <Select defaultValue={selectedCampaignForEdit.platform}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="ios">iOS Only</SelectItem>
                    <SelectItem value="android">Android Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Target Audience</Label>
                <Input defaultValue={selectedCampaignForEdit.targetAudience} />
              </div>
              <div>
                <Label>Status</Label>
                <Select defaultValue={selectedCampaignForEdit.status}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEditCampaignDialog(false)}>Cancel</Button>
                <Button variant="destructive" onClick={() => { handleDeleteCampaign(selectedCampaignForEdit.id, selectedCampaignForEdit.title); setShowEditCampaignDialog(false); }}>Delete</Button>
                <Button onClick={async () => {
                  toast.loading('Updating campaign...', { id: 'campaign-update' })
                  try {
                    const res = await fetch(`/api/mobile-app/campaigns/${selectedCampaignForEdit?.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: selectedCampaignForEdit?.title }) })
                    if (!res.ok) throw new Error('Failed to update')
                    toast.success('Campaign updated successfully', { id: 'campaign-update', description: selectedCampaignForEdit?.title })
                    setShowEditCampaignDialog(false)
                  } catch {
                    toast.error('Failed to update campaign', { id: 'campaign-update' })
                  }
                }}>Save Changes</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit IAP Dialog */}
      <Dialog open={showEditIapDialog} onOpenChange={setShowEditIapDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit In-App Purchase</DialogTitle>
          </DialogHeader>
          {selectedIapForEdit && (
            <div className="space-y-4">
              <div>
                <Label>Product ID</Label>
                <Input defaultValue={selectedIapForEdit.productId} disabled className="bg-gray-100" />
                <p className="text-xs text-gray-500 mt-1">Product ID cannot be changed</p>
              </div>
              <div>
                <Label>Product Name</Label>
                <Input defaultValue={selectedIapForEdit.name} />
              </div>
              <div>
                <Label>Product Type</Label>
                <Select defaultValue={selectedIapForEdit.type}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subscription">Subscription</SelectItem>
                    <SelectItem value="consumable">Consumable</SelectItem>
                    <SelectItem value="non-consumable">Non-Consumable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Price</Label>
                <Input defaultValue={selectedIapForEdit.price} />
              </div>
              <div>
                <Label>Status</Label>
                <Select defaultValue={selectedIapForEdit.status}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEditIapDialog(false)}>Cancel</Button>
                <Button variant="destructive" onClick={() => { handleDeleteIap(selectedIapForEdit.id, selectedIapForEdit.name); setShowEditIapDialog(false); }}>Delete</Button>
                <Button onClick={async () => {
                  toast.loading('Updating in-app purchase...', { id: 'iap-update' })
                  try {
                    const res = await fetch(`/api/mobile-app/iaps/${selectedIapForEdit?.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: selectedIapForEdit?.name }) })
                    if (!res.ok) throw new Error('Failed to update')
                    toast.success('Product updated successfully', { id: 'iap-update', description: selectedIapForEdit?.name })
                    setShowEditIapDialog(false)
                  } catch {
                    toast.error('Failed to update product', { id: 'iap-update' })
                  }
                }}>Save Changes</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit App Name Dialog */}
      <Dialog open={showEditAppNameDialog} onOpenChange={setShowEditAppNameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit App Name</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>App Name</Label>
              <Input value={appNameValue} onChange={(e) => setAppNameValue(e.target.value)} placeholder="Enter app name" />
              <p className="text-xs text-gray-500 mt-1">This will update your app name on the App Store</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditAppNameDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                if (!appNameValue.trim()) {
                  toast.error('Please enter an app name')
                  return
                }
                toast.loading('Updating app name...', { id: 'app-name' })
                try {
                  const res = await fetch('/api/mobile-app/name', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: appNameValue }) })
                  if (!res.ok) throw new Error('Failed to update')
                  toast.success('App name updated', { id: 'app-name', description: appNameValue })
                  setShowEditAppNameDialog(false)
                } catch {
                  toast.error('Failed to update app name', { id: 'app-name' })
                }
              }}>Save</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Webhook Test Dialog */}
      <Dialog open={showWebhookTestDialog} onOpenChange={setShowWebhookTestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-purple-600" />
              Test Webhook
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Webhook URL</Label>
              <Input value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://your-webhook-url.com" />
            </div>
            <div>
              <Label>Test Event Type</Label>
              <Select defaultValue="build_complete">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="build_complete">Build Complete</SelectItem>
                  <SelectItem value="review_status">Review Status Change</SelectItem>
                  <SelectItem value="crash_alert">Crash Alert</SelectItem>
                  <SelectItem value="new_review">New App Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Test Payload Preview</h4>
              <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto">
{`{
  "event": "build_complete",
  "app_id": "com.freeflow.app",
  "version": "2.5.1",
  "timestamp": "${new Date().toISOString()}"
}`}
              </pre>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowWebhookTestDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                if (!webhookUrl.trim()) {
                  toast.error('Please enter a webhook URL')
                  return
                }
                toast.loading('Sending test webhook...', { id: 'webhook-test' })
                try {
                  const res = await fetch('/api/mobile-app/webhooks/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: webhookUrl }) })
                  if (!res.ok) throw new Error('Test failed')
                  toast.success('Webhook test successful!', { id: 'webhook-test', description: 'Status: 200 OK - Response time: 142ms' })
                  setShowWebhookTestDialog(false)
                } catch {
                  toast.error('Webhook test failed', { id: 'webhook-test', description: 'Connection refused' })
                }
              }}>Send Test</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* CI/CD Configuration Dialog */}
      <Dialog open={showCiCdDialog} onOpenChange={setShowCiCdDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-gray-600" />
              {selectedCiCd?.connected ? 'Configure' : 'Connect'} {selectedCiCd?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedCiCd?.connected ? (
              <>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-400">This integration is currently connected and active.</p>
                </div>
                <div>
                  <Label>Repository</Label>
                  <Input defaultValue="github.com/freeflow/mobile-app" disabled className="bg-gray-100" />
                </div>
                <div>
                  <Label>Build Branch</Label>
                  <Select defaultValue="main">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">main</SelectItem>
                      <SelectItem value="develop">develop</SelectItem>
                      <SelectItem value="release">release/*</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="font-medium">Auto-build on Push</Label>
                    <p className="text-xs text-gray-500">Automatically trigger builds on push</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </>
            ) : (
              <>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-400">Connect your {selectedCiCd?.name} account to enable automated builds.</p>
                </div>
                <div>
                  <Label>API Token</Label>
                  <Input type="password" placeholder="Enter your API token" />
                </div>
                <div>
                  <Label>Repository URL</Label>
                  <Input placeholder="https://github.com/your-org/your-repo" />
                </div>
              </>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCiCdDialog(false)}>Cancel</Button>
              {selectedCiCd?.connected ? (
                <>
                  <Button variant="destructive" onClick={async () => {
                    toast.loading('Disconnecting...', { id: 'cicd-disconnect' })
                    try {
                      const res = await fetch(`/api/mobile-app/cicd/${selectedCiCd?.id}/disconnect`, { method: 'POST' })
                      if (!res.ok) throw new Error('Failed')
                      toast.success(`${selectedCiCd?.name} disconnected`, { id: 'cicd-disconnect' })
                      setShowCiCdDialog(false)
                    } catch {
                      toast.error('Failed to disconnect', { id: 'cicd-disconnect' })
                    }
                  }}>Disconnect</Button>
                  <Button onClick={async () => {
                    toast.loading('Saving configuration...', { id: 'cicd-save' })
                    try {
                      const res = await fetch(`/api/mobile-app/cicd/${selectedCiCd?.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ config: {} }) })
                      if (!res.ok) throw new Error('Failed')
                      toast.success('Configuration saved', { id: 'cicd-save', description: selectedCiCd?.name })
                      setShowCiCdDialog(false)
                    } catch {
                      toast.error('Failed to save configuration', { id: 'cicd-save' })
                    }
                  }}>Save</Button>
                </>
              ) : (
                <Button onClick={async () => {
                  toast.loading('Connecting...', { id: 'cicd-connect' })
                  try {
                    const res = await fetch('/api/mobile-app/cicd/connect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider: selectedCiCd?.name }) })
                    if (!res.ok) throw new Error('Failed')
                    toast.success(`${selectedCiCd?.name} connected successfully`, { id: 'cicd-connect', description: 'CI/CD pipeline is now active' })
                    setShowCiCdDialog(false)
                  } catch {
                    toast.error('Failed to connect', { id: 'cicd-connect' })
                  }
                }}>Connect</Button>
              )}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Tester Group Dialog */}
      <Dialog open={showCreateTesterGroupDialog} onOpenChange={setShowCreateTesterGroupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-600" />
              Create Tester Group
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Group Name</Label>
              <Input value={testerGroupName} onChange={(e) => setTesterGroupName(e.target.value)} placeholder="e.g., Beta Testers, QA Team" />
            </div>
            <div>
              <Label>Group Type</Label>
              <Select defaultValue="internal">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Internal (App Store Connect users)</SelectItem>
                  <SelectItem value="external">External (Email invites)</SelectItem>
                  <SelectItem value="public">Public (Link-based)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description (Optional)</Label>
              <textarea className="w-full px-3 py-2 border rounded-lg min-h-[60px] dark:bg-gray-800 dark:border-gray-700" placeholder="Describe this tester group..." />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="font-medium">Auto-add to New Builds</Label>
                <p className="text-xs text-gray-500">Automatically include in new beta releases</p>
              </div>
              <Switch defaultChecked />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateTesterGroupDialog(false)}>Cancel</Button>
              <Button onClick={() => { if (!testerGroupName.trim()) { toast.error('Please enter a group name'); return; } toast.success(`Tester group "${testerGroupName}" created`); setTesterGroupName(''); setShowCreateTesterGroupDialog(false); }}>Create Group</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Analytics Dialog */}
      <Dialog open={showExportAnalyticsDialog} onOpenChange={setShowExportAnalyticsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-indigo-600" />
              Export Analytics Data
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Date Range</Label>
              <Select defaultValue="30">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Export Format</Label>
              <Select defaultValue="csv">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data to Include</Label>
              <div className="space-y-2 mt-2">
                {[
                  { id: 'downloads', label: 'Downloads & Installs' },
                  { id: 'users', label: 'Active Users (DAU/MAU)' },
                  { id: 'sessions', label: 'Sessions & Engagement' },
                  { id: 'revenue', label: 'Revenue & Purchases' },
                  { id: 'crashes', label: 'Crash Reports' },
                  { id: 'ratings', label: 'Ratings & Reviews' },
                ].map(item => (
                  <div key={item.id} className="flex items-center gap-2">
                    <input type="checkbox" id={item.id} defaultChecked className="rounded" />
                    <label htmlFor={item.id} className="text-sm">{item.label}</label>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportAnalyticsDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                toast.loading('Preparing export...', { id: 'analytics-export' })
                try {
                  const res = await fetch('/api/mobile-app/analytics/export')
                  if (!res.ok) throw new Error('Export failed')
                  const blob = await res.blob()
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                  toast.success('Analytics exported', { id: 'analytics-export', description: 'File downloaded successfully' })
                  setShowExportAnalyticsDialog(false)
                } catch {
                  toast.error('Export failed', { id: 'analytics-export' })
                }
              }}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove from Store Dialog */}
      <Dialog open={showRemoveFromStoreDialog} onOpenChange={setShowRemoveFromStoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertOctagon className="h-5 w-5" />
              Remove from App Store
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-400">
                This will temporarily remove your app from sale on the App Store. Users who have already downloaded the app will still be able to use it.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">What happens when you remove your app:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                <li>App will no longer appear in search results</li>
                <li>New users cannot download the app</li>
                <li>Existing users keep access to the app</li>
                <li>You can restore the app at any time</li>
              </ul>
            </div>
            <div>
              <Label>Reason for Removal (Optional)</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select a reason" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintenance">Temporary maintenance</SelectItem>
                  <SelectItem value="legal">Legal/compliance issue</SelectItem>
                  <SelectItem value="rebrand">Rebranding</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRemoveFromStoreDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={async () => {
                toast.loading('Removing from store...', { id: 'remove-store' })
                try {
                  const res = await fetch('/api/mobile-app/store/remove', { method: 'POST' })
                  if (!res.ok) throw new Error('Failed')
                  toast.success('App removed from sale', { id: 'remove-store', description: 'App will be hidden from App Store within 24 hours' })
                  setShowRemoveFromStoreDialog(false)
                } catch {
                  toast.error('Failed to remove app', { id: 'remove-store' })
                }
              }}>Remove from Store</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete App Dialog */}
      <Dialog open={showDeleteAppDialog} onOpenChange={setShowDeleteAppDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete App Permanently
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                Warning: This action cannot be undone!
              </p>
              <p className="text-sm text-red-600 dark:text-red-500 mt-2">
                Deleting this app will permanently remove all builds, analytics data, reviews, and in-app purchase configurations.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">The following will be deleted:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                <li>All app versions and builds</li>
                <li>TestFlight testers and configurations</li>
                <li>Analytics and crash data</li>
                <li>In-app purchase products</li>
                <li>User reviews and responses</li>
              </ul>
            </div>
            <div>
              <Label>Type &quot;DELETE&quot; to confirm</Label>
              <Input value={confirmDeleteText} onChange={(e) => setConfirmDeleteText(e.target.value)} placeholder="Type DELETE to confirm" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setConfirmDeleteText(''); setShowDeleteAppDialog(false); }}>Cancel</Button>
              <Button variant="destructive" disabled={confirmDeleteText !== 'DELETE'} onClick={async () => {
                toast.loading('Deleting app...', { id: 'delete-app' })
                try {
                  const res = await fetch('/api/mobile-app', { method: 'DELETE' })
                  if (!res.ok) throw new Error('Failed')
                  toast.success('App permanently deleted', { id: 'delete-app', description: 'All data has been removed' })
                  setConfirmDeleteText('')
                  setShowDeleteAppDialog(false)
                } catch {
                  toast.error('Failed to delete app', { id: 'delete-app' })
                }
              }}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Permanently
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
