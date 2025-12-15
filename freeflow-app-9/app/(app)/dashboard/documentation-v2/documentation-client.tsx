'use client'

import { useState } from 'react'
import { useDocumentation, Documentation, DocumentationStats } from '@/lib/hooks/use-documentation'
import { createDocumentation, deleteDocumentation, publishDocumentation, archiveDocumentation, markHelpful } from '@/app/actions/documentation'

type DocStatus = 'published' | 'draft' | 'review' | 'archived'
type DocType = 'guide' | 'api-reference' | 'tutorial' | 'concept' | 'quickstart' | 'troubleshooting'

interface DocumentationClientProps {
  initialDocs: Documentation[]
  initialStats: DocumentationStats
}

export default function DocumentationClient({ initialDocs, initialStats }: DocumentationClientProps) {
  const { docs, stats } = useDocumentation(initialDocs, initialStats)
  const [statusFilter, setStatusFilter] = useState<DocStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<DocType | 'all'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '', description: '', doc_type: 'guide' as DocType, category: 'getting-started' as const, author: '', version: 'v1.0', tags: ''
  })

  const filteredDocs = docs.filter(d => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false
    if (typeFilter !== 'all' && d.doc_type !== typeFilter) return false
    return true
  })

  const statsDisplay = [
    { label: 'Total Docs', value: stats.total.toString(), trend: '+15%' },
    { label: 'Published', value: stats.published.toString(), trend: '+12%' },
    { label: 'Total Views', value: stats.totalViews.toLocaleString(), trend: '+25%' },
    { label: 'Helpful Rate', value: `${stats.avgHelpfulRate.toFixed(0)}%`, trend: '+5%' }
  ]

  const handleCreate = async () => {
    try {
      await createDocumentation({
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : []
      })
      setShowCreateModal(false)
      setFormData({ title: '', description: '', doc_type: 'guide', category: 'getting-started', author: '', version: 'v1.0', tags: '' })
    } catch (error) {
      console.error('Failed to create:', error)
    }
  }

  const handleDelete = async (id: string) => { if (confirm('Delete?')) await deleteDocumentation(id) }
  const handlePublish = async (id: string) => { await publishDocumentation(id) }
  const handleArchive = async (id: string) => { await archiveDocumentation(id) }
  const handleMarkHelpful = async (id: string, helpful: boolean) => { await markHelpful(id, helpful) }

  const getStatusColor = (s: DocStatus) => ({ published: 'bg-green-100 text-green-700', draft: 'bg-gray-100 text-gray-700', review: 'bg-blue-100 text-blue-700', archived: 'bg-slate-100 text-slate-700' }[s] || 'bg-gray-100 text-gray-700')
  const getTypeColor = (t: DocType) => ({ guide: 'bg-blue-100 text-blue-700', 'api-reference': 'bg-purple-100 text-purple-700', tutorial: 'bg-green-100 text-green-700', concept: 'bg-orange-100 text-orange-700', quickstart: 'bg-cyan-100 text-cyan-700', troubleshooting: 'bg-red-100 text-red-700' }[t] || 'bg-gray-100 text-gray-700')

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">Documentation</h1>
            <p className="text-gray-600 mt-1">Manage knowledge base, guides, and API references</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="px-6 py-2.5 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white rounded-lg">New Document</button>
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
            {(['all', 'published', 'draft', 'review'] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2 rounded-full text-sm ${statusFilter === s ? 'bg-purple-600 text-white' : 'bg-white text-gray-700'}`}>
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {(['all', 'guide', 'tutorial', 'api-reference'] as const).map(t => (
              <button key={t} onClick={() => setTypeFilter(t)} className={`px-4 py-2 rounded-full text-sm ${typeFilter === t ? 'bg-purple-600 text-white' : 'bg-white text-gray-700'}`}>
                {t === 'all' ? 'All Types' : t === 'api-reference' ? 'API Docs' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {filteredDocs.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                <p className="text-gray-500 mb-4">No documentation found</p>
                <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg">Create First Document</button>
              </div>
            ) : filteredDocs.map(doc => (
              <div key={doc.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">📖</span>
                      <h3 className="font-semibold text-lg">{doc.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                    <p className="text-xs text-gray-500">ID: {doc.id.slice(0, 8)} • {doc.version}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>{doc.status}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(doc.doc_type)}`}>{doc.doc_type}</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                  <div><span className="text-gray-500 text-xs">Views</span><p className="font-semibold">{(doc.views_count || 0).toLocaleString()}</p></div>
                  <div><span className="text-gray-500 text-xs">Likes</span><p className="font-semibold">{doc.likes_count || 0}</p></div>
                  <div><span className="text-gray-500 text-xs">Comments</span><p className="font-semibold">{doc.comments_count || 0}</p></div>
                  <div><span className="text-gray-500 text-xs">Read Time</span><p className="font-semibold">{doc.read_time || 5} min</p></div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">Helpful Rating</span>
                    <span className="text-xs font-medium">
                      {((doc.helpful_count || 0) + (doc.not_helpful_count || 0)) > 0
                        ? `${(((doc.helpful_count || 0) / ((doc.helpful_count || 0) + (doc.not_helpful_count || 0))) * 100).toFixed(0)}%`
                        : 'No feedback'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => handleMarkHelpful(doc.id, true)} className="flex items-center gap-1 text-green-600 hover:bg-green-50 px-2 py-1 rounded">
                      <span>✓</span><span className="text-sm font-medium">{doc.helpful_count || 0}</span>
                    </button>
                    <button onClick={() => handleMarkHelpful(doc.id, false)} className="flex items-center gap-1 text-red-600 hover:bg-red-50 px-2 py-1 rounded">
                      <span>✗</span><span className="text-sm font-medium">{doc.not_helpful_count || 0}</span>
                    </button>
                  </div>
                </div>

                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {doc.tags.map((tag, i) => <span key={i} className="px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-xs">#{tag}</span>)}
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  {doc.status === 'draft' && <button onClick={() => handlePublish(doc.id)} className="flex-1 px-3 py-1.5 bg-green-50 text-green-700 rounded text-xs font-medium">Publish</button>}
                  {doc.status === 'published' && <button onClick={() => handleArchive(doc.id)} className="flex-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded text-xs font-medium">Archive</button>}
                  <button onClick={() => handleDelete(doc.id)} className="px-3 py-1.5 bg-red-50 text-red-700 rounded text-xs font-medium">Delete</button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between"><span className="text-gray-600">Published</span><span className="font-semibold text-green-600">{stats.published}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">In Review</span><span className="font-semibold text-blue-600">{stats.review}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Draft</span><span className="font-semibold">{stats.draft}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Total Views</span><span className="font-semibold">{stats.totalViews.toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6">
              <h2 className="text-xl font-semibold mb-4">New Document</h2>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">Title</label><input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows={3} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Type</label><select value={formData.doc_type} onChange={e => setFormData({...formData, doc_type: e.target.value as DocType})} className="w-full px-3 py-2 border rounded-lg"><option value="guide">Guide</option><option value="tutorial">Tutorial</option><option value="api-reference">API Reference</option><option value="concept">Concept</option><option value="quickstart">Quick Start</option><option value="troubleshooting">Troubleshooting</option></select></div>
                  <div><label className="block text-sm font-medium mb-1">Version</label><input type="text" value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
                </div>
                <div><label className="block text-sm font-medium mb-1">Tags (comma-separated)</label><input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
              </div>
              <div className="flex gap-3 mt-6"><button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button><button onClick={handleCreate} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg">Create</button></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
