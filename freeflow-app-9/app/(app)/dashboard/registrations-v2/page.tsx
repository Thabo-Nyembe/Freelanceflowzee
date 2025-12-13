"use client"

import { useState } from 'react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'
import {
  UserPlus, Calendar, Mail, CreditCard, Plus,
  Download, Upload, RefreshCw, Eye, CheckCircle,
  XCircle, Clock, Users, TrendingUp, AlertCircle
} from 'lucide-react'

type RegistrationStatus = 'confirmed' | 'pending' | 'cancelled' | 'waitlist' | 'checked-in'
type TicketType = 'free' | 'paid' | 'vip' | 'early-bird' | 'group' | 'sponsor'
type PaymentStatus = 'paid' | 'pending' | 'refunded' | 'failed'

interface Registration {
  id: string
  attendeeName: string
  email: string
  eventName: string
  eventDate: string
  ticketType: TicketType
  status: RegistrationStatus
  paymentStatus: PaymentStatus
  ticketPrice: number
  registeredDate: string
  checkInTime?: string
  company?: string
  dietaryRestrictions?: string[]
  specialRequests?: string
  referralSource: string
}

const registrations: Registration[] = [
  {
    id: 'REG-2847',
    attendeeName: 'Sarah Johnson',
    email: 'sarah.johnson@techcorp.com',
    eventName: 'Product Launch: Analytics Platform',
    eventDate: '2024-01-15T14:00:00',
    ticketType: 'vip',
    status: 'confirmed',
    paymentStatus: 'paid',
    ticketPrice: 499,
    registeredDate: '2024-01-02T10:30:00',
    company: 'TechCorp Solutions',
    dietaryRestrictions: ['Vegetarian'],
    specialRequests: 'Prefer front row seating',
    referralSource: 'Email Campaign'
  },
  {
    id: 'REG-2846',
    attendeeName: 'Michael Chen',
    email: 'mchen@innovatetech.com',
    eventName: 'Mastering Data Visualization',
    eventDate: '2024-01-12T10:00:00',
    ticketType: 'early-bird',
    status: 'checked-in',
    paymentStatus: 'paid',
    ticketPrice: 199,
    registeredDate: '2023-12-15T14:20:00',
    checkInTime: '2024-01-12T09:45:00',
    company: 'InnovateTech',
    dietaryRestrictions: ['None'],
    referralSource: 'Social Media'
  },
  {
    id: 'REG-2845',
    attendeeName: 'Emily Rodriguez',
    email: 'emily.r@startupxyz.com',
    eventName: 'Expert Panel: Future of SaaS',
    eventDate: '2024-01-05T16:00:00',
    ticketType: 'paid',
    status: 'checked-in',
    paymentStatus: 'paid',
    ticketPrice: 299,
    registeredDate: '2023-12-28T11:15:00',
    checkInTime: '2024-01-05T15:30:00',
    company: 'StartupXYZ',
    referralSource: 'Website'
  },
  {
    id: 'REG-2844',
    attendeeName: 'David Kim',
    email: 'david.kim@enterprise.com',
    eventName: 'Product Launch: Analytics Platform',
    eventDate: '2024-01-15T14:00:00',
    ticketType: 'group',
    status: 'confirmed',
    paymentStatus: 'paid',
    ticketPrice: 1995,
    registeredDate: '2024-01-03T09:00:00',
    company: 'Enterprise Solutions Inc',
    dietaryRestrictions: ['Gluten-Free', 'Dairy-Free'],
    specialRequests: 'Group of 5, need reserved seating area',
    referralSource: 'Partner Network'
  },
  {
    id: 'REG-2843',
    attendeeName: 'Lisa Anderson',
    email: 'l.anderson@freelance.com',
    eventName: 'API Integration Workshop',
    eventDate: '2024-01-03T11:00:00',
    ticketType: 'free',
    status: 'checked-in',
    paymentStatus: 'paid',
    ticketPrice: 0,
    registeredDate: '2023-12-20T16:45:00',
    checkInTime: '2024-01-03T10:55:00',
    referralSource: 'LinkedIn'
  },
  {
    id: 'REG-2842',
    attendeeName: 'Robert Martinez',
    email: 'rmartinez@consulting.com',
    eventName: 'Product Launch: Analytics Platform',
    eventDate: '2024-01-15T14:00:00',
    ticketType: 'paid',
    status: 'pending',
    paymentStatus: 'pending',
    ticketPrice: 299,
    registeredDate: '2024-01-08T13:30:00',
    company: 'Martinez Consulting',
    referralSource: 'Google Search'
  },
  {
    id: 'REG-2841',
    attendeeName: 'Jennifer Taylor',
    email: 'jennifer.taylor@agency.com',
    eventName: 'Product Launch: Analytics Platform',
    eventDate: '2024-01-15T14:00:00',
    ticketType: 'sponsor',
    status: 'confirmed',
    paymentStatus: 'paid',
    ticketPrice: 2999,
    registeredDate: '2023-12-18T10:00:00',
    company: 'Digital Marketing Agency',
    specialRequests: 'Sponsor booth setup required',
    referralSource: 'Direct Sales'
  },
  {
    id: 'REG-2840',
    attendeeName: 'Thomas Wright',
    email: 'twright@startup.io',
    eventName: 'Mastering Data Visualization',
    eventDate: '2024-01-12T10:00:00',
    ticketType: 'paid',
    status: 'cancelled',
    paymentStatus: 'refunded',
    ticketPrice: 299,
    registeredDate: '2023-12-22T15:20:00',
    company: 'Startup.io',
    referralSource: 'Email Campaign'
  },
  {
    id: 'REG-2839',
    attendeeName: 'Amanda Foster',
    email: 'afoster@techventures.com',
    eventName: 'Product Launch: Analytics Platform',
    eventDate: '2024-01-15T14:00:00',
    ticketType: 'vip',
    status: 'waitlist',
    paymentStatus: 'pending',
    ticketPrice: 499,
    registeredDate: '2024-01-10T11:00:00',
    company: 'Tech Ventures',
    dietaryRestrictions: ['Vegan'],
    referralSource: 'Referral'
  }
]

