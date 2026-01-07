'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { useReleaseNotes, ReleaseNote, ReleaseNotesStats } from '@/lib/hooks/use-release-notes'
import { createReleaseNote, deleteReleaseNote, publishReleaseNote, archiveReleaseNote, likeReleaseNote, updateReleaseNote, ReleaseNoteInput } from '@/app/actions/release-notes'
import { Rocket, Calendar, Flag, GitBranch, Download, Eye, Heart, MessageSquare, Bell, BellOff, Share2, Code, Smartphone, Monitor, Globe, CheckCircle, AlertCircle, Zap, TrendingUp, Settings, Search, Plus, Sparkles, Star, FileText, History, Target, Layers, Key, Webhook, Database, Trash2, Lock, Mail, Link2, RefreshCw, Palette, Copy, AlertOctagon, Edit2 } from 'lucide-react'

// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'

// ProductBoard/LaunchDarkly Level Types
interface Release {
  id: string
  version: string
  title: string
  description: string
  fullChangelog: string
  releaseType: 'major' | 'minor' | 'patch' | 'hotfix' | 'beta' | 'alpha'
  status: 'published' | 'draft' | 'scheduled' | 'archived' | 'rolling-out'
  platforms: Platform[]
  releaseDate: string
  scheduledDate?: string
  author: Author
  highlights: string[]
  features: ChangeItem[]
  improvements: ChangeItem[]
  bugFixes: ChangeItem[]
  breakingChanges: ChangeItem[]
  deprecations: ChangeItem[]
  knownIssues: string[]
  migrationGuide?: string
  rolloutPercentage: number
  downloadUrl?: string
  metrics: ReleaseMetrics
  tags: string[]
  relatedReleases: string[]
  featureFlags: FeatureFlag[]
}

interface Platform {
  id: string
  name: string
  icon: 'ios' | 'android' | 'web' | 'desktop' | 'api'
  version: string
  minVersion?: string
  status: 'available' | 'coming-soon' | 'deprecated'
}

interface Author {
  id: string
  name: string
  avatar: string
  role: string
}

interface ChangeItem {
  id: string
  title: string
  description?: string
  ticketId?: string
  category?: string
  impact?: 'high' | 'medium' | 'low'
}

interface ReleaseMetrics {
  downloads: number
  views: number
  likes: number
  comments: number
  adoptionRate: number
  feedbackScore: number
  issuesReported: number
}

interface FeatureFlag {
  id: string
  name: string
  key: string
  enabled: boolean
  rolloutPercentage: number
  platforms: string[]
  description: string
}

interface RoadmapItem {
  id: string
  title: string
  description: string
  quarter: string
  status: 'planned' | 'in-progress' | 'completed' | 'delayed'
  category: string
  votes: number
}

// Subscription interface for future use
interface _Subscription {
  id: string
  releaseTypes: string[]
  platforms: string[]
  email: boolean
  push: boolean
  slack: boolean
}

interface ReleaseNotesClientProps {
  initialReleases: ReleaseNote[]
  initialStats: ReleaseNotesStats
}

// Mock Data - ProductBoard Level
const mockAuthors: Author[] = [
  { id: 'a-1', name: 'Sarah Chen', avatar: 'SC', role: 'Product Manager' },
  { id: 'a-2', name: 'Alex Rivera', avatar: 'AR', role: 'Engineering Lead' },
  { id: 'a-3', name: 'Marcus Johnson', avatar: 'MJ', role: 'Release Manager' },
]

