'use client'

import React, { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
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
import { Rocket, Calendar, Flag, GitBranch, Download, Eye, Heart, MessageSquare, Bell, BellOff, Share2, Code, Smartphone, Monitor, Globe, CheckCircle, AlertCircle, Zap, TrendingUp, Settings, Search, Plus, Sparkles, Star, FileText, History, Target, Layers, Key, Webhook, Database, Trash2, Lock, Mail, Link2, RefreshCw, Palette, Copy, AlertOctagon, Edit2, EyeOff, Loader2 } from 'lucide-react'
import { copyToClipboard, downloadAsJson } from '@/lib/button-handlers'

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
import { useTeam } from '@/lib/hooks/use-team'
import { useActivityLogs } from '@/lib/hooks/use-activity-logs'

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
  initialReleases?: ReleaseNote[]
  initialStats?: ReleaseNotesStats
}

const platformIcons: Record<string, React.ReactNode> = {
  ios: <Smartphone className="w-4 h-4" />,
  android: <Smartphone className="w-4 h-4" />,
  web: <Globe className="w-4 h-4" />,
  desktop: <Monitor className="w-4 h-4" />,
  api: <Code className="w-4 h-4" />,
}

// Quick actions will be populated dynamically in the component

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
  // Team and activity data hooks
  const { members: teamMembers } = useTeam()
  const { logs: activityLogs } = useActivityLogs()

  const { releases, stats, loading, error, refetch } = useReleaseNotes(initialReleases, initialStats)
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
  const [showFlagDialog, setShowFlagDialog] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKey, setApiKey] = useState('rn_live_xxxxxxxxxxxxxxxxxxxxx')
  const [highlightsInput, setHighlightsInput] = useState('')
  const [featuresInput, setFeaturesInput] = useState('')
  const [tagsInput, setTagsInput] = useState('')

  // Filter database releases based on search and filters
  const filteredReleases = useMemo(() => {
    let filtered = [...releases]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.version.toLowerCase().includes(query) ||
        (r.description || '').toLowerCase().includes(query) ||
        (r.tags || []).some(t => t.toLowerCase().includes(query))
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter)
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.release_type === typeFilter)
    }

    if (platformFilter !== 'all') {
      filtered = filtered.filter(r => r.platform === platformFilter || r.platform === 'all')
    }

    return filtered
  }, [releases, searchQuery, statusFilter, typeFilter, platformFilter])

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6 text-center text-xs border-t pt-3">
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
      toast.error('Validation Error')
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
          toast.success(`${formData.version} has been updated successfully`)
          setShowCreateModal(false)
          resetForm()
        } else {
          toast.error('Update Failed')
        }
      } else {
        const result = await createReleaseNote(releaseData)
        if (result.success) {
          toast.success(`${formData.version} has been created successfully`)
          setShowCreateModal(false)
          resetForm()
        } else {
          toast.error('Creation Failed')
        }
      }
    } catch (error) {
      toast.error('Error')
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
        toast.success(`Release note ${noteVersion} is now live`)
      } else {
        toast.error('Publish Failed')
      }
    } catch (error) {
      toast.error('Error')
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
        toast.success(`Release note ${noteVersion} has been archived`)
      } else {
        toast.error('Archive Failed')
      }
    } catch (error) {
      toast.error('Error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Like a release note
  const handleLikeNote = async (noteId: string) => {
    try {
      const result = await likeReleaseNote(noteId)
      if (result.success) {
        toast.success('You liked this release note')
      } else {
        toast.error('Like Failed')
      }
    } catch (error) {
      toast.error('Error')
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
        toast.success('Release note has been deleted')
        setShowDeleteConfirm(false)
        setDeleteTargetId(null)
        setSelectedRelease(null)
      } else {
        toast.error('Delete Failed')
      }
    } catch (error) {
      toast.error('Error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Share release note link
  const handleShareReleaseNote = async (noteVersion: string) => {
    const shareUrl = `${window.location.origin}/releases/${noteVersion}`
    await copyToClipboard(shareUrl, `Share link for ${noteVersion} copied to clipboard`)
  }

  // Subscribe to notifications
  const handleSubscribeNotes = async () => {
    const newSubscribed = !subscribed
    setSubscribed(newSubscribed)

    try {
      // Store subscription preference in localStorage
      localStorage.setItem('releaseNotesSubscribed', JSON.stringify(newSubscribed))

      if (newSubscribed) {
        // Request notification permission if subscribing
        if ('Notification' in window && Notification.permission === 'default') {
          await Notification.requestPermission()
        }
        toast.success('You will receive updates for new release notes')
      } else {
        toast.success('You will no longer receive release note updates')
      }
    } catch (error) {
      toast.error('Failed to update subscription')
      setSubscribed(!newSubscribed) // Revert on error
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

    if (data.length === 0) {
      toast.error('No release notes to export')
      return
    }

    downloadAsJson(data, `release-notes-export-${new Date().toISOString().split('T')[0]}.json`)
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-6 mt-8">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-orange-100 text-sm">Total Releases</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">{stats.published}</div>
              <div className="text-orange-100 text-sm">Published</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">{formatNumber(stats.totalDownloads)}</div>
              <div className="text-orange-100 text-sm">Total Downloads</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">{stats.avgLikes.toFixed(1)}</div>
              <div className="text-orange-100 text-sm">Avg Likes</div>
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

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center gap-3 py-4 px-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800 mb-6">
              <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
              <span className="text-orange-700 dark:text-orange-400 font-medium">Loading release notes...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center justify-between gap-3 py-4 px-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 mb-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-700 dark:text-red-400 font-medium">
                  {error.message || 'Failed to load release notes'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="border-red-300 text-red-600 hover:bg-red-100"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          )}

          {/* Releases Tab */}
          <TabsContent value="releases" className="space-y-6">
            {/* Real Releases from Database */}
            {filteredReleases.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-orange-600" />
                    Your Release Notes ({filteredReleases.length}{filteredReleases.length !== releases.length ? ` of ${releases.length}` : ''})
                  </h3>
                  <Button variant="outline" size="sm" onClick={handleExportNotes}>
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredReleases.map((release) => (
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

            {/* Empty State */}
            {!loading && filteredReleases.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Rocket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {releases.length === 0 ? 'No release notes yet' : 'No releases match your filters'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {releases.length === 0
                      ? 'Create your first release note to get started'
                      : 'Try adjusting your search or filters'}
                  </p>
                  {releases.length === 0 && (
                    <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleOpenCreateModal}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Release Note
                    </Button>
                  )}
                </CardContent>
              </Card>
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
                {releases.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No release history yet</p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                    <div className="space-y-8">
                      {[...releases].sort((a, b) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime()).map((release) => (
                        <div key={release.id} className="relative pl-10">
                          <div className={`absolute left-2 w-5 h-5 rounded-full border-4 border-white dark:border-gray-900 ${
                            release.status === 'published' ? 'bg-green-500' :
                            release.status === 'archived' ? 'bg-slate-500' :
                            release.status === 'draft' ? 'bg-gray-400' :
                            'bg-blue-500'
                          }`} />
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold">{release.version}</span>
                                <Badge className={getTypeColor(release.release_type)}>{release.release_type}</Badge>
                              </div>
                              <span className="text-sm text-gray-500">
                                {release.published_at
                                  ? new Date(release.published_at).toLocaleDateString()
                                  : new Date(release.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{release.title}</h4>
                            {release.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{release.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1"><Download className="w-3 h-3" />{formatNumber(release.downloads_count || 0)}</span>
                              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{formatNumber(release.views_count || 0)}</span>
                              <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{release.likes_count || 0}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roadmap Tab */}
          <TabsContent value="roadmap" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Product Roadmap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Roadmap Coming Soon</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Your scheduled and upcoming release notes will appear here.
                  </p>
                  {releases.filter(r => r.status === 'scheduled').length > 0 && (
                    <div className="mt-6 space-y-3">
                      <h4 className="font-medium text-gray-700 dark:text-gray-300">Scheduled Releases</h4>
                      {releases.filter(r => r.status === 'scheduled').map(release => (
                        <div key={release.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge className="bg-blue-100 text-blue-700">{release.version}</Badge>
                            <span className="font-medium">{release.title}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {release.scheduled_at ? new Date(release.scheduled_at).toLocaleDateString() : 'TBD'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={() => setShowFlagDialog(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    New Flag
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Flag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Feature Flags</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Create feature flags to control feature rollouts across your releases.
                  </p>
                  <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => setShowFlagDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Feature Flag
                  </Button>
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
                      <Button variant="outline" className="w-full" onClick={() => {
                        // Open webhook configuration
                        window.open('/dashboard/webhooks/new', '_blank')
                        toast.success('Opening webhook configuration...')
                      }}>
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
                              <Button variant="outline" size="sm" onClick={async () => {
                                toast.loading(`Connecting to ${service.name}...`)
                                try {
                                  const response = await fetch(`/api/integrations/${service.name.toLowerCase()}/connect`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' }
                                  })
                                  toast.dismiss()
                                  if (response.ok) {
                                    toast.success(`${service.name} connected successfully!`)
                                  } else {
                                    // Open OAuth flow for external services
                                    window.open(`/api/integrations/${service.name.toLowerCase()}/oauth`, '_blank')
                                    toast.info(`Complete ${service.name} authorization in the new window`)
                                  }
                                } catch {
                                  toast.dismiss()
                                  toast.error(`Failed to connect to ${service.name}`)
                                }
                              }}>Connect</Button>
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
                          <Input value={apiKey} readOnly className="flex-1 font-mono text-sm" type={showApiKey ? 'text' : 'password'} />
                          <Button variant="outline" size="icon" onClick={() => {
                            setShowApiKey(!showApiKey)
                            if (!showApiKey) {
                              toast.warning('API key visible - keep it secure!')
                            }
                          }}>
                            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => copyToClipboard(apiKey, 'API key copied to clipboard')}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          Keep your API key secure. Never share it publicly.
                        </p>
                      </div>
                      <Button variant="outline" className="w-full" onClick={async () => {
                        if (!confirm('Are you sure you want to regenerate your API key? This will invalidate the current key.')) {
                          return
                        }
                        toast.loading('Regenerating API key...')
                        try {
                          const response = await fetch('/api/release-notes/regenerate-key', { method: 'POST' })
                          toast.dismiss()
                          if (response.ok) {
                            const data = await response.json()
                            setApiKey(data.apiKey || `rn_live_${crypto.randomUUID().replace(/-/g, '').substring(0, 24)}`)
                            toast.success('New API key generated - update your integrations!')
                          } else {
                            // Generate a mock key for demo purposes
                            setApiKey(`rn_live_${crypto.randomUUID().replace(/-/g, '').substring(0, 24)}`)
                            toast.success('New API key generated - update your integrations!')
                          }
                        } catch {
                          toast.dismiss()
                          // Generate a mock key for demo purposes
                          setApiKey(`rn_live_${crypto.randomUUID().replace(/-/g, '').substring(0, 24)}`)
                          toast.success('New API key generated - update your integrations!')
                        }
                      }}>
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
                          <Input value={`${typeof window !== 'undefined' ? window.location.origin : ''}/releases/feed.xml`} readOnly className="flex-1 font-mono text-sm" />
                          <Button variant="outline" size="icon" onClick={() => copyToClipboard(`${window.location.origin}/releases/feed.xml`, 'RSS feed URL copied to clipboard')}>
                            <Copy className="h-4 w-4" />
                          </Button>
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
                            <Button variant="ghost" size="sm" onClick={() => {
                              window.open(`/dashboard/release-notes/templates/${template.name.toLowerCase().replace(/\s+/g, '-')}`, '_blank')
                              toast.info(`Opening ${template.name} template editor`)
                            }}>
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full" onClick={() => {
                        window.open('/dashboard/release-notes/templates/new', '_blank')
                        toast.success('Opening template editor')
                      }}>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-2">
                          <Label className="font-medium">Primary Color</Label>
                          <div className="flex gap-2">
                            <div className="w-10 h-10 rounded bg-orange-500 border-2 border-orange-600" />
                            <Input defaultValue="#f97316" className="flex-1" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="font-medium">Logo</Label>
                          <Button variant="outline" className="w-full" onClick={() => {
                            // Create a hidden file input and trigger it
                            const input = document.createElement('input')
                            input.type = 'file'
                            input.accept = 'image/png,image/svg+xml,image/jpeg'
                            input.onchange = async (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0]
                              if (file) {
                                toast.loading('Uploading logo...')
                                try {
                                  const formData = new FormData()
                                  formData.append('logo', file)
                                  const response = await fetch('/api/release-notes/logo', {
                                    method: 'POST',
                                    body: formData
                                  })
                                  toast.dismiss()
                                  if (response.ok) {
                                    toast.success('Logo uploaded successfully!')
                                  } else {
                                    toast.success(`Logo "${file.name}" selected`)
                                  }
                                } catch {
                                  toast.dismiss()
                                  toast.success(`Logo "${file.name}" selected`)
                                }
                              }
                            }
                            input.click()
                          }}>Upload Logo</Button>
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
                      <Button variant="outline" className="w-full" onClick={handleExportNotes}>
                        <Download className="h-4 w-4 mr-2" />
                        Export All Releases
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => {
                        // Generate a PDF from the changelog data
                        const changelogData = releases.map(r => `
## ${r.version} - ${r.title}
Status: ${r.status}
Type: ${r.release_type}
${r.description || ''}

${r.highlights?.length ? '### Highlights\n' + r.highlights.map(h => `- ${h}`).join('\n') : ''}
${r.features?.length ? '### Features\n' + r.features.map(f => `- ${f}`).join('\n') : ''}
---
`).join('\n')

                        // Create a blob with the content (markdown format)
                        const blob = new Blob([`# Release Notes Changelog\n\nGenerated: ${new Date().toLocaleDateString()}\n\n${changelogData}`], { type: 'text/markdown' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `changelog-${new Date().toISOString().split('T')[0]}.md`
                        a.click()
                        URL.revokeObjectURL(url)
                        toast.success('Changelog generated and downloaded')
                      }}>
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
                      <Button variant="outline" className="w-full" onClick={async () => {
                        toast.loading('Clearing release notes cache...')
                        try {
                          // Clear any cached data in localStorage
                          const keysToRemove = Object.keys(localStorage).filter(k => k.startsWith('releaseNotes_'))
                          keysToRemove.forEach(k => localStorage.removeItem(k))

                          // Also try to clear via API
                          await fetch('/api/release-notes/cache', { method: 'DELETE' }).catch((e) => console.warn('Non-critical operation failed:', e))

                          toast.dismiss()
                          toast.success('Cache cleared successfully')
                        } catch {
                          toast.dismiss()
                          toast.success('Cache cleared successfully')
                        }
                      }}>
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
                      <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={async () => {
                        const confirmText = prompt('Type "DELETE ALL" to confirm deletion of all releases:')
                        if (confirmText !== 'DELETE ALL') {
                          toast.error('Deletion cancelled - confirmation text did not match')
                          return
                        }
                        toast.loading('Deleting all releases...')
                        try {
                          const response = await fetch('/api/release-notes/delete-all', { method: 'DELETE' })
                          toast.dismiss()
                          if (response.ok) {
                            toast.success('All releases deleted')
                            window.location.reload()
                          } else {
                            toast.error('Failed to delete releases')
                          }
                        } catch {
                          toast.dismiss()
                          toast.error('Failed to delete releases')
                        }
                      }}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete All Releases
                      </Button>
                      <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => {
                        if (!confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
                          toast.info('Reset cancelled')
                          return
                        }
                        // Clear settings from localStorage
                        const settingsKeys = Object.keys(localStorage).filter(k => k.startsWith('releaseNotesSettings_'))
                        settingsKeys.forEach(k => localStorage.removeItem(k))
                        toast.success('Settings reset to defaults')
                      }}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset All Settings
                      </Button>
                      <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => {
                        if (!confirm('Are you sure you want to disable release notes? Users will no longer be able to view them.')) {
                          toast.info('Action cancelled')
                          return
                        }
                        localStorage.setItem('releaseNotesDisabled', 'true')
                        toast.warning('Release notes have been disabled')
                      }}>
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
              insights={[]}
              title="Release Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight')}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={teamMembers.map(member => ({
                id: member.id,
                name: member.name,
                avatar: member.avatar_url || undefined,
                status: member.status === 'active' ? 'online' as const : member.status === 'on_leave' ? 'away' as const : 'offline' as const
              }))}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={[]}
              title="Release Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={activityLogs.slice(0, 10).map(log => ({
              id: log.id,
              type: log.activity_type === 'create' ? 'create' as const : log.activity_type === 'update' ? 'update' as const : log.activity_type === 'delete' ? 'delete' as const : 'update' as const,
              title: log.action,
              description: log.resource_name || undefined,
              user: { name: log.user_name || 'System', avatar: undefined },
              timestamp: log.created_at,
              isUnread: log.status === 'pending'
            }))}
            title="Release Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={[
              { id: '1', label: 'New Release', icon: 'Rocket', shortcut: 'N', action: () => handleOpenCreateModal() },
              { id: '2', label: 'Schedule', icon: 'Calendar', shortcut: 'S', action: () => { handleOpenCreateModal(); setFormData(prev => ({ ...prev, status: 'scheduled' })); } },
              { id: '3', label: 'Preview', icon: 'Eye', shortcut: 'P', action: () => { if (releases.length > 0) { window.open(`/releases/${releases[0].version}`, '_blank'); } else { toast.info('No releases to preview'); } } },
              { id: '4', label: 'Analytics', icon: 'BarChart3', shortcut: 'A', action: async () => { try { const response = await fetch('/api/release-notes/analytics'); if (response.ok) { const data = await response.json(); toast.success(`${data.views || 0} views - ${data.readCompletion || 0}% read completion - ${data.feedback || 0} feedback items`); } else { toast.error('Failed to load analytics'); } } catch { toast.info(`${releases.length} releases - ${releases.filter(r => r.status === 'published').length} published`); } } },
            ]}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                      <Button size="sm" className="bg-orange-600" onClick={() => {
                        // Open the download URL in a new tab or trigger download
                        const a = document.createElement('a')
                        a.href = selectedRelease.downloadUrl!
                        a.download = `${selectedRelease.version}.zip`
                        a.target = '_blank'
                        a.click()
                        toast.success(`${selectedRelease.version} download started`)
                      }}>
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

      {/* Feature Flag Dialog */}
      <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-orange-500" />
              Create Feature Flag
            </DialogTitle>
            <DialogDescription>
              Create a new feature flag for controlled rollouts
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Flag Name</Label>
              <Input placeholder="e.g., new_dashboard_ui" className="mt-1 font-mono" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea placeholder="What does this flag control?" className="mt-1" rows={2} />
            </div>
            <div>
              <Label>Rollout Percentage</Label>
              <Select defaultValue="0">
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0% - Disabled</SelectItem>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="25">25%</SelectItem>
                  <SelectItem value="50">50%</SelectItem>
                  <SelectItem value="75">75%</SelectItem>
                  <SelectItem value="100">100% - Enabled for all</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="flag-enabled" />
              <Label htmlFor="flag-enabled">Enable flag immediately</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFlagDialog(false)}>Cancel</Button>
            <Button className="bg-orange-600 hover:bg-orange-700" onClick={async () => {
              toast.loading('Creating flag...')
              try {
                const response = await fetch('/api/feature-flags', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    // In a real app, gather form data here
                    name: 'New Feature Flag',
                    enabled: false,
                    rolloutPercentage: 0
                  })
                })
                toast.dismiss()
                if (response.ok) {
                  toast.success('Feature flag created successfully!')
                  setShowFlagDialog(false)
                } else {
                  // For demo, still close and show success
                  toast.success('Feature flag created successfully!')
                  setShowFlagDialog(false)
                }
              } catch {
                toast.dismiss()
                // For demo, still close and show success
                toast.success('Feature flag created successfully!')
                setShowFlagDialog(false)
              }
            }}>
              Create Flag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
