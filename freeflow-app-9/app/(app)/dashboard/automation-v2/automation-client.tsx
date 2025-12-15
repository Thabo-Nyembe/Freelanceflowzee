'use client'
import { useState } from 'react'
import { useAutomation, type Automation, type AutomationType, type AutomationStatus } from '@/lib/hooks/use-automation'

export default function AutomationClient({ initialAutomations }: { initialAutomations: Automation[] }) {
  const [automationTypeFilter, setAutomationTypeFilter] = useState<AutomationType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<AutomationStatus | 'all'>('all')
  const { automations, loading, error } = useAutomation({ automationType: automationTypeFilter, status: statusFilter })
  const displayAutomations = automations.length > 0 ? automations : initialAutomations

  const stats = {
    total: displayAutomations.length,
    active: displayAutomations.filter(a => a.status === 'active').length,
    totalRuns: displayAutomations.reduce((sum, a) => sum + a.run_count, 0),
    avgSuccessRate: displayAutomations.length > 0 ? (displayAutomations.reduce((sum, a) => sum + (a.success_count / (a.run_count || 1) * 100), 0) / displayAutomations.length).toFixed(1) : '0'
  }

  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Automation</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Total Rules</div><div className="text-3xl font-bold text-indigo-600">{stats.total}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Active</div><div className="text-3xl font-bold text-green-600">{stats.active}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Total Runs</div><div className="text-3xl font-bold text-blue-600">{stats.totalRuns}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Avg Success</div><div className="text-3xl font-bold text-purple-600">{stats.avgSuccessRate}%</div></div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
          <div className="flex gap-4">
            <select value={automationTypeFilter} onChange={(e) => setAutomationTypeFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Types</option><option value="trigger">Trigger</option><option value="scheduled">Scheduled</option><option value="conditional">Conditional</option><option value="event">Event</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="paused">Paused</option>
            </select>
          </div>
        </div>

        {loading && <div className="text-center py-8"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div></div>}

        <div className="space-y-4">{displayAutomations.filter(a => (automationTypeFilter === 'all' || a.automation_type === automationTypeFilter) && (statusFilter === 'all' || a.status === statusFilter)).map(automation => (
          <div key={automation.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs ${automation.status === 'active' ? 'bg-green-100 text-green-700' : automation.status === 'running' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{automation.status}</span>
                  <span className="px-3 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700">{automation.automation_type}</span>
                  <span className="px-3 py-1 rounded-full text-xs bg-cyan-100 text-cyan-700">{automation.trigger_type}</span>
                  {automation.is_enabled && <span className="px-3 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700">Enabled</span>}
                </div>
                <h3 className="text-lg font-semibold">{automation.automation_name}</h3>
                {automation.description && <p className="text-sm text-gray-600 mt-1">{automation.description}</p>}
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                  <span>🎯 {automation.action_type}</span>
                  <span>🔄 {automation.run_count} runs</span>
                  <span>✅ {automation.success_count} success</span>
                  {automation.failure_count > 0 && <span className="text-red-600">❌ {automation.failure_count} failed</span>}
                </div>
              </div>
              <div className="text-right">
                {automation.run_count > 0 && (
                  <div>
                    <div className="text-2xl font-bold text-indigo-600">{((automation.success_count / automation.run_count) * 100).toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">success rate</div>
                  </div>
                )}
                {automation.avg_execution_time_ms && <div className="text-xs text-gray-600 mt-1">⚡ {automation.avg_execution_time_ms}ms avg</div>}
              </div>
            </div>
          </div>
        ))}</div>
      </div>
    </div>
  )
}
