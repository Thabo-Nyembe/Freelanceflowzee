'use client'

import { useState } from 'react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type EventStatus = 'draft' | 'published' | 'live' | 'completed' | 'cancelled'
type EventType = 'conference' | 'workshop' | 'meetup' | 'seminar' | 'networking' | 'webinar'
type EventMode = 'in-person' | 'virtual' | 'hybrid'
type ViewMode = 'all' | 'published' | 'live' | 'upcoming'

export default function EventsV2() {
  const [viewMode, setViewMode] = useState<ViewMode>('all')

  // Sample events data
  const events = [
    {
      id: 'EVT-2847',
      title: 'Tech Innovation Summit 2024',
      type: 'conference' as const,
      status: 'published' as const,
      mode: 'hybrid' as const,
      date: '2024-03-15',
      startTime: '09:00',
      endTime: '17:00',
      location: 'San Francisco Convention Center',
      virtualLink: 'https://meet.company.com/summit2024',
      capacity: 500,
      registered: 347,
      attended: 0,
      waitlist: 24,
      ticketPrice: 299,
      revenue: 103753,
      speakers: ['Dr. Jane Smith', 'John Doe', 'Sarah Williams'],
      organizer: 'Emily Rodriguez',
      tags: ['technology', 'innovation', 'AI']
    },
    {
      id: 'EVT-2846',
      title: 'Product Design Workshop',
      type: 'workshop' as const,
      status: 'live' as const,
      mode: 'in-person' as const,
      date: '2024-02-14',
      startTime: '10:00',
      endTime: '16:00',
      location: 'Creative Hub - New York',
      virtualLink: '',
      capacity: 30,
      registered: 30,
      attended: 28,
      waitlist: 12,
      ticketPrice: 199,
      revenue: 5970,
      speakers: ['Michael Chen', 'Lisa Anderson'],
      organizer: 'David Kim',
      tags: ['design', 'workshop', 'UX']
    },
    {
      id: 'EVT-2845',
      title: 'Monthly Developer Meetup',
      type: 'meetup' as const,
      status: 'published' as const,
      mode: 'in-person' as const,
      date: '2024-02-20',
      startTime: '18:00',
      endTime: '21:00',
      location: 'Tech Hub - Austin',
      virtualLink: '',
      capacity: 80,
      registered: 64,
      attended: 0,
      waitlist: 0,
      ticketPrice: 0,
      revenue: 0,
      speakers: ['Community Members'],
      organizer: 'Sarah Johnson',
      tags: ['developers', 'networking', 'community']
    },
    {
      id: 'EVT-2844',
      title: 'AI & Machine Learning Seminar',
      type: 'seminar' as const,
      status: 'published' as const,
      mode: 'virtual' as const,
      date: '2024-02-25',
      startTime: '14:00',
      endTime: '16:00',
      location: 'Virtual Event',
      virtualLink: 'https://meet.company.com/ai-seminar',
      capacity: 1000,
      registered: 842,
      attended: 0,
      waitlist: 0,
      ticketPrice: 49,
      revenue: 41258,
      speakers: ['Dr. Robert Brown', 'Jessica Williams'],
      organizer: 'Michael Chen',
      tags: ['AI', 'ML', 'technology']
    },
    {
      id: 'EVT-2843',
      title: 'Leadership Summit 2023',
      type: 'conference' as const,
      status: 'completed' as const,
      mode: 'hybrid' as const,
      date: '2023-12-10',
      startTime: '08:00',
      endTime: '18:00',
      location: 'Boston Conference Center',
      virtualLink: 'https://meet.company.com/leadership2023',
      capacity: 400,
      registered: 378,
      attended: 342,
      waitlist: 0,
      ticketPrice: 399,
      revenue: 150822,
      speakers: ['CEO Panel', 'Industry Leaders'],
      organizer: 'Emily Rodriguez',
      tags: ['leadership', 'business', 'strategy']
    }
  ]

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case 'draft': return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
      case 'published': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'live': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'completed': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20'
    }
  }

  const getTypeColor = (type: EventType) => {
    switch (type) {
      case 'conference': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'workshop': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'meetup': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'seminar': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'networking': return 'bg-pink-500/10 text-pink-500 border-pink-500/20'
      case 'webinar': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
    }
  }

  const getModeColor = (mode: EventMode) => {
    switch (mode) {
      case 'in-person': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'virtual': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'hybrid': return 'bg-green-500/10 text-green-500 border-green-500/20'
    }
  }

  const filteredEvents = viewMode === 'all'
    ? events
    : viewMode === 'upcoming'
    ? events.filter(event => event.status === 'published')
    : events.filter(event => event.status === viewMode)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-pink-950/20">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              Events Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Organize and manage all events and conferences
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300">
              Create Event
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Events',
              value: '84',
              change: '+12',
              trend: 'up' as const,
              subtitle: 'this year'
            },
            {
              label: 'Total Attendees',
              value: '12,847',
              change: '+2,284',
              trend: 'up' as const,
              subtitle: 'registered participants'
            },
            {
              label: 'Revenue',
              value: '$523K',
              change: '+124K',
              trend: 'up' as const,
              subtitle: 'from ticket sales'
            },
            {
              label: 'Avg Attendance',
              value: '87%',
              change: '+5%',
              trend: 'up' as const,
              subtitle: 'show-up rate'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            { label: 'New Event', icon: '➕', onClick: () => {} },
            { label: 'Calendar View', icon: '📅', onClick: () => {} },
            { label: 'Check-In', icon: '✅', onClick: () => {} },
            { label: 'Send Invites', icon: '✉️', onClick: () => {} },
            { label: 'Analytics', icon: '📊', onClick: () => {} },
            { label: 'Attendees', icon: '👥', onClick: () => {} },
            { label: 'Reports', icon: '📋', onClick: () => {} },
            { label: 'Settings', icon: '⚙️', onClick: () => {} }
          ]}
        />

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <PillButton
            label="All Events"
            isActive={viewMode === 'all'}
            onClick={() => setViewMode('all')}
          />
          <PillButton
            label="Upcoming"
            isActive={viewMode === 'upcoming'}
            onClick={() => setViewMode('upcoming')}
          />
          <PillButton
            label="Published"
            isActive={viewMode === 'published'}
            onClick={() => setViewMode('published')}
          />
          <PillButton
            label="Live"
            isActive={viewMode === 'live'}
            onClick={() => setViewMode('live')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Events List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
                Events ({filteredEvents.length})
              </h2>
              <div className="space-y-3">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-pink-500/50 dark:hover:border-pink-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/10 group cursor-pointer bg-white dark:bg-slate-800/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                            {event.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getTypeColor(event.type)}`}>
                            {event.type}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getModeColor(event.mode)}`}>
                            {event.mode}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <span className="text-pink-500">📅</span>
                            {event.date} {event.startTime}-{event.endTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-pink-500">📍</span>
                            {event.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-pink-500">👤</span>
                            {event.organizer}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                          {Math.round((event.registered / event.capacity) * 100)}%
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Capacity
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-900 dark:text-white">{event.capacity}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Capacity</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-pink-600 dark:text-pink-400">{event.registered}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Registered</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">{event.attended}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Attended</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{event.waitlist}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Waitlist</div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
                        <span>Registration: {event.registered}/{event.capacity}</span>
                        {event.ticketPrice > 0 && (
                          <span className="font-medium text-green-600 dark:text-green-400">
                            Revenue: {formatCurrency(event.revenue)}
                          </span>
                        )}
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-pink-600 to-rose-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((event.registered / event.capacity) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {event.tags.map((tag) => (
                            <span key={tag} className="px-2 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        {event.ticketPrice > 0 && (
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {formatCurrency(event.ticketPrice)} / ticket
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                        Speakers: {event.speakers.join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Event Types */}
            <ProgressCard
              title="Events by Type"
              items={[
                { label: 'Conferences', value: 24, total: 84, color: 'purple' },
                { label: 'Workshops', value: 28, total: 84, color: 'blue' },
                { label: 'Meetups', value: 18, total: 84, color: 'green' },
                { label: 'Seminars', value: 10, total: 84, color: 'orange' },
                { label: 'Webinars', value: 4, total: 84, color: 'cyan' }
              ]}
            />

            {/* Top Events by Revenue */}
            <RankingList
              title="Top Events by Revenue"
              items={[
                { label: 'Leadership Summit', value: '$151K', rank: 1, trend: 'up' },
                { label: 'Tech Innovation', value: '$104K', rank: 2, trend: 'up' },
                { label: 'AI Seminar', value: '$41K', rank: 3, trend: 'same' },
                { label: 'Design Workshop', value: '$6K', rank: 4, trend: 'down' },
                { label: 'Dev Meetup', value: 'Free', rank: 5, trend: 'same' }
              ]}
            />

            {/* Event Modes */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Event Modes</h3>
              <div className="space-y-3">
                {[
                  { mode: 'In-Person', count: 42, percentage: 50, color: 'from-blue-600 to-cyan-600' },
                  { mode: 'Virtual', count: 28, percentage: 33, color: 'from-purple-600 to-pink-600' },
                  { mode: 'Hybrid', count: 14, percentage: 17, color: 'from-green-600 to-emerald-600' }
                ].map((item) => (
                  <div key={item.mode}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-900 dark:text-white">{item.mode}</span>
                      <span className="text-slate-600 dark:text-slate-400">{item.count} events ({item.percentage}%)</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <MiniKPI
                label="Avg Ticket"
                value="$186"
                trend="up"
                change="+$24"
              />
              <MiniKPI
                label="No-Show Rate"
                value="13%"
                trend="down"
                change="-5%"
              />
            </div>

            {/* Recent Activity */}
            <ActivityFeed
              activities={[
                {
                  action: 'Event live',
                  subject: 'Product Design Workshop - 28 attending',
                  time: '2 hours ago',
                  type: 'success'
                },
                {
                  action: 'Event published',
                  subject: 'AI Seminar - 842 registered',
                  time: '1 day ago',
                  type: 'info'
                },
                {
                  action: 'Capacity reached',
                  subject: 'Design Workshop - Waitlist active',
                  time: '2 days ago',
                  type: 'warning'
                },
                {
                  action: 'Event completed',
                  subject: 'Leadership Summit - 342 attended',
                  time: '2 months ago',
                  type: 'success'
                }
              ]}
            />

          </div>
        </div>

      </div>
    </div>
  )
}
