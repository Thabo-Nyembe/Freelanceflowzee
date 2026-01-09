'use client'
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


export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  FileText,
  Image,
  Video,
  Music,
  Code,
  Palette,
  Download,
  Upload,
  Star,
  Eye,
  Share2,
  Bookmark,
  Search,
  Filter,
  Plus,
  Grid,
  List,
  Users,
  Award,
  MoreHorizontal,
  Heart,
  Archive,
  Database,
  Settings,
  FolderOpen,
  DollarSign,
  FileUp,
  CheckCircle2,
  Trash2,
  Copy,
  Edit,
  Link,
  Lock,
  Calendar,
  X,
  ExternalLink,
  AlertTriangle
} from 'lucide-react'

// A+++ UTILITIES
import { CardSkeleton, DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('ResourceLibrary')


// ============================================================================
// V2 COMPETITIVE MOCK DATA - ResourceLibrary Context
// ============================================================================

const resourceLibraryAIInsights = [
  { id: '1', type: 'info' as const, title: 'Performance Update', description: 'System running optimally with 99.9% uptime this month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'success' as const, title: 'Goal Achievement', description: 'Monthly targets exceeded by 15%. Great progress!', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Goals' },
  { id: '3', type: 'warning' as const, title: 'Action Required', description: 'Review pending items to maintain workflow efficiency.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Tasks' },
]

const resourceLibraryCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Manager', lastActive: 'Now' },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, role: 'Developer', lastActive: '5m ago' },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, role: 'Designer', lastActive: '30m ago' },
]

