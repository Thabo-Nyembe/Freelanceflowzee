'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { 
  BookOpen, 
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
  Folder,
  FolderOpen,
  Tag,
  Clock,
  Users,
  TrendingUp,
  Award,
  Target,
  Zap,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Heart,
  MessageSquare,
  Calendar,
  Archive,
  Database
} from 'lucide-react'

export default function ResourceLibraryPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const resources = [
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

  const libraryStats = {
    totalResources: 156,
    totalDownloads: 12847,
    avgRating: 4.7,
    totalAuthors: 24
  }

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

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
              <Archive className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Resource Library
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Discover, organize, and share creative resources and assets
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Resources</p>
                  <p className="text-3xl font-bold text-gray-900">{libraryStats.totalResources}</p>
                  <p className="text-sm text-blue-600">+12 this month</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                  <p className="text-3xl font-bold text-gray-900">{libraryStats.totalDownloads.toLocaleString()}</p>
                  <p className="text-sm text-green-600">+18% this month</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Download className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-3xl font-bold text-gray-900">{libraryStats.avgRating}</p>
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
                  <p className="text-sm font-medium text-gray-600">Contributors</p>
                  <p className="text-3xl font-bold text-gray-900">{libraryStats.totalAuthors}</p>
                  <p className="text-sm text-purple-600">Active creators</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Users className="h-6 w-6 text-purple-600" />
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
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className={`bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-all cursor-pointer ${
                  selectedCategory === category.id ? 'ring-2 ring-indigo-500' : ''
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl inline-block mb-2">
                    <Icon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 text-sm">{category.name}</h4>
                  <p className="text-xs text-gray-600">{category.count} items</p>
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
                <Card key={resource.id} className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                        <TypeIcon className="h-8 w-8 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{resource.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
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
                            <div className="flex items-center gap-4 text-sm text-gray-600">
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
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Bookmark className="h-3 w-3" />
                            </Button>
                            <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
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
              <Card key={resource.id} className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-all duration-200 group">
                <div className="relative">
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center">
                    <TypeIcon className="h-12 w-12 text-gray-400" />
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
                      className={`opacity-0 group-hover:opacity-100 transition-opacity ${resource.isBookmarked ? 'text-yellow-500' : ''}`}
                    >
                      <Bookmark className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{resource.title}</CardTitle>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{resource.description}</p>
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

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>by {resource.author}</span>
                    <span>{resource.size}</span>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Button className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                      <Download className="h-3 w-3 mr-1" />
                      {resource.isPremium ? `$${resource.price}` : 'Free'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredResources.length === 0 && (
          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-12 text-center">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-700 mb-4">No Resources Found</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <Button variant="outline" onClick={() => {setSearchQuery(''); setSelectedCategory('all')}}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}