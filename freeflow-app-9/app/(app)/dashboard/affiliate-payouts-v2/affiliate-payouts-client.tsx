'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import {
  DollarSign, Users, TrendingUp, Clock, Search, Filter, Download,
  CheckCircle, XCircle, AlertCircle, CreditCard, Wallet, Calendar,
  MoreHorizontal, ArrowUpRight, ArrowDownLeft, Send, RefreshCw,
  Building2, Globe, Banknote, PiggyBank, Receipt, FileText
} from 'lucide-react'

const payouts = [
  { id: 'PO-001', affiliate: 'John Smith', email: 'john@affiliates.com', amount: 1250, method: 'bank_transfer', status: 'completed', date: '2024-01-15', referrals: 25 },
  { id: 'PO-002', affiliate: 'Sarah Johnson', email: 'sarah@partners.io', amount: 890, method: 'paypal', status: 'completed', date: '2024-01-14', referrals: 18 },
  { id: 'PO-003', affiliate: 'Mike Chen', email: 'mike@influencer.co', amount: 2340, method: 'bank_transfer', status: 'pending', date: '2024-01-13', referrals: 47 },
  { id: 'PO-004', affiliate: 'Emily Davis', email: 'emily@creators.net', amount: 560, method: 'crypto', status: 'processing', date: '2024-01-12', referrals: 11 },
  { id: 'PO-005', affiliate: 'Alex Wilson', email: 'alex@marketer.com', amount: 3100, method: 'bank_transfer', status: 'completed', date: '2024-01-11', referrals: 62 },
  { id: 'PO-006', affiliate: 'Lisa Wang', email: 'lisa@agency.co', amount: 1780, method: 'paypal', status: 'failed', date: '2024-01-10', referrals: 35 },
]

const topAffiliates = [
  { name: 'Alex Wilson', earnings: 15400, referrals: 312, conversion: 8.2, tier: 'Diamond' },
  { name: 'John Smith', earnings: 12300, referrals: 246, conversion: 7.5, tier: 'Platinum' },
  { name: 'Sarah Johnson', earnings: 9800, referrals: 198, conversion: 6.8, tier: 'Gold' },
  { name: 'Mike Chen', earnings: 7600, referrals: 152, conversion: 6.2, tier: 'Gold' },
]

const pendingPayouts = [
  { affiliate: 'Mike Chen', amount: 2340, threshold: 100, eligible: true, referrals: 47 },
  { affiliate: 'Emily Davis', amount: 560, threshold: 100, eligible: true, referrals: 11 },
  { affiliate: 'Tom Brown', amount: 85, threshold: 100, eligible: false, referrals: 4 },
]

