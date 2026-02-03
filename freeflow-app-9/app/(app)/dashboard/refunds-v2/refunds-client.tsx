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
import { Textarea } from '@/components/ui/textarea'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import {
  RotateCcw, DollarSign, Clock, Search, Filter, CheckCircle,
  XCircle, AlertCircle, MoreHorizontal, CreditCard, Building2,
  Wallet, TrendingDown, Calendar, FileText, Send, MessageSquare,
  ArrowLeft, User, Package
} from 'lucide-react'

const refunds = [
  {
    id: 'REF-001',
    orderId: 'ORD-1234',
    customer: 'John Smith',
    email: 'john@example.com',
    amount: 149.99,
    reason: 'Product not as described',
    status: 'pending',
    requestedAt: '2024-01-15',
    method: 'original_payment',
    items: ['Premium Plan - 1 Month']
  },
  {
    id: 'REF-002',
    orderId: 'ORD-1189',
    customer: 'Sarah Johnson',
    email: 'sarah@startup.io',
    amount: 299.99,
    reason: 'Changed mind',
    status: 'approved',
    requestedAt: '2024-01-14',
    method: 'store_credit',
    items: ['Business Plan - 3 Months']
  },
  {
    id: 'REF-003',
    orderId: 'ORD-1156',
    customer: 'Mike Chen',
    email: 'mike@agency.co',
    amount: 49.99,
    reason: 'Technical issues',
    status: 'processing',
    requestedAt: '2024-01-13',
    method: 'original_payment',
    items: ['Add-on: Extra Storage']
  },
  {
    id: 'REF-004',
    orderId: 'ORD-1098',
    customer: 'Emily Davis',
    email: 'emily@design.co',
    amount: 599.99,
    reason: 'Duplicate charge',
    status: 'completed',
    requestedAt: '2024-01-12',
    method: 'original_payment',
    items: ['Enterprise Plan - Annual']
  },
  {
    id: 'REF-005',
    orderId: 'ORD-1067',
    customer: 'Tom Wilson',
    email: 'tom@enterprise.com',
    amount: 79.99,
    reason: 'Service not used',
    status: 'rejected',
    requestedAt: '2024-01-10',
    method: 'original_payment',
    items: ['Professional Plan - 1 Month']
  },
]

const refundReasons = [
  { reason: 'Product not as described', count: 12, percentage: 28 },
  { reason: 'Changed mind', count: 9, percentage: 21 },
  { reason: 'Technical issues', count: 8, percentage: 19 },
  { reason: 'Duplicate charge', count: 7, percentage: 16 },
  { reason: 'Service not used', count: 4, percentage: 9 },
  { reason: 'Other', count: 3, percentage: 7 },
]

export default function RefundsClient() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedRefund, setSelectedRefund] = useState<string | null>(null)

  const stats = useMemo(() => {
    const pending = refunds.filter(r => r.status === 'pending')
    const completed = refunds.filter(r => r.status === 'completed')
    return {
      pendingCount: pending.length,
      pendingAmount: pending.reduce((sum, r) => sum + r.amount, 0),
      completedAmount: completed.reduce((sum, r) => sum + r.amount, 0),
      avgProcessingTime: '2.3 days'
    }
  }, [])

  const filteredRefunds = useMemo(() => {
    return refunds.filter(refund => {
      const matchesSearch = refund.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           refund.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           refund.orderId.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || refund.status === statusFilter
      const matchesTab = activeTab === 'all' ||
                        (activeTab === 'pending' && refund.status === 'pending') ||
                        (activeTab === 'completed' && ['completed', 'rejected'].includes(refund.status))
      return matchesSearch && matchesStatus && matchesTab
    })
  }, [searchQuery, statusFilter, activeTab])

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      processing: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    }
    const icons = {
      pending: <Clock className="h-3 w-3 mr-1" />,
      approved: <CheckCircle className="h-3 w-3 mr-1" />,
      processing: <RotateCcw className="h-3 w-3 mr-1 animate-spin" />,
      completed: <CheckCircle className="h-3 w-3 mr-1" />,
      rejected: <XCircle className="h-3 w-3 mr-1" />,
    }
    return (
      <Badge variant="outline" className={`${styles[status as keyof typeof styles]} flex items-center`}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const insights = [
    { icon: Clock, title: `${stats.pendingCount} Pending`, description: 'Awaiting review' },
    { icon: DollarSign, title: `$${stats.pendingAmount.toFixed(0)}`, description: 'Pending amount' },
    { icon: TrendingDown, title: stats.avgProcessingTime, description: 'Avg. processing time' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <RotateCcw className="h-8 w-8 text-primary" />
            Refunds
          </h1>
          <p className="text-muted-foreground mt-1">Process and manage refund requests</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <RotateCcw className="h-4 w-4 mr-2" />
            Issue Refund
          </Button>
        </div>
      </div>

      <CollapsibleInsightsPanel
        title="Refund Insights"
        insights={insights}
        defaultExpanded={true}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Refunds</p>
                <p className="text-2xl font-bold">{stats.pendingCount}</p>
                <p className="text-xs text-yellow-600 mt-1">Requires action</p>
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
                <p className="text-sm text-muted-foreground">Pending Amount</p>
                <p className="text-2xl font-bold">${stats.pendingAmount.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">To be processed</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Refunded (MTD)</p>
                <p className="text-2xl font-bold">${stats.completedAmount.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Processing</p>
                <p className="text-2xl font-bold">{stats.avgProcessingTime}</p>
                <p className="text-xs text-green-600 mt-1">-0.5 days vs last month</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Refunds</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle>Refund Requests</CardTitle>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search refunds..."
                          className="pl-9 w-48"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-36">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredRefunds.map((refund) => (
                      <div
                        key={refund.id}
                        className={`flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${
                          selectedRefund === refund.id ? 'border-primary bg-primary/5' : ''
                        }`}
                        onClick={() => setSelectedRefund(refund.id)}
                      >
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback>{refund.customer.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm text-muted-foreground">{refund.id}</span>
                              {getStatusBadge(refund.status)}
                            </div>
                            <p className="font-medium">{refund.customer}</p>
                            <p className="text-sm text-muted-foreground">{refund.reason}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold text-red-600">-${refund.amount.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">{refund.requestedAt}</p>
                          </div>
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
          </Tabs>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Refund Reasons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {refundReasons.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{item.reason}</span>
                      <span className="font-medium">{item.percentage}%</span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                Approve Selected
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <XCircle className="h-4 w-4 mr-2 text-red-600" />
                Reject Selected
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Customer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
