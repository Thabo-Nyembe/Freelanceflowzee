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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Plus,
  Star,
  Clock,
  DollarSign,
  Users,
  Palette,
  Code,
  Smartphone,
  Video,
  Layers,
  Search,
  Filter,
  Upload,
  Copy,
  Eye,
  MoreHorizontal,
  TrendingUp,
  Target,
  Zap,
  Award,
  Download,
  Settings,
  CheckCircle,
  Trash2,
  Edit2,
  X,
  AlertTriangle,
  FileUp
} from 'lucide-react'

// A+++ UTILITIES
import { CardSkeleton, DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'

// Template type definition
interface ProjectTemplate {
  id: number
  name: string
  description: string
  category: string
  type: string
  duration: string
  price: string
  complexity: string
  rating: number
  usageCount: number
  thumbnail: string
  tags: string[]
  features: string[]
  deliverables: string[]
  isPopular: boolean
  isFeatured: boolean
}


// ============================================================================
// V2 COMPETITIVE MOCK DATA - ProjectTemplates Context
// ============================================================================

const projectTemplatesAIInsights = [
  { id: '1', type: 'info' as const, title: 'Performance Update', description: 'System running optimally with 99.9% uptime this month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'success' as const, title: 'Goal Achievement', description: 'Monthly targets exceeded by 15%. Great progress!', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Goals' },
  { id: '3', type: 'warning' as const, title: 'Action Required', description: 'Review pending items to maintain workflow efficiency.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Tasks' },
]

const projectTemplatesCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Manager', lastActive: 'Now' },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, role: 'Developer', lastActive: '5m ago' },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, role: 'Designer', lastActive: '30m ago' },
]

