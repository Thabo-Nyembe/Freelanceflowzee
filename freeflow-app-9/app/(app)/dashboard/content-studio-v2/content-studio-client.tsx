'use client'
import { useState, useMemo } from 'react'
import { useContentStudio, type ContentStudio, type ProjectType, type ProjectStatus } from '@/lib/hooks/use-content-studio'
import {
  Palette, Image, Video, FileText, Layout, Layers, Wand2, Sparkles,
  Plus, Search, Filter, Grid3X3, List, MoreVertical, Download,
  Share2, Copy, Trash2, Edit2, Eye, Clock, Users, Star, Heart,
  Folder, Tag, Settings, Zap, Play, Pause, Upload, Maximize2,
  Type, Square, Circle, Triangle, PenTool, Eraser, Move, ZoomIn,
  ZoomOut, Undo, Redo, AlignLeft, AlignCenter, AlignRight, Bold,
  Italic, Underline, Link, ImagePlus, Music, Film, Globe, Smartphone,
  Monitor, Printer, Instagram, Twitter, Facebook, Youtube, Linkedin,
  ChevronRight, ArrowUpRight, CheckCircle2, BarChart3
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

type ViewMode = 'projects' | 'templates' | 'brand' | 'assets' | 'ai'

interface Template {
  id: string
  name: string
  category: string
  thumbnail: string
  dimensions: string
  popular: boolean
  premium: boolean
}

interface BrandAsset {
  id: string
  name: string
  type: 'logo' | 'color' | 'font' | 'image'
  value: string
  preview?: string
}

interface AssetFile {
  id: string
  name: string
  type: 'image' | 'video' | 'audio' | 'document'
  size: string
  uploadedAt: string
  tags: string[]
}

const templateCategories = [
  { id: 'social', name: 'Social Media', icon: Instagram, count: 245 },
  { id: 'presentation', name: 'Presentations', icon: Monitor, count: 89 },
  { id: 'marketing', name: 'Marketing', icon: BarChart3, count: 156 },
  { id: 'video', name: 'Video', icon: Film, count: 78 },
  { id: 'print', name: 'Print', icon: Printer, count: 112 },
  { id: 'documents', name: 'Documents', icon: FileText, count: 67 }
]

const socialSizes = [
  { name: 'Instagram Post', size: '1080 x 1080', icon: Instagram },
  { name: 'Instagram Story', size: '1080 x 1920', icon: Instagram },
  { name: 'Facebook Post', size: '1200 x 630', icon: Facebook },
  { name: 'Twitter Post', size: '1600 x 900', icon: Twitter },
  { name: 'LinkedIn Post', size: '1200 x 627', icon: Linkedin },
  { name: 'YouTube Thumbnail', size: '1280 x 720', icon: Youtube }
]

export default function ContentStudioClient({ initialProjects }: { initialProjects: ContentStudio[] }) {
  const [projectTypeFilter, setProjectTypeFilter] = useState<ProjectType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('projects')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState<ContentStudio | null>(null)
  const [showNewProject, setShowNewProject] = useState(false)
  const [gridView, setGridView] = useState(true)
  const { projects, loading, error } = useContentStudio({ projectType: projectTypeFilter, status: statusFilter })
  const displayProjects = projects.length > 0 ? projects : initialProjects

  // Mock templates
  const templates: Template[] = [
    { id: '1', name: 'Modern Instagram Post', category: 'social', thumbnail: '📸', dimensions: '1080 x 1080', popular: true, premium: false },
    { id: '2', name: 'Business Presentation', category: 'presentation', thumbnail: '📊', dimensions: '1920 x 1080', popular: true, premium: false },
    { id: '3', name: 'Product Launch Video', category: 'video', thumbnail: '🎬', dimensions: '1920 x 1080', popular: false, premium: true },
    { id: '4', name: 'Email Newsletter', category: 'marketing', thumbnail: '📧', dimensions: '600 x 800', popular: true, premium: false },
    { id: '5', name: 'Business Card', category: 'print', thumbnail: '💼', dimensions: '3.5 x 2 in', popular: false, premium: false },
    { id: '6', name: 'YouTube Thumbnail', category: 'social', thumbnail: '▶️', dimensions: '1280 x 720', popular: true, premium: false },
    { id: '7', name: 'Story Highlight Cover', category: 'social', thumbnail: '⭐', dimensions: '1080 x 1920', popular: false, premium: false },
    { id: '8', name: 'Infographic', category: 'marketing', thumbnail: '📈', dimensions: '800 x 2000', popular: true, premium: true }
  ]

  // Mock brand assets
  const brandAssets: BrandAsset[] = [
    { id: '1', name: 'Primary Logo', type: 'logo', value: '/logo.svg', preview: '🏢' },
    { id: '2', name: 'Secondary Logo', type: 'logo', value: '/logo-white.svg', preview: '🏛️' },
    { id: '3', name: 'Primary Color', type: 'color', value: '#6366F1' },
    { id: '4', name: 'Secondary Color', type: 'color', value: '#EC4899' },
    { id: '5', name: 'Accent Color', type: 'color', value: '#10B981' },
    { id: '6', name: 'Heading Font', type: 'font', value: 'Inter Bold' },
    { id: '7', name: 'Body Font', type: 'font', value: 'Inter Regular' }
  ]

  // Mock asset library
  const assetLibrary: AssetFile[] = [
    { id: '1', name: 'hero-image.jpg', type: 'image', size: '2.4 MB', uploadedAt: '2024-01-15', tags: ['hero', 'marketing'] },
    { id: '2', name: 'product-video.mp4', type: 'video', size: '45.2 MB', uploadedAt: '2024-01-14', tags: ['product', 'video'] },
    { id: '3', name: 'brand-music.mp3', type: 'audio', size: '3.1 MB', uploadedAt: '2024-01-12', tags: ['music', 'brand'] },
    { id: '4', name: 'team-photo.png', type: 'image', size: '1.8 MB', uploadedAt: '2024-01-10', tags: ['team', 'about'] }
  ]

  const stats = useMemo(() => ({
    total: displayProjects.length,
    inProgress: displayProjects.filter(p => p.status === 'in_progress').length,
    published: displayProjects.filter(p => p.status === 'published').length,
    avgCompletion: displayProjects.length > 0
      ? (displayProjects.reduce((sum, p) => sum + p.completion_percentage, 0) / displayProjects.length)
      : 0,
    designs: displayProjects.filter(p => p.project_type === 'design').length,
    videos: displayProjects.filter(p => p.project_type === 'video').length
  }), [displayProjects])

  const filteredProjects = useMemo(() => {
    let filtered = displayProjects
    if (projectTypeFilter !== 'all') {
      filtered = filtered.filter(p => p.project_type === projectTypeFilter)
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter)
    }
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.project_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return filtered
  }, [displayProjects, projectTypeFilter, statusFilter, searchQuery])

  const getProjectIcon = (type: string) => {
    switch (type) {
      case 'design': return <Palette className="h-5 w-5" />
      case 'video': return <Video className="h-5 w-5" />
      case 'presentation': return <Layout className="h-5 w-5" />
      case 'document': return <FileText className="h-5 w-5" />
      default: return <Image className="h-5 w-5" />
    }
  }

  if (error) return <div className="p-8"><div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Palette className="h-8 w-8" />
                <h1 className="text-3xl font-bold">Content Studio</h1>
              </div>
              <p className="text-purple-100">Design stunning visuals with AI-powered tools</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <Wand2 className="h-4 w-4" />
                <span className="text-sm">Magic Studio</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm">AI Generate</span>
              </div>
              <button
                onClick={() => setShowNewProject(true)}
                className="flex items-center gap-2 bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Design
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Folder className="h-4 w-4 text-purple-200" />
                <span className="text-purple-200 text-sm">Projects</span>
              </div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Edit2 className="h-4 w-4 text-purple-200" />
                <span className="text-purple-200 text-sm">In Progress</span>
              </div>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-purple-200" />
                <span className="text-purple-200 text-sm">Published</span>
              </div>
              <div className="text-2xl font-bold">{stats.published}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Palette className="h-4 w-4 text-purple-200" />
                <span className="text-purple-200 text-sm">Designs</span>
              </div>
              <div className="text-2xl font-bold">{stats.designs}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Video className="h-4 w-4 text-purple-200" />
                <span className="text-purple-200 text-sm">Videos</span>
              </div>
              <div className="text-2xl font-bold">{stats.videos}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="h-4 w-4 text-purple-200" />
                <span className="text-purple-200 text-sm">Avg Progress</span>
              </div>
              <div className="text-2xl font-bold">{stats.avgCompletion.toFixed(0)}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* View Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
            {([
              { key: 'projects', label: 'Projects', icon: Folder },
              { key: 'templates', label: 'Templates', icon: Layout },
              { key: 'brand', label: 'Brand Kit', icon: Star },
              { key: 'assets', label: 'Assets', icon: Image },
              { key: 'ai', label: 'AI Tools', icon: Sparkles }
            ] as { key: ViewMode, label: string, icon: any }[]).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setViewMode(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === key
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-64"
              />
            </div>
            <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg p-1 border dark:border-gray-700">
              <button
                onClick={() => setGridView(true)}
                className={`p-2 rounded ${gridView ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' : 'text-gray-400'}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setGridView(false)}
                className={`p-2 rounded ${!gridView ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' : 'text-gray-400'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          </div>
        )}

        {/* Projects View */}
        {viewMode === 'projects' && !loading && (
          <>
            <div className="flex items-center gap-4 mb-6">
              <select
                value={projectTypeFilter}
                onChange={(e) => setProjectTypeFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="design">Design</option>
                <option value="presentation">Presentation</option>
                <option value="video">Video</option>
                <option value="document">Document</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="published">Published</option>
              </select>
            </div>

            {filteredProjects.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
                <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No projects found</p>
                <button
                  onClick={() => setShowNewProject(true)}
                  className="mt-4 inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium hover:underline"
                >
                  <Plus className="h-4 w-4" />
                  Create your first design
                </button>
              </div>
            ) : gridView ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProjects.map(project => (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center relative">
                      <div className="text-6xl">{project.project_type === 'video' ? '🎬' : project.project_type === 'presentation' ? '📊' : '🎨'}</div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                          <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          project.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          project.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {project.status}
                        </span>
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-xs">
                          {project.project_type}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{project.project_name}</h3>
                      <div className="flex items-center justify-between mt-3 text-sm text-gray-500 dark:text-gray-500">
                        <span>v{project.version}</span>
                        <div className="flex items-center gap-1">
                          {project.is_collaborative && (
                            <Users className="h-4 w-4" />
                          )}
                          {project.auto_save_enabled && (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{project.completion_percentage}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                          <div
                            className="h-full bg-purple-600 rounded-full"
                            style={{ width: `${project.completion_percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProjects.map(project => (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700 hover:shadow-md transition-all cursor-pointer flex items-center gap-4"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg flex items-center justify-center">
                      {getProjectIcon(project.project_type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{project.project_name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          project.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          project.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {project.status}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-500">v{project.version}</span>
                      </div>
                    </div>
                    <div className="w-32">
                      <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">{project.completion_percentage}%</div>
                      <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                        <div className="h-full bg-purple-600 rounded-full" style={{ width: `${project.completion_percentage}%` }}></div>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Templates View */}
        {viewMode === 'templates' && !loading && (
          <div className="space-y-8">
            {/* Template Categories */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {templateCategories.map(cat => (
                <button key={cat.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700 hover:shadow-md transition-all text-left group">
                  <cat.icon className="h-6 w-6 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-medium text-gray-900 dark:text-white">{cat.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-500">{cat.count} templates</p>
                </button>
              ))}
            </div>

            {/* Quick Start */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Start - Social Media Sizes</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {socialSizes.map(size => (
                  <button key={size.name} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 transition-all text-center group">
                    <size.icon className="h-8 w-8 mx-auto mb-2 text-gray-400 group-hover:text-purple-600 transition-colors" />
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">{size.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{size.size}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Templates */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Popular Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {templates.map(template => (
                  <div key={template.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
                    <div className="h-40 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center relative">
                      <span className="text-5xl">{template.thumbnail}</span>
                      {template.premium && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-400 text-yellow-900 rounded text-xs font-medium flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          PRO
                        </div>
                      )}
                      {template.popular && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-purple-600 text-white rounded text-xs">
                          Popular
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-500">{template.dimensions}</p>
                      <button className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 border border-purple-600 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 opacity-0 group-hover:opacity-100 transition-all">
                        Use Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Brand Kit View */}
        {viewMode === 'brand' && !loading && (
          <div className="space-y-8">
            {/* Brand Colors */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Brand Colors</h3>
                <button className="text-purple-600 dark:text-purple-400 text-sm font-medium hover:underline">+ Add Color</button>
              </div>
              <div className="flex items-center gap-4">
                {brandAssets.filter(a => a.type === 'color').map(asset => (
                  <div key={asset.id} className="text-center">
                    <div
                      className="w-16 h-16 rounded-xl shadow-lg cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: asset.value }}
                    ></div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{asset.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{asset.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Logos */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Logos</h3>
                <button className="text-purple-600 dark:text-purple-400 text-sm font-medium hover:underline">+ Upload Logo</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {brandAssets.filter(a => a.type === 'logo').map(asset => (
                  <div key={asset.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 flex items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <span className="text-4xl">{asset.preview}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fonts */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Typography</h3>
                <button className="text-purple-600 dark:text-purple-400 text-sm font-medium hover:underline">+ Add Font</button>
              </div>
              <div className="space-y-4">
                {brandAssets.filter(a => a.type === 'font').map(asset => (
                  <div key={asset.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-500">{asset.name}</p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">{asset.value}</p>
                    </div>
                    <button className="px-3 py-1 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg">
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Assets View */}
        {viewMode === 'assets' && !loading && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-gray-600 dark:text-gray-400">Manage your media assets</p>
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Upload className="h-4 w-4" />
                Upload Assets
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {assetLibrary.map(asset => (
                <div key={asset.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden hover:shadow-md transition-all cursor-pointer group">
                  <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                    {asset.type === 'image' ? <Image className="h-8 w-8 text-gray-400" /> :
                     asset.type === 'video' ? <Film className="h-8 w-8 text-gray-400" /> :
                     asset.type === 'audio' ? <Music className="h-8 w-8 text-gray-400" /> :
                     <FileText className="h-8 w-8 text-gray-400" />}
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">{asset.name}</h4>
                    <div className="flex items-center justify-between mt-2 text-sm text-gray-500 dark:text-gray-500">
                      <span>{asset.size}</span>
                      <span>{asset.uploadedAt}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {asset.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Tools View */}
        {viewMode === 'ai' && !loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'Magic Resize', description: 'Instantly resize designs for any platform', icon: Maximize2, color: 'purple' },
                { name: 'Background Remover', description: 'Remove backgrounds with one click', icon: Eraser, color: 'pink' },
                { name: 'Text to Image', description: 'Generate images from descriptions', icon: Sparkles, color: 'indigo' },
                { name: 'Magic Write', description: 'AI-powered copywriting assistant', icon: Type, color: 'blue' },
                { name: 'Brand Voice', description: 'Keep consistent brand messaging', icon: Star, color: 'yellow' },
                { name: 'Auto Layout', description: 'Smart layout suggestions', icon: Layout, color: 'green' }
              ].map(tool => (
                <div key={tool.name} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer group">
                  <div className={`w-12 h-12 rounded-xl bg-${tool.color}-100 dark:bg-${tool.color}-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <tool.icon className={`h-6 w-6 text-${tool.color}-600 dark:text-${tool.color}-400`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{tool.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{tool.description}</p>
                  <button className="mt-4 flex items-center gap-2 text-purple-600 dark:text-purple-400 text-sm font-medium">
                    Try it <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* New Project Modal */}
      <Dialog open={showNewProject} onOpenChange={setShowNewProject}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Plus className="h-6 w-6 text-purple-600" />
              Create New Design
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Choose a size</h4>
              <div className="grid grid-cols-3 gap-3">
                {socialSizes.slice(0, 6).map(size => (
                  <button key={size.name} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-400 transition-colors text-left">
                    <size.icon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{size.name}</p>
                      <p className="text-xs text-gray-500">{size.size}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">Or custom size</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Width</label>
                <input type="number" placeholder="1920" className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Height</label>
                <input type="number" placeholder="1080" className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label>
                <select className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                  <option>px</option>
                  <option>in</option>
                  <option>cm</option>
                  <option>mm</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowNewProject(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Create Design
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Project Detail Modal */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {getProjectIcon(selectedProject?.project_type || 'design')}
              {selectedProject?.project_name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="h-64 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl flex items-center justify-center">
              <span className="text-6xl">🎨</span>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                <Edit2 className="h-4 w-4" />
                Open Editor
              </button>
              <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <Download className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <Share2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <Copy className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
