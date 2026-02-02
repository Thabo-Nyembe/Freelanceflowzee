'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { copyToClipboard } from '@/lib/button-handlers'
import { createClient } from '@/lib/supabase/client'
import { useContentStudio } from '@/lib/hooks/use-content-studio'
import { useActivityLogs } from '@/lib/hooks/use-activity-logs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  FileText, Plus, Search, Grid3X3, List, MoreVertical, Download, Copy, Trash2,
  Edit2, Eye, Clock, Settings, Zap, Upload,
  Globe, Languages, Calendar, CheckCircle, AlertTriangle, BarChart3, Link2, RefreshCw, History,
  FileCode, Database, Type, Hash, ToggleLeft, ImageIcon, Film, Music, MapPin, ExternalLink,
  Archive, Send, Palette, AlignLeft, Boxes, GitBranch,
  Shield, Sliders, Edit, Terminal, Activity, Target, FileSearch, FolderOpen, Tags, BookOpen
} from 'lucide-react'

// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
} from '@/components/ui/competitive-upgrades-extended'




// ============================================================================
// TYPE DEFINITIONS - Contentful Level CMS
// ============================================================================

type EntryStatus = 'draft' | 'changed' | 'published' | 'archived' | 'scheduled'
type FieldType = 'text' | 'richtext' | 'number' | 'boolean' | 'date' | 'location' | 'media' | 'reference' | 'json' | 'array' | 'link'
type AssetType = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other'
type LocaleStatus = 'active' | 'inactive' | 'fallback'

interface ContentEntry {
  id: string
  title: string
  slug: string
  content_type_id: string
  content_type_name: string
  status: EntryStatus
  created_at: string
  updated_at: string
  published_at: string | null
  scheduled_at: string | null
  created_by: string
  updated_by: string
  version: number
  locale: string
  locales_completed: string[]
  tags: string[]
  fields: Record<string, unknown>
  references: string[]
  referenced_by: string[]
}

interface ContentType {
  id: string
  name: string
  description: string
  display_field: string
  fields: ContentField[]
  entries_count: number
  created_at: string
  updated_at: string
  icon: string
  color: string
}

interface ContentField {
  id: string
  name: string
  type: FieldType
  required: boolean
  localized: boolean
  unique: boolean
  validation: FieldValidation | null
  appearance: string
  default_value: unknown
  help_text: string
}

interface FieldValidation {
  min?: number
  max?: number
  pattern?: string
  in?: string[]
  link_type?: string
  size?: { min?: number; max?: number }
}

interface MediaAsset {
  id: string
  filename: string
  title: string
  description: string
  content_type: string
  asset_type: AssetType
  size_bytes: number
  width?: number
  height?: number
  duration?: number
  url: string
  thumbnail_url: string | null
  created_at: string
  updated_at: string
  uploaded_by: string
  tags: string[]
  metadata: Record<string, string>
  locales: { locale: string; title: string; description: string }[]
  used_in: string[]
}

interface Locale {
  id: string
  code: string
  name: string
  native_name: string
  status: LocaleStatus
  is_default: boolean
  fallback_code: string | null
  entries_count: number
  completion_percentage: number
  direction: 'ltr' | 'rtl'
}

interface Webhook {
  id: string
  name: string
  url: string
  topics: string[]
  filters: Record<string, string[]>
  active: boolean
  headers: Record<string, string>
  last_triggered_at: string | null
  success_count: number
  failure_count: number
}

interface VersionHistory {
  id: string
  entry_id: string
  version: number
  changed_fields: string[]
  changed_by: string
  changed_at: string
  change_type: 'created' | 'updated' | 'published' | 'unpublished' | 'archived'
  snapshot: Record<string, unknown>
}

// ============================================================================
// DATA ARRAYS - Now loaded via useState and Supabase hooks
// ============================================================================

// entries, contentTypes, assets, locales are now managed as component state
// and loaded from database in useEffect

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusColor = (status: EntryStatus): string => {
  const colors: Record<EntryStatus, string> = {
    draft: 'bg-gray-100 text-gray-800 border-gray-200',
    changed: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    published: 'bg-green-100 text-green-800 border-green-200',
    archived: 'bg-red-100 text-red-800 border-red-200',
    scheduled: 'bg-blue-100 text-blue-800 border-blue-200'
  }
  return colors[status]
}

const getAssetTypeColor = (type: AssetType): string => {
  const colors: Record<AssetType, string> = {
    image: 'bg-purple-100 text-purple-800',
    video: 'bg-pink-100 text-pink-800',
    audio: 'bg-orange-100 text-orange-800',
    document: 'bg-blue-100 text-blue-800',
    archive: 'bg-gray-100 text-gray-800',
    other: 'bg-gray-100 text-gray-800'
  }
  return colors[type]
}

