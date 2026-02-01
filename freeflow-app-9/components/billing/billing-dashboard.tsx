'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'
import { UsageChart } from './usage-chart'

interface BillingMetrics {
  mrr: number
  arr: number
  activeSubscriptions: number
  churnRate: number
  ltv: number
  arpu: number
  revenueGrowth: number
  netRevenue: number
}

interface Subscription {
  id: string
  plan: string
  status: string
  currentPeriodEnd: string
  amount: number
  interval: string
}

interface Invoice {
  id: string
  number: string
  amount: number
  status: string
  dueDate: string
  paidAt?: string
}

interface UsageData {
  name: string
  current: number
  limit: number
  unit: string
}

export function BillingDashboard() {
  const [metrics, setMetrics] = useState<BillingMetrics | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [usage, setUsage] = useState<UsageData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchBillingData()
  }, [])

  const fetchBillingData = async () => {
    setLoading(true)
    try {
      // Fetch billing dashboard metrics
      const metricsRes = await fetch('/api/billing/dashboard')
      if (metricsRes.ok) {
        const data = await metricsRes.json()
        setMetrics(data.metrics)
      }

      // Fetch current subscription
      const subRes = await fetch('/api/billing/subscriptions')
      if (subRes.ok) {
        const data = await subRes.json()
        if (data.subscriptions?.length > 0) {
          const sub = data.subscriptions[0]
          setSubscription({
            id: sub.id,
            plan: sub.plans?.name || 'Unknown',
            status: sub.status,
            currentPeriodEnd: sub.current_period_end,
            amount: sub.plans?.price || 0,
            interval: sub.plans?.interval || 'month'
          })
        }
      }

      // Fetch recent invoices
      const invRes = await fetch('/api/billing/invoices')
      if (invRes.ok) {
        const data = await invRes.json()
        setInvoices(data.invoices?.slice(0, 5).map((inv: any) => ({
          id: inv.id,
          number: inv.number || `INV-${inv.id.slice(0, 8)}`,
          amount: inv.total,
          status: inv.status,
          dueDate: inv.due_date,
          paidAt: inv.paid_at
        })) || [])
      }

      // Fetch usage data
      const usageRes = await fetch('/api/billing/usage')
      if (usageRes.ok) {
        const data = await usageRes.json()
        setUsage([
          { name: 'API Calls', current: data.usage?.api_calls || 0, limit: data.limits?.api_calls || 10000, unit: 'calls' },
          { name: 'Storage', current: data.usage?.storage_gb || 0, limit: data.limits?.storage_gb || 10, unit: 'GB' },
          { name: 'AI Tokens', current: data.usage?.ai_tokens || 0, limit: data.limits?.ai_tokens || 100000, unit: 'tokens' },
          { name: 'Video Minutes', current: data.usage?.video_minutes || 0, limit: data.limits?.video_minutes || 60, unit: 'min' }
        ])
      }
    } catch (error) {
      console.error('Failed to fetch billing data:', error)
      toast.error('Failed to load billing data')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-500'
      case 'paid': return 'bg-green-500/10 text-green-500'
      case 'pending': return 'bg-yellow-500/10 text-yellow-500'
      case 'failed': return 'bg-red-500/10 text-red-500'
      case 'cancelled': return 'bg-gray-500/10 text-gray-500'
      case 'past_due': return 'bg-red-500/10 text-red-500'
      default: return 'bg-gray-500/10 text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'paid':
        return <CheckCircle className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'failed':
      case 'past_due':
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const handleExportReport = async () => {
    try {
      const res = await fetch('/api/billing/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'export-report', format: 'csv' })
      })
      if (res.ok) {
        const data = await res.json()
        // Create download link
        const blob = new Blob([data.report], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `billing-report-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Report exported successfully')
      }
    } catch (error) {
      toast.error('Failed to export report')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Billing Dashboard</h2>
          <p className="text-muted-foreground">Manage your subscription, invoices, and usage</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchBillingData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.mrr)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {metrics.revenueGrowth >= 0 ? (
                  <>
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                    <span className="text-green-500">+{metrics.revenueGrowth}%</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                    <span className="text-red-500">{metrics.revenueGrowth}%</span>
                  </>
                )}
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Annual Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.arr)}</div>
              <p className="text-xs text-muted-foreground">
                Projected from current MRR
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeSubscriptions}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.churnRate}% monthly churn
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Revenue Per User</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.arpu)}</div>
              <p className="text-xs text-muted-foreground">
                LTV: {formatCurrency(metrics.ltv)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Current Subscription */}
          <Card>
            <CardHeader>
              <CardTitle>Current Subscription</CardTitle>
              <CardDescription>Your active plan and billing details</CardDescription>
            </CardHeader>
            <CardContent>
              {subscription ? (
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold">{subscription.plan}</h3>
                      <Badge className={getStatusColor(subscription.status)}>
                        {getStatusIcon(subscription.status)}
                        <span className="ml-1">{subscription.status}</span>
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">
                      {formatCurrency(subscription.amount)}/{subscription.interval}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Next billing: {formatDate(subscription.currentPeriodEnd)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => toast.info('Coming Soon', { description: 'Plan management will be available in the next release' })}>Change Plan</Button>
                    <Button variant="outline" onClick={() => toast.info('Coming Soon', { description: 'Payment method updates are coming soon' })}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Update Payment
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">No active subscription</p>
                  <Button onClick={() => toast.info('Coming Soon', { description: 'Subscription plans will be available soon' })}>View Plans</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Usage Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Overview</CardTitle>
              <CardDescription>Current period usage across features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {usage.map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="text-muted-foreground">
                      {item.current.toLocaleString()} / {item.limit.toLocaleString()} {item.unit}
                    </span>
                  </div>
                  <Progress
                    value={(item.current / item.limit) * 100}
                    className={item.current / item.limit > 0.9 ? 'bg-red-200' : ''}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage">
          <UsageChart />
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>Your billing history</CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded-lg">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{invoice.number}</p>
                          <p className="text-sm text-muted-foreground">
                            Due {formatDate(invoice.dueDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                        <span className="font-semibold">{formatCurrency(invoice.amount)}</span>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No invoices yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default BillingDashboard
