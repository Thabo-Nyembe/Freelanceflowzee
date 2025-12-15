// Announcements V2 - Client Component with Real-time Data
// Created: December 14, 2024
// Connected to Supabase backend via hooks

'use client'

import { useState } from 'react'
import { useAnnouncements, type Announcement, type AnnouncementStatus, type AnnouncementPriority } from '@/lib/hooks/use-announcements'

interface AnnouncementsClientProps {
  initialAnnouncements: Announcement[]
}

export default function AnnouncementsClient({ initialAnnouncements }: AnnouncementsClientProps) {
  const [statusFilter, setStatusFilter] = useState<AnnouncementStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<AnnouncementPriority | 'all'>('all')

  // Use real-time hook with filters
  const { announcements, loading, error } = useAnnouncements({
    status: statusFilter,
    priority: priorityFilter,
    limit: 50
  })

  // Use real-time data or fallback to initial SSR data
  const displayAnnouncements = announcements.length > 0 ? announcements : initialAnnouncements

  // Filter announcements based on current filters
  const filteredAnnouncements = displayAnnouncements.filter(announcement => {
    if (statusFilter !== 'all' && announcement.status !== statusFilter) return false
    if (priorityFilter !== 'all' && announcement.priority !== priorityFilter) return false
    return true
  })

  // Calculate statistics
  const stats = {
    total: displayAnnouncements.length,
    published: displayAnnouncements.filter(a => a.status === 'published').length,
    draft: displayAnnouncements.filter(a => a.status === 'draft').length,
    scheduled: displayAnnouncements.filter(a => a.status === 'scheduled').length,
    totalViews: displayAnnouncements.reduce((sum, a) => sum + (a.views_count || 0), 0),
    avgEngagement: displayAnnouncements.length > 0
      ? Math.round(displayAnnouncements.reduce((sum, a) => sum + (a.reactions_count || 0), 0) / displayAnnouncements.length)
      : 0
  }

  const getStatusColor = (status: AnnouncementStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'published':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'archived':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPriorityColor = (priority: AnnouncementPriority) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-50 text-gray-600'
      case 'normal':
        return 'bg-blue-50 text-blue-600'
      case 'high':
        return 'bg-orange-50 text-orange-600'
      case 'urgent':
        return 'bg-red-50 text-red-600'
      case 'critical':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-50 text-gray-600'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Announcements Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Create and manage company announcements and updates
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm text-muted-foreground">Total Announcements</div>
          <div className="text-3xl font-bold mt-2">{stats.total}</div>
        </div>
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm text-muted-foreground">Published</div>
          <div className="text-3xl font-bold mt-2">{stats.published}</div>
        </div>
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm text-muted-foreground">Total Views</div>
          <div className="text-3xl font-bold mt-2">{stats.totalViews.toLocaleString()}</div>
        </div>
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm text-muted-foreground">Avg Engagement</div>
          <div className="text-3xl font-bold mt-2">{stats.avgEngagement}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            statusFilter === 'all'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({stats.total})
        </button>
        <button
          onClick={() => setStatusFilter('published')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            statusFilter === 'published'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Published ({stats.published})
        </button>
        <button
          onClick={() => setStatusFilter('draft')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            statusFilter === 'draft'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Draft ({stats.draft})
        </button>
        <button
          onClick={() => setStatusFilter('scheduled')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            statusFilter === 'scheduled'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Scheduled ({stats.scheduled})
        </button>

        <div className="w-px h-8 bg-gray-300" />

        <button
          onClick={() => setPriorityFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            priorityFilter === 'all'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Priority
        </button>
        <button
          onClick={() => setPriorityFilter('high')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            priorityFilter === 'high'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          High Priority
        </button>
        <button
          onClick={() => setPriorityFilter('urgent')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            priorityFilter === 'urgent'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Urgent
        </button>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Announcements ({filteredAnnouncements.length})</h2>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-muted-foreground">Loading announcements...</p>
          </div>
        )}

        {error && (
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700">Error loading announcements: {error.message}</p>
          </div>
        )}

        {!loading && !error && filteredAnnouncements.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed">
            <p className="text-muted-foreground">No announcements found matching your filters</p>
            <button className="mt-4 px-4 py-2 bg-primary text-white rounded-lg">
              Create First Announcement
            </button>
          </div>
        )}

        {!loading && !error && filteredAnnouncements.map((announcement) => (
          <div
            key={announcement.id}
            className="p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all hover:scale-[1.01]"
          >
            {/* Announcement Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {announcement.is_pinned && (
                    <span className="text-yellow-500">📌</span>
                  )}
                  <h3 className="text-xl font-bold">{announcement.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {announcement.content}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(announcement.status)}`}>
                  {announcement.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                  {announcement.priority} priority
                </span>
              </div>
            </div>

            {/* Announcement Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Type</p>
                <p className="font-medium capitalize">{announcement.announcement_type}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Views</p>
                <p className="font-medium">{announcement.views_count?.toLocaleString() || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Reactions</p>
                <p className="font-medium">{announcement.reactions_count || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Published</p>
                <p className="font-medium">{formatDate(announcement.published_at)}</p>
              </div>
            </div>

            {/* Target Audience */}
            {announcement.target_audience && (
              <div className="mt-4 pt-4 border-t">
                <span className="text-xs text-muted-foreground">Target: </span>
                <span className="text-xs font-medium capitalize">{announcement.target_audience}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
