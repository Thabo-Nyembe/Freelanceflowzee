'use client'
import { useState, useMemo } from 'react'
import { useChangelog, type Changelog, type ChangeType, type ReleaseStatus } from '@/lib/hooks/use-changelog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

// Headway / Beamer / LaunchNotes level interfaces
interface Release {
  id: string
  version: string
  title: string
  description: string
  releaseDate: string
  status: 'draft' | 'scheduled' | 'published' | 'archived'
  category: 'major' | 'minor' | 'patch' | 'hotfix'
  changes: ChangeItem[]
  author: { name: string; avatar: string }
  viewCount: number
  reactionCount: number
  commentCount: number
  isFeatured: boolean
  publishedAt?: string
  scheduledFor?: string
  tags: string[]
}

interface ChangeItem {
  id: string
  type: 'feature' | 'improvement' | 'fix' | 'deprecation' | 'security' | 'performance'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  isBreaking: boolean
  affectedAreas: string[]
  relatedLinks: { title: string; url: string }[]
}

interface Reaction {
  emoji: string
  count: number
  hasReacted: boolean
}

interface ChangelogStats {
  totalReleases: number
  publishedThisMonth: number
  totalViews: number
  engagementRate: number
  subscriberCount: number
}

interface Subscriber {
  id: string
  email: string
  subscribedAt: string
  preferences: string[]
}

