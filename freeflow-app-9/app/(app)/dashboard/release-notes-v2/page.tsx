'use client'

import { useState } from 'react'
import {
  Rocket,
  CheckCircle2,
  Clock,
  Activity,
  TrendingUp,
  Settings,
  Plus,
  Edit,
  Eye,
  Tag,
  GitBranch,
  Star,
  MessageSquare,
  Users,
  Download,
  BarChart3,
  Calendar,
  Filter,
  Search,
  Share2,
  Bell,
  FileText,
  Zap
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type ReleaseStatus = 'published' | 'draft' | 'scheduled' | 'archived'
type ReleaseType = 'major' | 'minor' | 'patch' | 'hotfix'
type Platform = 'web' | 'mobile' | 'api' | 'desktop' | 'all'

interface ReleaseNote {
  id: string
  version: string
  title: string
  description: string
  status: ReleaseStatus
  type: ReleaseType
  platform: Platform
  publishedAt: string
  author: string
  highlights: string[]
  features: string[]
  improvements: string[]
  bugFixes: string[]
  breakingChanges: string[]
  downloads: number
  views: number
  likes: number
  comments: number
  tags: string[]
}

export default function ReleaseNotesPage() {
  const [viewMode, setViewMode] = useState<'all' | ReleaseStatus>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | ReleaseType>('all')

  const releases: ReleaseNote[] = [
    {
      id: 'REL-2847',
      version: 'v2.5.0',
      title: 'Winter 2024 Release',
      description: 'Major performance improvements and new features',
      status: 'published',
      type: 'minor',
      platform: 'all',
      publishedAt: '2024-01-15',
      author: 'Product Team',
      highlights: [
        '40% faster page loads',
        'New analytics dashboard',
        'Enhanced mobile experience'
      ],
      features: [
        'Real-time collaboration',
        'Advanced filtering options',
        'Custom dashboard widgets',
        'Dark mode support'
      ],
      improvements: [
        'Optimized database queries',
        'Improved caching strategy',
        'Better error handling',
        'Enhanced accessibility'
      ],
      bugFixes: [
        'Fixed date picker timezone issues',
        'Resolved file upload errors',
        'Corrected notification delays'
      ],
      breakingChanges: [],
      downloads: 2847,
      views: 12847,
      likes: 847,
      comments: 234,
      tags: ['performance', 'features', 'ux']
    },
    {
      id: 'REL-2848',
      version: 'v2.4.5',
      title: 'Security Patch',
      description: 'Critical security vulnerabilities addressed',
      status: 'published',
      type: 'patch',
      platform: 'all',
      publishedAt: '2024-01-10',
      author: 'Security Team',
      highlights: [
        'Fixed critical XSS vulnerability',
        'Updated dependencies',
        'Enhanced authentication'
      ],
      features: [],
      improvements: [
        'Strengthened input validation',
        'Improved session management'
      ],
      bugFixes: [
        'Fixed authentication bypass',
        'Resolved CSRF vulnerability'
      ],
      breakingChanges: [],
      downloads: 2456,
      views: 8473,
      likes: 456,
      comments: 89,
      tags: ['security', 'hotfix']
    },
    {
      id: 'REL-2849',
      version: 'v2.4.0',
      title: 'Dashboard Redesign',
      description: 'Complete redesign of analytics and reporting',
      status: 'published',
      type: 'minor',
      platform: 'web',
      publishedAt: '2024-01-05',
      author: 'Design Team',
      highlights: [
        'Beautiful new dashboard',
        'Interactive charts',
        'Customizable layouts'
      ],
      features: [
        'Drag-and-drop widgets',
        'Custom report builder',
        'Export to PDF/Excel',
        'Scheduled reports'
      ],
      improvements: [
        'Responsive design',
        'Faster chart rendering',
        'Better data visualization'
      ],
      bugFixes: [
        'Fixed chart alignment issues',
        'Resolved export formatting'
      ],
      breakingChanges: [],
      downloads: 1847,
      views: 9234,
      likes: 678,
      comments: 156,
      tags: ['dashboard', 'analytics', 'design']
    },
    {
      id: 'REL-2850',
      version: 'v2.3.0',
      title: 'API v2 Launch',
      description: 'New REST API with GraphQL support',
      status: 'published',
      type: 'minor',
      platform: 'api',
      publishedAt: '2024-01-01',
      author: 'API Team',
      highlights: [
        'GraphQL support',
        'Improved rate limiting',
        'Better documentation'
      ],
      features: [
        'GraphQL endpoint',
        'Webhooks support',
        'API versioning',
        'Interactive docs'
      ],
      improvements: [
        'Faster response times',
        'Better error messages',
        'Enhanced authentication'
      ],
      bugFixes: [],
      breakingChanges: [
        'Changed authentication flow',
        'Removed deprecated endpoints',
        'Updated response format'
      ],
      downloads: 1234,
      views: 5678,
      likes: 345,
      comments: 123,
      tags: ['api', 'breaking', 'graphql']
    },
    {
      id: 'REL-2851',
      version: 'v3.0.0',
      title: 'Next Generation Platform',
      description: 'Complete platform redesign with AI features',
      status: 'draft',
      type: 'major',
      platform: 'all',
      publishedAt: '2024-03-01',
      author: 'Product Team',
      highlights: [
        'AI-powered insights',
        'Modern UI/UX',
        'Enhanced performance'
      ],
      features: [
        'AI assistant',
        'Smart recommendations',
        'Predictive analytics',
        'Voice commands'
      ],
      improvements: [
        'Complete redesign',
        'New architecture',
        'Better scalability'
      ],
      bugFixes: [],
      breakingChanges: [
        'New data model',
        'Updated API endpoints',
        'Changed authentication'
      ],
      downloads: 0,
      views: 234,
      likes: 45,
      comments: 12,
      tags: ['major', 'ai', 'redesign']
    }
  ]

  const filteredReleases = releases.filter(release => {
    if (viewMode !== 'all' && release.status !== viewMode) return false
    if (typeFilter !== 'all' && release.type !== typeFilter) return false
    return true
  })

  const totalReleases = releases.length
  const publishedReleases = releases.filter(r => r.status === 'published').length
  const totalDownloads = releases.reduce((sum, r) => sum + r.downloads, 0)
  const avgLikes = releases.reduce((sum, r) => sum + r.likes, 0) / releases.length

  const getStatusColor = (status: ReleaseStatus) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-50'
      case 'draft': return 'text-gray-600 bg-gray-50'
      case 'scheduled': return 'text-blue-600 bg-blue-50'
      case 'archived': return 'text-slate-600 bg-slate-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTypeColor = (type: ReleaseType) => {
    switch (type) {
      case 'major': return 'text-purple-600 bg-purple-50'
      case 'minor': return 'text-blue-600 bg-blue-50'
      case 'patch': return 'text-green-600 bg-green-50'
      case 'hotfix': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-900 via-amber-800 to-yellow-900 bg-clip-text text-transparent mb-2">
            Release Notes
          </h1>
          <p className="text-slate-600">Product updates, new features, and version documentation</p>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Releases',
              value: totalReleases.toString(),
              icon: Rocket,
              trend: { value: 15, isPositive: true },
              color: 'orange'
            },
            {
              label: 'Published',
              value: publishedReleases.toString(),
              icon: CheckCircle2,
              trend: { value: 12, isPositive: true },
              color: 'green'
            },
            {
              label: 'Downloads',
              value: totalDownloads.toLocaleString(),
              icon: Download,
              trend: { value: 25, isPositive: true },
              color: 'blue'
            },
            {
              label: 'Avg Likes',
              value: avgLikes.toFixed(0),
              icon: Star,
              trend: { value: 18, isPositive: true },
              color: 'yellow'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            {
              title: 'New Release',
              description: 'Create notes',
              icon: Plus,
              gradient: 'from-orange-500 to-amber-600',
              onClick: () => console.log('New release')
            },
            {
              title: 'View Published',
              description: 'Live releases',
              icon: Eye,
              gradient: 'from-green-500 to-emerald-600',
              onClick: () => console.log('Published')
            },
            {
              title: 'Analytics',
              description: 'View metrics',
              icon: BarChart3,
              gradient: 'from-blue-500 to-indigo-600',
              onClick: () => console.log('Analytics')
            },
            {
              title: 'Share',
              description: 'Distribute notes',
              icon: Share2,
              gradient: 'from-purple-500 to-pink-600',
              onClick: () => console.log('Share')
            },
            {
              title: 'Notifications',
              description: 'Alert users',
              icon: Bell,
              gradient: 'from-cyan-500 to-blue-600',
              onClick: () => console.log('Notifications')
            },
            {
              title: 'Templates',
              description: 'Use presets',
              icon: FileText,
              gradient: 'from-indigo-500 to-purple-600',
              onClick: () => console.log('Templates')
            },
            {
              title: 'Settings',
              description: 'Configure notes',
              icon: Settings,
              gradient: 'from-slate-500 to-gray-600',
              onClick: () => console.log('Settings')
            },
            {
              title: 'Export',
              description: 'Download data',
              icon: Download,
              gradient: 'from-amber-500 to-orange-600',
              onClick: () => console.log('Export')
            }
          ]}
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            <PillButton
              label="All Releases"
              isActive={viewMode === 'all'}
              onClick={() => setViewMode('all')}
            />
            <PillButton
              label="Published"
              isActive={viewMode === 'published'}
              onClick={() => setViewMode('published')}
            />
            <PillButton
              label="Draft"
              isActive={viewMode === 'draft'}
              onClick={() => setViewMode('draft')}
            />
            <PillButton
              label="Scheduled"
              isActive={viewMode === 'scheduled'}
              onClick={() => setViewMode('scheduled')}
            />
          </div>

          <div className="flex gap-2">
            <PillButton
              label="All Types"
              isActive={typeFilter === 'all'}
              onClick={() => setTypeFilter('all')}
            />
            <PillButton
              label="Major"
              isActive={typeFilter === 'major'}
              onClick={() => setTypeFilter('major')}
            />
            <PillButton
              label="Minor"
              isActive={typeFilter === 'minor'}
              onClick={() => setTypeFilter('minor')}
            />
            <PillButton
              label="Patch"
              isActive={typeFilter === 'patch'}
              onClick={() => setTypeFilter('patch')}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Release Notes List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredReleases.map((release) => (
              <div
                key={release.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Rocket className="w-5 h-5 text-orange-600" />
                      <h3 className="font-semibold text-slate-900">{release.version}</h3>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-900">{release.title}</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-1">{release.description}</p>
                    <p className="text-xs text-slate-500">Release ID: {release.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(release.status)}`}>
                      {release.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(release.type)}`}>
                      {release.type}
                    </span>
                  </div>
                </div>

                {release.highlights.length > 0 && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-orange-600" />
                      Highlights
                    </h4>
                    <ul className="space-y-1">
                      {release.highlights.map((highlight, idx) => (
                        <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                          <Star className="w-3 h-3 text-orange-500 mt-1 flex-shrink-0" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {release.features.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-slate-700 mb-2">New Features</h4>
                    <ul className="space-y-1">
                      {release.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                          <Plus className="w-3 h-3 text-green-600 mt-1 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {release.improvements.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-slate-700 mb-2">Improvements</h4>
                    <ul className="space-y-1">
                      {release.improvements.map((improvement, idx) => (
                        <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                          <TrendingUp className="w-3 h-3 text-blue-600 mt-1 flex-shrink-0" />
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {release.bugFixes.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-slate-700 mb-2">Bug Fixes</h4>
                    <ul className="space-y-1">
                      {release.bugFixes.map((fix, idx) => (
                        <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 text-green-600 mt-1 flex-shrink-0" />
                          <span>{fix}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {release.breakingChanges.length > 0 && (
                  <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="text-xs font-semibold text-purple-900 mb-2">Breaking Changes</h4>
                    <ul className="space-y-1">
                      {release.breakingChanges.map((change, idx) => (
                        <li key={idx} className="text-sm text-purple-700">{change}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Published</p>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span className="text-sm text-slate-700">{release.publishedAt}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Downloads</p>
                    <div className="flex items-center gap-1">
                      <Download className="w-3 h-3 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">
                        {release.downloads.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Views</p>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">
                        {release.views.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Engagement</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="text-sm text-slate-700">{release.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-blue-500" />
                        <span className="text-sm text-slate-700">{release.comments}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {release.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-amber-700 transition-all">
                    View Full Notes
                  </button>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                    Share
                  </button>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Total Downloads */}
            <MiniKPI
              label="Total Downloads"
              value={totalDownloads.toLocaleString()}
              icon={Download}
              trend={{ value: 25, isPositive: true }}
              className="bg-gradient-to-br from-orange-500 to-amber-600"
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Releases"
              activities={[
                {
                  id: '1',
                  title: 'v2.5.0 published',
                  description: 'Winter 2024 release',
                  timestamp: '5 days ago',
                  type: 'success'
                },
                {
                  id: '2',
                  title: 'v2.4.5 published',
                  description: 'Security patch',
                  timestamp: '10 days ago',
                  type: 'warning'
                },
                {
                  id: '3',
                  title: 'v2.4.0 published',
                  description: 'Dashboard redesign',
                  timestamp: '15 days ago',
                  type: 'success'
                },
                {
                  id: '4',
                  title: 'v3.0.0 drafted',
                  description: 'Major release planned',
                  timestamp: '2 days ago',
                  type: 'info'
                }
              ]}
            />

            {/* Platform Distribution */}
            <RankingList
              title="By Platform"
              items={[
                { label: 'All Platforms', value: '45%', rank: 1 },
                { label: 'Web', value: '28%', rank: 2 },
                { label: 'API', value: '18%', rank: 3 },
                { label: 'Mobile', value: '9%', rank: 4 }
              ]}
            />

            {/* User Engagement */}
            <ProgressCard
              title="User Engagement"
              progress={84}
              subtitle="Average interaction rate"
              color="orange"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
