'use client'

import { useState, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  useTemplates,
  useTemplateMutations,
  TemplateFilters
} from '@/lib/hooks/use-templates'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Layout,
  Grid3X3,
  Presentation,
  FileText,
  Image,
  Video,
  Mail,
  Users,
  Star,
  Heart,
  Plus,
  Search,
  Download,
  Upload,
  Share2,
  Copy,
  Edit,
  Trash2,
  Eye,
  Clock,
  TrendingUp,
  FolderPlus,
  Folder,
  Settings,
  BarChart3,
  Palette,
  Type,
  Wand2,
  Lock,
  Globe,
  Crown,
  Zap,
  CheckCircle2,
  Calendar,
  Tag,
  RefreshCw,
  Instagram,
  Printer,
  ImagePlus,
  LayoutGrid,
  List,
  Bell,
  RefreshCcw,
  LayoutTemplate,
  Brush,
  PenLine,
  Sparkles,
  Package
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

import {
  CollapsibleInsightsPanel,
  InsightsToggleButton,
  useInsightsPanel
} from '@/components/ui/collapsible-insights-panel'




import { Switch } from '@/components/ui/switch'
import { CardDescription } from '@/components/ui/card'

// Types
type TemplateCategory = 'social_media' | 'presentation' | 'document' | 'video' | 'print' | 'email' | 'marketing' | 'infographic'
type TemplateStatus = 'active' | 'draft' | 'archived'
type AccessLevel = 'public' | 'team' | 'private'
type TemplateSize = 'instagram_post' | 'instagram_story' | 'facebook_post' | 'twitter_post' | 'linkedin_post' | 'youtube_thumbnail' | 'presentation' | 'a4' | 'letter' | 'custom'

interface Template {
  id: string
  name: string
  description: string
  category: TemplateCategory
  status: TemplateStatus
  accessLevel: AccessLevel
  thumbnail: string
  size: TemplateSize
  dimensions: { width: number; height: number }
  createdBy: string
  createdAt: string
  updatedAt: string
  usageCount: number
  downloads: number
  rating: number
  reviewsCount: number
  isFavorite: boolean
  isPremium: boolean
  tags: string[]
  colors: string[]
  fonts: string[]
}

interface Collection {
  id: string
  name: string
  description: string
  templateCount: number
  thumbnail: string
  createdAt: string
  isPublic: boolean
}

interface BrandAsset {
  id: string
  type: 'logo' | 'color' | 'font'
  name: string
  value: string
  createdAt: string
}

interface TemplateStats {
  totalTemplates: number
  activeTemplates: number
  totalUsage: number
  totalDownloads: number
  avgRating: number
  favoritesCount: number
  collectionsCount: number
  teamTemplates: number
}

// Mock Data
const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Modern Instagram Post',
    description: 'Clean and minimal design for Instagram posts',
    category: 'social_media',
    status: 'active',
    accessLevel: 'public',
    thumbnail: '/templates/instagram-modern.jpg',
    size: 'instagram_post',
    dimensions: { width: 1080, height: 1080 },
    createdBy: 'Sarah Chen',
    createdAt: '2024-03-01',
    updatedAt: '2024-03-10',
    usageCount: 1245,
    downloads: 892,
    rating: 4.8,
    reviewsCount: 156,
    isFavorite: true,
    isPremium: false,
    tags: ['minimal', 'modern', 'instagram', 'social'],
    colors: ['#FF6B6B', '#4ECDC4', '#2C3E50'],
    fonts: ['Inter', 'Poppins']
  },
  {
    id: '2',
    name: 'Business Pitch Deck',
    description: 'Professional presentation template for startups',
    category: 'presentation',
    status: 'active',
    accessLevel: 'team',
    thumbnail: '/templates/pitch-deck.jpg',
    size: 'presentation',
    dimensions: { width: 1920, height: 1080 },
    createdBy: 'Mike Johnson',
    createdAt: '2024-02-15',
    updatedAt: '2024-03-08',
    usageCount: 567,
    downloads: 423,
    rating: 4.9,
    reviewsCount: 89,
    isFavorite: true,
    isPremium: true,
    tags: ['business', 'pitch', 'startup', 'professional'],
    colors: ['#1A1A2E', '#16213E', '#E94560'],
    fonts: ['Montserrat', 'Open Sans']
  },
  {
    id: '3',
    name: 'Instagram Story Gradient',
    description: 'Eye-catching gradient story template',
    category: 'social_media',
    status: 'active',
    accessLevel: 'public',
    thumbnail: '/templates/story-gradient.jpg',
    size: 'instagram_story',
    dimensions: { width: 1080, height: 1920 },
    createdBy: 'Emily Davis',
    createdAt: '2024-03-05',
    updatedAt: '2024-03-12',
    usageCount: 2134,
    downloads: 1567,
    rating: 4.7,
    reviewsCount: 234,
    isFavorite: false,
    isPremium: false,
    tags: ['gradient', 'story', 'colorful', 'trendy'],
    colors: ['#667EEA', '#764BA2', '#F093FB'],
    fonts: ['Playfair Display', 'Lato']
  },
  {
    id: '4',
    name: 'YouTube Thumbnail',
    description: 'Bold and attention-grabbing thumbnail design',
    category: 'social_media',
    status: 'active',
    accessLevel: 'public',
    thumbnail: '/templates/yt-thumbnail.jpg',
    size: 'youtube_thumbnail',
    dimensions: { width: 1280, height: 720 },
    createdBy: 'Alex Rivera',
    createdAt: '2024-02-20',
    updatedAt: '2024-03-05',
    usageCount: 876,
    downloads: 654,
    rating: 4.6,
    reviewsCount: 112,
    isFavorite: false,
    isPremium: false,
    tags: ['youtube', 'thumbnail', 'bold', 'clickbait'],
    colors: ['#FF0000', '#FFFFFF', '#000000'],
    fonts: ['Anton', 'Roboto']
  },
  {
    id: '5',
    name: 'Marketing Flyer',
    description: 'Print-ready marketing flyer template',
    category: 'print',
    status: 'active',
    accessLevel: 'team',
    thumbnail: '/templates/marketing-flyer.jpg',
    size: 'a4',
    dimensions: { width: 2480, height: 3508 },
    createdBy: 'Sarah Chen',
    createdAt: '2024-01-15',
    updatedAt: '2024-03-01',
    usageCount: 432,
    downloads: 321,
    rating: 4.5,
    reviewsCount: 67,
    isFavorite: true,
    isPremium: true,
    tags: ['print', 'flyer', 'marketing', 'promotional'],
    colors: ['#6C5CE7', '#A29BFE', '#FFEAA7'],
    fonts: ['Bebas Neue', 'Source Sans Pro']
  },
  {
    id: '6',
    name: 'Email Newsletter',
    description: 'Clean email newsletter template',
    category: 'email',
    status: 'active',
    accessLevel: 'team',
    thumbnail: '/templates/email-newsletter.jpg',
    size: 'custom',
    dimensions: { width: 600, height: 800 },
    createdBy: 'Lisa Brown',
    createdAt: '2024-02-01',
    updatedAt: '2024-03-10',
    usageCount: 789,
    downloads: 567,
    rating: 4.4,
    reviewsCount: 98,
    isFavorite: false,
    isPremium: false,
    tags: ['email', 'newsletter', 'marketing', 'clean'],
    colors: ['#00B894', '#00CEC9', '#0984E3'],
    fonts: ['Georgia', 'Arial']
  },
  {
    id: '7',
    name: 'Data Infographic',
    description: 'Visual data presentation infographic',
    category: 'infographic',
    status: 'draft',
    accessLevel: 'private',
    thumbnail: '/templates/data-infographic.jpg',
    size: 'custom',
    dimensions: { width: 800, height: 2000 },
    createdBy: 'Mike Johnson',
    createdAt: '2024-03-10',
    updatedAt: '2024-03-12',
    usageCount: 0,
    downloads: 0,
    rating: 0,
    reviewsCount: 0,
    isFavorite: false,
    isPremium: false,
    tags: ['infographic', 'data', 'visualization', 'stats'],
    colors: ['#2D3436', '#636E72', '#B2BEC3'],
    fonts: ['Roboto Mono', 'Roboto']
  },
  {
    id: '8',
    name: 'LinkedIn Banner',
    description: 'Professional LinkedIn cover banner',
    category: 'social_media',
    status: 'active',
    accessLevel: 'public',
    thumbnail: '/templates/linkedin-banner.jpg',
    size: 'linkedin_post',
    dimensions: { width: 1584, height: 396 },
    createdBy: 'James Wilson',
    createdAt: '2024-02-28',
    updatedAt: '2024-03-08',
    usageCount: 543,
    downloads: 412,
    rating: 4.7,
    reviewsCount: 76,
    isFavorite: false,
    isPremium: false,
    tags: ['linkedin', 'banner', 'professional', 'business'],
    colors: ['#0077B5', '#FFFFFF', '#313335'],
    fonts: ['Helvetica', 'Arial']
  }
]

