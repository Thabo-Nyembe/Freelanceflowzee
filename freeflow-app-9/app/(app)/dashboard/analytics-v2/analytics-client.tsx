'use client'
import { useState } from 'react'
import { useAnalytics, type AnalyticsRecord, type MetricType, type PeriodType } from '@/lib/hooks/use-analytics'

export default function AnalyticsClient({ initialAnalytics }: { initialAnalytics: AnalyticsRecord[] }) {
  const [metricTypeFilter, setMetricTypeFilter] = useState<MetricType | 'all'>('all')
  const [periodTypeFilter, setPeriodTypeFilter] = useState<PeriodType | 'all'>('all')
  const { analytics, loading, error } = useAnalytics({ metricType: metricTypeFilter, periodType: periodTypeFilter })
  const displayAnalytics = analytics.length > 0 ? analytics : initialAnalytics

  const stats = {
    totalMetrics: displayAnalytics.length,
    avgValue: displayAnalytics.reduce((sum, a) => sum + a.value, 0) / displayAnalytics.length || 0,
    alertsTriggered: displayAnalytics.filter(a => a.is_alert_triggered).length,
    activeMetrics: displayAnalytics.filter(a => a.status === 'active').length
  }

  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Total Metrics</div><div className="text-3xl font-bold text-indigo-600">{stats.totalMetrics}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Avg Value</div><div className="text-3xl font-bold text-purple-600">{stats.avgValue.toFixed(2)}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Alerts</div><div className="text-3xl font-bold text-red-600">{stats.alertsTriggered}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Active</div><div className="text-3xl font-bold text-green-600">{stats.activeMetrics}</div></div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
          <div className="flex gap-4">
            <select value={metricTypeFilter} onChange={(e) => setMetricTypeFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Types</option><option value="count">Count</option><option value="average">Average</option><option value="percentage">Percentage</option>
            </select>
            <select value={periodTypeFilter} onChange={(e) => setPeriodTypeFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Periods</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        {loading && <div className="text-center py-8"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div></div>}

        <div className="space-y-4">{displayAnalytics.filter(a => (metricTypeFilter === 'all' || a.metric_type === metricTypeFilter) && (periodTypeFilter === 'all' || a.period_type === periodTypeFilter)).map(analytic => {
          const changePercent = analytic.change_percent || 0
          const isPositive = changePercent >= 0

          return (
            <div key={analytic.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{analytic.metric_name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{analytic.category} • {analytic.metric_type}</p>
                  <p className="text-sm text-gray-600">{analytic.period_type} • {new Date(analytic.period_start).toLocaleDateString()} - {new Date(analytic.period_end).toLocaleDateString()}</p>
                  <div className="flex gap-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs ${analytic.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{analytic.status}</span>
                    {analytic.is_alert_triggered && <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-700">Alert</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-indigo-600">{analytic.value.toFixed(2)}</div>
                  {changePercent !== 0 && (
                    <div className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}</div>
      </div>
    </div>
  )
}
