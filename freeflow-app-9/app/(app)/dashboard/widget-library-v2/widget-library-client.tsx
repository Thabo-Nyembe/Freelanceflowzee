'use client'

import { useState, useMemo } from 'react'
import {
  Package,
  Plus,
  Search,
  Settings,
  BarChart3,
  Download,
  Star,
  Users,
  Code,
  X,
  Loader2,
  Trash2,
  ExternalLink,
  Eye,
  Edit,
  Copy,
  Heart,
  Bookmark,
  BookmarkCheck,
  Grid3X3,
  List,
  Filter,
  TrendingUp,
  Clock,
  Tag,
  Layers,
  Puzzle,
  Palette,
  Zap,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Github,
  FileCode,
  Play,
  MoreHorizontal,
  Share2,
  Flag,
  Award,
  Sparkles,
  Box,
  Component,
  Layout,
  Type,
  ToggleLeft,
  Table2,
  PieChart,
  LineChart,
  Image,
  MessageSquare,
  Calendar,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

// Types
type WidgetStatus = 'stable' | 'beta' | 'deprecated' | 'experimental' | 'archived'
type WidgetCategory = 'display' | 'input' | 'layout' | 'data-viz' | 'navigation' | 'feedback' | 'utility' | 'media'
type LicenseType = 'mit' | 'apache-2.0' | 'gpl-3.0' | 'bsd-3' | 'proprietary'

interface Widget {
  id: string
  name: string
  description: string
  category: WidgetCategory
  status: WidgetStatus
  version: string
  author: {
    name: string
    avatar: string
    verified: boolean
  }
  installs: number
  downloads: number
  stars: number
  rating: number
  reviews_count: number
  size_kb: number
  dependencies: string[]
  tags: string[]
  preview_url: string | null
  demo_url: string | null
  docs_url: string | null
  github_url: string | null
  license: LicenseType
  last_updated: string
  created_at: string
  is_featured: boolean
  is_official: boolean
  is_bookmarked: boolean
  compatibility: {
    react: string
    next: string
    tailwind: string
  }
  code_snippet: string
}

interface Collection {
  id: string
  name: string
  description: string
  widget_count: number
  author: string
  is_official: boolean
  cover_image: string | null
}

interface Contributor {
  id: string
  name: string
  avatar: string
  widgets_count: number
  total_installs: number
  verified: boolean
}

// Mock data
const mockWidgets: Widget[] = [
  {
    id: '1',
    name: 'DataTable Pro',
    description: 'Advanced data table with sorting, filtering, pagination, and virtual scrolling. Supports large datasets.',
    category: 'data-viz',
    status: 'stable',
    version: '3.2.1',
    author: { name: 'FreeFlow Team', avatar: '', verified: true },
    installs: 45280,
    downloads: 128500,
    stars: 2340,
    rating: 4.8,
    reviews_count: 456,
    size_kb: 48,
    dependencies: ['@tanstack/react-table', 'react-virtual'],
    tags: ['table', 'data', 'grid', 'sorting', 'filtering'],
    preview_url: null,
    demo_url: 'https://demo.example.com/datatable',
    docs_url: 'https://docs.example.com/datatable',
    github_url: 'https://github.com/freeflow/datatable-pro',
    license: 'mit',
    last_updated: '2024-01-10',
    created_at: '2023-06-15',
    is_featured: true,
    is_official: true,
    is_bookmarked: true,
    compatibility: { react: '>=18.0.0', next: '>=14.0.0', tailwind: '>=3.0.0' },
    code_snippet: '<DataTable columns={columns} data={data} pagination />'
  },
  {
    id: '2',
    name: 'Chart Studio',
    description: 'Beautiful, responsive charts powered by Recharts. Line, bar, pie, area, and more chart types.',
    category: 'data-viz',
    status: 'stable',
    version: '2.8.0',
    author: { name: 'ChartWorks', avatar: '', verified: true },
    installs: 38900,
    downloads: 95200,
    stars: 1890,
    rating: 4.7,
    reviews_count: 312,
    size_kb: 156,
    dependencies: ['recharts', 'd3'],
    tags: ['charts', 'visualization', 'analytics', 'graphs'],
    preview_url: null,
    demo_url: 'https://demo.example.com/charts',
    docs_url: null,
    github_url: 'https://github.com/chartworks/chart-studio',
    license: 'apache-2.0',
    last_updated: '2024-01-08',
    created_at: '2023-03-20',
    is_featured: true,
    is_official: false,
    is_bookmarked: false,
    compatibility: { react: '>=17.0.0', next: '>=13.0.0', tailwind: '>=3.0.0' },
    code_snippet: '<ChartStudio type="line" data={data} xKey="date" yKey="value" />'
  },
  {
    id: '3',
    name: 'Smart Form Builder',
    description: 'Dynamic form builder with validation, conditional logic, and multi-step support. React Hook Form integration.',
    category: 'input',
    status: 'stable',
    version: '4.1.2',
    author: { name: 'FormCraft', avatar: '', verified: true },
    installs: 32450,
    downloads: 78300,
    stars: 1560,
    rating: 4.9,
    reviews_count: 287,
    size_kb: 32,
    dependencies: ['react-hook-form', 'zod'],
    tags: ['form', 'input', 'validation', 'builder'],
    preview_url: null,
    demo_url: 'https://demo.example.com/formbuilder',
    docs_url: 'https://docs.example.com/formbuilder',
    github_url: null,
    license: 'mit',
    last_updated: '2024-01-12',
    created_at: '2023-01-10',
    is_featured: false,
    is_official: false,
    is_bookmarked: true,
    compatibility: { react: '>=18.0.0', next: '>=14.0.0', tailwind: '>=3.0.0' },
    code_snippet: '<FormBuilder schema={formSchema} onSubmit={handleSubmit} />'
  },
  {
    id: '4',
    name: 'Kanban Board',
    description: 'Drag and drop kanban board with swimlanes, WIP limits, and real-time collaboration features.',
    category: 'layout',
    status: 'beta',
    version: '1.5.0-beta.3',
    author: { name: 'FreeFlow Team', avatar: '', verified: true },
    installs: 18750,
    downloads: 42100,
    stars: 890,
    rating: 4.5,
    reviews_count: 134,
    size_kb: 64,
    dependencies: ['@dnd-kit/core', '@dnd-kit/sortable'],
    tags: ['kanban', 'drag-drop', 'board', 'project-management'],
    preview_url: null,
    demo_url: 'https://demo.example.com/kanban',
    docs_url: null,
    github_url: 'https://github.com/freeflow/kanban-board',
    license: 'mit',
    last_updated: '2024-01-14',
    created_at: '2023-09-05',
    is_featured: false,
    is_official: true,
    is_bookmarked: false,
    compatibility: { react: '>=18.0.0', next: '>=14.0.0', tailwind: '>=3.0.0' },
    code_snippet: '<KanbanBoard columns={columns} cards={cards} onCardMove={handleMove} />'
  },
  {
    id: '5',
    name: 'Rich Text Editor',
    description: 'Full-featured WYSIWYG editor with markdown support, mentions, embeds, and collaborative editing.',
    category: 'input',
    status: 'stable',
    version: '2.3.4',
    author: { name: 'EditorLabs', avatar: '', verified: false },
    installs: 28900,
    downloads: 67800,
    stars: 1234,
    rating: 4.6,
    reviews_count: 198,
    size_kb: 245,
    dependencies: ['@tiptap/react', '@tiptap/pm', 'prosemirror-*'],
    tags: ['editor', 'rich-text', 'wysiwyg', 'markdown'],
    preview_url: null,
    demo_url: 'https://demo.example.com/editor',
    docs_url: 'https://docs.example.com/editor',
    github_url: 'https://github.com/editorlabs/rich-text',
    license: 'gpl-3.0',
    last_updated: '2024-01-05',
    created_at: '2023-02-28',
    is_featured: true,
    is_official: false,
    is_bookmarked: false,
    compatibility: { react: '>=17.0.0', next: '>=13.0.0', tailwind: '>=3.0.0' },
    code_snippet: '<RichTextEditor content={content} onChange={setContent} />'
  },
  {
    id: '6',
    name: 'Modal Manager',
    description: 'Accessible modal system with stacking, focus trap, and animations. Built on Radix UI primitives.',
    category: 'feedback',
    status: 'stable',
    version: '1.8.2',
    author: { name: 'FreeFlow Team', avatar: '', verified: true },
    installs: 52100,
    downloads: 156400,
    stars: 2890,
    rating: 4.9,
    reviews_count: 567,
    size_kb: 12,
    dependencies: ['@radix-ui/react-dialog'],
    tags: ['modal', 'dialog', 'popup', 'overlay'],
    preview_url: null,
    demo_url: null,
    docs_url: 'https://docs.example.com/modal',
    github_url: 'https://github.com/freeflow/modal-manager',
    license: 'mit',
    last_updated: '2024-01-02',
    created_at: '2022-11-15',
    is_featured: false,
    is_official: true,
    is_bookmarked: true,
    compatibility: { react: '>=18.0.0', next: '>=14.0.0', tailwind: '>=3.0.0' },
    code_snippet: '<Modal open={open} onClose={onClose}><ModalContent /></Modal>'
  },
  {
    id: '7',
    name: 'Notification Center',
    description: 'Toast notifications with queue management, persistence, and action buttons. Customizable themes.',
    category: 'feedback',
    status: 'stable',
    version: '2.1.0',
    author: { name: 'NotifyPro', avatar: '', verified: true },
    installs: 41200,
    downloads: 98700,
    stars: 1670,
    rating: 4.7,
    reviews_count: 289,
    size_kb: 18,
    dependencies: ['sonner'],
    tags: ['toast', 'notification', 'alert', 'snackbar'],
    preview_url: null,
    demo_url: 'https://demo.example.com/notifications',
    docs_url: null,
    github_url: null,
    license: 'mit',
    last_updated: '2024-01-11',
    created_at: '2023-04-12',
    is_featured: false,
    is_official: false,
    is_bookmarked: false,
    compatibility: { react: '>=18.0.0', next: '>=14.0.0', tailwind: '>=3.0.0' },
    code_snippet: 'notify.success("Action completed successfully!")'
  },
  {
    id: '8',
    name: 'File Uploader',
    description: 'Drag and drop file uploader with progress tracking, chunked uploads, and image preview.',
    category: 'input',
    status: 'experimental',
    version: '0.9.5',
    author: { name: 'UploadKit', avatar: '', verified: false },
    installs: 8900,
    downloads: 21400,
    stars: 456,
    rating: 4.2,
    reviews_count: 67,
    size_kb: 28,
    dependencies: ['react-dropzone', 'uppy'],
    tags: ['upload', 'file', 'dropzone', 'image'],
    preview_url: null,
    demo_url: 'https://demo.example.com/uploader',
    docs_url: null,
    github_url: 'https://github.com/uploadkit/file-uploader',
    license: 'apache-2.0',
    last_updated: '2024-01-13',
    created_at: '2023-10-20',
    is_featured: false,
    is_official: false,
    is_bookmarked: false,
    compatibility: { react: '>=18.0.0', next: '>=14.0.0', tailwind: '>=3.0.0' },
    code_snippet: '<FileUploader onUpload={handleUpload} maxFiles={5} accept="image/*" />'
  }
]

const mockCollections: Collection[] = [
  { id: '1', name: 'Essential UI Kit', description: 'Core components every app needs', widget_count: 24, author: 'FreeFlow Team', is_official: true, cover_image: null },
  { id: '2', name: 'Data Visualization', description: 'Charts, graphs, and analytics components', widget_count: 18, author: 'ChartWorks', is_official: false, cover_image: null },
  { id: '3', name: 'Form Components', description: 'Input fields, selects, and form builders', widget_count: 32, author: 'FormCraft', is_official: false, cover_image: null },
  { id: '4', name: 'Admin Dashboard', description: 'Complete admin panel components', widget_count: 45, author: 'FreeFlow Team', is_official: true, cover_image: null }
]

const mockContributors: Contributor[] = [
  { id: '1', name: 'FreeFlow Team', avatar: '', widgets_count: 28, total_installs: 245000, verified: true },
  { id: '2', name: 'ChartWorks', avatar: '', widgets_count: 12, total_installs: 156000, verified: true },
  { id: '3', name: 'FormCraft', avatar: '', widgets_count: 8, total_installs: 89000, verified: true },
  { id: '4', name: 'EditorLabs', avatar: '', widgets_count: 5, total_installs: 67800, verified: false },
  { id: '5', name: 'NotifyPro', avatar: '', widgets_count: 4, total_installs: 54300, verified: true }
]

export default function WidgetLibraryClient() {
  const [activeTab, setActiveTab] = useState('browse')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<WidgetCategory | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<WidgetStatus | 'all'>('all')
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'rating' | 'name'>('popular')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null)
  const [showCodeModal, setShowCodeModal] = useState(false)
  const [codeWidget, setCodeWidget] = useState<Widget | null>(null)

  // Stats calculation
  const stats = useMemo(() => {
    const totalWidgets = mockWidgets.length
    const totalInstalls = mockWidgets.reduce((sum, w) => sum + w.installs, 0)
    const totalDownloads = mockWidgets.reduce((sum, w) => sum + w.downloads, 0)
    const avgRating = mockWidgets.reduce((sum, w) => sum + w.rating, 0) / mockWidgets.length
    const officialCount = mockWidgets.filter(w => w.is_official).length
    const featuredCount = mockWidgets.filter(w => w.is_featured).length

    return { totalWidgets, totalInstalls, totalDownloads, avgRating, officialCount, featuredCount }
  }, [])

  // Filtered widgets
  const filteredWidgets = useMemo(() => {
    let result = mockWidgets.filter(widget => {
      const matchesSearch = widget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        widget.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        widget.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = categoryFilter === 'all' || widget.category === categoryFilter
      const matchesStatus = statusFilter === 'all' || widget.status === statusFilter
      return matchesSearch && matchesCategory && matchesStatus
    })

    // Sort
    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => b.installs - a.installs)
        break
      case 'recent':
        result.sort((a, b) => new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime())
        break
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    return result
  }, [searchQuery, categoryFilter, statusFilter, sortBy])

  // Helper functions
  const getStatusBadge = (status: WidgetStatus) => {
    switch (status) {
      case 'stable': return { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Stable', icon: CheckCircle2 }
      case 'beta': return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'Beta', icon: Zap }
      case 'experimental': return { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', label: 'Experimental', icon: Sparkles }
      case 'deprecated': return { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Deprecated', icon: AlertTriangle }
      case 'archived': return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: 'Archived', icon: Box }
      default: return { color: 'bg-gray-100 text-gray-800', label: status, icon: Package }
    }
  }

  const getCategoryIcon = (category: WidgetCategory) => {
    switch (category) {
      case 'display': return Type
      case 'input': return ToggleLeft
      case 'layout': return Layout
      case 'data-viz': return PieChart
      case 'navigation': return Layers
      case 'feedback': return MessageSquare
      case 'utility': return Puzzle
      case 'media': return Image
      default: return Component
    }
  }

  const getCategoryColor = (category: WidgetCategory) => {
    switch (category) {
      case 'display': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400'
      case 'input': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
      case 'layout': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400'
      case 'data-viz': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400'
      case 'navigation': return 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400'
      case 'feedback': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'utility': return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400'
      case 'media': return 'text-pink-600 bg-pink-100 dark:bg-pink-900/30 dark:text-pink-400'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const handleViewCode = (widget: Widget) => {
    setCodeWidget(widget)
    setShowCodeModal(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50/30 to-orange-50/40 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-lg">
              <Component className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Widget Library</h1>
              <p className="text-gray-600 dark:text-gray-400">Figma-level component marketplace</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Bookmark className="w-4 h-4" />
              Saved
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="w-4 h-4" />
              Publish Widget
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalWidgets}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Widgets</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{(stats.totalInstalls / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Installs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{(stats.totalDownloads / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Downloads</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgRating.toFixed(1)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Avg Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.officialCount}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Official</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                  <Award className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.featuredCount}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Featured</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 shadow-sm">
            <TabsTrigger value="browse" className="gap-2">
              <Package className="w-4 h-4" />
              Browse
            </TabsTrigger>
            <TabsTrigger value="featured" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Featured
            </TabsTrigger>
            <TabsTrigger value="collections" className="gap-2">
              <Layers className="w-4 h-4" />
              Collections
            </TabsTrigger>
            <TabsTrigger value="contributors" className="gap-2">
              <Users className="w-4 h-4" />
              Contributors
            </TabsTrigger>
            <TabsTrigger value="saved" className="gap-2">
              <Bookmark className="w-4 h-4" />
              Saved
            </TabsTrigger>
          </TabsList>

          {/* Browse Tab */}
          <TabsContent value="browse" className="space-y-6">
            {/* Filters */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search widgets, tags, or authors..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value as WidgetCategory | 'all')}
                      className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm"
                    >
                      <option value="all">All Categories</option>
                      <option value="display">Display</option>
                      <option value="input">Input</option>
                      <option value="layout">Layout</option>
                      <option value="data-viz">Data Viz</option>
                      <option value="navigation">Navigation</option>
                      <option value="feedback">Feedback</option>
                      <option value="utility">Utility</option>
                      <option value="media">Media</option>
                    </select>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as WidgetStatus | 'all')}
                      className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="stable">Stable</option>
                      <option value="beta">Beta</option>
                      <option value="experimental">Experimental</option>
                    </select>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm"
                    >
                      <option value="popular">Most Popular</option>
                      <option value="recent">Recently Updated</option>
                      <option value="rating">Highest Rated</option>
                      <option value="name">Alphabetical</option>
                    </select>
                    <div className="flex border rounded-lg overflow-hidden">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="rounded-none"
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="rounded-none"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Widget Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWidgets.map((widget) => {
                  const statusBadge = getStatusBadge(widget.status)
                  const StatusIcon = statusBadge.icon
                  const CategoryIcon = getCategoryIcon(widget.category)
                  return (
                    <Card key={widget.id} className="bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-all group">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(widget.category)}`}>
                              <CategoryIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white">{widget.name}</h3>
                                {widget.is_official && (
                                  <Shield className="w-4 h-4 text-blue-500" title="Official" />
                                )}
                                {widget.is_featured && (
                                  <Sparkles className="w-4 h-4 text-yellow-500" title="Featured" />
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">v{widget.version}</p>
                            </div>
                          </div>
                          <Badge className={statusBadge.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusBadge.label}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                          {widget.description}
                        </p>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {widget.tags.slice(0, 4).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-sm mb-4">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                              <Download className="w-3 h-3" />
                              {widget.installs.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                              <Star className="w-3 h-3 fill-current" />
                              {widget.rating}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">{widget.size_kb}KB</span>
                        </div>

                        <div className="flex items-center gap-2 pt-3 border-t dark:border-gray-700">
                          <Button size="sm" className="flex-1 gap-1">
                            <Download className="w-3 h-3" />
                            Install
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleViewCode(widget)}>
                            <Code className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setSelectedWidget(widget)}>
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            {widget.is_bookmarked ? (
                              <BookmarkCheck className="w-4 h-4 text-purple-600" />
                            ) : (
                              <Bookmark className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredWidgets.map((widget) => {
                  const statusBadge = getStatusBadge(widget.status)
                  const StatusIcon = statusBadge.icon
                  const CategoryIcon = getCategoryIcon(widget.category)
                  return (
                    <Card key={widget.id} className="bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getCategoryColor(widget.category)}`}>
                            <CategoryIcon className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{widget.name}</h3>
                              {widget.is_official && <Shield className="w-4 h-4 text-blue-500" />}
                              {widget.is_featured && <Sparkles className="w-4 h-4 text-yellow-500" />}
                              <Badge className={statusBadge.color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusBadge.label}
                              </Badge>
                              <span className="text-xs text-gray-500">v{widget.version}</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{widget.description}</p>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Download className="w-4 h-4" />
                              {widget.installs.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1 text-yellow-600">
                              <Star className="w-4 h-4 fill-current" />
                              {widget.rating}
                            </span>
                            <span>{widget.size_kb}KB</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" className="gap-1">
                              <Download className="w-3 h-3" />
                              Install
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setSelectedWidget(widget)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* Featured Tab */}
          <TabsContent value="featured" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {mockWidgets.filter(w => w.is_featured).map((widget) => {
                const CategoryIcon = getCategoryIcon(widget.category)
                return (
                  <Card key={widget.id} className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-lg overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
                          <CategoryIcon className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold">{widget.name}</h3>
                            <Badge className="bg-white/20 text-white">Featured</Badge>
                          </div>
                          <p className="text-white/80 text-sm mb-4">{widget.description}</p>
                          <div className="flex items-center gap-4 text-sm text-white/70">
                            <span className="flex items-center gap-1">
                              <Download className="w-4 h-4" />
                              {widget.installs.toLocaleString()} installs
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-current text-yellow-300" />
                              {widget.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" className="bg-white text-purple-600 hover:bg-white/90">
                          <Download className="w-4 h-4 mr-1" />
                          Install
                        </Button>
                        <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={() => setSelectedWidget(widget)}>
                          Learn More
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockCollections.map((collection) => (
                <Card key={collection.id} className="bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-5">
                    <div className="w-full h-24 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg mb-4 flex items-center justify-center">
                      <Layers className="w-10 h-10 text-purple-500" />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{collection.name}</h3>
                      {collection.is_official && (
                        <Shield className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{collection.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{collection.widget_count} widgets</span>
                      <span className="text-gray-400">by {collection.author}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Contributors Tab */}
          <TabsContent value="contributors" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockContributors.map((contributor, index) => (
                <Card key={contributor.id} className="bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="w-14 h-14">
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-lg">
                            {contributor.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {index < 3 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-xs font-bold text-yellow-900">
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{contributor.name}</h3>
                          {contributor.verified && (
                            <CheckCircle2 className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <span>{contributor.widgets_count} widgets</span>
                          <span>{(contributor.total_installs / 1000).toFixed(0)}K installs</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Saved Tab */}
          <TabsContent value="saved" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockWidgets.filter(w => w.is_bookmarked).map((widget) => {
                const CategoryIcon = getCategoryIcon(widget.category)
                return (
                  <Card key={widget.id} className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(widget.category)}`}>
                          <CategoryIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{widget.name}</h3>
                          <p className="text-xs text-gray-500">v{widget.version}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <BookmarkCheck className="w-4 h-4 text-purple-600" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{widget.description}</p>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" className="flex-1">Install</Button>
                        <Button variant="outline" size="sm" onClick={() => setSelectedWidget(widget)}>View</Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Widget Detail Dialog */}
      <Dialog open={!!selectedWidget} onOpenChange={() => setSelectedWidget(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Widget Details</DialogTitle>
          </DialogHeader>
          {selectedWidget && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${getCategoryColor(selectedWidget.category)}`}>
                  {(() => {
                    const Icon = getCategoryIcon(selectedWidget.category)
                    return <Icon className="w-8 h-8" />
                  })()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold">{selectedWidget.name}</h2>
                    {selectedWidget.is_official && <Shield className="w-5 h-5 text-blue-500" />}
                    {selectedWidget.is_featured && <Sparkles className="w-5 h-5 text-yellow-500" />}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{selectedWidget.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant="outline">v{selectedWidget.version}</Badge>
                    <span className="text-sm text-gray-500">by {selectedWidget.author.name}</span>
                    {selectedWidget.author.verified && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-600">{selectedWidget.installs.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Installs</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedWidget.downloads.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Downloads</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-2xl font-bold text-yellow-600">{selectedWidget.rating}</p>
                  <p className="text-xs text-gray-500">{selectedWidget.reviews_count} reviews</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-600">{selectedWidget.size_kb}KB</p>
                  <p className="text-xs text-gray-500">Size</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedWidget.tags.map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Dependencies</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedWidget.dependencies.map((dep) => (
                    <Badge key={dep} className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">{dep}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Compatibility</h3>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-500">React</p>
                    <p className="font-medium">{selectedWidget.compatibility.react}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-500">Next.js</p>
                    <p className="font-medium">{selectedWidget.compatibility.next}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-500">Tailwind</p>
                    <p className="font-medium">{selectedWidget.compatibility.tailwind}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Quick Start</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <code>{selectedWidget.code_snippet}</code>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t">
                <Button className="flex-1 gap-2">
                  <Download className="w-4 h-4" />
                  Install Widget
                </Button>
                {selectedWidget.demo_url && (
                  <Button variant="outline" className="gap-2" onClick={() => window.open(selectedWidget.demo_url!, '_blank')}>
                    <Play className="w-4 h-4" />
                    Live Demo
                  </Button>
                )}
                {selectedWidget.docs_url && (
                  <Button variant="outline" className="gap-2" onClick={() => window.open(selectedWidget.docs_url!, '_blank')}>
                    <FileCode className="w-4 h-4" />
                    Docs
                  </Button>
                )}
                {selectedWidget.github_url && (
                  <Button variant="outline" className="gap-2" onClick={() => window.open(selectedWidget.github_url!, '_blank')}>
                    <Github className="w-4 h-4" />
                    GitHub
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Code Modal */}
      <Dialog open={showCodeModal} onOpenChange={setShowCodeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Installation Code</DialogTitle>
          </DialogHeader>
          {codeWidget && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">Install via npm:</p>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm flex items-center justify-between">
                  <code>npm install @freeflow/{codeWidget.name.toLowerCase().replace(/\s+/g, '-')}</code>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Usage:</p>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                  <code>{codeWidget.code_snippet}</code>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
