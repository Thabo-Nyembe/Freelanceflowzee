'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Briefcase, Plus, Search, Filter, Grid, List, Eye, Heart, Share2,
  ExternalLink, Star, Calendar, Image, Video, FileText, Code, Music,
  Download, Edit, Trash2, MoreHorizontal, TrendingUp, Users, MessageSquare
} from 'lucide-react'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'

interface PortfolioItem {
  id: string
  title: string
  description: string
  category: string
  thumbnail: string
  type: 'image' | 'video' | 'document' | 'code' | 'audio'
  views: number
  likes: number
  shares: number
  featured: boolean
  createdAt: string
  tags: string[]
  client?: string
}

const demoPortfolioItems: PortfolioItem[] = [
  {
    id: '1',
    title: 'E-commerce Platform Redesign',
    description: 'Complete UI/UX overhaul for a major retail brand',
    category: 'Web Design',
    thumbnail: '/portfolio/ecommerce.jpg',
    type: 'image',
    views: 2450,
    likes: 189,
    shares: 45,
    featured: true,
    createdAt: '2024-01-15',
    tags: ['UI/UX', 'E-commerce', 'React'],
    client: 'RetailCorp Inc.'
  },
  {
    id: '2',
    title: 'Mobile Banking App',
    description: 'Fintech app with biometric authentication',
    category: 'Mobile App',
    thumbnail: '/portfolio/banking.jpg',
    type: 'image',
    views: 1820,
    likes: 156,
    shares: 38,
    featured: true,
    createdAt: '2024-02-20',
    tags: ['Mobile', 'Fintech', 'iOS', 'Android'],
    client: 'SecureBank'
  },
  {
    id: '3',
    title: 'Brand Identity Package',
    description: 'Complete branding for tech startup',
    category: 'Branding',
    thumbnail: '/portfolio/branding.jpg',
    type: 'image',
    views: 980,
    likes: 87,
    shares: 22,
    featured: false,
    createdAt: '2024-03-10',
    tags: ['Branding', 'Logo', 'Identity'],
    client: 'TechStart'
  },
  {
    id: '4',
    title: 'Product Launch Video',
    description: '60-second promotional video for product launch',
    category: 'Video',
    thumbnail: '/portfolio/video.jpg',
    type: 'video',
    views: 5200,
    likes: 320,
    shares: 95,
    featured: true,
    createdAt: '2024-03-25',
    tags: ['Video', 'Motion Graphics', 'Marketing'],
    client: 'Innovation Labs'
  },
  {
    id: '5',
    title: 'SaaS Dashboard',
    description: 'Analytics dashboard for enterprise SaaS',
    category: 'Web App',
    thumbnail: '/portfolio/dashboard.jpg',
    type: 'image',
    views: 1450,
    likes: 112,
    shares: 28,
    featured: false,
    createdAt: '2024-04-05',
    tags: ['Dashboard', 'Analytics', 'SaaS'],
    client: 'DataViz Pro'
  },
  {
    id: '6',
    title: 'Podcast Brand Package',
    description: 'Audio branding and cover art for podcast series',
    category: 'Audio',
    thumbnail: '/portfolio/podcast.jpg',
    type: 'audio',
    views: 680,
    likes: 54,
    shares: 15,
    featured: false,
    createdAt: '2024-04-18',
    tags: ['Audio', 'Podcast', 'Branding'],
    client: 'TechTalk Media'
  }
]

const categories = ['All', 'Web Design', 'Mobile App', 'Branding', 'Video', 'Web App', 'Audio']

export default function PortfolioClient() {
  const [items, setItems] = useState<PortfolioItem[]>(demoPortfolioItems)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState('all')

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    const matchesTab = activeTab === 'all' || (activeTab === 'featured' && item.featured)
    return matchesSearch && matchesCategory && matchesTab
  })

  const totalViews = items.reduce((sum, item) => sum + item.views, 0)
  const totalLikes = items.reduce((sum, item) => sum + item.likes, 0)
  const featuredCount = items.filter(item => item.featured).length

  const getTypeIcon = (type: PortfolioItem['type']) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />
      case 'document': return <FileText className="h-4 w-4" />
      case 'code': return <Code className="h-4 w-4" />
      case 'audio': return <Music className="h-4 w-4" />
      default: return <Image className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
              <Briefcase className="h-8 w-8 text-purple-600" />
              Portfolio
            </h1>
            <p className="text-muted-foreground mt-1">Showcase your best work</p>
          </div>
          <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </div>

        {/* AI Insights Panel */}
        <CollapsibleInsightsPanel
          title="Portfolio Insights"
          insights={[
            { label: 'Total Views', value: totalViews.toLocaleString(), change: '+18.5%', changeType: 'positive' },
            { label: 'Total Likes', value: totalLikes.toLocaleString(), change: '+12.3%', changeType: 'positive' },
            { label: 'Featured Items', value: featuredCount.toString(), change: '+2', changeType: 'positive' },
            { label: 'Avg Engagement', value: '8.2%', change: '+1.4%', changeType: 'positive' }
          ]}
          recommendations={[
            'Your video content has 3x more engagement - consider creating more',
            'Add case studies to your featured projects for better conversion',
            'Update older portfolio items with fresh screenshots'
          ]}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Total Projects</p>
                  <p className="text-2xl font-bold">{items.length}</p>
                </div>
                <Briefcase className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Views</p>
                  <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
                </div>
                <Eye className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-sm">Total Likes</p>
                  <p className="text-2xl font-bold">{totalLikes.toLocaleString()}</p>
                </div>
                <Heart className="h-8 w-8 text-pink-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">Featured</p>
                  <p className="text-2xl font-bold">{featuredCount}</p>
                </div>
                <Star className="h-8 w-8 text-amber-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Projects ({items.length})</TabsTrigger>
            <TabsTrigger value="featured">Featured ({featuredCount})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map(item => (
                  <Card key={item.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                      <div className="absolute inset-0 flex items-center justify-center">
                        {getTypeIcon(item.type)}
                        <span className="ml-2 text-muted-foreground">{item.category}</span>
                      </div>
                      {item.featured && (
                        <Badge className="absolute top-2 right-2 bg-amber-500">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="sm" variant="secondary">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="secondary">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                      {item.client && (
                        <p className="text-sm text-purple-600 dark:text-purple-400 mb-2">Client: {item.client}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {item.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {item.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Share2 className="h-4 w-4" />
                            {item.shares}
                          </span>
                        </div>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map(item => (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-lg flex items-center justify-center">
                          {getTypeIcon(item.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{item.title}</h3>
                            {item.featured && (
                              <Badge className="bg-amber-500">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{item.category}</span>
                            <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{item.views}</span>
                            <span className="flex items-center gap-1"><Heart className="h-4 w-4" />{item.likes}</span>
                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {filteredItems.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Project
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
