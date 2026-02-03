'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Users, Gift, DollarSign, Share2, Copy, Link2, TrendingUp,
  Mail, MessageSquare, Twitter, Facebook, Linkedin, Award,
  Target, Zap, CheckCircle, Clock, ArrowRight, ExternalLink,
  Sparkles, Trophy, Star, Crown
} from 'lucide-react'
import { toast } from 'sonner'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'

interface Referral {
  id: string
  name: string
  email: string
  status: 'pending' | 'signed_up' | 'converted' | 'paid'
  signedUpAt?: string
  convertedAt?: string
  earnings: number
  tier: 'free' | 'pro' | 'enterprise'
}

const demoReferrals: Referral[] = [
  { id: '1', name: 'John Smith', email: 'john@example.com', status: 'paid', signedUpAt: '2024-01-15', convertedAt: '2024-01-20', earnings: 50, tier: 'pro' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', status: 'converted', signedUpAt: '2024-01-22', convertedAt: '2024-01-28', earnings: 100, tier: 'enterprise' },
  { id: '3', name: 'Mike Davis', email: 'mike@example.com', status: 'signed_up', signedUpAt: '2024-02-01', earnings: 0, tier: 'free' },
  { id: '4', name: 'Emily Chen', email: 'emily@example.com', status: 'signed_up', signedUpAt: '2024-02-05', earnings: 0, tier: 'free' },
  { id: '5', name: 'Robert Wilson', email: 'robert@example.com', status: 'pending', earnings: 0, tier: 'free' },
  { id: '6', name: 'Lisa Brown', email: 'lisa@example.com', status: 'paid', signedUpAt: '2024-01-10', convertedAt: '2024-01-15', earnings: 50, tier: 'pro' },
]

const tiers = [
  { name: 'Bronze', minReferrals: 0, commission: 10, color: 'from-amber-600 to-amber-700', perks: ['10% commission', 'Email support'] },
  { name: 'Silver', minReferrals: 5, commission: 15, color: 'from-slate-400 to-slate-500', perks: ['15% commission', 'Priority support', 'Monthly bonus'] },
  { name: 'Gold', minReferrals: 15, commission: 20, color: 'from-yellow-500 to-amber-500', perks: ['20% commission', 'Dedicated manager', 'Quarterly bonus', 'Custom link'] },
  { name: 'Platinum', minReferrals: 30, commission: 25, color: 'from-slate-300 to-slate-400', perks: ['25% commission', 'VIP support', 'Monthly bonus', 'Custom materials', 'Early access'] },
]

const getStatusColor = (status: Referral['status']) => {
  switch (status) {
    case 'pending': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
    case 'signed_up': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'converted': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
    case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  }
}

const getStatusIcon = (status: Referral['status']) => {
  switch (status) {
    case 'pending': return <Clock className="h-4 w-4" />
    case 'signed_up': return <Users className="h-4 w-4" />
    case 'converted': return <CheckCircle className="h-4 w-4" />
    case 'paid': return <DollarSign className="h-4 w-4" />
  }
}

export default function ReferralsClient() {
  const [referrals] = useState<Referral[]>(demoReferrals)
  const [activeTab, setActiveTab] = useState('overview')
  const referralLink = 'https://kazi.app/ref/ABC123XYZ'
  const referralCode = 'ABC123XYZ'

  const totalReferrals = referrals.length
  const convertedReferrals = referrals.filter(r => ['converted', 'paid'].includes(r.status)).length
  const totalEarnings = referrals.reduce((sum, r) => sum + r.earnings, 0)
  const pendingEarnings = referrals.filter(r => r.status === 'converted').reduce((sum, r) => sum + r.earnings, 0)

  const currentTierIndex = tiers.findIndex(t => totalReferrals < t.minReferrals) - 1
  const currentTier = tiers[Math.max(0, currentTierIndex)] || tiers[tiers.length - 1]
  const nextTier = tiers[currentTierIndex + 1]
  const progressToNextTier = nextTier
    ? ((totalReferrals - currentTier.minReferrals) / (nextTier.minReferrals - currentTier.minReferrals)) * 100
    : 100

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${type} copied to clipboard!`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              <Gift className="h-8 w-8 text-indigo-600" />
              Referral Program
            </h1>
            <p className="text-muted-foreground mt-1">Earn rewards by inviting friends and colleagues</p>
          </div>
          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
            <Share2 className="h-4 w-4 mr-2" />
            Invite Friends
          </Button>
        </div>

        {/* AI Insights */}
        <CollapsibleInsightsPanel
          title="Referral Insights"
          insights={[
            { label: 'Total Referrals', value: totalReferrals.toString(), change: '+3', changeType: 'positive' },
            { label: 'Conversions', value: convertedReferrals.toString(), change: '+2', changeType: 'positive' },
            { label: 'Total Earnings', value: `$${totalEarnings}`, change: '+$150', changeType: 'positive' },
            { label: 'Conversion Rate', value: `${Math.round((convertedReferrals / totalReferrals) * 100) || 0}%`, change: '+5%', changeType: 'positive' }
          ]}
          recommendations={[
            'Share your referral link on LinkedIn for 40% higher conversions',
            '3 referrals away from Silver tier - unlock 15% commission',
            'Best performing channel: Email invites (65% conversion)'
          ]}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm">Total Referrals</p>
                  <p className="text-2xl font-bold">{totalReferrals}</p>
                </div>
                <Users className="h-8 w-8 text-indigo-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Earnings</p>
                  <p className="text-2xl font-bold">${totalEarnings}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">Pending</p>
                  <p className="text-2xl font-bold">${pendingEarnings}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Current Tier</p>
                  <p className="text-2xl font-bold">{currentTier.name}</p>
                </div>
                <Crown className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-indigo-600" />
              Your Referral Link
            </CardTitle>
            <CardDescription>Share this link to earn rewards for each signup</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={referralLink} readOnly className="font-mono text-sm" />
              <Button variant="outline" onClick={() => copyToClipboard(referralLink, 'Link')}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Your code:</span>
              <Badge variant="secondary" className="font-mono text-lg px-4 py-1">{referralCode}</Badge>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(referralCode, 'Code')}>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button variant="outline" size="sm">
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              <Button variant="outline" size="sm">
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
              <Button variant="outline" size="sm">
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="referrals">My Referrals ({totalReferrals})</TabsTrigger>
            <TabsTrigger value="rewards">Rewards & Tiers</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-4">
            {/* Tier Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  Tier Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={`bg-gradient-to-r ${currentTier.color} text-white`}>{currentTier.name}</Badge>
                      <span className="text-muted-foreground">{currentTier.commission}% commission</span>
                    </div>
                    {nextTier && (
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline">{nextTier.name}</Badge>
                        <span className="text-muted-foreground">{nextTier.minReferrals - totalReferrals} referrals to go</span>
                      </div>
                    )}
                  </div>
                  <Progress value={progressToNextTier} className="h-3" />
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    {tiers.map((tier, i) => (
                      <div key={tier.name} className={`p-3 rounded-lg border ${i <= currentTierIndex ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'bg-muted/50'}`}>
                        <div className="font-semibold">{tier.name}</div>
                        <div className="text-sm text-muted-foreground">{tier.minReferrals}+ referrals</div>
                        <div className="text-lg font-bold text-indigo-600">{tier.commission}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { icon: Share2, title: 'Share Your Link', description: 'Send your unique referral link to friends and colleagues' },
                    { icon: Users, title: 'They Sign Up', description: 'When they create an account, you get credit' },
                    { icon: Zap, title: 'They Upgrade', description: 'When they subscribe to a paid plan, you earn commission' },
                    { icon: DollarSign, title: 'Get Paid', description: 'Receive your earnings via PayPal or credit' }
                  ].map((step, i) => (
                    <div key={i} className="text-center">
                      <div className="w-12 h-12 mx-auto bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-3">
                        <step.icon className="h-6 w-6 text-indigo-600" />
                      </div>
                      <h4 className="font-semibold mb-1">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrals" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>My Referrals</CardTitle>
                <CardDescription>Track the status of people you've referred</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {referrals.map(referral => (
                    <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-indigo-600">{referral.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="font-semibold">{referral.name}</div>
                          <div className="text-sm text-muted-foreground">{referral.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(referral.status)}>
                          {getStatusIcon(referral.status)}
                          <span className="ml-1 capitalize">{referral.status.replace('_', ' ')}</span>
                        </Badge>
                        {referral.earnings > 0 && (
                          <span className="font-semibold text-green-600">${referral.earnings}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tiers.map((tier, i) => (
                <Card key={tier.name} className={i <= currentTierIndex ? 'ring-2 ring-indigo-500' : ''}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge className={`bg-gradient-to-r ${tier.color} text-white`}>{tier.name}</Badge>
                      {i <= currentTierIndex && <CheckCircle className="h-5 w-5 text-green-500" />}
                    </CardTitle>
                    <CardDescription>{tier.minReferrals}+ successful referrals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-indigo-600 mb-4">{tier.commission}% Commission</div>
                    <ul className="space-y-2">
                      {tier.perks.map((perk, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {perk}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  Top Referrers This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { rank: 1, name: 'Alex Thompson', referrals: 45, earnings: 2250, avatar: 'AT' },
                    { rank: 2, name: 'Maria Garcia', referrals: 38, earnings: 1900, avatar: 'MG' },
                    { rank: 3, name: 'James Wilson', referrals: 32, earnings: 1600, avatar: 'JW' },
                    { rank: 4, name: 'You', referrals: totalReferrals, earnings: totalEarnings, avatar: 'YO', isYou: true },
                    { rank: 5, name: 'Sarah Lee', referrals: 18, earnings: 900, avatar: 'SL' },
                  ].sort((a, b) => b.referrals - a.referrals).map((user, i) => (
                    <div key={i} className={`flex items-center justify-between p-4 rounded-lg ${user.isYou ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800' : 'border'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${i === 0 ? 'bg-amber-500 text-white' : i === 1 ? 'bg-slate-400 text-white' : i === 2 ? 'bg-amber-700 text-white' : 'bg-muted'}`}>
                          {i + 1}
                        </div>
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-indigo-600">{user.avatar}</span>
                        </div>
                        <div>
                          <div className="font-semibold">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.referrals} referrals</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">${user.earnings}</div>
                        <div className="text-sm text-muted-foreground">earned</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
