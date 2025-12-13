"use client"

import { useState } from 'react'
import StatGrid from '@/app/components/dashboard/StatGrid'
import BentoQuickAction from '@/app/components/dashboard/BentoQuickAction'
import PillButton from '@/app/components/dashboard/PillButton'
import MiniKPI from '@/app/components/dashboard/MiniKPI'
import ActivityFeed from '@/app/components/dashboard/ActivityFeed'
import RankingList from '@/app/components/dashboard/RankingList'
import ProgressCard from '@/app/components/dashboard/ProgressCard'

type AppStatus = 'installed' | 'available' | 'updating' | 'trial' | 'suspended'
type AppCategory = 'business' | 'productivity' | 'creative' | 'finance' | 'education' | 'utilities' | 'developer' | 'social'
type AppPricing = 'free' | 'freemium' | 'paid' | 'subscription' | 'enterprise'

interface App {
  id: string
  name: string
  tagline: string
  description: string
  developer: string
  icon: string
  category: AppCategory
  pricing: AppPricing
  status: AppStatus
  price: string
  users: number
  downloads: number
  rating: number
  reviews: number
  version: string
  size: string
  lastUpdated: string
  releaseDate: string
  features: string[]
  screenshots: number
  compatibility: string[]
  languages: number
  tags: string[]
}

