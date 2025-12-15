// Chat V2 - Client Component with Real-time Data
// Created: December 14, 2024

'use client'

import { useState } from 'react'
import { useChat, type ChatMessage, type RoomType, type ChatStatus } from '@/lib/hooks/use-chat'

interface ChatClientProps {
  initialChatMessages: ChatMessage[]
}

export default function ChatClient({ initialChatMessages }: ChatClientProps) {
  const [roomTypeFilter, setRoomTypeFilter] = useState<RoomType | 'all'>('all')
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(undefined)

  const { chatMessages, loading, error } = useChat({
    roomId: selectedRoomId,
    roomType: roomTypeFilter,
    limit: 50
  })

  const displayMessages = chatMessages.length > 0 ? chatMessages : initialChatMessages

  const filteredMessages = displayMessages.filter(message => {
    if (roomTypeFilter !== 'all' && message.room_type !== roomTypeFilter) return false
    return true
  })

  const stats = {
    total: displayMessages.length,
    byRoomType: displayMessages.reduce((acc, message) => {
      acc[message.room_type] = (acc[message.room_type] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    byMessageType: displayMessages.reduce((acc, message) => {
      acc[message.message_type] = (acc[message.message_type] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    unread: displayMessages.filter(m => !m.is_read).length
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoomTypeColor = (type: RoomType) => {
    const colors = {
      'direct': 'bg-blue-50 text-blue-600',
      'group': 'bg-purple-50 text-purple-600',
      'channel': 'bg-green-50 text-green-600',
      'team': 'bg-indigo-50 text-indigo-600',
      'support': 'bg-orange-50 text-orange-600',
      'public': 'bg-cyan-50 text-cyan-600',
      'private': 'bg-gray-50 text-gray-600'
    }
    return colors[type] || 'bg-gray-50 text-gray-600'
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            Error loading chat: {error.message}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Chat
            </h1>
            <p className="text-gray-600 mt-2">Real-time team chat and collaboration</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all">
            + New Message
          </button>
        </div>

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
            <div className="text-sm text-gray-600 mb-1">Rooms</div>
            <div className="text-3xl font-bold text-purple-600">
              {Object.keys(stats.byRoomType).length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Active rooms</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Text Messages</div>
            <div className="text-3xl font-bold text-green-600">{stats.byMessageType.text || 0}</div>
            <div className="text-xs text-gray-500 mt-1">Chat messages</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Room Type</label>
              <select
                value={roomTypeFilter}
                onChange={(e) => setRoomTypeFilter(e.target.value as RoomType | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              >
                <option value="all">All Room Types</option>
                <option value="direct">Direct</option>
                <option value="group">Group</option>
                <option value="channel">Channel</option>
                <option value="team">Team</option>
                <option value="support">Support</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading chat...</p>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Messages ({filteredMessages.length})
          </h2>

          {filteredMessages.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
              <div className="text-gray-400 mb-2">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No messages yet</h3>
              <p className="text-gray-600">Start a conversation to get started!</p>
            </div>
          ) : (
            filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`rounded-xl p-6 shadow-sm hover:shadow-md transition-all border ${
                  !message.is_read ? 'bg-cyan-50 border-cyan-200' : 'bg-white border-gray-100'
                }`}
              >
                <div className="flex items-start gap-4">
                  {message.sender_avatar && (
                    <img
                      src={message.sender_avatar}
                      alt={message.sender_name || 'User'}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">
                        {message.sender_name || 'Unknown User'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoomTypeColor(message.room_type)}`}>
                        {message.room_type}
                      </span>
                      <span className="text-xs text-gray-500">{formatDate(message.created_at)}</span>
                    </div>
                    {message.room_name && (
                      <div className="text-sm text-gray-600 mb-2">
                        # {message.room_name}
                      </div>
                    )}
                    <p className="text-gray-700 mb-2">{message.message}</p>
                    <div className="flex items-center gap-4 text-sm">
                      {message.reaction_count > 0 && (
                        <span className="text-gray-600">
                          {message.reaction_count} reaction{message.reaction_count > 1 ? 's' : ''}
                        </span>
                      )}
                      {message.is_edited && (
                        <span className="text-gray-500 italic">(edited)</span>
                      )}
                      {message.is_pinned && (
                        <span className="text-yellow-600">📌 Pinned</span>
                      )}
                    </div>
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
