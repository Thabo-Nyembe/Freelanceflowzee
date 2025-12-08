'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  FileText,
  Plus,
  Star,
  Clock,
  DollarSign,
  Users,
  Calendar,
  Palette,
  Code,
  Globe,
  Smartphone,
  Video,
  Camera,
  PenTool,
  Layers,
  Search,
  Filter,
  Download,
  Upload,
  Copy,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Target,
  Zap,
  Award
} from 'lucide-react'

// A+++ UTILITIES
import { CardSkeleton, DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'

export default function ProjectTemplatesPage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()

  // A+++ LOAD PROJECT TEMPLATES DATA
  useEffect(() => {
    const loadProjectTemplatesData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate data loading
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(null)
          }, 500) // Reduced from 1000ms to 500ms for faster loading
        })

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

  const projectTemplates = [
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Project Templates
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Pre-built project templates to accelerate your workflow
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Templates</p>
                  <p className="text-3xl font-bold text-gray-900">{templateStats.totalTemplates}</p>
                  <p className="text-sm text-blue-600">+5 this month</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Usage</p>
                  <p className="text-3xl font-bold text-gray-900">{templateStats.totalUsage}</p>
                  <p className="text-sm text-green-600">+12% this month</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-3xl font-bold text-gray-900">{templateStats.avgRating}</p>
                  <p className="text-sm text-yellow-600">⭐ Excellent</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-3xl font-bold text-gray-900">{templateStats.activeProjects}</p>
                  <p className="text-sm text-purple-600">From templates</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-xl border border-white/30">
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
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.count})
                    </option>
                  ))}
                </select>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-all duration-200 group">
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center">
                      <FileText className="h-12 w-12 text-gray-400" />
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
                    <div className="absolute top-4 right-4">
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
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
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{template.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span>{template.price}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{template.rating}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
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
                      <Button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                        <Plus className="h-3 w-3 mr-1" />
                        Use Template
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
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
                  <Card key={category.id} className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl inline-block mb-4">
                        <Icon className="h-8 w-8 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                      <p className="text-gray-600 mb-4">{category.count} templates available</p>
                      <Button variant="outline" className="w-full">
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
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardContent className="p-12 text-center">
                <Award className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-700 mb-4">Create Your First Template</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Turn your successful projects into reusable templates to accelerate future work and maintain consistency.
                </p>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}