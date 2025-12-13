"use client"

import { useState } from 'react'
import StatGrid from '@/app/components/dashboard/StatGrid'
import BentoQuickAction from '@/app/components/dashboard/BentoQuickAction'
import PillButton from '@/app/components/dashboard/PillButton'
import MiniKPI from '@/app/components/dashboard/MiniKPI'
import ActivityFeed from '@/app/components/dashboard/ActivityFeed'
import RankingList from '@/app/components/dashboard/RankingList'
import ProgressCard from '@/app/components/dashboard/ProgressCard'

type WidgetStatus = 'active' | 'beta' | 'deprecated' | 'maintenance' | 'coming-soon'
type WidgetCategory = 'analytics' | 'communication' | 'productivity' | 'social' | 'commerce' | 'content' | 'media' | 'utilities'
type WidgetType = 'chart' | 'form' | 'display' | 'interactive' | 'data-input' | 'visualization' | 'embed'

interface Widget {
  id: string
  name: string
  description: string
  category: WidgetCategory
  type: WidgetType
  status: WidgetStatus
  version: string
  author: string
  installs: number
  activeUsers: number
  rating: number
  totalRatings: number
  downloads: number
  lastUpdated: string
  releaseDate: string
  size: string
  dependencies: number
  documentation: string
  demo: string
  tags: string[]
}

