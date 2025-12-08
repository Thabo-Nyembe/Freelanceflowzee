'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { NumberFlow } from '@/components/ui/number-flow'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
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
  Phone,
  ExternalLink,
  Crown,
  Sparkles
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

export default function ReferralsPage() {
  // A+++ UTILITIES
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  // A+++ STATE MANAGEMENT
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

  // A+++ LOAD REFERRAL DATA
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

        // Simulate loading
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(null)
          }, 500)
        })

        setIsLoading(false)
        announce('Referral system loaded successfully', 'polite')
        logger.info('Referral data loaded', {
          clientName: KAZI_CLIENT_DATA.clientInfo.name,
          totalReferrals: referralsList.length,
          loyaltyPoints: 2000
        })
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

      logger.info('Referral code copied', {
        clientName: KAZI_CLIENT_DATA.clientInfo.name,
        code: referralCode
      })

      toast.success('Referral code copied!', {
        description: 'Share it with your network to earn rewards'
      })

      setTimeout(() => {
        setCopiedToClipboard(false)
      }, 2000)
    } catch (error) {
      logger.error('Failed to copy referral code', { error })
      toast.error('Failed to copy code', {
        description: 'Please try again'
      })
    }
  }

  // ============================================================================
  // HANDLER 2: COPY REFERRAL LINK
  // ============================================================================

  const handleCopyReferralLink = () => {
    try {
      navigator.clipboard.writeText(referralLink)

      logger.info('Referral link copied', {
        clientName: KAZI_CLIENT_DATA.clientInfo.name,
        link: referralLink
      })

      toast.success('Referral link copied!', {
        description: 'Ready to share with your network'
      })
    } catch (error) {
      logger.error('Failed to copy referral link', { error })
      toast.error('Failed to copy link', {
        description: 'Please try again'
      })
    }
  }

  // ============================================================================
  // HANDLER 3: SHARE REFERRAL
  // ============================================================================

  const handleShareReferral = async (platform: 'email' | 'whatsapp' | 'twitter' | 'linkedin') => {
    try {
      const shareMessage = `Check out KAZI - amazing project management platform! Use my referral code ${referralCode} and get exclusive benefits. ${referralLink}`

      logger.info('Referral share initiated', {
        clientName: KAZI_CLIENT_DATA.clientInfo.name,
        platform,
        code: referralCode
      })

      let shareUrl = ''

      switch (platform) {
        case 'email':
          shareUrl = `mailto:?subject=Join KAZI - Premium Project Management&body=${encodeURIComponent(shareMessage)}`
          window.location.href = shareUrl
          break
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`
          window.open(shareUrl, '_blank')
          break
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`
          window.open(shareUrl, '_blank')
          break
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`
          window.open(shareUrl, '_blank')
          break
      }

      toast.success('Opening share dialog...', {
        description: `Share your referral link on ${platform.charAt(0).toUpperCase() + platform.slice(1)}`
      })
    } catch (error) {
      logger.error('Failed to share referral', { error, platform })
      toast.error('Failed to open share dialog', {
        description: 'Please try again'
      })
    }
  }

  // ============================================================================
  // HANDLER 4: VIEW REFERRAL DETAILS
  // ============================================================================

  const handleViewReferralDetails = (referralId: number) => {
    const referral = referrals.find(r => r.id === referralId)

    logger.info('Referral details viewed', {
      referralId,
      referralName: referral?.name,
      status: referral?.status
    })

    toast.info(`Loading details for ${referral?.name}...`, {
      description: 'Viewing referral history and earnings'
    })
  }

  // ============================================================================
  // HANDLER 5: CLAIM REWARD
  // ============================================================================

  const handleClaimReward = async (rewardId: number) => {
    try {
      const reward = rewards.find(r => r.id === rewardId)

      logger.info('Reward claim initiated', {
        rewardId,
        rewardTitle: reward?.title,
        points: reward?.points
      })

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
        logger.info('Reward claimed successfully', { rewardId })

        toast.success('Reward claimed!', {
          description: `You earned ${reward?.points} loyalty points`
        })

        // Update local state
        setLoyaltyPoints(prev => prev + (reward?.points || 0))
      }
    } catch (error: any) {
      logger.error('Failed to claim reward', { error, rewardId })
      toast.error('Failed to claim reward', {
        description: error.message || 'Please try again'
      })
    }
  }

  // ============================================================================
  // HANDLER 6: REDEEM POINTS
  // ============================================================================

  const handleRedeemPoints = async (points: number) => {
    try {
      if (loyaltyPoints < points) {
        toast.error('Insufficient points', {
          description: `You need ${points - loyaltyPoints} more points`
        })
        return
      }

      logger.info('Points redemption initiated', {
        points,
        clientName: KAZI_CLIENT_DATA.clientInfo.name
      })

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
        logger.info('Points redeemed successfully', { points })

        toast.success('Points redeemed!', {
          description: `${points} points converted to account credit`
        })

        setLoyaltyPoints(prev => prev - points)
      }
    } catch (error: any) {
      logger.error('Failed to redeem points', { error, points })
      toast.error('Failed to redeem points', {
        description: error.message || 'Please try again'
      })
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
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            <Gift className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Referral & Rewards Program</h1>
            <p className="text-gray-600 mt-1">Share KAZI with your network and earn rewards</p>
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
              <Button size="sm" variant="outline" className="w-full">
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
              <Button size="sm" variant="outline" className="w-full">
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
              <Button size="sm" variant="outline" className="w-full">
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
                  onClick={() => handleViewReferralDetails(referral.id)}
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
                className="flex-col h-auto py-4 bg-white"
                onClick={() => handleRedeemPoints(500)}
                disabled={loyaltyPoints < 500}
              >
                <span className="text-lg font-bold">$5</span>
                <span className="text-xs text-gray-600">500 points</span>
              </Button>
              <Button
                variant="outline"
                className="flex-col h-auto py-4 bg-white"
                onClick={() => handleRedeemPoints(1000)}
                disabled={loyaltyPoints < 1000}
              >
                <span className="text-lg font-bold">$12</span>
                <span className="text-xs text-gray-600">1,000 points</span>
              </Button>
              <Button
                variant="outline"
                className="flex-col h-auto py-4 bg-white"
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
    </div>
  )
}
