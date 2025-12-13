"use client"

import { useState } from 'react'
import StatGrid from '@/app/components/dashboard/StatGrid'
import BentoQuickAction from '@/app/components/dashboard/BentoQuickAction'
import PillButton from '@/app/components/dashboard/PillButton'
import MiniKPI from '@/app/components/dashboard/MiniKPI'
import ActivityFeed from '@/app/components/dashboard/ActivityFeed'
import RankingList from '@/app/components/dashboard/RankingList'
import ProgressCard from '@/app/components/dashboard/ProgressCard'

type ComponentStatus = 'published' | 'draft' | 'deprecated' | 'beta' | 'archived'
type ComponentCategory = 'layout' | 'navigation' | 'forms' | 'data-display' | 'feedback' | 'media' | 'buttons' | 'overlays'
type ComponentFramework = 'react' | 'vue' | 'angular' | 'svelte' | 'vanilla'

interface Component {
  id: string
  name: string
  description: string
  category: ComponentCategory
  framework: ComponentFramework
  status: ComponentStatus
  version: string
  author: string
  downloads: number
  usage: number
  rating: number
  reviews: number
  lastUpdated: string
  releaseDate: string
  size: string
  dependencies: number
  props: number
  examples: number
  accessibility: string
  responsive: boolean
  tags: string[]
}

