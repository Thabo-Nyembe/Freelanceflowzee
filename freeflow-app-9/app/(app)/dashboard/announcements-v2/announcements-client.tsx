'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAnnouncements, type AnnouncementType as DBAnnouncementTypeEnum, type AnnouncementStatus as DBAnnouncementStatusEnum, type AnnouncementPriority as DBAnnouncementPriorityEnum } from '@/lib/hooks/use-announcements'
import { useWebhooks, type Webhook as WebhookType } from '@/lib/hooks/use-webhooks'
import { useApiKeys } from '@/lib/hooks/use-api-keys'
import {
  Megaphone,
  Bell,
  Search,
  Plus,
  Eye,
  ThumbsUp,
  MessageSquare,
  Clock,
  Send,
  Edit,
  Trash2,
  Pin,
  PinOff,
  Users,
  Target,
  BarChart3,
  TrendingUp,
  Sparkles,
  Gift,
  AlertTriangle,
  Info,
  CheckCircle,
  Star,
  Heart,
  Share2,
  ExternalLink,
  Globe,
  Smartphone,
  Mail,
  Copy,
  Layers,
  History,
  Settings,
  Image,
  Video,
  FileText,
  Tag,
  Key,
  Webhook,
  Database,
  RefreshCw,
  Palette,
  AlertOctagon,
  Link2,
  Rss,
  Shield,
  Package,
  MessageCircle,
  Inbox,
  Layout,
  Type,
  Download,
  Upload,
  Archive,
  BellRing,
  Slack,
  Braces,
} from 'lucide-react'

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


// Types
type AnnouncementStatus = 'draft' | 'scheduled' | 'published' | 'archived'
type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent' | 'critical'
type AnnouncementType = 'feature' | 'improvement' | 'fix' | 'announcement' | 'promotion' | 'maintenance'
type ReactionType = 'like' | 'love' | 'celebrate' | 'insightful' | 'curious'

interface Author {
  id: string
  name: string
  avatar: string
  role: string
}

interface Reaction {
  type: ReactionType
  count: number
  hasReacted: boolean
}

interface Comment {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  createdAt: string
  likes: number
}

interface SegmentRule {
  attribute: string
  operator: string
  value: string
}

interface Segment {
  id: string
  name: string
  description: string
  rules: SegmentRule[]
  userCount: number
}

interface AnnouncementMetrics {
  views: number
  uniqueViews: number
  clicks: number
  ctr: number
  avgTimeOnPost: number
  shares: number
}

interface Announcement {
  id: string
  title: string
  content: string
  excerpt: string
  type: AnnouncementType
  status: AnnouncementStatus
  priority: AnnouncementPriority
  author: Author
  createdAt: string
  updatedAt: string
  publishedAt?: string
  scheduledAt?: string
  expiresAt?: string
  isPinned: boolean
  isFeatured: boolean
  reactions: Reaction[]
  comments: Comment[]
  metrics: AnnouncementMetrics
  targetSegments: string[]
  channels: ('web' | 'mobile' | 'email' | 'push')[]
  media?: { type: 'image' | 'video'; url: string }[]
  labels: string[]
  version?: string
  relatedAnnouncements: string[]
}

interface ChangelogEntry {
  id: string
  version: string
  title: string
  description: string
  type: AnnouncementType
  changes: string[]
  publishedAt: string
  author: Author
}


const typeIcons: Record<AnnouncementType, React.ReactNode> = {
  feature: <Sparkles className="h-4 w-4" />,
  improvement: <TrendingUp className="h-4 w-4" />,
  fix: <CheckCircle className="h-4 w-4" />,
  announcement: <Megaphone className="h-4 w-4" />,
  promotion: <Gift className="h-4 w-4" />,
  maintenance: <AlertTriangle className="h-4 w-4" />
}

const typeColors: Record<AnnouncementType, string> = {
  feature: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  improvement: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  fix: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  announcement: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  promotion: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  maintenance: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
}

