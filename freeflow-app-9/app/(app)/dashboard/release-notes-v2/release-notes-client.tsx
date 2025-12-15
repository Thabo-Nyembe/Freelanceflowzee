'use client'

import { useState } from 'react'
import { useReleaseNotes, ReleaseNote, ReleaseNotesStats } from '@/lib/hooks/use-release-notes'
import { createReleaseNote, deleteReleaseNote, publishReleaseNote, archiveReleaseNote, likeReleaseNote } from '@/app/actions/release-notes'

type ReleaseStatus = 'published' | 'draft' | 'scheduled' | 'archived'
type ReleaseType = 'major' | 'minor' | 'patch' | 'hotfix'

interface ReleaseNotesClientProps {
  initialReleases: ReleaseNote[]
  initialStats: ReleaseNotesStats
}

export default function ReleaseNotesClient({ initialReleases, initialStats }: ReleaseNotesClientProps) {
  const { releases, stats } = useReleaseNotes(initialReleases, initialStats)
  const [statusFilter, setStatusFilter] = useState<ReleaseStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<ReleaseType | 'all'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    version: '', title: '', description: '', release_type: 'minor' as ReleaseType,
    platform: 'all' as const, author: '', highlights: '', features: '', improvements: '', bug_fixes: ''
  })

  const filteredReleases = releases.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false
    if (typeFilter !== 'all' && r.release_type !== typeFilter) return false
    return true
  })

  const statsDisplay = [
    { label: 'Total Releases', value: stats.total.toString(), trend: '+15%' },
    { label: 'Published', value: stats.published.toString(), trend: '+12%' },
    { label: 'Downloads', value: stats.totalDownloads.toLocaleString(), trend: '+25%' },
    { label: 'Avg Likes', value: stats.avgLikes.toFixed(0), trend: '+18%' }
  ]

  const handleCreate = async () => {
    try {
      await createReleaseNote({
        ...formData,
        highlights: formData.highlights ? formData.highlights.split('\n').filter(h => h.trim()) : [],
        features: formData.features ? formData.features.split('\n').filter(f => f.trim()) : [],
        improvements: formData.improvements ? formData.improvements.split('\n').filter(i => i.trim()) : [],
        bug_fixes: formData.bug_fixes ? formData.bug_fixes.split('\n').filter(b => b.trim()) : []
      })
      setShowCreateModal(false)
      setFormData({ version: '', title: '', description: '', release_type: 'minor', platform: 'all', author: '', highlights: '', features: '', improvements: '', bug_fixes: '' })
    } catch (error) {
      console.error('Failed to create:', error)
    }
  }

  const handleDelete = async (id: string) => { if (confirm('Delete?')) await deleteReleaseNote(id) }
  const handlePublish = async (id: string) => { await publishReleaseNote(id) }
  const handleArchive = async (id: string) => { await archiveReleaseNote(id) }
  const handleLike = async (id: string) => { await likeReleaseNote(id) }

  const getStatusColor = (s: ReleaseStatus) => ({ published: 'bg-green-100 text-green-700', draft: 'bg-gray-100 text-gray-700', scheduled: 'bg-blue-100 text-blue-700', archived: 'bg-slate-100 text-slate-700' }[s] || 'bg-gray-100 text-gray-700')
  const getTypeColor = (t: ReleaseType) => ({ major: 'bg-purple-100 text-purple-700', minor: 'bg-blue-100 text-blue-700', patch: 'bg-green-100 text-green-700', hotfix: 'bg-red-100 text-red-700' }[t] || 'bg-gray-100 text-gray-700')

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">Release Notes</h1>
            <p className="text-gray-600 mt-1">Product updates, new features, and version documentation</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="px-6 py-2.5 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 text-white rounded-lg">New Release</button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {statsDisplay.map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-sm text-gray-600">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
              <p className="text-sm text-green-600 mt-1">{s.trend}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            {(['all', 'published', 'draft', 'scheduled'] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2 rounded-full text-sm ${statusFilter === s ? 'bg-orange-600 text-white' : 'bg-white text-gray-700'}`}>
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {(['all', 'major', 'minor', 'patch', 'hotfix'] as const).map(t => (
              <button key={t} onClick={() => setTypeFilter(t)} className={`px-4 py-2 rounded-full text-sm ${typeFilter === t ? 'bg-orange-600 text-white' : 'bg-white text-gray-700'}`}>
                {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {filteredReleases.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                <p className="text-gray-500 mb-4">No release notes found</p>
                <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-orange-600 text-white rounded-lg">Create First Release</button>
              </div>
            ) : filteredReleases.map(release => (
              <div key={release.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">🚀</span>
                      <h3 className="font-bold text-lg">{release.version}</h3>
                      <span className="text-gray-600">•</span>
                      <span className="font-semibold">{release.title}</span>
                    </div>
                    <p className="text-sm text-gray-600">{release.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(release.status)}`}>{release.status}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(release.release_type)}`}>{release.release_type}</span>
                  </div>
                </div>

                {release.highlights && release.highlights.length > 0 && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Highlights</h4>
                    <ul className="space-y-1">{release.highlights.map((h, i) => <li key={i} className="text-sm text-gray-700 flex items-center gap-2"><span className="text-orange-500">⭐</span>{h}</li>)}</ul>
                  </div>
                )}

                {release.features && release.features.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-xs text-gray-700 mb-2">New Features</h4>
                    <ul className="space-y-1">{release.features.map((f, i) => <li key={i} className="text-sm text-gray-600 flex items-center gap-2"><span className="text-green-500">+</span>{f}</li>)}</ul>
                  </div>
                )}

                <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                  <div><span className="text-gray-500 text-xs">Downloads</span><p className="font-semibold">{(release.downloads_count || 0).toLocaleString()}</p></div>
                  <div><span className="text-gray-500 text-xs">Views</span><p className="font-semibold">{(release.views_count || 0).toLocaleString()}</p></div>
                  <div><span className="text-gray-500 text-xs">Likes</span><p className="font-semibold">{release.likes_count || 0}</p></div>
                  <div><span className="text-gray-500 text-xs">Comments</span><p className="font-semibold">{release.comments_count || 0}</p></div>
                </div>

                {release.tags && release.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {release.tags.map((tag, i) => <span key={i} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs">#{tag}</span>)}
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <button onClick={() => handleLike(release.id)} className="flex-1 px-3 py-1.5 bg-orange-50 text-orange-700 rounded text-xs font-medium">Like</button>
                  {release.status === 'draft' && <button onClick={() => handlePublish(release.id)} className="flex-1 px-3 py-1.5 bg-green-50 text-green-700 rounded text-xs font-medium">Publish</button>}
                  {release.status === 'published' && <button onClick={() => handleArchive(release.id)} className="flex-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded text-xs font-medium">Archive</button>}
                  <button onClick={() => handleDelete(release.id)} className="px-3 py-1.5 bg-red-50 text-red-700 rounded text-xs font-medium">Delete</button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between"><span className="text-gray-600">Published</span><span className="font-semibold">{stats.published}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Draft</span><span className="font-semibold">{stats.draft}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Scheduled</span><span className="font-semibold">{stats.scheduled}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Total Downloads</span><span className="font-semibold">{stats.totalDownloads.toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">New Release</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Version</label><input type="text" value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="v2.5.0" /></div>
                  <div><label className="block text-sm font-medium mb-1">Type</label><select value={formData.release_type} onChange={e => setFormData({...formData, release_type: e.target.value as ReleaseType})} className="w-full px-3 py-2 border rounded-lg"><option value="major">Major</option><option value="minor">Minor</option><option value="patch">Patch</option><option value="hotfix">Hotfix</option></select></div>
                </div>
                <div><label className="block text-sm font-medium mb-1">Title</label><input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows={2} /></div>
                <div><label className="block text-sm font-medium mb-1">Highlights (one per line)</label><textarea value={formData.highlights} onChange={e => setFormData({...formData, highlights: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows={3} /></div>
                <div><label className="block text-sm font-medium mb-1">Features (one per line)</label><textarea value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows={3} /></div>
              </div>
              <div className="flex gap-3 mt-6"><button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button><button onClick={handleCreate} className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg">Create</button></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