const stats = [
  {
    label: 'Total Registrations',
    value: '12.4K',
    change: 18.5,
    trend: 'up' as const,
    icon: UserPlus
  },
  {
    label: 'Checked In',
    value: '8.9K',
    change: 12.3,
    trend: 'up' as const,
    icon: CheckCircle
  },
  {
    label: 'Confirmation Rate',
    value: '87.3%',
    change: 5.7,
    trend: 'up' as const,
    icon: TrendingUp
  },
  {
    label: 'Total Revenue',
    value: '$2.84M',
    change: 24.8,
    trend: 'up' as const,
    icon: CreditCard
  }
]

const quickActions = [
  { label: 'Add Registration', icon: UserPlus, gradient: 'from-blue-500 to-cyan-600' },
  { label: 'Check In Attendee', icon: CheckCircle, gradient: 'from-green-500 to-emerald-600' },
  { label: 'Send Confirmation', icon: Mail, gradient: 'from-purple-500 to-indigo-600' },
  { label: 'Export List', icon: Download, gradient: 'from-orange-500 to-red-600' },
  { label: 'Import Registrations', icon: Upload, gradient: 'from-cyan-500 to-blue-600' },
  { label: 'View Calendar', icon: Calendar, gradient: 'from-pink-500 to-rose-600' },
  { label: 'Manage Waitlist', icon: Users, gradient: 'from-indigo-500 to-purple-600' },
  { label: 'Refresh Data', icon: RefreshCw, gradient: 'from-red-500 to-pink-600' }
]

const recentActivity = [
  { action: 'New registration', details: 'Amanda Foster registered for Product Launch', time: '15 min ago' },
  { action: 'Payment received', details: '$499 from Sarah Johnson (REG-2847)', time: '1 hour ago' },
  { action: 'Check-in', details: 'Michael Chen checked in to Data Visualization webinar', time: '2 hours ago' },
  { action: 'Cancellation', details: 'Thomas Wright cancelled registration, refund processed', time: '5 hours ago' },
  { action: 'Group registration', details: 'David Kim registered group of 5 attendees', time: '1 day ago' }
]

const topEvents = [
  { name: 'Product Launch: Analytics Platform', metric: '847 regs' },
  { name: 'Expert Panel: Future of SaaS', metric: '589 regs' },
  { name: 'Mastering Data Visualization', metric: '456 regs' },
  { name: 'Customer Success Demo', metric: '312 regs' },
  { name: 'API Integration Workshop', metric: '234 regs' }
]

