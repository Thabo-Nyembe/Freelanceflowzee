'use client'
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

import { CollapsibleInsightsPanel, InsightsToggleButton, useInsightsPanel } from '@/components/ui/collapsible-insights-panel'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { NumberFlow } from '@/components/ui/number-flow'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Gift,
  Share2,
  Copy,
  CheckCircle,
  Users,
  TrendingUp,
  Award,
  Zap,
  Mail,
  Crown,
  Sparkles,
  Plus,
  DollarSign,
  Settings,
  Eye,
  Send,
  Download,
  Target,
  CreditCard,
  Wallet,
  RefreshCw
} from 'lucide-react'
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { KAZI_CLIENT_DATA } from '@/lib/client-zone-utils'

const logger = createFeatureLogger('ReferralLoyaltySystem')

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Referral {
  id: number
  name: string
  email: string
  avatar: string
  referralDate: string
  status: 'pending' | 'completed' | 'earned'
  projectsCompleted?: number
  commissionEarned?: number
}

interface Reward {
  id: number
  title: string
  description: string
  points: number
  earned: boolean
  earnedDate?: string
  icon: any
  color: string
}

// ============================================================================
// REFERRAL LOYALTY SYSTEM COMPONENT
// ============================================================================


// ============================================================================
// V2 COMPETITIVE MOCK DATA - Referrals Context
// ============================================================================

const referralsAIInsights = [
  { id: '1', type: 'info' as const, title: 'Performance Update', description: 'System running optimally with 99.9% uptime this month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'success' as const, title: 'Goal Achievement', description: 'Monthly targets exceeded by 15%. Great progress!', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Goals' },
  { id: '3', type: 'warning' as const, title: 'Action Required', description: 'Review pending items to maintain workflow efficiency.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Tasks' },
]

const referralsCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Manager', lastActive: 'Now' },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, role: 'Developer', lastActive: '5m ago' },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, role: 'Designer', lastActive: '30m ago' },
]

const referralsPredictions = [
  { id: '1', label: 'Completion Rate', current: 85, target: 95, predicted: 92, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Efficiency Score', current: 78, target: 90, predicted: 86, confidence: 82, trend: 'up' as const },
]

const referralsActivities = [
  { id: '1', user: 'Alexandra Chen', action: 'updated', target: 'system settings', timestamp: '5m ago', type: 'info' as const },
  { id: '2', user: 'Marcus Johnson', action: 'completed', target: 'task review', timestamp: '15m ago', type: 'success' as const },
  { id: '3', user: 'System', action: 'generated', target: 'weekly report', timestamp: '1h ago', type: 'info' as const },
]

const referralsQuickActions = [
  { id: '1', label: 'New Item', icon: 'Plus', shortcut: 'N', action: () => {
    toast.promise(
      fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', name: 'New Referral', email: '' })
      }).then(res => {
        if (!res.ok) throw new Error('Create failed')
        return res.json()
      }),
      {
        loading: 'Creating new referral...',
        success: 'New referral created successfully',
        error: 'Failed to create referral'
      }
    )
  }},
  { id: '2', label: 'Export', icon: 'Download', shortcut: 'E', action: () => {
    toast.promise(
      fetch('/api/referrals?action=export').then(async res => {
        if (!res.ok) throw new Error('Export failed')
        const data = await res.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = "referrals-export-" + new Date().toISOString().split('T')[0] + ".json"
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        a.remove()
        return 'Export complete'
      }),
      {
        loading: 'Exporting referral data...',
        success: 'Referral data exported successfully',
        error: 'Failed to export referral data'
      }
    )
  }},
  { id: '3', label: 'Settings', icon: 'Settings', shortcut: 'S', action: () => {
    toast.promise(
      fetch('/api/referrals?action=settings').then(res => {
        if (!res.ok) throw new Error('Load failed')
        return res.json()
      }),
      {
        loading: 'Loading referral settings...',
        success: 'Referral settings loaded',
        error: 'Failed to load settings'
      }
    )
  }},
]

