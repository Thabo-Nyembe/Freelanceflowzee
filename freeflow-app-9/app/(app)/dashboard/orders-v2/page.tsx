"use client"

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI,
  ActivityFeed,
  RankingList,
  ProgressCard
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  ShoppingCart,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  MoreVertical,
  Search,
  Filter,
  Download,
  Eye,
  AlertCircle,
  RefreshCw
} from 'lucide-react'

/**
 * Orders V2 - E-commerce Order Management
 * Manages customer orders, fulfillment, and order tracking
 */
export default function OrdersV2() {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered'>('all')

  const stats = [
    { label: 'Total Orders', value: '12,847', change: 23.4, icon: <ShoppingCart className="w-5 h-5" /> },
    { label: 'Revenue', value: '$847K', change: 32.7, icon: <DollarSign className="w-5 h-5" /> },
    { label: 'Avg Order', value: '$127', change: 8.3, icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Customers', value: '4,247', change: 18.9, icon: <Users className="w-5 h-5" /> }
  ]

  const orders = [
    {
      id: 'ORD-24701',
      customer: 'Sarah Johnson',
      email: 'sarah@example.com',
      avatar: 'SJ',
      items: 3,
      total: 247.99,
      status: 'delivered',
      payment: 'paid',
      date: '2024-02-12',
      tracking: 'TRK847293847',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'ORD-24689',
      customer: 'Michael Chen',
      email: 'michael@example.com',
      avatar: 'MC',
      items: 5,
      total: 542.50,
      status: 'shipped',
      payment: 'paid',
      date: '2024-02-11',
      tracking: 'TRK847293848',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'ORD-24674',
      customer: 'Emily Rodriguez',
      email: 'emily@example.com',
      avatar: 'ER',
      items: 2,
      total: 189.99,
      status: 'processing',
      payment: 'paid',
      date: '2024-02-11',
      tracking: 'TRK847293849',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'ORD-24658',
      customer: 'David Park',
      email: 'david@example.com',
      avatar: 'DP',
      items: 1,
      total: 89.99,
      status: 'pending',
      payment: 'pending',
      date: '2024-02-10',
      tracking: null,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'ORD-24642',
      customer: 'Lisa Anderson',
      email: 'lisa@example.com',
      avatar: 'LA',
      items: 4,
      total: 423.75,
      status: 'delivered',
      payment: 'paid',
      date: '2024-02-09',
      tracking: 'TRK847293850',
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'ORD-24627',
      customer: 'James Wilson',
      email: 'james@example.com',
      avatar: 'JW',
      items: 6,
      total: 678.25,
      status: 'shipped',
      payment: 'paid',
      date: '2024-02-08',
      tracking: 'TRK847293851',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'ORD-24612',
      customer: 'Maria Garcia',
      email: 'maria@example.com',
      avatar: 'MG',
      items: 2,
      total: 156.50,
      status: 'processing',
      payment: 'paid',
      date: '2024-02-08',
      tracking: 'TRK847293852',
      color: 'from-yellow-500 to-amber-500'
    },
    {
      id: 'ORD-24598',
      customer: 'Robert Brown',
      email: 'robert@example.com',
      avatar: 'RB',
      items: 3,
      total: 312.99,
      status: 'cancelled',
      payment: 'refunded',
      date: '2024-02-07',
      tracking: null,
      color: 'from-gray-500 to-gray-400'
    }
  ]

  const topCustomers = [
    { rank: 1, name: 'Sarah Johnson', avatar: 'SJ', value: '$12.4K', change: 42.3 },
    { rank: 2, name: 'Michael Chen', avatar: 'MC', value: '$9.8K', change: 32.1 },
    { rank: 3, name: 'Emily Rodriguez', avatar: 'ER', value: '$7.2K', change: 28.7 },
    { rank: 4, name: 'David Park', avatar: 'DP', value: '$6.5K', change: 24.5 },
    { rank: 5, name: 'Lisa Anderson', avatar: 'LA', value: '$5.9K', change: 18.9 }
  ]

  const recentActivity = [
    { icon: <CheckCircle className="w-4 h-4" />, title: 'Order ORD-24701 delivered', time: '5m ago', type: 'success' as const },
    { icon: <Truck className="w-4 h-4" />, title: 'Order ORD-24689 shipped', time: '1h ago', type: 'info' as const },
    { icon: <Package className="w-4 h-4" />, title: 'Order ORD-24674 processing', time: '3h ago', type: 'warning' as const },
    { icon: <XCircle className="w-4 h-4" />, title: 'Order ORD-24598 cancelled', time: '5h ago', type: 'error' as const }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle className="w-3 h-3" />, label: 'Delivered' }
      case 'shipped':
        return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: <Truck className="w-3 h-3" />, label: 'Shipped' }
      case 'processing':
        return { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <Package className="w-3 h-3" />, label: 'Processing' }
      case 'pending':
        return { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', icon: <Clock className="w-3 h-3" />, label: 'Pending' }
      case 'cancelled':
        return { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle className="w-3 h-3" />, label: 'Cancelled' }
      default:
        return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', icon: <AlertCircle className="w-3 h-3" />, label: status }
    }
  }

  const getPaymentBadge = (payment: string) => {
    switch (payment) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'refunded':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <ShoppingCart className="w-10 h-10 text-blue-600" />
              Orders
            </h1>
            <p className="text-muted-foreground">Manage customer orders and fulfillment</p>
          </div>
          <GradientButton from="blue" to="indigo" onClick={() => console.log('Export orders')}>
            <Download className="w-5 h-5 mr-2" />
            Export Orders
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Clock />} title="Pending" description="Awaiting" onClick={() => setSelectedStatus('pending')} />
          <BentoQuickAction icon={<Package />} title="Processing" description="In progress" onClick={() => setSelectedStatus('processing')} />
          <BentoQuickAction icon={<Truck />} title="Shipped" description="In transit" onClick={() => setSelectedStatus('shipped')} />
          <BentoQuickAction icon={<CheckCircle />} title="Delivered" description="Complete" onClick={() => setSelectedStatus('delivered')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedStatus === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('all')}>
            All Orders
          </PillButton>
          <PillButton variant={selectedStatus === 'pending' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('pending')}>
            <Clock className="w-4 h-4 mr-2" />
            Pending
          </PillButton>
          <PillButton variant={selectedStatus === 'processing' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('processing')}>
            <Package className="w-4 h-4 mr-2" />
            Processing
          </PillButton>
          <PillButton variant={selectedStatus === 'shipped' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('shipped')}>
            <Truck className="w-4 h-4 mr-2" />
            Shipped
          </PillButton>
          <PillButton variant={selectedStatus === 'delivered' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('delivered')}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Delivered
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Order List</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search orders..."
                      className="pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <ModernButton variant="outline" size="sm">
                    <Filter className="w-4 h-4" />
                  </ModernButton>
                </div>
              </div>

              <div className="space-y-3">
                {orders.map((order) => {
                  const statusBadge = getStatusBadge(order.status)
                  const paymentBadge = getPaymentBadge(order.payment)

                  return (
                    <div key={order.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${order.color} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
                              {order.avatar}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{order.id}</h4>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${statusBadge.color}`}>
                                  {statusBadge.icon}
                                  {statusBadge.label}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${paymentBadge}`}>
                                  {order.payment}
                                </span>
                              </div>
                              <p className="text-sm mb-1">{order.customer}</p>
                              <p className="text-xs text-muted-foreground">{order.email}</p>
                            </div>
                          </div>
                          <ModernButton variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </ModernButton>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground mb-1">Items</p>
                            <p className="font-semibold">{order.items} items</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Total</p>
                            <p className="font-semibold text-blue-600">${order.total}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Date</p>
                            <p className="font-semibold">{order.date}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Tracking</p>
                            <p className="font-semibold truncate">{order.tracking || 'N/A'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t">
                          <ModernButton variant="outline" size="sm">
                            <Eye className="w-3 h-3 mr-1" />
                            View Details
                          </ModernButton>
                          {order.tracking && (
                            <ModernButton variant="outline" size="sm">
                              <Truck className="w-3 h-3 mr-1" />
                              Track
                            </ModernButton>
                          )}
                          {order.status === 'pending' && (
                            <ModernButton variant="primary" size="sm">
                              <Package className="w-3 h-3 mr-1" />
                              Process
                            </ModernButton>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Order Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-sm font-medium">Delivered</p>
                  </div>
                  <p className="text-2xl font-bold">8,247</p>
                  <p className="text-xs text-green-600 mt-1">64% of total</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-medium">Shipped</p>
                  </div>
                  <p className="text-2xl font-bold">2,134</p>
                  <p className="text-xs text-blue-600 mt-1">17% of total</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-yellow-600" />
                    <p className="text-sm font-medium">Processing</p>
                  </div>
                  <p className="text-2xl font-bold">1,892</p>
                  <p className="text-xs text-yellow-600 mt-1">15% of total</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <p className="text-sm font-medium">Pending</p>
                  </div>
                  <p className="text-2xl font-bold">574</p>
                  <p className="text-xs text-orange-600 mt-1">4% of total</p>
                </div>
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="💰 Top Customers" items={topCustomers} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Order Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Total Orders" value="12,847" change={23.4} />
                <MiniKPI label="Revenue" value="$847K" change={32.7} />
                <MiniKPI label="Avg Order Value" value="$127" change={8.3} />
                <MiniKPI label="Total Customers" value="4,247" change={18.9} />
              </div>
            </BentoCard>

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <ProgressCard
              title="Monthly Goal"
              value={847}
              target={1000}
              label="K revenue target"
              color="from-blue-500 to-indigo-500"
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Order Status</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Delivered</span>
                    </div>
                    <span className="text-xs font-semibold">8,247 (64%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '64%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Shipped</span>
                    </div>
                    <span className="text-xs font-semibold">2,134 (17%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: '17%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm">Processing</span>
                    </div>
                    <span className="text-xs font-semibold">1,892 (15%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-500 to-amber-500" style={{ width: '15%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span className="text-sm">Pending</span>
                    </div>
                    <span className="text-xs font-semibold">574 (4%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-red-500" style={{ width: '4%' }} />
                  </div>
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
