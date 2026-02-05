'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Heart, Star, Gift, Crown, Sparkles, TrendingUp, Clock,
  CheckCircle2, ArrowRight, Award, Zap, Users, Calendar,
  CreditCard, Percent, Tag, ShoppingBag, Ticket, Coffee
} from 'lucide-react'

// Demo data
const demoLoyaltyStats = {
  tier: 'Gold',
  points: 15420,
  pointsToNext: 20000,
  lifetimePoints: 45000,
  memberSince: '2023-06-15',
  referrals: 8,
  savings: 1250,
}

const loyaltyTiers = [
  { name: 'Bronze', minPoints: 0, color: 'from-amber-600 to-amber-700', benefits: ['5% discount', 'Birthday reward', 'Early access'] },
  { name: 'Silver', minPoints: 5000, color: 'from-gray-400 to-gray-500', benefits: ['10% discount', 'Priority support', 'Exclusive offers'] },
  { name: 'Gold', minPoints: 10000, color: 'from-yellow-400 to-yellow-600', benefits: ['15% discount', 'Free shipping', 'VIP events'] },
  { name: 'Platinum', minPoints: 20000, color: 'from-slate-300 to-slate-500', benefits: ['20% discount', 'Personal manager', 'Custom rewards'] },
  { name: 'Diamond', minPoints: 50000, color: 'from-cyan-300 to-blue-500', benefits: ['25% discount', 'All benefits', 'Unlimited perks'] },
]

const demoRewards = [
  { id: '1', name: '$10 Credit', points: 1000, icon: CreditCard, category: 'credit' },
  { id: '2', name: '$25 Credit', points: 2000, icon: CreditCard, category: 'credit' },
  { id: '3', name: '$50 Credit', points: 4000, icon: CreditCard, category: 'credit' },
  { id: '4', name: 'Free Month Pro', points: 5000, icon: Crown, category: 'subscription' },
  { id: '5', name: '50% Off Next Purchase', points: 3000, icon: Percent, category: 'discount' },
  { id: '6', name: 'Exclusive Badge', points: 1500, icon: Award, category: 'cosmetic' },
  { id: '7', name: 'Priority Support', points: 2500, icon: Zap, category: 'service' },
  { id: '8', name: 'Early Access Pass', points: 2000, icon: Ticket, category: 'access' },
]

const demoHistory = [
  { id: '1', action: 'Project completed', points: 500, date: '2024-01-28', type: 'earned' },
  { id: '2', action: 'Referral bonus', points: 1000, date: '2024-01-25', type: 'earned' },
  { id: '3', action: 'Redeemed $10 credit', points: -1000, date: '2024-01-22', type: 'redeemed' },
  { id: '4', action: 'Monthly bonus', points: 200, date: '2024-01-20', type: 'earned' },
  { id: '5', action: 'Client payment', points: 350, date: '2024-01-18', type: 'earned' },
  { id: '6', action: '5-star review received', points: 150, date: '2024-01-15', type: 'earned' },
  { id: '7', action: 'Redeemed badge', points: -1500, date: '2024-01-12', type: 'redeemed' },
  { id: '8', action: 'Streak bonus', points: 100, date: '2024-01-10', type: 'earned' },
]

const demoOffers = [
  { id: '1', title: 'Double Points Weekend', description: 'Earn 2x points on all activities', expires: '2 days', multiplier: 2 },
  { id: '2', title: 'Referral Boost', description: 'Get 1500 points per referral', expires: '5 days', bonus: 500 },
  { id: '3', title: 'Flash Sale', description: '30% off all reward redemptions', expires: '24 hours', discount: 30 },
]

