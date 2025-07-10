"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Image, 
  Video, 
  Upload, 
  Search,
  _Filter,
  Grid,
  List,
  Eye,
  Download,
  Share2,
  Heart,
  MessageCircle,
  Folder,
  _Calendar,
  _User,
  Star,
  Play
} from 'lucide-react'

export default function GalleryPage() {
  const [viewMode, setViewMode] = useState<any>('grid')
  const [selectedCategory, setSelectedCategory] = useState<any>('all')
  const [searchTerm, setSearchTerm] = useState<any>('')

  // Mock gallery data
  const galleryItems = [
    {
      id: 1,
      title: 'Brand Identity Design',
      type: 'image',
      category: 'branding',
      url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=150&fit=crop',
      dateCreated: '2024-01-15',
      likes: 24,
      comments: 8,
      client: 'Acme Corp',
      project: 'Brand Identity Package',
      tags: ['logo', 'branding', 'identity'],
      featured: true
    },
    {
      id: 2,
      title: 'Website Mockup',
      type: 'image',
      category: 'web-design',
      url: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&h=300&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=200&h=150&fit=crop',
      dateCreated: '2024-01-12',
      likes: 18,
      comments: 5,
      client: 'Tech Startup',
      project: 'E-commerce Platform',
      tags: ['web', 'design', 'mockup'],
      featured: false
    },
    {
      id: 3,
      title: 'Mobile App Demo',
      type: 'video',
      category: 'mobile',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=200&h=150&fit=crop',
      dateCreated: '2024-01-10',
      likes: 32,
      comments: 12,
      client: 'Mobile Solutions',
      project: 'iOS App Development',
      tags: ['mobile', 'app', 'demo'],
      featured: true
    },
    {
      id: 4,
      title: 'Social Media Campaign',
      type: 'image',
      category: 'social',
      url: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=400&h=300&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=200&h=150&fit=crop',
      dateCreated: '2024-01-08',
      likes: 15,
      comments: 3,
      client: 'Social Brand',
      project: 'Social Media Package',
      tags: ['social', 'campaign', 'graphics'],
      featured: false
    },
    {
      id: 5,
      title: 'Print Design Collection',
      type: 'image',
      category: 'print',
      url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=200&h=150&fit=crop',
      dateCreated: '2024-01-05',
      likes: 21,
      comments: 7,
      client: 'Print Co.',
      project: 'Marketing Materials',
      tags: ['print', 'brochure', 'design'],
      featured: false
    },
    {
      id: 6,
      title: 'Video Advertisement',
      type: 'video',
      category: 'video',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=200&h=150&fit=crop',
      dateCreated: '2024-01-03',
      likes: 45,
      comments: 18,
      client: 'Ad Agency',
      project: 'TV Commercial',
      tags: ['video', 'ad', 'commercial'],
      featured: true
    }
  ]

  const categories = [
    { id: 'all', label: 'All', count: galleryItems.length },
    { id: 'branding', label: 'Branding', count: galleryItems.filter(item => item.category === 'branding').length },
    { id: 'web-design', label: 'Web Design', count: galleryItems.filter(item => item.category === 'web-design').length },
    { id: 'mobile', label: 'Mobile', count: galleryItems.filter(item => item.category === 'mobile').length },
    { id: 'social', label: 'Social', count: galleryItems.filter(item => item.category === 'social').length },
    { id: 'print', label: 'Print', count: galleryItems.filter(item => item.category === 'print').length },
    { id: 'video', label: 'Video', count: galleryItems.filter(item => item.category === 'video').length }
  ]

  const filteredItems = galleryItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const featuredItems = galleryItems.filter(item => item.featured)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold kazi-text-dark dark:kazi-text-light">Gallery</h1>
          <p className="text-gray-600 dark:text-gray-300">Showcase your creative work and portfolio</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? <List className="h-4 w-4 mr-2" /> : <Grid className="h-4 w-4 mr-2" />}
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </Button>
          <Button size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload Media
          </Button>
        </div>
      </div>

      {/* Featured Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Featured Work
          </CardTitle>
          <CardDescription>Your best creative projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredItems.map((item) => (
              <Card key={item.id} className="kazi-card overflow-hidden group cursor-pointer">
                <div className="relative">
                  <img 
                    src={item.thumbnail} 
                    alt={item.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{item.client}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{item.dateCreated}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {item.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {item.comments}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gallery Management */}
      <Card>
        <CardHeader>
          <CardTitle>Gallery Collection</CardTitle>
          <CardDescription>Organize and manage your creative assets</CardDescription>
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
                    placeholder="Search gallery..."
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
                {filteredItems.length} items
              </div>
            </div>

            {/* Categories */}
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4 md:grid-cols-7">
                {categories.map((category) => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className="text-xs"
                  >
                    {category.label}
                    <span className="ml-1 text-xs bg-gray-200 rounded-full px-1">
                      {category.count}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredItems.map((item) => (
                      <Card key={item.id} className="kazi-card overflow-hidden group cursor-pointer">
                        <div className="relative">
                          <img 
                            src={item.thumbnail} 
                            alt={item.title}
                            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {item.type === 'video' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <Play className="h-8 w-8 text-white" />
                            </div>
                          )}
                          <div className="absolute top-2 left-2">
                            <Badge variant="secondary" className="text-xs">
                              {item.type === 'video' ? <Video className="h-3 w-3 mr-1" /> : <Image className="h-3 w-3 mr-1" />}
                              {item.type}
                            </Badge>
                          </div>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex gap-1">
                              <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                                <Share2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-medium text-sm mb-1">{item.title}</h3>
                          <p className="text-xs text-gray-600 mb-2">{item.client}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{item.dateCreated}</span>
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {item.likes}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                {item.comments}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredItems.map((item) => (
                      <Card key={item.id} className="kazi-card">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <img 
                              src={item.thumbnail} 
                              alt={item.title}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{item.title}</h3>
                                <Badge variant="secondary" className="text-xs">
                                  {item.type === 'video' ? <Video className="h-3 w-3 mr-1" /> : <Image className="h-3 w-3 mr-1" />}
                                  {item.type}
                                </Badge>
                                {item.featured && (
                                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                                    <Star className="h-3 w-3 mr-1" />
                                    Featured
                                  </Badge>
                                )}
                              </div>
                              <p className="text-gray-600 mb-1">{item.client} • {item.project}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {item.dateCreated}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart className="h-4 w-4" />
                                  {item.likes}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="h-4 w-4" />
                                  {item.comments}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Share2 className="h-4 w-4" />
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
              <div className="text-center py-12">
                <Folder className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No items found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