const mockReleases: Release[] = [
  {
    id: 'rel-1',
    version: 'v3.0.0',
    title: 'The AI Revolution Update',
    description: 'Introducing AI-powered features across the entire platform with enhanced automation and smart insights.',
    fullChangelog: '## What\'s New\n\nThis major release brings AI capabilities to every aspect of the platform...',
    releaseType: 'major',
    status: 'published',
    platforms: [
      { id: 'p-1', name: 'iOS', icon: 'ios', version: '3.0.0', minVersion: '14.0', status: 'available' },
      { id: 'p-2', name: 'Android', icon: 'android', version: '3.0.0', minVersion: '10', status: 'available' },
      { id: 'p-3', name: 'Web', icon: 'web', version: '3.0.0', status: 'available' },
      { id: 'p-4', name: 'Desktop', icon: 'desktop', version: '3.0.0', status: 'available' },
    ],
    releaseDate: '2024-01-20',
    author: mockAuthors[0],
    highlights: [
      'AI-powered smart suggestions across all workflows',
      'New dashboard with real-time analytics',
      'Enhanced collaboration features with live cursors',
      '50% performance improvement on large datasets'
    ],
    features: [
      { id: 'f-1', title: 'AI Smart Suggestions', description: 'Get intelligent recommendations based on your usage patterns', ticketId: 'PROD-1234', category: 'AI', impact: 'high' },
      { id: 'f-2', title: 'Real-time Collaboration', description: 'See teammates\' cursors and edits in real-time', ticketId: 'PROD-1235', category: 'Collaboration', impact: 'high' },
      { id: 'f-3', title: 'Advanced Analytics Dashboard', description: 'New visualization options and export capabilities', ticketId: 'PROD-1236', category: 'Analytics', impact: 'medium' },
      { id: 'f-4', title: 'Custom Workflows', description: 'Build and automate your own workflows', ticketId: 'PROD-1237', category: 'Automation', impact: 'high' },
    ],
    improvements: [
      { id: 'i-1', title: 'Search Performance', description: 'Search is now 3x faster with improved relevance', impact: 'high' },
      { id: 'i-2', title: 'Mobile Navigation', description: 'Redesigned navigation for easier one-hand use', impact: 'medium' },
      { id: 'i-3', title: 'Dark Mode Enhancement', description: 'Improved contrast and readability in dark mode', impact: 'low' },
    ],
    bugFixes: [
      { id: 'b-1', title: 'Fixed login issues on Safari', ticketId: 'BUG-456' },
      { id: 'b-2', title: 'Resolved data sync delays', ticketId: 'BUG-457' },
      { id: 'b-3', title: 'Fixed notification delivery', ticketId: 'BUG-458' },
    ],
    breakingChanges: [
      { id: 'bc-1', title: 'API v1 Deprecated', description: 'Please migrate to API v2 before March 2024' },
      { id: 'bc-2', title: 'Legacy Export Format Removed', description: 'Use the new export format with enhanced options' },
    ],
    deprecations: [
      { id: 'd-1', title: 'Old Dashboard', description: 'Will be removed in v3.2.0' },
    ],
    knownIssues: [
      'Some users may experience slow initial load on first launch',
      'PDF export may have formatting issues with complex tables'
    ],
    migrationGuide: '## Migration from v2.x\n\n1. Update your API calls to use v2 endpoints\n2. Review breaking changes above\n3. Test in staging before production deployment',
    rolloutPercentage: 100,
    downloadUrl: 'https://releases.example.com/v3.0.0',
    metrics: { downloads: 125000, views: 450000, likes: 8420, comments: 1256, adoptionRate: 78, feedbackScore: 4.7, issuesReported: 45 },
    tags: ['ai', 'major-release', 'collaboration', 'performance'],
    relatedReleases: ['rel-2'],
    featureFlags: [
      { id: 'ff-1', name: 'AI Suggestions', key: 'ai_suggestions_v3', enabled: true, rolloutPercentage: 100, platforms: ['ios', 'android', 'web'], description: 'Enable AI-powered suggestions' },
      { id: 'ff-2', name: 'Live Cursors', key: 'live_cursors', enabled: true, rolloutPercentage: 85, platforms: ['web', 'desktop'], description: 'Show live cursors in documents' },
    ]
  },
  {
    id: 'rel-2',
    version: 'v2.9.5',
    title: 'Security & Performance Patch',
    description: 'Critical security updates and performance optimizations.',
    fullChangelog: '## Security Patch\n\nThis release addresses several security vulnerabilities...',
    releaseType: 'patch',
    status: 'published',
    platforms: [
      { id: 'p-1', name: 'iOS', icon: 'ios', version: '2.9.5', status: 'available' },
      { id: 'p-2', name: 'Android', icon: 'android', version: '2.9.5', status: 'available' },
      { id: 'p-3', name: 'Web', icon: 'web', version: '2.9.5', status: 'available' },
    ],
    releaseDate: '2024-01-15',
    author: mockAuthors[1],
    highlights: ['Critical security patches', 'Memory leak fixes', 'Improved error handling'],
    features: [],
    improvements: [
      { id: 'i-1', title: 'Memory Management', description: 'Fixed memory leaks in long-running sessions', impact: 'high' },
    ],
    bugFixes: [
      { id: 'b-1', title: 'Fixed XSS vulnerability in comments', ticketId: 'SEC-101' },
      { id: 'b-2', title: 'Patched CSRF vulnerability', ticketId: 'SEC-102' },
      { id: 'b-3', title: 'Fixed session hijacking issue', ticketId: 'SEC-103' },
    ],
    breakingChanges: [],
    deprecations: [],
    knownIssues: [],
    rolloutPercentage: 100,
    metrics: { downloads: 98000, views: 156000, likes: 2100, comments: 342, adoptionRate: 95, feedbackScore: 4.2, issuesReported: 12 },
    tags: ['security', 'patch', 'hotfix'],
    relatedReleases: ['rel-1'],
    featureFlags: []
  },
  {
    id: 'rel-3',
    version: 'v3.1.0',
    title: 'Team Collaboration Suite',
    description: 'Enhanced team features with new workspace management and permissions.',
    fullChangelog: '## Collaboration Update\n\nNew features for team productivity...',
    releaseType: 'minor',
    status: 'rolling-out',
    platforms: [
      { id: 'p-1', name: 'iOS', icon: 'ios', version: '3.1.0', status: 'available' },
      { id: 'p-2', name: 'Android', icon: 'android', version: '3.1.0', status: 'coming-soon' },
      { id: 'p-3', name: 'Web', icon: 'web', version: '3.1.0', status: 'available' },
    ],
    releaseDate: '2024-01-22',
    scheduledDate: '2024-01-25',
    author: mockAuthors[2],
    highlights: ['Team workspaces', 'Advanced permissions', 'Activity timeline'],
    features: [
      { id: 'f-1', title: 'Team Workspaces', description: 'Create dedicated spaces for your team', category: 'Collaboration', impact: 'high' },
      { id: 'f-2', title: 'Role-based Permissions', description: 'Fine-grained access control', category: 'Security', impact: 'high' },
      { id: 'f-3', title: 'Activity Timeline', description: 'See all team activity in one place', category: 'Productivity', impact: 'medium' },
    ],
    improvements: [],
    bugFixes: [],
    breakingChanges: [],
    deprecations: [],
    knownIssues: [],
    rolloutPercentage: 45,
    metrics: { downloads: 23000, views: 67000, likes: 890, comments: 156, adoptionRate: 45, feedbackScore: 4.5, issuesReported: 8 },
    tags: ['collaboration', 'teams', 'permissions'],
    relatedReleases: ['rel-1'],
    featureFlags: [
      { id: 'ff-1', name: 'Team Workspaces', key: 'team_workspaces_v1', enabled: true, rolloutPercentage: 45, platforms: ['ios', 'web'], description: 'Enable team workspace feature' },
    ]
  },
  {
    id: 'rel-4',
    version: 'v3.2.0-beta',
    title: 'Mobile Experience Overhaul',
    description: 'Complete redesign of the mobile experience with new gestures and offline mode.',
    fullChangelog: '## Beta Release\n\nTesting the new mobile experience...',
    releaseType: 'beta',
    status: 'draft',
    platforms: [
      { id: 'p-1', name: 'iOS', icon: 'ios', version: '3.2.0-beta', status: 'available' },
      { id: 'p-2', name: 'Android', icon: 'android', version: '3.2.0-beta', status: 'available' },
    ],
    releaseDate: '',
    scheduledDate: '2024-02-01',
    author: mockAuthors[0],
    highlights: ['New gesture navigation', 'Offline mode', 'Battery optimization'],
    features: [
      { id: 'f-1', title: 'Gesture Navigation', description: 'Swipe gestures for common actions', category: 'UX', impact: 'high' },
      { id: 'f-2', title: 'Offline Mode', description: 'Work without internet connection', category: 'Productivity', impact: 'high' },
      { id: 'f-3', title: 'Battery Saver', description: 'Reduced battery consumption by 40%', category: 'Performance', impact: 'medium' },
    ],
    improvements: [],
    bugFixes: [],
    breakingChanges: [],
    deprecations: [],
    knownIssues: ['Offline sync may take longer than expected', 'Some gestures conflict with system gestures on iOS'],
    rolloutPercentage: 0,
    metrics: { downloads: 5600, views: 12000, likes: 340, comments: 89, adoptionRate: 12, feedbackScore: 4.1, issuesReported: 34 },
    tags: ['beta', 'mobile', 'offline'],
    relatedReleases: [],
    featureFlags: []
  }
]

const mockRoadmap: RoadmapItem[] = [
  { id: 'r-1', title: 'AI Writing Assistant', description: 'AI-powered writing suggestions and grammar corrections', quarter: 'Q1 2024', status: 'in-progress', category: 'AI', votes: 1245 },
  { id: 'r-2', title: 'Advanced Integrations', description: 'Connect with 100+ third-party tools', quarter: 'Q1 2024', status: 'planned', category: 'Integrations', votes: 890 },
  { id: 'r-3', title: 'Custom Themes', description: 'Create and share custom themes', quarter: 'Q2 2024', status: 'planned', category: 'Customization', votes: 567 },
  { id: 'r-4', title: 'Video Conferencing', description: 'Built-in video calls and screen sharing', quarter: 'Q2 2024', status: 'planned', category: 'Collaboration', votes: 2341 },
  { id: 'r-5', title: 'Enterprise SSO', description: 'SAML and OIDC support for enterprise', quarter: 'Q1 2024', status: 'completed', category: 'Security', votes: 456 },
]

const platformIcons: Record<string, React.ReactNode> = {
  ios: <Smartphone className="w-4 h-4" />,
  android: <Smartphone className="w-4 h-4" />,
  web: <Globe className="w-4 h-4" />,
  desktop: <Monitor className="w-4 h-4" />,
  api: <Code className="w-4 h-4" />,
}

