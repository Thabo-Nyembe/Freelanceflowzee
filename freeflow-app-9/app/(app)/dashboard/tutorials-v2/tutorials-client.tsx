'use client'

import { useState } from 'react'
import { useTutorials, Tutorial, TutorialStats } from '@/lib/hooks/use-tutorials'
import { createTutorial, deleteTutorial, publishTutorial, archiveTutorial, enrollInTutorial } from '@/app/actions/tutorials'

type TutorialStatus = 'published' | 'draft' | 'scheduled' | 'archived'
type TutorialLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'
type TutorialFormat = 'video' | 'text' | 'interactive' | 'mixed'

interface TutorialsClientProps {
  initialTutorials: Tutorial[]
  initialStats: TutorialStats
}

export default function TutorialsClient({ initialTutorials, initialStats }: TutorialsClientProps) {
  const { tutorials, stats } = useTutorials(initialTutorials, initialStats)
  const [statusFilter, setStatusFilter] = useState<TutorialStatus | 'all'>('all')
  const [levelFilter, setLevelFilter] = useState<TutorialLevel | 'all'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '', description: '', level: 'beginner' as TutorialLevel, format: 'video' as TutorialFormat,
    duration_minutes: 30, lessons_count: 5, author: '', tags: '', prerequisites: ''
  })

  const filteredTutorials = tutorials.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (levelFilter !== 'all' && t.level !== levelFilter) return false
    return true
  })

  const statsDisplay = [
    { label: 'Total Tutorials', value: stats.total.toString(), trend: '+15%' },
    { label: 'Published', value: stats.published.toString(), trend: '+12%' },
    { label: 'Enrollments', value: stats.totalEnrollments.toLocaleString(), trend: '+28%' },
    { label: 'Completion Rate', value: `${stats.avgCompletionRate.toFixed(0)}%`, trend: '+8%' }
  ]

  const handleCreate = async () => {
    try {
      await createTutorial({
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
        prerequisites: formData.prerequisites ? formData.prerequisites.split(',').map(t => t.trim()).filter(t => t) : []
      })
      setShowCreateModal(false)
      setFormData({ title: '', description: '', level: 'beginner', format: 'video', duration_minutes: 30, lessons_count: 5, author: '', tags: '', prerequisites: '' })
    } catch (error) {
      console.error('Failed to create:', error)
    }
  }

  const handleDelete = async (id: string) => { if (confirm('Delete tutorial?')) await deleteTutorial(id) }
  const handlePublish = async (id: string) => { await publishTutorial(id) }
  const handleArchive = async (id: string) => { await archiveTutorial(id) }
  const handleEnroll = async (id: string) => { await enrollInTutorial(id) }

  const getStatusColor = (s: TutorialStatus) => ({ published: 'bg-green-100 text-green-700', draft: 'bg-gray-100 text-gray-700', scheduled: 'bg-blue-100 text-blue-700', archived: 'bg-slate-100 text-slate-700' }[s] || 'bg-gray-100 text-gray-700')
  const getLevelColor = (l: TutorialLevel) => ({ beginner: 'bg-green-100 text-green-700', intermediate: 'bg-blue-100 text-blue-700', advanced: 'bg-orange-100 text-orange-700', expert: 'bg-purple-100 text-purple-700' }[l] || 'bg-gray-100 text-gray-700')
  const getFormatIcon = (f: TutorialFormat) => ({ video: '🎬', text: '📄', interactive: '💻', mixed: '📚' }[f] || '📖')

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 bg-clip-text text-transparent">Tutorials</h1>
            <p className="text-gray-600 mt-1">Interactive learning content and step-by-step guides</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="px-6 py-2.5 bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 text-white rounded-lg">New Tutorial</button>
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
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2 rounded-full text-sm ${statusFilter === s ? 'bg-rose-600 text-white' : 'bg-white text-gray-700'}`}>
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {(['all', 'beginner', 'intermediate', 'advanced'] as const).map(l => (
              <button key={l} onClick={() => setLevelFilter(l)} className={`px-4 py-2 rounded-full text-sm ${levelFilter === l ? 'bg-rose-600 text-white' : 'bg-white text-gray-700'}`}>
                {l === 'all' ? 'All Levels' : l.charAt(0).toUpperCase() + l.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {filteredTutorials.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                <p className="text-gray-500 mb-4">No tutorials found</p>
                <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-rose-600 text-white rounded-lg">Create First Tutorial</button>
              </div>
            ) : filteredTutorials.map(tutorial => (
              <div key={tutorial.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">🎓</span>
                      <h3 className="font-semibold text-lg">{tutorial.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{tutorial.description}</p>
                    <p className="text-xs text-gray-500">ID: {tutorial.id.slice(0, 8)} • By {tutorial.author || 'Unknown'}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tutorial.status)}`}>{tutorial.status}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(tutorial.level)}`}>{tutorial.level}</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                  <div><span className="text-gray-500 text-xs">Format</span><p className="font-semibold">{getFormatIcon(tutorial.format)} {tutorial.format}</p></div>
                  <div><span className="text-gray-500 text-xs">Duration</span><p className="font-semibold">{tutorial.duration_minutes || 0} min</p></div>
                  <div><span className="text-gray-500 text-xs">Lessons</span><p className="font-semibold">{tutorial.lessons_count || 0}</p></div>
                  <div><span className="text-gray-500 text-xs">Enrollments</span><p className="font-semibold">{(tutorial.enrollments_count || 0).toLocaleString()}</p></div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div><span className="text-gray-500 text-xs">Views</span><p className="font-semibold">{(tutorial.views_count || 0).toLocaleString()}</p></div>
                  <div><span className="text-gray-500 text-xs">Completions</span><p className="font-semibold text-green-600">{(tutorial.completions_count || 0).toLocaleString()}</p></div>
                  <div><span className="text-gray-500 text-xs">Likes</span><p className="font-semibold">{tutorial.likes_count || 0}</p></div>
                </div>

                {(tutorial.rating || 0) > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Rating</span>
                      <span className="text-xs font-medium">{tutorial.rating}/5.0 ({tutorial.reviews_count || 0} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className={i < Math.floor(tutorial.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                      ))}
                    </div>
                  </div>
                )}

                {tutorial.prerequisites && tutorial.prerequisites.length > 0 && (
                  <div className="mb-4">
                    <span className="text-xs text-gray-500">Prerequisites</span>
                    <ul className="mt-1 space-y-1">
                      {tutorial.prerequisites.map((p, i) => <li key={i} className="text-sm text-gray-600 flex items-center gap-2"><span className="text-blue-500">✓</span>{p}</li>)}
                    </ul>
                  </div>
                )}

                {tutorial.tags && tutorial.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tutorial.tags.map((tag, i) => <span key={i} className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs">#{tag}</span>)}
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  {tutorial.status === 'draft' && <button onClick={() => handlePublish(tutorial.id)} className="flex-1 px-3 py-1.5 bg-green-50 text-green-700 rounded text-xs font-medium">Publish</button>}
                  {tutorial.status === 'published' && <button onClick={() => handleEnroll(tutorial.id)} className="flex-1 px-3 py-1.5 bg-rose-50 text-rose-700 rounded text-xs font-medium">Start Learning</button>}
                  {tutorial.status === 'published' && <button onClick={() => handleArchive(tutorial.id)} className="flex-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded text-xs font-medium">Archive</button>}
                  <button onClick={() => handleDelete(tutorial.id)} className="px-3 py-1.5 bg-red-50 text-red-700 rounded text-xs font-medium">Delete</button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between"><span className="text-gray-600">Published</span><span className="font-semibold text-green-600">{stats.published}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Draft</span><span className="font-semibold">{stats.draft}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Scheduled</span><span className="font-semibold text-blue-600">{stats.scheduled}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Total Enrollments</span><span className="font-semibold">{stats.totalEnrollments.toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6">
              <h2 className="text-xl font-semibold mb-4">New Tutorial</h2>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">Title</label><input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows={3} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Level</label><select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value as TutorialLevel})} className="w-full px-3 py-2 border rounded-lg"><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option><option value="expert">Expert</option></select></div>
                  <div><label className="block text-sm font-medium mb-1">Format</label><select value={formData.format} onChange={e => setFormData({...formData, format: e.target.value as TutorialFormat})} className="w-full px-3 py-2 border rounded-lg"><option value="video">Video</option><option value="text">Text</option><option value="interactive">Interactive</option><option value="mixed">Mixed</option></select></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Duration (min)</label><input type="number" value={formData.duration_minutes} onChange={e => setFormData({...formData, duration_minutes: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 border rounded-lg" /></div>
                  <div><label className="block text-sm font-medium mb-1">Lessons</label><input type="number" value={formData.lessons_count} onChange={e => setFormData({...formData, lessons_count: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 border rounded-lg" /></div>
                </div>
                <div><label className="block text-sm font-medium mb-1">Tags (comma-separated)</label><input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Prerequisites (comma-separated)</label><input type="text" value={formData.prerequisites} onChange={e => setFormData({...formData, prerequisites: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
              </div>
              <div className="flex gap-3 mt-6"><button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button><button onClick={handleCreate} className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg">Create</button></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