// Mock data for Headway/Beamer level features
const mockReleases: Release[] = [
  {
    id: 'rel-1',
    version: '2.5.0',
    title: 'AI-Powered Workflow Automation',
    description: 'Introducing intelligent automation features that help you work smarter. Our new AI engine analyzes your patterns and suggests optimizations.',
    releaseDate: '2024-12-20',
    status: 'published',
    category: 'major',
    changes: [
      { id: 'c1', type: 'feature', title: 'AI Workflow Suggestions', description: 'Get intelligent recommendations based on your work patterns', impact: 'high', isBreaking: false, affectedAreas: ['Dashboard', 'Workflows'], relatedLinks: [{ title: 'Documentation', url: '#' }] },
      { id: 'c2', type: 'feature', title: 'Smart Task Prioritization', description: 'AI automatically prioritizes tasks based on deadlines and dependencies', impact: 'high', isBreaking: false, affectedAreas: ['Tasks', 'Projects'], relatedLinks: [] },
      { id: 'c3', type: 'improvement', title: 'Enhanced Dashboard Performance', description: '40% faster load times with optimized data fetching', impact: 'medium', isBreaking: false, affectedAreas: ['Dashboard'], relatedLinks: [] },
      { id: 'c4', type: 'fix', title: 'Calendar Sync Issue', description: 'Fixed issue where calendar events would sometimes duplicate', impact: 'low', isBreaking: false, affectedAreas: ['Calendar'], relatedLinks: [] }
    ],
    author: { name: 'Sarah Chen', avatar: 'SC' },
    viewCount: 2450,
    reactionCount: 189,
    commentCount: 34,
    isFeatured: true,
    publishedAt: '2024-12-20T10:00:00Z',
    tags: ['AI', 'Automation', 'Productivity']
  },
  {
    id: 'rel-2',
    version: '2.4.2',
    title: 'Security Enhancements & Bug Fixes',
    description: 'Important security updates and various bug fixes to improve stability.',
    releaseDate: '2024-12-15',
    status: 'published',
    category: 'patch',
    changes: [
      { id: 'c5', type: 'security', title: 'Enhanced Authentication', description: 'Added support for hardware security keys (FIDO2/WebAuthn)', impact: 'high', isBreaking: false, affectedAreas: ['Authentication', 'Security'], relatedLinks: [{ title: 'Security Guide', url: '#' }] },
      { id: 'c6', type: 'fix', title: 'Session Timeout Fix', description: 'Resolved issue where sessions would expire prematurely', impact: 'medium', isBreaking: false, affectedAreas: ['Authentication'], relatedLinks: [] },
      { id: 'c7', type: 'performance', title: 'Database Query Optimization', description: 'Improved query performance for large datasets', impact: 'medium', isBreaking: false, affectedAreas: ['API', 'Database'], relatedLinks: [] }
    ],
    author: { name: 'David Kim', avatar: 'DK' },
    viewCount: 1820,
    reactionCount: 95,
    commentCount: 12,
    isFeatured: false,
    publishedAt: '2024-12-15T14:30:00Z',
    tags: ['Security', 'Bug Fixes']
  },
  {
    id: 'rel-3',
    version: '2.4.1',
    title: 'Team Collaboration Improvements',
    description: 'Enhanced real-time collaboration features for better teamwork.',
    releaseDate: '2024-12-10',
    status: 'published',
    category: 'minor',
    changes: [
      { id: 'c8', type: 'feature', title: 'Real-time Presence Indicators', description: 'See who else is viewing or editing the same content', impact: 'high', isBreaking: false, affectedAreas: ['Documents', 'Projects'], relatedLinks: [] },
      { id: 'c9', type: 'improvement', title: 'Comment Threading', description: 'Comments now support nested replies for better discussions', impact: 'medium', isBreaking: false, affectedAreas: ['Comments', 'Documents'], relatedLinks: [] },
      { id: 'c10', type: 'feature', title: '@mentions in Comments', description: 'Mention team members to notify them directly', impact: 'medium', isBreaking: false, affectedAreas: ['Comments', 'Notifications'], relatedLinks: [] }
    ],
    author: { name: 'Emily Rodriguez', avatar: 'ER' },
    viewCount: 1560,
    reactionCount: 78,
    commentCount: 23,
    isFeatured: false,
    publishedAt: '2024-12-10T09:00:00Z',
    tags: ['Collaboration', 'Teams']
  },
  {
    id: 'rel-4',
    version: '2.6.0',
    title: 'Advanced Reporting Suite',
    description: 'Comprehensive reporting and analytics tools for data-driven decisions.',
    releaseDate: '2025-01-05',
    status: 'scheduled',
    category: 'major',
    changes: [
      { id: 'c11', type: 'feature', title: 'Custom Report Builder', description: 'Create custom reports with drag-and-drop interface', impact: 'high', isBreaking: false, affectedAreas: ['Reports', 'Analytics'], relatedLinks: [] },
      { id: 'c12', type: 'feature', title: 'Scheduled Report Delivery', description: 'Automatically send reports via email on a schedule', impact: 'high', isBreaking: false, affectedAreas: ['Reports', 'Email'], relatedLinks: [] },
      { id: 'c13', type: 'deprecation', title: 'Legacy Reports V1 Sunset', description: 'Old reporting system will be removed. Migrate to new reports.', impact: 'high', isBreaking: true, affectedAreas: ['Reports'], relatedLinks: [{ title: 'Migration Guide', url: '#' }] }
    ],
    author: { name: 'Marcus Johnson', avatar: 'MJ' },
    viewCount: 0,
    reactionCount: 0,
    commentCount: 0,
    isFeatured: true,
    scheduledFor: '2025-01-05T10:00:00Z',
    tags: ['Reports', 'Analytics', 'Enterprise']
  },
  {
    id: 'rel-5',
    version: '2.4.0',
    title: 'Mobile App Launch',
    description: 'Native mobile apps for iOS and Android are now available.',
    releaseDate: '2024-12-01',
    status: 'published',
    category: 'major',
    changes: [
      { id: 'c14', type: 'feature', title: 'iOS App', description: 'Full-featured native iOS application', impact: 'high', isBreaking: false, affectedAreas: ['Mobile'], relatedLinks: [{ title: 'App Store', url: '#' }] },
      { id: 'c15', type: 'feature', title: 'Android App', description: 'Full-featured native Android application', impact: 'high', isBreaking: false, affectedAreas: ['Mobile'], relatedLinks: [{ title: 'Play Store', url: '#' }] },
      { id: 'c16', type: 'feature', title: 'Push Notifications', description: 'Stay updated with real-time push notifications', impact: 'medium', isBreaking: false, affectedAreas: ['Mobile', 'Notifications'], relatedLinks: [] },
      { id: 'c17', type: 'feature', title: 'Offline Mode', description: 'Work without internet and sync when back online', impact: 'high', isBreaking: false, affectedAreas: ['Mobile'], relatedLinks: [] }
    ],
    author: { name: 'Lisa Thompson', avatar: 'LT' },
    viewCount: 5840,
    reactionCount: 342,
    commentCount: 89,
    isFeatured: true,
    publishedAt: '2024-12-01T12:00:00Z',
    tags: ['Mobile', 'iOS', 'Android']
  }
]