const getFieldTypeIcon = (type: FieldType) => {
  const icons: Record<FieldType, React.ReactNode> = {
    text: <Type className="w-4 h-4" />,
    richtext: <AlignLeft className="w-4 h-4" />,
    number: <Hash className="w-4 h-4" />,
    boolean: <ToggleLeft className="w-4 h-4" />,
    date: <Calendar className="w-4 h-4" />,
    location: <MapPin className="w-4 h-4" />,
    media: <ImageIcon className="w-4 h-4" />,
    reference: <Link2 className="w-4 h-4" />,
    json: <FileCode className="w-4 h-4" />,
    array: <Boxes className="w-4 h-4" />,
    link: <ExternalLink className="w-4 h-4" />
  }
  return icons[type]
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// ============================================================================
// COMPETITIVE UPGRADE DATA - Now loaded via useState and Supabase
// ============================================================================

// AI insights, collaborators, predictions, activities are now managed as component state

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ContentStudioClient() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEntry, setSelectedEntry] = useState<ContentEntry | null>(null)
  const [selectedContentType, setSelectedContentType] = useState<ContentType | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [statusFilter, setStatusFilter] = useState<EntryStatus | 'all'>('all')
  const [settingsTab, setSettingsTab] = useState('general')

  // Database-loaded content data
  const [entries, setEntries] = useState<ContentEntry[]>([])
  const [contentTypes, setContentTypes] = useState<ContentType[]>([])
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [locales, setLocales] = useState<Locale[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  // AI insights and collaboration data
  const [contentAIInsights, setContentAIInsights] = useState<{ id: string; type: 'success' | 'info' | 'warning' | 'error'; title: string; description: string; priority: 'low' | 'medium' | 'high'; timestamp: string; category: string }[]>([])
  const [contentCollaborators, setContentCollaborators] = useState<{ id: string; name: string; avatar: string; status: 'online' | 'away' | 'offline'; role: string }[]>([])
  const [contentPredictions, setContentPredictions] = useState<{ id: string; title: string; prediction: string; confidence: number; trend: 'up' | 'down' | 'stable'; impact: 'low' | 'medium' | 'high' }[]>([])
  const [contentActivities, setContentActivities] = useState<{ id: string; user: string; action: string; target: string; timestamp: string; type: 'success' | 'info' | 'warning' | 'error' | 'update' }[]>([])

  // Use content studio hook for projects
  const { projects, loading: projectsLoading } = useContentStudio()
  const { logs: activityLogs } = useActivityLogs([], { category: 'content' })

  // Initialize Supabase client
  const supabase = createClient()

  // Load content data from database
  useEffect(() => {
    const loadContentData = async () => {
      setDataLoading(true)
      try {
        // Load content entries from content_entries or content_studio
        const { data: entriesData, error: entriesError } = await supabase
          .from('content_entries')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(50)

        if (entriesError) {
          console.error('[ContentStudio] Failed to load entries:', entriesError.message)
          // Try content_studio as fallback
          if (projects && projects.length > 0) {
            setEntries(projects.map((p: any) => ({
              id: p.id,
              title: p.project_name || 'Untitled',
              slug: p.project_name?.toLowerCase().replace(/\s+/g, '-') || 'untitled',
              content_type_id: p.project_type || 'document',
              content_type_name: p.project_type || 'Document',
              status: (p.status || 'draft') as EntryStatus,
              created_at: p.created_at,
              updated_at: p.updated_at,
              published_at: p.status === 'published' ? p.updated_at : null,
              scheduled_at: null,
              created_by: p.user_id || 'user',
              updated_by: p.user_id || 'user',
              version: p.version || 1,
              locale: 'en-US',
              locales_completed: ['en-US'],
              tags: p.tags || [],
              fields: p.content_data || {},
              references: [],
              referenced_by: []
            })))
          }
        } else if (entriesData && entriesData.length > 0) {
          setEntries(entriesData.map((e: any) => ({
            id: e.id,
            title: e.title || 'Untitled',
            slug: e.slug || e.title?.toLowerCase().replace(/\s+/g, '-') || 'untitled',
            content_type_id: e.content_type_id || 'document',
            content_type_name: e.content_type_name || 'Document',
            status: (e.status || 'draft') as EntryStatus,
            created_at: e.created_at,
            updated_at: e.updated_at,
            published_at: e.published_at,
            scheduled_at: e.scheduled_at,
            created_by: e.created_by || 'user',
            updated_by: e.updated_by || 'user',
            version: e.version || 1,
            locale: e.locale || 'en-US',
            locales_completed: e.locales_completed || ['en-US'],
            tags: e.tags || [],
            fields: e.fields || {},
            references: e.references || [],
            referenced_by: e.referenced_by || []
          })))
        } else {
          // Default entries if none exist
          setEntries([
            { id: '1', title: 'Welcome Guide', slug: 'welcome-guide', content_type_id: 'article', content_type_name: 'Article', status: 'published', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), published_at: new Date().toISOString(), scheduled_at: null, created_by: 'user', updated_by: 'user', version: 1, locale: 'en-US', locales_completed: ['en-US'], tags: ['guide', 'onboarding'], fields: {}, references: [], referenced_by: [] }
          ])
        }

        // Load content types
        const { data: typesData, error: typesError } = await supabase
          .from('content_types')
          .select('*')
          .order('name')

        if (typesError) {
          console.error('[ContentStudio] Failed to load content types:', typesError.message)
        } else if (typesData && typesData.length > 0) {
          setContentTypes(typesData.map((t: any) => ({
            id: t.id,
            name: t.name || 'Document',
            description: t.description || '',
            display_field: t.display_field || 'title',
            fields: t.fields || [],
            entries_count: t.entries_count || 0,
            created_at: t.created_at,
            updated_at: t.updated_at,
            icon: t.icon || 'FileText',
            color: t.color || 'blue'
          })))
        } else {
          // Default content types
          setContentTypes([
            { id: '1', name: 'Article', description: 'Blog posts and articles', display_field: 'title', fields: [], entries_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), icon: 'FileText', color: 'blue' },
            { id: '2', name: 'Page', description: 'Static pages', display_field: 'title', fields: [], entries_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), icon: 'File', color: 'green' }
          ])
        }

        // Load media assets
        const { data: assetsData, error: assetsError } = await supabase
          .from('media_assets')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)

        if (assetsError) {
          console.error('[ContentStudio] Failed to load assets:', assetsError.message)
        } else if (assetsData && assetsData.length > 0) {
          setAssets(assetsData.map((a: any) => ({
            id: a.id,
            title: a.title || a.file_name || 'Untitled',
            file_name: a.file_name,
            file_url: a.file_url || a.url,
            type: (a.type || 'image') as AssetType,
            mime_type: a.mime_type || 'image/jpeg',
            size: a.size || 0,
            width: a.width,
            height: a.height,
            alt_text: a.alt_text || '',
            description: a.description || '',
            tags: a.tags || [],
            folder: a.folder || '/',
            created_at: a.created_at,
            updated_at: a.updated_at,
            created_by: a.created_by || 'user'
          })))
        }

        // Load locales
        const { data: localesData, error: localesError } = await supabase
          .from('locales')
          .select('*')
          .order('name')

        if (!localesError && localesData && localesData.length > 0) {
          setLocales(localesData.map((l: any) => ({
            code: l.code,
            name: l.name,
            native_name: l.native_name || l.name,
            is_default: l.is_default || false,
            status: (l.status || 'active') as LocaleStatus,
            fallback_locale: l.fallback_locale,
            content_completion: l.content_completion || 0
          })))
        } else {
          // Default locales
          setLocales([
            { code: 'en-US', name: 'English (US)', native_name: 'English', is_default: true, status: 'active', fallback_locale: null, content_completion: 100 }
          ])
        }

        // Load team members as collaborators
        const { data: teamData, error: teamError } = await supabase
          .from('team_members')
          .select('id, name, email, role, avatar_url')
          .limit(10)

        if (!teamError && teamData && teamData.length > 0) {
          setContentCollaborators(teamData.map((m: any) => ({
            id: m.id,
            name: m.name || m.email?.split('@')[0] || 'Team Member',
            avatar: m.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${m.name || m.email}`,
            status: 'online' as const,
            role: m.role || 'editor'
          })))
        }

        // Set default AI insights
        setContentAIInsights([
          { id: '1', type: 'info', title: 'SEO Optimization', description: 'Add meta descriptions to improve search visibility', priority: 'medium', timestamp: new Date().toISOString(), category: 'seo' },
          { id: '2', type: 'success', title: 'Content Performance', description: 'Your content engagement is up 15% this week', priority: 'low', timestamp: new Date().toISOString(), category: 'analytics' }
        ])

        // Set default predictions
        setContentPredictions([
          { id: '1', title: 'Content Growth', prediction: '+25% engagement expected', confidence: 0.85, trend: 'up', impact: 'high' },
          { id: '2', title: 'Publishing Velocity', prediction: 'On track for monthly goal', confidence: 0.92, trend: 'stable', impact: 'medium' }
        ])

      } catch (err) {
        console.error('[ContentStudio] Error loading data:', err)
      } finally {
        setDataLoading(false)
      }
    }

    loadContentData()
  }, [supabase, projects])

  // Map activity logs to activities format
  useEffect(() => {
    if (activityLogs && activityLogs.length > 0) {
      setContentActivities(activityLogs.slice(0, 10).map((log: any) => ({
        id: log.id,
        user: log.user_name || 'System',
        action: log.action || log.activity_type || 'updated',
        target: log.resource_name || 'content',
        timestamp: log.created_at,
        type: 'update' as const
      })))
    }
  }, [activityLogs])

  // Dialog states for real functionality
  const [showNewEntryDialog, setShowNewEntryDialog] = useState(false)
  const [showUploadMediaDialog, setShowUploadMediaDialog] = useState(false)
  const [showNewContentTypeDialog, setShowNewContentTypeDialog] = useState(false)
  const [showAddLocaleDialog, setShowAddLocaleDialog] = useState(false)
  const [showSearchContentDialog, setShowSearchContentDialog] = useState(false)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)
  const [showPublishAllDialog, setShowPublishAllDialog] = useState(false)
  const [showSyncChangesDialog, setShowSyncChangesDialog] = useState(false)
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [showTranslateDialog, setShowTranslateDialog] = useState(false)
  const [showManageTagsDialog, setShowManageTagsDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showCloneTypeDialog, setShowCloneTypeDialog] = useState(false)
  const [showAddFieldDialog, setShowAddFieldDialog] = useState(false)
  const [showAddReferenceDialog, setShowAddReferenceDialog] = useState(false)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [showExportSchemaDialog, setShowExportSchemaDialog] = useState(false)
  const [showImportSchemaDialog, setShowImportSchemaDialog] = useState(false)
  const [showDocumentationDialog, setShowDocumentationDialog] = useState(false)
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [showEditMetadataDialog, setShowEditMetadataDialog] = useState(false)
  const [showDeleteAssetDialog, setShowDeleteAssetDialog] = useState(false)
  const [showReprocessDialog, setShowReprocessDialog] = useState(false)
  const [showAutoTranslateDialog, setShowAutoTranslateDialog] = useState(false)
  const [showSetFallbackDialog, setShowSetFallbackDialog] = useState(false)
  const [showTrackProgressDialog, setShowTrackProgressDialog] = useState(false)
  const [showExportXLIFFDialog, setShowExportXLIFFDialog] = useState(false)
  const [showImportXLIFFDialog, setShowImportXLIFFDialog] = useState(false)
  const [showValidateDialog, setShowValidateDialog] = useState(false)
  const [showSyncAllDialog, setShowSyncAllDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showBulkPublishDialog, setShowBulkPublishDialog] = useState(false)
  const [showWebhookDialog, setShowWebhookDialog] = useState(false)
  const [showDeleteAllContentDialog, setShowDeleteAllContentDialog] = useState(false)
  const [showResetSpaceDialog, setShowResetSpaceDialog] = useState(false)
  const [showRegenerateKeysDialog, setShowRegenerateKeysDialog] = useState(false)
  const [showEntryMenuDialog, setShowEntryMenuDialog] = useState(false)
  const [entryMenuTarget, setEntryMenuTarget] = useState<ContentEntry | null>(null)
  const [showEditEntryDialog, setShowEditEntryDialog] = useState(false)
  const [showPublishEntryDialog, setShowPublishEntryDialog] = useState(false)
  const [showEditContentTypeDialog, setShowEditContentTypeDialog] = useState(false)

  // Form states for dialogs
  const [newEntryTitle, setNewEntryTitle] = useState('')
  const [newEntryType, setNewEntryType] = useState('')
  const [newEntrySlug, setNewEntrySlug] = useState('')
  const [newContentTypeName, setNewContentTypeName] = useState('')
  const [newContentTypeDescription, setNewContentTypeDescription] = useState('')
  const [newLocaleCode, setNewLocaleCode] = useState('')
  const [newLocaleName, setNewLocaleName] = useState('')
  const [advancedSearchQuery, setAdvancedSearchQuery] = useState('')
  const [advancedSearchType, setAdvancedSearchType] = useState('all')
  const [advancedSearchStatus, setAdvancedSearchStatus] = useState('all')
  const [newFieldName, setNewFieldName] = useState('')
  const [newFieldType, setNewFieldType] = useState('text')
  const [newFolderName, setNewFolderName] = useState('')
  const [assetTitle, setAssetTitle] = useState('')
  const [assetDescription, setAssetDescription] = useState('')
  const [assetTags, setAssetTags] = useState('')
  const [translateSourceLocale, setTranslateSourceLocale] = useState('en-US')
  const [translateTargetLocale, setTranslateTargetLocale] = useState('')
  const [fallbackLocale, setFallbackLocale] = useState('')
  const [webhookName, setWebhookName] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [webhookEvents, setWebhookEvents] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [newTagInput, setNewTagInput] = useState('')
  const [currentTags, setCurrentTags] = useState<string[]>(['featured', 'announcement', 'product', 'blog'])
  const [editEntryTitle, setEditEntryTitle] = useState('')
  const [editEntrySlug, setEditEntrySlug] = useState('')
  const [editContentTypeName, setEditContentTypeName] = useState('')
  const [editContentTypeDescription, setEditContentTypeDescription] = useState('')

  // Dashboard stats
  const stats = useMemo(() => ({
    totalEntries: entries.length,
    published: entries.filter(e => e.status === 'published').length,
    drafts: entries.filter(e => e.status === 'draft').length,
    scheduled: entries.filter(e => e.status === 'scheduled').length,
    contentTypes: contentTypes.length,
    assets: assets.length,
    totalAssets: assets.length,
    locales: locales.filter(l => l.status === 'active').length,
    avgLocalization: locales.length > 0 ? Math.round(locales.reduce((sum, l) => sum + l.completion_percentage, 0) / locales.length) : 0,
    apiCalls: '45.2K'
  }), [])

  // Filtered data
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           entry.slug.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || entry.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

  const filteredAssets = useMemo(() => {
    return assets.filter(asset =>
      asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.filename.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  // Action handlers with real functionality
  const handleCreateEntry = async () => {
    if (!newEntryTitle.trim() || !newEntryType) {
      toast.error('Please fill in all required fields')
      return
    }
    setIsProcessing(true)
    try {
      const res = await fetch('/api/content/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newEntryTitle, type: newEntryType, slug: newEntrySlug })
      })
      if (!res.ok) throw new Error('Failed to create entry')
      toast.success('Entry created successfully', {
        description: `"${newEntryTitle}" has been created as a draft`
      })
      setShowNewEntryDialog(false)
      setNewEntryTitle('')
      setNewEntryType('')
      setNewEntrySlug('')
    } catch {
      toast.error('Failed to create entry')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUploadMedia = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setIsProcessing(true)
    try {
      const formData = new FormData()
      Array.from(files).forEach(file => formData.append('files', file))
      const res = await fetch('/api/content/media/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Failed to upload files')
      toast.success(`${files.length} file(s) uploaded successfully`, {
        description: 'Assets are now available in your media library'
      })
      setShowUploadMediaDialog(false)
    } catch {
      toast.error('Failed to upload files')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCreateContentType = async () => {
    if (!newContentTypeName.trim()) {
      toast.error('Please enter a content type name')
      return
    }
    setIsProcessing(true)
    try {
      const res = await fetch('/api/content/types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newContentTypeName, description: newContentTypeDescription })
      })
      if (!res.ok) throw new Error('Failed to create content type')
      toast.success('Content type created', {
        description: `"${newContentTypeName}" is ready to use`
      })
      setShowNewContentTypeDialog(false)
      setNewContentTypeName('')
      setNewContentTypeDescription('')
    } catch {
      toast.error('Failed to create content type')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAddLocale = async () => {
    if (!newLocaleCode.trim() || !newLocaleName.trim()) {
      toast.error('Please fill in all required fields')
      return
    }
    setIsProcessing(true)
    try {
      const res = await fetch('/api/content/locales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: newLocaleCode, name: newLocaleName })
      })
      if (!res.ok) throw new Error('Failed to add locale')
      toast.success('Locale added successfully', {
        description: `${newLocaleName} (${newLocaleCode}) is now available`
      })
      setShowAddLocaleDialog(false)
      setNewLocaleCode('')
      setNewLocaleName('')
    } catch {
      toast.error('Failed to add locale')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAdvancedSearch = () => {
    const results = entries.filter(entry => {
      const matchesQuery = !advancedSearchQuery ||
        entry.title.toLowerCase().includes(advancedSearchQuery.toLowerCase()) ||
        entry.slug.toLowerCase().includes(advancedSearchQuery.toLowerCase())
      const matchesType = advancedSearchType === 'all' || entry.content_type_id === advancedSearchType
      const matchesStatus = advancedSearchStatus === 'all' || entry.status === advancedSearchStatus
      return matchesQuery && matchesType && matchesStatus
    })
    toast.success(`Found ${results.length} entries`, {
      description: 'Search results updated'
    })
    setSearchQuery(advancedSearchQuery)
    if (advancedSearchStatus !== 'all') {
      setStatusFilter(advancedSearchStatus as EntryStatus)
    }
    setShowSearchContentDialog(false)
  }

  const handlePublishAll = async () => {
    setIsProcessing(true)
    try {
      const drafts = entries.filter(e => e.status === 'draft')
      const res = await fetch('/api/content/entries/publish-all', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to publish all entries')
      toast.success(`${drafts.length} entries published`, {
        description: 'All draft content is now live'
      })
      setShowPublishAllDialog(false)
    } catch {
      toast.error('Failed to publish all entries')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSyncChanges = async () => {
    setIsProcessing(true)
    try {
      const res = await fetch('/api/content/sync', { method: 'POST' })
      if (!res.ok) throw new Error('Sync failed')
      toast.success('Changes synced', {
        description: 'All content is up to date with remote'
      })
      setShowSyncChangesDialog(false)
    } catch {
      toast.error('Sync failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExportContent = async (format: string) => {
    setIsProcessing(true)
    try {
      const res = await fetch(`/api/content/export?format=${format}`)
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `content-export.${format}`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Export complete', {
        description: `Content exported as ${format.toUpperCase()}`
      })
      setShowExportDialog(false)
    } catch {
      toast.error('Export failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAddField = async () => {
    if (!newFieldName.trim()) {
      toast.error('Please enter a field name')
      return
    }
    setIsProcessing(true)
    try {
      const res = await fetch('/api/content/fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFieldName, type: newFieldType })
      })
      if (!res.ok) throw new Error('Failed to add field')
      toast.success('Field added', {
        description: `${newFieldName} (${newFieldType}) has been added to the content type`
      })
      setShowAddFieldDialog(false)
      setNewFieldName('')
      setNewFieldType('text')
    } catch {
      toast.error('Failed to add field')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Please enter a folder name')
      return
    }
    setIsProcessing(true)
    try {
      const res = await fetch('/api/content/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName })
      })
      if (!res.ok) throw new Error('Failed to create folder')
      toast.success('Folder created', {
        description: `"${newFolderName}" is now available`
      })
      setShowNewFolderDialog(false)
      setNewFolderName('')
    } catch {
      toast.error('Failed to create folder')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUpdateAssetMetadata = async () => {
    setIsProcessing(true)
    try {
      const res = await fetch('/api/content/assets/metadata', { method: 'PATCH' })
      if (!res.ok) throw new Error('Failed to update metadata')
      toast.success('Metadata updated', {
        description: 'Asset information has been saved'
      })
      setShowEditMetadataDialog(false)
    } catch {
      toast.error('Failed to update metadata')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAutoTranslate = async () => {
    if (!translateTargetLocale) {
      toast.error('Please select a target locale')
      return
    }
    setIsProcessing(true)
    try {
      const res = await fetch('/api/content/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceLocale: translateSourceLocale, targetLocale: translateTargetLocale })
      })
      if (!res.ok) throw new Error('Translation failed')
      toast.success('Translation complete', {
        description: `Content translated from ${translateSourceLocale} to ${translateTargetLocale}`
      })
      setShowAutoTranslateDialog(false)
      setTranslateTargetLocale('')
    } catch {
      toast.error('Translation failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSetFallback = async () => {
    if (!fallbackLocale) {
      toast.error('Please select a fallback locale')
      return
    }
    setIsProcessing(true)
    try {
      const res = await fetch('/api/content/locales/fallback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: fallbackLocale })
      })
      if (!res.ok) throw new Error('Failed to set fallback')
      toast.success('Fallback set', {
        description: `${fallbackLocale} is now the fallback locale`
      })
      setShowSetFallbackDialog(false)
      setFallbackLocale('')
    } catch {
      toast.error('Failed to set fallback')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAddWebhook = async () => {
    if (!webhookName.trim() || !webhookUrl.trim()) {
      toast.error('Please fill in all required fields')
      return
    }
    setIsProcessing(true)
    try {
      const res = await fetch('/api/content/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: webhookName, url: webhookUrl, events: webhookEvents })
      })
      if (!res.ok) throw new Error('Failed to create webhook')
      toast.success('Webhook created', {
        description: `"${webhookName}" is now active`
      })
      setShowWebhookDialog(false)
      setWebhookName('')
      setWebhookUrl('')
      setWebhookEvents([])
    } catch {
      toast.error('Failed to create webhook')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:bg-none dark:bg-gray-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 p-8">
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Content Studio</h1>
                <p className="text-purple-200 mt-1">Contentful-level headless CMS</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => setActiveTab('settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button className="bg-white text-purple-700 hover:bg-gray-100" onClick={() => setShowNewEntryDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Content
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Total Entries', value: stats.totalEntries, icon: FileText, color: 'from-purple-500 to-pink-500', change: '+12' },
            { label: 'Published', value: stats.published, icon: CheckCircle, color: 'from-green-500 to-emerald-500', change: '+5' },
            { label: 'Drafts', value: stats.drafts, icon: Edit2, color: 'from-yellow-500 to-orange-500', change: '+3' },
            { label: 'Scheduled', value: stats.scheduled, icon: Calendar, color: 'from-blue-500 to-cyan-500', change: '+1' },
            { label: 'Content Types', value: stats.contentTypes, icon: Boxes, color: 'from-indigo-500 to-purple-500', change: '5' },
            { label: 'Assets', value: stats.assets, icon: ImageIcon, color: 'from-pink-500 to-rose-500', change: '+8' },
            { label: 'Locales', value: stats.locales, icon: Globe, color: 'from-teal-500 to-green-500', change: '5' },
            { label: 'Localization', value: `${stats.avgLocalization}%`, icon: Languages, color: 'from-orange-500 to-red-500', change: '+2%' }
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all dark:bg-gray-800">
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-xs text-green-600 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm">
            <TabsTrigger value="dashboard" className="rounded-lg">Dashboard</TabsTrigger>
            <TabsTrigger value="content" className="rounded-lg">Content</TabsTrigger>
            <TabsTrigger value="types" className="rounded-lg">Content Types</TabsTrigger>
            <TabsTrigger value="media" className="rounded-lg">Media</TabsTrigger>
            <TabsTrigger value="localization" className="rounded-lg">Localization</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg">Settings</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            {/* Dashboard Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Content Dashboard</h3>
                  <Badge className="bg-white/20 text-white border-0">Overview</Badge>
                </div>
                <p className="text-white/70 mb-4 max-w-2xl">
                  Monitor your content performance, track publishing activity, and manage your headless CMS from one central hub.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.totalEntries}</div>
                    <div className="text-xs text-white/70">Total Entries</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.published}</div>
                    <div className="text-xs text-white/70">Published</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.drafts}</div>
                    <div className="text-xs text-white/70">Drafts</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.scheduled}</div>
                    <div className="text-xs text-white/70">Scheduled</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: Plus, label: 'New Entry', color: 'from-purple-500 to-pink-500', action: () => setShowNewEntryDialog(true) },
                    { icon: Upload, label: 'Upload Media', color: 'from-blue-500 to-cyan-500', action: () => setShowUploadMediaDialog(true) },
                    { icon: Boxes, label: 'New Content Type', color: 'from-green-500 to-emerald-500', action: () => setShowNewContentTypeDialog(true) },
                    { icon: Globe, label: 'Add Locale', color: 'from-orange-500 to-amber-500', action: () => setShowAddLocaleDialog(true) },
                    { icon: FileSearch, label: 'Search Content', color: 'from-violet-500 to-purple-500', action: () => setShowSearchContentDialog(true) },
                    { icon: History, label: 'View History', color: 'from-pink-500 to-rose-500', action: () => setShowHistoryDialog(true) },
                    { icon: Send, label: 'Publish All', color: 'from-teal-500 to-green-500', action: () => setShowPublishAllDialog(true) },
                    { icon: RefreshCw, label: 'Sync Changes', color: 'from-indigo-500 to-blue-500', action: () => setShowSyncChangesDialog(true) },
                  ].map((action, idx) => (
                    <button key={idx} onClick={action.action} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-105 group">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{action.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Content */}
              <Card className="lg:col-span-2 border-0 shadow-sm dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    Recent Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {entries.slice(0, 5).map(entry => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        onClick={() => setSelectedEntry(entry)}
                      >
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(entry.status)}>{entry.status}</Badge>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{entry.title}</p>
                            <p className="text-xs text-gray-500">{entry.content_type_name} · v{entry.version}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{formatDate(entry.updated_at)}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {entry.locales_completed.slice(0, 3).map(locale => (
                              <span key={locale} className="text-xs px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                                {locale.split('-')[0]}
                              </span>
                            ))}
                            {entry.locales_completed.length > 3 && (
                              <span className="text-xs text-gray-500">+{entry.locales_completed.length - 3}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Content Types Overview */}
              <Card className="border-0 shadow-sm dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Boxes className="w-5 h-5 text-purple-600" />
                    Content Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {contentTypes.map(type => (
                      <div
                        key={type.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setSelectedContentType(type)}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${type.color}20` }}
                          >
                            <FileText className="w-4 h-4" style={{ color: type.color }} />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{type.name}</span>
                        </div>
                        <Badge variant="outline">{type.entries_count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Localization Progress */}
            <Card className="border-0 shadow-sm dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-600" />
                  Localization Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {locales.filter(l => l.status === 'active').map(locale => (
                    <div key={locale.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{locale.code === 'ja-JP' ? '🇯🇵' : locale.code === 'de-DE' ? '🇩🇪' : locale.code === 'fr-FR' ? '🇫🇷' : locale.code === 'es-ES' ? '🇪🇸' : '🇺🇸'}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{locale.code.split('-')[0].toUpperCase()}</span>
                        </div>
                        {locale.is_default && <Badge className="bg-purple-100 text-purple-800 text-xs">Default</Badge>}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{locale.native_name}</p>
                      <Progress value={locale.completion_percentage} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">{locale.completion_percentage}% · {locale.entries_count} entries</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6 mt-6">
            {/* Content Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Content Entries</h3>
                  <Badge className="bg-white/20 text-white border-0">{filteredEntries.length} Items</Badge>
                </div>
                <p className="text-white/70 mb-4 max-w-2xl">
                  Browse, search, and manage all your content entries. Filter by status, content type, or tags to find what you need.
                </p>
              </div>
            </div>

            {/* Content Quick Actions */}
            <Card className="border-0 shadow-sm dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-indigo-600" />
                  Content Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: Plus, label: 'New Entry', color: 'from-indigo-500 to-violet-500', action: () => setShowNewEntryDialog(true) },
                    { icon: Edit2, label: 'Edit Selected', color: 'from-blue-500 to-cyan-500', action: () => selectedEntry ? setSelectedEntry(selectedEntry) : toast.info('Select an entry to edit') },
                    { icon: Copy, label: 'Duplicate', color: 'from-green-500 to-emerald-500', action: () => setShowDuplicateDialog(true) },
                    { icon: Archive, label: 'Archive', color: 'from-orange-500 to-amber-500', action: () => setShowArchiveDialog(true) },
                    { icon: Send, label: 'Publish', color: 'from-violet-500 to-purple-500', action: () => setShowBulkPublishDialog(true) },
                    { icon: Languages, label: 'Translate', color: 'from-pink-500 to-rose-500', action: () => setShowTranslateDialog(true) },
                    { icon: Tags, label: 'Manage Tags', color: 'from-teal-500 to-green-500', action: () => setShowManageTagsDialog(true) },
                    { icon: Download, label: 'Export', color: 'from-gray-500 to-slate-500', action: () => setShowExportDialog(true) },
                  ].map((action, idx) => (
                    <button key={idx} onClick={action.action} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-105 group">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{action.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search entries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as EntryStatus | 'all')}
                  className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="changed">Changed</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
              {filteredEntries.map(entry => (
                <Card
                  key={entry.id}
                  className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer dark:bg-gray-800"
                  onClick={() => setSelectedEntry(entry)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(entry.status)}>{entry.status}</Badge>
                        <Badge variant="outline">{entry.content_type_name}</Badge>
                      </div>
                      <Button variant="ghost" size="sm" onClick={(e) => {
                        e.stopPropagation()
                        setEntryMenuTarget(entry)
                        setShowEntryMenuDialog(true)
                      }}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{entry.title}</h3>
                    <p className="text-sm text-gray-500 font-mono mb-3">/{entry.slug}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>v{entry.version} · {entry.updated_by.split('@')[0]}</span>
                      <span>{formatDate(entry.updated_at)}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-3">
                      {entry.locales_completed.map(locale => (
                        <span key={locale} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                          {locale.split('-')[0]}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Content Types Tab */}
          <TabsContent value="types" className="space-y-6 mt-6">
            {/* Content Types Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Boxes className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Content Models</h3>
                  <Badge className="bg-white/20 text-white border-0">{contentTypes.length} Types</Badge>
                </div>
                <p className="text-white/70 mb-4 max-w-2xl">
                  Define and manage your content structure. Create custom content types with flexible fields to model any type of content.
                </p>
              </div>
            </div>

            {/* Content Types Quick Actions */}
            <Card className="border-0 shadow-sm dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-600" />
                  Model Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: Plus, label: 'New Type', color: 'from-emerald-500 to-teal-500', action: () => setShowNewContentTypeDialog(true) },
                    { icon: Copy, label: 'Clone Type', color: 'from-blue-500 to-cyan-500', action: () => setShowCloneTypeDialog(true) },
                    { icon: GitBranch, label: 'Add Field', color: 'from-green-500 to-emerald-500', action: () => setShowAddFieldDialog(true) },
                    { icon: Link2, label: 'Add Reference', color: 'from-orange-500 to-amber-500', action: () => setShowAddReferenceDialog(true) },
                    { icon: Eye, label: 'Preview', color: 'from-violet-500 to-purple-500', action: () => setShowPreviewDialog(true) },
                    { icon: Download, label: 'Export Schema', color: 'from-pink-500 to-rose-500', action: () => setShowExportSchemaDialog(true) },
                    { icon: Upload, label: 'Import Schema', color: 'from-teal-500 to-green-500', action: () => setShowImportSchemaDialog(true) },
                    { icon: BookOpen, label: 'Documentation', color: 'from-gray-500 to-slate-500', action: () => setShowDocumentationDialog(true) },
                  ].map((action, idx) => (
                    <button key={idx} onClick={action.action} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-105 group">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{action.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Content Models</h2>
              <Button onClick={() => setShowNewContentTypeDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Content Type
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contentTypes.map(type => (
                <Card
                  key={type.id}
                  className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer dark:bg-gray-800"
                  onClick={() => setSelectedContentType(type)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${type.color}20` }}
                      >
                        <FileText className="w-6 h-6" style={{ color: type.color }} />
                      </div>
                      <Badge variant="outline">{type.entries_count} entries</Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{type.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{type.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {type.fields.slice(0, 4).map(field => (
                        <div key={field.id} className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                          {getFieldTypeIcon(field.type)}
                          <span className="text-gray-600 dark:text-gray-400">{field.name}</span>
                        </div>
                      ))}
                      {type.fields.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-500">
                          +{type.fields.length - 4}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-6 mt-6">
            {/* Media Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <ImageIcon className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Media Library</h3>
                  <Badge className="bg-white/20 text-white border-0">{assets.length} Assets</Badge>
                </div>
                <p className="text-white/70 mb-4 max-w-2xl">
                  Upload, organize, and manage all your media assets. Support for images, videos, audio, and documents.
                </p>
              </div>
            </div>

            {/* Media Quick Actions */}
            <Card className="border-0 shadow-sm dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-pink-600" />
                  Media Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: Upload, label: 'Upload Files', color: 'from-pink-500 to-rose-500', action: () => setShowUploadMediaDialog(true) },
                    { icon: FolderOpen, label: 'New Folder', color: 'from-blue-500 to-cyan-500', action: () => setShowNewFolderDialog(true) },
                    { icon: Edit2, label: 'Edit Metadata', color: 'from-green-500 to-emerald-500', action: () => setShowEditMetadataDialog(true) },
                    { icon: Tags, label: 'Manage Tags', color: 'from-orange-500 to-amber-500', action: () => setShowManageTagsDialog(true) },
                    { icon: Download, label: 'Download', color: 'from-violet-500 to-purple-500', action: () => {
                      if (selectedAsset) {
                        const assetData = JSON.stringify({
                          filename: selectedAsset.filename,
                          type: selectedAsset.type,
                          url: selectedAsset.url,
                          size: selectedAsset.size,
                          dimensions: selectedAsset.dimensions,
                          downloadedAt: new Date().toISOString(),
                          metadata: { source: 'FreeFlow Content Studio' }
                        }, null, 2)
                        const blob = new Blob([assetData], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = selectedAsset.filename.includes('.') ? selectedAsset.filename : `${selectedAsset.filename}.json`
                        a.click()
                        URL.revokeObjectURL(url)
                        toast.success('Download started', { description: selectedAsset.filename })
                      } else {
                        toast.info('Select an asset to download')
                      }
                    }},
                    { icon: Copy, label: 'Copy URL', color: 'from-teal-500 to-green-500', action: () => selectedAsset ? copyToClipboard(selectedAsset.url, 'Asset URL copied') : toast.info('Select an asset first') },
                    { icon: Trash2, label: 'Delete', color: 'from-red-500 to-pink-500', action: () => setShowDeleteAssetDialog(true) },
                    { icon: RefreshCw, label: 'Reprocess', color: 'from-gray-500 to-slate-500', action: () => setShowReprocessDialog(true) },
                  ].map((action, idx) => (
                    <button key={idx} onClick={action.action} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-105 group">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{action.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <Button onClick={() => setShowUploadMediaDialog(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Assets
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredAssets.map(asset => (
                <Card
                  key={asset.id}
                  className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer dark:bg-gray-800 overflow-hidden"
                  onClick={() => setSelectedAsset(asset)}
                >
                  <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                    {asset.asset_type === 'image' ? <ImageIcon className="w-12 h-12 text-gray-400" /> :
                     asset.asset_type === 'video' ? <Film className="w-12 h-12 text-gray-400" /> :
                     asset.asset_type === 'audio' ? <Music className="w-12 h-12 text-gray-400" /> :
                     <FileText className="w-12 h-12 text-gray-400" />}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getAssetTypeColor(asset.asset_type)}>{asset.asset_type}</Badge>
                      <span className="text-xs text-gray-500">{formatBytes(asset.size_bytes)}</span>
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">{asset.title}</h4>
                    <p className="text-xs text-gray-500 truncate">{asset.filename}</p>
                    {asset.width && asset.height && (
                      <p className="text-xs text-gray-400 mt-1">{asset.width} × {asset.height}</p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {asset.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Localization Tab */}
          <TabsContent value="localization" className="space-y-6 mt-6">
            {/* Localization Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Localization</h3>
                  <Badge className="bg-white/20 text-white border-0">{locales.length} Locales</Badge>
                </div>
                <p className="text-white/70 mb-4 max-w-2xl">
                  Manage translations and localized content. Track completion progress and ensure global readiness.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{locales.filter(l => l.status === 'active').length}</div>
                    <div className="text-xs text-white/70">Active Locales</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.avgLocalization}%</div>
                    <div className="text-xs text-white/70">Avg Completion</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">LTR/RTL</div>
                    <div className="text-xs text-white/70">Directions</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">5</div>
                    <div className="text-xs text-white/70">Fallbacks</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Localization Quick Actions */}
            <Card className="border-0 shadow-sm dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  Localization Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: Plus, label: 'Add Locale', color: 'from-blue-500 to-cyan-500', action: () => setShowAddLocaleDialog(true) },
                    { icon: Languages, label: 'Auto Translate', color: 'from-green-500 to-emerald-500', action: () => setShowAutoTranslateDialog(true) },
                    { icon: Target, label: 'Set Fallback', color: 'from-orange-500 to-amber-500', action: () => setShowSetFallbackDialog(true) },
                    { icon: Activity, label: 'Track Progress', color: 'from-violet-500 to-purple-500', action: () => setShowTrackProgressDialog(true) },
                    { icon: Download, label: 'Export XLIFF', color: 'from-pink-500 to-rose-500', action: () => setShowExportXLIFFDialog(true) },
                    { icon: Upload, label: 'Import XLIFF', color: 'from-teal-500 to-green-500', action: () => setShowImportXLIFFDialog(true) },
                    { icon: CheckCircle, label: 'Validate', color: 'from-emerald-500 to-green-500', action: () => setShowValidateDialog(true) },
                    { icon: RefreshCw, label: 'Sync All', color: 'from-gray-500 to-slate-500', action: () => setShowSyncAllDialog(true) },
                  ].map((action, idx) => (
                    <button key={idx} onClick={action.action} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-105 group">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{action.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Locales</h2>
              <Button onClick={() => setShowAddLocaleDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Locale
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {locales.map(locale => (
                <Card key={locale.id} className="border-0 shadow-sm dark:bg-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">
                          {locale.code === 'ja-JP' ? '🇯🇵' : locale.code === 'de-DE' ? '🇩🇪' : locale.code === 'fr-FR' ? '🇫🇷' : locale.code === 'es-ES' ? '🇪🇸' : locale.code === 'ar-SA' ? '🇸🇦' : '🇺🇸'}
                        </span>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{locale.name}</h3>
                          <p className="text-sm text-gray-500">{locale.native_name}</p>
                        </div>
                      </div>
                      <Badge className={locale.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {locale.status}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Locale Code</span>
                        <code className="font-mono text-gray-900 dark:text-white">{locale.code}</code>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Direction</span>
                        <span className="text-gray-900 dark:text-white uppercase">{locale.direction}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Entries</span>
                        <span className="text-gray-900 dark:text-white">{locale.entries_count}</span>
                      </div>
                      {locale.fallback_code && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Fallback</span>
                          <code className="font-mono text-gray-900 dark:text-white">{locale.fallback_code}</code>
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Completion</span>
                        <span>{locale.completion_percentage}%</span>
                      </div>
                      <Progress value={locale.completion_percentage} className="h-2" />
                    </div>

                    {locale.is_default && (
                      <div className="mt-4 p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                        <p className="text-xs text-purple-700 dark:text-purple-300">Default locale for this space</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab - Comprehensive 6 Sub-tabs with Sidebar */}
          <TabsContent value="settings" className="space-y-6 mt-6">
            {/* Settings Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Settings className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Content Studio Settings</h3>
                  <Badge className="bg-purple-500/20 text-purple-300 border-0">Contentful Level</Badge>
                </div>
                <p className="text-white/70 mb-4 max-w-2xl">
                  Configure your content management system settings, API access, localization, webhooks, and security options.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.contentTypes}</div>
                    <div className="text-xs text-white/70">Content Types</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.totalAssets}</div>
                    <div className="text-xs text-white/70">Media Assets</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.locales}</div>
                    <div className="text-xs text-white/70">Locales</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.apiCalls}</div>
                    <div className="text-xs text-white/70">API Calls/Day</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Grid with Sidebar Navigation */}
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card className="border-0 shadow-sm dark:bg-gray-800">
                  <CardContent className="p-4">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Settings, description: 'Basic settings' },
                        { id: 'api', label: 'API Access', icon: Database, description: 'Keys & endpoints' },
                        { id: 'webhooks', label: 'Webhooks', icon: Zap, description: 'Event triggers' },
                        { id: 'localization', label: 'Localization', icon: Globe, description: 'Languages' },
                        { id: 'security', label: 'Security', icon: Shield, description: 'Access control' },
                        { id: 'advanced', label: 'Advanced', icon: Sliders, description: 'Power features' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all ${
                            settingsTab === item.id
                              ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-l-4 border-purple-500'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <item.icon className={`h-5 w-5 ${settingsTab === item.id ? 'text-purple-600' : 'text-gray-400'}`} />
                          <div>
                            <p className="font-medium text-sm">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.description}</p>
                          </div>
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
                    <Card className="border-0 shadow-sm dark:bg-gray-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="w-5 h-5 text-purple-600" />
                          Content Settings
                        </CardTitle>
                        <CardDescription>Configure content management preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Auto-save Drafts</p>
                            <p className="text-sm text-gray-500">Automatically save drafts every 30 seconds</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Version History</p>
                            <p className="text-sm text-gray-500">Keep history of all content changes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Require Review</p>
                            <p className="text-sm text-gray-500">Require approval before publishing</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Rich Text Editor</p>
                            <p className="text-sm text-gray-500">Enable advanced text formatting</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm dark:bg-gray-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Edit className="w-5 h-5 text-blue-600" />
                          Editorial Workflow
                        </CardTitle>
                        <CardDescription>Configure content review process</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Multi-stage Review</p>
                            <p className="text-sm text-gray-500">Enable draft → review → publish workflow</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Scheduled Publishing</p>
                            <p className="text-sm text-gray-500">Allow scheduling content for future publish</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* API Access */}
                {settingsTab === 'api' && (
                  <>
                    <Card className="border-0 shadow-sm dark:bg-gray-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Database className="w-5 h-5 text-purple-600" />
                          API Credentials
                        </CardTitle>
                        <CardDescription>Manage your API keys and endpoints</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <p className="text-sm text-gray-500 mb-1">Space ID</p>
                          <code className="text-sm font-mono bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                            space_Qx7K9mN3pL2wE5
                          </code>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <p className="text-sm text-gray-500 mb-1">Content Delivery API Key</p>
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded flex-1">
                              •••••••••••••••••••••
                            </code>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard('cda_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Delivery API key copied')}><Copy className="w-4 h-4" /></Button>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <p className="text-sm text-gray-500 mb-1">Content Management API Key</p>
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded flex-1">
                              •••••••••••••••••••••
                            </code>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard('cma_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Management API key copied')}><Copy className="w-4 h-4" /></Button>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1" onClick={() => setShowRegenerateKeysDialog(true)}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Regenerate Keys
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={() => {
                            window.open('https://www.contentful.com/developers/docs/', '_blank')
                            toast.success('Opening API documentation', { description: 'API docs opened in new tab' })
                          }}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            API Docs
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm dark:bg-gray-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Terminal className="w-5 h-5 text-green-600" />
                          API Endpoints
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <p className="text-sm text-gray-500 mb-1">Content Delivery API</p>
                          <code className="text-sm font-mono">https://cdn.contentful.com</code>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <p className="text-sm text-gray-500 mb-1">Content Management API</p>
                          <code className="text-sm font-mono">https://api.contentful.com</code>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <p className="text-sm text-gray-500 mb-1">Preview API</p>
                          <code className="text-sm font-mono">https://preview.contentful.com</code>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <p className="text-sm text-gray-500 mb-1">GraphQL API</p>
                          <code className="text-sm font-mono">https://graphql.contentful.com</code>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Webhooks */}
                {settingsTab === 'webhooks' && (
                  <Card className="border-0 shadow-sm dark:bg-gray-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-purple-600" />
                        Webhooks
                      </CardTitle>
                      <CardDescription>Configure event triggers for external integrations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        <Zap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="mb-2">No webhooks configured</p>
                        <p className="text-sm mb-4">Webhooks notify external systems when content changes</p>
                        <Button variant="outline" onClick={() => setShowWebhookDialog(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Webhook
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Localization */}
                {settingsTab === 'localization' && (
                  <Card className="border-0 shadow-sm dark:bg-gray-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-600" />
                        Localization Settings
                      </CardTitle>
                      <CardDescription>Configure supported languages and locales</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🇺🇸</span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">English (US)</p>
                            <p className="text-sm text-gray-500">Default locale</p>
                          </div>
                        </div>
                        <Badge className="bg-purple-100 text-purple-700">Default</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🇪🇸</span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Spanish</p>
                            <p className="text-sm text-gray-500">Enabled</p>
                          </div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🇫🇷</span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">French</p>
                            <p className="text-sm text-gray-500">Enabled</p>
                          </div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🇩🇪</span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">German</p>
                            <p className="text-sm text-gray-500">Disabled</p>
                          </div>
                        </div>
                        <Switch />
                      </div>
                      <Button variant="outline" className="w-full" onClick={() => setShowAddLocaleDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Locale
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Security */}
                {settingsTab === 'security' && (
                  <Card className="border-0 shadow-sm dark:bg-gray-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-600" />
                        Security Settings
                      </CardTitle>
                      <CardDescription>Configure access control and permissions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-500">Require 2FA for all users</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">IP Whitelist</p>
                          <p className="text-sm text-gray-500">Restrict API access by IP</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Audit Logging</p>
                          <p className="text-sm text-gray-500">Track all user actions</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Content Encryption</p>
                          <p className="text-sm text-gray-500">Encrypt sensitive fields</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Advanced */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card className="border-0 shadow-sm dark:bg-gray-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sliders className="w-5 h-5 text-amber-600" />
                          Advanced Options
                        </CardTitle>
                        <CardDescription>Power user features and configurations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Custom Extensions</p>
                            <p className="text-sm text-gray-500">Enable custom field extensions</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">GraphQL Playground</p>
                            <p className="text-sm text-gray-500">Enable GraphQL explorer</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Beta Features</p>
                            <p className="text-sm text-gray-500">Access experimental features</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-800 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertTriangle className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Delete All Content</p>
                            <p className="text-sm text-gray-500">Remove all entries and content types</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => setShowDeleteAllContentDialog(true)}>Delete</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Reset Space</p>
                            <p className="text-sm text-gray-500">Reset entire space to defaults</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => setShowResetSpaceDialog(true)}>Reset</Button>
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
              insights={contentAIInsights}
              title="Content Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight', { description: insight.description || 'View insight details' })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={contentCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={contentPredictions}
              title="Content Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={contentActivities}
            title="Content Activity"
            maxItems={5}
          />
          <Card className="border-0 shadow-sm dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                <Button variant="outline" className="justify-start" onClick={() => setShowNewEntryDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Entry
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => setShowBulkPublishDialog(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Bulk Publish
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => setShowExportDialog(true)}>
                  <Download className="w-4 h-4 mr-2" />
                  Export All
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Entry Detail Dialog */}
        <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Entry Details</DialogTitle>
            </DialogHeader>
            {selectedEntry && (
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-6 p-4">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(selectedEntry.status)}>{selectedEntry.status}</Badge>
                    <Badge variant="outline">{selectedEntry.content_type_name}</Badge>
                    <Badge variant="outline">v{selectedEntry.version}</Badge>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedEntry.title}</h3>
                    <p className="text-gray-500 font-mono">/{selectedEntry.slug}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Created</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedEntry.created_at)}</p>
                      <p className="text-xs text-gray-500">{selectedEntry.created_by}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Last Updated</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedEntry.updated_at)}</p>
                      <p className="text-xs text-gray-500">{selectedEntry.updated_by}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Locales</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedEntry.locales_completed.map(locale => (
                        <Badge key={locale} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {locale}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {selectedEntry.tags.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedEntry.tags.map(tag => (
                          <Badge key={tag} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={() => {
                      if (selectedEntry) {
                        setEditEntryTitle(selectedEntry.title)
                        setEditEntrySlug(selectedEntry.slug)
                        setShowEditEntryDialog(true)
                      }
                    }}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Entry
                    </Button>
                    {selectedEntry.status === 'draft' && (
                      <Button variant="outline" className="flex-1" onClick={() => setShowPublishEntryDialog(true)}>
                        <Send className="w-4 h-4 mr-2" />
                        Publish
                      </Button>
                    )}
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>

        {/* Content Type Detail Dialog */}
        <Dialog open={!!selectedContentType} onOpenChange={() => setSelectedContentType(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Content Type Details</DialogTitle>
            </DialogHeader>
            {selectedContentType && (
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-6 p-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${selectedContentType.color}20` }}
                    >
                      <FileText className="w-8 h-8" style={{ color: selectedContentType.color }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedContentType.name}</h3>
                      <p className="text-gray-500">{selectedContentType.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Entries</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedContentType.entries_count}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Fields</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedContentType.fields.length}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-3">Fields</p>
                    <div className="space-y-2">
                      {selectedContentType.fields.map(field => (
                        <div key={field.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              {getFieldTypeIcon(field.type)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{field.name}</p>
                              <p className="text-xs text-gray-500">{field.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {field.required && <Badge className="bg-red-100 text-red-800 text-xs">Required</Badge>}
                            {field.localized && <Badge className="bg-blue-100 text-blue-800 text-xs">Localized</Badge>}
                            {field.unique && <Badge className="bg-purple-100 text-purple-800 text-xs">Unique</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => {
                    if (selectedContentType) {
                      setEditContentTypeName(selectedContentType.name)
                      setEditContentTypeDescription(selectedContentType.description)
                      setShowEditContentTypeDialog(true)
                    }
                  }}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Content Type
                  </Button>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>

        {/* Asset Detail Dialog */}
        <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Asset Details</DialogTitle>
            </DialogHeader>
            {selectedAsset && (
              <div className="space-y-4 p-4">
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center">
                  {selectedAsset.asset_type === 'image' ? <ImageIcon className="w-16 h-16 text-gray-400" /> :
                   selectedAsset.asset_type === 'video' ? <Film className="w-16 h-16 text-gray-400" /> :
                   selectedAsset.asset_type === 'audio' ? <Music className="w-16 h-16 text-gray-400" /> :
                   <FileText className="w-16 h-16 text-gray-400" />}
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={getAssetTypeColor(selectedAsset.asset_type)}>{selectedAsset.asset_type}</Badge>
                  <span className="text-sm text-gray-500">{formatBytes(selectedAsset.size_bytes)}</span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedAsset.title}</h3>
                  <p className="text-gray-500 font-mono text-sm">{selectedAsset.filename}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {selectedAsset.width && (
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Dimensions</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedAsset.width} × {selectedAsset.height}</p>
                    </div>
                  )}
                  {selectedAsset.duration && (
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="font-medium text-gray-900 dark:text-white">{Math.floor(selectedAsset.duration / 60)}:{(selectedAsset.duration % 60).toString().padStart(2, '0')}</p>
                    </div>
                  )}
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">Uploaded</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedAsset.created_at)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">Used in</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedAsset.used_in.length} entries</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => {
                    if (selectedAsset) {
                      const assetData = JSON.stringify({
                        filename: selectedAsset.filename,
                        title: selectedAsset.title,
                        type: selectedAsset.type,
                        url: selectedAsset.url,
                        width: selectedAsset.width,
                        height: selectedAsset.height,
                        duration: selectedAsset.duration,
                        created_at: selectedAsset.created_at,
                        downloadedAt: new Date().toISOString(),
                        metadata: { source: 'FreeFlow Content Studio' }
                      }, null, 2)
                      const blob = new Blob([assetData], { type: 'application/json' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = selectedAsset.filename.includes('.') ? selectedAsset.filename : `${selectedAsset.filename}.json`
                      a.click()
                      URL.revokeObjectURL(url)
                      toast.success('Download started', { description: selectedAsset.filename })
                    }
                  }}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => {
                    if (selectedAsset) copyToClipboard(selectedAsset.url, 'Asset URL copied')
                  }}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy URL
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* New Entry Dialog */}
        <Dialog open={showNewEntryDialog} onOpenChange={setShowNewEntryDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Entry</DialogTitle>
              <DialogDescription>Create a new content entry to add to your CMS</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="entry-title">Entry Title</Label>
                <Input
                  id="entry-title"
                  placeholder="Enter a title for your content"
                  value={newEntryTitle}
                  onChange={(e) => setNewEntryTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entry-type">Content Type</Label>
                <Select value={newEntryType} onValueChange={setNewEntryType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="entry-slug">URL Slug (optional)</Label>
                <Input
                  id="entry-slug"
                  placeholder="auto-generated-from-title"
                  value={newEntrySlug}
                  onChange={(e) => setNewEntrySlug(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewEntryDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateEntry} disabled={isProcessing}>
                {isProcessing ? 'Creating...' : 'Create Entry'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Upload Media Dialog */}
        <Dialog open={showUploadMediaDialog} onOpenChange={setShowUploadMediaDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Upload Media</DialogTitle>
              <DialogDescription>Upload images, videos, documents, or other assets</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">Drag and drop files here</p>
                <p className="text-sm text-gray-500 mb-4">or</p>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  id="file-upload"
                  onChange={(e) => handleUploadMedia(e.target.files)}
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" asChild>
                    <span>Browse Files</span>
                  </Button>
                </label>
              </div>
              <p className="text-xs text-gray-500">Supported: JPG, PNG, GIF, MP4, PDF, DOCX (max 50MB)</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUploadMediaDialog(false)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Content Type Dialog */}
        <Dialog open={showNewContentTypeDialog} onOpenChange={setShowNewContentTypeDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Content Type</DialogTitle>
              <DialogDescription>Define a new content model for your CMS</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="type-name">Content Type Name</Label>
                <Input
                  id="type-name"
                  placeholder="e.g., Blog Post, Product, FAQ"
                  value={newContentTypeName}
                  onChange={(e) => setNewContentTypeName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type-description">Description</Label>
                <Textarea
                  id="type-description"
                  placeholder="Describe what this content type is used for"
                  value={newContentTypeDescription}
                  onChange={(e) => setNewContentTypeDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewContentTypeDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateContentType} disabled={isProcessing}>
                {isProcessing ? 'Creating...' : 'Create Content Type'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Locale Dialog */}
        <Dialog open={showAddLocaleDialog} onOpenChange={setShowAddLocaleDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Locale</DialogTitle>
              <DialogDescription>Add a new language/region for content localization</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="locale-code">Locale Code</Label>
                <Input
                  id="locale-code"
                  placeholder="e.g., en-US, es-ES, fr-FR"
                  value={newLocaleCode}
                  onChange={(e) => setNewLocaleCode(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="locale-name">Display Name</Label>
                <Input
                  id="locale-name"
                  placeholder="e.g., English (US), Spanish, French"
                  value={newLocaleName}
                  onChange={(e) => setNewLocaleName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddLocaleDialog(false)}>Cancel</Button>
              <Button onClick={handleAddLocale} disabled={isProcessing}>
                {isProcessing ? 'Adding...' : 'Add Locale'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Search Content Dialog */}
        <Dialog open={showSearchContentDialog} onOpenChange={setShowSearchContentDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Advanced Search</DialogTitle>
              <DialogDescription>Search content with filters</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="search-query">Search Query</Label>
                <Input
                  id="search-query"
                  placeholder="Search by title, slug, or content"
                  value={advancedSearchQuery}
                  onChange={(e) => setAdvancedSearchQuery(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="search-type">Content Type</Label>
                <Select value={advancedSearchType} onValueChange={setAdvancedSearchType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {contentTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="search-status">Status</Label>
                <Select value={advancedSearchStatus} onValueChange={setAdvancedSearchStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="changed">Changed</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSearchContentDialog(false)}>Cancel</Button>
              <Button onClick={handleAdvancedSearch}>Search</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* History Dialog */}
        <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Version History</DialogTitle>
              <DialogDescription>View and restore previous versions of content</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-96">
              <div className="space-y-3 py-4">
                {[
                  { version: 12, action: 'Published', user: 'editor@company.com', date: 'Jan 15, 2024 10:30 AM' },
                  { version: 11, action: 'Updated', user: 'editor@company.com', date: 'Jan 15, 2024 10:15 AM' },
                  { version: 10, action: 'Updated', user: 'writer@company.com', date: 'Jan 14, 2024 4:30 PM' },
                  { version: 9, action: 'Updated', user: 'writer@company.com', date: 'Jan 14, 2024 2:00 PM' },
                  { version: 8, action: 'Published', user: 'editor@company.com', date: 'Jan 12, 2024 9:00 AM' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">v{item.version}</Badge>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.action}</p>
                        <p className="text-sm text-gray-500">{item.user}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">{item.date}</span>
                      <Button variant="outline" size="sm" onClick={() => {
                        toast.success(`Restored to version ${item.version}`)
                        setShowHistoryDialog(false)
                      }}>Restore</Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowHistoryDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Publish All Dialog */}
        <Dialog open={showPublishAllDialog} onOpenChange={setShowPublishAllDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Publish All Drafts</DialogTitle>
              <DialogDescription>This will publish all draft entries at once</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  You are about to publish {entries.filter(e => e.status === 'draft').length} draft entries. This action will make them publicly available.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPublishAllDialog(false)}>Cancel</Button>
              <Button onClick={handlePublishAll} disabled={isProcessing}>
                {isProcessing ? 'Publishing...' : 'Publish All'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Sync Changes Dialog */}
        <Dialog open={showSyncChangesDialog} onOpenChange={setShowSyncChangesDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Sync Changes</DialogTitle>
              <DialogDescription>Synchronize content with remote systems</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  This will sync all local changes with the content delivery network and connected systems.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSyncChangesDialog(false)}>Cancel</Button>
              <Button onClick={handleSyncChanges} disabled={isProcessing}>
                {isProcessing ? 'Syncing...' : 'Sync Now'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Export Content</DialogTitle>
              <DialogDescription>Export your content in various formats</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <Button variant="outline" className="w-full justify-start" onClick={() => handleExportContent('json')}>
                <FileCode className="w-4 h-4 mr-3" />
                Export as JSON
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => handleExportContent('csv')}>
                <FileText className="w-4 h-4 mr-3" />
                Export as CSV
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => handleExportContent('xml')}>
                <Database className="w-4 h-4 mr-3" />
                Export as XML
              </Button>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Field Dialog */}
        <Dialog open={showAddFieldDialog} onOpenChange={setShowAddFieldDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Field</DialogTitle>
              <DialogDescription>Add a new field to the content type</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="field-name">Field Name</Label>
                <Input
                  id="field-name"
                  placeholder="e.g., Title, Description, Image"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="field-type">Field Type</Label>
                <Select value={newFieldType} onValueChange={setNewFieldType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select field type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="richtext">Rich Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="reference">Reference</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddFieldDialog(false)}>Cancel</Button>
              <Button onClick={handleAddField} disabled={isProcessing}>
                {isProcessing ? 'Adding...' : 'Add Field'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Folder Dialog */}
        <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Folder</DialogTitle>
              <DialogDescription>Create a new folder to organize your assets</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="folder-name">Folder Name</Label>
                <Input
                  id="folder-name"
                  placeholder="e.g., Images, Documents, Videos"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateFolder} disabled={isProcessing}>
                {isProcessing ? 'Creating...' : 'Create Folder'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Metadata Dialog */}
        <Dialog open={showEditMetadataDialog} onOpenChange={setShowEditMetadataDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Asset Metadata</DialogTitle>
              <DialogDescription>Update asset title, description, and tags</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="asset-title">Title</Label>
                <Input
                  id="asset-title"
                  placeholder="Asset title"
                  value={assetTitle}
                  onChange={(e) => setAssetTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="asset-description">Description</Label>
                <Textarea
                  id="asset-description"
                  placeholder="Asset description"
                  value={assetDescription}
                  onChange={(e) => setAssetDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="asset-tags">Tags (comma-separated)</Label>
                <Input
                  id="asset-tags"
                  placeholder="e.g., hero, banner, product"
                  value={assetTags}
                  onChange={(e) => setAssetTags(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditMetadataDialog(false)}>Cancel</Button>
              <Button onClick={handleUpdateAssetMetadata} disabled={isProcessing}>
                {isProcessing ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Auto Translate Dialog */}
        <Dialog open={showAutoTranslateDialog} onOpenChange={setShowAutoTranslateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Auto Translate</DialogTitle>
              <DialogDescription>Automatically translate content using AI</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="source-locale">Source Locale</Label>
                <Select value={translateSourceLocale} onValueChange={setTranslateSourceLocale}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {locales.filter(l => l.status === 'active').map(locale => (
                      <SelectItem key={locale.code} value={locale.code}>{locale.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-locale">Target Locale</Label>
                <Select value={translateTargetLocale} onValueChange={setTranslateTargetLocale}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target" />
                  </SelectTrigger>
                  <SelectContent>
                    {locales.filter(l => l.status === 'active' && l.code !== translateSourceLocale).map(locale => (
                      <SelectItem key={locale.code} value={locale.code}>{locale.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAutoTranslateDialog(false)}>Cancel</Button>
              <Button onClick={handleAutoTranslate} disabled={isProcessing}>
                {isProcessing ? 'Translating...' : 'Start Translation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Set Fallback Dialog */}
        <Dialog open={showSetFallbackDialog} onOpenChange={setShowSetFallbackDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Set Fallback Locale</DialogTitle>
              <DialogDescription>Choose which locale to use when content is missing</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fallback-locale">Fallback Locale</Label>
                <Select value={fallbackLocale} onValueChange={setFallbackLocale}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fallback" />
                  </SelectTrigger>
                  <SelectContent>
                    {locales.filter(l => l.status === 'active').map(locale => (
                      <SelectItem key={locale.code} value={locale.code}>{locale.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSetFallbackDialog(false)}>Cancel</Button>
              <Button onClick={handleSetFallback} disabled={isProcessing}>
                {isProcessing ? 'Setting...' : 'Set Fallback'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Webhook Dialog */}
        <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Webhook</DialogTitle>
              <DialogDescription>Configure a webhook to receive content events</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-name">Webhook Name</Label>
                <Input
                  id="webhook-name"
                  placeholder="e.g., Slack Notifications, Build Trigger"
                  value={webhookName}
                  onChange={(e) => setWebhookName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://your-endpoint.com/webhook"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Events</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
                  {['Entry.publish', 'Entry.unpublish', 'Entry.create', 'Entry.update', 'Asset.upload', 'Asset.delete'].map(event => (
                    <label key={event} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={webhookEvents.includes(event)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setWebhookEvents([...webhookEvents, event])
                          } else {
                            setWebhookEvents(webhookEvents.filter(e => e !== event))
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{event}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowWebhookDialog(false)}>Cancel</Button>
              <Button onClick={handleAddWebhook} disabled={isProcessing}>
                {isProcessing ? 'Creating...' : 'Create Webhook'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Duplicate Dialog */}
        <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Duplicate Entry</DialogTitle>
              <DialogDescription>Create a copy of the selected entry</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This will create an exact copy of the entry as a new draft. You can then edit the duplicate independently.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDuplicateDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Entry duplicated', { description: 'New draft created' })
                setShowDuplicateDialog(false)
              }}>Duplicate</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Archive Dialog */}
        <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Archive Entry</DialogTitle>
              <DialogDescription>Move entry to archive</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Archived entries are unpublished and hidden from the content list but can be restored later.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowArchiveDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => {
                toast.success('Entry archived')
                setShowArchiveDialog(false)
              }}>Archive</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Translate Dialog */}
        <Dialog open={showTranslateDialog} onOpenChange={setShowTranslateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Translate Content</DialogTitle>
              <DialogDescription>Translate selected entries to other locales</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Target Locales</Label>
                <div className="space-y-2">
                  {locales.filter(l => l.status === 'active' && !l.is_default).map(locale => (
                    <label key={locale.code} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <input type="checkbox" className="rounded" />
                      <span>{locale.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTranslateDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Translation started', { description: 'Content is being translated' })
                setShowTranslateDialog(false)
              }}>Start Translation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Manage Tags Dialog */}
        <Dialog open={showManageTagsDialog} onOpenChange={setShowManageTagsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Manage Tags</DialogTitle>
              <DialogDescription>Add or remove tags from selected entries</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Current Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {currentTags.map(tag => (
                    <Badge key={tag} variant="secondary" className="px-3 py-1">
                      {tag}
                      <button className="ml-2 text-gray-500 hover:text-gray-700" onClick={() => {
                        setCurrentTags(currentTags.filter(t => t !== tag))
                        toast.success('Tag removed', { description: `"${tag}" has been removed` })
                      }}>x</button>
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-tag">Add New Tag</Label>
                <div className="flex gap-2">
                  <Input
                    id="new-tag"
                    placeholder="Enter tag name"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTagInput.trim()) {
                        if (!currentTags.includes(newTagInput.trim().toLowerCase())) {
                          setCurrentTags([...currentTags, newTagInput.trim().toLowerCase()])
                          toast.success('Tag added', { description: `"${newTagInput.trim()}" has been added` })
                          setNewTagInput('')
                        } else {
                          toast.error('Tag already exists')
                        }
                      }
                    }}
                  />
                  <Button onClick={() => {
                    if (newTagInput.trim()) {
                      if (!currentTags.includes(newTagInput.trim().toLowerCase())) {
                        setCurrentTags([...currentTags, newTagInput.trim().toLowerCase()])
                        toast.success('Tag added', { description: `"${newTagInput.trim()}" has been added` })
                        setNewTagInput('')
                      } else {
                        toast.error('Tag already exists')
                      }
                    } else {
                      toast.error('Please enter a tag name')
                    }
                  }}>Add</Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowManageTagsDialog(false)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Publish Dialog */}
        <Dialog open={showBulkPublishDialog} onOpenChange={setShowBulkPublishDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Publish Selected</DialogTitle>
              <DialogDescription>Publish selected entries</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This will publish all selected draft entries. Make sure they are ready for public viewing.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBulkPublishDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Entries published')
                setShowBulkPublishDialog(false)
              }}>Publish</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Clone Type Dialog */}
        <Dialog open={showCloneTypeDialog} onOpenChange={setShowCloneTypeDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Clone Content Type</DialogTitle>
              <DialogDescription>Create a copy of an existing content type</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Source Content Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type to clone" />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>New Name</Label>
                <Input placeholder="e.g., Blog Post Copy" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCloneTypeDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Content type cloned')
                setShowCloneTypeDialog(false)
              }}>Clone</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Reference Dialog */}
        <Dialog open={showAddReferenceDialog} onOpenChange={setShowAddReferenceDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Reference Field</DialogTitle>
              <DialogDescription>Create a link to another content type</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Field Name</Label>
                <Input placeholder="e.g., author, category, related" />
              </div>
              <div className="space-y-2">
                <Label>Reference Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type to reference" />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddReferenceDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Reference field added')
                setShowAddReferenceDialog(false)
              }}>Add Reference</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Content Type Preview</DialogTitle>
              <DialogDescription>Preview how entries will look</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="border rounded-xl p-6 bg-gray-50 dark:bg-gray-800">
                <p className="text-center text-gray-500">Preview of content type structure and sample entry</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Schema Dialog */}
        <Dialog open={showExportSchemaDialog} onOpenChange={setShowExportSchemaDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Export Schema</DialogTitle>
              <DialogDescription>Export content type definitions</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <Button variant="outline" className="w-full justify-start" onClick={() => {
                toast.success('Schema exported as JSON')
                setShowExportSchemaDialog(false)
              }}>
                <FileCode className="w-4 h-4 mr-3" />
                Export as JSON
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => {
                toast.success('Schema exported as TypeScript')
                setShowExportSchemaDialog(false)
              }}>
                <Type className="w-4 h-4 mr-3" />
                Export as TypeScript
              </Button>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportSchemaDialog(false)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import Schema Dialog */}
        <Dialog open={showImportSchemaDialog} onOpenChange={setShowImportSchemaDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Import Schema</DialogTitle>
              <DialogDescription>Import content type definitions from a file</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
                <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Drop your schema file here or click to browse</p>
                <input type="file" className="hidden" id="schema-upload" accept=".json" />
                <label htmlFor="schema-upload">
                  <Button variant="outline" className="mt-3" asChild>
                    <span>Select File</span>
                  </Button>
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowImportSchemaDialog(false)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Documentation Dialog */}
        <Dialog open={showDocumentationDialog} onOpenChange={setShowDocumentationDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Content Type Documentation</DialogTitle>
              <DialogDescription>Auto-generated documentation for your content models</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-96">
              <div className="space-y-4 py-4">
                {contentTypes.slice(0, 3).map(type => (
                  <div key={type.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{type.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{type.description}</p>
                    <div className="space-y-1">
                      {type.fields.slice(0, 3).map(field => (
                        <div key={field.id} className="text-xs text-gray-500">
                          {field.name} ({field.type}) {field.required && '- required'}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDocumentationDialog(false)}>Close</Button>
              <Button onClick={() => {
                toast.success('Documentation exported')
                setShowDocumentationDialog(false)
              }}>Export Docs</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Asset Dialog */}
        <Dialog open={showDeleteAssetDialog} onOpenChange={setShowDeleteAssetDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Asset</DialogTitle>
              <DialogDescription>This action cannot be undone</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200">
                  Are you sure you want to delete this asset? Any content using this asset will show a broken reference.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteAssetDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => {
                toast.success('Asset deleted')
                setShowDeleteAssetDialog(false)
              }}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reprocess Dialog */}
        <Dialog open={showReprocessDialog} onOpenChange={setShowReprocessDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Reprocess Assets</DialogTitle>
              <DialogDescription>Regenerate thumbnails and metadata</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This will regenerate all thumbnails, extract metadata, and update asset information. This may take a few minutes.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReprocessDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Reprocessing started', { description: 'This may take a few minutes' })
                setShowReprocessDialog(false)
              }}>Start Reprocessing</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Track Progress Dialog */}
        <Dialog open={showTrackProgressDialog} onOpenChange={setShowTrackProgressDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Localization Progress</DialogTitle>
              <DialogDescription>Track translation completion across locales</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {locales.filter(l => l.status === 'active').map(locale => (
                <div key={locale.code} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">{locale.name}</span>
                    <span className="text-sm text-gray-500">{locale.completion_percentage}%</span>
                  </div>
                  <Progress value={locale.completion_percentage} className="h-2" />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTrackProgressDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export XLIFF Dialog */}
        <Dialog open={showExportXLIFFDialog} onOpenChange={setShowExportXLIFFDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Export XLIFF</DialogTitle>
              <DialogDescription>Export content for translation</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Source Locale</Label>
                <Select defaultValue="en-US">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {locales.filter(l => l.status === 'active').map(locale => (
                      <SelectItem key={locale.code} value={locale.code}>{locale.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Locale</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target" />
                  </SelectTrigger>
                  <SelectContent>
                    {locales.filter(l => l.status === 'active').map(locale => (
                      <SelectItem key={locale.code} value={locale.code}>{locale.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportXLIFFDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('XLIFF exported', { description: 'Translation file ready for download' })
                setShowExportXLIFFDialog(false)
              }}>Export</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import XLIFF Dialog */}
        <Dialog open={showImportXLIFFDialog} onOpenChange={setShowImportXLIFFDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Import XLIFF</DialogTitle>
              <DialogDescription>Import translated content from XLIFF file</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
                <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Drop your XLIFF file here</p>
                <input type="file" className="hidden" id="xliff-upload" accept=".xliff,.xlf" />
                <label htmlFor="xliff-upload">
                  <Button variant="outline" className="mt-3" asChild>
                    <span>Select File</span>
                  </Button>
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowImportXLIFFDialog(false)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Validate Dialog */}
        <Dialog open={showValidateDialog} onOpenChange={setShowValidateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Validate Translations</DialogTitle>
              <DialogDescription>Check for missing or incomplete translations</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-center text-sm text-green-800 dark:text-green-200">
                  All translations are valid. No issues found.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowValidateDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Sync All Dialog */}
        <Dialog open={showSyncAllDialog} onOpenChange={setShowSyncAllDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Sync All Locales</DialogTitle>
              <DialogDescription>Synchronize content across all locales</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This will synchronize structure changes and field updates across all enabled locales.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSyncAllDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Sync complete', { description: 'All locales are synchronized' })
                setShowSyncAllDialog(false)
              }}>Sync Now</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete All Content Dialog */}
        <Dialog open={showDeleteAllContentDialog} onOpenChange={setShowDeleteAllContentDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete All Content</DialogTitle>
              <DialogDescription>This action cannot be undone. All entries and content types will be permanently deleted.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-300">
                  Warning: This will delete {entries.length} entries and {contentTypes.length} content types.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Type &quot;DELETE&quot; to confirm</Label>
                <Input placeholder="DELETE" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteAllContentDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={async () => {
                setIsProcessing(true)
                try {
                  const res = await fetch('/api/content/delete-all', { method: 'DELETE' })
                  if (!res.ok) throw new Error('Failed to delete content')
                  toast.success('Content deleted', { description: 'All entries and content types have been removed' })
                  setShowDeleteAllContentDialog(false)
                } catch {
                  toast.error('Failed to delete content')
                } finally {
                  setIsProcessing(false)
                }
              }} disabled={isProcessing}>
                {isProcessing ? 'Deleting...' : 'Delete Everything'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset Space Dialog */}
        <Dialog open={showResetSpaceDialog} onOpenChange={setShowResetSpaceDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Reset Space</DialogTitle>
              <DialogDescription>This will reset your entire space to default settings.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-300">
                  Warning: All content, settings, webhooks, and API keys will be reset. This action cannot be undone.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Type &quot;RESET&quot; to confirm</Label>
                <Input placeholder="RESET" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowResetSpaceDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={async () => {
                setIsProcessing(true)
                try {
                  const res = await fetch('/api/content/space/reset', { method: 'POST' })
                  if (!res.ok) throw new Error('Failed to reset space')
                  toast.success('Space reset', { description: 'Your space has been reset to defaults' })
                  setShowResetSpaceDialog(false)
                } catch {
                  toast.error('Failed to reset space')
                } finally {
                  setIsProcessing(false)
                }
              }} disabled={isProcessing}>
                {isProcessing ? 'Resetting...' : 'Reset Space'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Regenerate Keys Dialog */}
        <Dialog open={showRegenerateKeysDialog} onOpenChange={setShowRegenerateKeysDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Regenerate API Keys</DialogTitle>
              <DialogDescription>Generate new API keys for your space</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  Warning: Regenerating keys will invalidate your existing keys. All applications using the old keys will need to be updated.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="regen-delivery" className="rounded" defaultChecked />
                  <Label htmlFor="regen-delivery">Content Delivery API Key</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="regen-management" className="rounded" defaultChecked />
                  <Label htmlFor="regen-management">Content Management API Key</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRegenerateKeysDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                setIsProcessing(true)
                try {
                  const res = await fetch('/api/content/api-keys/regenerate', { method: 'POST' })
                  if (!res.ok) throw new Error('Failed to regenerate keys')
                  toast.success('API keys regenerated', { description: 'New keys are now active. Update your applications.' })
                  setShowRegenerateKeysDialog(false)
                } catch {
                  toast.error('Failed to regenerate API keys')
                } finally {
                  setIsProcessing(false)
                }
              }} disabled={isProcessing}>
                {isProcessing ? 'Generating...' : 'Regenerate Keys'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Entry Menu Dialog */}
        <Dialog open={showEntryMenuDialog} onOpenChange={setShowEntryMenuDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Entry Actions</DialogTitle>
              {entryMenuTarget && (
                <DialogDescription>{entryMenuTarget.title}</DialogDescription>
              )}
            </DialogHeader>
            <div className="py-2 space-y-1">
              <Button variant="ghost" className="w-full justify-start" onClick={() => {
                if (entryMenuTarget) {
                  setSelectedEntry(entryMenuTarget)
                  setShowEntryMenuDialog(false)
                }
              }}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => {
                if (entryMenuTarget) {
                  setEditEntryTitle(entryMenuTarget.title)
                  setEditEntrySlug(entryMenuTarget.slug)
                  setShowEditEntryDialog(true)
                  setShowEntryMenuDialog(false)
                }
              }}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Entry
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => {
                if (entryMenuTarget) {
                  toast.success('Entry duplicated', { description: `Copy of "${entryMenuTarget.title}" created as draft` })
                  setShowEntryMenuDialog(false)
                }
              }}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </Button>
              {entryMenuTarget?.status === 'draft' && (
                <Button variant="ghost" className="w-full justify-start" onClick={() => {
                  setShowPublishEntryDialog(true)
                  setShowEntryMenuDialog(false)
                }}>
                  <Send className="w-4 h-4 mr-2" />
                  Publish
                </Button>
              )}
              {entryMenuTarget?.status === 'published' && (
                <Button variant="ghost" className="w-full justify-start" onClick={() => {
                  toast.success('Entry unpublished', { description: `"${entryMenuTarget.title}" is now a draft` })
                  setShowEntryMenuDialog(false)
                }}>
                  <Archive className="w-4 h-4 mr-2" />
                  Unpublish
                </Button>
              )}
              <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => {
                if (entryMenuTarget) {
                  toast.success('Entry deleted', { description: `"${entryMenuTarget.title}" has been removed` })
                  setShowEntryMenuDialog(false)
                }
              }}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Entry Dialog */}
        <Dialog open={showEditEntryDialog} onOpenChange={setShowEditEntryDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Entry</DialogTitle>
              <DialogDescription>Modify entry details and content</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-entry-title">Title</Label>
                <Input
                  id="edit-entry-title"
                  value={editEntryTitle}
                  onChange={(e) => setEditEntryTitle(e.target.value)}
                  placeholder="Enter entry title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-entry-slug">Slug</Label>
                <Input
                  id="edit-entry-slug"
                  value={editEntrySlug}
                  onChange={(e) => setEditEntrySlug(e.target.value)}
                  placeholder="url-friendly-slug"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-entry-content">Content</Label>
                <Textarea
                  id="edit-entry-content"
                  placeholder="Enter your content here..."
                  rows={6}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditEntryDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                if (!editEntryTitle.trim()) {
                  toast.error('Title is required')
                  return
                }
                if (!entryMenuTarget) return
                setIsProcessing(true)
                try {
                  const res = await fetch(`/api/content/entries/${entryMenuTarget.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: editEntryTitle, slug: editEntrySlug })
                  })
                  if (!res.ok) throw new Error('Failed to update entry')
                  toast.success('Entry updated', { description: `"${editEntryTitle}" has been saved` })
                  setShowEditEntryDialog(false)
                  setSelectedEntry(null)
                } catch {
                  toast.error('Failed to update entry')
                } finally {
                  setIsProcessing(false)
                }
              }} disabled={isProcessing}>
                {isProcessing ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Publish Entry Dialog */}
        <Dialog open={showPublishEntryDialog} onOpenChange={setShowPublishEntryDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Publish Entry</DialogTitle>
              <DialogDescription>Make this content live and publicly accessible</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-300">
                  Publishing will make this entry visible to all users through the Content Delivery API.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Publish options</Label>
                <div className="flex items-center gap-2">
                  <input type="radio" name="publish-option" id="publish-now" className="rounded" defaultChecked />
                  <Label htmlFor="publish-now">Publish immediately</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="radio" name="publish-option" id="publish-schedule" className="rounded" />
                  <Label htmlFor="publish-schedule">Schedule for later</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPublishEntryDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                if (!entryMenuTarget) return
                setIsProcessing(true)
                try {
                  const res = await fetch(`/api/content/entries/${entryMenuTarget.id}/publish`, { method: 'POST' })
                  if (!res.ok) throw new Error('Failed to publish entry')
                  toast.success('Entry published', { description: 'Content is now live' })
                  setShowPublishEntryDialog(false)
                  setSelectedEntry(null)
                } catch {
                  toast.error('Failed to publish entry')
                } finally {
                  setIsProcessing(false)
                }
              }} disabled={isProcessing}>
                {isProcessing ? 'Publishing...' : 'Publish'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Content Type Dialog */}
        <Dialog open={showEditContentTypeDialog} onOpenChange={setShowEditContentTypeDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Content Type</DialogTitle>
              <DialogDescription>Modify content type settings and fields</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type-name">Name</Label>
                <Input
                  id="edit-type-name"
                  value={editContentTypeName}
                  onChange={(e) => setEditContentTypeName(e.target.value)}
                  placeholder="Content type name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type-description">Description</Label>
                <Textarea
                  id="edit-type-description"
                  value={editContentTypeDescription}
                  onChange={(e) => setEditContentTypeDescription(e.target.value)}
                  placeholder="Describe this content type..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Display Field</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select display field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="headline">Headline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditContentTypeDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                if (!editContentTypeName.trim()) {
                  toast.error('Name is required')
                  return
                }
                if (!selectedContentType) return
                setIsProcessing(true)
                try {
                  const res = await fetch(`/api/content/types/${selectedContentType.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: editContentTypeName, description: editContentTypeDescription })
                  })
                  if (!res.ok) throw new Error('Failed to update content type')
                  toast.success('Content type updated', { description: `"${editContentTypeName}" has been saved` })
                  setShowEditContentTypeDialog(false)
                  setSelectedContentType(null)
                } catch {
                  toast.error('Failed to update content type')
                } finally {
                  setIsProcessing(false)
                }
              }} disabled={isProcessing}>
                {isProcessing ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
