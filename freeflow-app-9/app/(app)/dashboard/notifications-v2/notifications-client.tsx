// Notifications V2 - Client Component with Real-time Data
// Created: December 14, 2024

'use client'

import { useState } from 'react'
import { useNotifications, type Notification, type NotificationStatus, type NotificationType, type NotificationPriority } from '@/lib/hooks/use-notifications'

interface NotificationsClientProps {
  initialNotifications: Notification[]
}

export default function NotificationsClient({ initialNotifications }: NotificationsClientProps) {
  const [statusFilter, setStatusFilter] = useState<NotificationStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all')

  const { notifications, loading, error } = useNotifications({
    status: statusFilter,
    notificationType: typeFilter,
    limit: 50
  })

  const displayNotifications = notifications.length > 0 ? notifications : initialNotifications

  const filteredNotifications = displayNotifications.filter(notification => {
    if (statusFilter !== 'all' && notification.status !== statusFilter) return false
    if (typeFilter !== 'all' && notification.notification_type !== typeFilter) return false
    return true
  })

  const stats = {
    total: displayNotifications.length,
    unread: displayNotifications.filter(n => !n.is_read).length,
    read: displayNotifications.filter(n => n.is_read).length,
    dismissed: displayNotifications.filter(n => n.is_dismissed).length
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: NotificationStatus) => {
    const colors = {
      'unread': 'bg-blue-100 text-blue-700',
      'read': 'bg-gray-100 text-gray-700',
      'dismissed': 'bg-yellow-100 text-yellow-700',
      'archived': 'bg-gray-100 text-gray-700',
      'deleted': 'bg-red-100 text-red-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getTypeColor = (type: NotificationType) => {
    const colors = {
      'info': 'bg-blue-50 text-blue-600',
      'success': 'bg-green-50 text-green-600',
      'warning': 'bg-yellow-50 text-yellow-600',
      'error': 'bg-red-50 text-red-600',
      'system': 'bg-gray-50 text-gray-600',
      'user': 'bg-purple-50 text-purple-600',
      'task': 'bg-indigo-50 text-indigo-600',
      'message': 'bg-cyan-50 text-cyan-600',
      'reminder': 'bg-orange-50 text-orange-600',
      'alert': 'bg-red-50 text-red-600'
    }
    return colors[type] || 'bg-gray-50 text-gray-600'
  }

  const getPriorityIcon = (priority: NotificationPriority) => {
    return priority === 'high' || priority === 'urgent' || priority === 'critical' ? '🔴' :
           priority === 'normal' ? '🟡' : '🟢'
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            Error loading notifications: {error.message}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Notifications
            </h1>
            <p className="text-gray-600 mt-2">Stay updated with important alerts</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all">
            Mark All as Read
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Total</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-green-600 mt-1">↑ Real-time</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Unread</div>
            <div className="text-3xl font-bold text-blue-600">{stats.unread}</div>
            <div className="text-xs text-gray-500 mt-1">Need attention</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Read</div>
            <div className="text-3xl font-bold text-green-600">{stats.read}</div>
            <div className="text-xs text-gray-500 mt-1">Reviewed</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Dismissed</div>
            <div className="text-3xl font-bold text-yellow-600">{stats.dismissed}</div>
            <div className="text-xs text-gray-500 mt-1">Cleared</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as NotificationStatus | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              >
                <option value="all">All Statuses</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="dismissed">Dismissed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as NotificationType | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              >
                <option value="all">All Types</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="system">System</option>
                <option value="user">User</option>
                <option value="task">Task</option>
                <option value="message">Message</option>
                <option value="reminder">Reminder</option>
                <option value="alert">Alert</option>
              </select>
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-violet-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading notifications...</p>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Notifications ({filteredNotifications.length})</h2>

          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
              <div className="text-gray-400 mb-2">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No notifications</h3>
              <p className="text-gray-600">You're all caught up!</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-xl p-6 shadow-sm hover:shadow-md transition-all border ${
                  !notification.is_read ? 'bg-violet-50 border-violet-200' : 'bg-white border-gray-100'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{getPriorityIcon(notification.priority)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                        {notification.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.notification_type)}`}>
                        {notification.notification_type}
                      </span>
                      <span className="text-xs text-gray-500">{formatDate(notification.created_at)}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{notification.title}</h3>
                    <p className="text-gray-700 mb-2">{notification.message}</p>
                    {notification.action_url && (
                      <button className="text-sm text-violet-600 hover:text-violet-700 font-medium">
                        {notification.action_label || 'View Details'} →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
