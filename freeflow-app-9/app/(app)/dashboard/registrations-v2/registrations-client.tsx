// Registrations V2 - Client Component with Real-time Data
// Created: December 14, 2024
// Connected to Supabase backend via hooks

'use client'

import { useState } from 'react'
import { useRegistrations, type Registration, type RegistrationStatus } from '@/lib/hooks/use-registrations'
import { StatGrid, MiniKPI, ActivityFeed, RankingList, ProgressCard } from '@/components/ui/results-display'
import { BentoQuickAction } from '@/components/ui/bento-grid-advanced'
import { PillButton } from '@/components/ui/modern-buttons'

interface RegistrationsClientProps {
  initialRegistrations: Registration[]
}

export default function RegistrationsClient({ initialRegistrations }: RegistrationsClientProps) {
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | 'all'>('all')

  // Use real-time hook with filters
  const { registrations, loading, error } = useRegistrations({
    status: statusFilter,
    limit: 50
  })

  // Use real-time data or fallback to initial SSR data
  const displayRegistrations = registrations.length > 0 ? registrations : initialRegistrations

  // Filter registrations based on current filters
  const filteredRegistrations = displayRegistrations.filter(registration => {
    if (statusFilter !== 'all' && registration.status !== statusFilter) return false
    return true
  })

  // Calculate statistics
  const stats = {
    total: displayRegistrations.length,
    confirmed: displayRegistrations.filter(r => r.status === 'confirmed').length,
    attended: displayRegistrations.filter(r => r.status === 'attended').length,
    pending: displayRegistrations.filter(r => r.status === 'pending').length,
    cancelled: displayRegistrations.filter(r => r.status === 'cancelled').length,
    totalRevenue: displayRegistrations.reduce((sum, r) => sum + (r.ticket_price || 0), 0),
    attendanceRate: displayRegistrations.length > 0
      ? Math.round((displayRegistrations.filter(r => r.status === 'attended').length / displayRegistrations.length) * 100)
      : 0
  }

  const getStatusColor = (status: RegistrationStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'confirmed':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'attended':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'no-show':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'waitlist':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getTicketTypeColor = (ticketType: string | null) => {
    switch (ticketType) {
      case 'vip':
        return 'bg-purple-50 text-purple-700'
      case 'paid':
        return 'bg-blue-50 text-blue-700'
      case 'free':
        return 'bg-green-50 text-green-700'
      case 'speaker':
        return 'bg-orange-50 text-orange-700'
      case 'sponsor':
        return 'bg-pink-50 text-pink-700'
      default:
        return 'bg-gray-50 text-gray-700'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === 0) return 'Free'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Registrations Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Track and manage event and webinar registrations
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <StatGrid
        stats={[
          {
            label: 'Total Registrations',
            value: stats.total.toString(),
            trend: '+22%',
            trendLabel: 'vs last month'
          },
          {
            label: 'Confirmed',
            value: stats.confirmed.toString(),
            icon: '✅'
          },
          {
            label: 'Attended',
            value: stats.attended.toString(),
            icon: '🎯'
          },
          {
            label: 'Attendance Rate',
            value: `${stats.attendanceRate}%`,
            trend: '+5.2%',
            icon: '📊'
          }
        ]}
      />

      {/* Quick Actions */}
      <BentoQuickAction
        actions={[
          { label: 'Add Registration', icon: 'Plus', description: 'Register attendee', gradient: 'from-green-500 to-emerald-500' },
          { label: 'Check-In', icon: 'CheckCircle', description: 'Check-in attendees', gradient: 'from-blue-500 to-cyan-500' },
          { label: 'Send Confirmation', icon: 'Mail', description: 'Email confirmations', gradient: 'from-purple-500 to-pink-500' },
          { label: 'Export List', icon: 'Download', description: 'Download attendee list', gradient: 'from-orange-500 to-red-500' },
          { label: 'Analytics', icon: 'BarChart3', description: 'Registration analytics', gradient: 'from-violet-500 to-purple-500' },
          { label: 'Settings', icon: 'Settings', description: 'Registration settings', gradient: 'from-slate-500 to-gray-500' },
          { label: 'Bulk Actions', icon: 'Layers', description: 'Bulk operations', gradient: 'from-pink-500 to-rose-500' },
          { label: 'Help', icon: 'HelpCircle', description: 'Get support', gradient: 'from-cyan-500 to-blue-500' }
        ]}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <PillButton
          label="All Status"
          count={stats.total}
          active={statusFilter === 'all'}
          onClick={() => setStatusFilter('all')}
        />
        <PillButton
          label="Confirmed"
          count={stats.confirmed}
          active={statusFilter === 'confirmed'}
          onClick={() => setStatusFilter('confirmed')}
        />
        <PillButton
          label="Attended"
          count={stats.attended}
          active={statusFilter === 'attended'}
          onClick={() => setStatusFilter('attended')}
        />
        <PillButton
          label="Pending"
          count={stats.pending}
          active={statusFilter === 'pending'}
          onClick={() => setStatusFilter('pending')}
        />
        <PillButton
          label="Cancelled"
          count={stats.cancelled}
          active={statusFilter === 'cancelled'}
          onClick={() => setStatusFilter('cancelled')}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registrations List - Main Column */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold">Registrations ({filteredRegistrations.length})</h2>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-4 text-muted-foreground">Loading registrations...</p>
            </div>
          )}

          {error && (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700">Error loading registrations: {error.message}</p>
            </div>
          )}

          {!loading && !error && filteredRegistrations.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed">
              <p className="text-muted-foreground">No registrations found matching your filters</p>
              <button className="mt-4 px-4 py-2 bg-primary text-white rounded-lg">
                Add First Registration
              </button>
            </div>
          )}

          {!loading && !error && filteredRegistrations.map((registration) => (
            <div
              key={registration.id}
              className="p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all hover:scale-[1.01]"
            >
              {/* Registration Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {registration.registrant_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{registration.registrant_name}</h3>
                      <p className="text-sm text-muted-foreground">{registration.registrant_email}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(registration.status)}`}>
                    {registration.status}
                  </span>
                  {registration.ticket_type && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTicketTypeColor(registration.ticket_type)}`}>
                      {registration.ticket_type.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Registration Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{registration.registration_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Price</p>
                  <p className="font-medium">{formatCurrency(registration.ticket_price)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment</p>
                  <p className="font-medium capitalize">{registration.payment_status || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Registered</p>
                  <p className="font-medium">{formatDate(registration.created_at)}</p>
                </div>
              </div>

              {/* Additional Info */}
              {(registration.company || registration.job_title) && (
                <div className="mt-4 pt-4 border-t flex items-center gap-6 text-sm">
                  {registration.company && (
                    <div>
                      <p className="text-muted-foreground">Company</p>
                      <p className="font-medium">{registration.company}</p>
                    </div>
                  )}
                  {registration.job_title && (
                    <div>
                      <p className="text-muted-foreground">Title</p>
                      <p className="font-medium">{registration.job_title}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Check-in Info */}
              {registration.checked_in_at && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center gap-2 text-sm">
                  <span className="text-green-700">✅ Checked in:</span>
                  <span className="text-green-600">{formatDate(registration.checked_in_at)}</span>
                  {registration.attendance_duration && (
                    <span className="text-green-600">• {registration.attendance_duration} min</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sidebar - Stats Column */}
        <div className="space-y-6">
          <MiniKPI
            label="Revenue Generated"
            value={formatCurrency(stats.totalRevenue)}
            trend={12.4}
            icon="DollarSign"
          />

          <ProgressCard
            label="Check-in Rate"
            value={stats.attendanceRate}
            color="from-green-500 to-emerald-500"
          />

          <ActivityFeed
            title="Recent Registrations"
            items={filteredRegistrations.slice(0, 5).map(registration => ({
              user: registration.registrant_name,
              action: `Registered - ${registration.status}`,
              time: formatDate(registration.created_at),
              type: registration.status === 'confirmed' ? 'success' : registration.status === 'pending' ? 'warning' : 'info'
            }))}
          />

          <RankingList
            title="Top Events"
            items={[
              { rank: 1, name: 'Tech Summit', value: '347 attendees', change: 23 },
              { rank: 2, name: 'Product Launch', value: '248 attendees', change: 18 },
              { rank: 3, name: 'Workshop Series', value: '156 attendees', change: 12 },
              { rank: 4, name: 'Networking Event', value: '94 attendees', change: 8 },
              { rank: 5, name: 'Training Session', value: '67 attendees', change: 5 },
            ]}
          />
        </div>
      </div>
    </div>
  )
}
