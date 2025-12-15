'use client'
import { useState } from 'react'
import { useSystemInsights, type SystemInsight, type InsightType, type InsightSeverity, type InsightStatus } from '@/lib/hooks/use-system-insights'

export default function SystemInsightsClient({ initialInsights }: { initialInsights: SystemInsight[] }) {
  const [typeFilter, setTypeFilter] = useState<InsightType | 'all'>('all')
  const [severityFilter, setSeverityFilter] = useState<InsightSeverity | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<InsightStatus | 'all'>('all')
  const { insights, loading, error } = useSystemInsights({ insightType: typeFilter, severity: severityFilter, status: statusFilter })
  const displayInsights = insights.length > 0 ? insights : initialInsights

  const stats = {
    total: displayInsights.length,
    new: displayInsights.filter(i => i.status === 'new').length,
    critical: displayInsights.filter(i => i.severity === 'critical').length,
    resolved: displayInsights.filter(i => i.status === 'resolved').length
  }

  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-600 to-gray-600 bg-clip-text text-transparent">System Insights</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Total Insights</div><div className="text-3xl font-bold text-slate-600">{stats.total}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">New</div><div className="text-3xl font-bold text-blue-600">{stats.new}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Critical</div><div className="text-3xl font-bold text-red-600">{stats.critical}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Resolved</div><div className="text-3xl font-bold text-green-600">{stats.resolved}</div></div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
          <div className="flex gap-4">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Types</option><option value="anomaly">Anomaly</option><option value="trend">Trend</option><option value="alert">Alert</option><option value="recommendation">Recommendation</option>
            </select>
            <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Severity</option><option value="info">Info</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Status</option><option value="new">New</option><option value="acknowledged">Acknowledged</option><option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {loading && <div className="text-center py-8"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-600 border-r-transparent"></div></div>}

        <div className="space-y-4">{displayInsights.filter(i => (typeFilter === 'all' || i.insight_type === typeFilter) && (severityFilter === 'all' || i.severity === severityFilter) && (statusFilter === 'all' || i.status === statusFilter)).map(insight => (
          <div key={insight.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${insight.severity === 'critical' ? 'bg-red-100 text-red-700' : insight.severity === 'high' ? 'bg-orange-100 text-orange-700' : insight.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>{insight.severity}</span>
                  <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700">{insight.insight_type}</span>
                  <span className={`px-3 py-1 rounded-full text-xs ${insight.status === 'resolved' ? 'bg-green-100 text-green-700' : insight.status === 'new' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{insight.status}</span>
                </div>
                <h3 className="text-lg font-semibold">{insight.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{insight.category}</p>
                {insight.description && <p className="text-sm text-gray-600 mt-2">{insight.description}</p>}
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">{new Date(insight.detected_at).toLocaleDateString()}</div>
                {insight.confidence_score > 0 && <div className="text-xs text-gray-600 mt-1">Confidence: {insight.confidence_score.toFixed(0)}%</div>}
              </div>
            </div>
            {insight.recommended_action && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <div className="text-xs font-medium text-blue-900 mb-1">Recommended Action</div>
                <div className="text-sm text-blue-700">{insight.recommended_action}</div>
              </div>
            )}
          </div>
        ))}</div>
      </div>
    </div>
  )
}
