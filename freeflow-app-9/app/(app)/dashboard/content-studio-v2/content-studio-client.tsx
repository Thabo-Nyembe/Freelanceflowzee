'use client'
import { useState } from 'react'
import { useContentStudio, type ContentStudio, type ProjectType, type ProjectStatus } from '@/lib/hooks/use-content-studio'

export default function ContentStudioClient({ initialProjects }: { initialProjects: ContentStudio[] }) {
  const [projectTypeFilter, setProjectTypeFilter] = useState<ProjectType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const { projects, loading, error } = useContentStudio({ projectType: projectTypeFilter, status: statusFilter })
  const displayProjects = projects.length > 0 ? projects : initialProjects

  const stats = {
    total: displayProjects.length,
    inProgress: displayProjects.filter(p => p.status === 'in_progress').length,
    published: displayProjects.filter(p => p.status === 'published').length,
    avgCompletion: displayProjects.length > 0 ? (displayProjects.reduce((sum, p) => sum + p.completion_percentage, 0) / displayProjects.length).toFixed(1) : '0'
  }

  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Content Studio</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Total Projects</div><div className="text-3xl font-bold text-purple-600">{stats.total}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">In Progress</div><div className="text-3xl font-bold text-blue-600">{stats.inProgress}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Published</div><div className="text-3xl font-bold text-green-600">{stats.published}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Avg Completion</div><div className="text-3xl font-bold text-pink-600">{stats.avgCompletion}%</div></div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
          <div className="flex gap-4">
            <select value={projectTypeFilter} onChange={(e) => setProjectTypeFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Types</option><option value="document">Document</option><option value="presentation">Presentation</option><option value="video">Video</option><option value="design">Design</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Status</option><option value="draft">Draft</option><option value="in_progress">In Progress</option><option value="review">Review</option><option value="published">Published</option>
            </select>
          </div>
        </div>

        {loading && <div className="text-center py-8"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div></div>}

        <div className="space-y-4">{displayProjects.filter(p => (projectTypeFilter === 'all' || p.project_type === projectTypeFilter) && (statusFilter === 'all' || p.status === statusFilter)).map(project => (
          <div key={project.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs ${project.status === 'published' ? 'bg-green-100 text-green-700' : project.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{project.status}</span>
                  <span className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700">{project.project_type}</span>
                  {project.is_collaborative && <span className="px-3 py-1 rounded-full text-xs bg-pink-100 text-pink-700">Collaborative</span>}
                  {project.auto_save_enabled && <span className="px-3 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700">Auto-save</span>}
                </div>
                <h3 className="text-lg font-semibold">{project.project_name}</h3>
                {project.description && <p className="text-sm text-gray-600 mt-1">{project.description}</p>}
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                  <span>📊 {project.completion_percentage}% complete</span>
                  <span>🎬 v{project.version}</span>
                  {project.collaborators && project.collaborators.length > 0 && <span>👥 {project.collaborators.length} collaborators</span>}
                  {project.duration_seconds && <span>⏱️ {Math.ceil(project.duration_seconds / 60)}min</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">{project.completion_percentage}%</div>
                <div className="text-xs text-gray-500">completion</div>
                {project.last_auto_saved_at && <div className="text-xs text-gray-600 mt-1">💾 auto-saved</div>}
              </div>
            </div>
          </div>
        ))}</div>
      </div>
    </div>
  )
}
