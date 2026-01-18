'use client'

import { createClient } from '@/lib/supabase/client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
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

// mockMobileAppQuickActions is now defined inside the component to access state setters

export default function MobileAppClient({ initialFeatures, initialVersions, initialStats }: MobileAppClientProps) {
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

  // Quick Action Dialog states
  const [showNewBuildDialog, setShowNewBuildDialog] = useState(false)
  const [showSubmitReviewDialog, setShowSubmitReviewDialog] = useState(false)
  const [showViewAnalyticsDialog, setShowViewAnalyticsDialog] = useState(false)
  const [showUploadBuildDialog, setShowUploadBuildDialog] = useState(false)
  const [showSendPushDialog, setShowSendPushDialog] = useState(false)
  const [showCrashReportsDialog, setShowCrashReportsDialog] = useState(false)
  const [showUpdateMetadataDialog, setShowUpdateMetadataDialog] = useState(false)

  // Edit Dialog states
  const [showEditCampaignDialog, setShowEditCampaignDialog] = useState(false)
  const [showEditIapDialog, setShowEditIapDialog] = useState(false)
  const [showEditAppNameDialog, setShowEditAppNameDialog] = useState(false)
  const [showCreateTesterGroupDialog, setShowCreateTesterGroupDialog] = useState(false)
  const [showCiCdConfigDialog, setShowCiCdConfigDialog] = useState(false)
  const [showRemoveAppDialog, setShowRemoveAppDialog] = useState(false)
  const [showDeleteAppDialog, setShowDeleteAppDialog] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<PushCampaign | null>(null)
  const [selectedIap, setSelectedIap] = useState<InAppPurchase | null>(null)
  const [selectedCiCd, setSelectedCiCd] = useState<{ name: string; connected: boolean } | null>(null)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [newTesterGroupName, setNewTesterGroupName] = useState('')

  // Quick Action form states
  const [submitReviewForm, setSubmitReviewForm] = useState({ buildId: '', notes: '' })
  const [pushNotificationForm, setPushNotificationForm] = useState({ title: '', message: '', targetAudience: 'all' })
  const [metadataForm, setMetadataForm] = useState({ appName: 'FreeFlow Mobile', description: '', keywords: '', category: 'productivity' })

  // Quick Actions array (defined inside component to access state setters)
  const mobileAppQuickActions = [
    { id: '1', label: 'New Build', icon: 'plus', action: () => setShowNewBuildDialog(true), variant: 'default' as const },
    { id: '2', label: 'Submit Review', icon: 'send', action: () => setShowSubmitReviewDialog(true), variant: 'default' as const },
    { id: '3', label: 'View Analytics', icon: 'chart', action: () => setShowViewAnalyticsDialog(true), variant: 'outline' as const },
  ]

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
      toast.error('Missing required fields')
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
      toast.success(`Build created`, { description: `Version ${buildForm.version} is being processed` })
      setBuildForm({ version: '', buildNumber: '', platform: 'ios', releaseType: 'beta' })
      setShowCreateBuildModal(false)
    } catch (err: any) {
      toast.error('Failed to create build')
    } finally { setIsLoading(false) }
  }

  const handleSubmitToStore = async (buildId: string, platform: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from('mobile_app_builds').update({ status: 'submitted', submitted_at: new Date().toISOString() }).eq('id', buildId)
      if (error) throw error
      toast.success(`Submitted to store`, { description: `Build submitted for review` })
    } catch (err: any) {
      toast.error('Submission failed')
    } finally { setIsLoading(false) }
  }

  const handleDownloadBuild = async (buildId: string, buildVersion: string) => {
    toast.success(`Downloading build`, { description: `Version ${buildVersion} download starting...` })
    // Log download event
    try {
      await supabase.from('mobile_app_downloads').insert({ build_id: buildId, user_id: userId, downloaded_at: new Date().toISOString() })
    } catch { /* ignore logging errors */ }
  }

  const handleDeleteBuild = async (buildId: string, buildVersion: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from('mobile_app_builds').delete().eq('id', buildId)
      if (error) throw error
      toast.success(`Build deleted`, { description: `Version ${buildVersion} has been removed` })
      setSelectedBuild(null)
      setShowBuildDialog(false)
    } catch (err: any) {
      toast.error('Delete failed')
    } finally { setIsLoading(false) }
  }

  const handleReplyToReview = async () => {
    if (!selectedReview || !responseText.trim()) {
      toast.error('Missing response')
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
      toast.success(`Reply sent`, { description: `Response posted successfully` })
      setResponseText('')
      setShowReviewDialog(false)
    } catch (err: any) {
      toast.error('Reply failed')
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
      toast.info('Review reported')
    } catch (err: any) {
      toast.error('Report failed')
    } finally { setIsLoading(false) }
  }

  const handleCreateCampaign = async () => {
    if (!userId || !campaignForm.title.trim()) {
      toast.error('Missing required fields')
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
      toast.success(`Campaign created`, { description: `"${campaignForm.title}" is ready to schedule` })
      setCampaignForm({ title: '', message: '', platform: 'all', targetAudience: '' })
      setShowCreateCampaignModal(false)
    } catch (err: any) {
      toast.error('Failed to create campaign')
    } finally { setIsLoading(false) }
  }

  const handleSendCampaign = async (campaignId: string, campaignTitle: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from('mobile_app_push_campaigns').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', campaignId)
      if (error) throw error
      toast.success(`Campaign sent`, { description: `"${campaignTitle}" has been sent` })
    } catch (err: any) {
      toast.error('Send failed')
    } finally { setIsLoading(false) }
  }

  const handleDeleteCampaign = async (campaignId: string, campaignTitle: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from('mobile_app_push_campaigns').delete().eq('id', campaignId)
      if (error) throw error
      toast.success(`Campaign deleted`, { description: `"${campaignTitle}" has been removed` })
    } catch (err: any) {
      toast.error('Delete failed')
    } finally { setIsLoading(false) }
  }

  const handleCreateIap = async () => {
    if (!userId || !iapForm.productId.trim()) {
      toast.error('Missing required fields')
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
      toast.success(`Product created`, { description: `"${iapForm.name}" is pending approval` })
      setIapForm({ productId: '', name: '', type: 'subscription', price: '' })
      setShowCreateIapModal(false)
    } catch (err: any) {
      toast.error('Failed to create product')
    } finally { setIsLoading(false) }
  }

  const handleDeleteIap = async (iapId: string, iapName: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from('mobile_app_iaps').delete().eq('id', iapId)
      if (error) throw error
      toast.success(`Product deleted`, { description: `"${iapName}" has been removed` })
    } catch (err: any) {
      toast.error('Delete failed')
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
      toast.success(`Settings saved`, { description: `${section} settings have been updated` })
    } catch (err: any) {
      toast.error('Save failed')
    } finally { setIsLoading(false) }
  }

  const handleRefreshData = useCallback(() => {
    toast.success('Data refreshed')
  }, [])

  // Edit Campaign Handler
  const handleEditCampaign = (campaign: PushCampaign) => {
    setSelectedCampaign(campaign)
    setCampaignForm({
      title: campaign.title,
      message: campaign.message,
      platform: campaign.platform,
      targetAudience: campaign.targetAudience
    })
    setShowEditCampaignDialog(true)
  }

  const handleSaveEditCampaign = async () => {
    if (!selectedCampaign || !campaignForm.title.trim()) {
      toast.error('Missing required fields')
      return
    }
    setIsLoading(true)
    try {
      const { error } = await supabase.from('mobile_app_push_campaigns').update({
        title: campaignForm.title,
        message: campaignForm.message,
        platform: campaignForm.platform,
        target_audience: campaignForm.targetAudience
      }).eq('id', selectedCampaign.id)
      if (error) throw error
      toast.success('Campaign updated', { description: campaignForm.title + ' has been saved' })
      setShowEditCampaignDialog(false)
      setSelectedCampaign(null)
    } catch (err: any) {
      toast.error('Update failed')
    } finally { setIsLoading(false) }
  }

  // Edit IAP Handler
  const handleEditIap = (iap: InAppPurchase) => {
    setSelectedIap(iap)
    setIapForm({
      productId: iap.productId,
      name: iap.name,
      type: iap.type,
      price: iap.price
    })
    setShowEditIapDialog(true)
  }

  const handleSaveEditIap = async () => {
    if (!selectedIap || !iapForm.productId.trim()) {
      toast.error('Missing required fields')
      return
    }
    setIsLoading(true)
    try {
      const { error } = await supabase.from('mobile_app_iaps').update({
        product_id: iapForm.productId,
        name: iapForm.name,
        type: iapForm.type,
        price: iapForm.price
      }).eq('id', selectedIap.id)
      if (error) throw error
      toast.success('Product updated', { description: iapForm.name + ' has been saved' })
      setShowEditIapDialog(false)
      setSelectedIap(null)
    } catch (err: any) {
      toast.error('Update failed')
    } finally { setIsLoading(false) }
  }

  // Copy handlers
  const handleCopyBundleId = async () => {
    try {
      await navigator.clipboard.writeText('com.freeflow.app')
      toast.success('Copied!')
    } catch {
      toast.error('Failed to copy')
    }
  }

  const handleCopyApiKey = async () => {
    try {
      await navigator.clipboard.writeText('asc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
      toast.success('Copied!')
    } catch {
      toast.error('Failed to copy')
    }
  }

  // Regenerate API Key
  const handleRegenerateApiKey = async () => {
    setIsLoading(true)
    try {
      const newKey = `asc_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
      const { error } = await supabase.from('mobile_app_settings').upsert({
        user_id: userId,
        section: 'api_key',
        value: newKey,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,section' })
      if (error) throw error
      toast.success('API key regenerated')
    } catch (err: any) {
      toast.error('Failed to regenerate')
    } finally { setIsLoading(false) }
  }

  // Test Webhook - Actually sends a test payload to the webhook URL
  const handleTestWebhook = async (webhookUrl: string) => {
    if (!webhookUrl.trim()) {
      toast.error('Enter webhook URL')
      return
    }
    setIsLoading(true)
    try {
      await toast.promise(
        fetch('/api/webhooks/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            webhookUrl,
            payload: {
              event: 'test',
              timestamp: new Date().toISOString(),
              app: 'mobile-app',
              message: 'Test webhook from Kazi Mobile App'
            }
          })
        }).then(async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            throw new Error(data.error || 'Webhook delivery failed')
          }
          return res.json()
        }),
        {
          loading: 'Testing webhook...',
          success: 'Webhook test successful! Payload delivered.',
          error: (err) => `Webhook test failed: ${err.message}`
        }
      )
    } finally { setIsLoading(false) }
  }

  // CI/CD Integration
  const handleCiCdAction = (cicd: { name: string; connected: boolean }) => {
    setSelectedCiCd(cicd)
    setShowCiCdConfigDialog(true)
  }

  const handleSaveCiCdConfig = async () => {
    if (!selectedCiCd) return
    setIsLoading(true)
    try {
      const { error } = await supabase.from('mobile_app_cicd_integrations').upsert({
        user_id: userId,
        provider: selectedCiCd.name,
        connected: true,
        configured_at: new Date().toISOString()
      }, { onConflict: 'user_id,provider' })
      if (error) throw error
      toast.success(`${selectedCiCd.name} ${selectedCiCd.connected ? 'configured' : 'connected'}`)
      setShowCiCdConfigDialog(false)
      setSelectedCiCd(null)
    } catch (err: any) {
      toast.error('Action failed')
    } finally { setIsLoading(false) }
  }

  // Create Tester Group
  const handleCreateTesterGroup = async (groupName: string) => {
    if (!groupName.trim()) {
      toast.error('Enter group name')
      return
    }
    setIsLoading(true)
    try {
      const { error } = await supabase.from('mobile_app_tester_groups').insert({
        user_id: userId,
        name: groupName,
        testers: 0,
        active: true,
        created_at: new Date().toISOString()
      })
      if (error) throw error
      toast.success('Group created', { description: groupName + ' is ready for testers' })
      setShowCreateTesterGroupDialog(false)
    } catch (err: any) {
      toast.error('Failed to create group')
    } finally { setIsLoading(false) }
  }

  // Export Analytics - Exports real analytics data to CSV
  const handleExportAnalytics = async () => {
    await toast.promise(
      (async () => {
        // Fetch analytics data from Supabase
        const { data: analytics, error } = await supabase
          .from('mobile_app_analytics')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error

        // Create CSV content
        const headers = ['Date', 'Downloads', 'Active Users', 'Sessions', 'Revenue', 'Crash Rate', 'Rating']
        const rows = (analytics || []).map(a => [
          new Date(a.created_at).toLocaleDateString(),
          a.downloads || 0,
          a.active_users || 0,
          a.sessions || 0,
          a.revenue || 0,
          a.crash_rate || 0,
          a.rating || 0
        ])

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

        // Download as CSV
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `mobile-app-analytics-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      })(),
      {
        loading: 'Preparing analytics export...',
        success: 'Analytics exported! Check your downloads folder.',
        error: 'Export failed'
      }
    )
  }

  // View Reports
  const handleViewReports = () => {
    setActiveTab('overview')
    toast.info('Analytics reports')
  }

  // Remove from App Store
  const handleRemoveFromStore = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from('mobile_app_settings').upsert({
        user_id: userId,
        section: 'store_availability',
        value: 'removed',
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,section' })
      if (error) throw error
      toast.success('App removed from store')
      setShowRemoveAppDialog(false)
    } catch (err: any) {
      toast.error('Failed to remove')
    } finally { setIsLoading(false) }
  }

  // Delete App
  const handleDeleteApp = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from('mobile_apps').delete().eq('user_id', userId)
      if (error) throw error
      toast.success('App deleted')
      setShowDeleteAppDialog(false)
    } catch (err: any) {
      toast.error('Delete failed')
    } finally { setIsLoading(false) }
  }

  // Submit for Review (in Build dialog)
  const handleSubmitBuildForReview = async () => {
    if (!selectedBuild) return
    await handleSubmitToStore(selectedBuild.id, selectedBuild.platform)
  }

  // Release to App Store (in Build dialog)
  const handleReleaseBuild = async () => {
    if (!selectedBuild) return
    setIsLoading(true)
    try {
      const { error } = await supabase.from('mobile_app_builds').update({
        status: 'released',
        released_at: new Date().toISOString()
      }).eq('id', selectedBuild.id)
      if (error) throw error
      toast.success(`Released!`, { description: `Version ${selectedBuild.version} is now live on ${selectedBuild.platform === 'ios' ? 'App Store' : 'Play Store'}` })
      setShowBuildDialog(false)
    } catch (err: any) {
      toast.error('Release failed')
    } finally { setIsLoading(false) }
  }

  // View Crashes (in Build dialog)
  const handleViewCrashes = () => {
    if (!selectedBuild) return
    setShowCrashReportsDialog(true)
    setShowBuildDialog(false)
  }

  // Edit App Name
  const handleEditAppName = () => {
    setShowEditAppNameDialog(true)
  }

  const handleSaveAppName = async (newName: string) => {
    if (!newName.trim()) {
      toast.error('Enter app name')
      return
    }
    setIsLoading(true)
    try {
      const { error } = await supabase.from('mobile_app_settings').upsert({
        user_id: userId,
        section: 'app_name',
        value: newName,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,section' })
      if (error) throw error
      toast.success('App name updated', { description: 'Name changed to ' + newName })
      setShowEditAppNameDialog(false)
    } catch (err: any) {
      toast.error('Update failed')
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
                { icon: Upload, label: 'Submit', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', onClick: () => setShowSubmitReviewDialog(true) },
                { icon: Smartphone, label: 'TestFlight', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => setShowNewBuildDialog(true) },
                { icon: Star, label: 'Reviews', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: () => setActiveTab('reviews') },
                { icon: BarChart3, label: 'Analytics', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => setShowViewAnalyticsDialog(true) },
                { icon: Bell, label: 'Push', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => setShowSendPushDialog(true) },
                { icon: Key, label: 'In-App', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: () => setActiveTab('iap') },
                { icon: Shield, label: 'Privacy', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => { setActiveTab('settings'); setSettingsTab('advanced'); } },
                { icon: Settings, label: 'Settings', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', onClick: () => setActiveTab('settings') },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
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
                      { label: 'Upload New Build', icon: Upload, color: 'text-indigo-600', onClick: () => setShowUploadBuildDialog(true) },
                      { label: 'Send Push Notification', icon: Bell, color: 'text-blue-600', onClick: () => setShowSendPushDialog(true) },
                      { label: 'View Crash Reports', icon: Bug, color: 'text-red-600', onClick: () => setShowCrashReportsDialog(true) },
                      { label: 'Update App Metadata', icon: Settings, color: 'text-gray-600', onClick: () => setShowUpdateMetadataDialog(true) },
                    ].map((action, i) => (
                      <button key={i} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-left" onClick={action.onClick}>
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
                            <Button variant="outline" size="sm" onClick={() => handleEditCampaign(campaign)}>Edit</Button>
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
                          <Button variant="outline" size="sm" onClick={() => handleEditIap(iap)}>Edit</Button>
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
                            <p className="text-sm text-gray-500 dark:text-gray-400">FreeFlow Mobile</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={handleEditAppName}>Edit</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label className="text-gray-900 dark:text-white font-medium">Bundle ID</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">com.freeflow.app</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={handleCopyBundleId}>
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
                            <Input
                              placeholder="https://your-webhook-url.com"
                              className="flex-1"
                              value={webhookUrl}
                              onChange={(e) => setWebhookUrl(e.target.value)}
                            />
                            <Button variant="outline" onClick={() => handleTestWebhook(webhookUrl)}>Test</Button>
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
                            <Button variant="outline" size="sm" onClick={handleCopyApiKey}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                          </div>
                          <code className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded block font-mono">
                            asc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                          </code>
                        </div>
                        <Button variant="outline" className="w-full" onClick={handleRegenerateApiKey} disabled={isLoading}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          {isLoading ? 'Regenerating...' : 'Regenerate API Key'}
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
                              <Button variant={ci.connected ? 'outline' : 'default'} size="sm" onClick={() => handleCiCdAction(ci)}>
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
                          <Button variant="outline" className="flex-1" onClick={handleExportAnalytics}>
                            <Download className="h-4 w-4 mr-2" />
                            Export Analytics
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={handleViewReports}>
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
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20" onClick={() => setShowRemoveAppDialog(true)}>
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
              onInsightAction={(insight) => toast.info(insight.title)}
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
            actions={mobileAppQuickActions}
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
                    <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={handleSubmitBuildForReview} disabled={isLoading}>
                      <Send className="h-4 w-4 mr-2" />
                      {isLoading ? 'Submitting...' : 'Submit for Review'}
                    </Button>
                  )}
                  {selectedBuild.status === 'approved' && (
                    <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleReleaseBuild} disabled={isLoading}>
                      <Play className="h-4 w-4 mr-2" />
                      {isLoading ? 'Releasing...' : 'Release to App Store'}
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleViewCrashes}>
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

      {/* New Build Dialog */}
      <Dialog open={showNewBuildDialog} onOpenChange={setShowNewBuildDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-indigo-600" />
              Start New Build
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Version Number</Label>
              <Input
                placeholder="e.g., 2.6.0"
                value={buildForm.version}
                onChange={(e) => setBuildForm({ ...buildForm, version: e.target.value })}
              />
            </div>
            <div>
              <Label>Build Number</Label>
              <Input
                placeholder="e.g., 260"
                value={buildForm.buildNumber}
                onChange={(e) => setBuildForm({ ...buildForm, buildNumber: e.target.value })}
              />
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
                  <SelectItem value="beta">Beta (TestFlight/Internal)</SelectItem>
                  <SelectItem value="internal">Internal Only</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staged">Staged Rollout</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                The build will be processed and available for testing within 15-30 minutes after upload.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewBuildDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                await handleCreateBuild()
                setShowNewBuildDialog(false)
              }} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
                {isLoading ? 'Starting...' : 'Start Build'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Submit for Review Dialog */}
      <Dialog open={showSubmitReviewDialog} onOpenChange={setShowSubmitReviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-fuchsia-600" />
              Submit for App Store Review
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
              <Label>Review Notes (Optional)</Label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg text-sm"
                rows={3}
                placeholder="Notes for the App Store review team..."
                value={submitReviewForm.notes}
                onChange={(e) => setSubmitReviewForm({ ...submitReviewForm, notes: e.target.value })}
              />
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                App Store review typically takes 24-48 hours. Ensure all metadata and screenshots are up to date.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSubmitReviewDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                if (submitReviewForm.buildId) {
                  const build = filteredBuilds.find(b => b.id === submitReviewForm.buildId)
                  if (build) {
                    await handleSubmitToStore(submitReviewForm.buildId, build.platform)
                    setShowSubmitReviewDialog(false)
                    setSubmitReviewForm({ buildId: '', notes: '' })
                  }
                } else {
                  toast.error('Please select a build to submit')
                }
              }} disabled={isLoading} className="bg-fuchsia-600 hover:bg-fuchsia-700">
                {isLoading ? 'Submitting...' : 'Submit for Review'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Analytics Dialog */}
      <Dialog open={showViewAnalyticsDialog} onOpenChange={setShowViewAnalyticsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              App Analytics Overview
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-indigo-600">{(stats.totalDownloads / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-gray-500">Total Downloads</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{(stats.monthlyActiveUsers / 1000).toFixed(0)}K</p>
                <p className="text-xs text-gray-500">Monthly Active</p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.avgRating}</p>
                <p className="text-xs text-gray-500">Avg Rating</p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-600">{stats.crashFreeRate}%</p>
                <p className="text-xs text-gray-500">Crash-Free</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Platform Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2"><Apple className="h-4 w-4" /> iOS</span>
                    <span>{(stats.iosDownloads / 1000000).toFixed(1)}M ({((stats.iosDownloads / stats.totalDownloads) * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2"><Smartphone className="h-4 w-4" /> Android</span>
                    <span>{(stats.androidDownloads / 1000000).toFixed(1)}M ({((stats.androidDownloads / stats.totalDownloads) * 100).toFixed(0)}%)</span>
                  </div>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Engagement</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>DAU</span>
                    <span>{(stats.dailyActiveUsers / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Session</span>
                    <span>{stats.avgSessionLength}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>7-Day Retention</span>
                    <span>{stats.retention7Day}%</span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowViewAnalyticsDialog(false)}>Close</Button>
              <Button onClick={() => { setShowViewAnalyticsDialog(false); setActiveTab('analytics'); }} className="bg-indigo-600 hover:bg-indigo-700">
                View Full Analytics
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Build Dialog */}
      <Dialog open={showUploadBuildDialog} onOpenChange={setShowUploadBuildDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-indigo-600" />
              Upload New Build
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Drag and drop your IPA or APK file here
              </p>
              <p className="text-xs text-gray-500">or</p>
              <Button variant="outline" className="mt-2" onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = '.apk,.ipa,.aab'
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (file) {
                    toast.success('Selected: ' + file.name)
                  }
                }
                input.click()
              }}>
                Browse Files
              </Button>
            </div>
            <div>
              <Label>Version Number</Label>
              <Input
                placeholder="e.g., 2.6.0"
                value={buildForm.version}
                onChange={(e) => setBuildForm({ ...buildForm, version: e.target.value })}
              />
            </div>
            <div>
              <Label>Platform</Label>
              <Select value={buildForm.platform} onValueChange={(v: Platform) => setBuildForm({ ...buildForm, platform: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ios">iOS (.ipa)</SelectItem>
                  <SelectItem value="android">Android (.apk / .aab)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUploadBuildDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                await handleCreateBuild()
                setShowUploadBuildDialog(false)
              }} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
                {isLoading ? 'Uploading...' : 'Upload Build'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Push Notification Dialog */}
      <Dialog open={showSendPushDialog} onOpenChange={setShowSendPushDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              Send Push Notification
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Notification Title</Label>
              <Input
                placeholder="e.g., New Feature Available!"
                value={pushNotificationForm.title}
                onChange={(e) => setPushNotificationForm({ ...pushNotificationForm, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Message</Label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg text-sm"
                rows={3}
                placeholder="Your notification message..."
                value={pushNotificationForm.message}
                onChange={(e) => setPushNotificationForm({ ...pushNotificationForm, message: e.target.value })}
              />
            </div>
            <div>
              <Label>Target Audience</Label>
              <Select value={pushNotificationForm.targetAudience} onValueChange={(v) => setPushNotificationForm({ ...pushNotificationForm, targetAudience: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="ios">iOS Users Only</SelectItem>
                  <SelectItem value="android">Android Users Only</SelectItem>
                  <SelectItem value="active">Active Users (Last 7 days)</SelectItem>
                  <SelectItem value="inactive">Inactive Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Estimated reach: ~{pushNotificationForm.targetAudience === 'all' ? '890K' : pushNotificationForm.targetAudience === 'ios' ? '480K' : '410K'} users
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSendPushDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                if (!pushNotificationForm.title || !pushNotificationForm.message) {
                  toast.error('Please fill in all fields')
                  return
                }
                setCampaignForm({
                  title: pushNotificationForm.title,
                  message: pushNotificationForm.message,
                  platform: pushNotificationForm.targetAudience as Platform,
                  targetAudience: pushNotificationForm.targetAudience === 'all' ? 'All Users' : pushNotificationForm.targetAudience
                })
                await handleCreateCampaign()
                setShowSendPushDialog(false)
                setPushNotificationForm({ title: '', message: '', targetAudience: 'all' })
              }} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                {isLoading ? 'Sending...' : 'Send Notification'}
              </Button>
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
                <p className="text-xs text-gray-500">Total Crashes (24h)</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{stats.crashFreeRate}%</p>
                <p className="text-xs text-gray-500">Crash-Free Rate</p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-yellow-600">3</p>
                <p className="text-xs text-gray-500">Affected Versions</p>
              </div>
            </div>
            <div className="border rounded-lg divide-y">
              <div className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800">
                <div>
                  <p className="font-medium">NullPointerException in UserProfile.java</p>
                  <p className="text-sm text-gray-500">v2.5.0 (Android) - 18 occurrences</p>
                </div>
                <Badge className="bg-red-100 text-red-700">Critical</Badge>
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800">
                <div>
                  <p className="font-medium">Thread 1: EXC_BAD_ACCESS in CoreData</p>
                  <p className="text-sm text-gray-500">v2.5.1 (iOS) - 8 occurrences</p>
                </div>
                <Badge className="bg-orange-100 text-orange-700">High</Badge>
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800">
                <div>
                  <p className="font-medium">OutOfMemoryError in ImageCache</p>
                  <p className="text-sm text-gray-500">v2.5.0 (Android) - 6 occurrences</p>
                </div>
                <Badge className="bg-yellow-100 text-yellow-700">Medium</Badge>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCrashReportsDialog(false)}>Close</Button>
              <Button onClick={() => { setShowCrashReportsDialog(false); setActiveTab('analytics'); }} className="bg-red-600 hover:bg-red-700">
                View Full Report
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update App Metadata Dialog */}
      <Dialog open={showUpdateMetadataDialog} onOpenChange={setShowUpdateMetadataDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-600" />
              Update App Metadata
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>App Name</Label>
              <Input
                placeholder="Your app name"
                value={metadataForm.appName}
                onChange={(e) => setMetadataForm({ ...metadataForm, appName: e.target.value })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg text-sm"
                rows={4}
                placeholder="App description for the store listing..."
                value={metadataForm.description}
                onChange={(e) => setMetadataForm({ ...metadataForm, description: e.target.value })}
              />
            </div>
            <div>
              <Label>Keywords</Label>
              <Input
                placeholder="productivity, tasks, workflow"
                value={metadataForm.keywords}
                onChange={(e) => setMetadataForm({ ...metadataForm, keywords: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">Comma-separated keywords for App Store search</p>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={metadataForm.category} onValueChange={(v) => setMetadataForm({ ...metadataForm, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="productivity">Productivity</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUpdateMetadataDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                await handleSaveSettings('metadata')
                setShowUpdateMetadataDialog(false)
                toast.success('Metadata updated')
              }} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Metadata'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Campaign Dialog */}
      <Dialog open={showEditCampaignDialog} onOpenChange={setShowEditCampaignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Campaign Title</Label>
              <Input value={campaignForm.title} onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })} />
            </div>
            <div>
              <Label>Message</Label>
              <Input value={campaignForm.message} onChange={(e) => setCampaignForm({ ...campaignForm, message: e.target.value })} />
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
              <Input value={campaignForm.targetAudience} onChange={(e) => setCampaignForm({ ...campaignForm, targetAudience: e.target.value })} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditCampaignDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveEditCampaign} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit IAP Dialog */}
      <Dialog open={showEditIapDialog} onOpenChange={setShowEditIapDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit In-App Purchase</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Product ID</Label>
              <Input value={iapForm.productId} onChange={(e) => setIapForm({ ...iapForm, productId: e.target.value })} />
            </div>
            <div>
              <Label>Product Name</Label>
              <Input value={iapForm.name} onChange={(e) => setIapForm({ ...iapForm, name: e.target.value })} />
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
              <Input value={iapForm.price} onChange={(e) => setIapForm({ ...iapForm, price: e.target.value })} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditIapDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveEditIap} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </div>
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
              <Input
                defaultValue="FreeFlow Mobile"
                onChange={(e) => setMetadataForm({ ...metadataForm, appName: e.target.value })}
              />
              <p className="text-sm text-gray-500 mt-1">This name will appear on the App Store.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditAppNameDialog(false)}>Cancel</Button>
              <Button onClick={() => handleSaveAppName(metadataForm.appName)} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
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
              <Input
                placeholder="e.g., Internal Team, Beta Testers"
                value={newTesterGroupName}
                onChange={(e) => setNewTesterGroupName(e.target.value)}
              />
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                After creating the group, you can add testers by inviting them via email.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowCreateTesterGroupDialog(false)
                setNewTesterGroupName('')
              }}>Cancel</Button>
              <Button onClick={() => handleCreateTesterGroup(newTesterGroupName)} disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Group'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* CI/CD Config Dialog */}
      <Dialog open={showCiCdConfigDialog} onOpenChange={setShowCiCdConfigDialog}>
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
                <div>
                  <Label>Build Configuration</Label>
                  <Select defaultValue="production">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debug">Debug</SelectItem>
                      <SelectItem value="release">Release</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Label>Auto-deploy on merge</Label>
                  <Switch defaultChecked />
                </div>
              </>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Connect {selectedCiCd?.name} to automatically build and deploy your app when you push changes to your repository.
                </p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCiCdConfigDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveCiCdConfig} disabled={isLoading}>
                {isLoading ? 'Processing...' : selectedCiCd?.connected ? 'Save Configuration' : 'Connect'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove from App Store Dialog */}
      <Dialog open={showRemoveAppDialog} onOpenChange={setShowRemoveAppDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertOctagon className="h-5 w-5" />
              Remove from App Store
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to remove this app from the App Store? Users will no longer be able to download it, but existing users can still use it.
            </p>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                This action can be reversed by re-submitting your app for review.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRemoveAppDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleRemoveFromStore} disabled={isLoading}>
                {isLoading ? 'Removing...' : 'Remove from Store'}
              </Button>
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
            <p className="text-gray-600 dark:text-gray-400">
              Are you absolutely sure you want to permanently delete this app? This action cannot be undone.
            </p>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                Warning: All builds, analytics, reviews, and app data will be permanently deleted.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteAppDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteApp} disabled={isLoading}>
                {isLoading ? 'Deleting...' : 'Delete Permanently'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
