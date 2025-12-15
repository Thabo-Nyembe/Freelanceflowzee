// Events V2 - Client Component with Real-time Data
// Created: December 14, 2024
// Connected to Supabase backend via hooks

'use client'

import { useState } from 'react'
import { useEvents, type Event, type EventStatus, type EventType } from '@/lib/hooks/use-events'
import { StatGrid, MiniKPI, ActivityFeed, RankingList, ProgressCard } from '@/components/ui/results-display'
import { BentoQuickAction } from '@/components/ui/bento-grid-advanced'
import { PillButton } from '@/components/ui/modern-buttons'

interface EventsClientProps {
  initialEvents: Event[]
}

export default function EventsClient({ initialEvents }: EventsClientProps) {
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all')

  // Use real-time hook with filters
  const { events, loading, error } = useEvents({
    status: statusFilter,
    eventType: typeFilter,
    limit: 50
  })

  // Use real-time data or fallback to initial SSR data
  const displayEvents = events.length > 0 ? events : initialEvents

  // Filter events based on current filters
  const filteredEvents = displayEvents.filter(event => {
    if (statusFilter !== 'all' && event.status !== statusFilter) return false
    if (typeFilter !== 'all' && event.event_type !== typeFilter) return false
    return true
  })

  // Calculate statistics
  const stats = {
    total: displayEvents.length,
    upcoming: displayEvents.filter(e => e.status === 'upcoming').length,
    ongoing: displayEvents.filter(e => e.status === 'ongoing').length,
    completed: displayEvents.filter(e => e.status === 'completed').length,
    totalAttendees: displayEvents.reduce((sum, e) => sum + e.current_attendees, 0),
    avgAttendance: displayEvents.length > 0
      ? Math.round(displayEvents.reduce((sum, e) => sum + (e.attendance_rate || 0), 0) / displayEvents.length)
      : 0
  }

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'ongoing':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'completed':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'postponed':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getEventTypeIcon = (type: EventType) => {
    switch (type) {
      case 'conference': return '🎤'
      case 'workshop': return '🛠️'
      case 'meetup': return '👥'
      case 'training': return '📚'
      case 'seminar': return '💼'
      case 'networking': return '🤝'
      case 'launch': return '🚀'
      default: return '📅'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Events Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Organize and manage your events, conferences, and webinars
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <StatGrid
        stats={[
          {
            label: 'Total Events',
            value: stats.total.toString(),
            trend: '+12%',
            trendLabel: 'vs last month'
          },
          {
            label: 'Upcoming',
            value: stats.upcoming.toString(),
            icon: '📅'
          },
          {
            label: 'Ongoing',
            value: stats.ongoing.toString(),
            icon: '🎯'
          },
          {
            label: 'Total Attendees',
            value: stats.totalAttendees.toString(),
            trend: '+24%',
            icon: '👥'
          }
        ]}
      />

      {/* Quick Actions */}
      <BentoQuickAction
        actions={[
          { label: 'Create Event', icon: 'Plus', description: 'Schedule a new event', gradient: 'from-purple-500 to-pink-500' },
          { label: 'View Calendar', icon: 'Calendar', description: 'See all events', gradient: 'from-blue-500 to-cyan-500' },
          { label: 'Export Data', icon: 'Download', description: 'Download event data', gradient: 'from-green-500 to-emerald-500' },
          { label: 'Send Invites', icon: 'Mail', description: 'Invite participants', gradient: 'from-orange-500 to-red-500' },
          { label: 'Analytics', icon: 'BarChart3', description: 'View event analytics', gradient: 'from-violet-500 to-purple-500' },
          { label: 'Settings', icon: 'Settings', description: 'Event preferences', gradient: 'from-slate-500 to-gray-500' },
          { label: 'Templates', icon: 'Layout', description: 'Event templates', gradient: 'from-pink-500 to-rose-500' },
          { label: 'Help', icon: 'HelpCircle', description: 'Get support', gradient: 'from-cyan-500 to-blue-500' }
        ]}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-2">
          <PillButton
            label="All Status"
            count={stats.total}
            active={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
          />
          <PillButton
            label="Upcoming"
            count={stats.upcoming}
            active={statusFilter === 'upcoming'}
            onClick={() => setStatusFilter('upcoming')}
          />
          <PillButton
            label="Ongoing"
            count={stats.ongoing}
            active={statusFilter === 'ongoing'}
            onClick={() => setStatusFilter('ongoing')}
          />
          <PillButton
            label="Completed"
            count={stats.completed}
            active={statusFilter === 'completed'}
            onClick={() => setStatusFilter('completed')}
          />
        </div>

        <div className="w-px h-8 bg-border" />

        <div className="flex gap-2">
          <PillButton
            label="All Types"
            active={typeFilter === 'all'}
            onClick={() => setTypeFilter('all')}
          />
          <PillButton
            label="Conference"
            active={typeFilter === 'conference'}
            onClick={() => setTypeFilter('conference')}
          />
          <PillButton
            label="Workshop"
            active={typeFilter === 'workshop'}
            onClick={() => setTypeFilter('workshop')}
          />
          <PillButton
            label="Meetup"
            active={typeFilter === 'meetup'}
            onClick={() => setTypeFilter('meetup')}
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events List - Main Column */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold">Events ({filteredEvents.length})</h2>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-4 text-muted-foreground">Loading events...</p>
            </div>
          )}

          {error && (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700">Error loading events: {error.message}</p>
            </div>
          )}

          {!loading && !error && filteredEvents.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed">
              <p className="text-muted-foreground">No events found matching your filters</p>
              <button className="mt-4 px-4 py-2 bg-primary text-white rounded-lg">
                Create Your First Event
              </button>
            </div>
          )}

          {!loading && !error && filteredEvents.map((event) => (
            <div
              key={event.id}
              className="p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all hover:scale-[1.01]"
            >
              {/* Event Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getEventTypeIcon(event.event_type)}</span>
                    <h3 className="text-xl font-bold">{event.name}</h3>
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
              </div>

              {/* Event Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(event.start_date)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{event.event_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-medium capitalize">{event.location_type || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Attendees</p>
                  <p className="font-medium">
                    {event.current_attendees}
                    {event.max_attendees && ` / ${event.max_attendees}`}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              {event.max_attendees && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className="font-medium">
                      {Math.round((event.current_attendees / event.max_attendees) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                      style={{ width: `${(event.current_attendees / event.max_attendees) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sidebar - Stats Column */}
        <div className="space-y-6">
          <MiniKPI
            label="Avg Attendance"
            value={`${stats.avgAttendance}%`}
            trend={5.2}
            icon="TrendingUp"
          />

          <ProgressCard
            label="Event Success Rate"
            value={92}
            color="from-green-500 to-emerald-500"
          />

          <ActivityFeed
            title="Recent Activity"
            items={filteredEvents.slice(0, 5).map(event => ({
              user: 'System',
              action: `${event.name} - ${event.status}`,
              time: formatDate(event.created_at),
              type: event.status === 'completed' ? 'success' : 'info'
            }))}
          />

          <RankingList
            title="Top Events"
            items={filteredEvents
              .sort((a, b) => b.current_attendees - a.current_attendees)
              .slice(0, 5)
              .map((event, index) => ({
                rank: index + 1,
                name: event.name,
                value: `${event.current_attendees} attendees`,
                change: event.attendance_rate || 0
              }))}
          />
        </div>
      </div>
    </div>
  )
}
