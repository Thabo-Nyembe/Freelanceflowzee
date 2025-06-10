'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Image as ImageIcon, 
  Video, 
  Heart, 
  Download, 
  Share2, 
  Eye, 
  Grid3X3, 
  List, 
  Filter, 
  Search, 
  Plus, 
  Settings,
  Lock,
  Unlock,
  Users,
  Calendar,
  Star,
  MessageCircle,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize,
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Package
} from 'lucide-react'

interface GalleryItem {
  id: string
  type: 'image' | 'video'
  name: string
  url: string
  thumbnail: string
  description?: string
  tags: string[]
  createdAt: string
  favorites: number
  downloads: number
  isFavorited: boolean
  isSelected: boolean
  metadata?: {
    width?: number
    height?: number
    duration?: number
    size: string
    format: string
  }
  price?: {
    digital: number
    print?: number
  }
}

interface Collection {
  id: string
  name: string
  description: string
  coverImage: string
  items: GalleryItem[]
  isPublic: boolean
  password?: string
  clientAccess: string[]
  createdAt: string
  downloadEnabled: boolean
  favoritesEnabled: boolean
  commentsEnabled: boolean
  watermarkEnabled: boolean
}

export default function GalleryPage() {
  const [collections, setCollections] = useState<Collection[]>([
    {
      id: 'coll_001',
      name: 'Wedding Photography - Sarah & Mike',
      description: 'Beautiful moments from your special day',
      coverImage: '/images/wedding-cover.jpg',
      isPublic: false,
      password: 'sarah2024',
      clientAccess: ['sarah@email.com', 'mike@email.com'],
      createdAt: '2024-02-01',
      downloadEnabled: true,
      favoritesEnabled: true,
      commentsEnabled: true,
      watermarkEnabled: false,
      items: [
        {
          id: 'img_001',
          type: 'image',
          name: 'Ceremony Kiss',
          url: '/images/wedding-1.jpg',
          thumbnail: '/images/wedding-1-thumb.jpg',
          description: 'The magical first kiss as married couple',
          tags: ['ceremony', 'kiss', 'romantic'],
          createdAt: '2024-02-01T14:30:00Z',
          favorites: 15,
          downloads: 8,
          isFavorited: false,
          isSelected: false,
          metadata: {
            width: 4000,
            height: 6000,
            size: '12.5 MB',
            format: 'RAW'
          },
          price: {
            digital: 25,
            print: 45
          }
        },
        {
          id: 'img_002',
          type: 'image',
          name: 'Reception Dance',
          url: '/images/wedding-2.jpg',
          thumbnail: '/images/wedding-2-thumb.jpg',
          description: 'First dance under the stars',
          tags: ['reception', 'dance', 'celebration'],
          createdAt: '2024-02-01T20:15:00Z',
          favorites: 22,
          downloads: 12,
          isFavorited: true,
          isSelected: false,
          metadata: {
            width: 4000,
            height: 6000,
            size: '15.2 MB',
            format: 'RAW'
          },
          price: {
            digital: 25,
            print: 45
          }
        },
        {
          id: 'vid_001',
          type: 'video',
          name: 'Wedding Highlights',
          url: '/videos/wedding-highlights.mp4',
          thumbnail: '/images/video-thumb.jpg',
          description: 'Beautiful 3-minute highlight reel',
          tags: ['highlights', 'cinematic', 'love'],
          createdAt: '2024-02-01T21:00:00Z',
          favorites: 35,
          downloads: 5,
          isFavorited: true,
          isSelected: false,
          metadata: {
            duration: 180,
            size: '245 MB',
            format: '4K MP4'
          },
          price: {
            digital: 150
          }
        }
      ]
    },
    {
      id: 'coll_002',
      name: 'Brand Photography - TechStart',
      description: 'Professional headshots and team photos',
      coverImage: '/images/brand-cover.jpg',
      isPublic: true,
      clientAccess: ['contact@techstart.com'],
      createdAt: '2024-01-15',
      downloadEnabled: true,
      favoritesEnabled: false,
      commentsEnabled: true,
      watermarkEnabled: true,
      items: [
        {
          id: 'img_003',
          type: 'image',
          name: 'CEO Headshot',
          url: '/images/ceo-headshot.jpg',
          thumbnail: '/images/ceo-headshot-thumb.jpg',
          description: 'Professional CEO portrait',
          tags: ['headshot', 'executive', 'professional'],
          createdAt: '2024-01-15T10:00:00Z',
          favorites: 8,
          downloads: 15,
          isFavorited: false,
          isSelected: false,
          metadata: {
            width: 3000,
            height: 4000,
            size: '8.3 MB',
            format: 'JPEG'
          },
          price: {
            digital: 75,
            print: 120
          }
        }
      ]
    }
  ])

  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(collections[0])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTags, setFilterTags] = useState<string[]>([])
  const [showSettings, setShowSettings] = useState(false)

  // Gallery Management Functions
  const handleItemSelect = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleFavorite = (itemId: string) => {
    if (!selectedCollection) return
    
    setCollections(prev => prev.map(collection => 
      collection.id === selectedCollection.id
        ? {
            ...collection,
            items: collection.items.map(item =>
              item.id === itemId
                ? { 
                    ...item, 
                    isFavorited: !item.isFavorited,
                    favorites: item.isFavorited ? item.favorites - 1 : item.favorites + 1
                  }
                : item
            )
          }
        : collection
    ))
  }

  const handleDownload = (itemId: string) => {
    if (!selectedCollection) return
    
    // Increment download count
    setCollections(prev => prev.map(collection => 
      collection.id === selectedCollection.id
        ? {
            ...collection,
            items: collection.items.map(item =>
              item.id === itemId
                ? { ...item, downloads: item.downloads + 1 }
                : item
            )
          }
        : collection
    ))
    
    // Trigger download (in real app, this would be a secure download link)
    const item = selectedCollection.items.find(i => i.id === itemId)
    if (item) {
      console.log(`Downloading: ${item.name}`)
      // window.open(item.url, '_blank')
    }
  }

  const handleBulkDownload = () => {
    if (selectedItems.length === 0) return
    
    console.log(`Bulk downloading ${selectedItems.length} items`)
    // In real app, create zip file and download
    setSelectedItems([])
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setIsLightboxOpen(true)
  }

  const filteredItems = selectedCollection?.items.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesTags = filterTags.length === 0 || 
      filterTags.every(tag => item.tags.includes(tag))
    
    return matchesSearch && matchesTags
  }) || []

  const allTags = selectedCollection?.items.flatMap(item => item.tags) || []
  const uniqueTags = Array.from(new Set(allTags))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            📸 Client Gallery
          </h1>
          <p className="text-muted-foreground mt-2">
            Professional galleries for client viewing and downloads
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Plus className="mr-2 h-4 w-4" />
            New Gallery
          </Button>
        </div>
      </div>

      {/* Gallery Tabs */}
      <Tabs defaultValue="galleries" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="galleries" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            Collections
          </TabsTrigger>
          <TabsTrigger value="viewer" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Gallery Viewer
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Collections Overview */}
        <TabsContent value="galleries" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <Card key={collection.id} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="h-16 w-16 text-purple-400" />
                    </div>
                    <div className="absolute top-2 right-2">
                      {collection.isPublic ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <Unlock className="w-3 h-3 mr-1" />
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          <Lock className="w-3 h-3 mr-1" />
                          Private
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg">{collection.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {collection.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{collection.items.length} items</span>
                      <span>{new Date(collection.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        {collection.clientAccess.length} clients
                      </Badge>
                      {collection.downloadEnabled && (
                        <Badge variant="outline" className="text-xs">
                          <Download className="w-3 h-3 mr-1" />
                          Downloads
                        </Badge>
                      )}
                      {collection.favoritesEnabled && (
                        <Badge variant="outline" className="text-xs">
                          <Heart className="w-3 h-3 mr-1" />
                          Favorites
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setSelectedCollection(collection)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Gallery Viewer */}
        <TabsContent value="viewer" className="space-y-6">
          {selectedCollection && (
            <>
              {/* Gallery Header */}
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedCollection.name}
                      </h2>
                      <p className="text-gray-600 mb-4">
                        {selectedCollection.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-4 h-4" />
                          {selectedCollection.items.length} items
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(selectedCollection.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {selectedCollection.clientAccess.length} clients
                        </span>
                      </div>
                    </div>
                    
                    {selectedItems.length > 0 && (
                      <Card className="bg-white border-purple-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">
                              {selectedItems.length} selected
                            </span>
                            <Button 
                              size="sm"
                              onClick={handleBulkDownload}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download All
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedItems([])}
                            >
                              Clear
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Gallery Controls */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search photos, videos, tags..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      
                      {uniqueTags.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4 text-gray-400" />
                          <div className="flex gap-1">
                            {uniqueTags.slice(0, 5).map((tag) => (
                              <Button
                                key={tag}
                                size="sm"
                                variant={filterTags.includes(tag) ? "default" : "outline"}
                                onClick={() => {
                                  setFilterTags(prev =>
                                    prev.includes(tag)
                                      ? prev.filter(t => t !== tag)
                                      : [...prev, tag]
                                  )
                                }}
                              >
                                {tag}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                      >
                        <Grid3X3 className="h-4 w-4" />
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
                </CardContent>
              </Card>

              {/* Gallery Grid */}
              <div className={`grid gap-4 ${
                viewMode === 'grid' 
                  ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {filteredItems.map((item, index) => (
                  <Card 
                    key={item.id} 
                    className={`group hover:shadow-lg transition-all duration-300 ${
                      selectedItems.includes(item.id) ? 'ring-2 ring-purple-500' : ''
                    }`}
                  >
                    <CardContent className="p-0">
                      <div className="relative">
                        {/* Thumbnail */}
                        <div 
                          className="aspect-square bg-gray-100 cursor-pointer relative overflow-hidden"
                          onClick={() => openLightbox(index)}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20"></div>
                          
                          {/* Type indicator */}
                          <div className="absolute top-2 left-2 z-10">
                            {item.type === 'video' ? (
                              <Badge className="bg-black/50 text-white">
                                <Video className="w-3 h-3 mr-1" />
                                Video
                              </Badge>
                            ) : (
                              <Badge className="bg-black/50 text-white">
                                <ImageIcon className="w-3 h-3 mr-1" />
                                Photo
                              </Badge>
                            )}
                          </div>

                          {/* Selection checkbox */}
                          <div className="absolute top-2 right-2 z-10">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.id)}
                              onChange={() => handleItemSelect(item.id)}
                              className="w-5 h-5 rounded border-2 border-white bg-white/20 checked:bg-purple-600"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>

                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                                <ZoomIn className="h-4 w-4" />
                              </Button>
                              {item.type === 'video' && (
                                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                                  <Play className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {/* Video duration */}
                          {item.type === 'video' && item.metadata?.duration && (
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              {Math.floor(item.metadata.duration / 60)}:{(item.metadata.duration % 60).toString().padStart(2, '0')}
                            </div>
                          )}
                        </div>

                        {/* Item Info */}
                        <div className="p-4 space-y-3">
                          <div>
                            <h4 className="font-medium text-gray-900 truncate">
                              {item.name}
                            </h4>
                            {item.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                          </div>

                          {/* Tags */}
                          {item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {item.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {item.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{item.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Stats */}
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Heart className={`w-4 h-4 ${item.isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                                {item.favorites}
                              </span>
                              <span className="flex items-center gap-1">
                                <Download className="w-4 h-4" />
                                {item.downloads}
                              </span>
                            </div>
                            
                            {item.metadata && (
                              <span className="text-xs text-gray-400">
                                {item.metadata.size}
                              </span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleFavorite(item.id)}
                              className={`flex-1 ${item.isFavorited ? 'text-red-600 border-red-200' : ''}`}
                            >
                              <Heart className={`w-4 h-4 mr-1 ${item.isFavorited ? 'fill-current' : ''}`} />
                              {item.isFavorited ? 'Favorited' : 'Favorite'}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleDownload(item.id)}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </div>

                          {/* Pricing */}
                          {item.price && (
                            <div className="pt-2 border-t">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Digital:</span>
                                <span className="font-medium">${item.price.digital}</span>
                              </div>
                              {item.price.print && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">Print:</span>
                                  <span className="font-medium">${item.price.print}</span>
                                </div>
                              )}
                              <Button size="sm" variant="outline" className="w-full mt-2">
                                <ShoppingCart className="w-4 h-4 mr-1" />
                                Add to Cart
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Eye className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold text-blue-600">12.4k</p>
                <p className="text-sm text-gray-600">Total Views</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Download className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold text-green-600">856</p>
                <p className="text-sm text-gray-600">Downloads</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Heart className="h-8 w-8 mx-auto mb-2 text-red-600" />
                <p className="text-2xl font-bold text-red-600">1.2k</p>
                <p className="text-sm text-gray-600">Favorites</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="text-2xl font-bold text-purple-600">45</p>
                <p className="text-sm text-gray-600">Active Clients</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Lightbox Modal */}
      {isLightboxOpen && selectedCollection && filteredItems.length > 0 && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation */}
            {filteredItems.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                  onClick={() => setLightboxIndex(prev => prev > 0 ? prev - 1 : filteredItems.length - 1)}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                  onClick={() => setLightboxIndex(prev => prev < filteredItems.length - 1 ? prev + 1 : 0)}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            {/* Media viewer */}
            <div className="max-w-7xl max-h-full flex items-center justify-center">
              {filteredItems[lightboxIndex]?.type === 'video' ? (
                <video 
                  src={filteredItems[lightboxIndex].url} 
                  controls 
                  className="max-w-full max-h-full"
                  autoPlay
                />
              ) : (
                <img 
                  src={filteredItems[lightboxIndex]?.url} 
                  alt={filteredItems[lightboxIndex]?.name}
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>

            {/* Info panel */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-4 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    {filteredItems[lightboxIndex]?.name}
                  </h3>
                  {filteredItems[lightboxIndex]?.description && (
                    <p className="text-gray-300 text-sm mb-2">
                      {filteredItems[lightboxIndex].description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{lightboxIndex + 1} of {filteredItems.length}</span>
                    {filteredItems[lightboxIndex]?.metadata && (
                      <span>{filteredItems[lightboxIndex].metadata?.size}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={() => handleFavorite(filteredItems[lightboxIndex].id)}
                  >
                    <Heart className={`h-4 w-4 ${
                      filteredItems[lightboxIndex]?.isFavorited ? 'fill-current text-red-500' : ''
                    }`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={() => handleDownload(filteredItems[lightboxIndex].id)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 