export default function AffiliatePayoutsClient() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const stats = useMemo(() => {
    const completed = payouts.filter(p => p.status === 'completed')
    const pending = payouts.filter(p => p.status === 'pending' || p.status === 'processing')
    return {
      totalPaid: completed.reduce((sum, p) => sum + p.amount, 0),
      pendingAmount: pending.reduce((sum, p) => sum + p.amount, 0),
      activeAffiliates: new Set(payouts.map(p => p.affiliate)).size,
      avgPayout: Math.round(completed.reduce((sum, p) => sum + p.amount, 0) / completed.length)
    }
  }, [])

  const filteredPayouts = useMemo(() => {
    return payouts.filter(payout => {
      const matchesSearch = payout.affiliate.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           payout.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           payout.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || payout.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    }
    const icons = {
      completed: <CheckCircle className="h-3 w-3 mr-1" />,
      pending: <Clock className="h-3 w-3 mr-1" />,
      processing: <RefreshCw className="h-3 w-3 mr-1 animate-spin" />,
      failed: <XCircle className="h-3 w-3 mr-1" />,
    }
    return (
      <Badge variant="outline" className={`${styles[status as keyof typeof styles]} flex items-center`}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getTierBadge = (tier: string) => {
    const styles = {
      Diamond: 'bg-blue-100 text-blue-700 border-blue-300',
      Platinum: 'bg-purple-100 text-purple-700 border-purple-300',
      Gold: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      Silver: 'bg-gray-100 text-gray-700 border-gray-300',
    }
    return <Badge variant="outline" className={styles[tier as keyof typeof styles]}>{tier}</Badge>
  }

  const getMethodIcon = (method: string) => {
    const icons = {
      bank_transfer: <Building2 className="h-4 w-4" />,
      paypal: <Globe className="h-4 w-4" />,
      crypto: <Wallet className="h-4 w-4" />,
    }
    return icons[method as keyof typeof icons] || <CreditCard className="h-4 w-4" />
  }

  const insights = [
    { icon: DollarSign, title: `$${stats.totalPaid.toLocaleString()} Paid`, description: 'Total commissions paid' },
    { icon: Users, title: `${stats.activeAffiliates} Affiliates`, description: 'Active partners' },
    { icon: TrendingUp, title: '+18% Growth', description: 'Month over month' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Banknote className="h-8 w-8 text-green-600" />
            Affiliate Payouts
          </h1>
          <p className="text-muted-foreground mt-1">Manage commission payments to affiliates</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Send className="h-4 w-4 mr-2" />
            Process Payouts
          </Button>
        </div>
      </div>

      <CollapsibleInsightsPanel
        title="Payout Insights"
        insights={insights}
        defaultExpanded={true}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold">${stats.totalPaid.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" /> +$3,200 this month
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">${stats.pendingAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">3 payouts awaiting</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Affiliates</p>
                <p className="text-2xl font-bold">{stats.activeAffiliates}</p>
                <p className="text-xs text-muted-foreground mt-1">Earning commissions</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Payout</p>
                <p className="text-2xl font-bold">${stats.avgPayout.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Per transaction</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Receipt className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">All Payouts</TabsTrigger>
          <TabsTrigger value="pending">Pending Queue</TabsTrigger>
          <TabsTrigger value="affiliates">Top Affiliates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Payout History</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search payouts..."
                      className="pl-9 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredPayouts.map((payout) => (
                  <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        {getMethodIcon(payout.method)}
                      </div>
                      <div>
                        <p className="font-medium">{payout.affiliate}</p>
                        <p className="text-sm text-muted-foreground">{payout.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="font-semibold">{payout.referrals}</p>
                        <p className="text-xs text-muted-foreground">Referrals</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">${payout.amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{payout.id}</p>
                      </div>
                      {getStatusBadge(payout.status)}
                      <p className="text-sm text-muted-foreground w-24">{payout.date}</p>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pending Payout Queue</CardTitle>
                  <CardDescription>Affiliates eligible for commission payout</CardDescription>
                </div>
                <Button>
                  <Send className="h-4 w-4 mr-2" />
                  Process All Eligible
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingPayouts.map((payout, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>{payout.affiliate.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{payout.affiliate}</p>
                        <p className="text-sm text-muted-foreground">{payout.referrals} referrals this period</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-semibold text-green-600">${payout.amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Min. ${payout.threshold}</p>
                      </div>
                      {payout.eligible ? (
                        <Badge className="bg-green-100 text-green-700">Eligible</Badge>
                      ) : (
                        <Badge variant="secondary">Below Threshold</Badge>
                      )}
                      <Button variant="outline" size="sm" disabled={!payout.eligible}>
                        <Send className="h-4 w-4 mr-1" />
                        Pay Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="affiliates" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Affiliates</CardTitle>
              <CardDescription>Highest earning partners this year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topAffiliates.map((affiliate, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{affiliate.name}</p>
                          {getTierBadge(affiliate.tier)}
                        </div>
                        <p className="text-sm text-muted-foreground">{affiliate.referrals} total referrals</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <p className="font-semibold">{affiliate.conversion}%</p>
                        <p className="text-xs text-muted-foreground">Conversion</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">${affiliate.earnings.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Total earnings</p>
                      </div>
                      <Button variant="outline" size="sm">View Profile</Button>
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
