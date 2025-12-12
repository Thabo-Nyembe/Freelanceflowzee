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
  Users,
  UserPlus,
  Star,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Mail,
  Phone,
  MapPin,
  Calendar,
  MoreVertical,
  Search,
  Filter,
  Eye,
  MessageCircle,
  Award,
  Target
} from 'lucide-react'

/**
 * Customers V2 - Customer Relationship Management
 * Manages customer profiles, interactions, and analytics
 */
export default function CustomersV2() {
  const [selectedSegment, setSelectedSegment] = useState<'all' | 'vip' | 'active' | 'new' | 'inactive'>('all')

  const stats = [
    { label: 'Total Customers', value: '24,847', change: 18.4, icon: <Users className="w-5 h-5" /> },
    { label: 'Active', value: '18,247', change: 23.7, icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Lifetime Value', value: '$12.4M', change: 32.5, icon: <DollarSign className="w-5 h-5" /> },
    { label: 'Avg Order Value', value: '$247', change: 8.9, icon: <ShoppingCart className="w-5 h-5" /> }
  ]

  const customers = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phone: '+1 (555) 123-4567',
      avatar: 'SJ',
      segment: 'vip',
      joinDate: '2023-01-15',
      lastOrder: '2024-02-10',
      totalOrders: 47,
      totalSpent: 12450,
      lifetimeValue: 15680,
      location: 'New York, NY',
      status: 'active',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@example.com',
      phone: '+1 (555) 234-5678',
      avatar: 'MC',
      segment: 'vip',
      joinDate: '2023-03-22',
      lastOrder: '2024-02-11',
      totalOrders: 38,
      totalSpent: 9875,
      lifetimeValue: 12340,
      location: 'San Francisco, CA',
      status: 'active',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@example.com',
      phone: '+1 (555) 345-6789',
      avatar: 'ER',
      segment: 'active',
      joinDate: '2023-06-10',
      lastOrder: '2024-02-09',
      totalOrders: 24,
      totalSpent: 5420,
      lifetimeValue: 6780,
      location: 'Austin, TX',
      status: 'active',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: '4',
      name: 'David Park',
      email: 'david.park@example.com',
      phone: '+1 (555) 456-7890',
      avatar: 'DP',
      segment: 'new',
      joinDate: '2024-02-01',
      lastOrder: '2024-02-08',
      totalOrders: 3,
      totalSpent: 890,
      lifetimeValue: 1200,
      location: 'Seattle, WA',
      status: 'active',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: '5',
      name: 'Lisa Anderson',
      email: 'lisa.anderson@example.com',
      phone: '+1 (555) 567-8901',
      avatar: 'LA',
      segment: 'vip',
      joinDate: '2022-11-08',
      lastOrder: '2024-02-12',
      totalOrders: 52,
      totalSpent: 14230,
      lifetimeValue: 18900,
      location: 'Boston, MA',
      status: 'active',
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: '6',
      name: 'James Wilson',
      email: 'james.wilson@example.com',
      phone: '+1 (555) 678-9012',
      avatar: 'JW',
      segment: 'active',
      joinDate: '2023-08-14',
      lastOrder: '2024-01-28',
      totalOrders: 18,
      totalSpent: 3670,
      lifetimeValue: 4560,
      location: 'Denver, CO',
      status: 'active',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: '7',
      name: 'Maria Garcia',
      email: 'maria.garcia@example.com',
      phone: '+1 (555) 789-0123',
      avatar: 'MG',
      segment: 'inactive',
      joinDate: '2023-04-20',
      lastOrder: '2023-12-10',
      totalOrders: 12,
      totalSpent: 2340,
      lifetimeValue: 2890,
      location: 'Miami, FL',
      status: 'inactive',
      color: 'from-yellow-500 to-amber-500'
    },
    {
      id: '8',
      name: 'Robert Brown',
      email: 'robert.brown@example.com',
      phone: '+1 (555) 890-1234',
      avatar: 'RB',
      segment: 'active',
      joinDate: '2023-09-05',
      lastOrder: '2024-02-06',
      totalOrders: 21,
      totalSpent: 4890,
      lifetimeValue: 6120,
      location: 'Chicago, IL',
      status: 'active',
      color: 'from-teal-500 to-cyan-500'
    }
  ]

  const topSpenders = [
    { rank: 1, name: 'Lisa Anderson', avatar: 'LA', value: '$18.9K', change: 42.3 },
    { rank: 2, name: 'Sarah Johnson', avatar: 'SJ', value: '$15.7K', change: 32.1 },
    { rank: 3, name: 'Michael Chen', avatar: 'MC', value: '$12.3K', change: 28.7 },
    { rank: 4, name: 'Emily Rodriguez', avatar: 'ER', value: '$6.8K', change: 24.5 },
    { rank: 5, name: 'Robert Brown', avatar: 'RB', value: '$6.1K', change: 18.9 }
  ]

  const recentActivity = [
    { icon: <UserPlus className="w-4 h-4" />, title: 'New customer registered', time: '5m ago', type: 'success' as const },
    { icon: <ShoppingCart className="w-4 h-4" />, title: 'Sarah placed an order', time: '1h ago', type: 'info' as const },
    { icon: <Star className="w-4 h-4" />, title: 'Michael became VIP', time: '3h ago', type: 'warning' as const },
    { icon: <Mail className="w-4 h-4" />, title: 'Email campaign sent', time: '5h ago', type: 'info' as const }
  ]

  const getSegmentBadge = (segment: string) => {
    switch (segment) {
      case 'vip':
        return { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', icon: <Star className="w-3 h-3" />, label: 'VIP' }
      case 'active':
        return { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: <TrendingUp className="w-3 h-3" />, label: 'Active' }
      case 'new':
        return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: <UserPlus className="w-3 h-3" />, label: 'New' }
      case 'inactive':
        return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', icon: <Users className="w-3 h-3" />, label: 'Inactive' }
      default:
        return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', icon: <Users className="w-3 h-3" />, label: segment }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50/30 to-fuchsia-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Users className="w-10 h-10 text-violet-600" />
              Customers
            </h1>
            <p className="text-muted-foreground">Manage customer relationships and analytics</p>
          </div>
          <GradientButton from="violet" to="purple" onClick={() => console.log('Add customer')}>
            <UserPlus className="w-5 h-5 mr-2" />
            Add Customer
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Star />} title="VIP" description="Top tier" onClick={() => setSelectedSegment('vip')} />
          <BentoQuickAction icon={<TrendingUp />} title="Active" description="Engaged" onClick={() => setSelectedSegment('active')} />
          <BentoQuickAction icon={<UserPlus />} title="New" description="Recent" onClick={() => setSelectedSegment('new')} />
          <BentoQuickAction icon={<Users />} title="Inactive" description="Dormant" onClick={() => setSelectedSegment('inactive')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedSegment === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedSegment('all')}>
            All Customers
          </PillButton>
          <PillButton variant={selectedSegment === 'vip' ? 'primary' : 'ghost'} onClick={() => setSelectedSegment('vip')}>
            <Star className="w-4 h-4 mr-2" />
            VIP
          </PillButton>
          <PillButton variant={selectedSegment === 'active' ? 'primary' : 'ghost'} onClick={() => setSelectedSegment('active')}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Active
          </PillButton>
          <PillButton variant={selectedSegment === 'new' ? 'primary' : 'ghost'} onClick={() => setSelectedSegment('new')}>
            <UserPlus className="w-4 h-4 mr-2" />
            New
          </PillButton>
          <PillButton variant={selectedSegment === 'inactive' ? 'primary' : 'ghost'} onClick={() => setSelectedSegment('inactive')}>
            Inactive
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Customer List</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search customers..."
                      className="pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <ModernButton variant="outline" size="sm">
                    <Filter className="w-4 h-4" />
                  </ModernButton>
                </div>
              </div>

              <div className="space-y-3">
                {customers.map((customer) => {
                  const segmentBadge = getSegmentBadge(customer.segment)

                  return (
                    <div key={customer.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${customer.color} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
                              {customer.avatar}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{customer.name}</h4>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${segmentBadge.color}`}>
                                  {segmentBadge.icon}
                                  {segmentBadge.label}
                                </span>
                              </div>
                              <div className="space-y-0.5 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  <span>{customer.email}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  <span>{customer.phone}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{customer.location}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <ModernButton variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </ModernButton>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground mb-1">Total Orders</p>
                            <p className="font-semibold">{customer.totalOrders}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Total Spent</p>
                            <p className="font-semibold text-violet-600">${(customer.totalSpent / 1000).toFixed(1)}K</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">LTV</p>
                            <p className="font-semibold text-purple-600">${(customer.lifetimeValue / 1000).toFixed(1)}K</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Last Order</p>
                            <p className="font-semibold">{customer.lastOrder}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t">
                          <ModernButton variant="outline" size="sm">
                            <Eye className="w-3 h-3 mr-1" />
                            View Profile
                          </ModernButton>
                          <ModernButton variant="outline" size="sm">
                            <MessageCircle className="w-3 h-3 mr-1" />
                            Message
                          </ModernButton>
                          <ModernButton variant="outline" size="sm">
                            <Mail className="w-3 h-3 mr-1" />
                            Email
                          </ModernButton>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Customer Segments</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-purple-600" />
                    <p className="text-sm font-medium">VIP</p>
                  </div>
                  <p className="text-2xl font-bold">2,847</p>
                  <p className="text-xs text-purple-600 mt-1">$8.4M LTV</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <p className="text-sm font-medium">Active</p>
                  </div>
                  <p className="text-2xl font-bold">18,247</p>
                  <p className="text-xs text-green-600 mt-1">$3.2M LTV</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <UserPlus className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-medium">New</p>
                  </div>
                  <p className="text-2xl font-bold">1,892</p>
                  <p className="text-xs text-blue-600 mt-1">$423K LTV</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-gray-600" />
                    <p className="text-sm font-medium">Inactive</p>
                  </div>
                  <p className="text-2xl font-bold">1,861</p>
                  <p className="text-xs text-gray-600 mt-1">$347K LTV</p>
                </div>
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="💎 Top Spenders" items={topSpenders} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Customer Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Total Customers" value="24,847" change={18.4} />
                <MiniKPI label="Active Customers" value="18,247" change={23.7} />
                <MiniKPI label="Lifetime Value" value="$12.4M" change={32.5} />
                <MiniKPI label="Avg Order Value" value="$247" change={8.9} />
              </div>
            </BentoCard>

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <ProgressCard
              title="Customer Goal"
              value={24847}
              target={30000}
              label="Total customers"
              color="from-violet-500 to-purple-500"
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Segment Distribution</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Active</span>
                    </div>
                    <span className="text-xs font-semibold">18,247 (73%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '73%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">VIP</span>
                    </div>
                    <span className="text-xs font-semibold">2,847 (11%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: '11%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-600" />
                      <span className="text-sm">Inactive</span>
                    </div>
                    <span className="text-xs font-semibold">1,861 (8%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-gray-500 to-gray-400" style={{ width: '8%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">New</span>
                    </div>
                    <span className="text-xs font-semibold">1,892 (8%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: '8%' }} />
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
