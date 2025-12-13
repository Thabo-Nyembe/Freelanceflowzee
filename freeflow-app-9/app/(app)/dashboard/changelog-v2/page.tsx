'use client'

import { useState } from 'react'
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  TrendingUp,
  Settings,
  Plus,
  Edit,
  Trash2,
  Tag,
  GitBranch,
  Rocket,
  Bug,
  Zap,
  Shield,
  BarChart3,
  Calendar,
  Filter,
  Search,
  Download,
  Eye,
  Users
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type ChangeType = 'feature' | 'bugfix' | 'improvement' | 'security' | 'breaking' | 'deprecation'
type ChangeStatus = 'published' | 'draft' | 'scheduled' | 'archived'
type Priority = 'low' | 'medium' | 'high' | 'critical'

interface ChangelogEntry {
  id: string
  version: string
  title: string
  description: string
  type: ChangeType
  status: ChangeStatus
  priority: Priority
  publishedAt: string
  author: string
  changes: {
    type: ChangeType
    description: string
    impact: string
  }[]
  tags: string[]
  breaking: boolean
  affectedUsers: number
  githubIssue: string
}

export default function ChangelogPage() {
  const [viewMode, setViewMode] = useState<'all' | ChangeStatus>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | ChangeType>('all')

  const entries: ChangelogEntry[] = [
    {
      id: 'CHG-2847',
      version: 'v2.5.0',
      title: 'Major Performance Improvements',
      description: 'Significant performance enhancements across the platform',
      type: 'improvement',
      status: 'published',
      priority: 'high',
      publishedAt: '2024-01-15',
      author: 'Engineering Team',
      changes: [
        {
          type: 'improvement',
          description: 'Reduced page load time by 40%',
          impact: 'All users will experience faster page loads'
        },
        {
          type: 'improvement',
          description: 'Optimized database queries',
          impact: 'Improved API response times'
        },
        {
          type: 'feature',
          description: 'Added server-side caching',
          impact: 'Reduced server load and costs'
        }
      ],
      tags: ['performance', 'optimization', 'caching'],
      breaking: false,
      affectedUsers: 12847,
      githubIssue: '#1234'
    },
    {
      id: 'CHG-2848',
      version: 'v2.4.5',
      title: 'Security Patch Release',
      description: 'Critical security vulnerabilities fixed',
      type: 'security',
      status: 'published',
      priority: 'critical',
      publishedAt: '2024-01-10',
      author: 'Security Team',
      changes: [
        {
          type: 'security',
          description: 'Fixed XSS vulnerability in user comments',
          impact: 'Enhanced security for all user interactions'
        },
        {
          type: 'security',
          description: 'Updated dependency versions',
          impact: 'Patched known security issues'
        },
        {
          type: 'bugfix',
          description: 'Fixed authentication bypass bug',
          impact: 'Improved login security'
        }
      ],
      tags: ['security', 'critical', 'hotfix'],
      breaking: false,
      affectedUsers: 12847,
      githubIssue: '#1235'
    },
    {
      id: 'CHG-2849',
      version: 'v2.4.0',
      title: 'New Dashboard and Analytics',
      description: 'Redesigned dashboard with advanced analytics features',
      type: 'feature',
      status: 'published',
      priority: 'high',
      publishedAt: '2024-01-05',
      author: 'Product Team',
      changes: [
        {
          type: 'feature',
          description: 'Brand new analytics dashboard',
          impact: 'Users get better insights into their data'
        },
        {
          type: 'feature',
          description: 'Real-time data visualization',
          impact: 'Live updates without page refresh'
        },
        {
          type: 'improvement',
          description: 'Improved mobile responsiveness',
          impact: 'Better experience on mobile devices'
        }
      ],
      tags: ['feature', 'dashboard', 'analytics', 'ui'],
      breaking: false,
      affectedUsers: 8473,
      githubIssue: '#1236'
    },
    {
      id: 'CHG-2850',
      version: 'v2.3.0',
      title: 'API v2 Release',
      description: 'New API version with breaking changes',
      type: 'breaking',
      status: 'published',
      priority: 'critical',
      publishedAt: '2024-01-01',
      author: 'API Team',
      changes: [
        {
          type: 'breaking',
          description: 'Changed authentication flow',
          impact: 'API clients need to update auth implementation'
        },
        {
          type: 'breaking',
          description: 'Removed deprecated endpoints',
          impact: 'Old endpoints no longer available'
        },
        {
          type: 'feature',
          description: 'Added GraphQL support',
          impact: 'More flexible data querying'
        }
      ],
      tags: ['api', 'breaking', 'v2', 'graphql'],
      breaking: true,
      affectedUsers: 2847,
      githubIssue: '#1237'
    },
    {
      id: 'CHG-2851',
      version: 'v2.2.5',
      title: 'Bug Fixes and Minor Improvements',
      description: 'Various bug fixes and small enhancements',
      type: 'bugfix',
      status: 'published',
      priority: 'medium',
      publishedAt: '2023-12-28',
      author: 'Engineering Team',
      changes: [
        {
          type: 'bugfix',
          description: 'Fixed date picker timezone issue',
          impact: 'Correct date display for all timezones'
        },
        {
          type: 'bugfix',
          description: 'Resolved file upload error',
          impact: 'Files now upload correctly'
        },
        {
          type: 'improvement',
          description: 'Enhanced error messages',
          impact: 'Better user feedback on errors'
        }
      ],
      tags: ['bugfix', 'maintenance'],
      breaking: false,
      affectedUsers: 4567,
      githubIssue: '#1238'
    },
    {
      id: 'CHG-2852',
      version: 'v2.2.0',
      title: 'Deprecation Notice',
      description: 'Old features marked for removal',
      type: 'deprecation',
      status: 'published',
      priority: 'medium',
      publishedAt: '2023-12-20',
      author: 'Product Team',
      changes: [
        {
          type: 'deprecation',
          description: 'Legacy UI components deprecated',
          impact: 'Will be removed in v3.0'
        },
        {
          type: 'deprecation',
          description: 'Old export format deprecated',
          impact: 'Use new format going forward'
        },
        {
          type: 'feature',
          description: 'Migration guide published',
          impact: 'Easier transition to new features'
        }
      ],
      tags: ['deprecation', 'migration'],
      breaking: false,
      affectedUsers: 1234,
      githubIssue: '#1239'
    },
    {
      id: 'CHG-2853',
      version: 'v3.0.0',
      title: 'Next Major Release',
      description: 'Complete platform redesign and modernization',
      type: 'feature',
      status: 'draft',
      priority: 'high',
      publishedAt: '2024-03-01',
      author: 'Product Team',
      changes: [
        {
          type: 'feature',
          description: 'Complete UI/UX redesign',
          impact: 'Modern, intuitive interface'
        },
        {
          type: 'breaking',
          description: 'New data model',
          impact: 'Migration required for existing data'
        },
        {
          type: 'feature',
          description: 'AI-powered features',
          impact: 'Smart suggestions and automation'
        }
      ],
      tags: ['major', 'redesign', 'ai', 'v3'],
      breaking: true,
      affectedUsers: 0,
      githubIssue: '#1240'
    }
  ]

  const filteredEntries = entries.filter(entry => {
    if (viewMode !== 'all' && entry.status !== viewMode) return false
    if (typeFilter !== 'all' && entry.type !== typeFilter) return false
    return true
  })

  const totalEntries = entries.length
  const publishedEntries = entries.filter(e => e.status === 'published').length
  const breakingChanges = entries.filter(e => e.breaking).length
  const totalAffected = entries.reduce((sum, e) => sum + e.affectedUsers, 0)

  const getStatusColor = (status: ChangeStatus) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-50'
      case 'draft': return 'text-gray-600 bg-gray-50'
      case 'scheduled': return 'text-blue-600 bg-blue-50'
      case 'archived': return 'text-slate-600 bg-slate-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTypeColor = (type: ChangeType) => {
    switch (type) {
      case 'feature': return 'text-green-600 bg-green-50'
      case 'bugfix': return 'text-red-600 bg-red-50'
      case 'improvement': return 'text-blue-600 bg-blue-50'
      case 'security': return 'text-orange-600 bg-orange-50'
      case 'breaking': return 'text-purple-600 bg-purple-50'
      case 'deprecation': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTypeIcon = (type: ChangeType) => {
    switch (type) {
      case 'feature': return <Plus className="w-4 h-4" />
      case 'bugfix': return <Bug className="w-4 h-4" />
      case 'improvement': return <Zap className="w-4 h-4" />
      case 'security': return <Shield className="w-4 h-4" />
      case 'breaking': return <XCircle className="w-4 h-4" />
      case 'deprecation': return <Clock className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-900 via-purple-800 to-pink-900 bg-clip-text text-transparent mb-2">
            Changelog
          </h1>
          <p className="text-slate-600">Track product updates, releases, and version history</p>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Releases',
              value: totalEntries.toString(),
              icon: Rocket,
              trend: { value: 15, isPositive: true },
              color: 'indigo'
            },
            {
              label: 'Published',
              value: publishedEntries.toString(),
              icon: CheckCircle2,
              trend: { value: 12, isPositive: true },
              color: 'green'
            },
            {
              label: 'Breaking Changes',
              value: breakingChanges.toString(),
              icon: XCircle,
              trend: { value: 2, isPositive: false },
              color: 'purple'
            },
            {
              label: 'Users Affected',
              value: totalAffected.toLocaleString(),
              icon: Users,
              trend: { value: 8, isPositive: true },
              color: 'pink'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            {
              title: 'New Entry',
              description: 'Add changelog',
              icon: Plus,
              gradient: 'from-indigo-500 to-purple-600',
              onClick: () => console.log('New entry')
            },
            {
              title: 'View Published',
              description: 'Live changes',
              icon: Eye,
              gradient: 'from-green-500 to-emerald-600',
              onClick: () => console.log('Published')
            },
            {
              title: 'Export',
              description: 'Download logs',
              icon: Download,
              gradient: 'from-blue-500 to-cyan-600',
              onClick: () => console.log('Export')
            },
            {
              title: 'Analytics',
              description: 'Impact metrics',
              icon: BarChart3,
              gradient: 'from-purple-500 to-pink-600',
              onClick: () => console.log('Analytics')
            },
            {
              title: 'Releases',
              description: 'Version history',
              icon: GitBranch,
              gradient: 'from-orange-500 to-red-600',
              onClick: () => console.log('Releases')
            },
            {
              title: 'Tags',
              description: 'Manage labels',
              icon: Tag,
              gradient: 'from-cyan-500 to-blue-600',
              onClick: () => console.log('Tags')
            },
            {
              title: 'Settings',
              description: 'Configure logs',
              icon: Settings,
              gradient: 'from-slate-500 to-gray-600',
              onClick: () => console.log('Settings')
            },
            {
              title: 'Search',
              description: 'Find changes',
              icon: Search,
              gradient: 'from-pink-500 to-rose-600',
              onClick: () => console.log('Search')
            }
          ]}
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            <PillButton
              label="All Entries"
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
              label="Features"
              isActive={typeFilter === 'feature'}
              onClick={() => setTypeFilter('feature')}
            />
            <PillButton
              label="Bug Fixes"
              isActive={typeFilter === 'bugfix'}
              onClick={() => setTypeFilter('bugfix')}
            />
            <PillButton
              label="Security"
              isActive={typeFilter === 'security'}
              onClick={() => setTypeFilter('security')}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Changelog Entries List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getTypeIcon(entry.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-slate-900">{entry.version}</h3>
                        <span className="text-sm text-slate-600">{entry.title}</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-1">{entry.description}</p>
                      <p className="text-xs text-slate-500">Changelog ID: {entry.id}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                      {entry.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(entry.type)}`}>
                      {entry.type}
                    </span>
                  </div>
                </div>

                {entry.breaking && (
                  <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">Breaking Changes</span>
                    </div>
                    <p className="text-xs text-purple-700 mt-1">
                      This release contains breaking changes that may require migration
                    </p>
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Changes</p>
                  <div className="space-y-2">
                    {entry.changes.map((change, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        {getTypeIcon(change.type)}
                        <div className="flex-1">
                          <p className="text-sm text-slate-900">{change.description}</p>
                          <p className="text-xs text-slate-500">{change.impact}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Published</p>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span className="text-sm text-slate-700">{entry.publishedAt}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Author</p>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">{entry.author}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Users Affected</p>
                    <span className="text-sm font-medium text-slate-900">
                      {entry.affectedUsers.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-indigo-600 hover:to-purple-700 transition-all">
                    View Full Details
                  </button>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                    Edit
                  </button>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Published Releases */}
            <MiniKPI
              label="Published Releases"
              value={publishedEntries.toString()}
              icon={Rocket}
              trend={{ value: 12, isPositive: true }}
              className="bg-gradient-to-br from-indigo-500 to-purple-600"
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Releases"
              activities={[
                {
                  id: '1',
                  title: 'v2.5.0 published',
                  description: 'Performance improvements',
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
                  description: 'New dashboard',
                  timestamp: '15 days ago',
                  type: 'success'
                },
                {
                  id: '4',
                  title: 'v3.0.0 drafted',
                  description: 'Major redesign',
                  timestamp: '2 days ago',
                  type: 'info'
                }
              ]}
            />

            {/* Change Types */}
            <RankingList
              title="Change Distribution"
              items={[
                { label: 'Features', value: '35%', rank: 1 },
                { label: 'Bug Fixes', value: '28%', rank: 2 },
                { label: 'Improvements', value: '20%', rank: 3 },
                { label: 'Security', value: '12%', rank: 4 },
                { label: 'Breaking', value: '5%', rank: 5 }
              ]}
            />

            {/* Release Frequency */}
            <ProgressCard
              title="Release Frequency"
              progress={85}
              subtitle="On track for Q1 goals"
              color="indigo"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