const projectTemplatesPredictions = [
  { id: '1', label: 'Completion Rate', current: 85, target: 95, predicted: 92, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Efficiency Score', current: 78, target: 90, predicted: 86, confidence: 82, trend: 'up' as const },
]

const projectTemplatesActivities = [
  { id: '1', user: 'Alexandra Chen', action: 'updated', target: 'system settings', timestamp: '5m ago', type: 'info' as const },
  { id: '2', user: 'Marcus Johnson', action: 'completed', target: 'task review', timestamp: '15m ago', type: 'success' as const },
  { id: '3', user: 'System', action: 'generated', target: 'weekly report', timestamp: '1h ago', type: 'info' as const },
]

// Quick actions will be defined inside the component to access dialog state setters

export default function ProjectTemplatesClient() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()

  // Dialog states for quick actions
  const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)

  // Additional dialog states
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showFiltersDialog, setShowFiltersDialog] = useState(false)
  const [showTemplateActionsMenu, setShowTemplateActionsMenu] = useState<number | null>(null)

  // Selected template for operations
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null)

  // New template form state
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateDescription, setNewTemplateDescription] = useState('')
  const [newTemplateCategory, setNewTemplateCategory] = useState('branding')
  const [newTemplateType, setNewTemplateType] = useState('standard')
  const [newTemplateDuration, setNewTemplateDuration] = useState('')
  const [newTemplatePrice, setNewTemplatePrice] = useState('')
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false)

  // Export form state
  const [exportFormat, setExportFormat] = useState('json')
  const [exportScope, setExportScope] = useState('all')
  const [includeAssets, setIncludeAssets] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  // Settings form state
  const [defaultCategory, setDefaultCategory] = useState('all')
  const [autoSave, setAutoSave] = useState(true)
  const [notifyOnUse, setNotifyOnUse] = useState(true)
  const [templateVisibility, setTemplateVisibility] = useState('public')
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  // Import form state
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importFormat, setImportFormat] = useState('json')
  const [isImporting, setIsImporting] = useState(false)

  // Duplicate form state
  const [duplicateName, setDuplicateName] = useState('')
  const [isDuplicating, setIsDuplicating] = useState(false)

  // Delete state
  const [isDeleting, setIsDeleting] = useState(false)

  // Filters state
  const [filterComplexity, setFilterComplexity] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [filterRating, setFilterRating] = useState('all')
  const [filterPriceRange, setFilterPriceRange] = useState('all')

  // Using template state
  const [isUsingTemplate, setIsUsingTemplate] = useState(false)

  // Quick actions with dialog openers
  const projectTemplatesQuickActions = [
    { id: '1', label: 'New Item', icon: 'Plus', shortcut: 'N', action: () => setShowNewTemplateDialog(true) },
    { id: '2', label: 'Export', icon: 'Download', shortcut: 'E', action: () => setShowExportDialog(true) },
    { id: '3', label: 'Settings', icon: 'Settings', shortcut: 'S', action: () => setShowSettingsDialog(true) },
  ]

  // Handler functions
  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) {
      toast.error('Please enter a template name')
      return
    }

    setIsCreatingTemplate(true)
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          name: newTemplateName,
          description: newTemplateDescription,
          category: newTemplateCategory,
          type: newTemplateType,
          duration: newTemplateDuration,
          price: newTemplatePrice
        })
      })
      if (!res.ok) throw new Error('Failed to create template')

      toast.success(`Template "${newTemplateName}" created successfully`)
      setShowNewTemplateDialog(false)
      // Reset form
      setNewTemplateName('')
      setNewTemplateDescription('')
      setNewTemplateCategory('branding')
      setNewTemplateType('standard')
      setNewTemplateDuration('')
      setNewTemplatePrice('')
    } catch (err) {
      toast.error('Failed to create template')
    } finally {
      setIsCreatingTemplate(false)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const res = await fetch(`/api/templates?action=export&format=${exportFormat}&scope=${exportScope}`)
      if (!res.ok) throw new Error('Export failed')

      if (exportFormat === 'csv') {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `templates-export-${Date.now()}.csv`
        a.click()
        URL.revokeObjectURL(url)
      }

      const scopeText = exportScope === 'all' ? 'All templates' : 'Selected templates'
      toast.success(`${scopeText} exported as ${exportFormat.toUpperCase()}`)
      setShowExportDialog(false)
    } catch (err) {
      toast.error('Failed to export templates')
    } finally {
      setIsExporting(false)
    }
  }

  const handleSaveSettings = async () => {
    setIsSavingSettings(true)
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_settings',
          settings: {
            defaultCategory,
            autoSave,
            notifyOnUse,
            visibility: templateVisibility
          }
        })
      })
      if (!res.ok) throw new Error('Failed to save settings')

      toast.success('Template settings saved successfully')
      setShowSettingsDialog(false)
    } catch (err) {
      toast.error('Failed to save settings')
    } finally {
      setIsSavingSettings(false)
    }
  }

  // Import template handler
  const handleImport = async () => {
    if (!importFile) {
      toast.error('Please select a file to import')
      return
    }

    setIsImporting(true)
    try {
      const fileText = await importFile.text()
      let templates: any[]

      if (importFormat === 'json') {
        templates = JSON.parse(fileText)
      } else {
        // Parse CSV
        const rows = fileText.trim().split('\n')
        const headers = rows[0].split(',')
        templates = rows.slice(1).map(row => {
          const values = row.split(',')
          return headers.reduce((obj, header, i) => {
            obj[header.trim()] = values[i]?.trim()
            return obj
          }, {} as any)
        })
      }

      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'import', templates, format: importFormat })
      })
      if (!res.ok) throw new Error('Import failed')
      const data = await res.json()

      toast.success(`Successfully imported ${data.imported || 0} templates from ${importFile.name}`)
      setShowImportDialog(false)
      setImportFile(null)
    } catch (err) {
      toast.error('Failed to import templates')
    } finally {
      setIsImporting(false)
    }
  }

  // Use template handler
  const handleUseTemplate = async (template: ProjectTemplate) => {
    setIsUsingTemplate(true)
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'use_template',
          templateId: template.id,
          projectName: template.name
        })
      })
      if (!res.ok) throw new Error('Failed to create project')

      toast.success(`Project created from "${template.name}" template`, {
        description: 'Redirecting to project dashboard...',
      })
    } catch (err) {
      toast.error('Failed to create project from template')
    } finally {
      setIsUsingTemplate(false)
    }
  }

  // Preview template handler
  const handlePreviewTemplate = (template: ProjectTemplate) => {
    setSelectedTemplate(template)
    setShowPreviewDialog(true)
  }

  // Duplicate template handler
  const handleOpenDuplicateDialog = (template: ProjectTemplate) => {
    setSelectedTemplate(template)
    setDuplicateName(`${template.name} (Copy)`)
    setShowDuplicateDialog(true)
  }

  const handleDuplicateTemplate = async () => {
    if (!duplicateName.trim()) {
      toast.error('Please enter a name for the duplicate')
      return
    }

    setIsDuplicating(true)
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'duplicate',
          templateId: selectedTemplate?.id,
          newName: duplicateName
        })
      })
      if (!res.ok) throw new Error('Duplication failed')

      toast.success(`Template duplicated as "${duplicateName}"`)
      setShowDuplicateDialog(false)
      setDuplicateName('')
      setSelectedTemplate(null)
    } catch (err) {
      toast.error('Failed to duplicate template')
    } finally {
      setIsDuplicating(false)
    }
  }

  // Delete template handler
  const handleOpenDeleteDialog = (template: ProjectTemplate) => {
    setSelectedTemplate(template)
    setShowDeleteDialog(true)
  }

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return

    setIsDeleting(true)
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          id: selectedTemplate.id
        })
      })
      if (!res.ok) throw new Error('Delete failed')

      toast.success(`Template "${selectedTemplate.name}" deleted successfully`)
      setShowDeleteDialog(false)
      setSelectedTemplate(null)
    } catch (err) {
      toast.error('Failed to delete template')
    } finally {
      setIsDeleting(false)
    }
  }

  // Apply filters handler
  const handleApplyFilters = () => {
    toast.success('Filters applied successfully')
    setShowFiltersDialog(false)
  }

  // Reset filters handler
  const handleResetFilters = () => {
    setFilterComplexity('all')
    setFilterType('all')
    setFilterRating('all')
    setFilterPriceRange('all')
    toast.info('Filters reset to default')
  }

  // Browse category handler
  const handleBrowseCategory = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setActiveTab('templates')
    toast.success(`Showing ${categoryId === 'all' ? 'all' : categoryId} templates`)
  }

  // Template menu actions
  const handleTemplateAction = (action: string, template: ProjectTemplate) => {
    setShowTemplateActionsMenu(null)
    switch (action) {
      case 'preview':
        handlePreviewTemplate(template)
        break
      case 'duplicate':
        handleOpenDuplicateDialog(template)
        break
      case 'edit':
        setSelectedTemplate(template)
        setNewTemplateName(template.name)
        setNewTemplateDescription(template.description)
        setNewTemplateCategory(template.category)
        setNewTemplateType(template.type)
        setNewTemplateDuration(template.duration)
        setNewTemplatePrice(template.price)
        setShowNewTemplateDialog(true)
        break
      case 'delete':
        handleOpenDeleteDialog(template)
        break
      default:
        break
    }
  }

  // A+++ LOAD PROJECT TEMPLATES DATA
  useEffect(() => {
    const loadProjectTemplatesData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch templates from API
        const res = await fetch('/api/templates?action=list')
        if (!res.ok) throw new Error('Failed to load templates')

        setIsLoading(false)
        announce('Project templates loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project templates')
        setIsLoading(false)
        announce('Error loading project templates', 'assertive')
      }
    }

    loadProjectTemplatesData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const [activeTab, setActiveTab] = useState('templates')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const projectTemplates: ProjectTemplate[] = [
    {
      id: 1,
      name: 'Complete Brand Identity Package',
      description: 'Full branding solution including logo, color palette, typography, and brand guidelines',
      category: 'branding',
      type: 'premium',
      duration: '4-6 weeks',
      price: '$2,500 - $5,000',
      complexity: 'advanced',
      rating: 4.9,
      usageCount: 156,
      thumbnail: '/templates/brand-identity.jpg',
      tags: ['Logo Design', 'Brand Guidelines', 'Color Palette', 'Typography'],
      features: [
        'Logo design (3 concepts)',
        'Color palette development',
        'Typography selection',
        'Brand guidelines document',
        'Business card design',
        'Letterhead design',
        'Social media templates'
      ],
      deliverables: [
        'Logo files (AI, EPS, PNG, SVG)',
        'Brand guidelines PDF',
        'Color palette swatches',
        'Typography guide',
        'Business stationery designs'
      ],
      isPopular: true,
      isFeatured: true
    },
    {
      id: 2,
      name: 'E-commerce Website Development',
      description: 'Complete e-commerce solution with payment integration and admin dashboard',
      category: 'web-development',
      type: 'premium',
      duration: '8-12 weeks',
      price: '$5,000 - $15,000',
      complexity: 'advanced',
      rating: 4.8,
      usageCount: 89,
      thumbnail: '/templates/ecommerce-website.jpg',
      tags: ['React', 'Next.js', 'Stripe', 'Database', 'Admin Dashboard'],
      features: [
        'Responsive web design',
        'Product catalog',
        'Shopping cart functionality',
        'Payment gateway integration',
        'User authentication',
        'Admin dashboard',
        'Order management system'
      ],
      deliverables: [
        'Complete website code',
        'Admin dashboard',
        'Database schema',
        'API documentation',
        'Deployment guide'
      ],
      isPopular: true,
      isFeatured: false
    },
    {
      id: 3,
      name: 'Mobile App UI/UX Design',
      description: 'Complete mobile app design with user research, wireframes, and high-fidelity prototypes',
      category: 'mobile-design',
      type: 'standard',
      duration: '3-5 weeks',
      price: '$1,500 - $3,500',
      complexity: 'moderate',
      rating: 4.7,
      usageCount: 134,
      thumbnail: '/templates/mobile-app-design.jpg',
      tags: ['UI Design', 'UX Research', 'Prototyping', 'User Testing'],
      features: [
        'User research and personas',
        'Information architecture',
        'Wireframe creation',
        'High-fidelity mockups',
        'Interactive prototypes',
        'Design system',
        'Usability testing'
      ],
      deliverables: [
        'Figma design files',
        'Interactive prototype',
        'Design system guide',
        'User research report',
        'Usability test results'
      ],
      isPopular: true,
      isFeatured: true
    },
    {
      id: 4,
      name: 'Social Media Marketing Campaign',
      description: 'Comprehensive social media strategy with content creation and performance tracking',
      category: 'marketing',
      type: 'standard',
      duration: '2-4 weeks',
      price: '$800 - $2,000',
      complexity: 'simple',
      rating: 4.6,
      usageCount: 203,
      thumbnail: '/templates/social-media-campaign.jpg',
      tags: ['Content Strategy', 'Social Media', 'Analytics', 'Copywriting'],
      features: [
        'Social media audit',
        'Content strategy development',
        'Visual content creation',
        'Copywriting for posts',
        'Hashtag research',
        'Performance tracking',
        'Monthly reporting'
      ],
      deliverables: [
        'Social media strategy document',
        'Content calendar',
        'Visual assets package',
        'Performance reports',
        'Optimization recommendations'
      ],
      isPopular: false,
      isFeatured: false
    },
    {
      id: 5,
      name: 'Video Production Package',
      description: 'Professional video production from concept to final delivery with motion graphics',
      category: 'video-production',
      type: 'premium',
      duration: '6-8 weeks',
      price: '$3,000 - $8,000',
      complexity: 'advanced',
      rating: 4.9,
      usageCount: 67,
      thumbnail: '/templates/video-production.jpg',
      tags: ['Video Editing', 'Motion Graphics', 'Sound Design', 'Color Grading'],
      features: [
        'Concept development',
        'Storyboard creation',
        'Video filming/editing',
        'Motion graphics',
        'Sound design',
        'Color grading',
        'Multiple format delivery'
      ],
      deliverables: [
        'Final video files (multiple formats)',
        'Raw footage access',
        'Motion graphics files',
        'Audio tracks',
        'Project files'
      ],
      isPopular: false,
      isFeatured: true
    },
    {
      id: 6,
      name: 'SEO Optimization Package',
      description: 'Complete SEO audit and optimization with keyword research and content strategy',
      category: 'seo',
      type: 'standard',
      duration: '4-6 weeks',
      price: '$1,200 - $3,000',
      complexity: 'moderate',
      rating: 4.5,
      usageCount: 178,
      thumbnail: '/templates/seo-optimization.jpg',
      tags: ['SEO', 'Keyword Research', 'Content Strategy', 'Analytics'],
      features: [
        'Comprehensive SEO audit',
        'Keyword research',
        'On-page optimization',
        'Technical SEO fixes',
        'Content strategy',
        'Link building plan',
        'Performance monitoring'
      ],
      deliverables: [
        'SEO audit report',
        'Keyword research document',
        'Optimization checklist',
        'Content strategy guide',
        'Monthly progress reports'
      ],
      isPopular: true,
      isFeatured: false
    }
  ]

  const templateStats = {
    totalTemplates: 45,
    totalUsage: 1247,
    avgRating: 4.7,
    activeProjects: 89
  }

  const categories = [
    { id: 'all', name: 'All Templates', icon: FileText, count: 45 },
    { id: 'branding', name: 'Branding', icon: Palette, count: 12 },
    { id: 'web-development', name: 'Web Development', icon: Code, count: 8 },
    { id: 'mobile-design', name: 'Mobile Design', icon: Smartphone, count: 6 },
    { id: 'marketing', name: 'Marketing', icon: TrendingUp, count: 9 },
    { id: 'video-production', name: 'Video Production', icon: Video, count: 5 },
    { id: 'seo', name: 'SEO', icon: Target, count: 5 }
  ]

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800'
      case 'moderate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'premium': return 'bg-purple-100 text-purple-800'
      case 'standard': return 'bg-blue-100 text-blue-800'
      case 'basic': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredTemplates = projectTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-4 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-4 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
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
          <AIInsightsPanel insights={projectTemplatesAIInsights} />
          <PredictiveAnalytics predictions={projectTemplatesPredictions} />
          <CollaborationIndicator collaborators={projectTemplatesCollaborators} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <QuickActionsToolbar actions={projectTemplatesQuickActions} />
          <ActivityFeed activities={projectTemplatesActivities} />
        </div>
{/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Project Templates
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                Pre-built project templates to accelerate your workflow
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              onClick={() => setShowNewTemplateDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
            <Button variant="outline" onClick={() => setShowImportDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/40 dark:border-gray-700/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Templates</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{templateStats.totalTemplates}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">+5 this month</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/40 dark:border-gray-700/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Usage</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{templateStats.totalUsage}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">+12% this month</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/40 dark:border-gray-700/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Avg Rating</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{templateStats.avgRating}</p>
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Projects</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{templateStats.activeProjects}</p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">From templates</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                  <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/30 dark:border-gray-700/30">
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="my-templates" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              My Templates
            </TabsTrigger>
          </TabsList>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/40 dark:border-gray-700/40 shadow-lg hover:shadow-xl transition-all duration-200 group">
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-t-lg flex items-center justify-center">
                      <FileText className="h-12 w-12 text-gray-400 dark:text-gray-300" />
                    </div>
                    <div className="absolute top-4 left-4 flex gap-2">
                      {template.isFeatured && (
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      {template.isPopular && (
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <div className="absolute top-4 right-4 relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
                        onClick={() => setShowTemplateActionsMenu(showTemplateActionsMenu === template.id ? null : template.id)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      {showTemplateActionsMenu === template.id && (
                        <div className="absolute right-0 top-10 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                          <button
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            onClick={() => handleTemplateAction('preview', template)}
                          >
                            <Eye className="h-4 w-4" />
                            Preview
                          </button>
                          <button
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            onClick={() => handleTemplateAction('edit', template)}
                          >
                            <Edit2 className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            onClick={() => handleTemplateAction('duplicate', template)}
                          >
                            <Copy className="h-4 w-4" />
                            Duplicate
                          </button>
                          <hr className="my-2 border-gray-200 dark:border-gray-700" />
                          <button
                            className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 flex items-center gap-2"
                            onClick={() => handleTemplateAction('delete', template)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2 dark:text-gray-100">{template.name}</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{template.description}</p>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={getTypeColor(template.type)}>
                            {template.type}
                          </Badge>
                          <Badge className={getComplexityColor(template.complexity)}>
                            {template.complexity}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span>{template.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span>{template.price}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{template.rating}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span>{template.usageCount} uses</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.tags.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <Button
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        onClick={() => handleUseTemplate(template)}
                        disabled={isUsingTemplate}
                      >
                        {isUsingTemplate ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-1" />
                        ) : (
                          <Plus className="h-3 w-3 mr-1" />
                        )}
                        Use Template
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreviewTemplate(template)}
                        title="Preview template"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDuplicateDialog(template)}
                        title="Duplicate template"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.slice(1).map((category) => {
                const Icon = category.icon
                return (
                  <Card key={category.id} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/40 dark:border-gray-700/40 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-xl inline-block mb-4">
                        <Icon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{category.name}</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">{category.count} templates available</p>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleBrowseCategory(category.id)}
                      >
                        Browse Templates
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* My Templates Tab */}
          <TabsContent value="my-templates" className="space-y-6">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/40 dark:border-gray-700/40 shadow-lg">
              <CardContent className="p-12 text-center">
                <Award className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Create Your First Template</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Turn your successful projects into reusable templates to accelerate future work and maintain consistency.
                </p>
                <Button
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  onClick={() => setShowNewTemplateDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* New Template Dialog */}
      <Dialog open={showNewTemplateDialog} onOpenChange={setShowNewTemplateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-purple-600" />
              Create New Template
            </DialogTitle>
            <DialogDescription>
              Create a reusable project template to accelerate future workflows
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="templateName">Template Name *</Label>
                <Input
                  id="templateName"
                  placeholder="e.g., Brand Identity Package"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="templateCategory">Category</Label>
                <select
                  id="templateCategory"
                  value={newTemplateCategory}
                  onChange={(e) => setNewTemplateCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="branding">Branding</option>
                  <option value="web-development">Web Development</option>
                  <option value="mobile-design">Mobile Design</option>
                  <option value="marketing">Marketing</option>
                  <option value="video-production">Video Production</option>
                  <option value="seo">SEO</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="templateDescription">Description</Label>
              <Textarea
                id="templateDescription"
                placeholder="Describe what this template includes and when to use it..."
                value={newTemplateDescription}
                onChange={(e) => setNewTemplateDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="templateType">Type</Label>
                <select
                  id="templateType"
                  value={newTemplateType}
                  onChange={(e) => setNewTemplateType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="templateDuration">Estimated Duration</Label>
                <Input
                  id="templateDuration"
                  placeholder="e.g., 2-4 weeks"
                  value={newTemplateDuration}
                  onChange={(e) => setNewTemplateDuration(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="templatePrice">Price Range</Label>
                <Input
                  id="templatePrice"
                  placeholder="e.g., $1,000 - $3,000"
                  value={newTemplatePrice}
                  onChange={(e) => setNewTemplatePrice(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTemplateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTemplate}
              disabled={isCreatingTemplate}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {isCreatingTemplate ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600" />
              Export Templates
            </DialogTitle>
            <DialogDescription>
              Export your templates for backup or sharing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="exportFormat">Export Format</Label>
              <select
                id="exportFormat"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="xml">XML</option>
                <option value="zip">ZIP (with assets)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exportScope">Export Scope</Label>
              <select
                id="exportScope"
                value={exportScope}
                onChange={(e) => setExportScope(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Templates (45)</option>
                <option value="featured">Featured Only (3)</option>
                <option value="popular">Popular Only (4)</option>
                <option value="my-templates">My Templates (0)</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeAssets"
                checked={includeAssets}
                onChange={(e) => setIncludeAssets(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="includeAssets" className="text-sm cursor-pointer">
                Include associated assets and media files
              </Label>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Estimated export size:</strong> {exportFormat === 'zip' ? '~45 MB' : '~2 MB'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-600" />
              Template Settings
            </DialogTitle>
            <DialogDescription>
              Configure your template preferences and defaults
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="defaultCategory">Default Category</Label>
              <select
                id="defaultCategory"
                value={defaultCategory}
                onChange={(e) => setDefaultCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <option value="all">All Categories</option>
                <option value="branding">Branding</option>
                <option value="web-development">Web Development</option>
                <option value="mobile-design">Mobile Design</option>
                <option value="marketing">Marketing</option>
                <option value="video-production">Video Production</option>
                <option value="seo">SEO</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="templateVisibility">Default Visibility</Label>
              <select
                id="templateVisibility"
                value={templateVisibility}
                onChange={(e) => setTemplateVisibility(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <option value="public">Public - Anyone can see</option>
                <option value="team">Team - Only team members</option>
                <option value="private">Private - Only you</option>
              </select>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Auto-save drafts</Label>
                  <p className="text-xs text-gray-500">Automatically save template changes</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Usage notifications</Label>
                  <p className="text-xs text-gray-500">Notify when templates are used</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyOnUse}
                  onChange={(e) => setNotifyOnUse(e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveSettings}
              disabled={isSavingSettings}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              {isSavingSettings ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileUp className="h-5 w-5 text-green-600" />
              Import Templates
            </DialogTitle>
            <DialogDescription>
              Import templates from a file to add to your collection
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="importFormat">File Format</Label>
              <select
                id="importFormat"
                value={importFormat}
                onChange={(e) => setImportFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="xml">XML</option>
                <option value="zip">ZIP (with assets)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="importFile">Select File</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                <input
                  type="file"
                  id="importFile"
                  accept={`.${importFormat}`}
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor="importFile" className="cursor-pointer">
                  <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {importFile ? importFile.name : 'Click to select a file or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Supported: {importFormat.toUpperCase()} files
                  </p>
                </label>
              </div>
            </div>

            {importFile && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">{importFile.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setImportFile(null)}
                  className="text-green-600 hover:text-green-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={isImporting || !importFile}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-600" />
              Template Preview
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-6 py-4">
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                <FileText className="h-16 w-16 text-gray-400" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Category</Label>
                  <p className="font-medium capitalize">{selectedTemplate.category.replace('-', ' ')}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Type</Label>
                  <Badge className={getTypeColor(selectedTemplate.type)}>{selectedTemplate.type}</Badge>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Duration</Label>
                  <p className="font-medium">{selectedTemplate.duration}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Price Range</Label>
                  <p className="font-medium">{selectedTemplate.price}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Rating</Label>
                  <p className="font-medium flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    {selectedTemplate.rating}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Usage Count</Label>
                  <p className="font-medium">{selectedTemplate.usageCount} projects</p>
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-500 mb-2 block">Description</Label>
                <p className="text-gray-700 dark:text-gray-300">{selectedTemplate.description}</p>
              </div>

              <div>
                <Label className="text-sm text-gray-500 mb-2 block">Features</Label>
                <ul className="space-y-1">
                  {selectedTemplate.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <Label className="text-sm text-gray-500 mb-2 block">Deliverables</Label>
                <ul className="space-y-1">
                  {selectedTemplate.deliverables.map((deliverable, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-blue-500" />
                      {deliverable}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <Label className="text-sm text-gray-500 mb-2 block">Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                if (selectedTemplate) {
                  handleUseTemplate(selectedTemplate)
                  setShowPreviewDialog(false)
                }
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Use This Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicate Dialog */}
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5 text-blue-600" />
              Duplicate Template
            </DialogTitle>
            <DialogDescription>
              Create a copy of &quot;{selectedTemplate?.name}&quot;
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="duplicateName">New Template Name</Label>
              <Input
                id="duplicateName"
                placeholder="Enter name for the duplicate"
                value={duplicateName}
                onChange={(e) => setDuplicateName(e.target.value)}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                The duplicate will include all features, deliverables, and settings from the original template.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDuplicateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDuplicateTemplate}
              disabled={isDuplicating || !duplicateName.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isDuplicating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Duplicating...
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Template
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedTemplate?.name}&quot;?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This action cannot be undone. All template data, including features, deliverables, and usage history will be permanently deleted.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteTemplate}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Template
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filters Dialog */}
      <Dialog open={showFiltersDialog} onOpenChange={setShowFiltersDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-purple-600" />
              Advanced Filters
            </DialogTitle>
            <DialogDescription>
              Refine your template search with additional filters
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="filterComplexity">Complexity Level</Label>
              <select
                id="filterComplexity"
                value={filterComplexity}
                onChange={(e) => setFilterComplexity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Levels</option>
                <option value="simple">Simple</option>
                <option value="moderate">Moderate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterType">Template Type</Label>
              <select
                id="filterType"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Types</option>
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterRating">Minimum Rating</Label>
              <select
                id="filterRating"
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Any Rating</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterPriceRange">Price Range</Label>
              <select
                id="filterPriceRange"
                value={filterPriceRange}
                onChange={(e) => setFilterPriceRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Any Price</option>
                <option value="low">Under $1,000</option>
                <option value="medium">$1,000 - $5,000</option>
                <option value="high">$5,000+</option>
              </select>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button variant="ghost" onClick={handleResetFilters}>
              Reset Filters
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowFiltersDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleApplyFilters}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}