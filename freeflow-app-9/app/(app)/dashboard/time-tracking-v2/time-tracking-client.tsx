'use client'
import { useState } from 'react'
import { useTimeTracking, type TimeEntry, type TimeTrackingStatus } from '@/lib/hooks/use-time-tracking'

export default function TimeTrackingClient({ initialTimeEntries }: { initialTimeEntries: TimeEntry[] }) {
  const [statusFilter, setStatusFilter] = useState<TimeTrackingStatus | 'all'>('all')
  const [isBillableFilter, setIsBillableFilter] = useState<boolean | undefined>(undefined)
  const { timeEntries, loading, error } = useTimeTracking({ status: statusFilter, isBillable: isBillableFilter })
  const displayEntries = timeEntries.length > 0 ? timeEntries : initialTimeEntries

  const stats = {
    total: displayEntries.length,
    running: displayEntries.filter(e => e.status === 'running').length,
    billable: displayEntries.filter(e => e.is_billable).length,
    totalHours: displayEntries.reduce((sum, e) => sum + (e.duration_hours || 0), 0).toFixed(1)
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0h 0m'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Time Tracking</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Total Entries</div><div className="text-3xl font-bold text-amber-600">{stats.total}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Running</div><div className="text-3xl font-bold text-green-600">{stats.running}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Billable</div><div className="text-3xl font-bold text-blue-600">{stats.billable}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Total Hours</div><div className="text-3xl font-bold text-purple-600">{stats.totalHours}</div></div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
          <div className="flex gap-4">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Status</option><option value="running">Running</option><option value="paused">Paused</option><option value="stopped">Stopped</option><option value="submitted">Submitted</option><option value="approved">Approved</option>
            </select>
            <select value={isBillableFilter === undefined ? 'all' : isBillableFilter ? 'true' : 'false'} onChange={(e) => setIsBillableFilter(e.target.value === 'all' ? undefined : e.target.value === 'true')} className="px-4 py-2 border rounded-lg">
              <option value="all">All Types</option><option value="true">Billable</option><option value="false">Non-Billable</option>
            </select>
          </div>
        </div>

        {loading && <div className="text-center py-8"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-600 border-r-transparent"></div></div>}

        <div className="space-y-4">{displayEntries.filter(e => (statusFilter === 'all' || e.status === statusFilter) && (isBillableFilter === undefined || e.is_billable === isBillableFilter)).map(entry => (
          <div key={entry.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs ${entry.status === 'running' ? 'bg-green-100 text-green-700' : entry.status === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{entry.status}</span>
                  <span className={`px-3 py-1 rounded-full text-xs ${entry.is_billable ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>{entry.is_billable ? 'Billable' : 'Non-Billable'}</span>
                  <span className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700">{entry.entry_type}</span>
                </div>
                <h3 className="text-lg font-semibold">{entry.title}</h3>
                {entry.description && <p className="text-sm text-gray-600 mt-1">{entry.description}</p>}
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                  <span>{new Date(entry.start_time).toLocaleDateString()}</span>
                  {entry.duration_seconds && <span>{formatDuration(entry.duration_seconds)}</span>}
                  {entry.billable_amount && <span className="font-semibold text-green-600">${entry.billable_amount.toFixed(2)}</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-amber-600">{entry.duration_hours ? `${entry.duration_hours.toFixed(1)}h` : '-'}</div>
                <div className="text-xs text-gray-500">duration</div>
                {entry.productivity_score && <div className="text-xs text-gray-600 mt-1">Score: {entry.productivity_score.toFixed(0)}%</div>}
              </div>
            </div>
          </div>
        ))}</div>
      </div>
    </div>
  )
}
