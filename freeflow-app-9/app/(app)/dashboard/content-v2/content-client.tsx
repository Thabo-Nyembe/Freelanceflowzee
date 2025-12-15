'use client'
import { useState } from 'react'
import { useContent, type Content, type ContentType, type ContentStatus } from '@/lib/hooks/use-content'

export default function ContentClient({ initialContent }: { initialContent: Content[] }) {
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'all'>('all')
  const { content, loading, error } = useContent({ contentType: contentTypeFilter, status: statusFilter })
  const displayContent = content.length > 0 ? content : initialContent

  const stats = {
    total: displayContent.length,
    published: displayContent.filter(c => c.status === 'published').length,
    totalViews: displayContent.reduce((sum, c) => sum + c.view_count, 0),
    avgReadTime: displayContent.length > 0 ? (displayContent.reduce((sum, c) => sum + (c.avg_read_time_seconds || 0), 0) / displayContent.length / 60).toFixed(1) : '0'
  }

  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Content Management</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Total Content</div><div className="text-3xl font-bold text-emerald-600">{stats.total}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Published</div><div className="text-3xl font-bold text-green-600">{stats.published}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Total Views</div><div className="text-3xl font-bold text-blue-600">{stats.totalViews.toLocaleString()}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Avg Read Time</div><div className="text-3xl font-bold text-purple-600">{stats.avgReadTime}m</div></div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
          <div className="flex gap-4">
            <select value={contentTypeFilter} onChange={(e) => setContentTypeFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Types</option><option value="article">Article</option><option value="blog">Blog</option><option value="page">Page</option><option value="post">Post</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Status</option><option value="draft">Draft</option><option value="in_review">In Review</option><option value="published">Published</option><option value="scheduled">Scheduled</option>
            </select>
          </div>
        </div>

        {loading && <div className="text-center py-8"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div></div>}

        <div className="space-y-4">{displayContent.filter(c => (contentTypeFilter === 'all' || c.content_type === contentTypeFilter) && (statusFilter === 'all' || c.status === statusFilter)).map(item => (
          <div key={item.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs ${item.status === 'published' ? 'bg-green-100 text-green-700' : item.status === 'draft' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>{item.status}</span>
                  <span className="px-3 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700">{item.content_type}</span>
                  {item.is_featured && <span className="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">Featured</span>}
                  {item.is_premium && <span className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700">Premium</span>}
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                {item.excerpt && <p className="text-sm text-gray-600 mt-1">{item.excerpt}</p>}
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                  <span>👁️ {item.view_count} views</span>
                  <span>❤️ {item.like_count} likes</span>
                  <span>📢 {item.share_count} shares</span>
                  {item.word_count && <span>📝 {item.word_count} words</span>}
                </div>
              </div>
              <div className="text-right">
                {item.avg_read_time_seconds && (
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">{Math.ceil(item.avg_read_time_seconds / 60)}m</div>
                    <div className="text-xs text-gray-500">read time</div>
                  </div>
                )}
                {item.completion_rate && <div className="text-xs text-gray-600 mt-1">📊 {item.completion_rate.toFixed(1)}% completion</div>}
              </div>
            </div>
          </div>
        ))}</div>
      </div>
    </div>
  )
}
