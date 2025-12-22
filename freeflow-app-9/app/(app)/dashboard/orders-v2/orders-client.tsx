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
  AlertCircle
} from 'lucide-react'
import { useOrders, useOrderStats, type Order } from '@/lib/hooks/use-orders'
import { updateOrderStatus, cancelOrder } from '@/app/actions/orders'

interface OrdersClientProps {
  initialOrders: Order[]
}

export default function OrdersClient({ initialOrders }: OrdersClientProps) {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Use hooks for real-time data
  const { data: orders } = useOrders({
    status: selectedStatus === 'all' ? undefined : selectedStatus,
    searchQuery: searchQuery || undefined
  })
  const { stats } = useOrderStats()

  const displayOrders = orders || initialOrders

  const filteredOrders = selectedStatus === 'all'
    ? displayOrders
    : displayOrders.filter(order => order.status === selectedStatus)

  const statItems = [
    { label: 'Total Orders', value: stats?.totalOrders?.toString() || displayOrders.length.toString(), change: 23.4, icon: <ShoppingCart className="w-5 h-5" /> },
    { label: 'Revenue', value: stats?.totalRevenue ? `$${(stats.totalRevenue / 1000).toFixed(0)}K` : '$0', change: 32.7, icon: <DollarSign className="w-5 h-5" /> },
    { label: 'Avg Order', value: stats?.averageOrderValue ? `$${stats.averageOrderValue.toFixed(0)}` : '$0', change: 8.3, icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Pending', value: stats?.pendingOrders?.toString() || '0', change: 18.9, icon: <Users className="w-5 h-5" /> }
  ]

  const topCustomers = displayOrders
    .reduce((acc: Record<string, { name: string, total: number }>, order) => {
      const name = order.customer_name || 'Unknown'
      if (!acc[name]) {
        acc[name] = { name, total: 0 }
      }
      acc[name].total += order.total_amount
      return acc
    }, {})

  const topCustomersList = Object.values(topCustomers)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map((customer, index) => ({
      rank: index + 1,
      name: customer.name,
      avatar: customer.name.split(' ').map(n => n[0]).join('').slice(0, 2),
      value: `$${(customer.total / 1000).toFixed(1)}K`,
      change: 0
    }))

  const recentActivity = [
    { icon: <CheckCircle className="w-4 h-4" />, title: 'Order delivered', time: '5m ago', type: 'success' as const },
    { icon: <Truck className="w-4 h-4" />, title: 'Order shipped', time: '1h ago', type: 'info' as const },
    { icon: <Package className="w-4 h-4" />, title: 'Order processing', time: '3h ago', type: 'warning' as const },
    { icon: <XCircle className="w-4 h-4" />, title: 'Order cancelled', time: '5h ago', type: 'error' as const }
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

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-pink-500 to-rose-500',
      'from-indigo-500 to-purple-500',
      'from-yellow-500 to-amber-500',
      'from-teal-500 to-cyan-500'
    ]
    const index = name ? name.charCodeAt(0) % colors.length : 0
    return colors[index]
  }

  const handleProcessOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, 'processing')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/40 dark:bg-none dark:bg-gray-900 p-6">
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

        <StatGrid columns={4} stats={statItems} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Clock />} title="Pending" description={`${stats?.pendingOrders || 0} orders`} onClick={() => setSelectedStatus('pending')} />
          <BentoQuickAction icon={<Package />} title="Processing" description={`${stats?.processingOrders || 0} orders`} onClick={() => setSelectedStatus('processing')} />
          <BentoQuickAction icon={<Truck />} title="Shipped" description={`${stats?.shippedOrders || 0} orders`} onClick={() => setSelectedStatus('shipped')} />
          <BentoQuickAction icon={<CheckCircle />} title="Delivered" description={`${stats?.deliveredOrders || 0} orders`} onClick={() => setSelectedStatus('delivered')} />
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
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <ModernButton variant="outline" size="sm">
                    <Filter className="w-4 h-4" />
                  </ModernButton>
                </div>
              </div>

              <div className="space-y-3">
                {filteredOrders.map((order) => {
                  const statusBadge = getStatusBadge(order.status)
                  const paymentBadge = getPaymentBadge(order.payment_status)
                  const avatarInitials = order.customer_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'

                  return (
                    <div key={order.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getAvatarColor(order.customer_name || '')} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
                              {avatarInitials}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{order.order_number}</h4>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${statusBadge.color}`}>
                                  {statusBadge.icon}
                                  {statusBadge.label}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${paymentBadge}`}>
                                  {order.payment_status}
                                </span>
                              </div>
                              <p className="text-sm mb-1">{order.customer_name || 'Unknown Customer'}</p>
                              <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                            </div>
                          </div>
                          <ModernButton variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </ModernButton>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground mb-1">Total</p>
                            <p className="font-semibold text-blue-600">${order.total_amount.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Date</p>
                            <p className="font-semibold">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Tracking</p>
                            <p className="font-semibold truncate">{order.tracking_number || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Currency</p>
                            <p className="font-semibold">{order.currency}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t">
                          <ModernButton variant="outline" size="sm">
                            <Eye className="w-3 h-3 mr-1" />
                            View Details
                          </ModernButton>
                          {order.tracking_number && (
                            <ModernButton variant="outline" size="sm">
                              <Truck className="w-3 h-3 mr-1" />
                              Track
                            </ModernButton>
                          )}
                          {order.status === 'pending' && (
                            <ModernButton variant="primary" size="sm" onClick={() => handleProcessOrder(order.id)}>
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
                  <p className="text-2xl font-bold">{stats?.deliveredOrders || 0}</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-medium">Shipped</p>
                  </div>
                  <p className="text-2xl font-bold">{stats?.shippedOrders || 0}</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-yellow-600" />
                    <p className="text-sm font-medium">Processing</p>
                  </div>
                  <p className="text-2xl font-bold">{stats?.processingOrders || 0}</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <p className="text-sm font-medium">Pending</p>
                  </div>
                  <p className="text-2xl font-bold">{stats?.pendingOrders || 0}</p>
                </div>
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="Top Customers" items={topCustomersList} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Order Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Total Orders" value={stats?.totalOrders?.toString() || '0'} change={23.4} />
                <MiniKPI label="Revenue" value={`$${((stats?.totalRevenue || 0) / 1000).toFixed(0)}K`} change={32.7} />
                <MiniKPI label="Avg Order Value" value={`$${(stats?.averageOrderValue || 0).toFixed(0)}`} change={8.3} />
                <MiniKPI label="Paid Orders" value={stats?.paidOrders?.toString() || '0'} change={18.9} />
              </div>
            </BentoCard>

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <ProgressCard
              title="Monthly Goal"
              value={stats?.totalRevenue ? Math.round(stats.totalRevenue / 1000) : 0}
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
                    <span className="text-xs font-semibold">{stats?.deliveredOrders || 0}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: `${stats?.totalOrders ? (stats.deliveredOrders / stats.totalOrders) * 100 : 0}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Shipped</span>
                    </div>
                    <span className="text-xs font-semibold">{stats?.shippedOrders || 0}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${stats?.totalOrders ? (stats.shippedOrders / stats.totalOrders) * 100 : 0}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm">Processing</span>
                    </div>
                    <span className="text-xs font-semibold">{stats?.processingOrders || 0}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-500 to-amber-500" style={{ width: `${stats?.totalOrders ? (stats.processingOrders / stats.totalOrders) * 100 : 0}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span className="text-sm">Pending</span>
                    </div>
                    <span className="text-xs font-semibold">{stats?.pendingOrders || 0}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-red-500" style={{ width: `${stats?.totalOrders ? (stats.pendingOrders / stats.totalOrders) * 100 : 0}%` }} />
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