export default function AnnouncementsClient() {
  // Demo mode detection for investor demos
  const { data: nextAuthSession, status: sessionStatus } = useSession()
  const isDemoAccount = nextAuthSession?.user?.email === 'alex@freeflow.io' ||
                        nextAuthSession?.user?.email === 'sarah@freeflow.io' ||
                        nextAuthSession?.user?.email === 'mike@freeflow.io'
  const isSessionLoading = sessionStatus === 'loading'

  // Define adapter variables locally (removed mock data imports)
  const announcementsAIInsights: any[] = []
  const announcementsCollaborators: any[] = []
  const announcementsPredictions: any[] = []
  const announcementsActivities: any[] = []
  const announcementsQuickActions: any[] = []

  // Supabase hook for real database operations
  const {
    announcements: hookAnnouncements,
    loading: hookLoading,
    error: hookError,
    mutating,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    refetch
  } = useAnnouncements()

  // Demo announcements data for investor demos
  const demoAnnouncements = useMemo(() => [
    {
      id: 'demo-ann-1',
      title: 'Platform V2.0 Launch - Major Features Released',
      content: 'We are excited to announce the launch of KAZI Platform V2.0 with AI-powered content creation, enhanced video studio, and improved collaboration tools.',
      announcement_type: 'product' as DBAnnouncementTypeEnum,
      status: 'published' as DBAnnouncementStatusEnum,
      priority: 'high' as DBAnnouncementPriorityEnum,
      created_at: '2026-01-15T10:00:00Z',
      updated_at: '2026-01-15T10:00:00Z',
      published_at: '2026-01-15T10:00:00Z',
      scheduled_for: null,
      expires_at: null,
      is_pinned: true,
      is_featured: true,
      views_count: 1250,
      tags: ['product', 'launch', 'v2.0']
    },
    {
      id: 'demo-ann-2',
      title: 'Scheduled Maintenance - January 30th',
      content: 'We will be performing scheduled maintenance on January 30th from 2:00 AM to 4:00 AM UTC. The platform may be temporarily unavailable during this time.',
      announcement_type: 'maintenance' as DBAnnouncementTypeEnum,
      status: 'scheduled' as DBAnnouncementStatusEnum,
      priority: 'medium' as DBAnnouncementPriorityEnum,
      created_at: '2026-01-20T14:00:00Z',
      updated_at: '2026-01-20T14:00:00Z',
      published_at: null,
      scheduled_for: '2026-01-28T08:00:00Z',
      expires_at: '2026-01-31T00:00:00Z',
      is_pinned: false,
      is_featured: false,
      views_count: 0,
      tags: ['maintenance', 'scheduled']
    },
    {
      id: 'demo-ann-3',
      title: 'New Integration: Slack & Microsoft Teams',
      content: 'Connect your KAZI workspace with Slack and Microsoft Teams for seamless notifications and collaboration.',
      announcement_type: 'feature' as DBAnnouncementTypeEnum,
      status: 'published' as DBAnnouncementStatusEnum,
      priority: 'medium' as DBAnnouncementPriorityEnum,
      created_at: '2026-01-10T09:00:00Z',
      updated_at: '2026-01-10T09:00:00Z',
      published_at: '2026-01-10T09:00:00Z',
      scheduled_for: null,
      expires_at: null,
      is_pinned: false,
      is_featured: true,
      views_count: 890,
      tags: ['integration', 'slack', 'teams']
    },
    {
      id: 'demo-ann-4',
      title: 'Security Update: Enhanced 2FA',
      content: 'We have enhanced our two-factor authentication system with support for hardware security keys and biometric authentication.',
      announcement_type: 'security' as DBAnnouncementTypeEnum,
      status: 'published' as DBAnnouncementStatusEnum,
      priority: 'critical' as DBAnnouncementPriorityEnum,
      created_at: '2026-01-05T16:00:00Z',
      updated_at: '2026-01-05T16:00:00Z',
      published_at: '2026-01-05T16:00:00Z',
      scheduled_for: null,
      expires_at: null,
      is_pinned: true,
      is_featured: false,
      views_count: 2100,
      tags: ['security', '2fa', 'authentication']
    }
  ], [])

  // Use demo data for demo accounts
  const dbAnnouncements = isDemoAccount ? demoAnnouncements : (hookAnnouncements || [])
  const dbLoading = isSessionLoading || (isDemoAccount ? false : hookLoading)
  const dbError = !isSessionLoading && !isDemoAccount && hookError

  // Webhooks hook for real webhook operations
  const {
    webhooks,
    loading: webhooksLoading,
    deleteWebhook,
    createWebhook,
    fetchWebhooks
  } = useWebhooks()

  // API Keys hook for real API key operations
  const {
    keys: apiKeys,
    isLoading: apiKeysLoading,
    createKey: createApiKey,
    deleteKey: deleteApiKey,
    fetchKeys: fetchApiKeys
  } = useApiKeys()

  // File input ref for import
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Export format state
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'xml'>('json')
  const [exportOptions, setExportOptions] = useState({
    announcements: true,
    changelog: true,
    analytics: true,
    segments: false
  })

  // Import options state
  const [importOptions, setImportOptions] = useState({
    skipDuplicates: true,
    overwriteExisting: false
  })

  // Fetch webhooks and API keys on mount
  useEffect(() => {
    fetchWebhooks()
    fetchApiKeys()
  }, [fetchWebhooks, fetchApiKeys])

  // Convert DB announcements to local format for display
  const announcements: Announcement[] = useMemo(() => {
    return dbAnnouncements.map((dbAnn): Announcement => ({
      id: dbAnn.id,
      title: dbAnn.title,
      content: dbAnn.content,
      excerpt: dbAnn.content.substring(0, 100) + '...',
      type: mapDbTypeToLocal(dbAnn.announcement_type),
      status: dbAnn.status as AnnouncementStatus,
      priority: dbAnn.priority as AnnouncementPriority,
      author: { id: '1', name: 'System', avatar: '', role: 'Admin' },
      createdAt: dbAnn.created_at,
      updatedAt: dbAnn.updated_at,
      publishedAt: dbAnn.published_at || undefined,
      scheduledAt: dbAnn.scheduled_for || undefined,
      expiresAt: dbAnn.expires_at || undefined,
      isPinned: dbAnn.is_pinned,
      isFeatured: dbAnn.is_featured,
      reactions: [],
      comments: [],
      metrics: {
        views: dbAnn.views_count,
        uniqueViews: dbAnn.views_count,
        clicks: 0,
        ctr: 0,
        avgTimeOnPost: 0,
        shares: 0
      },
      targetSegments: [],
      channels: ['web'],
      labels: dbAnn.tags || [],
      relatedAnnouncements: []
    }))
  }, [dbAnnouncements])

  const [changelog] = useState<ChangelogEntry[]>([])
  const [segments] = useState<Segment[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<AnnouncementStatus | 'all'>('all')
  const [selectedType, setSelectedType] = useState<AnnouncementType | 'all'>('all')
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [activeTab, setActiveTab] = useState('announcements')
  const [settingsTab, setSettingsTab] = useState('general')

  // Create announcement dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    announcement_type: 'general' as DBAnnouncementTypeEnum,
    priority: 'normal' as DBAnnouncementPriorityEnum,
    status: 'draft' as DBAnnouncementStatusEnum,
    target_audience: 'all' as const,
    is_pinned: false,
    is_featured: false,
    send_email: false,
    send_push: false
  })

  // Additional dialog states
  const [showAddReleaseDialog, setShowAddReleaseDialog] = useState(false)
  const [showCreateSegmentDialog, setShowCreateSegmentDialog] = useState(false)
  const [showEditSegmentDialog, setShowEditSegmentDialog] = useState(false)
  const [showSendToSegmentDialog, setShowSendToSegmentDialog] = useState(false)
  const [showConfigureSlackDialog, setShowConfigureSlackDialog] = useState(false)
  const [showAddWebhookDialog, setShowAddWebhookDialog] = useState(false)
  const [showDeleteWebhookDialog, setShowDeleteWebhookDialog] = useState(false)
  const [showConfigureIntegrationDialog, setShowConfigureIntegrationDialog] = useState(false)
  const [showConnectIntegrationDialog, setShowConnectIntegrationDialog] = useState(false)
  const [showRegenerateApiKeyDialog, setShowRegenerateApiKeyDialog] = useState(false)
  const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false)
  const [showEditTemplateDialog, setShowEditTemplateDialog] = useState(false)
  const [showDeleteTemplateDialog, setShowDeleteTemplateDialog] = useState(false)
  const [showExportDataDialog, setShowExportDataDialog] = useState(false)
  const [showImportDataDialog, setShowImportDataDialog] = useState(false)
  const [showClearCacheDialog, setShowClearCacheDialog] = useState(false)
  const [showArchiveAllDialog, setShowArchiveAllDialog] = useState(false)
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)
  const [showResetSettingsDialog, setShowResetSettingsDialog] = useState(false)
  const [showEditAnnouncementDialog, setShowEditAnnouncementDialog] = useState(false)
  const [showShareAnnouncementDialog, setShowShareAnnouncementDialog] = useState(false)

  // Form states for dialogs
  const [newRelease, setNewRelease] = useState({
    version: '',
    title: '',
    description: '',
    type: 'feature' as AnnouncementType,
    changes: ['']
  })

  const [newSegment, setNewSegment] = useState({
    name: '',
    description: '',
    attribute: '',
    operator: '=',
    value: ''
  })

  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null)

  const [newWebhook, setNewWebhook] = useState({
    url: '',
    events: ['published'] as string[]
  })

  const [selectedWebhook, setSelectedWebhook] = useState<WebhookType | null>(null)

  const [selectedIntegration, setSelectedIntegration] = useState<{ name: string; connected: boolean } | null>(null)

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'feature' as AnnouncementType,
    description: '',
    content: ''
  })

  const [selectedTemplate, setSelectedTemplate] = useState<{ name: string; type: string; description: string } | null>(null)

  const [editingAnnouncement, setEditingAnnouncement] = useState({
    title: '',
    content: ''
  })

  // Helper function to map DB types to local types
  function mapDbTypeToLocal(dbType: string): AnnouncementType {
    const typeMap: Record<string, AnnouncementType> = {
      'general': 'announcement',
      'urgent': 'announcement',
      'update': 'improvement',
      'policy': 'announcement',
      'event': 'promotion',
      'maintenance': 'maintenance',
      'achievement': 'feature',
      'alert': 'announcement'
    }
    return typeMap[dbType] || 'announcement'
  }

  // Helper function to map local types to DB types
  function mapLocalTypeToDb(localType: AnnouncementType): DBAnnouncementTypeEnum {
    const typeMap: Record<AnnouncementType, DBAnnouncementTypeEnum> = {
      'feature': 'achievement',
      'improvement': 'update',
      'fix': 'update',
      'announcement': 'general',
      'promotion': 'event',
      'maintenance': 'maintenance'
    }
    return typeMap[localType] || 'general'
  }

  // Filtered announcements
  const filteredAnnouncements = useMemo(() => {
    let result = announcements

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(a =>
        a.title.toLowerCase().includes(query) ||
        a.content.toLowerCase().includes(query) ||
        a.labels.some(l => l.toLowerCase().includes(query))
      )
    }

    if (selectedStatus !== 'all') {
      result = result.filter(a => a.status === selectedStatus)
    }

    if (selectedType !== 'all') {
      result = result.filter(a => a.type === selectedType)
    }

    return result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()
    })
  }, [announcements, searchQuery, selectedStatus, selectedType])

  // Stats
  const stats = useMemo(() => ({
    total: announcements.length,
    published: announcements.filter(a => a.status === 'published').length,
    scheduled: announcements.filter(a => a.status === 'scheduled').length,
    totalViews: announcements.reduce((sum, a) => sum + a.metrics.views, 0),
    totalReactions: announcements.reduce((sum, a) => sum + a.reactions.reduce((s, r) => s + r.count, 0), 0),
    avgCTR: announcements.filter(a => a.metrics.ctr > 0).length > 0
      ? announcements.filter(a => a.metrics.ctr > 0).reduce((sum, a) => sum + a.metrics.ctr, 0) / announcements.filter(a => a.metrics.ctr > 0).length
      : 0
  }), [announcements])

  const getStatusColor = (status: AnnouncementStatus) => {
    const colors: Record<AnnouncementStatus, string> = {
      draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
      scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      archived: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    }
    return colors[status]
  }

  const getPriorityColor = (priority: AnnouncementPriority) => {
    const colors: Record<AnnouncementPriority, string> = {
      low: 'text-gray-500',
      normal: 'text-blue-500',
      high: 'text-orange-500',
      urgent: 'text-red-500',
      critical: 'text-red-600 font-bold'
    }
    return colors[priority]
  }

  const getReactionIcon = (type: ReactionType) => {
    const icons: Record<ReactionType, React.ReactNode> = {
      like: <ThumbsUp className="h-4 w-4" />,
      love: <Heart className="h-4 w-4" />,
      celebrate: <Star className="h-4 w-4" />,
      insightful: <Sparkles className="h-4 w-4" />,
      curious: <Info className="h-4 w-4" />
    }
    return icons[type]
  }

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null) return '0'
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // Handlers - Real Supabase Operations
  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      toast.error('Validation Error')
      return
    }

    try {
      await createAnnouncement({
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        announcement_type: newAnnouncement.announcement_type,
        priority: newAnnouncement.priority,
        status: newAnnouncement.status,
        target_audience: newAnnouncement.target_audience,
        is_pinned: newAnnouncement.is_pinned,
        is_featured: newAnnouncement.is_featured,
        send_email: newAnnouncement.send_email,
        send_push: newAnnouncement.send_push
      })

      toast.success(`Announcement created and saved as ${newAnnouncement.status}`)

      // Reset form and close dialog
      setNewAnnouncement({
        title: '',
        content: '',
        announcement_type: 'general',
        priority: 'normal',
        status: 'draft',
        target_audience: 'all',
        is_pinned: false,
        is_featured: false,
        send_email: false,
        send_push: false
      })
      setShowCreateDialog(false)
    } catch (error) {
      toast.error('Failed to create announcement')
    }
  }

  const handlePublishAnnouncement = async (id: string, title: string) => {
    try {
      await updateAnnouncement(id, {
        status: 'published',
        published_at: new Date().toISOString()
      })
      toast.success(`Announcement Published: "${title}" is now live`)
      setSelectedAnnouncement(null)
    } catch (error) {
      toast.error('Failed to publish announcement')
    }
  }

  const handleScheduleAnnouncement = async (id: string, title: string, scheduledFor: string) => {
    try {
      await updateAnnouncement(id, {
        status: 'scheduled',
        scheduled_for: scheduledFor
      })
      toast.success(`Announcement Scheduled: "${title}" has been scheduled`)
    } catch (error) {
      toast.error('Failed to schedule announcement')
    }
  }

  const handleArchiveAnnouncement = async (id: string, title: string) => {
    try {
      await updateAnnouncement(id, {
        status: 'archived'
      })
      toast.info(`Announcement Archived: "${title}" moved to archive`)
      setSelectedAnnouncement(null)
    } catch (error) {
      toast.error('Failed to archive announcement')
    }
  }

  const handleDeleteAnnouncement = async (id: string, title: string) => {
    try {
      await deleteAnnouncement(id)
      toast.success(`Announcement Deleted: "${title}" has been permanently deleted`)
      setSelectedAnnouncement(null)
    } catch (error) {
      toast.error('Failed to delete announcement')
    }
  }

  const handlePinAnnouncement = async (id: string, title: string, isPinned: boolean) => {
    try {
      await updateAnnouncement(id, {
        is_pinned: !isPinned
      })
      toast.success(isPinned ? `Announcement Unpinned: "${title}" is no longer pinned` : `Announcement Pinned: "${title}" is now pinned`)
    } catch (error) {
      toast.error('Failed to update pin status')
    }
  }

  // Handler for Add Release - Creates an announcement as a changelog/release entry
  const handleAddRelease = async () => {
    if (!newRelease.version.trim() || !newRelease.title.trim()) {
      toast.error('Validation Error: Version and title are required')
      return
    }

    try {
      const releaseContent = `## Version ${newRelease.version}\n\n${newRelease.description}\n\n### Changes\n${newRelease.changes.filter(c => c.trim()).map(c => `- ${c}`).join('\n')}`

      await createAnnouncement({
        title: `Release ${newRelease.version}: ${newRelease.title}`,
        content: releaseContent,
        announcement_type: mapLocalTypeToDb(newRelease.type),
        priority: 'normal',
        status: 'published',
        target_audience: 'all',
        is_pinned: false,
        is_featured: true,
        send_email: false,
        send_push: false,
        tags: ['release', 'changelog', newRelease.version]
      })

      toast.success(`Release Added: ${newRelease.version} has been added to the changelog`)
      setNewRelease({ version: '', title: '', description: '', type: 'feature', changes: [''] })
      setShowAddReleaseDialog(false)
    } catch (error) {
      toast.error('Failed to add release')
    }
  }

  // Handler for Create Segment - Saves segment to the database
  const handleCreateSegment = async () => {
    if (!newSegment.name.trim()) {
      toast.error('Validation Error: Segment name is required')
      return
    }

    try {
      const response = await fetch('/api/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSegment.name,
          description: newSegment.description,
          rules: newSegment.attribute ? [{
            attribute: newSegment.attribute,
            operator: newSegment.operator,
            value: newSegment.value
          }] : []
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create segment')
      }

      toast.success(`Segment Created: "${newSegment.name}" segment has been created`)
      setNewSegment({ name: '', description: '', attribute: '', operator: '=', value: '' })
      setShowCreateSegmentDialog(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create segment')
    }
  }

  // Handler for Edit Segment - Updates segment in the database
  const handleEditSegment = async () => {
    if (!selectedSegment) return

    try {
      const response = await fetch(`/api/segments/${selectedSegment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedSegment.name,
          description: selectedSegment.description,
          rules: selectedSegment.rules
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update segment')
      }

      toast.success(`Segment Updated: "${selectedSegment.name}" segment has been updated`)
      setShowEditSegmentDialog(false)
      setSelectedSegment(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update segment')
    }
  }

  // Handler for Send to Segment - Sends announcement to segment users
  const handleSendToSegment = async () => {
    if (!selectedSegment || !selectedAnnouncement) return

    try {
      const response = await fetch('/api/announcements/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          announcement_id: selectedAnnouncement.id,
          segment_id: selectedSegment.id,
          channels: selectedAnnouncement.channels || ['web']
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to send announcement')
      }

      const result = await response.json()
      toast.success(`Announcement Sent to ${result.sent_count || selectedSegment.userCount} users in "${selectedSegment.name}"`)
      setShowSendToSegmentDialog(false)
      setSelectedSegment(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send announcement to segment')
    }
  }

  // Handler for Configure Slack - Saves Slack integration configuration
  const handleConfigureSlack = async () => {
    try {
      const response = await fetch('/api/integrations/slack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'configure',
          enabled: true,
          settings: {
            notifications: true,
            channel: '#announcements'
          }
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to configure Slack')
      }

      toast.success('Slack Configuration Updated')
      setShowConfigureSlackDialog(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to configure Slack')
    }
  }

  // Handler for Add Webhook - Creates a new webhook subscription
  const handleAddWebhook = async () => {
    if (!newWebhook.url.trim()) {
      toast.error('Validation Error: Webhook URL is required')
      return
    }

    // Validate URL format
    try {
      new URL(newWebhook.url)
    } catch {
      toast.error('Validation Error: Invalid URL format')
      return
    }

    try {
      const result = await createWebhook({
        name: `Announcements Webhook`,
        url: newWebhook.url,
        events: newWebhook.events,
        status: 'active',
        description: 'Webhook for announcement events'
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to create webhook')
      }

      toast.success(`Webhook Added: listening to ${newWebhook.events.length} events`)
      setNewWebhook({ url: '', events: ['published'] })
      setShowAddWebhookDialog(false)
      fetchWebhooks()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add webhook')
    }
  }

  // Handler for Delete Webhook
  const handleDeleteWebhook = async () => {
    if (!selectedWebhook) {
      toast.error('No webhook selected')
      return
    }
    try {
      const result = await deleteWebhook(selectedWebhook.id)
      if (result.success) {
        toast.success('Webhook Deleted')
        fetchWebhooks()
      } else {
        toast.error(result.error || 'Failed to delete webhook')
      }
    } catch (err) {
      toast.error('Failed to delete webhook')
    } finally {
      setShowDeleteWebhookDialog(false)
      setSelectedWebhook(null)
    }
  }

  // Handler for Configure Integration - Saves integration configuration
  const handleConfigureIntegration = async () => {
    if (!selectedIntegration) return

    try {
      const response = await fetch('/api/integrations/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integration_name: selectedIntegration.name,
          enabled: selectedIntegration.connected,
          settings: {}
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to configure integration')
      }

      toast.success(`Integration Updated: ${selectedIntegration.name} configuration has been saved`)
      setShowConfigureIntegrationDialog(false)
      setSelectedIntegration(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to configure integration')
    }
  }

  // Handler for Connect Integration - Connects a new integration
  const handleConnectIntegration = async () => {
    if (!selectedIntegration) return

    try {
      const response = await fetch('/api/integrations/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integration_name: selectedIntegration.name,
          action: 'connect'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to connect integration')
      }

      toast.success(`Integration Connected: ${selectedIntegration.name} has been successfully connected`)
      setShowConnectIntegrationDialog(false)
      setSelectedIntegration(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to connect integration')
    }
  }

  // Handler for Regenerate API Key
  const handleRegenerateApiKey = async () => {
    try {
      // Delete existing active API key if any
      const activeKey = apiKeys.find(k => k.status === 'active' && k.key_type === 'api')
      if (activeKey) {
        await deleteApiKey(activeKey.id)
      }
      // Create a new API key
      const newKey = await createApiKey({
        name: 'Announcements API Key',
        description: 'Auto-generated API key for announcements integration',
        key_type: 'api',
        permission: 'write',
        environment: 'production',
        scopes: ['announcements:read', 'announcements:write']
      })
      toast.success(`API Key Regenerated: New key created (${newKey.key_prefix})`)
      fetchApiKeys()
    } catch (err) {
      toast.error('Failed to regenerate API key')
    } finally {
      setShowRegenerateApiKeyDialog(false)
    }
  }

  // Handler for Copy to Clipboard
  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`Copied to Clipboard: ${label} has been copied to your clipboard`)
  }

  // Handler for New Template - Creates a new announcement template
  const handleNewTemplate = async () => {
    if (!newTemplate.name.trim()) {
      toast.error('Validation Error: Template name is required')
      return
    }

    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          name: newTemplate.name,
          description: newTemplate.description,
          category: 'announcements',
          type: newTemplate.type,
          features: [newTemplate.content],
          tags: ['announcement-template']
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create template')
      }

      toast.success(`Template Created: "${newTemplate.name}" template has been created`)
      setNewTemplate({ name: '', type: 'feature', description: '', content: '' })
      setShowNewTemplateDialog(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create template')
    }
  }

  // Handler for Edit Template - Updates an existing announcement template
  const handleEditTemplate = async () => {
    if (!selectedTemplate) return

    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          id: (selectedTemplate as { id?: string }).id,
          name: selectedTemplate.name,
          description: selectedTemplate.description,
          type: selectedTemplate.type
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update template')
      }

      toast.success(`Template Updated: "${selectedTemplate.name}" template has been updated`)
      setShowEditTemplateDialog(false)
      setSelectedTemplate(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update template')
    }
  }

  // Handler for Delete Template - Deletes an announcement template
  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return

    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          id: (selectedTemplate as { id?: string }).id
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete template')
      }

      toast.success(`Template Deleted: "${selectedTemplate.name}" template has been deleted`)
      setShowDeleteTemplateDialog(false)
      setSelectedTemplate(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete template')
    }
  }

  // Handler for Export Data
  const handleExportData = async () => {
    try {
      const exportData: Record<string, unknown> = {}

      if (exportOptions.announcements) {
        exportData.announcements = announcements
      }
      if (exportOptions.changelog) {
        exportData.changelog = changelog
      }
      if (exportOptions.analytics) {
        exportData.analytics = {
          stats,
          totalViews: stats.totalViews,
          totalReactions: stats.totalReactions
        }
      }
      if (exportOptions.segments) {
        exportData.segments = segments
      }

      let content: string
      let mimeType: string
      let extension: string

      switch (exportFormat) {
        case 'csv':
          // Convert to CSV format (announcements only for CSV)
          const csvHeaders = ['id', 'title', 'content', 'type', 'status', 'priority', 'createdAt', 'publishedAt']
          const csvRows = announcements.map(a =>
            csvHeaders.map(h => {
              const value = a[h as keyof Announcement]
              return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
            }).join(',')
          )
          content = [csvHeaders.join(','), ...csvRows].join('\n')
          mimeType = 'text/csv'
          extension = 'csv'
          break
        case 'xml':
          // Convert to XML format
          const xmlContent = Object.entries(exportData).map(([key, value]) =>
            `<${key}>${JSON.stringify(value)}</${key}>`
          ).join('\n')
          content = `<?xml version="1.0" encoding="UTF-8"?>\n<export>\n${xmlContent}\n</export>`
          mimeType = 'application/xml'
          extension = 'xml'
          break
        case 'json':
        default:
          content = JSON.stringify(exportData, null, 2)
          mimeType = 'application/json'
          extension = 'json'
          break
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `announcements-export-${new Date().toISOString().split('T')[0]}.${extension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success(`Export Complete: Data exported as ${extension.toUpperCase()}`)
    } catch (err) {
      toast.error('Failed to export data')
    } finally {
      setShowExportDataDialog(false)
    }
  }

  // Handler for Import Data
  const handleImportData = () => {
    // Trigger file picker
    fileInputRef.current?.click()
  }

  // Handler for file selection during import
  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      let data: Record<string, unknown>

      if (file.name.endsWith('.json')) {
        data = JSON.parse(text)
      } else if (file.name.endsWith('.csv')) {
        // Parse CSV - basic implementation
        const lines = text.split('\n')
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
        const rows = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
          return headers.reduce((obj, header, i) => {
            obj[header] = values[i]
            return obj
          }, {} as Record<string, string>)
        })
        data = { announcements: rows }
      } else {
        throw new Error('Unsupported file format. Please use JSON or CSV.')
      }

      // Import announcements if present
      if (data.announcements && Array.isArray(data.announcements)) {
        let imported = 0
        let skipped = 0

        for (const ann of data.announcements as Record<string, unknown>[]) {
          // Check for duplicates by title if skipDuplicates is enabled
          if (importOptions.skipDuplicates) {
            const existing = announcements.find(a => a.title === ann.title)
            if (existing && !importOptions.overwriteExisting) {
              skipped++
              continue
            }
          }

          await createAnnouncement({
            title: String(ann.title || 'Imported Announcement'),
            content: String(ann.content || ''),
            announcement_type: 'general',
            priority: 'normal',
            status: 'draft'
          })
          imported++
        }

        toast.success(`Import Complete: ${imported} announcements imported, ${skipped} skipped`)
        refetch?.()
      } else {
        toast.error('No valid announcements found in file')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to import data')
    } finally {
      setShowImportDataDialog(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Handler for Clear Cache
  const handleClearCache = async () => {
    try {
      // Clear localStorage items related to announcements
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('announcement') || key.includes('cache'))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))

      // Clear sessionStorage items related to announcements
      const sessionKeysToRemove: string[] = []
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && (key.includes('announcement') || key.includes('cache'))) {
          sessionKeysToRemove.push(key)
        }
      }
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key))

      // Refetch data to ensure fresh state
      refetch?.()
      fetchWebhooks()
      fetchApiKeys()

      toast.success(`Cache Cleared: ${keysToRemove.length + sessionKeysToRemove.length} cached items removed`)
    } catch (err) {
      toast.error('Failed to clear cache')
    } finally {
      setShowClearCacheDialog(false)
    }
  }

  // Handler for Archive All
  const handleArchiveAll = async () => {
    try {
      const publishedAnnouncements = announcements.filter(a => a.status === 'published')
      for (const ann of publishedAnnouncements) {
        await updateAnnouncement(ann.id, { status: 'archived' })
      }
      toast.success(`All Announcements Archived: ${publishedAnnouncements.length} announcements have been moved to archive`)
    } catch (error) {
      toast.error('Failed to archive announcements')
    }
    setShowArchiveAllDialog(false)
  }

  // Handler for Delete All
  const handleDeleteAll = async () => {
    try {
      for (const ann of announcements) {
        await deleteAnnouncement(ann.id)
      }
      toast.success('All Data Deleted')
    } catch (error) {
      toast.error('Failed to delete data')
    }
    setShowDeleteAllDialog(false)
  }

  // Handler for Reset Settings
  const handleResetSettings = async () => {
    try {
      // Reset all local state to defaults
      setSearchQuery('')
      setSelectedStatus('all')
      setSelectedType('all')
      setSelectedAnnouncement(null)
      setActiveTab('announcements')
      setSettingsTab('general')

      // Reset form states
      setNewAnnouncement({
        title: '',
        content: '',
        announcement_type: 'general',
        priority: 'normal',
        status: 'draft',
        target_audience: 'all',
        is_pinned: false,
        is_featured: false,
        send_email: false,
        send_push: false
      })
      setNewWebhook({ url: '', events: ['published'] })
      setNewTemplate({ name: '', type: 'feature', description: '', content: '' })
      setExportFormat('json')
      setExportOptions({
        announcements: true,
        changelog: true,
        analytics: true,
        segments: false
      })
      setImportOptions({
        skipDuplicates: true,
        overwriteExisting: false
      })

      // Clear announcement-related localStorage items
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('announcement') || key.includes('settings'))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))

      toast.success('Settings Reset: All settings have been restored to defaults')
    } catch (err) {
      toast.error('Failed to reset settings')
    } finally {
      setShowResetSettingsDialog(false)
    }
  }

  // Handler for Edit Announcement
  const handleEditAnnouncement = async () => {
    if (!selectedAnnouncement) return
    if (!editingAnnouncement.title.trim() || !editingAnnouncement.content.trim()) {
      toast.error('Validation Error')
      return
    }
    try {
      await updateAnnouncement(selectedAnnouncement.id, {
        title: editingAnnouncement.title,
        content: editingAnnouncement.content
      })
      toast.success(`Announcement Updated: has been updated`)
      setShowEditAnnouncementDialog(false)
      setSelectedAnnouncement(null)
    } catch (error) {
      toast.error('Failed to update announcement')
    }
  }

  // Handler for Share Announcement
  const handleShareAnnouncement = (channel: 'link' | 'email' | 'twitter' | 'linkedin') => {
    if (!selectedAnnouncement) return
    const shareMessages: Record<string, string> = {
      link: 'Share link copied to clipboard',
      email: 'Email share dialog opened',
      twitter: 'Opening Twitter share dialog',
      linkedin: 'Opening LinkedIn share dialog'
    }
    toast.success('Share Initiated')
    if (channel === 'link') {
      navigator.clipboard.writeText(`https://app.freeflow.com/announcements/${selectedAnnouncement.id}`)
    }
    setShowShareAnnouncementDialog(false)
  }

  // Loading state
  if (dbLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50/30 to-fuchsia-50/40 dark:bg-none dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading announcements...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (dbError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50/30 to-fuchsia-50/40 dark:bg-none dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 font-medium mb-2">Failed to load announcements</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
            {dbError instanceof Error ? dbError.message : 'An unexpected error occurred'}
          </p>
          <Button onClick={() => refetch()} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50/30 to-fuchsia-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Megaphone className="h-8 w-8" />
                Announcements
              </h1>
              <p className="mt-2 text-white/80">
                Share updates, features, and news with your users
              </p>
            </div>
            <Button
              className="bg-white text-violet-600 hover:bg-white/90"
              onClick={() => setShowCreateDialog(true)}
              disabled={mutating}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6 mt-8">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-white/70">Total</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold">{stats.published}</div>
              <div className="text-sm text-white/70">Published</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold">{stats.scheduled}</div>
              <div className="text-sm text-white/70">Scheduled</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold">{formatNumber(stats.totalViews)}</div>
              <div className="text-sm text-white/70">Total Views</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold">{formatNumber(stats.totalReactions)}</div>
              <div className="text-sm text-white/70">Reactions</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold">{stats.avgCTR.toFixed(1)}%</div>
              <div className="text-sm text-white/70">Avg CTR</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800">
            <TabsTrigger value="announcements" className="gap-2">
              <Megaphone className="h-4 w-4" />
              Announcements
            </TabsTrigger>
            <TabsTrigger value="changelog" className="gap-2">
              <History className="h-4 w-4" />
              Changelog
            </TabsTrigger>
            <TabsTrigger value="segments" className="gap-2">
              <Users className="h-4 w-4" />
              Segments
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="announcements" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search announcements..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as AnnouncementStatus | 'all')}
                      className="border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                    >
                      <option value="all">All Status</option>
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>

                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value as AnnouncementType | 'all')}
                      className="border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                    >
                      <option value="all">All Types</option>
                      <option value="feature">Feature</option>
                      <option value="improvement">Improvement</option>
                      <option value="fix">Bug Fix</option>
                      <option value="announcement">Announcement</option>
                      <option value="promotion">Promotion</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Announcements List */}
            <div className="space-y-4">
              {filteredAnnouncements.map(announcement => (
                <Card
                  key={announcement.id}
                  className={`cursor-pointer hover:shadow-lg transition-shadow ${announcement.isPinned ? 'border-violet-200 dark:border-violet-800' : ''}`}
                  onClick={() => setSelectedAnnouncement(announcement)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${typeColors[announcement.type]}`}>
                        {typeIcons[announcement.type]}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {announcement.isPinned && <Pin className="h-4 w-4 text-violet-500" />}
                              {announcement.isFeatured && <Star className="h-4 w-4 text-amber-500 fill-current" />}
                              <h3 className="font-semibold text-lg">{announcement.title}</h3>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2">{announcement.excerpt}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(announcement.status)}>
                              {announcement.status}
                            </Badge>
                            <Badge className={typeColors[announcement.type]}>
                              {announcement.type}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback>{announcement.author.name[0]}</AvatarFallback>
                            </Avatar>
                            <span>{announcement.author.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {announcement.publishedAt
                              ? new Date(announcement.publishedAt).toLocaleDateString()
                              : announcement.scheduledAt
                                ? `Scheduled: ${new Date(announcement.scheduledAt).toLocaleDateString()}`
                                : 'Draft'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {formatNumber(announcement.metrics.views)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {announcement.reactions.map(reaction => (
                              <button
                                key={reaction.type}
                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                                  reaction.hasReacted ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {getReactionIcon(reaction.type)}
                                {reaction.count}
                              </button>
                            ))}
                            {announcement.comments.length > 0 && (
                              <span className="flex items-center gap-1 text-sm text-gray-500">
                                <MessageSquare className="h-4 w-4" />
                                {announcement.comments.length}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {announcement.channels.map(channel => (
                              <span key={channel} className="text-gray-400">
                                {channel === 'web' && <Globe className="h-4 w-4" />}
                                {channel === 'mobile' && <Smartphone className="h-4 w-4" />}
                                {channel === 'email' && <Mail className="h-4 w-4" />}
                                {channel === 'push' && <Bell className="h-4 w-4" />}
                              </span>
                            ))}
                          </div>
                        </div>

                        {announcement.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {announcement.labels.map(label => (
                              <Badge key={label} variant="outline" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {label}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="changelog" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Release History</h2>
              <Button variant="outline" onClick={() => setShowAddReleaseDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Release
              </Button>
            </div>

            <div className="space-y-4">
              {changelog.map((entry, i) => (
                <Card key={entry.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className={`p-3 rounded-xl ${typeColors[entry.type]}`}>
                          {typeIcons[entry.type]}
                        </div>
                        {i < changelog.length - 1 && (
                          <div className="absolute top-14 left-1/2 -translate-x-1/2 w-0.5 h-16 bg-gray-200 dark:bg-gray-700" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Badge className="bg-violet-100 text-violet-700">v{entry.version}</Badge>
                            <h3 className="font-semibold">{entry.title}</h3>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(entry.publishedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-sm text-gray-500 mb-3">{entry.description}</p>

                        <ul className="space-y-2">
                          {entry.changes.map((change, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                              <span>{change}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback>{entry.author.name[0]}</AvatarFallback>
                          </Avatar>
                          <span>{entry.author.name}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="segments" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">User Segments</h2>
              <Button onClick={() => setShowCreateSegmentDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Segment
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {segments.map(segment => (
                <Card key={segment.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{segment.name}</h3>
                        <p className="text-sm text-gray-500">{segment.description}</p>
                      </div>
                      <Badge variant="secondary">
                        <Users className="h-3 w-3 mr-1" />
                        {formatNumber(segment.userCount)}
                      </Badge>
                    </div>

                    {segment.rules.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs text-gray-500 font-medium">Rules</div>
                        {segment.rules.map((rule, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                            <code className="text-violet-600">{rule.attribute}</code>
                            <span className="text-gray-400">{rule.operator}</span>
                            <code className="text-green-600">{rule.value}</code>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedSegment(segment)
                        setShowEditSegmentDialog(true)
                      }}>Edit</Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedSegment(segment)
                        setShowSendToSegmentDialog(true)
                      }}>
                        <Send className="h-4 w-4 mr-2" />
                        Send Announcement
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {announcements.filter(a => a.status === 'published').slice(0, 5).map(a => (
                      <div key={a.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium truncate max-w-[60%]">{a.title}</span>
                          <span className="text-gray-500">{formatNumber(a.metrics.views)} views</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Progress value={a.metrics.ctr} className="flex-1 h-2" />
                          <span className="text-sm font-medium w-16">{a.metrics.ctr.toFixed(1)}% CTR</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Top Reactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(['like', 'love', 'celebrate'] as ReactionType[]).map(type => {
                        const total = announcements.reduce((sum, a) => {
                          const reaction = a.reactions.find(r => r.type === type)
                          return sum + (reaction?.count || 0)
                        }, 0)
                        return (
                          <div key={type} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getReactionIcon(type)}
                              <span className="capitalize">{type}</span>
                            </div>
                            <span className="font-semibold">{formatNumber(total)}</span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Channel Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { channel: 'Web', icon: <Globe className="h-4 w-4" />, reach: 45230 },
                        { channel: 'Mobile', icon: <Smartphone className="h-4 w-4" />, reach: 28900 },
                        { channel: 'Email', icon: <Mail className="h-4 w-4" />, reach: 52340 },
                        { channel: 'Push', icon: <Bell className="h-4 w-4" />, reach: 18900 }
                      ].map(item => (
                        <div key={item.channel} className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-gray-600">
                            {item.icon}
                            <span>{item.channel}</span>
                          </div>
                          <span className="font-semibold">{formatNumber(item.reach)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Announcements Settings</h2>
                <p className="text-sm text-gray-500">Configure your announcement platform preferences</p>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', icon: Settings, label: 'General' },
                        { id: 'delivery', icon: Send, label: 'Delivery' },
                        { id: 'notifications', icon: Bell, label: 'Notifications' },
                        { id: 'integrations', icon: Link2, label: 'Integrations' },
                        { id: 'templates', icon: FileText, label: 'Templates' },
                        { id: 'advanced', icon: Braces, label: 'Advanced' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                            settingsTab === item.id
                              ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
                              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Layout className="h-5 w-5" />
                          Display Preferences
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Default View</Label>
                            <Select defaultValue="cards">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cards">Card View</SelectItem>
                                <SelectItem value="list">List View</SelectItem>
                                <SelectItem value="compact">Compact View</SelectItem>
                                <SelectItem value="timeline">Timeline View</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Items Per Page</Label>
                            <Select defaultValue="10">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">10 items</SelectItem>
                                <SelectItem value="25">25 items</SelectItem>
                                <SelectItem value="50">50 items</SelectItem>
                                <SelectItem value="100">100 items</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Show Pinned First</div>
                            <div className="text-sm text-gray-500">Always display pinned announcements at the top</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Show Reactions</div>
                            <div className="text-sm text-gray-500">Display reaction counts on announcement cards</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Show View Count</div>
                            <div className="text-sm text-gray-500">Display view metrics on announcement cards</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Megaphone className="h-5 w-5" />
                          Announcement Defaults
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Default Status</Label>
                            <Select defaultValue="draft">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">Published Immediately</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Default Priority</Label>
                            <Select defaultValue="normal">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Default Target Segments</Label>
                          <Select defaultValue="all">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Users</SelectItem>
                              <SelectItem value="pro">Pro Users Only</SelectItem>
                              <SelectItem value="enterprise">Enterprise Only</SelectItem>
                              <SelectItem value="new">New Users (30 days)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Enable Comments</div>
                            <div className="text-sm text-gray-500">Allow users to comment on announcements by default</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Enable Reactions</div>
                            <div className="text-sm text-gray-500">Allow users to react to announcements by default</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="h-5 w-5" />
                          Platform Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Timezone</Label>
                            <Select defaultValue="utc">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="utc">UTC</SelectItem>
                                <SelectItem value="est">Eastern Time (ET)</SelectItem>
                                <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                                <SelectItem value="cet">Central European Time (CET)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Date Format</Label>
                            <Select defaultValue="relative">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="relative">Relative (2 days ago)</SelectItem>
                                <SelectItem value="short">Short (Mar 15)</SelectItem>
                                <SelectItem value="long">Long (March 15, 2024)</SelectItem>
                                <SelectItem value="iso">ISO (2024-03-15)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Localization</div>
                            <div className="text-sm text-gray-500">Enable multi-language support for announcements</div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Delivery Settings */}
                {settingsTab === 'delivery' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Send className="h-5 w-5" />
                          Delivery Channels
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Globe className="h-5 w-5 text-blue-500" />
                            <div>
                              <div className="font-medium">Web</div>
                              <div className="text-sm text-gray-500">Display announcements in the web app</div>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Smartphone className="h-5 w-5 text-green-500" />
                            <div>
                              <div className="font-medium">Mobile App</div>
                              <div className="text-sm text-gray-500">Show in mobile app feed</div>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-purple-500" />
                            <div>
                              <div className="font-medium">Email</div>
                              <div className="text-sm text-gray-500">Send email notifications for announcements</div>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <BellRing className="h-5 w-5 text-amber-500" />
                            <div>
                              <div className="font-medium">Push Notifications</div>
                              <div className="text-sm text-gray-500">Send push notifications for urgent announcements</div>
                            </div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          Scheduling
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Default Schedule Time</Label>
                            <Select defaultValue="9am">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="9am">9:00 AM</SelectItem>
                                <SelectItem value="12pm">12:00 PM</SelectItem>
                                <SelectItem value="3pm">3:00 PM</SelectItem>
                                <SelectItem value="6pm">6:00 PM</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Optimal Day</Label>
                            <Select defaultValue="tuesday">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="monday">Monday</SelectItem>
                                <SelectItem value="tuesday">Tuesday</SelectItem>
                                <SelectItem value="wednesday">Wednesday</SelectItem>
                                <SelectItem value="thursday">Thursday</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Smart Scheduling</div>
                            <div className="text-sm text-gray-500">Automatically schedule based on user engagement patterns</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Timezone Optimization</div>
                            <div className="text-sm text-gray-500">Deliver at optimal local time for each user</div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Delivery Rules
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Rate Limit</Label>
                            <Select defaultValue="5">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 per day</SelectItem>
                                <SelectItem value="3">3 per day</SelectItem>
                                <SelectItem value="5">5 per day</SelectItem>
                                <SelectItem value="unlimited">Unlimited</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Priority Override</Label>
                            <Select defaultValue="urgent">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All priorities</SelectItem>
                                <SelectItem value="urgent">Urgent and above</SelectItem>
                                <SelectItem value="critical">Critical only</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Respect Quiet Hours</div>
                            <div className="text-sm text-gray-500">Don't send notifications during user quiet hours</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Batch Similar Announcements</div>
                            <div className="text-sm text-gray-500">Group related announcements into a digest</div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Mail className="h-5 w-5" />
                          Email Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">New Announcement Published</div>
                            <div className="text-sm text-gray-500">Notify admins when announcements go live</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Engagement Milestones</div>
                            <div className="text-sm text-gray-500">Get notified when announcements reach engagement goals</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Comment Notifications</div>
                            <div className="text-sm text-gray-500">Receive emails for new comments on announcements</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Weekly Digest</div>
                            <div className="text-sm text-gray-500">Receive a weekly summary of announcement performance</div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Slack className="h-5 w-5" />
                          Slack Integration
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-200 dark:border-violet-800">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                              <Slack className="h-6 w-6 text-violet-600" />
                            </div>
                            <div>
                              <div className="font-medium">Slack Connected</div>
                              <div className="text-sm text-gray-500">#announcements channel</div>
                            </div>
                            <Badge className="ml-auto bg-green-100 text-green-700">Active</Badge>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setShowConfigureSlackDialog(true)}>Configure Channel</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Post New Announcements</div>
                            <div className="text-sm text-gray-500">Share new announcements to Slack automatically</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Engagement Alerts</div>
                            <div className="text-sm text-gray-500">Post when announcements get significant engagement</div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="h-5 w-5" />
                          Webhooks
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="border rounded-lg divide-y">
                          {webhooksLoading ? (
                            <div className="p-4 text-center text-gray-500">Loading webhooks...</div>
                          ) : webhooks.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">No webhooks configured</div>
                          ) : (
                            webhooks.map((webhook) => (
                              <div key={webhook.id} className="p-4 flex items-center justify-between">
                                <div>
                                  <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{webhook.url}</code>
                                  <div className="flex items-center gap-2 mt-2">
                                    {webhook.events.map(event => (
                                      <Badge key={event} variant="secondary" className="text-xs">{event}</Badge>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={webhook.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{webhook.status}</Badge>
                                  <Button variant="ghost" size="sm" onClick={() => {
                                    setSelectedWebhook(webhook)
                                    setShowDeleteWebhookDialog(true)
                                  }}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => setShowAddWebhookDialog(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Webhook
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Link2 className="h-5 w-5" />
                          Connected Services
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Intercom', icon: MessageCircle, description: 'Sync with Intercom messenger', connected: true, color: 'text-blue-500' },
                          { name: 'Segment', icon: Layers, description: 'Track announcement events', connected: true, color: 'text-green-500' },
                          { name: 'Amplitude', icon: BarChart3, description: 'Analyze engagement metrics', connected: false, color: 'text-purple-500' },
                          { name: 'Zendesk', icon: Inbox, description: 'Convert feedback to tickets', connected: false, color: 'text-teal-500' },
                          { name: 'Productboard', icon: Package, description: 'Link to product roadmap', connected: true, color: 'text-orange-500' },
                        ].map((integration) => (
                          <div key={integration.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <integration.icon className={`h-6 w-6 ${integration.color}`} />
                              <div>
                                <div className="font-medium">{integration.name}</div>
                                <div className="text-sm text-gray-500">{integration.description}</div>
                              </div>
                            </div>
                            {integration.connected ? (
                              <div className="flex items-center gap-2">
                                <Badge className="bg-green-100 text-green-700">Connected</Badge>
                                <Button variant="ghost" size="sm" onClick={() => {
                                  setSelectedIntegration({ name: integration.name, connected: integration.connected })
                                  setShowConfigureIntegrationDialog(true)
                                }}>Configure</Button>
                              </div>
                            ) : (
                              <Button variant="outline" size="sm" onClick={() => {
                                setSelectedIntegration({ name: integration.name, connected: integration.connected })
                                setShowConnectIntegrationDialog(true)
                              }}>Connect</Button>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="h-5 w-5" />
                          API Access
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-medium">API Key</div>
                            <Button variant="outline" size="sm" onClick={() => setShowRegenerateApiKeyDialog(true)}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Regenerate
                            </Button>
                          </div>
                          {apiKeysLoading ? (
                            <div className="text-sm text-gray-500">Loading API keys...</div>
                          ) : apiKeys.length === 0 ? (
                            <div className="text-sm text-gray-500">No API key configured. Click Regenerate to create one.</div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <code className="flex-1 bg-white dark:bg-gray-900 px-3 py-2 rounded border text-sm">
                                {apiKeys[0]?.key_prefix || 'No key available'}
                              </code>
                              <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(apiKeys[0]?.key_prefix || '', 'API Key')}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="text-2xl font-bold">
                              {apiKeys.length > 0 ? apiKeys.reduce((sum, k) => sum + k.requests_this_month, 0).toLocaleString() : '0'}
                            </div>
                            <div className="text-sm text-gray-500">API Calls (30 days)</div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="text-2xl font-bold">
                              {apiKeys.length > 0 ? `${apiKeys[0]?.rate_limit_per_hour || 1000}/hr` : 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">Rate Limit</div>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => window.open('https://docs.freeflow.com/api/announcements', '_blank')}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View API Documentation
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Rss className="h-5 w-5" />
                          RSS & Embeds
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="font-medium mb-2">RSS Feed URL</div>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 bg-white dark:bg-gray-900 px-3 py-2 rounded border text-sm truncate">
                              https://app.freeflow.com/feed/announcements.xml
                            </code>
                            <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard('https://app.freeflow.com/feed/announcements.xml', 'RSS Feed URL')}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="font-medium mb-2">Embed Widget Code</div>
                          <pre className="bg-white dark:bg-gray-900 p-3 rounded border text-xs overflow-x-auto">
{`<script src="https://cdn.freeflow.com/embed.js"></script>
<div data-freeflow-announcements></div>`}
                          </pre>
                          <Button variant="outline" size="sm" className="mt-2" onClick={() => handleCopyToClipboard('<script src="https://cdn.freeflow.com/embed.js"></script>\n<div data-freeflow-announcements></div>', 'Embed Code')}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Code
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Templates Settings */}
                {settingsTab === 'templates' && (
                  <>
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Announcement Templates
                          </CardTitle>
                          <Button size="sm" onClick={() => setShowNewTemplateDialog(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Template
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Feature Release', type: 'feature', description: 'Template for new feature announcements', uses: 24 },
                          { name: 'Bug Fix Update', type: 'fix', description: 'Template for bug fix notifications', uses: 18 },
                          { name: 'Maintenance Notice', type: 'maintenance', description: 'Scheduled maintenance announcement', uses: 12 },
                          { name: 'Promotional Offer', type: 'promotion', description: 'Sales and promotional announcements', uses: 8 },
                        ].map((template) => (
                          <div key={template.name} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${typeColors[template.type as AnnouncementType]}`}>
                                {typeIcons[template.type as AnnouncementType]}
                              </div>
                              <div>
                                <div className="font-medium">{template.name}</div>
                                <div className="text-sm text-gray-500">{template.description}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-500">{template.uses} uses</span>
                              <Button variant="ghost" size="sm" onClick={() => {
                                setSelectedTemplate({ name: template.name, type: template.type, description: template.description })
                                setShowEditTemplateDialog(true)
                              }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => {
                                setSelectedTemplate({ name: template.name, type: template.type, description: template.description })
                                setShowDeleteTemplateDialog(true)
                              }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Palette className="h-5 w-5" />
                          Branding
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Primary Color</Label>
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-lg bg-violet-600 border"></div>
                              <Input defaultValue="#7C3AED" className="font-mono" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Secondary Color</Label>
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-lg bg-fuchsia-600 border"></div>
                              <Input defaultValue="#C026D3" className="font-mono" />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Logo</Label>
                          <div className="border-2 border-dashed rounded-lg p-8 text-center">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <div className="text-sm text-gray-500">Drop your logo here or click to upload</div>
                            <div className="text-xs text-gray-400 mt-1">PNG, SVG up to 2MB</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Show "Powered by" Badge</div>
                            <div className="text-sm text-gray-500">Display branding on public changelog</div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Type className="h-5 w-5" />
                          Content Formatting
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Enable Markdown</div>
                            <div className="text-sm text-gray-500">Allow markdown formatting in announcements</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Enable HTML</div>
                            <div className="text-sm text-gray-500">Allow HTML content in announcements</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Auto-embed Links</div>
                            <div className="text-sm text-gray-500">Automatically embed YouTube, Twitter, and other media</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Database className="h-5 w-5" />
                          Data Management
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-2xl font-bold">{announcements.length}</div>
                            <div className="text-sm text-gray-500">Announcements</div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-2xl font-bold">{changelog.length}</div>
                            <div className="text-sm text-gray-500">Changelog Entries</div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-2xl font-bold">2.4 MB</div>
                            <div className="text-sm text-gray-500">Storage Used</div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1" onClick={() => setShowExportDataDialog(true)}>
                            <Download className="h-4 w-4 mr-2" />
                            Export All Data
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={() => setShowImportDataDialog(true)}>
                            <Upload className="h-4 w-4 mr-2" />
                            Import Data
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <RefreshCw className="h-5 w-5" />
                          Cache & Performance
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Enable CDN Caching</div>
                            <div className="text-sm text-gray-500">Cache announcements at edge locations</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Cache TTL</Label>
                          <Select defaultValue="3600">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="300">5 minutes</SelectItem>
                              <SelectItem value="900">15 minutes</SelectItem>
                              <SelectItem value="3600">1 hour</SelectItem>
                              <SelectItem value="86400">24 hours</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => setShowClearCacheDialog(true)}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Clear All Caches
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Access Control
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Require Approval</div>
                            <div className="text-sm text-gray-500">Announcements need admin approval before publishing</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Two-Person Rule</div>
                            <div className="text-sm text-gray-500">Require two approvals for critical announcements</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="space-y-2">
                          <Label>Allowed Publishers</Label>
                          <Select defaultValue="admins">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admins">Admins Only</SelectItem>
                              <SelectItem value="editors">Editors & Above</SelectItem>
                              <SelectItem value="all">All Team Members</SelectItem>
                            </SelectContent>
                          </Select>
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
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-600">Archive All Announcements</div>
                            <div className="text-sm text-gray-500">Move all published announcements to archive</div>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => setShowArchiveAllDialog(true)}>
                            <Archive className="h-4 w-4 mr-2" />
                            Archive All
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-600">Delete All Data</div>
                            <div className="text-sm text-gray-500">Permanently delete all announcements and analytics</div>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => setShowDeleteAllDialog(true)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete All
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-600">Reset to Defaults</div>
                            <div className="text-sm text-gray-500">Reset all settings to factory defaults</div>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => setShowResetSettingsDialog(true)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reset
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={announcementsAIInsights}
              title="Announcements Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight')}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={announcementsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={announcementsPredictions}
              title="Engagement Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={announcementsActivities}
            title="Announcement Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={announcementsQuickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* Announcement Detail Dialog */}
      <Dialog open={!!selectedAnnouncement} onOpenChange={() => setSelectedAnnouncement(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          {selectedAnnouncement && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={typeColors[selectedAnnouncement.type]}>
                    {typeIcons[selectedAnnouncement.type]}
                    <span className="ml-1">{selectedAnnouncement.type}</span>
                  </Badge>
                  <Badge className={getStatusColor(selectedAnnouncement.status)}>
                    {selectedAnnouncement.status}
                  </Badge>
                  {selectedAnnouncement.version && (
                    <Badge variant="outline">v{selectedAnnouncement.version}</Badge>
                  )}
                </div>
                <DialogTitle className="text-2xl">{selectedAnnouncement.title}</DialogTitle>
              </DialogHeader>

              <ScrollArea className="flex-1">
                <div className="space-y-6 pr-4">
                  {/* Meta */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>{selectedAnnouncement.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <span>{selectedAnnouncement.author.name}</span>
                    </div>
                    <span>•</span>
                    <span>{selectedAnnouncement.publishedAt
                      ? new Date(selectedAnnouncement.publishedAt).toLocaleDateString()
                      : 'Not published'}</span>
                  </div>

                  {/* Content */}
                  <div className="prose dark:prose-invert max-w-none">
                    <p>{selectedAnnouncement.content}</p>
                  </div>

                  {/* Media */}
                  {selectedAnnouncement.media && selectedAnnouncement.media.length > 0 && (
                    <div className="space-y-4">
                      {selectedAnnouncement.media.map((m, i) => (
                        <div key={i} className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-video flex items-center justify-center">
                          {m.type === 'image' ? (
                            <Image className="h-16 w-16 text-gray-400"  loading="lazy"/>
                          ) : (
                            <Video className="h-16 w-16 text-gray-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Metrics */}
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-3">Performance</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{formatNumber(selectedAnnouncement.metrics.views)}</div>
                          <div className="text-sm text-gray-500">Views</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{selectedAnnouncement.metrics.ctr.toFixed(1)}%</div>
                          <div className="text-sm text-gray-500">CTR</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{formatNumber(selectedAnnouncement.metrics.shares)}</div>
                          <div className="text-sm text-gray-500">Shares</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Reactions */}
                  <div>
                    <h4 className="font-medium mb-3">Reactions</h4>
                    <div className="flex items-center gap-3">
                      {selectedAnnouncement.reactions.map(reaction => (
                        <button
                          key={reaction.type}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
                            reaction.hasReacted ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {getReactionIcon(reaction.type)}
                          <span className="capitalize">{reaction.type}</span>
                          <span className="font-medium">{reaction.count}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Labels */}
                  {selectedAnnouncement.labels.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Labels</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedAnnouncement.labels.map(label => (
                          <Badge key={label} variant="secondary">
                            <Tag className="h-3 w-3 mr-1" />
                            {label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t">
                    {/* Publish button - only show for drafts/scheduled */}
                    {(selectedAnnouncement.status === 'draft' || selectedAnnouncement.status === 'scheduled') && (
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handlePublishAnnouncement(selectedAnnouncement.id, selectedAnnouncement.title)}
                        disabled={mutating}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Publish
                      </Button>
                    )}

                    {/* Archive button - show for published announcements */}
                    {selectedAnnouncement.status === 'published' && (
                      <Button
                        variant="outline"
                        onClick={() => handleArchiveAnnouncement(selectedAnnouncement.id, selectedAnnouncement.title)}
                        disabled={mutating}
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </Button>
                    )}

                    <Button variant="outline" onClick={() => {
                      setEditingAnnouncement({
                        title: selectedAnnouncement.title,
                        content: selectedAnnouncement.content
                      })
                      setShowEditAnnouncementDialog(true)
                    }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" onClick={() => setShowShareAnnouncementDialog(true)}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>

                    {/* Pin/Unpin button */}
                    <Button
                      variant="outline"
                      onClick={() => handlePinAnnouncement(selectedAnnouncement.id, selectedAnnouncement.title, selectedAnnouncement.isPinned)}
                      disabled={mutating}
                    >
                      {selectedAnnouncement.isPinned ? (
                        <>
                          <PinOff className="h-4 w-4 mr-2" />
                          Unpin
                        </>
                      ) : (
                        <>
                          <Pin className="h-4 w-4 mr-2" />
                          Pin
                        </>
                      )}
                    </Button>

                    {/* Delete button */}
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => handleDeleteAnnouncement(selectedAnnouncement.id, selectedAnnouncement.title)}
                      disabled={mutating}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Announcement Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-violet-600" />
              Create New Announcement
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter announcement title..."
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                placeholder="Write your announcement content..."
                className="min-h-[120px]"
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
              />
            </div>

            {/* Type and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={newAnnouncement.announcement_type}
                  onValueChange={(value: DBAnnouncementTypeEnum) => setNewAnnouncement(prev => ({ ...prev, announcement_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="policy">Policy</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="achievement">Achievement</SelectItem>
                    <SelectItem value="alert">Alert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={newAnnouncement.priority}
                  onValueChange={(value: DBAnnouncementPriorityEnum) => setNewAnnouncement(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select
                value={newAnnouncement.target_audience}
                onValueChange={(value: 'all' | 'employees' | 'customers' | 'partners' | 'admins' | 'specific') => setNewAnnouncement(prev => ({ ...prev, target_audience: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="employees">Employees Only</SelectItem>
                  <SelectItem value="customers">Customers Only</SelectItem>
                  <SelectItem value="partners">Partners Only</SelectItem>
                  <SelectItem value="admins">Admins Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <div className="font-medium text-sm">Pin Announcement</div>
                  <div className="text-xs text-gray-500">Keep this at the top of the list</div>
                </div>
                <Switch
                  checked={newAnnouncement.is_pinned}
                  onCheckedChange={(checked) => setNewAnnouncement(prev => ({ ...prev, is_pinned: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <div className="font-medium text-sm">Featured</div>
                  <div className="text-xs text-gray-500">Highlight this announcement</div>
                </div>
                <Switch
                  checked={newAnnouncement.is_featured}
                  onCheckedChange={(checked) => setNewAnnouncement(prev => ({ ...prev, is_featured: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <div className="font-medium text-sm">Send Email</div>
                  <div className="text-xs text-gray-500">Email this announcement to target audience</div>
                </div>
                <Switch
                  checked={newAnnouncement.send_email}
                  onCheckedChange={(checked) => setNewAnnouncement(prev => ({ ...prev, send_email: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <div className="font-medium text-sm">Push Notification</div>
                  <div className="text-xs text-gray-500">Send push notification to users</div>
                </div>
                <Switch
                  checked={newAnnouncement.send_push}
                  onCheckedChange={(checked) => setNewAnnouncement(prev => ({ ...prev, send_push: checked }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={mutating}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setNewAnnouncement(prev => ({ ...prev, status: 'draft' }))
                handleCreateAnnouncement()
              }}
              disabled={mutating}
            >
              Save as Draft
            </Button>
            <Button
              className="bg-violet-600 hover:bg-violet-700"
              onClick={() => {
                setNewAnnouncement(prev => ({ ...prev, status: 'published' }))
                handleCreateAnnouncement()
              }}
              disabled={mutating}
            >
              {mutating ? 'Publishing...' : 'Publish Now'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Release Dialog */}
      <Dialog open={showAddReleaseDialog} onOpenChange={setShowAddReleaseDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-violet-600" />
              Add New Release
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label>Version</Label>
                <Input
                  placeholder="e.g., 3.1.0"
                  value={newRelease.version}
                  onChange={(e) => setNewRelease(prev => ({ ...prev, version: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={newRelease.type}
                  onValueChange={(value: AnnouncementType) => setNewRelease(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="improvement">Improvement</SelectItem>
                    <SelectItem value="fix">Bug Fix</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Release title..."
                value={newRelease.title}
                onChange={(e) => setNewRelease(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe what's in this release..."
                value={newRelease.description}
                onChange={(e) => setNewRelease(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Changes (one per line)</Label>
              <Textarea
                placeholder="- Added new feature&#10;- Fixed bug&#10;- Improved performance"
                value={newRelease.changes.join('\n')}
                onChange={(e) => setNewRelease(prev => ({ ...prev, changes: e.target.value.split('\n') }))}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddReleaseDialog(false)}>Cancel</Button>
            <Button onClick={handleAddRelease}>Add Release</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Segment Dialog */}
      <Dialog open={showCreateSegmentDialog} onOpenChange={setShowCreateSegmentDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-violet-600" />
              Create User Segment
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Segment Name</Label>
              <Input
                placeholder="e.g., Power Users"
                value={newSegment.name}
                onChange={(e) => setNewSegment(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Describe this segment..."
                value={newSegment.description}
                onChange={(e) => setNewSegment(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Rule</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
                <Select
                  value={newSegment.attribute}
                  onValueChange={(value) => setNewSegment(prev => ({ ...prev, attribute: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Attribute" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plan">Plan</SelectItem>
                    <SelectItem value="created_at">Created At</SelectItem>
                    <SelectItem value="country">Country</SelectItem>
                    <SelectItem value="role">Role</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={newSegment.operator}
                  onValueChange={(value) => setNewSegment(prev => ({ ...prev, operator: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="=">equals</SelectItem>
                    <SelectItem value="!=">not equals</SelectItem>
                    <SelectItem value=">">greater than</SelectItem>
                    <SelectItem value="<">less than</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Value"
                  value={newSegment.value}
                  onChange={(e) => setNewSegment(prev => ({ ...prev, value: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateSegmentDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateSegment}>Create Segment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Segment Dialog */}
      <Dialog open={showEditSegmentDialog} onOpenChange={setShowEditSegmentDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-violet-600" />
              Edit Segment
            </DialogTitle>
          </DialogHeader>
          {selectedSegment && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Segment Name</Label>
                <Input defaultValue={selectedSegment.name} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input defaultValue={selectedSegment.description} />
              </div>
              {selectedSegment.rules.length > 0 && (
                <div className="space-y-2">
                  <Label>Rules</Label>
                  {selectedSegment.rules.map((rule, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                      <code className="text-violet-600">{rule.attribute}</code>
                      <span className="text-gray-400">{rule.operator}</span>
                      <code className="text-green-600">{rule.value}</code>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditSegmentDialog(false)}>Cancel</Button>
            <Button onClick={handleEditSegment}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send to Segment Dialog */}
      <Dialog open={showSendToSegmentDialog} onOpenChange={setShowSendToSegmentDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-violet-600" />
              Send Announcement to Segment
            </DialogTitle>
          </DialogHeader>
          {selectedSegment && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                <div className="font-medium">{selectedSegment.name}</div>
                <div className="text-sm text-gray-500">{selectedSegment.description}</div>
                <div className="text-sm text-violet-600 mt-2">
                  {formatNumber(selectedSegment.userCount)} users will receive this announcement
                </div>
              </div>
              <div className="space-y-2">
                <Label>Select Announcement</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an announcement" />
                  </SelectTrigger>
                  <SelectContent>
                    {announcements.filter(a => a.status === 'published').map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Delivery Channels</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
                  <div className="flex items-center gap-2 p-2 border rounded-lg">
                    <Switch defaultChecked />
                    <span className="text-sm">Email</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 border rounded-lg">
                    <Switch />
                    <span className="text-sm">Push Notification</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendToSegmentDialog(false)}>Cancel</Button>
            <Button onClick={handleSendToSegment}>Send Announcement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Configure Slack Dialog */}
      <Dialog open={showConfigureSlackDialog} onOpenChange={setShowConfigureSlackDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Slack className="h-5 w-5 text-violet-600" />
              Configure Slack Integration
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Channel</Label>
              <Select defaultValue="announcements">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="announcements">#announcements</SelectItem>
                  <SelectItem value="general">#general</SelectItem>
                  <SelectItem value="product-updates">#product-updates</SelectItem>
                  <SelectItem value="team">#team</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notification Settings</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm">Include preview image</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm">Mention @channel for urgent</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm">Include metrics in updates</span>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigureSlackDialog(false)}>Cancel</Button>
            <Button onClick={handleConfigureSlack}>Save Configuration</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Webhook Dialog */}
      <Dialog open={showAddWebhookDialog} onOpenChange={setShowAddWebhookDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-violet-600" />
              Add Webhook
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <Input
                placeholder="https://api.example.com/webhooks/..."
                value={newWebhook.url}
                onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Events</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
                {['published', 'updated', 'archived', 'deleted'].map(event => (
                  <div key={event} className="flex items-center gap-2 p-2 border rounded-lg">
                    <Switch
                      checked={newWebhook.events.includes(event)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewWebhook(prev => ({ ...prev, events: [...prev.events, event] }))
                        } else {
                          setNewWebhook(prev => ({ ...prev, events: prev.events.filter(e => e !== event) }))
                        }
                      }}
                    />
                    <span className="text-sm capitalize">{event}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddWebhookDialog(false)}>Cancel</Button>
            <Button onClick={handleAddWebhook}>Add Webhook</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Webhook Dialog */}
      <Dialog open={showDeleteWebhookDialog} onOpenChange={setShowDeleteWebhookDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Webhook
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">Are you sure you want to delete this webhook? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteWebhookDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteWebhook}>Delete Webhook</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Configure Integration Dialog */}
      <Dialog open={showConfigureIntegrationDialog} onOpenChange={setShowConfigureIntegrationDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-violet-600" />
              Configure {selectedIntegration?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input type="password" defaultValue="••••••••••••••••" />
            </div>
            <div className="space-y-2">
              <Label>Sync Settings</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm">Auto-sync announcements</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm">Sync user engagement data</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm">Enable bidirectional sync</span>
                  <Switch />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigureIntegrationDialog(false)}>Cancel</Button>
            <Button onClick={handleConfigureIntegration}>Save Configuration</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Connect Integration Dialog */}
      <Dialog open={showConnectIntegrationDialog} onOpenChange={setShowConnectIntegrationDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-violet-600" />
              Connect {selectedIntegration?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-gray-600">
              Connect your {selectedIntegration?.name} account to enable seamless integration with your announcements.
            </p>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input placeholder="Enter your API key..." />
            </div>
            <div className="space-y-2">
              <Label>Workspace ID (optional)</Label>
              <Input placeholder="Enter workspace ID..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConnectIntegrationDialog(false)}>Cancel</Button>
            <Button onClick={handleConnectIntegration}>Connect</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Regenerate API Key Dialog */}
      <Dialog open={showRegenerateApiKeyDialog} onOpenChange={setShowRegenerateApiKeyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <RefreshCw className="h-5 w-5" />
              Regenerate API Key
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to regenerate your API key? Your current key will be invalidated immediately and any applications using it will stop working.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegenerateApiKeyDialog(false)}>Cancel</Button>
            <Button onClick={handleRegenerateApiKey}>Regenerate Key</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Template Dialog */}
      <Dialog open={showNewTemplateDialog} onOpenChange={setShowNewTemplateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-violet-600" />
              Create New Template
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input
                  placeholder="e.g., Weekly Update"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={newTemplate.type}
                  onValueChange={(value: AnnouncementType) => setNewTemplate(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="improvement">Improvement</SelectItem>
                    <SelectItem value="fix">Bug Fix</SelectItem>
                    <SelectItem value="promotion">Promotion</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Describe when to use this template..."
                value={newTemplate.description}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Template Content</Label>
              <Textarea
                placeholder="Write your template content here..."
                value={newTemplate.content}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                className="min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTemplateDialog(false)}>Cancel</Button>
            <Button onClick={handleNewTemplate}>Create Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={showEditTemplateDialog} onOpenChange={setShowEditTemplateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-violet-600" />
              Edit Template
            </DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input defaultValue={selectedTemplate.name} />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select defaultValue={selectedTemplate.type}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feature">Feature</SelectItem>
                      <SelectItem value="improvement">Improvement</SelectItem>
                      <SelectItem value="fix">Bug Fix</SelectItem>
                      <SelectItem value="promotion">Promotion</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input defaultValue={selectedTemplate.description} />
              </div>
              <div className="space-y-2">
                <Label>Template Content</Label>
                <Textarea defaultValue="" className="min-h-[120px]" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditTemplateDialog(false)}>Cancel</Button>
            <Button onClick={handleEditTemplate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Template Dialog */}
      <Dialog open={showDeleteTemplateDialog} onOpenChange={setShowDeleteTemplateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Template
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to delete "{selectedTemplate?.name}"? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteTemplateDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteTemplate}>Delete Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Data Dialog */}
      <Dialog open={showExportDataDialog} onOpenChange={setShowExportDataDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-violet-600" />
              Export Data
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={(value: 'json' | 'csv' | 'xml') => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data to Include</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 border rounded-lg">
                  <Switch
                    checked={exportOptions.announcements}
                    onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, announcements: checked }))}
                  />
                  <span className="text-sm">Announcements</span>
                </div>
                <div className="flex items-center gap-2 p-2 border rounded-lg">
                  <Switch
                    checked={exportOptions.changelog}
                    onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, changelog: checked }))}
                  />
                  <span className="text-sm">Changelog Entries</span>
                </div>
                <div className="flex items-center gap-2 p-2 border rounded-lg">
                  <Switch
                    checked={exportOptions.analytics}
                    onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, analytics: checked }))}
                  />
                  <span className="text-sm">Analytics Data</span>
                </div>
                <div className="flex items-center gap-2 p-2 border rounded-lg">
                  <Switch
                    checked={exportOptions.segments}
                    onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, segments: checked }))}
                  />
                  <span className="text-sm">User Segments</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDataDialog(false)}>Cancel</Button>
            <Button onClick={handleExportData}>Export Data</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Data Dialog */}
      <Dialog open={showImportDataDialog} onOpenChange={setShowImportDataDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-violet-600" />
              Import Data
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-violet-400 transition-colors"
              onClick={handleImportData}
            >
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <div className="text-sm text-gray-500">Click to select a file</div>
              <div className="text-xs text-gray-400 mt-1">JSON, CSV up to 10MB</div>
            </div>
            <div className="space-y-2">
              <Label>Import Options</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 border rounded-lg">
                  <Switch
                    checked={importOptions.skipDuplicates}
                    onCheckedChange={(checked) => setImportOptions(prev => ({ ...prev, skipDuplicates: checked }))}
                  />
                  <span className="text-sm">Skip duplicates</span>
                </div>
                <div className="flex items-center gap-2 p-2 border rounded-lg">
                  <Switch
                    checked={importOptions.overwriteExisting}
                    onCheckedChange={(checked) => setImportOptions(prev => ({ ...prev, overwriteExisting: checked }))}
                  />
                  <span className="text-sm">Overwrite existing data</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDataDialog(false)}>Cancel</Button>
            <Button onClick={handleImportData}>Select File</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Cache Dialog */}
      <Dialog open={showClearCacheDialog} onOpenChange={setShowClearCacheDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-violet-600" />
              Clear All Caches
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              This will clear all cached data including CDN caches, browser caches, and server-side caches. Users may experience slightly slower load times temporarily.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearCacheDialog(false)}>Cancel</Button>
            <Button onClick={handleClearCache}>Clear Caches</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive All Dialog */}
      <Dialog open={showArchiveAllDialog} onOpenChange={setShowArchiveAllDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Archive className="h-5 w-5" />
              Archive All Announcements
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to archive all published announcements? They will no longer be visible to users but can be restored later.
            </p>
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                {announcements.filter(a => a.status === 'published').length} announcements will be archived
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowArchiveAllDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleArchiveAll}>Archive All</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete All Dialog */}
      <Dialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete All Data
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              This will permanently delete all announcements, analytics data, and cannot be undone. Please type "DELETE" to confirm.
            </p>
            <Input className="mt-4" placeholder='Type "DELETE" to confirm' />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteAllDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteAll}>Delete All Data</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Settings Dialog */}
      <Dialog open={showResetSettingsDialog} onOpenChange={setShowResetSettingsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <RefreshCw className="h-5 w-5" />
              Reset to Defaults
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              This will reset all settings to their default values. Your announcements and data will not be affected.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetSettingsDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleResetSettings}>Reset Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Announcement Dialog */}
      <Dialog open={showEditAnnouncementDialog} onOpenChange={setShowEditAnnouncementDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-violet-600" />
              Edit Announcement
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={editingAnnouncement.title}
                onChange={(e) => setEditingAnnouncement(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={editingAnnouncement.content}
                onChange={(e) => setEditingAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                className="min-h-[200px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditAnnouncementDialog(false)}>Cancel</Button>
            <Button onClick={handleEditAnnouncement} disabled={mutating}>
              {mutating ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Announcement Dialog */}
      <Dialog open={showShareAnnouncementDialog} onOpenChange={setShowShareAnnouncementDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-violet-600" />
              Share Announcement
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">Share this announcement via:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
              <Button variant="outline" className="flex items-center gap-2" onClick={() => handleShareAnnouncement('link')}>
                <Link2 className="h-4 w-4" />
                Copy Link
              </Button>
              <Button variant="outline" className="flex items-center gap-2" onClick={() => handleShareAnnouncement('email')}>
                <Mail className="h-4 w-4" />
                Email
              </Button>
              <Button variant="outline" className="flex items-center gap-2" onClick={() => handleShareAnnouncement('twitter')}>
                <ExternalLink className="h-4 w-4" />
                Twitter
              </Button>
              <Button variant="outline" className="flex items-center gap-2" onClick={() => handleShareAnnouncement('linkedin')}>
                <ExternalLink className="h-4 w-4" />
                LinkedIn
              </Button>
            </div>
            {selectedAnnouncement && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Direct Link</div>
                <code className="text-sm break-all">
                  https://app.freeflow.com/announcements/{selectedAnnouncement.id}
                </code>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareAnnouncementDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.csv"
        onChange={handleFileSelected}
        className="hidden"
      />
    </div>
  )
}