export default function ReferralsClient() {
  const insightsPanel = useInsightsPanel(false)
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [referralCode, setReferralCode] = useState('KAZI-ACME-45K')
  const [referralLink, setReferralLink] = useState('')
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)

  // REFERRAL DATA
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loyaltyPoints, setLoyaltyPoints] = useState(0)
  const [totalCommission, setTotalCommission] = useState(0)

  // DIALOG STATES
  const [isRedeemPointsDialogOpen, setIsRedeemPointsDialogOpen] = useState(false)
  const [isViewReferralsDialogOpen, setIsViewReferralsDialogOpen] = useState(false)
  const [isViewEarningsDialogOpen, setIsViewEarningsDialogOpen] = useState(false)
  const [isCreateReferralDialogOpen, setIsCreateReferralDialogOpen] = useState(false)
  const [isTrackProgressDialogOpen, setIsTrackProgressDialogOpen] = useState(false)
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const [isReferralDetailsDialogOpen, setIsReferralDetailsDialogOpen] = useState(false)
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null)

  // FORM STATES
  const [newReferralData, setNewReferralData] = useState({
    name: '',
    email: '',
    company: '',
    notes: ''
  })
  const [payoutAmount, setPayoutAmount] = useState(0)
  const [payoutMethod, setPayoutMethod] = useState<'bank' | 'paypal' | 'crypto'>('bank')
  const [settingsData, setSettingsData] = useState({
    emailNotifications: true,
    autoPayouts: false,
    minPayoutAmount: 100,
    referralBonus: 20
  })
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const loadReferralData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Initialize referral code and link
        const code = 'KAZI-ACME-45K'
        const link = `https://kazi.app/signup?ref=${code}`
        setReferralCode(code)
        setReferralLink(link)

        // Initialize referrals list
        const referralsList: Referral[] = [
          {
            id: 1,
            name: 'TechCorp Industries',
            email: 'contact@techcorp.com',
            avatar: '/avatars/techcorp.jpg',
            referralDate: '2024-01-15',
            status: 'earned',
            projectsCompleted: 2,
            commissionEarned: 2400
          },
          {
            id: 2,
            name: 'Design Studio Pro',
            email: 'info@designstudio.com',
            avatar: '/avatars/designstudio.jpg',
            referralDate: '2024-01-20',
            status: 'completed',
            projectsCompleted: 1,
            commissionEarned: 1200
          },
          {
            id: 3,
            name: 'Marketing Innovations',
            email: 'hello@marketinginno.com',
            avatar: '/avatars/marketing.jpg',
            referralDate: '2024-02-01',
            status: 'completed',
            projectsCompleted: 0,
            commissionEarned: 0
          },
          {
            id: 4,
            name: 'Digital Creative Agency',
            email: 'contact@dcagency.com',
            avatar: '/avatars/dcagency.jpg',
            referralDate: '2024-02-05',
            status: 'pending',
            projectsCompleted: 0,
            commissionEarned: 0
          }
        ]

        // Initialize rewards
        const rewardsList: Reward[] = [
          {
            id: 1,
            title: 'First Referral',
            description: 'Refer your first client and earn 500 points',
            points: 500,
            earned: true,
            earnedDate: '2024-01-15',
            icon: Gift,
            color: 'blue'
          },
          {
            id: 2,
            title: 'Triple Threat',
            description: 'Refer 3 clients and unlock 1,500 points',
            points: 1500,
            earned: true,
            earnedDate: '2024-02-10',
            icon: Sparkles,
            color: 'purple'
          },
          {
            id: 3,
            title: 'Gold Member',
            description: 'Generate $5,000 in referral commissions',
            points: 2000,
            earned: false,
            icon: Crown,
            color: 'yellow'
          },
          {
            id: 4,
            title: 'Loyalty Milestone',
            description: 'Maintain 6 months of referral activity',
            points: 1000,
            earned: false,
            icon: Award,
            color: 'green'
          },
          {
            id: 5,
            title: 'Power Promoter',
            description: 'Refer 5 clients in a single quarter',
            points: 2500,
            earned: false,
            icon: TrendingUp,
            color: 'red'
          }
        ]

        setReferrals(referralsList)
        setRewards(rewardsList)
        setLoyaltyPoints(2000)
        setTotalCommission(3600)

        // Load referral data from API
        const response = await fetch('/api/client-zone/referrals')
        if (!response.ok) throw new Error('Failed to load referral data')

        setIsLoading(false)
        announce('Referral system loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load referral data')
        setIsLoading(false)
        announce('Error loading referral system', 'assertive')
        logger.error('Failed to load referral data', { error: err })
      }
    }

    loadReferralData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================================
  // HANDLER 1: COPY REFERRAL CODE
  // ============================================================================

  const handleCopyReferralCode = () => {
    try {
      navigator.clipboard.writeText(referralCode)
      setCopiedToClipboard(true)
      toast.success('Referral code copied!')

      setTimeout(() => {
        setCopiedToClipboard(false)
      }, 2000)
    } catch (error) {
      logger.error('Failed to copy referral code', { error })
      toast.error('Failed to copy code')
    }
  }

  // ============================================================================
  // HANDLER 2: COPY REFERRAL LINK
  // ============================================================================

  const handleCopyReferralLink = () => {
    try {
      navigator.clipboard.writeText(referralLink)
      toast.success('Referral link copied!')
    } catch (error) {
      logger.error('Failed to copy referral link', { error })
      toast.error('Failed to copy link')
    }
  }

  // ============================================================================
  // HANDLER 3: SHARE REFERRAL
  // ============================================================================

  const handleShareReferral = async (platform: 'email' | 'whatsapp' | 'twitter' | 'linkedin') => {
    try {
      const shareMessage = "Check out KAZI - amazing project management platform! Use my referral code " + referralCode + " and get exclusive benefits. " + referralLink
      let shareUrl = ''

      switch (platform) {
        case 'email':
          shareUrl = "mailto:?subject=Join KAZI - Premium Project Management&body=" + encodeURIComponent(shareMessage)
          window.location.href = shareUrl
          break
        case 'whatsapp':
          shareUrl = "https://wa.me/?text=" + encodeURIComponent(shareMessage)
          window.open(shareUrl, '_blank')
          break
        case 'twitter':
          shareUrl = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareMessage)
          window.open(shareUrl, '_blank')
          break
        case 'linkedin':
          shareUrl = "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(referralLink)
          window.open(shareUrl, '_blank')
          break
      }

      toast.success('Opening share dialog...')
    } catch (error) {
      logger.error('Failed to share referral', { error, platform })
      toast.error('Failed to open share dialog')
    }
  }

  // ============================================================================
  // HANDLER 4: VIEW REFERRAL DETAILS
  // ============================================================================

  const handleViewReferralDetails = (referralId: number) => {
    const referral = referrals.find(r => r.id === referralId)
    toast.info("Loading details for " + (referral?.name || "referral") + "...")
  }

  // ============================================================================
  // HANDLER 5: CLAIM REWARD
  // ============================================================================

  const handleClaimReward = async (rewardId: number) => {
    try {
      const reward = rewards.find(r => r.id === rewardId)
      const response = await fetch('/api/loyalty/claim-reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rewardId,
          clientId: KAZI_CLIENT_DATA.clientInfo.name,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to claim reward')
      }

      const result = await response.json()

      if (result.success) {
        toast.success('Reward claimed! ' + (reward?.points || 0) + ' loyalty points')

        // Update local state
        setLoyaltyPoints(prev => prev + (reward?.points || 0))
      }
    } catch (error) {
      logger.error('Failed to claim reward', { error, rewardId })
      toast.error('Failed to claim reward')
    }
  }

  // ============================================================================
  // HANDLER 6: REDEEM POINTS
  // ============================================================================

  const handleRedeemPoints = async (points: number) => {
    try {
      if (loyaltyPoints < points) {
        toast.error('Insufficient points. Need ' + (points - loyaltyPoints) + ' more points')
        return
      }
      const response = await fetch('/api/loyalty/redeem-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          points,
          clientId: KAZI_CLIENT_DATA.clientInfo.name,
          redeemType: 'discount',
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to redeem points')
      }

      const result = await response.json()

      if (result.success) {
        toast.success('Points redeemed! ' + points + ' points converted to account credit')

        setLoyaltyPoints(prev => prev - points)
      }
    } catch (error) {
      logger.error('Failed to redeem points', { error, points })
      toast.error('Failed to redeem points')
    }
  }

  // ============================================================================
  // HANDLER 7: CREATE REFERRAL
  // ============================================================================

  const handleCreateReferral = async () => {
    try {
      if (!newReferralData.name || !newReferralData.email) {
        toast.error('Missing information')
        return
      }

      setIsProcessing(true)
      // Call API to create referral
      const response = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          ...newReferralData
        })
      })
      if (!response.ok) throw new Error('Failed to create referral')
      const apiData = await response.json()

      const newReferral: Referral = {
        id: referrals.length + 1,
        name: newReferralData.company || newReferralData.name,
        email: newReferralData.email,
        avatar: "/avatars/new-" + (referrals.length + 1) + ".jpg",
        referralDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        projectsCompleted: 0,
        commissionEarned: 0
      }

      setReferrals(prev => [...prev, newReferral])
      setNewReferralData({ name: '', email: '', company: '', notes: '' })
      setIsCreateReferralDialogOpen(false)
      setIsProcessing(false)

      toast.success('Referral created!')
    } catch (error) {
      setIsProcessing(false)
      logger.error('Failed to create referral', { error })
      toast.error('Failed to create referral')
    }
  }

  // ============================================================================
  // HANDLER 8: REQUEST PAYOUT
  // ============================================================================

  const handleRequestPayout = async () => {
    try {
      if (payoutAmount <= 0) {
        toast.error('Invalid amount')
        return
      }

      if (payoutAmount > totalCommission) {
        toast.error('Insufficient balance')
        return
      }

      setIsProcessing(true)
      // Call API to request payout
      const response = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'payout',
          amount: payoutAmount,
          method: payoutMethod
        })
      })
      if (!response.ok) throw new Error('Failed to request payout')

      setTotalCommission(prev => prev - payoutAmount)
      setPayoutAmount(0)
      setIsPayoutDialogOpen(false)
      setIsProcessing(false)

      toast.success('Payout requested! $' + payoutAmount + ' will be sent to your ' + payoutMethod + ' within 3-5 business days')
    } catch (error) {
      setIsProcessing(false)
      logger.error('Failed to request payout', { error })
      toast.error('Failed to request payout')
    }
  }

  // ============================================================================
  // HANDLER 9: SAVE SETTINGS
  // ============================================================================

  const handleSaveSettings = async () => {
    try {
      setIsProcessing(true)
      // Call API to save settings
      const response = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_settings',
          settings: settingsData
        })
      })
      if (!response.ok) throw new Error('Failed to save settings')

      setIsSettingsDialogOpen(false)
      setIsProcessing(false)

      toast.success('Settings saved!')
    } catch (error) {
      setIsProcessing(false)
      logger.error('Failed to save settings', { error })
      toast.error('Failed to save settings')
    }
  }

  // ============================================================================
  // HANDLER 10: VIEW REFERRAL DETAILS (DIALOG VERSION)
  // ============================================================================

  const handleOpenReferralDetails = (referral: Referral) => {
    setSelectedReferral(referral)
    setIsReferralDetailsDialogOpen(true)
  }

  // ============================================================================
  // HANDLER 11: SEND REMINDER TO REFERRAL
  // ============================================================================

  const handleSendReminder = async (referralId: number) => {
    try {
      const referral = referrals.find(r => r.id === referralId)
      // Call API to send reminder
      const response = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_reminder',
          referralId,
          email: referral?.email
        })
      })
      if (!response.ok) throw new Error('Failed to send reminder')

      toast.success('Reminder sent!')
    } catch (error) {
      logger.error('Failed to send reminder', { error, referralId })
      toast.error('Failed to send reminder')
    }
  }

  // ============================================================================
  // HANDLER 12: EXPORT REFERRAL DATA
  // ============================================================================

  const handleExportReferralData = async (format: 'csv' | 'pdf') => {
    try {
      toast.promise(
        fetch("/api/referrals?action=export&format=" + format).then(async res => {
          if (!res.ok) throw new Error('Export failed')
          const blob = await res.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = "referrals-export-" + new Date().toISOString().split('T')[0] + "." + format
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          a.remove()
          return 'Export complete'
        }),
        {
          loading: "Generating " + format.toUpperCase() + " export...",
          success: "Referral data exported as " + format.toUpperCase(),
          error: 'Failed to export data'
        }
      )
    } catch (error) {
      logger.error('Failed to export referral data', { error, format })
      toast.error('Failed to export data')
    }
  }

  // ============================================================================
  // HANDLER 13: REFRESH DATA
  // ============================================================================

  const handleRefreshData = async () => {
    try {
      toast.promise(
        fetch('/api/referrals?action=refresh').then(res => {
          if (!res.ok) throw new Error('Refresh failed')
          return res.json()
        }),
        {
          loading: 'Refreshing data...',
          success: 'Referral data refreshed',
          error: 'Failed to refresh data'
        }
      )
    } catch (error) {
      logger.error('Failed to refresh data', { error })
      toast.error('Failed to refresh data')
    }
  }

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <CardSkeleton />
      </div>
    )
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error) {
    return (
      <ErrorEmptyState
        error={error}
        onRetry={() => window.location.reload()}
      />
    )
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white">
              <Gift className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Referral & Rewards Program</h1>
              <p className="text-gray-600 mt-1">Share KAZI with your network and earn rewards</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshData}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTrackProgressDialogOpen(true)}
            >
              <Target className="h-4 w-4 mr-2" />
              Track Progress
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPayoutDialogOpen(true)}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Request Payout
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsDialogOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button
              onClick={() => setIsCreateReferralDialogOpen(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Referral
            </Button>
            <InsightsToggleButton
              isOpen={insightsPanel.isOpen}
              onToggle={insightsPanel.toggle}
            />
          </div>
        </div>
      </motion.div>

      {/* Loyalty Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <LiquidGlassCard variant="gradient" hoverEffect={true} className="relative overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Award className="h-8 w-8 text-yellow-600" />
                <Badge variant="outline" className="bg-yellow-50 text-yellow-800">Active</Badge>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Loyalty Points</p>
                <NumberFlow value={loyaltyPoints} className="text-3xl font-bold text-gray-900 block" />
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => setIsRedeemPointsDialogOpen(true)}
              >
                <Wallet className="h-4 w-4 mr-2" />
                Redeem Points
              </Button>
            </div>
          </LiquidGlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <LiquidGlassCard variant="tinted" hoverEffect={true} className="relative overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Users className="h-8 w-8 text-blue-600" />
                <Badge variant="outline" className="bg-blue-50 text-blue-800">{referrals.filter(r => r.status !== 'pending').length} Active</Badge>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Referrals</p>
                <NumberFlow value={referrals.length} className="text-3xl font-bold text-gray-900 block" />
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => setIsViewReferralsDialogOpen(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Referrals
              </Button>
            </div>
          </LiquidGlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <LiquidGlassCard variant="gradient" hoverEffect={true} className="relative overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <Badge variant="outline" className="bg-green-50 text-green-800">Growth</Badge>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Commission Earned</p>
                <p className="text-3xl font-bold text-gray-900">${totalCommission.toLocaleString()}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => setIsViewEarningsDialogOpen(true)}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                View Earnings
              </Button>
            </div>
          </LiquidGlassCard>
        </motion.div>
      </div>

      {/* Referral Code Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Your Referral Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Referral Code */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
                <p className="text-sm text-gray-600 mb-2">Referral Code</p>
                <div className="flex items-center gap-2">
                  <code className="text-2xl font-bold text-blue-600">{referralCode}</code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyReferralCode}
                    className="ml-auto"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    {copiedToClipboard ? 'Copied!' : 'Copy Code'}
                  </Button>
                </div>
              </div>

              {/* Referral Link */}
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Referral Link</p>
                <div className="flex items-center gap-2 break-all">
                  <code className="text-sm text-blue-600 flex-1">{referralLink}</code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyReferralLink}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* How It Works */}
              <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                <h4 className="font-semibold text-gray-900 mb-2">How It Works</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>1. Share your referral code or link with friends</li>
                  <li>2. They sign up using your code and start a project</li>
                  <li>3. You earn 20% commission on their first project</li>
                  <li>4. Get lifetime 10% on all their future projects</li>
                </ul>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Share Your Referral Link</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  className="flex-col h-auto py-3"
                  onClick={() => handleShareReferral('email')}
                >
                  <Mail className="h-5 w-5 mb-1" />
                  <span className="text-xs">Email</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex-col h-auto py-3"
                  onClick={() => handleShareReferral('whatsapp')}
                >
                  <Share2 className="h-5 w-5 mb-1" />
                  <span className="text-xs">WhatsApp</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex-col h-auto py-3"
                  onClick={() => handleShareReferral('twitter')}
                >
                  <Share2 className="h-5 w-5 mb-1" />
                  <span className="text-xs">Twitter</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex-col h-auto py-3"
                  onClick={() => handleShareReferral('linkedin')}
                >
                  <Share2 className="h-5 w-5 mb-1" />
                  <span className="text-xs">LinkedIn</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Referral History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Referrals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {referrals.map((referral) => (
                <motion.div
                  key={referral.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleOpenReferralDetails(referral)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={referral.avatar} alt={referral.name} />
                        <AvatarFallback>{referral.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{referral.name}</p>
                        <p className="text-sm text-gray-600">{referral.email}</p>
                        <p className="text-xs text-gray-500 mt-1">Referred on {new Date(referral.referralDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={
                        referral.status === 'earned' ? 'bg-green-100 text-green-800' :
                        referral.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {referral.status === 'earned' ? 'Earned' : referral.status === 'completed' ? 'Completed' : 'Pending'}
                      </Badge>
                      {referral.commissionEarned! > 0 && (
                        <p className="text-sm font-semibold text-green-600 mt-1">${referral.commissionEarned}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Rewards System */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
      >
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Achievement Rewards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rewards.map((reward) => {
                const Icon = reward.icon
                return (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-lg border-2 ${
                      reward.earned
                        ? `border-${reward.color}-200 bg-${reward.color}-50`
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <Icon className={`h-6 w-6 text-${reward.color}-600`} />
                      {reward.earned ? (
                        <Badge className={`bg-${reward.color}-100 text-${reward.color}-800`}>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Earned
                        </Badge>
                      ) : (
                        <Badge variant="outline">Locked</Badge>
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{reward.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">+{reward.points} points</span>
                      {reward.earned && !reward.earnedDate ? (
                        <Button
                          size="sm"
                          className={`bg-${reward.color}-600 hover:bg-${reward.color}-700 text-white`}
                          onClick={() => handleClaimReward(reward.id)}
                        >
                          Claim
                        </Button>
                      ) : reward.earnedDate ? (
                        <span className="text-xs text-gray-500">Earned {new Date(reward.earnedDate).toLocaleDateString()}</span>
                      ) : (
                        <span className="text-xs text-gray-500">In progress</span>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Points Redemption */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Redeem Your Points
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">You have <span className="font-bold">{loyaltyPoints}</span> points available to redeem</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="flex-col h-auto py-4 bg-white dark:bg-slate-800"
                onClick={() => handleRedeemPoints(500)}
                disabled={loyaltyPoints < 500}
              >
                <span className="text-lg font-bold">$5</span>
                <span className="text-xs text-gray-600">500 points</span>
              </Button>
              <Button
                variant="outline"
                className="flex-col h-auto py-4 bg-white dark:bg-slate-800"
                onClick={() => handleRedeemPoints(1000)}
                disabled={loyaltyPoints < 1000}
              >
                <span className="text-lg font-bold">$12</span>
                <span className="text-xs text-gray-600">1,000 points</span>
              </Button>
              <Button
                variant="outline"
                className="flex-col h-auto py-4 bg-white dark:bg-slate-800"
                onClick={() => handleRedeemPoints(2000)}
                disabled={loyaltyPoints < 2000}
              >
                <span className="text-lg font-bold">$30</span>
                <span className="text-xs text-gray-600">2,000 points</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* V2 Competitive Upgrade Components - Collapsible Insights Panel */}
      {insightsPanel.isOpen && (
        <CollapsibleInsightsPanel title="Referral Insights" defaultOpen={true} className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <AIInsightsPanel insights={referralsAIInsights} />
            <PredictiveAnalytics predictions={referralsPredictions} />
            <CollaborationIndicator collaborators={referralsCollaborators} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QuickActionsToolbar actions={referralsQuickActions} />
            <ActivityFeed activities={referralsActivities} />
          </div>
        </CollapsibleInsightsPanel>
      )}

      {/* ============================================================================ */}
      {/* DIALOG: CREATE REFERRAL */}
      {/* ============================================================================ */}
      <Dialog open={isCreateReferralDialogOpen} onOpenChange={setIsCreateReferralDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600" />
              Create New Referral
            </DialogTitle>
            <DialogDescription>
              Send a referral invitation to a potential client. They will receive an email with your unique referral link.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="referral-name">Contact Name *</Label>
              <Input
                id="referral-name"
                placeholder="John Smith"
                value={newReferralData.name}
                onChange={(e) => setNewReferralData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="referral-email">Email Address *</Label>
              <Input
                id="referral-email"
                type="email"
                placeholder="john@company.com"
                value={newReferralData.email}
                onChange={(e) => setNewReferralData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="referral-company">Company Name</Label>
              <Input
                id="referral-company"
                placeholder="Acme Corporation"
                value={newReferralData.company}
                onChange={(e) => setNewReferralData(prev => ({ ...prev, company: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="referral-notes">Personal Message (Optional)</Label>
              <Textarea
                id="referral-notes"
                placeholder="Add a personal note to your referral invitation..."
                value={newReferralData.notes}
                onChange={(e) => setNewReferralData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateReferralDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateReferral}
              disabled={isProcessing}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================================ */}
      {/* DIALOG: REDEEM POINTS */}
      {/* ============================================================================ */}
      <Dialog open={isRedeemPointsDialogOpen} onOpenChange={setIsRedeemPointsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-purple-600" />
              Redeem Loyalty Points
            </DialogTitle>
            <DialogDescription>
              Convert your loyalty points to account credits. Current balance: <span className="font-bold">{loyaltyPoints} points</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              <Button
                variant="outline"
                className="flex-col h-auto py-4"
                onClick={() => handleRedeemPoints(500)}
                disabled={loyaltyPoints < 500}
              >
                <span className="text-lg font-bold">$5</span>
                <span className="text-xs text-gray-600">500 points</span>
              </Button>
              <Button
                variant="outline"
                className="flex-col h-auto py-4"
                onClick={() => handleRedeemPoints(1000)}
                disabled={loyaltyPoints < 1000}
              >
                <span className="text-lg font-bold">$12</span>
                <span className="text-xs text-gray-600">1,000 points</span>
              </Button>
              <Button
                variant="outline"
                className="flex-col h-auto py-4"
                onClick={() => handleRedeemPoints(2000)}
                disabled={loyaltyPoints < 2000}
              >
                <span className="text-lg font-bold">$30</span>
                <span className="text-xs text-gray-600">2,000 points</span>
              </Button>
            </div>
            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <h4 className="font-semibold text-gray-900 mb-2">Redemption Benefits</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>- Credits applied instantly to your account</li>
                <li>- Use for project fees or premium features</li>
                <li>- No expiration on redeemed credits</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRedeemPointsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================================ */}
      {/* DIALOG: VIEW REFERRALS */}
      {/* ============================================================================ */}
      <Dialog open={isViewReferralsDialogOpen} onOpenChange={setIsViewReferralsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              All Referrals ({referrals.length})
            </DialogTitle>
            <DialogDescription>
              Manage and track all your referrals in one place.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {referrals.map((referral) => (
              <div
                key={referral.id}
                className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={referral.avatar} alt={referral.name} />
                      <AvatarFallback>{referral.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{referral.name}</p>
                      <p className="text-sm text-gray-600">{referral.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={
                      referral.status === 'earned' ? 'bg-green-100 text-green-800' :
                      referral.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {referral.status}
                    </Badge>
                    {referral.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSendReminder(referral.id)}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportReferralData('csv')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportReferralData('pdf')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsViewReferralsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================================ */}
      {/* DIALOG: VIEW EARNINGS */}
      {/* ============================================================================ */}
      <Dialog open={isViewEarningsDialogOpen} onOpenChange={setIsViewEarningsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Earnings Summary
            </DialogTitle>
            <DialogDescription>
              View your referral commission earnings and history.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <p className="text-sm text-gray-600">Total Earned</p>
                <p className="text-2xl font-bold text-green-600">${totalCommission.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${referrals.filter(r => r.status === 'completed').reduce((acc, r) => acc + (r.commissionEarned || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Recent Earnings</h4>
              {referrals
                .filter(r => r.commissionEarned && r.commissionEarned > 0)
                .map((referral) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{referral.name}</p>
                      <p className="text-xs text-gray-500">{new Date(referral.referralDate).toLocaleDateString()}</p>
                    </div>
                    <span className="font-bold text-green-600">+${referral.commissionEarned}</span>
                  </div>
                ))}
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setIsViewEarningsDialogOpen(false)
                setIsPayoutDialogOpen(true)
              }}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Request Payout
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsViewEarningsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================================ */}
      {/* DIALOG: TRACK PROGRESS */}
      {/* ============================================================================ */}
      <Dialog open={isTrackProgressDialogOpen} onOpenChange={setIsTrackProgressDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
              Referral Progress
            </DialogTitle>
            <DialogDescription>
              Track your progress towards referral milestones and rewards.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Referrals This Month</span>
                  <span className="text-sm text-gray-600">{referrals.filter(r => {
                    const date = new Date(r.referralDate)
                    const now = new Date()
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                  }).length} / 5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                    style={{ width: `${Math.min((referrals.filter(r => {
                      const date = new Date(r.referralDate)
                      const now = new Date()
                      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                    }).length / 5) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Commission Goal</span>
                  <span className="text-sm text-gray-600">${totalCommission} / $5,000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
                    style={{ width: `${Math.min((totalCommission / 5000) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Loyalty Points</span>
                  <span className="text-sm text-gray-600">{loyaltyPoints} / 5,000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                    style={{ width: `${Math.min((loyaltyPoints / 5000) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <h4 className="font-semibold text-gray-900 mb-2">Next Milestone</h4>
              <p className="text-sm text-gray-600">
                Refer 1 more client this month to unlock the Power Promoter badge and earn 2,500 bonus points!
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTrackProgressDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================================ */}
      {/* DIALOG: REQUEST PAYOUT */}
      {/* ============================================================================ */}
      <Dialog open={isPayoutDialogOpen} onOpenChange={setIsPayoutDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              Request Payout
            </DialogTitle>
            <DialogDescription>
              Withdraw your referral earnings. Available balance: <span className="font-bold">${totalCommission.toLocaleString()}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="payout-amount">Amount ($)</Label>
              <Input
                id="payout-amount"
                type="number"
                placeholder="Enter amount"
                min={0}
                max={totalCommission}
                value={payoutAmount || ''}
                onChange={(e) => setPayoutAmount(Number(e.target.value))}
              />
              <p className="text-xs text-gray-500">Minimum payout: $50</p>
            </div>
            <div className="space-y-2">
              <Label>Payout Method</Label>
              <Select
                value={payoutMethod}
                onValueChange={(value: 'bank' | 'paypal' | 'crypto') => setPayoutMethod(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payout method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank Transfer (3-5 business days)</SelectItem>
                  <SelectItem value="paypal">PayPal (1-2 business days)</SelectItem>
                  <SelectItem value="crypto">Cryptocurrency (Same day)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPayoutAmount(Math.min(100, totalCommission))}
              >
                $100
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPayoutAmount(Math.min(500, totalCommission))}
              >
                $500
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPayoutAmount(totalCommission)}
              >
                Max
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPayoutDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRequestPayout}
              disabled={isProcessing || payoutAmount < 50}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Request Payout
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================================ */}
      {/* DIALOG: SETTINGS */}
      {/* ============================================================================ */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-600" />
              Referral Program Settings
            </DialogTitle>
            <DialogDescription>
              Configure your referral program preferences and notifications.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive updates about your referrals</p>
              </div>
              <Button
                variant={settingsData.emailNotifications ? "default" : "outline"}
                size="sm"
                onClick={() => setSettingsData(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
              >
                {settingsData.emailNotifications ? 'On' : 'Off'}
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Auto Payouts</p>
                <p className="text-sm text-gray-500">Automatically request payout at threshold</p>
              </div>
              <Button
                variant={settingsData.autoPayouts ? "default" : "outline"}
                size="sm"
                onClick={() => setSettingsData(prev => ({ ...prev, autoPayouts: !prev.autoPayouts }))}
              >
                {settingsData.autoPayouts ? 'On' : 'Off'}
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="min-payout">Minimum Payout Threshold ($)</Label>
              <Input
                id="min-payout"
                type="number"
                value={settingsData.minPayoutAmount}
                onChange={(e) => setSettingsData(prev => ({ ...prev, minPayoutAmount: Number(e.target.value) }))}
                min={50}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="referral-bonus">Referral Bonus (%)</Label>
              <Select
                value={String(settingsData.referralBonus)}
                onValueChange={(value) => setSettingsData(prev => ({ ...prev, referralBonus: Number(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10% (Standard)</SelectItem>
                  <SelectItem value="15">15% (Silver)</SelectItem>
                  <SelectItem value="20">20% (Gold)</SelectItem>
                  <SelectItem value="25">25% (Platinum)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSettingsDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSettings}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================================ */}
      {/* DIALOG: REFERRAL DETAILS */}
      {/* ============================================================================ */}
      <Dialog open={isReferralDetailsDialogOpen} onOpenChange={setIsReferralDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Referral Details
            </DialogTitle>
            <DialogDescription>
              View detailed information about this referral.
            </DialogDescription>
          </DialogHeader>
          {selectedReferral && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedReferral.avatar} alt={selectedReferral.name} />
                  <AvatarFallback className="text-lg">{selectedReferral.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedReferral.name}</h3>
                  <p className="text-sm text-gray-600">{selectedReferral.email}</p>
                  <Badge className={
                    selectedReferral.status === 'earned' ? 'bg-green-100 text-green-800' :
                    selectedReferral.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }>
                    {selectedReferral.status}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-sm text-gray-600">Referral Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedReferral.referralDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-sm text-gray-600">Projects Completed</p>
                  <p className="font-semibold text-gray-900">{selectedReferral.projectsCompleted || 0}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-50 border border-green-200 col-span-2">
                  <p className="text-sm text-gray-600">Commission Earned</p>
                  <p className="text-xl font-bold text-green-600">${selectedReferral.commissionEarned || 0}</p>
                </div>
              </div>
              {selectedReferral.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleSendReminder(selectedReferral.id)}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Reminder
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleShareReferral('email')}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Share Again
                  </Button>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReferralDetailsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
