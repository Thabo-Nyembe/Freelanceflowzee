'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Webhook, Sliders, Globe as GlobeIcon, HardDrive, Trash2 as TrashIcon, RefreshCw, Download, Plus, Settings, Cloud, Code, Layers, FileText, Edit2, Archive, Send, Mail, Share2, Search, BarChart } from 'lucide-react'

// Import hooks
import { useContent, Content, ContentType, ContentStatus } from '@/lib/hooks/use-content'

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

// Import types for properly typed empty arrays
import type { AIInsight, Collaborator, Prediction } from '@/components/ui/competitive-upgrades'
import type { ActivityItem as ExtendedActivityItem } from '@/components/ui/competitive-upgrades-extended'

// Initialize Supabase client
const supabase = createClient()




// ============================================================================
// CONTENTFUL/STRAPI-LEVEL CMS - Headless Content Management System
// Features: Rich editor, Asset library, Content types, Localization, Versioning
// ============================================================================

// Types for the CMS
interface ContentEntry {
  id: string
  title: string
  slug: string
  contentType: string
  status: 'draft' | 'in_review' | 'scheduled' | 'published' | 'archived'
  locale: string
  locales: string[]
  version: number
  versions: ContentVersion[]
  author: {
    id: string
    name: string
    avatar: string
    email: string
  }
  fields: Record<string, any>
  metadata: {
    createdAt: string
    updatedAt: string
    publishedAt: string | null
    scheduledAt: string | null
  }
  seo: {
    metaTitle: string
    metaDescription: string
    ogImage: string | null
    keywords: string[]
  }
  stats: {
    views: number
    avgReadTime: number
    bounceRate: number
    shares: number
  }
  workflow: {
    stage: string
    assignee: string | null
    dueDate: string | null
    comments: number
  }
}

interface ContentVersion {
  id: string
  version: number
  createdAt: string
  createdBy: { name: string; avatar: string }
  changes: string[]
  status: 'draft' | 'published' | 'archived'
}

interface Asset {
  id: string
  filename: string
  title: string
  description: string
  type: 'image' | 'video' | 'audio' | 'document' | 'archive'
  mimeType: string
  size: number
  dimensions?: { width: number; height: number }
  duration?: number
  url: string
  thumbnailUrl: string
  folder: string
  tags: string[]
  uploadedBy: { name: string; avatar: string }
  uploadedAt: string
  usageCount: number
  alt?: string
}

interface ContentTypeModel {
  id: string
  name: string
  apiId: string
  description: string
  icon: string
  fields: ContentField[]
  entryCount: number
  lastModified: string
  createdBy: { name: string; avatar: string }
  isSystem: boolean
}

interface ContentField {
  id: string
  name: string
  apiId: string
  type: 'text' | 'richtext' | 'number' | 'boolean' | 'date' | 'media' | 'reference' | 'json' | 'enum' | 'location'
  required: boolean
  unique: boolean
  localized: boolean
  validation: Record<string, any>
  defaultValue: any
  helpText: string
}

interface Locale {
  code: string
  name: string
  flag: string
  isDefault: boolean
  fallback: string | null
  contentCount: number
  completionRate: number
}

interface WebhookConfig {
  id: string
  name: string
  url: string
  events: string[]
  headers: Record<string, string>
  secret: string
  isActive: boolean
  lastTriggered: string | null
  successRate: number
  totalCalls: number
}

// Form state interfaces
interface ContentFormState {
  title: string
  slug: string
  content_type: ContentType
  body: string
  excerpt: string
  status: ContentStatus
  meta_title: string
  meta_description: string
  meta_keywords: string
  category: string
  tags: string
  scheduled_for: string
}

interface AssetFormState {
  title: string
  description: string
  folder: string
  tags: string
  alt: string
}

interface WebhookFormState {
  name: string
  url: string
  events: string[]
  secret: string
  isActive: boolean
}

// Default form states
const defaultContentForm: ContentFormState = {
  title: '',
  slug: '',
  content_type: 'article',
  body: '',
  excerpt: '',
  status: 'draft',
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
  category: '',
  tags: '',
  scheduled_for: ''
}

const defaultAssetForm: AssetFormState = {
  title: '',
  description: '',
  folder: 'General',
  tags: '',
  alt: ''
}

const defaultWebhookForm: WebhookFormState = {
  name: '',
  url: '',
  events: [],
  secret: '',
  isActive: true
}

// MIGRATED: All mock data removed - using database hooks for real data
// Content types, locales, and other configuration data managed by database
const contentTypes: ContentTypeModel[] = []
const locales: Locale[] = []
const contentAIInsights: AIInsight[] = []
const contentCollaborators: Collaborator[] = []
const contentPredictions: Prediction[] = []
const contentActivities: ExtendedActivityItem[] = []