// Enhanced Release Notes Mock Data
const mockReleaseNotesAIInsights = [
  { id: '1', type: 'success' as const, title: 'User Engagement', description: 'Release v2.5 had 45% more views than average. Great reception!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Analytics' },
  { id: '2', type: 'info' as const, title: 'Upcoming Release', description: 'v2.6 scheduled for next week. 12 features ready for announcement.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Planning' },
  { id: '3', type: 'warning' as const, title: 'Feedback Pending', description: '8 user comments awaiting response on recent releases.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Engagement' },
]

const mockReleaseNotesCollaborators = [
  { id: '1', name: 'Product Manager', avatar: '/avatars/pm.jpg', status: 'online' as const, role: 'Releases', lastActive: 'Now' },
  { id: '2', name: 'Tech Writer', avatar: '/avatars/writer.jpg', status: 'online' as const, role: 'Documentation', lastActive: '5m ago' },
  { id: '3', name: 'Marketing', avatar: '/avatars/marketing.jpg', status: 'away' as const, role: 'Communications', lastActive: '30m ago' },
]

const mockReleaseNotesPredictions = [
  { id: '1', label: 'Monthly Releases', current: 4, target: 4, predicted: 4, confidence: 95, trend: 'up' as const },
  { id: '2', label: 'User Views', current: 12500, target: 15000, predicted: 14000, confidence: 82, trend: 'up' as const },
  { id: '3', label: 'Engagement Rate', current: 34, target: 40, predicted: 38, confidence: 78, trend: 'up' as const },
]

const mockReleaseNotesActivities = [
  { id: '1', user: 'Product Manager', action: 'published', target: 'Release v2.5.1', timestamp: '2h ago', type: 'success' as const },
  { id: '2', user: 'Tech Writer', action: 'drafted', target: 'v2.6 release notes', timestamp: '4h ago', type: 'info' as const },
  { id: '3', user: 'Marketing', action: 'scheduled', target: 'email announcement', timestamp: '1d ago', type: 'info' as const },
]

const mockReleaseNotesQuickActions = [
  { id: '1', label: 'New Release', icon: 'Rocket', shortcut: 'N', action: () => toast.promise(new Promise(resolve => setTimeout(resolve, 1000)), { loading: 'Creating new release...', success: 'New release created successfully', error: 'Failed to create release' }) },
  { id: '2', label: 'Schedule', icon: 'Calendar', shortcut: 'S', action: () => toast.promise(new Promise(resolve => setTimeout(resolve, 800)), { loading: 'Opening scheduler...', success: 'Release scheduler opened', error: 'Failed to open scheduler' }) },
  { id: '3', label: 'Preview', icon: 'Eye', shortcut: 'P', action: () => toast.promise(new Promise(resolve => setTimeout(resolve, 600)), { loading: 'Loading preview...', success: 'Release preview ready', error: 'Failed to load preview' }) },
  { id: '4', label: 'Analytics', icon: 'BarChart3', shortcut: 'A', action: () => toast.promise(new Promise(resolve => setTimeout(resolve, 700)), { loading: 'Loading analytics...', success: 'Release analytics loaded', error: 'Failed to load analytics' }) },
]

// Default form state for creating/editing release notes
const defaultFormState: ReleaseNoteInput = {
  version: '',
  title: '',
  description: '',
  status: 'draft',
  release_type: 'minor',
  platform: 'all',
  author: '',
  highlights: [],
  features: [],
  improvements: [],
  bug_fixes: [],
  breaking_changes: [],
  tags: [],
  scheduled_at: undefined,
}

