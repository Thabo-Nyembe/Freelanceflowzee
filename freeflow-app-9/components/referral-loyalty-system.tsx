'use client'

import { useState } from 'react'
import {
  Gift,
  Users,
  DollarSign,
  Trophy,
  Share2,
  Copy,
  Check,
  TrendingUp,
  Award,
  Star,
  Crown,
  Zap,
  Target,
  Mail,
  MessageSquare,
  Download,
  ExternalLink,
  Sparkles
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { createSimpleLogger } from '@/lib/simple-logger'
import { toast } from 'sonner'

const logger = createSimpleLogger('ReferralLoyalty')

// ============================================================================
// TYPES
// ============================================================================

interface ReferralStats {
  code: string
  link: string
  clicks: number
  signups: number
  conversions: number
  totalEarned: number
  pendingRewards: number
  paidRewards: number
}

interface Referral {
  id: string
  name: string
  email: string
  status: 'pending' | 'signed_up' | 'converted' | 'paid'
  signupDate: string
  conversionDate?: string
  rewardAmount: number
  projectsCompleted: number
}

interface LoyaltyTier {
  name: string
  icon: React.ElementType
  color: string
  threshold: {
    spend?: number
    projects?: number
  }
  benefits: string[]
  progress?: number
  nextTier?: string
}

interface Reward {
  id: string
  type: 'referral' | 'milestone' | 'loyalty' | 'bonus'
  title: string
  description: string
  amount: number
  date: string
  status: 'pending' | 'approved' | 'paid'
  expiresAt?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ReferralLoyaltySystem() {
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  // Mock data - would come from API
  const referralStats: ReferralStats = {
    code: 'KAZI-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    link: `https://kazi.app/ref/KAZI-${Math.random().toString(36).substring(2, 8)}`,
    clicks: 47,
    signups: 12,
    conversions: 5,
    totalEarned: 2500,
    pendingRewards: 800,
    paidRewards: 1700
  }

  const referrals: Referral[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      status: 'paid',
      signupDate: '2024-10-15',
      conversionDate: '2024-10-22',
      rewardAmount: 500,
      projectsCompleted: 3
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael@example.com',
      status: 'converted',
      signupDate: '2024-11-01',
      conversionDate: '2024-11-08',
      rewardAmount: 500,
      projectsCompleted: 1
    },
    {
      id: '3',
      name: 'Emma Davis',
      email: 'emma@example.com',
      status: 'signed_up',
      signupDate: '2024-11-10',
      rewardAmount: 0,
      projectsCompleted: 0
    },
    {
      id: '4',
      name: 'James Wilson',
      email: 'james@example.com',
      status: 'pending',
      signupDate: '2024-11-18',
      rewardAmount: 0,
      projectsCompleted: 0
    }
  ]

  const currentLoyaltyTier: LoyaltyTier = {
    name: 'Silver',
    icon: Award,
    color: 'text-gray-400',
    threshold: {
      spend: 25000,
      projects: 8
    },
    benefits: [
      '10% discount on all projects',
      'Priority support',
      'Free rush delivery once/quarter'
    ],
    progress: 65,
    nextTier: 'Gold'
  }

  const loyaltyTiers: LoyaltyTier[] = [
    {
      name: 'Bronze',
      icon: Award,
      color: 'text-orange-600',
      threshold: { spend: 10000, projects: 3 },
      benefits: [
        '5% discount on all projects',
        'Extended payment terms (45 days)'
      ]
    },
    {
      name: 'Silver',
      icon: Award,
      color: 'text-gray-400',
      threshold: { spend: 25000, projects: 8 },
      benefits: [
        '10% discount',
        'Priority support',
        'Free rush delivery once/quarter'
      ]
    },
    {
      name: 'Gold',
      icon: Trophy,
      color: 'text-yellow-500',
      threshold: { spend: 50000, projects: 15 },
      benefits: [
        '15% discount',
        'Dedicated account manager',
        'Quarterly strategy sessions'
      ]
    },
    {
      name: 'Platinum',
      icon: Crown,
      color: 'text-purple-500',
      threshold: { spend: 100000, projects: 30 },
      benefits: [
        '20% discount',
        'White-label access',
        'Custom SLA',
        'API access'
      ]
    }
  ]

  const rewards: Reward[] = [
    {
      id: 'r1',
      type: 'referral',
      title: 'Referral Bonus - Sarah Johnson',
      description: 'Client completed first $5,000 project',
      amount: 500,
      date: '2024-10-22',
      status: 'paid'
    },
    {
      id: 'r2',
      type: 'milestone',
      title: '10 Projects Milestone',
      description: 'Bonus for completing 10 projects',
      amount: 200,
      date: '2024-11-01',
      status: 'paid'
    },
    {
      id: 'r3',
      type: 'referral',
      title: 'Referral Bonus - Michael Chen',
      description: 'Client completed first project',
      amount: 500,
      date: '2024-11-08',
      status: 'approved'
    },
    {
      id: 'r4',
      type: 'loyalty',
      title: 'Silver Tier Achievement',
      description: 'Upgraded to Silver loyalty tier',
      amount: 100,
      date: '2024-11-15',
      status: 'paid'
    }
  ]

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralStats.code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)

    logger.info('Referral code copied', { code: referralStats.code })
    toast.success('Referral code copied to clipboard')
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralStats.link)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)

    logger.info('Referral link copied', { link: referralStats.link })
    toast.success('Referral link copied to clipboard')
  }

  const handleShareEmail = () => {
    const subject = encodeURIComponent('Join me on KAZI - Get 15% off!')
    const body = encodeURIComponent(
      `Hi,\n\nI've been using KAZI for my creative projects and thought you might be interested!\n\nKAZI connects you with top creative talent for design, video, and marketing projects. Use my referral link to get 15% off your first project:\n\n${referralStats.link}\n\nBest,\nYour name`
    )
    window.location.href = `mailto:?subject=${subject}&body=${body}`

    logger.info('Referral shared via email')
  }

  const handleTierUpgrade = (tier: LoyaltyTier) => {
    logger.info('Loyalty tier upgrade initiated', {
      currentTier: currentLoyaltyTier.name,
      targetTier: tier.name
    })

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })

    toast.success(`Congratulations on reaching ${tier.name} tier!`, {
      description: `Unlock ${tier.benefits.length} exclusive benefits`
    })
  }

  const conversionRate = referralStats.signups > 0
    ? (referralStats.conversions / referralStats.signups) * 100
    : 0

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Referrals & Rewards</h1>
        <p className="text-muted-foreground mt-2">
          Earn rewards by referring clients and unlock exclusive benefits through our loyalty program
        </p>
      </div>

      <Tabs defaultValue="referrals" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="referrals">
            <Users className="h-4 w-4 mr-2" />
            Referrals
          </TabsTrigger>
          <TabsTrigger value="loyalty">
            <Trophy className="h-4 w-4 mr-2" />
            Loyalty
          </TabsTrigger>
          <TabsTrigger value="rewards">
            <Gift className="h-4 w-4 mr-2" />
            Rewards
          </TabsTrigger>
        </TabsList>

        {/* REFERRALS TAB */}
        <TabsContent value="referrals" className="space-y-6">
          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${referralStats.totalEarned.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  ${referralStats.pendingRewards.toLocaleString()} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{referralStats.conversions}</div>
                <p className="text-xs text-muted-foreground">
                  {conversionRate.toFixed(0)}% conversion rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Signups</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{referralStats.signups}</div>
                <p className="text-xs text-muted-foreground">
                  {referralStats.clicks} link clicks
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Reward</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${referralStats.conversions > 0
                    ? (referralStats.totalEarned / referralStats.conversions).toFixed(0)
                    : '0'}
                </div>
                <p className="text-xs text-muted-foreground">Per conversion</p>
              </CardContent>
            </Card>
          </div>

          {/* Referral Link Section */}
          <Card>
            <CardHeader>
              <CardTitle>Your Referral Link</CardTitle>
              <CardDescription>
                Share this link with friends and earn $500 when they complete their first $5,000 project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Referral Code */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Referral Code</label>
                <div className="flex gap-2">
                  <Input value={referralStats.code} readOnly />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyCode}
                  >
                    {copiedCode ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Referral Link */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Referral Link</label>
                <div className="flex gap-2">
                  <Input value={referralStats.link} readOnly />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                  >
                    {copiedLink ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleShareEmail}>
                  <Mail className="mr-2 h-4 w-4" />
                  Share via Email
                </Button>
                <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Share2 className="mr-2 h-4 w-4" />
                      More Options
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Share Your Referral Link</DialogTitle>
                      <DialogDescription>
                        Choose how you'd like to share your referral link
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3">
                      <Button variant="outline" onClick={handleShareEmail}>
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                      </Button>
                      <Button variant="outline">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        WhatsApp
                      </Button>
                      <Button variant="outline">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        LinkedIn
                      </Button>
                      <Button variant="outline">
                        <Share2 className="mr-2 h-4 w-4" />
                        Twitter
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* How it Works */}
              <div className="bg-accent rounded-lg p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  How It Works
                </h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <div className="rounded-full bg-primary text-primary-foreground w-6 h-6 flex items-center justify-center text-xs flex-shrink-0">
                      1
                    </div>
                    <p>Share your unique referral link with friends and colleagues</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="rounded-full bg-primary text-primary-foreground w-6 h-6 flex items-center justify-center text-xs flex-shrink-0">
                      2
                    </div>
                    <p>They sign up and get 15% off their first project</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="rounded-full bg-primary text-primary-foreground w-6 h-6 flex items-center justify-center text-xs flex-shrink-0">
                      3
                    </div>
                    <p>You earn $500 when they complete their first $5,000+ project</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Referral List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Referrals ({referrals.length})</CardTitle>
              <CardDescription>Track the status of your referred clients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {referrals.map(referral => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{referral.name}</p>
                          <p className="text-sm text-muted-foreground">{referral.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge
                          variant={
                            referral.status === 'paid'
                              ? 'default'
                              : referral.status === 'converted'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {referral.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Signed up {new Date(referral.signupDate).toLocaleDateString()}
                        </span>
                        {referral.projectsCompleted > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {referral.projectsCompleted} projects
                          </span>
                        )}
                      </div>
                    </div>
                    {referral.rewardAmount > 0 && (
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          ${referral.rewardAmount}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {referral.status === 'paid' ? 'Paid' : 'Pending'}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LOYALTY TAB */}
        <TabsContent value="loyalty" className="space-y-6">
          {/* Current Tier */}
          <Card>
            <CardHeader>
              <CardTitle>Your Loyalty Tier</CardTitle>
              <CardDescription>
                Unlock exclusive benefits as you spend more on KAZI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Current Tier Display */}
                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-lg bg-accent ${currentLoyaltyTier.color}`}>
                    {(() => {
                      const Icon = currentLoyaltyTier.icon
                      return <Icon className="h-8 w-8" />
                    })()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold">{currentLoyaltyTier.name} Tier</h3>
                    <p className="text-muted-foreground">
                      ${currentLoyaltyTier.threshold.spend?.toLocaleString()} spent • {' '}
                      {currentLoyaltyTier.threshold.projects} projects completed
                    </p>

                    {/* Progress to Next Tier */}
                    {currentLoyaltyTier.nextTier && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress to {currentLoyaltyTier.nextTier}</span>
                          <span className="font-semibold">
                            {currentLoyaltyTier.progress}%
                          </span>
                        </div>
                        <Progress value={currentLoyaltyTier.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          $12,500 more to unlock {currentLoyaltyTier.nextTier} benefits
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Current Benefits */}
                <div>
                  <h4 className="font-semibold mb-3">Your Benefits</h4>
                  <div className="grid gap-2">
                    {currentLoyaltyTier.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* All Tiers */}
          <div className="grid gap-4 md:grid-cols-2">
            {loyaltyTiers.map((tier, index) => {
              const Icon = tier.icon
              const isCurrentTier = tier.name === currentLoyaltyTier.name
              const isUnlocked = index <= loyaltyTiers.findIndex(t => t.name === currentLoyaltyTier.name)

              return (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className={isCurrentTier ? 'border-primary border-2' : ''}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-accent ${tier.color}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{tier.name}</CardTitle>
                            <CardDescription className="text-xs">
                              ${tier.threshold.spend?.toLocaleString()} • {tier.threshold.projects} projects
                            </CardDescription>
                          </div>
                        </div>
                        {isCurrentTier && (
                          <Badge>Current</Badge>
                        )}
                        {isUnlocked && !isCurrentTier && (
                          <Check className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {tier.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <Star className={`h-4 w-4 flex-shrink-0 ${isUnlocked ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                            <span className={isUnlocked ? '' : 'text-muted-foreground'}>
                              {benefit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </TabsContent>

        {/* REWARDS TAB */}
        <TabsContent value="rewards" className="space-y-6">
          {/* Rewards Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${referralStats.totalEarned.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Lifetime earnings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${referralStats.pendingRewards.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Processing</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid Out</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${referralStats.paidRewards.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Received</p>
              </CardContent>
            </Card>
          </div>

          {/* Rewards History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Rewards History</CardTitle>
                  <CardDescription>All your earned rewards and bonuses</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rewards.map(reward => (
                  <div
                    key={reward.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-accent">
                        {reward.type === 'referral' && <Users className="h-4 w-4" />}
                        {reward.type === 'milestone' && <Target className="h-4 w-4" />}
                        {reward.type === 'loyalty' && <Trophy className="h-4 w-4" />}
                        {reward.type === 'bonus' && <Zap className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium">{reward.title}</p>
                        <p className="text-sm text-muted-foreground">{reward.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge
                            variant={
                              reward.status === 'paid'
                                ? 'default'
                                : reward.status === 'approved'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {reward.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(reward.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600 text-lg">
                        +${reward.amount}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
