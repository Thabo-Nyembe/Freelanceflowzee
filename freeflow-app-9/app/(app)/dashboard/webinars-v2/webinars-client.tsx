// Webinars V2 - Client Component with Real-time Data
// Created: December 14, 2024
// Connected to Supabase backend via hooks

'use client'

import { useState } from 'react'
import { useWebinars, type Webinar, type WebinarStatus, type WebinarTopic } from '@/lib/hooks/use-webinars'
import { StatGrid, MiniKPI, ActivityFeed, RankingList, ProgressCard } from '@/components/ui/results-display'
import { BentoQuickAction } from '@/components/ui/bento-grid-advanced'
import { PillButton } from '@/components/ui/modern-buttons'

interface WebinarsClientProps {
  initialWebinars: Webinar[]
}

export default function WebinarsClient({ initialWebinars }: WebinarsClientProps) {
  const [statusFilter, setStatusFilter] = useState<WebinarStatus | 'all'>('all')
  const [topicFilter, setTopicFilter] = useState<WebinarTopic | 'all'>('all')

  // Use real-time hook with filters
  const { webinars, loading, error } = useWebinars({
    status: statusFilter,
    topic: topicFilter,
    limit: 50
  })

  // Use real-time data or fallback to initial SSR data
  const displayWebinars = webinars.length > 0 ? webinars : initialWebinars

  // Filter webinars based on current filters
  const filteredWebinars = displayWebinars.filter(webinar => {
    if (statusFilter !== 'all' && webinar.status !== statusFilter) return false
    if (topicFilter !== 'all' && webinar.topic !== topicFilter) return false
    return true
  })

  // Calculate statistics
  const stats = {
    total: displayWebinars.length,
    scheduled: displayWebinars.filter(w => w.status === 'scheduled').length,
    live: displayWebinars.filter(w => w.status === 'live').length,
    ended: displayWebinars.filter(w => w.status === 'ended').length,
    totalRegistrations: displayWebinars.reduce((sum, w) => sum + w.registered_count, 0),
    avgAttendance: displayWebinars.length > 0
      ? Math.round(displayWebinars.reduce((sum, w) => {
          const rate = w.attended_count / (w.registered_count || 1)
          return sum + (rate * 100)
        }, 0) / displayWebinars.length)
      : 0
  }

  const getStatusColor = (status: WebinarStatus) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'live':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'ended':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'recording':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getTopicIcon = (topic: WebinarTopic) => {
    switch (topic) {
      case 'sales': return '💼'
      case 'marketing': return '📈'
      case 'product': return '🚀'
      case 'training': return '🎓'
      case 'demo': return '🖥️'
      case 'onboarding': return '👋'
      case 'qa': return '❓'
      default: return '📹'
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

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Webinars Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Schedule and manage your virtual training sessions and webinars
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <StatGrid
        stats={[
          {
            label: 'Total Webinars',
            value: stats.total.toString(),
            trend: '+18%',
            trendLabel: 'vs last month'
          },
          {
            label: 'Scheduled',
            value: stats.scheduled.toString(),
            icon: '📅'
          },
          {
            label: 'Live Now',
            value: stats.live.toString(),
            icon: '🔴'
          },
          {
            label: 'Total Registrations',
            value: stats.totalRegistrations.toString(),
            trend: '+34%',
            icon: '👥'
          }
        ]}
      />

      {/* Quick Actions */}
      <BentoQuickAction
        actions={[
          { label: 'Schedule Webinar', icon: 'Plus', description: 'Create new webinar', gradient: 'from-blue-500 to-cyan-500' },
          { label: 'Start Live', icon: 'Video', description: 'Go live now', gradient: 'from-red-500 to-pink-500' },
          { label: 'View Recordings', icon: 'PlayCircle', description: 'Access recordings', gradient: 'from-purple-500 to-violet-500' },
          { label: 'Send Invites', icon: 'Mail', description: 'Invite participants', gradient: 'from-green-500 to-emerald-500' },
          { label: 'Analytics', icon: 'BarChart3', description: 'View webinar metrics', gradient: 'from-orange-500 to-red-500' },
          { label: 'Settings', icon: 'Settings', description: 'Webinar settings', gradient: 'from-slate-500 to-gray-500' },
          { label: 'Templates', icon: 'Layout', description: 'Webinar templates', gradient: 'from-pink-500 to-rose-500' },
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
            label="Scheduled"
            count={stats.scheduled}
            active={statusFilter === 'scheduled'}
            onClick={() => setStatusFilter('scheduled')}
          />
          <PillButton
            label="Live"
            count={stats.live}
            active={statusFilter === 'live'}
            onClick={() => setStatusFilter('live')}
          />
          <PillButton
            label="Ended"
            count={stats.ended}
            active={statusFilter === 'ended'}
            onClick={() => setStatusFilter('ended')}
          />
        </div>

        <div className="w-px h-8 bg-border" />

        <div className="flex gap-2">
          <PillButton
            label="All Topics"
            active={topicFilter === 'all'}
            onClick={() => setTopicFilter('all')}
          />
          <PillButton
            label="Training"
            active={topicFilter === 'training'}
            onClick={() => setTopicFilter('training')}
          />
          <PillButton
            label="Product"
            active={topicFilter === 'product'}
            onClick={() => setTopicFilter('product')}
          />
          <PillButton
            label="Demo"
            active={topicFilter === 'demo'}
            onClick={() => setTopicFilter('demo')}
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Webinars List - Main Column */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold">Webinars ({filteredWebinars.length})</h2>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-4 text-muted-foreground">Loading webinars...</p>
            </div>
          )}

          {error && (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700">Error loading webinars: {error.message}</p>
            </div>
          )}

          {!loading && !error && filteredWebinars.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed">
              <p className="text-muted-foreground">No webinars found matching your filters</p>
              <button className="mt-4 px-4 py-2 bg-primary text-white rounded-lg">
                Schedule Your First Webinar
              </button>
            </div>
          )}

          {!loading && !error && filteredWebinars.map((webinar) => (
            <div
              key={webinar.id}
              className="p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all hover:scale-[1.01]"
            >
              {/* Webinar Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getTopicIcon(webinar.topic)}</span>
                    <h3 className="text-xl font-bold">{webinar.title}</h3>
                  </div>
                  {webinar.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {webinar.description}
                    </p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(webinar.status)}`}>
                  {webinar.status}
                </span>
              </div>

              {/* Webinar Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(webinar.scheduled_date)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">{formatDuration(webinar.duration_minutes)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Platform</p>
                  <p className="font-medium capitalize">{webinar.platform || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Registered</p>
                  <p className="font-medium">
                    {webinar.registered_count}
                    {webinar.max_participants && ` / ${webinar.max_participants}`}
                  </p>
                </div>
              </div>

              {/* Host & Engagement */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-muted-foreground">Host</p>
                    <p className="font-medium">{webinar.host_name || 'Not assigned'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Attended</p>
                    <p className="font-medium">{webinar.attended_count}</p>
                  </div>
                </div>

                {webinar.recording_url && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-full">
                    <span className="text-xs text-purple-700">📹 Recording Available</span>
                    <span className="text-xs text-purple-600">{webinar.recording_views} views</span>
                  </div>
                )}
              </div>

              {/* Progress Bar for capacity */}
              {webinar.max_participants && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className="font-medium">
                      {Math.round((webinar.registered_count / webinar.max_participants) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                      style={{ width: `${(webinar.registered_count / webinar.max_participants) * 100}%` }}
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
            trend={7.3}
            icon="TrendingUp"
          />

          <ProgressCard
            label="Webinar Success Rate"
            value={94}
            color="from-blue-500 to-purple-500"
          />

          <ActivityFeed
            title="Recent Activity"
            items={filteredWebinars.slice(0, 5).map(webinar => ({
              user: webinar.host_name || 'System',
              action: `${webinar.title} - ${webinar.status}`,
              time: formatDate(webinar.created_at),
              type: webinar.status === 'ended' ? 'success' : webinar.status === 'live' ? 'warning' : 'info'
            }))}
          />

          <RankingList
            title="Top Webinars"
            items={filteredWebinars
              .sort((a, b) => b.registered_count - a.registered_count)
              .slice(0, 5)
              .map((webinar, index) => ({
                rank: index + 1,
                name: webinar.title,
                value: `${webinar.registered_count} registered`,
                change: webinar.attended_count
              }))}
          />
        </div>
      </div>
    </div>
  )
}