export default function ReleaseNotesClient({ initialReleases, initialStats }: ReleaseNotesClientProps) {
  const { releases, stats: _stats } = useReleaseNotes(initialReleases, initialStats)
  const [activeTab, setActiveTab] = useState('releases')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [platformFilter, setPlatformFilter] = useState<string>('all')
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [subscribed, setSubscribed] = useState(true)
  const [settingsTab, setSettingsTab] = useState('general')

  // Form state for create/edit dialog
  const [formData, setFormData] = useState<ReleaseNoteInput>(defaultFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [editingReleaseNote, setEditingReleaseNote] = useState<ReleaseNote | null>(null)
  const [highlightsInput, setHighlightsInput] = useState('')
  const [featuresInput, setFeaturesInput] = useState('')
  const [tagsInput, setTagsInput] = useState('')

  const filteredReleases = useMemo(() => {
    let filtered = [...mockReleases]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.version.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.tags.some(t => t.toLowerCase().includes(query))
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter)
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.releaseType === typeFilter)
    }

    if (platformFilter !== 'all') {
      filtered = filtered.filter(r => r.platforms.some(p => p.icon === platformFilter))
    }

    return filtered
  }, [searchQuery, statusFilter, typeFilter, platformFilter])

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'published': 'bg-green-100 text-green-700 border-green-200',
      'draft': 'bg-gray-100 text-gray-700 border-gray-200',
      'scheduled': 'bg-blue-100 text-blue-700 border-blue-200',
      'archived': 'bg-slate-100 text-slate-700 border-slate-200',
      'rolling-out': 'bg-amber-100 text-amber-700 border-amber-200',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'major': 'bg-purple-100 text-purple-700',
      'minor': 'bg-blue-100 text-blue-700',
      'patch': 'bg-green-100 text-green-700',
      'hotfix': 'bg-red-100 text-red-700',
      'beta': 'bg-orange-100 text-orange-700',
      'alpha': 'bg-pink-100 text-pink-700',
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  const getRoadmapStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'completed': 'bg-green-500',
      'in-progress': 'bg-blue-500',
      'planned': 'bg-gray-300',
      'delayed': 'bg-red-500',
    }
    return colors[status] || 'bg-gray-300'
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const ReleaseCard = ({ release }: { release: Release }) => (
    <Card
      className="hover:shadow-lg transition-all cursor-pointer border-gray-200 hover:border-orange-300"
      onClick={() => setSelectedRelease(release)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg text-white">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{release.version}</span>
                <Badge className={getTypeColor(release.releaseType)}>{release.releaseType}</Badge>
                {release.status === 'rolling-out' && (
                  <Badge className="bg-amber-100 text-amber-700">
                    {release.rolloutPercentage}% rolled out
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-gray-900">{release.title}</h3>
            </div>
          </div>
          <Badge className={getStatusColor(release.status)}>{release.status}</Badge>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{release.description}</p>

        {release.highlights.length > 0 && (
          <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
            <ul className="space-y-1">
              {release.highlights.slice(0, 2).map((h, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                  <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                  {h}
                </li>
              ))}
              {release.highlights.length > 2 && (
                <li className="text-xs text-orange-600">+{release.highlights.length - 2} more highlights</li>
              )}
            </ul>
          </div>
        )}

        <div className="flex items-center gap-4 mb-4">
          <div className="flex -space-x-1">
            {release.platforms.map(p => (
              <div
                key={p.id}
                className={`w-7 h-7 rounded-full flex items-center justify-center border-2 border-white ${
                  p.status === 'available' ? 'bg-green-100 text-green-600' :
                  p.status === 'coming-soon' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-gray-100 text-gray-400'
                }`}
                title={`${p.name}: ${p.status}`}
              >
                {platformIcons[p.icon]}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            {release.releaseDate || release.scheduledDate}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-xs border-t pt-3">
          <div>
            <div className="font-semibold text-gray-900">{formatNumber(release.metrics.downloads)}</div>
            <div className="text-gray-500">Downloads</div>
          </div>
          <div>
            <div className="font-semibold text-gray-900">{formatNumber(release.metrics.views)}</div>
            <div className="text-gray-500">Views</div>
          </div>
          <div>
            <div className="font-semibold text-gray-900">{release.metrics.adoptionRate}%</div>
            <div className="text-gray-500">Adoption</div>
          </div>
          <div>
            <div className="font-semibold text-gray-900">{release.metrics.feedbackScore}</div>
            <div className="text-gray-500">Score</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Reset form to default state
  const resetForm = () => {
    setFormData(defaultFormState)
    setEditingReleaseNote(null)
    setHighlightsInput('')
    setFeaturesInput('')
    setTagsInput('')
  }

  // Open create modal
  const handleOpenCreateModal = () => {
    resetForm()
    setShowCreateModal(true)
  }

  // Open edit modal with existing release note data
  const handleOpenEditModal = (releaseNote: ReleaseNote) => {
    setEditingReleaseNote(releaseNote)
    setFormData({
      version: releaseNote.version,
      title: releaseNote.title,
      description: releaseNote.description || '',
      status: releaseNote.status,
      release_type: releaseNote.release_type,
      platform: releaseNote.platform,
      author: releaseNote.author || '',
      highlights: releaseNote.highlights || [],
      features: releaseNote.features || [],
      improvements: releaseNote.improvements || [],
      bug_fixes: releaseNote.bug_fixes || [],
      breaking_changes: releaseNote.breaking_changes || [],
      tags: releaseNote.tags || [],
      scheduled_at: releaseNote.scheduled_at || undefined,
    })
    setHighlightsInput((releaseNote.highlights || []).join(', '))
    setFeaturesInput((releaseNote.features || []).join(', '))
    setTagsInput((releaseNote.tags || []).join(', '))
    setShowCreateModal(true)
  }

  // Create or update release note
  const handleSubmitReleaseNote = async () => {
    if (!formData.version.trim() || !formData.title.trim()) {
      toast.error('Validation Error', { description: 'Version and title are required' })
      return
    }

    setIsSubmitting(true)
    try {
      // Parse comma-separated inputs into arrays
      const releaseData: ReleaseNoteInput = {
        ...formData,
        highlights: highlightsInput.split(',').map(s => s.trim()).filter(Boolean),
        features: featuresInput.split(',').map(s => s.trim()).filter(Boolean),
        tags: tagsInput.split(',').map(s => s.trim()).filter(Boolean),
      }

      if (editingReleaseNote) {
        const result = await updateReleaseNote(editingReleaseNote.id, releaseData)
        if (result.success) {
          toast.success('Release Note Updated', { description: `${formData.version} has been updated successfully` })
          setShowCreateModal(false)
          resetForm()
        } else {
          toast.error('Update Failed', { description: result.error || 'Failed to update release note' })
        }
      } else {
        const result = await createReleaseNote(releaseData)
        if (result.success) {
          toast.success('Release Note Created', { description: `${formData.version} has been created successfully` })
          setShowCreateModal(false)
          resetForm()
        } else {
          toast.error('Creation Failed', { description: result.error || 'Failed to create release note' })
        }
      }
    } catch (error) {
      toast.error('Error', { description: 'An unexpected error occurred' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Publish a release note
  const handlePublishNote = async (noteId: string, noteVersion: string) => {
    setIsSubmitting(true)
    try {
      const result = await publishReleaseNote(noteId)
      if (result.success) {
        toast.success('Published', { description: `Release note ${noteVersion} is now live` })
      } else {
        toast.error('Publish Failed', { description: result.error || 'Failed to publish release note' })
      }
    } catch (error) {
      toast.error('Error', { description: 'An unexpected error occurred' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Archive a release note
  const handleArchiveNote = async (noteId: string, noteVersion: string) => {
    setIsSubmitting(true)
    try {
      const result = await archiveReleaseNote(noteId)
      if (result.success) {
        toast.success('Archived', { description: `Release note ${noteVersion} has been archived` })
      } else {
        toast.error('Archive Failed', { description: result.error || 'Failed to archive release note' })
      }
    } catch (error) {
      toast.error('Error', { description: 'An unexpected error occurred' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Like a release note
  const handleLikeNote = async (noteId: string) => {
    try {
      const result = await likeReleaseNote(noteId)
      if (result.success) {
        toast.success('Liked', { description: 'You liked this release note' })
      } else {
        toast.error('Like Failed', { description: result.error || 'Failed to like release note' })
      }
    } catch (error) {
      toast.error('Error', { description: 'An unexpected error occurred' })
    }
  }

  // Delete confirmation
  const handleConfirmDelete = (id: string) => {
    setDeleteTargetId(id)
    setShowDeleteConfirm(true)
  }

  // Delete a release note
  const handleDeleteNote = async () => {
    if (!deleteTargetId) return

    setIsSubmitting(true)
    try {
      const result = await deleteReleaseNote(deleteTargetId)
      if (result.success) {
        toast.success('Deleted', { description: 'Release note has been deleted' })
        setShowDeleteConfirm(false)
        setDeleteTargetId(null)
        setSelectedRelease(null)
      } else {
        toast.error('Delete Failed', { description: result.error || 'Failed to delete release note' })
      }
    } catch (error) {
      toast.error('Error', { description: 'An unexpected error occurred' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Share release note link
  const handleShareReleaseNote = (noteVersion: string) => {
    const shareUrl = `${window.location.origin}/releases/${noteVersion}`
    navigator.clipboard.writeText(shareUrl)
    toast.success('Link Copied', { description: `Share link for ${noteVersion} copied to clipboard` })
  }

  // Subscribe to notifications
  const handleSubscribeNotes = () => {
    setSubscribed(!subscribed)
    if (!subscribed) {
      toast.success('Subscribed', { description: 'You will receive updates for new release notes' })
    } else {
      toast.info('Unsubscribed', { description: 'You will no longer receive release note updates' })
    }
  }

  // Export release notes
  const handleExportNotes = () => {
    const data = releases.map(r => ({
      version: r.version,
      title: r.title,
      description: r.description,
      status: r.status,
      release_type: r.release_type,
      platform: r.platform,
      published_at: r.published_at,
      highlights: r.highlights,
      features: r.features,
    }))
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'release-notes-export.json'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Exported', { description: 'Release notes have been downloaded' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Rocket className="w-8 h-8" />
                Release Notes
              </h1>
              <p className="text-orange-100 mt-1">Product updates, changelogs, and version history</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                className={`${subscribed ? 'bg-white/20' : 'bg-white/10'} hover:bg-white/30 border-0`}
                onClick={handleSubscribeNotes}
              >
                {subscribed ? <Bell className="w-4 h-4 mr-2" /> : <BellOff className="w-4 h-4 mr-2" />}
                {subscribed ? 'Subscribed' : 'Subscribe'}
              </Button>
              <Button
                className="bg-white text-orange-600 hover:bg-orange-50"
                onClick={handleOpenCreateModal}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Release
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search releases, features, or versions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-lg bg-white border-0 shadow-lg rounded-xl text-gray-900"
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-6 mt-8">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">{mockReleases.length}</div>
              <div className="text-orange-100 text-sm">Total Releases</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">{mockReleases.filter(r => r.status === 'published').length}</div>
              <div className="text-orange-100 text-sm">Published</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">{formatNumber(mockReleases.reduce((sum, r) => sum + r.metrics.downloads, 0))}</div>
              <div className="text-orange-100 text-sm">Total Downloads</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">4.5</div>
              <div className="text-orange-100 text-sm">Avg Feedback</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-white dark:bg-gray-800 shadow-sm">
              <TabsTrigger value="releases" className="gap-2">
                <FileText className="w-4 h-4" />
                Releases
              </TabsTrigger>
              <TabsTrigger value="timeline" className="gap-2">
                <History className="w-4 h-4" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="roadmap" className="gap-2">
                <Target className="w-4 h-4" />
                Roadmap
              </TabsTrigger>
              <TabsTrigger value="flags" className="gap-2">
                <Flag className="w-4 h-4" />
                Feature Flags
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="rolling-out">Rolling Out</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800"
              >
                <option value="all">All Types</option>
                <option value="major">Major</option>
                <option value="minor">Minor</option>
                <option value="patch">Patch</option>
                <option value="beta">Beta</option>
              </select>
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800"
              >
                <option value="all">All Platforms</option>
                <option value="ios">iOS</option>
                <option value="android">Android</option>
                <option value="web">Web</option>
                <option value="desktop">Desktop</option>
              </select>
            </div>
          </div>

          {/* Releases Tab */}
          <TabsContent value="releases" className="space-y-6">
            {/* Real Releases from Database */}
            {releases.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-orange-600" />
                    Your Release Notes ({releases.length})
                  </h3>
                  <Button variant="outline" size="sm" onClick={handleExportNotes}>
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {releases.map((release) => (
                    <Card key={release.id} className="hover:shadow-lg transition-all border-gray-200 hover:border-orange-300">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg text-white">
                              <Rocket className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-lg">{release.version}</span>
                                <Badge className={getTypeColor(release.release_type)}>{release.release_type}</Badge>
                              </div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">{release.title}</h3>
                            </div>
                          </div>
                          <Badge className={getStatusColor(release.status)}>{release.status}</Badge>
                        </div>

                        {release.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{release.description}</p>
                        )}

                        {release.highlights && release.highlights.length > 0 && (
                          <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg">
                            <ul className="space-y-1">
                              {release.highlights.slice(0, 2).map((h, i) => (
                                <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                  <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                                  {h}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {release.views_count || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {release.likes_count || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {release.published_at ? new Date(release.published_at).toLocaleDateString() : 'Draft'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(release)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            {release.status === 'draft' && (
                              <Button variant="ghost" size="sm" onClick={() => handlePublishNote(release.id, release.version)}>
                                <Rocket className="w-4 h-4 text-green-600" />
                              </Button>
                            )}
                            {release.status === 'published' && (
                              <Button variant="ghost" size="sm" onClick={() => handleArchiveNote(release.id, release.version)}>
                                <FileText className="w-4 h-4 text-gray-600" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => handleLikeNote(release.id)}>
                              <Heart className="w-4 h-4 text-pink-600" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleConfirmDelete(release.id)}>
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Mock/Example Releases */}
            {filteredReleases.length === 0 && releases.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Rocket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No releases found</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your filters or create a new release</p>
                  <Button className="bg-orange-600" onClick={handleOpenCreateModal}>Create Release</Button>
                </CardContent>
              </Card>
            ) : filteredReleases.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  Example Releases
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredReleases.map(release => (
                    <ReleaseCard key={release.id} release={release} />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Release Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                  <div className="space-y-8">
                    {mockReleases.sort((a, b) => new Date(b.releaseDate || b.scheduledDate || '').getTime() - new Date(a.releaseDate || a.scheduledDate || '').getTime()).map((release) => (
                      <div key={release.id} className="relative pl-10">
                        <div className={`absolute left-2 w-5 h-5 rounded-full border-4 border-white ${
                          release.status === 'published' ? 'bg-green-500' :
                          release.status === 'rolling-out' ? 'bg-amber-500' :
                          release.status === 'draft' ? 'bg-gray-400' :
                          'bg-blue-500'
                        }`} />
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedRelease(release)}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{release.version}</span>
                              <Badge className={getTypeColor(release.releaseType)}>{release.releaseType}</Badge>
                            </div>
                            <span className="text-sm text-gray-500">{release.releaseDate || release.scheduledDate}</span>
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{release.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{release.description}</p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Download className="w-3 h-3" />{formatNumber(release.metrics.downloads)}</span>
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{formatNumber(release.metrics.views)}</span>
                            <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{release.metrics.likes}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roadmap Tab */}
          <TabsContent value="roadmap" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['Q1 2024', 'Q2 2024'].map(quarter => (
                <Card key={quarter}>
                  <CardHeader>
                    <CardTitle>{quarter}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockRoadmap.filter(r => r.quarter === quarter).map(item => (
                      <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className={`w-2 h-2 rounded-full mt-2 ${getRoadmapStatusColor(item.status)}`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                            <Badge variant="outline" className="text-xs">{item.category}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={
                              item.status === 'completed' ? 'bg-green-100 text-green-700' :
                              item.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                              item.status === 'delayed' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }>
                              {item.status}
                            </Badge>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {item.votes} votes
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Feature Flags Tab */}
          <TabsContent value="flags" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Flag className="w-5 h-5" />
                    Feature Flags
                  </CardTitle>
                  <Button size="sm" className="bg-orange-600" onClick={() => toast.promise(
                      new Promise((resolve) => setTimeout(resolve, 1500)),
                      {
                        loading: 'Preparing feature flag configuration...',
                        success: 'Feature flag management coming soon! We are working on this feature.',
                        error: 'Failed to load feature flag configuration'
                      }
                    )}>
                    <Plus className="w-4 h-4 mr-1" />
                    New Flag
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockReleases.flatMap(r => r.featureFlags).map(flag => (
                    <div key={flag.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${flag.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{flag.name}</h4>
                          <code className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{flag.key}</code>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-1">
                          {flag.platforms.map(p => (
                            <div key={p} className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-white">
                              {platformIcons[p]}
                            </div>
                          ))}
                        </div>
                        <div className="text-sm">
                          <div className="text-gray-900 dark:text-white font-semibold">{flag.rolloutPercentage}%</div>
                          <div className="text-xs text-gray-500">rollout</div>
                        </div>
                        <Progress value={flag.rolloutPercentage} className="w-24 h-2" />
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Tabs value={settingsTab} onValueChange={setSettingsTab}>
              <TabsList className="grid w-full grid-cols-6 mb-6">
                <TabsTrigger value="general" className="gap-2">
                  <Settings className="w-4 h-4" />
                  General
                </TabsTrigger>
                <TabsTrigger value="publishing" className="gap-2">
                  <Rocket className="w-4 h-4" />
                  Publishing
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2">
                  <Bell className="w-4 h-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="integrations" className="gap-2">
                  <Link2 className="w-4 h-4" />
                  Integrations
                </TabsTrigger>
                <TabsTrigger value="templates" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="advanced" className="gap-2">
                  <Zap className="w-4 h-4" />
                  Advanced
                </TabsTrigger>
              </TabsList>

              {/* General Settings */}
              <TabsContent value="general" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5 text-orange-600" />
                        Display Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Show Version Numbers</Label>
                          <p className="text-sm text-gray-500">Display version badges on releases</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Show Metrics</Label>
                          <p className="text-sm text-gray-500">Display download and view counts</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Show Author Info</Label>
                          <p className="text-sm text-gray-500">Display author avatar and name</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Compact View</Label>
                          <p className="text-sm text-gray-500">Reduce card size for more content</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium">Default View</Label>
                        <Select defaultValue="grid">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="grid">Grid View</SelectItem>
                            <SelectItem value="list">List View</SelectItem>
                            <SelectItem value="timeline">Timeline View</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-orange-600" />
                        Roadmap Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Public Roadmap</Label>
                          <p className="text-sm text-gray-500">Share roadmap with users</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Allow Voting</Label>
                          <p className="text-sm text-gray-500">Let users vote on features</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Show Vote Counts</Label>
                          <p className="text-sm text-gray-500">Display vote counts publicly</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium">Default Quarter View</Label>
                        <Select defaultValue="current">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="current">Current Quarter</SelectItem>
                            <SelectItem value="next">Next Quarter</SelectItem>
                            <SelectItem value="all">All Quarters</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Flag className="h-5 w-5 text-orange-600" />
                        Feature Flag Defaults
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-medium">Default Rollout</Label>
                        <Select defaultValue="0">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0% (Disabled)</SelectItem>
                            <SelectItem value="10">10% (Testing)</SelectItem>
                            <SelectItem value="50">50% (Beta)</SelectItem>
                            <SelectItem value="100">100% (Enabled)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Auto-archive Old Flags</Label>
                          <p className="text-sm text-gray-500">Archive flags after 90 days at 100%</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Require Approval</Label>
                          <p className="text-sm text-gray-500">Require approval for production flags</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-orange-600" />
                        Platform Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">iOS</Label>
                          <p className="text-sm text-gray-500">Track iOS releases</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Android</Label>
                          <p className="text-sm text-gray-500">Track Android releases</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Web</Label>
                          <p className="text-sm text-gray-500">Track Web releases</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Desktop</Label>
                          <p className="text-sm text-gray-500">Track Desktop releases</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">API</Label>
                          <p className="text-sm text-gray-500">Track API releases</p>
                        </div>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Publishing Settings */}
              <TabsContent value="publishing" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Rocket className="h-5 w-5 text-orange-600" />
                        Release Workflow
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Require Approval</Label>
                          <p className="text-sm text-gray-500">Releases need approval before publishing</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Auto-draft from Git</Label>
                          <p className="text-sm text-gray-500">Create drafts from git tags</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Require Changelog</Label>
                          <p className="text-sm text-gray-500">Releases must have changelog</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium">Default Approvers</Label>
                        <Input placeholder="Enter email addresses..." />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-orange-600" />
                        Scheduling
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Allow Scheduling</Label>
                          <p className="text-sm text-gray-500">Schedule releases for later</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium">Default Publish Time</Label>
                        <Select defaultValue="10am">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="9am">9:00 AM</SelectItem>
                            <SelectItem value="10am">10:00 AM</SelectItem>
                            <SelectItem value="2pm">2:00 PM</SelectItem>
                            <SelectItem value="custom">Custom Time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium">Timezone</Label>
                        <Select defaultValue="utc">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="utc">UTC</SelectItem>
                            <SelectItem value="pst">Pacific Time</SelectItem>
                            <SelectItem value="est">Eastern Time</SelectItem>
                            <SelectItem value="cet">Central European</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Avoid Weekends</Label>
                          <p className="text-sm text-gray-500">Do not publish on weekends</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-orange-600" />
                        Rollout Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Gradual Rollout</Label>
                          <p className="text-sm text-gray-500">Roll out releases gradually</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium">Default Rollout Schedule</Label>
                        <Select defaultValue="standard">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="aggressive">Aggressive (1h intervals)</SelectItem>
                            <SelectItem value="standard">Standard (4h intervals)</SelectItem>
                            <SelectItem value="conservative">Conservative (24h intervals)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Auto-pause on Errors</Label>
                          <p className="text-sm text-gray-500">Pause rollout if error rate spikes</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium">Error Threshold</Label>
                        <Select defaultValue="5">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1%</SelectItem>
                            <SelectItem value="5">5%</SelectItem>
                            <SelectItem value="10">10%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GitBranch className="h-5 w-5 text-orange-600" />
                        Version Control
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-medium">Version Format</Label>
                        <Select defaultValue="semver">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="semver">Semantic (x.y.z)</SelectItem>
                            <SelectItem value="date">Date-based (YYYY.MM.DD)</SelectItem>
                            <SelectItem value="build">Build Number</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Auto-increment Version</Label>
                          <p className="text-sm text-gray-500">Automatically bump version</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Link to Git Tags</Label>
                          <p className="text-sm text-gray-500">Associate releases with git tags</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Notifications Settings */}
              <TabsContent value="notifications" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-orange-600" />
                        Email Notifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">New Release Published</Label>
                          <p className="text-sm text-gray-500">Email when releases go live</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Release Scheduled</Label>
                          <p className="text-sm text-gray-500">Reminder before scheduled release</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Rollout Progress</Label>
                          <p className="text-sm text-gray-500">Updates during gradual rollout</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Weekly Digest</Label>
                          <p className="text-sm text-gray-500">Weekly release summary</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium">Notification Email</Label>
                        <Input type="email" placeholder="team@company.com" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-orange-600" />
                        Slack Integration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="w-10 h-10 bg-[#4A154B] rounded flex items-center justify-center">
                          <span className="text-white font-bold">#</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Slack Workspace</p>
                          <p className="text-sm text-green-600">Connected to #releases</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">New Releases</Label>
                          <p className="text-sm text-gray-500">Post when releases are published</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Rollout Milestones</Label>
                          <p className="text-sm text-gray-500">Post at 25%, 50%, 75%, 100%</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Feature Flag Changes</Label>
                          <p className="text-sm text-gray-500">Post when flags are toggled</p>
                        </div>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-orange-600" />
                        In-App Notifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Show Release Banner</Label>
                          <p className="text-sm text-gray-500">Show banner in app for new releases</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Whats New Modal</Label>
                          <p className="text-sm text-gray-500">Show modal on first visit after update</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Changelog Link</Label>
                          <p className="text-sm text-gray-500">Show link to full changelog</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium">Banner Duration</Label>
                        <Select defaultValue="7days">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3days">3 days</SelectItem>
                            <SelectItem value="7days">7 days</SelectItem>
                            <SelectItem value="14days">14 days</SelectItem>
                            <SelectItem value="permanent">Until dismissed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Webhook className="h-5 w-5 text-orange-600" />
                        Webhooks
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Release Published</span>
                          <Badge className="bg-green-100 text-green-700">Active</Badge>
                        </div>
                        <code className="text-xs text-gray-500">https://api.yourapp.com/webhooks/releases</code>
                      </div>
                      <Button variant="outline" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Webhook
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Integrations Settings */}
              <TabsContent value="integrations" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Link2 className="h-5 w-5 text-orange-600" />
                        Connected Services
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          { name: 'GitHub', status: 'connected', icon: '🐙', desc: 'Auto-generate from tags' },
                          { name: 'Jira', status: 'connected', icon: '📋', desc: 'Link tickets to releases' },
                          { name: 'Linear', status: 'not_connected', icon: '📐', desc: 'Sync issues with releases' },
                          { name: 'Notion', status: 'not_connected', icon: '📝', desc: 'Publish to Notion docs' },
                          { name: 'Intercom', status: 'connected', icon: '💬', desc: 'Share with customers' },
                          { name: 'LaunchDarkly', status: 'not_connected', icon: '🚀', desc: 'Sync feature flags' }
                        ].map((service, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-xl">
                                {service.icon}
                              </div>
                              <div>
                                <p className="font-medium">{service.name}</p>
                                <p className="text-xs text-gray-500">{service.desc}</p>
                              </div>
                            </div>
                            {service.status === 'connected' ? (
                              <Badge className="bg-green-100 text-green-700">Connected</Badge>
                            ) : (
                              <Button variant="outline" size="sm">Connect</Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5 text-orange-600" />
                        API Access
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-medium">API Key</Label>
                        <div className="flex gap-2">
                          <Input value="rn_live_xxxxxxxxxxxxxxxxxxxxx" readOnly className="flex-1 font-mono text-sm" type="password" />
                          <Button variant="outline" size="icon" onClick={() => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Revealing key...', success: 'Key revealed', error: 'Failed to reveal' })}><Eye className="h-4 w-4" /></Button>
                          <Button variant="outline" size="icon" onClick={() => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Copying key...', success: 'Key copied to clipboard', error: 'Failed to copy' })}><Copy className="h-4 w-4" /></Button>
                        </div>
                      </div>
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          Keep your API key secure. Never share it publicly.
                        </p>
                      </div>
                      <Button variant="outline" className="w-full">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate API Key
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="h-5 w-5 text-orange-600" />
                        RSS & Embeds
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-medium">RSS Feed URL</Label>
                        <div className="flex gap-2">
                          <Input value="https://yourapp.com/releases/feed.xml" readOnly className="flex-1 font-mono text-sm" />
                          <Button variant="outline" size="icon" onClick={() => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Copying URL...', success: 'URL copied to clipboard', error: 'Failed to copy' })}><Copy className="h-4 w-4" /></Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium">Embed Widget</Label>
                        <div className="p-3 bg-gray-900 rounded-lg">
                          <code className="text-xs text-green-400">{'<script src="https://yourapp.com/embed.js"></script>'}</code>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Public Changelog</Label>
                          <p className="text-sm text-gray-500">Allow public access to changelog</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Templates Settings */}
              <TabsContent value="templates" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-orange-600" />
                        Release Note Templates
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { name: 'Major Release', desc: 'Full changelog with all sections', isDefault: true },
                        { name: 'Minor Update', desc: 'Features and improvements only', isDefault: false },
                        { name: 'Patch/Hotfix', desc: 'Bug fixes and security updates', isDefault: false },
                        { name: 'Beta Release', desc: 'Testing notes and known issues', isDefault: false }
                      ].map((template, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">{template.name}</p>
                            <p className="text-xs text-gray-500">{template.desc}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {template.isDefault && <Badge className="bg-orange-100 text-orange-700">Default</Badge>}
                            <Button variant="ghost" size="sm"><Settings className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Template
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Layers className="h-5 w-5 text-orange-600" />
                        Changelog Sections
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">New Features</Label>
                          <p className="text-sm text-gray-500">Show new feature section</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Improvements</Label>
                          <p className="text-sm text-gray-500">Show improvements section</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Bug Fixes</Label>
                          <p className="text-sm text-gray-500">Show bug fixes section</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Breaking Changes</Label>
                          <p className="text-sm text-gray-500">Show breaking changes section</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Known Issues</Label>
                          <p className="text-sm text-gray-500">Show known issues section</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Migration Guide</Label>
                          <p className="text-sm text-gray-500">Show migration guide section</p>
                        </div>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5 text-orange-600" />
                        Branding
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-medium">Primary Color</Label>
                          <div className="flex gap-2">
                            <div className="w-10 h-10 rounded bg-orange-500 border-2 border-orange-600" />
                            <Input defaultValue="#f97316" className="flex-1" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="font-medium">Logo</Label>
                          <Button variant="outline" className="w-full">Upload Logo</Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium">Custom CSS</Label>
                        <div className="p-3 bg-gray-900 rounded-lg h-24">
                          <code className="text-xs text-gray-400">{`/* Add custom CSS here */`}</code>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Advanced Settings */}
              <TabsContent value="advanced" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-orange-600" />
                        Data Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-medium">Data Retention</Label>
                        <Select defaultValue="forever">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1year">1 year</SelectItem>
                            <SelectItem value="3years">3 years</SelectItem>
                            <SelectItem value="5years">5 years</SelectItem>
                            <SelectItem value="forever">Forever</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Export All Releases
                      </Button>
                      <Button variant="outline" className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Changelog PDF
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5 text-orange-600" />
                        Cache & Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Enable Caching</Label>
                          <p className="text-sm text-gray-500">Cache release data</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium">Cache Duration</Label>
                        <Select defaultValue="1hour">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15min">15 minutes</SelectItem>
                            <SelectItem value="1hour">1 hour</SelectItem>
                            <SelectItem value="24hours">24 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button variant="outline" className="w-full">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Clear Cache
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-orange-600" />
                        Access Control
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Require Login</Label>
                          <p className="text-sm text-gray-500">Users must login to view releases</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Internal Only</Label>
                          <p className="text-sm text-gray-500">Only show to team members</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium">Allowed Domains</Label>
                        <Input placeholder="company.com, partner.org" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-red-200 dark:border-red-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-600">
                        <AlertOctagon className="h-5 w-5" />
                        Danger Zone
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-800 dark:text-red-200">
                          These actions are irreversible. Proceed with caution.
                        </p>
                      </div>
                      <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete All Releases
                      </Button>
                      <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset All Settings
                      </Button>
                      <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                        <Lock className="h-4 w-4 mr-2" />
                        Disable Release Notes
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockReleaseNotesAIInsights}
              title="Release Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockReleaseNotesCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockReleaseNotesPredictions}
              title="Release Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockReleaseNotesActivities}
            title="Release Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockReleaseNotesQuickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* Create/Edit Release Note Dialog */}
      <Dialog open={showCreateModal} onOpenChange={(open) => { if (!open) { setShowCreateModal(false); resetForm(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-orange-600" />
              {editingReleaseNote ? 'Edit Release Note' : 'Create New Release Note'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="version">Version *</Label>
                <Input
                  id="version"
                  placeholder="e.g., v1.2.0"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="release_type">Release Type</Label>
                <Select
                  value={formData.release_type}
                  onValueChange={(value: 'major' | 'minor' | 'patch' | 'hotfix') => setFormData({ ...formData, release_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="major">Major</SelectItem>
                    <SelectItem value="minor">Minor</SelectItem>
                    <SelectItem value="patch">Patch</SelectItem>
                    <SelectItem value="hotfix">Hotfix</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Release title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what's in this release..."
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'published' | 'draft' | 'scheduled' | 'archived') => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value: 'web' | 'mobile' | 'api' | 'desktop' | 'all') => setFormData({ ...formData, platform: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="web">Web</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="desktop">Desktop</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                placeholder="Author name"
                value={formData.author || ''}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="highlights">Highlights (comma-separated)</Label>
              <Textarea
                id="highlights"
                placeholder="Key highlights of this release..."
                value={highlightsInput}
                onChange={(e) => setHighlightsInput(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Features (comma-separated)</Label>
              <Textarea
                id="features"
                placeholder="New features in this release..."
                value={featuresInput}
                onChange={(e) => setFeaturesInput(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="e.g., feature, security, performance"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>

            {formData.status === 'scheduled' && (
              <div className="space-y-2">
                <Label htmlFor="scheduled_at">Scheduled Date</Label>
                <Input
                  id="scheduled_at"
                  type="datetime-local"
                  value={formData.scheduled_at || ''}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateModal(false); resetForm(); }} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReleaseNote} disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700">
              {isSubmitting ? 'Saving...' : editingReleaseNote ? 'Update Release Note' : 'Create Release Note'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Delete Release Note
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to delete this release note? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteNote} disabled={isSubmitting}>
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Release Detail Dialog */}
      <Dialog open={!!selectedRelease} onOpenChange={() => setSelectedRelease(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          {selectedRelease && (
            <div className="flex flex-col h-full">
              <DialogHeader className="border-b pb-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl text-white">
                    <Rocket className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <DialogTitle className="text-2xl">{selectedRelease.version}</DialogTitle>
                      <Badge className={getTypeColor(selectedRelease.releaseType)}>{selectedRelease.releaseType}</Badge>
                      <Badge className={getStatusColor(selectedRelease.status)}>{selectedRelease.status}</Badge>
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 mt-1">{selectedRelease.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Avatar className="w-5 h-5">
                          <AvatarFallback className="text-xs">{selectedRelease.author.avatar}</AvatarFallback>
                        </Avatar>
                        {selectedRelease.author.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {selectedRelease.releaseDate || selectedRelease.scheduledDate}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleShareReleaseNote(selectedRelease.version)}>
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleLikeNote(selectedRelease.id)}>
                      <Heart className="w-4 h-4 mr-1" />
                      Like
                    </Button>
                    {selectedRelease.downloadUrl && (
                      <Button size="sm" className="bg-orange-600">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <ScrollArea className="flex-1 py-4">
                <Tabs defaultValue="overview">
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="changelog">Changelog</TabsTrigger>
                    <TabsTrigger value="platforms">Platforms</TabsTrigger>
                    <TabsTrigger value="metrics">Metrics</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <div>
                      <p className="text-gray-600">{selectedRelease.description}</p>
                    </div>

                    {selectedRelease.highlights.length > 0 && (
                      <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-orange-500" />
                          Highlights
                        </h4>
                        <ul className="space-y-2">
                          {selectedRelease.highlights.map((h, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <Star className="w-4 h-4 text-orange-500 fill-orange-500 flex-shrink-0 mt-0.5" />
                              {h}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedRelease.rolloutPercentage < 100 && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-amber-800">Rollout Progress</span>
                          <span className="text-amber-700">{selectedRelease.rolloutPercentage}%</span>
                        </div>
                        <Progress value={selectedRelease.rolloutPercentage} className="h-2" />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {selectedRelease.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-orange-600 border-orange-200">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="changelog" className="space-y-6">
                    {selectedRelease.features.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-700">
                          <Plus className="w-4 h-4" />
                          New Features ({selectedRelease.features.length})
                        </h4>
                        <div className="space-y-2">
                          {selectedRelease.features.map(f => (
                            <div key={f.id} className="p-3 bg-green-50 rounded-lg">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{f.title}</span>
                                {f.ticketId && <code className="text-xs bg-green-100 px-2 py-0.5 rounded">{f.ticketId}</code>}
                              </div>
                              {f.description && <p className="text-sm text-gray-600 mt-1">{f.description}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedRelease.improvements.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-700">
                          <TrendingUp className="w-4 h-4" />
                          Improvements ({selectedRelease.improvements.length})
                        </h4>
                        <div className="space-y-2">
                          {selectedRelease.improvements.map(i => (
                            <div key={i.id} className="p-3 bg-blue-50 rounded-lg">
                              <span className="font-medium">{i.title}</span>
                              {i.description && <p className="text-sm text-gray-600 mt-1">{i.description}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedRelease.bugFixes.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-700">
                          <CheckCircle className="w-4 h-4" />
                          Bug Fixes ({selectedRelease.bugFixes.length})
                        </h4>
                        <div className="space-y-2">
                          {selectedRelease.bugFixes.map(b => (
                            <div key={b.id} className="p-3 bg-red-50 rounded-lg flex items-center justify-between">
                              <span>{b.title}</span>
                              {b.ticketId && <code className="text-xs bg-red-100 px-2 py-0.5 rounded">{b.ticketId}</code>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedRelease.breakingChanges.length > 0 && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-700">
                          <AlertCircle className="w-4 h-4" />
                          Breaking Changes
                        </h4>
                        <ul className="space-y-2">
                          {selectedRelease.breakingChanges.map(bc => (
                            <li key={bc.id}>
                              <span className="font-medium">{bc.title}</span>
                              {bc.description && <p className="text-sm text-red-600">{bc.description}</p>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="platforms" className="space-y-4">
                    {selectedRelease.platforms.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            p.status === 'available' ? 'bg-green-100 text-green-600' :
                            p.status === 'coming-soon' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-gray-100 text-gray-400'
                          }`}>
                            {platformIcons[p.icon]}
                          </div>
                          <div>
                            <h4 className="font-semibold">{p.name}</h4>
                            <p className="text-sm text-gray-500">Version {p.version}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {p.minVersion && (
                            <span className="text-sm text-gray-500">Min: {p.minVersion}</span>
                          )}
                          <Badge className={
                            p.status === 'available' ? 'bg-green-100 text-green-700' :
                            p.status === 'coming-soon' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }>
                            {p.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="metrics" className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <Download className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                          <div className="text-2xl font-bold">{formatNumber(selectedRelease.metrics.downloads)}</div>
                          <div className="text-sm text-gray-500">Downloads</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <Eye className="w-6 h-6 mx-auto text-green-500 mb-2" />
                          <div className="text-2xl font-bold">{formatNumber(selectedRelease.metrics.views)}</div>
                          <div className="text-sm text-gray-500">Views</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <TrendingUp className="w-6 h-6 mx-auto text-purple-500 mb-2" />
                          <div className="text-2xl font-bold">{selectedRelease.metrics.adoptionRate}%</div>
                          <div className="text-sm text-gray-500">Adoption Rate</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <Star className="w-6 h-6 mx-auto text-yellow-500 mb-2" />
                          <div className="text-2xl font-bold">{selectedRelease.metrics.feedbackScore}</div>
                          <div className="text-sm text-gray-500">Feedback Score</div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Engagement</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-gray-600">
                            <Heart className="w-4 h-4" /> Likes
                          </span>
                          <span className="font-semibold">{selectedRelease.metrics.likes.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-gray-600">
                            <MessageSquare className="w-4 h-4" /> Comments
                          </span>
                          <span className="font-semibold">{selectedRelease.metrics.comments.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-gray-600">
                            <AlertCircle className="w-4 h-4" /> Issues Reported
                          </span>
                          <span className="font-semibold">{selectedRelease.metrics.issuesReported}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