export default function LoyaltyClient() {
  const [activeTab, setActiveTab] = useState('overview')

  const currentTierIndex = loyaltyTiers.findIndex(t => t.name === demoLoyaltyStats.tier)
  const nextTier = loyaltyTiers[currentTierIndex + 1]
  const progressToNext = nextTier ? ((demoLoyaltyStats.points - loyaltyTiers[currentTierIndex].minPoints) / (nextTier.minPoints - loyaltyTiers[currentTierIndex].minPoints)) * 100 : 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 dark:bg-none dark:bg-gray-900">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
                Loyalty Program
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Earn points, unlock rewards, and enjoy exclusive benefits
              </p>
            </div>
          </div>
          <Badge className={`bg-gradient-to-r ${loyaltyTiers[currentTierIndex].color} text-white border-0 px-4 py-2 text-lg`}>
            <Crown className="w-5 h-5 mr-2" />
            {demoLoyaltyStats.tier} Member
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-rose-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Star className="w-8 h-8 opacity-80" />
                <Badge variant="secondary" className="bg-white/20 text-white border-0">Available</Badge>
              </div>
              <div className="text-3xl font-bold mb-1">{demoLoyaltyStats.points.toLocaleString()}</div>
              <p className="text-rose-100 text-sm">Points Balance</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <Badge variant="outline" className="border-green-200 text-green-600">Lifetime</Badge>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{demoLoyaltyStats.lifetimePoints.toLocaleString()}</div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Total Points Earned</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-blue-500" />
                <Badge variant="outline" className="border-blue-200 text-blue-600">Referrals</Badge>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{demoLoyaltyStats.referrals}</div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Friends Referred</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Gift className="w-8 h-8 text-purple-500" />
                <Badge variant="outline" className="border-purple-200 text-purple-600">Savings</Badge>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">${demoLoyaltyStats.savings}</div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Total Saved</p>
            </CardContent>
          </Card>
        </div>

        {/* Tier Progress */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Tier Progress</h3>
              {nextTier && <span className="text-sm text-slate-500">{(nextTier.minPoints - demoLoyaltyStats.points).toLocaleString()} points to {nextTier.name}</span>}
            </div>
            <div className="flex items-center gap-2 mb-4">
              {loyaltyTiers.map((tier, index) => (
                <div key={tier.name} className="flex-1">
                  <div className={`h-3 rounded-full ${index <= currentTierIndex ? `bg-gradient-to-r ${tier.color}` : 'bg-slate-200 dark:bg-slate-700'}`} />
                  <p className={`text-xs mt-1 text-center ${index <= currentTierIndex ? 'font-semibold' : 'text-slate-400'}`}>{tier.name}</p>
                </div>
              ))}
            </div>
            <Progress value={progressToNext} className="h-2" />
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Special Offers */}
              <Card className="lg:col-span-2 border-0 shadow-lg bg-white/80 dark:bg-slate-900/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    Special Offers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {demoOffers.map((offer) => (
                      <div key={offer.id} className="p-4 rounded-lg border bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-900/20 dark:to-orange-900/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{offer.title}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{offer.description}</p>
                            <p className="text-xs text-rose-600 mt-1">Expires in {offer.expires}</p>
                          </div>
                          <Button onClick={() => toast.success(`Activated: ${offer.title}`)}>Activate</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Redeem */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-rose-500" />
                    Quick Redeem
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {demoRewards.slice(0, 4).map((reward) => (
                      <div key={reward.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                            <reward.icon className="w-5 h-5 text-rose-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{reward.name}</p>
                            <p className="text-xs text-slate-500">{reward.points.toLocaleString()} pts</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" disabled={demoLoyaltyStats.points < reward.points} onClick={() => toast.success(`Redeemed: ${reward.name}`)}>
                          Redeem
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rewards">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Reward Catalog</CardTitle>
                    <CardDescription>Redeem your points for exclusive rewards</CardDescription>
                  </div>
                  <Badge className="bg-gradient-to-r from-rose-500 to-orange-500 text-white border-0 px-4 py-2">
                    <Star className="w-4 h-4 mr-2" />
                    {demoLoyaltyStats.points.toLocaleString()} pts
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {demoRewards.map((reward) => (
                    <div key={reward.id} className="p-6 rounded-lg border hover:shadow-lg transition-shadow">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-100 to-orange-100 dark:from-rose-900/30 dark:to-orange-900/30 flex items-center justify-center mb-4">
                        <reward.icon className="w-7 h-7 text-rose-600" />
                      </div>
                      <h3 className="font-semibold mb-1">{reward.name}</h3>
                      <Badge variant="outline" className="mb-4">{reward.category}</Badge>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-rose-600">
                          <Star className="w-4 h-4" />
                          <span className="font-bold">{reward.points.toLocaleString()}</span>
                        </div>
                        <Button size="sm" disabled={demoLoyaltyStats.points < reward.points} onClick={() => toast.success(`Redeemed: ${reward.name}`)}>
                          Redeem
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80">
              <CardHeader>
                <CardTitle>Points History</CardTitle>
                <CardDescription>Track your points activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {demoHistory.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.type === 'earned' ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-600'}`}>
                            {item.type === 'earned' ? <TrendingUp className="w-5 h-5" /> : <Gift className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-medium">{item.action}</p>
                            <p className="text-sm text-slate-500">{item.date}</p>
                          </div>
                        </div>
                        <span className={`font-bold text-lg ${item.type === 'earned' ? 'text-green-600' : 'text-rose-600'}`}>
                          {item.type === 'earned' ? '+' : ''}{item.points.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="benefits">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loyaltyTiers.map((tier, index) => (
                <Card key={tier.name} className={`border-0 shadow-lg ${index <= currentTierIndex ? 'bg-white/80 dark:bg-slate-900/80' : 'bg-slate-100 dark:bg-slate-900 opacity-60'}`}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center`}>
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle>{tier.name}</CardTitle>
                        <CardDescription>{tier.minPoints.toLocaleString()}+ points</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {tier.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className={`w-4 h-4 ${index <= currentTierIndex ? 'text-green-500' : 'text-slate-400'}`} />
                          <span className="text-sm">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                    {index === currentTierIndex && (
                      <Badge className="mt-4 w-full justify-center bg-gradient-to-r from-rose-500 to-orange-500 text-white border-0">
                        Current Tier
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
