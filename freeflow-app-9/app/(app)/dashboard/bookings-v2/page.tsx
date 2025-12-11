"use client"

import { useState } from 'react'
import {
  BentoGrid,
  BentoCard,
  BentoStat,
  BentoList,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  ProgressCard,
  ActivityFeed,
  MiniKPI,
  ComparisonCard
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton,
  IconButton
} from '@/components/ui/modern-buttons'
import {
  Calendar,
  Plus,
  Search,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Settings,
  Download,
  Filter,
  DollarSign,
  TrendingUp,
  BarChart3,
  CalendarDays,
  History
} from 'lucide-react'

/**
 * Bookings V2 - Groundbreaking Appointment Management
 * Showcases booking system with modern components
 */
export default function BookingsV2() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'upcoming' | 'today'>('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'confirmed' | 'pending'>('all')

  // Sample bookings data
  const bookings = [
    {
      id: '1',
      clientName: 'Sarah Johnson',
      service: 'Brand Consultation',
      date: '2025-01-15',
      time: '10:00 AM',
      duration: 60,
      status: 'confirmed',
      price: 150
    },
    {
      id: '2',
      clientName: 'Michael Chen',
      service: 'Design Review',
      date: '2025-01-15',
      time: '2:00 PM',
      duration: 90,
      status: 'confirmed',
      price: 200
    },
    {
      id: '3',
      clientName: 'Emily Rodriguez',
      service: 'Strategy Session',
      date: '2025-01-16',
      time: '11:00 AM',
      duration: 120,
      status: 'pending',
      price: 300
    },
    {
      id: '4',
      clientName: 'David Kim',
      service: 'Quick Call',
      date: '2025-01-16',
      time: '3:00 PM',
      duration: 30,
      status: 'confirmed',
      price: 75
    }
  ]

  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length
  const pendingCount = bookings.filter(b => b.status === 'pending').length
  const totalRevenue = bookings.reduce((sum, b) => sum + b.price, 0)

  // Stats
  const stats = [
    {
      label: 'Total Bookings',
      value: '156',
      change: 12.5,
      icon: <Calendar className="w-5 h-5" />
    },
    {
      label: 'This Week',
      value: '24',
      change: 8.3,
      icon: <CalendarDays className="w-5 h-5" />
    },
    {
      label: 'Revenue',
      value: `$${(totalRevenue / 1000).toFixed(1)}K`,
      change: 15.2,
      icon: <DollarSign className="w-5 h-5" />
    },
    {
      label: 'Confirmed Rate',
      value: `${Math.round((confirmedCount / bookings.length) * 100)}%`,
      change: 5.7,
      icon: <CheckCircle2 className="w-5 h-5" />
    }
  ]

  // Recent activity
  const recentActivity = [
    {
      icon: <CheckCircle2 className="w-5 h-5" />,
      title: 'Booking confirmed',
      description: 'Sarah Johnson - Brand Consultation',
      time: '10 minutes ago',
      status: 'success' as const
    },
    {
      icon: <Plus className="w-5 h-5" />,
      title: 'New booking',
      description: 'Emily Rodriguez - Strategy Session',
      time: '1 hour ago',
      status: 'info' as const
    },
    {
      icon: <AlertCircle className="w-5 h-5" />,
      title: 'Booking pending',
      description: 'David Kim waiting for confirmation',
      time: '2 hours ago',
      status: 'warning' as const
    },
    {
      icon: <XCircle className="w-5 h-5" />,
      title: 'Booking cancelled',
      description: 'Client rescheduled for next week',
      time: '1 day ago',
      status: 'error' as const
    }
  ]

  // Service list items
  const serviceListItems = [
    {
      icon: <Users className="w-4 h-4" />,
      title: 'Consultations',
      subtitle: '45 bookings',
      value: '$6.8K'
    },
    {
      icon: <BarChart3 className="w-4 h-4" />,
      title: 'Strategy Sessions',
      subtitle: '28 bookings',
      value: '$8.4K'
    },
    {
      icon: <Calendar className="w-4 h-4" />,
      title: 'Design Reviews',
      subtitle: '38 bookings',
      value: '$7.6K'
    },
    {
      icon: <Clock className="w-4 h-4" />,
      title: 'Quick Calls',
      subtitle: '45 bookings',
      value: '$3.4K'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      case 'completed': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle2 className="w-3 h-3" />
      case 'pending': return <AlertCircle className="w-3 h-3" />
      case 'cancelled': return <XCircle className="w-3 h-3" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50/30 to-indigo-50/40 dark:from-sky-950 dark:via-blue-950/30 dark:to-indigo-950/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Calendar className="w-10 h-10 text-sky-600" />
              Bookings
            </h1>
            <p className="text-muted-foreground">
              Manage your appointments and schedule
            </p>
          </div>

          <div className="flex items-center gap-3">
            <IconButton
              icon={<Filter />}
              ariaLabel="Filter"
              variant="ghost"
              size="md"
            />
            <IconButton
              icon={<Settings />}
              ariaLabel="Settings"
              variant="ghost"
              size="md"
            />
            <GradientButton
              from="sky"
              to="blue"
              onClick={() => console.log('New booking')}
            >
              <Plus className="w-5 h-5 mr-2" />
              New Booking
            </GradientButton>
          </div>
        </div>

        {/* Stats */}
        <StatGrid columns={4} stats={stats} />

        {/* Quick Access */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction
            icon={<Calendar className="w-6 h-6" />}
            title="Calendar"
            description="View schedule"
            onClick={() => console.log('Calendar')}
          />
          <BentoQuickAction
            icon={<History className="w-6 h-6" />}
            title="History"
            description="Past bookings"
            onClick={() => console.log('History')}
          />
          <BentoQuickAction
            icon={<BarChart3 className="w-6 h-6" />}
            title="Analytics"
            description="Insights"
            onClick={() => console.log('Analytics')}
          />
          <BentoQuickAction
            icon={<Settings className="w-6 h-6" />}
            title="Services"
            description="Manage offerings"
            onClick={() => console.log('Services')}
          />
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search bookings..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <PillButton
              variant={selectedFilter === 'all' ? 'primary' : 'ghost'}
              onClick={() => setSelectedFilter('all')}
            >
              All Bookings
            </PillButton>
            <PillButton
              variant={selectedFilter === 'upcoming' ? 'primary' : 'ghost'}
              onClick={() => setSelectedFilter('upcoming')}
            >
              Upcoming
            </PillButton>
            <PillButton
              variant={selectedFilter === 'today' ? 'primary' : 'ghost'}
              onClick={() => setSelectedFilter('today')}
            >
              Today
            </PillButton>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bookings List */}
          <div className="lg:col-span-2 space-y-6">
            <BentoCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Upcoming Bookings</h3>
                <div className="flex items-center gap-2">
                  <PillButton
                    variant={selectedStatus === 'all' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedStatus('all')}
                  >
                    All
                  </PillButton>
                  <PillButton
                    variant={selectedStatus === 'confirmed' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedStatus('confirmed')}
                  >
                    Confirmed
                  </PillButton>
                  <PillButton
                    variant={selectedStatus === 'pending' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedStatus('pending')}
                  >
                    Pending
                  </PillButton>
                </div>
              </div>

              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{booking.clientName}</h4>
                          <span className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{booking.service}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(booking.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {booking.time} ({booking.duration}min)
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            ${booking.price}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ModernButton
                          variant="outline"
                          size="sm"
                          onClick={() => console.log('View', booking.id)}
                        >
                          View
                        </ModernButton>
                        {booking.status === 'pending' && (
                          <ModernButton
                            variant="primary"
                            size="sm"
                            onClick={() => console.log('Confirm', booking.id)}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Confirm
                          </ModernButton>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>

            {/* Services List */}
            <BentoList
              title="Services Breakdown"
              items={serviceListItems}
            />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <ProgressCard
              title="Monthly Booking Goal"
              current={156}
              goal={200}
              icon={<Calendar className="w-5 h-5" />}
            />

            {/* Comparison */}
            <ComparisonCard
              title="Booking Status"
              leftLabel="Confirmed"
              leftValue={confirmedCount.toString()}
              rightLabel="Pending"
              rightValue={pendingCount.toString()}
              icon={<CheckCircle2 className="w-5 h-5" />}
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Activity"
              activities={recentActivity}
            />

            {/* Quick Stats */}
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Avg. Booking Value" value="$165" change={12.5} />
                <MiniKPI label="Confirmation Rate" value="94%" change={5.7} />
                <MiniKPI label="No-Show Rate" value="3%" change={-15.2} />
                <MiniKPI label="Rebooking Rate" value="68%" change={8.3} />
              </div>
            </BentoCard>

            {/* Calendar Preview */}
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                This Week
              </h3>
              <div className="space-y-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, index) => (
                  <div key={day} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{day}</span>
                    <span className="font-semibold">{Math.floor(Math.random() * 6) + 2} bookings</span>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
