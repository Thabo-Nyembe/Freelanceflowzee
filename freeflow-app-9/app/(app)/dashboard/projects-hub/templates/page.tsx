"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  List
} from 'lucide-react'

// A+++ UTILITIES
import { DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

export default function ProjectTemplatesPage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()
  const [selectedCategory, setSelectedCategory] = useState<any>('all')
  const [searchTerm, setSearchTerm] = useState<any>('')
  const [viewMode, setViewMode] = useState<any>('grid')

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
          <Button size="sm">
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
                              <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
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
                            <Button size="sm" className="h-7 text-xs">
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
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4 mr-2" />
                                    Preview
                                  </Button>
                                  <Button size="sm">
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
    </div>
  )
}
