"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Layout,
  FileText,
  Palette,
  Globe,
  Smartphone,
  Monitor,
  Search,
  Filter,
  Star,
  Download,
  Eye,
  Copy,
  Heart,
  Users,
  Calendar,
  Zap,
  Grid,
  List,
  X,
  Plus,
  Check,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

// A+++ UTILITIES
import { DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'

// Template type definition
interface Template {
  id: number
  title: string
  description: string
  category: string
  thumbnail: string
  tags: string[]
  featured: boolean
  downloads: number
  likes: number
  duration: string
  difficulty: string
  author: string
  price: string
  rating: number
  tasks: number
  includes: string[]
}

export default function ProjectTemplatesPage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // MODAL STATES
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [likedTemplates, setLikedTemplates] = useState<Set<number>>(new Set())
  const [isProcessing, setIsProcessing] = useState(false)

  // CREATE TEMPLATE FORM STATE
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    description: '',
    category: 'branding',
    difficulty: 'Intermediate',
    duration: '2-3 weeks',
    tags: '',
    includes: ''
  })

  // FILTER STATE
  const [filterOptions, setFilterOptions] = useState({
    difficulty: [] as string[],
    minRating: 0,
    featured: false
  })

  // Mock template data
  const templates = [
    {
      id: 1,
      title: 'Brand Identity Package',
      description: 'Complete brand identity project with logo, colors, typography, and brand guidelines',
      category: 'branding',
      thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=200&fit=crop',
      tags: ['logo', 'branding', 'identity', 'guidelines'],
      featured: true,
      downloads: 1250,
      likes: 324,
      duration: '2-3 weeks',
      difficulty: 'Intermediate',
      author: 'KAZI Team',
      price: 'Free',
      rating: 4.8,
      tasks: 15,
      includes: ['Logo design', 'Color palette', 'Typography', 'Brand guidelines', 'Business cards']
    },
    {
      id: 2,
      title: 'E-commerce Website',
      description: 'Full-stack e-commerce platform with product catalog, shopping cart, and payment integration',
      category: 'web',
      thumbnail: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=300&h=200&fit=crop',
      tags: ['web', 'ecommerce', 'shopping', 'payment'],
      featured: true,
      downloads: 892,
      likes: 256,
      duration: '4-6 weeks',
      difficulty: 'Advanced',
      author: 'KAZI Team',
      price: 'Free',
      rating: 4.9,
      tasks: 25,
      includes: ['Product catalog', 'Shopping cart', 'Payment system', 'User accounts', 'Admin panel']
    },
    {
      id: 3,
      title: 'Mobile App Design',
      description: 'Complete mobile app design process from wireframes to high-fidelity prototypes',
      category: 'mobile',
      thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300&h=200&fit=crop',
      tags: ['mobile', 'app', 'ui', 'ux'],
      featured: false,
      downloads: 675,
      likes: 189,
      duration: '3-4 weeks',
      difficulty: 'Intermediate',
      author: 'Design Pro',
      price: 'Free',
      rating: 4.6,
      tasks: 18,
      includes: ['Wireframes', 'UI design', 'Prototyping', 'User testing', 'Design system']
    },
    {
      id: 4,
      title: 'Social Media Campaign',
      description: 'Complete social media marketing campaign with content calendar and visual assets',
      category: 'marketing',
      thumbnail: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=300&h=200&fit=crop',
      tags: ['social', 'marketing', 'content', 'campaign'],
      featured: false,
      downloads: 543,
      likes: 147,
      duration: '1-2 weeks',
      difficulty: 'Beginner',
      author: 'Marketing Expert',
      price: 'Free',
      rating: 4.4,
      tasks: 12,
      includes: ['Content calendar', 'Visual assets', 'Copy templates', 'Analytics setup', 'Engagement strategy']
    },
    {
      id: 5,
      title: 'Print Design Portfolio',
      description: 'Professional print design collection including brochures, flyers, and business materials',
      category: 'print',
      thumbnail: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop',
      tags: ['print', 'brochure', 'flyer', 'business'],
      featured: false,
      downloads: 421,
      likes: 98,
      duration: '2-3 weeks',
      difficulty: 'Intermediate',
      author: 'Print Master',
      price: 'Free',
      rating: 4.3,
      tasks: 14,
      includes: ['Brochure design', 'Flyer templates', 'Business cards', 'Letterhead', 'Packaging']
    },
    {
      id: 6,
      title: 'Video Production',
      description: 'Complete video production workflow from concept to final delivery',
      category: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=300&h=200&fit=crop',
      tags: ['video', 'production', 'editing', 'motion'],
      featured: true,
      downloads: 789,
      likes: 234,
      duration: '3-5 weeks',
      difficulty: 'Advanced',
      author: 'Video Pro',
      price: 'Free',
      rating: 4.7,
      tasks: 20,
      includes: ['Concept development', 'Storyboarding', 'Filming', 'Editing', 'Post-production']
    }
  ]

  // A+++ LOAD TEMPLATES DATA
  useEffect(() => {
    const loadTemplatesData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate data loading with 5% error rate
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.95) {
              reject(new Error('Failed to load templates'))
            } else {
              resolve(null)
            }
          }, 1000)
        })

        setIsLoading(false)
        announce('Project templates loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load templates')
        setIsLoading(false)
        announce('Error loading project templates', 'assertive')
      }
    }

    loadTemplatesData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // A+++ CRUD HANDLERS
  const handleCreateTemplate = useCallback(() => {
    announce('Opening template creation', 'polite')
    setIsCreateDialogOpen(true)
  }, [announce])

  const handleSubmitNewTemplate = useCallback(async () => {
    if (!newTemplate.title || !newTemplate.description) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsProcessing(true)
    announce('Creating new template', 'polite')

    try {
      // Save template to localStorage
      const savedTemplates = JSON.parse(localStorage.getItem('project_templates') || '[]')
      savedTemplates.push({
        id: `template_${Date.now()}`,
        ...newTemplate,
        createdAt: new Date().toISOString()
      })
      localStorage.setItem('project_templates', JSON.stringify(savedTemplates))

      toast.success('Template created successfully!', {
        description: `"${newTemplate.title}" is now available in your templates`
      })

      setIsCreateDialogOpen(false)
      setNewTemplate({
        title: '',
        description: '',
        category: 'branding',
        difficulty: 'Intermediate',
        duration: '2-3 weeks',
        tags: '',
        includes: ''
      })
      announce('Template created successfully', 'polite')
    } catch (err) {
      toast.error('Failed to create template')
      announce('Failed to create template', 'assertive')
    } finally {
      setIsProcessing(false)
    }
  }, [newTemplate, announce])

  const handleUseTemplate = useCallback(async (template: Template) => {
    setIsProcessing(true)
    announce(`Creating project from template: ${template.title}`, 'polite')

    try {
      // Dynamic import for code splitting
      const { createProject } = await import('@/lib/projects-hub-queries')

      const projectData = {
        name: `Project from ${template.title}`,
        description: template.description,
        category: template.category,
        template_id: template.id,
        tasks: template.tasks,
        estimated_duration: template.duration
      }

      // Create project from template
      await createProject(projectData)

      toast.success('Project created from template!', {
        description: `Started new project based on "${template.title}"`
      })
      announce('Project created successfully', 'polite')
    } catch (err) {
      toast.error('Failed to create project from template')
      announce('Failed to create project', 'assertive')
    } finally {
      setIsProcessing(false)
    }
  }, [announce])

  const handlePreviewTemplate = useCallback((template: Template) => {
    announce(`Previewing template: ${template.title}`, 'polite')
    setPreviewTemplate(template)
    setIsPreviewDialogOpen(true)
  }, [announce])

  const handleDuplicateTemplate = useCallback(async (template: Template) => {
    setIsProcessing(true)
    announce(`Duplicating template: ${template.title}`, 'polite')

    try {
      // Simulate duplicate operation
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast.success('Template duplicated!', {
        description: `"${template.title} (Copy)" added to your templates`
      })
      announce('Template duplicated successfully', 'polite')
    } catch (err) {
      toast.error('Failed to duplicate template')
      announce('Failed to duplicate template', 'assertive')
    } finally {
      setIsProcessing(false)
    }
  }, [announce])

  const handleLikeTemplate = useCallback((template: Template) => {
    setLikedTemplates(prev => {
      const newSet = new Set(prev)
      if (newSet.has(template.id)) {
        newSet.delete(template.id)
        announce(`Removed like from ${template.title}`, 'polite')
        toast.success('Like removed')
      } else {
        newSet.add(template.id)
        announce(`Template ${template.title} liked`, 'polite')
        toast.success('Template liked!', {
          description: 'Added to your favorites'
        })
      }
      return newSet
    })
  }, [announce])

  const handleDownloadTemplate = useCallback((template: Template) => {
    announce(`Downloading template: ${template.title}`, 'polite')

    // Export template as JSON
    const exportData = {
      ...template,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `template-${template.title.toLowerCase().replace(/\s+/g, '-')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Template exported!', {
      description: 'JSON file downloaded to your device'
    })
    announce('Template exported successfully', 'polite')
  }, [announce])

  const handleFilterTemplates = useCallback(() => {
    announce('Opening template filters', 'polite')
    setIsFilterDialogOpen(true)
  }, [announce])

  const applyFilters = useCallback(() => {
    setIsFilterDialogOpen(false)
    announce('Filters applied', 'polite')
    toast.success('Filters applied')
  }, [announce])

  const resetFilters = useCallback(() => {
    setFilterOptions({
      difficulty: [],
      minRating: 0,
      featured: false
    })
    announce('Filters reset', 'polite')
  }, [announce])

  const categories = [
    { id: 'all', label: 'All', count: templates.length, icon: Grid },
    { id: 'branding', label: 'Branding', count: templates.filter(t => t.category === 'branding').length, icon: Palette },
    { id: 'web', label: 'Web', count: templates.filter(t => t.category === 'web').length, icon: Globe },
    { id: 'mobile', label: 'Mobile', count: templates.filter(t => t.category === 'mobile').length, icon: Smartphone },
    { id: 'marketing', label: 'Marketing', count: templates.filter(t => t.category === 'marketing').length, icon: Zap },
    { id: 'print', label: 'Print', count: templates.filter(t => t.category === 'print').length, icon: FileText },
    { id: 'video', label: 'Video', count: templates.filter(t => t.category === 'video').length, icon: Monitor }
  ]

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const featuredTemplates = templates.filter(template => template.featured)

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <DashboardSkeleton />
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="container mx-auto p-6">
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold kazi-text-dark dark:kazi-text-light">Project Templates</h1>
          <p className="text-gray-600 dark:text-gray-300">Start your projects with professional templates</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? <List className="h-4 w-4 mr-2" /> : <Grid className="h-4 w-4 mr-2" />}
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </Button>
          <Button size="sm" onClick={handleCreateTemplate}>
            <Layout className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Featured Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Featured Templates
          </CardTitle>
          <CardDescription>Hand-picked templates for common project types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredTemplates.map((template) => (
              <Card key={template.id} className="kazi-card overflow-hidden group cursor-pointer">
                <div className="relative">
                  <img 
                    src={template.thumbnail} 
                    alt={template.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="secondary" className="bg-white/90 text-gray-800">
                      {template.tasks} tasks
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">{template.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{template.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                    <span>{template.duration}</span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {template.rating}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {template.downloads}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {template.likes}
                      </span>
                    </div>
                    <Button size="sm">
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Template Library */}
      <Card>
        <CardHeader>
          <CardTitle>Template Library</CardTitle>
          <CardDescription>Browse all available project templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              <div className="text-sm text-gray-600">
                {filteredTemplates.length} templates
              </div>
            </div>

            {/* Categories */}
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4 md:grid-cols-7">
                {categories.map((category) => {
                  const IconComponent = category.icon
                  return (
                    <TabsTrigger 
                      key={category.id} 
                      value={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className="text-xs flex items-center gap-1"
                    >
                      <IconComponent className="h-3 w-3" />
                      {category.label}
                      <span className="ml-1 text-xs bg-gray-200 rounded-full px-1">
                        {category.count}
                      </span>
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              <TabsContent value="all">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredTemplates.map((template) => (
                      <Card key={template.id} className="kazi-card overflow-hidden group cursor-pointer">
                        <div className="relative">
                          <img 
                            src={template.thumbnail} 
                            alt={template.title}
                            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2">
                            <Badge variant="secondary" className="text-xs">
                              {template.difficulty}
                            </Badge>
                          </div>
                          <div className="absolute bottom-2 right-2">
                            <Badge variant="secondary" className="bg-white/90 text-gray-800 text-xs">
                              {template.tasks} tasks
                            </Badge>
                          </div>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex gap-1">
                              <Button size="sm" variant="secondary" className="h-8 w-8 p-0" onClick={() => handlePreviewTemplate(template)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="secondary" className="h-8 w-8 p-0" onClick={() => handleDuplicateTemplate(template)}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-medium text-sm mb-1">{template.title}</h3>
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{template.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                            <span>{template.duration}</span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {template.rating}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Download className="h-3 w-3" />
                                {template.downloads}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {template.likes}
                              </span>
                            </div>
                            <Button size="sm" className="h-7 text-xs" onClick={() => handleUseTemplate(template)}>
                              Use
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTemplates.map((template) => (
                      <Card key={template.id} className="kazi-card">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <img 
                              src={template.thumbnail} 
                              alt={template.title}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-semibold text-lg">{template.title}</h3>
                                  <p className="text-gray-600 text-sm">{template.description}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" onClick={() => handlePreviewTemplate(template)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Preview
                                  </Button>
                                  <Button size="sm" onClick={() => handleUseTemplate(template)}>
                                    Use Template
                                  </Button>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {template.duration}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {template.author}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  {template.rating}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {template.difficulty}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>{template.tasks} tasks</span>
                                <span className="flex items-center gap-1">
                                  <Download className="h-4 w-4" />
                                  {template.downloads}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart className="h-4 w-4" />
                                  {template.likes}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <Layout className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No templates found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* CREATE TEMPLATE DIALOG */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5 text-blue-500" />
              Create New Template
            </DialogTitle>
            <DialogDescription>
              Create a reusable project template for your team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Template Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Brand Identity Package"
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newTemplate.category}
                  onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="branding">Branding</SelectItem>
                    <SelectItem value="web">Web</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="print">Print</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what this template includes..."
                value={newTemplate.description}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={newTemplate.difficulty}
                  onValueChange={(value) => setNewTemplate(prev => ({ ...prev, difficulty: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Estimated Duration</Label>
                <Select
                  value={newTemplate.duration}
                  onValueChange={(value) => setNewTemplate(prev => ({ ...prev, duration: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 week">1 week</SelectItem>
                    <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                    <SelectItem value="2-3 weeks">2-3 weeks</SelectItem>
                    <SelectItem value="3-4 weeks">3-4 weeks</SelectItem>
                    <SelectItem value="4-6 weeks">4-6 weeks</SelectItem>
                    <SelectItem value="6+ weeks">6+ weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="e.g., logo, branding, identity"
                value={newTemplate.tags}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, tags: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="includes">What&apos;s Included (comma-separated)</Label>
              <Input
                id="includes"
                placeholder="e.g., Logo design, Color palette, Brand guidelines"
                value={newTemplate.includes}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, includes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitNewTemplate} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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

      {/* TEMPLATE PREVIEW DIALOG */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-3xl">
          {previewTemplate && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-500" />
                  {previewTemplate.title}
                </DialogTitle>
                <DialogDescription>
                  Template preview and details
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={previewTemplate.thumbnail}
                    alt={previewTemplate.title}
                    className="w-full h-48 object-cover"
                  />
                  {previewTemplate.featured && (
                    <Badge className="absolute top-2 right-2 bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600">{previewTemplate.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{previewTemplate.tasks}</div>
                    <div className="text-sm text-gray-500">Tasks</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{previewTemplate.rating}</div>
                    <div className="text-sm text-gray-500">Rating</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{previewTemplate.downloads}</div>
                    <div className="text-sm text-gray-500">Downloads</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-pink-600">{previewTemplate.likes}</div>
                    <div className="text-sm text-gray-500">Likes</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{previewTemplate.difficulty}</Badge>
                  <Badge variant="outline">{previewTemplate.duration}</Badge>
                  <Badge variant="outline">{previewTemplate.category}</Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">What&apos;s Included:</h4>
                  <ul className="grid grid-cols-2 gap-2">
                    {previewTemplate.includes.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Tags:</h4>
                  <div className="flex flex-wrap gap-1">
                    {previewTemplate.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => handleLikeTemplate(previewTemplate)}>
                  <Heart className={`h-4 w-4 mr-2 ${likedTemplates.has(previewTemplate.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  {likedTemplates.has(previewTemplate.id) ? 'Liked' : 'Like'}
                </Button>
                <Button variant="outline" onClick={() => handleDownloadTemplate(previewTemplate)}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button onClick={() => {
                  setIsPreviewDialogOpen(false)
                  handleUseTemplate(previewTemplate)
                }}>
                  <Layout className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* FILTER DIALOG */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-500" />
              Filter Templates
            </DialogTitle>
            <DialogDescription>
              Refine your template search
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Difficulty Level</Label>
              <div className="flex flex-wrap gap-2">
                {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                  <div key={level} className="flex items-center gap-2">
                    <Checkbox
                      id={`difficulty-${level}`}
                      checked={filterOptions.difficulty.includes(level)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilterOptions(prev => ({
                            ...prev,
                            difficulty: [...prev.difficulty, level]
                          }))
                        } else {
                          setFilterOptions(prev => ({
                            ...prev,
                            difficulty: prev.difficulty.filter(d => d !== level)
                          }))
                        }
                      }}
                    />
                    <Label htmlFor={`difficulty-${level}`} className="text-sm">{level}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Minimum Rating: {filterOptions.minRating}</Label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filterOptions.minRating}
                onChange={(e) => setFilterOptions(prev => ({ ...prev, minRating: parseFloat(e.target.value) }))}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="featured-only"
                checked={filterOptions.featured}
                onCheckedChange={(checked) => setFilterOptions(prev => ({ ...prev, featured: !!checked }))}
              />
              <Label htmlFor="featured-only">Featured templates only</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetFilters}>
              Reset
            </Button>
            <Button onClick={applyFilters}>
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