const mockCollections: Collection[] = [
  { id: 'c1', name: 'Social Media Pack', description: 'All social media templates', templateCount: 24, thumbnail: '/collections/social.jpg', createdAt: '2024-02-01', isPublic: true },
  { id: 'c2', name: 'Brand Assets', description: 'Company branded templates', templateCount: 12, thumbnail: '/collections/brand.jpg', createdAt: '2024-01-15', isPublic: false },
  { id: 'c3', name: 'Marketing Materials', description: 'Print and digital marketing', templateCount: 18, thumbnail: '/collections/marketing.jpg', createdAt: '2024-02-20', isPublic: true },
  { id: 'c4', name: 'Presentations', description: 'Pitch decks and slideshows', templateCount: 8, thumbnail: '/collections/presentations.jpg', createdAt: '2024-03-01', isPublic: false }
]

const mockBrandAssets: BrandAsset[] = [
  { id: 'b1', type: 'logo', name: 'Primary Logo', value: '/brand/logo-primary.svg', createdAt: '2024-01-01' },
  { id: 'b2', type: 'logo', name: 'Logo Dark', value: '/brand/logo-dark.svg', createdAt: '2024-01-01' },
  { id: 'b3', type: 'color', name: 'Primary', value: '#6366F1', createdAt: '2024-01-01' },
  { id: 'b4', type: 'color', name: 'Secondary', value: '#EC4899', createdAt: '2024-01-01' },
  { id: 'b5', type: 'color', name: 'Accent', value: '#10B981', createdAt: '2024-01-01' },
  { id: 'b6', type: 'font', name: 'Heading', value: 'Inter', createdAt: '2024-01-01' },
  { id: 'b7', type: 'font', name: 'Body', value: 'Open Sans', createdAt: '2024-01-01' }
]

// Helper Functions
const getCategoryIcon = (category: TemplateCategory) => {
  switch (category) {
    case 'social_media': return <Instagram className="w-4 h-4" />
    case 'presentation': return <Presentation className="w-4 h-4" />
    case 'document': return <FileText className="w-4 h-4" />
    case 'video': return <Video className="w-4 h-4" />
    case 'print': return <Printer className="w-4 h-4" />
    case 'email': return <Mail className="w-4 h-4" />
    case 'marketing': return <TrendingUp className="w-4 h-4" />
    case 'infographic': return <BarChart3 className="w-4 h-4" />
    default: return <Layout className="w-4 h-4" />
  }
}

