'use client'
import { useState } from 'react'
import { usePerformanceAnalytics, type PerformanceAnalytic, type PerformanceType } from '@/lib/hooks/use-performance-analytics'

export default function PerformanceAnalyticsClient({ initialPerformanceAnalytics }: { initialPerformanceAnalytics: PerformanceAnalytic[] }) {
  const [typeFilter, setTypeFilter] = useState<PerformanceType | 'all'>('all')
  const { performanceAnalytics, loading, error } = usePerformanceAnalytics({ performanceType: typeFilter })
  const displayMetrics = performanceAnalytics.length > 0 ? performanceAnalytics : initialPerformanceAnalytics

  const stats = {
    avgScore: displayMetrics.reduce((sum, m) => sum + (m.performance_score || 0), 0) / displayMetrics.length || 0,
    degraded: displayMetrics.filter(m => m.is_degraded).length,
    critical: displayMetrics.filter(m => m.is_critical).length,
    optimal: displayMetrics.filter(m => m.is_optimal).length
  }

  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Performance Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Avg Score</div><div className="text-3xl font-bold text-blue-600">{stats.avgScore.toFixed(1)}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Optimal</div><div className="text-3xl font-bold text-green-600">{stats.optimal}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Degraded</div><div className="text-3xl font-bold text-yellow-600">{stats.degraded}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Critical</div><div className="text-3xl font-bold text-red-600">{stats.critical}</div></div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
            <option value="all">All Types</option><option value="speed">Speed</option><option value="efficiency">Efficiency</option><option value="quality">Quality</option><option value="reliability">Reliability</option>
          </select>
        </div>

        {loading && <div className="text-center py-8"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div></div>}

        <div className="space-y-4">{displayMetrics.filter(m => typeFilter === 'all' || m.performance_type === typeFilter).map(metric => (
          <div key={metric.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{metric.metric_name}</h3>
                <p className="text-sm text-gray-600 mt-1">{metric.metric_category} • {metric.performance_type}</p>
                <div className="flex gap-2 mt-2">
                  {metric.is_optimal && <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">Optimal</span>}
                  {metric.is_degraded && <span className="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">Degraded</span>}
                  {metric.is_critical && <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-700">Critical</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{metric.current_value.toFixed(2)}</div>
                {metric.performance_score && <div className="text-sm text-gray-600">Score: {metric.performance_score.toFixed(1)}</div>}
              </div>
            </div>
            {metric.performance_score && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span>Performance</span><span>{metric.performance_score.toFixed(1)}%</span></div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${metric.performance_score >= 90 ? 'bg-green-500' : metric.performance_score >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${metric.performance_score}%` }}></div></div>
              </div>
            )}
          </div>
        ))}</div>
      </div>
    </div>
  )
}
