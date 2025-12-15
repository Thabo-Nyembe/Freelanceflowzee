'use client'

import { useState } from 'react'
import { useHelpDocs, HelpDoc, HelpDocsStats } from '@/lib/hooks/use-help-docs'
import { createHelpDoc, deleteHelpDoc, publishHelpDoc, markAsOutdated, markHelpful } from '@/app/actions/help-docs'

type DocStatus = 'published' | 'draft' | 'review' | 'outdated'
type DocCategory = 'faq' | 'how-to' | 'troubleshooting' | 'reference' | 'best-practices' | 'glossary'

interface HelpDocsClientProps {
  initialDocs: HelpDoc[]
  initialStats: HelpDocsStats
}

export default function HelpDocsClient({ initialDocs, initialStats }: HelpDocsClientProps) {
  const { docs, stats } = useHelpDocs(initialDocs, initialStats)
  const [statusFilter, setStatusFilter] = useState<DocStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<DocCategory | 'all'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '', question: '', answer: '', category: 'faq' as DocCategory, author: '', tags: ''
  })

  const filteredDocs = docs.filter(d => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false
    if (categoryFilter !== 'all' && d.category !== categoryFilter) return false
    return true
  })

  const statsDisplay = [
    { label: 'Total Articles', value: stats.total.toString(), trend: '+12%' },
    { label: 'Published', value: stats.published.toString(), trend: '+8%' },
    { label: 'Total Views', value: stats.totalViews.toLocaleString(), trend: '+35%' },
    { label: 'Helpfulness', value: `${stats.avgHelpfulness.toFixed(0)}%`, trend: '+6%' }
  ]

  const handleCreate = async () => {
    try {
      await createHelpDoc({
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : []
      })
      setShowCreateModal(false)
      setFormData({ title: '', question: '', answer: '', category: 'faq', author: '', tags: '' })
    } catch (error) {
      console.error('Failed to create:', error)
    }
  }

  const handleDelete = async (id: string) => { if (confirm('Delete?')) await deleteHelpDoc(id) }
  const handlePublish = async (id: string) => { await publishHelpDoc(id) }
  const handleMarkOutdated = async (id: string) => { await markAsOutdated(id) }
  const handleMarkHelpful = async (id: string, helpful: boolean) => { await markHelpful(id, helpful) }

  const getStatusColor = (s: DocStatus) => ({ published: 'bg-green-100 text-green-700', draft: 'bg-gray-100 text-gray-700', review: 'bg-blue-100 text-blue-700', outdated: 'bg-red-100 text-red-700' }[s] || 'bg-gray-100 text-gray-700')
  const getCategoryColor = (c: DocCategory) => ({ faq: 'bg-blue-100 text-blue-700', 'how-to': 'bg-green-100 text-green-700', troubleshooting: 'bg-red-100 text-red-700', reference: 'bg-purple-100 text-purple-700', 'best-practices': 'bg-orange-100 text-orange-700', glossary: 'bg-cyan-100 text-cyan-700' }[c] || 'bg-gray-100 text-gray-700')
  const getCategoryIcon = (c: DocCategory) => ({ faq: '❓', 'how-to': '📖', troubleshooting: '🔧', reference: '📚', 'best-practices': '⭐', glossary: '📝' }[c] || '📄')

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">Help Documentation</h1>
            <p className="text-gray-600 mt-1">Self-service knowledge base and support resources</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="px-6 py-2.5 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white rounded-lg">New Article</button>
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
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2 rounded-full text-sm ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {(['all', 'faq', 'how-to', 'troubleshooting'] as const).map(c => (
              <button key={c} onClick={() => setCategoryFilter(c)} className={`px-4 py-2 rounded-full text-sm ${categoryFilter === c ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>
                {c === 'all' ? 'All Categories' : c.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {filteredDocs.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                <p className="text-gray-500 mb-4">No help docs found</p>
                <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Create First Article</button>
              </div>
            ) : filteredDocs.map(doc => (
              <div key={doc.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{getCategoryIcon(doc.category)}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{doc.title}</h3>
                      {doc.question && <p className="text-sm text-gray-700 font-medium mb-2">{doc.question}</p>}
                      {doc.answer && <p className="text-sm text-gray-600">{doc.answer}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>{doc.status}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(doc.category)}`}>{doc.category}</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                  <div><span className="text-gray-500 text-xs">Views</span><p className="font-semibold">{(doc.views_count || 0).toLocaleString()}</p></div>
                  <div><span className="text-gray-500 text-xs">Searches</span><p className="font-semibold">{(doc.searches_count || 0).toLocaleString()}</p></div>
                  <div><span className="text-gray-500 text-xs">Comments</span><p className="font-semibold">{doc.comments_count || 0}</p></div>
                  <div><span className="text-gray-500 text-xs">Popularity</span><p className="font-semibold text-green-600">{doc.popularity_score || 0}%</p></div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">Was this helpful?</span>
                    <span className="text-xs font-medium">
                      {((doc.helpful_count || 0) + (doc.not_helpful_count || 0)) > 0
                        ? `${(((doc.helpful_count || 0) / ((doc.helpful_count || 0) + (doc.not_helpful_count || 0))) * 100).toFixed(0)}% found helpful`
                        : 'No feedback yet'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => handleMarkHelpful(doc.id, true)} className="flex items-center gap-1 text-green-600 hover:bg-green-50 px-2 py-1 rounded">
                      <span>👍</span><span className="text-sm font-medium">{doc.helpful_count || 0}</span>
                    </button>
                    <button onClick={() => handleMarkHelpful(doc.id, false)} className="flex items-center gap-1 text-red-600 hover:bg-red-50 px-2 py-1 rounded">
                      <span>👎</span><span className="text-sm font-medium">{doc.not_helpful_count || 0}</span>
                    </button>
                  </div>
                </div>

                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {doc.tags.map((tag, i) => <span key={i} className="px-3 py-1 bg-sky-50 text-sky-700 rounded-full text-xs">#{tag}</span>)}
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  {doc.status === 'draft' && <button onClick={() => handlePublish(doc.id)} className="flex-1 px-3 py-1.5 bg-green-50 text-green-700 rounded text-xs font-medium">Publish</button>}
                  {doc.status === 'published' && <button onClick={() => handleMarkOutdated(doc.id)} className="flex-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded text-xs font-medium">Mark Outdated</button>}
                  <button onClick={() => handleDelete(doc.id)} className="px-3 py-1.5 bg-red-50 text-red-700 rounded text-xs font-medium">Delete</button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between"><span className="text-gray-600">Published</span><span className="font-semibold">{stats.published}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">In Review</span><span className="font-semibold">{stats.review}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Draft</span><span className="font-semibold">{stats.draft}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Total Views</span><span className="font-semibold">{stats.totalViews.toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6">
              <h2 className="text-xl font-semibold mb-4">New Help Article</h2>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">Title</label><input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Question</label><textarea value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows={2} /></div>
                <div><label className="block text-sm font-medium mb-1">Answer</label><textarea value={formData.answer} onChange={e => setFormData({...formData, answer: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows={4} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Category</label><select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as DocCategory})} className="w-full px-3 py-2 border rounded-lg"><option value="faq">FAQ</option><option value="how-to">How-To</option><option value="troubleshooting">Troubleshooting</option><option value="reference">Reference</option><option value="best-practices">Best Practices</option><option value="glossary">Glossary</option></select></div>
                  <div><label className="block text-sm font-medium mb-1">Tags (comma-separated)</label><input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
                </div>
              </div>
              <div className="flex gap-3 mt-6"><button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button><button onClick={handleCreate} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">Create</button></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