export default function WidgetLibraryPage() {
  const [statusFilter, setStatusFilter] = useState<WidgetStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<WidgetCategory | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<WidgetType | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Mock data
  const widgets: Widget[] = [
    {
      id: 'widget-001',
      name: 'Advanced Analytics Dashboard',
      description: 'Comprehensive analytics widget with real-time data visualization, customizable charts, and interactive filters.',
      category: 'analytics',
      type: 'visualization',
      status: 'active',
      version: '3.2.1',
      author: 'Analytics Team',
      installs: 45200,
      activeUsers: 38900,
      rating: 4.8,
      totalRatings: 2340,
      downloads: 52400,
      lastUpdated: '2024-01-15',
      releaseDate: '2023-06-12',
      size: '124 KB',
      dependencies: 3,
      documentation: 'https://docs.example.com/widgets/analytics-dashboard',
      demo: 'https://demo.example.com/analytics-dashboard',
      tags: ['analytics', 'charts', 'real-time', 'dashboard']
    },
    {
      id: 'widget-002',
      name: 'Team Chat Widget',
      description: 'Real-time team communication widget with threaded conversations, file sharing, and emoji reactions.',
      category: 'communication',
      type: 'interactive',
      status: 'active',
      version: '2.8.4',
      author: 'Communication Team',
      installs: 38600,
      activeUsers: 32100,
      rating: 4.6,
      totalRatings: 1890,
      downloads: 44200,
      lastUpdated: '2024-01-14',
      releaseDate: '2023-04-20',
      size: '98 KB',
      dependencies: 5,
      documentation: 'https://docs.example.com/widgets/team-chat',
      demo: 'https://demo.example.com/team-chat',
      tags: ['chat', 'communication', 'real-time', 'collaboration']
    },
    {
      id: 'widget-003',
      name: 'Task Progress Tracker',
      description: 'Visual task and project progress tracking with kanban boards, timelines, and milestone indicators.',
      category: 'productivity',
      type: 'display',
      status: 'active',
      version: '4.1.0',
      author: 'Productivity Team',
      installs: 34800,
      activeUsers: 29400,
      rating: 4.7,
      totalRatings: 2120,
      downloads: 39600,
      lastUpdated: '2024-01-13',
      releaseDate: '2023-03-15',
      size: '156 KB',
      dependencies: 4,
      documentation: 'https://docs.example.com/widgets/task-tracker',
      demo: 'https://demo.example.com/task-tracker',
      tags: ['tasks', 'projects', 'productivity', 'kanban']
    },
    {
      id: 'widget-004',
      name: 'Social Media Feed',
      description: 'Aggregated social media feed widget displaying content from multiple platforms in a unified timeline.',
      category: 'social',
      type: 'embed',
      status: 'active',
      version: '1.9.2',
      author: 'Social Team',
      installs: 28900,
      activeUsers: 24200,
      rating: 4.5,
      totalRatings: 1560,
      downloads: 32800,
      lastUpdated: '2024-01-12',
      releaseDate: '2023-08-08',
      size: '89 KB',
      dependencies: 6,
      documentation: 'https://docs.example.com/widgets/social-feed',
      demo: 'https://demo.example.com/social-feed',
      tags: ['social', 'feed', 'timeline', 'integration']
    },
    {
      id: 'widget-005',
      name: 'E-commerce Product Showcase',
      description: 'Beautiful product display widget with image galleries, pricing, reviews, and add-to-cart functionality.',
      category: 'commerce',
      type: 'display',
      status: 'active',
      version: '2.5.3',
      author: 'Commerce Team',
      installs: 25400,
      activeUsers: 21800,
      rating: 4.6,
      totalRatings: 1430,
      downloads: 29100,
      lastUpdated: '2024-01-11',
      releaseDate: '2023-05-22',
      size: '142 KB',
      dependencies: 7,
      documentation: 'https://docs.example.com/widgets/product-showcase',
      demo: 'https://demo.example.com/product-showcase',
      tags: ['e-commerce', 'products', 'shopping', 'showcase']
    },
    {
      id: 'widget-006',
      name: 'Content Editor Pro',
      description: 'Rich text editor widget with markdown support, collaborative editing, and version control.',
      category: 'content',
      type: 'data-input',
      status: 'active',
      version: '3.7.1',
      author: 'Content Team',
      installs: 22600,
      activeUsers: 19200,
      rating: 4.8,
      totalRatings: 1780,
      downloads: 26400,
      lastUpdated: '2024-01-10',
      releaseDate: '2023-02-14',
      size: '178 KB',
      dependencies: 8,
      documentation: 'https://docs.example.com/widgets/content-editor',
      demo: 'https://demo.example.com/content-editor',
      tags: ['editor', 'content', 'markdown', 'collaborative']
    },
    {
      id: 'widget-007',
      name: 'Video Player Plus',
      description: 'Advanced video player with playlist support, subtitles, quality selection, and playback speed control.',
      category: 'media',
      type: 'embed',
      status: 'active',
      version: '2.3.8',
      author: 'Media Team',
      installs: 19800,
      activeUsers: 16700,
      rating: 4.7,
      totalRatings: 1240,
      downloads: 23200,
      lastUpdated: '2024-01-09',
      releaseDate: '2023-07-19',
      size: '134 KB',
      dependencies: 4,
      documentation: 'https://docs.example.com/widgets/video-player',
      demo: 'https://demo.example.com/video-player',
      tags: ['video', 'media', 'player', 'streaming']
    },
    {
      id: 'widget-008',
      name: 'Form Builder Advanced',
      description: 'Drag-and-drop form builder with conditional logic, validation rules, and integration capabilities.',
      category: 'productivity',
      type: 'form',
      status: 'beta',
      version: '1.2.0-beta.3',
      author: 'Forms Team',
      installs: 16200,
      activeUsers: 13800,
      rating: 4.4,
      totalRatings: 890,
      downloads: 18900,
      lastUpdated: '2024-01-08',
      releaseDate: '2023-11-03',
      size: '167 KB',
      dependencies: 9,
      documentation: 'https://docs.example.com/widgets/form-builder',
      demo: 'https://demo.example.com/form-builder',
      tags: ['forms', 'builder', 'drag-drop', 'validation']
    },
    {
      id: 'widget-009',
      name: 'Calendar Scheduler',
      description: 'Full-featured calendar widget with event scheduling, reminders, and third-party calendar sync.',
      category: 'productivity',
      type: 'interactive',
      status: 'active',
      version: '2.9.5',
      author: 'Productivity Team',
      installs: 14600,
      activeUsers: 12400,
      rating: 4.5,
      totalRatings: 1020,
      downloads: 17100,
      lastUpdated: '2024-01-07',
      releaseDate: '2023-01-28',
      size: '112 KB',
      dependencies: 5,
      documentation: 'https://docs.example.com/widgets/calendar',
      demo: 'https://demo.example.com/calendar',
      tags: ['calendar', 'scheduling', 'events', 'reminders']
    },
    {
      id: 'widget-010',
      name: 'Data Table Pro',
      description: 'Advanced data table with sorting, filtering, pagination, export, and inline editing capabilities.',
      category: 'utilities',
      type: 'display',
      status: 'active',
      version: '3.4.2',
      author: 'Utilities Team',
      installs: 12800,
      activeUsers: 10900,
      rating: 4.6,
      totalRatings: 780,
      downloads: 15200,
      lastUpdated: '2024-01-06',
      releaseDate: '2023-09-11',
      size: '145 KB',
      dependencies: 6,
      documentation: 'https://docs.example.com/widgets/data-table',
      demo: 'https://demo.example.com/data-table',
      tags: ['table', 'data', 'sorting', 'filtering']
    },
    {
      id: 'widget-011',
      name: 'Weather Dashboard',
      description: 'Real-time weather widget with forecasts, radar maps, and severe weather alerts for multiple locations.',
      category: 'utilities',
      type: 'visualization',
      status: 'active',
      version: '1.7.3',
      author: 'Utilities Team',
      installs: 11200,
      activeUsers: 9600,
      rating: 4.3,
      totalRatings: 640,
      downloads: 13400,
      lastUpdated: '2024-01-05',
      releaseDate: '2023-10-17',
      size: '92 KB',
      dependencies: 3,
      documentation: 'https://docs.example.com/widgets/weather',
      demo: 'https://demo.example.com/weather',
      tags: ['weather', 'forecast', 'maps', 'alerts']
    },
    {
      id: 'widget-012',
      name: 'Payment Gateway',
      description: 'Secure payment processing widget with support for multiple payment methods and currencies.',
      category: 'commerce',
      type: 'form',
      status: 'active',
      version: '2.1.9',
      author: 'Commerce Team',
      installs: 9800,
      activeUsers: 8400,
      rating: 4.7,
      totalRatings: 920,
      downloads: 11600,
      lastUpdated: '2024-01-04',
      releaseDate: '2023-12-05',
      size: '158 KB',
      dependencies: 10,
      documentation: 'https://docs.example.com/widgets/payment',
      demo: 'https://demo.example.com/payment',
      tags: ['payment', 'checkout', 'commerce', 'secure']
    }
  ]

  const filteredWidgets = widgets.filter(widget => {
    if (statusFilter !== 'all' && widget.status !== statusFilter) return false
    if (categoryFilter !== 'all' && widget.category !== categoryFilter) return false
    if (typeFilter !== 'all' && widget.type !== typeFilter) return false
    return true
  })

  const stats = [
    { label: 'Total Widgets', value: '234', trend: '+18', trendLabel: 'this month' },
    { label: 'Total Installs', value: '892K', trend: '+24%', trendLabel: 'vs last month' },
    { label: 'Avg Rating', value: '4.6/5', trend: '+0.3', trendLabel: 'improvement' },
    { label: 'Active Users', value: '456K', trend: '+32%', trendLabel: 'this week' }
  ]

  const quickActions = [
    { label: 'Browse Widgets', icon: '🔍', onClick: () => console.log('Browse Widgets') },
    { label: 'Create Widget', icon: '✨', onClick: () => console.log('Create Widget') },
    { label: 'My Widgets', icon: '📦', onClick: () => console.log('My Widgets') },
    { label: 'Analytics', icon: '📊', onClick: () => console.log('Analytics') },
    { label: 'Documentation', icon: '📚', onClick: () => console.log('Documentation') },
    { label: 'API Reference', icon: '⚡', onClick: () => console.log('API Reference') },
    { label: 'Developer Portal', icon: '💻', onClick: () => console.log('Developer Portal') },
    { label: 'Settings', icon: '⚙️', onClick: () => console.log('Settings') }
  ]

  const recentActivity = [
    { label: 'Widget "Advanced Analytics" updated to v3.2.1', time: '10 min ago', type: 'update' },
    { label: 'New widget "Payment Gateway" published', time: '18 min ago', type: 'publish' },
    { label: 'Widget "Team Chat" reached 30K active users', time: '35 min ago', type: 'milestone' },
    { label: '"Form Builder" moved to beta status', time: '1 hour ago', type: 'status' },
    { label: 'Widget "Video Player" received 5-star rating', time: '2 hours ago', type: 'rating' },
    { label: '5 new widgets submitted for review', time: '3 hours ago', type: 'review' }
  ]

  const topWidgets = filteredWidgets
    .sort((a, b) => b.installs - a.installs)
    .slice(0, 5)
    .map((widget, index) => ({
      rank: index + 1,
      label: widget.name,
      value: widget.installs.toLocaleString(),
      change: index === 0 ? '+32%' : index === 1 ? '+28%' : index === 2 ? '+24%' : index === 3 ? '+18%' : '+14%'
    }))

  const getStatusColor = (status: WidgetStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'beta': return 'bg-blue-100 text-blue-700'
      case 'deprecated': return 'bg-red-100 text-red-700'
      case 'maintenance': return 'bg-yellow-100 text-yellow-700'
      case 'coming-soon': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getCategoryColor = (category: WidgetCategory) => {
    switch (category) {
      case 'analytics': return 'bg-blue-100 text-blue-700'
      case 'communication': return 'bg-green-100 text-green-700'
      case 'productivity': return 'bg-purple-100 text-purple-700'
      case 'social': return 'bg-pink-100 text-pink-700'
      case 'commerce': return 'bg-orange-100 text-orange-700'
      case 'content': return 'bg-indigo-100 text-indigo-700'
      case 'media': return 'bg-red-100 text-red-700'
      case 'utilities': return 'bg-teal-100 text-teal-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeColor = (type: WidgetType) => {
    switch (type) {
      case 'chart': return 'bg-blue-100 text-blue-700'
      case 'form': return 'bg-green-100 text-green-700'
      case 'display': return 'bg-purple-100 text-purple-700'
      case 'interactive': return 'bg-orange-100 text-orange-700'
      case 'data-input': return 'bg-pink-100 text-pink-700'
      case 'visualization': return 'bg-indigo-100 text-indigo-700'
      case 'embed': return 'bg-teal-100 text-teal-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
            Widget Library
          </h1>
          <p className="text-gray-600 mt-1">Browse and manage reusable widgets for your applications</p>
        </div>
        <button className="px-6 py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white rounded-lg hover:shadow-lg transition-shadow">
          Create New Widget
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
          <PillButton active={statusFilter === 'active'} onClick={() => setStatusFilter('active')}>Active</PillButton>
          <PillButton active={statusFilter === 'beta'} onClick={() => setStatusFilter('beta')}>Beta</PillButton>
          <PillButton active={statusFilter === 'maintenance'} onClick={() => setStatusFilter('maintenance')}>Maintenance</PillButton>
        </div>
        <div className="flex gap-2">
          <PillButton active={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')}>All Categories</PillButton>
          <PillButton active={categoryFilter === 'analytics'} onClick={() => setCategoryFilter('analytics')}>Analytics</PillButton>
          <PillButton active={categoryFilter === 'productivity'} onClick={() => setCategoryFilter('productivity')}>Productivity</PillButton>
          <PillButton active={categoryFilter === 'commerce'} onClick={() => setCategoryFilter('commerce')}>Commerce</PillButton>
        </div>
        <div className="flex gap-2">
          <PillButton active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>All Types</PillButton>
          <PillButton active={typeFilter === 'display'} onClick={() => setTypeFilter('display')}>Display</PillButton>
          <PillButton active={typeFilter === 'interactive'} onClick={() => setTypeFilter('interactive')}>Interactive</PillButton>
          <PillButton active={typeFilter === 'visualization'} onClick={() => setTypeFilter('visualization')}>Visualization</PillButton>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Widgets List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Widgets ({filteredWidgets.length})</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100'}`}
                >
                  List
                </button>
              </div>
            </div>

            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
              {filteredWidgets.map(widget => (
                <div key={widget.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{widget.name}</h3>
                      <p className="text-xs text-gray-500 mb-2">v{widget.version} • {widget.size}</p>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{widget.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(widget.status)}`}>
                      {widget.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(widget.category)}`}>
                      {widget.category}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(widget.type)}`}>
                      {widget.type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="text-xs">
                      <div className="text-gray-500">Installs</div>
                      <div className="font-semibold">{widget.installs.toLocaleString()}</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-gray-500">Active Users</div>
                      <div className="font-semibold">{widget.activeUsers.toLocaleString()}</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-gray-500">Downloads</div>
                      <div className="font-semibold">{widget.downloads.toLocaleString()}</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-gray-500">Dependencies</div>
                      <div className="font-semibold">{widget.dependencies}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs mb-3">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-semibold">{widget.rating}</span>
                      <span className="text-gray-500">({widget.totalRatings})</span>
                    </div>
                    <span className="text-gray-500">By {widget.author}</span>
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    <button className="flex-1 px-3 py-1.5 bg-purple-50 text-purple-700 rounded text-xs font-medium hover:bg-purple-100">
                      Install
                    </button>
                    <button className="flex-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded text-xs font-medium hover:bg-gray-100">
                      Demo
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
              <MiniKPI label="Active Widgets" value="187" />
              <MiniKPI label="Beta Widgets" value="24" />
              <MiniKPI label="New This Month" value="18" />
              <MiniKPI label="Total Authors" value="56" />
            </div>
          </div>

          {/* Top Widgets */}
          <RankingList title="Most Installed Widgets" items={topWidgets} />

          {/* Recent Activity */}
          <ActivityFeed title="Recent Activity" activities={recentActivity} />

          {/* Category Distribution */}
          <ProgressCard
            title="Category Distribution"
            items={[
              { label: 'Analytics', value: 28, color: 'from-blue-400 to-blue-600' },
              { label: 'Productivity', value: 24, color: 'from-purple-400 to-purple-600' },
              { label: 'Commerce', value: 18, color: 'from-orange-400 to-orange-600' },
              { label: 'Media', value: 16, color: 'from-red-400 to-red-600' },
              { label: 'Utilities', value: 14, color: 'from-teal-400 to-teal-600' }
            ]}
          />
        </div>
      </div>
    </div>
  )
}
