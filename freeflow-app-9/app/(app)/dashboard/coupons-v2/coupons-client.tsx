'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import {
  Ticket, Percent, DollarSign, Clock, Search, Plus, Copy, Edit,
  Trash2, MoreHorizontal, CheckCircle, XCircle, Calendar, Users,
  TrendingUp, Tag, Gift, Zap, BarChart3, Eye, AlertCircle
} from 'lucide-react'

const coupons = [
  {
    id: 1,
    code: 'WELCOME20',
    description: '20% off for new users',
    type: 'percentage',
    value: 20,
    usageLimit: 1000,
    usageCount: 456,
    minPurchase: 50,
    status: 'active',
    expiresAt: '2024-03-31',
    createdAt: '2024-01-01',
    applicableTo: 'all'
  },
  {
    id: 2,
    code: 'SAVE50',
    description: '$50 off orders over $200',
    type: 'fixed',
    value: 50,
    usageLimit: 500,
    usageCount: 234,
    minPurchase: 200,
    status: 'active',
    expiresAt: '2024-02-28',
    createdAt: '2024-01-10',
    applicableTo: 'subscription'
  },
  {
    id: 3,
    code: 'FLASH30',
    description: '30% flash sale discount',
    type: 'percentage',
    value: 30,
    usageLimit: 100,
    usageCount: 100,
    minPurchase: 0,
    status: 'exhausted',
    expiresAt: '2024-01-20',
    createdAt: '2024-01-15',
    applicableTo: 'all'
  },
  {
    id: 4,
    code: 'VIP25',
    description: '25% off for VIP customers',
    type: 'percentage',
    value: 25,
    usageLimit: null,
    usageCount: 89,
    minPurchase: 100,
    status: 'active',
    expiresAt: null,
    createdAt: '2023-12-01',
    applicableTo: 'vip'
  },
  {
    id: 5,
    code: 'SUMMER2023',
    description: 'Summer sale 15% off',
    type: 'percentage',
    value: 15,
    usageLimit: 2000,
    usageCount: 1876,
    minPurchase: 0,
    status: 'expired',
    expiresAt: '2023-09-30',
    createdAt: '2023-06-01',
    applicableTo: 'all'
  },
]

const analytics = {
  totalRevenueSaved: 45670,
  totalRedemptions: 2755,
  avgOrderIncrease: 23,
  conversionLift: 18
}

export default function CouponsClient() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const stats = useMemo(() => ({
    activeCoupons: coupons.filter(c => c.status === 'active').length,
    totalRedemptions: coupons.reduce((sum, c) => sum + c.usageCount, 0),
    avgRedemptionRate: Math.round((coupons.reduce((sum, c) => sum + (c.usageLimit ? (c.usageCount / c.usageLimit) * 100 : 0), 0)) / coupons.filter(c => c.usageLimit).length),
  }), [])

  const filteredCoupons = useMemo(() => {
    return coupons.filter(coupon => {
      const matchesSearch = coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           coupon.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesTab = activeTab === 'all' || coupon.status === activeTab
      return matchesSearch && matchesTab
    })
  }, [searchQuery, activeTab])

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      expired: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      exhausted: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    }
    return <Badge variant="outline" className={styles[status as keyof typeof styles]}>{status}</Badge>
  }

  const insights = [
    { icon: Ticket, title: `${stats.activeCoupons} Active`, description: 'Coupon codes' },
    { icon: Users, title: `${stats.totalRedemptions.toLocaleString()}`, description: 'Total redemptions' },
    { icon: TrendingUp, title: `+${analytics.conversionLift}%`, description: 'Conversion lift' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Ticket className="h-8 w-8 text-primary" />
            Coupons & Discounts
          </h1>
          <p className="text-muted-foreground mt-1">Create and manage promotional codes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Coupon
          </Button>
        </div>
      </div>

      <CollapsibleInsightsPanel
        title="Coupon Insights"
        insights={insights}
        defaultExpanded={true}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Coupons</p>
                <p className="text-2xl font-bold">{stats.activeCoupons}</p>
                <p className="text-xs text-muted-foreground mt-1">Currently running</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Ticket className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Redemptions</p>
                <p className="text-2xl font-bold">{stats.totalRedemptions.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">+245 this week</p>
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
                <p className="text-sm text-muted-foreground">Revenue Impact</p>
                <p className="text-2xl font-bold">${(analytics.totalRevenueSaved / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground mt-1">Customer savings</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Order Increase</p>
                <p className="text-2xl font-bold">+{analytics.avgOrderIncrease}%</p>
                <p className="text-xs text-green-600 mt-1">With coupons applied</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Coupons</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
          <TabsTrigger value="exhausted">Exhausted</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Coupon Codes</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search coupons..."
                    className="pl-9 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredCoupons.map((coupon) => (
                  <div key={coupon.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        {coupon.type === 'percentage' ? (
                          <Percent className="h-6 w-6 text-primary" />
                        ) : (
                          <DollarSign className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-muted rounded font-mono font-bold">{coupon.code}</code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyCode(coupon.code)}
                          >
                            {copiedCode === coupon.code ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          {getStatusBadge(coupon.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{coupon.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          {coupon.minPurchase > 0 && (
                            <span>Min. ${coupon.minPurchase}</span>
                          )}
                          {coupon.expiresAt && (
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Expires {coupon.expiresAt}
                            </span>
                          )}
                          <Badge variant="outline" className="text-xs">{coupon.applicableTo}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="w-32">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{coupon.usageCount}</span>
                          <span className="text-muted-foreground">
                            {coupon.usageLimit ? `/ ${coupon.usageLimit}` : 'Unlimited'}
                          </span>
                        </div>
                        {coupon.usageLimit && (
                          <Progress value={(coupon.usageCount / coupon.usageLimit) * 100} className="h-2" />
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">
                          {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}
                        </p>
                        <p className="text-xs text-muted-foreground">OFF</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={coupon.status === 'active'} />
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
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