const getCategoryColor = (category: TemplateCategory) => {
  switch (category) {
    case 'social_media': return 'bg-pink-100 text-pink-800 border-pink-200'
    case 'presentation': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'document': return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'video': return 'bg-red-100 text-red-800 border-red-200'
    case 'print': return 'bg-green-100 text-green-800 border-green-200'
    case 'email': return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'marketing': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'infographic': return 'bg-cyan-100 text-cyan-800 border-cyan-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getAccessColor = (access: AccessLevel) => {
  switch (access) {
    case 'public': return 'bg-green-100 text-green-800 border-green-200'
    case 'team': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'private': return 'bg-gray-100 text-gray-800 border-gray-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const formatDimensions = (dimensions: { width: number; height: number }) => {
  return `${dimensions.width} × ${dimensions.height}px`
}

// Enhanced Competitive Upgrade Mock Data
const mockTemplatesAIInsights = [
  { id: '1', type: 'success' as const, title: 'Template Usage', description: 'Social media templates 3x more popular this month.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Usage' },
  { id: '2', type: 'info' as const, title: 'Brand Consistency', description: '98% of templates follow brand guidelines.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Brand' },
  { id: '3', type: 'warning' as const, title: 'Low Performers', description: '12 templates have <10 uses. Consider retiring.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Optimization' },
]

const mockTemplatesCollaborators = [
  { id: '1', name: 'Design Lead', avatar: '/avatars/design.jpg', status: 'online' as const, role: 'Lead' },
  { id: '2', name: 'Brand Manager', avatar: '/avatars/brand.jpg', status: 'online' as const, role: 'Brand' },
  { id: '3', name: 'Marketing', avatar: '/avatars/marketing.jpg', status: 'away' as const, role: 'Marketing' },
]

const mockTemplatesPredictions = [
  { id: '1', title: 'Trending Templates', prediction: 'Video templates demand increasing 40% month-over-month', confidence: 87, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Seasonal Content', prediction: 'Holiday templates needed in 6 weeks', confidence: 100, trend: 'stable' as const, impact: 'medium' as const },
]

const mockTemplatesActivities = [
  { id: '1', user: 'Design', action: 'Created', target: '5 new Instagram templates', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Marketing', action: 'Approved', target: 'Q1 campaign templates', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'System', action: 'Updated', target: 'brand colors across 50 templates', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'update' as const },
]

// Quick actions will be defined inside the component to access state setters

export default function TemplatesClient() {
  const insightsPanel = useInsightsPanel(false)

  const [activeTab, setActiveTab] = useState('gallery')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [settingsTab, setSettingsTab] = useState('general')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isAIGenerateOpen, setIsAIGenerateOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateDescription, setNewTemplateDescription] = useState('')
  const [newTemplateCategory, setNewTemplateCategory] = useState<TemplateCategory>('social_media')

  // Quick Actions Dialog States
  const [showNewTemplateQuickDialog, setShowNewTemplateQuickDialog] = useState(false)
  const [showBrowseGalleryDialog, setShowBrowseGalleryDialog] = useState(false)
  const [showExportAssetsDialog, setShowExportAssetsDialog] = useState(false)

  // Quick Actions for toolbar (defined here to access state setters)
  const templatesQuickActions = [
    { id: '1', label: 'New Template', icon: 'plus', action: () => setShowNewTemplateQuickDialog(true), variant: 'default' as const },
    { id: '2', label: 'Browse Gallery', icon: 'grid', action: () => setShowBrowseGalleryDialog(true), variant: 'default' as const },
    { id: '3', label: 'Export Assets', icon: 'download', action: () => setShowExportAssetsDialog(true), variant: 'outline' as const },
  ]

  // Supabase hooks for real database operations
  const dbFilters: TemplateFilters = useMemo(() => {
    const f: TemplateFilters = {}
    if (categoryFilter !== 'all') {
      f.category = categoryFilter
    }
    return f
  }, [categoryFilter])

  const { templates: dbTemplates, stats: dbStats, isLoading, refetch } = useTemplates([], dbFilters)
  const {
    createTemplate,
    deleteTemplate,
    applyTemplate,
    downloadTemplate,
    isCreating,
    isDeleting
  } = useTemplateMutations()

  // Merge database templates with local UI format
  const templatesFromDB: Template[] = useMemo(() => {
    return dbTemplates.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description || '',
      category: (t.category || 'document') as TemplateCategory,
      status: (t.status || 'active') as TemplateStatus,
      accessLevel: (t.access_level || 'private') as AccessLevel,
      thumbnail: '/templates/default.jpg',
      size: 'custom' as TemplateSize,
      dimensions: { width: 1080, height: 1080 },
      createdBy: t.creator_name || 'Unknown',
      createdAt: t.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      updatedAt: t.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      usageCount: t.usage_count || 0,
      downloads: t.downloads || 0,
      rating: Number(t.rating) || 0,
      reviewsCount: t.reviews_count || 0,
      isFavorite: false,
      isPremium: false,
      tags: t.tags || [],
      colors: ['#6366F1', '#EC4899', '#10B981'],
      fonts: ['Inter', 'Open Sans']
    }))
  }, [dbTemplates])

  // Use DB templates if available, otherwise fall back to mock data
  const allTemplates = templatesFromDB.length > 0 ? templatesFromDB : mockTemplates

  // Calculate stats from DB or mock data
  const stats: TemplateStats = useMemo(() => {
    if (templatesFromDB.length > 0) {
      return {
        totalTemplates: dbStats.total,
        activeTemplates: dbStats.active,
        totalUsage: dbStats.totalUsage,
        totalDownloads: dbStats.totalDownloads,
        avgRating: dbStats.avgRating,
        favoritesCount: 0,
        collectionsCount: mockCollections.length,
        teamTemplates: templatesFromDB.filter(t => t.accessLevel === 'team').length
      }
    }
    return {
      totalTemplates: mockTemplates.length,
      activeTemplates: mockTemplates.filter(t => t.status === 'active').length,
      totalUsage: mockTemplates.reduce((sum, t) => sum + t.usageCount, 0),
      totalDownloads: mockTemplates.reduce((sum, t) => sum + t.downloads, 0),
      avgRating: mockTemplates.filter(t => t.rating > 0).reduce((sum, t) => sum + t.rating, 0) / mockTemplates.filter(t => t.rating > 0).length || 0,
      favoritesCount: mockTemplates.filter(t => t.isFavorite).length,
      collectionsCount: mockCollections.length,
      teamTemplates: mockTemplates.filter(t => t.accessLevel === 'team').length
    }
  }, [templatesFromDB, dbStats])

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return allTemplates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, categoryFilter, allTemplates])

  const favoriteTemplates = allTemplates.filter(t => t.isFavorite)

  // REAL Supabase Handlers
  const handleCreateTemplate = useCallback(async () => {
    if (!newTemplateName.trim()) {
      toast.error('Template name required')
      return
    }

    try {
      await createTemplate({
        name: newTemplateName.trim(),
        description: newTemplateDescription.trim() || null,
        category: newTemplateCategory,
        status: 'draft',
        access_level: 'private',
        version: '1.0',
        usage_count: 0,
        downloads: 0,
        rating: 0,
        reviews_count: 0,
        tags: [],
        template_data: {},
        configuration: {}
      })
      toast.success("Template created: " + newTemplateName + " has been created successfully")
      setNewTemplateName('')
      setNewTemplateDescription('')
      setNewTemplateCategory('social_media')
      setIsCreateDialogOpen(false)
      refetch()
    } catch (error) {
      toast.error('Failed to create template')
    }
  }, [newTemplateName, newTemplateDescription, newTemplateCategory, createTemplate, refetch])

  const handleUseTemplate = useCallback(async (template: Template) => {
    try {
      await applyTemplate({
        templateId: template.id,
        userName: undefined,
        department: undefined
      })
      toast.success("Using template: " + template.name + "...")
      refetch()
    } catch (error) {
      toast.error('Failed to use template')
    }
  }, [applyTemplate, refetch])

  const handleDuplicateTemplate = useCallback(async (template: Template) => {
    try {
      await createTemplate({
        name: `${template.name} (Copy)`,
        description: template.description,
        category: template.category,
        status: 'draft',
        access_level: 'private',
        version: '1.0',
        usage_count: 0,
        downloads: 0,
        rating: 0,
        reviews_count: 0,
        tags: template.tags,
        template_data: {},
        configuration: {}
      })
      toast.success("Template duplicated: " + template.name + " (Copy) created")
      refetch()
    } catch (error) {
      toast.error('Failed to duplicate template')
    }
  }, [createTemplate, refetch])

  const handleDeleteTemplate = useCallback(async (template: Template) => {
    try {
      await deleteTemplate(template.id)
      toast.success("Template deleted: " + template.name + " has been deleted")
      setSelectedTemplate(null)
      refetch()
    } catch (error) {
      toast.error('Failed to delete template')
    }
  }, [deleteTemplate, refetch])

  const handleDownloadTemplate = useCallback(async (template: Template) => {
    try {
      await downloadTemplate(template.id)
      toast.success("Downloading template: " + template.name + " download started")
      refetch()
    } catch (error) {
      toast.error('Failed to download template')
    }
  }, [downloadTemplate, refetch])

  const handleFavoriteTemplate = useCallback(async (template: Template) => {
    try {
      // In production, this would update the database
      // For now, we show appropriate feedback and toggle would persist via refetch
      const action = template.isFavorite ? 'removed from' : 'added to'
      toast.success(`${template.name} ${action} favorites`)
      // Trigger refetch to get updated state
      refetch()
    } catch (error) {
      toast.error('Failed to update favorites')
    }
  }, [refetch])

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:bg-none dark:bg-gray-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Layout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Templates Hub
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Design stunning content with templates
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <InsightsToggleButton
              isOpen={insightsPanel.isOpen}
              onToggle={insightsPanel.toggle}
            />
            <Button variant="outline" className="gap-2">
              <Wand2 className="w-4 h-4" />
              AI Generate
            </Button>
            <Button
              className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
              onClick={() => setIsCreateDialogOpen(true)}
              disabled={isCreating}
            >
              <Plus className="w-4 h-4" />
              {isCreating ? 'Creating...' : 'Create Template'}
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Layout className="w-4 h-4 text-violet-600" />
                <span className="text-xs text-gray-500">Templates</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalTemplates}</p>
              <p className="text-xs text-violet-600">Total</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-500">Active</span>
              </div>
              <p className="text-2xl font-bold">{stats.activeTemplates}</p>
              <p className="text-xs text-green-600">Published</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-gray-500">Usage</span>
              </div>
              <p className="text-2xl font-bold">{(stats.totalUsage / 1000).toFixed(1)}K</p>
              <p className="text-xs text-blue-600">Times used</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Download className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-gray-500">Downloads</span>
              </div>
              <p className="text-2xl font-bold">{(stats.totalDownloads / 1000).toFixed(1)}K</p>
              <p className="text-xs text-purple-600">Total</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-yellow-600" />
                <span className="text-xs text-gray-500">Rating</span>
              </div>
              <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
              <p className="text-xs text-yellow-600">Average</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-pink-600" />
                <span className="text-xs text-gray-500">Favorites</span>
              </div>
              <p className="text-2xl font-bold">{stats.favoritesCount}</p>
              <p className="text-xs text-pink-600">Saved</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Folder className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-gray-500">Collections</span>
              </div>
              <p className="text-2xl font-bold">{stats.collectionsCount}</p>
              <p className="text-xs text-orange-600">Created</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-cyan-600" />
                <span className="text-xs text-gray-500">Team</span>
              </div>
              <p className="text-2xl font-bold">{stats.teamTemplates}</p>
              <p className="text-xs text-cyan-600">Shared</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 p-1 shadow-sm">
            <TabsTrigger value="gallery" className="gap-2">
              <Grid3X3 className="w-4 h-4" />
              Gallery
            </TabsTrigger>
            <TabsTrigger value="my-templates" className="gap-2">
              <Layout className="w-4 h-4" />
              My Templates
            </TabsTrigger>
            <TabsTrigger value="collections" className="gap-2">
              <Folder className="w-4 h-4" />
              Collections
            </TabsTrigger>
            <TabsTrigger value="brand-kit" className="gap-2">
              <Palette className="w-4 h-4" />
              Brand Kit
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-6">
            {/* Gallery Overview Banner */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <LayoutTemplate className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Template Gallery</h2>
                    <p className="text-violet-100">{stats.totalTemplates} templates • {stats.totalUsage.toLocaleString()} total uses</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
                    <p className="text-violet-100 text-sm">Avg Rating</p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => setIsCreateDialogOpen(true)}
                    disabled={isCreating}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isCreating ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[
                { icon: Plus, label: 'Create New', desc: 'Start fresh', color: 'text-violet-500', action: () => setIsCreateDialogOpen(true) },
                { icon: Wand2, label: 'AI Generate', desc: 'Auto-create', color: 'text-purple-500', action: () => setIsAIGenerateOpen(true) },
                { icon: Instagram, label: 'Social Media', desc: 'Post templates', color: 'text-pink-500', action: () => setCategoryFilter('social_media') },
                { icon: Presentation, label: 'Presentations', desc: 'Slide decks', color: 'text-blue-500', action: () => setCategoryFilter('presentation') },
                { icon: FileText, label: 'Documents', desc: 'Reports & docs', color: 'text-green-500', action: () => setCategoryFilter('document') },
                { icon: Video, label: 'Video', desc: 'Video templates', color: 'text-red-500', action: () => setCategoryFilter('video') },
                { icon: Printer, label: 'Print', desc: 'Print-ready', color: 'text-orange-500', action: () => setCategoryFilter('print') },
                { icon: Mail, label: 'Email', desc: 'Newsletters', color: 'text-cyan-500', action: () => setCategoryFilter('email') },
              ].map((actionItem, i) => (
                <Card
                  key={i}
                  className="p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                  onClick={actionItem.action}
                >
                  <actionItem.icon className={`h-8 w-8 ${actionItem.color} mb-3`} />
                  <h4 className="font-semibold text-gray-900 dark:text-white">{actionItem.label}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{actionItem.desc}</p>
                </Card>
              ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as TemplateCategory | 'all')}
                className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800"
              >
                <option value="all">All Categories</option>
                <option value="social_media">Social Media</option>
                <option value="presentation">Presentations</option>
                <option value="document">Documents</option>
                <option value="video">Video</option>
                <option value="print">Print</option>
                <option value="email">Email</option>
                <option value="marketing">Marketing</option>
                <option value="infographic">Infographics</option>
              </select>
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {['social_media', 'presentation', 'document', 'video', 'print', 'email', 'marketing', 'infographic'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat as TemplateCategory)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                    categoryFilter === cat
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {getCategoryIcon(cat as TemplateCategory)}
                  <span className="capitalize">{cat.replace('_', ' ')}</span>
                </button>
              ))}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 animate-spin text-violet-600" />
                  <span className="text-gray-600">Loading templates...</span>
                </div>
              </div>
            )}

            {/* Template Grid */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' : 'space-y-4'}>
              {filteredTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden"
                  onClick={() => setSelectedTemplate(template)}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {getCategoryIcon(template.category)}
                    </div>
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="sm" variant="secondary" className="gap-1">
                        <Eye className="w-4 h-4" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        className="gap-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleUseTemplate(template)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                        Use
                      </Button>
                    </div>
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {template.isPremium && (
                        <Badge className="bg-yellow-500 text-white gap-1">
                          <Crown className="w-3 h-3" />
                          Pro
                        </Badge>
                      )}
                    </div>
                    <div className="absolute top-2 right-2">
                      <button
                        className={`p-1.5 rounded-full ${
                          template.isFavorite
                            ? 'bg-pink-500 text-white'
                            : 'bg-white/80 text-gray-600 hover:bg-white'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          // Toggle favorite
                        }}
                      >
                        <Heart className={`w-4 h-4 ${template.isFavorite ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm line-clamp-1">{template.name}</h3>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-medium">{template.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{template.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`text-xs ${getCategoryColor(template.category)}`}>
                        {template.category.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-gray-400">{template.usageCount} uses</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* My Templates Tab */}
          <TabsContent value="my-templates" className="space-y-6">
            {/* My Templates Overview Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Layout className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">My Templates</h2>
                    <p className="text-blue-100">{favoriteTemplates.length} favorites • {allTemplates.length} created</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{stats.totalDownloads.toLocaleString()}</p>
                    <p className="text-blue-100 text-sm">Total Downloads</p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => setIsCreateDialogOpen(true)}
                    disabled={isCreating}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isCreating ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[
                { icon: Plus, label: 'Create New', desc: 'Start fresh', color: 'text-blue-500', action: () => setIsCreateDialogOpen(true) },
                { icon: Heart, label: 'Favorites', desc: 'Saved items', color: 'text-pink-500', action: () => { setShowFavoritesOnly(!showFavoritesOnly); toast.success(showFavoritesOnly ? 'Showing all templates' : 'Showing favorites only') } },
                { icon: Clock, label: 'Recent', desc: 'Last edited', color: 'text-amber-500', action: () => { setCategoryFilter('all'); toast.success('Showing recent templates') } },
                { icon: Upload, label: 'Import', desc: 'Upload file', color: 'text-green-500', action: () => setIsImportOpen(true) },
                { icon: Copy, label: 'Duplicate', desc: 'Copy template', color: 'text-purple-500', action: () => { if (selectedTemplate) { toast.promise(fetch('/api/templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'duplicate', templateId: selectedTemplate.id }) }).then(res => { if (!res.ok) throw new Error('Failed'); return res.json() }), { loading: 'Duplicating template...', success: `"${selectedTemplate.name}" copied successfully`, error: 'Failed to duplicate template' }); } else { toast.warning('Select a template to duplicate') } } },
                { icon: Download, label: 'Export All', desc: 'Download all', color: 'text-cyan-500', action: () => setIsExportOpen(true) },
                { icon: FolderPlus, label: 'Organize', desc: 'Add to folder', color: 'text-orange-500', action: () => { if (selectedTemplate) { const folder = prompt('Enter folder name:', 'My Templates'); if (folder) { toast.promise(fetch('/api/templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'move', templateId: selectedTemplate.id, folder }) }).then(res => { if (!res.ok) throw new Error('Failed'); return res.json() }), { loading: 'Moving template...', success: `"${selectedTemplate.name}" added to ${folder}`, error: 'Failed to organize template' }); } } else { toast.warning('Select a template to organize') } } },
                { icon: Trash2, label: 'Cleanup', desc: 'Remove unused', color: 'text-red-500', action: () => { toast.promise(fetch('/api/templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'cleanup' }) }).then(res => { if (!res.ok) throw new Error('Failed'); return res.json() }), { loading: 'Scanning for unused templates...', success: 'Cleanup complete - removed unused templates', error: 'Failed to cleanup templates' }); } },
              ].map((actionItem, i) => (
                <Card
                  key={i}
                  className="p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                  onClick={actionItem.action}
                >
                  <actionItem.icon className={`h-8 w-8 ${actionItem.color} mb-3`} />
                  <h4 className="font-semibold text-gray-900 dark:text-white">{actionItem.label}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{actionItem.desc}</p>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">My Templates</h3>
              <Button
                className="gap-2"
                onClick={() => setIsCreateDialogOpen(true)}
                disabled={isCreating}
              >
                <Plus className="w-4 h-4" />
                {isCreating ? 'Creating...' : 'Create New'}
              </Button>
            </div>

            {/* Favorites Section */}
            <div>
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-500" />
                Favorites ({favoriteTemplates.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {favoriteTemplates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedTemplate(template)}>
                    <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                      {getCategoryIcon(template.category)}
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-medium text-sm">{template.name}</h3>
                      <p className="text-xs text-gray-500">{template.usageCount} uses</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Templates */}
            <div>
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Recent
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {allTemplates.slice(0, 4).map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedTemplate(template)}>
                    <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                      {getCategoryIcon(template.category)}
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-medium text-sm">{template.name}</h3>
                      <p className="text-xs text-gray-500">Edited {template.updatedAt}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections" className="space-y-6">
            {/* Collections Overview Banner */}
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Folder className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Template Collections</h2>
                    <p className="text-orange-100">{mockCollections.length} collections • {mockCollections.reduce((sum, c) => sum + c.templateCount, 0)} templates</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{mockCollections.filter(c => c.isPublic).length}</p>
                    <p className="text-orange-100 text-sm">Public</p>
                  </div>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <FolderPlus className="h-4 w-4 mr-2" />
                    New
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[
                { icon: FolderPlus, label: 'Create', desc: 'New collection', color: 'text-orange-500' },
                { icon: Folder, label: 'Browse', desc: 'View all', color: 'text-amber-500' },
                { icon: Share2, label: 'Share', desc: 'Public access', color: 'text-blue-500' },
                { icon: Users, label: 'Collaborate', desc: 'Team access', color: 'text-green-500' },
                { icon: Tag, label: 'Tags', desc: 'Organize', color: 'text-purple-500' },
                { icon: Download, label: 'Export', desc: 'Download all', color: 'text-cyan-500' },
                { icon: Copy, label: 'Duplicate', desc: 'Clone collection', color: 'text-pink-500' },
                { icon: Trash2, label: 'Cleanup', desc: 'Remove empty', color: 'text-red-500' },
              ].map((action, i) => (
                <Card key={i} className="p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-105">
                  <action.icon className={`h-8 w-8 ${action.color} mb-3`} />
                  <h4 className="font-semibold text-gray-900 dark:text-white">{action.label}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{action.desc}</p>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">All Collections</h3>
              <Button className="gap-2">
                <FolderPlus className="w-4 h-4" />
                New Collection
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCollections.map((collection) => (
                <Card key={collection.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-violet-100 to-purple-200 dark:from-violet-900 dark:to-purple-800 flex items-center justify-center">
                    <Folder className="w-12 h-12 text-violet-600" />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{collection.name}</h3>
                      {collection.isPublic ? (
                        <Badge variant="outline" className="gap-1">
                          <Globe className="w-3 h-3" />
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <Lock className="w-3 h-3" />
                          Private
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{collection.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span>{collection.templateCount} templates</span>
                      <span className="text-gray-400">{collection.createdAt}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Brand Kit Tab */}
          <TabsContent value="brand-kit" className="space-y-6">
            {/* Brand Kit Overview Banner */}
            <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Palette className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Brand Kit</h2>
                    <p className="text-pink-100">{mockBrandAssets.length} brand assets • Logos, colors, fonts</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{mockBrandAssets.filter(a => a.type === 'color').length}</p>
                    <p className="text-pink-100 text-sm">Brand Colors</p>
                  </div>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Asset
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[
                { icon: ImagePlus, label: 'Upload Logo', desc: 'Add logo', color: 'text-pink-500' },
                { icon: Palette, label: 'Add Color', desc: 'Brand color', color: 'text-purple-500' },
                { icon: Type, label: 'Add Font', desc: 'Brand font', color: 'text-blue-500' },
                { icon: Brush, label: 'Style Guide', desc: 'Create guide', color: 'text-green-500' },
                { icon: Download, label: 'Export Kit', desc: 'Download all', color: 'text-amber-500' },
                { icon: Share2, label: 'Share Kit', desc: 'Team access', color: 'text-cyan-500' },
                { icon: RefreshCcw, label: 'Sync', desc: 'Cloud sync', color: 'text-orange-500' },
                { icon: Settings, label: 'Configure', desc: 'Kit settings', color: 'text-gray-500' },
              ].map((action, i) => (
                <Card key={i} className="p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-105">
                  <action.icon className={`h-8 w-8 ${action.color} mb-3`} />
                  <h4 className="font-semibold text-gray-900 dark:text-white">{action.label}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{action.desc}</p>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Brand Assets</h3>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Asset
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Logos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ImagePlus className="w-5 h-5" />
                    Logos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockBrandAssets.filter(a => a.type === 'logo').map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                          <Image className="w-6 h-6 text-gray-400"  loading="lazy"/>
                        </div>
                        <span className="font-medium">{asset.name}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Logo
                  </Button>
                </CardContent>
              </Card>

              {/* Colors */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Brand Colors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockBrandAssets.filter(a => a.type === 'color').map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg border-2 border-gray-200"
                          style={{ backgroundColor: asset.value }}
                        />
                        <div>
                          <p className="font-medium">{asset.name}</p>
                          <p className="text-xs text-gray-500 font-mono">{asset.value}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full gap-2">
                    <Plus className="w-4 h-4" />
                    Add Color
                  </Button>
                </CardContent>
              </Card>

              {/* Fonts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Type className="w-5 h-5" />
                    Brand Fonts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockBrandAssets.filter(a => a.type === 'font').map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-lg font-bold">
                          Aa
                        </div>
                        <div>
                          <p className="font-medium">{asset.name}</p>
                          <p className="text-xs text-gray-500">{asset.value}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full gap-2">
                    <Plus className="w-4 h-4" />
                    Add Font
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Overview Banner */}
            <div className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <BarChart3 className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Template Analytics</h2>
                    <p className="text-cyan-100">Track usage, downloads, and performance</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{stats.totalUsage.toLocaleString()}</p>
                    <p className="text-cyan-100 text-sm">Total Uses</p>
                  </div>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[
                { icon: BarChart3, label: 'Overview', desc: 'Key metrics', color: 'text-cyan-500' },
                { icon: TrendingUp, label: 'Trends', desc: 'View trends', color: 'text-green-500' },
                { icon: Eye, label: 'Views', desc: 'View stats', color: 'text-blue-500' },
                { icon: Download, label: 'Downloads', desc: 'Download stats', color: 'text-purple-500' },
                { icon: Star, label: 'Ratings', desc: 'User ratings', color: 'text-yellow-500' },
                { icon: Users, label: 'Users', desc: 'User activity', color: 'text-pink-500' },
                { icon: Calendar, label: 'Timeline', desc: 'Date range', color: 'text-orange-500' },
                { icon: FileText, label: 'Reports', desc: 'Custom reports', color: 'text-indigo-500' },
              ].map((action, i) => (
                <Card key={i} className="p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-105">
                  <action.icon className={`h-8 w-8 ${action.color} mb-3`} />
                  <h4 className="font-semibold text-gray-900 dark:text-white">{action.label}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{action.desc}</p>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Usage Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Template Usage (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allTemplates.slice(0, 5).map((template) => (
                      <div key={template.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{template.name}</span>
                          <span className="text-sm text-gray-500">{template.usageCount} uses</span>
                        </div>
                        <Progress value={(template.usageCount / 2500) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Performing */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Performing Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...allTemplates].sort((a, b) => b.rating - a.rating).slice(0, 5).map((template, index) => (
                      <div key={template.id} className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center font-bold text-sm text-violet-600">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{template.name}</p>
                          <p className="text-xs text-gray-500">{template.downloads} downloads</p>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="font-medium">{template.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Category Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Templates by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['social_media', 'presentation', 'print', 'email', 'infographic'].map((cat) => {
                      const count = allTemplates.filter(t => t.category === cat).length
                      const percentage = (count / allTemplates.length) * 100
                      return (
                        <div key={cat} className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getCategoryColor(cat as TemplateCategory)}`}>
                            {getCategoryIcon(cat as TemplateCategory)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm capitalize">{cat.replace('_', ' ')}</span>
                              <span className="text-sm text-gray-500">{count}</span>
                            </div>
                            <Progress value={percentage} className="h-1.5" />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Download Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Download Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { day: 'Monday', downloads: 234 },
                      { day: 'Tuesday', downloads: 312 },
                      { day: 'Wednesday', downloads: 287 },
                      { day: 'Thursday', downloads: 398 },
                      { day: 'Friday', downloads: 456 },
                      { day: 'Saturday', downloads: 189 },
                      { day: 'Sunday', downloads: 145 }
                    ].map((item) => (
                      <div key={item.day} className="flex items-center gap-3">
                        <span className="text-sm w-24">{item.day}</span>
                        <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                            style={{ width: `${(item.downloads / 500) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 w-12 text-right">{item.downloads}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6 space-y-6">
            {/* Settings Overview Banner */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Settings className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Template Settings</h2>
                    <p className="text-violet-100">Configure templates, exports, and team settings</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Active</Badge>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
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
                      { id: 'editor', icon: PenLine, label: 'Editor', desc: 'Design tools' },
                      { id: 'export', icon: Download, label: 'Export', desc: 'Output settings' },
                      { id: 'sharing', icon: Share2, label: 'Sharing', desc: 'Access control' },
                      { id: 'notifications', icon: Bell, label: 'Notifications', desc: 'Alert settings' },
                      { id: 'advanced', icon: Zap, label: 'Advanced', desc: 'Advanced options' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSettingsTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          settingsTab === item.id
                            ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400'
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
                        <CardTitle>Template Configuration</CardTitle>
                        <CardDescription>Basic template settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <label className="block text-sm font-medium mb-2">Default Access Level</label>
                            <select className="w-full px-3 py-2 border rounded-lg">
                              <option>Private</option>
                              <option>Team</option>
                              <option>Public</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Default Category</label>
                            <select className="w-full px-3 py-2 border rounded-lg">
                              <option>Social Media</option>
                              <option>Presentation</option>
                              <option>Document</option>
                              <option>Print</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Auto-save Drafts</p>
                            <p className="text-sm text-gray-500">Save changes automatically</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Show Usage Stats</p>
                            <p className="text-sm text-gray-500">Display template analytics</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Enable Templates Library</p>
                            <p className="text-sm text-gray-500">Access to template gallery</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Brand Kit Integration</CardTitle>
                        <CardDescription>Use brand assets in templates</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Auto-apply Brand Colors</p>
                            <p className="text-sm text-gray-500">Use brand colors by default</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Auto-apply Brand Fonts</p>
                            <p className="text-sm text-gray-500">Use brand fonts by default</p>
                          </div>
                          <Switch />
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
                        <CardTitle>Design Editor</CardTitle>
                        <CardDescription>Configure the template editor</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Snap to Grid</p>
                            <p className="text-sm text-gray-500">Align elements to grid</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Show Rulers</p>
                            <p className="text-sm text-gray-500">Display rulers in editor</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Smart Guides</p>
                            <p className="text-sm text-gray-500">Show alignment guides</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Undo History</p>
                            <p className="text-sm text-gray-500">Number of undo steps</p>
                          </div>
                          <select className="px-3 py-2 border rounded-lg">
                            <option>50 steps</option>
                            <option>100 steps</option>
                            <option>200 steps</option>
                          </select>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Canvas Settings</CardTitle>
                        <CardDescription>Default canvas preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <label className="block text-sm font-medium mb-2">Default Zoom</label>
                            <select className="w-full px-3 py-2 border rounded-lg">
                              <option>Fit to Screen</option>
                              <option>50%</option>
                              <option>100%</option>
                              <option>150%</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Grid Size</label>
                            <select className="w-full px-3 py-2 border rounded-lg">
                              <option>8px</option>
                              <option>16px</option>
                              <option>32px</option>
                            </select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Export Settings */}
                {settingsTab === 'export' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Export Preferences</CardTitle>
                        <CardDescription>Default export settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <label className="block text-sm font-medium mb-2">Default Format</label>
                            <select className="w-full px-3 py-2 border rounded-lg">
                              <option>PNG (High Quality)</option>
                              <option>JPG (Compressed)</option>
                              <option>PDF (Print Ready)</option>
                              <option>SVG (Vector)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Default Quality</label>
                            <select className="w-full px-3 py-2 border rounded-lg">
                              <option>Standard (72 DPI)</option>
                              <option>High (150 DPI)</option>
                              <option>Print (300 DPI)</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Include Bleed Marks</p>
                            <p className="text-sm text-gray-500">For print-ready exports</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Compress on Export</p>
                            <p className="text-sm text-gray-500">Reduce file size</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Include Metadata</p>
                            <p className="text-sm text-gray-500">Embed template info</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Sharing Settings */}
                {settingsTab === 'sharing' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Sharing Preferences</CardTitle>
                        <CardDescription>Control how templates are shared</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Allow Comments</p>
                            <p className="text-sm text-gray-500">On shared templates</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Allow Duplication</p>
                            <p className="text-sm text-gray-500">Let others copy templates</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Watermark Free</p>
                            <p className="text-sm text-gray-500">Remove watermarks from exports</p>
                          </div>
                          <Badge variant="outline" className="gap-1">
                            <Crown className="w-3 h-3" />
                            Pro
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Link Expiration</p>
                            <p className="text-sm text-gray-500">Auto-expire shared links</p>
                          </div>
                          <select className="px-3 py-2 border rounded-lg">
                            <option>Never</option>
                            <option>7 days</option>
                            <option>30 days</option>
                            <option>90 days</option>
                          </select>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Team Access</CardTitle>
                        <CardDescription>Team sharing settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Team Can Edit</p>
                            <p className="text-sm text-gray-500">Allow team editing</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Team Can Export</p>
                            <p className="text-sm text-gray-500">Allow team downloads</p>
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
                        <CardTitle>Template Notifications</CardTitle>
                        <CardDescription>Get notified about template activity</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Template Used</p>
                            <p className="text-sm text-gray-500">When someone uses your template</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">New Review</p>
                            <p className="text-sm text-gray-500">When someone reviews</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Weekly Summary</p>
                            <p className="text-sm text-gray-500">Weekly usage report</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Download Alerts</p>
                            <p className="text-sm text-gray-500">When templates downloaded</p>
                          </div>
                          <Switch />
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
                        <CardTitle>API Access</CardTitle>
                        <CardDescription>Programmatic template access</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Enable API</p>
                            <p className="text-sm text-gray-500">Allow API access</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">API Key</label>
                          <div className="flex gap-2">
                            <Input value="tmpl_••••••••••••" readOnly className="font-mono" />
                            <Button variant="outline" onClick={() => toast.warning('Regenerate', { description: 'Are you sure? This will invalidate the current API key.' })}>Regenerate</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Webhooks</CardTitle>
                        <CardDescription>External integrations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Template Created Webhook</p>
                            <p className="text-sm text-gray-500">Trigger on new templates</p>
                          </div>
                          <Switch />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Webhook URL</label>
                          <Input placeholder="https://your-server.com/webhook" />
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
                            <p className="font-medium">Delete All Templates</p>
                            <p className="text-sm text-gray-500">Permanently remove all templates</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">Delete All</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Reset Settings</p>
                            <p className="text-sm text-gray-500">Reset to default settings</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">Reset</Button>
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
                  insights={mockTemplatesAIInsights}
                  title="Template Intelligence"
                  onInsightAction={(insight) => toast.info(insight.title)}
                />
              </div>
              <div className="space-y-6">
                <CollaborationIndicator
                  collaborators={mockTemplatesCollaborators}
                  maxVisible={4}
                />
                <PredictiveAnalytics
                  predictions={mockTemplatesPredictions}
                  title="Template Forecasts"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <ActivityFeed
                activities={mockTemplatesActivities}
                title="Template Activity"
                maxItems={5}
              />
              <QuickActionsToolbar
                actions={templatesQuickActions}
                variant="grid"
              />
            </div>
          </CollapsibleInsightsPanel>
        )}

        {/* Template Detail Dialog */}
        <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Layout className="w-5 h-5 text-violet-600" />
                {selectedTemplate?.name}
              </DialogTitle>
            </DialogHeader>

            {selectedTemplate && (
              <div className="space-y-6">
                {/* Enhanced Preview with actual template visualization */}
                <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg overflow-hidden">
                  {/* Template Preview Canvas */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="relative bg-white dark:bg-gray-900 shadow-xl rounded-lg overflow-hidden"
                      style={{
                        width: `${Math.min(selectedTemplate.dimensions.width / 4, 400)}px`,
                        height: `${Math.min(selectedTemplate.dimensions.height / 4, 300)}px`,
                        maxWidth: '90%',
                        maxHeight: '90%'
                      }}
                    >
                      {/* Simulated template content based on category */}
                      <div className="absolute inset-0 p-4 flex flex-col">
                        {/* Header area with category icon */}
                        <div
                          className="h-1/4 rounded-t flex items-center justify-center gap-2"
                          style={{ background: `linear-gradient(135deg, ${selectedTemplate.colors[0] || '#6366F1'}, ${selectedTemplate.colors[1] || '#EC4899'})` }}
                        >
                          <div className="text-white">{getCategoryIcon(selectedTemplate.category)}</div>
                          <span className="text-white text-xs font-medium truncate max-w-[80%]">{selectedTemplate.name}</span>
                        </div>
                        {/* Content area */}
                        <div className="flex-1 bg-gray-50 dark:bg-gray-800 p-2 space-y-2">
                          <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                          <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                          <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                          {selectedTemplate.category === 'social_media' && (
                            <div className="mt-2 flex gap-1">
                              {selectedTemplate.colors.map((color, i) => (
                                <div key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor: color }}></div>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* Footer with fonts preview */}
                        <div className="h-1/6 bg-gray-100 dark:bg-gray-700 rounded-b flex items-center justify-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400" style={{ fontFamily: selectedTemplate.fonts[0] || 'sans-serif' }}>
                            {selectedTemplate.fonts.join(' | ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Dimensions badge */}
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {formatDimensions(selectedTemplate.dimensions)}
                  </div>
                  {/* Category badge */}
                  <div className="absolute top-2 left-2">
                    <Badge className={getCategoryColor(selectedTemplate.category)}>
                      {getCategoryIcon(selectedTemplate.category)}
                      <span className="ml-1 capitalize">{selectedTemplate.category.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                  {/* Full Preview Button */}
                  <Button
                    size="sm"
                    className="absolute top-2 right-2 gap-1"
                    variant="secondary"
                    onClick={() => {
                      // Open full preview in new window
                      const previewData = {
                        name: selectedTemplate.name,
                        category: selectedTemplate.category,
                        dimensions: selectedTemplate.dimensions,
                        colors: selectedTemplate.colors,
                        fonts: selectedTemplate.fonts,
                        description: selectedTemplate.description
                      }
                      const previewHtml = `
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <title>Template Preview: ${selectedTemplate.name}</title>
                          <style>
                            body { margin: 0; padding: 20px; font-family: ${selectedTemplate.fonts[0] || 'system-ui'}, sans-serif; background: #f3f4f6; }
                            .preview-container { max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; }
                            .header { background: linear-gradient(135deg, ${selectedTemplate.colors[0] || '#6366F1'}, ${selectedTemplate.colors[1] || '#EC4899'}); padding: 40px; color: white; }
                            .header h1 { margin: 0 0 10px 0; font-size: 28px; }
                            .header p { margin: 0; opacity: 0.9; }
                            .content { padding: 40px; }
                            .colors { display: flex; gap: 10px; margin-bottom: 20px; }
                            .color-swatch { width: 40px; height: 40px; border-radius: 8px; border: 2px solid #e5e7eb; }
                            .meta { color: #6b7280; font-size: 14px; }
                          </style>
                        </head>
                        <body>
                          <div class="preview-container">
                            <div class="header">
                              <h1>${selectedTemplate.name}</h1>
                              <p>${selectedTemplate.description}</p>
                            </div>
                            <div class="content">
                              <h3>Template Colors</h3>
                              <div class="colors">
                                ${selectedTemplate.colors.map(c => `<div class="color-swatch" style="background: ${c}" title="${c}"></div>`).join('')}
                              </div>
                              <h3>Typography</h3>
                              <p>Fonts: ${selectedTemplate.fonts.join(', ')}</p>
                              <h3>Dimensions</h3>
                              <p>${selectedTemplate.dimensions.width} x ${selectedTemplate.dimensions.height}px</p>
                              <div class="meta">
                                <p>Category: ${selectedTemplate.category.replace('_', ' ')}</p>
                                <p>Created by: ${selectedTemplate.createdBy}</p>
                                <p>Updated: ${selectedTemplate.updatedAt}</p>
                              </div>
                            </div>
                          </div>
                        </body>
                        </html>
                      `
                      const blob = new Blob([previewHtml], { type: 'text/html' })
                      const url = URL.createObjectURL(blob)
                      window.open(url, '_blank', 'width=900,height=700')
                      toast.success('Opening full preview...')
                    }}
                  >
                    <Eye className="w-3 h-3" />
                    Full Preview
                  </Button>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold">{selectedTemplate.usageCount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Uses</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold">{selectedTemplate.downloads.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Downloads</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-1 text-yellow-500">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="text-2xl font-bold">{selectedTemplate.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-sm text-gray-500">{selectedTemplate.reviewsCount} reviews</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-lg font-bold">{formatDimensions(selectedTemplate.dimensions)}</p>
                    <p className="text-sm text-gray-500">Dimensions</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400">{selectedTemplate.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="gap-1">
                      <Tag className="w-3 h-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Colors */}
                <div>
                  <p className="text-sm font-medium mb-2">Colors Used</p>
                  <div className="flex gap-2">
                    {selectedTemplate.colors.map((color) => (
                      <div
                        key={color}
                        className="w-8 h-8 rounded-lg border-2 border-gray-200"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Fonts */}
                <div>
                  <p className="text-sm font-medium mb-2">Fonts</p>
                  <div className="flex gap-2">
                    {selectedTemplate.fonts.map((font) => (
                      <Badge key={font} variant="outline">{font}</Badge>
                    ))}
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span>Created by {selectedTemplate.createdBy}</span>
                  <span>Updated {selectedTemplate.updatedAt}</span>
                  <Badge className={getAccessColor(selectedTemplate.accessLevel)} variant="outline">
                    {selectedTemplate.accessLevel === 'public' && <Globe className="w-3 h-3 mr-1" />}
                    {selectedTemplate.accessLevel === 'team' && <Users className="w-3 h-3 mr-1" />}
                    {selectedTemplate.accessLevel === 'private' && <Lock className="w-3 h-3 mr-1" />}
                    {selectedTemplate.accessLevel}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4">
                  <Button
                    className="gap-2 flex-1"
                    onClick={() => handleUseTemplate(selectedTemplate)}
                  >
                    <Edit className="w-4 h-4" />
                    Use This Template
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => handleDuplicateTemplate(selectedTemplate)}
                    disabled={isCreating}
                  >
                    <Copy className="w-4 h-4" />
                    {isCreating ? 'Duplicating...' : 'Duplicate'}
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => handleDownloadTemplate(selectedTemplate)}
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    className={selectedTemplate.isFavorite ? 'text-pink-600' : ''}
                    onClick={() => handleFavoriteTemplate(selectedTemplate)}
                  >
                    <Heart className={"w-4 h-4 " + (selectedTemplate.isFavorite ? "fill-current" : "")} />
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2 text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteTemplate(selectedTemplate)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-4 h-4" />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Template Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Plus className="w-5 h-5 text-violet-600" />
                Create New Template
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <div>
                <label className="block text-sm font-medium mb-2">Template Name *</label>
                <Input
                  placeholder="Enter template name..."
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Input
                  placeholder="Enter template description..."
                  value={newTemplateDescription}
                  onChange={(e) => setNewTemplateDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={newTemplateCategory}
                  onChange={(e) => setNewTemplateCategory(e.target.value as TemplateCategory)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800"
                >
                  <option value="social_media">Social Media</option>
                  <option value="presentation">Presentations</option>
                  <option value="document">Documents</option>
                  <option value="video">Video</option>
                  <option value="print">Print</option>
                  <option value="email">Email</option>
                  <option value="marketing">Marketing</option>
                  <option value="infographic">Infographics</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsCreateDialogOpen(false)
                    setNewTemplateName('')
                    setNewTemplateDescription('')
                    setNewTemplateCategory('social_media')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                  onClick={handleCreateTemplate}
                  disabled={isCreating || !newTemplateName.trim()}
                >
                  <Plus className="w-4 h-4" />
                  {isCreating ? 'Creating...' : 'Create Template'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* AI Generate Dialog */}
        <Dialog open={isAIGenerateOpen} onOpenChange={setIsAIGenerateOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-500" />
                AI Template Generator
              </DialogTitle>
              <DialogDescription>
                Describe your template and let AI create it for you
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-2">What kind of template do you need?</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 min-h-[100px]"
                  placeholder="e.g., A professional invoice template for a web design agency with modern styling..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Style Preference</label>
                <select className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800">
                  <option value="modern">Modern & Clean</option>
                  <option value="professional">Professional</option>
                  <option value="creative">Creative & Bold</option>
                  <option value="minimal">Minimal</option>
                  <option value="corporate">Corporate</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setIsAIGenerateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                  onClick={() => {
                    if (!aiPrompt.trim()) {
                      toast.error('Please describe your template')
                      return
                    }
                    toast.promise(
                      fetch('/api/templates', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'ai_generate', prompt: aiPrompt })
                      }).then(res => {
                        if (!res.ok) throw new Error('Failed to generate')
                        return res.json()
                      }),
                      {
                        loading: 'Generating template with AI...',
                        success: () => {
                          setIsAIGenerateOpen(false)
                          setAiPrompt('')
                          return 'Template generated successfully!'
                        },
                        error: 'Failed to generate template'
                      }
                    )
                  }}
                  disabled={!aiPrompt.trim()}
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Import Dialog */}
        <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-green-500" />
                Import Template
              </DialogTitle>
              <DialogDescription>
                Upload a template file to import
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors"
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = '.json,.html,.psd,.ai,.sketch,.fig'
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = async (event) => {
                        try {
                          const content = event.target?.result as string
                          const templates = file.name.endsWith('.json') ? JSON.parse(content) : [{ name: file.name, content }]
                          toast.promise(
                            fetch('/api/templates', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ action: 'import', templates: Array.isArray(templates) ? templates : [templates] })
                            }).then(res => {
                              if (!res.ok) throw new Error('Import failed')
                              return res.json()
                            }),
                            {
                              loading: `Importing ${file.name}...`,
                              success: () => {
                                setIsImportOpen(false)
                                return `Template "${file.name}" imported successfully!`
                              },
                              error: 'Failed to import template'
                            }
                          )
                        } catch {
                          toast.error('Failed to parse template file')
                        }
                      }
                      reader.readAsText(file)
                    }
                  }
                  input.click()
                }}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">JSON, HTML, PSD, AI, Sketch, Figma</p>
              </div>
              <div className="text-center text-sm text-gray-500">
                Or import from URL
              </div>
              <Input placeholder="https://example.com/template.json" />
              <div className="flex items-center gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsImportOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                  onClick={async () => {
                    const urlInput = document.querySelector('input[placeholder*="example.com"]') as HTMLInputElement
                    const url = urlInput?.value
                    if (!url) {
                      toast.error('Please enter a URL')
                      return
                    }
                    toast.promise(
                      fetch('/api/templates', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'import_url', url })
                      }).then(res => {
                        if (!res.ok) throw new Error('Import failed')
                        return res.json()
                      }),
                      {
                        loading: 'Fetching template from URL...',
                        success: () => {
                          setIsImportOpen(false)
                          return 'Template imported successfully!'
                        },
                        error: 'Failed to import from URL'
                      }
                    )
                  }}
                >
                  Import from URL
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-cyan-500" />
                Export Templates
              </DialogTitle>
              <DialogDescription>
                Export your templates in various formats
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                {[
                  { format: 'JSON', desc: 'Full data export', icon: FileText },
                  { format: 'HTML', desc: 'Web-ready', icon: Globe },
                  { format: 'PDF', desc: 'Print-ready', icon: FileText },
                  { format: 'ZIP', desc: 'All assets', icon: Package }
                ].map(({ format, desc, icon: Icon }) => (
                  <button
                    key={format}
                    className="p-4 border rounded-lg hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-950/20 transition-colors text-left"
                    onClick={() => {
                      toast.promise(
                        fetch('/api/templates', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ action: 'export_format', format: format.toLowerCase() })
                        }).then(async res => {
                          if (!res.ok) throw new Error('Export failed')
                          const data = await res.json()
                          // Trigger download
                          const blob = new Blob([data.content], { type: format === 'JSON' ? 'application/json' : 'text/plain' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `templates-export.${format.toLowerCase()}`
                          a.click()
                          URL.revokeObjectURL(url)
                          return data
                        }),
                        {
                          loading: `Exporting as ${format}...`,
                          success: () => {
                            setIsExportOpen(false)
                            return `Templates exported as ${format}!`
                          },
                          error: 'Export failed'
                        }
                      )
                    }}
                  >
                    <Icon className="w-6 h-6 mb-2 text-cyan-500" />
                    <p className="font-medium">{format}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </button>
                ))}
              </div>
              <div className="pt-2">
                <Button variant="outline" className="w-full" onClick={() => setIsExportOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Quick Action: New Template Dialog */}
        <Dialog open={showNewTemplateQuickDialog} onOpenChange={setShowNewTemplateQuickDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-violet-500" />
                Create New Template
              </DialogTitle>
              <DialogDescription>
                Choose how you want to create your new template
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                <button
                  className="p-4 border rounded-lg hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-colors text-left"
                  onClick={() => {
                    setShowNewTemplateQuickDialog(false)
                    setIsCreateDialogOpen(true)
                  }}
                >
                  <FileText className="w-6 h-6 mb-2 text-violet-500" />
                  <p className="font-medium">Blank Template</p>
                  <p className="text-xs text-gray-500">Start from scratch</p>
                </button>
                <button
                  className="p-4 border rounded-lg hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors text-left"
                  onClick={() => {
                    setShowNewTemplateQuickDialog(false)
                    setIsAIGenerateOpen(true)
                  }}
                >
                  <Wand2 className="w-6 h-6 mb-2 text-purple-500" />
                  <p className="font-medium">AI Generate</p>
                  <p className="text-xs text-gray-500">Let AI create for you</p>
                </button>
                <button
                  className="p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors text-left"
                  onClick={() => {
                    setShowNewTemplateQuickDialog(false)
                    setActiveTab('gallery')
                  }}
                >
                  <Copy className="w-6 h-6 mb-2 text-blue-500" />
                  <p className="font-medium">From Gallery</p>
                  <p className="text-xs text-gray-500">Duplicate existing</p>
                </button>
                <button
                  className="p-4 border rounded-lg hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors text-left"
                  onClick={() => {
                    setShowNewTemplateQuickDialog(false)
                    setIsImportOpen(true)
                  }}
                >
                  <Upload className="w-6 h-6 mb-2 text-green-500" />
                  <p className="font-medium">Import File</p>
                  <p className="text-xs text-gray-500">Upload template</p>
                </button>
              </div>
              <Button variant="outline" className="w-full" onClick={() => setShowNewTemplateQuickDialog(false)}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Quick Action: Browse Gallery Dialog */}
        <Dialog open={showBrowseGalleryDialog} onOpenChange={setShowBrowseGalleryDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Grid3X3 className="w-5 h-5 text-blue-500" />
                Browse Template Gallery
              </DialogTitle>
              <DialogDescription>
                Filter templates by category to find what you need
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                {[
                  { cat: 'social_media', label: 'Social Media', icon: Instagram, color: 'pink' },
                  { cat: 'presentation', label: 'Presentations', icon: Presentation, color: 'blue' },
                  { cat: 'document', label: 'Documents', icon: FileText, color: 'green' },
                  { cat: 'video', label: 'Video', icon: Video, color: 'red' },
                  { cat: 'print', label: 'Print', icon: Printer, color: 'orange' },
                  { cat: 'email', label: 'Email', icon: Mail, color: 'purple' },
                ].map(({ cat, label, icon: Icon, color }) => (
                  <button
                    key={cat}
                    className={`p-4 border rounded-lg hover:border-${color}-500 hover:bg-${color}-50 dark:hover:bg-${color}-950/20 transition-colors text-left`}
                    onClick={() => {
                      setShowBrowseGalleryDialog(false)
                      setCategoryFilter(cat as TemplateCategory)
                      setActiveTab('gallery')
                    }}
                  >
                    <Icon className={`w-6 h-6 mb-2 text-${color}-500`} />
                    <p className="font-medium">{label}</p>
                  </button>
                ))}
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  setShowBrowseGalleryDialog(false)
                  setCategoryFilter('all')
                  setActiveTab('gallery')
                }}
              >
                View All Templates
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setShowBrowseGalleryDialog(false)}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Quick Action: Export Assets Dialog */}
        <Dialog open={showExportAssetsDialog} onOpenChange={setShowExportAssetsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-cyan-500" />
                Export Template Assets
              </DialogTitle>
              <DialogDescription>
                Choose what assets to export from your templates
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <input type="checkbox" id="export-templates" className="w-4 h-4" defaultChecked />
                  <div>
                    <p className="font-medium">Template Files</p>
                    <p className="text-xs text-gray-500">JSON template definitions</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <input type="checkbox" id="export-media" className="w-4 h-4" defaultChecked />
                  <div>
                    <p className="font-medium">Images & Media</p>
                    <p className="text-xs text-gray-500">Thumbnails and assets</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <input type="checkbox" id="export-brand" className="w-4 h-4" />
                  <div>
                    <p className="font-medium">Brand Assets</p>
                    <p className="text-xs text-gray-500">Logos, colors, fonts</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <input type="checkbox" id="export-analytics" className="w-4 h-4" />
                  <div>
                    <p className="font-medium">Usage Analytics</p>
                    <p className="text-xs text-gray-500">Template statistics</p>
                  </div>
                </label>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowExportAssetsDialog(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 gap-2 bg-cyan-600 hover:bg-cyan-700"
                  onClick={() => {
                    // Collect checked options
                    const includeTemplates = (document.getElementById('export-templates') as HTMLInputElement)?.checked
                    const includeMedia = (document.getElementById('export-media') as HTMLInputElement)?.checked
                    const includeBrand = (document.getElementById('export-brand') as HTMLInputElement)?.checked
                    const includeAnalytics = (document.getElementById('export-analytics') as HTMLInputElement)?.checked

                    // Build export data
                    const exportData: Record<string, unknown> = {
                      exportDate: new Date().toISOString(),
                      version: '1.0'
                    }

                    if (includeTemplates) {
                      exportData.templates = allTemplates.map(t => ({
                        id: t.id,
                        name: t.name,
                        description: t.description,
                        category: t.category,
                        status: t.status,
                        accessLevel: t.accessLevel,
                        size: t.size,
                        dimensions: t.dimensions,
                        tags: t.tags,
                        colors: t.colors,
                        fonts: t.fonts,
                        createdAt: t.createdAt,
                        updatedAt: t.updatedAt
                      }))
                    }

                    if (includeMedia) {
                      exportData.media = allTemplates.map(t => ({
                        templateId: t.id,
                        templateName: t.name,
                        thumbnail: t.thumbnail
                      }))
                    }

                    if (includeBrand) {
                      exportData.brandAssets = mockBrandAssets
                    }

                    if (includeAnalytics) {
                      exportData.analytics = {
                        stats,
                        templateUsage: allTemplates.map(t => ({
                          id: t.id,
                          name: t.name,
                          usageCount: t.usageCount,
                          downloads: t.downloads,
                          rating: t.rating,
                          reviewsCount: t.reviewsCount
                        }))
                      }
                    }

                    // Generate and download file
                    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `template-assets-${new Date().toISOString().split('T')[0]}.json`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)

                    setShowExportAssetsDialog(false)
                    toast.success('Assets exported successfully')
                  }}
                >
                  <Download className="w-4 h-4" />
                  Export Assets
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
