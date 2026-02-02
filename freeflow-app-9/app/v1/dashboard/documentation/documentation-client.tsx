'use client'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

// Import the Supabase documentation hook for real database operations
import {
  useDocumentationCRUD,
  Documentation as SupabaseDoc,
  DocStatus,
  DocType,
  DocCategory,
  CreateDocumentationInput
} from '@/lib/hooks/use-documentation'
import {
  FileText, Plus, Search, Eye, Edit, Trash2, Star, Clock, Users,
  BookOpen, FolderOpen, ChevronRight, ChevronDown, MessageSquare, History,
  Share2, Settings, Globe, Tag, ThumbsUp, ThumbsDown, Calendar, CheckCircle2, Code, GitBranch,
  Zap, TrendingUp, BarChart3, Download, Upload, Sparkles, Layout,
  RefreshCw, Bell, Database, Languages, FileCheck, Rocket, Target, PenTool, Megaphone,
  Loader2
} from 'lucide-react'

// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
  type AIInsight,
  type Collaborator,
  type Prediction,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
  type ActivityItem,
  type QuickAction,
} from '@/components/ui/competitive-upgrades-extended'

import {
  CollapsibleInsightsPanel,
  InsightsToggleButton,
  useInsightsPanel
} from '@/components/ui/collapsible-insights-panel'

// Type definitions
interface DocSpace {
  id: string
  key: string
  name: string
  description: string
  icon: string
  visibility: 'public' | 'private' | 'internal'
  owner: { name: string; avatar: string }
  team_members: number
  pages_count: number
  views: number
  last_updated: string
  created_at: string
  git_sync?: { enabled: boolean; repo: string; branch: string }
  custom_domain?: string
  is_starred: boolean
  status: 'published' | 'draft' | 'archived'
}

interface DocPage {
  id: string
  space_id: string
  title: string
  slug: string
  content: string
  excerpt: string
  status: 'published' | 'draft' | 'archived' | 'review'
  author: { name: string; avatar: string }
  contributors: { name: string; avatar: string }[]
  created_at: string
  updated_at: string
  published_at?: string
  version: number
  parent_id?: string
  children: string[]
  order: number
  labels: string[]
  likes: number
  comments_count: number
  views: number
  reading_time: string
  is_bookmarked: boolean
}

interface DocVersion {
  id: string
  page_id: string
  version: number
  author: { name: string; avatar: string }
  created_at: string
  message: string
  changes: { additions: number; deletions: number }
  is_current: boolean
}

interface DocTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: string
  usage_count: number
  preview_content: string
  is_official: boolean
}

interface DocIntegration {
  id: string
  name: string
  type: 'git' | 'api' | 'webhook' | 'sso'
  icon: any
  status: 'connected' | 'disconnected' | 'error'
  last_sync?: string
  config?: Record<string, string>
}

interface DocChangelog {
  id: string
  version: string
  title: string
  date: string
  type: 'major' | 'minor' | 'patch'
  status: 'published' | 'draft' | 'scheduled'
  scheduled_date?: string
  changes: {
    added: string[]
    changed: string[]
    fixed: string[]
    deprecated: string[]
    removed: string[]
    security: string[]
  }
  author: { name: string; avatar: string }
  views: number
}

interface DocLocale {
  id: string
  code: string
  name: string
  native_name: string
  flag: string
  is_default: boolean
  completion: number
  pages_translated: number
  pages_total: number
  last_updated: string
  contributors: { name: string; avatar: string }[]
  status: 'active' | 'draft' | 'review'
}


// Quick actions are defined as a function to allow access to component state
const getDocsQuickActions = (
  setShowCreateDocDialog: (v: boolean) => void,
  setSearchQuery: (v: string) => void,
  handleExportDocsReal: () => Promise<void>
) => [
  {
    id: '1',
    label: 'New Page',
    icon: 'plus',
    action: () => {
      setShowCreateDocDialog(true)
      toast.success('Create a new documentation page')
    },
    variant: 'default' as const
  },
  {
    id: '2',
    label: 'Search Docs',
    icon: 'search',
    action: () => {
      // Focus search input - set a flag to trigger focus
      const searchInput = document.querySelector('input[placeholder="Search docs..."]') as HTMLInputElement
      if (searchInput) {
        searchInput.focus()
        toast.success('Search documentation - start typing to find content')
      } else {
        toast.info('Use the search bar above to search documentation')
      }
    },
    variant: 'default' as const
  },
  {
    id: '3',
    label: 'Export PDF',
    icon: 'download',
    action: handleExportDocsReal,
    variant: 'outline' as const
  },
]

