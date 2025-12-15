// Messages V2 - Client Component with Real-time Data
// Created: December 14, 2024

'use client'

import { useState } from 'react'
import { useMessages, type Message, type MessageStatus, type MessageType } from '@/lib/hooks/use-messages'

interface MessagesClientProps {
  initialMessages: Message[]
}

export default function MessagesClient({ initialMessages }: MessagesClientProps) {
  const [statusFilter, setStatusFilter] = useState<MessageStatus | 'all'>('all')
  const [folderFilter, setFolderFilter] = useState<string | 'all'>('inbox')

  const { messages, loading, error } = useMessages({
    status: statusFilter,
    folder: folderFilter,
    limit: 50
  })

  const displayMessages = messages.length > 0 ? messages : initialMessages

  // Filter client-side for better UX
  const filteredMessages = displayMessages.filter(message => {
    if (statusFilter !== 'all' && message.status !== statusFilter) return false
    if (folderFilter !== 'all' && message.folder !== folderFilter) return false
    return true
  })

  // Calculate statistics
  const stats = {
    total: displayMessages.length,
    byStatus: displayMessages.reduce((acc, message) => {
      acc[message.status] = (acc[message.status] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    byType: displayMessages.reduce((acc, message) => {
      acc[message.message_type] = (acc[message.message_type] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    byFolder: displayMessages.reduce((acc, message) => {
      acc[message.folder] = (acc[message.folder] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    unread: displayMessages.filter(m => !m.is_read).length,
    starred: displayMessages.filter(m => m.is_starred).length
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

  const getStatusColor = (status: MessageStatus) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-700',
      'sent': 'bg-blue-100 text-blue-700',
      'delivered': 'bg-green-100 text-green-700',
      'read': 'bg-purple-100 text-purple-700',
      'archived': 'bg-gray-100 text-gray-700',
      'deleted': 'bg-red-100 text-red-700',
      'failed': 'bg-red-100 text-red-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getTypeColor = (type: MessageType) => {
    const colors = {
      'direct': 'bg-blue-50 text-blue-600',
      'group': 'bg-purple-50 text-purple-600',
      'broadcast': 'bg-orange-50 text-orange-600',
      'system': 'bg-gray-50 text-gray-600',
      'automated': 'bg-green-50 text-green-600'
    }
    return colors[type] || 'bg-gray-50 text-gray-600'
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'low': 'bg-gray-50 text-gray-600',
      'normal': 'bg-blue-50 text-blue-600',
      'high': 'bg-orange-50 text-orange-600',
      'urgent': 'bg-red-50 text-red-600'
    }
    return colors[priority] || 'bg-gray-50 text-gray-600'
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            Error loading messages: {error.message}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Messages
            </h1>
            <p className="text-gray-600 mt-2">Communicate with your clients</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all">
            + New Message
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Total Messages</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-green-600 mt-1">↑ Real-time</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Unread</div>
            <div className="text-3xl font-bold text-blue-600">{stats.unread}</div>
            <div className="text-xs text-gray-500 mt-1">Need attention</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Sent</div>
            <div className="text-3xl font-bold text-green-600">{stats.byStatus.sent || 0}</div>
            <div className="text-xs text-gray-500 mt-1">Successfully sent</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Starred</div>
            <div className="text-3xl font-bold text-yellow-600">{stats.starred}</div>
            <div className="text-xs text-gray-500 mt-1">Important</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Folder</label>
              <select
                value={folderFilter}
                onChange={(e) => setFolderFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Folders</option>
                <option value="inbox">Inbox</option>
                <option value="sent">Sent</option>
                <option value="drafts">Drafts</option>
                <option value="archive">Archive</option>
                <option value="spam">Spam</option>
                <option value="trash">Trash</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as MessageStatus | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="delivered">Delivered</option>
                <option value="read">Read</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading messages...</p>
          </div>
        )}

        {/* Messages List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Messages ({filteredMessages.length})
            </h2>
          </div>

          {filteredMessages.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
              <div className="text-gray-400 mb-2">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No messages found</h3>
              <p className="text-gray-600">Send your first message to get started!</p>
            </div>
          ) : (
            filteredMessages.map((message) => (
              <div
                key={message.id}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                        {message.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(message.message_type)}`}>
                        {message.message_type}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
                        {message.priority}
                      </span>
                      {!message.is_read && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                          Unread
                        </span>
                      )}
                      {message.is_starred && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-600">
                          ★ Starred
                        </span>
                      )}
                      {message.is_important && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600">
                          ! Important
                        </span>
                      )}
                    </div>
                    {message.subject && (
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{message.subject}</h3>
                    )}
                    <p className="text-gray-700 mb-3">{message.body}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Folder: {message.folder}</span>
                      <span>Created: {formatDate(message.created_at)}</span>
                      {message.sent_at && (
                        <span>Sent: {formatDate(message.sent_at)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {message.has_attachments && (
                      <div className="text-center">
                        <div className="text-lg font-semibold text-purple-600">
                          📎 {message.attachment_count}
                        </div>
                        <div className="text-xs text-gray-500">attachments</div>
                      </div>
                    )}
                  </div>
                </div>

                {message.thread_id && (
                  <div className="mb-3 text-sm text-gray-600">
                    <span className="font-medium">Thread ID:</span> {message.thread_id}
                  </div>
                )}

                {message.read_at && (
                  <div className="mb-3 text-sm text-gray-600">
                    <span className="font-medium">Read:</span> {formatDate(message.read_at)}
                  </div>
                )}

                {message.category && (
                  <div className="mb-3">
                    <span className="text-sm text-gray-600">Category: </span>
                    <span className="text-sm font-medium text-gray-900">{message.category}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
