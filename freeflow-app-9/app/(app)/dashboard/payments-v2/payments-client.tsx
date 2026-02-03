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
  CreditCard, DollarSign, TrendingUp, Clock, Search, Filter,
  Download, MoreHorizontal, CheckCircle, XCircle, AlertCircle,
  RefreshCw, ArrowUpRight, ArrowDownLeft, Building2, Globe,
  Shield, Zap, Calendar, ChevronRight, Plus, Wallet, Receipt
} from 'lucide-react'

const demoPayments = [
  { id: 'PAY-001', client: 'TechCorp Inc', amount: 15000, currency: 'USD', status: 'completed', method: 'bank_transfer', date: '2024-01-15', project: 'Website Redesign' },
  { id: 'PAY-002', client: 'StartupXYZ', amount: 8500, currency: 'USD', status: 'completed', method: 'card', date: '2024-01-14', project: 'Mobile App MVP' },
  { id: 'PAY-003', client: 'Global Media', amount: 25000, currency: 'USD', status: 'pending', method: 'crypto', date: '2024-01-13', project: 'Video Production' },
  { id: 'PAY-004', client: 'Local Boutique', amount: 3200, currency: 'USD', status: 'completed', method: 'card', date: '2024-01-12', project: 'Brand Identity' },
  { id: 'PAY-005', client: 'Tech Innovators', amount: 18000, currency: 'USD', status: 'processing', method: 'bank_transfer', date: '2024-01-11', project: 'SaaS Platform' },
  { id: 'PAY-006', client: 'Design Studio', amount: 5600, currency: 'USD', status: 'failed', method: 'card', date: '2024-01-10', project: 'UI/UX Audit' },
  { id: 'PAY-007', client: 'E-commerce Plus', amount: 12000, currency: 'USD', status: 'completed', method: 'paypal', date: '2024-01-09', project: 'Store Integration' },
  { id: 'PAY-008', client: 'Healthcare Pro', amount: 45000, currency: 'USD', status: 'completed', method: 'bank_transfer', date: '2024-01-08', project: 'Patient Portal' },
]

const paymentMethods = [
  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, connected: true, balance: null },
  { id: 'bank', name: 'Bank Account', icon: Building2, connected: true, balance: 45230 },
  { id: 'paypal', name: 'PayPal', icon: Globe, connected: true, balance: 8420 },
  { id: 'crypto', name: 'Crypto Wallet', icon: Wallet, connected: false, balance: null },
]

const scheduledPayments = [
  { id: 1, client: 'Monthly Retainer - TechCorp', amount: 5000, date: '2024-01-20', frequency: 'Monthly' },
  { id: 2, client: 'Project Milestone - StartupXYZ', amount: 4250, date: '2024-01-25', frequency: 'One-time' },
  { id: 3, client: 'Subscription - Global Media', amount: 2500, date: '2024-02-01', frequency: 'Monthly' },
]

export default function PaymentsClient() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredPayments = useMemo(() => {
    return demoPayments.filter(payment => {
      const matchesSearch = payment.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           payment.project.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

  const stats = useMemo(() => {
    const completed = demoPayments.filter(p => p.status === 'completed')
    const pending = demoPayments.filter(p => p.status === 'pending' || p.status === 'processing')
    return {
      totalReceived: completed.reduce((sum, p) => sum + p.amount, 0),
      pendingAmount: pending.reduce((sum, p) => sum + p.amount, 0),
      successRate: Math.round((completed.length / demoPayments.length) * 100),
      avgPayment: Math.round(completed.reduce((sum, p) => sum + p.amount, 0) / completed.length)
    }
  }, [])

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

  const getMethodIcon = (method: string) => {
    const icons = {
      card: <CreditCard className="h-4 w-4" />,
      bank_transfer: <Building2 className="h-4 w-4" />,
      paypal: <Globe className="h-4 w-4" />,
      crypto: <Wallet className="h-4 w-4" />,
    }
    return icons[method as keyof typeof icons] || <CreditCard className="h-4 w-4" />
  }

  const insights = [
    { icon: TrendingUp, title: 'Revenue Up 23%', description: 'Compared to last month' },
    { icon: Zap, title: 'Faster Payments', description: 'Avg. processing time reduced by 2 days' },
    { icon: Shield, title: 'Zero Chargebacks', description: 'Clean record for 90 days' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground mt-1">Manage incoming and outgoing payments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Request Payment
          </Button>
        </div>
      </div>

      <CollapsibleInsightsPanel
        title="Payment Insights"
        insights={insights}
        defaultExpanded={true}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Received</p>
                <p className="text-2xl font-bold">${stats.totalReceived.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" /> +23% from last month
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <ArrowDownLeft className="h-6 w-6 text-green-600" />
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
                <p className="text-xs text-muted-foreground mt-1">2 payments awaiting</p>
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
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{stats.successRate}%</p>
                <Progress value={stats.successRate} className="h-2 mt-2" />
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Payment</p>
                <p className="text-2xl font-bold">${stats.avgPayment.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Per transaction</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">All Payments</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Payment History</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search payments..."
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
                {filteredPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        {getMethodIcon(payment.method)}
                      </div>
                      <div>
                        <p className="font-medium">{payment.client}</p>
                        <p className="text-sm text-muted-foreground">{payment.project}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-semibold">${payment.amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{payment.id}</p>
                      </div>
                      {getStatusBadge(payment.status)}
                      <p className="text-sm text-muted-foreground w-24">{payment.date}</p>
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

        <TabsContent value="methods" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentMethods.map((method) => (
              <Card key={method.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <method.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium">{method.name}</p>
                        {method.balance !== null && (
                          <p className="text-sm text-muted-foreground">Balance: ${method.balance.toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {method.connected ? (
                        <Badge variant="outline" className="bg-green-100 text-green-700">Connected</Badge>
                      ) : (
                        <Button size="sm">Connect</Button>
                      )}
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Scheduled Payments</CardTitle>
                  <CardDescription>Upcoming automatic and recurring payments</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Payment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scheduledPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{payment.client}</p>
                        <p className="text-sm text-muted-foreground">{payment.frequency}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-semibold">${payment.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Due {payment.date}</p>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
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