const mockStats: ChangelogStats = {
  totalReleases: 45,
  publishedThisMonth: 4,
  totalViews: 28540,
  engagementRate: 12.5,
  subscriberCount: 1250
}

const mockReactions: Reaction[] = [
  { emoji: '🎉', count: 89, hasReacted: false },
  { emoji: '❤️', count: 54, hasReacted: true },
  { emoji: '🚀', count: 32, hasReacted: false },
  { emoji: '👏', count: 14, hasReacted: false }
]

export default function ChangelogClient({ initialChangelog }: { initialChangelog: Changelog[] }) {
  const [activeTab, setActiveTab] = useState('timeline')
  const [changeTypeFilter, setChangeTypeFilter] = useState<ChangeType | 'all'>('all')
  const [releaseStatusFilter, setReleaseStatusFilter] = useState<ReleaseStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const { changelog, loading, error } = useChangelog({ changeType: changeTypeFilter, releaseStatus: releaseStatusFilter })
  const displayChangelog = changelog.length > 0 ? changelog : initialChangelog

  // Calculate stats
  const stats = useMemo(() => {
    const published = mockReleases.filter(r => r.status === 'published')
    const thisMonth = published.filter(r => {
      const date = new Date(r.releaseDate)
      const now = new Date()
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    })
    return {
      total: mockReleases.length,
      published: published.length,
      scheduled: mockReleases.filter(r => r.status === 'scheduled').length,
      draft: mockReleases.filter(r => r.status === 'draft').length,
      thisMonth: thisMonth.length,
      totalViews: mockReleases.reduce((sum, r) => sum + r.viewCount, 0),
      totalReactions: mockReleases.reduce((sum, r) => sum + r.reactionCount, 0),
      features: mockReleases.reduce((sum, r) => sum + r.changes.filter(c => c.type === 'feature').length, 0),
      fixes: mockReleases.reduce((sum, r) => sum + r.changes.filter(c => c.type === 'fix').length, 0)
    }
  }, [])

  // Filter releases
  const filteredReleases = useMemo(() => {
    return mockReleases.filter(release => {
      if (categoryFilter !== 'all' && release.category !== categoryFilter) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return release.title.toLowerCase().includes(query) ||
               release.description.toLowerCase().includes(query) ||
               release.changes.some(c => c.title.toLowerCase().includes(query))
      }
      return true
    })
  }, [categoryFilter, searchQuery])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature': return '✨'
      case 'improvement': return '⚡'
      case 'fix': return '🐛'
      case 'security': return '🔒'
      case 'performance': return '🚀'
      case 'deprecation': return '⚠️'
      default: return '📝'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
      case 'improvement': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
      case 'fix': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
      case 'security': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
      case 'performance': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400'
      case 'deprecation': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'major': return 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400 border-violet-200 dark:border-violet-800'
      case 'minor': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-800'
      case 'patch': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
      case 'hotfix': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="px-3 py-1 bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-xs font-medium rounded-full">Headway Level</span>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">Beamer Style</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">What's New</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Stay updated with our latest features, improvements, and fixes</p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-violet-600">{stats.total}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Releases</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Published</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalViews.toLocaleString()}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Views</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-emerald-600">{stats.features}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">New Features</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.fixes}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Bug Fixes</div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
              <TabsTrigger value="timeline" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 dark:data-[state=active]:bg-violet-900/40 dark:data-[state=active]:text-violet-300">Timeline</TabsTrigger>
              <TabsTrigger value="releases" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 dark:data-[state=active]:bg-violet-900/40 dark:data-[state=active]:text-violet-300">All Releases</TabsTrigger>
              <TabsTrigger value="roadmap" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 dark:data-[state=active]:bg-violet-900/40 dark:data-[state=active]:text-violet-300">Roadmap</TabsTrigger>
              <TabsTrigger value="subscribe" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 dark:data-[state=active]:bg-violet-900/40 dark:data-[state=active]:text-violet-300">Subscribe</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search updates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm w-64"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
              >
                <option value="all">All Categories</option>
                <option value="major">Major</option>
                <option value="minor">Minor</option>
                <option value="patch">Patch</option>
                <option value="hotfix">Hotfix</option>
              </select>
            </div>
          </div>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            {filteredReleases.filter(r => r.status === 'published').map((release, index) => (
              <Dialog key={release.id}>
                <DialogTrigger asChild>
                  <div className={`relative pl-8 pb-8 ${index !== filteredReleases.filter(r => r.status === 'published').length - 1 ? 'border-l-2 border-violet-200 dark:border-violet-800' : ''} ml-4 cursor-pointer`}>
                    {/* Timeline dot */}
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-violet-500 border-4 border-violet-100 dark:border-gray-900" />

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium border ${getCategoryColor(release.category)}`}>
                              v{release.version}
                            </span>
                            <span className="px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                              {release.category}
                            </span>
                            {release.isFeatured && (
                              <span className="px-2 py-1 rounded text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">
                                Featured
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{release.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{release.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{release.releaseDate}</div>
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white text-xs">
                              {release.author.avatar}
                            </div>
                            <span>{release.author.name}</span>
                          </div>
                        </div>
                      </div>

                      {/* Changes Preview */}
                      <div className="space-y-2 mb-4">
                        {release.changes.slice(0, 3).map(change => (
                          <div key={change.id} className="flex items-center gap-2 text-sm">
                            <span>{getTypeIcon(change.type)}</span>
                            <span className={`px-2 py-0.5 rounded text-xs ${getTypeColor(change.type)}`}>{change.type}</span>
                            <span className="text-gray-700 dark:text-gray-300">{change.title}</span>
                            {change.isBreaking && (
                              <span className="px-1.5 py-0.5 rounded text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400">Breaking</span>
                            )}
                          </div>
                        ))}
                        {release.changes.length > 3 && (
                          <div className="text-sm text-violet-600 dark:text-violet-400">+{release.changes.length - 3} more changes</div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>👁️ {release.viewCount.toLocaleString()} views</span>
                          <span>❤️ {release.reactionCount} reactions</span>
                          <span>💬 {release.commentCount} comments</span>
                        </div>
                        <div className="flex gap-1">
                          {release.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-sm font-medium border ${getCategoryColor(release.category)}`}>
                        v{release.version}
                      </span>
                      {release.title}
                    </DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="max-h-[60vh]">
                    <div className="space-y-6 p-4">
                      <p className="text-gray-600 dark:text-gray-400">{release.description}</p>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white">
                            {release.author.avatar}
                          </div>
                          <span className="text-gray-700 dark:text-gray-300">{release.author.name}</span>
                        </div>
                        <span className="text-gray-500 dark:text-gray-400">{release.releaseDate}</span>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Changes in this release</h4>
                        <div className="space-y-4">
                          {release.changes.map(change => (
                            <div key={change.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">{getTypeIcon(change.type)}</span>
                                <span className={`px-2 py-1 rounded text-xs ${getTypeColor(change.type)}`}>{change.type}</span>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  change.impact === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                                  change.impact === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                                  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                                }`}>{change.impact} impact</span>
                                {change.isBreaking && (
                                  <span className="px-2 py-1 rounded text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400">Breaking Change</span>
                                )}
                              </div>
                              <h5 className="font-medium text-gray-900 dark:text-white">{change.title}</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{change.description}</p>
                              {change.affectedAreas.length > 0 && (
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">Affected:</span>
                                  {change.affectedAreas.map(area => (
                                    <span key={area} className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                                      {area}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {change.relatedLinks.length > 0 && (
                                <div className="flex items-center gap-2 mt-2">
                                  {change.relatedLinks.map(link => (
                                    <a key={link.url} href={link.url} className="text-sm text-violet-600 dark:text-violet-400 hover:underline">
                                      {link.title} →
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Reactions */}
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Reactions</h4>
                        <div className="flex gap-2">
                          {mockReactions.map(reaction => (
                            <button
                              key={reaction.emoji}
                              className={`px-4 py-2 rounded-lg border ${
                                reaction.hasReacted
                                  ? 'border-violet-300 bg-violet-50 dark:bg-violet-900/20 dark:border-violet-800'
                                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                            >
                              <span className="text-lg mr-2">{reaction.emoji}</span>
                              <span className="text-sm text-gray-700 dark:text-gray-300">{reaction.count}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            ))}
          </TabsContent>

          {/* All Releases Tab */}
          <TabsContent value="releases" className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-300">Version</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-300">Title</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-300">Category</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-300">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-300">Date</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-300">Engagement</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReleases.map(release => (
                    <tr key={release.id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getCategoryColor(release.category)}`}>
                          v{release.version}
                        </span>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{release.title}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{release.changes.length} changes</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="capitalize text-sm text-gray-700 dark:text-gray-300">{release.category}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          release.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
                          release.status === 'scheduled' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' :
                          release.status === 'draft' ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' :
                          'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                        }`}>{release.status}</span>
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{release.releaseDate}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                          <span>👁️ {release.viewCount}</span>
                          <span>❤️ {release.reactionCount}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Roadmap Tab */}
          <TabsContent value="roadmap" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Upcoming Releases</h3>

              <div className="space-y-4">
                {mockReleases.filter(r => r.status === 'scheduled').map(release => (
                  <div key={release.id} className="p-4 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getCategoryColor(release.category)}`}>
                            v{release.version}
                          </span>
                          <span className="px-2 py-1 rounded text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400">
                            Scheduled
                          </span>
                          {release.isFeatured && (
                            <span className="px-2 py-1 rounded text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">
                              Featured
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{release.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{release.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-blue-700 dark:text-blue-400">
                          {release.scheduledFor ? new Date(release.scheduledFor).toLocaleDateString() : release.releaseDate}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {release.changes.length} changes planned
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {release.changes.map(change => (
                        <span key={change.id} className="px-2 py-1 rounded text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                          {getTypeIcon(change.type)} {change.title}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Request a Feature</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Have an idea for a new feature? We'd love to hear from you!
                </p>
                <button className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 transition-colors">
                  Submit Feature Request
                </button>
              </div>
            </div>
          </TabsContent>

          {/* Subscribe Tab */}
          <TabsContent value="subscribe" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
              <div className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📬</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Stay in the Loop</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Get notified about new features, improvements, and important updates. Join {mockStats.subscriberCount.toLocaleString()} subscribers.
              </p>

              <div className="flex justify-center gap-3 max-w-md mx-auto mb-8">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700"
                />
                <button className="px-6 py-3 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors">
                  Subscribe
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-violet-600">{mockStats.subscriberCount.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Subscribers</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{mockStats.publishedThisMonth}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">This Month</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{mockStats.engagementRate}%</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Open Rate</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {['Major Releases', 'Minor Updates', 'Security Patches', 'Bug Fixes'].map(pref => (
                  <label key={pref} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                    <span className="text-gray-700 dark:text-gray-300">{pref}</span>
                    <div className="w-10 h-6 bg-violet-600 rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-violet-600 border-r-transparent" />
          </div>
        )}
      </div>
    </div>
  )
}