export default function ComponentLibraryPage() {
  const [statusFilter, setStatusFilter] = useState<ComponentStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<ComponentCategory | 'all'>('all')
  const [frameworkFilter, setFrameworkFilter] = useState<ComponentFramework | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Mock data
  const components: Component[] = [
    {
      id: 'comp-001',
      name: 'DataTable Pro',
      description: 'Advanced data table with sorting, filtering, pagination, virtual scrolling, and export capabilities.',
      category: 'data-display',
      framework: 'react',
      status: 'published',
      version: '3.5.2',
      author: 'UI Components Team',
      downloads: 156800,
      usage: 12400,
      rating: 4.9,
      reviews: 3420,
      lastUpdated: '2024-01-15',
      releaseDate: '2023-03-10',
      size: '42 KB',
      dependencies: 3,
      props: 28,
      examples: 12,
      accessibility: 'WCAG 2.1 AA',
      responsive: true,
      tags: ['table', 'data', 'grid', 'sorting']
    },
    {
      id: 'comp-002',
      name: 'Modal Dialog',
      description: 'Customizable modal dialog with animations, backdrop, accessibility features, and flexible positioning.',
      category: 'overlays',
      framework: 'react',
      status: 'published',
      version: '2.8.4',
      author: 'Dialog Components',
      downloads: 234500,
      usage: 18900,
      rating: 4.8,
      reviews: 4560,
      lastUpdated: '2024-01-14',
      releaseDate: '2022-11-20',
      size: '18 KB',
      dependencies: 2,
      props: 15,
      examples: 8,
      accessibility: 'WCAG 2.1 AAA',
      responsive: true,
      tags: ['modal', 'dialog', 'overlay', 'popup']
    },
    {
      id: 'comp-003',
      name: 'Navigation Menu',
      description: 'Responsive navigation menu with dropdown submenus, mobile support, and customizable styling.',
      category: 'navigation',
      framework: 'react',
      status: 'published',
      version: '4.2.1',
      author: 'Navigation Team',
      downloads: 198600,
      usage: 16700,
      rating: 4.7,
      reviews: 3890,
      lastUpdated: '2024-01-13',
      releaseDate: '2022-08-15',
      size: '28 KB',
      dependencies: 1,
      props: 18,
      examples: 10,
      accessibility: 'WCAG 2.1 AA',
      responsive: true,
      tags: ['navigation', 'menu', 'dropdown', 'nav']
    },
    {
      id: 'comp-004',
      name: 'Form Validator',
      description: 'Comprehensive form validation with custom rules, async validation, and error handling.',
      category: 'forms',
      framework: 'react',
      status: 'published',
      version: '5.1.3',
      author: 'Forms Team',
      downloads: 178400,
      usage: 14200,
      rating: 4.6,
      reviews: 3120,
      lastUpdated: '2024-01-12',
      releaseDate: '2023-01-25',
      size: '32 KB',
      dependencies: 0,
      props: 22,
      examples: 15,
      accessibility: 'WCAG 2.1 AA',
      responsive: true,
      tags: ['form', 'validation', 'input', 'error']
    },
    {
      id: 'comp-005',
      name: 'Toast Notifications',
      description: 'Elegant toast notification system with positioning, stacking, and auto-dismiss functionality.',
      category: 'feedback',
      framework: 'react',
      status: 'published',
      version: '2.4.6',
      author: 'Feedback Components',
      downloads: 289700,
      usage: 22400,
      rating: 4.9,
      reviews: 5670,
      lastUpdated: '2024-01-11',
      releaseDate: '2022-06-12',
      size: '14 KB',
      dependencies: 1,
      props: 12,
      examples: 6,
      accessibility: 'WCAG 2.1 AA',
      responsive: true,
      tags: ['toast', 'notification', 'alert', 'message']
    },
    {
      id: 'comp-006',
      name: 'Image Gallery',
      description: 'Responsive image gallery with lightbox, lazy loading, zoom, and swipe gestures.',
      category: 'media',
      framework: 'react',
      status: 'published',
      version: '3.7.2',
      author: 'Media Components',
      downloads: 145600,
      usage: 11800,
      rating: 4.7,
      reviews: 2840,
      lastUpdated: '2024-01-10',
      releaseDate: '2023-05-08',
      size: '48 KB',
      dependencies: 4,
      props: 20,
      examples: 9,
      accessibility: 'WCAG 2.1 A',
      responsive: true,
      tags: ['gallery', 'images', 'lightbox', 'media']
    },
    {
      id: 'comp-007',
      name: 'Card Layout',
      description: 'Flexible card component with header, body, footer, and various layout options.',
      category: 'layout',
      framework: 'react',
      status: 'published',
      version: '2.9.1',
      author: 'Layout Components',
      downloads: 267800,
      usage: 20600,
      rating: 4.5,
      reviews: 4320,
      lastUpdated: '2024-01-09',
      releaseDate: '2022-04-18',
      size: '16 KB',
      dependencies: 0,
      props: 14,
      examples: 11,
      accessibility: 'WCAG 2.1 AA',
      responsive: true,
      tags: ['card', 'layout', 'container', 'panel']
    },
    {
      id: 'comp-008',
      name: 'Button Group',
      description: 'Customizable button group with various sizes, styles, and toggle functionality.',
      category: 'buttons',
      framework: 'react',
      status: 'published',
      version: '1.8.5',
      author: 'Button Components',
      downloads: 312400,
      usage: 24800,
      rating: 4.8,
      reviews: 6120,
      lastUpdated: '2024-01-08',
      releaseDate: '2022-09-22',
      size: '12 KB',
      dependencies: 0,
      props: 10,
      examples: 7,
      accessibility: 'WCAG 2.1 AA',
      responsive: true,
      tags: ['button', 'group', 'toggle', 'action']
    },
    {
      id: 'comp-009',
      name: 'Chart Components',
      description: 'Interactive charts including line, bar, pie, area charts with animations and tooltips.',
      category: 'data-display',
      framework: 'react',
      status: 'published',
      version: '4.6.3',
      author: 'Charts Team',
      downloads: 189500,
      usage: 15600,
      rating: 4.7,
      reviews: 3680,
      lastUpdated: '2024-01-07',
      releaseDate: '2023-02-14',
      size: '78 KB',
      dependencies: 5,
      props: 35,
      examples: 18,
      accessibility: 'WCAG 2.1 A',
      responsive: true,
      tags: ['chart', 'graph', 'visualization', 'data']
    },
    {
      id: 'comp-010',
      name: 'Tabs Container',
      description: 'Tabbed interface with vertical/horizontal layouts, lazy loading, and keyboard navigation.',
      category: 'navigation',
      framework: 'react',
      status: 'published',
      version: '2.5.7',
      author: 'Navigation Team',
      downloads: 223700,
      usage: 17900,
      rating: 4.6,
      reviews: 4240,
      lastUpdated: '2024-01-06',
      releaseDate: '2022-12-08',
      size: '22 KB',
      dependencies: 1,
      props: 16,
      examples: 8,
      accessibility: 'WCAG 2.1 AA',
      responsive: true,
      tags: ['tabs', 'tabpanel', 'navigation', 'content']
    },
    {
      id: 'comp-011',
      name: 'Loading Spinner',
      description: 'Collection of customizable loading spinners and skeleton screens with size variations.',
      category: 'feedback',
      framework: 'react',
      status: 'published',
      version: '1.4.2',
      author: 'Feedback Components',
      downloads: 345600,
      usage: 28700,
      rating: 4.9,
      reviews: 7890,
      lastUpdated: '2024-01-05',
      releaseDate: '2023-07-20',
      size: '8 KB',
      dependencies: 0,
      props: 8,
      examples: 5,
      accessibility: 'WCAG 2.1 A',
      responsive: true,
      tags: ['loading', 'spinner', 'skeleton', 'placeholder']
    },
    {
      id: 'comp-012',
      name: 'Dropdown Select',
      description: 'Advanced select dropdown with search, multi-select, grouping, and virtual scrolling.',
      category: 'forms',
      framework: 'react',
      status: 'beta',
      version: '3.0.0-beta.2',
      author: 'Forms Team',
      downloads: 98400,
      usage: 8200,
      rating: 4.5,
      reviews: 1840,
      lastUpdated: '2024-01-04',
      releaseDate: '2023-11-15',
      size: '38 KB',
      dependencies: 2,
      props: 26,
      examples: 13,
      accessibility: 'WCAG 2.1 AA',
      responsive: true,
      tags: ['select', 'dropdown', 'search', 'multi-select']
    }
  ]

  const filteredComponents = components.filter(component => {
    if (statusFilter !== 'all' && component.status !== statusFilter) return false
    if (categoryFilter !== 'all' && component.category !== categoryFilter) return false
    if (frameworkFilter !== 'all' && component.framework !== frameworkFilter) return false
    return true
  })

  const stats = [
    { label: 'Total Components', value: '487', trend: '+32', trendLabel: 'this month' },
    { label: 'Total Downloads', value: '2.8M', trend: '+48%', trendLabel: 'vs last month' },
    { label: 'Avg Rating', value: '4.7/5', trend: '+0.3', trendLabel: 'improvement' },
    { label: 'Active Users', value: '45.6K', trend: '+28%', trendLabel: 'this week' }
  ]

  const quickActions = [
    { label: 'Browse All', icon: '🧩', onClick: () => console.log('Browse All') },
    { label: 'My Components', icon: '📦', onClick: () => console.log('My Components') },
    { label: 'Documentation', icon: '📚', onClick: () => console.log('Documentation') },
    { label: 'Code Samples', icon: '💻', onClick: () => console.log('Code Samples') },
    { label: 'Playground', icon: '🎮', onClick: () => console.log('Playground') },
    { label: 'Templates', icon: '📋', onClick: () => console.log('Templates') },
    { label: 'Submit Component', icon: '✨', onClick: () => console.log('Submit') },
    { label: 'Support', icon: '💬', onClick: () => console.log('Support') }
  ]

  const recentActivity = [
    { label: 'DataTable Pro updated to v3.5.2', time: '4 min ago', type: 'update' },
    { label: 'New component: Dropdown Select (beta)', time: '12 min ago', type: 'new' },
    { label: 'Modal Dialog reached 200K downloads', time: '28 min ago', type: 'milestone' },
    { label: 'Toast Notifications received 5-star review', time: '1 hour ago', type: 'review' },
    { label: '8 components updated for React 18', time: '2 hours ago', type: 'update' },
    { label: 'New accessibility features added', time: '3 hours ago', type: 'feature' }
  ]

  const topComponents = filteredComponents
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 5)
    .map((component, index) => ({
      rank: index + 1,
      label: component.name,
      value: component.downloads.toLocaleString(),
      change: index === 0 ? '+58%' : index === 1 ? '+52%' : index === 2 ? '+46%' : index === 3 ? '+40%' : '+36%'
    }))

  const getStatusColor = (status: ComponentStatus) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700'
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'deprecated': return 'bg-red-100 text-red-700'
      case 'beta': return 'bg-blue-100 text-blue-700'
      case 'archived': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getCategoryColor = (category: ComponentCategory) => {
    switch (category) {
      case 'layout': return 'bg-blue-100 text-blue-700'
      case 'navigation': return 'bg-green-100 text-green-700'
      case 'forms': return 'bg-purple-100 text-purple-700'
      case 'data-display': return 'bg-orange-100 text-orange-700'
      case 'feedback': return 'bg-pink-100 text-pink-700'
      case 'media': return 'bg-indigo-100 text-indigo-700'
      case 'buttons': return 'bg-teal-100 text-teal-700'
      case 'overlays': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getFrameworkColor = (framework: ComponentFramework) => {
    switch (framework) {
      case 'react': return 'bg-blue-100 text-blue-700'
      case 'vue': return 'bg-green-100 text-green-700'
      case 'angular': return 'bg-red-100 text-red-700'
      case 'svelte': return 'bg-orange-100 text-orange-700'
      case 'vanilla': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
            Component Library
          </h1>
          <p className="text-gray-600 mt-1">Discover and use reusable UI components</p>
        </div>
        <button className="px-6 py-2.5 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white rounded-lg hover:shadow-lg transition-shadow">
          Browse Components
        </button>
      </div>

      {/* Stats Grid */}
      <StatGrid stats={stats} />

      {/* Quick Actions */}
      <BentoQuickAction actions={quickActions} />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          <PillButton active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>All Status</PillButton>
          <PillButton active={statusFilter === 'published'} onClick={() => setStatusFilter('published')}>Published</PillButton>
          <PillButton active={statusFilter === 'beta'} onClick={() => setStatusFilter('beta')}>Beta</PillButton>
          <PillButton active={statusFilter === 'draft'} onClick={() => setStatusFilter('draft')}>Draft</PillButton>
        </div>
        <div className="flex gap-2">
          <PillButton active={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')}>All Categories</PillButton>
          <PillButton active={categoryFilter === 'forms'} onClick={() => setCategoryFilter('forms')}>Forms</PillButton>
          <PillButton active={categoryFilter === 'data-display'} onClick={() => setCategoryFilter('data-display')}>Data Display</PillButton>
          <PillButton active={categoryFilter === 'navigation'} onClick={() => setCategoryFilter('navigation')}>Navigation</PillButton>
        </div>
        <div className="flex gap-2">
          <PillButton active={frameworkFilter === 'all'} onClick={() => setFrameworkFilter('all')}>All Frameworks</PillButton>
          <PillButton active={frameworkFilter === 'react'} onClick={() => setFrameworkFilter('react')}>React</PillButton>
          <PillButton active={frameworkFilter === 'vue'} onClick={() => setFrameworkFilter('vue')}>Vue</PillButton>
          <PillButton active={frameworkFilter === 'angular'} onClick={() => setFrameworkFilter('angular')}>Angular</PillButton>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Components List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Components ({filteredComponents.length})</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100'}`}
                >
                  List
                </button>
              </div>
            </div>

            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
              {filteredComponents.map(component => (
                <div key={component.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{component.name}</h3>
                      <p className="text-xs text-gray-500 mb-2">v{component.version} • {component.size} • {component.author}</p>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{component.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(component.status)}`}>
                      {component.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(component.category)}`}>
                      {component.category}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getFrameworkColor(component.framework)}`}>
                      {component.framework}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="text-xs">
                      <div className="text-gray-500">Downloads</div>
                      <div className="font-semibold">{component.downloads.toLocaleString()}</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-gray-500">Active Usage</div>
                      <div className="font-semibold">{component.usage.toLocaleString()}</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-gray-500">Props</div>
                      <div className="font-semibold">{component.props}</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-gray-500">Examples</div>
                      <div className="font-semibold">{component.examples}</div>
                    </div>
                  </div>

                  <div className="mb-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Accessibility</span>
                      <span className="font-medium text-green-600">{component.accessibility}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-gray-500">Responsive</span>
                      <span className="font-medium">{component.responsive ? '✓ Yes' : '✗ No'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs mb-3">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-semibold">{component.rating}</span>
                      <span className="text-gray-500">({component.reviews.toLocaleString()})</span>
                    </div>
                    <span className="text-gray-500">{component.dependencies} deps</span>
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    <button className="flex-1 px-3 py-1.5 bg-violet-50 text-violet-700 rounded text-xs font-medium hover:bg-violet-100">
                      View Code
                    </button>
                    <button className="flex-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded text-xs font-medium hover:bg-gray-100">
                      Preview
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <MiniKPI label="Published" value="432" />
              <MiniKPI label="Beta" value="38" />
              <MiniKPI label="Draft" value="17" />
              <MiniKPI label="Contributors" value="124" />
            </div>
          </div>

          {/* Top Components */}
          <RankingList title="Most Downloaded" items={topComponents} />

          {/* Recent Activity */}
          <ActivityFeed title="Recent Activity" activities={recentActivity} />

          {/* Category Distribution */}
          <ProgressCard
            title="Component Categories"
            items={[
              { label: 'Forms', value: 26, color: 'from-purple-400 to-purple-600' },
              { label: 'Data Display', value: 24, color: 'from-orange-400 to-orange-600' },
              { label: 'Navigation', value: 18, color: 'from-green-400 to-green-600' },
              { label: 'Feedback', value: 16, color: 'from-pink-400 to-pink-600' },
              { label: 'Layout', value: 16, color: 'from-blue-400 to-blue-600' }
            ]}
          />
        </div>
      </div>
    </div>
  )
}