export default function RegistrationsV2Page() {
  const [viewMode, setViewMode] = useState<'all' | 'confirmed' | 'pending' | 'checked-in'>('all')

  const filteredRegistrations = registrations.filter(reg => {
    if (viewMode === 'all') return true
    if (viewMode === 'confirmed') return reg.status === 'confirmed'
    if (viewMode === 'pending') return reg.status === 'pending'
    if (viewMode === 'checked-in') return reg.status === 'checked-in'
    return true
  })

  const getStatusColor = (status: RegistrationStatus) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
      case 'waitlist': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'checked-in': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: RegistrationStatus) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-3 h-3" />
      case 'pending': return <Clock className="w-3 h-3" />
      case 'cancelled': return <XCircle className="w-3 h-3" />
      case 'waitlist': return <Users className="w-3 h-3" />
      case 'checked-in': return <UserPlus className="w-3 h-3" />
      default: return <AlertCircle className="w-3 h-3" />
    }
  }

  const getTicketTypeColor = (type: TicketType) => {
    switch (type) {
      case 'free': return 'bg-gray-50 text-gray-600 border-gray-100'
      case 'paid': return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'vip': return 'bg-purple-50 text-purple-600 border-purple-100'
      case 'early-bird': return 'bg-green-50 text-green-600 border-green-100'
      case 'group': return 'bg-orange-50 text-orange-600 border-orange-100'
      case 'sponsor': return 'bg-red-50 text-red-600 border-red-100'
      default: return 'bg-gray-50 text-gray-600 border-gray-100'
    }
  }

  const getTicketTypeGradient = (type: TicketType) => {
    switch (type) {
      case 'free': return 'from-gray-500 to-gray-600'
      case 'paid': return 'from-blue-500 to-cyan-600'
      case 'vip': return 'from-purple-500 to-pink-600'
      case 'early-bird': return 'from-green-500 to-emerald-600'
      case 'group': return 'from-orange-500 to-red-600'
      case 'sponsor': return 'from-red-500 to-rose-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'refunded': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'failed': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Registrations
            </h1>
            <p className="text-gray-600 mt-2">Manage event registrations and attendees</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Registration
          </button>
        </div>

        {/* Stats */}
        <StatGrid stats={stats} />

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Quick Actions</h2>
          <BentoQuickAction actions={quickActions} />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-3 flex-wrap">
          <PillButton
            label="All Registrations"
            isActive={viewMode === 'all'}
            onClick={() => setViewMode('all')}
          />
          <PillButton
            label="Confirmed"
            isActive={viewMode === 'confirmed'}
            onClick={() => setViewMode('confirmed')}
          />
          <PillButton
            label="Pending"
            isActive={viewMode === 'pending'}
            onClick={() => setViewMode('pending')}
          />
          <PillButton
            label="Checked In"
            isActive={viewMode === 'checked-in'}
            onClick={() => setViewMode('checked-in')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Registrations List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {viewMode === 'all' && 'All Registrations'}
              {viewMode === 'confirmed' && 'Confirmed Registrations'}
              {viewMode === 'pending' && 'Pending Registrations'}
              {viewMode === 'checked-in' && 'Checked-In Attendees'}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredRegistrations.length} total)
              </span>
            </h2>

            {filteredRegistrations.map((registration) => (
              <div
                key={registration.id}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(registration.status)} flex items-center gap-1`}>
                        {getStatusIcon(registration.status)}
                        {registration.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTicketTypeColor(registration.ticketType)}`}>
                        {registration.ticketType}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(registration.paymentStatus)}`}>
                        {registration.paymentStatus}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {registration.attendeeName}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      {registration.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      {registration.id} • {registration.company || 'No company'}
                    </p>
                  </div>
                  <button className={`px-4 py-2 bg-gradient-to-r ${getTicketTypeGradient(registration.ticketType)} text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2`}>
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>

                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Event</p>
                      <p className="text-sm font-semibold text-gray-900">{registration.eventName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 mb-1">Date</p>
                      <p className="text-sm font-semibold text-gray-900">{formatDate(registration.eventDate)}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Ticket Price</p>
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(registration.ticketPrice)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Registered</p>
                    <p className="text-sm font-semibold text-gray-900">{formatDate(registration.registeredDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Source</p>
                    <p className="text-sm font-semibold text-gray-900">{registration.referralSource}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Check-In</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {registration.checkInTime ? formatDate(registration.checkInTime) : 'Not checked in'}
                    </p>
                  </div>
                </div>

                {/* Additional Details */}
                {(registration.dietaryRestrictions || registration.specialRequests) && (
                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    {registration.dietaryRestrictions && registration.dietaryRestrictions.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Dietary Restrictions</p>
                        <div className="flex flex-wrap gap-2">
                          {registration.dietaryRestrictions.map((restriction, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-orange-50 text-orange-700 rounded-md text-xs font-medium border border-orange-100"
                            >
                              {restriction}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {registration.specialRequests && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Special Requests</p>
                        <p className="text-sm text-gray-700 bg-blue-50 rounded-lg p-2 border border-blue-100">
                          {registration.specialRequests}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Ticket Type Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Ticket Types</h3>
              <div className="space-y-3">
                {[
                  { type: 'paid', count: 4247, percentage: 34 },
                  { type: 'early-bird', count: 3156, percentage: 25 },
                  { type: 'free', count: 2489, percentage: 20 },
                  { type: 'vip', count: 1578, percentage: 13 },
                  { type: 'group', count: 689, percentage: 6 },
                  { type: 'sponsor', count: 241, percentage: 2 }
                ].map((item) => (
                  <div key={item.type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 capitalize">{item.type}</span>
                      <span className="text-gray-900 font-semibold">{item.count.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getTicketTypeGradient(item.type as TicketType)} rounded-full`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Events by Registration */}
            <RankingList
              title="Top Events"
              items={topEvents}
              gradient="from-cyan-500 to-blue-600"
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Activity"
              activities={recentActivity}
            />

            {/* Performance Metrics */}
            <MiniKPI
              label="Check-In Rate"
              value="71.8%"
              change={4.2}
              trend="up"
            />

            <ProgressCard
              title="Monthly Revenue"
              current={284000}
              target={350000}
              label="revenue"
              gradient="from-cyan-500 to-blue-600"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