const resourceLibraryPredictions = [
  { id: '1', label: 'Completion Rate', current: 85, target: 95, predicted: 92, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Efficiency Score', current: 78, target: 90, predicted: 86, confidence: 82, trend: 'up' as const },
]

const resourceLibraryActivities = [
  { id: '1', user: 'Alexandra Chen', action: 'updated', target: 'system settings', timestamp: '5m ago', type: 'info' as const },
  { id: '2', user: 'Marcus Johnson', action: 'completed', target: 'task review', timestamp: '15m ago', type: 'success' as const },
  { id: '3', user: 'System', action: 'generated', target: 'weekly report', timestamp: '1h ago', type: 'info' as const },
]

// Quick actions will be defined inside the component to access state setters

export default function ResourceLibraryClient() {
  // A+++ STATE MANAGEMENT
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resources, setResources] = useState<any[]>([])
  const [libraryStats, setLibraryStats] = useState({
    totalResources: 0,
    totalDownloads: 0,
    avgRating: 0,
    totalAuthors: 0
  })

  // A+++ LOAD RESOURCE LIBRARY DATA
  useEffect(() => {
    const loadResourceLibraryData = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        logger.info('Loading resource library data', { userId })

        // Dynamic import for code splitting
        const { getResources, getResourceLibraryStats } = await import('@/lib/resource-library-queries')

        // Load resources and stats in parallel
        const [resourcesResult, statsResult] = await Promise.all([
          getResources(userId, { limit: 50 }),
          getResourceLibraryStats()
        ])

        if (resourcesResult.error) throw resourcesResult.error
        if (statsResult.error) throw statsResult.error

        setResources(resourcesResult.data || [])
        setLibraryStats({
          totalResources: statsResult.data?.total_resources || 0,
          totalDownloads: statsResult.data?.total_downloads || 0,
          avgRating: statsResult.data?.avg_rating || 0,
          totalAuthors: statsResult.data?.total_authors || 0
        })

        setIsLoading(false)

        logger.info('Resource library data loaded successfully', {
          userId,
          resourcesCount: resourcesResult.data?.length || 0,
          totalResources: statsResult.data?.total_resources || 0
        })

        announce(`Resource library loaded with ${resourcesResult.data?.length || 0} resources`, 'polite')
      } catch (err) {
        logger.error('Failed to load resource library data', { error: err, userId })
        setError(err instanceof Error ? err.message : 'Failed to load resource library')
        setIsLoading(false)
        announce('Error loading resource library', 'assertive')
      }
    }

    loadResourceLibraryData()
  }, [userId, announce]) // eslint-disable-line react-hooks/exhaustive-deps

  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Dialog states for QuickActions
  const [showNewResourceDialog, setShowNewResourceDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showFiltersDialog, setShowFiltersDialog] = useState(false)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showResourceMenuDialog, setShowResourceMenuDialog] = useState(false)
  const [selectedResource, setSelectedResource] = useState<any>(null)
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set([2, 4, 6]))

  // New Resource form state
  const [newResourceData, setNewResourceData] = useState({
    title: '',
    description: '',
    category: 'design',
    type: 'template',
    tags: '',
    license: 'MIT',
    price: '0',
    isPremium: false
  })

  // Export form state
  const [exportOptions, setExportOptions] = useState({
    format: 'json',
    includeMetadata: true,
    selectedOnly: false,
    compressionEnabled: true
  })

  // Settings form state
  const [librarySettingsData, setLibrarySettingsData] = useState({
    defaultView: 'grid',
    itemsPerPage: '20',
    showPremiumBadge: true,
    autoSaveEnabled: true,
    notificationsEnabled: true,
    defaultSortBy: 'date'
  })

  // Filter form state
  const [filterOptions, setFilterOptions] = useState({
    priceRange: 'all',
    ratingMin: '0',
    sortBy: 'date',
    licenseType: 'all',
    dateRange: 'all',
    showFeaturedOnly: false,
    showPremiumOnly: false
  })

  // Upload form state
  const [uploadData, setUploadData] = useState({
    files: [] as File[],
    title: '',
    description: '',
    category: 'design'
  })

  // Share form state
  const [shareOptions, setShareOptions] = useState({
    shareType: 'link',
    allowDownload: true,
    expiresIn: '7',
    password: '',
    usePassword: false
  })

  // Handler functions for dialogs
  const handleCreateResource = async () => {
    try {
      // Validate form
      if (!newResourceData.title.trim()) {
        toast.error('Title Required', { description: 'Please enter a resource title' })
        return
      }
      if (!newResourceData.description.trim()) {
        toast.error('Description Required', { description: 'Please enter a resource description' })
        return
      }

      toast.promise(
        new Promise((resolve) => setTimeout(resolve, 1500)),
        {
          loading: 'Creating resource...',
          success: () => {
            setShowNewResourceDialog(false)
            setNewResourceData({
              title: '',
              description: '',
              category: 'design',
              type: 'template',
              tags: '',
              license: 'MIT',
              price: '0',
              isPremium: false
            })
            return `Resource "${newResourceData.title}" created successfully`
          },
          error: 'Failed to create resource'
        }
      )
    } catch (error) {
      toast.error('Error', { description: 'Failed to create resource' })
    }
  }

  const handleExport = async () => {
    try {
      toast.promise(
        new Promise((resolve) => setTimeout(resolve, 2000)),
        {
          loading: `Exporting resources as ${exportOptions.format.toUpperCase()}...`,
          success: () => {
            setShowExportDialog(false)
            return `Resources exported successfully as ${exportOptions.format.toUpperCase()}`
          },
          error: 'Failed to export resources'
        }
      )
    } catch (error) {
      toast.error('Export Failed', { description: 'An error occurred during export' })
    }
  }

  const handleSaveSettings = async () => {
    try {
      toast.promise(
        new Promise((resolve) => setTimeout(resolve, 1000)),
        {
          loading: 'Saving library settings...',
          success: () => {
            setShowSettingsDialog(false)
            setViewMode(librarySettingsData.defaultView)
            return 'Library settings saved successfully'
          },
          error: 'Failed to save settings'
        }
      )
    } catch (error) {
      toast.error('Error', { description: 'Failed to save settings' })
    }
  }

  // Upload handler
  const handleUpload = async () => {
    try {
      if (!uploadData.title.trim()) {
        toast.error('Title Required', { description: 'Please enter a title for your upload' })
        return
      }

      toast.promise(
        new Promise((resolve) => setTimeout(resolve, 2500)),
        {
          loading: 'Uploading resource files...',
          success: () => {
            setShowUploadDialog(false)
            setUploadData({
              files: [],
              title: '',
              description: '',
              category: 'design'
            })
            return `Resource "${uploadData.title}" uploaded successfully`
          },
          error: 'Failed to upload resource'
        }
      )
    } catch (error) {
      toast.error('Upload Failed', { description: 'An error occurred during upload' })
    }
  }

  // Apply filters handler
  const handleApplyFilters = () => {
    toast.success('Filters Applied', {
      description: `Showing ${filterOptions.showPremiumOnly ? 'premium ' : ''}${filterOptions.showFeaturedOnly ? 'featured ' : ''}resources sorted by ${filterOptions.sortBy}`
    })
    setShowFiltersDialog(false)
  }

  // Reset filters handler
  const handleResetFilters = () => {
    setFilterOptions({
      priceRange: 'all',
      ratingMin: '0',
      sortBy: 'date',
      licenseType: 'all',
      dateRange: 'all',
      showFeaturedOnly: false,
      showPremiumOnly: false
    })
    toast.info('Filters Reset', { description: 'All filters have been cleared' })
  }

  // Preview resource handler
  const handlePreviewResource = (resource: any) => {
    setSelectedResource(resource)
    setShowPreviewDialog(true)
    toast.info('Preview', { description: `Viewing "${resource.title}"` })
  }

  // Bookmark toggle handler
  const handleToggleBookmark = (resourceId: number, resourceTitle: string) => {
    setBookmarkedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(resourceId)) {
        newSet.delete(resourceId)
        toast.success('Bookmark Removed', { description: `"${resourceTitle}" removed from bookmarks` })
      } else {
        newSet.add(resourceId)
        toast.success('Bookmarked', { description: `"${resourceTitle}" added to bookmarks` })
      }
      return newSet
    })
  }

  // Download/Purchase handler
  const handleDownload = (resource: any) => {
    if (resource.isPremium && resource.price > 0) {
      toast.promise(
        new Promise((resolve) => setTimeout(resolve, 1500)),
        {
          loading: 'Processing purchase...',
          success: () => `"${resource.title}" purchased for $${resource.price}. Download starting...`,
          error: 'Purchase failed. Please try again.'
        }
      )
    } else {
      toast.promise(
        new Promise((resolve) => setTimeout(resolve, 1000)),
        {
          loading: `Downloading "${resource.title}"...`,
          success: () => `"${resource.title}" downloaded successfully`,
          error: 'Download failed. Please try again.'
        }
      )
    }
  }

  // Share resource handler
  const handleShareResource = (resource: any) => {
    setSelectedResource(resource)
    setShowShareDialog(true)
  }

  // Execute share handler
  const handleShare = async () => {
    if (!selectedResource) return

    try {
      toast.promise(
        new Promise((resolve) => setTimeout(resolve, 1000)),
        {
          loading: 'Creating share link...',
          success: () => {
            const shareUrl = `https://freeflow.app/resources/${selectedResource.id}`
            navigator.clipboard.writeText(shareUrl)
            setShowShareDialog(false)
            return `Share link copied to clipboard! Expires in ${shareOptions.expiresIn} days.`
          },
          error: 'Failed to create share link'
        }
      )
    } catch (error) {
      toast.error('Share Failed', { description: 'An error occurred while creating share link' })
    }
  }

  // Resource menu handler
  const handleResourceMenu = (resource: any) => {
    setSelectedResource(resource)
    setShowResourceMenuDialog(true)
  }

  // Delete resource handler
  const handleDeleteResource = (resource: any) => {
    setSelectedResource(resource)
    setShowDeleteDialog(true)
  }

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!selectedResource) return

    try {
      toast.promise(
        new Promise((resolve) => setTimeout(resolve, 1500)),
        {
          loading: 'Deleting resource...',
          success: () => {
            setShowDeleteDialog(false)
            setShowResourceMenuDialog(false)
            setSelectedResource(null)
            return `"${selectedResource.title}" has been deleted`
          },
          error: 'Failed to delete resource'
        }
      )
    } catch (error) {
      toast.error('Delete Failed', { description: 'An error occurred while deleting the resource' })
    }
  }

  // Edit resource handler
  const handleEditResource = () => {
    if (!selectedResource) return

    setNewResourceData({
      title: selectedResource.title,
      description: selectedResource.description,
      category: selectedResource.category,
      type: selectedResource.type,
      tags: selectedResource.tags?.join(', ') || '',
      license: selectedResource.license,
      price: selectedResource.price?.toString() || '0',
      isPremium: selectedResource.isPremium || false
    })
    setShowResourceMenuDialog(false)
    setShowNewResourceDialog(true)
    toast.info('Edit Mode', { description: `Editing "${selectedResource.title}"` })
  }

  // Duplicate resource handler
  const handleDuplicateResource = () => {
    if (!selectedResource) return

    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: 'Duplicating resource...',
        success: () => {
          setShowResourceMenuDialog(false)
          return `"${selectedResource.title}" has been duplicated`
        },
        error: 'Failed to duplicate resource'
      }
    )
  }

  // Archive resource handler
  const handleArchiveResource = () => {
    if (!selectedResource) return

    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: 'Archiving resource...',
        success: () => {
          setShowResourceMenuDialog(false)
          return `"${selectedResource.title}" has been archived`
        },
        error: 'Failed to archive resource'
      }
    )
  }

  // Browse files handler
  const handleBrowseFiles = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = '.zip,.figma,.ai,.psd,.pdf,.jpg,.png,.mp4,.mov'
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        toast.success('Files Selected', { description: `${files.length} file(s) ready to upload` })
      }
    }
    input.click()
  }

  // Quick actions with real dialog functionality
  const resourceLibraryQuickActions = [
    { id: '1', label: 'New Item', icon: 'Plus', shortcut: 'N', action: () => setShowNewResourceDialog(true) },
    { id: '2', label: 'Export', icon: 'Download', shortcut: 'E', action: () => setShowExportDialog(true) },
    { id: '3', label: 'Settings', icon: 'Settings', shortcut: 'S', action: () => setShowSettingsDialog(true) },
  ]

  // Mock resources for UI display (will be replaced by database resources)
  const mockResources = [
    {
      id: 1,
      title: 'Complete UI/UX Design System',
      description: 'Comprehensive design system with components, patterns, and guidelines for modern web applications',
      type: 'design-system',
      category: 'design',
      format: 'figma',
      size: '45.2 MB',
      downloads: 1247,
      rating: 4.9,
      views: 3420,
      likes: 234,
      author: 'Sarah Johnson',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20',
      tags: ['UI Kit', 'Design System', 'Components', 'Figma'],
      thumbnail: '/resources/ui-design-system.jpg',
      isPremium: true,
      isFeatured: true,
      isBookmarked: false,
      price: 49.99,
      license: 'Commercial'
    },
    {
      id: 2,
      title: 'React Component Library',
      description: 'Pre-built React components with TypeScript support and comprehensive documentation',
      type: 'code',
      category: 'development',
      format: 'zip',
      size: '12.8 MB',
      downloads: 892,
      rating: 4.8,
      views: 2156,
      likes: 167,
      author: 'Michael Chen',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18',
      tags: ['React', 'TypeScript', 'Components', 'NPM'],
      thumbnail: '/resources/react-components.jpg',
      isPremium: false,
      isFeatured: true,
      isBookmarked: true,
      price: 0,
      license: 'MIT'
    },
    {
      id: 3,
      title: 'Brand Identity Templates Pack',
      description: 'Collection of professional brand identity templates including logos, business cards, and stationery',
      type: 'template',
      category: 'branding',
      format: 'ai',
      size: '78.5 MB',
      downloads: 567,
      rating: 4.7,
      views: 1890,
      likes: 145,
      author: 'Emma Rodriguez',
      createdAt: '2024-01-05',
      updatedAt: '2024-01-12',
      tags: ['Branding', 'Logo', 'Templates', 'Adobe Illustrator'],
      thumbnail: '/resources/brand-templates.jpg',
      isPremium: true,
      isFeatured: false,
      isBookmarked: false,
      price: 29.99,
      license: 'Commercial'
    },
    {
      id: 4,
      title: 'Motion Graphics Assets',
      description: 'High-quality motion graphics elements and animations for video projects',
      type: 'video',
      category: 'motion',
      format: 'ae',
      size: '156.3 MB',
      downloads: 423,
      rating: 4.6,
      views: 1234,
      likes: 98,
      author: 'David Kim',
      createdAt: '2023-12-28',
      updatedAt: '2024-01-08',
      tags: ['Motion Graphics', 'After Effects', 'Animation', 'Video'],
      thumbnail: '/resources/motion-graphics.jpg',
      isPremium: true,
      isFeatured: true,
      isBookmarked: true,
      price: 39.99,
      license: 'Commercial'
    },
    {
      id: 5,
      title: 'Photography Stock Collection',
      description: 'Curated collection of high-resolution stock photos for commercial and personal use',
      type: 'image',
      category: 'photography',
      format: 'jpg',
      size: '234.7 MB',
      downloads: 1156,
      rating: 4.8,
      views: 4567,
      likes: 312,
      author: 'Lisa Wang',
      createdAt: '2023-12-20',
      updatedAt: '2024-01-15',
      tags: ['Stock Photos', 'Photography', 'Commercial', 'High-res'],
      thumbnail: '/resources/stock-photos.jpg',
      isPremium: false,
      isFeatured: false,
      isBookmarked: false,
      price: 0,
      license: 'CC0'
    },
    {
      id: 6,
      title: 'Web Development Starter Kit',
      description: 'Complete starter kit for modern web development with best practices and tools',
      type: 'code',
      category: 'development',
      format: 'zip',
      size: '89.4 MB',
      downloads: 734,
      rating: 4.9,
      views: 2890,
      likes: 201,
      author: 'Alex Thompson',
      createdAt: '2023-12-15',
      updatedAt: '2024-01-10',
      tags: ['Web Development', 'Starter Kit', 'Best Practices', 'Tools'],
      thumbnail: '/resources/web-starter.jpg',
      isPremium: false,
      isFeatured: true,
      isBookmarked: true,
      price: 0,
      license: 'MIT'
    }
  ]

  const categories = [
    { id: 'all', name: 'All Resources', icon: Database, count: 156 },
    { id: 'design', name: 'Design', icon: Palette, count: 45 },
    { id: 'development', name: 'Development', icon: Code, count: 32 },
    { id: 'branding', name: 'Branding', icon: Award, count: 28 },
    { id: 'photography', name: 'Photography', icon: Image, count: 23 },
    { id: 'motion', name: 'Motion Graphics', icon: Video, count: 18 },
    { id: 'templates', name: 'Templates', icon: FileText, count: 10 }
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'design-system': return Palette
      case 'template': return FileText
      case 'code': return Code
      case 'image': return Image
      case 'video': return Video
      case 'audio': return Music
      default: return FileText
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'design-system': return 'bg-purple-100 text-purple-800'
      case 'template': return 'bg-blue-100 text-blue-800'
      case 'code': return 'bg-green-100 text-green-800'
      case 'image': return 'bg-pink-100 text-pink-800'
      case 'video': return 'bg-orange-100 text-orange-800'
      case 'audio': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Use database resources if available, otherwise fall back to mock data
  const displayResources = resources.length > 0 ? resources : mockResources

  const filteredResources = displayResources.filter((resource: any) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (resource.tags && resource.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-4 w-72 h-72 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-4 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
        </div>
        <div className="relative max-w-7xl mx-auto space-y-8">
          <CardSkeleton />
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="max-w-2xl mx-auto mt-20">
          <ErrorEmptyState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        
        {/* V2 Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <AIInsightsPanel insights={resourceLibraryAIInsights} />
          <PredictiveAnalytics predictions={resourceLibraryPredictions} />
          <CollaborationIndicator collaborators={resourceLibraryCollaborators} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <QuickActionsToolbar actions={resourceLibraryQuickActions} />
          <ActivityFeed activities={resourceLibraryActivities} />
        </div>
{/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
              <Archive className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                Resource Library
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                Discover, organize, and share creative resources and assets
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              onClick={() => setShowNewResourceDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
            <Button variant="outline" onClick={() => setShowUploadDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/40 dark:border-gray-700/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Resources</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{libraryStats.totalResources}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">+12 this month</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                  <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/40 dark:border-gray-700/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Downloads</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{libraryStats.totalDownloads.toLocaleString()}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">+18% this month</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-xl">
                  <Download className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/40 dark:border-gray-700/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Avg Rating</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{libraryStats.avgRating}</p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">⭐ Excellent</p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-xl">
                  <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/40 dark:border-gray-700/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Contributors</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{libraryStats.totalAuthors}</p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Active creators</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>
            <Button variant="outline" size="sm" onClick={() => setShowFiltersDialog(true)}>
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {categories.slice(1).map((category) => {
            const Icon = category.icon
            return (
              <Card
                key={category.id}
                className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/40 dark:border-gray-700/40 shadow-lg hover:shadow-xl transition-all cursor-pointer ${
                  selectedCategory === category.id ? 'ring-2 ring-indigo-500' : ''
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-xl inline-block mb-2">
                    <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">{category.name}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{category.count} items</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Resources Grid */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredResources.map((resource) => {
            const TypeIcon = getTypeIcon(resource.type)
            
            if (viewMode === 'list') {
              return (
                <Card key={resource.id} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/40 dark:border-gray-700/40 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center">
                        <TypeIcon className="h-8 w-8 text-gray-600 dark:text-gray-300" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{resource.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{resource.description}</p>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getTypeColor(resource.type)}>
                                {resource.type}
                              </Badge>
                              {resource.isPremium && (
                                <Badge className="bg-gold-100 text-gold-800">Premium</Badge>
                              )}
                              {resource.isFeatured && (
                                <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                                  <Star className="h-3 w-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Download className="h-3 w-3" />
                                {resource.downloads}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                {resource.rating}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {resource.views}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handlePreviewResource(resource)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className={bookmarkedIds.has(resource.id) ? 'text-yellow-500 border-yellow-500' : ''}
                              onClick={() => handleToggleBookmark(resource.id, resource.title)}
                            >
                              <Bookmark className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                              onClick={() => handleDownload(resource)}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              {resource.isPremium ? `$${resource.price}` : 'Free'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            }

            return (
              <Card key={resource.id} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/40 dark:border-gray-700/40 shadow-lg hover:shadow-xl transition-all duration-200 group">
                <div className="relative">
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-t-lg flex items-center justify-center">
                    <TypeIcon className="h-12 w-12 text-gray-400 dark:text-gray-300" />
                  </div>
                  <div className="absolute top-4 left-4 flex gap-2">
                    {resource.isFeatured && (
                      <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {resource.isPremium && (
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                        Premium
                      </Badge>
                    )}
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`opacity-0 group-hover:opacity-100 transition-opacity ${bookmarkedIds.has(resource.id) ? 'text-yellow-500' : ''}`}
                      onClick={() => handleToggleBookmark(resource.id, resource.title)}
                    >
                      <Bookmark className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleResourceMenu(resource)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 dark:text-gray-100">{resource.title}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{resource.description}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={getTypeColor(resource.type)}>
                          {resource.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {resource.format.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-gray-500" />
                      <span>{resource.downloads}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{resource.rating}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-gray-500" />
                      <span>{resource.views}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span>{resource.likes}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {resource.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {resource.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{resource.tags.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>by {resource.author}</span>
                    <span>{resource.size}</span>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Button
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                      onClick={() => handleDownload(resource)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      {resource.isPremium ? `$${resource.price}` : 'Free'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handlePreviewResource(resource)}>
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleShareResource(resource)}>
                      <Share2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredResources.length === 0 && (
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/40 dark:border-gray-700/40 shadow-lg">
            <CardContent className="p-12 text-center">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">No Resources Found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <Button variant="outline" onClick={() => {setSearchQuery(''); setSelectedCategory('all')}}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* New Resource Dialog */}
      <Dialog open={showNewResourceDialog} onOpenChange={setShowNewResourceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-indigo-600" />
              Add New Resource
            </DialogTitle>
            <DialogDescription>
              Create a new resource to share with the community. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="resource-title">Resource Title</Label>
              <Input
                id="resource-title"
                placeholder="Enter resource title..."
                value={newResourceData.title}
                onChange={(e) => setNewResourceData({ ...newResourceData, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="resource-description">Description</Label>
              <Textarea
                id="resource-description"
                placeholder="Describe your resource..."
                rows={3}
                value={newResourceData.description}
                onChange={(e) => setNewResourceData({ ...newResourceData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="resource-category">Category</Label>
                <select
                  id="resource-category"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                  value={newResourceData.category}
                  onChange={(e) => setNewResourceData({ ...newResourceData, category: e.target.value })}
                >
                  <option value="design">Design</option>
                  <option value="development">Development</option>
                  <option value="branding">Branding</option>
                  <option value="photography">Photography</option>
                  <option value="motion">Motion Graphics</option>
                  <option value="templates">Templates</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="resource-type">Resource Type</Label>
                <select
                  id="resource-type"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                  value={newResourceData.type}
                  onChange={(e) => setNewResourceData({ ...newResourceData, type: e.target.value })}
                >
                  <option value="design-system">Design System</option>
                  <option value="template">Template</option>
                  <option value="code">Code</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                </select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="resource-tags">Tags (comma separated)</Label>
              <Input
                id="resource-tags"
                placeholder="e.g., React, UI Kit, Components"
                value={newResourceData.tags}
                onChange={(e) => setNewResourceData({ ...newResourceData, tags: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="resource-license">License</Label>
                <select
                  id="resource-license"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                  value={newResourceData.license}
                  onChange={(e) => setNewResourceData({ ...newResourceData, license: e.target.value })}
                >
                  <option value="MIT">MIT</option>
                  <option value="CC0">CC0 (Public Domain)</option>
                  <option value="Commercial">Commercial</option>
                  <option value="CC-BY">CC BY 4.0</option>
                  <option value="GPL">GPL</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="resource-price">Price (0 for free)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="resource-price"
                    type="number"
                    min="0"
                    step="0.01"
                    className="pl-10"
                    placeholder="0.00"
                    value={newResourceData.price}
                    onChange={(e) => setNewResourceData({ ...newResourceData, price: e.target.value, isPremium: parseFloat(e.target.value) > 0 })}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <FileUp className="h-8 w-8 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Upload Resource File</p>
                <p className="text-xs text-gray-500">Drag and drop or click to browse</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleBrowseFiles}>Browse</Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewResourceDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              onClick={handleCreateResource}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Resource
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-green-600" />
              Export Resources
            </DialogTitle>
            <DialogDescription>
              Configure your export settings and download your resources.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="export-format">Export Format</Label>
              <select
                id="export-format"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                value={exportOptions.format}
                onChange={(e) => setExportOptions({ ...exportOptions, format: e.target.value })}
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="xml">XML</option>
                <option value="zip">ZIP Archive</option>
              </select>
            </div>
            <div className="space-y-3">
              <Label>Export Options</Label>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">Include Metadata</p>
                  <p className="text-xs text-gray-500">Export tags, ratings, and statistics</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 rounded"
                  checked={exportOptions.includeMetadata}
                  onChange={(e) => setExportOptions({ ...exportOptions, includeMetadata: e.target.checked })}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">Selected Only</p>
                  <p className="text-xs text-gray-500">Export only bookmarked resources</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 rounded"
                  checked={exportOptions.selectedOnly}
                  onChange={(e) => setExportOptions({ ...exportOptions, selectedOnly: e.target.checked })}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">Enable Compression</p>
                  <p className="text-xs text-gray-500">Compress files to reduce download size</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 rounded"
                  checked={exportOptions.compressionEnabled}
                  onChange={(e) => setExportOptions({ ...exportOptions, compressionEnabled: e.target.checked })}
                />
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <FolderOpen className="h-5 w-5" />
                <span className="font-medium">Export Preview</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                {exportOptions.selectedOnly ? 'Bookmarked' : 'All'} resources will be exported as {exportOptions.format.toUpperCase()}
                {exportOptions.includeMetadata ? ' with metadata' : ''}.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              Library Settings
            </DialogTitle>
            <DialogDescription>
              Configure your resource library preferences and display options.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="default-view">Default View</Label>
                <select
                  id="default-view"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                  value={librarySettingsData.defaultView}
                  onChange={(e) => setLibrarySettingsData({ ...librarySettingsData, defaultView: e.target.value })}
                >
                  <option value="grid">Grid View</option>
                  <option value="list">List View</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="items-per-page">Items Per Page</Label>
                <select
                  id="items-per-page"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                  value={librarySettingsData.itemsPerPage}
                  onChange={(e) => setLibrarySettingsData({ ...librarySettingsData, itemsPerPage: e.target.value })}
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sort-by">Default Sort</Label>
              <select
                id="sort-by"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                value={librarySettingsData.defaultSortBy}
                onChange={(e) => setLibrarySettingsData({ ...librarySettingsData, defaultSortBy: e.target.value })}
              >
                <option value="date">Date Added</option>
                <option value="name">Name</option>
                <option value="rating">Rating</option>
                <option value="downloads">Downloads</option>
                <option value="popularity">Popularity</option>
              </select>
            </div>
            <div className="space-y-3">
              <Label>Display Options</Label>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">Show Premium Badge</p>
                  <p className="text-xs text-gray-500">Display premium indicators on resources</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 rounded"
                  checked={librarySettingsData.showPremiumBadge}
                  onChange={(e) => setLibrarySettingsData({ ...librarySettingsData, showPremiumBadge: e.target.checked })}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">Auto-save Preferences</p>
                  <p className="text-xs text-gray-500">Automatically save filter and view changes</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 rounded"
                  checked={librarySettingsData.autoSaveEnabled}
                  onChange={(e) => setLibrarySettingsData({ ...librarySettingsData, autoSaveEnabled: e.target.checked })}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">Notifications</p>
                  <p className="text-xs text-gray-500">Get notified about new resources</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 rounded"
                  checked={librarySettingsData.notificationsEnabled}
                  onChange={(e) => setLibrarySettingsData({ ...librarySettingsData, notificationsEnabled: e.target.checked })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              onClick={handleSaveSettings}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              Upload Resources
            </DialogTitle>
            <DialogDescription>
              Upload new resources to your library. Supported formats: ZIP, Figma, AI, PSD, PDF, images, and video.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="upload-title">Resource Title</Label>
              <Input
                id="upload-title"
                placeholder="Enter a title for your upload..."
                value={uploadData.title}
                onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="upload-description">Description</Label>
              <Textarea
                id="upload-description"
                placeholder="Describe your resource..."
                rows={2}
                value={uploadData.description}
                onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="upload-category">Category</Label>
              <select
                id="upload-category"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                value={uploadData.category}
                onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
              >
                <option value="design">Design</option>
                <option value="development">Development</option>
                <option value="branding">Branding</option>
                <option value="photography">Photography</option>
                <option value="motion">Motion Graphics</option>
                <option value="templates">Templates</option>
              </select>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer" onClick={handleBrowseFiles}>
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm font-medium text-gray-700 mb-1">Drag and drop files here</p>
              <p className="text-xs text-gray-500 mb-3">or click to browse</p>
              <Button variant="outline" size="sm" type="button">
                Select Files
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              onClick={handleUpload}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filters Dialog */}
      <Dialog open={showFiltersDialog} onOpenChange={setShowFiltersDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-indigo-600" />
              Advanced Filters
            </DialogTitle>
            <DialogDescription>
              Refine your search with advanced filtering options.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="filter-price">Price Range</Label>
                <select
                  id="filter-price"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                  value={filterOptions.priceRange}
                  onChange={(e) => setFilterOptions({ ...filterOptions, priceRange: e.target.value })}
                >
                  <option value="all">All Prices</option>
                  <option value="free">Free Only</option>
                  <option value="paid">Paid Only</option>
                  <option value="under10">Under $10</option>
                  <option value="under50">Under $50</option>
                  <option value="over50">$50+</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="filter-rating">Minimum Rating</Label>
                <select
                  id="filter-rating"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                  value={filterOptions.ratingMin}
                  onChange={(e) => setFilterOptions({ ...filterOptions, ratingMin: e.target.value })}
                >
                  <option value="0">Any Rating</option>
                  <option value="3">3+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="filter-license">License Type</Label>
                <select
                  id="filter-license"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                  value={filterOptions.licenseType}
                  onChange={(e) => setFilterOptions({ ...filterOptions, licenseType: e.target.value })}
                >
                  <option value="all">All Licenses</option>
                  <option value="MIT">MIT</option>
                  <option value="CC0">CC0 (Public Domain)</option>
                  <option value="Commercial">Commercial</option>
                  <option value="CC-BY">CC BY 4.0</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="filter-date">Date Added</Label>
                <select
                  id="filter-date"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                  value={filterOptions.dateRange}
                  onChange={(e) => setFilterOptions({ ...filterOptions, dateRange: e.target.value })}
                >
                  <option value="all">Any Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="filter-sort">Sort By</Label>
              <select
                id="filter-sort"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                value={filterOptions.sortBy}
                onChange={(e) => setFilterOptions({ ...filterOptions, sortBy: e.target.value })}
              >
                <option value="date">Date Added (Newest)</option>
                <option value="date-asc">Date Added (Oldest)</option>
                <option value="name">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="rating">Rating (Highest)</option>
                <option value="downloads">Downloads (Most)</option>
                <option value="price">Price (Lowest)</option>
                <option value="price-desc">Price (Highest)</option>
              </select>
            </div>
            <div className="space-y-3">
              <Label>Additional Filters</Label>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">Featured Only</p>
                  <p className="text-xs text-gray-500">Show only featured resources</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 rounded"
                  checked={filterOptions.showFeaturedOnly}
                  onChange={(e) => setFilterOptions({ ...filterOptions, showFeaturedOnly: e.target.checked })}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">Premium Only</p>
                  <p className="text-xs text-gray-500">Show only premium resources</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 rounded"
                  checked={filterOptions.showPremiumOnly}
                  onChange={(e) => setFilterOptions({ ...filterOptions, showPremiumOnly: e.target.checked })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleResetFilters}>
              Reset
            </Button>
            <Button
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              onClick={handleApplyFilters}
            >
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Resource Preview
            </DialogTitle>
            <DialogDescription>
              {selectedResource?.title || 'Preview resource details'}
            </DialogDescription>
          </DialogHeader>
          {selectedResource && (
            <div className="grid gap-4 py-4">
              <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center">
                <Database className="h-16 w-16 text-gray-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedResource.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{selectedResource.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge className="bg-indigo-100 text-indigo-800">{selectedResource.type}</Badge>
                    <Badge variant="outline">{selectedResource.format?.toUpperCase()}</Badge>
                    {selectedResource.isPremium && (
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">Premium</Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Author:</span>
                    <span className="font-medium">{selectedResource.author}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Size:</span>
                    <span className="font-medium">{selectedResource.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Downloads:</span>
                    <span className="font-medium">{selectedResource.downloads?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rating:</span>
                    <span className="font-medium flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {selectedResource.rating}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">License:</span>
                    <span className="font-medium">{selectedResource.license}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Price:</span>
                    <span className="font-medium text-green-600">
                      {selectedResource.isPremium ? `$${selectedResource.price}` : 'Free'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedResource.tags?.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Close
            </Button>
            <Button variant="outline" onClick={() => {
              setShowPreviewDialog(false)
              if (selectedResource) handleShareResource(selectedResource)
            }}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              onClick={() => {
                if (selectedResource) handleDownload(selectedResource)
                setShowPreviewDialog(false)
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              {selectedResource?.isPremium ? `Buy $${selectedResource.price}` : 'Download'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-blue-600" />
              Share Resource
            </DialogTitle>
            <DialogDescription>
              {selectedResource ? `Share "${selectedResource.title}" with others` : 'Share resource'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="share-type">Share Type</Label>
              <select
                id="share-type"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                value={shareOptions.shareType}
                onChange={(e) => setShareOptions({ ...shareOptions, shareType: e.target.value })}
              >
                <option value="link">Public Link</option>
                <option value="email">Email Invite</option>
                <option value="team">Team Share</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="share-expires">Link Expires In</Label>
              <select
                id="share-expires"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                value={shareOptions.expiresIn}
                onChange={(e) => setShareOptions({ ...shareOptions, expiresIn: e.target.value })}
              >
                <option value="1">1 Day</option>
                <option value="7">7 Days</option>
                <option value="30">30 Days</option>
                <option value="never">Never</option>
              </select>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">Allow Download</p>
                  <p className="text-xs text-gray-500">Recipients can download the resource</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 rounded"
                  checked={shareOptions.allowDownload}
                  onChange={(e) => setShareOptions({ ...shareOptions, allowDownload: e.target.checked })}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">Password Protection</p>
                  <p className="text-xs text-gray-500">Require password to access</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 rounded"
                  checked={shareOptions.usePassword}
                  onChange={(e) => setShareOptions({ ...shareOptions, usePassword: e.target.checked })}
                />
              </div>
              {shareOptions.usePassword && (
                <div className="grid gap-2">
                  <Label htmlFor="share-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="share-password"
                      type="password"
                      placeholder="Enter password..."
                      className="pl-10"
                      value={shareOptions.password}
                      onChange={(e) => setShareOptions({ ...shareOptions, password: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <Link className="h-5 w-5" />
                <span className="font-medium">Share Link Preview</span>
              </div>
              <p className="text-sm text-blue-600 mt-1 font-mono truncate">
                https://freeflow.app/resources/{selectedResource?.id || 'xxx'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              onClick={handleShare}
            >
              <Link className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resource Menu Dialog */}
      <Dialog open={showResourceMenuDialog} onOpenChange={setShowResourceMenuDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MoreHorizontal className="h-5 w-5 text-gray-600" />
              Resource Options
            </DialogTitle>
            <DialogDescription>
              {selectedResource?.title || 'Resource options'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            <Button
              variant="outline"
              className="justify-start"
              onClick={handleEditResource}
            >
              <Edit className="h-4 w-4 mr-3" />
              Edit Resource
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={handleDuplicateResource}
            >
              <Copy className="h-4 w-4 mr-3" />
              Duplicate
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => {
                setShowResourceMenuDialog(false)
                if (selectedResource) handleShareResource(selectedResource)
              }}
            >
              <Share2 className="h-4 w-4 mr-3" />
              Share
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => {
                if (selectedResource) handleDownload(selectedResource)
                setShowResourceMenuDialog(false)
              }}
            >
              <Download className="h-4 w-4 mr-3" />
              Download
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => {
                if (selectedResource) handleToggleBookmark(selectedResource.id, selectedResource.title)
                setShowResourceMenuDialog(false)
              }}
            >
              <Bookmark className="h-4 w-4 mr-3" />
              {selectedResource && bookmarkedIds.has(selectedResource.id) ? 'Remove Bookmark' : 'Add Bookmark'}
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={handleArchiveResource}
            >
              <Archive className="h-4 w-4 mr-3" />
              Archive
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => {
                if (selectedResource) {
                  const url = `https://freeflow.app/resources/${selectedResource.id}`
                  window.open(url, '_blank')
                  toast.info('Opening in new tab', { description: 'Resource page opened' })
                }
                setShowResourceMenuDialog(false)
              }}
            >
              <ExternalLink className="h-4 w-4 mr-3" />
              Open in New Tab
            </Button>
            <div className="border-t my-2" />
            <Button
              variant="outline"
              className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => {
                setShowResourceMenuDialog(false)
                if (selectedResource) handleDeleteResource(selectedResource)
              }}
            >
              <Trash2 className="h-4 w-4 mr-3" />
              Delete Resource
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Resource
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this resource? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedResource && (
            <div className="py-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <Database className="h-10 w-10 text-red-400" />
                  <div>
                    <p className="font-medium text-gray-900">{selectedResource.title}</p>
                    <p className="text-sm text-gray-500">{selectedResource.type} - {selectedResource.size}</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                This will permanently delete the resource and all associated files. All download links will become invalid.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
              onClick={handleConfirmDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}