export default function DocumentationClient() {
  const insightsPanel = useInsightsPanel(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpace, setSelectedSpace] = useState<DocSpace | null>(null)
  const [selectedPage, setSelectedPage] = useState<DocPage | null>(null)
  const [showVersions, setShowVersions] = useState(false)
  const [showNewSpace, setShowNewSpace] = useState(false)
  const [expandedPages, setExpandedPages] = useState<string[]>(['page1'])
  const [selectedChangelog, setSelectedChangelog] = useState<DocChangelog | null>(null)
  const [selectedLocale, setSelectedLocale] = useState<DocLocale | null>(null)
  const [settingsTab, setSettingsTab] = useState('general')

  // Supabase CRUD hook for real database operations
  const {
    docs: supabaseDocs,
    stats: supabaseStats,
    loading: docsLoading,
    mutating,
    error: docsError,
    createDoc,
    updateDoc,
    deleteDoc,
    publishDoc,
    archiveDoc,
    toggleLike,
    submitFeedback,
    refetch: refetchDocs
  } = useDocumentationCRUD()

  // Dialog states for CRUD operations
  const [showCreateDocDialog, setShowCreateDocDialog] = useState(false)
  const [showEditDocDialog, setShowEditDocDialog] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [docToEdit, setDocToEdit] = useState<SupabaseDoc | null>(null)
  const [docToDelete, setDocToDelete] = useState<SupabaseDoc | null>(null)

  // Form state for create/edit documentation
  const [docFormData, setDocFormData] = useState<CreateDocumentationInput>({
    title: '',
    description: '',
    content: '',
    status: 'draft',
    doc_type: 'guide',
    category: 'getting-started',
    author: '',
    version: 'v1.0',
    tags: []
  })

  // Reset form data
  const resetDocForm = () => {
    setDocFormData({
      title: '',
      description: '',
      content: '',
      status: 'draft',
      doc_type: 'guide',
      category: 'getting-started',
      author: '',
      version: 'v1.0',
      tags: []
    })
  }

  // Open edit dialog with doc data
  const openEditDialog = (doc: SupabaseDoc) => {
    setDocToEdit(doc)
    setDocFormData({
      title: doc.title,
      description: doc.description || '',
      content: doc.content || '',
      status: doc.status,
      doc_type: doc.doc_type,
      category: doc.category,
      author: doc.author || '',
      version: doc.version,
      tags: doc.tags || []
    })
    setShowEditDocDialog(true)
  }

  // Handle create documentation - REAL Supabase operation
  const handleCreateDocSubmit = async () => {
    if (!docFormData.title) {
      toast.error('Please enter a title')
      return
    }
    try {
      await createDoc(docFormData)
      setShowCreateDocDialog(false)
      resetDocForm()
    } catch (error) {
      console.error('Error creating documentation:', error)
    }
  }

  // Handle update documentation - REAL Supabase operation
  const handleUpdateDocSubmit = async () => {
    if (!docToEdit || !docFormData.title) {
      toast.error('Please enter a title')
      return
    }
    try {
      await updateDoc(docToEdit.id, docFormData)
      setShowEditDocDialog(false)
      setDocToEdit(null)
      resetDocForm()
    } catch (error) {
      console.error('Error updating documentation:', error)
    }
  }

  // Handle delete documentation - REAL Supabase operation
  const handleDeleteDocConfirm = async () => {
    if (!docToDelete) return
    try {
      await deleteDoc(docToDelete.id)
      setShowDeleteConfirm(false)
      setDocToDelete(null)
    } catch (error) {
      console.error('Error deleting documentation:', error)
    }
  }

  // Handle publish documentation - REAL Supabase operation
  const handlePublishDocReal = async (doc: SupabaseDoc) => {
    try {
      await publishDoc(doc.id)
    } catch (error) {
      console.error('Error publishing documentation:', error)
    }
  }

  // Handle archive documentation - REAL Supabase operation
  const handleArchiveDocReal = async (doc: SupabaseDoc) => {
    try {
      await archiveDoc(doc.id)
    } catch (error) {
      console.error('Error archiving documentation:', error)
    }
  }

  // Handle like - REAL Supabase operation
  const handleLikeReal = async (docId: string) => {
    try {
      await toggleLike(docId, true)
    } catch (error) {
      console.error('Error liking documentation:', error)
    }
  }

  // Handle feedback - REAL Supabase operation
  const handleFeedbackReal = async (docId: string, helpful: boolean) => {
    try {
      await submitFeedback(docId, helpful)
    } catch (error) {
      console.error('Error submitting feedback:', error)
    }
  }

  // MIGRATED: Using Supabase docs for real-time stats
  const stats = useMemo(() => {
    const docs = supabaseDocs || []
    const totalDocs = docs.length
    const publishedDocs = docs.filter(d => d.status === 'published').length
    const draftDocs = docs.filter(d => d.status === 'draft').length
    const totalViews = docs.reduce((sum, d) => sum + (d.views_count || 0), 0)
    const uniqueContributors = new Set(docs.map(d => d.author).filter(Boolean)).size
    const avgReadTime = totalDocs > 0 ? Math.round(docs.reduce((sum, d) => sum + (d.read_time || 0), 0) / totalDocs) : 0
    const helpfulRate = supabaseStats?.avgHelpfulRate || 0

    return {
      totalSpaces: Math.ceil(totalDocs / 5) || 1, // Approximate spaces from doc count
      totalPages: totalDocs,
      totalViews: totalViews,
      publishedPages: publishedDocs,
      draftPages: draftDocs,
      totalContributors: uniqueContributors || 1,
      avgReadTime: `${avgReadTime || 5} min`,
      satisfaction: Math.round(helpfulRate) || 0,
      languages: 1, // Default to 1 language
      avgTranslation: 100 // Default to 100% for single language
    }
  }, [supabaseDocs, supabaseStats])

  const getStatusColor = (status: DocPage['status']): string => {
    const colors: Record<DocPage['status'], string> = {
      published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      draft: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      archived: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
      review: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    }
    return colors[status]
  }

  const getVisibilityColor = (visibility: DocSpace['visibility']): string => {
    const colors: Record<DocSpace['visibility'], string> = {
      public: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      private: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      internal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    }
    return colors[visibility]
  }

  const getVersionTypeColor = (type: DocChangelog['type']): string => {
    const colors: Record<DocChangelog['type'], string> = {
      major: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      minor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      patch: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
    }
    return colors[type]
  }

  const toggleExpand = (pageId: string) => {
    setExpandedPages(prev => prev.includes(pageId) ? prev.filter(id => id !== pageId) : [...prev, pageId])
  }

  // Key metrics for header cards
  const keyMetrics = [
    { label: 'Spaces', value: stats.totalSpaces, icon: FolderOpen, gradient: 'from-violet-500 to-purple-500' },
    { label: 'Pages', value: stats.totalPages, icon: FileText, gradient: 'from-purple-500 to-fuchsia-500' },
    { label: 'Views', value: `${(stats.totalViews / 1000).toFixed(1)}K`, icon: Eye, gradient: 'from-fuchsia-500 to-pink-500' },
    { label: 'Published', value: stats.publishedPages, icon: CheckCircle2, gradient: 'from-emerald-500 to-green-500' },
    { label: 'Drafts', value: stats.draftPages, icon: Edit, gradient: 'from-amber-500 to-orange-500' },
    { label: 'Writers', value: stats.totalContributors, icon: Users, gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Languages', value: stats.languages, icon: Languages, gradient: 'from-cyan-500 to-teal-500' },
    { label: 'Satisfaction', value: `${stats.satisfaction}%`, icon: ThumbsUp, gradient: 'from-teal-500 to-emerald-500' }
  ]

  // Handlers - Updated to use real Supabase operations where applicable
  const handleCreatePage = () => {
    // Open the create documentation dialog
    resetDocForm()
    setShowCreateDocDialog(true)
  }

  // REAL: Edit page - Opens the edit dialog with page data
  const handleEditPage = async (pageTitle: string, pageId?: string) => {
    if (pageId) {
      // Find the doc in supabaseDocs and open edit dialog
      const doc = supabaseDocs.find(d => d.id === pageId)
      if (doc) {
        openEditDialog(doc)
        toast.success(`Editing "${pageTitle}"`)
        return
      }
    }
    // Try to find in Supabase docs by title
    const supabaseDoc = supabaseDocs.find(d => d.title === pageTitle)
    if (supabaseDoc) {
      openEditDialog(supabaseDoc)
      toast.success(`Opened "${pageTitle}" for editing`)
    } else {
      toast.error(`Page "${pageTitle}" not found`)
    }
  }

  // REAL: Publish page - PUT to /api/docs/{id}/publish
  const handlePublishPage = async (pageTitle: string, pageId?: string) => {
    if (!pageId) {
      // Try to find by title in supabase docs
      const doc = supabaseDocs.find(d => d.title === pageTitle)
      if (doc) {
        pageId = doc.id
      }
    }

    if (!pageId) {
      toast.error('Cannot publish: Page ID not found')
      return
    }

    toast.promise(
      (async () => {
        const response = await fetch(`/api/docs/${pageId}/publish`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' }
        })
        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: 'Failed to publish' }))
          throw new Error(error.error || 'Failed to publish page')
        }
        await refetchDocs()
        return response.json()
      })(),
      {
        loading: `Publishing "${pageTitle}"...`,
        success: `"${pageTitle}" is now published!`,
        error: (err) => err.message || 'Failed to publish page'
      }
    )
  }

  // REAL: Translate page - Opens translation interface
  const handleTranslatePage = async (pageTitle: string) => {
    setActiveTab('localization')
    toast.success(`Navigate to Localization tab to translate "${pageTitle}"`)
  }

  // REAL: Export documentation as PDF or Markdown - Uses Supabase data
  const handleExportDocs = async () => {
    if (!supabaseDocs || supabaseDocs.length === 0) {
      toast.error('No documentation to export')
      return
    }

    toast.promise(
      (async () => {
        // Generate markdown content from all Supabase docs
        const markdownContent = supabaseDocs.map(doc => {
          const header = `# ${doc.title}\n`
          const meta = `> **Status:** ${doc.status} | **Type:** ${doc.doc_type} | **Category:** ${doc.category} | **Version:** ${doc.version}\n`
          const description = doc.description ? `\n*${doc.description}*\n` : ''
          const content = doc.content ? `\n${doc.content}\n` : '\n*No content*\n'
          const footer = `\n---\n*Author: ${doc.author || 'Unknown'} | Views: ${doc.views_count} | Likes: ${doc.likes_count} | Updated: ${new Date(doc.updated_at).toLocaleString()}*\n`
          return header + meta + description + content + footer
        }).join('\n\n')

        // Add export header
        const exportHeader = `# Documentation Export\n\nExported on: ${new Date().toLocaleString()}\nTotal Documents: ${supabaseDocs.length}\n\n---\n\n`

        // Create and download the file
        const blob = new Blob([exportHeader + markdownContent], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `documentation-export-${new Date().toISOString().split('T')[0]}.md`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        return { success: true }
      })(),
      {
        loading: 'Generating documentation export...',
        success: `Exported ${supabaseDocs.length} documents as Markdown!`,
        error: 'Failed to export documentation'
      }
    )
  }

  // Alias for quick actions
  const handleExportDocsReal = handleExportDocs

  // REAL: New space - Opens creation dialog
  const handleNewSpace = () => {
    setShowNewSpace(true)
    toast.info('Fill in the details to create a new documentation space')
  }

  // REAL: Import from Git - Opens file input for Git URL
  const handleImportFromGit = async () => {
    const gitUrl = window.prompt('Enter Git repository URL (e.g., https://github.com/user/repo):')
    if (!gitUrl) {
      toast.info('Import cancelled')
      return
    }

    toast.promise(
      (async () => {
        const response = await fetch('/api/docs/import/git', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: gitUrl })
        })
        if (!response.ok) {
          throw new Error('Failed to import from Git')
        }
        await refetchDocs()
        return response.json()
      })(),
      {
        loading: `Importing from ${gitUrl}...`,
        success: 'Successfully imported documentation from Git!',
        error: 'Failed to import from Git. Make sure the repository is accessible.'
      }
    )
  }

  // REAL: Import Markdown - Opens file picker
  const handleImportMarkdown = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.md,.markdown,.txt'
    input.multiple = true

    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files
      if (!files || files.length === 0) return

      toast.promise(
        (async () => {
          const importedFiles: string[] = []

          for (const file of Array.from(files)) {
            const content = await file.text()
            const title = file.name.replace(/\.(md|markdown|txt)$/, '')

            // Create doc via API
            const response = await fetch('/api/docs', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title,
                content,
                status: 'draft',
                doc_type: 'guide',
                category: 'getting-started'
              })
            })

            if (response.ok) {
              importedFiles.push(file.name)
            }
          }

          await refetchDocs()
          return importedFiles
        })(),
        {
          loading: `Importing ${files.length} file(s)...`,
          success: (files) => `Imported ${files.length} document(s)!`,
          error: 'Failed to import markdown files'
        }
      )
    }

    input.click()
  }

  // REAL: New changelog - Creates a new changelog document
  const handleNewChangelog = () => {
    // Generate version based on existing docs
    const versions = supabaseDocs.map(d => {
      const match = d.version.match(/v?(\d+)\.?(\d*)/)
      return match ? parseInt(match[1]) : 1
    })
    const maxVersion = versions.length > 0 ? Math.max(...versions) : 0
    const newVersion = `v${maxVersion + 1}.0`

    resetDocForm()
    setDocFormData(prev => ({
      ...prev,
      title: `Release Notes - ${newVersion}`,
      doc_type: 'guide',
      category: 'features',
      description: `Changelog and release notes for ${newVersion}`,
      version: newVersion,
      content: `# ${newVersion} Release Notes\n\n## Added\n- \n\n## Changed\n- \n\n## Fixed\n- \n\n## Deprecated\n- \n`
    }))
    setShowCreateDocDialog(true)
    toast.success('Create a new changelog entry', {
      description: `Suggested version: ${newVersion}`
    })
  }

  // REAL: Share page - Copies share link to clipboard
  const handleSharePage = async () => {
    // Use selected page or first Supabase doc
    const currentDoc = selectedPage
      ? supabaseDocs.find(d => d.title === selectedPage.title)
      : supabaseDocs[0]

    const slug = currentDoc
      ? currentDoc.title.toLowerCase().replace(/\s+/g, '-')
      : selectedPage?.slug || 'getting-started'
    const shareUrl = `${window.location.origin}/docs/${slug}`

    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Share link copied to clipboard!')
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      toast.success('Share link copied to clipboard!')
    }
  }

  // REAL: Like page - Calls Supabase to like
  const handleLikePage = async () => {
    // First check if there's a selected page that maps to a Supabase doc
    let docToLike: SupabaseDoc | undefined

    if (selectedPage) {
      docToLike = supabaseDocs.find(d => d.title === selectedPage.title)
    }

    // If no selected page or no match, try the first Supabase doc
    if (!docToLike && supabaseDocs.length > 0) {
      docToLike = supabaseDocs[0]
    }

    if (!docToLike) {
      toast.error('No documentation available to like')
      return
    }

    await handleLikeReal(docToLike.id)
  }

  // REAL: View comments - Shows comments for the selected document
  const handleViewComments = async () => {
    // Check if we have a selected page or use the first supabase doc
    const currentDoc = selectedPage
      ? supabaseDocs.find(d => d.title === selectedPage.title)
      : supabaseDocs[0]

    if (!currentDoc) {
      toast.info('Select a document to view its comments')
      return
    }

    // For now, show the comment count - in a full implementation this would open a comments modal
    if (currentDoc.comments_count === 0) {
      toast.info(`"${currentDoc.title}" has no comments yet`)
    } else {
      toast.success(`"${currentDoc.title}" has ${currentDoc.comments_count} comment(s)`, {
        description: 'Comments feature coming soon!'
      })
    }
  }

  // REAL: Create template - Opens dialog to create a template document
  const handleCreateTemplate = () => {
    resetDocForm()
    setDocFormData(prev => ({
      ...prev,
      title: 'New Documentation Template',
      doc_type: 'guide',
      category: 'getting-started',
      description: 'A reusable template for documentation',
      content: `# [Title]\n\n## Overview\n[Brief description]\n\n## Prerequisites\n- [Requirement 1]\n- [Requirement 2]\n\n## Steps\n1. [Step 1]\n2. [Step 2]\n3. [Step 3]\n\n## Examples\n\`\`\`\n// Code example\n\`\`\`\n\n## Related Resources\n- [Link 1]\n- [Link 2]`,
      tags: ['template']
    }))
    setShowCreateDocDialog(true)
    toast.success('Create a new documentation template', {
      description: 'Templates help standardize your documentation'
    })
  }

  const handleUseTemplate = (templateName: string) => {
    // Pre-fill the form based on template and open create dialog
    resetDocForm()
    setDocFormData(prev => ({
      ...prev,
      title: `New ${templateName}`,
      doc_type: templateName.toLowerCase().includes('api') ? 'api-reference' :
                templateName.toLowerCase().includes('tutorial') ? 'tutorial' :
                templateName.toLowerCase().includes('troubleshoot') ? 'troubleshooting' : 'guide'
    }))
    setShowCreateDocDialog(true)
  }

  // REAL: Edit changelog - Creates/edits a changelog based on doc version changes
  const handleEditChangelog = (changelogTitle: string) => {
    // Find documents that could be related to this changelog
    const relatedDocs = supabaseDocs.filter(d =>
      d.title.toLowerCase().includes(changelogTitle.toLowerCase()) ||
      d.version.includes(changelogTitle)
    )

    if (relatedDocs.length > 0) {
      // Open the first related doc for editing
      openEditDialog(relatedDocs[0])
      toast.success(`Editing document related to: "${changelogTitle}"`, {
        description: `Found ${relatedDocs.length} related document(s)`
      })
    } else {
      // Create a new changelog document
      resetDocForm()
      setDocFormData(prev => ({
        ...prev,
        title: `Changelog: ${changelogTitle}`,
        doc_type: 'guide',
        category: 'features',
        description: `Release notes and changelog for ${changelogTitle}`
      }))
      setShowCreateDocDialog(true)
      toast.info(`Creating new changelog document for: "${changelogTitle}"`)
    }
  }

  // REAL: Add language - Opens language configuration dialog
  const handleAddLanguage = async () => {
    const languageCode = window.prompt('Enter language code (e.g., pt, ko, ar):')
    if (!languageCode) {
      toast.info('Language addition cancelled')
      return
    }

    toast.promise(
      (async () => {
        const response = await fetch('/api/docs/locales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: languageCode })
        })
        if (!response.ok) {
          throw new Error('Failed to add language')
        }
        return response.json()
      })(),
      {
        loading: `Adding ${languageCode} language support...`,
        success: `Language "${languageCode}" added successfully!`,
        error: 'Failed to add language. Please check the language code.'
      }
    )
  }

  // REAL: Manage locale - Shows locale information and translation options
  const handleManageLocale = (localeName: string) => {
    // Count docs that might need translation (all docs are potential translation targets)
    const totalDocs = supabaseDocs.length
    const publishedDocs = supabaseDocs.filter(d => d.status === 'published').length

    toast.success(`Managing locale: ${localeName}`, {
      description: `${totalDocs} documents available for translation (${publishedDocs} published)`
    })

    // Navigate to localization tab
    setActiveTab('localization')
  }

  // REAL: Export analytics report - Generates and downloads report from Supabase data
  const handleExportReport = async () => {
    if (!supabaseDocs || supabaseDocs.length === 0) {
      toast.error('No documentation data to generate report')
      return
    }

    toast.promise(
      (async () => {
        // Calculate analytics from real Supabase data
        const totalViews = supabaseDocs.reduce((sum, d) => sum + (d.views_count || 0), 0)
        const totalLikes = supabaseDocs.reduce((sum, d) => sum + (d.likes_count || 0), 0)
        const totalComments = supabaseDocs.reduce((sum, d) => sum + (d.comments_count || 0), 0)
        const avgReadTime = supabaseDocs.length > 0
          ? supabaseDocs.reduce((sum, d) => sum + (d.read_time || 0), 0) / supabaseDocs.length
          : 0

        // Generate analytics report data from Supabase docs
        const reportData = {
          generated_at: new Date().toISOString(),
          summary: {
            total_documents: supabaseDocs.length,
            total_views: totalViews,
            total_likes: totalLikes,
            total_comments: totalComments,
            average_read_time: Math.round(avgReadTime),
            satisfaction_rate: supabaseStats?.avgHelpfulRate || 0
          },
          by_status: {
            published: supabaseDocs.filter(d => d.status === 'published').length,
            draft: supabaseDocs.filter(d => d.status === 'draft').length,
            review: supabaseDocs.filter(d => d.status === 'review').length,
            archived: supabaseDocs.filter(d => d.status === 'archived').length
          },
          by_type: {
            guide: supabaseDocs.filter(d => d.doc_type === 'guide').length,
            'api-reference': supabaseDocs.filter(d => d.doc_type === 'api-reference').length,
            tutorial: supabaseDocs.filter(d => d.doc_type === 'tutorial').length,
            concept: supabaseDocs.filter(d => d.doc_type === 'concept').length,
            quickstart: supabaseDocs.filter(d => d.doc_type === 'quickstart').length,
            troubleshooting: supabaseDocs.filter(d => d.doc_type === 'troubleshooting').length
          },
          by_category: {
            'getting-started': supabaseDocs.filter(d => d.category === 'getting-started').length,
            features: supabaseDocs.filter(d => d.category === 'features').length,
            integrations: supabaseDocs.filter(d => d.category === 'integrations').length,
            api: supabaseDocs.filter(d => d.category === 'api').length,
            sdk: supabaseDocs.filter(d => d.category === 'sdk').length,
            advanced: supabaseDocs.filter(d => d.category === 'advanced').length
          },
          top_documents: supabaseDocs
            .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
            .slice(0, 10)
            .map(d => ({
              title: d.title,
              views: d.views_count,
              likes: d.likes_count,
              comments: d.comments_count,
              status: d.status,
              type: d.doc_type,
              helpful_rate: d.helpful_count + d.not_helpful_count > 0
                ? Math.round((d.helpful_count / (d.helpful_count + d.not_helpful_count)) * 100)
                : 0
            })),
          all_documents: supabaseDocs.map(d => ({
            id: d.id,
            title: d.title,
            status: d.status,
            type: d.doc_type,
            category: d.category,
            views: d.views_count,
            likes: d.likes_count,
            comments: d.comments_count,
            helpful: d.helpful_count,
            not_helpful: d.not_helpful_count,
            read_time: d.read_time,
            author: d.author,
            version: d.version,
            created_at: d.created_at,
            updated_at: d.updated_at
          }))
        }

        // Create and download the report
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `documentation-analytics-report-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        return { success: true }
      })(),
      {
        loading: 'Generating analytics report...',
        success: `Analytics report downloaded with ${supabaseDocs.length} documents!`,
        error: 'Failed to generate report'
      }
    )
  }

  // REAL: Export configuration - Downloads config file from Supabase data
  const handleExportConfig = async () => {
    toast.promise(
      (async () => {
        // Extract unique categories, types, authors from real data
        const uniqueCategories = [...new Set(supabaseDocs.map(d => d.category))]
        const uniqueTypes = [...new Set(supabaseDocs.map(d => d.doc_type))]
        const uniqueAuthors = [...new Set(supabaseDocs.map(d => d.author).filter(Boolean))]
        const uniqueTags = [...new Set(supabaseDocs.flatMap(d => d.tags || []))]

        // Generate config data from Supabase docs
        const configData = {
          exported_at: new Date().toISOString(),
          documentation_config: {
            total_documents: supabaseDocs.length,
            categories_in_use: uniqueCategories,
            document_types_in_use: uniqueTypes,
            authors: uniqueAuthors,
            tags: uniqueTags
          },
          document_structure: supabaseDocs.map(d => ({
            id: d.id,
            title: d.title,
            status: d.status,
            doc_type: d.doc_type,
            category: d.category,
            version: d.version,
            tags: d.tags
          })),
          settings: {
            default_status: 'draft',
            default_doc_type: 'guide',
            default_category: 'getting-started',
            enable_comments: true,
            enable_feedback: true,
            show_reading_time: true,
            show_contributors: true
          }
        }

        // Create and download the config
        const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `documentation-config-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        return { success: true }
      })(),
      {
        loading: 'Exporting configuration...',
        success: 'Configuration file downloaded!',
        error: 'Failed to export configuration'
      }
    )
  }

  // REAL: Configure integration - Opens integration settings and provides configuration
  const handleConfigureIntegration = async (integrationName: string) => {
    // Navigate to settings tab
    setActiveTab('settings')
    setSettingsTab('integrations')

    toast.success(`Configure ${integrationName}`, {
      description: `Integration settings opened. ${supabaseDocs.length} documents available for sync.`
    })
  }

  // REAL: Add integration - Opens integration selection
  const handleAddIntegration = async () => {
    const integrationTypes = ['GitHub', 'GitLab', 'Slack', 'Discord', 'Webhook']
    const selected = window.prompt(`Select integration type:\n${integrationTypes.join(', ')}`)

    if (!selected) {
      toast.info('Integration addition cancelled')
      return
    }

    toast.promise(
      (async () => {
        const response = await fetch('/api/docs/integrations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: selected.toLowerCase(), name: selected })
        })
        if (!response.ok) {
          throw new Error('Failed to add integration')
        }
        return response.json()
      })(),
      {
        loading: `Adding ${selected} integration...`,
        success: `${selected} integration added! Configure it in Settings.`,
        error: 'Failed to add integration'
      }
    )
  }

  // REAL: Regenerate API key - Creates new API key
  const handleRegenerateApiKey = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to regenerate your API key? The old key will stop working immediately.'
    )

    if (!confirmed) {
      toast.info('API key regeneration cancelled')
      return
    }

    toast.promise(
      (async () => {
        const response = await fetch('/api/docs/api-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
        if (!response.ok) {
          throw new Error('Failed to regenerate API key')
        }
        const data = await response.json()

        // Copy new key to clipboard
        if (data.apiKey) {
          await navigator.clipboard.writeText(data.apiKey)
        }

        return data
      })(),
      {
        loading: 'Regenerating API key...',
        success: 'New API key generated and copied to clipboard!',
        error: 'Failed to regenerate API key'
      }
    )
  }

  // REAL: Export all data - Full documentation backup from Supabase
  const handleExportAllData = async () => {
    if (!supabaseDocs || supabaseDocs.length === 0) {
      toast.error('No documentation data to backup')
      return
    }

    toast.promise(
      (async () => {
        // Calculate comprehensive statistics
        const totalViews = supabaseDocs.reduce((sum, d) => sum + (d.views_count || 0), 0)
        const totalLikes = supabaseDocs.reduce((sum, d) => sum + (d.likes_count || 0), 0)
        const totalComments = supabaseDocs.reduce((sum, d) => sum + (d.comments_count || 0), 0)
        const totalHelpful = supabaseDocs.reduce((sum, d) => sum + (d.helpful_count || 0), 0)
        const totalNotHelpful = supabaseDocs.reduce((sum, d) => sum + (d.not_helpful_count || 0), 0)

        // Compile all documentation data from Supabase
        const fullBackup = {
          backup_metadata: {
            exported_at: new Date().toISOString(),
            backup_version: '2.0',
            total_documents: supabaseDocs.length,
            application: 'Kazi Documentation System'
          },
          statistics: {
            total_documents: supabaseDocs.length,
            by_status: {
              published: supabaseDocs.filter(d => d.status === 'published').length,
              draft: supabaseDocs.filter(d => d.status === 'draft').length,
              review: supabaseDocs.filter(d => d.status === 'review').length,
              archived: supabaseDocs.filter(d => d.status === 'archived').length
            },
            engagement: {
              total_views: totalViews,
              total_likes: totalLikes,
              total_comments: totalComments,
              total_helpful: totalHelpful,
              total_not_helpful: totalNotHelpful,
              helpful_rate: totalHelpful + totalNotHelpful > 0
                ? Math.round((totalHelpful / (totalHelpful + totalNotHelpful)) * 100)
                : 0
            },
            unique_authors: [...new Set(supabaseDocs.map(d => d.author).filter(Boolean))].length,
            unique_tags: [...new Set(supabaseDocs.flatMap(d => d.tags || []))].length
          },
          documents: supabaseDocs.map(doc => ({
            id: doc.id,
            title: doc.title,
            description: doc.description,
            content: doc.content,
            status: doc.status,
            doc_type: doc.doc_type,
            category: doc.category,
            author: doc.author,
            version: doc.version,
            tags: doc.tags,
            metrics: {
              views_count: doc.views_count,
              likes_count: doc.likes_count,
              comments_count: doc.comments_count,
              helpful_count: doc.helpful_count,
              not_helpful_count: doc.not_helpful_count,
              read_time: doc.read_time,
              contributors_count: doc.contributors_count
            },
            timestamps: {
              created_at: doc.created_at,
              updated_at: doc.updated_at
            }
          }))
        }

        // Create and download the backup
        const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `documentation-full-backup-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        return { success: true }
      })(),
      {
        loading: 'Preparing complete documentation backup...',
        success: `Full backup downloaded with ${supabaseDocs.length} documents!`,
        error: 'Failed to export data'
      }
    )
  }

  // REAL: Delete all docs - Requires confirmation
  const handleDeleteAllDocs = async () => {
    const confirmed = window.confirm(
      'WARNING: This will permanently delete ALL documentation. Type "DELETE" to confirm.'
    )

    if (!confirmed) {
      toast.info('Deletion cancelled')
      return
    }

    const confirmText = window.prompt('Type "DELETE" to confirm permanent deletion:')
    if (confirmText !== 'DELETE') {
      toast.info('Deletion cancelled - confirmation text did not match')
      return
    }

    toast.promise(
      (async () => {
        const response = await fetch('/api/docs/all', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        })
        if (!response.ok) {
          throw new Error('Failed to delete documentation')
        }
        await refetchDocs()
        return response.json()
      })(),
      {
        loading: 'Deleting all documentation...',
        success: 'All documentation deleted',
        error: 'Failed to delete documentation'
      }
    )
  }

  // REAL: View version - Shows version info (versions are tracked via document version field)
  const handleViewVersion = async (versionNumber: number) => {
    // Find docs that match this version number pattern
    const versionStr = `v${versionNumber}.0`
    const matchingDocs = supabaseDocs.filter(d => d.version === versionStr || d.version.startsWith(`v${versionNumber}`))

    if (matchingDocs.length > 0) {
      toast.success(`Found ${matchingDocs.length} document(s) at version ${versionNumber}`, {
        description: `Documents: ${matchingDocs.map(d => d.title).join(', ')}`
      })
    } else {
      // Show current version info
      const currentDoc = selectedPage
        ? supabaseDocs.find(d => d.title === selectedPage.title)
        : supabaseDocs[0]

      if (currentDoc) {
        toast.info(`Current document "${currentDoc.title}" is at ${currentDoc.version}`, {
          description: `Updated: ${new Date(currentDoc.updated_at).toLocaleString()}`
        })
      } else {
        toast.error('No documentation found')
      }
    }
  }

  // REAL: Restore version - Updates document to a new version (increment version string)
  const handleRestoreVersion = async (versionNumber: number) => {
    const confirmed = window.confirm(
      `This will create a new version checkpoint for your document. Continue?`
    )

    if (!confirmed) {
      toast.info('Version operation cancelled')
      return
    }

    // Find the document to update
    const currentDoc = selectedPage
      ? supabaseDocs.find(d => d.title === selectedPage.title)
      : supabaseDocs[0]

    if (!currentDoc) {
      toast.error('No document selected for version update')
      return
    }

    toast.promise(
      (async () => {
        // Parse current version and increment
        const currentVersionMatch = currentDoc.version.match(/v?(\d+)\.?(\d*)/)
        let newMajor = versionNumber
        let newMinor = 0

        if (currentVersionMatch) {
          newMajor = parseInt(currentVersionMatch[1]) || versionNumber
          newMinor = (parseInt(currentVersionMatch[2]) || 0) + 1
        }

        const newVersion = `v${newMajor}.${newMinor}`

        // Update via Supabase
        const result = await updateDoc(currentDoc.id, { version: newVersion })
        if (!result) throw new Error('Failed to update version')

        return { version: newVersion }
      })(),
      {
        loading: 'Creating new version checkpoint...',
        success: (data) => `Document updated to ${data.version}!`,
        error: 'Failed to update version'
      }
    )
  }

  // REAL: Create space submit - Creates new documentation space
  const handleCreateSpaceSubmit = async () => {
    const spaceName = (document.querySelector('input[placeholder*="space name"]') as HTMLInputElement)?.value ||
                      (document.querySelector('input[name="spaceName"]') as HTMLInputElement)?.value

    if (!spaceName) {
      toast.error('Please enter a space name')
      return
    }

    toast.promise(
      (async () => {
        const response = await fetch('/api/docs/spaces', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: spaceName,
            visibility: 'private',
            status: 'draft'
          })
        })
        if (!response.ok) {
          throw new Error('Failed to create space')
        }
        return response.json()
      })(),
      {
        loading: 'Creating documentation space...',
        success: 'New documentation space created!',
        error: 'Failed to create space'
      }
    )
    setShowNewSpace(false)
  }

  // Helper to get status badge color for Supabase docs
  const getSupabaseDocStatusColor = (status: DocStatus): string => {
    const colors: Record<DocStatus, string> = {
      published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      draft: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      archived: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
      review: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    }
    return colors[status]
  }

  // Helper to get doc type badge color
  const getDocTypeColor = (docType: DocType): string => {
    const colors: Record<DocType, string> = {
      guide: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'api-reference': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      tutorial: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      concept: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      quickstart: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      troubleshooting: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }
    return colors[docType]
  }

  // Loading state
  if (docsLoading) return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>

  // Error state
  if (docsError) return <div className="flex flex-col items-center justify-center h-full gap-4"><p className="text-red-500">Error loading data</p><Button onClick={() => refetchDocs()}>Retry</Button></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:bg-none dark:bg-gray-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-[1800px] mx-auto space-y-8">
        {/* Premium Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-8 text-white">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="h-10 w-10" />
                  <Badge className="bg-white/20 text-white border-0">GitBook Level</Badge>
                </div>
                <h1 className="text-4xl font-bold mb-2">Documentation</h1>
                <p className="text-white/80">Knowledge management platform • Multi-language • Versioning • Analytics</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                  <Input
                    placeholder="Search docs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>
                <Button onClick={() => setShowNewSpace(true)} className="bg-white text-purple-600 hover:bg-purple-50">
                  <Plus className="h-4 w-4 mr-2" />
                  New Space
                </Button>
              </div>
            </div>

            {/* 8 Gradient Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {keyMetrics.map((metric, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.gradient}`}>
                      <metric.icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="text-xl font-bold">{metric.value}</div>
                  <div className="text-xs text-white/70">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border h-auto flex-wrap">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="spaces" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <FolderOpen className="h-4 w-4 mr-2" />
              Spaces
            </TabsTrigger>
            <TabsTrigger value="pages" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <FileText className="h-4 w-4 mr-2" />
              Pages
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <Layout className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="changelogs" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <Megaphone className="h-4 w-4 mr-2" />
              Changelogs
            </TabsTrigger>
            <TabsTrigger value="localization" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <Languages className="h-4 w-4 mr-2" />
              Localization
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Dashboard Overview Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Documentation Hub</h2>
                    <p className="text-purple-100">{stats.totalPages} pages across {stats.totalSpaces} spaces</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
                    <p className="text-purple-100 text-sm">Total Views</p>
                  </div>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={handleCreatePage}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Page
                  </Button>
                  <InsightsToggleButton
                    isOpen={insightsPanel.isOpen}
                    onToggle={insightsPanel.toggle}
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[
                { icon: Plus, label: 'New Page', desc: 'Create documentation', color: 'text-purple-500', action: handleCreatePage },
                { icon: FolderOpen, label: 'New Space', desc: 'Add new space', color: 'text-blue-500', action: handleNewSpace },
                { icon: Upload, label: 'Import', desc: 'Import docs', color: 'text-green-500', action: handleImportMarkdown },
                { icon: Search, label: 'Search', desc: 'Find content', color: 'text-orange-500', action: () => {
                  const searchInput = document.querySelector('input[placeholder="Search docs..."]') as HTMLInputElement
                  if (searchInput) searchInput.focus()
                }},
                { icon: GitBranch, label: 'Git Sync', desc: 'Sync with repo', color: 'text-indigo-500', action: handleImportFromGit },
                { icon: Languages, label: 'Translate', desc: 'Add translation', color: 'text-pink-500', action: handleAddLanguage },
                { icon: Sparkles, label: 'AI Assist', desc: 'AI writing help', color: 'text-amber-500', action: () => {
                  toast.info('AI Writing Assistant', {
                    description: 'AI-powered writing suggestions are enabled in the editor settings'
                  })
                  setActiveTab('settings')
                  setSettingsTab('editor')
                }},
                { icon: Download, label: 'Export', desc: 'Export docs', color: 'text-cyan-500', action: handleExportDocs },
              ].map((action, i) => (
                <Card key={i} className="p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-105" onClick={action.action}>
                  <action.icon className={`h-8 w-8 ${action.color} mb-3`} />
                  <h4 className="font-semibold text-gray-900 dark:text-white">{action.label}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{action.desc}</p>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    Recently Updated
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {supabaseDocs && supabaseDocs.length > 0 ? (
                      supabaseDocs.slice(0, 5).map(doc => (
                        <div key={doc.id} onClick={() => openEditDialog(doc)}
                          className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium truncate">{doc.title}</h4>
                              <Badge className={getSupabaseDocStatusColor(doc.status)}>{doc.status}</Badge>
                            </div>
                            <p className="text-sm text-gray-500 truncate">{doc.description || 'No description'}</p>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <p>{doc.read_time} min read</p>
                            <p>{new Date(doc.updated_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
                        <p>No documents yet. Create your first documentation!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline" onClick={handleCreatePage}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Page
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={handleNewSpace}>
                    <FolderOpen className="h-4 w-4 mr-2" />
                    New Space
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={handleImportFromGit}>
                    <Code className="h-4 w-4 mr-2" />
                    Import from Git
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={handleImportMarkdown}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Markdown
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={handleNewChangelog}>
                    <Megaphone className="h-4 w-4 mr-2" />
                    New Changelog
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Changelogs - Shows recent documents sorted by update date */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-purple-600" />
                  Recent Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {supabaseDocs && supabaseDocs.length > 0 ? (
                    [...supabaseDocs]
                      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                      .slice(0, 3)
                      .map(doc => {
                        const versionMatch = doc.version.match(/v?(\d+)/)
                        const majorVersion = versionMatch ? parseInt(versionMatch[1]) : 1
                        const versionType: 'major' | 'minor' | 'patch' = majorVersion > 1 ? 'major' : 'minor'
                        return (
                          <div key={doc.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => openEditDialog(doc)}>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getVersionTypeColor(versionType)}>{doc.version}</Badge>
                              <Badge variant="outline">{doc.status}</Badge>
                            </div>
                            <h4 className="font-medium mb-1 truncate">{doc.title}</h4>
                            <p className="text-sm text-gray-500">{new Date(doc.updated_at).toLocaleDateString()}</p>
                          </div>
                        )
                      })
                  ) : (
                    <div className="col-span-3 text-center py-4 text-gray-500">
                      No recent updates. Create your first documentation!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Spaces Tab */}
          <TabsContent value="spaces" className="space-y-6">
            {/* Spaces Overview Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <FolderOpen className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Documentation Spaces</h2>
                    <p className="text-blue-100">{stats.totalSpaces} spaces with {stats.totalPages} total pages</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => setShowNewSpace(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Space
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Generate spaces from Supabase docs grouped by category */}
              {supabaseDocs && supabaseDocs.length > 0 ? (
                (() => {
                  // Group docs by category to create "spaces"
                  const spacesByCategory = supabaseDocs.reduce((acc, doc) => {
                    const category = doc.category || 'getting-started'
                    if (!acc[category]) {
                      acc[category] = { docs: [], totalViews: 0, authors: new Set<string>() }
                    }
                    acc[category].docs.push(doc)
                    acc[category].totalViews += doc.views_count || 0
                    if (doc.author) acc[category].authors.add(doc.author)
                    return acc
                  }, {} as Record<string, { docs: SupabaseDoc[], totalViews: number, authors: Set<string> }>)

                  const categoryIcons: Record<string, string> = {
                    'getting-started': '🚀',
                    'features': '✨',
                    'integrations': '🔗',
                    'api': '⚡',
                    'sdk': '📦',
                    'advanced': '🔧'
                  }

                  const categoryNames: Record<string, string> = {
                    'getting-started': 'Getting Started',
                    'features': 'Features',
                    'integrations': 'Integrations',
                    'api': 'API Reference',
                    'sdk': 'SDK',
                    'advanced': 'Advanced'
                  }

                  return Object.entries(spacesByCategory).map(([category, data]) => (
                    <Card key={category} className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => setActiveTab('pages')}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{categoryIcons[category] || '📄'}</span>
                            <div>
                              <h3 className="font-semibold">{categoryNames[category] || category}</h3>
                              <code className="text-xs text-gray-500">/{category}</code>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {data.docs.length} document{data.docs.length !== 1 ? 's' : ''} in this category
                        </p>
                        <div className="flex items-center gap-2 mb-4">
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            {data.docs.filter(d => d.status === 'published').length} published
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {data.docs.filter(d => d.status === 'draft').length} drafts
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{data.docs.length}</span>
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{data.authors.size}</span>
                            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{data.totalViews >= 1000 ? `${(data.totalViews / 1000).toFixed(1)}K` : data.totalViews}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                })()
              ) : (
                <div className="col-span-3 text-center py-12 text-gray-500">
                  <FolderOpen className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <h3 className="text-lg font-medium mb-2">No Documentation Spaces Yet</h3>
                  <p className="mb-4">Create your first documentation to see spaces organized by category.</p>
                  <Button onClick={handleCreatePage}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Documentation
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Pages Tab */}
          <TabsContent value="pages" className="space-y-6">
            {/* Pages Overview Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <FileText className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">All Pages</h2>
                    <p className="text-emerald-100">{stats.publishedPages} published, {stats.draftPages} drafts</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-white/20 text-white border-white/30">{stats.avgReadTime} avg read</Badge>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={handleCreatePage}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Page
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-6">
              <Card className="w-64 flex-shrink-0">
                <CardHeader>
                  <CardTitle className="text-sm">Navigation</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <ScrollArea className="h-[500px]">
                    {supabaseDocs && supabaseDocs.length > 0 ? (
                      supabaseDocs.map(doc => (
                        <div key={doc.id}>
                          <div
                            className={`flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer ${selectedPage?.id === doc.id ? 'bg-purple-100 dark:bg-purple-900/30' : ''}`}
                            onClick={() => setSelectedPage({
                              id: doc.id,
                              space_id: doc.category,
                              title: doc.title,
                              slug: doc.title.toLowerCase().replace(/\s+/g, '-'),
                              content: doc.content || '',
                              excerpt: doc.description || '',
                              status: doc.status as DocPage['status'],
                              author: { name: doc.author || 'Unknown', avatar: '' },
                              contributors: [],
                              created_at: doc.created_at,
                              updated_at: doc.updated_at,
                              version: parseInt(doc.version.replace(/[^0-9]/g, '')) || 1,
                              children: [],
                              order: 0,
                              labels: doc.tags || [],
                              likes: doc.likes_count,
                              comments_count: doc.comments_count,
                              views: doc.views_count,
                              reading_time: `${doc.read_time} min`,
                              is_bookmarked: false
                            })}
                          >
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="flex-1 text-sm truncate">{doc.title}</span>
                            <Badge className={`text-[10px] px-1 ${getSupabaseDocStatusColor(doc.status)}`}>{doc.status}</Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p>No documents yet</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="flex-1">
                <CardContent className="p-6">
                  {selectedPage ? (
                    <div>
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h2 className="text-2xl font-bold">{selectedPage.title}</h2>
                            <Badge className={getStatusColor(selectedPage.status)}>{selectedPage.status}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[8px]">{selectedPage.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              {selectedPage.author.name}
                            </span>
                            <span>v{selectedPage.version}</span>
                            <span>{selectedPage.reading_time} read</span>
                            <span>{selectedPage.views.toLocaleString()} views</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => setShowVersions(true)}>
                            <History className="h-4 w-4 mr-1" />
                            History
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditPage(selectedPage.title)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" onClick={handleSharePage}>
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>

                      <div className="prose dark:prose-invert max-w-none">
                        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <pre className="text-sm whitespace-pre-wrap">{selectedPage.content}</pre>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-6 pt-6 border-t dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={handleLikePage}>
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {selectedPage.likes}
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleViewComments}>
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {selectedPage.comments_count}
                          </Button>
                        </div>
                        <div className="flex-1" />
                        <div className="flex flex-wrap gap-1">
                          {selectedPage.labels.map(label => (
                            <Badge key={label} variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Select a page</h3>
                      <p className="text-gray-500">Choose a page from the navigation to view its content</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            {/* Templates Overview Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Layout className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Documentation Templates</h2>
                    <p className="text-amber-100">6 built-in templates available</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={handleCreateTemplate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Built-in templates based on document types */}
              {[
                { id: 'guide', name: 'Guide', icon: '📖', category: 'Documentation', description: 'Step-by-step instructions for completing a task or understanding a concept', usage: supabaseDocs.filter(d => d.doc_type === 'guide').length },
                { id: 'api-reference', name: 'API Reference', icon: '⚡', category: 'Technical', description: 'Comprehensive API documentation with endpoints, parameters, and examples', usage: supabaseDocs.filter(d => d.doc_type === 'api-reference').length },
                { id: 'tutorial', name: 'Tutorial', icon: '🎓', category: 'Learning', description: 'Hands-on learning experience with code examples and exercises', usage: supabaseDocs.filter(d => d.doc_type === 'tutorial').length },
                { id: 'concept', name: 'Concept', icon: '💡', category: 'Theory', description: 'Explain key concepts, architecture, and design decisions', usage: supabaseDocs.filter(d => d.doc_type === 'concept').length },
                { id: 'quickstart', name: 'Quickstart', icon: '🚀', category: 'Getting Started', description: 'Get up and running quickly with minimal setup', usage: supabaseDocs.filter(d => d.doc_type === 'quickstart').length },
                { id: 'troubleshooting', name: 'Troubleshooting', icon: '🔧', category: 'Support', description: 'Common issues and their solutions', usage: supabaseDocs.filter(d => d.doc_type === 'troubleshooting').length }
              ].map(template => (
                <Card key={template.id} className="hover:shadow-lg transition-all cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{template.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{template.name}</h3>
                          <Badge className="bg-purple-100 text-purple-700">Official</Badge>
                        </div>
                        <p className="text-xs text-gray-500">{template.category}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{template.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Used {template.usage} times</span>
                      <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleUseTemplate(template.name)}>Use Template</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Changelogs Tab */}
          <TabsContent value="changelogs" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Changelogs</h2>
                <p className="text-gray-500">Track product updates and release notes</p>
              </div>
              <Button onClick={handleNewChangelog}>
                <Plus className="h-4 w-4 mr-2" />
                New Changelog
              </Button>
            </div>

            <div className="space-y-4">
              {/* Show documents that look like changelogs (contain "release", "changelog", or have version in title) */}
              {supabaseDocs && supabaseDocs.length > 0 ? (
                (() => {
                  const changelogDocs = supabaseDocs.filter(d =>
                    d.title.toLowerCase().includes('release') ||
                    d.title.toLowerCase().includes('changelog') ||
                    d.title.toLowerCase().includes('version') ||
                    d.title.match(/v\d+\.\d+/)
                  )

                  // If no changelog-specific docs, show all docs sorted by version
                  const docsToShow = changelogDocs.length > 0
                    ? changelogDocs
                    : [...supabaseDocs].sort((a, b) => b.version.localeCompare(a.version)).slice(0, 5)

                  return docsToShow.length > 0 ? docsToShow.map(doc => {
                    // Determine version type based on version string
                    const versionMatch = doc.version.match(/v?(\d+)\.?(\d*)/)
                    const majorVersion = versionMatch ? parseInt(versionMatch[1]) : 1
                    const minorVersion = versionMatch && versionMatch[2] ? parseInt(versionMatch[2]) : 0
                    const versionType: 'major' | 'minor' | 'patch' = majorVersion > 1 ? 'major' : minorVersion > 0 ? 'minor' : 'patch'

                    return (
                      <Card key={doc.id} className={doc.status === 'draft' ? 'border-dashed border-purple-300' : ''}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <div className={`text-2xl font-bold ${versionType === 'major' ? 'text-red-600' : versionType === 'minor' ? 'text-blue-600' : 'text-gray-600'}`}>
                                  {doc.version}
                                </div>
                                <Badge className={getVersionTypeColor(versionType)}>{versionType}</Badge>
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold">{doc.title}</h3>
                                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                  <span>{new Date(doc.updated_at).toLocaleDateString()}</span>
                                  <span className="flex items-center gap-1">
                                    <Avatar className="h-4 w-4">
                                      <AvatarFallback className="text-[6px]">{doc.author ? doc.author.split(' ').map(n => n[0]).join('') : 'U'}</AvatarFallback>
                                    </Avatar>
                                    {doc.author || 'Unknown'}
                                  </span>
                                  {doc.status === 'published' && (
                                    <span className="flex items-center gap-1">
                                      <Eye className="h-3 w-3" />
                                      {doc.views_count}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {doc.status === 'draft' && (
                                <Badge variant="outline" className="text-purple-600">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Draft
                                </Badge>
                              )}
                              <Button variant="outline" size="sm" onClick={() => openEditDialog(doc)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {doc.description || 'No description provided'}
                          </p>
                          {doc.content && (
                            <div className="mt-4 text-sm text-gray-500 line-clamp-3">
                              {doc.content.substring(0, 200)}...
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  }) : (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Megaphone className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium mb-2">No Changelogs Yet</h3>
                        <p className="text-gray-500 mb-4">Create your first changelog to track product updates.</p>
                        <Button onClick={handleNewChangelog}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Changelog
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })()
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Megaphone className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">No Changelogs Yet</h3>
                    <p className="text-gray-500 mb-4">Create your first changelog to track product updates.</p>
                    <Button onClick={handleNewChangelog}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Changelog
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Localization Tab */}
          <TabsContent value="localization" className="space-y-6">
            {/* Localization Overview Banner */}
            <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Languages className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Localization</h2>
                    <p className="text-pink-100">{stats.languages} languages, {stats.avgTranslation}% avg completion</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Language Management</h2>
                <p className="text-gray-500">Manage multi-language documentation</p>
              </div>
              <Button onClick={handleAddLanguage}>
                <Plus className="h-4 w-4 mr-2" />
                Add Language
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-gray-500">Languages</span>
                  </div>
                  <div className="text-3xl font-bold">1</div>
                  <p className="text-xs text-gray-400 mt-1">English (default)</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-gray-500">Avg. Completion</span>
                  </div>
                  <div className="text-3xl font-bold">100%</div>
                  <p className="text-xs text-gray-400 mt-1">All content in English</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <FileCheck className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-gray-500">Pages Available</span>
                  </div>
                  <div className="text-3xl font-bold">{supabaseDocs.length}</div>
                  <p className="text-xs text-gray-400 mt-1">Ready for translation</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-gray-500">Contributors</span>
                  </div>
                  <div className="text-3xl font-bold">{new Set(supabaseDocs.map(d => d.author).filter(Boolean)).size || 1}</div>
                  <p className="text-xs text-gray-400 mt-1">Documentation authors</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Default English locale card */}
              <Card className="border-purple-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🇺🇸</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">English</h3>
                          <Badge className="bg-purple-100 text-purple-700">Default</Badge>
                        </div>
                        <p className="text-sm text-gray-500">English (en)</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-emerald-600">
                        active
                      </Badge>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500">Documentation Coverage</span>
                        <span className="font-medium text-emerald-600">100%</span>
                      </div>
                      <Progress value={100} className="h-2 [&>div]:bg-emerald-500" />
                      <p className="text-xs text-gray-500 mt-1">
                        {supabaseDocs.length} / {supabaseDocs.length} pages in English
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[...new Set(supabaseDocs.map(d => d.author).filter(Boolean))].slice(0, 3).map((author, idx) => (
                          <Avatar key={idx} className="h-6 w-6 border-2 border-white -ml-1 first:ml-0">
                            <AvatarFallback className="text-[8px]">{author ? author.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U'}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleManageLocale('English')}>Manage</Button>
                    </div>
                  </CardContent>
                </Card>
              {/* Add more languages card */}
              <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-purple-400 transition-colors cursor-pointer" onClick={handleAddLanguage}>
                <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
                  <Plus className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="font-semibold text-gray-600 dark:text-gray-400">Add New Language</h3>
                  <p className="text-sm text-gray-400 text-center mt-2">Expand your documentation to reach more users</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Overview Banner */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <TrendingUp className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Documentation Analytics</h2>
                    <p className="text-violet-100">{stats.satisfaction}% reader satisfaction</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-white/20 text-white border-white/30">{stats.totalViews.toLocaleString()} views</Badge>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={handleExportReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Views', value: stats.totalViews.toLocaleString(), change: '+12%', icon: Eye },
                { label: 'Unique Visitors', value: '15.2K', change: '+8%', icon: Users },
                { label: 'Avg. Read Time', value: '4:32', change: '+5%', icon: Clock },
                { label: 'Satisfaction', value: '94%', change: '+2%', icon: ThumbsUp }
              ].map((stat, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon className="h-5 w-5 text-purple-600" />
                      <span className="text-xs text-emerald-600">{stat.change}</span>
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {supabaseDocs && supabaseDocs.length > 0 ? (
                    [...supabaseDocs]
                      .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
                      .slice(0, 5)
                      .map((doc, i) => (
                        <div key={doc.id} className="flex items-center gap-4">
                          <span className="w-6 h-6 flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 rounded-full text-xs font-medium text-purple-600">
                            {i + 1}
                          </span>
                          <div className="flex-1">
                            <h4 className="font-medium">{doc.title}</h4>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{(doc.views_count || 0).toLocaleString()} views</span>
                              <span>{doc.read_time || 5} min read</span>
                            </div>
                          </div>
                          <div className="w-32">
                            <div className="flex items-center gap-2 text-sm">
                              <ThumbsUp className="h-3 w-3 text-emerald-600" />
                              <span>{doc.likes_count || 0}</span>
                              <ThumbsDown className="h-3 w-3 text-red-500 ml-2" />
                              <span>{doc.not_helpful_count || 0}</span>
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p>No analytics data yet. Create some documentation to see metrics.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6 space-y-6">
            {/* Settings Overview Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Settings className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Documentation Settings</h2>
                    <p className="text-purple-100">Configure spaces, editor, SEO, and integration preferences</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Configured</Badge>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={handleExportConfig}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Config
                  </Button>
                </div>
              </div>
            </div>

            {/* Settings Sidebar Navigation */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-3">
                <Card className="border-0 shadow-sm sticky top-6">
                  <nav className="p-2 space-y-1">
                    {[
                      { id: 'general', icon: Settings, label: 'General', desc: 'Basic settings' },
                      { id: 'editor', icon: PenTool, label: 'Editor', desc: 'Writing preferences' },
                      { id: 'seo', icon: Globe, label: 'SEO & Meta', desc: 'Search optimization' },
                      { id: 'integrations', icon: GitBranch, label: 'Integrations', desc: 'Connected services' },
                      { id: 'notifications', icon: Bell, label: 'Notifications', desc: 'Alert settings' },
                      { id: 'advanced', icon: Database, label: 'Advanced', desc: 'Advanced options' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSettingsTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          settingsTab === item.id
                            ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <div className="text-left">
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs opacity-70">{item.desc}</p>
                        </div>
                      </button>
                    ))}
                  </nav>
                </Card>
              </div>

              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Space Defaults</CardTitle>
                        <CardDescription>Configure default settings for documentation spaces</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <Label>Default Category</Label>
                            <Select defaultValue="getting-started">
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="getting-started">Getting Started</SelectItem>
                                <SelectItem value="features">Features</SelectItem>
                                <SelectItem value="integrations">Integrations</SelectItem>
                                <SelectItem value="api">API</SelectItem>
                                <SelectItem value="sdk">SDK</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Default Visibility</Label>
                            <Select defaultValue="public">
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="public">Public</SelectItem>
                                <SelectItem value="internal">Internal</SelectItem>
                                <SelectItem value="private">Private</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Enable Comments</Label>
                            <p className="text-sm text-gray-500">Allow readers to comment on pages</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Page Feedback</Label>
                            <p className="text-sm text-gray-500">Show helpful/not helpful buttons</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Reading Time</Label>
                            <p className="text-sm text-gray-500">Display estimated reading time</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Display Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Table of Contents</Label>
                            <p className="text-sm text-gray-500">Show TOC on pages</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Breadcrumbs</Label>
                            <p className="text-sm text-gray-500">Show navigation breadcrumbs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Page Contributors</Label>
                            <p className="text-sm text-gray-500">Display contributor avatars</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Editor Settings */}
                {settingsTab === 'editor' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Editor Preferences</CardTitle>
                        <CardDescription>Customize the documentation editor experience</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <Label>Default Editor Mode</Label>
                            <Select defaultValue="wysiwyg">
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="wysiwyg">WYSIWYG Editor</SelectItem>
                                <SelectItem value="markdown">Markdown</SelectItem>
                                <SelectItem value="split">Split View</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Font Size</Label>
                            <Select defaultValue="16">
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="14">14px</SelectItem>
                                <SelectItem value="16">16px</SelectItem>
                                <SelectItem value="18">18px</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Auto-save</Label>
                            <p className="text-sm text-gray-500">Automatically save drafts</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Spell Check</Label>
                            <p className="text-sm text-gray-500">Enable spell checking in editor</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Code Highlighting</Label>
                            <p className="text-sm text-gray-500">Syntax highlighting for code blocks</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>AI Assistant</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>AI Writing Suggestions</Label>
                            <p className="text-sm text-gray-500">Get AI-powered writing suggestions</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Auto-complete</Label>
                            <p className="text-sm text-gray-500">AI-powered sentence completion</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Grammar Correction</Label>
                            <p className="text-sm text-gray-500">Automatic grammar fixes</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* SEO Settings */}
                {settingsTab === 'seo' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Search Engine Optimization</CardTitle>
                        <CardDescription>Configure SEO settings for better discoverability</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Auto-generate Meta</Label>
                            <p className="text-sm text-gray-500">Generate SEO meta from content</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>XML Sitemap</Label>
                            <p className="text-sm text-gray-500">Generate XML sitemap automatically</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Robots.txt</Label>
                            <p className="text-sm text-gray-500">Allow search engine indexing</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Open Graph Tags</Label>
                            <p className="text-sm text-gray-500">Generate social media preview tags</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Custom Domain</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Custom Domain URL</Label>
                          <Input placeholder="docs.example.com" className="mt-1" />
                          <p className="text-xs text-gray-500 mt-1">Point your CNAME to docs.kazi.com</p>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>SSL Certificate</Label>
                            <p className="text-sm text-gray-500">Auto-provision SSL</p>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Active</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <GitBranch className="h-5 w-5 text-purple-600" />
                          Connected Services
                        </CardTitle>
                        <CardDescription>Manage integrations with external services</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {/* Built-in integrations */}
                          {[
                            { id: 'github', name: 'GitHub', icon: GitBranch, status: 'available' as const, description: 'Sync documentation with GitHub repositories' },
                            { id: 'webhook', name: 'Webhooks', icon: Zap, status: 'available' as const, description: 'Send notifications on documentation changes' },
                            { id: 'api', name: 'REST API', icon: Code, status: 'connected' as const, description: 'Programmatic access to documentation' }
                          ].map(integration => (
                            <div key={integration.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-white dark:bg-gray-700 rounded-lg">
                                  <integration.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                </div>
                                <div>
                                  <p className="font-medium">{integration.name}</p>
                                  <p className="text-xs text-gray-500">{integration.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={integration.status === 'connected' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}>
                                  {integration.status}
                                </Badge>
                                <Button variant="outline" size="sm" onClick={() => handleConfigureIntegration(integration.name)}>Configure</Button>
                              </div>
                            </div>
                          ))}
                          <Button variant="outline" className="w-full" onClick={handleAddIntegration}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Integration
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Git Sync</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Enable Git Sync</Label>
                            <p className="text-sm text-gray-500">Sync documentation with Git repository</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <Label>Repository URL</Label>
                            <Input placeholder="github.com/org/repo" className="mt-1" />
                          </div>
                          <div>
                            <Label>Branch</Label>
                            <Input placeholder="main" className="mt-1" defaultValue="main" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Auto-sync on Push</Label>
                            <p className="text-sm text-gray-500">Automatically sync when changes pushed</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Email Notifications</CardTitle>
                        <CardDescription>Configure when to receive email notifications</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>New Comments</Label>
                            <p className="text-sm text-gray-500">Notify on new comments</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Page Updates</Label>
                            <p className="text-sm text-gray-500">Notify when watched pages update</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Translation Updates</Label>
                            <p className="text-sm text-gray-500">Notify on translation changes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Weekly Digest</Label>
                            <p className="text-sm text-gray-500">Receive weekly documentation summary</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>In-App Notifications</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Mentions</Label>
                            <p className="text-sm text-gray-500">Notify when mentioned</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Edit Suggestions</Label>
                            <p className="text-sm text-gray-500">Notify on suggested edits</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Review Requests</Label>
                            <p className="text-sm text-gray-500">Notify when review is requested</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Data Management</CardTitle>
                        <CardDescription>Configure data retention and backups</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Automatic Backups</Label>
                            <p className="text-sm text-gray-500">Daily backup of all documentation</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Version Retention</Label>
                            <p className="text-sm text-gray-500">How long to keep page versions</p>
                          </div>
                          <Select defaultValue="forever">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 days</SelectItem>
                              <SelectItem value="90">90 days</SelectItem>
                              <SelectItem value="365">1 year</SelectItem>
                              <SelectItem value="forever">Forever</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Audit Logging</Label>
                            <p className="text-sm text-gray-500">Log all changes to documentation</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>API Access</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Enable API Access</Label>
                            <p className="text-sm text-gray-500">Allow programmatic access to docs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>API Key</Label>
                          <div className="flex gap-2 mt-1">
                            <Input value="doc_••••••••••••" readOnly className="font-mono" />
                            <Button variant="outline" onClick={handleRegenerateApiKey}>Regenerate</Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Webhook Notifications</Label>
                            <p className="text-sm text-gray-500">Send webhooks on doc changes</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-red-200 dark:border-red-900">
                      <CardHeader>
                        <CardTitle className="text-red-600">Danger Zone</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Export All Data</Label>
                            <p className="text-sm text-gray-500">Download complete documentation backup</p>
                          </div>
                          <Button variant="outline" onClick={handleExportAllData}>Export</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Delete All Documentation</Label>
                            <p className="text-sm text-gray-500">Permanently delete all docs</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={handleDeleteAllDocs}>Delete All</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        {insightsPanel.isOpen && (
          <CollapsibleInsightsPanel title="Insights & Analytics" defaultOpen={true} className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AIInsightsPanel
                  insights={[] as AIInsight[]}
                  title="Documentation Intelligence"
                  onInsightAction={(insight) => toast.info(insight.title || 'AI Insight', { description: insight.description || 'View insight details' })}
                />
              </div>
              <div className="space-y-6">
                <CollaborationIndicator
                  collaborators={[] as Collaborator[]}
                  maxVisible={4}
                />
                <PredictiveAnalytics
                  predictions={[] as Prediction[]}
                  title="Documentation Forecasts"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <ActivityFeed
                activities={[] as ActivityItem[]}
                title="Documentation Activity"
                maxItems={5}
              />
              <QuickActionsToolbar
                actions={[] as QuickAction[]}
                variant="grid"
              />
            </div>
          </CollapsibleInsightsPanel>
        )}

        {/* Version History Dialog - Shows document versions from Supabase */}
        <Dialog open={showVersions} onOpenChange={setShowVersions}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <History className="h-5 w-5 text-purple-600" />
                Document Version History
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 py-4">
                {supabaseDocs && supabaseDocs.length > 0 ? (
                  [...supabaseDocs]
                    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                    .map((doc, index) => (
                      <div key={doc.id} className={`p-4 rounded-lg border ${index === 0 ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Badge variant={index === 0 ? 'default' : 'outline'}>{doc.version}</Badge>
                            {index === 0 && <Badge className="bg-emerald-100 text-emerald-700">Latest</Badge>}
                            <Badge className={getSupabaseDocStatusColor(doc.status)}>{doc.status}</Badge>
                          </div>
                          <span className="text-sm text-gray-500">{new Date(doc.updated_at).toLocaleString()}</span>
                        </div>
                        <p className="text-sm font-medium mb-1">{doc.title}</p>
                        <p className="text-sm text-gray-500 mb-2">{doc.description || 'No description'}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-[8px]">
                                {doc.author ? doc.author.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-500">{doc.author || 'Unknown'}</span>
                            <span className="text-xs text-emerald-600">{doc.views_count} views</span>
                            <span className="text-xs text-blue-500">{doc.likes_count} likes</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(doc)}>Edit</Button>
                            {doc.status === 'draft' && (
                              <Button variant="ghost" size="sm" onClick={() => handlePublishDocReal(doc)}>Publish</Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <History className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No version history available</p>
                    <p className="text-sm">Create documents to start tracking versions</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* New Space Dialog */}
        <Dialog open={showNewSpace} onOpenChange={setShowNewSpace}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <FolderOpen className="h-5 w-5 text-purple-600" />
                Create New Space
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Space Name</Label>
                <Input placeholder="My Documentation" className="mt-1" />
              </div>
              <div>
                <Label>URL Slug</Label>
                <Input placeholder="my-docs" className="mt-1" />
              </div>
              <div>
                <Label>Description</Label>
                <Input placeholder="What is this space about?" className="mt-1" />
              </div>
              <div>
                <Label>Visibility</Label>
                <Select defaultValue="public">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Anyone can view</SelectItem>
                    <SelectItem value="internal">Internal - Team members only</SelectItem>
                    <SelectItem value="private">Private - Invite only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="git-sync" />
                <Label htmlFor="git-sync">Enable Git Sync</Label>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowNewSpace(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-purple-600 to-fuchsia-600" onClick={handleCreateSpaceSubmit}>Create Space</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Documentation Dialog - REAL Supabase */}
        <Dialog open={showCreateDocDialog} onOpenChange={setShowCreateDocDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-purple-600" />
                Create New Documentation
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="col-span-2">
                  <Label>Title *</Label>
                  <Input
                    placeholder="Documentation Title"
                    value={docFormData.title}
                    onChange={(e) => setDocFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Document Type</Label>
                  <Select
                    value={docFormData.doc_type}
                    onValueChange={(value: DocType) => setDocFormData(prev => ({ ...prev, doc_type: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guide">Guide</SelectItem>
                      <SelectItem value="api-reference">API Reference</SelectItem>
                      <SelectItem value="tutorial">Tutorial</SelectItem>
                      <SelectItem value="concept">Concept</SelectItem>
                      <SelectItem value="quickstart">Quickstart</SelectItem>
                      <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={docFormData.category}
                    onValueChange={(value: DocCategory) => setDocFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="getting-started">Getting Started</SelectItem>
                      <SelectItem value="features">Features</SelectItem>
                      <SelectItem value="integrations">Integrations</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="sdk">SDK</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={docFormData.status}
                    onValueChange={(value: DocStatus) => setDocFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="review">In Review</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Version</Label>
                  <Input
                    placeholder="v1.0"
                    value={docFormData.version}
                    onChange={(e) => setDocFormData(prev => ({ ...prev, version: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Brief description of this documentation..."
                    value={docFormData.description || ''}
                    onChange={(e) => setDocFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1"
                    rows={2}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Content</Label>
                  <Textarea
                    placeholder="Write your documentation content here (Markdown supported)..."
                    value={docFormData.content || ''}
                    onChange={(e) => setDocFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="mt-1 font-mono"
                    rows={8}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Author</Label>
                  <Input
                    placeholder="Author name"
                    value={docFormData.author || ''}
                    onChange={(e) => setDocFormData(prev => ({ ...prev, author: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowCreateDocDialog(false); resetDocForm() }}>Cancel</Button>
              <Button
                className="bg-gradient-to-r from-purple-600 to-fuchsia-600"
                onClick={handleCreateDocSubmit}
                disabled={mutating}
              >
                {mutating ? 'Creating...' : 'Create Documentation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Documentation Dialog - REAL Supabase */}
        <Dialog open={showEditDocDialog} onOpenChange={setShowEditDocDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Edit className="h-5 w-5 text-purple-600" />
                Edit Documentation
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="col-span-2">
                  <Label>Title *</Label>
                  <Input
                    placeholder="Documentation Title"
                    value={docFormData.title}
                    onChange={(e) => setDocFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Document Type</Label>
                  <Select
                    value={docFormData.doc_type}
                    onValueChange={(value: DocType) => setDocFormData(prev => ({ ...prev, doc_type: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guide">Guide</SelectItem>
                      <SelectItem value="api-reference">API Reference</SelectItem>
                      <SelectItem value="tutorial">Tutorial</SelectItem>
                      <SelectItem value="concept">Concept</SelectItem>
                      <SelectItem value="quickstart">Quickstart</SelectItem>
                      <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={docFormData.category}
                    onValueChange={(value: DocCategory) => setDocFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="getting-started">Getting Started</SelectItem>
                      <SelectItem value="features">Features</SelectItem>
                      <SelectItem value="integrations">Integrations</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="sdk">SDK</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={docFormData.status}
                    onValueChange={(value: DocStatus) => setDocFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="review">In Review</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Version</Label>
                  <Input
                    placeholder="v1.0"
                    value={docFormData.version}
                    onChange={(e) => setDocFormData(prev => ({ ...prev, version: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Brief description of this documentation..."
                    value={docFormData.description || ''}
                    onChange={(e) => setDocFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1"
                    rows={2}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Content</Label>
                  <Textarea
                    placeholder="Write your documentation content here (Markdown supported)..."
                    value={docFormData.content || ''}
                    onChange={(e) => setDocFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="mt-1 font-mono"
                    rows={8}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Author</Label>
                  <Input
                    placeholder="Author name"
                    value={docFormData.author || ''}
                    onChange={(e) => setDocFormData(prev => ({ ...prev, author: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowEditDocDialog(false); setDocToEdit(null); resetDocForm() }}>Cancel</Button>
              <Button
                className="bg-gradient-to-r from-purple-600 to-fuchsia-600"
                onClick={handleUpdateDocSubmit}
                disabled={mutating}
              >
                {mutating ? 'Updating...' : 'Update Documentation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog - REAL Supabase */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-red-600">
                <Trash2 className="h-5 w-5" />
                Delete Documentation
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to delete <strong>"{docToDelete?.title}"</strong>?
                This action cannot be undone.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowDeleteConfirm(false); setDocToDelete(null) }}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={handleDeleteDocConfirm}
                disabled={mutating}
              >
                {mutating ? 'Deleting...' : 'Delete Documentation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Supabase Documentation Section - Real Data from Database */}
        {supabaseDocs && supabaseDocs.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-purple-600" />
                    Your Documentation (Supabase)
                  </CardTitle>
                  <CardDescription>
                    {supabaseStats.total} total documents | {supabaseStats.published} published | {supabaseStats.draft} drafts | {supabaseStats.review} in review
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => refetchDocs()}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${docsLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button size="sm" onClick={handleCreatePage}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Document
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {supabaseDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium truncate">{doc.title}</h4>
                            <Badge className={getSupabaseDocStatusColor(doc.status)}>{doc.status}</Badge>
                            <Badge className={getDocTypeColor(doc.doc_type)}>{doc.doc_type}</Badge>
                          </div>
                          <p className="text-sm text-gray-500 truncate">{doc.description || 'No description'}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {doc.views_count} views
                            </span>
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              {doc.likes_count} likes
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {doc.read_time} min read
                            </span>
                            <span>v{doc.version}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.status === 'draft' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePublishDocReal(doc)}
                            disabled={mutating}
                          >
                            <Globe className="h-4 w-4 mr-1" />
                            Publish
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLikeReal(doc.id)}
                          disabled={mutating}
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(doc)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => { setDocToDelete(doc); setShowDeleteConfirm(true) }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Empty State for Supabase Documentation */}
        {supabaseDocs && supabaseDocs.length === 0 && !docsLoading && (
          <Card className="mt-8">
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Documentation Yet</h3>
                <p className="text-gray-500 mb-4">Get started by creating your first documentation page.</p>
                <Button onClick={handleCreatePage}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {docsLoading && (
          <Card className="mt-8">
            <CardContent className="py-12">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 text-purple-600 mx-auto mb-4 animate-spin" />
                <p className="text-gray-500">Loading documentation...</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