export default function ContentClient() {
  const router = useRouter()

  // View and filter state
  const [activeView, setActiveView] = useState<'entries' | 'assets' | 'types' | 'locales' | 'webhooks' | 'settings'>('entries')
  const [selectedEntry, setSelectedEntry] = useState<Content | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [localeFilter, setLocaleFilter] = useState<string>('all')
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [settingsTab, setSettingsTab] = useState('general')

  // Dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false)
  const [isWebhookDialogOpen, setIsWebhookDialogOpen] = useState(false)

  // Form state
  const [contentForm, setContentForm] = useState<ContentFormState>(defaultContentForm)
  const [assetForm, setAssetForm] = useState<AssetFormState>(defaultAssetForm)
  const [webhookForm, setWebhookForm] = useState<WebhookFormState>(defaultWebhookForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Use the content hook
  const {
    content: contentData,
    loading: contentLoading,
    error: contentError,
    createContent,
    updateContent,
    deleteContent,
    refetch: refetchContent
  } = useContent({
    contentType: contentTypeFilter !== 'all' ? contentTypeFilter as ContentType : 'all',
    status: statusFilter !== 'all' ? statusFilter as ContentStatus : 'all',
    limit: 50
  })

  // Assets query (using direct Supabase for assets table)
  const [assets, setAssets] = useState<Asset[]>([])
  const [assetsLoading, setAssetsLoading] = useState(true)

  // Webhooks state
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([])
  const [webhooksLoading, setWebhooksLoading] = useState(true)

  // Fetch assets
  useEffect(() => {
    async function fetchAssets() {
      setAssetsLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        let query = supabase
          .from('assets')
          .select('*')
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })

        if (assetTypeFilter !== 'all') {
          query = query.eq('asset_type', assetTypeFilter)
        }

        const { data, error } = await query
        if (error) throw error

        setAssets(data?.map((a: any) => ({
          id: a.id,
          filename: a.filename || a.name,
          title: a.title || a.name,
          description: a.description || '',
          type: a.asset_type || 'document',
          mimeType: a.mime_type || 'application/octet-stream',
          size: a.file_size || 0,
          dimensions: a.width && a.height ? { width: a.width, height: a.height } : undefined,
          duration: a.duration,
          url: a.url || '',
          thumbnailUrl: a.thumbnail_url || a.url || '',
          folder: a.folder || 'General',
          tags: a.tags || [],
          uploadedBy: { name: 'You', avatar: 'U' },
          uploadedAt: a.created_at,
          usageCount: a.usage_count || 0,
          alt: a.alt_text
        })) || [])
      } catch (error) {
        console.error('Error fetching assets:', error)
      } finally {
        setAssetsLoading(false)
      }
    }

    fetchAssets()
  }, [ assetTypeFilter])

  // Fetch webhooks
  useEffect(() => {
    async function fetchWebhooks() {
      setWebhooksLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('webhooks')
          .select('*')
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })

        if (error) throw error

        setWebhooks(data?.map((w: any) => ({
          id: w.id,
          name: w.name,
          url: w.url,
          events: w.events || [],
          headers: w.headers || {},
          secret: w.secret || '',
          isActive: w.is_active ?? true,
          lastTriggered: w.last_triggered_at,
          successRate: w.success_rate || 100,
          totalCalls: w.total_calls || 0
        })) || [])
      } catch (error) {
        console.error('Error fetching webhooks:', error)
      } finally {
        setWebhooksLoading(false)
      }
    }

    fetchWebhooks()
  }, [])

  // Calculate stats
  const stats = useMemo(() => {
    const entries = contentData || []
    const totalEntries = entries.length
    const publishedEntries = entries.filter(e => e.status === 'published').length
    const draftEntries = entries.filter(e => e.status === 'draft').length
    const scheduledEntries = entries.filter(e => e.status === 'scheduled').length
    const totalAssets = assets.length
    const totalAssetSize = assets.reduce((sum, a) => sum + a.size, 0)
    const totalContentTypes = contentTypes.length
    const totalLocales = locales.length
    const webhooksActive = webhooks.filter(w => w.isActive).length
    const totalViews = entries.reduce((sum, e) => sum + (e.view_count || 0), 0)

    return {
      totalEntries,
      publishedEntries,
      draftEntries,
      scheduledEntries,
      totalAssets,
      totalAssetSize,
      contentTypes: totalContentTypes,
      locales: totalLocales,
      webhooksActive,
      totalViews
    }
  }, [contentData, assets, webhooks])

  // Filtered entries
  const filteredEntries = useMemo(() => {
    const entries = contentData || []
    return entries.filter(e => {
      const matchesSearch = !searchQuery ||
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.slug && e.slug.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesSearch
    })
  }, [contentData, searchQuery])

  // Filtered assets
  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      const matchesSearch = !searchQuery ||
        a.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [assets, searchQuery])

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
      case 'in_review': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'scheduled': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      case 'archived': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'image': return 'IMG'
      case 'video': return 'VID'
      case 'audio': return 'AUD'
      case 'document': return 'DOC'
      case 'archive': return 'ZIP'
      default: return 'FILE'
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes >= 1000000000) return (bytes / 1000000000).toFixed(1) + ' GB'
    if (bytes >= 1000000) return (bytes / 1000000).toFixed(1) + ' MB'
    if (bytes >= 1000) return (bytes / 1000).toFixed(1) + ' KB'
    return bytes + ' B'
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  // CRUD Handlers
  const handleCreateContent = async () => {
    if (!contentForm.title.trim()) {
      toast.error('Title is required')
      return
    }

    setIsSubmitting(true)
    try {
      const slug = contentForm.slug || generateSlug(contentForm.title)
      const result = await createContent({
        title: contentForm.title,
        slug,
        content_type: contentForm.content_type,
        body: contentForm.body,
        excerpt: contentForm.excerpt,
        status: contentForm.status,
        meta_title: contentForm.meta_title || contentForm.title,
        meta_description: contentForm.meta_description || contentForm.excerpt,
        meta_keywords: contentForm.meta_keywords ? contentForm.meta_keywords.split(',').map(k => k.trim()) : [],
        category: contentForm.category,
        tags: contentForm.tags ? contentForm.tags.split(',').map(t => t.trim()) : [],
        scheduled_for: contentForm.scheduled_for || null,
        language: 'en-US',
        version: 1,
        view_count: 0,
        unique_views: 0,
        like_count: 0,
        share_count: 0,
        comment_count: 0,
        bookmark_count: 0,
        allow_comments: true,
        allow_sharing: true,
        is_featured: false,
        is_premium: false,
        is_private: false,
        is_translated: false,
        text_format: 'html'
      })

      if (result) {
        toast.success(`${contentForm.title} has been created as a ${contentForm.status}`)
        setContentForm(defaultContentForm)
        setIsCreateDialogOpen(false)
        refetchContent()
      }
    } catch (error) {
      toast.error('Failed to create content')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateContent = async () => {
    if (!selectedEntry || !contentForm.title.trim()) {
      toast.error('Title is required')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await updateContent({
        title: contentForm.title,
        slug: contentForm.slug || generateSlug(contentForm.title),
        content_type: contentForm.content_type,
        body: contentForm.body,
        excerpt: contentForm.excerpt,
        status: contentForm.status,
        meta_title: contentForm.meta_title,
        meta_description: contentForm.meta_description,
        meta_keywords: contentForm.meta_keywords ? contentForm.meta_keywords.split(',').map(k => k.trim()) : [],
        category: contentForm.category,
        tags: contentForm.tags ? contentForm.tags.split(',').map(t => t.trim()) : [],
        scheduled_for: contentForm.scheduled_for || null,
        version: (selectedEntry.version || 0) + 1
      }, selectedEntry.id)

      if (result) {
        toast.success(`Content updated successfully: "${contentForm.title}" has been updated`)
        setContentForm(defaultContentForm)
        setSelectedEntry(null)
        setIsEditDialogOpen(false)
        refetchContent()
      }
    } catch (error) {
      toast.error('Failed to update content')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteContent = async () => {
    if (!selectedEntry) return

    setIsSubmitting(true)
    try {
      const result = await deleteContent(selectedEntry.id)

      if (result) {
        toast.success(`Content deleted: "${selectedEntry.title}" has been moved to trash`)
        setSelectedEntry(null)
        setIsDeleteDialogOpen(false)
        refetchContent()
      }
    } catch (error) {
      toast.error('Failed to delete content')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePublishContent = async (entry: Content) => {
    setIsSubmitting(true)
    try {
      const result = await updateContent({
        status: 'published',
        published_at: new Date().toISOString(),
        version: (entry.version || 0) + 1
      }, entry.id)

      if (result) {
        toast.success(`Content published: is now live`)
        refetchContent()
      }
    } catch (error) {
      toast.error('Failed to publish content')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleScheduleContent = async (entry: Content, scheduledDate: string) => {
    setIsSubmitting(true)
    try {
      const result = await updateContent({
        status: 'scheduled',
        scheduled_for: scheduledDate,
        version: (entry.version || 0) + 1
      }, entry.id)

      if (result) {
        toast.success(`Content scheduled: will be published on ${new Date(scheduledDate).toLocaleDateString()}`)
        refetchContent()
      }
    } catch (error) {
      toast.error('Failed to schedule content')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleArchiveContent = async (entry: Content) => {
    setIsSubmitting(true)
    try {
      const result = await updateContent({
        status: 'archived',
        version: (entry.version || 0) + 1
      }, entry.id)

      if (result) {
        toast.info(`Content archived: has been archived`)
        refetchContent()
      }
    } catch (error) {
      toast.error('Failed to archive content')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDuplicateContent = async (entry: Content) => {
    setIsSubmitting(true)
    try {
      const result = await createContent({
        title: `${entry.title} (Copy)`,
        slug: `${entry.slug || generateSlug(entry.title)}-copy`,
        content_type: entry.content_type,
        body: entry.body,
        excerpt: entry.excerpt,
        status: 'draft',
        meta_title: entry.meta_title,
        meta_description: entry.meta_description,
        meta_keywords: entry.meta_keywords,
        category: entry.category,
        tags: entry.tags,
        language: entry.language || 'en-US',
        version: 1,
        view_count: 0,
        unique_views: 0,
        like_count: 0,
        share_count: 0,
        comment_count: 0,
        bookmark_count: 0,
        allow_comments: entry.allow_comments,
        allow_sharing: entry.allow_sharing,
        is_featured: false,
        is_premium: entry.is_premium,
        is_private: entry.is_private,
        is_translated: false,
        text_format: entry.text_format || 'html'
      })

      if (result) {
        toast.success(`Content duplicated`)
        refetchContent()
      }
    } catch (error) {
      toast.error('Failed to duplicate content')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Asset handlers
  const handleUploadAsset = async (file?: File) => {
    if (!file) {
      // Open file picker
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*,video/*,audio/*,application/pdf'
      input.onchange = async (e) => {
        const selectedFile = (e.target as HTMLInputElement).files?.[0]
        if (selectedFile) await handleUploadAsset(selectedFile)
      }
      input.click()
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('assets')
        .upload(fileName, file, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('assets').getPublicUrl(fileName)

      const { error: insertError } = await supabase.from('assets').insert({
        user_id: user.id,
        filename: file.name,
        url: publicUrl,
        file_type: file.type,
        file_size: file.size,
        storage_path: fileName
      })

      if (insertError) throw insertError

      toast.success('Asset uploaded successfully')
      // Refresh assets list
      const { data: newAssets } = await supabase.from('assets').select('*').eq('user_id', user.id).is('deleted_at', null)
      if (newAssets) setAssets(newAssets)
    } catch (error) {
      toast.error('Upload failed', { description: error.message })
    }
  }

  const handleCopyAssetUrl = (asset: Asset) => {
    toast.promise(
      navigator.clipboard.writeText(asset.url),
      {
        loading: 'Copying URL...',
        success: 'URL copied to clipboard',
        error: 'Failed to copy URL'
      }
    )
  }

  const handleDownloadAsset = async (asset: Asset) => {
    try {
      const response = await fetch(asset.url)
      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = asset.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success(`Downloaded: ${asset.filename}`)
    } catch (error) {
      toast.error('Download failed', { description: error.message })
    }
  }

  const handleDeleteAsset = async (asset: Asset) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('assets')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', asset.id)
        .eq('user_id', user.id)

      if (error) throw error

      toast.success(`Asset deleted: has been removed`)

      setAssets(prev => prev.filter(a => a.id !== asset.id))
      setSelectedAsset(null)
    } catch (error) {
      toast.error('Failed to delete asset')
    }
  }

  // Webhook handlers
  const handleCreateWebhook = async () => {
    if (!webhookForm.name.trim() || !webhookForm.url.trim()) {
      toast.error('Name and URL are required')
      return
    }

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('webhooks')
        .insert({
          user_id: user.id,
          name: webhookForm.name,
          url: webhookForm.url,
          events: webhookForm.events,
          secret: webhookForm.secret,
          is_active: webhookForm.isActive,
          success_rate: 100,
          total_calls: 0
        })
        .select()
        .single()

      if (error) throw error

      toast.success(`Webhook created: is now active`)

      setWebhooks(prev => [{
        id: data.id,
        name: data.name,
        url: data.url,
        events: data.events || [],
        headers: {},
        secret: data.secret || '',
        isActive: data.is_active,
        lastTriggered: null,
        successRate: 100,
        totalCalls: 0
      }, ...prev])

      setWebhookForm(defaultWebhookForm)
      setIsWebhookDialogOpen(false)
    } catch (error) {
      toast.error('Failed to create webhook')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleWebhook = async (webhook: WebhookConfig) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('webhooks')
        .update({ is_active: !webhook.isActive })
        .eq('id', webhook.id)
        .eq('user_id', user.id)

      if (error) throw error

      toast.success(webhook.isActive ? 'Webhook disabled' : 'Webhook enabled')

      setWebhooks(prev => prev.map(w =>
        w.id === webhook.id ? { ...w, isActive: !w.isActive } : w
      ))
    } catch (error) {
      toast.error('Failed to toggle webhook')
    }
  }

  // Export handler
  const handleExportContent = async () => {
    try {
      const exportData = {
        entries: contentData,
        assets: assets,
        exportedAt: new Date().toISOString()
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `content-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Export complete')
    } catch (error) {
      toast.error('Export failed')
    }
  }

  // Open edit dialog with selected entry data
  const openEditDialog = (entry: Content) => {
    setSelectedEntry(entry)
    setContentForm({
      title: entry.title,
      slug: entry.slug || '',
      content_type: entry.content_type,
      body: entry.body || '',
      excerpt: entry.excerpt || '',
      status: entry.status,
      meta_title: entry.meta_title || '',
      meta_description: entry.meta_description || '',
      meta_keywords: entry.meta_keywords?.join(', ') || '',
      category: entry.category || '',
      tags: entry.tags?.join(', ') || '',
      scheduled_for: entry.scheduled_for || ''
    })
    setIsEditDialogOpen(true)
  }

  // Quick actions for the toolbar
  const contentQuickActionsWithHandlers = [
    { id: '1', label: 'New Entry', icon: 'FileText', shortcut: 'N', action: () => setIsCreateDialogOpen(true) },
    { id: '2', label: 'Upload', icon: 'Upload', shortcut: 'U', action: handleUploadAsset },
    { id: '3', label: 'Export', icon: 'Download', shortcut: 'E', action: handleExportContent },
    { id: '4', label: 'Refresh', icon: 'RefreshCw', shortcut: 'R', action: () => refetchContent() },
    { id: '5', label: 'Email Marketing', icon: <Mail className="w-4 h-4" />, action: () => router.push('/dashboard/email-marketing-v2') },
    { id: '6', label: 'Social Media', icon: <Share2 className="w-4 h-4" />, action: () => router.push('/dashboard/social-media-v2') },
    { id: '7', label: 'SEO Tools', icon: <Search className="w-4 h-4" />, action: () => router.push('/dashboard/seo-v2') },
    { id: '8', label: 'Analytics', icon: <BarChart className="w-4 h-4" />, action: () => router.push('/dashboard/analytics-v2?source=content') },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 dark:bg-none dark:bg-gray-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Content Management
              </h1>
              <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-medium rounded-full">
                Contentful Level
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Headless CMS with localization, versioning & webhooks</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white w-64"
            />
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Entry
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Entries</div>
            <div className="text-2xl font-bold text-emerald-600">{stats.totalEntries}</div>
            <div className="text-xs text-green-600">{stats.publishedEntries} published</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Assets</div>
            <div className="text-2xl font-bold text-teal-600">{stats.totalAssets}</div>
            <div className="text-xs text-teal-600">{formatSize(stats.totalAssetSize)}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Content Types</div>
            <div className="text-2xl font-bold text-cyan-600">{stats.contentTypes}</div>
            <div className="text-xs text-cyan-600">0 fields</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Locales</div>
            <div className="text-2xl font-bold text-blue-600">{stats.locales}</div>
            <div className="text-xs text-blue-600">0 translations</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Views</div>
            <div className="text-2xl font-bold text-purple-600">{formatNumber(stats.totalViews)}</div>
            <div className="text-xs text-purple-600">{stats.webhooksActive} webhooks active</div>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as string)} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border dark:border-gray-700">
            <TabsTrigger value="entries" className="data-[state=active]:bg-emerald-100 dark:data-[state=active]:bg-emerald-900/30">
              <FileText className="w-4 h-4 mr-2" />
              Entries
            </TabsTrigger>
            <TabsTrigger value="assets" className="data-[state=active]:bg-teal-100 dark:data-[state=active]:bg-teal-900/30">
              <HardDrive className="w-4 h-4 mr-2" />
              Assets
            </TabsTrigger>
            <TabsTrigger value="types" className="data-[state=active]:bg-cyan-100 dark:data-[state=active]:bg-cyan-900/30">
              <Layers className="w-4 h-4 mr-2" />
              Content Types
            </TabsTrigger>
            <TabsTrigger value="locales" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30">
              <GlobeIcon className="w-4 h-4 mr-2" />
              Localization
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30">
              <Webhook className="w-4 h-4 mr-2" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-900/30">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Entries Tab */}
          <TabsContent value="entries" className="space-y-4">
            <div className="flex gap-4 mb-4">
              <select
                value={contentTypeFilter}
                onChange={(e) => setContentTypeFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="article">Article</option>
                <option value="blog">Blog</option>
                <option value="page">Page</option>
                <option value="post">Post</option>
                <option value="document">Document</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="in_review">In Review</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
              <Button variant="outline" onClick={() => refetchContent()} disabled={contentLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${contentLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {contentLoading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
              </div>
            ) : contentError ? (
              <div className="text-center text-red-500 py-8">
                Error loading content: {contentError.message}
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No content found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Get started by creating your first content entry</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Content
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredEntries.map(entry => (
                  <div
                    key={entry.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(entry.status)}`}>
                            {entry.status}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded text-xs">
                            {entry.content_type}
                          </span>
                          <span className="px-2 py-1 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 rounded text-xs">
                            v{entry.version || 1}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold dark:text-white">{entry.title}</h3>
                        {entry.slug && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">/{entry.slug}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                          <span>Updated {new Date(entry.updated_at).toLocaleDateString()}</span>
                          {entry.category && <span>Category: {entry.category}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {entry.status === 'published' && (
                          <div className="text-right text-sm text-gray-500 dark:text-gray-400 mr-4">
                            <div className="flex items-center gap-1">
                              <span>{formatNumber(entry.view_count || 0)} views</span>
                            </div>
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(entry)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        {entry.status === 'draft' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePublishContent(entry)}
                            disabled={isSubmitting}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        )}
                        {entry.status !== 'archived' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleArchiveContent(entry)}
                            disabled={isSubmitting}
                          >
                            <Archive className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedEntry(entry)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <TrashIcon className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Assets Tab */}
          <TabsContent value="assets" className="space-y-4">
            <div className="flex gap-4 mb-4">
              <select
                value={assetTypeFilter}
                onChange={(e) => setAssetTypeFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
                <option value="document">Documents</option>
              </select>
              <Button variant="outline" onClick={handleUploadAsset}>
                <Plus className="w-4 h-4 mr-2" />
                Upload Asset
              </Button>
            </div>

            {assetsLoading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-teal-600" />
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="text-center py-12">
                <HardDrive className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No assets found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Upload your first asset to get started</p>
                <Button onClick={handleUploadAsset}>
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Asset
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAssets.map(asset => (
                  <div
                    key={asset.id}
                    className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border dark:border-gray-700 hover:shadow-md transition-all"
                  >
                    <div className="h-40 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl font-bold text-gray-400">
                      {getAssetIcon(asset.type)}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs capitalize">
                          {asset.type}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{formatSize(asset.size)}</span>
                      </div>
                      <h3 className="font-semibold dark:text-white truncate">{asset.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{asset.filename}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-500">{asset.folder}</span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleCopyAssetUrl(asset)}>
                            Copy
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDownloadAsset(asset)}>
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteAsset(asset)}>
                            <TrashIcon className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Content Types Tab */}
          <TabsContent value="types" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold dark:text-white">Content Types</h3>
              <Button className="bg-cyan-600 hover:bg-cyan-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Type
              </Button>
            </div>

            <div className="grid gap-4">
              {contentTypes.length === 0 ? (
                <div className="text-center py-12">
                  <Layers className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No content types configured</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first content type to get started</p>
                  <Button className="bg-cyan-600 hover:bg-cyan-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Type
                  </Button>
                </div>
              ) : (
                contentTypes.map(ct => (
                  <div key={ct.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-gray-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold dark:text-white">{ct.name}</h3>
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono dark:text-gray-300">
                              {ct.apiId}
                            </span>
                            {ct.isSystem && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 rounded text-xs">
                                System
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{ct.description}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                            <span>{ct.entryCount} entries</span>
                            <span>{ct.fields.length} fields</span>
                            <span>Updated {new Date(ct.lastModified).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                    <div className="mt-4 pt-4 border-t dark:border-gray-700">
                      <div className="text-sm font-medium mb-2 dark:text-white">Fields</div>
                      <div className="flex flex-wrap gap-2">
                        {ct.fields.map(field => (
                          <span key={field.id} className="px-2 py-1 bg-gray-50 dark:bg-gray-700 rounded text-sm dark:text-gray-300">
                            <span className="text-gray-500 dark:text-gray-400">{field.type}:</span> {field.name}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                            {field.localized && <span className="ml-1"><GlobeIcon className="w-3 h-3 inline" /></span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Localization Tab */}
          <TabsContent value="locales" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold dark:text-white">Localization</h3>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Locale
              </Button>
            </div>

            <div className="grid gap-4">
              {locales.length === 0 ? (
                <div className="text-center py-12">
                  <GlobeIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No locales configured</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Add your first locale to start translation workflows</p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Locale
                  </Button>
                </div>
              ) : (
                locales.map(locale => (
                  <div key={locale.code} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-sm font-bold">
                          {locale.flag}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold dark:text-white">{locale.name}</h3>
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono dark:text-gray-300">
                              {locale.code}
                            </span>
                            {locale.isDefault && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 rounded text-xs">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>{locale.contentCount} entries</span>
                            {locale.fallback && <span>Fallback: {locale.fallback}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{locale.completionRate}%</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">translated</div>
                        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${locale.completionRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold dark:text-white">Webhooks</h3>
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => setIsWebhookDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Webhook
              </Button>
            </div>

            {webhooksLoading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            ) : webhooks.length === 0 ? (
              <div className="text-center py-12">
                <Webhook className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No webhooks configured</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Create webhooks to notify external services of content changes</p>
                <Button onClick={() => setIsWebhookDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Webhook
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {webhooks.map(webhook => (
                  <div key={webhook.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`w-2 h-2 rounded-full ${webhook.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <h3 className="font-semibold dark:text-white">{webhook.name}</h3>
                          <span className={`px-2 py-1 rounded text-xs ${webhook.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                            {webhook.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-mono truncate">{webhook.url}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {webhook.events.map(event => (
                            <span key={event} className="px-2 py-1 bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 rounded text-xs">
                              {event}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">{webhook.successRate}%</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">success rate</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatNumber(webhook.totalCalls)} calls
                          </div>
                        </div>
                        <Switch
                          checked={webhook.isActive}
                          onCheckedChange={() => handleToggleWebhook(webhook)}
                        />
                      </div>
                    </div>
                    {webhook.lastTriggered && (
                      <div className="mt-4 pt-4 border-t dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                        Last triggered: {new Date(webhook.lastTriggered).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3 space-y-1">
                <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Settings</h3>
                {[
                  { id: 'general', label: 'General', icon: Settings },
                  { id: 'content', label: 'Content Model', icon: Layers },
                  { id: 'delivery', label: 'Delivery', icon: Cloud },
                  { id: 'localization', label: 'Localization', icon: GlobeIcon },
                  { id: 'api', label: 'API Access', icon: Code },
                  { id: 'advanced', label: 'Advanced', icon: Sliders },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSettingsTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                      settingsTab === item.id
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Space Configuration</CardTitle>
                        <CardDescription>General settings for your content space</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <Label>Space Name</Label>
                            <Input defaultValue="Production Content" className="mt-1" />
                          </div>
                          <div>
                            <Label>Space ID</Label>
                            <Input defaultValue="spc_abcd1234" readOnly className="mt-1 bg-gray-50 dark:bg-gray-800" />
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Input defaultValue="Main production content management space" className="mt-1" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="text-sm text-gray-500">Content Entries</p>
                            <p className="text-2xl font-bold">{stats.totalEntries}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Assets</p>
                            <p className="text-2xl font-bold">{stats.totalAssets}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Content Types</p>
                            <p className="text-2xl font-bold">{stats.contentTypes}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Import / Export</CardTitle>
                        <CardDescription>Backup and migrate content</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={handleExportContent}>
                            <Download className="w-5 h-5" />
                            <span>Export Content</span>
                          </Button>
                          <Button variant="outline" className="h-20 flex flex-col gap-2">
                            <Plus className="w-5 h-5" />
                            <span>Import Content</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Other settings tabs remain similar but simplified for brevity */}
                {settingsTab === 'content' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Content Model Settings</CardTitle>
                      <CardDescription>Configure content type behavior</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Enable Field Validation</p>
                          <p className="text-sm text-gray-500">Validate content before publishing</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Auto-generate Slugs</p>
                          <p className="text-sm text-gray-500">Create URL slugs from titles</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'api' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>API Keys</CardTitle>
                      <CardDescription>Manage access tokens</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Content Delivery API</span>
                          <Badge className="bg-green-100 text-green-700">Active</Badge>
                        </div>
                        <code className="block w-full p-3 bg-gray-900 text-green-400 rounded font-mono text-sm overflow-x-auto">
                          cda_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
                        </code>
                      </div>
                      <Button variant="outline" className="w-full">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate Keys
                      </Button>
                    </CardContent>
                  </Card>
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
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight')}
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
          <QuickActionsToolbar
            actions={contentQuickActionsWithHandlers}
            variant="grid"
          />
        </div>
      </div>

      {/* Create Content Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label>Title *</Label>
                <Input
                  value={contentForm.title}
                  onChange={(e) => setContentForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter title"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={contentForm.slug}
                  onChange={(e) => setContentForm(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="auto-generated-from-title"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label>Content Type</Label>
                <Select
                  value={contentForm.content_type}
                  onValueChange={(v) => setContentForm(prev => ({ ...prev, content_type: v as ContentType }))}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="blog">Blog</SelectItem>
                    <SelectItem value="page">Page</SelectItem>
                    <SelectItem value="post">Post</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={contentForm.status}
                  onValueChange={(v) => setContentForm(prev => ({ ...prev, status: v as ContentStatus }))}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Excerpt</Label>
              <Textarea
                value={contentForm.excerpt}
                onChange={(e) => setContentForm(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Brief description..."
                className="mt-1"
                rows={2}
              />
            </div>
            <div>
              <Label>Body</Label>
              <Textarea
                value={contentForm.body}
                onChange={(e) => setContentForm(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Main content..."
                className="mt-1"
                rows={6}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label>Category</Label>
                <Input
                  value={contentForm.category}
                  onChange={(e) => setContentForm(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Guides"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={contentForm.tags}
                  onChange={(e) => setContentForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="tag1, tag2, tag3"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                onClick={handleCreateContent}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Create Content
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setContentForm(defaultContentForm)
                  setIsCreateDialogOpen(false)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Content Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label>Title *</Label>
                <Input
                  value={contentForm.title}
                  onChange={(e) => setContentForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter title"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={contentForm.slug}
                  onChange={(e) => setContentForm(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="url-slug"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label>Content Type</Label>
                <Select
                  value={contentForm.content_type}
                  onValueChange={(v) => setContentForm(prev => ({ ...prev, content_type: v as ContentType }))}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="blog">Blog</SelectItem>
                    <SelectItem value="page">Page</SelectItem>
                    <SelectItem value="post">Post</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={contentForm.status}
                  onValueChange={(v) => setContentForm(prev => ({ ...prev, status: v as ContentStatus }))}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Excerpt</Label>
              <Textarea
                value={contentForm.excerpt}
                onChange={(e) => setContentForm(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Brief description..."
                className="mt-1"
                rows={2}
              />
            </div>
            <div>
              <Label>Body</Label>
              <Textarea
                value={contentForm.body}
                onChange={(e) => setContentForm(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Main content..."
                className="mt-1"
                rows={6}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label>Category</Label>
                <Input
                  value={contentForm.category}
                  onChange={(e) => setContentForm(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Guides"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={contentForm.tags}
                  onChange={(e) => setContentForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="tag1, tag2, tag3"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                onClick={handleUpdateContent}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Edit2 className="w-4 h-4 mr-2" />
                )}
                Update Content
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDuplicateContent(selectedEntry!)}
                disabled={isSubmitting || !selectedEntry}
              >
                Duplicate
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setContentForm(defaultContentForm)
                  setSelectedEntry(null)
                  setIsEditDialogOpen(false)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete "{selectedEntry?.title}"? This action can be undone from the trash.
            </p>
            <div className="flex gap-3">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDeleteContent}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <TrashIcon className="w-4 h-4 mr-2" />
                )}
                Delete
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedEntry(null)
                  setIsDeleteDialogOpen(false)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Webhook Dialog */}
      <Dialog open={isWebhookDialogOpen} onOpenChange={setIsWebhookDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Webhook</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={webhookForm.name}
                onChange={(e) => setWebhookForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Production Deploy"
                className="mt-1"
              />
            </div>
            <div>
              <Label>URL *</Label>
              <Input
                value={webhookForm.url}
                onChange={(e) => setWebhookForm(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://api.example.com/webhook"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Events</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['entry.publish', 'entry.update', 'entry.delete', 'asset.upload'].map(event => (
                  <Button
                    key={event}
                    variant={webhookForm.events.includes(event) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setWebhookForm(prev => ({
                      ...prev,
                      events: prev.events.includes(event)
                        ? prev.events.filter(e => e !== event)
                        : [...prev.events, event]
                    }))}
                  >
                    {event}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label>Secret (optional)</Label>
              <Input
                value={webhookForm.secret}
                onChange={(e) => setWebhookForm(prev => ({ ...prev, secret: e.target.value }))}
                placeholder="Signing secret"
                className="mt-1"
                type="password"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={webhookForm.isActive}
                onCheckedChange={(checked) => setWebhookForm(prev => ({ ...prev, isActive: checked }))}
              />
              <Label>Active</Label>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                onClick={handleCreateWebhook}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Create Webhook
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setWebhookForm(defaultWebhookForm)
                  setIsWebhookDialogOpen(false)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
