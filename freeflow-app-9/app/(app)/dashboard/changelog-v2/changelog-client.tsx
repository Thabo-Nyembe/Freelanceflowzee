'use client'
import { useState } from 'react'
import { useChangelog, type Changelog, type ChangeType, type ReleaseStatus } from '@/lib/hooks/use-changelog'

export default function ChangelogClient({ initialChangelog }: { initialChangelog: Changelog[] }) {
  const [changeTypeFilter, setChangeTypeFilter] = useState<ChangeType | 'all'>('all')
  const [releaseStatusFilter, setReleaseStatusFilter] = useState<ReleaseStatus | 'all'>('all')
  const { changelog, loading, error } = useChangelog({ changeType: changeTypeFilter, releaseStatus: releaseStatusFilter })
  const displayChangelog = changelog.length > 0 ? changelog : initialChangelog

  const stats = {
    total: displayChangelog.length,
    released: displayChangelog.filter(c => c.release_status === 'released').length,
    features: displayChangelog.filter(c => c.change_type === 'feature').length,
    bugFixes: displayChangelog.filter(c => c.change_type === 'bug_fix').length
  }

  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Changelog</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Total Changes</div><div className="text-3xl font-bold text-violet-600">{stats.total}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Released</div><div className="text-3xl font-bold text-green-600">{stats.released}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Features</div><div className="text-3xl font-bold text-blue-600">{stats.features}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Bug Fixes</div><div className="text-3xl font-bold text-orange-600">{stats.bugFixes}</div></div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
          <div className="flex gap-4">
            <select value={changeTypeFilter} onChange={(e) => setChangeTypeFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Types</option><option value="feature">Feature</option><option value="improvement">Improvement</option><option value="bug_fix">Bug Fix</option><option value="security">Security</option>
            </select>
            <select value={releaseStatusFilter} onChange={(e) => setReleaseStatusFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Status</option><option value="draft">Draft</option><option value="scheduled">Scheduled</option><option value="released">Released</option><option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {loading && <div className="text-center py-8"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-violet-600 border-r-transparent"></div></div>}

        <div className="space-y-4">{displayChangelog.filter(c => (changeTypeFilter === 'all' || c.change_type === changeTypeFilter) && (releaseStatusFilter === 'all' || c.release_status === releaseStatusFilter)).map(change => (
          <div key={change.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs ${change.release_status === 'released' ? 'bg-green-100 text-green-700' : change.release_status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{change.release_status}</span>
                  <span className={`px-3 py-1 rounded-full text-xs ${change.change_type === 'feature' ? 'bg-violet-100 text-violet-700' : change.change_type === 'bug_fix' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'}`}>{change.change_type}</span>
                  <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700">{change.version}</span>
                  {change.breaking_change && <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-700">Breaking</span>}
                  {change.is_featured && <span className="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">Featured</span>}
                </div>
                <h3 className="text-lg font-semibold">{change.title}</h3>
                {change.summary && <p className="text-sm text-gray-600 mt-1">{change.summary}</p>}
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                  {change.release_name && <span>🏷️ {change.release_name}</span>}
                  {change.release_date && <span>📅 {change.release_date}</span>}
                  <span>👁️ {change.view_count} views</span>
                  <span>❤️ {change.like_count} likes</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-violet-600">{change.version}</div>
                <div className="text-xs text-gray-500">version</div>
                {change.impact_level && <div className="text-xs text-gray-600 mt-1">⚡ {change.impact_level} impact</div>}
              </div>
            </div>
          </div>
        ))}</div>
      </div>
    </div>
  )
}
