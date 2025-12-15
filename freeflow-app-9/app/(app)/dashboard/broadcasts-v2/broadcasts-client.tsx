'use client'
import { useState } from 'react'
import { useBroadcasts, type Broadcast, type BroadcastType, type BroadcastStatus } from '@/lib/hooks/use-broadcasts'

export default function BroadcastsClient({ initialBroadcasts }: { initialBroadcasts: Broadcast[] }) {
  const [broadcastTypeFilter, setBroadcastTypeFilter] = useState<BroadcastType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<BroadcastStatus | 'all'>('all')
  const { broadcasts, loading, error } = useBroadcasts({ broadcastType: broadcastTypeFilter, status: statusFilter })
  const displayBroadcasts = broadcasts.length > 0 ? broadcasts : initialBroadcasts

  const stats = {
    total: displayBroadcasts.length,
    sent: displayBroadcasts.filter(b => b.status === 'sent' || b.status === 'completed').length,
    totalRecipients: displayBroadcasts.reduce((sum, b) => sum + b.total_recipients, 0),
    avgOpenRate: displayBroadcasts.length > 0 ? (displayBroadcasts.reduce((sum, b) => sum + (b.open_rate || 0), 0) / displayBroadcasts.length).toFixed(1) : '0'
  }

  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Broadcasts</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Total Broadcasts</div><div className="text-3xl font-bold text-violet-600">{stats.total}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Sent</div><div className="text-3xl font-bold text-green-600">{stats.sent}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Total Recipients</div><div className="text-3xl font-bold text-blue-600">{stats.totalRecipients}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Avg Open Rate</div><div className="text-3xl font-bold text-purple-600">{stats.avgOpenRate}%</div></div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
          <div className="flex gap-4">
            <select value={broadcastTypeFilter} onChange={(e) => setBroadcastTypeFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Types</option><option value="email">Email</option><option value="sms">SMS</option><option value="push">Push</option><option value="in_app">In-App</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Status</option><option value="draft">Draft</option><option value="scheduled">Scheduled</option><option value="sending">Sending</option><option value="sent">Sent</option><option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {loading && <div className="text-center py-8"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-violet-600 border-r-transparent"></div></div>}

        <div className="space-y-4">{displayBroadcasts.filter(b => (broadcastTypeFilter === 'all' || b.broadcast_type === broadcastTypeFilter) && (statusFilter === 'all' || b.status === statusFilter)).map(broadcast => (
          <div key={broadcast.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs ${broadcast.status === 'sent' || broadcast.status === 'completed' ? 'bg-green-100 text-green-700' : broadcast.status === 'sending' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{broadcast.status}</span>
                  <span className="px-3 py-1 rounded-full text-xs bg-violet-100 text-violet-700">{broadcast.broadcast_type}</span>
                  <span className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700">{broadcast.audience_type}</span>
                </div>
                <h3 className="text-lg font-semibold">{broadcast.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{broadcast.broadcast_name}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                  <span>{broadcast.total_recipients} recipients</span>
                  {broadcast.sent_count > 0 && <span>✅ {broadcast.sent_count} sent</span>}
                  {broadcast.delivered_count > 0 && <span>📬 {broadcast.delivered_count} delivered</span>}
                  {broadcast.opened_count > 0 && <span>👀 {broadcast.opened_count} opened</span>}
                </div>
              </div>
              <div className="text-right">
                {broadcast.open_rate && (
                  <div>
                    <div className="text-2xl font-bold text-violet-600">{broadcast.open_rate.toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">open rate</div>
                  </div>
                )}
                {broadcast.scheduled_for && <div className="text-xs text-gray-600 mt-1">📅 {new Date(broadcast.scheduled_for).toLocaleString()}</div>}
              </div>
            </div>
          </div>
        ))}</div>
      </div>
    </div>
  )
}