export default function AppStorePage() {
  const [statusFilter, setStatusFilter] = useState<AppStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<AppCategory | 'all'>('all')
  const [pricingFilter, setPricingFilter] = useState<AppPricing | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Mock data
  const apps: App[] = [
    {
      id: 'app-001',
      name: 'TaskFlow Pro',
      tagline: 'Advanced task management for teams',
      description: 'Powerful task and project management app with Kanban boards, Gantt charts, time tracking, and team collaboration features.',
      developer: 'Productivity Labs',
      icon: 'TF',
      category: 'productivity',
      pricing: 'freemium',
      status: 'installed',
      price: 'Free - $29/month',
      users: 128500,
      downloads: 256800,
      rating: 4.8,
      reviews: 12340,
      version: '5.2.1',
      size: '42.3 MB',
      lastUpdated: '2024-01-15',
      releaseDate: '2022-03-12',
      features: ['Kanban Boards', 'Gantt Charts', 'Time Tracking', 'Team Collaboration', 'Mobile Apps'],
      screenshots: 8,
      compatibility: ['Web', 'iOS', 'Android', 'Desktop'],
      languages: 15,
      tags: ['tasks', 'projects', 'team', 'productivity']
    },
    {
      id: 'app-002',
      name: 'FinanceHub',
      tagline: 'Complete financial management solution',
      description: 'Comprehensive finance app for invoicing, expense tracking, budgeting, and financial reporting with bank integration.',
      developer: 'Finance Software Inc',
      icon: 'FH',
      category: 'finance',
      pricing: 'subscription',
      status: 'installed',
      price: '$49/month',
      users: 94200,
      downloads: 187600,
      rating: 4.7,
      reviews: 8920,
      version: '4.8.3',
      size: '38.7 MB',
      lastUpdated: '2024-01-14',
      releaseDate: '2021-08-20',
      features: ['Invoicing', 'Expense Tracking', 'Budgeting', 'Reporting', 'Bank Sync'],
      screenshots: 10,
      compatibility: ['Web', 'iOS', 'Android'],
      languages: 12,
      tags: ['finance', 'invoicing', 'accounting', 'business']
    },
    {
      id: 'app-003',
      name: 'DesignStudio Max',
      tagline: 'Professional design and creative tools',
      description: 'All-in-one creative suite for graphic design, photo editing, illustration, and prototyping with AI-powered tools.',
      developer: 'Creative Apps Co',
      icon: 'DS',
      category: 'creative',
      pricing: 'subscription',
      status: 'trial',
      price: '$39/month',
      users: 156800,
      downloads: 342100,
      rating: 4.9,
      reviews: 18670,
      version: '6.1.2',
      size: '124.5 MB',
      lastUpdated: '2024-01-13',
      releaseDate: '2020-05-15',
      features: ['Graphic Design', 'Photo Editing', 'Illustration', 'Prototyping', 'AI Tools'],
      screenshots: 12,
      compatibility: ['Web', 'macOS', 'Windows', 'iPad'],
      languages: 20,
      tags: ['design', 'creative', 'graphics', 'photo']
    },
    {
      id: 'app-004',
      name: 'LearnHub Academy',
      tagline: 'Interactive learning platform',
      description: 'Educational app with courses, quizzes, certifications, and progress tracking for personal and professional development.',
      developer: 'Education Tech',
      icon: 'LH',
      category: 'education',
      pricing: 'freemium',
      status: 'available',
      price: 'Free - $19/month',
      users: 78400,
      downloads: 198500,
      rating: 4.6,
      reviews: 6540,
      version: '3.9.4',
      size: '52.1 MB',
      lastUpdated: '2024-01-12',
      releaseDate: '2022-01-10',
      features: ['Video Courses', 'Quizzes', 'Certifications', 'Progress Tracking', 'Discussion Forums'],
      screenshots: 9,
      compatibility: ['Web', 'iOS', 'Android'],
      languages: 18,
      tags: ['education', 'learning', 'courses', 'certification']
    },
    {
      id: 'app-005',
      name: 'SocialConnect',
      tagline: 'Social media management made easy',
      description: 'Manage all your social media accounts from one place with scheduling, analytics, and engagement tools.',
      developer: 'Social Media Tools',
      icon: 'SC',
      category: 'social',
      pricing: 'subscription',
      status: 'available',
      price: '$29/month',
      users: 112600,
      downloads: 234800,
      rating: 4.5,
      reviews: 9870,
      version: '4.3.7',
      size: '34.2 MB',
      lastUpdated: '2024-01-11',
      releaseDate: '2021-11-05',
      features: ['Multi-account', 'Scheduling', 'Analytics', 'Engagement', 'Content Calendar'],
      screenshots: 8,
      compatibility: ['Web', 'iOS', 'Android'],
      languages: 16,
      tags: ['social', 'marketing', 'scheduling', 'analytics']
    },
    {
      id: 'app-006',
      name: 'DevTools Suite',
      tagline: 'Essential tools for developers',
      description: 'Complete developer toolkit with code editor, debugger, API testing, version control, and deployment tools.',
      developer: 'Developer Tools Inc',
      icon: 'DT',
      category: 'developer',
      pricing: 'freemium',
      status: 'available',
      price: 'Free - $59/month',
      users: 89300,
      downloads: 176400,
      rating: 4.8,
      reviews: 11240,
      version: '7.5.1',
      size: '98.6 MB',
      lastUpdated: '2024-01-10',
      releaseDate: '2020-09-22',
      features: ['Code Editor', 'Debugger', 'API Testing', 'Git Integration', 'CI/CD'],
      screenshots: 11,
      compatibility: ['macOS', 'Windows', 'Linux'],
      languages: 10,
      tags: ['development', 'coding', 'api', 'tools']
    },
    {
      id: 'app-007',
      name: 'BusinessHub CRM',
      tagline: 'Customer relationship management',
      description: 'Powerful CRM system for managing contacts, deals, sales pipeline, and customer communications.',
      developer: 'Business Solutions',
      icon: 'BH',
      category: 'business',
      pricing: 'subscription',
      status: 'available',
      price: '$39/month',
      users: 67800,
      downloads: 142300,
      rating: 4.6,
      reviews: 5670,
      version: '5.4.2',
      size: '46.8 MB',
      lastUpdated: '2024-01-09',
      releaseDate: '2021-04-18',
      features: ['Contact Management', 'Sales Pipeline', 'Email Integration', 'Reporting', 'Mobile CRM'],
      screenshots: 10,
      compatibility: ['Web', 'iOS', 'Android'],
      languages: 14,
      tags: ['crm', 'business', 'sales', 'contacts']
    },
    {
      id: 'app-008',
      name: 'UtilityPack Pro',
      tagline: 'Essential utilities collection',
      description: 'Suite of productivity utilities including file manager, password manager, clipboard manager, and system tools.',
      developer: 'Utility Apps',
      icon: 'UP',
      category: 'utilities',
      pricing: 'paid',
      status: 'available',
      price: '$24.99',
      users: 134900,
      downloads: 289700,
      rating: 4.7,
      reviews: 14560,
      version: '3.6.8',
      size: '28.4 MB',
      lastUpdated: '2024-01-08',
      releaseDate: '2022-07-14',
      features: ['File Manager', 'Password Manager', 'Clipboard Manager', 'System Tools', 'Shortcuts'],
      screenshots: 7,
      compatibility: ['macOS', 'Windows'],
      languages: 12,
      tags: ['utilities', 'tools', 'productivity', 'system']
    },
    {
      id: 'app-009',
      name: 'MeetingRoom Pro',
      tagline: 'Video conferencing and meetings',
      description: 'Professional video conferencing app with HD quality, screen sharing, recording, and virtual backgrounds.',
      developer: 'Communication Corp',
      icon: 'MR',
      category: 'business',
      pricing: 'freemium',
      status: 'available',
      price: 'Free - $15/month',
      users: 198600,
      downloads: 456200,
      rating: 4.8,
      reviews: 23480,
      version: '8.2.3',
      size: '67.9 MB',
      lastUpdated: '2024-01-07',
      releaseDate: '2020-02-10',
      features: ['HD Video', 'Screen Sharing', 'Recording', 'Virtual Backgrounds', 'Breakout Rooms'],
      screenshots: 9,
      compatibility: ['Web', 'iOS', 'Android', 'Desktop'],
      languages: 22,
      tags: ['video', 'meetings', 'conferencing', 'communication']
    },
    {
      id: 'app-010',
      name: 'CreativeFlow',
      tagline: 'Workflow automation for creatives',
      description: 'Automation app designed for creative professionals with asset management, batch processing, and workflow templates.',
      developer: 'Creative Workflow',
      icon: 'CF',
      category: 'creative',
      pricing: 'subscription',
      status: 'available',
      price: '$34/month',
      users: 45200,
      downloads: 98700,
      rating: 4.5,
      reviews: 3420,
      version: '2.8.1',
      size: '56.3 MB',
      lastUpdated: '2024-01-06',
      releaseDate: '2023-03-08',
      features: ['Asset Management', 'Batch Processing', 'Workflow Templates', 'Version Control', 'Team Sharing'],
      screenshots: 8,
      compatibility: ['macOS', 'Windows'],
      languages: 8,
      tags: ['creative', 'workflow', 'automation', 'assets']
    },
    {
      id: 'app-011',
      name: 'DataViz Pro',
      tagline: 'Advanced data visualization',
      description: 'Create stunning interactive charts, dashboards, and reports with drag-and-drop interface and real-time data.',
      developer: 'Analytics Plus',
      icon: 'DV',
      category: 'business',
      pricing: 'subscription',
      status: 'available',
      price: '$44/month',
      users: 72100,
      downloads: 154800,
      rating: 4.7,
      reviews: 6890,
      version: '4.7.5',
      size: '51.2 MB',
      lastUpdated: '2024-01-05',
      releaseDate: '2021-06-22',
      features: ['Interactive Charts', 'Dashboards', 'Real-time Data', 'Export Options', 'Templates'],
      screenshots: 10,
      compatibility: ['Web', 'Desktop'],
      languages: 11,
      tags: ['analytics', 'visualization', 'charts', 'dashboards']
    },
    {
      id: 'app-012',
      name: 'SmartNotes AI',
      tagline: 'Intelligent note-taking app',
      description: 'AI-powered note-taking with smart organization, voice transcription, search, and cross-device sync.',
      developer: 'Note Apps Inc',
      icon: 'SN',
      category: 'productivity',
      pricing: 'freemium',
      status: 'available',
      price: 'Free - $9.99/month',
      users: 167800,
      downloads: 387400,
      rating: 4.6,
      reviews: 19230,
      version: '6.3.2',
      size: '32.7 MB',
      lastUpdated: '2024-01-04',
      releaseDate: '2022-09-15',
      features: ['AI Organization', 'Voice Transcription', 'Smart Search', 'Cross-device Sync', 'Markdown Support'],
      screenshots: 7,
      compatibility: ['Web', 'iOS', 'Android', 'Desktop'],
      languages: 17,
      tags: ['notes', 'productivity', 'ai', 'sync']
    }
  ]

  const filteredApps = apps.filter(app => {
    if (statusFilter !== 'all' && app.status !== statusFilter) return false
    if (categoryFilter !== 'all' && app.category !== categoryFilter) return false
    if (pricingFilter !== 'all' && app.pricing !== pricingFilter) return false
    return true
  })

  const stats = [
    { label: 'Total Apps', value: '4,287', trend: '+156', trendLabel: 'this month' },
    { label: 'Installed Apps', value: '18', trend: '+3', trendLabel: 'vs last week' },
    { label: 'Total Downloads', value: '12.4M', trend: '+52%', trendLabel: 'vs last month' },
    { label: 'Avg Rating', value: '4.6/5', trend: '+0.2', trendLabel: 'improvement' }
  ]

  const quickActions = [
    { label: 'Browse All', icon: '🏪', onClick: () => console.log('Browse All') },
    { label: 'My Apps', icon: '📱', onClick: () => console.log('My Apps') },
    { label: 'Featured', icon: '⭐', onClick: () => console.log('Featured') },
    { label: 'Top Charts', icon: '📊', onClick: () => console.log('Top Charts') },
    { label: 'Categories', icon: '📂', onClick: () => console.log('Categories') },
    { label: 'Wishlist', icon: '❤️', onClick: () => console.log('Wishlist') },
    { label: 'Updates', icon: '🔄', onClick: () => console.log('Updates') },
    { label: 'Settings', icon: '⚙️', onClick: () => console.log('Settings') }
  ]

  const recentActivity = [
    { label: 'TaskFlow Pro updated to v5.2.1', time: '6 min ago', type: 'update' },
    { label: 'New app: SmartNotes AI installed', time: '14 min ago', type: 'install' },
    { label: 'DesignStudio Max trial started (14 days)', time: '28 min ago', type: 'trial' },
    { label: 'MeetingRoom Pro reached 1M downloads', time: '1 hour ago', type: 'milestone' },
    { label: 'FinanceHub subscription renewed', time: '2 hours ago', type: 'billing' },
    { label: '5 apps added to wishlist', time: '3 hours ago', type: 'wishlist' }
  ]

  const topApps = filteredApps
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 5)
    .map((app, index) => ({
      rank: index + 1,
      label: app.name,
      value: app.downloads.toLocaleString(),
      change: index === 0 ? '+52%' : index === 1 ? '+45%' : index === 2 ? '+38%' : index === 3 ? '+32%' : '+28%'
    }))

  const getStatusColor = (status: AppStatus) => {
    switch (status) {
      case 'installed': return 'bg-green-100 text-green-700'
      case 'available': return 'bg-blue-100 text-blue-700'
      case 'updating': return 'bg-yellow-100 text-yellow-700'
      case 'trial': return 'bg-purple-100 text-purple-700'
      case 'suspended': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getCategoryColor = (category: AppCategory) => {
    switch (category) {
      case 'business': return 'bg-blue-100 text-blue-700'
      case 'productivity': return 'bg-green-100 text-green-700'
      case 'creative': return 'bg-purple-100 text-purple-700'
      case 'finance': return 'bg-teal-100 text-teal-700'
      case 'education': return 'bg-orange-100 text-orange-700'
      case 'utilities': return 'bg-indigo-100 text-indigo-700'
      case 'developer': return 'bg-pink-100 text-pink-700'
      case 'social': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getPricingColor = (pricing: AppPricing) => {
    switch (pricing) {
      case 'free': return 'bg-green-100 text-green-700'
      case 'freemium': return 'bg-blue-100 text-blue-700'
      case 'paid': return 'bg-purple-100 text-purple-700'
      case 'subscription': return 'bg-orange-100 text-orange-700'
      case 'enterprise': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            App Store
          </h1>
          <p className="text-gray-600 mt-1">Discover and install powerful applications</p>
        </div>
        <button className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-shadow">
          Browse Apps
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
          <PillButton active={statusFilter === 'installed'} onClick={() => setStatusFilter('installed')}>Installed</PillButton>
          <PillButton active={statusFilter === 'trial'} onClick={() => setStatusFilter('trial')}>Trial</PillButton>
          <PillButton active={statusFilter === 'available'} onClick={() => setStatusFilter('available')}>Available</PillButton>
        </div>
        <div className="flex gap-2">
          <PillButton active={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')}>All Categories</PillButton>
          <PillButton active={categoryFilter === 'business'} onClick={() => setCategoryFilter('business')}>Business</PillButton>
          <PillButton active={categoryFilter === 'productivity'} onClick={() => setCategoryFilter('productivity')}>Productivity</PillButton>
          <PillButton active={categoryFilter === 'creative'} onClick={() => setCategoryFilter('creative')}>Creative</PillButton>
        </div>
        <div className="flex gap-2">
          <PillButton active={pricingFilter === 'all'} onClick={() => setPricingFilter('all')}>All Pricing</PillButton>
          <PillButton active={pricingFilter === 'free'} onClick={() => setPricingFilter('free')}>Free</PillButton>
          <PillButton active={pricingFilter === 'freemium'} onClick={() => setPricingFilter('freemium')}>Freemium</PillButton>
          <PillButton active={pricingFilter === 'subscription'} onClick={() => setPricingFilter('subscription')}>Subscription</PillButton>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Apps List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Available Apps ({filteredApps.length})</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100'}`}
                >
                  List
                </button>
              </div>
            </div>

            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
              {filteredApps.map(app => (
                <div key={app.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                      {app.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{app.name}</h3>
                      <p className="text-xs text-gray-600 mb-1">{app.tagline}</p>
                      <p className="text-xs text-gray-500">{app.developer}</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{app.description}</p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(app.category)}`}>
                      {app.category}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPricingColor(app.pricing)}`}>
                      {app.pricing}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="text-xs">
                      <div className="text-gray-500">Downloads</div>
                      <div className="font-semibold">{app.downloads.toLocaleString()}</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-gray-500">Price</div>
                      <div className="font-semibold text-indigo-600">{app.price}</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-gray-500">Size</div>
                      <div className="font-semibold">{app.size}</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-gray-500">Version</div>
                      <div className="font-semibold">v{app.version}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs mb-3">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-semibold">{app.rating}</span>
                      <span className="text-gray-500">({app.reviews.toLocaleString()})</span>
                    </div>
                    <span className="text-gray-500">{app.languages} languages</span>
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    {app.status === 'installed' ? (
                      <>
                        <button className="flex-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium hover:bg-indigo-100">
                          Open
                        </button>
                        <button className="flex-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded text-xs font-medium hover:bg-gray-100">
                          Uninstall
                        </button>
                      </>
                    ) : app.status === 'trial' ? (
                      <>
                        <button className="flex-1 px-3 py-1.5 bg-purple-50 text-purple-700 rounded text-xs font-medium hover:bg-purple-100">
                          Purchase
                        </button>
                        <button className="flex-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded text-xs font-medium hover:bg-gray-100">
                          Details
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="flex-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium hover:bg-indigo-100">
                          Install
                        </button>
                        <button className="flex-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded text-xs font-medium hover:bg-gray-100">
                          Details
                        </button>
                      </>
                    )}
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
              <MiniKPI label="Installed Apps" value="18" />
              <MiniKPI label="Active Trials" value="3" />
              <MiniKPI label="Monthly Spend" value="$287" />
              <MiniKPI label="Updates Available" value="5" />
            </div>
          </div>

          {/* Top Apps */}
          <RankingList title="Most Downloaded Apps" items={topApps} />

          {/* Recent Activity */}
          <ActivityFeed title="Recent Activity" activities={recentActivity} />

          {/* Category Distribution */}
          <ProgressCard
            title="App Categories"
            items={[
              { label: 'Business', value: 26, color: 'from-blue-400 to-blue-600' },
              { label: 'Productivity', value: 24, color: 'from-green-400 to-green-600' },
              { label: 'Creative', value: 18, color: 'from-purple-400 to-purple-600' },
              { label: 'Finance', value: 16, color: 'from-teal-400 to-teal-600' },
              { label: 'Utilities', value: 16, color: 'from-indigo-400 to-indigo-600' }
            ]}
          />
        </div>
      </div>
    </div>
  )
}
